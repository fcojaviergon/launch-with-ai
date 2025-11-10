import logging
from typing import Any, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from app.api.v1.dependencies import SessionDep, CurrentUser
from app.common.schemas.message import Message
from app.modules.chat.repository import (
    chat_conversation_repository,
    chat_message_repository,
    document_reference_repository
)
from app.modules.chat.schemas import (
    ChatConversationCreate,
    ChatConversationsPublic,
    ChatMessageCreate,
    DocumentReferenceCreate,
    DocumentReferencePublic,
    ChatMessagePublic,
    ChatConversationPublic,
)
from app.modules.chat.chat_service import chat_service
from app.modules.projects.repository import project_repository
from app.modules.projects.tasks.document_tasks import generate_conversation_title_task

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/conversations", response_model=ChatConversationPublic, status_code=201)
def create_conversation(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    conversation: ChatConversationCreate
) -> Any:
    """Create a new chat conversation."""
    # Verify project ownership if project_id is provided
    if conversation.project_id:
        project = project_repository.get(session, conversation.project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        if project.user_id != current_user.id and not current_user.is_superuser:
            raise HTTPException(status_code=403, detail="Not authorized to access this project")

    new_conversation = chat_service.create_conversation(
        session,
        user_id=current_user.id,
        title=conversation.title,
        use_documents=conversation.use_documents,
        project_id=conversation.project_id
    )

    # Auto-generate title if conversation has project_id
    if new_conversation.project_id and not conversation.title:
        # We'll generate title after first message is sent
        pass

    return new_conversation


@router.get("/conversations", response_model=List[ChatConversationPublic])
def get_user_conversations(
    *,
    session: SessionDep,
    current_user: CurrentUser
) -> Any:
    """Get all conversations for the current user."""
    return chat_service.get_user_conversations(session, current_user.id)


@router.get("/conversations/{project_id}", response_model=List[ChatConversationPublic])
def get_project_conversations(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    project_id: UUID
) -> Any:
    """Get all conversations for a project."""
    # Verify project ownership
    project = project_repository.get(session, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not authorized to access this project")

    return chat_service.get_conversations(session, project_id)


@router.get("/conversations/{conversation_id}/detail", response_model=ChatConversationPublic)
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


@router.post("/conversations/{conversation_id}/messages", response_model=ChatMessagePublic, status_code=201)
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

    response_message = await chat_service.process_message(
        session,
        conversation_id=conversation_id,
        message=message
    )

    # Auto-generate title after first message if not already titled
    if not conversation.auto_generated_title and len(conversation.messages) == 2:  # user + assistant
        generate_conversation_title_task.delay(str(conversation_id))

    return response_message


@router.patch("/conversations/{conversation_id}/title", response_model=ChatConversationPublic)
def update_conversation_title(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    conversation_id: UUID,
    title: str
) -> Any:
    """Update a conversation's title."""
    conversation = chat_service.get_conversation(session, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Authorization check
    if conversation.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not authorized to update this conversation")

    # Update title
    conversation.title = title
    conversation.auto_generated_title = False  # Mark as manually edited
    session.add(conversation)
    session.commit()
    session.refresh(conversation)

    logger.info(f"Updated title for conversation {conversation_id}")
    return conversation


@router.post("/conversations/{conversation_id}/generate-title", response_model=Message)
def generate_conversation_title(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    conversation_id: UUID
) -> Any:
    """Generate a new title for a conversation using AI."""
    conversation = chat_service.get_conversation(session, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Authorization check
    if conversation.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not authorized to update this conversation")

    # Queue title generation task
    task = generate_conversation_title_task.delay(str(conversation_id))

    # Update task ID
    conversation.title_generation_task_id = task.id
    session.add(conversation)
    session.commit()

    logger.info(f"Queued title generation for conversation {conversation_id}")
    return Message(message="Title generation started")


@router.delete("/conversations/{conversation_id}", response_model=Message)
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
    return Message(message="Conversation deleted successfully")
