import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.modules.users.schemas import UserCreate
from app.modules.users.service import user_service
from app.tests.utils.utils import random_email, random_lower_string


def test_user_registration_login_update_workflow(client: TestClient, db: Session):
    """
    Tests the complete workflow of registration, login, and user update.
    """
    # 1. Register a new user
    email = random_email()
    password = random_lower_string()
    
    registration_data = {
        "email": email,
        "password": password,
        "full_name": "Test User"
    }
    
    response = client.post(
        f"{settings.API_V1_STR}/users/signup",
        json=registration_data
    )
    
    assert response.status_code == 200
    user_data = response.json()
    assert user_data["email"] == email
    assert user_data["full_name"] == "Test User"
    assert "id" in user_data
    user_id = user_data["id"]
    
    # 2. Log in with the registered user
    login_data = {
        "username": email,
        "password": password
    }
    
    response = client.post(
        f"{settings.API_V1_STR}/login/access-token",
        data=login_data
    )
    
    assert response.status_code == 200
    token_data = response.json()
    assert "access_token" in token_data
    access_token = token_data["access_token"]
    
    # 3. Get user data with the token
    headers = {"Authorization": f"Bearer {access_token}"}
    
    response = client.get(
        f"{settings.API_V1_STR}/users/me",
        headers=headers
    )
    
    assert response.status_code == 200
    user_data = response.json()
    assert user_data["email"] == email
    assert user_data["full_name"] == "Test User"
    
    # 4. Update user data
    update_data = {
        "full_name": "Updated User Name"
    }
    
    response = client.patch(
        f"{settings.API_V1_STR}/users/me",
        headers=headers,
        json=update_data
    )
    
    assert response.status_code == 200
    updated_user = response.json()
    assert updated_user["full_name"] == "Updated User Name"
    
    # 5. Verify that changes were saved to the database
    db_user = user_service.get_user_by_id(db, user_id)
    assert db_user is not None
    assert db_user.full_name == "Updated User Name"


def test_user_item_workflow(client: TestClient, db: Session):
    """
    Tests the complete workflow of a user creating, updating, and deleting items.
    """
    # 1. Create a user
    email = random_email()
    password = random_lower_string()
    
    user_in = UserCreate(email=email, password=password)
    user = user_service.create_user(db, user_in)
    
    # 2. Log in
    login_data = {
        "username": email,
        "password": password
    }
    
    response = client.post(
        f"{settings.API_V1_STR}/login/access-token",
        data=login_data
    )
    
    token_data = response.json()
    access_token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {access_token}"}
    
    # 3. Create an item
    item_data = {
        "title": "Test Item",
        "description": "This is a test item"
    }
    
    response = client.post(
        f"{settings.API_V1_STR}/items/",
        headers=headers,
        json=item_data
    )
    
    assert response.status_code == 200
    item = response.json()
    assert item["title"] == "Test Item"
    assert item["description"] == "This is a test item"
    assert item["owner_id"] == str(user.id)
    item_id = item["id"]
    
    # 4. Get the created item
    response = client.get(
        f"{settings.API_V1_STR}/items/{item_id}",
        headers=headers
    )
    
    assert response.status_code == 200
    item = response.json()
    assert item["title"] == "Test Item"
    
    # 5. Update the item
    update_data = {
        "title": "Updated Item Title"
    }
    
    response = client.put(
        f"{settings.API_V1_STR}/items/{item_id}",
        headers=headers,
        json=update_data
    )
    
    assert response.status_code == 200
    updated_item = response.json()
    assert updated_item["title"] == "Updated Item Title"
    assert updated_item["description"] == "This is a test item"  # Should not change
    
    # 6. Delete the item
    response = client.delete(
        f"{settings.API_V1_STR}/items/{item_id}",
        headers=headers
    )
    
    assert response.status_code == 200
    
    # 7. Verify that the item was deleted
    response = client.get(
        f"{settings.API_V1_STR}/items/{item_id}",
        headers=headers
    )
    
    assert response.status_code == 404
