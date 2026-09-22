from typing import Annotated

from fastapi import APIRouter, Depends, Query, Response

from app.api.dependencies import get_reports
from app.modules.auth.dependencies import system_admin
from app.modules.reports.schemas import (
    ReportFilter,
    ReportMetrics,
    ReportTable,
    TableExport,
    TableFilter,
)
from app.modules.reports.service import ReportService
from app.modules.users import UserProfile

router = APIRouter(tags=["Reports"])
Service = Annotated[ReportService, Depends(get_reports)]
Admin = Annotated[UserProfile, Depends(system_admin)]


@router.get("/admin/dashboard")
async def metrics(
    service: Service, admin: Admin, filters: Annotated[ReportFilter, Query()]
) -> ReportMetrics:
    return await service.metrics(filters)


@router.post("/admin/reports/export")
async def export(filters: TableExport, service: Service, admin: Admin) -> Response:
    data, media_type, filename = await service.export(filters, admin.user_id)
    return Response(
        content=data,
        media_type=media_type,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "no-store",
        },
    )


@router.get("/admin/reports")
async def table(
    service: Service, admin: Admin, filters: Annotated[TableFilter, Query()]
) -> ReportTable:
    return await service.table(filters)
