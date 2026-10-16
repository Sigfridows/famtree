# Verificación vigente por criterios de aceptación

Los criterios de `acceptance-audit.json` tienen prioridad sobre las decisiones anteriores de la sesión. La revisión se separa por criterio; un escenario aprobado no equivale a aprobar todos los criterios del bug.

- [Pasos para las capturas manuales](reports/capture-guide.md).
- [Revisión de los 222 criterios](reports/acceptance-criteria-review.md).
- `verify-acceptance.mjs`: 58 escenarios focalizados sin capturas.
- `verify-acceptance-edges.mjs`: pruebas de variantes y errores sin capturas.
- `generate-capture-guide.mjs`: regenera únicamente documentos escritos.

Ejecutar desde la raíz del repositorio con Docker Compose activo:

```sh
node qa/manual/verify-acceptance.mjs
node qa/manual/verify-acceptance-edges.mjs
node qa/manual/generate-capture-guide.mjs
```

Las pruebas requieren las cuentas ficticias locales guardadas en `backend/.runtime/`, excluidas de Git. Crean datos ficticios y cambian temporalmente estados de prueba; no deben ejecutarse contra producción. Los archivos de resultados quedan en esa misma carpeta. Los casos de contraseña temporal necesitan una cuenta con cambio pendiente y dejan de cumplir esa condición después de una actualización válida.

`verify-azure-bugs.mjs`, `build-evidence-gallery.mjs`, `azure-evidence-scope.json` y el informe anterior documentan la pasada histórica de capturas. No representan los criterios vigentes y no deben usarse para declarar resuelto un bug. Las capturas anteriores quedaron obsoletas para los flujos modificados, especialmente favoritos y registro. La verificación actual no genera screenshots.

La ejecución literal en Chrome sobre Windows 11 queda pendiente para AZ-800 / CA4. No se sustituye por una prueba en Chromium sobre Ubuntu.
