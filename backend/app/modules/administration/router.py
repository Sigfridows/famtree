from typing import Annotated

from fastapi import APIRouter, Depends, Query, Response

from app.api.dependencies import get_administration, get_notifications, get_reviews, get_users
from app.core.contracts import Id
from app.core.pagination import AdminQuery
from app.modules.administration.schemas import BlockUser, CreateCenterAdmin, TemporaryAccount
from app.modules.administration.service import AdministrationService
from app.modules.auth.dependencies import system_admin
from app.modules.notifications import NotificationService
from app.modules.reviews.schemas import ModerateReport, ReportQuery, ReportView
from app.modules.reviews.service import ReviewService
from app.modules.users import UserDirectory, UserProfile

router = APIRouter(tags=["Administration"])
Admin = Annotated[UserProfile, Depends(system_admin)]
Service = Annotated[AdministrationService, Depends(get_administration)]
Reviews = Annotated[ReviewService, Depends(get_reviews)]


@router.get("/users", include_in_schema=False)
async def users(
    admin: Admin,
    directory: Annotated[UserDirectory, Depends(get_users)],
    offset: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
) -> list[UserProfile]:
    return await directory.list_users(offset, limit)


@router.get("/admin/users/{user_id}")
@router.get("/users/{user_id}", include_in_schema=False)
async def user(
    user_id: Id, admin: Admin, directory: Annotated[UserDirectory, Depends(get_users)]
) -> UserProfile:
    return await directory.get(user_id)


@router.patch("/admin/users/{user_id}/block", status_code=204)
async def block(user_id: Id, data: BlockUser, admin: Admin, service: Service) -> Response:
    await service.block(user_id, admin.user_id, data.reason)
    return Response(status_code=204)


@router.patch("/admin/users/{user_id}/unblock", status_code=204)
async def unblock(user_id: Id, admin: Admin, service: Service) -> Response:
    await service.unblock(user_id, admin.user_id)
    return Response(status_code=204)


@router.post("/admin/asylum-admins", status_code=201)
async def create_admin(
    data: CreateCenterAdmin, admin: Admin, service: Service, response: Response
) -> TemporaryAccount:
    response.headers["Cache-Control"] = "no-store"
    return await service.create_admin(data)


@router.get("/admin/review-reports")
async def reports(
    admin: Admin, service: Reviews, filters: Annotated[ReportQuery, Query()]
) -> dict[str, object]:
    return await service.report_cases(filters)


@router.get("/admin/moderation-decisions")
async def decisions(
    admin: Admin,
    service: Reviews,
    offset: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
) -> list[ReportView]:
    return await service.decisions(offset, limit)


@router.patch("/admin/review-reports/{report_id}/moderate")
async def moderate(
    report_id: Id,
    data: ModerateReport,
    admin: Admin,
    service: Reviews,
    notifications: Annotated[NotificationService, Depends(get_notifications)],
) -> ReportView:
    return await service.moderate(report_id, admin.user_id, data, notifications)


@router.get("/admin/users")
async def filtered_users(
    admin: Admin,
    directory: Annotated[UserDirectory, Depends(get_users)],
    filters: Annotated[AdminQuery, Query()],
) -> dict[str, object]:
    return await directory.filtered(filters)


@router.get("/admin/users/{user_id}/blocks")
async def block_history(user_id: Id, admin: Admin, service: Service) -> list[dict[str, object]]:
    return await service.history(user_id)
