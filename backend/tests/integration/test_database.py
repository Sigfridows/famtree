import os

import pytest
from sqlalchemy import text

from app.db.session import DatabaseManager


@pytest.mark.integration
@pytest.mark.asyncio
async def test_postgresql_connection() -> None:
    if os.getenv("RUN_DATABASE_TESTS") != "1":
        pytest.skip("Set RUN_DATABASE_TESTS=1 to run PostgreSQL integration tests")

    database_url = os.environ["DATABASE_URL"]
    database = DatabaseManager(database_url)
    try:
        assert await database.ping() is True
    finally:
        await database.dispose()


@pytest.mark.integration
@pytest.mark.asyncio
async def test_database_manager_provides_a_working_session() -> None:
    if os.getenv("RUN_DATABASE_TESTS") != "1":
        pytest.skip("Set RUN_DATABASE_TESTS=1 to run PostgreSQL integration tests")

    database = DatabaseManager(os.environ["DATABASE_URL"])
    session_iterator = database.session()
    try:
        session = await anext(session_iterator)
        assert await session.scalar(text("SELECT 1")) == 1
    finally:
        await session_iterator.aclose()
        await database.dispose()


@pytest.mark.integration
@pytest.mark.asyncio
async def test_approved_schema_and_catalogs_were_migrated() -> None:
    if os.getenv("RUN_DATABASE_TESTS") != "1":
        pytest.skip("Set RUN_DATABASE_TESTS=1 to run PostgreSQL integration tests")

    database = DatabaseManager(os.environ["DATABASE_URL"])
    try:
        async with database.engine.connect() as connection:
            table_count = await connection.scalar(
                text("SELECT count(*) FROM pg_tables WHERE schemaname = 'famtree'")
            )
            trigger_count = await connection.scalar(
                text(
                    "SELECT count(*) FROM pg_trigger t "
                    "JOIN pg_class c ON c.oid = t.tgrelid "
                    "JOIN pg_namespace n ON n.oid = c.relnamespace "
                    "WHERE n.nspname = 'famtree' AND NOT t.tgisinternal"
                )
            )
            provinces = await connection.scalar(text("SELECT count(*) FROM famtree.provincias"))
            motives = (
                await connection.execute(
                    text(
                        "SELECT e.enumlabel FROM pg_enum e "
                        "JOIN pg_type t ON t.oid = e.enumtypid "
                        "JOIN pg_namespace n ON n.oid = t.typnamespace "
                        "WHERE n.nspname = 'famtree' AND t.typname = 'motivo_reporte' "
                        "ORDER BY e.enumsortorder"
                    )
                )
            ).scalars()

            assert table_count == 15
            assert trigger_count == 21
            assert provinces == 32
            assert list(motives) == [
                "LENGUAJE_OFENSIVO",
                "INFO_FALSA",
                "SPAM",
                "CONFLICTO_INTERES",
                "OTRO",
            ]
    finally:
        await database.dispose()
