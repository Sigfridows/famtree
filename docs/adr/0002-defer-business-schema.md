# ADR 0002: Posponer el esquema de negocio

- Estado: reemplazado por ADR 0003
- Fecha: 2026-09-03

La fase F0 de Notion marca el ER y varias reglas como pendientes de reconciliación. Alembic y SQLAlchemy quedan configurados, pero la primera migración de negocio se generará solo después de aprobar el baseline de datos. Así evitamos convertir supuestos en contratos persistentes.

El baseline actualizado se incorporó el 4 de septiembre de 2026 mediante
[ADR 0003](0003-approved-relational-baseline.md). Las decisiones que siguen
abiertas quedaron fuera de esa primera revisión.
