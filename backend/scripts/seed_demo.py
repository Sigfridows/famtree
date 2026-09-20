"""Idempotent synthetic data for development. Never changes existing accounts or centers."""

import asyncio
import io
import json
import os
import secrets
from pathlib import Path

from PIL import Image
from sqlalchemy import select

from app.api.dependencies import get_center_management, get_favorites, get_notifications, get_users
from app.core.config import Settings
from app.core.media import ImageStore
from app.core.passwords import hash_password
from app.db import models as _models  # noqa: F401
from app.db.session import DatabaseManager
from app.db.types import RolUsuario
from app.modules.asylums.access import CenterAccess
from app.modules.asylums.management_schemas import AsylumCreate
from app.modules.asylums.models import Asilo, Municipio, Servicio, TipoAdultoMayor


async def main() -> None:
    settings = Settings()
    if settings.app_env != "development":
        raise RuntimeError("Demo seed is restricted to APP_ENV=development")
    database = DatabaseManager(settings.database_url)
    runtime = Path(".runtime")
    runtime.mkdir(exist_ok=True)
    credentials_path = runtime / "demo-credentials.json"
    credentials = json.loads(credentials_path.read_text()) if credentials_path.exists() else {}
    try:
        async with database.session_factory() as db:
            users = get_users(db)
            centers = get_center_management(
                db, get_favorites(db, CenterAccess(db)), get_notifications(db, users), users
            )
            municipality = await db.scalar(
                select(Municipio.codigo_municipio).order_by(Municipio.codigo_municipio)
            )
            service = await db.scalar(
                select(Servicio.codigo_servicio).where(Servicio.estado_servicio.is_(True))
            )
            care = await db.scalar(
                select(TipoAdultoMayor.codigo_tipo).where(TipoAdultoMayor.estado_tipo.is_(True))
            )
            if not municipality or not service or not care:
                raise RuntimeError("Run Alembic migrations before seeding")
            ids = []
            for index in range(1, 3):
                name = f"FamTree Demo Centro {index}"
                existing = await db.scalar(
                    select(Asilo.codigo_asilo).where(Asilo.nombre_asilo == name)
                )
                if existing:
                    ids.append(existing)
                    continue
                buffer = io.BytesIO()
                Image.new("RGB", (640, 360), (70, 130, 95)).save(buffer, "PNG")
                image_url = await ImageStore(settings.upload_dir).save(buffer.getvalue())
                center = await centers.create(
                    AsylumCreate.model_validate(
                        {
                            "municipalityId": municipality,
                            "name": name,
                            "description": (
                                "Centro ficticio de demostración. "
                                "No representa una institución real."
                            ),
                            "sector": "Sector demostración",
                            "address": "Dirección ficticia 123",
                            "latitude": "18.486100",
                            "longitude": "-69.931200",
                            "totalCapacity": 20,
                            "minPrice": "15000",
                            "maxPrice": "25000",
                            "entryRequirements": "Información ficticia para pruebas locales.",
                            "phone": "8095550100",
                            "email": f"demo{index}@example.invalid",
                            "serviceIds": [service],
                            "seniorTypeIds": [care],
                            "images": [{"url": image_url}],
                        }
                    )
                )
                ids.append(center.asylum_id)
            for username, role, center_id in [
                ("demoAdmin", RolUsuario.ADMIN_SISTEMA, None),
                ("demoUser", RolUsuario.USUARIO_REGISTRADO, None),
                ("demoCenter", RolUsuario.ADMIN_ASILO, ids[0]),
            ]:
                if await users.credentials(username):
                    continue
                password = "Ft9!" + secrets.token_urlsafe(18)
                await users.create(
                    username=username,
                    email=f"{username.lower()}@example.invalid",
                    first_name="Demo",
                    last_name="FamTree",
                    password_hash=await hash_password(password),
                    role=role,
                    assigned_asylum_id=center_id,
                    phone="8095550100" if center_id else None,
                    temporary=bool(center_id),
                )
                await db.commit()
                credentials[username] = password
                fd = os.open(credentials_path, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
                with os.fdopen(fd, "w") as output:
                    json.dump(credentials, output, indent=2)
    finally:
        await database.dispose()


if __name__ == "__main__":
    asyncio.run(main())
