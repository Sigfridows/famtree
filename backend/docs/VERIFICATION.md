# Verificación de entrega — 2026-09-20

- Base actualizada: `origin/main` = `dd4283a`; pull sin conflictos, fetch posterior sin divergencia.
- Cambios limitados a `backend/`; comprobación de rutas staged y secretos locales excluidos.
- Ruff lint y format: pasan.
- mypy estricto: pasa sobre app, pruebas y scripts locales.
- PostgreSQL real: 79 pruebas; cobertura de líneas y ramas combinada 94,69 %.
- Alembic: upgrade head, check sin drift, downgrade base y nuevo upgrade head en base desechable.
- Bandit: sin hallazgos.
- pip-audit con lockfile y hashes: sin vulnerabilidades conocidas.
- Docker backend reconstruido y saludable, API 0.2.0 en puerto 18000.
- Login/session/logout reales con demoAdmin, demoUser y demoCenter: pasan.
- Seed repetible: ejecutado dos veces sin reemplazar cuentas existentes.

## Revisión de datos y permisos

La revisión independiente encontró dos problemas, ambos corregidos y revisados de nuevo:

1. Una identidad de administrador anterior podía sobrevivir a la espera del lock de un centro.
   Las cuatro escrituras operativas revalidan actor/asignación/estado después de adquirirlo.
   La regresión entrega deliberadamente una identidad previa a la reasignación y verifica 403.
2. Los permisos por defecto de un rol de aplicación podían permitir alterar auditoría nueva.
   La migración 0007 revoca UPDATE y DELETE del rol `famtree_app` cuando existe.

Se revisaron también parametrización de SQL, límites de validación, propiedad de reseñas/favoritos,
revocación de sesiones, preferencias de avisos, copias de moderación, contenido de archivos y CSV.

## Límites de la evidencia

No se certifica carga de producción, correo externo ni recorrido UI completo. SMTP se prueba con un
adaptador simulado; localmente está disponible Mailpit. La UI existente tiene un error de instalación
`lucide-react` y contratos pendientes de alinear; no fue modificada. La prueba de carrera es una
regresión determinista de identidad obsoleta, no un ensayo de carga concurrente.

Los detalles, criterios UI pendientes y decisiones respecto al esquema existente están en
`IMPLEMENTATION.md`. El PR es para revisión y no se fusiona automáticamente.
