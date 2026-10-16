"""Complete Dominican municipalities without replacing catalog rows or references.

Source: Oficina Nacional de Estadística, División Territorial 2021, coded
municipio-general rows (municipal district/section/barrio codes all zero):
https://indotel.gob.do/wp-content/uploads/2022/09/division-territorial-2021.pdf
Includes Matanzas (Peravia): 158 municipality-level entries including the DN.
Corroboration: https://internal.dominicana.gob.do/index.php/e-municipios/e-localidades/158-municipios

Existing FamTree province spellings Bahoruco and Sánchez Ramírez are retained.
Official municipality names are used for new rows; established cabecera names
are accepted as aliases so existing IDs, names, profile/asylum FKs and edits
are not rewritten. Municipal districts are deliberately NOT municipalities.
"""

import sqlalchemy as sa

from alembic import op

revision = "20261016_0014"
down_revision = "20261016_0013"
branch_labels = None
depends_on = None

# Province NAMES, not ONE codes or deployment-specific database IDs.
MUNICIPALITIES = {
    "Distrito Nacional": ("Santo Domingo de Guzmán",),
    "Azua": (
        "Azua",
        "Las Charcas",
        "Las Yayas de Viajama",
        "Padre Las Casas",
        "Peralta",
        "Sabana Yegua",
        "Pueblo Viejo",
        "Tábara Arriba",
        "Guayabal",
        "Estebanía",
    ),
    "Bahoruco": ("Neiba", "Galván", "Tamayo", "Villa Jaragua", "Los Ríos"),
    "Barahona": (
        "Barahona",
        "Cabral",
        "Enriquillo",
        "Paraíso",
        "Vicente Noble",
        "El Peñón",
        "La Ciénaga",
        "Fundación",
        "Las Salinas",
        "Polo",
        "Jaquimeyes",
    ),
    "Dajabón": ("Dajabón", "Loma de Cabrera", "Partido", "Restauración", "El Pino"),
    "Duarte": (
        "San Francisco de Macorís",
        "Arenoso",
        "Castillo",
        "Pimentel",
        "Villa Riva",
        "Las Guáranas",
        "Eugenio María de Hostos",
    ),
    "Elías Piña": (
        "Comendador",
        "Bánica",
        "El Llano",
        "Hondo Valle",
        "Pedro Santana",
        "Juan Santiago",
    ),
    "El Seibo": ("El Seibo", "Miches"),
    "Espaillat": ("Moca", "Cayetano Germosén", "Gaspar Hernández", "Jamao Al Norte", "San Víctor"),
    "Independencia": ("Jimaní", "Duvergé", "La Descubierta", "Postrer Río", "Cristóbal", "Mella"),
    "La Altagracia": ("Higüey", "San Rafael del Yuma"),
    "La Romana": ("La Romana", "Guaymate", "Villa Hermosa"),
    "La Vega": ("La Vega", "Constanza", "Jarabacoa", "Jima Abajo"),
    "María Trinidad Sánchez": ("Nagua", "Cabrera", "El Factor", "Río San Juan"),
    "Monte Cristi": (
        "Monte Cristi",
        "Castañuelas",
        "Guayubín",
        "Las Matas de Santa Cruz",
        "Pepillo Salcedo",
        "Villa Vásquez",
    ),
    "Pedernales": ("Pedernales", "Oviedo"),
    "Peravia": ("Baní", "Nizao", "Matanzas"),
    "Puerto Plata": (
        "Puerto Plata",
        "Altamira",
        "Guananico",
        "Imbert",
        "Los Hidalgos",
        "Luperón",
        "Sosúa",
        "Villa Isabela",
        "Villa Montellano",
    ),
    "Hermanas Mirabal": ("Salcedo", "Tenares", "Villa Tapia"),
    "Samaná": ("Samaná", "Sánchez", "Las Terrenas"),
    "San Cristóbal": (
        "San Cristóbal",
        "Sabana Grande de Palenque",
        "Bajos de Haina",
        "Cambita Garabitos",
        "Villa Altagracia",
        "Yaguate",
        "San Gregorio de Nigua",
        "Los Cacaos",
    ),
    "San Juan": (
        "San Juan",
        "Bohechío",
        "El Cercado",
        "Juan de Herrera",
        "Las Matas de Farfán",
        "Vallejuelo",
    ),
    "San Pedro de Macorís": (
        "San Pedro de Macorís",
        "Los Llanos",
        "Ramón Santana",
        "Consuelo",
        "Quisqueya",
        "Guayacanes",
    ),
    "Sánchez Ramírez": ("Cotuí", "Cevicos", "Fantino", "Villa La Mata"),
    "Santiago": (
        "Santiago",
        "Bisonó",
        "Jánico",
        "Licey al Medio",
        "San José de Las Matas",
        "Tamboril",
        "Villa González",
        "Puñal",
        "Sabana Iglesia",
        "Baitoa",
    ),
    "Santiago Rodríguez": ("San Ignacio de Sabaneta", "Villa Los Almácigos", "Monción"),
    "Valverde": ("Mao", "Esperanza", "Laguna Salada"),
    "Monseñor Nouel": ("Bonao", "Maimón", "Piedra Blanca"),
    "Monte Plata": ("Monte Plata", "Bayaguana", "Sabana Grande de Boyá", "Yamasá", "Peralvillo"),
    "Hato Mayor": ("Hato Mayor", "Sabana de La Mar", "El Valle"),
    "San José de Ocoa": ("San José de Ocoa", "Sabana Larga", "Rancho Arriba"),
    "Santo Domingo": (
        "Santo Domingo Este",
        "Santo Domingo Oeste",
        "Santo Domingo Norte",
        "Boca Chica",
        "San Antonio de Guerra",
        "Los Alcarrizos",
        "Pedro Brand",
    ),
}

# Municipality name in the source -> existing baseline cabecera name.
LEGACY_NAMES = {
    ("Azua", "Azua"): "Azua de Compostela",
    ("Barahona", "Barahona"): "Santa Cruz de Barahona",
    ("Hato Mayor", "Hato Mayor"): "Hato Mayor del Rey",
    ("La Vega", "La Vega"): "Concepción de La Vega",
    ("Monte Cristi", "Monte Cristi"): "San Fernando de Monte Cristi",
    ("Puerto Plata", "Puerto Plata"): "San Felipe de Puerto Plata",
    ("Samaná", "Samaná"): "Santa Bárbara de Samaná",
    ("San Juan", "San Juan"): "San Juan de la Maguana",
    ("Santiago", "Santiago"): "Santiago de los Caballeros",
    ("Santiago", "Bisonó"): "Navarrete",
}


def upgrade() -> None:
    connection = op.get_bind()
    existing_provinces = set(
        connection.execute(sa.text("SELECT nombre_provincia FROM famtree.provincias")).scalars()
    )
    missing = set(MUNICIPALITIES) - existing_provinces
    if missing:
        raise RuntimeError(f"Missing prerequisite provinces: {sorted(missing)}")
    # NOT EXISTS also recognizes the baseline's long-standing city names.
    # ON CONFLICT protects exact matches and concurrent/repeated application.
    # Never UPDATE/DELETE: locally edited/custom rows remain untouched.
    statement = sa.text("""
        INSERT INTO famtree.municipios (codigo_provincia, nombre_municipio)
        SELECT p.codigo_provincia, CAST(:municipality AS TEXT)
        FROM famtree.provincias p
        WHERE p.nombre_provincia = :province
          AND NOT EXISTS (
            SELECT 1 FROM famtree.municipios m
            WHERE m.codigo_provincia = p.codigo_provincia
              AND lower(m.nombre_municipio) IN (lower(:municipality), lower(:legacy))
          )
        ON CONFLICT (codigo_provincia, nombre_municipio) DO NOTHING
    """)
    connection.execute(
        statement,
        [
            {
                "province": province,
                "municipality": name,
                "legacy": LEGACY_NAMES.get((province, name), name),
            }
            for province, names in MUNICIPALITIES.items()
            for name in names
        ],
    )


def downgrade() -> None:
    # Intentionally retain additive reference data: rows can now be selected by
    # profiles/asylums. Deleting them would break FKs or lose user selections;
    # there is no reliable way to distinguish pre-existing/custom rows later.
    # Older code accepts these rows; re-upgrading is safe and idempotent.
    pass
