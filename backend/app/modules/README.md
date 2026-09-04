# Módulos del backend

Cada directorio es un límite funcional del monolito modular. El módulo expone sus routers o
servicios públicos desde su paquete; no se importan repositorios ni modelos internos de otro
módulo.

| Módulo | Responsabilidad |
| --- | --- |
| `auth` | FT01: identidad, sesiones y acceso |
| `users` | FT02: perfil y estado del usuario |
| `asylums` | FT03–FT05: catálogo, ubicación, mapa y comparación |
| `favorites` | FT06: favoritos |
| `reviews` | FT07: reseñas, reportes de reseña y moderación relacionada |
| `notifications` | FT08: bandeja y preferencias |
| `reports` | FT09: reportes analíticos y exportaciones |
| `administration` | FT11: administración global |
| `center_management` | FT12: gestión exclusiva del centro asignado |
| `health` | diagnóstico técnico, fuera de las HUs |

FT10 sigue sin definición en Notion y no se inventa un módulo. Provincia, municipio, servicios y
tipos de adulto mayor son conceptos del dominio de asilos, no módulos por tabla. La escritura de
catálogos administrativos se coordinará desde `administration` sin duplicar su propiedad.

## Estructura al implementar una feature

Crea solo los archivos que el caso de uso necesite:

```text
router.py       # transporte HTTP y dependencies de FastAPI
schemas.py      # contratos Pydantic
service.py      # casos de uso y reglas
repository.py   # persistencia y queries
models.py       # modelos SQLAlchemy del módulo
```

`core` conserva infraestructura transversal; `db` conserva sesión/base de datos; `api/router.py`
es el composition root. No se crearán carpetas globales de controllers, services o models.
