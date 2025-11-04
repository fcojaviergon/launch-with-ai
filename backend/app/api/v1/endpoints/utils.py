from fastapi import APIRouter, Depends
from pydantic.networks import EmailStr

from app.api.v1.dependencies import get_current_active_superuser
from app.common.schemas.message import Message
from app.common.utils.email import generate_test_email, send_email

router = APIRouter(prefix="/utils", tags=["utils"])


@router.post(
    "/test-email/",
    dependencies=[Depends(get_current_active_superuser)],
    status_code=201,
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


@router.get("/health-check/")
async def health_check() -> dict:
    return {
        "status": "healthy",
        "version": "1.0.1",
        "message": "GitHub Actions deployment validated! ✨",
        "deployment": "automated"
    }
