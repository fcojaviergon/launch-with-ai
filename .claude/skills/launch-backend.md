---
name: launch-backend
description: >
  Backend development for Launch With AI using FastAPI with module-based
  architecture, SQLModel ORM, and permission-based RBAC. Use when creating
  new backend modules, models, schemas, repositories, services, or API
  endpoints. Triggers on tasks like "add a new module", "create an endpoint",
  "add a model", or any Python/FastAPI work in the backend/ directory.
---

# Launch Backend Development Skill

Backend development for Launch With AI using FastAPI with module-based architecture, SQLModel ORM, and permission-based RBAC.

---

## Quick Reference

| Aspect | Value |
|--------|-------|
| **Framework** | FastAPI (Python 3.10+) |
| **ORM** | SQLModel (SQLAlchemy + Pydantic) |
| **Database** | PostgreSQL (TimescaleDB) |
| **Auth** | JWT + bcrypt |
| **Migrations** | Alembic |
| **Task Queue** | Celery + Redis |
| **Linting** | Ruff + MyPy |
| **Vector Search** | TimescaleDB + pgvector (already configured) |

## IMPORTANT - Don't Reinvent the Wheel

- **DO NOT create custom embedding tables** — use TimescaleDB with pgvector which is already configured
- **DO NOT implement custom vector search** — use `app/services/vector_store/`
- Before creating search/embeddings functionality, review what already exists in the project

## Module Structure

```
backend/app/modules/[module]/
├── models.py       # SQLModel database models
├── schemas.py      # Pydantic API schemas
├── repository.py   # Database operations (extends BaseCRUD)
├── service.py      # Business logic
└── __init__.py
```

## API Structure

```
backend/app/api/v1/
├── endpoints/
│   ├── [module].py    # Route handlers
│   └── ...
├── router.py          # Combines all routers
└── deps.py            # Dependencies (auth, db session)
```

## Commands

```bash
# Development
cd backend
fastapi dev app/main.py          # Dev server with hot reload

# Testing
./scripts/test.sh                 # Run tests with coverage

# Linting
./scripts/lint.sh                 # Run mypy + ruff
ruff format app                   # Format code

# Migrations
alembic revision --autogenerate -m "description"  # Create migration
alembic upgrade head                               # Apply migrations
alembic downgrade -1                               # Rollback one
```

## Key Dependencies

```python
from app.api.deps import CurrentUser, SessionDep  # Auth + DB
from app.common.crud.base import BaseCRUD         # Generic CRUD
from app.common.schemas.message import Message     # Standard response
```

---

## Checklists

### Adding a New Module

1. [ ] Create folder: `app/modules/[module]/`
2. [ ] Create `models.py` with SQLModel tables
3. [ ] Create `schemas.py` with Pydantic schemas (Base, Create, Update, Public)
4. [ ] Create `repository.py` extending `BaseCRUD`
5. [ ] Create `service.py` with business logic
6. [ ] Create `app/api/v1/endpoints/[module].py` with routes
7. [ ] Register router in `app/api/v1/router.py`
8. [ ] Create migration: `alembic revision --autogenerate -m "add [module]"`
9. [ ] Run `./scripts/generate-types.sh` to update frontend types

### Adding a New Endpoint

1. [ ] Add schema in `schemas.py` if new request/response shape
2. [ ] Add repository method if new DB operation
3. [ ] Add service method with business logic
4. [ ] Add route in `endpoints/[module].py` with:
   - [ ] `response_model` specified
   - [ ] Proper `status_code` (201 for POST create)
   - [ ] Authorization check if needed
5. [ ] Add tests in `tests/api/test_[module]_api.py`

---

## Extended Examples

### Example: Creating a New Module (tags)

**Step 1: Model**
```python
# app/modules/tags/models.py
import uuid
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship


class Tag(SQLModel, table=True):
    """Database model for tags."""

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(max_length=50, unique=True, index=True)
    color: str = Field(max_length=7, default="#6366f1")  # Hex color
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship to user who created it
    created_by_id: uuid.UUID = Field(foreign_key="user.id", ondelete="CASCADE")
    created_by: "User" = Relationship(back_populates="tags")
```

**Step 2: Schemas**
```python
# app/modules/tags/schemas.py
import uuid
from datetime import datetime
from pydantic import BaseModel, Field


class TagBase(BaseModel):
    """Shared properties."""
    name: str = Field(min_length=1, max_length=50)
    color: str = Field(default="#6366f1", pattern=r"^#[0-9a-fA-F]{6}$")


class TagCreate(TagBase):
    """Properties to receive on creation."""
    pass


class TagUpdate(BaseModel):
    """Properties to receive on update."""
    name: str | None = Field(default=None, min_length=1, max_length=50)
    color: str | None = Field(default=None, pattern=r"^#[0-9a-fA-F]{6}$")


class TagPublic(TagBase):
    """Properties to return via API."""
    id: uuid.UUID
    created_by_id: uuid.UUID
    created_at: datetime


class TagsPublic(BaseModel):
    """List response with count."""
    data: list[TagPublic]
    count: int
```

**Step 3: Repository**
```python
# app/modules/tags/repository.py
import uuid
from sqlmodel import Session, select

from app.common.crud.base import BaseCRUD
from .models import Tag
from .schemas import TagCreate, TagUpdate


class TagRepository(BaseCRUD[Tag, TagCreate, TagUpdate]):
    """Repository for Tag model."""

    def __init__(self):
        super().__init__(Tag)

    def get_by_name(self, session: Session, name: str) -> Tag | None:
        """Get tag by name."""
        statement = select(Tag).where(Tag.name == name)
        return session.exec(statement).first()

    def get_by_user(
        self, session: Session, user_id: uuid.UUID, skip: int = 0, limit: int = 100
    ) -> list[Tag]:
        """Get tags created by a specific user."""
        statement = (
            select(Tag)
            .where(Tag.created_by_id == user_id)
            .offset(skip)
            .limit(limit)
        )
        return list(session.exec(statement).all())


tag_repository = TagRepository()
```

**Step 4: Service**
```python
# app/modules/tags/service.py
import uuid
from sqlmodel import Session, func, select

from app.modules.users.models import User
from .models import Tag
from .repository import tag_repository
from .schemas import TagCreate, TagUpdate, TagsPublic


class TagService:
    """Business logic for tags."""

    def get_tags(
        self, session: Session, user: User, skip: int = 0, limit: int = 100
    ) -> TagsPublic:
        """Get all tags (admin) or user's tags."""
        if user.is_superuser:
            tags = tag_repository.get_multi(session, skip=skip, limit=limit)
            count = session.exec(select(func.count(Tag.id))).one()
        else:
            tags = tag_repository.get_by_user(session, user.id, skip, limit)
            count = len(tags)

        return TagsPublic(data=tags, count=count)

    def create_tag(
        self, session: Session, user: User, tag_in: TagCreate
    ) -> Tag:
        """Create a new tag."""
        tag = Tag(
            **tag_in.model_dump(),
            created_by_id=user.id
        )
        session.add(tag)
        session.commit()
        session.refresh(tag)
        return tag

    def update_tag(
        self, session: Session, tag: Tag, tag_in: TagUpdate
    ) -> Tag:
        """Update an existing tag."""
        update_data = tag_in.model_dump(exclude_unset=True)
        tag.sqlmodel_update(update_data)
        session.add(tag)
        session.commit()
        session.refresh(tag)
        return tag

    def delete_tag(self, session: Session, tag: Tag) -> bool:
        """Delete a tag."""
        session.delete(tag)
        session.commit()
        return True


tag_service = TagService()
```

**Step 5: Endpoints**
```python
# app/api/v1/endpoints/tags.py
import uuid
from typing import Any

from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, SessionDep
from app.common.schemas.message import Message
from app.modules.tags.models import Tag
from app.modules.tags.schemas import (
    TagCreate,
    TagPublic,
    TagsPublic,
    TagUpdate,
)
from app.modules.tags.service import tag_service
from app.modules.tags.repository import tag_repository

router = APIRouter(prefix="/tags", tags=["tags"])


@router.get("/", response_model=TagsPublic)
def read_tags(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """Retrieve tags."""
    return tag_service.get_tags(session, current_user, skip, limit)


@router.post("/", response_model=TagPublic, status_code=201)
def create_tag(
    session: SessionDep,
    current_user: CurrentUser,
    tag_in: TagCreate,
) -> Any:
    """Create a new tag."""
    # Check if name already exists
    existing = tag_repository.get_by_name(session, tag_in.name)
    if existing:
        raise HTTPException(status_code=400, detail="Tag name already exists")

    return tag_service.create_tag(session, current_user, tag_in)


@router.get("/{tag_id}", response_model=TagPublic)
def read_tag(
    session: SessionDep,
    current_user: CurrentUser,
    tag_id: uuid.UUID,
) -> Any:
    """Get a specific tag."""
    tag = tag_repository.get(session, id=tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")

    # Authorization: owner or superuser
    if tag.created_by_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not authorized")

    return tag


@router.patch("/{tag_id}", response_model=TagPublic)
def update_tag(
    session: SessionDep,
    current_user: CurrentUser,
    tag_id: uuid.UUID,
    tag_in: TagUpdate,
) -> Any:
    """Update a tag."""
    tag = tag_repository.get(session, id=tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")

    # Authorization
    if tag.created_by_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not authorized")

    return tag_service.update_tag(session, tag, tag_in)


@router.delete("/{tag_id}", response_model=Message)
def delete_tag(
    session: SessionDep,
    current_user: CurrentUser,
    tag_id: uuid.UUID,
) -> Any:
    """Delete a tag."""
    tag = tag_repository.get(session, id=tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")

    # Authorization
    if tag.created_by_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not authorized")

    tag_service.delete_tag(session, tag)
    return Message(message="Tag deleted successfully")
```

**Step 6: Register Router**
```python
# app/api/v1/router.py
from app.api.v1.endpoints import tags  # Add import

api_router = APIRouter()
# ... existing routes ...
api_router.include_router(tags.router)  # Add this line
```

---

### Example: Authorization Pattern

```python
# Standard authorization check for resource ownership
def check_authorization(resource, current_user: User) -> None:
    """Raise 403 if user doesn't own resource and isn't superuser."""
    if resource.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to access this resource"
        )

# Usage in endpoint
@router.delete("/{id}", response_model=Message)
def delete_item(
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
) -> Any:
    item = item_repository.get(session, id=id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    check_authorization(item, current_user)

    item_service.delete(session, item)
    return Message(message="Item deleted successfully")
```

---

### Example: Alembic Migration

After creating models, generate migration:

```bash
cd backend
alembic revision --autogenerate -m "add tags module"
```

Review generated migration in `app/alembic/versions/`:

```python
# Example migration file
def upgrade() -> None:
    op.create_table(
        'tag',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(50), nullable=False),
        sa.Column('color', sa.String(7), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('created_by_id', sa.UUID(), nullable=False),
        sa.ForeignKeyConstraint(['created_by_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_tag_name', 'tag', ['name'], unique=True)


def downgrade() -> None:
    op.drop_index('ix_tag_name', table_name='tag')
    op.drop_table('tag')
```

Apply migration:
```bash
alembic upgrade head
```

---

## Common Patterns

### Standard Response for Delete
```python
from app.common.schemas.message import Message

@router.delete("/{id}", response_model=Message)
def delete_resource(...) -> Any:
    # ... delete logic ...
    return Message(message="Resource deleted successfully")
```

### Pagination Pattern
```python
@router.get("/", response_model=ResourcesPublic)
def list_resources(
    session: SessionDep,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    resources = repository.get_multi(session, skip=skip, limit=limit)
    count = session.exec(select(func.count(Model.id))).one()
    return ResourcesPublic(data=resources, count=count)
```

### Error Handling
```python
from fastapi import HTTPException

# 404 - Not Found
raise HTTPException(status_code=404, detail="Resource not found")

# 403 - Forbidden
raise HTTPException(status_code=403, detail="Not authorized")

# 400 - Bad Request
raise HTTPException(status_code=400, detail="Invalid input")

# 409 - Conflict
raise HTTPException(status_code=409, detail="Resource already exists")
```

### Transactional Operations
```python
def complex_operation(session: Session, ...) -> Result:
    try:
        # Multiple DB operations
        entity1 = repository1.create(session, ...)
        entity2 = repository2.create(session, ...)

        session.commit()  # Single atomic commit
        return Result(entity1=entity1, entity2=entity2)
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))
```
