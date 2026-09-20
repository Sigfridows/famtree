from sqlalchemy import delete, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.favorites.models import Favorito


class FavoriteRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def list_for_user(self, user_id: int, offset: int, limit: int) -> list[Favorito]:
        return list(
            await self.session.scalars(
                select(Favorito)
                .where(Favorito.codigo_usuario == user_id)
                .order_by(Favorito.codigo_favorito)
                .offset(offset)
                .limit(limit)
            )
        )

    async def add(self, user_id: int, asylum_id: int) -> Favorito:
        await self.session.execute(
            insert(Favorito)
            .values(codigo_usuario=user_id, codigo_asilo=asylum_id)
            .on_conflict_do_nothing()
        )
        result = (
            await self.session.scalars(
                select(Favorito).where(
                    Favorito.codigo_usuario == user_id, Favorito.codigo_asilo == asylum_id
                )
            )
        ).one()
        return result

    async def remove(self, user_id: int, asylum_id: int) -> None:
        await self.session.execute(
            delete(Favorito).where(
                Favorito.codigo_usuario == user_id, Favorito.codigo_asilo == asylum_id
            )
        )

    async def recipients(self, asylum_id: int) -> list[int]:
        return list(
            await self.session.scalars(
                select(Favorito.codigo_usuario).where(Favorito.codigo_asilo == asylum_id)
            )
        )
