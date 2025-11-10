"""API endpoints for individual document operations."""
import logging
import shutil
import uuid
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from app.api.v1.dependencies import CurrentUser, SessionDep
from app.common.schemas.message import Message
from app.modules.projects.models import DocumentStatus
from app.modules.projects.repository import document_repository, project_repository
from app.modules.projects.schemas import DocumentProgress, DocumentPublic, DocumentUpdate
from app.modules.projects.tasks.document_tasks import (
    delete_document_embeddings_task,
    process_document_task,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/documents", tags=["documents"])


@router.get("/{document_id}", response_model=DocumentPublic)
def get_document(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    document_id: uuid.UUID
) -> Any:
    """
    Get a document by ID.
    """
    document = document_repository.get(session, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Check authorization through project
    project = project_repository.get(session, document.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Not authorized to access this document"
        )

    return document


@router.get("/{document_id}/progress", response_model=DocumentProgress)
def get_document_progress(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    document_id: uuid.UUID
) -> Any:
    """
    Get processing progress for a document.
    """
    document = document_repository.get(session, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Check authorization
    project = project_repository.get(session, document.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Not authorized to access this document"
        )

    # Calculate progress percentage
    if document.total_chunks > 0:
        progress_percentage = (document.processed_chunks / document.total_chunks) * 100
    else:
        progress_percentage = 0.0

    return DocumentProgress(
        document_id=document.id,
        status=document.status,
        total_chunks=document.total_chunks,
        processed_chunks=document.processed_chunks,
        progress_percentage=round(progress_percentage, 2),
        error_message=document.error_message,
    )


@router.patch("/{document_id}", response_model=DocumentPublic)
def update_document(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    document_id: uuid.UUID,
    document_in: DocumentUpdate
) -> Any:
    """
    Update a document's metadata.
    """
    document = document_repository.get(session, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Check authorization
    project = project_repository.get(session, document.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Not authorized to update this document"
        )

    # Only allow updating metadata, not file content
    updated_document = document_repository.update(
        session, db_obj=document, obj_in=document_in
    )

    logger.info(f"Updated document {document_id}")
    return updated_document


@router.delete("/{document_id}", response_model=Message)
def delete_document(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    document_id: uuid.UUID
) -> Any:
    """
    Delete a document and its embeddings.
    """
    document = document_repository.get(session, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Check authorization
    project = project_repository.get(session, document.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this document"
        )

    # Delete file from filesystem
    file_path = Path(document.file_path)
    if file_path.exists():
        try:
            # Delete the entire document directory
            doc_dir = file_path.parent
            shutil.rmtree(doc_dir)
            logger.info(f"Deleted document directory: {doc_dir}")
        except Exception as e:
            logger.error(f"Error deleting document directory: {e}")
            # Continue with database deletion even if file deletion fails

    # Delete embeddings asynchronously
    delete_document_embeddings_task.delay(str(document_id))

    # Delete document record
    document_repository.delete(session, id=document_id)

    logger.info(f"Deleted document {document_id}")
    return Message(message="Document deleted successfully")


@router.post("/{document_id}/retry", response_model=DocumentPublic)
def retry_document_processing(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    document_id: uuid.UUID
) -> Any:
    """
    Retry processing a failed document.
    """
    document = document_repository.get(session, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Check authorization
    project = project_repository.get(session, document.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Not authorized to retry this document"
        )

    # Only allow retrying failed documents
    if document.status != DocumentStatus.FAILED:
        raise HTTPException(
            status_code=400,
            detail=f"Document is not in failed state (current status: {document.status})"
        )

    # Check if file still exists
    if not Path(document.file_path).exists():
        raise HTTPException(
            status_code=400,
            detail="Document file no longer exists on filesystem"
        )

    # Reset document status
    document.status = DocumentStatus.PENDING
    document.error_message = None
    document.processed_chunks = 0
    document.estimated_tokens = 0
    document.processing_started_at = None
    document.processing_completed_at = None

    session.add(document)
    session.commit()
    session.refresh(document)

    # Queue new processing task
    task = process_document_task.delay(str(document.id))

    # Update task_id
    document.task_id = task.id
    session.add(document)
    session.commit()
    session.refresh(document)

    logger.info(f"Document {document.id} queued for retry with task {task.id}")

    return document
