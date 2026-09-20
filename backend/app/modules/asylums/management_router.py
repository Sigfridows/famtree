from typing import Annotated

from fastapi import APIRouter, Depends, Query, Response, UploadFile

from app.api.dependencies import get_center_management, get_images, get_reviews
from app.core.contracts import Id
from app.core.media import ImageStore
from app.core.pagination import AdminQuery
from app.modules.asylums.management_schemas import (
    AsylumCreate,
    AsylumUpdate,
    CenterUpdate,
    ManagedAsylum,
    ManagedImage,
)
from app.modules.asylums.management_service import CenterService
from app.modules.auth.dependencies import center_admin, system_admin
from app.modules.reviews.schemas import ReviewQuery
from app.modules.reviews.service import ReviewService
from app.modules.users.schemas import UserProfile

router = APIRouter(tags=["Center management"])
Service = Annotated[CenterService, Depends(get_center_management)]
Admin = Annotated[UserProfile, Depends(system_admin)]
Assigned = Annotated[UserProfile, Depends(center_admin)]


@router.get("/admin/asylums")
async def centers(
    service: Service, admin: Admin, filters: Annotated[AdminQuery, Query()]
) -> dict[str, object]:
    return await service.filtered(filters)


@router.post("/admin/asylums", status_code=201)
@router.post("/asylums", status_code=201, include_in_schema=False)
async def create(data: AsylumCreate, service: Service, admin: Admin) -> ManagedAsylum:
    return await service.create(data)


@router.get("/admin/asylums/{asylum_id}")
async def detail(asylum_id: Id, service: Service, admin: Admin) -> ManagedAsylum:
    return await service.get(asylum_id)


@router.patch("/admin/asylums/{asylum_id}")
@router.put("/asylums/{asylum_id}", include_in_schema=False)
async def update(
    asylum_id: Id, data: AsylumUpdate, service: Service, admin: Admin
) -> ManagedAsylum:
    return await service.update(asylum_id, data)


@router.patch("/admin/asylums/{asylum_id}/activate")
async def activate(asylum_id: Id, service: Service, admin: Admin) -> ManagedAsylum:
    return await service.set_status(asylum_id, True)


@router.patch("/admin/asylums/{asylum_id}/deactivate")
async def deactivate(asylum_id: Id, service: Service, admin: Admin) -> ManagedAsylum:
    return await service.set_status(asylum_id, False)


@router.get("/center")
async def assigned_detail(service: Service, user: Assigned) -> ManagedAsylum:
    return await service.get(user.assigned_asylum_id or 0)


@router.patch("/center")
async def assigned_update(data: CenterUpdate, service: Service, user: Assigned) -> ManagedAsylum:
    return await service.update(user.assigned_asylum_id or 0, data, actor_id=user.user_id)


@router.get("/center/images")
async def images(service: Service, user: Assigned) -> list[ManagedImage]:
    return await service.images(user.assigned_asylum_id or 0)


@router.post("/center/images", status_code=201)
async def add_image(
    file: UploadFile,
    service: Service,
    user: Assigned,
    images: Annotated[ImageStore, Depends(get_images)],
) -> ManagedImage:
    data = await file.read(5 * 1024 * 1024 + 1)
    url = await images.save(data)
    try:
        return await service.attach_image(user.assigned_asylum_id or 0, url, actor_id=user.user_id)
    except Exception:
        await images.delete(url)
        raise


@router.patch("/center/images/{image_id}/cover")
async def cover(image_id: Id, service: Service, user: Assigned) -> list[ManagedImage]:
    return await service.cover(user.assigned_asylum_id or 0, image_id, actor_id=user.user_id)


@router.delete("/center/images/{image_id}", status_code=204)
async def remove_image(
    image_id: Id,
    service: Service,
    user: Assigned,
    images: Annotated[ImageStore, Depends(get_images)],
) -> Response:
    url = await service.remove_image(user.assigned_asylum_id or 0, image_id, actor_id=user.user_id)
    await images.delete(url)
    return Response(status_code=204)


@router.get("/center/reviews")
async def center_reviews(
    user: Assigned,
    service: Annotated[ReviewService, Depends(get_reviews)],
    filters: Annotated[ReviewQuery, Query()],
) -> dict[str, object]:
    return await service.reputation(user.assigned_asylum_id or 0, filters)
