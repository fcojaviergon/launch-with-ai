"""Repository layer for projects and documents."""
import uuid
from datetime import datetime
from typing import List, Optional, Union

from sqlmodel import Session, select

from app.core.base_crud import BaseCRUD
from app.modules.projects.models import Document, DocumentStatus, Project
from app.modules.projects.schemas import (
    DocumentCreate,
    DocumentUpdate,
    ProjectCreate,
    ProjectUpdate,
)


class ProjectRepository(BaseCRUD[Project, ProjectCreate, ProjectUpdate]):
    """Repository for the Project entity."""

    def __init__(self):
        super().__init__(Project)

    def create(
        self, session: Session, *, obj_in: ProjectCreate, user_id: uuid.UUID
    ) -> Project:
        """Create a new project with user_id."""
        db_obj = Project(**obj_in.model_dump(), user_id=user_id)
        session.add(db_obj)
        session.commit()
        session.refresh(db_obj)
        return db_obj

    def get_by_user_id(self, session: Session, user_id: uuid.UUID) -> List[Project]:
        """Get all projects for a user."""
        return session.exec(
            select(Project)
            .where(Project.user_id == user_id)
            .order_by(Project.created_at.desc())
        ).all()

    def update(
        self,
        session: Session,
        *,
        db_obj: Project,
        obj_in: Union[ProjectUpdate, dict]
    ) -> Project:
        """Update a project with automatic updated_at timestamp."""
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)

        if update_data:
            update_data["updated_at"] = datetime.utcnow()
            db_obj.sqlmodel_update(update_data)
            session.add(db_obj)
            session.commit()
            session.refresh(db_obj)
        return db_obj

    def delete(self, session: Session, *, id: uuid.UUID) -> None:
        """Delete a project."""
        db_obj = session.get(Project, id)
        if db_obj:
            session.delete(db_obj)
            session.commit()


class DocumentRepository(BaseCRUD[Document, DocumentCreate, DocumentUpdate]):
    """Repository for the Document entity."""

    def __init__(self):
        super().__init__(Document)

    def create(self, session: Session, *, obj_in: DocumentCreate) -> Document:
        """Create a new document."""
        db_obj = Document(**obj_in.model_dump())
        session.add(db_obj)
        session.commit()
        session.refresh(db_obj)
        return db_obj

    def get_by_project_id(
        self, session: Session, project_id: uuid.UUID
    ) -> List[Document]:
        """Get all documents for a project."""
        return session.exec(
            select(Document)
            .where(Document.project_id == project_id)
            .order_by(Document.uploaded_at.desc())
        ).all()

    def get_completed_by_project_id(
        self, session: Session, project_id: uuid.UUID
    ) -> List[Document]:
        """Get all completed documents for a project."""
        return session.exec(
            select(Document)
            .where(Document.project_id == project_id)
            .where(Document.status == DocumentStatus.COMPLETED)
        ).all()

    def update_status(
        self,
        session: Session,
        *,
        document_id: uuid.UUID,
        status: DocumentStatus,
        error_message: Optional[str] = None
    ) -> Document:
        """Update document status."""
        document = session.get(Document, document_id)
        if not document:
            raise ValueError(f"Document {document_id} not found")

        document.status = status
        if error_message:
            document.error_message = error_message

        if status == DocumentStatus.PROCESSING:
            document.processing_started_at = datetime.utcnow()
        elif status in [DocumentStatus.COMPLETED, DocumentStatus.FAILED]:
            document.processing_completed_at = datetime.utcnow()

        session.add(document)
        session.commit()
        session.refresh(document)
        return document

    def update_progress(
        self,
        session: Session,
        *,
        document_id: uuid.UUID,
        processed_chunks: int,
        total_chunks: Optional[int] = None,
        estimated_tokens: Optional[int] = None
    ) -> Document:
        """Update document processing progress."""
        document = session.get(Document, document_id)
        if not document:
            raise ValueError(f"Document {document_id} not found")

        document.processed_chunks = processed_chunks
        if total_chunks is not None:
            document.total_chunks = total_chunks
        if estimated_tokens is not None:
            document.estimated_tokens = estimated_tokens

        session.add(document)
        session.commit()
        session.refresh(document)
        return document

    def delete(self, session: Session, *, id: uuid.UUID) -> None:
        """Delete a document."""
        db_obj = session.get(Document, id)
        if db_obj:
            session.delete(db_obj)
            session.commit()


# Create repository instances
project_repository = ProjectRepository()
document_repository = DocumentRepository()
