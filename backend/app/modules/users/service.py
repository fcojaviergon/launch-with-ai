from typing import Optional, List
from sqlmodel import Session
from uuid import UUID

from app.modules.users.models import User
from app.modules.users.schemas import UserCreate, UserUpdate, UserUpdateMe, UpdatePassword
from app.modules.users.repository import user_repository
from app.core.security import get_password_hash, verify_password


class UserService:
    def get_user_by_id(self, session: Session, user_id: UUID) -> Optional[User]:
        return user_repository.get(session, user_id)
    
    def get_user_by_email(self, session: Session, email: str) -> Optional[User]:
        return user_repository.get_user_by_email(session=session, email=email)
    
    def get_users(self, session: Session, skip: int = 0, limit: int = 100) -> List[User]:
        return user_repository.get_multi(session, skip=skip, limit=limit)
    
    def create_user(self, session: Session, user_create: UserCreate) -> User:
        return user_repository.create_user(session=session, user_create=user_create)
    
    def update_user(self, session: Session, db_user: User, user_in: UserUpdate) -> User:
        return user_repository.update_user(session=session, db_user=db_user, user_in=user_in)
    
    def update_user_me(self, session: Session, current_user: User, user_in: UserUpdateMe) -> User:
        user_data = user_in.model_dump(exclude_unset=True)
        current_user.sqlmodel_update(user_data)
        session.add(current_user)
        session.commit()
        session.refresh(current_user)
        return current_user
    
    def update_password(self, session: Session, current_user: User, password_data: UpdatePassword) -> bool:
        if not verify_password(password_data.current_password, current_user.hashed_password):
            return False
        
        hashed_password = get_password_hash(password_data.new_password)
        current_user.hashed_password = hashed_password
        session.add(current_user)
        session.commit()
        return True
    
    def delete_user(self, session: Session, user_id: UUID) -> Optional[User]:
        return user_repository.remove(session, id=user_id)
    
    def authenticate(self, session: Session, email: str, password: str) -> Optional[User]:
        return user_repository.authenticate(session=session, email=email, password=password)


user_service = UserService()
