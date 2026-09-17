"""SQLAlchemy read adapter. Fixed query counts; no per-center lazy loading."""

from collections import defaultdict
from typing import Any

from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql.elements import ColumnElement

from app.db.types import EstadoAsilo
from app.modules.asylums.models import (
    Asilo,
    AsiloServicio,
    AsiloTipoAdulto,
    ImagenAsilo,
    Municipio,
    Provincia,
    Servicio,
    TipoAdultoMayor,
)
from app.modules.asylums.schemas import (
    AsylumDetail,
    AsylumImage,
    AsylumSummary,
    CatalogOption,
    Catalogs,
    MunicipalityOption,
    SearchQuery,
    SortOrder,
)
from app.modules.reviews import public_ratings


class SqlAlchemyAsylumReader:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.ratings = public_ratings()

    def _projection(self, *, detail: bool = False) -> Select[Any]:
        cover = (
            select(ImagenAsilo.url)
            .where(ImagenAsilo.codigo_asilo == Asilo.codigo_asilo, ImagenAsilo.es_portada.is_(True))
            .correlate(Asilo)
            .scalar_subquery()
        )
        statement = select(
            Asilo.codigo_asilo.label("id"),
            Asilo.nombre_asilo.label("name"),
            Provincia.codigo_provincia.label("province_id"),
            Provincia.nombre_provincia.label("province_name"),
            Municipio.codigo_municipio.label("municipality_id"),
            Municipio.nombre_municipio.label("municipality_name"),
            Asilo.sector_asilo.label("sector"),
            Asilo.direccion_asilo.label("address"),
            Asilo.latitud.label("latitude"),
            Asilo.longitud.label("longitude"),
            Asilo.precio_minimo.label("price_min"),
            Asilo.precio_maximo.label("price_max"),
            cover.label("cover_url"),
            self.ratings.c.calificacion_promedio.label("rating"),
            self.ratings.c.total_resenas.label("review_count"),
        )
        if detail:
            statement = statement.add_columns(
                Asilo.descripcion_asilo.label("description"),
                Asilo.requisitos_ingreso.label("admission_requirements"),
                Asilo.capacidad_total.label("capacity"),
                Asilo.certificaciones.label("certifications"),
                Asilo.telefono_asilo.label("phone"),
                Asilo.email_asilo.label("email"),
                Asilo.sitio_web.label("website"),
            )
        return (
            statement.select_from(Asilo)
            .join(Municipio, Municipio.codigo_municipio == Asilo.codigo_municipio)
            .join(Provincia, Provincia.codigo_provincia == Municipio.codigo_provincia)
            .join(self.ratings, self.ratings.c.codigo_asilo == Asilo.codigo_asilo)
            .where(Asilo.estado_asilo == EstadoAsilo.ACTIVO)
        )

    def _conditions(self, query: SearchQuery) -> list[ColumnElement[bool]]:
        conditions: list[ColumnElement[bool]] = []
        if query.q:
            # Treat SQL LIKE metacharacters literally, and normalize both operands in PostgreSQL.
            term = (
                " ".join(query.q.split())
                .replace("\\", "\\\\")
                .replace("%", r"\%")
                .replace("_", r"\_")
            )
            normalized_name = func.famtree.f_unaccent(
                func.regexp_replace(func.btrim(Asilo.nombre_asilo), r"\s+", " ", "g")
            )
            conditions.append(
                normalized_name.ilike(func.famtree.f_unaccent(f"%{term}%"), escape="\\")
            )
        if query.province_id is not None:
            conditions.append(Provincia.codigo_provincia == query.province_id)
        if query.municipality_id is not None:
            conditions.append(Asilo.codigo_municipio == query.municipality_id)
        # Overlapping intervals: a center offers at least one price inside the selected budget.
        if query.min_price is not None:
            conditions.append(Asilo.precio_maximo >= query.min_price)
        if query.max_price is not None:
            conditions.append(Asilo.precio_minimo <= query.max_price)
        if query.certified_only:
            conditions.append(func.length(func.btrim(Asilo.certificaciones)) > 0)
        if query.rating_min is not None:
            conditions.append(self.ratings.c.calificacion_promedio >= query.rating_min)
        for service_id in query.services:
            conditions.append(
                select(AsiloServicio.codigo_servicio_asilo)
                .join(Servicio, Servicio.codigo_servicio == AsiloServicio.codigo_servicio)
                .where(
                    AsiloServicio.codigo_asilo == Asilo.codigo_asilo,
                    AsiloServicio.codigo_servicio == service_id,
                    Servicio.estado_servicio.is_(True),
                )
                .exists()
            )
        for care_type_id in query.care_types:
            conditions.append(
                select(AsiloTipoAdulto.codigo_tipo_asilo)
                .join(TipoAdultoMayor, TipoAdultoMayor.codigo_tipo == AsiloTipoAdulto.codigo_tipo)
                .where(
                    AsiloTipoAdulto.codigo_asilo == Asilo.codigo_asilo,
                    AsiloTipoAdulto.codigo_tipo == care_type_id,
                    TipoAdultoMayor.estado_tipo.is_(True),
                )
                .exists()
            )
        return conditions

    def _order(self, sort: SortOrder) -> list[ColumnElement[Any]]:
        primary: ColumnElement[Any]
        match sort:
            case SortOrder.PRICE_ASC:
                primary = Asilo.precio_minimo.asc()
            case SortOrder.PRICE_DESC:
                primary = Asilo.precio_minimo.desc()
            case SortOrder.RATING_DESC:
                primary = self.ratings.c.calificacion_promedio.desc().nulls_last()
            case _:
                primary = func.lower(func.famtree.f_unaccent(Asilo.nombre_asilo)).asc()
        return [primary, Asilo.codigo_asilo.asc()]

    async def search(
        self, query: SearchQuery, *, page_size: int
    ) -> tuple[list[AsylumSummary], int]:
        statement = self._projection().where(*self._conditions(query))
        total = await self.session.scalar(select(func.count()).select_from(statement.subquery()))
        rows = await self.session.execute(
            statement.order_by(*self._order(query.sort))
            .offset((query.page - 1) * page_size)
            .limit(page_size)
        )
        return [AsylumSummary.model_validate(row) for row in rows.mappings()], int(total or 0)

    async def details(self, ids: list[int]) -> list[AsylumDetail]:
        rows = (
            (
                await self.session.execute(
                    self._projection(detail=True).where(Asilo.codigo_asilo.in_(ids))
                )
            )
            .mappings()
            .all()
        )
        active_ids = [row["id"] for row in rows]
        if not active_ids:
            return []

        images: dict[int, list[AsylumImage]] = defaultdict(list)
        image_rows = await self.session.scalars(
            select(ImagenAsilo)
            .where(ImagenAsilo.codigo_asilo.in_(active_ids))
            .order_by(ImagenAsilo.es_portada.desc(), ImagenAsilo.codigo_imagen)
        )
        for image in image_rows:
            images[image.codigo_asilo].append(
                AsylumImage(id=image.codigo_imagen, url=image.url, is_cover=image.es_portada)
            )
        services: dict[int, list[CatalogOption]] = defaultdict(list)
        service_rows = await self.session.execute(
            select(AsiloServicio.codigo_asilo, Servicio.codigo_servicio, Servicio.nombre_servicio)
            .join(Servicio, Servicio.codigo_servicio == AsiloServicio.codigo_servicio)
            .where(AsiloServicio.codigo_asilo.in_(active_ids), Servicio.estado_servicio.is_(True))
            .order_by(Servicio.nombre_servicio, Servicio.codigo_servicio)
        )
        for asylum_id, service_id, name in service_rows:
            services[asylum_id].append(CatalogOption(id=service_id, name=name))
        care_types: dict[int, list[CatalogOption]] = defaultdict(list)
        care_rows = await self.session.execute(
            select(
                AsiloTipoAdulto.codigo_asilo,
                TipoAdultoMayor.codigo_tipo,
                TipoAdultoMayor.nombre_tipo,
            )
            .join(TipoAdultoMayor, TipoAdultoMayor.codigo_tipo == AsiloTipoAdulto.codigo_tipo)
            .where(
                AsiloTipoAdulto.codigo_asilo.in_(active_ids), TipoAdultoMayor.estado_tipo.is_(True)
            )
            .order_by(TipoAdultoMayor.nombre_tipo, TipoAdultoMayor.codigo_tipo)
        )
        for asylum_id, care_id, name in care_rows:
            care_types[asylum_id].append(CatalogOption(id=care_id, name=name))
        return [
            AsylumDetail.model_validate(
                {
                    **row,
                    "images": images[row["id"]],
                    "services": services[row["id"]],
                    "care_types": care_types[row["id"]],
                }
            )
            for row in rows
        ]

    async def catalogs(self, province_id: int | None) -> Catalogs:
        provinces = await self.session.execute(
            select(
                Provincia.codigo_provincia.label("id"), Provincia.nombre_provincia.label("name")
            ).order_by(Provincia.nombre_provincia)
        )
        municipality_query = select(
            Municipio.codigo_municipio.label("id"),
            Municipio.nombre_municipio.label("name"),
            Municipio.codigo_provincia.label("province_id"),
        ).order_by(Municipio.nombre_municipio, Municipio.codigo_municipio)
        if province_id is not None:
            municipality_query = municipality_query.where(Municipio.codigo_provincia == province_id)
        municipalities = await self.session.execute(municipality_query)
        services = await self.session.execute(
            select(Servicio.codigo_servicio.label("id"), Servicio.nombre_servicio.label("name"))
            .where(Servicio.estado_servicio.is_(True))
            .order_by(Servicio.nombre_servicio)
        )
        care_types = await self.session.execute(
            select(
                TipoAdultoMayor.codigo_tipo.label("id"), TipoAdultoMayor.nombre_tipo.label("name")
            )
            .where(TipoAdultoMayor.estado_tipo.is_(True))
            .order_by(TipoAdultoMayor.nombre_tipo)
        )
        return Catalogs(
            provinces=[CatalogOption.model_validate(row) for row in provinces.mappings()],
            municipalities=[
                MunicipalityOption.model_validate(row) for row in municipalities.mappings()
            ],
            services=[CatalogOption.model_validate(row) for row in services.mappings()],
            care_types=[CatalogOption.model_validate(row) for row in care_types.mappings()],
        )
