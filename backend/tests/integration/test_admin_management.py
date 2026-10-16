"""Admin access and notification preferences through real HTTP/PostgreSQL."""

import pytest
from sqlalchemy import text

from app.db.dependencies import get_db_session
from tests.integration.test_workflows import (
    PASSWORD,
    PREFIX,
    Workflow,
    login,
    register,
)

pytest_plugins = ["tests.integration.test_workflows"]
pytestmark = pytest.mark.integration


async def test_new_center_notifies_only_opted_in_users(workflow: Workflow) -> None:
    async with (
        workflow.client() as admin,
        workflow.client() as opted_in,
        workflow.client() as opted_out,
    ):
        await login(admin, "systemadmin")
        await register(opted_in, "subscribed")
        await register(opted_out, "unsubscribed")
        await login(opted_in, "subscribed")
        await login(opted_out, "unsubscribed")
        for client, enabled in [(opted_in, True), (opted_out, False)]:
            response = await client.patch(
                PREFIX + "/notification-preferences", json={"availabilityAlert": enabled}
            )
            assert response.status_code == 200, response.text
        payload = {
            "name": "Centro Nuevo Prueba",
            "municipalityId": workflow.municipality,
            "sector": "Sector Prueba",
            "address": "Calle Prueba 123",
            "latitude": 18.47,
            "longitude": -69.93,
            "description": "Centro nuevo exclusivo de pruebas automatizadas.",
            "totalCapacity": 20,
            "minPrice": "10000",
            "maxPrice": "20000",
            "entryRequirements": "Documento de identidad vigente.",
            "phone": "8095550100",
            "email": "nuevo@example.invalid",
            "serviceIds": workflow.services[:1],
            "seniorTypeIds": workflow.types[:1],
        }
        response = await admin.post(PREFIX + "/admin/asylums", json=payload)
        assert response.status_code == 201, response.text
        asylum_id = response.json()["asylumId"]
        notices = (await opted_in.get(PREFIX + "/notifications")).json()
        assert len(notices) == 1
        assert notices[0]["asylumId"] == asylum_id
        assert notices[0]["eventType"] == "NEW_CENTER"
        assert "Centro Nuevo Prueba" in notices[0]["message"]
        assert (await opted_out.get(PREFIX + "/notifications")).json() == []
        assert (await opted_in.get(PREFIX + "/notifications/unread-count")).json() == {"count": 1}


async def test_database_guard_rejects_new_center_notice_when_preference_is_off(
    workflow: Workflow,
) -> None:
    async with workflow.client() as client:
        user = await register(client, "privacyguard")
        await login(client, "privacyguard")
        response = await client.patch(
            PREFIX + "/notification-preferences", json={"availabilityAlert": False}
        )
        assert response.status_code == 200, response.text
        async for session in workflow.app.dependency_overrides[get_db_session]():
            await session.execute(
                text("""
                    INSERT INTO famtree.notificaciones
                        (codigo_usuario, codigo_asilo, tipo_evento, titulo, mensaje)
                    VALUES (:user_id, :asylum_id, 'NUEVO_CENTRO', 'Nuevo centro', 'Prueba')
                """),
                {"user_id": user["userId"], "asylum_id": workflow.ids[0]},
            )
            await session.commit()
        assert (await client.get(PREFIX + "/notifications")).json() == []


async def test_disabled_assignment_denies_existing_session_and_all_center_apis(
    workflow: Workflow,
) -> None:
    async with workflow.client() as admin, workflow.client() as center:
        await login(admin, "systemadmin")
        created = await admin.post(
            PREFIX + "/admin/asylum-admins",
            json={
                "username": "assignedadmin",
                "firstName": "Centro",
                "lastName": "Admin",
                "email": "assigned@example.invalid",
                "phone": "8095550100",
                "assignedAsylumId": workflow.ids[0],
            },
        )
        assert created.status_code == 201, created.text
        temporary = created.json()["temporaryPassword"]
        await login(center, "assignedadmin", temporary)
        changed = await center.post(
            PREFIX + "/auth/change-temporary-password",
            json={
                "currentPassword": temporary,
                "newPassword": PASSWORD,
                "confirmNewPassword": PASSWORD,
            },
        )
        assert changed.status_code == 204, changed.text
        await login(center, "assignedadmin")
        assert (await center.get(PREFIX + "/center")).status_code == 200
        assert (
            await admin.patch(PREFIX + f"/admin/asylums/{workflow.ids[0]}/deactivate")
        ).status_code == 200
        for path in ["/auth/session", "/center", "/center/images", "/center/reviews"]:
            response = await center.get(PREFIX + path)
            assert response.status_code == 403, (path, response.text)
        assert (
            await center.patch(
                PREFIX + "/center", json={"description": "No debe guardarse este cambio."}
            )
        ).status_code == 403
        assert (await admin.get(PREFIX + f"/admin/asylums/{workflow.ids[0]}")).status_code == 200
        assert (
            await admin.patch(PREFIX + f"/admin/asylums/{workflow.ids[0]}/activate")
        ).status_code == 200
        assert (await center.get(PREFIX + "/center")).status_code == 200
