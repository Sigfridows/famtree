"""Public center availability boundary used by other features."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import AppError
from app.db.types import EstadoAsilo
from app.modules.asylums.models import Asilo, ImagenAsilo, Municipio, Provincia
from app.modules.reviews.queries import public_ratings


class CenterAccess:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def require_active(self, asylum_id: int, *, lock: bool = False) -> None:
        query = select(Asilo).where(
            Asilo.codigo_asilo == asylum_id, Asilo.estado_asilo == EstadoAsilo.ACTIVO
        )
        if lock:
            query = query.with_for_update()
        if (await self.session.scalars(query)).first() is None:
            raise AppError(code="asylum_not_found", message="Centro no disponible", status_code=404)

    async def cards(self, ids: list[int]) -> dict[int, dict[str, object]]:
        ratings = public_ratings()
        cover = (
            select(ImagenAsilo.url)
            .where(ImagenAsilo.codigo_asilo == Asilo.codigo_asilo, ImagenAsilo.es_portada.is_(True))
            .scalar_subquery()
        )
        rows = await self.session.execute(
            select(
                Asilo.codigo_asilo.label("asylumId"),
                Asilo.nombre_asilo.label("name"),
                Asilo.estado_asilo.label("status"),
                Municipio.nombre_municipio.label("municipality"),
                Provincia.nombre_provincia.label("province"),
                cover.label("imageUrl"),
                Asilo.precio_minimo.label("minPrice"),
                Asilo.precio_maximo.label("maxPrice"),
                ratings.c.calificacion_promedio.label("averageRating"),
            )
            .select_from(Asilo)
            .join(Municipio, Municipio.codigo_municipio == Asilo.codigo_municipio)
            .join(Provincia, Provincia.codigo_provincia == Municipio.codigo_provincia)
            .outerjoin(ratings, ratings.c.codigo_asilo == Asilo.codigo_asilo)
            .where(Asilo.codigo_asilo.in_(ids))
        )
        return {
            row["asylumId"]: dict(row)
            | {"status": "ACTIVE" if row["status"] == EstadoAsilo.ACTIVO else "INACTIVE"}
            for row in rows.mappings()
        }

    async def lock_existing(self, asylum_id: int) -> str:
        row = await self.session.scalar(
            select(Asilo).where(Asilo.codigo_asilo == asylum_id).with_for_update()
        )
        if row is None:
            raise AppError(code="asylum_not_found", message="Centro no disponible", status_code=404)
        return row.nombre_asilo
