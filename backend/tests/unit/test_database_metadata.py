from app.db.base import Base
from app.db.models import load_models


def test_approved_tables_are_registered_by_feature_models() -> None:
    load_models()

    assert set(Base.metadata.tables) == {
        "famtree.asilos",
        "famtree.asilos_servicios",
        "famtree.asilos_tipos_adulto",
        "famtree.bloqueos_usuario",
        "famtree.favoritos",
        "famtree.imagenes_asilo",
        "famtree.municipios",
        "famtree.notificaciones",
        "famtree.preferencias_notificacion",
        "famtree.provincias",
        "famtree.reportes_resena",
        "famtree.resenas",
        "famtree.servicios",
        "famtree.tipos_adulto_mayor",
        "famtree.usuarios",
    }
