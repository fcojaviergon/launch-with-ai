import uuid
from unittest.mock import MagicMock, patch

import pytest
from sqlmodel import Session, SQLModel, Field
from sqlmodel.sql.expression import Select

from app.core.base_crud import BaseCRUD


# Test model
class TestModel(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str
    description: str | None = None


# Test schemas
class TestModelCreate(SQLModel):
    name: str
    description: str | None = None


class TestModelUpdate(SQLModel):
    name: str | None = None
    description: str | None = None


class TestCRUD(BaseCRUD[TestModel, TestModelCreate, TestModelUpdate]):
    def __init__(self):
        super().__init__(TestModel)


@pytest.fixture
def test_crud():
    return TestCRUD()


@pytest.fixture
def mock_session():
    return MagicMock(spec=Session)


def test_get(test_crud, mock_session):
    # Arrange
    item_id = uuid.uuid4()
    mock_item = TestModel(id=item_id, name="Test Item")
    mock_session.get.return_value = mock_item
    
    # Act
    result = test_crud.get(mock_session, item_id)
    
    # Assert
    assert result == mock_item
    mock_session.get.assert_called_once_with(TestModel, item_id)


def test_get_multi(test_crud, mock_session):
    # Arrange
    mock_items = [
        TestModel(id=uuid.uuid4(), name="Item 1"),
        TestModel(id=uuid.uuid4(), name="Item 2")
    ]
    mock_exec = MagicMock()
    mock_exec.all.return_value = mock_items
    mock_session.exec.return_value = mock_exec
    
    # Act
    result = test_crud.get_multi(mock_session, skip=0, limit=10)
    
    # Assert
    assert result == mock_items
    mock_session.exec.assert_called_once()
    # Verify that select was called with correct parameters
    statement_call = mock_session.exec.call_args[0][0]
    assert statement_call is not None


def test_create(test_crud, mock_session):
    # Arrange
    item_create = TestModelCreate(name="New Item", description="Description")
    mock_item = TestModel(id=uuid.uuid4(), name="New Item", description="Description")
    
    # Simulate add and refresh behavior
    def side_effect(obj):
        obj.id = uuid.uuid4()
        return None
    
    mock_session.add.side_effect = side_effect
    
    # Act
    result = test_crud.create(mock_session, obj_in=item_create)
    
    # Assert
    assert isinstance(result, TestModel)
    assert result.name == item_create.name
    assert result.description == item_create.description
    mock_session.add.assert_called_once()
    mock_session.commit.assert_called_once()
    mock_session.refresh.assert_called_once()


def test_update(test_crud, mock_session):
    # Arrange
    item_id = uuid.uuid4()
    db_obj = TestModel(id=item_id, name="Original Name", description="Original Description")
    update_data = TestModelUpdate(name="Updated Name")
    
    # Act
    result = test_crud.update(mock_session, db_obj=db_obj, obj_in=update_data)
    
    # Assert
    assert result.name == "Updated Name"
    assert result.description == "Original Description"  # Should not change
    mock_session.add.assert_called_once_with(db_obj)
    mock_session.commit.assert_called_once()
    mock_session.refresh.assert_called_once()


def test_update_with_dict(test_crud, mock_session):
    # Arrange
    item_id = uuid.uuid4()
    db_obj = TestModel(id=item_id, name="Original Name", description="Original Description")
    update_data = {"name": "Updated Name"}
    
    # Act
    result = test_crud.update(mock_session, db_obj=db_obj, obj_in=update_data)
    
    # Assert
    assert result.name == "Updated Name"
    assert result.description == "Original Description"  # Should not change
    mock_session.add.assert_called_once_with(db_obj)
    mock_session.commit.assert_called_once()
    mock_session.refresh.assert_called_once()


def test_remove(test_crud, mock_session):
    # Arrange
    item_id = uuid.uuid4()
    mock_item = TestModel(id=item_id, name="Test Item")
    mock_session.get.return_value = mock_item
    
    # Act
    result = test_crud.remove(mock_session, id=item_id)
    
    # Assert
    assert result == mock_item
    mock_session.get.assert_called_once_with(TestModel, item_id)
    mock_session.delete.assert_called_once_with(mock_item)
    mock_session.commit.assert_called_once()
