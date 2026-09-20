from typing import Annotated, Self

from pydantic import Field, SecretStr, field_validator, model_validator

from app.core.contracts import Contract
from app.modules.users.schemas import Name

Username = Annotated[
    str, Field(min_length=3, max_length=16, pattern=r"^[A-Za-z0-9]+(?:\.[A-Za-z0-9]+)*$")
]
Email = Annotated[str, Field(max_length=100, pattern=r"^[^@\s]+@[^@\s]+\.[a-zA-Z]{2,}$")]


class Login(Contract):
    username: Username
    password: SecretStr = Field(min_length=1, max_length=128)


class Register(Login):
    username: str = Field(min_length=3, max_length=16, pattern=r"^[A-Za-z0-9]+$")
    confirm_password: SecretStr = Field(min_length=8, max_length=128)

    @model_validator(mode="after")
    def passwords_match(self) -> Self:
        if self.password != self.confirm_password:
            raise ValueError("Las contraseñas no coinciden")
        return self

    email: Email
    first_name: Name
    last_name: Name

    @field_validator("password")
    @classmethod
    def strong_password(cls, value: SecretStr) -> SecretStr:
        validate_password(value.get_secret_value())
        return value


def validate_password(value: str) -> None:
    if (
        len(value) < 8
        or not any(c.islower() for c in value)
        or not any(c.isupper() for c in value)
        or not any(c.isdigit() for c in value)
        or not any(not c.isalnum() and not c.isspace() for c in value)
    ):
        raise ValueError(
            "Use 8-128 characters, uppercase, lowercase, a number and a special character"
        )


class PasswordChange(Contract):
    current_password: SecretStr = Field(min_length=1, max_length=128)
    new_password: SecretStr = Field(min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def strong_password(cls, value: SecretStr) -> SecretStr:
        validate_password(value.get_secret_value())
        return value

    confirm_new_password: SecretStr = Field(min_length=8, max_length=128)

    @model_validator(mode="after")
    def passwords_match(self) -> Self:
        if self.new_password != self.confirm_new_password:
            raise ValueError("Las contraseñas no coinciden")
        return self
