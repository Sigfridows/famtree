"""Exercise the catalog data migration against real SQL tables, without PostgreSQL."""

import importlib.util
import re
from pathlib import Path

import pytest
import sqlalchemy as sa

ROOT = Path(__file__).resolve().parents[2]
MIGRATION = ROOT / "alembic/versions/20261016_0014_complete_municipalities.py"
EXPECTED_COUNTS = {
    "Azua": 10,
    "Bahoruco": 5,
    "Barahona": 11,
    "Dajabón": 5,
    "Distrito Nacional": 1,
    "Duarte": 7,
    "El Seibo": 2,
    "Elías Piña": 6,
    "Espaillat": 5,
    "Hato Mayor": 3,
    "Hermanas Mirabal": 3,
    "Independencia": 6,
    "La Altagracia": 2,
    "La Romana": 3,
    "La Vega": 4,
    "María Trinidad Sánchez": 4,
    "Monseñor Nouel": 3,
    "Monte Cristi": 6,
    "Monte Plata": 5,
    "Pedernales": 2,
    "Peravia": 3,
    "Puerto Plata": 9,
    "Samaná": 3,
    "San Cristóbal": 8,
    "San José de Ocoa": 3,
    "San Juan": 6,
    "San Pedro de Macorís": 6,
    "Sánchez Ramírez": 4,
    "Santiago": 10,
    "Santiago Rodríguez": 3,
    "Santo Domingo": 7,
    "Valverde": 3,
}
MISSING_PROVINCES = {
    "Bahoruco": {"Neiba", "Galván", "Tamayo", "Villa Jaragua", "Los Ríos"},
    "Dajabón": {"Dajabón", "Loma de Cabrera", "Partido", "Restauración", "El Pino"},
    "El Seibo": {"El Seibo", "Miches"},
    "Elías Piña": {
        "Comendador",
        "Bánica",
        "El Llano",
        "Hondo Valle",
        "Pedro Santana",
        "Juan Santiago",
    },
    "Independencia": {"Jimaní", "Duvergé", "La Descubierta", "Postrer Río", "Cristóbal", "Mella"},
    "Pedernales": {"Pedernales", "Oviedo"},
    "San José de Ocoa": {"San José de Ocoa", "Sabana Larga", "Rancho Arriba"},
    "Santiago Rodríguez": {"San Ignacio de Sabaneta", "Villa Los Almácigos", "Monción"},
}


def load_migration():
    assert MIGRATION.exists(), "Complete municipality catalog migration is missing"
    spec = importlib.util.spec_from_file_location("municipality_migration", MIGRATION)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


@pytest.fixture
def database(monkeypatch):
    engine = sa.create_engine("sqlite://")
    with engine.begin() as connection:
        connection.exec_driver_sql("PRAGMA foreign_keys = ON")
        connection.exec_driver_sql("ATTACH DATABASE ':memory:' AS famtree")
        connection.exec_driver_sql(
            "CREATE TABLE famtree.provincias (codigo_provincia INTEGER PRIMARY KEY, "
            "nombre_provincia TEXT UNIQUE)"
        )
        connection.exec_driver_sql(
            "CREATE TABLE famtree.municipios (codigo_municipio INTEGER PRIMARY KEY, "
            "codigo_provincia INTEGER, nombre_municipio TEXT, "
            "UNIQUE(codigo_provincia, nombre_municipio))"
        )
        for index, province in enumerate(reversed(EXPECTED_COUNTS), start=101):
            connection.execute(
                sa.text("INSERT INTO famtree.provincias VALUES (:id, :name)"),
                {"id": index, "name": province},
            )
        from alembic import op

        monkeypatch.setattr(op, "get_bind", lambda: connection)
        yield connection
    engine.dispose()


def catalog(connection):
    rows = connection.execute(
        sa.text(
            "SELECT p.nombre_provincia, m.nombre_municipio FROM famtree.municipios m "
            "JOIN famtree.provincias p USING (codigo_provincia)"
        )
    )
    result = {}
    for province, municipality in rows:
        result.setdefault(province, set()).add(municipality)
    return result


def test_all_provinces_have_their_complete_official_municipalities(database):
    migration = load_migration()
    assert migration.down_revision == "20261016_0013"
    migration.upgrade()
    result = catalog(database)
    assert {province: len(names) for province, names in result.items()} == EXPECTED_COUNTS
    assert sum(map(len, result.values())) == 158
    for province, names in MISSING_PROVINCES.items():
        assert result[province] == names
    assert "Matanzas" in result["Peravia"]
    assert "La Victoria" not in result["Santo Domingo"]
    assert "La Caleta" not in result["Santo Domingo"]


def test_baseline_ids_names_references_and_custom_edits_survive_repeated_upgrade(database):
    migration = load_migration()
    baseline = (ROOT / "alembic/sql/0001_catalogos.sql").read_text()
    values = baseline.split(") AS m(provincia, nombre)")[0].split("FROM (VALUES")[1]
    pairs = re.findall(r"\('([^']+)',\s*'([^']+)'\)", values)
    assert len(pairs) == 42
    for index, (province, name) in enumerate(pairs, start=501):
        database.execute(
            sa.text(
                "INSERT INTO famtree.municipios SELECT :id, codigo_provincia, :name "
                "FROM famtree.provincias WHERE nombre_provincia = :province"
            ),
            {"id": index, "province": province, "name": name},
        )
    database.exec_driver_sql(
        "CREATE TABLE famtree.catalog_reference "
        "(municipality_id INTEGER REFERENCES municipios(codigo_municipio))"
    )
    database.exec_driver_sql("INSERT INTO famtree.catalog_reference VALUES (501)")
    before = list(
        database.execute(sa.text("SELECT * FROM famtree.municipios ORDER BY codigo_municipio"))
    )
    migration.upgrade()
    assert sum(map(len, catalog(database).values())) == 158
    # Simulate a user's local edit after first application plus an extra row.
    database.exec_driver_sql(
        "UPDATE famtree.municipios SET nombre_municipio = 'NEIBA' WHERE nombre_municipio = 'Neiba'"
    )
    database.exec_driver_sql(
        "INSERT INTO famtree.municipios SELECT 9999, codigo_provincia, "
        "'Local custom municipality' FROM famtree.provincias "
        "WHERE nombre_provincia = 'Bahoruco'"
    )
    upgraded = list(
        database.execute(sa.text("SELECT * FROM famtree.municipios ORDER BY codigo_municipio"))
    )
    migration.upgrade()
    migration.downgrade()
    migration.upgrade()
    assert (
        list(
            database.execute(sa.text("SELECT * FROM famtree.municipios ORDER BY codigo_municipio"))
        )
        == upgraded
    )
    assert (
        list(
            database.execute(
                sa.text(
                    "SELECT * FROM famtree.municipios "
                    "WHERE codigo_municipio BETWEEN 501 AND 542 ORDER BY codigo_municipio"
                )
            )
        )
        == before
    )
    assert (
        database.exec_driver_sql(
            "SELECT municipality_id FROM famtree.catalog_reference"
        ).scalar_one()
        == 501
    )
    assert database.exec_driver_sql("PRAGMA famtree.foreign_key_check").all() == []


def test_missing_province_fails_before_inserting_partial_catalog(database):
    migration = load_migration()
    database.exec_driver_sql("DELETE FROM famtree.provincias WHERE nombre_provincia = 'Bahoruco'")
    with pytest.raises(RuntimeError, match="Bahoruco"):
        migration.upgrade()
    assert catalog(database) == {}
