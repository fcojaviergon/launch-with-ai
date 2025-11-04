import uuid
from typing import Optional, List
from sqlmodel import Session, select, delete

from app.core.base_crud import BaseCRUD
from app.modules.items.models import Item
from app.modules.items.schemas import ItemCreate, ItemUpdate


class ItemRepository(BaseCRUD[Item, ItemCreate, ItemUpdate]):
    def __init__(self):
        super().__init__(Item)
    
    def create_item(self, session: Session, *, item_in: ItemCreate, owner_id: uuid.UUID) -> Item:
        db_item = Item.model_validate(item_in, update={"owner_id": owner_id})
        session.add(db_item)
        session.commit()
        session.refresh(db_item)
        return db_item
    
    def get_items_by_owner(self, session: Session, owner_id: uuid.UUID, skip: int = 0, limit: int = 100) -> List[Item]:
        statement = select(Item).where(Item.owner_id == owner_id).offset(skip).limit(limit)
        return session.exec(statement).all()
    
    def delete_items_by_owner(self, session: Session, owner_id: uuid.UUID) -> None:
        statement = delete(Item).where(Item.owner_id == owner_id)
        session.exec(statement)
        session.commit()


item_repository = ItemRepository()
