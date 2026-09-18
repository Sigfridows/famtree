# Scripts

Directorio reservado para automatizaciones reproducibles del repositorio. No se agregan scripts vacíos o comandos que no estén validados.

## Verificar descubrimiento público (Linux)

`python3 scripts/check_discovery.py` ejecuta migraciones, pytest y adaptadores TypeScript contra
FastAPI por HTTP real. Requiere Docker, `backend/.venv` con dependencias del lockfile y
`frontend/node_modules` instalado con `npm ci`. Usa puertos aleatorios y una base descartable,
no el stack existente. El proceso y contenedor creados se cierran al salir. Los datos son
ficticios y exclusivos de pruebas. Véase la [guía](../docs/backend-public-discovery.md).
