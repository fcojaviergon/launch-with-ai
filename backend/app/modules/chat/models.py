import uuid
from datetime import datetime
from typing import List, Optional, TYPE_CHECKING

from sqlmodel import Column, Field, Relationship, SQLModel, JSON

if TYPE_CHECKING:
    from app.modules.projects.models import Project


class ChatConversation(SQLModel, table=True):
    """Model for a chat conversation."""
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", ondelete="CASCADE")
    project_id: Optional[uuid.UUID] = Field(default=None, nullable=True, foreign_key="project.id", ondelete="CASCADE")

    title: str
    use_documents: bool = Field(default=True)

    # Auto-generated title fields
    auto_generated_title: bool = Field(default=False)
    title_generation_task_id: Optional[str] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    project: Optional["Project"] = Relationship(back_populates="conversations")
    messages: List["ChatMessage"] = Relationship(back_populates="conversation", sa_relationship_kwargs={"cascade": "all, delete-orphan"})


class ChatMessage(SQLModel, table=True):
    """Model for a message in a chat conversation."""
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    conversation_id: uuid.UUID = Field(foreign_key="chatconversation.id", ondelete="CASCADE")
    role: str
    content: str
    use_documents: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    conversation: ChatConversation = Relationship(back_populates="messages")
    document_references: List["DocumentReference"] = Relationship(back_populates="message", sa_relationship_kwargs={"cascade": "all, delete-orphan"})


class DocumentReference(SQLModel, table=True):
    """Model for a reference to a document in a chat message."""
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    message_id: uuid.UUID = Field(foreign_key="chatmessage.id", ondelete="CASCADE")
    document_id: uuid.UUID
    document_type: str
    filename: str
    content_snippet: str
    relevance_score: float
    created_at: datetime = Field(default_factory=datetime.utcnow)
    page_number: int
    page_total: int
    
    # Relationships
    message: ChatMessage = Relationship(back_populates="document_references")
