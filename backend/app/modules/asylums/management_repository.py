from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.pagination import AdminQuery, literal_pattern
from app.db.types import EstadoAsilo
from app.modules.asylums.models import Asilo, ImagenAsilo, Municipio


class CenterRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get(self, asylum_id: int, *, lock: bool = False) -> Asilo | None:
        query = (
            select(Asilo)
            .where(Asilo.codigo_asilo == asylum_id)
            .execution_options(populate_existing=True)
        )
        if lock:
            query = query.with_for_update()
        return (await self.session.scalars(query)).first()

    async def images(self, asylum_id: int) -> list[ImagenAsilo]:
        return list(
            await self.session.scalars(
                select(ImagenAsilo)
                .where(ImagenAsilo.codigo_asilo == asylum_id)
                .order_by(ImagenAsilo.es_portada.desc(), ImagenAsilo.codigo_imagen)
            )
        )

    async def filtered(self, filters: AdminQuery) -> tuple[list[Asilo], int]:
        query = select(Asilo).join(Municipio)
        if filters.q:
            query = query.where(Asilo.nombre_asilo.ilike(literal_pattern(filters.q)))
        if filters.province_id:
            query = query.where(Municipio.codigo_provincia == filters.province_id)
        if filters.status:
            query = query.where(
                Asilo.estado_asilo
                == (EstadoAsilo.ACTIVO if filters.status == "ACTIVE" else EstadoAsilo.INACTIVO)
            )
        total = await self.session.scalar(select(func.count()).select_from(query.subquery())) or 0
        rows = await self.session.scalars(
            query.order_by(Asilo.codigo_asilo).offset((filters.page - 1) * 20).limit(20)
        )
        return list(rows), total
