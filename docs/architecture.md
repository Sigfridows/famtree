# Arquitectura inicial

FamTree comienza como monolito modular: un frontend Next.js y una API FastAPI independientes dentro del mismo repositorio, con PostgreSQL como fuente de verdad.

## Límites

- Cada feature del backend vive bajo `backend/app/modules/<feature>`.
- La composición HTTP ocurre en `backend/app/api/router.py`.
- La configuración y los errores transversales viven en `backend/app/core`.
- Cada feature del frontend vive bajo `frontend/src/features/<feature>` y expone un `index.ts`.
- El frontend accede a REST mediante adaptadores por feature sobre `frontend/src/lib/api/client.ts`.
- Las migraciones pertenecen a Alembic.
- Los archivos se guardarán mediante una abstracción de almacenamiento; el MVP usa un volumen local.

Consulta [desarrollo por features](feature-development.md) para el mapa frontend/backend y sus
reglas de dependencia.

## Dependencias intencionalmente ausentes

Redis, Celery, Kubernetes, microservicios, AWS/S3, Clerk, OpenAI/IA y PostGIS no forman parte del bootstrap. Leaflet y OpenStreetMap se añadirán cuando comience la feature de mapas.

## Modelo pendiente

La documentación de Notion mantiene inconsistencias abiertas sobre entidades, constraints y estrategia de borrado. Por eso este bootstrap incluye `Base.metadata` y Alembic, pero no tablas ni una revision inicial vacía que pudiera confundirse con un baseline aprobado.

Los [diagramas actualizados](diagram-review-2026-09-03.md) ya orientan la propiedad de los módulos,
pero conservan inconsistencias que impiden declarar el modelo definitivo.
