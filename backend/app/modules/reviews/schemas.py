from datetime import datetime
from typing import Literal

from pydantic import Field

from app.core.contracts import Contract, Id


class ReviewInput(Contract):
    rating: int = Field(ge=1, le=5, strict=True)
    comment: str = Field(min_length=10, max_length=500)


class CreateReview(ReviewInput):
    asylum_id: Id


class ReviewUpdate(Contract):
    rating: int | None = Field(default=None, ge=1, le=5, strict=True)
    comment: str | None = Field(default=None, min_length=10, max_length=500)


class ReviewView(Contract):
    review_id: int
    user_id: int
    asylum_id: int
    rating: int
    comment: str
    status: str
    created_at: datetime
    updated_at: datetime | None
    author: dict[str, object] | None = None


class ReportInput(Contract):
    reason: Literal["OFFENSIVE_LANGUAGE", "FALSE_INFO", "SPAM", "CONFLICT_OF_INTEREST", "OTHER"]
    detail: str | None = Field(default=None, max_length=250)


class CreateReport(ReportInput):
    review_id: Id


class ReportView(Contract):
    report_id: int
    review_id: int
    reporter_user_id: int
    moderator_user_id: int | None
    reason: str
    detail: str | None
    justification: str | None
    status: str
    created_at: datetime
    resolved_at: datetime | None


class ModerateReport(Contract):
    status: Literal["DISCARDED", "REVIEW_REMOVED"]
    justification: str = Field(min_length=10, max_length=300)


class ReviewQuery(Contract):
    page: int = Field(default=1, ge=1, le=1000000)
    rating: int | None = Field(default=None, ge=1, le=5)
    q: str | None = Field(default=None, max_length=100)
    sort: Literal["newest", "oldest", "rating_desc", "rating_asc"] = "newest"


class ReportQuery(Contract):
    page: int = Field(default=1, ge=1, le=1000000)
    status: Literal["PENDING", "DISCARDED", "REVIEW_REMOVED", "ALL"] = "PENDING"
    reason: (
        Literal["OFFENSIVE_LANGUAGE", "FALSE_INFO", "SPAM", "CONFLICT_OF_INTEREST", "OTHER"] | None
    ) = None
    q: str | None = Field(default=None, max_length=100)
