from scripts.audit_frontend_routes import matches, scan


def test_scan_handles_generics_templates_and_multiline_calls() -> None:
    source = """const reviews = await apiClient.get<Review[] | { items: Review[] }>(
      `/asylums/${asylum.id}/reviews`);
    await apiClient.post("/reviews", payload);
    await apiClient.delete(dynamicPath);
    """
    assert scan(source) == [
        ("GET", "/asylums/${asylum.id}/reviews", 1),
        ("POST", "/reviews", 3),
    ]


def test_route_match_requires_method_and_full_path() -> None:
    route = "/api/v1/reviews/{review_id}/like"
    operations: dict[str, object] = {"post": {}}
    assert matches(route, "POST", operations, "/reviews/${id}/like", "/api/v1")
    assert not matches(route, "GET", operations, "/reviews/${id}/like", "/api/v1")
    assert not matches(route, "POST", operations, "/reviews/1/like/extra", "/api/v1")
