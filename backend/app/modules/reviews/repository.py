from sqlalchemy import func, or_, select, union_all
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased

from app.core.pagination import literal_pattern
from app.db.types import EstadoResena
from app.modules.asylums.models import Asilo
from app.modules.reviews.models import ModerationDecision, ReporteResena, Resena
from app.modules.reviews.schemas import ReportQuery
from app.modules.users.models import Usuario


class ReviewRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get(self, review_id: int, *, lock: bool = False) -> Resena | None:
        query = select(Resena).where(Resena.codigo_resena == review_id)
        if lock:
            query = query.with_for_update()
        return (await self.session.scalars(query)).first()

    async def list_for_center(self, asylum_id: int, offset: int, limit: int) -> list[Resena]:
        return list(
            await self.session.scalars(
                select(Resena)
                .where(
                    Resena.codigo_asilo == asylum_id, Resena.estado_resena == EstadoResena.PUBLICADA
                )
                .order_by(Resena.fecha_publicacion.desc(), Resena.codigo_resena.desc())
                .offset(offset)
                .limit(limit)
            )
        )

    async def report_cases(self, filters: ReportQuery) -> tuple[list[dict[str, object]], int]:
        author = aliased(Usuario)
        reporter = aliased(Usuario)
        live = (
            select(
                func.jsonb_build_object(
                    "report_id",
                    ReporteResena.codigo_reporte,
                    "review_id",
                    Resena.codigo_resena,
                    "reporter_user_id",
                    ReporteResena.codigo_denunciante,
                    "moderator_user_id",
                    ReporteResena.codigo_moderador,
                    "reason",
                    ReporteResena.motivo,
                    "detail",
                    ReporteResena.detalle,
                    "justification",
                    ReporteResena.justificacion,
                    "status",
                    ReporteResena.estado_reporte,
                    "created_at",
                    ReporteResena.fecha_reporte,
                    "resolved_at",
                    ReporteResena.fecha_resolucion,
                    "asylum_name",
                    Asilo.nombre_asilo,
                    "author_name",
                    author.nombre_usuario + " " + author.apellido_usuario,
                    "reporter_name",
                    reporter.nombre_usuario + " " + reporter.apellido_usuario,
                    "comment",
                    Resena.comentario,
                    "rating",
                    Resena.calificacion,
                )
                .cast(JSONB)
                .label("payload")
            )
            .select_from(ReporteResena)
            .join(Resena)
            .join(Asilo)
            .join(author, author.codigo_usuario == Resena.codigo_usuario)
            .join(reporter, reporter.codigo_usuario == ReporteResena.codigo_denunciante)
            .where(
                ~select(ModerationDecision.report_id)
                .where(ModerationDecision.report_id == ReporteResena.codigo_reporte)
                .exists()
            )
        )
        combined = union_all(live, select(ModerationDecision.snapshot.label("payload"))).subquery()
        payload = combined.c.payload
        query = select(payload)
        states = {
            "PENDING": "PENDIENTE",
            "DISCARDED": "DESCARTADO",
            "REVIEW_REMOVED": "RESENA_ELIMINADA",
        }
        if filters.status != "ALL":
            query = query.where(
                payload["status"].astext.in_([filters.status, states[filters.status]])
            )
        if filters.reason:
            reasons = {
                "OFFENSIVE_LANGUAGE": "LENGUAJE_OFENSIVO",
                "FALSE_INFO": "INFO_FALSA",
                "SPAM": "SPAM",
                "CONFLICT_OF_INTEREST": "CONFLICTO_INTERES",
                "OTHER": "OTRO",
            }
            query = query.where(
                payload["reason"].astext.in_([filters.reason, reasons[filters.reason]])
            )
        if filters.q:
            query = query.where(
                or_(
                    payload["asylum_name"].astext.ilike(literal_pattern(filters.q)),
                    payload["author_name"].astext.ilike(literal_pattern(filters.q)),
                )
            )
        total = await self.session.scalar(select(func.count()).select_from(query.subquery())) or 0
        rows = await self.session.scalars(
            query.order_by(payload["created_at"].astext.desc(), payload["report_id"].astext)
            .offset((filters.page - 1) * 20)
            .limit(20)
        )
        return list(rows), total

    async def case_snapshot(self, report_id: int) -> dict[str, object]:
        row = await self.session.get(ReporteResena, report_id)
        if row is None:
            raise RuntimeError("Report disappeared while locked")
        review = await self.session.get(Resena, row.codigo_resena)
        if review is None:
            raise RuntimeError("Review disappeared while locked")
        center = await self.session.get(Asilo, review.codigo_asilo)
        author = await self.session.get(Usuario, review.codigo_usuario)
        reporter = await self.session.get(Usuario, row.codigo_denunciante)
        if center is None or author is None or reporter is None:
            raise RuntimeError("Report references unavailable entities")
        return {
            "asylum_name": center.nombre_asilo,
            "author_name": f"{author.nombre_usuario} {author.apellido_usuario}",
            "reporter_name": f"{reporter.nombre_usuario} {reporter.apellido_usuario}",
            "comment": review.comentario,
            "rating": review.calificacion,
        }
