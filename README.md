# FamTree

FamTree es una plataforma para buscar, explorar y comparar centros de atención para adultos mayores. Este repositorio contiene el frontend y el backend del MVP como un **monolito modular**. La documentación de [Engineering & QA en Notion](https://app.notion.com/p/3d011fd4635081be9e3de97ba42fdf5e?pvs=204) es la fuente de verdad de requisitos; este README se concentra en ejecutar y contribuir al código.

> Estado: bootstrap técnico. No se ha implementado ninguna historia de usuario de negocio.

## Arquitectura

- `frontend`: Next.js, React, TypeScript estricto y Tailwind CSS.
- `backend`: FastAPI, Pydantic, SQLAlchemy 2.x y Alembic.
- `postgres`: fuente de datos del MVP.
- `mailpit`: captura de correo exclusivamente para desarrollo.
- `uploads_data`: volumen local detrás de la futura abstracción de almacenamiento.

Frontend consume FastAPI únicamente mediante REST/JSON bajo `/api/v1`. El backend se organiza por feature y conserva la autoridad sobre permisos y reglas de negocio.

## Estructura

```text
.
├── backend/            API, migraciones y tests de Python
├── frontend/           aplicación Next.js y tests de componentes
├── qa/                 BDD, E2E, pruebas manuales y trazabilidad
├── docs/               decisiones técnicas del repositorio
├── scripts/            automatizaciones futuras del equipo
├── .github/workflows/  quality gates de backend y frontend
├── docker-compose.yml
└── Makefile
```

Consulta la [arquitectura](docs/architecture.md), las [decisiones técnicas](docs/adr/), la [guía del frontend](frontend/README.md), la [estructura de QA](qa/) y las [reglas para scripts](scripts/README.md) para el detalle de cada área.

## Prerrequisitos

- Git.
- Docker Engine con Docker Compose v2.
- Opcional para flujo híbrido: Python 3.12 y Node.js 22.

## Preparación del entorno

```bash
git clone https://github.com/Sigfridows/famtree.git
cd famtree
cp .env.example .env
docker compose up --build
```

Los valores de `.env.example` son solo defaults locales. Cambia `SESSION_SECRET` y cualquier credencial antes de usar un entorno compartido. Los archivos `.env` no se versionan.

Variables disponibles: `COMPOSE_PROJECT_NAME` identifica el stack; `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` y `POSTGRES_PORT` configuran PostgreSQL; `BACKEND_PORT` y `FRONTEND_PORT` publican las aplicaciones; `MAILPIT_SMTP_PORT` y `MAILPIT_WEB_PORT` publican Mailpit; `APP_ENV`, `DATABASE_URL`, `CORS_ORIGINS`, `SESSION_SECRET`, `SMTP_HOST`, `SMTP_PORT` y `UPLOAD_DIR` configuran el backend; `NEXT_PUBLIC_API_BASE_URL` indica al navegador dónde encontrar `/api/v1`. Mantén sincronizados `DATABASE_URL` y las credenciales de PostgreSQL cuando cambies sus defaults.

## Flujo Docker

```bash
make up       # construye y levanta el stack en primer plano
make logs     # sigue logs de todos los servicios
make down     # detiene el stack sin borrar volúmenes
```

No uses `docker compose down -v` salvo que quieras eliminar explícitamente los datos locales.

## Desarrollo local o híbrido

Para ejecutar solo PostgreSQL y Mailpit en Docker:

```bash
make infra-up
```

Backend local:

```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
python -m pip install --require-hashes -r requirements.lock
cp .env.example .env
uvicorn app.main:app --reload
```

Frontend local:

```bash
cd frontend
npm ci
cp .env.example .env.local
npm run dev
```

## Migraciones

Alembic está configurado, pero no existe una migración de negocio inicial. El modelo de datos permanece bloqueado hasta que la fase F0 de Notion reconcilie y apruebe el ER.

```bash
make migrate
make migration MESSAGE="describe change"  # solo después del baseline F0
```

Todas las modificaciones de esquema deben entrar por Alembic; nunca por cambios manuales en PostgreSQL.

## Pruebas

```bash
make test
make test-backend
make test-frontend
```

La suite backend ejecuta unit/API tests y una prueba real de conectividad PostgreSQL. Playwright está preparado en `frontend/playwright.config.ts`; los flujos E2E se incorporarán cuando existan historias de usuario implementadas.

## Lint y tipos

```bash
make lint
make lint-backend
make lint-frontend
```

Los gates incluyen Ruff, Ruff format, mypy, Bandit, pip-audit, ESLint, TypeScript estricto, Vitest y el build de producción de Next.js.

## Git workflow

1. Actualiza `main`.
2. Crea una rama corta por tarea (`feature/...`, `fix/...`, `chore/...`).
3. Ejecuta `make test` y `make lint`.
4. Abre un Pull Request hacia `main`.
5. No hagas push directo a `main`.

## URLs útiles

| Servicio | URL |
| --- | --- |
| Frontend | <http://localhost:3000> |
| API | <http://localhost:8000/api/v1/health> |
| Swagger | <http://localhost:8000/docs> |
| OpenAPI | <http://localhost:8000/openapi.json> |
| Mailpit | <http://localhost:8025> |
| PostgreSQL | `localhost:5432` |

## Troubleshooting

- **Puerto ocupado:** cambia `FRONTEND_PORT`, `BACKEND_PORT`, `POSTGRES_PORT` o `MAILPIT_WEB_PORT` en `.env`. Si cambias el puerto backend, actualiza también `NEXT_PUBLIC_API_BASE_URL`.
- **Frontend muestra “API no disponible”:** verifica `docker compose ps`, la URL pública del API y CORS.
- **PostgreSQL no inicia:** revisa `docker compose logs postgres`; un volumen anterior puede contener credenciales distintas.
- **Dependencias desactualizadas:** no edites lockfiles a mano; usa el gestor correspondiente y vuelve a ejecutar todos los gates.
- **Cambios de base de datos:** no generes modelos o migrations de negocio antes de que F0 esté aprobado.
