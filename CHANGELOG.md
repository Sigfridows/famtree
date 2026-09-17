# Changelog

All notable changes to FamTree are documented in this file.

## [0.2.0.0] - 2026-09-17

El frontend ya puede consultar centros activos, buscar y filtrar el catálogo,
obtener fichas y datos para mapas, y comparar entre dos y cuatro centros.

### Added

- Public REST endpoints for paginated search, filter catalogs, center details,
  lightweight map pins, and ordered comparisons of 2–4 active centers.
- Feature-owned query services and repository ports with request-scoped dependency
  injection, and published-review rating aggregates through a public read contract.
- Typed frontend adapters with cancellation, shared transport, and uncached reads.
- PostgreSQL integration tests and isolated live HTTP contract checks from TypeScript.
- API consumption guide and FT03–FT05 traceability, distinguishing the delivered
  backend from pending business screens and authenticated modules.

### Changed

- Frontend coverage now includes all feature adapters.

### Fixed

- Structured validation errors correctly serialize ValueError context instead of
  failing when a query contains an inverted price range or duplicate comparison IDs.

## [0.1.1.0] - 2026-09-04

El equipo ya puede obtener el esquema relacional aprobado al iniciar Docker, sin
ejecutar SQL manual ni depender de un volumen PostgreSQL vacío.

### Added

- The approved 15-table PostgreSQL baseline, catalogs, constraints, indexes,
  triggers, and views as the first Alembic revision.
- Feature-owned SQLAlchemy models for users, asylums, reviews, favorites,
  notifications, and administration, plus a single metadata loader for Alembic.
- Unit and PostgreSQL integration checks for migration SQL, mapped metadata,
  catalogs, triggers, and the approved report-reason enum.
- ADR 0003 documenting the adopted baseline and the session, moderation-retention,
  and image-validation decisions that remain open.

### Changed

- Backend containers now apply `alembic upgrade head` before starting FastAPI.
- Backend CI and `make db-check` now fail when SQLAlchemy metadata drifts from
  the migrated database.
- Contributor documentation now treats Alembic as the only supported path for
  applying or evolving the schema.

### Fixed

- Alembic now keeps its version table in `public` even though the database user
  and domain schema share the name `famtree`.

## [0.1.0.0] - 2026-09-03

El equipo ya puede levantar el entorno completo con `cp .env.example .env && make up`; consulta el README para los flujos Docker, híbrido y de calidad.

### Added

- A reproducible Docker Compose environment for Next.js, FastAPI, PostgreSQL, and Mailpit.
- A modular FastAPI foundation with versioned routing, structured errors, SQLAlchemy sessions, Alembic, and local storage abstraction.
- A strict Next.js and TypeScript foundation with Tailwind CSS, a centralized REST client, and a development health page.
- Explicit FT01–FT12 frontend/backend feature boundaries, architecture tests, and the reviewed Draw.io domain source.
- Backend, frontend, integration, coverage, security, type, lint, and production-build quality gates in GitHub Actions.
- A Windows frontend compatibility job plus PowerShell, Docker Desktop, and WSL 2 onboarding guidance.
- Contributor documentation, architecture decisions, QA structure, environment examples, and working Make targets.

### Changed

- The existing frontend now follows the repository-wide `frontend/` application layout.
- Docker test artifacts are isolated from bind-mounted source so container runs do not create root-owned local files.

### Removed

- The obsolete Adminer-only development stack and unused starter artwork.
