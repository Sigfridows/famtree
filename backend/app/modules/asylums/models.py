from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Identity,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import CITEXT
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.db.types import SCHEMA, EstadoAsilo, estado_asilo_db

_GALERIA_COMMENT = "Galeria del centro. Entre 1 y 15 imagenes, exactamente una portada (RN06, RN07)"


class Provincia(Base):
    __tablename__ = "provincias"
    __table_args__ = (
        UniqueConstraint("nombre_provincia", name="uq_provincias_nombre"),
        CheckConstraint("length(btrim(nombre_provincia)) >= 3", name="ck_provincias_nombre"),
        {
            "schema": SCHEMA,
            "comment": (
                "Catalogo de provincias. Extraido de asilos para eliminar "
                "la dependencia transitiva (3FN)"
            ),
        },
    )

    codigo_provincia: Mapped[int] = mapped_column(
        BigInteger, Identity(always=True), primary_key=True
    )
    nombre_provincia: Mapped[str] = mapped_column(String(60), nullable=False)


class Municipio(Base):
    __tablename__ = "municipios"
    __table_args__ = (
        UniqueConstraint("codigo_provincia", "nombre_municipio", name="uq_municipios_nombre"),
        CheckConstraint("length(btrim(nombre_municipio)) >= 3", name="ck_municipios_nombre"),
        {
            "schema": SCHEMA,
            "comment": "Catalogo de municipios, dependiente de provincias",
        },
    )

    codigo_municipio: Mapped[int] = mapped_column(
        BigInteger, Identity(always=True), primary_key=True
    )
    codigo_provincia: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey(
            f"{SCHEMA}.provincias.codigo_provincia",
            name="fk_municipios_provincia",
            onupdate="CASCADE",
            ondelete="RESTRICT",
        ),
        nullable=False,
    )
    nombre_municipio: Mapped[str] = mapped_column(String(60), nullable=False)


class TipoAdultoMayor(Base):
    __tablename__ = "tipos_adulto_mayor"
    __table_args__ = (
        UniqueConstraint("nombre_tipo", name="uq_tipos_adulto_mayor_nombre"),
        {
            "schema": SCHEMA,
            "comment": "Catalogo de perfiles de residente que un centro puede atender",
        },
    )

    codigo_tipo: Mapped[int] = mapped_column(BigInteger, Identity(always=True), primary_key=True)
    nombre_tipo: Mapped[str] = mapped_column(String(100), nullable=False)
    estado_tipo: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))


class Servicio(Base):
    __tablename__ = "servicios"
    __table_args__ = (
        UniqueConstraint("nombre_servicio", name="uq_servicios_nombre"),
        {
            "schema": SCHEMA,
            "comment": "Catalogo de servicios que un centro puede ofrecer",
        },
    )

    codigo_servicio: Mapped[int] = mapped_column(
        BigInteger, Identity(always=True), primary_key=True
    )
    nombre_servicio: Mapped[str] = mapped_column(String(100), nullable=False)
    estado_servicio: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default=text("true")
    )


class Asilo(Base):
    __tablename__ = "asilos"
    __table_args__ = (
        CheckConstraint("length(btrim(nombre_asilo)) BETWEEN 5 AND 100", name="ck_asilos_nombre"),
        CheckConstraint(
            "length(btrim(descripcion_asilo)) BETWEEN 20 AND 1000",
            name="ck_asilos_descripcion",
        ),
        CheckConstraint(
            "length(btrim(requisitos_ingreso)) BETWEEN 10 AND 500",
            name="ck_asilos_requisitos",
        ),
        CheckConstraint("capacidad_total > 0", name="ck_asilos_capacidad"),
        CheckConstraint("precio_minimo > 0", name="ck_asilos_precio_min"),
        CheckConstraint("precio_maximo >= precio_minimo", name="ck_asilos_precio_rango"),
        CheckConstraint("latitud BETWEEN 17.0 AND 20.5", name="ck_asilos_latitud"),
        CheckConstraint("longitud BETWEEN -72.5 AND -68.0", name="ck_asilos_longitud"),
        CheckConstraint("telefono_asilo ~ '^[0-9]{10}$'", name="ck_asilos_telefono"),
        CheckConstraint(
            "email_asilo ~ '^[^@[:space:]]+@[^@[:space:]]+\\.[a-z]{2,}$'",
            name="ck_asilos_email",
        ),
        CheckConstraint(
            "sitio_web IS NULL OR sitio_web ~* '^https?://'", name="ck_asilos_sitio_web"
        ),
        CheckConstraint("fecha_actualizacion >= fecha_creacion", name="ck_asilos_fechas"),
        Index("ix_asilos_municipio", "codigo_municipio"),
        Index(
            "ix_asilos_activos",
            "codigo_municipio",
            "nombre_asilo",
            postgresql_where=text("estado_asilo = 'ACTIVO'"),
        ),
        Index("ix_asilos_coordenadas", "latitud", "longitud"),
        Index("ix_asilos_precio", "precio_minimo", "precio_maximo"),
        Index(
            "ix_asilos_nombre_normalizado",
            text(
                "lower(famtree.f_unaccent(regexp_replace(btrim(nombre_asilo), '\\s+', ' ', 'g')))"
            ),
        ),
        {
            "schema": SCHEMA,
            "comment": "Centro de atencion. Baja logica via estado_asilo, nunca DELETE (RN05)",
        },
    )

    codigo_asilo: Mapped[int] = mapped_column(BigInteger, Identity(always=True), primary_key=True)
    codigo_municipio: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey(
            f"{SCHEMA}.municipios.codigo_municipio",
            name="fk_asilos_municipio",
            onupdate="CASCADE",
            ondelete="RESTRICT",
        ),
        nullable=False,
    )
    nombre_asilo: Mapped[str] = mapped_column(String(100), nullable=False)
    descripcion_asilo: Mapped[str] = mapped_column(Text, nullable=False)
    sector_asilo: Mapped[str] = mapped_column(String(100), nullable=False)
    direccion_asilo: Mapped[str] = mapped_column(String(200), nullable=False)
    latitud: Mapped[Decimal] = mapped_column(Numeric(9, 6), nullable=False)
    longitud: Mapped[Decimal] = mapped_column(Numeric(9, 6), nullable=False)
    capacidad_total: Mapped[int] = mapped_column(Integer, nullable=False)
    precio_minimo: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    precio_maximo: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    requisitos_ingreso: Mapped[str] = mapped_column(String(500), nullable=False)
    certificaciones: Mapped[str | None] = mapped_column(String(250))
    telefono_asilo: Mapped[str] = mapped_column(String(10), nullable=False)
    email_asilo: Mapped[str] = mapped_column(CITEXT, nullable=False)
    sitio_web: Mapped[str | None] = mapped_column(String(255))
    estado_asilo: Mapped[EstadoAsilo] = mapped_column(
        estado_asilo_db,
        nullable=False,
        server_default=EstadoAsilo.ACTIVO.value,
        comment="INACTIVO sale del catalogo, del mapa y de las busquedas (RN05)",
    )
    fecha_creacion: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    fecha_actualizacion: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


_nombre_asilo_sin_acentos = func.famtree.f_unaccent(Asilo.nombre_asilo).label(
    "nombre_asilo_sin_acentos"
)
Index(
    "ix_asilos_nombre_trgm",
    _nombre_asilo_sin_acentos,
    postgresql_using="gin",
    postgresql_ops={"nombre_asilo_sin_acentos": "gin_trgm_ops"},
)


class ImagenAsilo(Base):
    __tablename__ = "imagenes_asilo"
    __table_args__ = (
        UniqueConstraint("codigo_asilo", "url", name="uq_imagenes_asilo_url"),
        CheckConstraint("length(btrim(url)) > 0", name="ck_imagenes_asilo_url"),
        Index(
            "uq_imagenes_asilo_portada",
            "codigo_asilo",
            unique=True,
            postgresql_where=text("es_portada"),
        ),
        {
            "schema": SCHEMA,
            "comment": _GALERIA_COMMENT,
        },
    )

    codigo_imagen: Mapped[int] = mapped_column(BigInteger, Identity(always=True), primary_key=True)
    codigo_asilo: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey(
            f"{SCHEMA}.asilos.codigo_asilo",
            name="fk_imagenes_asilo_asilo",
            onupdate="CASCADE",
            ondelete="CASCADE",
        ),
        nullable=False,
    )
    url: Mapped[str] = mapped_column(String(255), nullable=False)
    es_portada: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    fecha_creacion: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


class AsiloTipoAdulto(Base):
    __tablename__ = "asilos_tipos_adulto"
    __table_args__ = (
        UniqueConstraint("codigo_asilo", "codigo_tipo", name="uq_asilos_tipos_adulto"),
        Index("ix_asilos_tipos_adulto_tipo", "codigo_tipo"),
        {
            "schema": SCHEMA,
            "comment": "Asociativa: resuelve el muchos a muchos asilos <-> tipos_adulto_mayor",
        },
    )

    codigo_tipo_asilo: Mapped[int] = mapped_column(
        BigInteger, Identity(always=True), primary_key=True
    )
    codigo_asilo: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey(
            f"{SCHEMA}.asilos.codigo_asilo",
            name="fk_asilos_tipos_adulto_asilo",
            onupdate="CASCADE",
            ondelete="CASCADE",
        ),
        nullable=False,
    )
    codigo_tipo: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey(
            f"{SCHEMA}.tipos_adulto_mayor.codigo_tipo",
            name="fk_asilos_tipos_adulto_tipo",
            onupdate="CASCADE",
            ondelete="RESTRICT",
        ),
        nullable=False,
    )


class AsiloServicio(Base):
    __tablename__ = "asilos_servicios"
    __table_args__ = (
        UniqueConstraint("codigo_asilo", "codigo_servicio", name="uq_asilos_servicios"),
        Index("ix_asilos_servicios_servicio", "codigo_servicio"),
        {
            "schema": SCHEMA,
            "comment": "Asociativa: resuelve el muchos a muchos asilos <-> servicios",
        },
    )

    codigo_servicio_asilo: Mapped[int] = mapped_column(
        BigInteger, Identity(always=True), primary_key=True
    )
    codigo_asilo: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey(
            f"{SCHEMA}.asilos.codigo_asilo",
            name="fk_asilos_servicios_asilo",
            onupdate="CASCADE",
            ondelete="CASCADE",
        ),
        nullable=False,
    )
    codigo_servicio: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey(
            f"{SCHEMA}.servicios.codigo_servicio",
            name="fk_asilos_servicios_servicio",
            onupdate="CASCADE",
            ondelete="RESTRICT",
        ),
        nullable=False,
    )
