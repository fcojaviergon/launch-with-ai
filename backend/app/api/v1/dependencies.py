from collections.abc import Generator
from typing import Annotated, Optional

import jwt
from fastapi import Cookie, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from pydantic import ValidationError
from sqlmodel import Session

from app.core import security
from app.core.config import settings
from app.core.db import engine
from app.common.schemas.token import TokenPayload
from app.modules.users.models import User


# Cookie name for access token
COOKIE_NAME = "access_token"

# OAuth2 scheme for backward compatibility (Authorization header)
reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/login/access-token",
    auto_error=False,  # Don't auto-error, we'll check cookie as fallback
)


def get_db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_db)]


def get_token_from_cookie_or_header(
    request: Request,
    authorization_token: Optional[str] = Depends(reusable_oauth2),
) -> str:
    """
    Extract token from httpOnly cookie (preferred) or Authorization header (fallback).

    Priority:
    1. httpOnly cookie (more secure, XSS-immune)
    2. Authorization header (backward compatibility)
    """
    # Try cookie first (more secure)
    cookie_token = request.cookies.get(COOKIE_NAME)
    if cookie_token:
        return cookie_token

    # Fallback to Authorization header for backward compatibility
    if authorization_token:
        return authorization_token

    # No token found
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )


TokenDep = Annotated[str, Depends(get_token_from_cookie_or_header)]


def get_current_user(session: SessionDep, token: TokenDep) -> User:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (InvalidTokenError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    user = session.get(User, token_data.sub)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def get_current_active_superuser(current_user: CurrentUser) -> User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="The user doesn't have enough privileges"
        )
    return current_user
