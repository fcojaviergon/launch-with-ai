from fastapi import APIRouter

from app.api.v1.endpoints import users, items, login, utils, chat
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(utils.router)
api_router.include_router(items.router)
api_router.include_router(chat.router)


# Incluir endpoints privados solo en entorno local
if settings.ENVIRONMENT == "local":
    from app.api.v1.endpoints import private
    api_router.include_router(private.router)
