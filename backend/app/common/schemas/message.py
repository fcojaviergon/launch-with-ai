from pydantic import field_validator
from sqlmodel import Field, SQLModel

from app.modules.users.schemas import validate_password_strength


class Message(SQLModel):
    message: str

class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=40)

    @field_validator("new_password")
    @classmethod
    def password_complexity(cls, v: str) -> str:
        return validate_password_strength(v)
