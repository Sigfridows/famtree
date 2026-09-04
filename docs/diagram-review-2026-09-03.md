# Revisión de diagramas actualizados — 2026-09-03

Se revisaron los diagramas ER, clases y objetos entregados como `FamTree - 3 diagramas.drawio`.
El archivo fuente versionado está en `docs/diagrams/famtree-domain.drawio`.

## Impacto sobre el bootstrap

Los diagramas respaldan los límites ya definidos: usuarios/autenticación, asilos y catálogos,
favoritos, reseñas y su moderación, notificaciones, administración y gestión del centro. Provincia,
municipio, servicio, tipo de adulto mayor e imagen son entidades relacionadas con asilos; no
justifican features técnicas independientes. El diagrama de objetos es ilustrativo y no se usará
como seed.

La estructura feature-first queda fijada y el baseline relacional se adoptó el
4 de septiembre de 2026. Se añadieron modelos SQLAlchemy y una migración, pero
no endpoints ni historias de usuario.

## Decisiones adoptadas

- `MotivoReporte` usa los cinco valores del diagrama de clases.
- Una reseña es única por usuario y asilo en este baseline.
- `RESENA_ELIMINADA` ejecuta el borrado definitivo indicado en el diagrama.
- Certificaciones permanece como texto; no se inventó una entidad adicional.
- `Ciudad` no se agregó porque municipio ya cumple esa función territorial.

## Reconciliación aún necesaria

- Incorporar sesiones PostgreSQL cuando se aprueben sus campos y expiración.
- Separar el bloqueo temporal de login del bloqueo administrativo persistente.
- Decidir si moderación debe conservar un snapshot después de borrar una reseña.
