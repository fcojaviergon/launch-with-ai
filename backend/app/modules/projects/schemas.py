"""API schemas for the projects module."""
import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import Field
from sqlmodel import SQLModel

from app.modules.projects.models import DocumentStatus


# Base schemas
class ProjectBase(SQLModel):
    """Base schema for Project."""
    name: str = Field(min_length=1, max_length=200)
    description: Optional[str] = None
    system_prompt: Optional[str] = None
    max_context_tokens: int = Field(default=100000, ge=1000, le=200000)


class DocumentBase(SQLModel):
    """Base schema for Document."""
    filename: str
    file_type: str
    document_type: str = Field(default="other")


# Create schemas
class ProjectCreate(ProjectBase):
    """Schema for creating a new project."""
    pass


class DocumentCreate(DocumentBase):
    """Schema for creating a new document (used internally after upload)."""
    file_path: str
    file_size: int
    project_id: uuid.UUID


# Update schemas
class ProjectUpdate(SQLModel):
    """Schema for updating a project."""
    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = None
    system_prompt: Optional[str] = None
    max_context_tokens: Optional[int] = Field(default=None, ge=1000, le=200000)


class DocumentUpdate(SQLModel):
    """Schema for updating a document."""
    document_type: Optional[str] = None


# Public schemas (API responses)
class DocumentPublic(DocumentBase):
    """Schema for Document in API responses."""
    id: uuid.UUID
    project_id: uuid.UUID
    file_size: int
    status: DocumentStatus
    error_message: Optional[str] = None
    total_chunks: int
    processed_chunks: int
    estimated_tokens: int
    task_id: Optional[str] = None
    uploaded_at: datetime
    processing_started_at: Optional[datetime] = None
    processing_completed_at: Optional[datetime] = None


class ProjectCapacity(SQLModel):
    """Schema for project capacity information."""
    documents_tokens: int
    conversations_tokens: int
    total_tokens: int
    max_tokens: int
    usage_percentage: float
    remaining_tokens: int
    is_near_limit: bool
    is_over_limit: bool


class ProjectPublic(ProjectBase):
    """Schema for Project in API responses."""
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    documents: List[DocumentPublic] = Field(default=[])
    capacity: Optional[ProjectCapacity] = None


class ProjectWithCapacity(ProjectPublic):
    """Schema for Project with capacity information."""
    capacity: ProjectCapacity


# List schemas
class ProjectsPublic(SQLModel):
    """Schema for list of projects."""
    data: List[ProjectPublic]
    count: int


class DocumentsPublic(SQLModel):
    """Schema for list of documents."""
    data: List[DocumentPublic]
    count: int


# Task progress schema
class DocumentProgress(SQLModel):
    """Schema for document processing progress."""
    document_id: uuid.UUID
    status: DocumentStatus
    total_chunks: int
    processed_chunks: int
    progress_percentage: float
    error_message: Optional[str] = None
