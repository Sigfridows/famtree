import logging

from sqlalchemy import insert
from sqlalchemy.exc import SQLAlchemyError

from app.core.errors import AppError
from app.db.types import TipoEventoNotificacion
from app.modules.notifications.models import Notificacion
from app.modules.notifications.repository import NotificationRepository
from app.modules.notifications.schemas import NotificationView, Preferences, PreferenceUpdate
from app.modules.users import UserDirectory

logger = logging.getLogger(__name__)

EVENT_NAMES = {
    TipoEventoNotificacion.ESTADO_FAVORITO: "FAVORITE_STATUS",
    TipoEventoNotificacion.ACTUALIZACION_FAVORITO: "FAVORITE_UPDATE",
    TipoEventoNotificacion.RESOLUCION_REPORTE: "REPORT_RESOLUTION",
}


class NotificationService:
    def __init__(self, repository: NotificationRepository, users: UserDirectory) -> None:
        self.repository = repository
        self.users = users

    async def list_for_user(self, user_id: int, offset: int, limit: int) -> list[NotificationView]:
        return [
            NotificationView(
                notification_id=n.codigo_notificacion,
                user_id=n.codigo_usuario,
                asylum_id=n.codigo_asilo,
                review_id=n.codigo_resena,
                event_type=EVENT_NAMES[n.tipo_evento],
                title=n.titulo,
                message=n.mensaje,
                is_read=n.leida,
                created_at=n.fecha_creacion,
                resolution_snapshot=n.resolution_snapshot,
            )
            for n in await self.repository.list_for_user(user_id, offset, limit)
        ]

    async def unread(self, user_id: int) -> int:
        return await self.repository.unread(user_id)

    async def read(self, user_id: int, notification_id: int | None = None) -> None:
        found = await self.repository.read(user_id, notification_id)
        if not found and notification_id is not None:
            raise AppError(
                code="notification_not_found", message="Notificación no disponible", status_code=404
            )
        await self.repository.session.commit()

    async def preferences(self, user_id: int) -> Preferences:
        return Preferences.model_validate(await self.users.preferences(user_id))

    async def update_preferences(self, user_id: int, data: PreferenceUpdate) -> Preferences:
        if any(value is None for value in data.model_dump(exclude_unset=True).values()):
            raise AppError(
                code="invalid_preferences",
                message="Las preferencias deben ser booleanos",
                status_code=422,
            )
        result = await self.users.update_preferences(user_id, data.model_dump(exclude_unset=True))
        await self.repository.session.commit()
        return Preferences.model_validate(result)

    async def center_event(
        self, recipients: list[int], asylum_id: int, *, status_changed: bool, center_name: str
    ) -> None:
        event = (
            TipoEventoNotificacion.ESTADO_FAVORITO
            if status_changed
            else TipoEventoNotificacion.ACTUALIZACION_FAVORITO
        )
        for user_id in recipients:
            await self.emit(
                {
                    "codigo_usuario": user_id,
                    "codigo_asilo": asylum_id,
                    "tipo_evento": event,
                    "titulo": "Actualización de un centro favorito",
                    "mensaje": (
                        f"El centro {center_name} ha actualizado "
                        + ("su disponibilidad." if status_changed else "su información.")
                    ),
                }
            )

    async def moderation_event(self, user_id: int, snapshot: dict[str, object]) -> None:
        await self.emit(
            {
                "codigo_usuario": user_id,
                "resolution_snapshot": snapshot,
                "tipo_evento": TipoEventoNotificacion.RESOLUCION_REPORTE,
                "titulo": "Resolución de reporte",
                "mensaje": (
                    "Tu reporte fue descartado; la reseña permanece publicada."
                    if snapshot.get("status") == "DISCARDED"
                    else "Tu reporte fue aceptado y la reseña fue eliminada."
                ),
            }
        )

    async def emit(self, values: dict[str, object]) -> None:
        # Flush the main change before the savepoint, then isolate optional notification failure.
        await self.repository.session.flush()
        try:
            async with self.repository.session.begin_nested():
                await self.repository.session.execute(
                    insert(Notificacion).values(**values).inline()
                )
        except SQLAlchemyError:
            logger.warning(
                "notification_delivery_failed", extra={"user_id": values["codigo_usuario"]}
            )
