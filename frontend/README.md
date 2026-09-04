# FamTree frontend

Aplicación Next.js con App Router, React, TypeScript estricto y Tailwind CSS.

Antes de modificar Next.js, los agentes de código deben seguir [AGENTS.md](AGENTS.md); [CLAUDE.md](CLAUDE.md) delega esas mismas reglas.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

El acceso HTTP al backend debe pasar por `src/lib/api`; no disperses llamadas `fetch` en componentes de feature. Comandos de calidad:

```bash
npm run lint
npm run typecheck
npm run test:coverage
npm run build
```

Playwright está preparado con `npm run test:e2e`, pero los specs de negocio se añadirán en `../qa/e2e` cuando existan vertical slices implementadas.
