import asyncio
import csv
import io
from datetime import UTC, datetime
from html import escape
from pathlib import Path

from reportlab.lib import colors  # type: ignore[import-untyped]
from reportlab.lib.styles import getSampleStyleSheet  # type: ignore[import-untyped]
from reportlab.platypus import (  # type: ignore[import-untyped]
    Image,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from app.core.errors import AppError
from app.modules.reports.repository import ReportRepository
from app.modules.reports.schemas import (
    ReportFilter,
    ReportMetrics,
    ReportTable,
    TableExport,
    TableFilter,
)


class ReportService:
    def __init__(self, repository: ReportRepository) -> None:
        self.repository = repository

    async def metrics(self, filters: ReportFilter) -> ReportMetrics:
        return await self.repository.metrics(filters)

    async def table(self, filters: TableFilter) -> ReportTable:
        return await self.repository.table(filters)

    async def export(self, filters: TableExport, admin_id: int) -> tuple[bytes, str, str]:
        table = await self.repository.table(filters, export=True)
        if not table.total:
            raise AppError(
                code="empty_report",
                status_code=422,
                message=(
                    "No existen registros en el rango de fechas "
                    "seleccionado para generar el reporte"
                ),
            )
        now = datetime.now(UTC)
        filename = f"Reporte_{filters.report_type}_{now:%d%m%Y_%H%M}.{filters.format}"
        if filters.format == "csv":
            output = io.StringIO(newline="")
            writer = csv.writer(output)
            writer.writerow(table.rows[0].keys())
            for row in table.rows:
                writer.writerow([csv_cell(value) for value in row.values()])
            return output.getvalue().encode("utf-8-sig"), "text/csv", filename
        data = await asyncio.to_thread(render_pdf, table, filters, admin_id, now)
        return data, "application/pdf", filename


def csv_cell(value: object) -> str:
    result = str(value) if value is not None else ""
    if result.lstrip().startswith(("=", "+", "-", "@", "\t", "\r")):
        result = "'" + result
    return result


def render_pdf(table: ReportTable, filters: TableExport, admin_id: int, now: datetime) -> bytes:
    output = io.BytesIO()
    styles = getSampleStyleSheet()
    logo = Path(__file__).parent / "assets" / "logo-famtree.png"
    story = [
        Image(str(logo), width=80, height=80, kind="proportional"),
        Paragraph("FamTree", styles["Title"]),
        Paragraph(f"Reporte de {filters.report_type}", styles["Heading1"]),
        Paragraph(
            escape(
                f"{filters.start_date} a {filters.end_date}; "
                f"provincia: {filters.province_id}; estado: {filters.status}"
            ),
            styles["Normal"],
        ),
        Paragraph(f"Emisor: {admin_id}; generado: {now:%Y-%m-%d %H:%M UTC}", styles["Normal"]),
        Spacer(1, 12),
    ]
    body = [[Paragraph(escape(key), styles["Normal"]) for key in table.rows[0]]]
    body += [
        [Paragraph(escape(str(value or "")), styles["Normal"]) for value in row.values()]
        for row in table.rows
    ]
    grid = Table(body, repeatRows=1)
    grid.setStyle(
        TableStyle(
            [
                ("GRID", (0, 0), (-1, -1), 0.3, colors.grey),
                ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )
    story += [grid, Spacer(1, 12), Paragraph(f"Total: {table.total}", styles["Normal"])]
    SimpleDocTemplate(output, pagesize=(842, 595), leftMargin=25, rightMargin=25).build(story)
    return output.getvalue()
