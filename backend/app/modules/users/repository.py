from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.pagination import AdminQuery, literal_pattern
from app.db.types import EstadoUsuario, RolUsuario
from app.modules.users.models import Usuario


class UserRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get(self, user_id: int, *, lock: bool = False) -> Usuario | None:
        query = (
            select(Usuario)
            .where(Usuario.codigo_usuario == user_id)
            .execution_options(populate_existing=True)
        )
        if lock:
            query = query.with_for_update()
        return (await self.session.scalars(query)).first()

    async def by_username(self, username: str) -> Usuario | None:
        return (
            await self.session.scalars(select(Usuario).where(Usuario.username == username))
        ).first()

    async def list_users(self, offset: int, limit: int) -> list[Usuario]:
        return list(
            await self.session.scalars(
                select(Usuario).order_by(Usuario.codigo_usuario).offset(offset).limit(limit)
            )
        )

    async def filtered(self, filters: AdminQuery) -> tuple[list[Usuario], int]:
        query = select(Usuario)
        if filters.q:
            pattern = literal_pattern(filters.q)
            query = query.where(
                or_(
                    (Usuario.nombre_usuario + " " + Usuario.apellido_usuario).ilike(pattern),
                    Usuario.email.ilike(pattern),
                )
            )
        if filters.role:
            roles = {
                "REGISTERED_USER": RolUsuario.USUARIO_REGISTRADO,
                "ASYLUM_ADMIN": RolUsuario.ADMIN_ASILO,
                "SYSTEM_ADMIN": RolUsuario.ADMIN_SISTEMA,
            }
            query = query.where(Usuario.rol == roles[filters.role])
        if filters.status:
            query = query.where(
                Usuario.estado
                == (EstadoUsuario.ACTIVO if filters.status == "ACTIVE" else EstadoUsuario.BLOQUEADO)
            )
        total = await self.session.scalar(select(func.count()).select_from(query.subquery())) or 0
        rows = await self.session.scalars(
            query.order_by(Usuario.codigo_usuario).offset((filters.page - 1) * 20).limit(20)
        )
        return list(rows), total
