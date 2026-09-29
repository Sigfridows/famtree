# Configuración local del equipo

Docker Compose lee `.env` en la raíz del repositorio. Copiar `.env.example` cuando
no exista; no sobrescribir un `.env` existente ni subirlo a Git.

En esta computadora el backend usa el puerto 18000:

```dotenv
BACKEND_PORT=18000
FRONTEND_PORT=3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:18000/api/v1
CORS_ORIGINS=http://localhost:3000
```

Conservar también las variables de `.env.example`: `POSTGRES_DB`, `POSTGRES_USER`,
`POSTGRES_PASSWORD`, `POSTGRES_PORT`, `DATABASE_URL`, `SESSION_SECRET`, `APP_ENV`,
`SMTP_HOST`, `SMTP_PORT`, `UPLOAD_DIR` y los puertos de Mailpit.
`DATABASE_URL` debe usar las mismas credenciales de PostgreSQL; dentro de Compose
el hostname es `postgres`, no `localhost`. No cambiar la contraseña de un volumen
existente solo editando `.env`: eso no actualiza el usuario de PostgreSQL.

Para una instalación nueva, generar un secreto propio con
`openssl rand -hex 32` y asignarlo a `SESSION_SECRET`. Ningún secreto debe tener
prefijo `NEXT_PUBLIC_`: estas variables quedan visibles en el navegador.

```bash
docker compose up -d --build
docker compose exec frontend npm ci
```

El segundo comando sincroniza el volumen de dependencias cuando cambie el lockfile
(por ejemplo, para resolver una instalación local antigua sin `lucide-react`).
El backend aplica las migraciones al arrancar. Si cambia la URL pública de la API,
recrear el frontend; en producción también hay que reconstruir su imagen.

- Aplicación: http://localhost:3000
- Swagger: http://localhost:18000/docs
- OpenAPI: http://localhost:18000/openapi.json
- Correo de desarrollo: http://localhost:8025

Hacer push comparte código y migraciones, pero no despliega el servidor ni copia
`.env`. Cada compañero configura su entorno y levanta los servicios. Las sesiones
usan cookies: no hay que copiar una API key para consumir esta API.
El mapa Leaflet 2D recibido no requiere clave; la configuración del mapa 3D
dependerá de la implementación que el equipo aporte.
