import logging
from typing import Any, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from app.api.v1.dependencies import SessionDep, CurrentUser
# from app.modules.analysis.models import Analysis  # TODO: Restore when analysis module is added
from app.modules.chat.repository import (
    chat_conversation_repository,
    chat_message_repository,
    document_reference_repository
)
from app.modules.chat.schemas import (
    ChatConversationCreate,
    ChatConversationList,
    ChatMessageCreate,
    DocumentReferenceCreate,
    DocumentReferenceResponse,
    ChatMessageResponse,
    ChatConversationResponse,
    ChatConversationList
)
from app.modules.chat.chat_service import chat_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/conversations", response_model=ChatConversationResponse)
def create_conversation(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    conversation: ChatConversationCreate
) -> Any:
    """Create a new chat conversation."""
    # TODO: Restore analysis verification when analysis module is added
    # analysis = session.get(Analysis, conversation.analysis_id)
    # if not analysis:
    #     raise HTTPException(status_code=404, detail="Analysis not found")
    # if analysis.user_id != current_user.id and not current_user.is_superuser:
    #     raise HTTPException(status_code=403, detail="Not authorized to access this analysis")

    return chat_service.create_conversation(
        session,
        user_id=current_user.id,
        analysis_id=conversation.analysis_id,
        title=conversation.title,
        use_documents=conversation.use_documents
    )


@router.get("/conversations/{analysis_id}", response_model=List[ChatConversationResponse])
def get_conversations(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    analysis_id: UUID
) -> Any:
    """Get all conversations for an analysis."""
    # TODO: Restore analysis verification when analysis module is added
    # analysis = session.get(Analysis, analysis_id)
    # if not analysis:
    #     raise HTTPException(status_code=404, detail="Analysis not found")

    return chat_service.get_conversations(session, analysis_id)


@router.get("/conversations/{conversation_id}/detail", response_model=ChatConversationResponse)
def get_conversation(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    conversation_id: UUID
) -> Any:
    """Get a conversation by ID with all messages."""
    conversation = chat_service.get_conversation(session, conversation_id, include_messages=True)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Authorization check: verify conversation ownership
    if conversation.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not authorized to access this conversation")

    return conversation


@router.post("/conversations/{conversation_id}/messages", response_model=ChatMessageResponse)
async def create_message(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    conversation_id: UUID,
    message: ChatMessageCreate
) -> Any:
    """Create a new message in a conversation."""
    conversation = chat_service.get_conversation(session, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Authorization check: verify conversation ownership
    if conversation.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not authorized to access this conversation")

    return await chat_service.process_message(
        session,
        conversation_id=conversation_id,
        message=message
    )


@router.delete("/conversations/{conversation_id}")
def delete_conversation(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    conversation_id: UUID
) -> Any:
    """Delete a conversation and all its messages."""
    conversation = chat_service.get_conversation(session, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Authorization check: verify conversation ownership
    if conversation.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not authorized to delete this conversation")

    deleted = chat_service.delete_conversation(session, conversation_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"success": True}
