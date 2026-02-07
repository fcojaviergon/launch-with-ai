import secrets
import warnings
from typing import Annotated, Any, Literal

from pydantic import (
    AnyUrl,
    BeforeValidator,
    EmailStr,
    HttpUrl,
    PostgresDsn,
    computed_field,
    model_validator,
)
from pydantic_core import MultiHostUrl
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing_extensions import Self


def parse_cors(v: Any) -> list[str] | str:
    if isinstance(v, str) and not v.startswith("["):
        return [i.strip() for i in v.split(",")]
    elif isinstance(v, list | str):
        return v
    raise ValueError(v)


class RedisSettings(BaseSettings):
    host: str = "redis"
    port: int = 6379
    db: int = 0
    
    @computed_field
    @property
    def url(self) -> str:
        return f"redis://{self.host}:{self.port}/{self.db}"


class ChatSettings(BaseSettings):
    model: str = ""  # Set dynamically based on LLM_PROVIDER
    max_tokens_per_message: int = 4000
    max_context_length: int = 128000
    max_documents_per_query: int = 15
    similarity_threshold: float = 0.7
    max_response_tokens: int = 4000


class OpenAISettings(BaseSettings):
    api_key: str
    model: str = "gpt-4o"
    embedding_model: str = "text-embedding-3-large"
    embedding_dimensions: int = 1536


class AnthropicSettings(BaseSettings):
    api_key: str = ""
    model: str = "claude-sonnet-4-20250514"


class VectorStoreSettings(BaseSettings):
    table_name: str = "document_embeddings"
    embedding_dimensions: int = 1536
    time_partition_interval: str = "1 month"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        # Use top level .env file (one level above ./backend/)
        # and .env.local for local development overrides
        env_file=("../.env", ".env.local"),
        env_ignore_empty=True,
        extra="ignore",
    )
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str  # Must be provided via environment variable
    # 60 minutes * 24 hours * 8 days = 8 days
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    FRONTEND_HOST: str = "http://localhost:5173"
    ENVIRONMENT: Literal["local", "staging", "production"] = "local"

    BACKEND_CORS_ORIGINS: Annotated[
        list[AnyUrl] | str, BeforeValidator(parse_cors)
    ] = []

    @computed_field  # type: ignore[prop-decorator]
    @property
    def all_cors_origins(self) -> list[str]:
        return [str(origin).rstrip("/") for origin in self.BACKEND_CORS_ORIGINS] + [
            self.FRONTEND_HOST
        ]

    PROJECT_NAME: str
    SENTRY_DSN: HttpUrl | None = None
    POSTGRES_SERVER: str
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str = ""
    POSTGRES_DB: str = ""

    @computed_field  # type: ignore[prop-decorator]
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> PostgresDsn:
        return MultiHostUrl.build(
            scheme="postgresql+psycopg",
            username=self.POSTGRES_USER,
            password=self.POSTGRES_PASSWORD,
            host=self.POSTGRES_SERVER,
            port=self.POSTGRES_PORT,
            path=self.POSTGRES_DB,
        )
    
    # Redis settings
    REDIS_HOST: str = "redis"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    
    @computed_field
    @property
    def redis(self) -> RedisSettings:
        return RedisSettings(
            host=self.REDIS_HOST,
            port=self.REDIS_PORT,
            db=self.REDIS_DB,
        )
    
    # Celery settings
    CELERY_BROKER_URL: str | None = None
    CELERY_RESULT_BACKEND: str | None = None
    
    @computed_field
    @property
    def celery_broker_url(self) -> str:
        if self.CELERY_BROKER_URL:
            return self.CELERY_BROKER_URL
        return self.redis.url
    
    @computed_field
    @property
    def celery_result_backend(self) -> str:
        if self.CELERY_RESULT_BACKEND:
            return self.CELERY_RESULT_BACKEND
        return self.redis.url
    
    # LLM provider selection: "openai" or "anthropic"
    LLM_PROVIDER: str = "openai"

    # OpenAI settings
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "gpt-4o-mini"
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-small"

    # Anthropic settings
    ANTHROPIC_API_KEY: str = ""
    ANTHROPIC_MODEL: str = "claude-sonnet-4-20250514"

    @computed_field
    @property
    def openai(self) -> OpenAISettings:
        return OpenAISettings(
            api_key=self.OPENAI_API_KEY,
            model=self.OPENAI_MODEL,
            embedding_model=self.OPENAI_EMBEDDING_MODEL,
        )

    @computed_field
    @property
    def anthropic(self) -> AnthropicSettings:
        return AnthropicSettings(
            api_key=self.ANTHROPIC_API_KEY,
            model=self.ANTHROPIC_MODEL,
        )
    
    @computed_field
    @property
    def vector_store(self) -> VectorStoreSettings:
        return VectorStoreSettings(
            embedding_dimensions=self.openai.embedding_dimensions,
        )
    
    # Optional override for the chat model (defaults to provider's model)
    CHAT_MODEL: str = ""

    @computed_field
    @property
    def chat(self) -> ChatSettings:
        # Use explicit CHAT_MODEL if set, otherwise derive from provider
        if self.CHAT_MODEL:
            model = self.CHAT_MODEL
        elif self.LLM_PROVIDER.lower() == "anthropic":
            model = self.ANTHROPIC_MODEL
        else:
            model = "gpt-4o"
        return ChatSettings(model=model)

    SMTP_TLS: bool = True
    SMTP_SSL: bool = False
    SMTP_PORT: int = 587
    SMTP_HOST: str | None = None
    SMTP_USER: str | None = None
    SMTP_PASSWORD: str | None = None
    EMAILS_FROM_EMAIL: EmailStr | None = None
    EMAILS_FROM_NAME: EmailStr | None = None

    @model_validator(mode="after")
    def _set_default_emails_from(self) -> Self:
        if not self.EMAILS_FROM_NAME:
            self.EMAILS_FROM_NAME = self.PROJECT_NAME
        return self

    EMAIL_RESET_TOKEN_EXPIRE_HOURS: int = 48

    @computed_field  # type: ignore[prop-decorator]
    @property
    def emails_enabled(self) -> bool:
        return bool(self.SMTP_HOST and self.EMAILS_FROM_EMAIL)

    EMAIL_TEST_USER: EmailStr = "test@example.com"
    FIRST_SUPERUSER: EmailStr
    FIRST_SUPERUSER_PASSWORD: str

    def _check_default_secret(self, var_name: str, value: str | None) -> None:
        if value == "changethis":
            message = (
                f'The value of {var_name} is "changethis", '
                "for security, please change it, at least for deployments."
            )
            if self.ENVIRONMENT == "local":
                warnings.warn(message, stacklevel=1)
            else:
                raise ValueError(message)

    @model_validator(mode="after")
    def _enforce_non_default_secrets(self) -> Self:
        self._check_default_secret("SECRET_KEY", self.SECRET_KEY)
        self._check_default_secret("POSTGRES_PASSWORD", self.POSTGRES_PASSWORD)
        self._check_default_secret(
            "FIRST_SUPERUSER_PASSWORD", self.FIRST_SUPERUSER_PASSWORD
        )
        if hasattr(self, "OPENAI_API_KEY") and self.OPENAI_API_KEY == "sk-changethis":
            if self.ENVIRONMENT == "local":
                warnings.warn("OPENAI_API_KEY is set to default value", stacklevel=1)
            else:
                raise ValueError("OPENAI_API_KEY must be set for non-local environments")

        if self.LLM_PROVIDER == "anthropic" and not self.ANTHROPIC_API_KEY:
            if self.ENVIRONMENT == "local":
                warnings.warn(
                    "ANTHROPIC_API_KEY is not set but LLM_PROVIDER is 'anthropic'",
                    stacklevel=1,
                )
            else:
                raise ValueError(
                    "ANTHROPIC_API_KEY must be set when LLM_PROVIDER is 'anthropic'"
                )

        return self


settings = Settings()  # type: ignore
