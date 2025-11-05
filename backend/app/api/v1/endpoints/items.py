import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.v1.dependencies import CurrentUser, SessionDep
from app.modules.items.models import Item
from app.modules.items.schemas import ItemCreate, ItemPublic, ItemsPublic, ItemUpdate
from app.modules.items.service import item_service
from app.common.schemas.message import Message

router = APIRouter(prefix="/items", tags=["items"])


@router.get("/", response_model=ItemsPublic)
def read_items(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve items.
    """
    if current_user.is_superuser:
        items = item_service.get_items(session, skip=skip, limit=limit)
    else:
        items = item_service.get_items_by_owner(
            session, owner_id=current_user.id, skip=skip, limit=limit
        )
    
    count = len(items)
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


@router.post("/", response_model=ItemPublic)
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
