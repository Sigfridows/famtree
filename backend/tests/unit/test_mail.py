import smtplib
from email.message import EmailMessage
from typing import Any

import pytest

from app.core.mail import SmtpCredentialMailer


async def test_credential_email_uses_username_and_change_instruction(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    messages: list[EmailMessage] = []

    class Sink:
        def __init__(self, *_args: Any, **_kwargs: Any) -> None:
            pass

        def __enter__(self) -> "Sink":
            return self

        def __exit__(self, *_args: Any) -> None:
            pass

        def send_message(self, message: EmailMessage) -> None:
            messages.append(message)

    monkeypatch.setattr(smtplib, "SMTP", Sink)
    mailer = SmtpCredentialMailer("localhost", 1025, "http://localhost:3000/login")
    assert await mailer.send("test@example.invalid", "admin", "Temporary123!", "Demo")
    assert messages[0]["To"] == "test@example.invalid"
    assert "Usuario: admin" in messages[0].get_content()
    assert "primer inicio" in messages[0].get_content()


async def test_smtp_failure_is_reported_without_rolling_back_account(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def fail(*_args: Any, **_kwargs: Any) -> None:
        raise OSError("SMTP unavailable")

    monkeypatch.setattr(smtplib, "SMTP", fail)
    assert not await SmtpCredentialMailer("localhost", 1025, "http://localhost/login").send(
        "test@example.invalid", "admin", "Temporary123!", "Demo"
    )
