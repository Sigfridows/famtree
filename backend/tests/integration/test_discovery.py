"""Real PostgreSQL + ASGI tests, with fixtures rolled back after each test."""

import os
from collections.abc import AsyncIterator
from dataclasses import dataclass
from decimal import Decimal
from typing import Any

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import event, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings
from app.db import models as _models  # noqa: F401 -- register all FK targets
from app.db.dependencies import get_db_session
from app.db.session import DatabaseManager
from app.db.types import EstadoAsilo, EstadoResena
from app.main import create_app
from app.modules.asylums.models import (
    Asilo,
    AsiloServicio,
    AsiloTipoAdulto,
    ImagenAsilo,
    Municipio,
    Servicio,
    TipoAdultoMayor,
)
from app.modules.reviews.models import Resena
from app.modules.users.models import Usuario

pytestmark = pytest.mark.integration


@dataclass
class Discovery:
    client: AsyncClient
    session: AsyncSession
    ids: list[int]
    province_id: int
    municipality_id: int
    service_ids: list[int]
    care_ids: list[int]
    statements: list[str]


def database_test_url() -> str:
    if os.getenv("RUN_DATABASE_TESTS") != "1":
        pytest.skip("Set RUN_DATABASE_TESTS=1 with a disposable migrated PostgreSQL database")
    return os.environ["DATABASE_URL"]


async def seed(session: AsyncSession) -> tuple[list[int], int, int, list[int], list[int]]:
    municipalities = list(
        (await session.scalars(select(Municipio).order_by(Municipio.codigo_municipio))).all()
    )
    first = municipalities[0]
    other = next(item for item in municipalities if item.codigo_provincia != first.codigo_provincia)
    services = list(
        (await session.scalars(select(Servicio).order_by(Servicio.codigo_servicio))).all()
    )
    care_types = list(
        (await session.scalars(select(TipoAdultoMayor).order_by(TipoAdultoMayor.codigo_tipo))).all()
    )
    services[-1].estado_servicio = False
    care_types[-1].estado_tipo = False
    ids: list[int] = []
    for i in range(19):
        asylum = Asilo(
            codigo_municipio=(other if i == 1 else first).codigo_municipio,
            nombre_asilo="Los Róbles" if i == 0 else f"Centro Prueba {i:02}",
            descripcion_asilo="Centro ficticio exclusivo de pruebas automatizadas.",
            sector_asilo="Sector de pruebas",
            direccion_asilo="Calle de pruebas 123",
            latitud=Decimal("18.486100"),
            longitud=Decimal("-69.931200"),
            capacidad_total=20,
            precio_minimo=Decimal(10000 if i == 0 else 20000 if i == 1 else 30000),
            precio_maximo=Decimal(20000 if i == 0 else 30000 if i == 1 else 40000),
            requisitos_ingreso="Requisitos ficticios de pruebas.",
            certificaciones="Certificación de prueba" if i == 0 else " " if i == 1 else None,
            telefono_asilo="8095550100",
            email_asilo=f"center{i}@example.invalid",
            estado_asilo=EstadoAsilo.INACTIVO if i == 18 else EstadoAsilo.ACTIVO,
        )
        session.add(asylum)
        await session.flush()
        ids.append(asylum.codigo_asilo)
        session.add_all(
            [
                AsiloServicio(
                    codigo_asilo=asylum.codigo_asilo, codigo_servicio=services[0].codigo_servicio
                ),
                AsiloTipoAdulto(
                    codigo_asilo=asylum.codigo_asilo, codigo_tipo=care_types[0].codigo_tipo
                ),
                ImagenAsilo(
                    codigo_asilo=asylum.codigo_asilo,
                    url=f"https://images.example.invalid/{i}.jpg",
                    es_portada=True,
                ),
            ]
        )
    session.add_all(
        [
            AsiloServicio(codigo_asilo=ids[0], codigo_servicio=services[1].codigo_servicio),
            AsiloServicio(codigo_asilo=ids[0], codigo_servicio=services[-1].codigo_servicio),
            AsiloTipoAdulto(codigo_asilo=ids[0], codigo_tipo=care_types[1].codigo_tipo),
            AsiloTipoAdulto(codigo_asilo=ids[0], codigo_tipo=care_types[-1].codigo_tipo),
            ImagenAsilo(
                codigo_asilo=ids[0],
                url="https://images.example.invalid/extra.jpg",
                es_portada=False,
            ),
        ]
    )
    for i, rating in enumerate([5, 3, 1]):
        user = Usuario(
            nombre_usuario="Test",
            apellido_usuario="Reader",
            username=f"discovery{i}",
            email=f"discovery{i}@example.invalid",
            password_hash="not-a-login-hash-test-only",
        )
        session.add(user)
        await session.flush()
        session.add(
            Resena(
                codigo_usuario=user.codigo_usuario,
                codigo_asilo=ids[0],
                calificacion=rating,
                comentario="Comentario exclusivo de prueba.",
                estado_resena=EstadoResena.OCULTA if i == 2 else EstadoResena.PUBLICADA,
            )
        )
        if i == 0:
            session.add(
                Resena(
                    codigo_usuario=user.codigo_usuario,
                    codigo_asilo=ids[1],
                    calificacion=5,
                    comentario="Otra reseña de prueba válida.",
                )
            )
    await session.flush()
    await session.execute(text("SET CONSTRAINTS ALL IMMEDIATE"))
    return (
        ids,
        first.codigo_provincia,
        first.codigo_municipio,
        [s.codigo_servicio for s in services],
        [t.codigo_tipo for t in care_types],
    )


@pytest.fixture
async def discovery() -> AsyncIterator[Discovery]:
    database = DatabaseManager(database_test_url())
    app = create_app(Settings(app_env="test", database_url=database_test_url()))
    statements: list[str] = []

    def record(
        _conn: Any, _cursor: Any, statement: str, _params: Any, _context: Any, _many: Any
    ) -> None:
        if statement.lstrip().upper().startswith("SELECT"):
            statements.append(statement)

    event.listen(database.engine.sync_engine, "before_cursor_execute", record)
    try:
        async with database.session_factory() as session, session.begin():
            ids, province, municipality, services, care_types = await seed(session)

            async def override_session() -> AsyncIterator[AsyncSession]:
                yield session

            app.dependency_overrides[get_db_session] = override_session
            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://test"
            ) as client:
                yield Discovery(
                    client, session, ids, province, municipality, services, care_types, statements
                )
            await session.rollback()
    finally:
        await database.dispose()
        await app.state.database.dispose()


async def test_pagination_and_no_n_plus_one(discovery: Discovery) -> None:
    discovery.statements.clear()
    first = await discovery.client.get("/api/v1/asylums?sort=price_asc")
    assert first.status_code == 200, first.text
    assert len(discovery.statements) == 2
    data = first.json()
    assert data["pagination"] == {"page": 1, "page_size": 15, "total": 18, "pages": 2}
    assert len(data["items"]) == 15
    assert data["items"][0]["price_min"] == "10000.00"
    second = (await discovery.client.get("/api/v1/asylums?sort=price_asc&page=2")).json()
    assert len(second["items"]) == 3
    combined = [item["id"] for item in data["items"] + second["items"]]
    assert combined == discovery.ids[:18]
    beyond = (await discovery.client.get("/api/v1/asylums?page=999")).json()
    assert beyond["items"] == [] and beyond["pagination"]["total"] == 18


async def test_accents_case_whitespace_and_literal_search(discovery: Discovery) -> None:
    found = await discovery.client.get("/api/v1/asylums", params={"q": "  LOS   ROBLES  "})
    assert [item["id"] for item in found.json()["items"]] == discovery.ids[:1]
    for term in ["%", "_", "' OR 1=1 --", "\\", "no existe"]:
        response = await discovery.client.get("/api/v1/asylums", params={"q": term})
        assert response.status_code == 200, response.text
        assert response.json()["items"] == []


async def test_filters_are_anded_and_use_active_catalogs(discovery: Discovery) -> None:
    params = {
        "province_id": str(discovery.province_id),
        "municipality_id": str(discovery.municipality_id),
        "min_price": "15000",
        "max_price": "25000",
        "certified_only": "true",
        "rating_min": "4",
        "services": ",".join(map(str, discovery.service_ids[:2])),
        "care_types": ",".join(map(str, discovery.care_ids[:2])),
    }
    found = await discovery.client.get("/api/v1/asylums", params=params)
    assert found.status_code == 200, found.text
    assert [item["id"] for item in found.json()["items"]] == discovery.ids[:1]
    for override in [
        {"services": "999999"},
        {"services": str(discovery.service_ids[-1])},
        {"care_types": str(discovery.care_ids[-1])},
        {"care_types": "999999"},
        {"province_id": "999999"},
        {"municipality_id": "999999"},
        {"rating_min": "5"},
        {"min_price": "20001"},
        {"min_price": "0", "max_price": "9999"},
    ]:
        result = await discovery.client.get("/api/v1/asylums", params=params | override)
        assert result.status_code == 200, result.text
        assert result.json()["items"] == [], override


async def test_rating_ignores_hidden_reviews_and_sorts_unrated_last(discovery: Discovery) -> None:
    response = await discovery.client.get("/api/v1/asylums?sort=rating_desc")
    items = response.json()["items"]
    assert [item["id"] for item in items[:2]] == [discovery.ids[1], discovery.ids[0]]
    assert items[1]["rating"] == 4 and items[1]["review_count"] == 2
    assert items[2]["rating"] is None and items[2]["review_count"] == 0
    descending = (await discovery.client.get("/api/v1/asylums?sort=price_desc")).json()["items"]
    assert descending[0]["price_min"] == "30000.00"


async def test_detail_and_comparison_are_batched_and_ordered(discovery: Discovery) -> None:
    response = await discovery.client.get(f"/api/v1/asylums/{discovery.ids[0]}")
    assert response.status_code == 200, response.text
    detail = response.json()
    assert detail["images"][0]["is_cover"] is True and len(detail["images"]) == 2
    assert {item["id"] for item in detail["services"]} == set(discovery.service_ids[:2])
    assert {item["id"] for item in detail["care_types"]} == set(discovery.care_ids[:2])
    assert detail["phone"] == "8095550100"
    assert "estado_asilo" not in detail and "password_hash" not in detail
    ids = list(reversed(discovery.ids[:4]))
    discovery.statements.clear()
    compare = await discovery.client.get(
        "/api/v1/asylums/compare", params={"ids": ",".join(map(str, ids))}
    )
    assert compare.status_code == 200, compare.text
    assert [item["id"] for item in compare.json()["items"]] == ids
    assert len(discovery.statements) == 4
    repeated = await discovery.client.get(f"/api/v1/asylums/compare?ids={ids[0]}&ids={ids[1]}")
    assert repeated.status_code == 200
    for unavailable in [discovery.ids[-1], 999999]:
        assert (await discovery.client.get(f"/api/v1/asylums/{unavailable}")).status_code == 404
        assert (
            await discovery.client.get(f"/api/v1/asylums/compare?ids={ids[0]},{unavailable}")
        ).status_code == 404


async def test_map_matches_filters_without_private_or_heavy_fields(discovery: Discovery) -> None:
    result = await discovery.client.get("/api/v1/asylums/map?rating_min=4&sort=rating_desc")
    assert result.status_code == 200, result.text
    data = result.json()
    assert data["pagination"] == {"page": 1, "page_size": 100, "total": 2, "pages": 1}
    assert [item["id"] for item in data["items"]] == [discovery.ids[1], discovery.ids[0]]
    assert set(data["items"][0]) == {
        "id",
        "name",
        "latitude",
        "longitude",
        "price_min",
        "price_max",
        "rating",
        "review_count",
        "cover_url",
    }
    assert (await discovery.client.get("/api/v1/asylums/map?page=2")).json()["items"] == []
    all_pins = (await discovery.client.get("/api/v1/asylums/map")).json()
    assert len(all_pins["items"]) == 18
    assert discovery.ids[-1] not in [item["id"] for item in all_pins["items"]]


async def test_catalogs_filter_municipalities_and_hide_disabled_options(
    discovery: Discovery,
) -> None:
    response = await discovery.client.get(
        f"/api/v1/asylums/catalogs?province_id={discovery.province_id}"
    )
    assert response.status_code == 200, response.text
    catalogs = response.json()
    assert len(catalogs["provinces"]) == 32
    assert catalogs["municipalities"]
    assert all(item["province_id"] == discovery.province_id for item in catalogs["municipalities"])
    assert discovery.service_ids[-1] not in [item["id"] for item in catalogs["services"]]
    assert discovery.care_ids[-1] not in [item["id"] for item in catalogs["care_types"]]
    assert (await discovery.client.get("/api/v1/asylums/catalogs?province_id=999999")).json()[
        "municipalities"
    ] == []
    assert len(
        (await discovery.client.get("/api/v1/asylums/catalogs")).json()["municipalities"]
    ) > len(catalogs["municipalities"])


async def test_real_request_session_is_closed() -> None:
    app = create_app(Settings(app_env="test", database_url=database_test_url()))
    try:
        async with (
            app.router.lifespan_context(app),
            AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client,
        ):
            response = await client.get("/api/v1/asylums/catalogs")
            assert response.status_code == 200
            assert len(response.json()["provinces"]) == 32
            assert app.state.database.engine.pool.checkedout() == 0
    finally:
        await app.state.database.dispose()


async def test_map_pagination_does_not_drop_centers_after_first_hundred(
    discovery: Discovery,
) -> None:
    await discovery.session.execute(text("SET CONSTRAINTS ALL DEFERRED"))
    source = await discovery.session.get(Asilo, discovery.ids[2])
    assert source is not None
    values = {
        column.key: getattr(source, column.key)
        for column in Asilo.__table__.columns
        if column.key not in {"codigo_asilo", "nombre_asilo"}
    }
    extra = [Asilo(**values, nombre_asilo=f"Centro Adicional {i:03}") for i in range(83)]
    discovery.session.add_all(extra)
    await discovery.session.flush()
    for center in extra:
        discovery.session.add_all(
            [
                AsiloServicio(
                    codigo_asilo=center.codigo_asilo, codigo_servicio=discovery.service_ids[0]
                ),
                AsiloTipoAdulto(
                    codigo_asilo=center.codigo_asilo, codigo_tipo=discovery.care_ids[0]
                ),
                ImagenAsilo(
                    codigo_asilo=center.codigo_asilo,
                    url="https://images.example.invalid/map.jpg",
                    es_portada=True,
                ),
            ]
        )
    await discovery.session.flush()
    await discovery.session.execute(text("SET CONSTRAINTS ALL IMMEDIATE"))
    first = (await discovery.client.get("/api/v1/asylums/map?sort=price_asc")).json()
    second = (await discovery.client.get("/api/v1/asylums/map?sort=price_asc&page=2")).json()
    assert first["pagination"] == {"page": 1, "page_size": 100, "total": 101, "pages": 2}
    assert len(first["items"]) == 100 and len(second["items"]) == 1
    actual = [item["id"] for item in first["items"] + second["items"]]
    assert actual == discovery.ids[:18] + [center.codigo_asilo for center in extra]


async def test_normalized_search_and_location_match(discovery: Discovery) -> None:
    source = await discovery.session.get(Asilo, discovery.ids[0])
    assert source is not None
    source.nombre_asilo = "  Los \t  Róbles  "
    await discovery.session.flush()
    response = await discovery.client.get("/api/v1/asylums?q=los%20robles")
    assert [item["id"] for item in response.json()["items"]] == discovery.ids[:1]

    # HU04 also matches locality; filtering must not require a name match.
    response = await discovery.client.get("/api/v1/asylums", params={"q": "sector de pruebas"})
    assert response.json()["pagination"]["total"] == 18
