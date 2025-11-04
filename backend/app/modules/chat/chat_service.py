import logging
import uuid
from datetime import datetime
from typing import List, Optional

from sqlmodel import Session

from app.core.config import settings
from app.modules.chat.models import ChatConversation, ChatMessage, DocumentReference
from app.modules.chat.repository import (
    chat_conversation_repository,
    chat_message_repository,
    document_reference_repository
)
from app.modules.chat.schemas import (
    ChatConversationCreate,
    ChatMessageCreate,
    DocumentReferenceCreate
)
from app.services.openai_service import openai_service
from app.services.vector_store import vector_store

logger = logging.getLogger(__name__)


class ChatService:
    """Service layer for chat operations."""

    def create_conversation(
        self,
        session: Session,
        user_id: uuid.UUID,
        analysis_id: uuid.UUID,
        title: str,
        use_documents: bool = True
    ) -> ChatConversation:
        """Create a new chat conversation."""
        conversation_obj = ChatConversationCreate(
            analysis_id=analysis_id,
            title=title,
            use_documents=use_documents
        )
        return chat_conversation_repository.create(
            session,
            obj_in=conversation_obj,
            user_id=user_id
        )

    def get_conversation(
        self,
        session: Session,
        conversation_id: uuid.UUID,
        include_messages: bool = False
    ) -> Optional[ChatConversation]:
        """Get a chat conversation by ID."""
        conversation = chat_conversation_repository.get(session, conversation_id)
        if conversation and include_messages:
            conversation.messages = chat_message_repository.get_by_conversation_id(
                session, conversation_id
            )
        return conversation

    def get_conversations(
        self,
        session: Session,
        analysis_id: uuid.UUID
    ) -> List[ChatConversation]:
        """Get all conversations for an analysis."""
        return chat_conversation_repository.get_by_analysis_id(session, analysis_id)

    def delete_conversation(self, session: Session, conversation_id: uuid.UUID) -> bool:
        """Delete a chat conversation."""
        conversation = chat_conversation_repository.get(session, conversation_id)
        if not conversation:
            return False
        chat_conversation_repository.delete(session, id=conversation_id)
        return True

    async def process_message(
        self,
        session: Session,
        conversation_id: uuid.UUID,
        message: ChatMessageCreate
    ) -> ChatMessage:
        """Process a new chat message."""
        # Get conversation
        conversation = chat_conversation_repository.get(session, conversation_id)
        if not conversation:
            raise ValueError(f"Conversation {conversation_id} not found")

        # Create user message
        message.role = message.role.lower()  # Ensure role is lowercase
        user_message = chat_message_repository.create(
            session,
            obj_in=message,
            conversation_id=conversation_id
        )

        # Get conversation history
        history = chat_message_repository.get_by_conversation_id(session, conversation_id)
        messages = [{"role": msg.role.lower(), "content": msg.content} for msg in history]
        
        # Search relevant documents if enabled
        all_relevant_chunks = []
        if conversation.use_documents and message.use_documents:
            # Search in vector store with metadata filter for analysis_id
            logger.info(f"Searching for relevant documents for conversation {conversation_id}")
            results = vector_store.search(
                query_text=message.content,
                limit=settings.chat.max_documents_per_query,
                metadata_filter={
                    "analysis_id": str(conversation.analysis_id)
                }
            )
            
            logger.info(f"Vector store results type: {type(results)}")
            if not results.empty:
                logger.info(f"Columns available: {results.columns.tolist()}")
                logger.info(f"First row: {results.iloc[0].to_dict()}")
                
                document_references = []
                for _, row in results.iterrows():
                    # Get distance from vector search
                    distance = float(row["distance"])
                    logger.info(f"Document distance: {distance}")
                    
                    # Use distance directly - smaller distance means more relevant
                    if distance < 0.7:  # Adjust threshold to get more relevant documents
                        content = row["content"]
                        document_id = row["document_id"]
                        document_type = row["document_type"]
                        filename = row["filename"] or "unknown.txt" 
                        page_number = row["page_number"]
                        page_total = row["page_total"]
                        
                        # Add content to relevant chunks and create reference
                        all_relevant_chunks.append(content)
                        
                        # Create document reference
                        ref = DocumentReferenceCreate(
                            message_id=user_message.id,
                            document_id=document_id,
                            document_type=document_type,
                            filename=filename,
                            content_snippet=content[:500],  # Limit snippet size
                            page_number=page_number,
                            page_total=page_total,
                            relevance_score=distance  # Use distance as the score
                        )
                        document_references.append(ref)
                        logger.info(f"Added document reference - id: {document_id}, type: {document_type}, filename: {filename}, distance: {distance}")

                logger.info(f"Total document references found: {len(document_references)}")
                if document_references:
                    logger.info(f"Creating {len(document_references)} document references")
                    try:
                        # Create document references for user message
                        refs = document_reference_repository.create_multi(
                            session, refs=document_references
                        )
                        user_message.document_references = refs
                        # Refresh message to get the references
                        session.refresh(user_message)
                        session.commit()
                        logger.info(f"Successfully created {len(refs)} document references for user message")
                    except Exception as e:
                        logger.error(f"Error creating document references: {str(e)}")
                        session.rollback()
                        raise

        # Prepare chat messages
        chat_messages = [
            {"role": "system", "content": "You are a helpful assistant analyzing documents. Respond ins the same language as the user."}
        ]
        
        # Add document context if available
        if all_relevant_chunks:
            # Organize chunks by document type
            rfp_chunks = []
            proposal_chunks = []
            other_chunks = []
            
            for ref in document_references:
                if ref.document_type.lower() == 'rfp':
                    rfp_chunks.append(ref.content_snippet)
                elif ref.document_type.lower() == 'proposal':
                    proposal_chunks.append(ref.content_snippet)
                else:
                    other_chunks.append(ref.content_snippet)
            
            context = "Here are some relevant document excerpts to help answer the question:\n\n"
            
            if rfp_chunks:
                context += "FROM RFP DOCUMENTS (Client Requirements):\n"
                context += "\n---\n".join(rfp_chunks)
                context += "\n\n"
            
            if proposal_chunks:
                context += "FROM PROPOSAL DOCUMENTS (Our Solution):\n"
                context += "\n---\n".join(proposal_chunks)
                context += "\n\n"
            
            if other_chunks:
                context += "FROM OTHER DOCUMENTS:\n"
                context += "\n---\n".join(other_chunks)
            
            chat_messages.append({"role": "system", "content": context})
            
            # Add guidance about document types
            guidance = (
                "When answering, consider that RFP documents represent client requirements and expectations, "
                "while Proposal documents represent our proposed solutions and approaches. "
                "Response in the same language as the user."
                "Try to align your responses with both perspectives when applicable."
                "Respond in the following format:"
                "RFP documents:\n"
                "Proposal documents:\n"
                "Other documents:\n"
                
            )
            chat_messages.append({"role": "system", "content": guidance})
        
        # Add conversation history
        chat_messages.extend(messages)
        
        # Add current message
        chat_messages.append({"role": "user", "content": message.content})

        # Get assistant response
        response = await openai_service.create_chat_completion(
            messages=chat_messages,
            model=settings.chat.model,
            max_tokens=settings.chat.max_response_tokens,
            temperature=0.2
        )
        # Create assistant message
        assistant_message = chat_message_repository.create(
            session,
            obj_in=ChatMessageCreate(
                role="assistant",
                content=response,
                use_documents=message.use_documents
            ),
            conversation_id=conversation_id
        )
        
        # Create document references for assistant message
        if document_references:
            refs = document_reference_repository.create_multi(
                session, refs=[
                    DocumentReferenceCreate(
                        message_id=assistant_message.id,
                        document_id=ref.document_id,
                        document_type=ref.document_type,
                        filename=ref.filename,
                        content_snippet=ref.content_snippet,
                        relevance_score=ref.relevance_score,
                        page_number=ref.page_number,
                        page_total=ref.page_total
                    ) for ref in document_references
                ]
            )
            assistant_message.document_references = refs
            session.refresh(assistant_message)
        
        logger.info(f"Generated response for conversation {conversation_id}")
        return assistant_message


# Create service instance
chat_service = ChatService()
