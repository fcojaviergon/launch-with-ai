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
    analysis_id: uuid.UUID


class ChatMessageCreate(ChatMessageBase):
    pass


class DocumentReferenceCreate(DocumentReferenceBase):
    message_id: uuid.UUID


# Response schemas
class DocumentReferenceResponse(DocumentReferenceBase):
    id: uuid.UUID
    message_id: uuid.UUID
    created_at: datetime


class ChatMessageResponse(ChatMessageBase):
    id: uuid.UUID
    conversation_id: uuid.UUID
    created_at: datetime
    document_references: List[DocumentReferenceResponse] = Field(default=[])


class ChatConversationResponse(ChatConversationBase):
    id: uuid.UUID
    user_id: uuid.UUID
    analysis_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    messages: List[ChatMessageResponse] = Field(default=[])


# Update schemas
class ChatConversationUpdate(SQLModel):
    title: Optional[str] = None
    use_documents: Optional[bool] = None


class ChatMessageUpdate(SQLModel):
    content: Optional[str] = None
    use_documents: Optional[bool] = None


# List schemas
class ChatConversationList(SQLModel):
    items: List[ChatConversationResponse]
    total: int
