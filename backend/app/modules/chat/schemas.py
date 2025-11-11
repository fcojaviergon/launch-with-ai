import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import Field
from sqlmodel import SQLModel


# Base schemas
class DocumentReferenceBase(SQLModel):
    document_id: uuid.UUID
    document_type: str
    filename: str
    content_snippet: str
    relevance_score: float
    page_number: int
    page_total: int


class ChatConversationBase(SQLModel):
    title: str
    use_documents: bool = Field(default=True)


class ChatMessageBase(SQLModel):
    role: str
    content: str
    use_documents: bool = Field(default=True)
    document_references: List[DocumentReferenceBase] = Field(default=[])


# Create schemas
class ChatConversationCreate(ChatConversationBase):
    project_id: Optional[uuid.UUID] = None


class ChatMessageCreate(ChatMessageBase):
    pass


class DocumentReferenceCreate(DocumentReferenceBase):
    message_id: uuid.UUID


# Public schemas (for API responses)
class DocumentReferencePublic(DocumentReferenceBase):
    id: uuid.UUID
    message_id: uuid.UUID
    created_at: datetime


class ChatMessagePublic(ChatMessageBase):
    id: uuid.UUID
    conversation_id: uuid.UUID
    created_at: datetime
    document_references: List["DocumentReferencePublic"] = Field(default=[])


class ChatConversationPublic(ChatConversationBase):
    id: uuid.UUID
    user_id: uuid.UUID
    project_id: Optional[uuid.UUID] = None
    auto_generated_title: bool = False
    title_generation_task_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    messages: List[ChatMessagePublic] = Field(default=[])


# Update schemas
class ChatConversationUpdate(SQLModel):
    title: Optional[str] = None
    use_documents: Optional[bool] = None


class ChatMessageUpdate(SQLModel):
    content: Optional[str] = None
    use_documents: Optional[bool] = None


# List schemas
class ChatConversationsPublic(SQLModel):
    data: List[ChatConversationPublic]
    count: int
