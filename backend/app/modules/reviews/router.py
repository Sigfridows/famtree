from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.api.dependencies import get_reviews
from app.core.contracts import Id
from app.modules.auth.dependencies import optional_identity, registered_user
from app.modules.reviews.schemas import (
    CreateReport,
    CreateReview,
    ReportInput,
    ReportView,
    ReviewInput,
    ReviewLikeView,
    ReviewQuery,
    ReviewUpdate,
    ReviewView,
)
from app.modules.reviews.service import ReviewService
from app.modules.users import UserProfile

router = APIRouter(tags=["Reviews"])
User = Annotated[UserProfile, Depends(registered_user)]
Viewer = Annotated[UserProfile | None, Depends(optional_identity)]
Service = Annotated[ReviewService, Depends(get_reviews)]


@router.get("/asylums/{asylum_id}/reviews")
async def reviews(
    asylum_id: Id,
    service: Service,
    viewer: Viewer,
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 100,
) -> list[ReviewView]:
    return await service.list_for_center(
        asylum_id, offset, limit, viewer.user_id if viewer else None
    )


@router.post(
    "/asylums/{asylum_id}/reviews",
    status_code=201,
    deprecated=True,
    description="Compatibility alias. Use POST /reviews with asylumId.",
)
async def create_for_center(
    asylum_id: Id, data: ReviewInput, user: User, service: Service
) -> ReviewView:
    return await service.create(user.user_id, asylum_id, data)


@router.post("/reviews", status_code=201)
async def create(data: CreateReview, user: User, service: Service) -> ReviewView:
    return await service.create(user.user_id, data.asylum_id, data)


@router.put(
    "/reviews/{review_id}",
    deprecated=True,
    description="Compatibility alias. Use PATCH /reviews/{review_id} for partial edits.",
)
@router.patch("/reviews/{review_id}")
async def update(review_id: Id, data: ReviewUpdate, user: User, service: Service) -> ReviewView:
    return await service.update(user.user_id, review_id, data)


@router.delete("/reviews/{review_id}", status_code=204)
async def delete(review_id: Id, user: User, service: Service) -> None:
    await service.delete(user.user_id, review_id)


@router.post(
    "/reviews/{review_id}/reports",
    status_code=201,
    deprecated=True,
    description="Compatibility alias. Use POST /reviews/reports with reviewId.",
)
async def report(review_id: Id, data: ReportInput, user: User, service: Service) -> ReportView:
    return await service.report(user.user_id, review_id, data)


@router.post("/reviews/reports", status_code=201)
async def report_payload(data: CreateReport, user: User, service: Service) -> ReportView:
    return await service.report(user.user_id, data.review_id, data)


@router.get("/asylums/{asylum_id}/reputation")
async def reputation(
    asylum_id: Id, service: Service, viewer: Viewer, filters: Annotated[ReviewQuery, Query()]
) -> dict[str, object]:
    return await service.reputation(asylum_id, filters, viewer.user_id if viewer else None)


@router.post("/reviews/{review_id}/like")
async def toggle_like(review_id: Id, user: User, service: Service) -> ReviewLikeView:
    return await service.toggle_like(user.user_id, review_id)
