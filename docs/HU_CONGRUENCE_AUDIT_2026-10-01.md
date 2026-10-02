# Auditoría de congruencia: 45 HUs frente a FamTree

Fecha: 2026-10-01. Alcance: requisitos originales, código local, contratos API, pruebas automatizadas y comprobaciones puntuales en la aplicación local.

## Resultado

**No corresponde presentar el sistema como las 45 HUs terminadas.** Existe soporte de backend para los grandes bloques funcionales, pero faltan pantallas, hay contratos mal conectados y hay criterios originales todavía incumplidos. También hay diferencias en el propio documento de requisitos que necesitan una decisión explícita.

Hallazgos principales:

1. HU15: guardar el perfil falla con 422 por `profilePicture`, campo que el formulario envía y `ProfileUpdate` no acepta. Reproducido contra la API local.
2. HU05: el catálogo ofrece filtros de ubicación, servicios, certificación y calificación, pero su manejador solo transmite búsqueda, precio máximo y página. Reproducido en navegador: seleccionar **Terapia** produce `/api/v1/asylums?page=1&max_price=50000`, sin servicio.
3. HU26: los controles «Notificaciones» y «Ofertas» son estado local, no las tres preferencias persistentes exigidas. Se inicializan en falso y no consultan ni actualizan la API de preferencias.
4. Antes de esta implementación, HU27–39 y HU44 tenían endpoints administrativos pero no una interfaz del administrador del sistema. Ese bloque ya fue implementado localmente en `/system-admin`; el recorrido completo se verificó contra una base desechable. Todavía no está publicado en remoto.
5. HU18: la API conserva favoritos inactivos, pero el frontend intenta volver a consultar todos mediante el detalle público de centros activos. Un 404 dentro de `Promise.all` impide actualizar toda la lista. Hallazgo de código; no se desactivaron centros de la base compartida para reproducirlo.
6. HU06–07: no hay selector completo de orden ni navegación de páginas en el catálogo. Además, el backend no admite `name_desc`, exigido por HU06.
7. HU08, HU10–13 y HU23: el detalle, el mapa y la comparación no muestran todos los elementos requeridos. El detalle no incluye el mapa incrustado ni la sección completa de reputación y reseñas.
8. HU22: existe el endpoint de eliminación y un método de servicio, pero no una acción de eliminar la reseña propia en las tarjetas actuales.
9. Se presentan datos sin respaldo: las tarjetas usan por defecto 3 habitaciones, 2 baños y 150 m²; el detalle recibe un horario fijo. Los tres valores de las tarjetas fueron observados en navegador.
10. Las pruebas pasan, pero no certifican los 45 recorridos de aceptación. La cobertura del frontend excluye precisamente páginas, componentes y varios módulos que contienen estas brechas.

Esta auditoría corrige documentación; **no implementa las funcionalidades pendientes** ni modifica los datos de negocio para ocultar los hallazgos.

## Fuente y versión examinadas

- [Documento original de las 45 historias](https://docs.google.com/document/d/15yjDjBjaU8iTsrOSsCT3pLg-YcBBxP99-8Q0EzpMySM/edit). Se descargó nuevamente mediante exportación TXT, no se utilizó solo el resumen del backlog.
- Copia temporal de consulta: `/tmp/famtree-hus-audit.txt`. SHA-256: `31b6fbcabcbdff98e05b3b938fd4650fcb6931bfa4a97c84d6639e0b23b56687`. La copia temporal puede desaparecer; el enlace y el hash identifican la fuente examinada.
- Rama local: `feature/backend-review-likes`; HEAD `0040e03f761dede304dffd46cd151c88381bf65e`, **más cambios locales sin commit** de esta sesión. Los resultados no describen exclusivamente lo publicado.
- Consulta directa de GitHub con `git ls-remote`: la rama remota sigue en `0040e03`; `main` remoto está en `0ba52acaa34a82b9b4d7ea3f43aa4f42de39fa8e`.
- La referencia local `main` sigue en `3dd00db`, con historia divergente de su seguimiento. No se hizo reset, merge ni reescritura para esta auditoría.
- No se revalidaron en esta revisión el backlog vivo de Notion, el estado actual del PR, CI remoto ni un despliegue público. Se distingue la evidencia local de esos estados.

## Cómo leer la matriz

**API presente** significa que existe implementación identificable, no que todos los criterios visuales estén satisfechos. **Parcial** indica una brecha concreta. **Pendiente E2E** significa que esta auditoría no ejecutó el recorrido completo en navegador; no significa necesariamente que esté roto. Ninguna fila se declara aceptada al 100 % sin verificación de todos sus criterios.

Referencias de evidencia, con rutas relativas al repositorio:

- **A — Auth:** [router](../backend/app/modules/auth/router.py), [login UI](../frontend/src/features/auth/hooks/useLoginForm.ts), [registro UI](../frontend/src/features/auth/hooks/useRegisterForm.ts), [sesión UI](../frontend/src/features/auth/components/AuthProvider.tsx).
- **D — Descubrimiento:** [contratos](../backend/app/modules/asylums/schemas.py), [consultas](../backend/app/modules/asylums/repository.py), [catálogo](../frontend/src/app/(main)/catalog/page.tsx), [filtros](../frontend/src/features/asylums/components/Filter.tsx), [detalle](../frontend/src/features/asylums/components/AsiloDetails.tsx), [tarjeta](../frontend/src/features/asylums/components/Card.tsx).
- **M — Mapa:** [contenedor](../frontend/src/features/map/components/MapContainer.tsx), [Leaflet](../frontend/src/features/map/components/MapLeafletView.tsx).
- **C — Comparación:** [componente](../frontend/src/features/asylums/components/Compare.tsx), [API](../backend/app/modules/asylums/router.py).
- **P — Perfil:** [formulario](../frontend/src/features/profile/components/ProfileForm.tsx), [servicio UI](../frontend/src/features/profile/api/profileService.ts), [contrato backend](../backend/app/modules/users/schemas.py), [contraseña](../frontend/src/features/profile/components/PasswordModal.tsx).
- **F — Favoritos:** [servicio backend](../backend/app/modules/favorites/service.py), [tarjetas incluyendo inactivos](../backend/app/modules/asylums/access.py), [hook UI](../frontend/src/features/asylums/hooks/useFavorites.ts), [drawer](../frontend/src/features/asylums/components/FavoritesDrawer.tsx).
- **R — Reseñas:** [router](../backend/app/modules/reviews/router.py), [servicio](../backend/app/modules/reviews/service.py), [contratos](../backend/app/modules/reviews/schemas.py), [página](../frontend/src/app/(main)/review/page.tsx), [tarjeta](../frontend/src/features/reviews/components/ReviewCard.tsx), [modal](../frontend/src/features/reviews/components/ReviewActionModal.tsx).
- **N — Notificaciones:** [API](../backend/app/modules/notifications/router.py), [emisión](../backend/app/modules/notifications/service.py), [hook UI](../frontend/src/features/notifications/hooks/useNotifications.ts), [preferencias UI](../frontend/src/features/profile/components/PreferencesSection.tsx), [triggers SQL](../backend/alembic/sql/0001_famtree_baseline.sql).
- **G — Administración global:** [usuarios/moderación](../backend/app/modules/administration/router.py), [centros](../backend/app/modules/asylums/management_router.py), [reportes](../backend/app/modules/reports/router.py), [servicio de reportes](../backend/app/modules/reports/service.py). No hay rutas de administración del sistema en `frontend/src/app`.
- **L — Administración del centro:** [layout y acceso](../frontend/src/app/(center-admin)/center-admin/layout.tsx), [editor](../frontend/src/features/center-admin/components/CenterEditor.tsx), [galería](../frontend/src/features/center-admin/components/CenterGallery.tsx), [reseñas](../frontend/src/features/center-admin/components/CenterReviews.tsx), [clave temporal](../frontend/src/features/center-admin/components/ForcePasswordChangeModal.tsx).
- **T — Pruebas:** [flujos backend](../backend/tests/integration/test_workflows.py), [descubrimiento](../backend/tests/integration/test_discovery.py), [configuración de cobertura UI](../frontend/vitest.config.mts). La relación con una prueba acredita el comportamiento que ésta comprueba, no toda la HU.

## Matriz de las 45 historias

| HU | Funcionalidad | Backend actual | Frontend / congruencia y trabajo pendiente | Evidencia |
|---|---|---|---|---|
| 01 | Registro | Registro y validación presentes; pruebas de autenticación. | **Divergente:** la versión local inicia sesión y abre catálogo; CA04 pide confirmar y llevar a login. Acordar cambio de requisito. Verificar limpieza de contraseñas tras errores (CA03). | A, T |
| 02 | Login | Username, sesión y controles de cuenta presentes. | **Parcial:** centro tiene destino propio; registrado y administrador global van a `/`. CA05 pide catálogo y estadísticas respectivamente. El catch no limpia contraseña como CA03. | A; navegador |
| 03 | Logout | Revocación y borrado de cookie presentes. | **Divergencia:** el logout del perfil dirige a login, CA03 pide catálogo como visitante. Verificar retroceso del navegador en todas las vistas privadas. | A, P, T |
| 04 | Buscar texto | Búsqueda normalizada por nombre/localidad, solo activos, probada. | Barra conectada. Pendiente aceptación conjunta de botón, Enter, vacío y restablecimiento conservando los demás criterios. | D, T |
| 05 | Filtrar | Provincia/municipio/precios/servicios/tipos de atención/certificación/rating y combinación implementados. | **Parcial reproducido:** se omiten en la petición varios filtros que el usuario selecciona; listas de localidades/servicios fijas. Falta precio mínimo y conexión completa con catálogos/API. | D; navegador |
| 06 | Ordenar | Cuatro criterios; **falta Nombre Z–A** (`name_desc`). | No hay selector «Ordenar por» con las cinco opciones. «Mejor valoradas» filtra la página ya descargada; no equivale a ordenamiento global. | D |
| 07 | Paginar catálogo | Páginas de 15, totales y consultas probadas. | **Falta navegación:** página del catálogo no renderiza números/anterior/siguiente ni resumen global. Mostrar pocos mocks no comprueba esta HU. | D, T |
| 08 | Detalle y contacto | Datos económicos, servicios, cuidados, galería y contacto disponibles. | **Parcial:** adaptador omite capacidad, total de reseñas y otros campos exigidos; horario fijo. Completar requisitos, certificaciones, fecha y enlaces accionables de contacto; revisar igualdad entre apertura desde mapa y catálogo. | D, M |
| 09 | Mapa 2D | Pins de activos y filtros API presentes. | Leaflet presente; inicia en Santo Domingo a zoom 12, no encuadre nacional. Faltan controles de filtros exigidos. «Mi Ubicación» vuela a coordenadas fijas, no geolocaliza. | M, T |
| 10 | Ubicación en detalle | Coordenadas disponibles. | **Falta mapa incrustado** en detalle, zoom de entorno y estado sin coordenadas. El mapa general no sustituye este criterio. | D, M |
| 11 | Seleccionar pin | Datos de pin/detalle presentes. | Selecciona centro, pero no existe popup anclado al marcador con todos los datos y cierre externo exigidos; las tarjetas laterales son otro diseño. | M |
| 12 | Seleccionar 2–4 | Valida IDs distintos y rango. | Selector de comparación presente; el recorrido pasa por detalle/favoritos. No cumple literalmente las casillas en cada tarjeta de catálogo/favoritos. Validar 2, 3, 4 y rechazo del quinto. | C, F, T |
| 13 | Tabla comparativa | Devuelve detalle homologado para 2–4 centros. | **Parcial:** muestra imagen/nombre/rating/precio/servicios, pero faltan ubicación completa, capacidad, tipos de atención, requisitos, contacto y total de reseñas requeridos. Verificar enlaces y comportamiento al quedar un solo centro. | C |
| 14 | Consultar perfil | Perfil propio sin hash, endpoint autenticado. | Vista existente; invitado ve un panel, no redirección inmediata a login como CA05. Ciudad/municipio parten de valores fijos sin datos del usuario. | P |
| 15 | Editar perfil | PATCH con campos permitidos; foto tiene endpoint separado. | **Roto reproducido:** formulario incluye `profilePicture` y recibe 422 `extra_forbidden`. También faltan cerrar el flujo de cancelación y unificar la edición/subida inmediata del avatar con lo que promete la HU. | P; API local |
| 16 | Cambiar contraseña | Valida clave actual/nueva, rota sesión; pruebas existentes. | **Validación UI divergente:** el modal anuncia mínimo 6, backend exige 8 y complejidad. Pendiente E2E de clave incorrecta, cancelación, limpieza tras fallo y retorno al perfil. | A, P, T |
| 17 | Agregar favorito | Alta idempotente, propiedad y centro activo. | Catálogo/detalle conectados. Invitado recibe `alert`, no modal con enlaces login/registro exigido. Revisar toast de éxito. | F |
| 18 | Consultar favoritos | Devuelve tarjeta y conserva inactivos. | **Parcial con defecto:** hidratación posterior exige detalle público activo; un inactivo puede abortar toda la carga. Conservar tarjeta inactiva, deshabilitar detalle y permitir quitarla. | F |
| 19 | Quitar favorito | DELETE por propietario disponible y probado. | Eliminación optimista presente; completar feedback/recuperación de error y aceptar el caso de último favorito e inactivo. | F, T |
| 20 | Publicar reseña | Una por usuario/centro, estrellas 1–5, comentario 10–500 y reputación. | Redactor global, no sección integrada de detalle. Opiniones sugeridas implementadas localmente; el envío sin texto escoge frase automáticamente. Acordar esa semántica y validar longitud/duplicidad antes de enviar. | R, T |
| 21 | Editar reseña | PATCH restringido al autor, validación y recálculo. | Modal existente; no dar por aceptada gestión de errores: traductor comparte mensajes de reporte que no corresponden a edición. Verificar etiqueta «Editado» y cancelación. | R, T |
| 22 | Eliminar reseña | DELETE y recálculo presentes. | **Falta acción UI** de eliminar la propia y confirmación; tener `deleteReview` en un servicio no completa la historia. | R, T |
| 23 | Consultar reseñas del centro | Listado y reputación/distribución disponibles. | Vista global de reseñas no equivale a la sección de cada detalle con resumen, distribución y acciones del autor. Falta integración completa. | R, D |
| 24 | Reportar reseña | Motivos, límites y propiedad; cambio local idempotente y `hasReported`. | Menú «Ya reportada» y cierre externo implementados localmente. Revisar estado al cambiar de usuario sin desmontar página y mensajes por código de error; no certificar los casos de carrera/sesión solo con la prueba de segundo POST. | R, T |
| 25 | Consultar notificaciones | Bandeja, contador y lectura individual/global presentes. | Hook conectado, pero decrementar contador de nuevo al pulsar una ya leída puede desajustarlo. Se cargan 20 sin recorrido de historial paginado en el hook. Pendiente E2E de actualización/navegación. | N |
| 26 | Preferencias | Tres categorías, defaults y persistencia; supresión mediante trigger. | **Sin integración:** dos toggles locales («Notificaciones», «Ofertas»), no tres categorías; no guardar/restablecer ni carga del estado persistido. | N, P |
| 27 | Estadísticas del sistema | `/admin/dashboard`, métricas y distribución; 200 local con rol correcto. | Panel `/system-admin` implementado con KPIs reales, rango temporal, accesos a módulos y gráficos de provincia/calificación/tendencia. | G; E2E desechable |
| 28 | Registrar asilo | POST administrativo y reglas de creación. | Formulario global implementado con catálogos, validación, imágenes, confirmación y retorno al listado. | G; E2E desechable |
| 29 | Listar asilos admin | GET administrativo, filtros y páginas. | Tabla global implementada con búsqueda, estado/provincia, precios, administrador asignado, paginación y detalle. | G; E2E desechable |
| 30 | Editar asilo global | PATCH administrativo presente. | Formulario global implementado; cancelar restaura sin persistir y guardar actualiza el registro. | G; E2E desechable |
| 31 | Activar asilo | Cambio de estado y eventos disponibles. | Acción global implementada con confirmación y actualización inmediata de tabla. | G, N; E2E desechable |
| 32 | Desactivar asilo | Baja lógica y notificaciones disponibles. | Acción global implementada con advertencia de impacto. Sigue pendiente revisar la hidratación de favoritos inactivos de HU18. | G, F, N; E2E desechable |
| 33 | Consultar usuarios | GET administrativo con filtros, estado/rol. | Tabla global implementada con búsqueda, filtros, rol, teléfono, fecha, estado y paginación. | G; E2E desechable |
| 34 | Bloquear usuario | Bloqueo, motivo/historial y revocación de sesiones. | Modal y acción UI implementados; el recorrido desechable confirmó motivo, bloqueo y revocación. | G; E2E desechable |
| 35 | Desbloquear usuario | Desbloqueo e historial presentes. | Acción UI y confirmación implementadas; el recorrido confirmó el cambio de vuelta. | G; E2E desechable |
| 36 | Consultar reportes de reseña | Cola con estado/motivo/búsqueda. | Cola implementada con filtros, búsqueda, estados, motivos y paginación. | G; E2E desechable |
| 37 | Moderar reseña | Resolver, justificar, auditar, recalcular y notificar. | Modal de moderación implementado; el recorrido confirmó eliminación, auditoría y notificación al denunciante. | G, R, N; E2E desechable |
| 38 | Consultas generales | Tablas de centros/usuarios/reseñas con filtros/totales. | Pantalla de consulta implementada con tipo, fechas, estado, provincia, tabla y paginación. | G; E2E desechable |
| 39 | Crear admin y asignar centro | Cuenta temporal, asignación, SMTP y revocación de reemplazo presentes. | **Falta formulario global**. Pruebas locales/SMTP de desarrollo no acreditan entrega real de correo en producción. Resolver contradicción username/correo del documento. | G, A, T |
| 40 | Cambio de clave temporal | Flag y restricciones; endpoint de cambio. | Guard y modal del centro presentes. Pendiente E2E completo de navegación bloqueada, clave distinta y salida segura. Revisar destino final frente a CA07. | A, L, T |
| 41 | Editar centro propio | Aislamiento y campos permitidos en `/center`. | Editor conectado, campos de identidad/ubicación de lectura. **Falta Cancelar/restaurar** exigido por CA05; aceptar eventos de actualización a favoritos. | L, N, T |
| 42 | Galería del centro | Subida, límites, portada y eliminación presentes. | Carga de un archivo y acciones presentes; **faltan confirmación de borrado, drag & drop, selección múltiple y progreso** exigidos. | L, T |
| 43 | Reseñas del centro propio | Búsqueda/rating/orden, reputación y páginas de 10. | Muestra media/cantidad y filtros de búsqueda/rating; **falta distribución visual y selector de orden**, servicio fija `newest`. | L, R |
| 44 | Exportar reportes | PDF y CSV implementados/probados; rechaza consulta vacía. | Pantalla implementada con rango requerido, PDF/CSV y descarga directa. CSV está permitido por CA05; XLSX no se añade sin aclarar requisitos. | G; E2E desechable |
| 45 | Emisión automática | Eventos, preferencias por trigger y savepoint para fallos de notificación. | Integración de bandeja parcial (HU25–26). Documento pide UUID, esquema aprobado usa BIGINT: decisión de contrato pendiente de formalizar en la HU. No se exige WebSocket si entrega en siguiente consulta cumple CA05. | N, T |

## Datos que pueden inducir a error

| Elemento | Evidencia actual | Corrección o decisión requerida |
|---|---|---|
| Habitaciones, baños y superficie | `Card.tsx` define 3, 2 y 150 como defaults; catálogo no envía valores reales. Observado en navegador. | Mostrar solo datos respaldados o indicar «Sin información». Si son requisitos nuevos, definir campos/validaciones y migración. |
| Horario de atención | Catálogo y mapa construyen el detalle con `8:00 AM - 6:00 PM`. | No presentarlo como horario oficial sin fuente persistente. |
| «Abiertas ahora» / «Disponible» | Se apoyan en estado operativo o etiquetas, no en cálculo de horarios ni plazas libres. | Distinguir ACTIVO, abierto a esta hora y disponibilidad de cupos. |
| Ubicación del usuario | Perfil inicia ciudad/municipio fijos; mapa usa coordenadas fijas para «Mi Ubicación». | Persistir datos/geolocalizar con autorización, o cambiar el texto a lo que realmente hace. |
| Catálogos geográficos y servicios | Modal tiene listas fijas y no transmite buena parte de la selección. | Consumir catálogos oficiales de la API por ID y verificar parámetros. |
| «Ofertas» en preferencias | Toggle local; no equivale a avisos de favoritos/moderación. | Retirar promesa o especificar y construir funcionalidad separada. |
| Dataset del owner | [Seed documentado](../backend/docs/OWNER_MOCK_DATA.md) con datos de prueba. | Mantener identificación como demo. Nombres, imágenes y reseñas mock no prueban centros reales, calidad, certificación o disponibilidad. |
| Colores de menciones | Hash depende del ID **y del índice** en dropdown; redactor usa índice 0. | Puede cambiar al filtrar/reordenar y diferir tras seleccionar. No afirmar color estable ni accesibilidad medida. |

Los componentes de dashboard con ejemplos fijos no se consideran automáticamente visibles: el dashboard actual del centro consulta datos de la API. No confundir scaffolding sin uso con un defecto reproducido en pantalla.

## Requisitos que necesitan aclaración o nuevas HUs

No faltan números en el documento: están HU01–HU45. **Lo que falta principalmente es completar criterios e integración**, no inventar otra lista de 45 historias. Estas ampliaciones deben registrarse sin atribuirlas retroactivamente al documento original:

1. **Registro:** escoger entre redirección a login (HU01 original) e inicio de sesión automático (implementación local). Actualizar CA y pruebas según la decisión.
2. **Likes:** definir HU adicional para poner/quitar like, una reacción por usuario, persistencia, roles y limpieza al eliminar/ocultar. Hay implementación y pruebas; falta trazabilidad formal dentro de las 45 originales.
3. **Opiniones sugeridas:** añadir criterio a HU20 para aparecer solo después de abrir el flujo y elegir estrellas, texto según calificación, edición libre y longitud 10–500. Decidir si publicar sin escribir selecciona automáticamente una opinión o exige elegirla explícitamente.
4. **Menciones y colores:** especificar estabilidad por ID, resultado de búsqueda y misma apariencia seleccionada/publicada; validar contraste. Es mejora de presentación, no prueba de HU20 completa.
5. **Tipo de propiedad:** solicitud del equipo no integrada en contratos/backend actuales; UI muestra Casa/Apt./Villa/Geriátrico. Definir catálogo consensuado y distinguir tipo de inmueble, servicio y tipo de adulto. No asumir que «geriátrico» es un tipo de propiedad. Añadir edición y filtrado con migración, API y pruebas.
6. **Modo claro:** tratar como requisito transversal con aceptación en todas las pantallas y modales; no quedó certificado por esta auditoría.
7. **Mapa 3D:** retirado por petición expresa. HU09–11 piden 2D; no es una carencia de esas HUs. Cualquier regreso a 3D requiere alcance nuevo.
8. **Referencias internas equivocadas:** HU02 cita estadísticas como HU28, clave temporal como HU41 y edición propia como HU42; corresponden a HU27, HU40 y HU41. Corregir los enlaces del documento maestro.
9. **Username frente a correo:** HU02 exige username; el flujo de HU40 menciona correo. Unificar las instrucciones de acceso y el correo de invitación sin cambiar silenciosamente la autenticación.
10. **Identificador de notificación:** HU45 menciona UUID, esquema relacional usa BIGINT. Formalizar la excepción ya documentada o planificar migración; no afirmar equivalencia literal.
11. **Exportación:** CA05 de HU44 acepta XLSX/CSV, mientras otros textos mencionan extensión XLSX. Aclarar que CSV satisface la alternativa elegida.

También hay alias de endpoints marcados como deprecated en auth, favoritos, reseñas y gestión de centros. No son por sí solos dos reglas de negocio diferentes. Documentar ruta canónica, consumidores y retirada antes de borrarlos; los servicios frontend de reseñas están repartidos entre `features/reviews/api` y `src/services`, con firmas distintas que conviene unificar.

## Verificaciones ejecutadas en esta auditoría

| Comprobación | Resultado y límite |
|---|---|
| `backend/scripts/check_backend.sh` | Exit 0: **84 tests**, **94.53 %** de cobertura, Ruff/formato, mypy (104 archivos), Bandit, Alembic check y ciclo downgrade/upgrade. Usa PostgreSQL desechable, no borra la base de desarrollo. |
| Frontend en contenedor: `npm run typecheck`, `npm run lint`, `npm run test:coverage` | Exit 0: **32 tests**, 10 archivos. Cobertura reportada: 95.94 % statements, 96.11 % líneas, sobre el conjunto incluido. |
| Límites de cobertura UI | `vitest.config.mts` excluye `src/app`, componentes compartidos/de features, notificaciones, hooks/servicios de asilos y hooks de mapa. **No extrapolar el porcentaje a todas las pantallas.** |
| Navegador Chromium/Playwright, catálogo | Tarjetas muestran 3 Hab / 2 Baños / 150 m²; seleccionar Terapia no envía filtro de servicio a la API. |
| Autenticación y rol admin | Login API 200, dashboard API 200; login desde pantalla termina en `/`. Se cerraron las sesiones de comprobación. |
| Contrato de perfil | Enviar exactamente los campos del formulario, con valores actuales, devuelve 422 `extra_forbidden` en `body.profilePicture`. Validación rechaza antes de persistir; no se cambió el perfil. |
| Inspección de fuente | Rutas/payloads, renderizado, contratos, servicios y pruebas citados en matriz. Hallazgos de código se distinguen de reproducción E2E. |

Logs de esta ejecución: `/tmp/famtree-audit-backend.log`, `/tmp/famtree-audit-frontend.log` (temporales, sin contraseñas). No se ejecutaron 45 pruebas E2E completas, una auditoría exhaustiva de accesibilidad/seguridad, un build de producción ni validación de correo/despliegue externo. Los mocks permiten ensayar; no sustituyen datos reales ni aceptación del equipo.

## Orden recomendado para cerrar las brechas

1. **Integridad de la interfaz:** corregir perfil 422, filtros ignorados, preferencias que no persisten y favoritos inactivos. Quitar o identificar los datos fijos sin respaldo.
2. **Completar recorrido público:** orden Z–A y otros órdenes, paginación, detalle completo, comparación, mapa de detalle, popup y eliminar reseña propia.
3. **Completar administración global:** dashboard, centros, usuarios, moderación, cuentas asignadas y reportes. Consumir los servicios existentes; conservar autorización del backend.
4. **Cerrar diferencias del centro admin:** cancelar edición, galería y filtros/distribución de reseñas.
5. **Formalizar decisiones y aceptar por CA:** registrar ampliaciones, corregir referencias de HUs y ejecutar los recorridos con roles reales.

Pruebas de aceptación mínimas antes de declarar cerrado:

- Guardar perfil sin cambiar avatar y con avatar nuevo; recargar; cancelar sin cambios persistidos.
- Más de 15 asilos: comprobar página 2, filtros AND y cinco órdenes, con la misma selección visible y parámetros reales.
- Favoritos de un activo y un inactivo: ambos visibles; detalle deshabilitado solo para inactivo; eliminación independiente.
- Preferencias: tres categorías, persistencia al recargar y ausencia de notificación cuando la categoría está desactivada.
- Reseñas: crear/editar/eliminar propia; reporte repetido inmediato y tras recarga; cambiar entre dos usuarios sin compartir estado de reporte.
- Comparación de 2/3/4 centros con todas las filas exigidas; quinto rechazado; quitar hasta uno; móvil.
- Admin global: login al panel, recorrido centro/usuario/moderación, efectos en sesión y notificaciones, exportar PDF/CSV.
- Centro admin: contraseña temporal, bloqueo de navegación, aislamiento entre centros, galería y restauración al cancelar.

## Mensaje para colaboradores

> Contrasté las 45 HUs originales con el código y la app local. El backend tiene soporte para los bloques principales y ahora los dos paneles administrativos están implementados localmente: `/system-admin` para el administrador del sistema y `/center-admin` para el administrador del asilo. El recorrido administrativo completo pasa contra una base desechable: 16 comprobaciones E2E, incluyendo creación/edición/estado de asilos, cuentas, contraseña temporal, galería, reseñas, moderación, usuarios y PDF/CSV. Siguen pendientes varias brechas públicas ya documentadas, como preferencias persistentes, favoritos inactivos, filtros omitidos y algunos elementos de catálogo/detalle/comparación. Dejé la matriz actualizada en `docs/HU_CONGRUENCE_AUDIT_2026-10-01.md`. Los cambios locales todavía no están subidos.
