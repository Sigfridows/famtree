# FamTree — Revisión individual de criterios de aceptación

Fuente: exportaciones data.csv y tasks.csv; son idénticas. 58 bugs activos, 222 criterios. Se conservan los textos originales.

Los estados no son equivalentes: una revisión en código no se etiqueta como prueba ejecutada. Los escenarios de navegador son comprobaciones focalizadas; el estado del bug en Azure solo debe actualizarse después de la aceptación del equipo.

Validaciones: 88 pruebas de backend; 61 de frontend; TypeScript y ESLint; 58 escenarios principales y 14 de casos límite sin capturas. Véanse los registros locales en backend/.runtime/acceptance-*.log.

Los criterios anteriores de redirección automática a login para favoritos y acceso automático tras registro quedan sustituidos por el flujo descrito en los criterios actuales.

## AZ-770 — BUG01 - El aviso de favoritos para visitantes usa una alerta nativa sin accesos a autenticación

Implementación: `frontend/src/components/shared/AuthenticationPrompt.tsx`, `frontend/src/features/asylums/hooks/useFavorites.ts`, `frontend/src/app/(main)/catalog/page.tsx`, `frontend/src/tests/authentication-prompt.test.tsx`

### 770-CA1

Sustituir la alerta nativa por un modal de la aplicación.

**Estado:** Implementación revisada en código.

### 770-CA2

Mostrar un mensaje que explique que es necesario iniciar sesión para guardar favoritos.

**Estado:** Implementación revisada en código.

### 770-CA3

Incluir enlaces funcionales Iniciar sesión y Registrarse, además de una opción de cierre.

**Estado:** Implementación revisada en código.

### 770-CA4

No crear un favorito ni marcar el corazón mientras el visitante no esté autenticado.

**Estado:** Implementación revisada en código.

## AZ-771 — BUG02 - Guardados presenta una lista personal vacía a un visitante sin explicar la restricción

Implementación: `frontend/src/components/shared/AuthenticationPrompt.tsx`, `frontend/src/features/asylums/hooks/useFavorites.ts`, `frontend/src/app/(main)/catalog/page.tsx`, `frontend/src/tests/authentication-prompt.test.tsx`

### 771-CA1

Comprobar la sesión antes de consultar la lista personal.

**Estado:** Implementación revisada en código.

### 771-CA2

Solicitar autenticación al visitante con accesos a iniciar sesión y registrarse.

**Estado:** Implementación revisada en código.

### 771-CA3

Reservar el estado Sin residencias guardadas para una cuenta autenticada cuya lista esté realmente vacía.

**Estado:** Implementación revisada en código.

### 771-CA4

Conservar el catálogo al cerrar el aviso.

**Estado:** Implementación revisada en código.

## AZ-772 — BUG03 - La campana y el panel de notificaciones se muestran sin autenticación

Implementación: `frontend/src/components/shared/HeaderControls.tsx`, `frontend/src/app/(main)/notifications/page.tsx`, `frontend/src/features/notifications/hooks/useNotifications.ts`, `frontend/src/tests/notification-privacy.test.tsx`

### 772-CA1

Ocultar la campana y el acceso a la bandeja en modo visitante.

**Estado:** Implementación revisada en código.

### 772-CA2

Redirigir a Iniciar sesión si se accede directamente a una ruta privada de notificaciones.

**Estado:** Verificado en prueba específica.
**Prueba:** Ruta de notificaciones exige sesión.

### 772-CA3

Comprobar permisos en el servicio que consulta las notificaciones.

**Estado:** Verificado en prueba específica.
**Prueba:** Ruta de notificaciones exige sesión.

### 772-CA4

No dejar datos de la bandeja al cerrar sesión.

**Estado:** Implementación revisada en código.

## AZ-773 — BUG04 - La comparación pública exige guardar otro asilo en favoritos y bloquea al visitante

Implementación: `frontend/src/features/asylums/components/Compare.tsx`, `frontend/src/tests/compare.test.tsx`, `backend/tests/integration/test_discovery.py`

### 773-CA1

Permitir seleccionar entre 2 y 4 asilos activos desde el catálogo sin requerir favoritos ni autenticación.

**Estado:** Implementación revisada en código.

### 773-CA2

Ofrecer una acción para añadir un segundo asilo al flujo ya iniciado.

**Estado:** Implementación revisada en código.

### 773-CA3

Habilitar Comparar al seleccionar 2, 3 o 4 centros.

**Estado:** Implementación revisada en código.

### 773-CA4

Mantener deshabilitada la comparación con menos de 2 y comunicar cómo completar la selección.

**Estado:** Implementación revisada en código.

## AZ-776 — BUG05 - La columna Provincia de la selección comparativa muestra una dirección de calle

Implementación: `frontend/src/features/asylums/components/Compare.tsx`, `frontend/src/tests/compare.test.tsx`, `backend/tests/integration/test_discovery.py`

### 776-CA1

Asignar a Provincia el dato de provincia del centro.

**Estado:** Verificado en prueba específica.
**Prueba:** Comparación sin provincia nunca usa la dirección.

### 776-CA2

Mostrar la calle únicamente con una etiqueta de Dirección.

**Estado:** Verificado en prueba específica.
**Prueba:** Comparación sin provincia nunca usa la dirección.

### 776-CA3

Presentar un estado No informado si la provincia no existe, sin sustituirla por otro atributo.

**Estado:** Verificado en prueba específica.
**Prueba:** Comparación sin provincia nunca usa la dirección.

### 776-CA4

Comprobar la correspondencia de columnas para todos los asilos seleccionados.

**Estado:** Implementación revisada en código.

## AZ-777 — BUG06 - La ficha de asilo omite provincia, municipio y sector de la dirección

Implementación: `frontend/src/features/asylums/adapters/detail.ts`, `frontend/src/features/asylums/components/AsiloDetails.tsx`, `frontend/src/features/asylums/components/LocationMap.tsx`, `backend/app/modules/asylums/repository.py`

### 777-CA1

Presentar provincia, municipio, sector y dirección específica en una sección identificable.

**Estado:** Implementación revisada en código.

### 777-CA2

Usar estados No informado para atributos ausentes.

**Estado:** Verificado en prueba específica.
**Prueba:** Datos ausentes en ficha y enlaces inválidos.

### 777-CA3

Mantener los mismos datos de ubicación al abrir desde catálogo y mapa.

**Estado:** Implementación revisada en código.

## AZ-778 — BUG07 - La ficha pública no presenta capacidad ni requisitos de ingreso

Implementación: `frontend/src/features/asylums/adapters/detail.ts`, `frontend/src/features/asylums/components/AsiloDetails.tsx`, `frontend/src/features/asylums/components/LocationMap.tsx`, `backend/app/modules/asylums/repository.py`

### 778-CA1

Mostrar la capacidad total con su unidad.

**Estado:** Implementación revisada en código.

### 778-CA2

Mostrar los requisitos de ingreso registrados sin sustituirlos por la descripción.

**Estado:** Implementación revisada en código.

### 778-CA3

Presentar un estado explícito si algún dato no ha sido informado.

**Estado:** Verificado en prueba específica.
**Prueba:** Datos ausentes en ficha y enlaces inválidos.

### 778-CA4

Verificar los mismos atributos al abrir desde mapa.

**Estado:** Implementación revisada en código.

## AZ-779 — BUG08 - Los distintivos Verificado y Seguro no muestran certificaciones ni fecha de actualización

Implementación: `frontend/src/features/asylums/adapters/detail.ts`, `frontend/src/features/asylums/components/AsiloDetails.tsx`, `frontend/src/features/asylums/components/LocationMap.tsx`, `backend/app/modules/asylums/repository.py`

### 779-CA1

Presentar las certificaciones o licencias declaradas con una etiqueta clara.

**Estado:** Implementación revisada en código.

### 779-CA2

Mostrar la última fecha de actualización del centro.

**Estado:** Implementación revisada en código.

### 779-CA3

Vincular el distintivo de verificación a información real del centro o retirar la afirmación si no existe soporte.

**Estado:** Implementación revisada en código.

### 779-CA4

Mostrar Sin certificaciones declaradas cuando corresponda.

**Estado:** Verificado en prueba específica.
**Prueba:** Datos ausentes en ficha y enlaces inválidos.

## AZ-780 — BUG09 - La ficha omite el acceso al sitio web registrado del asilo

Implementación: `frontend/src/features/asylums/adapters/detail.ts`, `frontend/src/features/asylums/components/AsiloDetails.tsx`, `frontend/src/features/asylums/components/LocationMap.tsx`, `backend/app/modules/asylums/repository.py`

### 780-CA1

Mostrar el sitio web cuando el centro tenga una URL registrada.

**Estado:** Implementación revisada en código.

### 780-CA2

Abrir la URL en una nueva pestaña.

**Estado:** Implementación revisada en código.

### 780-CA3

Mantener enlaces tel: y mailto: para teléfono y correo.

**Estado:** Implementación revisada en código.

### 780-CA4

No renderizar enlaces vacíos o inválidos.

**Estado:** Verificado en prueba específica.
**Prueba:** Datos ausentes en ficha y enlaces inválidos.

## AZ-781 — BUG10 - El detalle no ofrece un mapa individual de la ubicación del centro

Implementación: `frontend/src/features/asylums/adapters/detail.ts`, `frontend/src/features/asylums/components/AsiloDetails.tsx`, `frontend/src/features/asylums/components/LocationMap.tsx`, `backend/app/modules/asylums/repository.py`

### 781-CA1

Incluir un mapa 2D centrado en las coordenadas del centro con un único marcador.

**Estado:** Implementación revisada en código.

### 781-CA2

Mostrar dirección textual y controles de zoom.

**Estado:** Implementación revisada en código.

### 781-CA3

Si faltan coordenadas, presentar Ubicación en mapa no disponible para este centro sin romper la ficha.

**Estado:** Verificado en prueba específica.
**Prueba:** Datos ausentes en ficha y enlaces inválidos.

## AZ-782 — BUG11 - El detalle abierto desde el mapa pierde el precio máximo mensual

Implementación: `frontend/src/features/asylums/adapters/detail.ts`, `frontend/src/features/asylums/components/AsiloDetails.tsx`, `frontend/src/features/asylums/components/LocationMap.tsx`, `backend/app/modules/asylums/repository.py`

### 782-CA1

Usar el mismo rango mínimo/máximo mensual en ambas fichas.

**Estado:** Implementación revisada en código.

### 782-CA2

Mantener la moneda DOP y la indicación por mes.

**Estado:** Implementación revisada en código.

### 782-CA3

Compartir la fuente de datos de la ficha para evitar diferencias entre vistas.

**Estado:** Implementación revisada en código.

### 782-CA4

No reemplazar el rango completo por el mínimo en una vista de detalle.

**Estado:** Implementación revisada en código.

## AZ-783 — BUG12 - El detalle desde el mapa omite servicios y tipos de cuidado visibles en catálogo

Implementación: `frontend/src/features/asylums/adapters/detail.ts`, `frontend/src/features/asylums/components/AsiloDetails.tsx`, `frontend/src/features/asylums/components/LocationMap.tsx`, `backend/app/modules/asylums/repository.py`

### 783-CA1

Mostrar los mismos tipos de cuidado y servicios desde todos los accesos al detalle.

**Estado:** Implementación revisada en código.

### 783-CA2

Reutilizar una ficha con una fuente de datos consistente.

**Estado:** Implementación revisada en código.

### 783-CA3

Distinguir ausencia real de datos de una carga pendiente.

**Estado:** Verificado en prueba específica.
**Prueba:** Datos ausentes en ficha y enlaces inválidos.

### 783-CA4

Mantener estas secciones visibles sin depender del listado de origen.

**Estado:** Implementación revisada en código.

## AZ-784 — BUG13 - Al alejar el mapa quedan grandes áreas grises y una franja cartográfica incompleta

Implementación: `frontend/src/features/map/components/MapLeafletView.tsx`, `frontend/src/features/map/components/MapContainer.tsx`, `backend/tests/integration/test_discovery.py`

### 784-CA1

Renderizar cartografía válida en toda el área útil en los niveles permitidos.

**Estado:** Verificado en prueba específica.
**Prueba:** Fallo cartográfico se explica y Reintentar recupera las teselas.

### 784-CA2

Definir niveles mínimos/máximos compatibles con la fuente cartográfica.

**Estado:** Implementación revisada en código.

### 784-CA3

Mantener marcadores alineados con sus coordenadas al variar el zoom.

**Estado:** Implementación revisada en código.

### 784-CA4

Mostrar un aviso y una opción Reintentar si hay un fallo de carga, evitando un área gris silenciosa.

**Estado:** Verificado en prueba específica.
**Prueba:** Fallo cartográfico se explica y Reintentar recupera las teselas.

## AZ-785 — BUG14 - El encuadre inicial del mapa se limita al entorno de Santo Domingo

Implementación: `frontend/src/features/map/components/MapLeafletView.tsx`, `frontend/src/features/map/components/MapContainer.tsx`, `backend/tests/integration/test_discovery.py`

### 785-CA1

Aplicar por defecto un encuadre que permita identificar el territorio dominicano.

**Estado:** Implementación revisada en código.

### 785-CA2

Mantener visibles los marcadores activos dentro del encuadre.

**Estado:** Implementación revisada en código.

### 785-CA3

Permitir acercarse a un centro sin perder la posibilidad de volver a la vista general.

**Estado:** Implementación revisada en código.

## AZ-786 — BUG15 - El resumen lateral del mapa omite foto, municipio/provincia y rango mensual

Implementación: `frontend/src/features/map/components/MapLeafletView.tsx`, `frontend/src/features/map/components/MapContainer.tsx`, `backend/tests/integration/test_discovery.py`

### 786-CA1

Confirmar y documentar si se mantiene popup o resumen lateral.

**Estado:** Implementación revisada en código.

### 786-CA2

Presentar imagen, nombre, municipio/provincia, rango mensual y calificación del centro seleccionado.

**Estado:** Implementación revisada en código.

### 786-CA3

Incluir Ver Detalles y una acción para cerrar o cambiar la selección.

**Estado:** Implementación revisada en código.

### 786-CA4

Sincronizar el marcador seleccionado con el resumen visible.

**Estado:** Implementación revisada en código.

## AZ-787 — BUG16 - Dar Reseña desde un asilo muestra opiniones de otros centros

Implementación: `frontend/src/app/(main)/review/page.tsx`, `frontend/src/features/reviews/hooks/useReviews.ts`, `backend/app/modules/reviews/service.py`

### 787-CA1

Conservar el identificador del asilo seleccionado al navegar.

**Estado:** Verificado en prueba específica.
**Prueba:** Autenticación de reseña conserva el centro de origen.

### 787-CA2

Mostrar únicamente sus reseñas cuando la navegación se inicia desde su ficha.

**Estado:** Implementación revisada en código.

### 787-CA3

Identificar el centro en la cabecera y en el formulario de publicación.

**Estado:** Verificado en prueba específica.
**Prueba:** Autenticación de reseña conserva el centro de origen.

### 787-CA4

En modo visitante, ofrecer autenticación conservando el asilo de origen.

**Estado:** Verificado en prueba específica.
**Prueba:** Autenticación de reseña conserva el centro de origen.

## AZ-788 — BUG17 - No se presenta el resumen de reseñas por centro ni la distribución de estrellas

Implementación: `frontend/src/app/(main)/review/page.tsx`, `frontend/src/features/reviews/hooks/useReviews.ts`, `backend/app/modules/reviews/service.py`

### 788-CA1

Mostrar promedio con un decimal, estrellas, total y distribución de 1 a 5 por centro.

**Estado:** Verificado en prueba específica.
**Prueba:** Resumen usa las mismas reseñas visibles con Mis Reseñas.

### 788-CA2

Calcular el resumen con las mismas reseñas visibles del centro.

**Estado:** Verificado en prueba específica.
**Prueba:** Resumen usa las mismas reseñas visibles con Mis Reseñas.

### 788-CA3

Mostrar el estado sin reseñas cuando corresponda.

**Estado:** Verificado en prueba específica.
**Prueba:** Resumen usa las mismas reseñas visibles con Mis Reseñas.

### 788-CA4

Conservar la consulta pública sin exigir autenticación.

**Estado:** Implementación revisada en código.

## AZ-789 — BUG18 - Faltan controles para ordenar por precio y nombre en el catálogo

Implementación: `frontend/src/features/asylums/components/Filter.tsx`, `frontend/src/features/asylums/hooks/useAsylums.ts`, `frontend/src/app/(main)/catalog/page.tsx`, `backend/tests/integration/test_discovery.py`

### 789-CA1

Proveer las cinco opciones de orden definidas en HU06 o documentar un cambio de alcance aprobado.

**Estado:** Implementación revisada en código.

### 789-CA2

Aplicar el orden sobre el conjunto filtrado sin cambiar sus miembros.

**Estado:** Implementación revisada en código.

### 789-CA3

Conservar el orden al cambiar filtros y páginas.

**Estado:** Implementación revisada en código.

### 789-CA4

Usar Nombre A-Z por defecto si sigue vigente el criterio de la HU.

**Estado:** Implementación revisada en código.

## AZ-790 — BUG19 - Calificación mínima se reduce a un interruptor sin indicar el umbral aplicado

Implementación: `frontend/src/features/asylums/components/Filter.tsx`, `frontend/src/features/asylums/hooks/useAsylums.ts`, `frontend/src/app/(main)/catalog/page.tsx`, `backend/tests/integration/test_discovery.py`

### 790-CA1

Permitir elegir un umbral de 1 a 5 según HU05 o mostrar explícitamente el umbral aprobado del interruptor.

**Estado:** Verificado en prueba específica.
**Prueba:** Filtros: precios no negativos, umbral visible y limpieza.

### 790-CA2

Indicar el valor aplicado en el panel y en el estado de filtros.

**Estado:** Verificado en prueba específica.
**Prueba:** Filtros: precios no negativos, umbral visible y limpieza.

### 790-CA3

Excluir centros por debajo del umbral seleccionado.

**Estado:** Verificado en prueba específica.
**Prueba:** Filtros: precios no negativos, umbral visible y limpieza.

### 790-CA4

Restablecer el umbral al limpiar filtros.

**Estado:** Verificado en prueba específica.
**Prueba:** Filtros: precios no negativos, umbral visible y limpieza.

## AZ-791 — BUG20 - El inicio de sesión interpreta credenciales incorrectas como fin de sesión

Implementación: `frontend/src/features/auth/hooks/useLoginForm.ts`, `frontend/src/features/auth/hooks/useRegisterForm.ts`, `frontend/src/features/auth/components/AuthProvider.tsx`, `backend/app/modules/auth/service.py`, `backend/tests/integration/test_workflows.py`

### 791-CA1

Mostrar Nombre de usuario o contraseña incorrectos para autenticación fallida.

**Estado:** Implementación revisada en código.

### 791-CA2

Reservar el aviso de sesión terminada para una sesión previa realmente expirada.

**Estado:** Implementación revisada en código.

### 791-CA3

No revelar si el usuario existe.

**Estado:** Implementación revisada en código.

### 791-CA4

Conservar el usuario y limpiar la contraseña tras el error.

**Estado:** Implementación revisada en código.

## AZ-792 — BUG21 - La validación de campos vacíos en login no indica qué debe corregirse

Implementación: `frontend/src/features/auth/hooks/useLoginForm.ts`, `frontend/src/features/auth/hooks/useRegisterForm.ts`, `frontend/src/features/auth/components/AuthProvider.tsx`, `backend/app/modules/auth/service.py`, `backend/tests/integration/test_workflows.py`

### 792-CA1

Mostrar un mensaje de obligatoriedad asociado a cada campo vacío.

**Estado:** Implementación revisada en código.

### 792-CA2

Mantener el aviso general como resumen, sin sustituir los mensajes de campo.

**Estado:** Implementación revisada en código.

### 792-CA3

Llevar el foco al primer campo inválido.

**Estado:** Implementación revisada en código.

### 792-CA4

No enviar una petición de autenticación con campos obligatorios vacíos.

**Estado:** Implementación revisada en código.

## AZ-793 — BUG22 - Los formularios de registro y acceso no señalan visualmente los campos obligatorios

Implementación: `frontend/src/features/auth/hooks/useLoginForm.ts`, `frontend/src/features/auth/hooks/useRegisterForm.ts`, `frontend/src/features/auth/components/AuthProvider.tsx`, `backend/app/modules/auth/service.py`, `backend/tests/integration/test_workflows.py`

### 793-CA1

Señalizar los campos requeridos de forma consistente.

**Estado:** Implementación revisada en código.

### 793-CA2

Explicar el significado del indicador cuando se utilice asterisco.

**Estado:** Implementación revisada en código.

### 793-CA3

Mantener la validación de obligatoriedad aunque el usuario no lea el indicador.

**Estado:** Implementación revisada en código.

### 793-CA4

Incluir la condición requerida en el nombre accesible de los controles.

**Estado:** Implementación revisada en código.

## AZ-794 — BUG23 - El registro exitoso inicia sesión automáticamente y omite la confirmación exigida

Implementación: `frontend/src/features/auth/hooks/useLoginForm.ts`, `frontend/src/features/auth/hooks/useRegisterForm.ts`, `frontend/src/features/auth/components/AuthProvider.tsx`, `backend/app/modules/auth/service.py`, `backend/tests/integration/test_workflows.py`

### 794-CA1

Mostrar una confirmación explícita de creación de cuenta.

**Estado:** Implementación revisada en código.

### 794-CA2

Redirigir a Iniciar sesión si se mantiene HU01 CA04.

**Estado:** Implementación revisada en código.

### 794-CA3

Si se aprueba el acceso automático, documentarlo y mostrar la confirmación antes o al entrar al catálogo.

**Estado:** Implementación revisada en código.

### 794-CA4

Evitar crear registros duplicados al reenviar el formulario.

**Estado:** Implementación revisada en código.

## AZ-795 — BUG24 - El aviso de bloqueo temporal no informa la duración ni cuándo reintentar

Implementación: `frontend/src/features/auth/hooks/useLoginForm.ts`, `frontend/src/features/auth/hooks/useRegisterForm.ts`, `frontend/src/features/auth/components/AuthProvider.tsx`, `backend/app/modules/auth/service.py`, `backend/tests/integration/test_workflows.py`

### 795-CA1

Informar de un bloqueo temporal con una duración o tiempo restante coherente con 15 minutos.

**Estado:** Implementación revisada en código.

### 795-CA2

Mantener el mensaje sin revelar datos adicionales de existencia de cuenta.

**Estado:** Implementación revisada en código.

### 795-CA3

Bloquear el acceso de esa cuenta durante el plazo configurado.

**Estado:** Implementación revisada en código.

### 795-CA4

Permitir reintentar al finalizar el plazo y verificar el comportamiento con una prueba temporizada.

**Estado:** Verificado en prueba específica.
**Prueba:** test_auth_sessions_lockout_and_profile: rechaza hasta 14:59, permite a los 15:01.

## AZ-797 — BUG26 - El cambio de contraseña conserva los tres campos tras un error de validación

Implementación: `frontend/src/lib/validations/password-change.ts`, `frontend/src/features/profile/components/PasswordModal.tsx`, `frontend/src/features/center-admin/components/ForcePasswordChangeModal.tsx`, `frontend/src/tests/password-change.test.ts`, `backend/app/modules/auth/service.py`

### 797-CA1

Limpiar los tres campos tras cada error de validación o autenticación de la clave actual.

**Estado:** Verificado en prueba específica.
**Prueba:** Contraseña actual incorrecta: error por campo, limpieza y clave vigente.

### 797-CA2

Restablecer el enmascaramiento de los campos al limpiarlos.

**Estado:** Verificado en prueba específica.
**Prueba:** Contraseña actual incorrecta: error por campo, limpieza y clave vigente.

### 797-CA3

Conservar un mensaje descriptivo de la regla fallida.

**Estado:** Verificado en prueba específica.
**Prueba:** Contraseña actual incorrecta: error por campo, limpieza y clave vigente.

### 797-CA4

Mantener la contraseña vigente sin alteración.

**Estado:** Verificado en prueba específica.
**Prueba:** Contraseña actual incorrecta: error por campo, limpieza y clave vigente.

## AZ-798 — BUG27 - El mensaje de nueva contraseña agrupa causas distintas y no identifica la regla fallida

Implementación: `frontend/src/lib/validations/password-change.ts`, `frontend/src/features/profile/components/PasswordModal.tsx`, `frontend/src/features/center-admin/components/ForcePasswordChangeModal.tsx`, `frontend/src/tests/password-change.test.ts`, `backend/app/modules/auth/service.py`

### 798-CA1

Mostrar La nueva contraseña no puede ser igual a la contraseña actual solo para igualdad.

**Estado:** Implementación revisada en código.

### 798-CA2

Identificar específicamente las reglas de complejidad incumplidas.

**Estado:** Implementación revisada en código.

### 798-CA3

Asociar el mensaje a Nueva Contraseña y resaltar su estado inválido.

**Estado:** Implementación revisada en código.

### 798-CA4

Mantener los errores de contraseña actual y confirmación separados de los de complejidad.

**Estado:** Verificado en prueba específica.
**Prueba:** Contraseña actual incorrecta: error por campo, limpieza y clave vigente.

## AZ-799 — BUG28 - La validación de obligatorios del cambio de contraseña aparece en inglés y como tooltip nativo

Implementación: `frontend/src/lib/validations/password-change.ts`, `frontend/src/features/profile/components/PasswordModal.tsx`, `frontend/src/features/center-admin/components/ForcePasswordChangeModal.tsx`, `frontend/src/tests/password-change.test.ts`, `backend/app/modules/auth/service.py`

### 799-CA1

Presentar mensajes de obligatoriedad en español dentro del formulario.

**Estado:** Implementación revisada en código.

### 799-CA2

Usar el mismo patrón visual para errores de cliente y servidor.

**Estado:** Verificado en prueba específica.
**Prueba:** Contraseña actual incorrecta: error por campo, limpieza y clave vigente.

### 799-CA3

Identificar el campo y mantener el foco en el primer requerido vacío.

**Estado:** Implementación revisada en código.

### 799-CA4

Aplicar el patrón también al cambio obligatorio de contraseña temporal.

**Estado:** Implementación revisada en código.

## AZ-800 — BUG29 - Las contraseñas del administrador de asilo son ilegibles al mostrarlas

Implementación: `frontend/src/lib/validations/password-change.ts`, `frontend/src/features/profile/components/PasswordModal.tsx`, `frontend/src/features/center-admin/components/ForcePasswordChangeModal.tsx`, `frontend/src/tests/password-change.test.ts`, `backend/app/modules/auth/service.py`

### 800-CA1

Usar colores de texto y fondo con contraste suficiente en los tres campos.

**Estado:** Implementación revisada en código.

### 800-CA2

Verificar tanto estado enmascarado como estado visible, foco y error.

**Estado:** Implementación revisada en código.

### 800-CA3

Mantener los estilos consistentes con el tema del modal.

**Estado:** Implementación revisada en código.

### 800-CA4

Comprobar la legibilidad en Chrome sobre Windows 11.

**Estado:** Pendiente de probar en Chrome sobre Windows 11.
**Límite:** Se probó Chromium en Ubuntu. Hace falta verificar Chrome sobre Windows 11 para satisfacer este criterio literal.

## AZ-801 — BUG30 - La ayuda del cambio temporal omite la minúscula requerida y usa cotejos sin validar la entrada

Implementación: `frontend/src/lib/validations/password-change.ts`, `frontend/src/features/profile/components/PasswordModal.tsx`, `frontend/src/features/center-admin/components/ForcePasswordChangeModal.tsx`, `frontend/src/tests/password-change.test.ts`, `backend/app/modules/auth/service.py`

### 801-CA1

Enumerar todas las reglas vigentes, incluyendo minúscula.

**Estado:** Implementación revisada en código.

### 801-CA2

Si los cotejos representan validación, actualizarlos de acuerdo con la entrada real.

**Estado:** Implementación revisada en código.

### 801-CA3

Si son solo decoración, sustituirlos por indicadores neutrales y aclarar su carácter informativo.

**Estado:** Implementación revisada en código.

### 801-CA4

Mantener coherencia entre ayuda, errores y política aplicada.

**Estado:** Implementación revisada en código.

## AZ-802 — BUG31 - El cambio temporal usa un aviso general en lugar de señalar Nueva contraseña

Implementación: `frontend/src/lib/validations/password-change.ts`, `frontend/src/features/profile/components/PasswordModal.tsx`, `frontend/src/features/center-admin/components/ForcePasswordChangeModal.tsx`, `frontend/src/tests/password-change.test.ts`, `backend/app/modules/auth/service.py`

### 802-CA1

Informar que falta un carácter especial junto a Nueva contraseña.

**Estado:** Implementación revisada en código.

### 802-CA2

Distinguir falta de complejidad, igualdad con temporal y confirmación diferente.

**Estado:** Implementación revisada en código.

### 802-CA3

Mantener el bloqueo de navegación mientras no se complete una actualización válida.

**Estado:** Implementación revisada en código.

### 802-CA4

Evitar que indicadores de ayuda contradigan el resultado de validación.

**Estado:** Implementación revisada en código.

## AZ-803 — BUG32 - El cambio de contraseña temporal no muestra la confirmación de bienvenida

Implementación: `frontend/src/lib/validations/password-change.ts`, `frontend/src/features/profile/components/PasswordModal.tsx`, `frontend/src/features/center-admin/components/ForcePasswordChangeModal.tsx`, `frontend/src/tests/password-change.test.ts`, `backend/app/modules/auth/service.py`

### 803-CA1

Mostrar una confirmación visible de contraseña actualizada.

**Estado:** Implementación revisada en código.

### 803-CA2

Redirigir al panel del centro asignado una vez finalizado el proceso.

**Estado:** Implementación revisada en código.

### 803-CA3

Permitir el siguiente inicio con la clave definitiva e impedir el uso de la temporal.

**Estado:** Implementación revisada en código.

### 803-CA4

Verificar por un medio técnico la desactivación de requiere_cambio_clave.

**Estado:** Implementación revisada en código.

## AZ-804 — BUG33 - Quitar la foto y guardar informa éxito, pero la imagen reaparece

Implementación: `frontend/src/features/profile/components/ProfileForm.tsx`, `frontend/src/features/profile/components/ContactSection.tsx`, `frontend/src/features/profile/components/CustomSelect.tsx`, `frontend/src/tests/profile-cancel.test.tsx`, `backend/app/modules/users/service.py`

### 804-CA1

Persistir la retirada de la referencia de foto.

**Estado:** Verificado en prueba específica.
**Prueba:** Cancelar y abandonar perfil no guardan borradores ni fotos.

### 804-CA2

Mostrar el avatar por defecto después del guardado, recarga y nuevo inicio de sesión.

**Estado:** Implementación revisada en código.

### 804-CA3

No restaurar la imagen desde una caché o un estado anterior.

**Estado:** Implementación revisada en código.

### 804-CA4

Mostrar éxito solo cuando el estado guardado sea el que se devuelve al consultar el perfil.

**Estado:** Implementación revisada en código.

## AZ-805 — BUG34 - El municipio no se adapta a la ciudad seleccionada y permite combinaciones incompatibles

Implementación: `frontend/src/features/profile/components/ProfileForm.tsx`, `frontend/src/features/profile/components/ContactSection.tsx`, `frontend/src/features/profile/components/CustomSelect.tsx`, `frontend/src/tests/profile-cancel.test.tsx`, `backend/app/modules/users/service.py`

### 805-CA1

Cargar los municipios correspondientes a la ciudad/provincia seleccionada.

**Estado:** Implementación revisada en código.

### 805-CA2

Limpiar o invalidar un municipio previo que no pertenezca al nuevo valor geográfico.

**Estado:** Implementación revisada en código.

### 805-CA3

Validar la relación también en el servidor.

**Estado:** Implementación revisada en código.

### 805-CA4

Rechazar combinaciones incompatibles con un mensaje junto al selector.

**Estado:** Implementación revisada en código.

## AZ-806 — BUG35 - Los cambios de ciudad y municipio no se conservan al volver al perfil

Implementación: `frontend/src/features/profile/components/ProfileForm.tsx`, `frontend/src/features/profile/components/ContactSection.tsx`, `frontend/src/features/profile/components/CustomSelect.tsx`, `frontend/src/tests/profile-cancel.test.tsx`, `backend/app/modules/users/service.py`

### 806-CA1

No emitir éxito si los valores solicitados no se guardaron.

**Estado:** Implementación revisada en código.

### 806-CA2

Persistir y recuperar una combinación geográfica válida sin restaurar valores anteriores.

**Estado:** Implementación revisada en código.

### 806-CA3

Rechazar de forma explícita una combinación inválida.

**Estado:** Implementación revisada en código.

### 806-CA4

Separar el diagnóstico de guardado del problema de dependencia de municipios.

**Estado:** Implementación revisada en código.

## AZ-808 — BUG37 - La pantalla de consulta del perfil no muestra el rol ni un modo de consulta separado

Implementación: `frontend/src/features/profile/components/ProfileForm.tsx`, `frontend/src/features/profile/components/ContactSection.tsx`, `frontend/src/features/profile/components/CustomSelect.tsx`, `frontend/src/tests/profile-cancel.test.tsx`, `backend/app/modules/users/service.py`

### 808-CA1

Mostrar el rol asignado junto a los datos de cuenta.

**Estado:** Implementación revisada en código.

### 808-CA2

Mantener un modo solo lectura y Editar perfil si sigue vigente HU14.

**Estado:** Implementación revisada en código.

### 808-CA3

Si se aprueba la pantalla unificada, actualizar el diseño y el criterio de consulta de HU14.

**Estado:** Implementación revisada en código.

### 808-CA4

No mostrar ningún valor de contraseña en la vista de perfil.

**Estado:** Implementación revisada en código.

## AZ-809 — BUG38 - La edición del perfil no ofrece Cancelar para descartar cambios

Implementación: `frontend/src/features/profile/components/ProfileForm.tsx`, `frontend/src/features/profile/components/ContactSection.tsx`, `frontend/src/features/profile/components/CustomSelect.tsx`, `frontend/src/tests/profile-cancel.test.tsx`, `backend/app/modules/users/service.py`

### 809-CA1

Incluir Cancelar sin cerrar la sesión.

**Estado:** Verificado en prueba específica.
**Prueba:** Cancelar y abandonar perfil no guardan borradores ni fotos.

### 809-CA2

Restaurar los valores persistidos y descartar el borrador al cancelar.

**Estado:** Verificado en prueba específica.
**Prueba:** Cancelar y abandonar perfil no guardan borradores ni fotos.

### 809-CA3

No guardar cambios parciales durante la cancelación.

**Estado:** Verificado en prueba específica.
**Prueba:** Cancelar y abandonar perfil no guardan borradores ni fotos.

### 809-CA4

Definir un aviso de cambios pendientes si se abandona la edición por navegación.

**Estado:** Verificado en prueba específica.
**Prueba:** Cancelar y abandonar perfil no guardan borradores ni fotos.

## AZ-810 — BUG39 - La cabecera muestra Servicios Verificado con concordancia incorrecta

Implementación: `frontend/src/components/shared/HeaderDesign.tsx`

### 810-CA1

Corregir la concordancia a Servicios verificados si ese es el significado aprobado.

**Estado:** Implementación revisada en código.

### 810-CA2

Precisar qué entidad o información está verificada.

**Estado:** Implementación revisada en código.

### 810-CA3

No mostrar un estado de verificación de servicio como si fuera un dato del perfil personal.

**Estado:** Implementación revisada en código.

### 810-CA4

Aplicar el texto corregido en todas las cabeceras compartidas.

**Estado:** Implementación revisada en código.

## AZ-811 — BUG40 - Las preguntas frecuentes anuncian citas y cancelaciones fuera del alcance de FamTree

Implementación: `frontend/src/app/(main)/support/page.tsx`

### 811-CA1

Alinear las FAQ con el alcance aprobado.

**Estado:** Implementación revisada en código.

### 811-CA2

Explicar el contacto externo con el centro si las visitas se acuerdan fuera de FamTree.

**Estado:** Implementación revisada en código.

### 811-CA3

Retirar instrucciones sobre controles o flujos inexistentes.

**Estado:** Implementación revisada en código.

### 811-CA4

Si las citas se incorporaron por cambio aprobado, actualizar las HUs y aportar sus pruebas.

**Estado:** Implementación revisada en código.

## AZ-812 — BUG41 - El filtro de precio no permite definir un mínimo ni un rango completo

Implementación: `frontend/src/features/asylums/components/Filter.tsx`, `frontend/src/features/asylums/hooks/useAsylums.ts`, `frontend/src/app/(main)/catalog/page.tsx`, `backend/tests/integration/test_discovery.py`

### 812-CA1

Proveer límites mínimo y máximo expresos en DOP si HU05 sigue vigente.

**Estado:** Verificado en prueba específica.
**Prueba:** Filtros: precios no negativos, umbral visible y limpieza.

### 812-CA2

Admitir valores numéricos mayores o iguales a 0.

**Estado:** Verificado en prueba específica.
**Prueba:** Filtros: precios no negativos, umbral visible y limpieza.

### 812-CA3

Validar que mínimo no supere máximo y comunicar el error junto al rango.

**Estado:** Verificado en prueba específica.
**Prueba:** Filtros: precios no negativos, umbral visible y limpieza.

### 812-CA4

Si se aprobó un filtro exclusivamente de máximo, documentar el cambio y sus límites.

**Estado:** Implementación revisada en código.

## AZ-813 — BUG42 - El filtro usa tipos de propiedad en lugar de las categorías de adulto mayor

Implementación: `frontend/src/features/asylums/components/Filter.tsx`, `frontend/src/features/asylums/hooks/useAsylums.ts`, `frontend/src/app/(main)/catalog/page.tsx`, `backend/tests/integration/test_discovery.py`

### 813-CA1

Presentar un grupo multiselección de Tipo de adulto mayor con las seis categorías de HU05.

**Estado:** Implementación revisada en código.

### 813-CA2

Vincular el filtro a los tipos de atención registrados por cada centro.

**Estado:** Implementación revisada en código.

### 813-CA3

Mantener Tipo de Propiedad solo si es un criterio adicional aprobado y claramente diferenciado.

**Estado:** Implementación revisada en código.

### 813-CA4

Aplicar todas las categorías seleccionadas según la lógica de filtrado acordada.

**Estado:** Implementación revisada en código.

## AZ-814 — BUG43 - El catálogo de servicios del filtro omite categorías clínicas definidas en la HU

Implementación: `frontend/src/features/asylums/components/Filter.tsx`, `frontend/src/features/asylums/hooks/useAsylums.ts`, `frontend/src/app/(main)/catalog/page.tsx`, `backend/tests/integration/test_discovery.py`

### 814-CA1

Ofrecer los nueve servicios definidos en HU05 si ese alcance se mantiene.

**Estado:** Implementación revisada en código.

### 814-CA2

Distinguir Fisioterapia de Terapia ocupacional.

**Estado:** Implementación revisada en código.

### 814-CA3

Usar las mismas categorías en gestión del centro, detalle, filtro y comparación.

**Estado:** Implementación revisada en código.

### 814-CA4

Documentar cualquier sustitución de categorías aprobada para evitar resultados incompatibles.

**Estado:** Implementación revisada en código.

## AZ-815 — BUG44 - Desactivar un asilo cambia su estado sin confirmación previa

Implementación: `frontend/src/features/admin/components/Centers.tsx`, `frontend/src/features/admin/components/CenterForm.tsx`, `frontend/src/features/admin/components/CenterDetailsModal.tsx`, `backend/app/modules/asylums/management_service.py`

### 815-CA1

Abrir un diálogo antes de modificar el estado.

**Estado:** Implementación revisada en código.

### 815-CA2

Identificar el centro y explicar que desaparecerá de catálogo, búsquedas y mapa, y permanecerá no disponible en favoritos.

**Estado:** Verificado en prueba específica.
**Prueba:** Asilo desactivado permanece en Guardados como No disponible.

### 815-CA3

Ofrecer Confirmar desactivación y Cancelar.

**Estado:** Implementación revisada en código.

### 815-CA4

Cambiar el estado únicamente después de confirmar y mantenerlo intacto al cancelar.

**Estado:** Implementación revisada en código.

## AZ-816 — BUG45 - La confirmación de cambio de estado del asilo no identifica acción ni centro

Implementación: `frontend/src/features/admin/components/Centers.tsx`, `frontend/src/features/admin/components/CenterForm.tsx`, `frontend/src/features/admin/components/CenterDetailsModal.tsx`, `backend/app/modules/asylums/management_service.py`

### 816-CA1

Mostrar Residencia San José ha sido desactivada o un mensaje equivalente con centro y estado final.

**Estado:** Implementación revisada en código.

### 816-CA2

Mantener el badge de la misma fila sincronizado.

**Estado:** Implementación revisada en código.

### 816-CA3

Usar mensajes diferentes para activar, desactivar, fallo y cancelación.

**Estado:** Implementación revisada en código.

## AZ-817 — BUG46 - Las acciones de asilos se representan con iconos sin etiqueta visible

Implementación: `frontend/src/features/admin/components/Centers.tsx`, `frontend/src/features/admin/components/CenterForm.tsx`, `frontend/src/features/admin/components/CenterDetailsModal.tsx`, `backend/app/modules/asylums/management_service.py`

### 817-CA1

Añadir etiquetas Ver detalle, Editar y Activar/Desactivar, o un menú de acciones identificado.

**Estado:** Implementación revisada en código.

### 817-CA2

Incluir ayudas al pasar el puntero y nombres accesibles.

**Estado:** Implementación revisada en código.

### 817-CA3

Diferenciar la acción de cambio de estado de la de edición.

**Estado:** Implementación revisada en código.

### 817-CA4

Asegurar que la acción siempre corresponde al estado de esa fila.

**Estado:** Implementación revisada en código.

## AZ-818 — BUG47 - El detalle administrativo omite servicios, tipos de atención y contacto institucional

Implementación: `frontend/src/features/admin/components/Centers.tsx`, `frontend/src/features/admin/components/CenterForm.tsx`, `frontend/src/features/admin/components/CenterDetailsModal.tsx`, `backend/app/modules/asylums/management_service.py`

### 818-CA1

Mostrar los atributos de la ficha completa o enlazar explícitamente a ella.

**Estado:** Implementación revisada en código.

### 818-CA2

Incluir teléfono, correo, web, servicios, tipos de atención y requisitos con valores del centro.

**Estado:** Implementación revisada en código.

### 818-CA3

Identificar datos no informados.

**Estado:** Implementación revisada en código.

### 818-CA4

Mantener separadas la consulta institucional y la cuenta del administrador asignado.

**Estado:** Implementación revisada en código.

## AZ-819 — BUG48 — La edición de asilo no indica límites de texto junto a los campos

Implementación: `frontend/src/features/admin/components/Centers.tsx`, `frontend/src/features/admin/components/CenterForm.tsx`, `frontend/src/features/admin/components/CenterDetailsModal.tsx`, `backend/app/modules/asylums/management_service.py`

### 819-CA1

Mostrar ayuda 5–100 para nombre, 20–1000 para descripción, máximo 100 para sector y 200 para dirección.

**Estado:** Implementación revisada en código.

### 819-CA2

Mostrar 10–500 para requisitos y máximo 250 para certificaciones.

**Estado:** Implementación revisada en código.

### 819-CA3

Identificar obligatorios y opcionales.

**Estado:** Implementación revisada en código.

### 819-CA4

Actualizar un contador o error de longitud junto al campo correspondiente.

**Estado:** Implementación revisada en código.

## AZ-820 — BUG49 - El error de edición menciona rangos de fechas en un formulario sin fechas

Implementación: `frontend/src/features/admin/components/Centers.tsx`, `frontend/src/features/admin/components/CenterForm.tsx`, `frontend/src/features/admin/components/CenterDetailsModal.tsx`, `backend/app/modules/asylums/management_service.py`

### 820-CA1

Mostrar Ingresa un correo institucional válido junto a Correo institucional para ese caso.

**Estado:** Implementación revisada en código.

### 820-CA2

Enumerar solamente errores realmente encontrados.

**Estado:** Implementación revisada en código.

### 820-CA3

Retirar la referencia a fechas del formulario de asilos.

**Estado:** Implementación revisada en código.

### 820-CA4

Conservar valores válidos y orientar hacia el primer campo inválido.

**Estado:** Implementación revisada en código.

## AZ-821 — BUG50 - La falta de servicios o atención se comunica con un aviso combinado lejos de los grupos

Implementación: `frontend/src/features/admin/components/Centers.tsx`, `frontend/src/features/admin/components/CenterForm.tsx`, `frontend/src/features/admin/components/CenterDetailsModal.tsx`, `backend/app/modules/asylums/management_service.py`

### 821-CA1

Validar cada grupo por separado.

**Estado:** Implementación revisada en código.

### 821-CA2

Mostrar Selecciona al menos un servicio junto a Servicios y Selecciona al menos un tipo de atención solo si ese grupo también falla.

**Estado:** Implementación revisada en código.

### 821-CA3

Marcar visualmente el grupo inválido y hacerlo accesible.

**Estado:** Implementación revisada en código.

### 821-CA4

Mantener las demás selecciones y no guardar hasta corregir.

**Estado:** Implementación revisada en código.

## AZ-824 — BUG51 - Los indicadores no explican si el período filtra altas o el estado actual

Implementación: `frontend/src/features/admin/components/Dashboard.tsx`, `frontend/src/features/admin/components/AdminUI.tsx`, `backend/app/modules/reports/repository.py`

### 824-CA1

Definir si cada KPI mide un stock actual o altas/eventos del período.

**Estado:** Verificado en prueba específica.
**Prueba:** Atajos de período consultan intervalos distintos y muestran definición.

### 824-CA2

Usar etiquetas como Asilos registrados en el período que están activos cuando ese sea el cálculo.

**Estado:** Verificado en prueba específica.
**Prueba:** Atajos de período consultan intervalos distintos y muestran definición.

### 824-CA3

Separar el total operativo actual de los eventos del período si ambos se necesitan.

**Estado:** Verificado en prueba específica.
**Prueba:** Atajos de período consultan intervalos distintos y muestran definición.

### 824-CA4

Mostrar período aplicado, fecha de actualización y definición accesible de cada indicador.

**Estado:** Verificado en prueba específica.
**Prueba:** Atajos de período consultan intervalos distintos y muestran definición.

## AZ-825 — BUG52 - El gráfico de calificaciones queda vacío sin explicación cuando el período no tiene datos

Implementación: `frontend/src/features/admin/components/Dashboard.tsx`, `frontend/src/features/admin/components/AdminUI.tsx`, `backend/app/modules/reports/repository.py`

### 825-CA1

Mostrar un mensaje de ausencia de datos en cada gráfico vacío.

**Estado:** Implementación revisada en código.

### 825-CA2

Distinguir un resultado sin registros de un error de carga.

**Estado:** Verificado en prueba específica.
**Prueba:** Fallos del dashboard se distinguen de un período sin registros.

### 825-CA3

Ofrecer Todo el historial para recuperar la vista general.

**Estado:** Implementación revisada en código.

## AZ-826 — BUG53 - El reporte de centros expone provinceId en vez del nombre de la provincia

Implementación: `backend/app/modules/reports/service.py`, `backend/app/modules/reports/presentation.py`, `frontend/src/features/admin/components/Reports.tsx`, `backend/tests/unit/test_media_and_exports.py`

### 826-CA1

Mostrar Provincia con su nombre legible en tabla y archivo.

**Estado:** Verificado en prueba específica.
**Prueba:** Provincia Santiago legible en tabla, PDF y CSV.

### 826-CA2

Conservar el ID solo como columna adicional si es útil para auditoría.

**Estado:** Implementación revisada en código.

### 826-CA3

Mostrar el filtro aplicado con Santiago, no únicamente 29.

**Estado:** Verificado en prueba específica.
**Prueba:** Provincia Santiago legible en tabla, PDF y CSV.

### 826-CA4

Verificar correspondencia entre ID y nombre.

**Estado:** Verificado en prueba específica.
**Prueba:** Provincia Santiago legible en tabla, PDF y CSV.

## AZ-827 — BUG54 - Las columnas de cuentas exponen firstName, lastName y códigos de rol internos

Implementación: `backend/app/modules/reports/service.py`, `backend/app/modules/reports/presentation.py`, `frontend/src/features/admin/components/Reports.tsx`, `backend/tests/unit/test_media_and_exports.py`

### 827-CA1

Usar Nombre, Apellido y Rol con etiquetas legibles.

**Estado:** Implementación revisada en código.

### 827-CA2

Mostrar Usuario registrado, Administrador de asilo y Administrador del sistema.

**Estado:** Implementación revisada en código.

### 827-CA3

Mantener un mapeo único entre interfaz, PDF y CSV.

**Estado:** Implementación revisada en código.

### 827-CA4

No usar claves técnicas como sustituto del significado del dato.

**Estado:** Implementación revisada en código.

## AZ-828 — BUG55 - El PDF conserva un título de documento anónimo en el visor

Implementación: `backend/app/modules/reports/service.py`, `backend/app/modules/reports/presentation.py`, `frontend/src/features/admin/components/Reports.tsx`, `backend/tests/unit/test_media_and_exports.py`

### 828-CA1

Definir un título PDF descriptivo con tipo de reporte.

**Estado:** Verificado en prueba específica.
**Prueba:** Provincia Santiago legible en tabla, PDF y CSV.

### 828-CA2

Incluir metadatos de autor institucional y fecha de generación cuando corresponda.

**Estado:** Verificado en prueba específica.
**Prueba:** Provincia Santiago legible en tabla, PDF y CSV.

### 828-CA3

Mantener una convención de nombre de archivo consistente.

**Estado:** Implementación revisada en código.

## AZ-829 — BUG56 - Desbloquear una cuenta actúa sin modal ni motivo original visible

Implementación: `frontend/src/features/admin/components/Users.tsx`, `backend/app/modules/administration/service.py`, `backend/tests/integration/test_workflows.py`

### 829-CA1

Abrir una confirmación con nombre, correo y razón original del bloqueo.

**Estado:** Implementación revisada en código.

### 829-CA2

Explicar que la cuenta recuperará el acceso y ofrecer Confirmar desbloqueo / Cancelar.

**Estado:** Implementación revisada en código.

### 829-CA3

Mantener el bloqueo al cancelar.

**Estado:** Implementación revisada en código.

### 829-CA4

Registrar el desbloqueo solo al confirmar y actualizar la fila.

**Estado:** Implementación revisada en código.

## AZ-830 — BUG57 - Bloquear y desbloquear producen el mismo aviso genérico

Implementación: `frontend/src/features/admin/components/Users.tsx`, `backend/app/modules/administration/service.py`, `backend/tests/integration/test_workflows.py`

### 830-CA1

Mostrar La cuenta @ngomez ha sido bloqueada y una confirmación diferente para desbloqueo.

**Estado:** Implementación revisada en código.

### 830-CA2

Identificar el usuario afectado y su estado final.

**Estado:** Implementación revisada en código.

### 830-CA3

Conservar la tabla, búsqueda y filtros salvo que el nuevo estado deje de coincidir con ellos.

**Estado:** Implementación revisada en código.

## AZ-831 — BUG58 - La vista de moderación omite la fecha de publicación de la reseña

Implementación: `frontend/src/features/admin/components/Moderation.tsx`, `frontend/src/features/admin/components/Audit.tsx`, `backend/app/modules/reviews/service.py`, `backend/tests/unit/test_moderation_identity.py`, `backend/tests/integration/test_workflows.py`

### 831-CA1

Presentar fecha de publicación de la reseña separada de fecha del reporte.

**Estado:** Implementación revisada en código.

### 831-CA2

Mantener autor, calificación, comentario, asilo y denunciante completos.

**Estado:** Implementación revisada en código.

### 831-CA3

Mostrar fechas con formato legible y contexto temporal.

**Estado:** Implementación revisada en código.

## AZ-832 — BUG59 - La resolución consultada no identifica al moderador responsable

Implementación: `frontend/src/features/admin/components/Moderation.tsx`, `frontend/src/features/admin/components/Audit.tsx`, `backend/app/modules/reviews/service.py`, `backend/tests/unit/test_moderation_identity.py`, `backend/tests/integration/test_workflows.py`

### 832-CA1

Mostrar nombre/usuario e ID del moderador en la resolución.

**Estado:** Implementación revisada en código.

### 832-CA2

Conservar la justificación histórica y fecha/hora.

**Estado:** Implementación revisada en código.

### 832-CA3

Mantener el modo de consulta sin permitir modificar una resolución ya cerrada.

**Estado:** Implementación revisada en código.

## AZ-774 — BUG60 - Auditoría usa un ID de moderador sin identificación legible

Implementación: `frontend/src/features/admin/components/Moderation.tsx`, `frontend/src/features/admin/components/Audit.tsx`, `backend/app/modules/reviews/service.py`, `backend/tests/unit/test_moderation_identity.py`, `backend/tests/integration/test_workflows.py`

### 774-CA1

Mostrar nombre o usuario del moderador junto a su ID.

**Estado:** Verificado en prueba específica.
**Prueba:** Detalle de auditoría identifica actor, acción, entidad y justificación.

### 774-CA2

Mantener la atribución histórica aunque cambie el perfil actual.

**Estado:** Verificado en prueba específica.
**Prueba:** Atribución histórica tras cambiar el nombre; lectura de username estable para eventos antiguos sin reescribir el registro.

### 774-CA3

Ofrecer un detalle del evento con actor, acción, entidad y justificación.

**Estado:** Verificado en prueba específica.
**Prueba:** Detalle de auditoría identifica actor, acción, entidad y justificación.
