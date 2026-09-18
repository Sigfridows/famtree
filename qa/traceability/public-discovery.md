# FT03–FT05: trazabilidad del primer bloque backend

Fuente de IDs: mapa de features de Notion; el mapa agrupa HU04–HU08, HU09–HU11 y HU12–HU13.
No se inventa una correspondencia uno-a-uno entre HU individual y criterios no disponibles aquí.
La autorización actual comienza lógica de negocio sobre el baseline ya integrado.

| Área | Contrato y componentes | Evidencia automatizada | Pendiente para DONE |
| --- | --- | --- | --- |
| FT03 / HU04–HU08 | `/asylums`, `/asylums/{id}`, `/asylums/catalogs`; módulo `asylums`, adaptadores `features/asylums` | búsqueda con acentos/case/espacios, SQL literal, AND, catálogos activos, rango de precios, certificaciones, ratings publicados, sort estable, páginas de 15, galería/contacto, 404/422, contratos OpenAPI | UI y criterios detallados originales; QA E2E y aceptación visual |
| FT04 / HU09–HU11 | `/asylums/map`; `features/map` | mismos filtros, solo activos, datos ligeros, paginación de 100, consumo HTTP real | Leaflet/OSM, pins/popups, mapa de detalle, manejo de todas las páginas y QA visual |
| FT05 / HU12–HU13 | `/asylums/compare`; `features/compare` | 2–4 IDs distintos, CSV/repetidos, preserva orden, datos homologados, 404 sin respuesta parcial, cuatro queries para cuatro centros | selector, quitar columnas, máximo visual, tabla responsive, QA E2E |
| Infra transversal | `get_db_session`, puertos, DI, errores, cliente API | sustitución del reader, sesión devuelta al pool, CORS, errores estándar, cancelación del transporte, HTTP real TypeScript→FastAPI→PostgreSQL | carga concurrente y despliegue |

Archivos de evidencia:

- `backend/tests/api/test_asylums.py`: validación y DI sin PostgreSQL.
- `backend/tests/integration/test_discovery.py`: API y persistencia real con rollback de fixtures.
- `frontend/src/tests/discovery-api.test.ts`: serialización y transporte con fetch simulado.
- `frontend/src/tests/discovery.live.ts`: llamadas HTTP reales; config independiente.
- `scripts/check_discovery.py`: reproducción aislada de pruebas backend y contrato HTTP.

Estado: backend y adaptadores implementados y verificados localmente; HUs completas y despliegue
pendientes. Consulte [la guía de consumo](../../docs/backend-public-discovery.md).
