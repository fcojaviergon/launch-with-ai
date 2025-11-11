"""Database models for the projects module."""
import uuid
from datetime import datetime
from enum import Enum
from typing import List, Optional, TYPE_CHECKING

from sqlmodel import Column, Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.users.models import User
    from app.modules.chat.models import ChatConversation


class DocumentStatus(str, Enum):
    """Status of document processing."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Project(SQLModel, table=True):
    """Project model for grouping documents and conversations."""
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", ondelete="CASCADE")

    # Project information
    name: str = Field(min_length=1, max_length=200)
    description: Optional[str] = None
    system_prompt: Optional[str] = None  # Custom system prompt for all conversations

    # Capacity and limits
    max_context_tokens: int = Field(default=100000)

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: "User" = Relationship(back_populates="projects")
    documents: List["Document"] = Relationship(
        back_populates="project",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    conversations: List["ChatConversation"] = Relationship(
        back_populates="project",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )


class Document(SQLModel, table=True):
    """Document model for files uploaded to a project."""
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    project_id: uuid.UUID = Field(foreign_key="project.id", ondelete="CASCADE")

    # File information
    filename: str
    file_path: str  # Path in filesystem: /app/documents/{project_id}/{document_id}/{filename}
    file_size: int  # Size in bytes
    file_type: str  # pdf, docx, txt
    document_type: str = Field(default="other")  # rfp, proposal, other (user-defined)

    # Processing status
    status: DocumentStatus = Field(default=DocumentStatus.PENDING)
    error_message: Optional[str] = None

    # Chunk and token tracking
    total_chunks: int = Field(default=0)
    processed_chunks: int = Field(default=0)
    estimated_tokens: int = Field(default=0)

    # Celery task tracking
    task_id: Optional[str] = None

    # Timestamps
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    processing_started_at: Optional[datetime] = None
    processing_completed_at: Optional[datetime] = None

    # Relationships
    project: Project = Relationship(back_populates="documents")
