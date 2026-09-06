from enum import StrEnum

from sqlalchemy import Enum

SCHEMA = "famtree"


class EstadoAsilo(StrEnum):
    ACTIVO = "ACTIVO"
    INACTIVO = "INACTIVO"


class RolUsuario(StrEnum):
    USUARIO_REGISTRADO = "USUARIO_REGISTRADO"
    ADMIN_ASILO = "ADMIN_ASILO"
    ADMIN_SISTEMA = "ADMIN_SISTEMA"


class EstadoUsuario(StrEnum):
    ACTIVO = "ACTIVO"
    BLOQUEADO = "BLOQUEADO"


class EstadoResena(StrEnum):
    PUBLICADA = "PUBLICADA"
    OCULTA = "OCULTA"


class MotivoReporte(StrEnum):
    LENGUAJE_OFENSIVO = "LENGUAJE_OFENSIVO"
    INFO_FALSA = "INFO_FALSA"
    SPAM = "SPAM"
    CONFLICTO_INTERES = "CONFLICTO_INTERES"
    OTRO = "OTRO"


class EstadoReporte(StrEnum):
    PENDIENTE = "PENDIENTE"
    DESCARTADO = "DESCARTADO"
    RESENA_ELIMINADA = "RESENA_ELIMINADA"


class TipoEventoNotificacion(StrEnum):
    ESTADO_FAVORITO = "ESTADO_FAVORITO"
    ACTUALIZACION_FAVORITO = "ACTUALIZACION_FAVORITO"
    RESOLUCION_REPORTE = "RESOLUCION_REPORTE"


def _values(enum_class: type[StrEnum]) -> list[str]:
    return [member.value for member in enum_class]


estado_asilo_db = Enum(
    EstadoAsilo,
    name="estado_asilo",
    schema=SCHEMA,
    values_callable=_values,
)
rol_usuario_db = Enum(
    RolUsuario,
    name="rol_usuario",
    schema=SCHEMA,
    values_callable=_values,
)
estado_usuario_db = Enum(
    EstadoUsuario,
    name="estado_usuario",
    schema=SCHEMA,
    values_callable=_values,
)
estado_resena_db = Enum(
    EstadoResena,
    name="estado_resena",
    schema=SCHEMA,
    values_callable=_values,
)
motivo_reporte_db = Enum(
    MotivoReporte,
    name="motivo_reporte",
    schema=SCHEMA,
    values_callable=_values,
)
estado_reporte_db = Enum(
    EstadoReporte,
    name="estado_reporte",
    schema=SCHEMA,
    values_callable=_values,
)
tipo_evento_notificacion_db = Enum(
    TipoEventoNotificacion,
    name="tipo_evento_notificacion",
    schema=SCHEMA,
    values_callable=_values,
)
