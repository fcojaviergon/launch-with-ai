from sqlmodel import Field, SQLModel

class Message(SQLModel):
    message: str

class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=40)
