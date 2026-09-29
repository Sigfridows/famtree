from fastapi.testclient import TestClient


def test_canonical_operations_and_legacy_migration_guidance(client: TestClient) -> None:
    paths = client.get("/openapi.json").json()["paths"]
    pairs = [
        ("post", "/asylums/{asylum_id}/reviews", "post", "/reviews"),
        ("post", "/reviews/{review_id}/reports", "post", "/reviews/reports"),
        ("put", "/reviews/{review_id}", "patch", "/reviews/{review_id}"),
        ("post", "/favorites/{asylum_id}", "post", "/favorites"),
        ("get", "/notifications/preferences", "get", "/notification-preferences"),
        ("patch", "/notifications/preferences", "patch", "/notification-preferences"),
        ("post", "/auth/change-temporary-password", "post", "/auth/change-password"),
        ("get", "/users", "get", "/admin/users"),
        ("get", "/users/{user_id}", "get", "/admin/users/{user_id}"),
        ("post", "/asylums", "post", "/admin/asylums"),
        ("put", "/asylums/{asylum_id}", "patch", "/admin/asylums/{asylum_id}"),
    ]
    for method, path, preferred_method, preferred_path in pairs:
        legacy = paths["/api/v1" + path][method]
        canonical = paths["/api/v1" + preferred_path][preferred_method]
        assert legacy["deprecated"] is True and legacy["description"]
        assert not canonical.get("deprecated", False)
    operations = [op["operationId"] for entry in paths.values() for op in entry.values()]
    assert len(operations) == len(set(operations))
    assert "post" in paths["/api/v1/reviews/{review_id}/like"]
