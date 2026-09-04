from pathlib import Path


def test_approved_backend_feature_boundaries_exist() -> None:
    modules = Path(__file__).parents[2] / "app" / "modules"
    expected = {
        "administration",
        "asylums",
        "auth",
        "center_management",
        "favorites",
        "health",
        "notifications",
        "reports",
        "reviews",
        "users",
    }

    actual: set[str] = set()
    for path in modules.iterdir():
        if path.is_dir() and not path.name.startswith("_"):
            actual.add(path.name)
    assert expected <= actual
