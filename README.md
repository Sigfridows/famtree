# FamTree

FamTree es una plataforma para buscar, explorar y comparar centros de atención para adultos mayores. Este repositorio contiene el frontend y el backend del MVP como un **monolito modular**. La documentación de [Engineering & QA en Notion](https://app.notion.com/p/3d011fd4635081be9e3de97ba42fdf5e?pvs=204) es la fuente de verdad de requisitos; este README se concentra en ejecutar y contribuir al código.

> Estado: baseline relacional aprobado y primer bloque de API pública implementado: búsqueda, detalle, catálogos, mapa y comparación. Incluye adaptadores TypeScript; las pantallas de negocio y sus HUs completas siguen pendientes. Consulta la [guía de consumo y validación](docs/backend-public-discovery.md).

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
├── scripts/            automatizaciones y verificación reproducible
├── .github/workflows/  quality gates de backend y frontend
├── docker-compose.yml
└── Makefile
```

Consulta la [arquitectura](docs/architecture.md), la [guía feature-first](docs/feature-development.md),
la [revisión de diagramas](docs/diagram-review-2026-09-03.md), las [decisiones técnicas](docs/adr/),
la [guía del frontend](frontend/README.md), la [estructura de QA](qa/) y las
[reglas para scripts](scripts/README.md) para el detalle de cada área.

## Prerrequisitos

- Git.
- Linux: Docker Engine con Docker Compose v2.
- Windows 10/11: Docker Desktop con backend WSL 2 y contenedores Linux.
- Opcional para flujo híbrido: Python 3.12 y Node.js 22.

## Preparación del entorno

```bash
git clone https://github.com/Sigfridows/famtree.git
cd famtree
cp .env.example .env
docker compose up --build
```

Los valores de `.env.example` son solo defaults locales. Cambia `SESSION_SECRET` y cualquier credencial antes de usar un entorno compartido. Los archivos `.env` no se versionan.

En PowerShell de Windows, los comandos equivalentes son:

```powershell
git clone https://github.com/Sigfridows/famtree.git
Set-Location famtree
Copy-Item .env.example .env
docker compose up --build
```

Si usa WSL 2, el desarrollador también puede clonar dentro del filesystem de su distribución y usar
los mismos comandos Bash de Linux. Esto suele rendir mejor con bind mounts que guardar el proyecto
en una unidad montada desde Windows.

Variables disponibles: `COMPOSE_PROJECT_NAME` identifica el stack; `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` y `POSTGRES_PORT` configuran PostgreSQL; `BACKEND_PORT` y `FRONTEND_PORT` publican las aplicaciones; `MAILPIT_SMTP_PORT` y `MAILPIT_WEB_PORT` publican Mailpit; `APP_ENV`, `DATABASE_URL`, `CORS_ORIGINS`, `SESSION_SECRET`, `SMTP_HOST`, `SMTP_PORT` y `UPLOAD_DIR` configuran el backend; `NEXT_PUBLIC_API_BASE_URL` indica al navegador dónde encontrar `/api/v1`. Mantén sincronizados `DATABASE_URL` y las credenciales de PostgreSQL cuando cambies sus defaults.

## Los mismos 11 asilos para todos los contribuidores

`git pull` trae el código y los seeds, **no copia la base PostgreSQL de otro equipo**.
Después de actualizar la rama que contiene estos cambios (o `main` una vez fusionado el PR),
cada contribuidor puede cargar el catálogo ficticio completo desde la raíz del repositorio:

```bash
git pull --ff-only
docker compose up -d --build
docker compose exec backend python -m scripts.seed_development
```

El último comando funciona igual en Linux, WSL y PowerShell. Espera a que el backend esté listo
(si todavía está iniciando, vuelve a ejecutar el comando). Requiere `APP_ENV=development`;
no se ejecuta automáticamente ni debe usarse en producción. Para ejecución Python local:
`cd backend` y `python -m scripts.seed_development`, después de `alembic upgrade head`.

En una base nueva crea **11 centros activos**, todos con foto, ubicación, rango de precios,
servicios y tipos de atención: FamTree Demo Centro 1, FamTree Demo Centro 2,
Residencia San José, Residencia Senior Dorada, Hogar San Francisco de Asís,
Casa Serena del Caribe, Hogar Brisas de La Romana, Residencia Sol de Samaná,
Villa Los Almendros, Centro Vida Plena y Casa Jardines de Baní.

La carga se puede repetir: agrega los datos faltantes sin duplicar los centros ni restablecer
contraseñas, estados o datos de registros existentes. Una base con centros adicionales conservará
esos centros; no se fuerza su total a 11. Las fotos son enlaces remotos de demostración y requieren
acceso a sus proveedores. Los IDs, fechas y cambios manuales previos de cada base pueden variar.
No se exportan cuentas de QA, contraseñas, sesiones ni archivos privados de otro equipo.
Las cuentas ficticias se generan con claves propias de cada instalación en
`backend/.runtime/demo-credentials.json` y `backend/.runtime/owner-mock-credentials.json`
(archivos privados ignorados por Git; no subirlos ni compartirlos).

Para verificar la carga desde una base vacía y su segunda ejecución sin duplicados:
`bash backend/scripts/check_development_seed.sh` (Docker y entorno Python del backend requeridos).

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

En Windows PowerShell:

```powershell
Set-Location frontend
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Para el trabajo cotidiano, cada integrante puede ejecutar el stack completo en su propia máquina y
compartir código mediante Git. Si excepcionalmente el frontend de Windows consume un backend que se
ejecuta en otra máquina Ubuntu, usa `NEXT_PUBLIC_API_BASE_URL=http://<IP-UBUNTU>:8000/api/v1`, añade
`http://localhost:3000` a `CORS_ORIGINS` y arranca Uvicorn con
`uvicorn app.main:app --reload --host 0.0.0.0`. Limita el puerto 8000 a la red local; PostgreSQL no
debe exponerse a una red no confiable.

## Migraciones

Alembic instala el baseline relacional aprobado, incluidos catálogos,
constraints, índices, triggers y vistas. El backend ejecuta `alembic upgrade
head` automáticamente al iniciar en Docker, por lo que funciona tanto con un
volumen nuevo como con uno existente.

```bash
make migrate
make db-check
make migration MESSAGE="describe change"
```

Todas las modificaciones de esquema deben entrar por Alembic; nunca por cambios
manuales en PostgreSQL. El SQL inmutable de la revisión inicial está en
`backend/alembic/sql` y no debe ejecutarse directamente.

## Pruebas

```bash
make test
make test-backend
make test-frontend
```

La suite backend ejecuta pruebas unitarias, de API y de integración con PostgreSQL, incluidas las consultas de descubrimiento público. `python3 scripts/check_discovery.py` reproduce las migraciones, la suite backend y el consumo de adaptadores TypeScript por HTTP real en un entorno temporal; consulta sus [prerrequisitos](scripts/README.md). Playwright está preparado en `frontend/playwright.config.ts`; los flujos E2E se incorporarán cuando existan historias de usuario implementadas.

## Lint y tipos

```bash
make lint
make lint-backend
make lint-frontend
```

Los gates incluyen Ruff, Ruff format, mypy, Bandit, pip-audit, ESLint, TypeScript estricto, Vitest y el build de producción de Next.js.

El gate requerido `frontend-checks` se ejecuta en Ubuntu porque las imágenes Docker de FamTree son
Linux y ese runner también detecta imports con capitalización incorrecta. Un job adicional
`Frontend compatibility (Windows)` ejecuta instalación bloqueada, TypeScript y Vitest sobre
`windows-latest` para cubrir el entorno nativo del desarrollador frontend. Ambos jobs corren en
paralelo; el segundo no reemplaza el gate Linux.

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
- **Cambios de base de datos:** ejecuta `make db-check`; si detecta drift entre
  modelos y PostgreSQL, corrige el modelo o crea una revisión Alembic coherente.
- **Docker en Windows no inicia:** ejecuta `wsl --version`, actualiza con `wsl --update` y confirma
  que Docker Desktop usa el motor WSL 2 y contenedores Linux.
- **Archivos modificados solo por saltos de línea:** ejecuta `git add --renormalize .` una sola vez
  si el clon es anterior a `.gitattributes`; los archivos del proyecto se normalizan a LF.
