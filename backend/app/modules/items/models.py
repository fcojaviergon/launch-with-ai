import uuid
from sqlmodel import Field, Relationship, SQLModel

class Item(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str = Field(max_length=255)
    description: str | None = Field(default=None, max_length=255)
    owner_id: uuid.UUID = Field(foreign_key="user.id", ondelete="CASCADE")        
    owner: "User" = Relationship(back_populates="items")