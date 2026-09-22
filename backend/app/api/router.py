from fastapi import APIRouter

from app.modules.administration.router import router as administration_router
from app.modules.asylums import router as asylums_router
from app.modules.asylums.management_router import router as management_router
from app.modules.auth.router import router as auth_router
from app.modules.favorites.router import router as favorites_router
from app.modules.health.router import router as health_router
from app.modules.notifications.router import router as notifications_router
from app.modules.reports.router import router as reports_router
from app.modules.reviews.router import router as reviews_router
from app.modules.users.router import router as users_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(asylums_router)
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(favorites_router)
api_router.include_router(notifications_router)
api_router.include_router(reviews_router)
api_router.include_router(management_router)
api_router.include_router(administration_router)
api_router.include_router(reports_router)
