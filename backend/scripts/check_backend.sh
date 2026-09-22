#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p .runtime
container="famtree-backend-check-$$"
cleanup() { docker rm -f "$container" >/dev/null 2>&1 || true; }
trap cleanup EXIT
# This script owns only the uniquely named disposable container below.
docker run -d --name "$container" -p 127.0.0.1::5432 \
  -e POSTGRES_DB=famtree_test -e POSTGRES_USER=famtree -e POSTGRES_PASSWORD=famtree_test \
  postgres:16.10-alpine >/dev/null
ready=0
for attempt in $(seq 1 30); do
  if docker exec "$container" pg_isready -U famtree -d famtree_test >/dev/null 2>&1; then
    ready=1
    break
  fi
  sleep 1
done
[[ "$ready" == 1 ]] || { echo 'Test database did not start'; exit 1; }
port=$(docker port "$container" 5432/tcp | sed 's/.*://')
export APP_ENV=test RUN_DATABASE_TESTS=1
export DATABASE_URL="postgresql+asyncpg://famtree:famtree_test@127.0.0.1:${port}/famtree_test"
.venv/bin/alembic upgrade head
.venv/bin/alembic check
.venv/bin/ruff check .
.venv/bin/ruff format --check .
.venv/bin/mypy app tests scripts/seed_demo.py scripts/prepare_local.py
.venv/bin/pytest --cov=app --cov-report=term-missing --basetemp=.runtime/pytest
.venv/bin/bandit -q -c pyproject.toml -r app
# No business rows survive the transactional test fixtures.
.venv/bin/alembic downgrade base
.venv/bin/alembic upgrade head
