from datetime import date
from typing import Literal, Self

from pydantic import Field, model_validator

from app.core.contracts import Contract, Id


class ReportFilter(Contract):
    start_date: date | None = None
    end_date: date | None = None
    asylum_id: Id | None = None
    province_id: Id | None = None

    @model_validator(mode="after")
    def date_range(self) -> Self:
        if self.start_date and self.end_date and self.start_date > self.end_date:
            raise ValueError("startDate must be before endDate")
        return self


class ExportReport(ReportFilter):
    format: Literal["csv", "pdf"] = "csv"


class ReportMetrics(Contract):
    centers: int = Field(ge=0)
    active_centers: int = Field(ge=0)
    total_capacity: int = Field(ge=0)
    registered_users: int = Field(ge=0)
    published_reviews: int = Field(ge=0)
    average_rating: float | None
    favorites: int = Field(ge=0)
    pending_reports: int = Field(ge=0)
    inactive_centers: int = 0
    active_users: int = 0
    blocked_users: int = 0
    center_administrators: int = 0
    centers_by_province: dict[str, int] = Field(default_factory=dict)
    rating_distribution: dict[str, int] = Field(default_factory=dict)
    user_registration_trend: dict[str, int] = Field(default_factory=dict)


class TableFilter(ReportFilter):
    report_type: Literal["centers", "users", "reviews"]
    status: Literal["ACTIVE", "INACTIVE", "BLOCKED", "PUBLISHED", "HIDDEN"] | None = None
    page: int = Field(default=1, ge=1, le=1000000)

    @model_validator(mode="after")
    def valid_status(self) -> Self:
        allowed = {
            "centers": {"ACTIVE", "INACTIVE"},
            "users": {"ACTIVE", "BLOCKED"},
            "reviews": {"PUBLISHED", "HIDDEN"},
        }
        if self.status and self.status not in allowed[self.report_type]:
            raise ValueError("Estado incompatible con el tipo de reporte")
        if self.province_id and self.report_type != "centers":
            raise ValueError("Provincia solo aplica a centros")
        return self


class TableExport(TableFilter):
    start_date: date
    end_date: date
    format: Literal["csv", "pdf"]


class ReportTable(Contract):
    rows: list[dict[str, object]]
    total: int
    page: int
    page_size: int = 20
