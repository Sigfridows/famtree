from datetime import datetime

from sqlalchemy import (
    BigInteger,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Identity,
    Index,
    String,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.db.types import SCHEMA


class BloqueoUsuario(Base):
    __tablename__ = "bloqueos_usuario"
    __table_args__ = (
        CheckConstraint("length(btrim(motivo)) BETWEEN 10 AND 300", name="ck_bloqueos_motivo"),
        CheckConstraint(
            "codigo_usuario <> codigo_admin_bloqueo",
            name="ck_bloqueos_no_autobloqueo",
        ),
        CheckConstraint(
            "(fecha_desbloqueo IS NULL AND codigo_admin_desbloqueo IS NULL) OR "
            "(fecha_desbloqueo IS NOT NULL AND codigo_admin_desbloqueo IS NOT NULL "
            "AND fecha_desbloqueo >= fecha_bloqueo)",
            name="ck_bloqueos_desbloqueo",
        ),
        Index(
            "uq_bloqueos_vigente",
            "codigo_usuario",
            unique=True,
            postgresql_where=text("fecha_desbloqueo IS NULL"),
        ),
        Index("ix_bloqueos_usuario", "codigo_usuario"),
        Index("ix_bloqueos_admin_bloqueo", "codigo_admin_bloqueo"),
        Index("ix_bloqueos_admin_desbloqueo", "codigo_admin_desbloqueo"),
        {
            "schema": SCHEMA,
            "comment": "Historial de bloqueos. HU34/HU35 exigen quien, cuando y por que",
        },
    )

    codigo_bloqueo: Mapped[int] = mapped_column(BigInteger, Identity(always=True), primary_key=True)
    codigo_usuario: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey(
            f"{SCHEMA}.usuarios.codigo_usuario",
            name="fk_bloqueos_usuario",
            onupdate="CASCADE",
            ondelete="RESTRICT",
        ),
        nullable=False,
    )
    codigo_admin_bloqueo: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey(
            f"{SCHEMA}.usuarios.codigo_usuario",
            name="fk_bloqueos_admin_bloqueo",
            onupdate="CASCADE",
            ondelete="RESTRICT",
        ),
        nullable=False,
    )
    codigo_admin_desbloqueo: Mapped[int | None] = mapped_column(
        BigInteger,
        ForeignKey(
            f"{SCHEMA}.usuarios.codigo_usuario",
            name="fk_bloqueos_admin_desbloqueo",
            onupdate="CASCADE",
            ondelete="RESTRICT",
        ),
    )
    motivo: Mapped[str] = mapped_column(String(300), nullable=False)
    fecha_bloqueo: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    fecha_desbloqueo: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
