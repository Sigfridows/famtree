from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.api.dependencies import get_notifications
from app.core.contracts import Id
from app.modules.auth.dependencies import registered_user
from app.modules.notifications.schemas import NotificationView, Preferences, PreferenceUpdate
from app.modules.notifications.service import NotificationService
from app.modules.users import UserProfile

router = APIRouter(tags=["Notifications"])
User = Annotated[UserProfile, Depends(registered_user)]
Service = Annotated[NotificationService, Depends(get_notifications)]


@router.get("/notifications")
async def notifications(
    user: User,
    service: Service,
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 100,
) -> list[NotificationView]:
    return await service.list_for_user(user.user_id, offset, limit)


@router.get("/notifications/unread-count")
async def unread(user: User, service: Service) -> dict[str, int]:
    return {"count": await service.unread(user.user_id)}


@router.patch("/notifications/read-all", status_code=204)
async def read_all(user: User, service: Service) -> None:
    await service.read(user.user_id)


@router.patch("/notifications/{notification_id}/read", status_code=204)
async def read_one(notification_id: Id, user: User, service: Service) -> None:
    await service.read(user.user_id, notification_id)


@router.get("/notification-preferences")
@router.get("/notifications/preferences")
async def preferences(user: User, service: Service) -> Preferences:
    return await service.preferences(user.user_id)


@router.patch("/notification-preferences")
@router.patch("/notifications/preferences")
async def update_preferences(data: PreferenceUpdate, user: User, service: Service) -> Preferences:
    return await service.update_preferences(user.user_id, data)
