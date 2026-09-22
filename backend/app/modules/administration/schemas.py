from pydantic import Field

from app.core.contracts import Contract, Id
from app.modules.auth.schemas import Email, Username
from app.modules.users.schemas import Name, Phone, UserProfile


class BlockUser(Contract):
    reason: str = Field(min_length=10, max_length=300)


class CreateCenterAdmin(Contract):
    username: Username
    email: Email
    first_name: Name
    last_name: Name
    assigned_asylum_id: Id
    phone: Phone


class TemporaryAccount(Contract):
    user: UserProfile
    temporary_password: str
    email_delivered: bool
