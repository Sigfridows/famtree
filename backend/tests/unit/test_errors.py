from fastapi import APIRouter, Query
from fastapi.testclient import TestClient

from app.core.config import Settings
from app.core.errors import AppError
from app.main import create_app


def test_structured_application_error_contains_request_id() -> None:
    app = create_app(Settings(app_env="test", session_secret="test-only-secret"))
    router = APIRouter()

    @router.get("/failure")
    async def failure() -> None:
        raise AppError(code="example_error", message="Example failure", status_code=409)

    app.include_router(router)

    with TestClient(app) as client:
        response = client.get("/failure")

    assert response.status_code == 409
    assert response.json()["error"]["code"] == "example_error"
    assert response.json()["error"]["request_id"] == response.headers["x-request-id"]


def test_validation_errors_use_the_standard_error_contract() -> None:
    app = create_app(Settings(app_env="test", session_secret="test-only-secret"))
    router = APIRouter()

    @router.get("/validated")
    async def validated(value: int = Query(ge=1)) -> dict[str, int]:
        return {"value": value}

    app.include_router(router)

    with TestClient(app) as client:
        response = client.get("/validated", params={"value": 0})

    payload = response.json()["error"]
    assert response.status_code == 422
    assert payload["code"] == "validation_error"
    assert payload["message"] == "Request validation failed"
    assert payload["details"][0]["type"] == "greater_than_equal"
    assert payload["request_id"] == response.headers["x-request-id"]
