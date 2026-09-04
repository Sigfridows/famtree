# ADR 0003: Baseline relacional aprobado

- Estado: aceptado
- Fecha: 2026-09-04

## Contexto

Los diagramas ER, de clases y de objetos actualizados permiten fijar el primer
contrato relacional sin implementar todavía las historias de usuario. El SQL
fue probado de forma aislada sobre PostgreSQL 16.13 antes de incorporarlo al
repositorio.

## Decisión

- La revisión Alembic `20260904_0001` crea el esquema `famtree`, sus 15 tablas,
  constraints, índices, funciones, triggers, vistas y catálogos iniciales.
- Los modelos SQLAlchemy viven dentro de sus módulos funcionales. El agregador
  `app.db.models` existe solo para entregar a Alembic un `Base.metadata`
  completo; no crea una carpeta global de modelos.
- El contenedor backend ejecuta `alembic upgrade head` antes de arrancar
  Uvicorn. Esto actualiza tanto bases nuevas como volúmenes existentes.
- `docker-entrypoint-initdb.d` no se usa: PostgreSQL solo ejecuta esos scripts
  cuando el volumen está vacío y no sirve como mecanismo de evolución.
- `RESENA_ELIMINADA` borra la reseña asociada y sus dependencias por cascada,
  tal como indican los diagramas actuales.

## Decisiones todavía abiertas

- La tabla de sesiones PostgreSQL se añadirá con la feature de autenticación;
  sus campos y política de expiración no aparecen aún en el baseline aprobado.
- Si se necesita conservar el reporte después de eliminar una reseña, el modelo
  requerirá un snapshot de auditoría y una migración posterior.
- Formato y tamaño de imágenes se validarán en la abstracción de almacenamiento;
  la base actual conserva la URL.

Estas exclusiones son explícitas y no autorizan implementar lógica de negocio.
