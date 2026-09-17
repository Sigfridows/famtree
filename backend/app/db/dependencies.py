from collections.abc import AsyncIterator
from typing import cast

from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import DatabaseManager


async def get_db_session(request: Request) -> AsyncIterator[AsyncSession]:
    """One session per request; close/rollback on success, failure or cancellation."""
    database = cast(DatabaseManager, request.app.state.database)
    async with database.session_factory() as session:
        yield session
