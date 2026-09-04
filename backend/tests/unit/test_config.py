from app.core.config import Settings


def test_cors_origins_are_parsed_from_comma_separated_setting() -> None:
    settings = Settings(cors_origins="http://localhost:3000, https://famtree.example ")

    assert settings.cors_origin_list == ["http://localhost:3000", "https://famtree.example"]


def test_api_prefix_has_versioned_default() -> None:
    assert Settings().api_v1_prefix == "/api/v1"
