#!/usr/bin/env bash
# Exercises the local frontend against an isolated API and disposable PostgreSQL.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p .runtime
qa_dir=$(mktemp -d "$PWD/.runtime/admin-ui-XXXXXX")
qa_container="famtree-admin-ui-$$"
qa_pid=""
cleanup() {
  if [[ -n "$qa_pid" ]]; then kill "$qa_pid" 2>/dev/null || true; wait "$qa_pid" 2>/dev/null || true; fi
  docker rm -f "$qa_container" >/dev/null 2>&1 || true
}
trap cleanup EXIT
docker run -d --name "$qa_container" -p 127.0.0.1::5432 \
  -e POSTGRES_DB=famtree_ui_test -e POSTGRES_USER=famtree -e POSTGRES_PASSWORD=ui_test postgres:16.10-alpine >/dev/null
for attempt in $(seq 1 30); do
  if docker exec "$qa_container" pg_isready -U famtree -d famtree_ui_test >/dev/null 2>&1; then break; fi
  sleep 1
done
qa_db_port=$(docker port "$qa_container" 5432/tcp | sed 's/.*://')
qa_api_port=$(.venv/bin/python -c 'import socket; s=socket.socket(); s.bind(("127.0.0.1",0)); print(s.getsockname()[1]); s.close()')
export DATABASE_URL="postgresql+asyncpg://famtree:ui_test@127.0.0.1:$qa_db_port/famtree_ui_test"
export APP_ENV=test SMTP_PORT=1 UPLOAD_DIR="$qa_dir/uploads"
export FAMTREE_QA_API="http://localhost:$qa_api_port" FAMTREE_QA_DIR="$qa_dir"
.venv/bin/alembic upgrade head > "$qa_dir/migrations.log" 2>&1
.venv/bin/python - <<'PY'
import asyncio, json, os, secrets
from pathlib import Path
from PIL import Image
from app.api.dependencies import get_users
from app.core.passwords import hash_password
from app.db.session import DatabaseManager
from app.db.types import RolUsuario
from app.db import models  # noqa: F401

async def main():
    database = DatabaseManager(os.environ['DATABASE_URL'])
    credentials = {}
    try:
        async with database.session_factory() as session:
            for username, role in [('qaAdmin', RolUsuario.ADMIN_SISTEMA), ('qaUser', RolUsuario.USUARIO_REGISTRADO), ('qaReporter', RolUsuario.USUARIO_REGISTRADO)]:
                password = 'Qa9!' + secrets.token_urlsafe(20)
                await get_users(session).create(username=username, email=f'{username.lower()}@example.invalid', first_name='Prueba', last_name=username, password_hash=await hash_password(password), role=role, assigned_asylum_id=None, phone=None, temporary=False)
                credentials[username] = password
            await session.commit()
        path = Path(os.environ['FAMTREE_QA_DIR'])
        fd = os.open(path / 'credentials.json', os.O_WRONLY | os.O_CREAT, 0o600)
        with os.fdopen(fd, 'w') as output:
            json.dump(credentials, output)
        Image.new('RGB', (120, 90), (70, 110, 80)).save(path / 'gallery.png')
    finally:
        await database.dispose()
asyncio.run(main())
PY
.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port "$qa_api_port" > "$qa_dir/api.log" 2>&1 &
qa_pid=$!
for attempt in $(seq 1 30); do
  if curl --fail --silent "$FAMTREE_QA_API/openapi.json" >/dev/null; then break; fi
  sleep 1
done
node ../frontend/scripts/check-admin-ui.mjs
printf 'Evidence: %s\n' "$qa_dir"
