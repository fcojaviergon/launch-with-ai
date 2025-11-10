"""Service for managing project capacity and token limits."""
import logging
import uuid
from typing import Dict

import tiktoken
from sqlmodel import Session, select

from app.modules.chat.models import ChatConversation, ChatMessage
from app.modules.projects.models import Document, DocumentStatus, Project

logger = logging.getLogger(__name__)


class ProjectCapacityService:
    """Service for calculating and managing project token capacity."""

    def __init__(self):
        """Initialize the capacity service."""
        self._encoding = None

    @property
    def encoding(self):
        """Lazy load the tiktoken encoding on first access."""
        if self._encoding is None:
            try:
                self._encoding = tiktoken.encoding_for_model("gpt-4o")
                logger.info("Initialized ProjectCapacityService with gpt-4o encoding")
            except Exception as e:
                logger.warning(f"Error loading gpt-4o encoding: {e}, falling back to cl100k_base")
                try:
                    self._encoding = tiktoken.get_encoding("cl100k_base")
                except Exception as e2:
                    logger.error(f"Error loading cl100k_base encoding: {e2}")
                    self._encoding = None
        return self._encoding

    def count_tokens(self, text: str) -> int:
        """
        Count tokens in a text string.

        Args:
            text: The text to count tokens for

        Returns:
            Number of tokens in the text
        """
        if not text:
            return 0
        try:
            if self.encoding is not None:
                return len(self.encoding.encode(text))
            else:
                # Fallback: rough estimate of 4 chars per token
                return len(text) // 4
        except Exception as e:
            logger.error(f"Error counting tokens: {e}")
            # Fallback: rough estimate of 4 chars per token
            return len(text) // 4

    def get_documents_tokens(self, session: Session, project_id: uuid.UUID) -> int:
        """
        Calculate total tokens from all completed documents in a project.

        Args:
            session: Database session
            project_id: Project UUID

        Returns:
            Total tokens from documents
        """
        documents = session.exec(
            select(Document)
            .where(Document.project_id == project_id)
            .where(Document.status == DocumentStatus.COMPLETED)
        ).all()

        total_tokens = sum(doc.estimated_tokens for doc in documents)
        logger.debug(f"Project {project_id}: {len(documents)} documents = {total_tokens} tokens")
        return total_tokens

    def get_conversations_tokens(self, session: Session, project_id: uuid.UUID) -> int:
        """
        Calculate total tokens from all messages in project conversations.

        Args:
            session: Database session
            project_id: Project UUID

        Returns:
            Total tokens from conversation messages
        """
        conversations = session.exec(
            select(ChatConversation).where(ChatConversation.project_id == project_id)
        ).all()

        total_tokens = 0
        for conv in conversations:
            # Load messages for this conversation
            messages = session.exec(
                select(ChatMessage).where(ChatMessage.conversation_id == conv.id)
            ).all()

            for msg in messages:
                total_tokens += self.count_tokens(msg.content)

        logger.debug(
            f"Project {project_id}: {len(conversations)} conversations = {total_tokens} tokens"
        )
        return total_tokens

    def get_capacity_info(self, session: Session, project_id: uuid.UUID) -> Dict:
        """
        Get comprehensive capacity information for a project.

        Args:
            session: Database session
            project_id: Project UUID

        Returns:
            Dictionary with capacity metrics including:
            - documents_tokens: Tokens from documents
            - conversations_tokens: Tokens from conversations
            - total_tokens: Sum of both
            - max_tokens: Project limit
            - usage_percentage: Percentage of capacity used
            - remaining_tokens: Available tokens
            - is_near_limit: True if over 80% used
            - is_over_limit: True if over 100% used
        """
        project = session.get(Project, project_id)
        if not project:
            raise ValueError(f"Project {project_id} not found")

        docs_tokens = self.get_documents_tokens(session, project_id)
        convs_tokens = self.get_conversations_tokens(session, project_id)
        total_tokens = docs_tokens + convs_tokens

        max_tokens = project.max_context_tokens
        usage_percentage = (total_tokens / max_tokens * 100) if max_tokens > 0 else 0
        remaining_tokens = max(0, max_tokens - total_tokens)

        capacity_info = {
            "documents_tokens": docs_tokens,
            "conversations_tokens": convs_tokens,
            "total_tokens": total_tokens,
            "max_tokens": max_tokens,
            "usage_percentage": round(usage_percentage, 2),
            "remaining_tokens": remaining_tokens,
            "is_near_limit": usage_percentage >= 80,
            "is_over_limit": usage_percentage >= 100,
        }

        logger.info(
            f"Project {project_id} capacity: {total_tokens}/{max_tokens} tokens "
            f"({capacity_info['usage_percentage']}%)"
        )

        return capacity_info

    def can_add_document(
        self, session: Session, project_id: uuid.UUID, estimated_tokens: int
    ) -> tuple[bool, str]:
        """
        Check if a document can be added to a project without exceeding limits.

        Args:
            session: Database session
            project_id: Project UUID
            estimated_tokens: Estimated tokens for the new document

        Returns:
            Tuple of (can_add: bool, message: str)
        """
        try:
            capacity = self.get_capacity_info(session, project_id)

            if capacity["is_over_limit"]:
                return (
                    False,
                    f"Project is already over the token limit "
                    f"({capacity['total_tokens']}/{capacity['max_tokens']})",
                )

            if capacity["remaining_tokens"] < estimated_tokens:
                return (
                    False,
                    f"Not enough space. Need {estimated_tokens} tokens but only "
                    f"{capacity['remaining_tokens']} remaining",
                )

            return True, "OK"

        except Exception as e:
            logger.error(f"Error checking capacity: {e}")
            return False, f"Error checking capacity: {str(e)}"

    def estimate_document_tokens(self, text: str) -> int:
        """
        Estimate tokens for a document text.

        Args:
            text: Document text

        Returns:
            Estimated token count
        """
        return self.count_tokens(text)


# Create singleton instance
capacity_service = ProjectCapacityService()
