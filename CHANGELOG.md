# Changelog

All notable changes to FamTree are documented in this file.

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
