from typing import Literal

from pydantic import Field

from app.core.contracts import Contract, Id


class AdminQuery(Contract):
    q: str | None = Field(default=None, max_length=100)
    page: int = Field(default=1, ge=1, le=1000000)
    status: Literal["ACTIVE", "INACTIVE", "BLOCKED"] | None = None
    role: Literal["REGISTERED_USER", "ASYLUM_ADMIN", "SYSTEM_ADMIN"] | None = None
    province_id: Id | None = None


def literal_pattern(value: str) -> str:
    return "%" + value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%"
