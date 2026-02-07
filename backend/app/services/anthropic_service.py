import json
import logging
from typing import Any

from fastapi import HTTPException

from app.core.config import settings

logger = logging.getLogger(__name__)

# OpenAI model prefixes that should trigger fallback to default Anthropic model
_OPENAI_MODEL_PREFIXES = ("gpt-", "o1-", "o3-", "text-", "davinci", "babbage", "ada")


def _resolve_model(requested: str | None, default: str) -> str:
    """Return the requested model, falling back to default if it looks like an OpenAI model."""
    if not requested:
        return default
    if any(requested.lower().startswith(prefix) for prefix in _OPENAI_MODEL_PREFIXES):
        logger.warning(
            f"Model '{requested}' looks like an OpenAI model. "
            f"Falling back to Anthropic default: {default}"
        )
        return default
    return requested


class AnthropicService:
    """Service for interacting with Anthropic Claude APIs."""

    def __init__(self) -> None:
        """Initialize the Anthropic service with API key from settings."""
        from anthropic import Anthropic, AsyncAnthropic

        self.client = Anthropic(api_key=settings.anthropic.api_key)
        self.async_client = AsyncAnthropic(api_key=settings.anthropic.api_key)
        self.model = settings.anthropic.model

    def create_completion(
        self,
        system_prompt: str,
        user_prompt: str,
        model: str | None = None,
        temperature: float = 0.2,
        max_tokens: int | None = None,
        response_format: dict[str, str] | None = None,
    ) -> str:
        """
        Generate a completion using the Anthropic Claude model.

        Args:
            system_prompt: The system prompt that defines the assistant's behavior.
            user_prompt: The user prompt or question.
            model: Optional specific model to use, defaults to the one in settings.
            temperature: Temperature for the completion (0.0 to 1.0).
            max_tokens: Maximum number of tokens to generate.
            response_format: Optional response format hint (used for JSON prompting).

        Returns:
            The generated text response.
        """
        from anthropic import APIError, APITimeoutError, RateLimitError

        selected_model = _resolve_model(model, self.model)

        # If JSON format requested, add instruction to system prompt
        effective_system = system_prompt
        if response_format and response_format.get("type") == "json_object":
            effective_system = (
                f"{system_prompt}\n\n"
                "IMPORTANT: You must respond with valid JSON only. "
                "Do not include any text before or after the JSON object."
            )

        try:
            response = self.client.messages.create(
                model=selected_model,
                max_tokens=max_tokens or 4096,
                temperature=temperature,
                system=effective_system,
                messages=[{"role": "user", "content": user_prompt}],
            )
            return response.content[0].text
        except RateLimitError as e:
            logger.warning(f"Anthropic rate limit exceeded: {e!s}")
            raise HTTPException(
                status_code=429,
                detail="AI service rate limit exceeded. Please try again later.",
            )
        except APITimeoutError as e:
            logger.error(f"Anthropic API timeout: {e!s}")
            raise HTTPException(
                status_code=504, detail="AI service timeout. Please try again."
            )
        except APIError as e:
            logger.error(f"Anthropic API error: {e!s}")
            raise HTTPException(status_code=503, detail="AI service unavailable")
        except Exception:
            logger.exception("Unexpected error creating Anthropic completion")
            raise HTTPException(status_code=500, detail="Internal server error")

    def create_json_completion(
        self,
        system_prompt: str,
        user_prompt: str,
        model: str | None = None,
        temperature: float = 0.2,
        max_tokens: int | None = None,
    ) -> dict[str, Any]:
        """
        Generate a completion and parse it as JSON.

        Args:
            system_prompt: The system prompt that defines the assistant's behavior.
            user_prompt: The user prompt or question.
            model: Optional specific model to use.
            temperature: Temperature for the completion (0.0 to 1.0).
            max_tokens: Maximum number of tokens to generate.

        Returns:
            The generated response parsed as a Python dictionary.
        """
        response = self.create_completion(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
            response_format={"type": "json_object"},
        )

        try:
            return json.loads(response)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e!s}")
            logger.debug(f"Raw response: {response}")
            raise ValueError(f"Failed to parse AI response as JSON: {e!s}")

    def create_completion_sync(
        self,
        system_prompt: str,
        user_prompt: str,
        model: str | None = None,
        temperature: float = 0.2,
        max_tokens: int | None = None,
        response_format: dict[str, str] | None = None,
    ) -> str:
        """Synchronous version of create_completion for Celery tasks."""
        return self.create_completion(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
            response_format=response_format,
        )

    def create_json_completion_sync(
        self,
        system_prompt: str,
        user_prompt: str,
        model: str | None = None,
        temperature: float = 0.2,
        max_tokens: int | None = None,
    ) -> dict[str, Any]:
        """Synchronous version of create_json_completion for Celery tasks."""
        return self.create_json_completion(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
        )

    async def create_chat_completion(
        self,
        messages: list[dict[str, str]],
        model: str | None = None,
        temperature: float = 0.2,
        max_tokens: int | None = None,
        response_format: dict[str, str] | None = None,
    ) -> str:
        """
        Generate a chat completion using the Anthropic Claude model asynchronously.

        Anthropic uses a separate `system` parameter instead of a system message
        in the messages list. This method extracts system messages and passes them
        separately.

        Args:
            messages: List of message dicts with 'role' and 'content'.
            model: Optional specific model to use.
            temperature: Temperature for the completion (0.0 to 1.0).
            max_tokens: Maximum number of tokens to generate.
            response_format: Optional response format hint.

        Returns:
            The generated text response.
        """
        from anthropic import APIError, APITimeoutError, RateLimitError

        selected_model = _resolve_model(model, self.model)

        # Extract system messages and convert to Anthropic format
        system_parts = []
        anthropic_messages = []
        for msg in messages:
            if msg["role"] == "system":
                system_parts.append(msg["content"])
            else:
                anthropic_messages.append(
                    {"role": msg["role"], "content": msg["content"]}
                )

        system_text = "\n\n".join(system_parts) if system_parts else ""

        # Add JSON instruction if requested
        if response_format and response_format.get("type") == "json_object":
            json_instruction = (
                "IMPORTANT: You must respond with valid JSON only. "
                "Do not include any text before or after the JSON object."
            )
            system_text = (
                f"{system_text}\n\n{json_instruction}"
                if system_text
                else json_instruction
            )

        try:
            params: dict[str, Any] = {
                "model": selected_model,
                "max_tokens": max_tokens or 4096,
                "temperature": temperature,
                "messages": anthropic_messages,
            }

            if system_text:
                params["system"] = system_text

            response = await self.async_client.messages.create(**params)
            return response.content[0].text
        except RateLimitError as e:
            logger.warning(f"Anthropic rate limit exceeded: {e!s}")
            raise HTTPException(
                status_code=429,
                detail="AI service rate limit exceeded. Please try again later.",
            )
        except APITimeoutError as e:
            logger.error(f"Anthropic API timeout: {e!s}")
            raise HTTPException(
                status_code=504, detail="AI service timeout. Please try again."
            )
        except APIError as e:
            logger.error(f"Anthropic API error: {e!s}")
            raise HTTPException(status_code=503, detail="AI service unavailable")
        except Exception:
            logger.exception("Unexpected error creating Anthropic chat completion")
            raise HTTPException(status_code=500, detail="Internal server error")
