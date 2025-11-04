import uuid
from unittest.mock import MagicMock, patch

import pytest
from sqlmodel import Session

from app.modules.items.models import Item
from app.modules.items.schemas import ItemCreate, ItemUpdate
from app.modules.items.service import item_service
from app.modules.items.repository import ItemRepository


@pytest.fixture
def mock_item_repository():
    return MagicMock(spec=ItemRepository)

@pytest.fixture
def mock_session():
    return MagicMock(spec=Session)


@patch('app.modules.items.service.item_repository')
def test_create_item(mock_repository, mock_session):
    # Arrange
    owner_id = uuid.uuid4()
    item_create = ItemCreate(
        title="Test Item",
        description="Test Description"
    )
    mock_item = Item(
        id=uuid.uuid4(),
        title=item_create.title,
        description=item_create.description,
        owner_id=owner_id
    )
    mock_repository.create_item.return_value = mock_item
    mock_session = MagicMock(spec=Session)
    
    # Act
    result = item_service.create_item(mock_session, item_create, owner_id)
    
    # Assert
    assert result == mock_item
    mock_repository.create_item.assert_called_once_with(
        session=mock_session, item_in=item_create, owner_id=owner_id
    )


@patch('app.modules.items.service.item_repository')
def test_get_item(mock_repository, mock_session):
    # Arrange
    item_id = uuid.uuid4()
    mock_item = Item(
        id=item_id,
        title="Test Item",
        description="Test Description",
        owner_id=uuid.uuid4()
    )
    mock_repository.get.return_value = mock_item
    mock_session = MagicMock(spec=Session)
    
    # Act
    result = item_service.get_item(mock_session, item_id)
    
    # Assert
    assert result == mock_item
    mock_repository.get.assert_called_once_with(mock_session, item_id)


@patch('app.modules.items.service.item_repository')
def test_get_items(mock_repository, mock_session):
    # Arrange
    mock_items = [
        Item(id=uuid.uuid4(), title="Item 1", owner_id=uuid.uuid4()),
        Item(id=uuid.uuid4(), title="Item 2", owner_id=uuid.uuid4())
    ]
    mock_repository.get_multi.return_value = mock_items
    mock_session = MagicMock(spec=Session)
    
    # Act
    result = item_service.get_items(mock_session, skip=0, limit=10)
    
    # Assert
    assert result == mock_items
    mock_repository.get_multi.assert_called_once_with(mock_session, skip=0, limit=10)


@patch('app.modules.items.service.item_repository')
def test_get_items_by_owner(mock_repository, mock_session):
    # Arrange
    owner_id = uuid.uuid4()
    mock_items = [
        Item(id=uuid.uuid4(), title="Item 1", owner_id=owner_id),
        Item(id=uuid.uuid4(), title="Item 2", owner_id=owner_id)
    ]
    mock_repository.get_items_by_owner.return_value = mock_items
    mock_session = MagicMock(spec=Session)
    
    # Act
    result = item_service.get_items_by_owner(mock_session, owner_id, skip=0, limit=10)
    
    # Assert
    assert result == mock_items
    mock_repository.get_items_by_owner.assert_called_once_with(
        mock_session, owner_id=owner_id, skip=0, limit=10
    )


@patch('app.modules.items.service.item_repository')
def test_update_item(mock_repository, mock_session):
    # Arrange
    item_id = uuid.uuid4()
    db_item = Item(
        id=item_id,
        title="Original Title",
        description="Original Description",
        owner_id=uuid.uuid4()
    )
    item_update = ItemUpdate(title="Updated Title")
    updated_item = Item(
        id=item_id,
        title="Updated Title",
        description="Original Description",
        owner_id=db_item.owner_id
    )
    mock_repository.update.return_value = updated_item
    mock_session = MagicMock(spec=Session)
    
    # Act
    result = item_service.update_item(mock_session, db_item, item_update)
    
    # Assert
    assert result == updated_item
    mock_repository.update.assert_called_once_with(
        mock_session, db_obj=db_item, obj_in=item_update
    )


@patch('app.modules.items.service.item_repository')
def test_delete_item(mock_repository, mock_session):
    # Arrange
    item_id = uuid.uuid4()
    mock_item = Item(
        id=item_id,
        title="Test Item",
        description="Test Description",
        owner_id=uuid.uuid4()
    )
    mock_repository.remove.return_value = mock_item
    mock_session = MagicMock(spec=Session)
    
    # Act
    result = item_service.delete_item(mock_session, item_id)
    
    # Assert
    assert result == mock_item
    mock_repository.remove.assert_called_once_with(mock_session, id=item_id)


@patch('app.modules.items.service.item_repository')
def test_delete_items_by_owner(mock_repository, mock_session):
    # Arrange
    owner_id = uuid.uuid4()
    mock_repository.delete_items_by_owner.return_value = None
    mock_session = MagicMock(spec=Session)
    
    # Act
    item_service.delete_items_by_owner(mock_session, owner_id)
    
    # Assert
    mock_repository.delete_items_by_owner.assert_called_once_with(
        mock_session, owner_id=owner_id
    )
