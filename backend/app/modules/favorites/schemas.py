from datetime import datetime

from app.core.contracts import Contract, Id


class FavoriteInput(Contract):
    asylum_id: Id


class FavoriteView(Contract):
    favorite_id: int
    user_id: int
    asylum_id: int
    created_at: datetime
    asylum: dict[str, object] | None = None
