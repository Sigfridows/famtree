# Cambios realizados en esta sesión

Fecha: 1 de octubre de 2026
Repositorio: `Sigfridows/famtree`
Estado: hay cambios locales pendientes de commit y push. Este documento también resume ajustes previos ya presentes en la rama; no todo lo descrito es un cambio nuevo sin subir.

La [auditoría de las 45 HUs](HU_CONGRUENCE_AUDIT_2026-10-01.md) distingue capacidades existentes, problemas de integración y criterios pendientes. Este registro de cambios no certifica que esas historias estén completas.

## Registro y autenticación

- Se alineó el formulario de registro con las reglas reales del backend.
- Se validan usuario, nombre, apellido, correo y contraseña antes de enviar la solicitud.
- La contraseña exige entre 8 y 128 caracteres, mayúscula, minúscula, número y símbolo.
- Se agregó la validación de confirmación de contraseña incluso cuando el campo no perdió el foco.
- Se muestran mensajes de validación en español en lugar de `Request validation failed`.
- Se traducen los errores 422 del backend a instrucciones para el usuario.
- Después de registrar una cuenta se inicia sesión contra la API para crear la cookie de sesión real.
- Se verificó que la sesión permanece activa después de recargar el catálogo.
- Diferencia pendiente de acordar: HU01 original exige ir a login al terminar el registro; el inicio automático es una variación del requisito.

## Comparación y favoritos

La corrección de doble activación y el uso de servicios reales ya estaban en `37f3cf1`, incluido en el HEAD remoto `0040e03`; los ajustes locales posteriores no convierten por sí solos toda HU12–13 en terminada.

- Se evitó que una casilla de comparación se active dos veces por propagación de eventos.
- El botón de comparación permanece desactivado hasta seleccionar dos residencias.
- Se muestra una indicación clara para seleccionar entre dos y cuatro residencias.
- La comparación utiliza los servicios reales recibidos de la API.
- Se agregó cobertura para los estados de comparación y los datos de servicios.
- El mapa recibe el estado real de favoritos y permite guardarlos o quitarlos desde el detalle.

## Reportes de reseñas

- Reportar la misma reseña dos veces ahora devuelve el reporte existente y no intenta crear un duplicado.
- Se agregó rollback de la transacción si ocurre una carrera de inserción en la restricción única.
- Las reseñas incluyen `hasReported` para que el estado se conserve después de recargar.
- La interfaz cambia inmediatamente el menú a `Ya reportada` después de enviar el reporte.
- Se agregaron mensajes de error comprensibles para reseña propia, reseña no disponible y reporte repetido.
- El mensaje global de conflicto pasó de lenguaje técnico a `Ese registro ya existe o la acción ya fue realizada.`
- Se agregó una prueba de integración que confirma que el segundo reporte devuelve el mismo identificador.
- Se agregó cierre del menú de acciones al hacer clic fuera, mediante un listener de documento.
- Pendiente detectado en auditoría: distinguir errores por código y acción; no todo 403 significa reseña propia ni todo 409 significa reporte repetido. La persistencia de `hasReported` está implementada, pero falta aceptar el recorrido completo al cambiar de usuario sin recargar.

## Colores de menciones de asilos

- Se agregó un cálculo de color basado en el identificador y la posición del asilo en el selector.
- El color se aplica al nombre y al `@alias` dentro del selector de menciones.
- La etiqueta del redactor también usa color, pero no pasa la posición: puede diferir del selector o cambiar cuando se reordena/filtra la lista. La estabilidad aún requiere corrección.
- Se usan cinco paletas: azul, violeta, rosado, ámbar y verde. No se realizó una medición de contraste que permita certificar accesibilidad.

## Comentarios sugeridos por calificación

- El redactor muestra sugerencias rápidas según la cantidad de estrellas únicamente después de que la persona selecciona una calificación.
- Una estrella propone `Mala experiencia.` y alternativas relacionadas.
- Dos, tres, cuatro y cinco estrellas tienen sus propias frases sugeridas.
- El usuario puede seleccionar una sugerencia sin escribir manualmente.
- Si publica sin escribir texto, se utiliza automáticamente la primera sugerencia de la calificación elegida.
- La escritura libre sigue disponible y reemplaza la sugerencia al editar el campo.
- Después de publicar, se limpian la calificación seleccionada y las sugerencias para comenzar otra reseña desde cero.

## Mapa 3D descartado

- Se investigó la disponibilidad de modelos 3D de República Dominicana y se generó una prueba local basada en Natural Earth 10m.
- A petición del equipo, se retiraron el modelo GLB, el visor Three.js, el selector 2D/3D y las dependencias asociadas.
- El mapa actual queda únicamente con Leaflet 2D.

## Verificación

Las suites se ejecutaron nuevamente durante la auditoría del 1 de octubre. Los resultados acreditan las pruebas existentes, no aceptación de todas las HUs.

- Backend: 84 pruebas pasadas, cobertura total 94.53%, Alembic, Ruff y mypy correctos.
- Frontend: 32 pruebas pasadas.
- Frontend typecheck correcto.
- Frontend lint correcto.
- `git diff --check` correcto.
- La cobertura frontend excluye páginas, componentes y varios hooks/módulos; no mide toda la experiencia de usuario.

## Auditoría de congruencia añadida

- Se descargó nuevamente el documento original con las 45 HUs y se creó una matriz por historia, con enlaces al código y tareas pendientes.
- Se reprodujeron el 422 al guardar perfil, el filtro de servicio omitido en la petición, el destino público del login de administrador global y los valores fijos de habitaciones/baños/superficie.
- Se documentaron preferencias sin persistencia, favoritos inactivos, pantallas administrativas faltantes y criterios incompletos de catálogo, detalle, comparación y mapa.
- Se separaron los requisitos originales de ampliaciones del equipo: likes, opiniones sugeridas, colores, tipo de propiedad y modo claro. El mapa 3D retirado no se considera una HU faltante.
- Se marcaron como históricos los informes previos de backend y descubrimiento para evitar presentar su estado anterior del frontend como estado actual.
- En esta auditoría se actualizaron documentos; no se corrigieron todavía los defectos identificados ni se hizo commit/push.

## Paneles administrativos añadidos

- Se creó `/system-admin` con navegación protegida para `SYSTEM_ADMIN`: resumen con métricas reales, filtros temporales, asilos, usuarios, moderación, reportes, auditoría y exportación PDF/CSV.
- Se conectaron las pantallas globales con los endpoints administrativos existentes: crear/editar/activar/desactivar asilos, crear administradores de asilo, bloquear/desbloquear usuarios, resolver reportes y consultar decisiones.
- Se añadieron mensajes de error orientados al usuario, confirmaciones para acciones destructivas, paginación, estados vacíos, navegación móvil y aislamiento de roles.
- Se reforzó `/center-admin`: menú con panel, asilo, galería, reseñas y cuenta; cancelación que restaura cambios, validación de servicios/tipos de atención, carga múltiple con progreso, drag and drop, confirmación de borrado, portada, distribución y orden de reseñas.
- El cambio obligatorio de contraseña temporal valida 8–128 caracteres, variedad de caracteres, diferencia con la temporal y ofrece salida segura.
- Se corrigió el destino del login: `SYSTEM_ADMIN` entra a `/system-admin`, `ASYLUM_ADMIN` a `/center-admin/asylum` y usuarios registrados al catálogo.
- Se corrigió el formulario de perfil para no enviar `profilePicture` en el PATCH rechazado por el backend y se alinearon las reglas visuales de contraseña.
- Se añadió `backend/scripts/check_admin_ui.sh`, que crea PostgreSQL desechable y ejecuta 16 comprobaciones E2E contra ambos roles sin tocar la base local. La última ejecución terminó correctamente.
- Verificación final: backend 84 tests y checks verdes; frontend typecheck, lint, 37 tests, 94.01% de cobertura aplicable y build de producción verdes. El build muestra solo el aviso de Next sobre migrar `middleware` a `proxy`.
