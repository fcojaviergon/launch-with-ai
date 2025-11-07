import uuid
from datetime import datetime
from typing import List, Optional, TYPE_CHECKING

from sqlmodel import Column, Field, Relationship, SQLModel, JSON


class ChatConversation(SQLModel, table=True):
    """Model for a chat conversation."""
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", ondelete="CASCADE")
    # TODO: Restore foreign key when analysis module is added
    analysis_id: Optional[uuid.UUID] = Field(default=None, nullable=True)  # Field(foreign_key="analysis.id", ondelete="CASCADE")
    title: str
    use_documents: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    # TODO: Restore relationship when analysis module is added
    # analysis: "Analysis" = Relationship(back_populates="chat_conversations",)
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
