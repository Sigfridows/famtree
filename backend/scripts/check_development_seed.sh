#!/usr/bin/env bash
# Exercise the real development bootstrap against an isolated, disposable database.
set -euo pipefail
cd "$(dirname "$0")/.."
backend="$PWD"
python="${PYTHON_BIN:-$backend/.venv/bin/python}"
mkdir -p .runtime
runtime=$(mktemp -d "$backend/.runtime/seed-check.XXXXXX")
container="famtree-seed-check-$$"
cleanup() {
  docker rm -f "$container" >/dev/null 2>&1 || true
  rm -rf "$runtime"
}
trap cleanup EXIT

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
[[ "$ready" == 1 ]] || { printf 'Test database did not start\n'; exit 1; }
port=$(docker port "$container" 5432/tcp)
port=${port##*:}
export APP_ENV=development SESSION_SECRET=local-seed-verification-only
export DATABASE_URL="postgresql+asyncpg://famtree:famtree_test@127.0.0.1:${port}/famtree_test"
export PYTHONPATH="$backend${PYTHONPATH:+:$PYTHONPATH}"
"$python" -m alembic upgrade head
# Keep generated demo credentials isolated from the developer's real fixture files.
cd "$runtime"
"$python" -m scripts.seed_development
snapshot() {
  docker exec "$container" psql -U famtree -d famtree_test -At -c \
    'SELECT (SELECT count(*) FROM famtree.asilos),
            (SELECT count(*) FROM famtree.imagenes_asilo),
            (SELECT count(*) FROM famtree.usuarios),
            (SELECT count(*) FROM famtree.resenas),
            (SELECT count(*) FROM famtree.favoritos);'
}
first=$(snapshot)
"$python" -m scripts.seed_development
second=$(snapshot)
[[ "$first" == "$second" ]] || { printf 'Seed duplicated records: %s -> %s\n' "$first" "$second"; exit 1; }
"$python" - <<'PY'
from fastapi.testclient import TestClient

from app.core.config import Settings
from app.main import create_app

expected = {
    "FamTree Demo Centro 1", "FamTree Demo Centro 2", "Residencia San José",
    "Residencia Senior Dorada", "Hogar San Francisco de Asís", "Casa Serena del Caribe",
    "Hogar Brisas de La Romana", "Residencia Sol de Samaná", "Villa Los Almendros",
    "Centro Vida Plena", "Casa Jardines de Baní",
}
with TestClient(create_app(Settings())) as client:
    response = client.get("/api/v1/asylums")
    assert response.status_code == 200, response.text
    page = response.json()
    assert page["pagination"]["total"] == 11, page["pagination"]
    assert {item["name"] for item in page["items"]} == expected
    for item in page["items"]:
        detail = client.get(f'/api/v1/asylums/{item["id"]}').json()
        assert detail["cover_url"] and detail["images"], item["name"]
        assert sum(image["is_cover"] for image in detail["images"]) == 1, item["name"]
        assert detail["services"] and detail["care_types"], item["name"]
        assert detail["province_name"] and detail["municipality_name"], item["name"]
    response = client.get("/api/v1/asylums/map")
    assert response.status_code == 200, response.text
    assert {item["name"] for item in response.json()["items"]} == expected
print("PASS: 11 centers in public catalog and map, one cover each; rerun creates no duplicates.")
PY
