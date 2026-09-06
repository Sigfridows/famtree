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
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import CITEXT
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.db.types import (
    SCHEMA,
    EstadoUsuario,
    RolUsuario,
    estado_usuario_db,
    rol_usuario_db,
)


class Usuario(Base):
    __tablename__ = "usuarios"
    __table_args__ = (
        UniqueConstraint("username", name="uq_usuarios_username"),
        UniqueConstraint("email", name="uq_usuarios_email"),
        CheckConstraint(
            "length(username::text) BETWEEN 3 AND 16 "
            "AND username::text ~ '^[A-Za-z0-9]+([.][A-Za-z0-9]+)*$'",
            name="ck_usuarios_username",
        ),
        CheckConstraint(
            "email ~ '^[^@[:space:]]+@[^@[:space:]]+\\.[a-z]{2,}$'",
            name="ck_usuarios_email",
        ),
        CheckConstraint(
            "telefono IS NULL OR telefono ~ '^[0-9]{10}$'", name="ck_usuarios_telefono"
        ),
        CheckConstraint("length(btrim(nombre_usuario)) >= 2", name="ck_usuarios_nombre"),
        CheckConstraint("length(btrim(apellido_usuario)) >= 2", name="ck_usuarios_apellido"),
        CheckConstraint("length(password_hash) >= 20", name="ck_usuarios_password"),
        CheckConstraint(
            "(rol = 'ADMIN_ASILO' AND codigo_asilo_asignado IS NOT NULL) OR "
            "(rol <> 'ADMIN_ASILO' AND codigo_asilo_asignado IS NULL)",
            name="ck_usuarios_asignacion",
        ),
        CheckConstraint(
            "rol <> 'ADMIN_ASILO' OR telefono IS NOT NULL",
            name="ck_usuarios_telefono_admin",
        ),
        CheckConstraint(
            "rol = 'USUARIO_REGISTRADO' OR (foto_perfil IS NULL AND descripcion IS NULL)",
            name="ck_usuarios_perfil_por_rol",
        ),
        CheckConstraint(
            "rol = 'ADMIN_ASILO' OR requiere_cambio_clave = FALSE",
            name="ck_usuarios_cambio_clave_por_rol",
        ),
        Index(
            "uq_usuarios_admin_asilo_asignado",
            "codigo_asilo_asignado",
            unique=True,
            postgresql_where=text("rol = 'ADMIN_ASILO'"),
        ),
        Index("ix_usuarios_rol_estado", "rol", "estado"),
        {"schema": SCHEMA, "comment": "Cuentas de la plataforma en sus tres roles"},
    )

    codigo_usuario: Mapped[int] = mapped_column(BigInteger, Identity(always=True), primary_key=True)
    codigo_asilo_asignado: Mapped[int | None] = mapped_column(
        BigInteger,
        ForeignKey(
            f"{SCHEMA}.asilos.codigo_asilo",
            name="fk_usuarios_asilo",
            onupdate="CASCADE",
            ondelete="RESTRICT",
        ),
    )
    nombre_usuario: Mapped[str] = mapped_column(String(50), nullable=False)
    apellido_usuario: Mapped[str] = mapped_column(String(50), nullable=False)
    username: Mapped[str] = mapped_column(CITEXT, nullable=False)
    email: Mapped[str] = mapped_column(CITEXT, nullable=False)
    telefono: Mapped[str | None] = mapped_column(String(10))
    password_hash: Mapped[str] = mapped_column(
        String(255), nullable=False, comment="Hash Argon2id. Nunca la contrasena en claro"
    )
    foto_perfil: Mapped[str | None] = mapped_column(String(255))
    descripcion: Mapped[str | None] = mapped_column(Text)
    rol: Mapped[RolUsuario] = mapped_column(
        rol_usuario_db, nullable=False, server_default=RolUsuario.USUARIO_REGISTRADO.value
    )
    estado: Mapped[EstadoUsuario] = mapped_column(
        estado_usuario_db,
        nullable=False,
        server_default=EstadoUsuario.ACTIVO.value,
        comment="Espejo del bloqueo vigente. Lo mantiene tg_bloqueos_sincronizar_estado",
    )
    requiere_cambio_clave: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default=text("false"),
        comment="TRUE mientras el ADMIN_ASILO no cambie la clave temporal (HU40)",
    )
    fecha_registro: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


class PreferenciaNotificacion(Base):
    __tablename__ = "preferencias_notificacion"
    __table_args__ = (
        UniqueConstraint("codigo_usuario", name="uq_preferencias_usuario"),
        {
            "schema": SCHEMA,
            "comment": "Relacion 1:1 exclusiva del USUARIO_REGISTRADO. Se sincroniza con el rol",
        },
    )

    codigo_preferencia: Mapped[int] = mapped_column(
        BigInteger, Identity(always=True), primary_key=True
    )
    codigo_usuario: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey(
            f"{SCHEMA}.usuarios.codigo_usuario",
            name="fk_preferencias_usuario",
            onupdate="CASCADE",
            ondelete="CASCADE",
        ),
        nullable=False,
    )
    alerta_disponibilidad: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default=text("true")
    )
    alerta_actualizacion: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default=text("true")
    )
    alerta_moderacion: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default=text("true")
    )
