# Integración de interfaces y revisión de rutas — 2026-09-29

Base revisada: `main` en `3dd00db` (PRs 12, 13 y 14 fusionados). El pull fue fast-forward,
sin conflictos. Los cambios de esta rama son exclusivamente de backend. Esta guía describe
el frontend recibido, no certifica cambios que todavía no se hayan subido.

## Volver a verificar tras subir cambios

Desde `backend/`:

```bash
.venv/bin/python -m scripts.audit_frontend_routes
./scripts/check_backend.sh
```

El primer comando compara llamadas literales `apiClient` en el frontend con OpenAPI, sin
modificar archivos ni enviar peticiones. Salida JSON con archivo, línea, método, ruta y estado
`matched`, `deprecated` o `missing`. Devuelve 1 si faltan rutas y 2 si no encuentra llamadas.
Es una auditoría estática parcial: no valida payloads, permisos, URLs construidas fuera de la
llamada, `apiRequest`, `fetch`, formularios ni ejecución en navegador. Un `matched` no prueba
que el flujo esté conectado. El segundo comando prueba la API con PostgreSQL desechable.

Resultado en la base revisada: 44 llamadas directas, 5 sin ruta, 5 a rutas obsoletas y
34 con ruta vigente. Las cinco discrepancias son:

| Consumidor | Llamada sin ruta | Contrato disponible |
|---|---|---|
| `features/center-admin/api/centerAdminService.ts` | GET `/center-admin/my-center` | GET `/center` |
| Mismo servicio | PATCH `/center-admin/my-center` | PATCH `/center` con `CenterUpdate` |
| Mismo servicio | POST `/center-admin/my-center/gallery` | POST `/center/images`, multipart `file`, una imagen por petición |
| `features/asylums/services/asylumService.ts` | DELETE `/asylums/{id}` | PATCH `/admin/asylums/{id}/deactivate`; no existe borrado físico |
| `features/profile/api/profileService.ts` | PATCH `/users/{id}/status` | PATCH `/admin/users/{id}/block` o `/unblock`, cuerpo `{ "reason": "..." }` |

Las rutas aquí son relativas a `/api/v1`. No se añadieron nuevos aliases para ocultar estas
diferencias: los DTOs tampoco son equivalentes y las interfaces deben adaptar sus datos.

## Rutas equivalentes y deprecación

Los aliases conservan comportamiento y autorización; OpenAPI los marca `deprecated` con la
ruta preferida. No se eliminaron llamadas que todavía usa el frontend. Los aliases antes
ocultos se documentan ahora para que los consumidores puedan migrar.

| Operación | Ruta principal | Alias obsoleto |
|---|---|---|
| Crear reseña | POST `/reviews` con `asylumId` | POST `/asylums/{id}/reviews` |
| Editar reseña parcialmente | PATCH `/reviews/{id}` | PUT `/reviews/{id}` |
| Reportar reseña | POST `/reviews/reports` con `reviewId` | POST `/reviews/{id}/reports` |
| Añadir favorito | POST `/favorites` con `asylumId` | POST `/favorites/{id}` |
| Preferencias | GET/PATCH `/notification-preferences` | GET/PATCH `/notifications/preferences` |
| Cambiar contraseña normal o temporal | POST `/auth/change-password` | POST `/auth/change-temporary-password` |
| Crear/editar centro (sistema) | POST `/admin/asylums`, PATCH `/admin/asylums/{id}` | POST `/asylums`, PUT `/asylums/{id}` |
| Consultar usuario (sistema) | GET `/admin/users/{id}` | GET `/users/{id}` |
| Listar usuarios (sistema) | GET `/admin/users?page=1` | GET `/users?offset=0&limit=100` |

La última pareja no tiene el mismo formato: la ruta principal devuelve `{items,total,page,pageSize}`;
la antigua devuelve un array. No son intercambiables sin adaptar el consumidor.
GET `/center/reviews` y GET `/asylums/{id}/reputation` comparten cálculo, pero representan accesos
diferentes: el primero deriva el centro de la sesión del administrador y el segundo es público.
No se deben fusionar eliminando controles de acceso.

También hay clientes duplicados en el frontend: `services/reviewService.ts`,
`features/reviews/api/reviewService.ts` y `hooks/use-reviews.ts`. Conviene concentrar llamadas y
adaptación en la feature; esta rama no los modifica.

## Likes de reseñas/comentarios

No existe una entidad separada de comentarios: el comentario pertenece a la reseña.

```http
POST /api/v1/reviews/123/like
Cookie: famtree_session=...
```

Sin body. Devuelve `{"reviewId":123,"likes":1,"isLiked":true}`. El siguiente POST del mismo
usuario lo quita. Solo `REGISTERED_USER` activo puede escribir; requiere sesión y origen
permitido. Autores pueden dar like a su propia reseña: no había regla que lo prohibiera.
Reseñas ocultas, eliminadas o de centros inactivos responden 404.

La clave compuesta `(review_id,user_id)` evita duplicados. La operación bloquea la reseña
antes de alternar y usa el mismo bloqueo que su eliminación/moderación. La eliminación de la
reseña elimina sus likes por FK. Listados y reputación incluyen `likes` e `isLiked`; invitados
y sesiones vencidas reciben contador público e `isLiked=false`. Se consulta el agregado por
lote, no una consulta por reseña. Esta entrega no incluye una prueba de carga concurrente.

El POST es un **toggle, no idempotente**: desactivar el botón mientras esté pendiente y no
reintentar automáticamente ante una respuesta perdida. Si hay duda, recargar el listado;
usar la respuesta del servidor para reconciliar la UI.

### Ajustes de UI todavía necesarios

- `app/(main)/review/page.tsx` usa `localLikesState`: el clic actual solo cambia estado local
  y no llama a `toggleLike` del hook. Conectar el evento al servicio y reconciliar `likes/isLiked`.
- `useReviews.handleToggleLike` busca `id || codigo_reseña`; debe normalizar `reviewId` también.
- Mantener el DTO de la API: `reviewId`, `userId`, `asylumId`, `comment`, `createdAt`,
  `author: {name,picture}`, `likes`, `isLiked`. Normalizar una vez al modelo de presentación.
  Los tipos del servicio aún declaran `author` como string y omiten `reviewId`.
- Reportes aceptan `OFFENSIVE_LANGUAGE`, `FALSE_INFO`, `SPAM`, `CONFLICT_OF_INTEREST`, `OTHER`.
  El servicio de la feature envía valores minúsculos como `offensive` y `inappropriate`,
  que responden 422. Mapear opciones explícitamente; `inappropriate` no tiene equivalente
  exacto y requiere una opción definida por producto.
- `getAllReviews` solo consulta centros de la primera página (15) y hasta 100 reseñas por centro.
  No afirmar que representa todas las reseñas; implementar paginación en el consumidor.
- `hooks/use-favorites.ts` aún envía `{codigo_asilo}`; la API requiere `{asylumId}`.

## Guía para Marcos: administrador del asilo

1. Login por username; `/auth/session` devuelve `ASYLUM_ADMIN`, `assignedAsylumId` y
   `requiresPasswordChange`. No obtener el ID de otro centro desde parámetros editables.
2. Si exige cambio temporal, POST `/auth/change-password` con `currentPassword`, `newPassword`,
   `confirmNewPassword`; vuelve a consultar sesión. El backend rota la cookie y revoca las
   anteriores. El modal debe recoger la contraseña actual además de la nueva.
3. GET `/center` devuelve el `ManagedAsylum` del centro asignado. Incluye `asylumId`,
   `minPrice`, `maxPrice`, `serviceIds`, `seniorTypeIds`, municipio y provincia.
4. PATCH `/center` admite `description`, `totalCapacity`, `minPrice`, `maxPrice`,
   `entryRequirements`, `certifications`, `phone`, `email`, `website`, `serviceIds`,
   `seniorTypeIds`. Enviar solo campos editados. `name`, `address` y `monthlyFee` del
   formulario actual **no** pertenecen a este contrato de edición. Nombre/dirección requieren
   administrador del sistema. Precios son un rango, no una tarifa única.
5. GET `/center/images` devuelve objetos `{imageId,asylumId,url,isCover,createdAt}`.
   POST `/center/images` recibe `FormData` con un `file`, devuelve un objeto de imagen.
   PATCH `/center/images/{imageId}/cover` elige portada;
   DELETE `/center/images/{imageId}` elimina una imagen. Debe quedar al menos una.
   JPEG/PNG/WebP hasta 5 MB, máximo 15 imágenes. No enviar arrays de URLs para editar galería.
6. GET `/asylums/catalogs` carga catálogos; el público usa `care_types`, que se adapta a
   `seniorTypeIds` al guardar. GET `/center/reviews?page=1&sort=newest` devuelve
   `{items,total,page,pageSize,summary}` (10 por página). `summary` contiene
   `average`, `count`, `distribution`; filtros `q`, `rating`, `sort`.
7. GET/PATCH `/users/me` edita perfil personal; POST `/users/me/picture` recibe `file` JPEG/PNG
   hasta 2 MB. El perfil personal y los datos del centro son recursos diferentes.

Ejemplo de guardado válido:

```js
await apiClient.patch('/center', {
  description: 'Centro dedicado al cuidado integral de adultos mayores.',
  minPrice: '15000.00',
  maxPrice: '25000.00',
  phone: '8095550123',
  email: 'centro@example.com',
});
const gallery = await apiClient.get('/center/images');
const reputation = await apiClient.get('/center/reviews', {params: {page: 1}});
```

La pantalla de reseñas del administrador y partes del dashboard tienen datos fijos. No existen
APIs para responder reseñas, reservas, agenda de visitas, ocupación actual, sentimiento o tasa
de respuesta. Esos elementos del diseño no pueden presentarse como funciones conectadas ni
inventarse a partir de `totalCapacity`. Validar su alcance antes de implementarlos.

## Preparar la interfaz del administrador del sistema

Usar sesión `SYSTEM_ADMIN` y los siguientes recursos ya disponibles:

- Dashboard: GET `/admin/dashboard` (filtros `startDate`, `endDate`).
- Centros: GET/POST `/admin/asylums`; GET/PATCH `/admin/asylums/{id}`;
  PATCH `/activate` o `/deactivate` bajo esa ruta.
- Usuarios: GET `/admin/users`, GET `/admin/users/{id}`, PATCH `/block` o `/unblock`,
  GET `/admin/users/{id}/blocks`; motivos obligatorios de 10–300 caracteres.
- Asignación: POST `/admin/asylum-admins`; credencial temporal entregada una vez y resultado
  `emailDelivered`. La reasignación revoca la sesión y acceso del administrador anterior.
- Moderación: GET `/admin/review-reports`, PATCH `/admin/review-reports/{id}/moderate`;
  GET `/admin/moderation-decisions` conserva auditoría incluso tras eliminar la reseña.
- Reportes: GET `/admin/reports?reportType=centers`; POST `/admin/reports/export` con
  body `{reportType,startDate,endDate,format}`. `format` es `pdf` o `csv`; manejar la
  respuesta como archivo binario, no con el helper JSON actual. Cero filas devuelve 422.

Ver Swagger para los esquemas completos. Para aceptación en navegador: iniciar sesión con
cada rol, guardar/recargar un centro, subir/cambiar/eliminar una imagen, paginar reseñas,
dar/quitar like y recargar, cambiar de usuario y verificar aislamiento, bloquear/reasignar
cuentas y comprobar rechazo de sesiones anteriores. Esos recorridos UI quedan pendientes;
las pruebas HTTP del backend no los sustituyen.
