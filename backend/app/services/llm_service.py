"""
LLM service facade that delegates to the configured provider (OpenAI or Anthropic).

Embeddings always use OpenAI since Anthropic does not provide an embedding API.
Chat completions and text generation use the provider specified by LLM_PROVIDER.
"""

import logging
from typing import Any, Protocol, Union

from app.core.config import settings

logger = logging.getLogger(__name__)


class LLMProvider(Protocol):
    """Protocol defining the interface for LLM providers."""

    def create_completion(
        self,
        system_prompt: str,
        user_prompt: str,
        model: str | None = None,
        temperature: float = 0.2,
        max_tokens: int | None = None,
        response_format: dict[str, str] | None = None,
    ) -> str: ...

    def create_json_completion(
        self,
        system_prompt: str,
        user_prompt: str,
        model: str | None = None,
        temperature: float = 0.2,
        max_tokens: int | None = None,
    ) -> dict[str, Any]: ...

    def create_completion_sync(
        self,
        system_prompt: str,
        user_prompt: str,
        model: str | None = None,
        temperature: float = 0.2,
        max_tokens: int | None = None,
        response_format: dict[str, str] | None = None,
    ) -> str: ...

    def create_json_completion_sync(
        self,
        system_prompt: str,
        user_prompt: str,
        model: str | None = None,
        temperature: float = 0.2,
        max_tokens: int | None = None,
    ) -> dict[str, Any]: ...

    async def create_chat_completion(
        self,
        messages: list[dict[str, str]],
        model: str | None = None,
        temperature: float = 0.2,
        max_tokens: int | None = None,
        response_format: dict[str, str] | None = None,
    ) -> str: ...


def _create_llm_service() -> Union["LLMProvider", Any]:
    """Create the LLM service based on the configured provider."""
    provider = settings.LLM_PROVIDER.lower()

    if provider == "anthropic":
        if not settings.ANTHROPIC_API_KEY:
            logger.warning(
                "LLM_PROVIDER is 'anthropic' but ANTHROPIC_API_KEY is not set. "
                "Falling back to OpenAI."
            )
            from app.services.openai_service import OpenAIService

            return OpenAIService()

        from app.services.anthropic_service import AnthropicService

        logger.info(f"Using Anthropic LLM provider (model: {settings.anthropic.model})")
        return AnthropicService()

    # Default to OpenAI
    from app.services.openai_service import OpenAIService

    logger.info(f"Using OpenAI LLM provider (model: {settings.openai.model})")
    return OpenAIService()


llm_service = _create_llm_service()
