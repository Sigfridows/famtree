"""HTTP workflows with request commits inside a rolled-back PostgreSQL transaction."""

import io
from collections.abc import AsyncIterator
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from PIL import Image
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_mailer
from app.core.config import Settings
from app.core.passwords import hash_password
from app.db.dependencies import get_db_session
from app.db.session import DatabaseManager
from app.db.types import RolUsuario
from app.main import create_app
from app.modules.auth.dependencies import center_admin
from app.modules.users.repository import UserRepository
from app.modules.users.schemas import UserProfile
from app.modules.users.service import UserDirectory
from tests.integration.test_discovery import database_test_url, seed

pytestmark = pytest.mark.integration
PASSWORD = "TestingPassword123!"
PREFIX = "/api/v1"


@dataclass
class Workflow:
    app: FastAPI
    ids: list[int]
    municipality: int
    services: list[int]
    types: list[int]

    def client(self) -> AsyncClient:
        return AsyncClient(transport=ASGITransport(app=self.app), base_url="http://test")


@pytest.fixture
async def workflow(tmp_path: Path) -> AsyncIterator[Workflow]:
    database = DatabaseManager(database_test_url())
    app = create_app(
        Settings(app_env="test", database_url=database_test_url(), upload_dir=tmp_path)
    )

    class MailSink:
        async def send(
            self, recipient: str, username: str, password: str, center_name: str
        ) -> bool:
            assert username and password and center_name and recipient.endswith(".invalid")
            return True

    app.dependency_overrides[get_mailer] = MailSink
    async with database.engine.connect() as connection:
        transaction = await connection.begin()
        async with AsyncSession(
            bind=connection, expire_on_commit=False, join_transaction_mode="create_savepoint"
        ) as session:
            ids, _, municipality, services, types = await seed(session)
            await session.execute(text("SET CONSTRAINTS ALL DEFERRED"))
            directory = UserDirectory(UserRepository(session))
            await directory.create(
                username="systemadmin",
                email="admin@example.invalid",
                first_name="System",
                last_name="Admin",
                password_hash=await hash_password(PASSWORD),
                role=RolUsuario.ADMIN_SISTEMA,
            )
            await session.commit()

        async def override() -> AsyncIterator[AsyncSession]:
            async with AsyncSession(
                bind=connection, expire_on_commit=False, join_transaction_mode="create_savepoint"
            ) as session:
                yield session

        app.dependency_overrides[get_db_session] = override
        try:
            yield Workflow(app, ids, municipality, services, types)
        finally:
            await transaction.rollback()
    await database.dispose()
    await app.state.database.dispose()


async def register(client: AsyncClient, name: str) -> dict[str, Any]:
    response = await client.post(
        PREFIX + "/auth/register",
        json={
            "username": name,
            "password": PASSWORD,
            "confirmPassword": PASSWORD,
            "email": f"{name}@example.invalid",
            "firstName": "Prueba",
            "lastName": "Usuario",
        },
    )
    assert response.status_code == 201, response.text
    return dict(response.json())


async def login(client: AsyncClient, name: str, password: str = PASSWORD) -> dict[str, Any]:
    response = await client.post(
        PREFIX + "/auth/login", json={"username": name, "password": password}
    )
    assert response.status_code == 200, response.text
    assert "HttpOnly" in response.headers["set-cookie"]
    return dict(response.json())


async def test_auth_sessions_lockout_and_profile(workflow: Workflow) -> None:
    async with workflow.client() as client, workflow.client() as other:
        assert (await client.get(PREFIX + "/auth/session")).status_code == 401
        user = await register(client, "alice")
        assert "password" not in user and "passwordHash" not in user
        await login(client, "ALICE")
        assert (await client.get(PREFIX + "/users/me")).json()["userId"] == user["userId"]
        assert (
            await client.patch(PREFIX + "/users/me", json={"role": "SYSTEM_ADMIN"})
        ).status_code == 422
        assert (
            await client.patch(PREFIX + "/users/me", json={"description": "Mi descripción"})
        ).status_code == 200
        assert (
            await client.patch(
                PREFIX + "/users/me",
                json={"firstName": "Otra"},
                headers={"Origin": "https://evil.invalid"},
            )
        ).status_code == 403
        assert (await client.get(PREFIX + "/admin/users")).status_code == 403
        await login(other, "alice")
        changed = await client.post(
            PREFIX + "/auth/change-password",
            json={
                "currentPassword": PASSWORD,
                "newPassword": "AnotherPassword123!",
                "confirmNewPassword": "AnotherPassword123!",
            },
        )
        assert changed.status_code == 204, changed.text
        assert (await client.get(PREFIX + "/auth/session")).status_code == 200
        assert (await other.get(PREFIX + "/auth/session")).status_code == 401
        await login(client, "alice", "AnotherPassword123!")
        token = client.cookies.get("famtree_session")
        assert (await client.post(PREFIX + "/auth/logout")).status_code == 204
        client.cookies.set("famtree_session", token or "")
        assert (await client.get(PREFIX + "/auth/session")).status_code == 401
        for _ in range(5):
            result = await client.post(
                PREFIX + "/auth/login", json={"username": "alice", "password": "wrong"}
            )
            assert result.status_code in {401, 429}
        result = await client.post(
            PREFIX + "/auth/login", json={"username": "alice", "password": "AnotherPassword123!"}
        )
        assert result.status_code == 429


async def test_favorites_reviews_moderation_and_notifications(workflow: Workflow) -> None:
    async with workflow.client() as alice, workflow.client() as bob, workflow.client() as admin:
        await register(alice, "alice")
        await register(bob, "bob")
        await login(alice, "alice")
        await login(bob, "bob")
        await login(admin, "systemadmin")
        center = workflow.ids[0]
        favorite = await alice.post(PREFIX + f"/favorites/{center}")
        assert favorite.status_code == 201, favorite.text
        assert (await alice.post(PREFIX + f"/favorites/{center}")).json() == favorite.json()
        assert len((await alice.get(PREFIX + "/favorites")).json()) == 1
        assert (await alice.post(PREFIX + f"/favorites/{workflow.ids[-1]}")).status_code == 404
        review = await alice.post(
            PREFIX + f"/asylums/{center}/reviews",
            json={"rating": 5, "comment": "Una atención excelente."},
        )
        assert review.status_code == 201, review.text
        review_id = review.json()["reviewId"]
        assert (await bob.delete(PREFIX + f"/reviews/{review_id}")).status_code == 404
        assert (
            await alice.post(PREFIX + f"/reviews/{review_id}/reports", json={"reason": "SPAM"})
        ).status_code == 403
        report = await bob.post(PREFIX + f"/reviews/{review_id}/reports", json={"reason": "SPAM"})
        assert report.status_code == 201, report.text
        result = await admin.patch(
            PREFIX + f"/admin/review-reports/{report.json()['reportId']}/moderate",
            json={"status": "REVIEW_REMOVED", "justification": "Reporte verificado de prueba."},
        )
        assert result.status_code == 200, result.text
        assert (await alice.delete(PREFIX + f"/reviews/{review_id}")).status_code == 404
        assert len((await admin.get(PREFIX + "/admin/moderation-decisions")).json()) == 1
        notices = (await bob.get(PREFIX + "/notifications")).json()
        assert len(notices) == 1
        nid = notices[0]["notificationId"]
        assert (await alice.patch(PREFIX + f"/notifications/{nid}/read")).status_code == 404
        assert (await bob.patch(PREFIX + f"/notifications/{nid}/read")).status_code == 204
        assert (await bob.get(PREFIX + "/notifications/unread-count")).json() == {"count": 0}
        result = await admin.patch(PREFIX + f"/admin/asylums/{center}/deactivate")
        assert result.status_code == 200, result.text
        assert len((await alice.get(PREFIX + "/notifications")).json()) == 1
        assert (
            await alice.patch(
                PREFIX + "/notification-preferences", json={"availabilityAlert": False}
            )
        ).status_code == 200
        assert (await admin.patch(PREFIX + f"/admin/asylums/{center}/activate")).status_code == 200
        assert len((await alice.get(PREFIX + "/notifications")).json()) == 1


async def test_center_admin_scope_gallery_and_account_blocking(workflow: Workflow) -> None:
    async with workflow.client() as admin, workflow.client() as center, workflow.client() as member:
        await login(admin, "systemadmin")
        member_data = await register(member, "member")
        await login(member, "member")
        created = await admin.post(
            PREFIX + "/admin/asylum-admins",
            json={
                "username": "centeradmin",
                "firstName": "Centro",
                "lastName": "Admin",
                "email": "centeradmin@example.invalid",
                "phone": "8095550100",
                "assignedAsylumId": workflow.ids[0],
            },
        )
        assert created.status_code == 201, created.text
        temporary = created.json()["temporaryPassword"]
        await login(center, "centeradmin", temporary)
        assert (await center.get(PREFIX + "/center")).status_code == 403
        response = await center.post(
            PREFIX + "/auth/change-temporary-password",
            json={
                "currentPassword": temporary,
                "newPassword": PASSWORD,
                "confirmNewPassword": PASSWORD,
            },
        )
        assert response.status_code == 204, response.text
        stale_identity = UserProfile.model_validate(await login(center, "centeradmin"))
        assert (await center.get(PREFIX + "/center")).json()["asylumId"] == workflow.ids[0]
        assert (
            await center.patch(PREFIX + "/center", json={"name": "Otro centro"})
        ).status_code == 422
        assert (
            await center.patch(
                PREFIX + "/center", json={"description": "Nueva descripción del centro asignado."}
            )
        ).status_code == 200
        assert (
            await center.patch(PREFIX + "/users/me", json={"description": "Mi perfil"})
        ).status_code == 200
        assert (await center.get(PREFIX + "/admin/users")).status_code == 403
        assert (await center.get(PREFIX + "/center/reviews")).status_code == 200
        images = (await center.get(PREFIX + "/center/images")).json()
        for image in images[:-1]:
            assert (
                await center.delete(PREFIX + f"/center/images/{image['imageId']}")
            ).status_code == 204
        assert (
            await center.delete(PREFIX + f"/center/images/{images[-1]['imageId']}")
        ).status_code == 409
        assert (
            await center.post(
                PREFIX + "/center/images", files={"file": ("bad.jpg", b"bad", "image/jpeg")}
            )
        ).status_code == 422
        blocked = await admin.patch(
            PREFIX + f"/admin/users/{member_data['userId']}/block",
            json={"reason": "Motivo válido de bloqueo."},
        )
        assert blocked.status_code == 204, blocked.text
        assert (await member.get(PREFIX + "/auth/session")).status_code == 401
        assert (
            await admin.patch(PREFIX + f"/admin/users/{member_data['userId']}/unblock")
        ).status_code == 204
        await login(member, "member")
        replacement = await admin.post(
            PREFIX + "/admin/asylum-admins",
            json={
                "username": "replacement",
                "firstName": "Nueva",
                "lastName": "Admin",
                "email": "replacement@example.invalid",
                "phone": "8095550100",
                "assignedAsylumId": workflow.ids[0],
            },
        )
        assert replacement.status_code == 201, replacement.text
        assert (await center.get(PREFIX + "/center")).status_code == 401
        # Reproduce an already-authorized request resuming after reassignment commits.
        workflow.app.dependency_overrides[center_admin] = lambda: stale_identity
        rejected = await center.patch(
            PREFIX + "/center",
            json={"description": "Escritura obsoleta después de reasignar el centro."},
        )
        assert rejected.status_code == 403, rejected.text
        workflow.app.dependency_overrides.pop(center_admin)


async def test_reports_filters_and_exports(workflow: Workflow) -> None:
    async with workflow.client() as admin, workflow.client() as visitor:
        await login(admin, "systemadmin")
        assert (await visitor.get(PREFIX + "/admin/dashboard")).status_code == 401
        dashboard = await admin.get(PREFIX + "/admin/dashboard")
        assert dashboard.status_code == 200, dashboard.text
        assert dashboard.json()["centers"] == 19
        for report_type in ["centers", "users", "reviews"]:
            response = await admin.get(
                PREFIX + "/admin/reports", params={"reportType": report_type}
            )
            assert response.status_code == 200, response.text
            assert response.json()["total"] > 0
            for format_name in ["csv", "pdf"]:
                result = await admin.post(
                    PREFIX + "/admin/reports/export",
                    json={
                        "reportType": report_type,
                        "startDate": "2020-01-01",
                        "endDate": "2099-01-01",
                        "format": format_name,
                    },
                )
                assert result.status_code == 200, result.text
                assert "Reporte_" in result.headers["content-disposition"]
                assert result.content.startswith(
                    b"%PDF" if format_name == "pdf" else b"\xef\xbb\xbf"
                )
        empty = await admin.post(
            PREFIX + "/admin/reports/export",
            json={
                "reportType": "centers",
                "startDate": "2000-01-01",
                "endDate": "2001-01-01",
                "format": "csv",
            },
        )
        assert empty.status_code == 422
        invalid = await admin.get(
            PREFIX + "/admin/reports", params={"reportType": "centers", "status": "BLOCKED"}
        )
        assert invalid.status_code == 422


async def test_center_creation_validation_and_admin_filters(workflow: Workflow) -> None:
    async with workflow.client() as admin:
        await login(admin, "systemadmin")
        data = {
            "municipalityId": workflow.municipality,
            "name": "Centro nuevo pruebas",
            "description": "Centro creado durante las pruebas de integración.",
            "sector": "Sector prueba",
            "address": "Calle prueba 123",
            "latitude": "18.4861",
            "longitude": "-69.9312",
            "totalCapacity": 30,
            "minPrice": "10000",
            "maxPrice": "20000",
            "entryRequirements": "Requisitos de prueba válidos.",
            "phone": "8095550100",
            "email": "nuevo@example.invalid",
            "serviceIds": [workflow.services[0]],
            "seniorTypeIds": [workflow.types[0]],
            "images": [{"url": "https://example.invalid/image.jpg"}],
        }
        result = await admin.post(PREFIX + "/admin/asylums", json=data)
        assert result.status_code == 201, result.text
        cid = result.json()["asylumId"]
        assert (await admin.get(PREFIX + f"/admin/asylums/{cid}")).status_code == 200
        assert (await admin.post(PREFIX + "/admin/asylums", json=data)).status_code == 409
        for changes in [
            {"minPrice": "30000"},
            {"serviceIds": [999999]},
            {"seniorTypeIds": [999999]},
            {"municipalityId": 999999},
            {"description": None},
            {},
        ]:
            response = await admin.patch(PREFIX + f"/admin/asylums/{cid}", json=changes)
            assert response.status_code == 422, response.text
        changed = await admin.patch(
            PREFIX + f"/admin/asylums/{cid}",
            json={"serviceIds": [workflow.services[1]], "seniorTypeIds": [workflow.types[1]]},
        )
        assert changed.status_code == 200, changed.text
        listing = await admin.get(
            PREFIX + "/admin/asylums", params={"q": "nuevo", "status": "ACTIVE"}
        )
        assert listing.status_code == 200, listing.text
        assert listing.json()["total"] == 1
        assert (
            await admin.get(PREFIX + "/admin/users", params={"q": "Admin", "role": "SYSTEM_ADMIN"})
        ).json()["total"] == 1


async def test_review_edits_reputation_and_discard(workflow: Workflow) -> None:
    async with workflow.client() as alice, workflow.client() as bob, workflow.client() as admin:
        await register(alice, "alice")
        await register(bob, "bob")
        await login(alice, "alice")
        await login(bob, "bob")
        await login(admin, "systemadmin")
        cid = workflow.ids[2]
        created = await alice.post(
            PREFIX + "/reviews",
            json={"asylumId": cid, "rating": 2, "comment": "Comentario para edición."},
        )
        assert created.status_code == 201, created.text
        rid = created.json()["reviewId"]
        assert (
            await alice.post(
                PREFIX + "/reviews",
                json={"asylumId": cid, "rating": 2, "comment": "Comentario duplicado."},
            )
        ).status_code == 409
        assert (await alice.patch(PREFIX + f"/reviews/{rid}", json={})).status_code == 422
        assert (
            await alice.patch(
                PREFIX + f"/reviews/{rid}",
                json={"rating": 4, "comment": "Comentario ya actualizado."},
            )
        ).status_code == 200
        public = await bob.get(PREFIX + f"/asylums/{cid}/reviews")
        assert public.json()[0]["author"]["name"] == "Prueba Usuario"
        stats = await bob.get(
            PREFIX + f"/asylums/{cid}/reputation",
            params={"rating": 4, "q": "Prueba", "sort": "oldest"},
        )
        assert stats.status_code == 200, stats.text
        assert stats.json()["summary"] == {
            "average": 4.0,
            "count": 1,
            "distribution": {"1": 0, "2": 0, "3": 0, "4": 1, "5": 0},
        }
        report = await bob.post(
            PREFIX + "/reviews/reports", json={"reviewId": rid, "reason": "SPAM"}
        )
        assert report.status_code == 201, report.text
        result = await admin.patch(
            PREFIX + f"/admin/review-reports/{report.json()['reportId']}/moderate",
            json={"status": "DISCARDED", "justification": "El comentario respeta las reglas."},
        )
        assert result.status_code == 200, result.text
        again = await admin.patch(
            PREFIX + f"/admin/review-reports/{report.json()['reportId']}/moderate",
            json={"status": "DISCARDED", "justification": "El comentario respeta las reglas."},
        )
        assert again.status_code == 409
        assert (await admin.get(PREFIX + "/admin/review-reports")).status_code == 200
        assert (await alice.delete(PREFIX + f"/reviews/{rid}")).status_code == 204
        assert (await bob.patch(PREFIX + "/notifications/read-all")).status_code == 204
        assert (await bob.get(PREFIX + "/notification-preferences")).status_code == 200
        assert (
            await bob.patch(PREFIX + "/notification-preferences", json={"updateAlert": None})
        ).status_code == 422
        assert (await alice.post(PREFIX + "/favorites", json={"asylumId": cid})).status_code == 201
        assert (await alice.delete(PREFIX + f"/favorites/{cid}")).status_code == 204


async def test_uploaded_profile_and_gallery_files(workflow: Workflow) -> None:
    buffer = io.BytesIO()
    Image.new("RGB", (40, 30), "blue").save(buffer, "PNG")
    content = buffer.getvalue()
    async with workflow.client() as member, workflow.client() as admin, workflow.client() as center:
        await register(member, "photos")
        await login(member, "photos")
        uploaded = await member.post(
            PREFIX + "/users/me/picture", files={"file": ("profile.png", content, "image/png")}
        )
        assert uploaded.status_code == 200, uploaded.text
        path = uploaded.json()["profilePicture"]
        assert (await member.get(path)).status_code == 200
        replaced = await member.post(
            PREFIX + "/users/me/picture", files={"file": ("profile.png", content, "image/png")}
        )
        assert replaced.status_code == 200
        assert (await member.get(path)).status_code == 404
        await login(admin, "systemadmin")
        account = await admin.post(
            PREFIX + "/admin/asylum-admins",
            json={
                "username": "photosadmin",
                "firstName": "Photo",
                "lastName": "Admin",
                "email": "photosadmin@example.invalid",
                "phone": "8095550100",
                "assignedAsylumId": workflow.ids[0],
            },
        )
        temporary = account.json()["temporaryPassword"]
        await login(center, "photosadmin", temporary)
        assert (
            await center.post(
                PREFIX + "/auth/change-temporary-password",
                json={
                    "currentPassword": temporary,
                    "newPassword": PASSWORD,
                    "confirmNewPassword": PASSWORD,
                },
            )
        ).status_code == 204
        await login(center, "photosadmin")
        uploaded = await center.post(
            PREFIX + "/center/images", files={"file": ("image.png", content, "image/png")}
        )
        assert uploaded.status_code == 201, uploaded.text
        image = uploaded.json()
        cover = await center.patch(PREFIX + f"/center/images/{image['imageId']}/cover")
        assert cover.status_code == 200, cover.text
        assert sum(row["isCover"] for row in cover.json()) == 1
        assert next(row for row in cover.json() if row["imageId"] == image["imageId"])["isCover"]
        assert (
            await center.delete(PREFIX + f"/center/images/{image['imageId']}")
        ).status_code == 204
        assert (await center.get(image["url"])).status_code == 404
