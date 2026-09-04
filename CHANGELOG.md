# Changelog

All notable changes to FamTree are documented in this file.

## [0.1.0.0] - 2026-09-03

### Added

- A reproducible Docker Compose environment for Next.js, FastAPI, PostgreSQL, and Mailpit.
- A modular FastAPI foundation with versioned routing, structured errors, SQLAlchemy sessions, Alembic, and local storage abstraction.
- A strict Next.js and TypeScript foundation with Tailwind CSS, a centralized REST client, and a development health page.
- Backend, frontend, integration, coverage, security, type, lint, and production-build quality gates in GitHub Actions.
- Contributor documentation, architecture decisions, QA structure, environment examples, and working Make targets.

### Changed

- The existing frontend now follows the repository-wide `frontend/` application layout.
- Docker test artifacts are isolated from bind-mounted source so container runs do not create root-owned local files.

### Removed

- The obsolete Adminer-only development stack and unused starter artwork.
