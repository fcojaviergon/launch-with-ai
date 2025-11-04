import uuid
from unittest.mock import MagicMock, patch

import pytest
from sqlmodel import Session

from app.modules.users.models import User
from app.modules.users.schemas import UserCreate, UserUpdate
from app.modules.users.service import user_service
from app.modules.users.repository import UserRepository


@pytest.fixture
def mock_session():
    return MagicMock(spec=Session)


@patch('app.modules.users.service.user_repository')
def test_get_user_by_id(mock_repository, mock_session):
    # Arrange
    user_id = uuid.uuid4()
    mock_user = User(
        id=user_id,
        email="test@example.com",
        hashed_password="hashed_password",
        is_active=True,
    )
    mock_repository.get.return_value = mock_user
    mock_session = MagicMock(spec=Session)
    
    # Act
    result = user_service.get_user_by_id(mock_session, user_id)
    
    # Assert
    assert result == mock_user
    mock_repository.get.assert_called_once_with(mock_session, user_id)


@patch('app.modules.users.service.user_repository')
def test_create_user(mock_repository, mock_session):
    # Arrange
    user_create = UserCreate(
        email="test@example.com",
        password="password123",
        full_name="Test User"
    )
    mock_user = User(
        id=uuid.uuid4(),
        email=user_create.email,
        hashed_password="hashed_password",
        full_name=user_create.full_name,
        is_active=True,
    )
    mock_repository.create_user.return_value = mock_user
    mock_session = MagicMock(spec=Session)
    
    # Act
    result = user_service.create_user(mock_session, user_create)
    
    # Assert
    assert result == mock_user
    mock_repository.create_user.assert_called_once_with(
        session=mock_session, user_create=user_create
    )


@patch('app.modules.users.service.user_repository')
def test_update_user(mock_repository, mock_session):
    # Arrange
    user_id = uuid.uuid4()
    db_user = User(
        id=user_id,
        email="test@example.com",
        hashed_password="hashed_password",
        is_active=True,
    )
    user_update = UserUpdate(full_name="Updated Name")
    updated_user = User(
        id=user_id,
        email="test@example.com",
        hashed_password="hashed_password",
        full_name="Updated Name",
        is_active=True,
    )
    mock_repository.update_user.return_value = updated_user
    mock_session = MagicMock(spec=Session)
    
    # Act
    result = user_service.update_user(mock_session, db_user, user_update)
    
    # Assert
    assert result == updated_user
    mock_repository.update_user.assert_called_once_with(
        session=mock_session, db_user=db_user, user_in=user_update
    )


@patch('app.modules.users.service.user_repository')
def test_authenticate_success(mock_repository, mock_session):
    # Arrange
    email = "test@example.com"
    password = "password123"
    mock_user = User(
        id=uuid.uuid4(),
        email=email,
        hashed_password="hashed_password",
        is_active=True,
    )
    # Configuramos el mock para authenticate directamente
    mock_repository.authenticate.return_value = mock_user
    
    # Act
    result = user_service.authenticate(mock_session, email, password)
    
    # Assert
    assert result == mock_user
    mock_repository.authenticate.assert_called_once_with(session=mock_session, email=email, password=password)


@patch('app.modules.users.service.user_repository')
def test_authenticate_failure(mock_repository, mock_session):
    # Arrange
    email = "test@example.com"
    password = "wrong_password"
    
    # Configuramos el mock para authenticate para que devuelva None (fallo de autenticación)
    mock_repository.authenticate.return_value = None
    
    # Act
    result = user_service.authenticate(mock_session, email, password)
    
    # Assert
    assert result is None
    mock_repository.authenticate.assert_called_once_with(session=mock_session, email=email, password=password)
