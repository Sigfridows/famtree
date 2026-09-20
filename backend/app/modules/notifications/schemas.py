from datetime import datetime

from app.core.contracts import Contract


class NotificationView(Contract):
    notification_id: int
    user_id: int
    asylum_id: int | None
    review_id: int | None
    event_type: str
    title: str
    message: str
    is_read: bool
    created_at: datetime
    resolution_snapshot: dict[str, object] | None = None


class Preferences(Contract):
    preference_id: int
    user_id: int
    availability_alert: bool
    update_alert: bool
    moderation_alert: bool


class PreferenceUpdate(Contract):
    availability_alert: bool | None = None
    update_alert: bool | None = None
    moderation_alert: bool | None = None
