"""API endpoints for projects."""
import logging
import os
import shutil
import uuid
from pathlib import Path
from typing import Any, List

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from app.api.v1.dependencies import CurrentUser, SessionDep
from app.common.schemas.message import Message
from app.modules.projects.capacity_service import capacity_service
from app.modules.projects.models import DocumentStatus
from app.modules.projects.repository import document_repository, project_repository
from app.modules.projects.schemas import (
    DocumentProgress,
    DocumentPublic,
    DocumentsPublic,
    DocumentUpdate,
    ProjectCapacity,
    ProjectCreate,
    ProjectPublic,
    ProjectsPublic,
    ProjectUpdate,
    ProjectWithCapacity,
)
from app.modules.projects.tasks.document_tasks import (
    delete_project_embeddings_task,
    process_document_task,
)
from app.services.document_processor import document_processor

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post("", response_model=ProjectPublic, status_code=201)
def create_project(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    project_in: ProjectCreate
) -> Any:
    """
    Create a new project.
    """
    project = project_repository.create(
        session, obj_in=project_in, user_id=current_user.id
    )

    logger.info(f"Created project {project.id} for user {current_user.id}")
    return project


@router.get("", response_model=ProjectsPublic)
def get_projects(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Get all projects for the current user.
    """
    projects = project_repository.get_by_user_id(session, current_user.id)

    # Apply pagination
    paginated_projects = projects[skip : skip + limit]

    return ProjectsPublic(data=paginated_projects, count=len(projects))


@router.get("/{project_id}", response_model=ProjectPublic)
def get_project(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    project_id: uuid.UUID
) -> Any:
    """
    Get a project by ID.
    """
    project = project_repository.get(session, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Check authorization
    if project.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Not authorized to access this project"
        )

    return project


@router.get("/{project_id}/capacity", response_model=ProjectCapacity)
def get_project_capacity(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    project_id: uuid.UUID
) -> Any:
    """
    Get capacity information for a project.
    """
    project = project_repository.get(session, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Check authorization
    if project.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Not authorized to access this project"
        )

    capacity = capacity_service.get_capacity_info(session, project_id)
    return ProjectCapacity(**capacity)


@router.patch("/{project_id}", response_model=ProjectPublic)
def update_project(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    project_id: uuid.UUID,
    project_in: ProjectUpdate
) -> Any:
    """
    Update a project.
    """
    project = project_repository.get(session, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Check authorization
    if project.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Not authorized to update this project"
        )

    updated_project = project_repository.update(
        session, db_obj=project, obj_in=project_in
    )

    logger.info(f"Updated project {project_id}")
    return updated_project


@router.delete("/{project_id}", response_model=Message)
def delete_project(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    project_id: uuid.UUID
) -> Any:
    """
    Delete a project and all its documents and conversations.
    """
    project = project_repository.get(session, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Check authorization
    if project.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this project"
        )

    # Delete all embeddings for this project asynchronously
    delete_project_embeddings_task.delay(str(project_id))

    # Delete the project (will cascade delete documents and conversations)
    project_repository.delete(session, id=project_id)

    logger.info(f"Deleted project {project_id}")
    return Message(message="Project deleted successfully")


@router.get("/{project_id}/documents", response_model=DocumentsPublic)
def get_project_documents(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    project_id: uuid.UUID
) -> Any:
    """
    Get all documents for a project.
    """
    project = project_repository.get(session, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Check authorization
    if project.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Not authorized to access this project"
        )

    documents = document_repository.get_by_project_id(session, project_id)
    return DocumentsPublic(data=documents, count=len(documents))


@router.post("/{project_id}/documents", response_model=DocumentPublic, status_code=201)
async def upload_document(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    project_id: uuid.UUID,
    file: UploadFile = File(...),
    document_type: str = Form("other")
) -> Any:
    """
    Upload a document to a project.
    """
    project = project_repository.get(session, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Check authorization
    if project.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Not authorized to upload to this project"
        )

    # Validate file type
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in [".pdf", ".docx", ".doc", ".txt"]:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file_ext}. Supported types: PDF, DOCX, TXT"
        )

    # Create document directory
    document_id = uuid.uuid4()
    doc_dir = Path("/app/documents") / str(project_id) / str(document_id)
    doc_dir.mkdir(parents=True, exist_ok=True)

    # Save file
    file_path = doc_dir / file.filename
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        file_size = file_path.stat().st_size

        logger.info(f"Saved file {file.filename} ({file_size} bytes) to {file_path}")

    except Exception as e:
        logger.error(f"Error saving file: {e}")
        # Cleanup
        if doc_dir.exists():
            shutil.rmtree(doc_dir)
        raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")

    # Quick estimate of tokens before processing
    try:
        estimated_tokens = document_processor.estimate_file_size_tokens(
            str(file_path), file_ext.replace(".", "")
        )
    except Exception as e:
        logger.warning(f"Could not estimate tokens: {e}")
        estimated_tokens = file_size // 4  # Rough fallback

    # Check capacity
    can_add, message = capacity_service.can_add_document(
        session, project_id, estimated_tokens
    )
    if not can_add:
        # Cleanup file
        shutil.rmtree(doc_dir)
        raise HTTPException(status_code=400, detail=message)

    # Create document record
    from app.modules.projects.schemas import DocumentCreate

    document_in = DocumentCreate(
        filename=file.filename,
        file_path=str(file_path),
        file_size=file_size,
        file_type=file_ext.replace(".", ""),
        document_type=document_type,
        project_id=project_id,
    )

    document = document_repository.create(session, obj_in=document_in)

    # Queue processing task
    task = process_document_task.delay(str(document.id))

    # Update task_id
    document.task_id = task.id
    session.add(document)
    session.commit()
    session.refresh(document)

    logger.info(
        f"Document {document.id} queued for processing with task {task.id}"
    )

    return document
