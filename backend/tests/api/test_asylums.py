from collections.abc import Iterator
from typing import Any

import pytest
from fastapi.testclient import TestClient

from app.core.config import Settings
from app.main import create_app
from app.modules.asylums.dependencies import get_asylum_reader
from app.modules.asylums.schemas import AsylumDetail, AsylumSummary, Catalogs, SearchQuery


class EmptyReader:
    def __init__(self) -> None:
        self.queries: list[tuple[SearchQuery, int]] = []

    async def search(
        self, query: SearchQuery, *, page_size: int
    ) -> tuple[list[AsylumSummary], int]:
        self.queries.append((query, page_size))
        return [], 0

    async def details(self, ids: list[int]) -> list[AsylumDetail]:
        return []

    async def catalogs(self, province_id: int | None) -> Catalogs:
        return Catalogs(provinces=[], municipalities=[], services=[], care_types=[])


@pytest.fixture
def discovery_client(settings: Settings) -> Iterator[tuple[TestClient, EmptyReader]]:
    reader = EmptyReader()
    app = create_app(settings)
    app.dependency_overrides[get_asylum_reader] = lambda: reader
    with TestClient(app) as client:
        yield client, reader


def test_empty_search_uses_injected_reader(
    discovery_client: tuple[TestClient, EmptyReader],
) -> None:
    client, reader = discovery_client
    response = client.get("/api/v1/asylums?services=1,2&services=2&care_types=3&q=%20robles%20")
    assert response.status_code == 200
    assert response.json()["pagination"] == {"page": 1, "page_size": 15, "total": 0, "pages": 0}
    query, page_size = reader.queries[0]
    assert query.services == [1, 2]
    assert query.care_types == [3]
    assert query.q == "robles"
    assert page_size == 15


@pytest.mark.parametrize(
    "path",
    [
        "/asylums?page=0",
        "/asylums?page=1000001",
        "/asylums?sort=sql_injection",
        "/asylums?min_price=100&max_price=1",
        "/asylums?min_price=NaN",
        "/asylums?max_price=Infinity",
        "/asylums?min_price=0.001",
        "/asylums?province_id=0",
        "/asylums?province_id=99999999999999999999",
        "/asylums?rating_min=6",
        "/asylums?rating_min=NaN",
        "/asylums?services=1,nope",
        "/asylums?services=",
        "/asylums?services=-1",
        "/asylums?services=" + ",".join(str(i) for i in range(1, 32)),
        "/asylums?care_types=1,nope",
        "/asylums?certified_only=perhaps",
        "/asylums?q=" + "a" * 101,
        "/asylums?unknown_filter=yes",
        "/asylums/map?max_price=-1",
        "/asylums/compare",
        "/asylums/compare?ids=1",
        "/asylums/compare?ids=1,2,3,4,5",
        "/asylums/compare?ids=1,1",
        "/asylums/compare?ids=1,nope",
        "/asylums/compare?ids=1,-2",
        "/asylums/compare?ids=1,999999999999999999999",
        "/asylums/catalogs?province_id=0",
        "/asylums/0",
        "/asylums/999999999999999999999",
    ],
)
def test_invalid_requests_return_structured_422(
    discovery_client: tuple[TestClient, EmptyReader], path: str
) -> None:
    client, reader = discovery_client
    response = client.get("/api/v1" + path)
    assert response.status_code == 422, response.text
    error = response.json()["error"]
    assert error["code"] == "validation_error"
    assert error["request_id"] == response.headers["x-request-id"]
    assert error["details"]
    assert reader.queries == []


@pytest.mark.parametrize("path", ["/asylums/1", "/asylums/compare?ids=1,2"])
def test_unavailable_centers_are_not_exposed(
    discovery_client: tuple[TestClient, EmptyReader], path: str
) -> None:
    client, _ = discovery_client
    response = client.get("/api/v1" + path)
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "asylum_not_found"


def test_static_routes_and_cors(discovery_client: tuple[TestClient, EmptyReader]) -> None:
    client, reader = discovery_client
    response = client.get("/api/v1/asylums/map", headers={"Origin": "http://localhost:3000"})
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"
    assert response.json()["pagination"]["page_size"] == 100
    assert reader.queries[0][1] == 100
    assert client.get("/api/v1/asylums/catalogs").status_code == 200
    preflight = client.options(
        "/api/v1/asylums",
        headers={"Origin": "http://localhost:3000", "Access-Control-Request-Method": "GET"},
    )
    assert preflight.status_code == 200
    rejected = client.get("/api/v1/asylums", headers={"Origin": "https://untrusted.invalid"})
    assert "access-control-allow-origin" not in rejected.headers


def test_openapi_documents_public_contracts(
    discovery_client: tuple[TestClient, EmptyReader],
) -> None:
    client, _ = discovery_client
    spec: dict[str, Any] = client.get("/openapi.json").json()
    for path in ("", "/catalogs", "/map", "/compare", "/{asylum_id}"):
        operation = spec["paths"]["/api/v1/asylums" + path]["get"]
        assert operation["responses"]["200"]["content"]["application/json"]["schema"]
        assert operation["responses"]["422"]["content"]["application/json"]["schema"] == {
            "$ref": "#/components/schemas/ErrorResponse"
        }
