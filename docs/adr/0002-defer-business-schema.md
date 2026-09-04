# ADR 0002: Posponer el esquema de negocio

- Estado: aceptado temporalmente
- Fecha: 2026-09-03

La fase F0 de Notion marca el ER y varias reglas como pendientes de reconciliación. Alembic y SQLAlchemy quedan configurados, pero la primera migración de negocio se generará solo después de aprobar el baseline de datos. Así evitamos convertir supuestos en contratos persistentes.
