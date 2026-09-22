from datetime import UTC, datetime
from typing import Any

from sqlalchemy import func, or_, select, update
from sqlalchemy.sql.elements import ColumnElement

from app.core.errors import AppError
from app.core.pagination import literal_pattern
from app.db.types import EstadoReporte, EstadoResena, MotivoReporte
from app.modules.asylums.access import CenterAccess
from app.modules.notifications import NotificationService
from app.modules.reviews.models import ModerationDecision, ReporteResena, Resena
from app.modules.reviews.repository import ReviewRepository
from app.modules.reviews.schemas import (
    ModerateReport,
    ReportInput,
    ReportQuery,
    ReportView,
    ReviewInput,
    ReviewQuery,
    ReviewUpdate,
    ReviewView,
)
from app.modules.users import UserDirectory

REASONS = {
    "OFFENSIVE_LANGUAGE": MotivoReporte.LENGUAJE_OFENSIVO,
    "FALSE_INFO": MotivoReporte.INFO_FALSA,
    "SPAM": MotivoReporte.SPAM,
    "CONFLICT_OF_INTEREST": MotivoReporte.CONFLICTO_INTERES,
    "OTHER": MotivoReporte.OTRO,
}


def review_view(row: Resena) -> ReviewView:
    return ReviewView(
        review_id=row.codigo_resena,
        user_id=row.codigo_usuario,
        asylum_id=row.codigo_asilo,
        rating=row.calificacion,
        comment=row.comentario,
        status="PUBLISHED" if row.estado_resena == EstadoResena.PUBLICADA else "HIDDEN",
        created_at=row.fecha_publicacion,
        updated_at=row.fecha_actualizacion,
    )


def report_view(row: ReporteResena) -> ReportView:
    return ReportView(
        report_id=row.codigo_reporte,
        review_id=row.codigo_resena,
        reporter_user_id=row.codigo_denunciante,
        moderator_user_id=row.codigo_moderador,
        reason=next(k for k, v in REASONS.items() if v == row.motivo),
        detail=row.detalle,
        justification=row.justificacion,
        status={
            EstadoReporte.PENDIENTE: "PENDING",
            EstadoReporte.DESCARTADO: "DISCARDED",
            EstadoReporte.RESENA_ELIMINADA: "REVIEW_REMOVED",
        }[row.estado_reporte],
        created_at=row.fecha_reporte,
        resolved_at=row.fecha_resolucion,
    )


class ReviewService:
    def __init__(
        self, repository: ReviewRepository, centers: CenterAccess, users: UserDirectory
    ) -> None:
        self.repository = repository
        self.centers = centers
        self.users = users

    async def list_for_center(self, asylum_id: int, offset: int, limit: int) -> list[ReviewView]:
        await self.centers.require_active(asylum_id)
        rows = await self.repository.list_for_center(asylum_id, offset, limit)
        authors = await self.users.public_authors([row.codigo_usuario for row in rows])
        return [
            review_view(row).model_copy(update={"author": authors[row.codigo_usuario]})
            for row in rows
        ]

    async def create(self, user_id: int, asylum_id: int, data: ReviewInput) -> ReviewView:
        await self.centers.require_active(asylum_id, lock=True)
        row = Resena(
            codigo_usuario=user_id,
            codigo_asilo=asylum_id,
            calificacion=data.rating,
            comentario=data.comment,
        )
        self.repository.session.add(row)
        await self.repository.session.commit()
        return review_view(row)

    async def owned(self, user_id: int, review_id: int) -> Resena:
        row = await self.repository.get(review_id, lock=True)
        if row is None or row.codigo_usuario != user_id:
            raise AppError(code="review_not_found", message="Reseña no disponible", status_code=404)
        return row

    async def update(self, user_id: int, review_id: int, data: ReviewUpdate) -> ReviewView:
        row = await self.owned(user_id, review_id)
        await self.centers.require_active(row.codigo_asilo)
        if row.estado_resena != EstadoResena.PUBLICADA:
            raise AppError(code="review_hidden", message="La reseña está moderada", status_code=409)
        values = data.model_dump(exclude_unset=True)
        if not values or any(value is None for value in values.values()):
            raise AppError(
                code="invalid_review",
                message="Indica una calificación o comentario válido",
                status_code=422,
            )
        if data.rating is not None:
            row.calificacion = data.rating
        if data.comment is not None:
            row.comentario = data.comment
        row.fecha_actualizacion = datetime.now(UTC)
        await self.repository.session.commit()
        return review_view(row)

    async def delete(self, user_id: int, review_id: int) -> None:
        row = await self.owned(user_id, review_id)
        await self.repository.session.delete(row)
        await self.repository.session.commit()

    async def report(self, user_id: int, review_id: int, data: ReportInput) -> ReportView:
        row = await self.repository.get(review_id, lock=True)
        if row is None or row.estado_resena != EstadoResena.PUBLICADA:
            raise AppError(code="review_not_found", message="Reseña no disponible", status_code=404)
        await self.centers.require_active(row.codigo_asilo)
        if row.codigo_usuario == user_id:
            raise AppError(
                code="own_review", message="No puedes reportar tu propia reseña", status_code=403
            )
        report = ReporteResena(
            codigo_resena=review_id,
            codigo_denunciante=user_id,
            motivo=REASONS[data.reason],
            detalle=data.detail,
        )
        self.repository.session.add(report)
        await self.repository.session.commit()
        return report_view(report)

    async def moderate(
        self,
        report_id: int,
        moderator_id: int,
        data: ModerateReport,
        notifications: NotificationService,
    ) -> ReportView:
        db = self.repository.session
        report = await db.get(ReporteResena, report_id)
        if report is None:
            raise AppError(
                code="report_not_found", message="Reporte no disponible", status_code=404
            )
        # Review first: same lock order as reporting/deleting. Re-read after acquiring lock.
        review = await self.repository.get(report.codigo_resena, lock=True)
        report = await db.scalar(
            select(ReporteResena)
            .where(ReporteResena.codigo_reporte == report_id)
            .with_for_update()
            .execution_options(populate_existing=True)
        )
        if report is None or review is None or report.estado_reporte != EstadoReporte.PENDIENTE:
            raise AppError(code="report_resolved", message="Reporte ya resuelto", status_code=409)
        rows = [report]
        if data.status == "REVIEW_REMOVED":
            rows = list(
                await db.scalars(
                    select(ReporteResena)
                    .where(
                        ReporteResena.codigo_resena == review.codigo_resena,
                        ReporteResena.estado_reporte == EstadoReporte.PENDIENTE,
                    )
                    .with_for_update()
                )
            )
        now = datetime.now(UTC)
        result = report_view(report)
        for item in rows:
            view = report_view(item).model_copy(
                update={
                    "status": data.status,
                    "justification": data.justification,
                    "moderator_user_id": moderator_id,
                    "resolved_at": now,
                }
            )
            snapshot = view.model_dump(mode="json")
            snapshot.update(await self.repository.case_snapshot(item.codigo_reporte))
            db.add(ModerationDecision(report_id=item.codigo_reporte, snapshot=snapshot))
            await notifications.moderation_event(item.codigo_denunciante, snapshot)
            if item.codigo_reporte == report_id:
                result = view
        await db.execute(
            update(ReporteResena)
            .where(
                ReporteResena.codigo_reporte == report_id,
            )
            .values(
                estado_reporte=(
                    EstadoReporte.RESENA_ELIMINADA
                    if data.status == "REVIEW_REMOVED"
                    else EstadoReporte.DESCARTADO
                ),
                codigo_moderador=moderator_id,
                justificacion=data.justification,
                fecha_resolucion=now,
            )
            .execution_options(synchronize_session=False)
        )
        await db.commit()
        return result

    async def decisions(self, offset: int, limit: int) -> list[ReportView]:
        rows = await self.repository.session.scalars(
            select(ModerationDecision)
            .order_by(ModerationDecision.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        return [
            ReportView.model_validate(
                {k: v for k, v in row.snapshot.items() if k in ReportView.model_fields}
            )
            for row in rows
        ]

    async def reputation(self, asylum_id: int, filters: ReviewQuery) -> dict[str, object]:
        await self.centers.require_active(asylum_id)
        db = self.repository.session
        query = select(Resena).where(
            Resena.codigo_asilo == asylum_id, Resena.estado_resena == EstadoResena.PUBLICADA
        )
        count_rows = (
            await db.execute(
                select(Resena.calificacion, func.count())
                .where(
                    Resena.codigo_asilo == asylum_id,
                    Resena.estado_resena == EstadoResena.PUBLICADA,
                )
                .group_by(Resena.calificacion)
            )
        ).all()
        counts: dict[int, int] = dict(count_rows)  # type: ignore[arg-type]
        count = sum(counts.values())
        average = round(sum(k * v for k, v in counts.items()) / count, 1) if count else 0.0
        if filters.rating:
            query = query.where(Resena.calificacion == filters.rating)
        if filters.q:
            authors = await self.users.matching_authors(filters.q)
            query = query.where(
                or_(
                    Resena.comentario.ilike(literal_pattern(filters.q)),
                    Resena.codigo_usuario.in_(authors),
                )
            )
        total = await db.scalar(select(func.count()).select_from(query.subquery())) or 0
        order: dict[str, ColumnElement[Any]] = {
            "newest": Resena.fecha_publicacion.desc(),
            "oldest": Resena.fecha_publicacion.asc(),
            "rating_desc": Resena.calificacion.desc(),
            "rating_asc": Resena.calificacion.asc(),
        }
        rows = list(
            await db.scalars(
                query.order_by(order[filters.sort], Resena.codigo_resena)
                .offset((filters.page - 1) * 10)
                .limit(10)
            )
        )
        profiles = await self.users.public_authors([row.codigo_usuario for row in rows])
        return {
            "items": [
                review_view(row).model_copy(update={"author": profiles[row.codigo_usuario]})
                for row in rows
            ],
            "total": total,
            "page": filters.page,
            "pageSize": 10,
            "summary": {
                "average": average,
                "count": count,
                "distribution": {str(i): counts.get(i, 0) for i in range(1, 6)},
            },
        }

    async def report_cases(self, filters: ReportQuery) -> dict[str, object]:
        rows, total = await self.repository.report_cases(filters)
        items = []
        for row in rows:
            row = dict(row)
            row["status"] = {
                "PENDIENTE": "PENDING",
                "DESCARTADO": "DISCARDED",
                "RESENA_ELIMINADA": "REVIEW_REMOVED",
            }.get(str(row["status"]), row["status"])
            row["reason"] = next(
                (key for key, value in REASONS.items() if value == row["reason"]), row["reason"]
            )
            items.append(row)
        return {"items": items, "total": total, "page": filters.page, "pageSize": 20}
