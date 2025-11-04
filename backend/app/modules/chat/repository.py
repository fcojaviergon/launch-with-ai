import uuid
from datetime import datetime
from typing import List, Optional, Union

from sqlmodel import Session, select

from app.modules.chat.models import (
    ChatConversation,
    ChatMessage,
    DocumentReference
)
from app.modules.chat.schemas import (
    ChatConversationCreate,
    ChatConversationUpdate,
    ChatMessageCreate,
    ChatMessageUpdate,
    DocumentReferenceCreate
)


class ChatConversationRepository:
    """Repository for the ChatConversation entity."""

    def create(self, session: Session, *, obj_in: ChatConversationCreate, user_id: uuid.UUID) -> ChatConversation:
        """Create a new chat conversation."""
        db_obj = ChatConversation(**obj_in.model_dump(), user_id=user_id)
        session.add(db_obj)
        session.commit()
        session.refresh(db_obj)
        return db_obj

    def get(self, session: Session, id: uuid.UUID) -> Optional[ChatConversation]:
        """Get a chat conversation by ID."""
        return session.get(ChatConversation, id)

    def get_by_analysis_id(self, session: Session, analysis_id: uuid.UUID) -> List[ChatConversation]:
        """Get all chat conversations for an analysis."""
        return session.exec(
            select(ChatConversation)
            .where(ChatConversation.analysis_id == analysis_id)
            .order_by(ChatConversation.created_at)
        ).all()

    def update(
        self, session: Session, *, db_obj: ChatConversation, obj_in: Union[ChatConversationUpdate, dict]
    ) -> ChatConversation:
        """Update a chat conversation."""
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
            
        if update_data:
            update_data["updated_at"] = datetime.utcnow()
            for field, value in update_data.items():
                setattr(db_obj, field, value)
            session.add(db_obj)
            session.commit()
            session.refresh(db_obj)
        return db_obj

    def delete(self, session: Session, *, id: uuid.UUID) -> None:
        """Delete a chat conversation."""
        db_obj = session.get(ChatConversation, id)
        if db_obj:
            session.delete(db_obj)
            session.commit()


class ChatMessageRepository:
    """Repository for the ChatMessage entity."""

    def create(self, session: Session, *, obj_in: ChatMessageCreate, conversation_id: uuid.UUID) -> ChatMessage:
        """Create a new chat message."""
        db_obj = ChatMessage(**obj_in.model_dump(exclude={'document_references'}), conversation_id=conversation_id)
        session.add(db_obj)
        session.commit()
        session.refresh(db_obj)
        return db_obj

    def get(self, session: Session, id: uuid.UUID) -> Optional[ChatMessage]:
        """Get a chat message by ID."""
        return session.get(ChatMessage, id)

    def get_by_conversation_id(self, session: Session, conversation_id: uuid.UUID) -> List[ChatMessage]:
        """Get all messages for a conversation."""
        return session.exec(
            select(ChatMessage)
            .where(ChatMessage.conversation_id == conversation_id)
            .order_by(ChatMessage.created_at)
        ).all()

    def update(
        self, session: Session, *, db_obj: ChatMessage, obj_in: Union[ChatMessageUpdate, dict]
    ) -> ChatMessage:
        """Update a chat message."""
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
            
        if update_data:
            for field, value in update_data.items():
                setattr(db_obj, field, value)
            session.add(db_obj)
            session.commit()
            session.refresh(db_obj)
        return db_obj

    def delete(self, session: Session, *, id: uuid.UUID) -> None:
        """Delete a chat message."""
        db_obj = session.get(ChatMessage, id)
        if db_obj:
            session.delete(db_obj)
            session.commit()


class DocumentReferenceRepository:
    """Repository for the DocumentReference entity."""

    def create(self, session: Session, *, obj_in: DocumentReferenceCreate) -> DocumentReference:
        """Create a new document reference."""
        db_obj = DocumentReference(**obj_in.model_dump())
        session.add(db_obj)
        session.commit()
        session.refresh(db_obj)
        return db_obj

    def create_multi(self, session: Session, *, refs: List[DocumentReferenceCreate]) -> List[DocumentReference]:
        """Create multiple document references."""
        db_objs = [DocumentReference(**ref.model_dump()) for ref in refs]
        session.add_all(db_objs)
        session.commit()
        for obj in db_objs:
            session.refresh(obj)
        return db_objs

    def get(self, session: Session, id: uuid.UUID) -> Optional[DocumentReference]:
        """Get a document reference by ID."""
        return session.get(DocumentReference, id)

    def get_by_message_id(self, session: Session, message_id: uuid.UUID) -> List[DocumentReference]:
        """Get all document references for a message."""
        return session.exec(
            select(DocumentReference)
            .where(DocumentReference.message_id == message_id)
            .order_by(DocumentReference.relevance_score.desc())
        ).all()

    def delete_by_message_id(self, session: Session, message_id: uuid.UUID) -> None:
        """Delete all document references for a message."""
        refs = session.exec(
            select(DocumentReference).where(DocumentReference.message_id == message_id)
        ).all()
        for ref in refs:
            session.delete(ref)
        session.commit()


# Create repository instances
chat_conversation_repository = ChatConversationRepository()
chat_message_repository = ChatMessageRepository()
document_reference_repository = DocumentReferenceRepository()
