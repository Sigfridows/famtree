# Pruebas locales del backend

Desde `/home/isaac/.graphify/repos/Sigfridows/famtree`:

- API: http://localhost:18000/api/v1/health
- Swagger: http://localhost:18000/docs
- OpenAPI: http://localhost:18000/openapi.json
- Correo local Mailpit: http://localhost:8025
- Credenciales generadas: `backend/.runtime/demo-credentials.json` (privado, ignorado por Git).

Cuentas: `demoAdmin` (administrador del sistema), `demoUser` (usuario), `demoCenter`
(administrador del centro; debe cambiar su contraseña temporal). Dos centros e imágenes son ficticios.
El seed es idempotente y no reemplaza credenciales ni datos de cuentas/centros existentes.

## Arranque existente

```bash
backend/.venv/bin/python backend/scripts/prepare_local.py
docker compose --env-file backend/.runtime/compose.env up -d --build --no-deps backend
docker exec famtree-backend-1 python -m scripts.seed_demo
```

`prepare_local.py` recupera configuración de los contenedores de desarrollo existentes; no es un
bootstrap para otra computadora. Guarda únicamente variables locales del backend en un archivo privado.
No ejecuta comandos contra frontend. Para una instalación nueva, seguir el Compose general del proyecto
y configurar las variables de `backend/.env.example`.

## Probar con Swagger

1. Abrir `/docs`, ejecutar `POST /api/v1/auth/login` con username/password del archivo local.
   El navegador conserva la cookie HttpOnly y la envía a las operaciones siguientes.
2. `GET /auth/session` devuelve rol y asignación. Un visitante obtiene 401 en rutas privadas.
3. `demoAdmin`: probar `/admin/dashboard`, `/admin/asylums`, `/admin/users` y `/admin/reports`.
4. `demoUser`: probar `/users/me`, `/favorites`, crear una reseña y consultar `/notifications`.
5. `demoCenter`: ejecutar `/auth/change-temporary-password` con `currentPassword`, `newPassword`
   y `confirmNewPassword`. Después probar `/center`, `/center/images` y `/center/reviews`.
6. `POST /auth/logout` revoca la sesión y elimina la cookie.

Registro exige `firstName`, `lastName`, `username`, `email`, `password`, `confirmPassword`.
Contraseñas: mínimo 8 caracteres, mayúscula, minúscula, número y carácter especial; máximo 128.
Las rutas de subida usan multipart con campo `file`. Perfil: JPEG/PNG hasta 2 MB.
Galería: JPEG/PNG/WebP hasta 5 MB; 1–15 imágenes y una portada. Las imágenes se recodifican a JPEG.

## Contratos principales

- Públicos: `/asylums`, `/asylums/catalogs`, `/asylums/map`, `/asylums/compare`, `/asylums/{id}`.
- Perfil y favoritos: `/users/me`, `/users/me/picture`, `/favorites` y `/favorites/{asylum_id}`.
- Reseñas: `/asylums/{id}/reviews`, `/asylums/{id}/reputation`, `/reviews/{id}` y reportes.
- Notificaciones: `/notifications`, `/notifications/unread-count`, `/notifications/read-all`,
  `/notifications/{id}/read`, `/notification-preferences`.
- Administración: `/admin/asylums`, `/admin/users`, `/admin/users/{id}/blocks`,
  `/admin/asylum-admins`, `/admin/review-reports`, `/admin/moderation-decisions`.
- Centro asignado: `/center`, `/center/images`, `/center/images/{id}/cover`, `/center/reviews`.
- Reportes: `/admin/dashboard`, `/admin/reports?reportType=centers`, `/admin/reports/export`.

Listados administrativos usan `page` de 20 elementos; reputación usa 10.
`/admin/asylums` admite `q`, `status`, `provinceId`; `/admin/users`, `q`, `role`, `status`.
Reputación admite `q`, `rating`, `sort=newest|oldest|rating_desc|rating_asc`.
Reportes: `reportType=centers|users|reviews`, `startDate`, `endDate`, `status`, `provinceId`.
Exportación exige fechas y `format=pdf|csv`; una consulta vacía responde 422.
Los parámetros temporales son fechas ISO y se interpretan como días UTC inclusivos.
El dashboard acepta fechas; la UI puede calcular rangos de 7/30/365 días.

## Verificación automatizada

```bash
cd backend
./scripts/check_backend.sh
```

El script levanta un PostgreSQL desechable propio, migra, ejecuta pruebas y lo elimina al terminar.
Nunca usa la base de desarrollo. Requiere Docker y `.venv` con las dependencias de `requirements.lock`.

```bash
.venv/bin/pip-audit --require-hashes -r requirements.lock
```

No se requiere frontend para estas pruebas. Su instalación local pendiente está documentada en
`IMPLEMENTATION.md`. No se publica ni despliega automáticamente este entorno.
