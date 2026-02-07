import uuid
from typing import Any

from fastapi import APIRouter, HTTPException, Query

from app.api.v1.dependencies import CurrentUser, SessionDep
from app.common.schemas.message import Message
from app.modules.items.schemas import ItemCreate, ItemPublic, ItemsPublic, ItemUpdate
from app.modules.items.service import item_service

router = APIRouter(prefix="/items", tags=["items"])


@router.get("/", response_model=ItemsPublic)
def read_items(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
    search: str | None = Query(default=None, max_length=255, description="Search items by title or description"),
) -> Any:
    """
    Retrieve items with optional search filter.
    """
    owner_id = None if current_user.is_superuser else current_user.id
    items, count = item_service.search_items(
        session, skip=skip, limit=limit, search=search, owner_id=owner_id
    )
    return ItemsPublic(data=items, count=count)


@router.get("/{id}", response_model=ItemPublic)
def read_item(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    """
    Get item by ID.
    """
    item = item_service.get_item(session, item_id=id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    if not current_user.is_superuser and (item.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")

    return item


@router.post("/", response_model=ItemPublic, status_code=201)
def create_item(
    *, session: SessionDep, current_user: CurrentUser, item_in: ItemCreate
) -> Any:
    """
    Create new item.
    """
    return item_service.create_item(
        session=session, item_in=item_in, owner_id=current_user.id
    )


@router.put("/{id}", response_model=ItemPublic)
def update_item(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    item_in: ItemUpdate,
) -> Any:
    """
    Update an item.
    """
    item = item_service.get_item(session, item_id=id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    if not current_user.is_superuser and (item.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")

    return item_service.update_item(session, db_item=item, item_in=item_in)


@router.delete("/{id}", response_model=Message)
def delete_item(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """
    Delete an item.
    """
    item = item_service.get_item(session, item_id=id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    if not current_user.is_superuser and (item.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")

    item_service.delete_item(session, item_id=id)
    return Message(message="Item deleted successfully")
