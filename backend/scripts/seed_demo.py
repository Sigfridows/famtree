"""Idempotent synthetic data for development. Never changes existing accounts or centers."""

import asyncio
import json
import os
import secrets
from pathlib import Path
from typing import cast

from sqlalchemy import select

from app.api.dependencies import get_center_management, get_favorites, get_notifications, get_users
from app.core.config import Settings
from app.core.passwords import hash_password
from app.db import models as _models  # noqa: F401
from app.db.session import DatabaseManager
from app.db.types import RolUsuario
from app.modules.asylums.access import CenterAccess
from app.modules.asylums.management_schemas import AsylumCreate
from app.modules.asylums.models import Asilo, Municipio, Servicio, TipoAdultoMayor

DEMO_CENTERS = (
    {
        "name": "FamTree Demo Centro 1",
        "municipality": "Santo Domingo de Guzmán",
        "property_type": "CASA",
        "sector": "Sector demostración",
        "address": "Dirección ficticia 123",
        "latitude": "18.486100",
        "longitude": "-69.931200",
        "capacity": 20,
        "min_price": "15000",
        "max_price": "25000",
        "phone": "8095550100",
        "email": "demo1@example.invalid",
        "services": ("Alimentación",),
        "care_types": ("Adulto mayor independiente",),
        "image_url": "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80",
    },
    {
        "name": "FamTree Demo Centro 2",
        "municipality": "Santo Domingo de Guzmán",
        "property_type": "CASA",
        "sector": "Sector demostración",
        "address": "Dirección ficticia 123",
        "latitude": "18.496100",
        "longitude": "-69.921200",
        "capacity": 20,
        "min_price": "15000",
        "max_price": "25000",
        "phone": "8095550106",
        "email": "demo2@example.invalid",
        "services": ("Alimentación",),
        "care_types": ("Adulto mayor independiente",),
        "image_url": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    },
    {
        "name": "Casa Serena del Caribe",
        "municipality": "San Felipe de Puerto Plata",
        "property_type": "VILLA",
        "sector": "Los Cocos",
        "address": "Av. Luis Ginebra 18",
        "latitude": "19.793200",
        "longitude": "-70.688400",
        "capacity": 34,
        "min_price": "26000",
        "max_price": "48000",
        "phone": "8095550110",
        "email": "serena@example.invalid",
        "services": ("Alimentación", "Enfermería 24 horas", "Recreación y actividades"),
        "care_types": ("Adulto mayor independiente", "Movilidad reducida"),
        "image_url": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
    },
    {
        "name": "Hogar Brisas de La Romana",
        "municipality": "La Romana",
        "property_type": "CASA",
        "sector": "Buena Vista Norte",
        "address": "Calle Gastón F. Deligne 64",
        "latitude": "18.427300",
        "longitude": "-68.972800",
        "capacity": 28,
        "min_price": "22000",
        "max_price": "39000",
        "phone": "8095550111",
        "email": "brisas@example.invalid",
        "services": ("Alimentación", "Fisioterapia", "Transporte"),
        "care_types": ("Adulto mayor independiente", "Cuidado permanente"),
        "image_url": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80",
    },
    {
        "name": "Residencia Sol de Samaná",
        "municipality": "Santa Bárbara de Samaná",
        "property_type": "GERIATRICO",
        "sector": "Pueblo Arriba",
        "address": "Av. Circunvalación 9",
        "latitude": "19.205600",
        "longitude": "-69.336900",
        "capacity": 22,
        "min_price": "30000",
        "max_price": "52000",
        "phone": "8095550112",
        "email": "solsamana@example.invalid",
        "services": ("Atención médica", "Terapia ocupacional", "Recreación y actividades"),
        "care_types": ("Movilidad reducida", "Cuidados especializados"),
        "image_url": "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80",
    },
    {
        "name": "Villa Los Almendros",
        "municipality": "San Pedro de Macorís",
        "property_type": "VILLA",
        "sector": "Miramar",
        "address": "Calle Domínguez Charro 31",
        "latitude": "18.453900",
        "longitude": "-69.308600",
        "capacity": 26,
        "min_price": "24000",
        "max_price": "42000",
        "phone": "8095550113",
        "email": "almendros@example.invalid",
        "services": (
            "Alimentación",
            "Administración de medicamentos",
            "Asistencia en higiene personal",
        ),
        "care_types": ("Discapacidad física", "Cuidado permanente"),
        "image_url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    },
    {
        "name": "Centro Vida Plena",
        "municipality": "San Francisco de Macorís",
        "property_type": "APARTAMENTO",
        "sector": "Los Maestros",
        "address": "Av. Presidente Antonio Guzmán 77",
        "latitude": "19.300900",
        "longitude": "-70.252200",
        "capacity": 31,
        "min_price": "27000",
        "max_price": "46000",
        "phone": "8095550114",
        "email": "vidaplana@example.invalid",
        "services": ("Enfermería 24 horas", "Fisioterapia", "Atención médica"),
        "care_types": ("Movilidad reducida", "Cuidados especializados"),
        "image_url": "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80",
    },
    {
        "name": "Casa Jardines de Baní",
        "municipality": "Baní",
        "property_type": "CASA",
        "sector": "Villa Majega",
        "address": "Calle Nuestra Señora de Regla 12",
        "latitude": "18.283500",
        "longitude": "-70.331000",
        "capacity": 20,
        "min_price": "20000",
        "max_price": "36000",
        "phone": "8095550115",
        "email": "jardinesbani@example.invalid",
        "services": ("Alimentación", "Terapia ocupacional", "Transporte"),
        "care_types": ("Adulto mayor independiente", "Condiciones cognitivas"),
        "image_url": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
    },
)


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
            ids = []
            for specification in DEMO_CENTERS:
                name = specification["name"]
                existing = await db.scalar(
                    select(Asilo.codigo_asilo).where(Asilo.nombre_asilo == name)
                )
                if existing:
                    ids.append(existing)
                    continue
                municipality = await db.scalar(
                    select(Municipio.codigo_municipio).where(
                        Municipio.nombre_municipio == specification["municipality"]
                    )
                )
                service_ids = list(
                    (
                        await db.scalars(
                            select(Servicio.codigo_servicio).where(
                                Servicio.nombre_servicio.in_(
                                    cast(tuple[str, ...], specification["services"])
                                ),
                                Servicio.estado_servicio.is_(True),
                            )
                        )
                    ).all()
                )
                senior_type_ids = list(
                    (
                        await db.scalars(
                            select(TipoAdultoMayor.codigo_tipo).where(
                                TipoAdultoMayor.nombre_tipo.in_(
                                    cast(tuple[str, ...], specification["care_types"])
                                ),
                                TipoAdultoMayor.estado_tipo.is_(True),
                            )
                        )
                    ).all()
                )
                if not municipality or not service_ids or not senior_type_ids:
                    raise RuntimeError("Run Alembic migrations and catalog seeds before seeding")
                center = await centers.create(
                    AsylumCreate.model_validate(
                        {
                            "municipalityId": municipality,
                            "name": name,
                            "propertyType": specification["property_type"],
                            "description": (
                                "Centro ficticio de demostración para validar el catálogo, "
                                "sus filtros, mapas y flujos de comparación."
                            ),
                            "sector": specification["sector"],
                            "address": specification["address"],
                            "latitude": specification["latitude"],
                            "longitude": specification["longitude"],
                            "totalCapacity": specification["capacity"],
                            "minPrice": specification["min_price"],
                            "maxPrice": specification["max_price"],
                            "entryRequirements": "Información ficticia para pruebas locales.",
                            "phone": specification["phone"],
                            "email": specification["email"],
                            "serviceIds": service_ids,
                            "seniorTypeIds": senior_type_ids,
                            "images": [{"url": cast(str, specification["image_url"])}],
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
