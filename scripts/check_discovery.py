#!/usr/bin/env python3
"""Linux local verification using a disposable PostgreSQL and live HTTP adapters.

Requires Docker, backend/.venv (locked dev dependencies), frontend/node_modules.
Never connects to the project's existing database. Removes only its own container.
"""

import os
import socket
import subprocess
import tempfile
import time
from pathlib import Path
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]
BACKEND = ROOT / "backend"
FRONTEND = ROOT / "frontend"
PYTHON = BACKEND / ".venv/bin/python"


def main() -> None:
    if not PYTHON.is_file() or not (FRONTEND / "node_modules/.bin/vitest").is_file():
        raise SystemExit(
            "Install backend/requirements.lock in .venv and run npm ci in frontend first"
        )
    container = subprocess.check_output(
        [
            "docker",
            "run",
            "--rm",
            "-d",
            "-e",
            "POSTGRES_USER=famtree",
            "-e",
            "POSTGRES_PASSWORD=discovery_test",
            "-e",
            "POSTGRES_DB=famtree_test",
            "-p",
            "127.0.0.1::5432",
            "postgres:16.10-alpine",
        ],
        text=True,
    ).strip()
    server = None
    try:
        for _ in range(60):
            ready = subprocess.run(
                ["docker", "exec", container, "pg_isready", "-U", "famtree"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                check=False,
            )
            if ready.returncode == 0:
                break
            time.sleep(0.5)
        else:
            raise RuntimeError("Disposable PostgreSQL did not start")
        address = subprocess.check_output(
            ["docker", "port", container, "5432"], text=True
        ).strip()
        env = os.environ | {
            "APP_ENV": "test",
            "RUN_DATABASE_TESTS": "1",
            "DATABASE_URL": f"postgresql+asyncpg://famtree:discovery_test@{address}/famtree_test",
            "SESSION_SECRET": "discovery-local-test-only",
        }
        for args in [
            ["-m", "alembic", "upgrade", "head"],
            ["-m", "alembic", "check"],
            ["-m", "pytest", "--cov=app", "--cov-report=term-missing"],
        ]:
            subprocess.run([str(PYTHON), *args], cwd=BACKEND, env=env, check=True)
        # Test-owned data, committed only to the disposable database for cross-process HTTP checks.
        subprocess.run(
            [
                str(PYTHON),
                "-c",
                """
import asyncio, os, runpy
from app.db.session import DatabaseManager
seed = runpy.run_path('tests/integration/test_discovery.py')['seed']
async def run():
    database = DatabaseManager(os.environ['DATABASE_URL'])
    try:
        async with database.session_factory() as session, session.begin():
            await seed(session)
    finally:
        await database.dispose()
asyncio.run(run())
""",
            ],
            cwd=BACKEND,
            env=env,
            check=True,
        )
        with socket.socket() as listener, tempfile.TemporaryFile(mode="w+") as log:
            listener.bind(("127.0.0.1", 0))
            listener.listen(128)
            port = listener.getsockname()[1]
            server = subprocess.Popen(
                [
                    str(PYTHON),
                    "-m",
                    "uvicorn",
                    "app.main:app",
                    "--fd",
                    str(listener.fileno()),
                ],
                cwd=BACKEND,
                env=env,
                pass_fds=(listener.fileno(),),
                stdout=log,
                stderr=log,
            )
            for _ in range(60):
                if server.poll() is not None:
                    log.seek(0)
                    raise RuntimeError(log.read())
                try:
                    with urlopen(
                        f"http://127.0.0.1:{port}/api/v1/health", timeout=0.5
                    ) as response:
                        if response.status == 200:
                            break
                except OSError:
                    time.sleep(0.25)
            else:
                raise RuntimeError("Disposable API did not start")
            subprocess.run(
                [
                    "node_modules/.bin/vitest",
                    "run",
                    "--config",
                    "vitest.discovery.config.mts",
                ],
                cwd=FRONTEND,
                env=env
                | {"NEXT_PUBLIC_API_BASE_URL": f"http://127.0.0.1:{port}/api/v1"},
                check=True,
            )
    finally:
        if server is not None:
            server.terminate()
            try:
                server.wait(timeout=10)
            except subprocess.TimeoutExpired:
                server.kill()
                server.wait()
        subprocess.run(
            ["docker", "stop", "-t", "2", container],
            check=True,
            stdout=subprocess.DEVNULL,
        )


if __name__ == "__main__":
    main()
