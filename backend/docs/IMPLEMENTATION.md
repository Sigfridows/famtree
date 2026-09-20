# Backend FamTree: implementación y verificación

Todos los archivos de esta entrega están dentro de `backend/`. Base: `dd4283a`, rama
`feature/complete-backend`. El pull de main y su comprobación posterior no presentaron conflictos.
El trabajo anterior interrumpido permanece en `stash@{0}`; no se restauraron sus documentos externos.

## Fuente funcional

[Documento original con las 45 HUs](https://docs.google.com/document/d/15yjDjBjaU8iTsrOSsCT3pLg-YcBBxP99-8Q0EzpMySM/edit).
Contrastado con el backlog de Notion, el esquema PostgreSQL aprobado y los contratos públicos existentes.
La copia de consulta local está en `.runtime/hus-source.txt` y no forma parte del repositorio.

| Historias | Capacidad del backend | Evidencia automatizada |
|---|---|---|
| HU01–03, 16, 40 | Registro, autenticación por username, Argon2id, bloqueo 5 intentos/15 minutos, sesiones revocables, logout y cambio de contraseña | `test_auth_sessions_lockout_and_profile`, flujo de administrador temporal |
| HU04–13 | Catálogo activo, búsqueda por nombre/localidad sin tildes, filtros AND, orden, páginas de 15, detalle, mapa, comparación de 2–4 | `test_discovery.py` y pruebas unitarias de descubrimiento |
| HU14–15 | Perfil propio, campos protegidos, foto JPEG/PNG de hasta 2 MB, descripción de hasta 250 caracteres | flujos de perfil y archivos; límites de imágenes |
| HU17–19 | Favoritos por propietario, alta idempotente, tarjetas con estado, conservación de inactivos y eliminación | flujo de favoritos y moderación |
| HU20–24 | Reseñas de 1–5 estrellas y 10–500 caracteres, unicidad, propiedad, reportes de terceros | flujo de publicación, edición, reputación y moderación |
| HU25–26, 45 | Bandeja, contador, lectura individual/global, preferencias y eventos internos | aislamiento de notificaciones, supresión por preferencias |
| HU27 | KPIs, cuentas por estado, administradores, distribución por provincia/estrellas y tendencia de altas, rango temporal | consultas HTTP de dashboard |
| HU28–32 | Alta, consulta, edición y estado de centros; ubicación, catálogos y relaciones; búsqueda/páginas administrativas de 20 | creación y validación de centros, filtros y activación |
| HU33–35 | Usuarios por nombre/email/rol/estado, bloqueo/desbloqueo con historial y revocación | flujo de bloqueo; dependencias de autorización |
| HU36–37 | Cola de reportes con filtros, descarte/eliminación, decisiones conservadas y notificación al denunciante | ambas resoluciones y rechazo de segunda resolución |
| HU38, 44 | Tablas de centros/usuarios/reseñas, fechas/estado/provincia, totales y exportación PDF/CSV | formatos, filtros inválidos y consulta sin registros |
| HU39 | Administrador asignado, contraseña temporal, correo por SMTP, reasignación y revocación | cuenta temporal, reemplazo, adaptador SMTP |
| HU41–43 | Edición permitida del centro propio, galería de 1–15, portada, archivos hasta 5 MB, reputación y filtros de reseñas | aislamiento de centro, reemplazo, subida/portada/eliminación |

Las HUs incluyen elementos de interfaz (modales, mapas visuales, navegación, formularios,
mensajes y gráficos). Esta entrega implementa su soporte de servidor; no acredita esos criterios UI.

## Arquitectura e integridad

Monolito modular FastAPI. Las rutas reciben servicios mediante `Depends`; el ensamblado explícito
está en `app/api/dependencies.py`. Los servicios contienen reglas y transacciones; los repositorios
usan SQLAlchemy asíncrono. Las proyecciones administrativas/de reportes leen datos entre módulos;
las escrituras conservan su módulo propietario. SMTP y almacenamiento de imágenes son adaptadores.

La migración inicial permanece intacta. Las revisiones 0002–0007 agregan sesiones/guardas de login,
auditoría independiente, origen conservado de notificaciones, perfil del administrador, reasignación,
fecha de cambio de contraseña, detalle opcional del reporte y permisos restrictivos de auditoría.
Los downgrades que no pueden representar datos nuevos fallan transaccionalmente antes de perderlos.

La eliminación de una reseña sigue actualizando las vistas de reputación. Sus decisiones de moderación
se copian antes de la cascada y se consultan aun después de eliminar el contenido original. La notificación
no mantiene una FK hacia contenido eliminado. Un savepoint aísla fallos SQL de notificaciones de la
operación principal; se registra un aviso, sin exponer datos sensibles.

Al reasignar el centro se conserva la cuenta anterior sin asignación y se revocan sus sesiones.
Las escrituras operativas vuelven a comprobar la asignación y el estado bajo el bloqueo del centro,
incluyendo peticiones que ya habían superado autenticación. La regresión simula una identidad obsoleta;
no equivale a una prueba de carga concurrente de producción.

## Decisiones de compatibilidad

- Se conservan IDs BIGINT del esquema aprobado; el texto de HU45 menciona UUID. No se cambia la
  identidad existente ni sus claves foráneas para satisfacer una diferencia documental.
- El login sigue usando username (HU02), aunque el correo descrito en HU39 menciona correo de acceso.
  La creación administrativa solicita username y el correo de bienvenida lo indica expresamente.
- Nuevos usernames de registro son alfanuméricos. El login acepta nombres históricos con puntos
  permitidos por el esquema, para no dejar cuentas existentes sin acceso.
- Cambiar contraseña revoca todas las sesiones anteriores y emite una nueva para la petición actual.
- Si SMTP falla tras crear una cuenta, `emailDelivered=false` permite detectar el fallo; la respuesta
  administrativa entrega una sola vez la contraseña temporal. No hay cola persistente de reintentos.
  El entorno local usa Mailpit; un despliegue real debe configurar un relay SMTP de confianza.
- PDF incluye el logo existente de FamTree, emisor, filtros, fecha UTC, tabla con encabezados repetidos y total.
  CSV es la alternativa Excel autorizada en HU44; no se implementa XLSX adicional.
- `/asylums` conserva el contrato público paginado snake_case. Los módulos nuevos usan camelCase;
  importes monetarios se serializan como strings decimales. Consultar OpenAPI, no inferir contratos.

## Hallazgos del frontend (sin modificaciones)

Los servicios nuevos del frontend esperan un array y campos camelCase en `GET /asylums`, mientras
el contrato existente y sus adaptadores de descubrimiento usan un objeto paginado y snake_case.
También hay pantallas de login/registro sin formulario funcional. El contenedor frontend local responde
500 por dependencia `lucide-react` ausente en su instalación. No se cambiaron fuentes, dependencias,
configuración ni contenedores del frontend. Probar el backend en Swagger funciona independientemente.

No se puede afirmar que el proyecto completo esté probado desde la interfaz hasta corregir esos puntos
en una entrega de frontend autorizada. El PR no debe fusionarse automáticamente.

## Verificación

Ver `LOCAL_TESTING.md` para comandos reproducibles. Se exige Ruff, mypy estricto, PostgreSQL real,
cobertura mínima de 85 %, Alembic sin drift, Bandit y auditoría de dependencias. Coverage configura
`greenlet` y `thread`: SQLAlchemy asíncrono cambia de greenlet y sin esa configuración se omiten
incorrectamente líneas ejecutadas ([documentación de Coverage](https://coverage.readthedocs.io/en/latest/config.html#run-concurrency)).
Los archivos se validan por contenido y se recodifican según las APIs documentadas de
[Pillow](https://pillow.readthedocs.io/en/stable/handbook/security.html) y
[FastAPI UploadFile](https://fastapi.tiangolo.com/tutorial/request-files/).
