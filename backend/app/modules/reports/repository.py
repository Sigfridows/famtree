"""Read-only reporting projection; does not write to feature-owned tables."""

from datetime import UTC, datetime, time, timedelta
from typing import Any

from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import InstrumentedAttribute

from app.db.types import EstadoAsilo, EstadoReporte, EstadoResena, EstadoUsuario, RolUsuario
from app.modules.asylums.models import Asilo, Municipio
from app.modules.favorites.models import Favorito
from app.modules.reports.schemas import ReportFilter, ReportMetrics, ReportTable, TableFilter
from app.modules.reviews.models import ReporteResena, Resena
from app.modules.users.models import Usuario


def dated(
    query: Select[Any], column: InstrumentedAttribute[datetime], filters: ReportFilter
) -> Select[Any]:
    if filters.start_date:
        query = query.where(column >= datetime.combine(filters.start_date, time.min, UTC))
    if filters.end_date:
        query = query.where(
            column < datetime.combine(filters.end_date, time.min, UTC) + timedelta(days=1)
        )
    return query


class ReportRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def metrics(self, filters: ReportFilter) -> ReportMetrics:
        centers = select(Asilo.codigo_asilo).join(Municipio)
        if filters.asylum_id:
            centers = centers.where(Asilo.codigo_asilo == filters.asylum_id)
        if filters.province_id:
            centers = centers.where(Municipio.codigo_provincia == filters.province_id)
        db = self.session
        center_count = await db.scalar(
            dated(
                select(func.count()).select_from(Asilo).where(Asilo.codigo_asilo.in_(centers)),
                Asilo.fecha_creacion,
                filters,
            )
        )
        active = await db.scalar(
            dated(
                select(func.count())
                .select_from(Asilo)
                .where(Asilo.codigo_asilo.in_(centers), Asilo.estado_asilo == EstadoAsilo.ACTIVO),
                Asilo.fecha_creacion,
                filters,
            )
        )
        capacity = await db.scalar(
            dated(
                select(func.sum(Asilo.capacidad_total)).where(
                    Asilo.codigo_asilo.in_(centers), Asilo.estado_asilo == EstadoAsilo.ACTIVO
                ),
                Asilo.fecha_creacion,
                filters,
            )
        )
        users = await db.scalar(
            dated(
                select(func.count())
                .select_from(Usuario)
                .where(Usuario.rol == RolUsuario.USUARIO_REGISTRADO),
                Usuario.fecha_registro,
                filters,
            )
        )
        reviews = dated(
            select(func.count(), func.avg(Resena.calificacion)).where(
                Resena.codigo_asilo.in_(centers), Resena.estado_resena == EstadoResena.PUBLICADA
            ),
            Resena.fecha_publicacion,
            filters,
        )
        count, average = (await db.execute(reviews)).one()
        favorites = await db.scalar(
            dated(
                select(func.count())
                .select_from(Favorito)
                .where(Favorito.codigo_asilo.in_(centers)),
                Favorito.fecha_creacion,
                filters,
            )
        )
        pending = await db.scalar(
            dated(
                select(func.count())
                .select_from(ReporteResena)
                .join(Resena)
                .where(
                    Resena.codigo_asilo.in_(centers),
                    ReporteResena.estado_reporte == EstadoReporte.PENDIENTE,
                ),
                ReporteResena.fecha_reporte,
                filters,
            )
        )
        state_rows = (
            await db.execute(
                dated(
                    select(Usuario.estado, func.count())
                    .where(Usuario.rol == RolUsuario.USUARIO_REGISTRADO)
                    .group_by(Usuario.estado),
                    Usuario.fecha_registro,
                    filters,
                )
            )
        ).all()
        states = {str(state): number for state, number in state_rows}
        admins = (
            await db.scalar(
                dated(
                    select(func.count())
                    .select_from(Usuario)
                    .where(
                        Usuario.rol == RolUsuario.ADMIN_ASILO,
                        Usuario.codigo_asilo_asignado.is_not(None),
                    ),
                    Usuario.fecha_registro,
                    filters,
                )
            )
            or 0
        )
        geography = (
            await db.execute(
                dated(
                    select(Municipio.codigo_provincia, func.count())
                    .select_from(Asilo)
                    .join(Municipio)
                    .where(Asilo.codigo_asilo.in_(centers))
                    .group_by(Municipio.codigo_provincia),
                    Asilo.fecha_creacion,
                    filters,
                )
            )
        ).all()
        stars = (
            await db.execute(
                dated(
                    select(Resena.calificacion, func.count())
                    .where(
                        Resena.codigo_asilo.in_(centers),
                        Resena.estado_resena == EstadoResena.PUBLICADA,
                    )
                    .group_by(Resena.calificacion),
                    Resena.fecha_publicacion,
                    filters,
                )
            )
        ).all()
        day = func.to_char(func.timezone("UTC", Usuario.fecha_registro), "YYYY-MM-DD")
        trend = (
            await db.execute(
                dated(
                    select(day, func.count())
                    .where(Usuario.rol == RolUsuario.USUARIO_REGISTRADO)
                    .group_by(day)
                    .order_by(day),
                    Usuario.fecha_registro,
                    filters,
                )
            )
        ).all()
        return ReportMetrics(
            centers=center_count or 0,
            active_centers=active or 0,
            total_capacity=capacity or 0,
            registered_users=users or 0,
            published_reviews=count,
            average_rating=float(average) if average else None,
            favorites=favorites or 0,
            pending_reports=pending or 0,
            inactive_centers=(center_count or 0) - (active or 0),
            active_users=states.get("ACTIVO", 0),
            blocked_users=states.get("BLOQUEADO", 0),
            center_administrators=admins,
            centers_by_province={str(key): number for key, number in geography},
            rating_distribution={str(key): number for key, number in stars},
            user_registration_trend={str(key): number for key, number in trend},
        )

    async def table(self, filters: TableFilter, *, export: bool = False) -> ReportTable:
        query: Select[Any]
        if filters.report_type == "centers":
            query = select(
                Asilo.codigo_asilo.label("id"),
                Asilo.nombre_asilo.label("name"),
                Municipio.nombre_municipio.label("municipality"),
                Municipio.codigo_provincia.label("provinceId"),
                Asilo.estado_asilo.label("status"),
                Asilo.capacidad_total.label("capacity"),
                Asilo.precio_minimo.label("minPrice"),
                Asilo.precio_maximo.label("maxPrice"),
                Asilo.fecha_creacion.label("createdAt"),
            ).join(Municipio)
            if filters.province_id:
                query = query.where(Municipio.codigo_provincia == filters.province_id)
            if filters.asylum_id:
                query = query.where(Asilo.codigo_asilo == filters.asylum_id)
            if filters.status:
                query = query.where(
                    Asilo.estado_asilo
                    == (EstadoAsilo.ACTIVO if filters.status == "ACTIVE" else EstadoAsilo.INACTIVO)
                )
            query = dated(query, Asilo.fecha_creacion, filters).order_by(Asilo.codigo_asilo)
        elif filters.report_type == "users":
            query = select(
                Usuario.codigo_usuario.label("id"),
                Usuario.nombre_usuario.label("firstName"),
                Usuario.apellido_usuario.label("lastName"),
                Usuario.email.label("email"),
                Usuario.rol.label("role"),
                Usuario.estado.label("status"),
                Usuario.fecha_registro.label("createdAt"),
            )
            if filters.status:
                query = query.where(
                    Usuario.estado
                    == (
                        EstadoUsuario.ACTIVO
                        if filters.status == "ACTIVE"
                        else EstadoUsuario.BLOQUEADO
                    )
                )
            query = dated(query, Usuario.fecha_registro, filters).order_by(Usuario.codigo_usuario)
        else:
            query = select(
                Resena.codigo_resena.label("id"),
                Asilo.nombre_asilo.label("asylum"),
                Resena.codigo_usuario.label("authorId"),
                Resena.calificacion.label("rating"),
                Resena.comentario.label("comment"),
                Resena.estado_resena.label("status"),
                Resena.fecha_publicacion.label("createdAt"),
            ).join(Asilo)
            if filters.asylum_id:
                query = query.where(Resena.codigo_asilo == filters.asylum_id)
            if filters.status:
                query = query.where(
                    Resena.estado_resena
                    == (
                        EstadoResena.PUBLICADA
                        if filters.status == "PUBLISHED"
                        else EstadoResena.OCULTA
                    )
                )
            query = dated(query, Resena.fecha_publicacion, filters).order_by(Resena.codigo_resena)
        total = await self.session.scalar(select(func.count()).select_from(query.subquery())) or 0
        if not export:
            query = query.offset((filters.page - 1) * 20).limit(20)
        rows = (await self.session.execute(query)).mappings().all()
        return ReportTable(rows=[dict(row) for row in rows], total=total, page=filters.page)
