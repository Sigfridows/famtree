# Ejecución del plan de pruebas FamTree — 2026-10-15

## Alcance y ambiente

- Fuente: `FamTree_Plan_de_Pruebas_VersionFinal (1).docx` (HU01–HU45, 90 casos planificados y smoke SM01–SM06).
- Commit evaluado: `ee60f6a` (`main`).
- Frontend: `http://localhost:3000`.
- API: `http://localhost:18000`.
- Base local: PostgreSQL del `docker compose` con datos mock existentes.
- Servicios: backend, frontend, PostgreSQL y Mailpit saludables después de reiniciar el frontend.

No se incluyen contraseñas ni tokens en este informe.

## Resultado automatizado

| Suite | Resultado | Evidencia |
| --- | --- | --- |
| Backend (`backend/scripts/check_backend.sh`) | PASS | 84 pruebas; migración upgrade/downgrade/upgrade; Ruff, Mypy, Bandit y metadatos correctos; cobertura 93.73%. |
| Frontend typecheck | PASS | `npm run typecheck`. |
| Frontend lint | PASS | `npm run lint`. |
| Frontend Vitest | PASS | 11 archivos, 38 pruebas; cobertura 92.8% statements, 81.25% branches, 94.24% lines. |
| Frontend build | PASS | `npm run build`; 23 rutas generadas. |

El build mantiene únicamente la advertencia no bloqueante de Next.js sobre migrar `middleware` a `proxy`.

## Smoke manual

| Caso | Estado | Evidencia |
| --- | --- | --- |
| SM01 catálogo y detalle anónimo | PASS | `/catalog` carga 5 residencias; `Ver Detalles` abre la ficha con ubicación, contacto, servicios y reseñas. |
| SM02 favorito anónimo | PASS | El catálogo no modifica favoritos sin sesión y muestra el aviso de inicio de sesión. |
| SM03 inicio de sesión | PASS parcial | `admin.sistema` llega a `/system-admin`; usuario registrado llega a `/catalog`. La cuenta local de admin de asilo requiere credenciales válidas del fixture persistido y no pudo reproducirse con la contraseña documentada localmente. |
| SM04 recurso privado autorizado | PASS | El administrador de sistema ve `/system-admin`, KPIs, asilos, usuarios, moderación, reportes y auditoría. |
| SM05 guardar/revertir/re cargar fixture | NO EJECUTADO | Requiere modificar datos persistentes y limpiar después; no existe un fixture E2E aislado en `qa/e2e`. |
| SM06 cerrar sesión y negar privado | PASS | Cerrar sesión redirige a `/login`; la sesión privada deja de estar disponible. |

## Incidencias encontradas y resolución

1. **Dependencias del volumen Docker desactualizadas.** El frontend levantado tenía `node_modules` sin `recharts`, aunque `package.json` y `package-lock.json` sí lo declaran. Esto provocaba errores de compilación y páginas 500 durante la primera ejecución. Se corrigió ejecutando `npm ci` dentro del contenedor `frontend` y reiniciando el servicio. La segunda ejecución carga catálogo, login y panel sin ese error.
2. **Advertencias no bloqueantes.** Next.js avisa que la convención `middleware` está deprecada y muestra avisos de optimización de imágenes LCP. No afectan el flujo funcional probado y quedan como mantenimiento técnico posterior.
3. **Cobertura E2E incompleta en el repositorio.** `qa/e2e` solo contiene su README y no hay specs Playwright para los 90 TCs. Por ello, las HUs no demostradas por las suites automatizadas o por el smoke se mantienen como `NO EJECUTADO`, no como aprobadas por inferencia.

## Estado de las 90 TCs del documento

Las suites automatizadas cubren validaciones de transporte, autenticación, registro, reseñas, favoritos, comparación, permisos y paneles a nivel unitario/integración. Sin embargo, no existe en el repositorio una ejecución E2E trazable que permita marcar los 90 casos del documento como `PASS`. Los casos de edición, moderación completa, auditoría, preferencias de notificación, galería, recuperación y persistencia entre sesiones quedan pendientes de specs Playwright y fixtures aislados.

## Recomendación de cierre

Antes de declarar el plan completo, agregar los specs Playwright definidos en el documento (`auth`, `catalog`, `permissions`, `profile`, `favorites`, `reviews`, `recovery`) y ejecutarlos contra una base efímera. El código actual pasa todas las comprobaciones automatizadas disponibles y el smoke público/administrativo ejecutado en este ambiente.
