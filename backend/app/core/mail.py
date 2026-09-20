"""Injectable credential delivery; local development uses the existing Mailpit SMTP sink."""

import asyncio
import logging
import smtplib
from email.message import EmailMessage
from typing import Protocol

logger = logging.getLogger(__name__)


class CredentialMailer(Protocol):
    async def send(
        self, recipient: str, username: str, password: str, center_name: str
    ) -> bool: ...


class SmtpCredentialMailer:
    def __init__(self, host: str, port: int, login_url: str) -> None:
        self.host = host
        self.port = port
        self.login_url = login_url

    async def send(self, recipient: str, username: str, password: str, center_name: str) -> bool:
        message = EmailMessage()
        message["Subject"] = "Bienvenido a FamTree"
        message["From"] = "FamTree <noreply@famtree.local>"
        message["To"] = recipient
        message.set_content(
            f"Centro asignado: {center_name}\nUsuario: {username}\n"
            f"Contraseña temporal: {password}\nIngreso: {self.login_url}\n"
            "Debes cambiar esta contraseña en el primer inicio de sesión."
        )

        def deliver() -> bool:
            try:
                with smtplib.SMTP(self.host, self.port, timeout=10) as smtp:
                    smtp.send_message(message)
                return True
            except (OSError, smtplib.SMTPException):
                logger.warning("credential_delivery_failed")
                return False

        return await asyncio.to_thread(deliver)
