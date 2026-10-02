"""Load the owner's fictional dataset, atomically and without replacing existing rows."""

import asyncio
import json
import os
import secrets
from pathlib import Path

from sqlalchemy import text

from app.core.config import Settings
from app.core.passwords import hash_password
from app.db.session import DatabaseManager


async def main() -> None:
    settings = Settings()
    if settings.app_env != "development":
        raise RuntimeError("Mock data is restricted to APP_ENV=development")
    credentials_path = Path(".runtime/owner-mock-credentials.json")
    credentials_path.parent.mkdir(exist_ok=True)
    if not credentials_path.exists():
        credentials = {
            "password": "Ft9!" + secrets.token_urlsafe(24),
            "usernames": [
                "admin.sistema",
                "admin.sanjose",
                "admin.sanfran",
                "alejandro.j",
                "gabriel.morales",
                "elena.castillo",
                "sofia.peralta",
                "maria.fernandez",
            ],
            "note": "Local mock accounts only; existing account passwords are never reset.",
        }
        descriptor = os.open(credentials_path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        with os.fdopen(descriptor, "w") as output:
            json.dump(credentials, output, indent=2)
    credentials = json.loads(credentials_path.read_text())
    password_hash = await hash_password(credentials["password"])
    sql = Path(__file__).with_name("owner_mock.sql").read_text()
    database = DatabaseManager(settings.database_url)
    try:
        async with database.engine.begin() as connection:
            # Serialize seed runs; each statement leaves existing records untouched.
            await connection.execute(text("SELECT pg_advisory_xact_lock(20260930)"))
            for username in credentials["usernames"]:
                existing = await connection.execute(
                    text("SELECT email FROM famtree.usuarios WHERE username = :username"),
                    {"username": username},
                )
                email = existing.scalar_one_or_none()
                if email is not None and not email.endswith("@example.invalid"):
                    raise RuntimeError(f"Refusing to attach mock data to existing user {username}")
            for statement in sql.split(";"):
                if statement.strip():
                    await connection.execute(text(statement), {"password_hash": password_hash})
    finally:
        await database.dispose()


if __name__ == "__main__":
    asyncio.run(main())
