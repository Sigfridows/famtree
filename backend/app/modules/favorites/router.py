from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.api.dependencies import get_favorites
from app.core.contracts import Id
from app.modules.auth.dependencies import registered_user
from app.modules.favorites.schemas import FavoriteInput, FavoriteView
from app.modules.favorites.service import FavoriteService
from app.modules.users import UserProfile

router = APIRouter(prefix="/favorites", tags=["Favorites"])
User = Annotated[UserProfile, Depends(registered_user)]
Service = Annotated[FavoriteService, Depends(get_favorites)]


@router.get("")
async def favorites(
    user: User,
    service: Service,
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 100,
) -> list[FavoriteView]:
    return await service.list_for_user(user.user_id, offset, limit)


@router.post("", status_code=201)
async def add_favorite(data: FavoriteInput, user: User, service: Service) -> FavoriteView:
    return await service.add(user.user_id, data.asylum_id)


@router.post("/{asylum_id}", status_code=201)
async def add_favorite_by_id(asylum_id: Id, user: User, service: Service) -> FavoriteView:
    return await service.add(user.user_id, asylum_id)


@router.delete("/{asylum_id}", status_code=204)
async def delete_favorite(asylum_id: Id, user: User, service: Service) -> None:
    await service.remove(user.user_id, asylum_id)
