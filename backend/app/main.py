import structlog
from app.core.logger import setup_logging

setup_logging()
import sentry_sdk
from fastapi import FastAPI
from fastapi.routing import APIRoute
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from starlette.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router
from app.core.config import settings

logger = structlog.get_logger()


def custom_generate_unique_id(route: APIRoute) -> str:
    return f"{route.tags[0]}-{route.name}"


# Initialize Sentry for error tracking in non-local environments
if settings.ENVIRONMENT != "local":
    if settings.SENTRY_DSN:
        sentry_sdk.init(dsn=str(settings.SENTRY_DSN), enable_tracing=True)
        logger.info("Sentry initialized for error tracking")
    else:
        logger.warning(
            "SENTRY_DSN not configured - error tracking is disabled. "
            "Set SENTRY_DSN environment variable to enable error monitoring."
        )

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    generate_unique_id_function=custom_generate_unique_id,
)

# Rate limiting exception handler
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Set all CORS enabled origins
if settings.all_cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.all_cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "Accept"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)
