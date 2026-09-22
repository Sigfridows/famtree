from typing import Annotated

from fastapi import Depends, Request

from app.api.dependencies import get_auth
from app.core.errors import AppError
from app.modules.asylums.dependencies import get_asylum_service
from app.modules.asylums.service import AsylumService
from app.modules.auth.service import AuthService
from app.modules.users import UserProfile


def check_origin(request: Request) -> None:
    """Browsers must originate from configured frontend origins; CLI clients may omit Origin."""
    origin = request.headers.get("origin")
    if (origin is not None and origin not in request.app.state.settings.cors_origin_list) or (
        origin is None and request.headers.get("sec-fetch-site") == "cross-site"
    ):
        raise AppError(code="invalid_origin", message="Origen no permitido", status_code=403)


async def current_identity(
    request: Request,
    auth: Annotated[AuthService, Depends(get_auth)],
    centers: Annotated[AsylumService, Depends(get_asylum_service)],
) -> UserProfile:
    if request.method not in {"GET", "HEAD", "OPTIONS"}:
        check_origin(request)
    user = await auth.identity(request.cookies.get("famtree_session"))
    if user.role == "ASYLUM_ADMIN":
        try:
            await centers.detail(user.assigned_asylum_id or 0)
        except AppError as exc:
            raise AppError(
                code="center_unavailable", message="Centro asignado no disponible", status_code=403
            ) from exc
    return user


async def current_user(user: Annotated[UserProfile, Depends(current_identity)]) -> UserProfile:
    if user.requires_password_change:
        raise AppError(
            code="password_change_required",
            message="Cambia la contraseña temporal",
            status_code=403,
        )
    return user


async def registered_user(user: Annotated[UserProfile, Depends(current_user)]) -> UserProfile:
    if user.role != "REGISTERED_USER":
        raise AppError(
            code="forbidden", message="Operación reservada a usuarios registrados", status_code=403
        )
    return user


async def system_admin(user: Annotated[UserProfile, Depends(current_user)]) -> UserProfile:
    if user.role != "SYSTEM_ADMIN":
        raise AppError(
            code="forbidden", message="Permiso de administrador requerido", status_code=403
        )
    return user


async def center_admin(user: Annotated[UserProfile, Depends(current_user)]) -> UserProfile:
    if user.role != "ASYLUM_ADMIN":
        raise AppError(
            code="forbidden",
            message="Permiso de administrador de centro requerido",
            status_code=403,
        )
    return user


async def profile_user(user: Annotated[UserProfile, Depends(current_user)]) -> UserProfile:
    if user.role not in {"REGISTERED_USER", "ASYLUM_ADMIN"}:
        raise AppError(code="forbidden", message="Perfil personal no disponible", status_code=403)
    return user
