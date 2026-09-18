from fastapi import APIRouter

from app.modules.asylums import router as asylums_router
from app.modules.health.router import router as health_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(asylums_router)
