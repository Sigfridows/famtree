from app.modules.asylums.access import CenterAccess
from app.modules.favorites.models import Favorito
from app.modules.favorites.repository import FavoriteRepository
from app.modules.favorites.schemas import FavoriteView


def view(favorite: Favorito) -> FavoriteView:
    return FavoriteView(
        favorite_id=favorite.codigo_favorito,
        user_id=favorite.codigo_usuario,
        asylum_id=favorite.codigo_asilo,
        created_at=favorite.fecha_creacion,
    )


class FavoriteService:
    def __init__(self, repository: FavoriteRepository, centers: CenterAccess) -> None:
        self.repository = repository
        self.centers = centers

    async def list_for_user(self, user_id: int, offset: int, limit: int) -> list[FavoriteView]:
        rows = await self.repository.list_for_user(user_id, offset, limit)
        cards = await self.centers.cards([row.codigo_asilo for row in rows])
        return [view(row).model_copy(update={"asylum": cards[row.codigo_asilo]}) for row in rows]

    async def add(self, user_id: int, asylum_id: int) -> FavoriteView:
        await self.centers.require_active(asylum_id, lock=True)
        favorite = await self.repository.add(user_id, asylum_id)
        await self.repository.session.commit()
        return view(favorite)

    async def remove(self, user_id: int, asylum_id: int) -> None:
        await self.repository.remove(user_id, asylum_id)
        await self.repository.session.commit()

    async def recipients(self, asylum_id: int) -> list[int]:
        return await self.repository.recipients(asylum_id)
