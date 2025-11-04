import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.modules.users.schemas import UserCreate
from app.modules.users.service import user_service
from app.tests.utils.utils import random_email, random_lower_string


def test_user_registration_login_update_workflow(client: TestClient, db: Session):
    """
    Prueba el flujo completo de registro, inicio de sesión y actualización de usuario.
    """
    # 1. Registrar un nuevo usuario
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
    
    # 2. Iniciar sesión con el usuario registrado
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
    
    # 3. Obtener datos del usuario con el token
    headers = {"Authorization": f"Bearer {access_token}"}
    
    response = client.get(
        f"{settings.API_V1_STR}/users/me",
        headers=headers
    )
    
    assert response.status_code == 200
    user_data = response.json()
    assert user_data["email"] == email
    assert user_data["full_name"] == "Test User"
    
    # 4. Actualizar datos del usuario
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
    
    # 5. Verificar que los cambios se guardaron en la base de datos
    db_user = user_service.get_user_by_id(db, user_id)
    assert db_user is not None
    assert db_user.full_name == "Updated User Name"


def test_user_item_workflow(client: TestClient, db: Session):
    """
    Prueba el flujo completo de un usuario creando, actualizando y eliminando items.
    """
    # 1. Crear un usuario
    email = random_email()
    password = random_lower_string()
    
    user_in = UserCreate(email=email, password=password)
    user = user_service.create_user(db, user_in)
    
    # 2. Iniciar sesión
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
    
    # 3. Crear un item
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
    
    # 4. Obtener el item creado
    response = client.get(
        f"{settings.API_V1_STR}/items/{item_id}",
        headers=headers
    )
    
    assert response.status_code == 200
    item = response.json()
    assert item["title"] == "Test Item"
    
    # 5. Actualizar el item
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
    assert updated_item["description"] == "This is a test item"  # No debería cambiar
    
    # 6. Eliminar el item
    response = client.delete(
        f"{settings.API_V1_STR}/items/{item_id}",
        headers=headers
    )
    
    assert response.status_code == 200
    
    # 7. Verificar que el item fue eliminado
    response = client.get(
        f"{settings.API_V1_STR}/items/{item_id}",
        headers=headers
    )
    
    assert response.status_code == 404
