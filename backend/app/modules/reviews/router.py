from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.api.dependencies import get_reviews
from app.core.contracts import Id
from app.modules.auth.dependencies import registered_user
from app.modules.reviews.schemas import (
    CreateReport,
    CreateReview,
    ReportInput,
    ReportView,
    ReviewInput,
    ReviewQuery,
    ReviewUpdate,
    ReviewView,
)
from app.modules.reviews.service import ReviewService
from app.modules.users import UserProfile

router = APIRouter(tags=["Reviews"])
User = Annotated[UserProfile, Depends(registered_user)]
Service = Annotated[ReviewService, Depends(get_reviews)]


@router.get("/asylums/{asylum_id}/reviews")
async def reviews(
    asylum_id: Id,
    service: Service,
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 100,
) -> list[ReviewView]:
    return await service.list_for_center(asylum_id, offset, limit)


@router.post("/asylums/{asylum_id}/reviews", status_code=201)
async def create_for_center(
    asylum_id: Id, data: ReviewInput, user: User, service: Service
) -> ReviewView:
    return await service.create(user.user_id, asylum_id, data)


@router.post("/reviews", status_code=201)
async def create(data: CreateReview, user: User, service: Service) -> ReviewView:
    return await service.create(user.user_id, data.asylum_id, data)


@router.put("/reviews/{review_id}")
@router.patch("/reviews/{review_id}")
async def update(review_id: Id, data: ReviewUpdate, user: User, service: Service) -> ReviewView:
    return await service.update(user.user_id, review_id, data)


@router.delete("/reviews/{review_id}", status_code=204)
async def delete(review_id: Id, user: User, service: Service) -> None:
    await service.delete(user.user_id, review_id)


@router.post("/reviews/{review_id}/reports", status_code=201)
async def report(review_id: Id, data: ReportInput, user: User, service: Service) -> ReportView:
    return await service.report(user.user_id, review_id, data)


@router.post("/reviews/reports", status_code=201)
async def report_payload(data: CreateReport, user: User, service: Service) -> ReportView:
    return await service.report(user.user_id, data.review_id, data)


@router.get("/asylums/{asylum_id}/reputation")
async def reputation(
    asylum_id: Id, service: Service, filters: Annotated[ReviewQuery, Query()]
) -> dict[str, object]:
    return await service.reputation(asylum_id, filters)
