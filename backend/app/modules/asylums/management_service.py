from sqlalchemy import delete, select

from app.core.errors import AppError
from app.core.pagination import AdminQuery
from app.db.types import EstadoAsilo
from app.modules.asylums.management_repository import CenterRepository
from app.modules.asylums.management_schemas import (
    AsylumCreate,
    AsylumUpdate,
    CenterUpdate,
    ManagedAsylum,
    ManagedImage,
)
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
from app.modules.favorites import FavoriteService
from app.modules.notifications import NotificationService
from app.modules.users import UserDirectory

FIELDS = {
    "municipality_id": "codigo_municipio",
    "name": "nombre_asilo",
    "description": "descripcion_asilo",
    "sector": "sector_asilo",
    "address": "direccion_asilo",
    "latitude": "latitud",
    "longitude": "longitud",
    "total_capacity": "capacidad_total",
    "min_price": "precio_minimo",
    "max_price": "precio_maximo",
    "entry_requirements": "requisitos_ingreso",
    "certifications": "certificaciones",
    "phone": "telefono_asilo",
    "email": "email_asilo",
    "website": "sitio_web",
}


def center_view(row: Asilo) -> ManagedAsylum:
    return ManagedAsylum.model_validate(
        {key: getattr(row, column) for key, column in FIELDS.items()}
        | {
            "asylum_id": row.codigo_asilo,
            "status": "ACTIVE" if row.estado_asilo == EstadoAsilo.ACTIVO else "INACTIVE",
            "created_at": row.fecha_creacion,
            "updated_at": row.fecha_actualizacion,
        }
    )


def image_view(row: ImagenAsilo) -> ManagedImage:
    return ManagedImage(
        image_id=row.codigo_imagen,
        asylum_id=row.codigo_asilo,
        url=row.url,
        is_cover=row.es_portada,
        created_at=row.fecha_creacion,
    )


class CenterService:
    def __init__(
        self,
        repository: CenterRepository,
        favorites: FavoriteService,
        notifications: NotificationService,
        users: UserDirectory,
    ) -> None:
        self.repository = repository
        self.favorites = favorites
        self.notifications = notifications
        self.users = users

    async def require(self, asylum_id: int, *, lock: bool = False) -> Asilo:
        row = await self.repository.get(asylum_id, lock=lock)
        if row is None:
            raise AppError(code="asylum_not_found", message="Centro no disponible", status_code=404)
        return row

    async def get(self, asylum_id: int) -> ManagedAsylum:
        return (await self.describe_many([await self.require(asylum_id)]))[0]

    async def validate_catalogs(
        self, municipality_id: int, services: list[int] | None, types: list[int] | None
    ) -> None:
        db = self.repository.session
        if await db.get(Municipio, municipality_id) is None:
            raise AppError(
                code="invalid_municipality", message="Municipio no disponible", status_code=422
            )
        if services is not None:
            found = set(
                await db.scalars(
                    select(Servicio.codigo_servicio).where(
                        Servicio.codigo_servicio.in_(services), Servicio.estado_servicio.is_(True)
                    )
                )
            )
            if found != set(services) or len(found) != len(services):
                raise AppError(
                    code="invalid_services",
                    message="Servicios inválidos o repetidos",
                    status_code=422,
                )
        if types is not None:
            found = set(
                await db.scalars(
                    select(TipoAdultoMayor.codigo_tipo).where(
                        TipoAdultoMayor.codigo_tipo.in_(types),
                        TipoAdultoMayor.estado_tipo.is_(True),
                    )
                )
            )
            if found != set(types) or len(found) != len(types):
                raise AppError(
                    code="invalid_care_types",
                    message="Tipos de cuidado inválidos o repetidos",
                    status_code=422,
                )

    async def associations(
        self, asylum_id: int, services: list[int] | None, types: list[int] | None
    ) -> None:
        db = self.repository.session
        if services is not None:
            await db.execute(delete(AsiloServicio).where(AsiloServicio.codigo_asilo == asylum_id))
            db.add_all(
                [AsiloServicio(codigo_asilo=asylum_id, codigo_servicio=value) for value in services]
            )
        if types is not None:
            await db.execute(
                delete(AsiloTipoAdulto).where(AsiloTipoAdulto.codigo_asilo == asylum_id)
            )
            db.add_all(
                [AsiloTipoAdulto(codigo_asilo=asylum_id, codigo_tipo=value) for value in types]
            )

    async def create(self, data: AsylumCreate) -> ManagedAsylum:
        await self.validate_catalogs(data.municipality_id, data.service_ids, data.senior_type_ids)
        row = Asilo(**{column: getattr(data, key) for key, column in FIELDS.items()})
        db = self.repository.session
        db.add(row)
        await db.flush()
        await self.associations(row.codigo_asilo, data.service_ids, data.senior_type_ids)
        db.add_all(
            [
                ImagenAsilo(codigo_asilo=row.codigo_asilo, url=image.url, es_portada=i == 0)
                for i, image in enumerate(data.images)
            ]
        )
        await db.commit()
        await db.refresh(row)
        return (await self.describe_many([row]))[0]

    async def update(
        self, asylum_id: int, data: AsylumUpdate | CenterUpdate, *, actor_id: int | None = None
    ) -> ManagedAsylum:
        row = await self.require(asylum_id, lock=True)
        await self.authorize_writer(row, actor_id)
        values = data.model_dump(exclude_unset=True)
        if not values:
            raise AppError(code="empty_update", message="Indica al menos un campo", status_code=422)
        if any(
            value is None and key not in {"certifications", "website"}
            for key, value in values.items()
        ):
            raise AppError(
                code="invalid_update",
                message="Un campo obligatorio no puede ser nulo",
                status_code=422,
            )
        for key, column in FIELDS.items():
            if key in values:
                setattr(row, column, values[key])
        if row.precio_maximo < row.precio_minimo:
            raise AppError(
                code="invalid_price_range",
                message="El precio máximo es menor al mínimo",
                status_code=422,
            )
        with self.repository.session.no_autoflush:
            await self.validate_catalogs(
                row.codigo_municipio, data.service_ids, data.senior_type_ids
            )
        await self.associations(asylum_id, data.service_ids, data.senior_type_ids)
        await self.notifications.center_event(
            await self.favorites.recipients(asylum_id),
            asylum_id,
            status_changed=False,
            center_name=row.nombre_asilo,
        )
        await self.repository.session.commit()
        await self.repository.session.refresh(row)
        return (await self.describe_many([row]))[0]

    async def set_status(self, asylum_id: int, active: bool) -> ManagedAsylum:
        row = await self.require(asylum_id, lock=True)
        new_status = EstadoAsilo.ACTIVO if active else EstadoAsilo.INACTIVO
        if row.estado_asilo != new_status:
            row.estado_asilo = new_status
            await self.notifications.center_event(
                await self.favorites.recipients(asylum_id),
                asylum_id,
                status_changed=True,
                center_name=row.nombre_asilo,
            )
        await self.repository.session.commit()
        await self.repository.session.refresh(row)
        return (await self.describe_many([row]))[0]

    async def images(self, asylum_id: int) -> list[ManagedImage]:
        await self.require(asylum_id)
        return [image_view(row) for row in await self.repository.images(asylum_id)]

    async def cover(
        self, asylum_id: int, image_id: int, *, actor_id: int | None = None
    ) -> list[ManagedImage]:
        locked = await self.require(asylum_id, lock=True)
        await self.authorize_writer(locked, actor_id)
        images = await self.repository.images(asylum_id)
        image = next((row for row in images if row.codigo_imagen == image_id), None)
        if image is None:
            raise AppError(code="image_not_found", message="Imagen no disponible", status_code=404)
        image.es_portada = True
        await self.repository.session.commit()
        self.repository.session.expire_all()
        return await self.images(asylum_id)

    async def remove_image(
        self, asylum_id: int, image_id: int, *, actor_id: int | None = None
    ) -> str:
        locked = await self.require(asylum_id, lock=True)
        await self.authorize_writer(locked, actor_id)
        images = await self.repository.images(asylum_id)
        image = next((row for row in images if row.codigo_imagen == image_id), None)
        if image is None:
            raise AppError(code="image_not_found", message="Imagen no disponible", status_code=404)
        if len(images) <= 1:
            raise AppError(
                code="last_image", message="El centro necesita al menos una imagen", status_code=409
            )
        url = image.url
        await self.repository.session.delete(image)
        await self.repository.session.commit()
        return url

    async def attach_image(
        self, asylum_id: int, url: str, *, actor_id: int | None = None
    ) -> ManagedImage:
        locked = await self.require(asylum_id, lock=True)
        await self.authorize_writer(locked, actor_id)
        if len(await self.repository.images(asylum_id)) >= 15:
            raise AppError(
                code="gallery_full", message="La galería admite hasta 15 imágenes", status_code=409
            )
        row = ImagenAsilo(codigo_asilo=asylum_id, url=url, es_portada=False)
        self.repository.session.add(row)
        await self.repository.session.commit()
        await self.repository.session.refresh(row)
        return image_view(row)

    async def filtered(self, filters: AdminQuery) -> dict[str, object]:
        if filters.status == "BLOCKED" or filters.role:
            raise AppError(
                code="invalid_filters", message="Filtros de centro inválidos", status_code=422
            )
        rows, total = await self.repository.filtered(filters)
        return {
            "items": await self.describe_many(rows),
            "total": total,
            "page": filters.page,
            "pageSize": 20,
        }

    async def authorize_writer(self, row: Asilo, actor_id: int | None) -> None:
        if actor_id is None:
            return  # System-admin service paths are guarded by their route dependencies.
        user = await self.users.get(actor_id)
        if (
            user.role != "ASYLUM_ADMIN"
            or user.assigned_asylum_id != row.codigo_asilo
            or user.status != "ACTIVE"
            or row.estado_asilo != EstadoAsilo.ACTIVO
        ):
            raise AppError(
                code="center_access_revoked",
                message="La asignación ya no está vigente",
                status_code=403,
            )

    async def describe_many(self, rows: list[Asilo]) -> list[ManagedAsylum]:
        ids = [row.codigo_asilo for row in rows]
        if not ids:
            return []
        db = self.repository.session
        services = (
            await db.execute(
                select(AsiloServicio.codigo_asilo, AsiloServicio.codigo_servicio).where(
                    AsiloServicio.codigo_asilo.in_(ids)
                )
            )
        ).all()
        types = (
            await db.execute(
                select(AsiloTipoAdulto.codigo_asilo, AsiloTipoAdulto.codigo_tipo).where(
                    AsiloTipoAdulto.codigo_asilo.in_(ids)
                )
            )
        ).all()
        places = (
            await db.execute(
                select(
                    Municipio.codigo_municipio,
                    Municipio.nombre_municipio,
                    Provincia.codigo_provincia,
                    Provincia.nombre_provincia,
                )
                .select_from(Municipio)
                .join(Provincia)
                .where(Municipio.codigo_municipio.in_([row.codigo_municipio for row in rows]))
            )
        ).all()
        locations = {mid: (name, pid, pname) for mid, name, pid, pname in places}
        admins = await self.users.assigned_administrators(ids)
        return [
            center_view(row).model_copy(
                update={
                    "service_ids": [value for cid, value in services if cid == row.codigo_asilo],
                    "senior_type_ids": [value for cid, value in types if cid == row.codigo_asilo],
                    "municipality_name": locations[row.codigo_municipio][0],
                    "province_id": locations[row.codigo_municipio][1],
                    "province_name": locations[row.codigo_municipio][2],
                    "administrator": admins.get(row.codigo_asilo),
                }
            )
            for row in rows
        ]
