"""Human-readable labels shared by PDF and CSV exports."""

from datetime import datetime

LABELS = {
    "id": "ID",
    "name": "Nombre",
    "firstName": "Nombre",
    "lastName": "Apellido",
    "email": "Correo",
    "role": "Rol",
    "status": "Estado",
    "provinceId": "ID de provincia",
    "province": "Provincia",
    "municipality": "Municipio",
    "capacity": "Capacidad",
    "minPrice": "Precio mínimo (RD$)",
    "maxPrice": "Precio máximo (RD$)",
    "createdAt": "Fecha de registro",
    "asylum": "Asilo",
    "authorId": "ID del autor",
    "rating": "Calificación",
    "comment": "Comentario",
}
VALUES = {
    "ADMIN_SISTEMA": "Administrador del sistema",
    "ADMIN_ASILO": "Administrador de asilo",
    "USUARIO_REGISTRADO": "Usuario registrado",
    "ACTIVO": "Activo",
    "INACTIVO": "Inactivo",
    "BLOQUEADO": "Bloqueado",
    "PUBLICADA": "Publicada",
    "OCULTA": "Oculta",
}


def value_label(key: str, value: object) -> str:
    if value is None:
        return "No informado"
    if key in {"minPrice", "maxPrice"}:
        return f"RD$ {float(str(value)):,.2f}"
    if isinstance(value, datetime):
        return value.strftime("%d/%m/%Y %H:%M")
    return VALUES.get(str(value), str(value))
