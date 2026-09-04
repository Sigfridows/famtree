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
