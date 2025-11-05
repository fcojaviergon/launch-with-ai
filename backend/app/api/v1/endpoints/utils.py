from fastapi import APIRouter, Depends
from pydantic import BaseModel
from pydantic.networks import EmailStr

from app.api.v1.dependencies import get_current_active_superuser
from app.common.schemas.message import Message
from app.common.utils.email import generate_test_email, send_email


class HealthCheck(BaseModel):
    """Health check response schema."""
    status: str
    version: str
    message: str
    deployment: str

router = APIRouter(prefix="/utils", tags=["utils"])


@router.post(
    "/test-email/",
    dependencies=[Depends(get_current_active_superuser)],
    status_code=201,
    response_model=Message,
)
def test_email(email_to: EmailStr) -> Message:
    """
    Test emails.
    """
    email_data = generate_test_email(email_to=email_to)
    send_email(
        email_to=email_to,
        subject=email_data.subject,
        html_content=email_data.html_content,
    )
    return Message(message="Test email sent")


@router.get("/health-check/", response_model=HealthCheck)
async def health_check() -> HealthCheck:
    return HealthCheck(
        status="healthy",
        version="1.0.1",
        message="GitHub Actions deployment validated! ✨",
        deployment="automated"
    )
