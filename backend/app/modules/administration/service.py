import secrets
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import AppError
from app.core.mail import CredentialMailer
from app.core.passwords import hash_password
from app.db.types import RolUsuario
from app.modules.administration.models import BloqueoUsuario
from app.modules.administration.schemas import CreateCenterAdmin, TemporaryAccount
from app.modules.asylums.access import CenterAccess
from app.modules.auth.repository import AuthRepository
from app.modules.users.service import UserDirectory


class AdministrationService:
    def __init__(
        self,
        session: AsyncSession,
        users: UserDirectory,
        auth: AuthRepository,
        centers: CenterAccess,
        mailer: CredentialMailer,
    ) -> None:
        self.session = session
        self.users = users
        self.auth = auth
        self.centers = centers
        self.mailer = mailer

    async def block(self, user_id: int, admin_id: int, reason: str) -> None:
        user = await self.users.get(user_id)
        if user.role == "SYSTEM_ADMIN" or user_id == admin_id:
            raise AppError(code="protected_account", message="Cuenta protegida", status_code=403)
        await self.auth.guard(user.username)
        existing = await self.session.scalar(
            select(BloqueoUsuario)
            .where(
                BloqueoUsuario.codigo_usuario == user_id, BloqueoUsuario.fecha_desbloqueo.is_(None)
            )
            .with_for_update()
        )
        if existing is None:
            self.session.add(
                BloqueoUsuario(codigo_usuario=user_id, codigo_admin_bloqueo=admin_id, motivo=reason)
            )
        await self.auth.revoke_user(user_id)
        await self.session.commit()

    async def unblock(self, user_id: int, admin_id: int) -> None:
        user = await self.users.get(user_id)
        await self.auth.guard(user.username)
        existing = await self.session.scalar(
            select(BloqueoUsuario)
            .where(
                BloqueoUsuario.codigo_usuario == user_id, BloqueoUsuario.fecha_desbloqueo.is_(None)
            )
            .with_for_update()
        )
        if existing is not None:
            existing.codigo_admin_desbloqueo = admin_id
            existing.fecha_desbloqueo = datetime.now(UTC)
        await self.session.commit()

    async def create_admin(self, data: CreateCenterAdmin) -> TemporaryAccount:
        center_name = await self.centers.lock_existing(data.assigned_asylum_id)
        previous = await self.users.release_assignment(data.assigned_asylum_id)
        if previous is not None:
            await self.auth.revoke_user(previous)
        password = "Ft9!" + secrets.token_urlsafe(24)
        user = await self.users.create(
            **data.model_dump(exclude={"assigned_asylum_id"}),
            password_hash=await hash_password(password),
            role=RolUsuario.ADMIN_ASILO,
            assigned_asylum_id=data.assigned_asylum_id,
            temporary=True,
        )
        await self.session.commit()
        delivered = await self.mailer.send(user.email, user.username, password, center_name)
        return TemporaryAccount(user=user, temporary_password=password, email_delivered=delivered)

    async def history(self, user_id: int) -> list[dict[str, object]]:
        await self.users.get(user_id)
        rows = await self.session.scalars(
            select(BloqueoUsuario)
            .where(BloqueoUsuario.codigo_usuario == user_id)
            .order_by(BloqueoUsuario.codigo_bloqueo.desc())
        )
        return [
            {
                "id": row.codigo_bloqueo,
                "reason": row.motivo,
                "blockedBy": row.codigo_admin_bloqueo,
                "blockedAt": row.fecha_bloqueo,
                "unblockedBy": row.codigo_admin_desbloqueo,
                "unblockedAt": row.fecha_desbloqueo,
            }
            for row in rows
        ]
