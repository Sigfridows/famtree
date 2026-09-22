"""Argon2id hashing off the ASGI event loop."""

import asyncio
import secrets

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError

_hasher = PasswordHasher()
_dummy_hash = _hasher.hash(secrets.token_urlsafe(32))


async def hash_password(password: str) -> str:
    return await asyncio.to_thread(_hasher.hash, password)


async def verify_password(encoded: str | None, password: str) -> bool:
    def verify() -> bool:
        try:
            return _hasher.verify(encoded or _dummy_hash, password) and encoded is not None
        except (VerificationError, InvalidHashError):
            return False

    return await asyncio.to_thread(verify)
