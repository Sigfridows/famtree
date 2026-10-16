"""Historical attribution is preserved; legacy rows gain only the immutable username."""

from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

from app.modules.asylums.access import CenterAccess
from app.modules.reviews.repository import ReviewRepository
from app.modules.reviews.service import ReviewService
from app.modules.users.service import UserDirectory


async def test_legacy_username_is_read_without_rewriting_the_audit_snapshot() -> None:
    snapshot = {
        "report_id": 10,
        "review_id": 20,
        "reporter_user_id": 30,
        "moderator_user_id": 4,
        "reason": "SPAM",
        "detail": None,
        "justification": "Decisión histórica conservada.",
        "status": "DISCARDED",
        "created_at": "2026-10-01T00:00:00Z",
        "resolved_at": "2026-10-02T00:00:00Z",
    }
    repository = MagicMock(spec=ReviewRepository)
    repository.session = AsyncMock()
    repository.session.scalars.return_value = [SimpleNamespace(snapshot=snapshot)]
    repository.session.execute.return_value = [
        SimpleNamespace(codigo_usuario=4, username="adminestable")
    ]
    service = ReviewService(repository, MagicMock(spec=CenterAccess), MagicMock(spec=UserDirectory))
    result = await service.decisions(0, 20)
    assert result[0].moderator_username == "adminestable"
    assert result[0].moderator_name is None
    assert "moderator_username" not in snapshot
    repository.session.commit.assert_not_awaited()
    repository.session.execute.assert_awaited_once()


async def test_recorded_actor_is_not_replaced_by_a_current_profile() -> None:
    repository = MagicMock(spec=ReviewRepository)
    repository.session = AsyncMock()
    service = ReviewService(repository, MagicMock(spec=CenterAccess), MagicMock(spec=UserDirectory))
    snapshots = [{"moderator_user_id": 4, "moderator_name": "Nombre histórico"}]
    await service._legacy_moderator_usernames(snapshots)
    assert snapshots[0]["moderator_name"] == "Nombre histórico"
    repository.session.execute.assert_not_awaited()
