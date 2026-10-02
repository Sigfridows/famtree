# Datos ficticios del equipo

Adaptación de `datos mock.txt` entregado por el owner. No se ejecuta automáticamente
al iniciar ni durante migraciones. Solo admite `APP_ENV=development`.

Desde la raíz del repositorio con los servicios levantados:

```bash
docker compose exec backend python -m scripts.seed_owner_mock
```

El ejecutor usa `scripts/owner_mock.sql`, la configuración de base de datos del
backend y su implementación Argon2id. El SQL contiene un parámetro de contraseña:
no debe ejecutarse directamente con psql.

Incluye tres centros, cinco imágenes, ocho usuarios, tres reseñas y tres favoritos,
además de las relaciones con servicios y tipos de adulto mayor. No elimina los
centros demo previos. Los datos son ficticios y no deben cargarse en producción.

## Adaptaciones

- Estados y roles en español coinciden con los enums de PostgreSQL; la API los
  transforma a su contrato habitual.
- Relaciones de servicios y tipos resueltas por nombre, sin asumir IDs fijos.
- `alejandro.jimenez` pasa a `alejandro.j` por el límite de 16 caracteres.
- Correos de prueba con dominio `example.invalid` para evitar destinatarios reales.
- Una contraseña aleatoria compartida exclusivamente por las nuevas cuentas mock,
  con hash Argon2id válido. Los administradores de centro conservan la obligación
  de cambiarla al entrar. No se restablecen contraseñas de cuentas existentes.
- Inserciones condicionales, una sola transacción y bloqueo entre ejecuciones:
  repetir la carga no duplica registros ni sobrescribe datos existentes.
- Las imágenes son los enlaces externos proporcionados por el owner; dependen de
  su disponibilidad y no se copian al repositorio.

## Acceso local

La contraseña se guarda en `backend/.runtime/owner-mock-credentials.json`, ignorado
por Git y con permisos 0600. No compartir ni subir ese archivo. Cada instalación
genera su propia contraseña. El archivo puede existir aunque una carga falle;
se reutiliza al reintentar para no perder las credenciales.

Usuarios: `admin.sistema`, `admin.sanjose`, `admin.sanfran`, `alejandro.j`,
`gabriel.morales`, `elena.castillo`, `sofia.peralta`, `maria.fernandez`.

## Verificación local realizada

Se ejecutó dos veces: los totales permanecieron en cinco centros, once usuarios,
siete imágenes, tres reseñas y tres favoritos (incluyen los demos previos).
Login de `alejandro.j`: HTTP 200. Las tres portadas del owner cargaron en el
catálogo del navegador. Ruff y mypy del ejecutor pasaron.
