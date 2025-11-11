"""Celery tasks for document processing."""
import logging
import os
import uuid
from pathlib import Path

from app.core.db import get_session_context
from app.modules.projects.models import DocumentStatus
from app.modules.projects.repository import document_repository
from app.services.document_processor import document_processor
from app.services.vector_store import vector_store
from app.worker import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def process_document_task(self, document_id: str):
    """
    Process a document asynchronously:
    1. Read file from filesystem
    2. Extract text (PDF/DOCX/TXT)
    3. Split into chunks with tiktoken
    4. Generate embeddings for each chunk
    5. Store in vector store (document_embeddings table)
    6. Update document status

    Args:
        document_id: UUID of the document to process

    Returns:
        dict: Processing results with status and metrics
    """
    logger.info(f"Starting document processing task for document {document_id}")

    with get_session_context() as session:
        try:
            # Get document
            document = session.get(document_repository.model, uuid.UUID(document_id))
            if not document:
                logger.error(f"Document {document_id} not found")
                return {"status": "error", "message": "Document not found"}

            # Update status to processing
            document_repository.update_status(
                session, document_id=document.id, status=DocumentStatus.PROCESSING
            )

            logger.info(
                f"Processing document: {document.filename} "
                f"({document.file_type}, {document.file_size} bytes)"
            )

            # Check if file exists
            if not os.path.exists(document.file_path):
                raise FileNotFoundError(f"File not found: {document.file_path}")

            # Process the file into chunks
            chunks = document_processor.process_file(
                file_path=document.file_path,
                file_type=document.file_type,
                max_chunk_tokens=500,
                overlap_tokens=50,
            )

            if not chunks:
                raise ValueError("No text extracted from document")

            # Update total chunks
            document_repository.update_progress(
                session,
                document_id=document.id,
                processed_chunks=0,
                total_chunks=len(chunks),
            )

            logger.info(f"Extracted {len(chunks)} chunks, now generating embeddings...")

            # Process each chunk and store in vector store
            total_tokens = 0
            for idx, chunk in enumerate(chunks):
                try:
                    # Prepare metadata
                    metadata = {
                        "project_id": str(document.project_id),
                        "document_id": str(document.id),
                        "chunk_index": idx,
                        "document_type": document.document_type,
                        "filename": document.filename,
                        "page_number": chunk["page_number"],
                        "page_total": chunk["page_total"],
                    }

                    # Store in vector store (generates embedding automatically)
                    vector_store.upsert_single(
                        content=chunk["content"], metadata=metadata
                    )

                    # Update progress
                    total_tokens += chunk["token_count"]
                    document_repository.update_progress(
                        session,
                        document_id=document.id,
                        processed_chunks=idx + 1,
                        estimated_tokens=total_tokens,
                    )

                    # Report progress to Celery
                    self.update_state(
                        state="PROGRESS",
                        meta={
                            "current": idx + 1,
                            "total": len(chunks),
                            "percentage": round((idx + 1) / len(chunks) * 100, 2),
                        },
                    )

                    logger.debug(
                        f"Processed chunk {idx + 1}/{len(chunks)} "
                        f"({chunk['token_count']} tokens)"
                    )

                except Exception as chunk_error:
                    logger.error(
                        f"Error processing chunk {idx + 1}/{len(chunks)}: {chunk_error}"
                    )
                    # Continue with next chunk instead of failing completely
                    continue

            # Mark as completed
            document_repository.update_status(
                session, document_id=document.id, status=DocumentStatus.COMPLETED
            )

            result = {
                "status": "completed",
                "document_id": str(document.id),
                "filename": document.filename,
                "total_chunks": len(chunks),
                "total_tokens": total_tokens,
                "file_size": document.file_size,
            }

            logger.info(
                f"✓ Document processing completed: {document.filename} "
                f"({total_tokens} tokens in {len(chunks)} chunks)"
            )

            return result

        except Exception as e:
            logger.error(f"Error processing document {document_id}: {e}", exc_info=True)

            # Mark as failed
            try:
                document_repository.update_status(
                    session,
                    document_id=uuid.UUID(document_id),
                    status=DocumentStatus.FAILED,
                    error_message=str(e)[:500],  # Limit error message length
                )
            except Exception as update_error:
                logger.error(f"Error updating document status: {update_error}")

            # Retry if it's a transient error
            if self.request.retries < self.max_retries:
                raise self.retry(exc=e)

            return {
                "status": "failed",
                "document_id": document_id,
                "error": str(e),
            }


@celery_app.task(bind=True, max_retries=2)
def generate_conversation_title_task(self, conversation_id: str):
    """
    Generate a descriptive title for a conversation using AI.

    Args:
        conversation_id: UUID of the conversation

    Returns:
        dict: Generated title and status
    """
    from app.modules.chat.models import ChatConversation
    from app.services.openai_service import openai_service

    logger.info(f"Generating title for conversation {conversation_id}")

    with get_session_context() as session:
        try:
            # Get conversation
            conv = session.get(ChatConversation, uuid.UUID(conversation_id))
            if not conv:
                logger.error(f"Conversation {conversation_id} not found")
                return {"status": "error", "message": "Conversation not found"}

            # Get first 3 messages
            if len(conv.messages) < 1:
                logger.warning("Conversation has no messages, cannot generate title")
                return {"status": "skipped", "message": "No messages yet"}

            messages_to_analyze = conv.messages[:3]
            context = "\n".join(
                [f"{msg.role}: {msg.content[:200]}" for msg in messages_to_analyze]
            )

            # Generate title with OpenAI
            prompt = f"""Generate a concise, descriptive title (maximum 50 characters) for this conversation.
The title should capture the main topic or question.
Do not use quotes or special formatting.

Conversation:
{context}

Title:"""

            title = openai_service.create_completion_sync(
                prompt=prompt, max_tokens=20, temperature=0.7
            ).strip()

            # Clean up title
            title = title.replace('"', "").replace("'", "").strip()
            if len(title) > 50:
                title = title[:47] + "..."

            # Update conversation
            conv.title = title
            conv.auto_generated_title = True
            session.add(conv)
            session.commit()

            logger.info(f"✓ Generated title for conversation {conversation_id}: {title}")

            return {
                "status": "completed",
                "conversation_id": str(conv.id),
                "title": title,
            }

        except Exception as e:
            logger.error(
                f"Error generating title for conversation {conversation_id}: {e}",
                exc_info=True,
            )

            # Retry if it's a transient error
            if self.request.retries < self.max_retries:
                raise self.retry(exc=e)

            return {
                "status": "failed",
                "conversation_id": conversation_id,
                "error": str(e),
            }


@celery_app.task
def delete_document_embeddings_task(document_id: str):
    """
    Delete all vector embeddings for a document.

    Args:
        document_id: UUID of the document

    Returns:
        dict: Deletion results
    """
    logger.info(f"Deleting embeddings for document {document_id}")

    try:
        # Delete from vector store by metadata filter
        vector_store.delete(metadata_filter={"document_id": document_id})

        logger.info(f"✓ Deleted embeddings for document {document_id}")

        return {
            "status": "completed",
            "document_id": document_id,
        }

    except Exception as e:
        logger.error(f"Error deleting embeddings for document {document_id}: {e}")
        return {
            "status": "failed",
            "document_id": document_id,
            "error": str(e),
        }


@celery_app.task
def delete_project_embeddings_task(project_id: str):
    """
    Delete all vector embeddings for a project.

    Args:
        project_id: UUID of the project

    Returns:
        dict: Deletion results
    """
    logger.info(f"Deleting embeddings for project {project_id}")

    try:
        # Delete from vector store by metadata filter
        vector_store.delete(metadata_filter={"project_id": project_id})

        logger.info(f"✓ Deleted embeddings for project {project_id}")

        return {
            "status": "completed",
            "project_id": project_id,
        }

    except Exception as e:
        logger.error(f"Error deleting embeddings for project {project_id}: {e}")
        return {
            "status": "failed",
            "project_id": project_id,
            "error": str(e),
        }
