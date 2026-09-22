from typing import Annotated

from fastapi import APIRouter, Depends, UploadFile

from app.api.dependencies import get_images, get_users
from app.core.media import ImageStore
from app.modules.auth.dependencies import profile_user
from app.modules.users import UserDirectory, UserProfile
from app.modules.users.schemas import ProfileUpdate

router = APIRouter(prefix="/users", tags=["Profiles"])
User = Annotated[UserProfile, Depends(profile_user)]
Users = Annotated[UserDirectory, Depends(get_users)]


@router.get("/me")
async def me(user: User) -> UserProfile:
    return user


@router.patch("/me")
async def update_me(data: ProfileUpdate, user: User, users: Users) -> UserProfile:
    return await users.update_profile(user.user_id, data)


@router.post("/me/picture")
async def picture(
    file: UploadFile, user: User, users: Users, images: Annotated[ImageStore, Depends(get_images)]
) -> UserProfile:
    url = await images.save(await file.read(2 * 1024 * 1024 + 1), profile=True)
    try:
        result, old = await users.set_picture(user.user_id, url)
    except Exception:
        await images.delete(url)
        raise
    await images.delete(old)
    return result
