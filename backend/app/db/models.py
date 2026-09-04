"""Import every approved feature model so Alembic sees one complete metadata graph."""

from app.modules.administration.models import BloqueoUsuario
from app.modules.asylums.models import (
    Asilo,
    AsiloServicio,
    AsiloTipoAdulto,
    ImagenAsilo,
    Municipio,
    Provincia,
    Servicio,
    TipoAdultoMayor,
)
from app.modules.favorites.models import Favorito
from app.modules.notifications.models import Notificacion
from app.modules.reviews.models import ReporteResena, Resena
from app.modules.users.models import PreferenciaNotificacion, Usuario

__all__ = [
    "Asilo",
    "AsiloServicio",
    "AsiloTipoAdulto",
    "BloqueoUsuario",
    "Favorito",
    "ImagenAsilo",
    "Municipio",
    "Notificacion",
    "PreferenciaNotificacion",
    "Provincia",
    "ReporteResena",
    "Resena",
    "Servicio",
    "TipoAdultoMayor",
    "Usuario",
]


def load_models() -> None:
    """Make the metadata-loading side effect explicit to Alembic."""
