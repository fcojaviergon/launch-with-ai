import uuid

from sqlmodel import Session, delete, func, or_, select

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

    def get_items_by_owner(self, session: Session, owner_id: uuid.UUID, skip: int = 0, limit: int = 100) -> list[Item]:
        statement = select(Item).where(Item.owner_id == owner_id).offset(skip).limit(limit)
        return session.exec(statement).all()

    def search_items(
        self, session: Session, *, skip: int = 0, limit: int = 100, search: str | None = None, owner_id: uuid.UUID | None = None
    ) -> tuple[list[Item], int]:
        """Search items with optional text filter. Returns (items, total_count)."""
        statement = select(Item)
        count_statement = select(func.count()).select_from(Item)

        if owner_id is not None:
            statement = statement.where(Item.owner_id == owner_id)
            count_statement = count_statement.where(Item.owner_id == owner_id)

        if search:
            search_filter = or_(
                Item.title.icontains(search),
                Item.description.icontains(search),
            )
            statement = statement.where(search_filter)
            count_statement = count_statement.where(search_filter)

        count = session.exec(count_statement).one()
        items = session.exec(statement.offset(skip).limit(limit)).all()
        return items, count

    def delete_items_by_owner(self, session: Session, owner_id: uuid.UUID) -> None:
        statement = delete(Item).where(Item.owner_id == owner_id)
        session.exec(statement)
        session.commit()


item_repository = ItemRepository()
