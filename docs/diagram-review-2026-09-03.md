# Revisión de diagramas actualizados — 2026-09-03

Se revisaron los diagramas ER, clases y objetos entregados como `FamTree - 3 diagramas.drawio`.
El archivo fuente versionado está en `docs/diagrams/famtree-domain.drawio`.

## Impacto sobre el bootstrap

Los diagramas respaldan los límites ya definidos: usuarios/autenticación, asilos y catálogos,
favoritos, reseñas y su moderación, notificaciones, administración y gestión del centro. Provincia,
municipio, servicio, tipo de adulto mayor e imagen son entidades relacionadas con asilos; no
justifican features técnicas independientes. El diagrama de objetos es ilustrativo y no se usará
como seed.

La estructura feature-first puede quedar fijada sin adoptar todavía el esquema. No se crean modelos
SQLAlchemy, migraciones ni endpoints de negocio durante el bootstrap.

## Reconciliación aún necesaria

- `MotivoReporte` muestra cinco valores en clases, pero la anotación de SQL enumera tres.
- Notion aún deja abierta la estrategia de soft/hard delete por entidad.
- Falta decidir si existe una única reseña por usuario/asilo o histórico de varias.
- Certificaciones y Ciudad siguen pendientes de definición final.
- La baseline debe incorporar sesiones PostgreSQL y separar bloqueo temporal de login del bloqueo
  administrativo persistente, como exige Notion.

Hasta que el equipo publique y apruebe `FamTree Technical Baseline v1.0`, Alembic conserva solo la
infraestructura de migración.
