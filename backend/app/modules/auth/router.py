from typing import Annotated

from fastapi import APIRouter, Depends, Request, Response

from app.api.dependencies import get_auth
from app.core.errors import AppError
from app.modules.asylums.dependencies import get_asylum_service
from app.modules.asylums.service import AsylumService
from app.modules.auth.dependencies import check_origin, current_identity
from app.modules.auth.schemas import Login, PasswordChange, Register
from app.modules.auth.service import AuthService
from app.modules.users import UserProfile

router = APIRouter(prefix="/auth", tags=["Authentication"])
Auth = Annotated[AuthService, Depends(get_auth)]
Identity = Annotated[UserProfile, Depends(current_identity)]


@router.post("/register", status_code=201)
async def register(data: Register, request: Request, auth: Auth) -> UserProfile:
    check_origin(request)
    return await auth.register(data)


@router.post("/login")
async def login(
    data: Login,
    request: Request,
    response: Response,
    auth: Auth,
    centers: Annotated[AsylumService, Depends(get_asylum_service)],
) -> UserProfile:
    check_origin(request)
    user, token = await auth.login(data)
    if user.role == "ASYLUM_ADMIN":
        try:
            await centers.detail(user.assigned_asylum_id or 0)
        except AppError as exc:
            await auth.logout(token)
            raise AppError(
                code="center_unavailable", message="Centro asignado no disponible", status_code=403
            ) from exc
    response.set_cookie(
        "famtree_session",
        token,
        httponly=True,
        secure=request.app.state.settings.app_env == "production",
        samesite="lax",
        max_age=auth.lifetime_seconds,
        path=request.app.state.settings.api_v1_prefix,
    )
    response.headers["Cache-Control"] = "no-store"
    return user


@router.get("/session")
async def session(user: Identity, response: Response) -> UserProfile:
    response.headers["Cache-Control"] = "no-store"
    return user


@router.post("/logout", status_code=204)
async def logout(request: Request, response: Response, auth: Auth) -> None:
    check_origin(request)
    await auth.logout(request.cookies.get("famtree_session"))
    response.delete_cookie("famtree_session", path=request.app.state.settings.api_v1_prefix)


@router.post("/change-password", status_code=204)
@router.post("/change-temporary-password", status_code=204)
async def change_password(
    data: PasswordChange, user: Identity, auth: Auth, request: Request, response: Response
) -> None:
    token = await auth.change_password(user, data)
    response.set_cookie(
        "famtree_session",
        token,
        httponly=True,
        secure=request.app.state.settings.app_env == "production",
        samesite="lax",
        max_age=auth.lifetime_seconds,
        path=request.app.state.settings.api_v1_prefix,
    )
