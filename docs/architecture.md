# Arquitectura inicial

FamTree comienza como monolito modular: un frontend Next.js y una API FastAPI independientes dentro del mismo repositorio, con PostgreSQL como fuente de verdad.

## Límites

- Cada feature del backend vive bajo `backend/app/modules/<feature>`.
- La composición HTTP ocurre en `backend/app/api/router.py`.
- La configuración y los errores transversales viven en `backend/app/core`.
- El frontend accede a REST exclusivamente mediante `frontend/src/lib/api`.
- Las migraciones pertenecen a Alembic.
- Los archivos se guardarán mediante una abstracción de almacenamiento; el MVP usa un volumen local.

## Dependencias intencionalmente ausentes

Redis, Celery, Kubernetes, microservicios, AWS/S3, Clerk, OpenAI/IA y PostGIS no forman parte del bootstrap. Leaflet y OpenStreetMap se añadirán cuando comience la feature de mapas.

## Modelo pendiente

La documentación de Notion mantiene inconsistencias abiertas sobre entidades, constraints y estrategia de borrado. Por eso este bootstrap incluye `Base.metadata` y Alembic, pero no tablas ni una revision inicial vacía que pudiera confundirse con un baseline aprobado.
