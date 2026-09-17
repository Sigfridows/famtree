# Backend de descubrimiento público — primer bloque

Implementado en `feat/backend-public-discovery`, partiendo de `main` (`d563f90`).

## Alcance y fuentes

Se entrega la parte **backend** de FT03 (búsqueda y detalle), FT04 (datos de mapa) y FT05
(comparación), más catálogos para poblar filtros y adaptadores TypeScript. Son tres áreas
funcionales del primer bloque solicitado; **no equivalen a un 30% medido ni a HUs completas**.
Las pantallas de negocio de `main` siguen siendo placeholders: solo existe el home de bootstrap
con health check. No hay aún una UI de catálogo/mapa/comparación conectada.

Fuentes consultadas:

- [Contrato API de Notion](https://app.notion.com/p/3d011fd46350817798bafa7fb49cb09a).
- [Mapa de features](https://app.notion.com/p/3d011fd46350816494b8f9a99da0f7de).
- [Roadmap](https://app.notion.com/p/3d011fd4635081c3877bebe6b07ca42c).
- [ADR 0003](adr/0003-approved-relational-baseline.md), baseline aprobado en el repositorio.

La página de riesgos de Notion aún conserva el bloqueo de Fase 0 del 3 de septiembre; el ADR del
4 de septiembre y la migración ya integrada en `main` documentan el baseline posterior.
La autorización actual del usuario permite comenzar estas funcionalidades sobre ese baseline.
No se cambiaron tablas, migraciones, decisiones de sesiones ni permisos administrativos.
Las semánticas de filtros y errores que no estaban cerradas se concretan abajo como contrato de
esta rama; no se presentan como criterios de aceptación originales adicionales.

## Arquitectura e inyección de dependencias

```text
api/router.py (composición)
  -> asylums/router.py (HTTP + Pydantic)
     -> Depends(get_asylum_service)
        -> AsylumService(AsylumReader)
           -> SqlAlchemyAsylumReader(AsyncSession)
              -> Depends(get_db_session) -> app.state.database
```

- `ports.py` declara el protocolo de lectura; el servicio recibe el repositorio por constructor.
- Los routers no construyen sesiones, ejecutan SQL ni contienen reglas de consulta.
- `dependencies.py` ensambla objetos con FastAPI. Cada request obtiene una sesión, cerrada al salir.
- Las pruebas API sustituyen el puerto mediante `dependency_overrides`; las de integración usan
  PostgreSQL real, esquema migrado y fixtures transaccionales con rollback.
- `reviews.public_ratings()` expone la proyección SQL de la vista aprobada
  `vw_asilos_calificacion`. `asylums` no importa modelos ni repositorios privados de `reviews`.
  Esta colaboración SQL es deliberada dentro del monolito para filtrar y ordenar antes de paginar.
- Listado y mapa hacen dos consultas, independientemente de los resultados. Detalle/comparación
  cargan imágenes, servicios y tipos en lotes: cuatro consultas para hasta cuatro centros.
- No se agregan dependencias Python/JavaScript ni migraciones.

## Endpoints

Todos son públicos, de solo lectura, bajo `/api/v1`. Swagger: `/docs`; contrato generado:
`/openapi.json`.

| Método y ruta | Respuesta | Uso |
| --- | --- | --- |
| `GET /asylums` | `AsylumPage` | Búsqueda, filtros, orden y páginas de 15 |
| `GET /asylums/catalogs` | `Catalogs` | Provincias, municipios, servicios y tipos de cuidado |
| `GET /asylums/{id}` | `AsylumDetail` | Ficha, galería, contacto y capacidades |
| `GET /asylums/map` | `MapPage` | Pins livianos, páginas de 100, mismos filtros |
| `GET /asylums/compare?ids=7,3` | `Comparison` | Entre 2 y 4 centros diferentes, en el orden solicitado |

`/catalogs`, `/map` y `/compare` se registran antes de `/{id}` para evitar colisiones.

### Filtros de listado y mapa

| Parámetro | Contrato |
| --- | --- |
| `q` | Nombre parcial, hasta 100 caracteres; ignora mayúsculas, tildes y espacios repetidos. `%`, `_` y `\` son literales, no comodines SQL. |
| `province_id`, `municipality_id` | ID positivo, máximo entero seguro de JavaScript; ambos filtros se acumulan. |
| `min_price`, `max_price` | Desde cero, hasta 8 enteros y 2 decimales, finitos; mínimo no puede superar máximo. |
| `services`, `care_types` | IDs CSV (`1,2`) o parámetros repetidos; máximo 30 valores. Se deduplican los filtros y se exige **cada** opción seleccionada. |
| `certified_only` | Si es `true`, exige certificaciones con texto no vacío; no certifica autenticidad del contenido. |
| `rating_min` | De 1 a 5; promedio de reseñas publicadas. Los centros sin reseñas no pasan este filtro. |
| `sort` | `name_asc` (default), `price_asc`, `price_desc`, `rating_desc`. |
| `page` | Entero entre 1 y 1.000.000; default 1. El tamaño lo fija cada endpoint. |

Filtros acumulativos **AND**, incluyendo cada servicio/tipo seleccionado. Solo `ACTIVO` aparece en
listado, detalle, mapa o comparación. Servicios y tipos desactivados tampoco se ofrecen ni se
utilizan como opciones válidas de coincidencia.

El filtro de precios usa **solapamiento inclusivo**: un centro 10.000–20.000 coincide con un
presupuesto 15.000–25.000. `price_asc/desc` ordenan por el precio mínimo. Todos los órdenes
empatan por ID ascendente para mantener paginación estable. `rating_desc` coloca los centros
sin reseñas al final; el promedio proviene de la vista existente, redondeado a dos decimales.

Listado y mapa devuelven `items`, `pagination: {page, page_size, total, pages}` y `filters` con la
consulta normalizada. Sin resultados, `total=0`, `pages=0`, `items=[]`. Una página posterior a la
última conserva el total y devuelve lista vacía. El mapa **no devuelve todos los centros en una
sola respuesta**: recorrer `pagination.pages` manteniendo los filtros. Reiniciar `page=1` al cambiar
filtros. No se ofrece todavía búsqueda por radio, distancia, viewport ni PostGIS.

`GET /asylums/catalogs?province_id=5` limita únicamente los municipios; siempre devuelve todas las
provincias. Una provincia inexistente devuelve municipios vacíos. El baseline tiene 32 provincias
y un conjunto parcial de municipios; no representa la división territorial completa.

### Contratos y errores

Los nombres JSON están en inglés y se corresponden con los tipos de
`frontend/src/features/asylums/types.ts`. La base conserva sus nombres en español.

- Dinero: cadenas decimales (`"10000.00"`); convertir a número únicamente para presentación.
- Coordenadas y calificaciones: números JSON; calificación sin reseñas: `null`, nunca cero.
- `review_count`: solo reseñas `PUBLICADA`, excluye `OCULTA`.
- `cover_url` y `website` pueden ser `null`. La galería devuelve primero la portada.
- Las imágenes conservan la URL almacenada. Este bloque no añade subida/hosting ni verifica
  disponibilidad de archivos; los fixtures usan URLs ficticias y no son imágenes para la UI.
- `422 validation_error`: parámetros inválidos, rango de precios invertido o comparación fuera
  de 2–4 IDs distintos. Se corrigió la serialización de `ValueError` para conservar el contrato.
- `404 asylum_not_found`: ID inexistente o inactivo; ambos casos son indistinguibles.
- Si cualquiera de los IDs de comparación no está disponible, toda la operación devuelve 404;
  no entrega columnas parciales.
- Errores incluyen `error.code`, `error.message`, `error.request_id` y, en validación, `details`.
  Swagger declara el mismo esquema. El cliente existente produce `ApiError`.

## Consumo desde frontend

Los adaptadores usan exclusivamente `apiRequest` del transporte existente, `cache: "no-store"`
y un `AbortSignal` opcional. No duplican fetch, credenciales ni tratamiento de errores.

```typescript
import { getAsylums, getAsylum, getAsylumCatalogs } from "@/features/asylums";
import { getAsylumMap } from "@/features/map";
import { compareAsylums } from "@/features/compare";

const controller = new AbortController();
const catalogs = await getAsylumCatalogs(undefined, controller.signal);
const result = await getAsylums({ q: "robles", sort: "price_asc", page: 1 }, controller.signal);
// Obtener los IDs del resultado; nunca asumir IDs fijos para los datos de desarrollo.
if (result.items.length > 0) {
  const detail = await getAsylum(result.items[0].id, controller.signal);
}
const pins = await getAsylumMap({ province_id: catalogs.provinces[0].id }, controller.signal);
if (result.items.length >= 2) {
  const comparison = await compareAsylums(result.items.slice(0, 2).map(item => item.id));
}
// Al sustituir la consulta o desmontar el componente:
controller.abort();
```

Configurar `NEXT_PUBLIC_API_BASE_URL` con la URL real del backend, incluyendo `/api/v1`, y
`CORS_ORIGINS` con el origen del frontend. Estos adaptadores están preparados para consumo desde
el navegador; en Server Components la URL debe ser accesible desde el servidor Next.js.

Para arrancar la rama en tu stack de desarrollo existente:

```bash
docker compose up -d --build backend
# Frontend local:
cd frontend
npm ci
npm run dev
```

La verificación de esta entrega usó procesos aislados; no reconstruyó los contenedores existentes
ni insertó asilos de prueba en la base habitual. Si esa base solo contiene catálogos, `/asylums`
responderá correctamente con una lista vacía. Aún no existe un endpoint administrativo para altas.

## Pruebas reproducibles y evidencia

Desde la raíz, en Linux con Docker, `.venv` y `node_modules` preparados según README:

```bash
python3 scripts/check_discovery.py
```

El script crea un PostgreSQL temporal en puerto aleatorio de loopback, migra desde cero, ejecuta
`alembic check` y toda la suite backend, carga fixtures ficticios solo allí, arranca FastAPI en
otro puerto aleatorio y verifica los adaptadores TypeScript con **HTTP real**. Cierra FastAPI y
elimina únicamente su propio contenedor al terminar. No usa `.env` para elegir la base.

Verificaciones locales realizadas:

| Gate | Resultado |
| --- | --- |
| Migración desde cero + `alembic check` | PASS; sin drift |
| Pytest con PostgreSQL real | 59 PASS; cobertura total 95,01% |
| Ruff, formato, mypy | PASS |
| Bandit y pip-audit del lockfile | PASS; sin vulnerabilidades conocidas detectadas |
| Vitest habitual | 15 PASS; incluye adaptadores y transporte; cobertura de líneas 97,67% |
| Vitest HTTP real | 2 PASS contra FastAPI y PostgreSQL temporales |
| ESLint, TypeScript y build Next.js | PASS |
| Instalación `npm ci` | PASS; auditoría de instalación sin vulnerabilidades |

Dos avisos de deprecación de Starlette/httpx/AnyIO permanecen en dependencias existentes; no son
fallos de prueba. Cobertura no equivale a cumplimiento funcional completo: la
[trazabilidad](../qa/traceability/public-discovery.md) registra las partes pendientes.

No se ha verificado una UI de negocio, navegación en navegador/dispositivo, despliegue remoto,
CI remoto ni tiempos bajo carga. Los endpoints públicos no necesitan sesión; esto no valida
login, RBAC ni políticas de escritura, que siguen pendientes.

## Siguientes bloques

1. FT01: sesiones revocables, Argon2, registro/login/logout, bloqueo temporal y RBAC; resolver sus
   decisiones de esquema mediante una nueva migración, sin modificar el baseline.
2. FT02 y FT06: perfil y favoritos con ownership y protección por sesión.
3. UI de FT03–FT05: filtros en URL, cards, galería, mapas, comparación y estados vacíos/errores;
   integrar los adaptadores entregados y probar en navegador.
4. FT07: publicación/edición, reportes y moderación de reseñas; esta rama solo consume su agregado.
5. FT11/FT12: altas/edición de centros, permisos por centro asignado y carga local de imágenes.
6. FT08/FT09: notificaciones internas y reportes. FT10 continúa sin definición.

La selección y eliminación de columnas de comparación pertenece al frontend; no requiere una
sesión de comparación persistida en el servidor. Falta QA E2E para marcar las HUs como DONE.
