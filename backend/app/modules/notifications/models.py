from datetime import datetime

from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Identity,
    Index,
    String,
    Text,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.db.types import (
    SCHEMA,
    TipoEventoNotificacion,
    tipo_evento_notificacion_db,
)


class Notificacion(Base):
    __tablename__ = "notificaciones"
    __table_args__ = (
        CheckConstraint("length(btrim(titulo)) > 0", name="ck_notificaciones_titulo"),
        CheckConstraint(
            "(tipo_evento = 'RESOLUCION_REPORTE' AND codigo_resena IS NOT NULL "
            "AND codigo_asilo IS NULL) OR "
            "(tipo_evento <> 'RESOLUCION_REPORTE' AND codigo_asilo IS NOT NULL "
            "AND codigo_resena IS NULL)",
            name="ck_notificaciones_origen",
        ),
        Index("ix_notificaciones_asilo", "codigo_asilo"),
        Index("ix_notificaciones_resena", "codigo_resena"),
        Index(
            "ix_notificaciones_no_leidas",
            "codigo_usuario",
            text("fecha_creacion DESC"),
            postgresql_where=text("leida = FALSE"),
        ),
        {
            "schema": SCHEMA,
            "comment": "Avisos al usuario. Origen tipado con FK reales, no polimorfico",
        },
    )

    codigo_notificacion: Mapped[int] = mapped_column(
        BigInteger, Identity(always=True), primary_key=True
    )
    codigo_usuario: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey(
            f"{SCHEMA}.usuarios.codigo_usuario",
            name="fk_notificaciones_usuario",
            onupdate="CASCADE",
            ondelete="CASCADE",
        ),
        nullable=False,
    )
    codigo_asilo: Mapped[int | None] = mapped_column(
        BigInteger,
        ForeignKey(
            f"{SCHEMA}.asilos.codigo_asilo",
            name="fk_notificaciones_asilo",
            onupdate="CASCADE",
            ondelete="CASCADE",
        ),
        comment="Origen del aviso cuando el evento es de un centro. Excluyente con codigo_resena",
    )
    codigo_resena: Mapped[int | None] = mapped_column(
        BigInteger,
        ForeignKey(
            f"{SCHEMA}.resenas.codigo_resena",
            name="fk_notificaciones_resena",
            onupdate="CASCADE",
            ondelete="CASCADE",
        ),
        comment="Origen del aviso cuando el evento es de moderacion. Excluyente con codigo_asilo",
    )
    tipo_evento: Mapped[TipoEventoNotificacion] = mapped_column(
        tipo_evento_notificacion_db, nullable=False
    )
    titulo: Mapped[str] = mapped_column(String(150), nullable=False)
    mensaje: Mapped[str] = mapped_column(Text, nullable=False)
    leida: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    fecha_creacion: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
