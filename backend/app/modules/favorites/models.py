from datetime import datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, Identity, Index, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.db.types import SCHEMA


class Favorito(Base):
    __tablename__ = "favoritos"
    __table_args__ = (
        UniqueConstraint("codigo_usuario", "codigo_asilo", name="uq_favoritos_usuario_asilo"),
        Index("ix_favoritos_asilo", "codigo_asilo"),
        {"schema": SCHEMA, "comment": "Asilos guardados por un usuario registrado"},
    )

    codigo_favorito: Mapped[int] = mapped_column(
        BigInteger, Identity(always=True), primary_key=True
    )
    codigo_usuario: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey(
            f"{SCHEMA}.usuarios.codigo_usuario",
            name="fk_favoritos_usuario",
            onupdate="CASCADE",
            ondelete="CASCADE",
        ),
        nullable=False,
    )
    codigo_asilo: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey(
            f"{SCHEMA}.asilos.codigo_asilo",
            name="fk_favoritos_asilo",
            onupdate="CASCADE",
            ondelete="CASCADE",
        ),
        nullable=False,
    )
    fecha_creacion: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
