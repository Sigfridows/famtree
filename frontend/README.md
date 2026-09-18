# FamTree frontend

Aplicación Next.js con App Router, React, TypeScript estricto y Tailwind CSS.

Antes de modificar Next.js, los agentes de código deben seguir [AGENTS.md](AGENTS.md); [CLAUDE.md](CLAUDE.md) delega esas mismas reglas.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

En PowerShell de Windows usa `Copy-Item .env.example .env.local`; los demás comandos son iguales.

Las capacidades FT01–FT12 viven en `src/features` según su [mapa y reglas](src/features/README.md).
Las rutas importan desde el `index.ts` público de cada feature. El acceso HTTP se define dentro de
la feature sobre `src/lib/api/client.ts`; no disperses llamadas `fetch` en componentes.

Comandos de calidad:

```bash
npm run lint
npm run typecheck
npm run test:coverage
npm run build
```

Playwright está preparado con `npm run test:e2e`, pero los specs de negocio se añadirán en `../qa/e2e` cuando existan vertical slices implementadas.

## API pública disponible

`features/asylums`, `features/map` y `features/compare` exponen adaptadores tipados sobre el
transporte compartido. Consulta la [guía de consumo](../docs/backend-public-discovery.md) para
contratos, filtros, cancelación, paginación de mapa y errores. Las pantallas siguen pendientes.

La prueba con HTTP real se ejecuta desde la raíz con `python3 scripts/check_discovery.py`; crea
PostgreSQL y FastAPI aislados y usa `vitest.discovery.config.mts`.
