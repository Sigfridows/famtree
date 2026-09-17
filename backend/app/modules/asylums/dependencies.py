from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.dependencies import get_db_session
from app.modules.asylums.ports import AsylumReader
from app.modules.asylums.repository import SqlAlchemyAsylumReader
from app.modules.asylums.service import AsylumService


def get_asylum_reader(session: Annotated[AsyncSession, Depends(get_db_session)]) -> AsylumReader:
    return SqlAlchemyAsylumReader(session)


def get_asylum_service(
    reader: Annotated[AsylumReader, Depends(get_asylum_reader)],
) -> AsylumService:
    return AsylumService(reader)
