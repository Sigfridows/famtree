from datetime import datetime

from sqlalchemy import delete, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.auth.models import LoginGuard, Session


class AuthRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def guard(self, username: str) -> LoginGuard:
        key = username.casefold()
        await self.session.execute(insert(LoginGuard).values(username=key).on_conflict_do_nothing())
        guard = await self.session.scalar(
            select(LoginGuard).where(LoginGuard.username == key).with_for_update()
        )
        if guard is None:
            raise RuntimeError("Login guard was not persisted")
        return guard

    async def find_session(self, token_hash: str, now: datetime) -> Session | None:
        return (
            await self.session.scalars(
                select(Session).where(Session.token_hash == token_hash, Session.expires_at > now)
            )
        ).first()

    async def revoke(self, token_hash: str) -> None:
        await self.session.execute(delete(Session).where(Session.token_hash == token_hash))

    async def revoke_user(self, user_id: int) -> None:
        await self.session.execute(delete(Session).where(Session.user_id == user_id))
