import hashlib
import secrets
from datetime import UTC, datetime, timedelta

from app.core.errors import AppError
from app.core.passwords import hash_password, verify_password
from app.modules.auth.models import Session
from app.modules.auth.repository import AuthRepository
from app.modules.auth.schemas import Login, PasswordChange, Register
from app.modules.users import UserDirectory, UserProfile


def token_hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


class AuthService:
    def __init__(
        self, repository: AuthRepository, users: UserDirectory, lifetime_seconds: int = 28800
    ) -> None:
        self.repository = repository
        self.users = users
        self.lifetime_seconds = lifetime_seconds

    async def register(self, data: Register) -> UserProfile:
        user = await self.users.create(
            username=data.username,
            email=data.email,
            first_name=data.first_name,
            last_name=data.last_name,
            password_hash=await hash_password(data.password.get_secret_value()),
        )
        await self.repository.session.commit()
        return user

    async def login(self, data: Login) -> tuple[UserProfile, str]:
        guard = await self.repository.guard(data.username)
        now = datetime.now(UTC)
        if guard.locked_until and guard.locked_until > now:
            raise AppError(
                code="login_locked", message="Espera antes de volver a intentar", status_code=429
            )
        if guard.locked_until:
            guard.failures = 0
            guard.locked_until = None
        credentials = await self.users.credentials(data.username)
        valid = await verify_password(
            credentials.password_hash if credentials else None, data.password.get_secret_value()
        )
        if not valid or credentials is None:
            guard.failures += 1
            guard.updated_at = now
            if guard.failures >= 5:
                guard.locked_until = now + timedelta(minutes=15)
            await self.repository.session.commit()
            raise AppError(
                code="invalid_credentials", message="Credenciales inválidas", status_code=401
            )
        user = await self.users.get(credentials.user_id)
        if user.status != "ACTIVE":
            raise AppError(code="account_blocked", message="Cuenta no disponible", status_code=403)
        guard.failures = 0
        guard.locked_until = None
        guard.updated_at = now
        raw = secrets.token_urlsafe(32)
        self.repository.session.add(
            Session(
                token_hash=token_hash(raw),
                user_id=user.user_id,
                expires_at=now + timedelta(seconds=self.lifetime_seconds),
            )
        )
        await self.repository.session.commit()
        return user, raw

    async def identity(self, raw: str | None) -> UserProfile:
        session = await self.repository.find_session(token_hash(raw or ""), datetime.now(UTC))
        if session is None:
            raise AppError(code="unauthenticated", message="Inicia sesión", status_code=401)
        user = await self.users.get(session.user_id)
        if user.status != "ACTIVE":
            raise AppError(code="account_blocked", message="Cuenta no disponible", status_code=403)
        return user

    async def logout(self, raw: str | None) -> None:
        await self.repository.revoke(token_hash(raw or ""))
        await self.repository.session.commit()

    async def change_password(self, user: UserProfile, data: PasswordChange) -> str:
        # Serialize password changes and logins for the same account.
        await self.repository.guard(user.username)
        credentials = await self.users.credentials(user.username)
        current = data.current_password.get_secret_value()
        new = data.new_password.get_secret_value()
        if credentials is None or not await verify_password(credentials.password_hash, current):
            raise AppError(
                code="invalid_credentials", message="Contraseña actual inválida", status_code=400
            )
        if current == new:
            raise AppError(
                code="password_reused",
                message="La nueva contraseña debe ser diferente",
                status_code=422,
            )
        await self.users.change_password(user.user_id, await hash_password(new))
        await self.repository.revoke_user(user.user_id)
        raw = secrets.token_urlsafe(32)
        self.repository.session.add(
            Session(
                token_hash=token_hash(raw),
                user_id=user.user_id,
                expires_at=datetime.now(UTC) + timedelta(seconds=self.lifetime_seconds),
            )
        )
        await self.repository.session.commit()
        return raw
