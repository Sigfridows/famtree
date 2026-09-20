from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.notifications.models import Notificacion


class NotificationRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def list_for_user(self, user_id: int, offset: int, limit: int) -> list[Notificacion]:
        return list(
            await self.session.scalars(
                select(Notificacion)
                .where(Notificacion.codigo_usuario == user_id)
                .order_by(Notificacion.codigo_notificacion.desc())
                .offset(offset)
                .limit(limit)
            )
        )

    async def unread(self, user_id: int) -> int:
        return int(
            await self.session.scalar(
                select(func.count())
                .select_from(Notificacion)
                .where(Notificacion.codigo_usuario == user_id, Notificacion.leida.is_(False))
            )
            or 0
        )

    async def read(self, user_id: int, notification_id: int | None) -> bool:
        query = update(Notificacion).where(Notificacion.codigo_usuario == user_id)
        if notification_id is not None:
            query = query.where(Notificacion.codigo_notificacion == notification_id)
        rows = await self.session.scalars(
            query.values(leida=True).returning(Notificacion.codigo_notificacion)
        )
        return bool(rows.all())
