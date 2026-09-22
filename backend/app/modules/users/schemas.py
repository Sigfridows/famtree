from datetime import datetime
from typing import Annotated, Literal

from pydantic import Field

from app.core.contracts import Contract

Name = Annotated[str, Field(min_length=2, max_length=50, pattern=r"^[\p{L} ]+$")]
Phone = Annotated[str, Field(pattern=r"^[0-9]{10}$")]


class UserProfile(Contract):
    user_id: int
    assigned_asylum_id: int | None
    first_name: str
    last_name: str
    username: str
    email: str
    phone: str | None
    profile_picture: str | None
    description: str | None
    role: Literal["REGISTERED_USER", "ASYLUM_ADMIN", "SYSTEM_ADMIN"]
    status: Literal["ACTIVE", "BLOCKED"]
    requires_password_change: bool
    created_at: datetime


class ProfileUpdate(Contract):
    first_name: Name | None = None
    last_name: Name | None = None
    phone: Phone | None = None
    description: str | None = Field(default=None, max_length=250)
