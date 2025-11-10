import uuid
from typing import TYPE_CHECKING
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.projects.models import Project

class User(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)
    hashed_password: str
    items: list["Item"] = Relationship(back_populates="owner", cascade_delete=True, sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    projects: list["Project"] = Relationship(back_populates="user", cascade_delete=True, sa_relationship_kwargs={"cascade": "all, delete-orphan"})
   