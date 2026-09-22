"""Composition root for request-scoped feature services."""

from typing import Annotated

from fastapi import Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.mail import CredentialMailer, SmtpCredentialMailer
from app.core.media import ImageStore
from app.db.dependencies import get_db_session
from app.modules.administration.service import AdministrationService
from app.modules.asylums.access import CenterAccess
from app.modules.asylums.management_repository import CenterRepository
from app.modules.asylums.management_service import CenterService
from app.modules.auth.repository import AuthRepository
from app.modules.auth.service import AuthService
from app.modules.favorites.repository import FavoriteRepository
from app.modules.favorites.service import FavoriteService
from app.modules.notifications.repository import NotificationRepository
from app.modules.notifications.service import NotificationService
from app.modules.reports.repository import ReportRepository
from app.modules.reports.service import ReportService
from app.modules.reviews.repository import ReviewRepository
from app.modules.reviews.service import ReviewService
from app.modules.users.repository import UserRepository
from app.modules.users.service import UserDirectory

Db = Annotated[AsyncSession, Depends(get_db_session)]


def get_users(db: Db) -> UserDirectory:
    return UserDirectory(UserRepository(db))


def get_auth(
    db: Db, request: Request, users: Annotated[UserDirectory, Depends(get_users)]
) -> AuthService:
    return AuthService(
        AuthRepository(db), users, request.app.state.settings.session_lifetime_seconds
    )


def get_centers(db: Db) -> CenterAccess:
    return CenterAccess(db)


def get_favorites(
    db: Db, centers: Annotated[CenterAccess, Depends(get_centers)]
) -> FavoriteService:
    return FavoriteService(FavoriteRepository(db), centers)


def get_notifications(
    db: Db, users: Annotated[UserDirectory, Depends(get_users)]
) -> NotificationService:
    return NotificationService(NotificationRepository(db), users)


def get_reviews(
    db: Db,
    centers: Annotated[CenterAccess, Depends(get_centers)],
    users: Annotated[UserDirectory, Depends(get_users)],
) -> ReviewService:
    return ReviewService(ReviewRepository(db), centers, users)


def get_center_management(
    db: Db,
    favorites: Annotated[FavoriteService, Depends(get_favorites)],
    notifications: Annotated[NotificationService, Depends(get_notifications)],
    users: Annotated[UserDirectory, Depends(get_users)],
) -> CenterService:
    return CenterService(CenterRepository(db), favorites, notifications, users)


def get_mailer(request: Request) -> CredentialMailer:
    settings = request.app.state.settings
    return SmtpCredentialMailer(
        settings.smtp_host, settings.smtp_port, settings.cors_origin_list[0] + "/login"
    )


def get_administration(
    db: Db,
    users: Annotated[UserDirectory, Depends(get_users)],
    centers: Annotated[CenterAccess, Depends(get_centers)],
    mailer: Annotated[CredentialMailer, Depends(get_mailer)],
) -> AdministrationService:
    return AdministrationService(db, users, AuthRepository(db), centers, mailer)


def get_reports(db: Db) -> ReportService:
    return ReportService(ReportRepository(db))


def get_images(request: Request) -> ImageStore:
    return ImageStore(request.app.state.settings.upload_dir)
