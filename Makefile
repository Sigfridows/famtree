.PHONY: up down logs infra-up test test-backend test-frontend lint lint-backend lint-frontend migrate migration db-check

up:
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs --follow --tail=200

infra-up:
	docker compose up -d postgres mailpit

test: test-backend test-frontend

test-backend:
	RUN_DATABASE_TESTS=1 docker compose run --rm --build backend pytest --cov=app --cov-report=term-missing

test-frontend:
	docker compose run --rm --build frontend npm run test:coverage

lint: lint-backend lint-frontend

lint-backend:
	docker compose run --rm --build backend sh -c "ruff check . && ruff format --check . && mypy app tests && bandit -c pyproject.toml -r app && pip-audit --require-hashes -r requirements.lock"

lint-frontend:
	docker compose run --rm --build frontend sh -c "npm run lint && npm run typecheck && npm run build"

migrate:
	docker compose run --rm backend alembic upgrade head

migration:
	@test -n "$(MESSAGE)" || (echo "Usage: make migration MESSAGE='describe change'" && exit 1)
	docker compose run --rm backend alembic revision --autogenerate -m "$(MESSAGE)"

db-check:
	docker compose run --rm backend alembic check
