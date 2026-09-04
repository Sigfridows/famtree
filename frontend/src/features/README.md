# Features del frontend

Cada carpeta es una frontera vertical y expone su API pública desde `index.ts`. Se crean dentro de
la feature únicamente las carpetas que necesite la HU (`api`, `components`, `hooks`, `schemas`,
`types` y tests colocados junto al código). `src/app` compone rutas; no contiene reglas de negocio.

| Feature | Notion | Backend propietario |
| --- | --- | --- |
| `auth` | FT01 | `auth` |
| `profile` | FT02 | `users` |
| `asylums` | FT03 | `asylums` |
| `map` | FT04 | `asylums` |
| `compare` | FT05 | `asylums` |
| `favorites` | FT06 | `favorites` |
| `reviews` | FT07 | `reviews` |
| `notifications` | FT08 | `notifications` |
| `reports` | FT09 | `reports` |
| `admin` | FT11 | `administration` |
| `center-admin` | FT12 | `center_management` |
| `health` | bootstrap técnico | `health` |

FT10 permanece sin carpeta porque Notion aún no define si se fusiona, elimina o recibe HUs.

## Reglas de dependencia

1. Las rutas importan desde el `index.ts` público de una feature.
2. Las llamadas REST pasan por `src/lib/api/client.ts`; cada feature define sus endpoints en
   `features/<feature>/api`.
3. Una feature no importa internals de otra. Si dos features necesitan el mismo elemento visual,
   se extrae a `src/components`; si es infraestructura, a `src/lib`.
4. Tipos de dominio viven con su feature. `src/types` se reserva para contratos transversales.
5. Carpetas no equivalen a tablas: mapa y comparación son features de UI servidas por consultas
   del módulo backend `asylums`.
