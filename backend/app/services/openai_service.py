import json
import logging
from typing import Any, Dict, List, Optional, Union

from app.core.config import settings
from openai import AsyncOpenAI, OpenAI

logger = logging.getLogger(__name__)


class OpenAIService:
    """Service for interacting with OpenAI APIs"""

    def __init__(self):
        """Initialize the OpenAI service with API key from settings"""
        self.client = OpenAI(api_key=settings.openai.api_key)
        self.async_client = AsyncOpenAI(api_key=settings.openai.api_key)
        self.model = settings.openai.model
        self.embedding_model = settings.openai.embedding_model

    def get_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for the given text using OpenAI's embedding model.

        Args:
            text: The input text to generate an embedding for.

        Returns:
            A list of floats representing the embedding vector.
        """
        text = text.replace("\n", " ")
        try:
            embedding = (
                self.client.embeddings.create(
                    input=[text],
                    model=self.embedding_model,
                )
                .data[0]
                .embedding
            )
            return embedding
        except Exception as e:
            logger.error(f"Error generating embedding: {str(e)}")
            raise

    def create_completion(
        self,
        system_prompt: str,
        user_prompt: str,
        model: Optional[str] = None,
        temperature: float = 0.2,
        max_tokens: Optional[int] = None,
        response_format: Optional[Dict[str, str]] = None,
    ) -> str:
        """
        Generate a completion using the OpenAI chat model.

        Args:
            system_prompt: The system prompt that defines the assistant's behavior.
            user_prompt: The user prompt or question.
            model: Optional specific model to use, defaults to the one in settings.
            temperature: Temperature for the completion (0.0 to 1.0).
            max_tokens: Maximum number of tokens to generate.
            response_format: Optional response format, e.g. {"type": "json_object"}.

        Returns:
            The generated text response.
        """
        selected_model = model or self.model
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]

        try:
            params = {
                "model": selected_model,
                "messages": messages,
                "temperature": temperature,
            }
            
            if max_tokens is not None:
                params["max_tokens"] = max_tokens
                
            if response_format is not None:
                params["response_format"] = response_format
                
            response = self.client.chat.completions.create(**params)
            return response.choices[0].message.content or ""
        except Exception as e:
            logger.error(f"Error creating completion: {str(e)}")
            raise

    def create_json_completion(
        self,
        system_prompt: str,
        user_prompt: str,
        model: Optional[str] = None,
        temperature: float = 0.2,
        max_tokens: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Generate a completion and parse it as JSON.

        Args:
            system_prompt: The system prompt that defines the assistant's behavior.
            user_prompt: The user prompt or question.
            model: Optional specific model to use, defaults to the one in settings.
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
            logger.error(f"Failed to parse JSON response: {str(e)}")
            logger.debug(f"Raw response: {response}")
            raise ValueError(f"Failed to parse AI response as JSON: {str(e)}")

    # Synchronous methods specifically for Celery tasks
    def get_embedding_sync(self, text: str) -> List[float]:
        """
        Synchronous version of get_embedding specifically for Celery tasks.
        
        Args:
            text: The input text to generate an embedding for.
            
        Returns:
            A list of floats representing the embedding vector.
        """
        return self.get_embedding(text)
    
    def create_completion_sync(
        self,
        system_prompt: str,
        user_prompt: str,
        model: Optional[str] = None,
        temperature: float = 0.2,
        max_tokens: Optional[int] = None,
        response_format: Optional[Dict[str, str]] = None,
    ) -> str:
        """
        Synchronous version of create_completion specifically for Celery tasks.
        
        Args:
            system_prompt: The system prompt that defines the assistant's behavior.
            user_prompt: The user prompt or question.
            model: Optional specific model to use, defaults to the one in settings.
            temperature: Temperature for the completion (0.0 to 1.0).
            max_tokens: Maximum number of tokens to generate.
            response_format: Optional response format, e.g. {"type": "json_object"}.
            
        Returns:
            The generated text response.
        """
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
        model: Optional[str] = None,
        temperature: float = 0.2,
        max_tokens: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Synchronous version of create_json_completion specifically for Celery tasks.
        
        Args:
            system_prompt: The system prompt that defines the assistant's behavior.
            user_prompt: The user prompt or question.
            model: Optional specific model to use, defaults to the one in settings.
            temperature: Temperature for the completion (0.0 to 1.0).
            max_tokens: Maximum number of tokens to generate.
            
        Returns:
            The generated response parsed as a Python dictionary.
        """
        return self.create_json_completion(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
        )

    async def create_chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.2,
        max_tokens: Optional[int] = None,
        response_format: Optional[Dict[str, str]] = None,
    ) -> str:
        """
        Generate a chat completion using the OpenAI chat model asynchronously.

        Args:
            messages: List of message dictionaries with 'role' and 'content'.
            model: Optional specific model to use, defaults to the one in settings.
            temperature: Temperature for the completion (0.0 to 1.0).
            max_tokens: Maximum number of tokens to generate.
            response_format: Optional response format, e.g. {"type": "json_object"}.

        Returns:
            The generated text response.
        """
        selected_model = model or self.model

        try:
            params = {
                "model": selected_model,
                "messages": messages,
                "temperature": temperature,
            }
            
            if max_tokens is not None:
                params["max_tokens"] = max_tokens
                
            if response_format is not None:
                params["response_format"] = response_format
                
            response = await self.async_client.chat.completions.create(**params)
            return response.choices[0].message.content or ""
        except Exception as e:
            logger.error(f"Error creating chat completion: {str(e)}")
            raise


# Create a singleton instance
openai_service = OpenAIService() 