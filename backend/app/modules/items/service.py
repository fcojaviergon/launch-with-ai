import uuid
from typing import Optional, List
from sqlmodel import Session

from app.modules.items.models import Item
from app.modules.items.schemas import ItemCreate, ItemUpdate
from app.modules.items.repository import item_repository


class ItemService:
    def create_item(self, session: Session, item_in: ItemCreate, owner_id: uuid.UUID) -> Item:
        return item_repository.create_item(session=session, item_in=item_in, owner_id=owner_id)
    
    def get_item(self, session: Session, item_id: uuid.UUID) -> Optional[Item]:
        return item_repository.get(session, item_id)
    
    def get_items(self, session: Session, skip: int = 0, limit: int = 100) -> List[Item]:
        return item_repository.get_multi(session, skip=skip, limit=limit)
    
    def get_items_by_owner(self, session: Session, owner_id: uuid.UUID, skip: int = 0, limit: int = 100) -> List[Item]:
        return item_repository.get_items_by_owner(session, owner_id=owner_id, skip=skip, limit=limit)
    
    def update_item(self, session: Session, db_item: Item, item_in: ItemUpdate) -> Item:
        return item_repository.update(session, db_obj=db_item, obj_in=item_in)
    
    def delete_item(self, session: Session, item_id: uuid.UUID) -> Optional[Item]:
        return item_repository.remove(session, id=item_id)
    
    def delete_items_by_owner(self, session: Session, owner_id: uuid.UUID) -> None:
        item_repository.delete_items_by_owner(session, owner_id=owner_id)


item_service = ItemService()
