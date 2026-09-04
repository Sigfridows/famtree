from datetime import datetime

from sqlalchemy import (
    BigInteger,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Identity,
    Index,
    SmallInteger,
    String,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.db.types import (
    SCHEMA,
    EstadoReporte,
    EstadoResena,
    MotivoReporte,
    estado_reporte_db,
    estado_resena_db,
    motivo_reporte_db,
)


class Resena(Base):
    __tablename__ = "resenas"
    __table_args__ = (
        UniqueConstraint("codigo_usuario", "codigo_asilo", name="uq_resenas_usuario_asilo"),
        CheckConstraint("calificacion BETWEEN 1 AND 5", name="ck_resenas_calificacion"),
        CheckConstraint(
            "length(btrim(comentario)) BETWEEN 10 AND 500",
            name="ck_resenas_comentario",
        ),
        CheckConstraint(
            "fecha_actualizacion IS NULL OR fecha_actualizacion >= fecha_publicacion",
            name="ck_resenas_fechas",
        ),
        Index("ix_resenas_asilo", "codigo_asilo"),
        Index(
            "ix_resenas_asilo_publicadas",
            "codigo_asilo",
            text("fecha_publicacion DESC"),
            postgresql_where=text("estado_resena = 'PUBLICADA'"),
        ),
        {"schema": SCHEMA, "comment": "Una resena por usuario y asilo (RN08)"},
    )

    codigo_resena: Mapped[int] = mapped_column(BigInteger, Identity(always=True), primary_key=True)
    codigo_usuario: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey(
            f"{SCHEMA}.usuarios.codigo_usuario",
            name="fk_resenas_usuario",
            onupdate="CASCADE",
            ondelete="RESTRICT",
        ),
        nullable=False,
    )
    codigo_asilo: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey(
            f"{SCHEMA}.asilos.codigo_asilo",
            name="fk_resenas_asilo",
            onupdate="CASCADE",
            ondelete="CASCADE",
        ),
        nullable=False,
    )
    calificacion: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    comentario: Mapped[str] = mapped_column(String(500), nullable=False)
    estado_resena: Mapped[EstadoResena] = mapped_column(
        estado_resena_db, nullable=False, server_default=EstadoResena.PUBLICADA.value
    )
    fecha_publicacion: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    fecha_actualizacion: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), comment="NULL mientras la resena nunca se edito"
    )


class ReporteResena(Base):
    __tablename__ = "reportes_resena"
    __table_args__ = (
        UniqueConstraint("codigo_resena", "codigo_denunciante", name="uq_reportes_denunciante"),
        CheckConstraint(
            "detalle IS NULL OR length(btrim(detalle)) BETWEEN 10 AND 250",
            name="ck_reportes_detalle",
        ),
        CheckConstraint(
            "(estado_reporte = 'PENDIENTE' AND codigo_moderador IS NULL "
            "AND justificacion IS NULL AND fecha_resolucion IS NULL) OR "
            "(estado_reporte <> 'PENDIENTE' AND codigo_moderador IS NOT NULL "
            "AND justificacion IS NOT NULL "
            "AND length(btrim(justificacion)) BETWEEN 10 AND 300 "
            "AND fecha_resolucion IS NOT NULL "
            "AND fecha_resolucion >= fecha_reporte)",
            name="ck_reportes_resolucion",
        ),
        Index("ix_reportes_denunciante", "codigo_denunciante"),
        Index("ix_reportes_moderador", "codigo_moderador"),
        Index(
            "ix_reportes_pendientes",
            "fecha_reporte",
            postgresql_where=text("estado_reporte = 'PENDIENTE'"),
        ),
        {"schema": SCHEMA, "comment": "Denuncias de resenas y su moderacion"},
    )

    codigo_reporte: Mapped[int] = mapped_column(BigInteger, Identity(always=True), primary_key=True)
    codigo_resena: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey(
            f"{SCHEMA}.resenas.codigo_resena",
            name="fk_reportes_resena",
            onupdate="CASCADE",
            ondelete="CASCADE",
        ),
        nullable=False,
    )
    codigo_denunciante: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey(
            f"{SCHEMA}.usuarios.codigo_usuario",
            name="fk_reportes_denunciante",
            onupdate="CASCADE",
            ondelete="RESTRICT",
        ),
        nullable=False,
    )
    codigo_moderador: Mapped[int | None] = mapped_column(
        BigInteger,
        ForeignKey(
            f"{SCHEMA}.usuarios.codigo_usuario",
            name="fk_reportes_moderador",
            onupdate="CASCADE",
            ondelete="RESTRICT",
        ),
    )
    motivo: Mapped[MotivoReporte] = mapped_column(motivo_reporte_db, nullable=False)
    detalle: Mapped[str | None] = mapped_column(String(250))
    justificacion: Mapped[str | None] = mapped_column(String(300))
    estado_reporte: Mapped[EstadoReporte] = mapped_column(
        estado_reporte_db, nullable=False, server_default=EstadoReporte.PENDIENTE.value
    )
    fecha_reporte: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    fecha_resolucion: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
