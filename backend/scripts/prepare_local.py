"""Recover backend-only Compose settings from the already running development containers."""

import json
import os
import subprocess
from pathlib import Path

root = Path(__file__).resolve().parents[1]


def environment(container: str) -> dict[str, str]:
    result = subprocess.run(
        ["docker", "inspect", container], check=True, capture_output=True, text=True
    )
    return dict(item.split("=", 1) for item in json.loads(result.stdout)[0]["Config"]["Env"])


backend = environment("famtree-backend-1")
postgres = environment("famtree-postgres-1")
values = {key: backend[key] for key in ["DATABASE_URL", "SESSION_SECRET", "CORS_ORIGINS"]}
values.update(
    POSTGRES_PASSWORD=postgres["POSTGRES_PASSWORD"],
    BACKEND_PORT="18000",
    APP_ENV="development",
    SMTP_HOST="mailpit",
    SMTP_PORT="1025",
)
runtime = root / ".runtime"
runtime.mkdir(exist_ok=True)
path = runtime / "compose.env"
fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
with os.fdopen(fd, "w") as target:
    for key, value in values.items():
        if "\n" in value or "'" in value:
            raise ValueError("Unsupported local environment value")
        target.write(f"{key}='{value}'\n")
