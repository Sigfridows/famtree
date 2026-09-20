from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime

from sqlalchemy import select

from app.core.errors import AppError
from app.core.pagination import AdminQuery, literal_pattern
from app.db.types import EstadoUsuario, RolUsuario
from app.modules.users.models import PreferenciaNotificacion, Usuario
from app.modules.users.repository import UserRepository
from app.modules.users.schemas import ProfileUpdate, UserProfile

ROLE_NAMES = {
    RolUsuario.USUARIO_REGISTRADO: "REGISTERED_USER",
    RolUsuario.ADMIN_ASILO: "ASYLUM_ADMIN",
    RolUsuario.ADMIN_SISTEMA: "SYSTEM_ADMIN",
}


@dataclass(frozen=True)
class Credentials:
    user_id: int
    password_hash: str


def profile(user: Usuario) -> UserProfile:
    return UserProfile.model_validate(
        {
            "user_id": user.codigo_usuario,
            "assigned_asylum_id": user.codigo_asilo_asignado,
            "first_name": user.nombre_usuario,
            "last_name": user.apellido_usuario,
            "username": user.username,
            "email": user.email,
            "phone": user.telefono,
            "profile_picture": user.foto_perfil,
            "description": user.descripcion,
            "role": ROLE_NAMES[user.rol],
            "status": "ACTIVE" if user.estado == EstadoUsuario.ACTIVO else "BLOCKED",
            "requires_password_change": user.requiere_cambio_clave,
            "created_at": user.fecha_registro,
        }
    )


class UserDirectory:
    """Public user boundary used by identity and administration; ORM stays private."""

    def __init__(self, repository: UserRepository) -> None:
        self.repository = repository

    async def get(self, user_id: int) -> UserProfile:
        user = await self.repository.get(user_id)
        if user is None:
            raise AppError(code="user_not_found", message="Usuario no disponible", status_code=404)
        return profile(user)

    async def credentials(self, username: str) -> Credentials | None:
        user = await self.repository.by_username(username)
        return Credentials(user.codigo_usuario, user.password_hash) if user else None

    async def create(
        self,
        *,
        username: str,
        email: str,
        first_name: str,
        last_name: str,
        password_hash: str,
        role: RolUsuario = RolUsuario.USUARIO_REGISTRADO,
        assigned_asylum_id: int | None = None,
        phone: str | None = None,
        temporary: bool = False,
    ) -> UserProfile:
        user = Usuario(
            username=username,
            email=email.lower(),
            nombre_usuario=first_name,
            apellido_usuario=last_name,
            password_hash=password_hash,
            rol=role,
            codigo_asilo_asignado=assigned_asylum_id,
            telefono=phone,
            requiere_cambio_clave=temporary,
        )
        self.repository.session.add(user)
        await self.repository.session.flush()
        return profile(user)

    async def change_password(self, user_id: int, encoded: str) -> None:
        user = await self.repository.get(user_id, lock=True)
        if user is None:
            raise AppError(code="user_not_found", message="Usuario no disponible", status_code=404)
        user.password_hash = encoded
        user.password_changed_at = datetime.now(UTC)
        user.requiere_cambio_clave = False

    async def update_profile(self, user_id: int, data: ProfileUpdate) -> UserProfile:
        user = await self.repository.get(user_id, lock=True)
        if user is None:
            raise AppError(code="user_not_found", message="Usuario no disponible", status_code=404)
        mapping = {
            "first_name": "nombre_usuario",
            "last_name": "apellido_usuario",
            "phone": "telefono",
            "description": "descripcion",
        }
        for field, value in data.model_dump(exclude_unset=True).items():
            if value is None and field in {"first_name", "last_name"}:
                raise AppError(
                    code="invalid_profile",
                    message="El nombre no puede estar vacío",
                    status_code=422,
                )
            setattr(user, mapping[field], value)
        await self.repository.session.commit()
        return profile(user)

    async def list_users(self, offset: int, limit: int) -> list[UserProfile]:
        return [profile(user) for user in await self.repository.list_users(offset, limit)]

    async def preferences(self, user_id: int) -> dict[str, int | bool]:
        prefs = (
            await self.repository.session.scalars(
                select(PreferenciaNotificacion).where(
                    PreferenciaNotificacion.codigo_usuario == user_id
                )
            )
        ).one()
        return {
            "preference_id": prefs.codigo_preferencia,
            "user_id": user_id,
            "availability_alert": prefs.alerta_disponibilidad,
            "update_alert": prefs.alerta_actualizacion,
            "moderation_alert": prefs.alerta_moderacion,
        }

    async def update_preferences(
        self, user_id: int, data: dict[str, bool | None]
    ) -> dict[str, int | bool]:
        prefs = (
            await self.repository.session.scalars(
                select(PreferenciaNotificacion)
                .where(PreferenciaNotificacion.codigo_usuario == user_id)
                .with_for_update()
            )
        ).one()
        mapping = {
            "availability_alert": "alerta_disponibilidad",
            "update_alert": "alerta_actualizacion",
            "moderation_alert": "alerta_moderacion",
        }
        for field, value in data.items():
            setattr(prefs, mapping[field], value)
        await self.repository.session.flush()
        return await self.preferences(user_id)

    async def set_picture(self, user_id: int, url: str) -> tuple[UserProfile, str | None]:
        user = await self.repository.get(user_id, lock=True)
        if user is None:
            raise AppError(code="user_not_found", message="Usuario no disponible", status_code=404)
        old = user.foto_perfil
        user.foto_perfil = url
        await self.repository.session.commit()
        return profile(user), old

    async def release_assignment(self, asylum_id: int) -> int | None:
        user = await self.repository.session.scalar(
            select(Usuario)
            .where(
                Usuario.codigo_asilo_asignado == asylum_id,
                Usuario.rol == RolUsuario.ADMIN_ASILO,
            )
            .with_for_update()
        )
        if user is None:
            return None
        user.codigo_asilo_asignado = None
        await self.repository.session.flush()
        return user.codigo_usuario

    async def filtered(self, filters: AdminQuery) -> dict[str, object]:
        if filters.status == "INACTIVE" or filters.province_id:
            raise AppError(
                code="invalid_filters", message="Filtros de usuario inválidos", status_code=422
            )
        rows, total = await self.repository.filtered(filters)
        return {
            "items": [profile(row) for row in rows],
            "total": total,
            "page": filters.page,
            "pageSize": 20,
        }

    async def public_authors(self, ids: list[int]) -> dict[int, dict[str, object]]:
        rows = await self.repository.session.scalars(
            select(Usuario).where(Usuario.codigo_usuario.in_(ids))
        )
        return {
            row.codigo_usuario: {
                "name": f"{row.nombre_usuario} {row.apellido_usuario}",
                "picture": row.foto_perfil,
            }
            for row in rows
        }

    async def matching_authors(self, text: str) -> list[int]:
        pattern = literal_pattern(text)
        return list(
            await self.repository.session.scalars(
                select(Usuario.codigo_usuario).where(
                    (Usuario.nombre_usuario + " " + Usuario.apellido_usuario).ilike(pattern)
                )
            )
        )

    async def assigned_administrators(self, ids: list[int]) -> dict[int, dict[str, object]]:
        rows = await self.repository.session.scalars(
            select(Usuario).where(
                Usuario.codigo_asilo_asignado.in_(ids), Usuario.rol == RolUsuario.ADMIN_ASILO
            )
        )
        return {
            row.codigo_asilo_asignado: {
                "userId": row.codigo_usuario,
                "name": f"{row.nombre_usuario} {row.apellido_usuario}",
            }
            for row in rows
            if row.codigo_asilo_asignado is not None
        }
