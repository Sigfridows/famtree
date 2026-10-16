# FamTree — Guía de capturas según los criterios de aceptación

Esta guía sustituye las instrucciones y capturas anteriores. Los criterios del CSV tienen prioridad sobre las decisiones previas del chat. El aviso de favoritos vuelve a ser un modal de la aplicación; el registro confirma la cuenta y abre Iniciar sesión.

## Antes de empezar

- Aplicación local: http://localhost:3000.
- Usa una ventana privada para los casos de visitante. Para cambiar de rol, cierra sesión y entra con la cuenta correspondiente.
- Panel de sistema: `/system-admin`. Panel de asilo: `/center-admin/asylum`.
- Para BUG29–32 necesitas una cuenta de administrador de asilo que aún tenga cambio de clave temporal pendiente. Un administrador del sistema puede crearla en Usuarios y obtener la clave temporal.
- No captures contraseñas reales; para demostrar contraste usa texto ficticio y evita enviarlo como si fuera una clave válida.
- No existe una captura universal por bug. Algunos criterios requieren dos momentos, dos vistas del mismo centro o una comprobación técnica.
- Los estados de Azure no se modificaron. BUG25 / AZ-796 y BUG36 / AZ-807 permanecen excluidos porque figuran como Removed. AZ-155 no tiene criterios verificables ni identifica la pantalla.

## Qué está comprobado

Se revisaron 222 criterios de 58 bugs activos. La matriz separada distingue revisión de implementación de prueba específica; no se declara que una captura pruebe permisos, persistencia o todas las variantes. La prueba literal de Chrome sobre Windows 11 (AZ-800, CA4) queda pendiente en ese entorno. Las pruebas de este equipo se ejecutaron con Chromium en Ubuntu.

## AZ-770 — BUG01 - El aviso de favoritos para visitantes usa una alerta nativa sin accesos a autenticación

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Visitante  
**Pantalla:** `/catalog`

**Pasos:** Sin sesión, pulsa el corazón de una residencia.

**Captura:** Modal completo con explicación, Iniciar sesión, Registrarse y cierre. No debe abrirse login automáticamente.

**Comprobación adicional:** Cierra el aviso: debes seguir en el catálogo y el corazón no debe quedar guardado.

## AZ-771 — BUG02 - Guardados presenta una lista personal vacía a un visitante sin explicar la restricción

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Visitante  
**Pantalla:** `/catalog`

**Pasos:** Sin sesión, pulsa Guardados.

**Captura:** Aviso de autenticación encima del catálogo con ambas opciones de acceso.

**Comprobación adicional:** Cierra el aviso y comprueba que conserva el catálogo, sin lista personal vacía.

## AZ-772 — BUG03 - La campana y el panel de notificaciones se muestran sin autenticación

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Visitante y usuario registrado  
**Pantalla:** `/catalog; /notifications`

**Pasos:** Visita el catálogo sin sesión; después escribe /notifications directamente.

**Captura:** Catálogo sin campana; login al intentar entrar a la ruta privada.

**Comprobación adicional:** Con sesión, abre la bandeja; cierra sesión y comprueba que no quedan datos personales.

## AZ-773 — BUG04 - La comparación pública exige guardar otro asilo en favoritos y bloquea al visitante

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Visitante  
**Pantalla:** `/catalog`

**Pasos:** Abre una ficha, pulsa Comparar y marca dos centros; repite con tres y cuatro.

**Captura:** Selección con Comparar (2/4) o (4/4); tabla final comparando los centros.

**Comprobación adicional:** Con cero o uno no debe habilitarse Comparar; al tener cuatro el quinto debe estar deshabilitado.

## AZ-776 — BUG05 - La columna Provincia de la selección comparativa muestra una dirección de calle

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Visitante  
**Pantalla:** `/catalog`

**Pasos:** Abre una ficha y pulsa Comparar. Marca Casa Jardines de Baní y Casa Serena del Caribe.

**Captura:** SELECCIÓN previa a comparar: encabezado Provincia y valores Peravia y Puerto Plata, no calles.

**Comprobación adicional:** Esta es la vista de BUG05. No captures la tabla final de servicios; ahí no está la columna Provincia.

## AZ-777 — BUG06 - La ficha de asilo omite provincia, municipio y sector de la dirección

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Visitante  
**Pantalla:** `/catalog`

**Pasos:** Abre Residencia San José. Repite desde /map.

**Captura:** Provincia, Municipio, Sector y Dirección específica del mismo centro.

**Comprobación adicional:** Comprueba que ambas entradas muestran la misma ubicación; si un dato falta debe decir No informado.

## AZ-778 — BUG07 - La ficha pública no presenta capacidad ni requisitos de ingreso

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Visitante  
**Pantalla:** `/catalog; /map`

**Pasos:** Abre el mismo centro desde ambos accesos y desplázate a Requisitos de ingreso.

**Captura:** Capacidad total con unidad y requisitos, separados de la descripción.

**Comprobación adicional:** Los datos ausentes deben tener un estado explícito, no desaparecer sin explicación.

## AZ-779 — BUG08 - Los distintivos Verificado y Seguro no muestran certificaciones ni fecha de actualización

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Visitante  
**Pantalla:** `/catalog`

**Pasos:** Abre Residencia San José y localiza Certificaciones declaradas.

**Captura:** Certificaciones y Última actualización, sin Seguro/Verificado sin respaldo.

**Comprobación adicional:** Para un centro sin certificaciones debe decir Sin certificaciones declaradas.

## AZ-780 — BUG09 - La ficha omite el acceso al sitio web registrado del asilo

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Visitante  
**Pantalla:** `/catalog`

**Pasos:** Abre una residencia con sitio web registrado y pulsa su enlace.

**Captura:** Sitio web visible en la ficha y página abierta en otra pestaña.

**Comprobación adicional:** Prueba también teléfono y correo; un sitio vacío o inválido no debe generar enlace.

## AZ-781 — BUG10 - El detalle no ofrece un mapa individual de la ubicación del centro

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Visitante  
**Pantalla:** `/catalog`

**Pasos:** Abre una ficha y baja a Ubicación en el mapa.

**Captura:** Mapa individual, un marcador y controles de zoom.

**Comprobación adicional:** La variante sin coordenadas se prueba técnicamente con una respuesta simulada; no alteres un centro real solo para capturarla.

## AZ-782 — BUG11 - El detalle abierto desde el mapa pierde el precio máximo mensual

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Visitante  
**Pantalla:** `/catalog; /map`

**Pasos:** Abre Casa Jardines de Baní desde catálogo y después desde mapa.

**Captura:** Dos capturas del MISMO centro, mostrando RD$20,000–36,000 por mes.

**Comprobación adicional:** No compares capturas de instituciones diferentes; los dos precios deben coincidir.

## AZ-783 — BUG12 - El detalle desde el mapa omite servicios y tipos de cuidado visibles en catálogo

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Visitante  
**Pantalla:** `/catalog; /map`

**Pasos:** Abre el mismo centro desde ambos accesos y ve a cuidado/servicios.

**Captura:** Dos capturas con las mismas categorías del MISMO centro.

**Comprobación adicional:** Una respuesta sin categorías debe explicarlo; no debe confundirse con Cargando.

## AZ-784 — BUG13 - Al alejar el mapa quedan grandes áreas grises y una franja cartográfica incompleta

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Visitante  
**Pantalla:** `/map`

**Pasos:** Aleja y acerca el mapa dentro de sus límites. Para el fallo, bloquea temporalmente las peticiones tile.openstreetmap.org en DevTools.

**Captura:** Mapa completo sin franjas grises; aviso de fallo con Reintentar si bloqueaste teselas.

**Comprobación adicional:** Quita el bloqueo antes de pulsar Reintentar y comprueba que vuelven a cargar.

## AZ-785 — BUG14 - El encuadre inicial del mapa se limita al entorno de Santo Domingo

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Visitante  
**Pantalla:** `/map`

**Pasos:** Entra al mapa; selecciona un marcador y pulsa Ver República Dominicana.

**Captura:** Vista inicial del territorio dominicano con marcadores y botón de vista general.

**Comprobación adicional:** Comprueba que puedes volver al encuadre general después de acercarte.

## AZ-786 — BUG15 - El resumen lateral del mapa omite foto, municipio/provincia y rango mensual

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Visitante  
**Pantalla:** `/map`

**Pasos:** Selecciona un marcador y revisa el resumen lateral; prueba Cerrar selección.

**Captura:** Marcador resaltado y resumen con foto, nombre, municipio/provincia, rango mensual, calificación y Ver Detalle.

**Comprobación adicional:** Se mantiene el resumen lateral; no se requiere un popup distinto.

## AZ-787 — BUG16 - Dar Reseña desde un asilo muestra opiniones de otros centros

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Visitante y usuario registrado  
**Pantalla:** `/catalog → /review`

**Pasos:** Desde una ficha pulsa Dar Reseña; sin sesión pulsa Iniciar sesión y entra.

**Captura:** Cabecera y formulario identificando el centro de origen; reseñas solo de ese centro.

**Comprobación adicional:** Después del login debes volver al mismo asilo, no a la sección general.

## AZ-788 — BUG17 - No se presenta el resumen de reseñas por centro ni la distribución de estrellas

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Visitante  
**Pantalla:** `/review?asylumId=ID`

**Pasos:** Entra desde un asilo con reseñas. Si tienes sesión, alterna Mis Reseñas.

**Captura:** Promedio, total y distribución de 1 a 5 del mismo conjunto visible.

**Comprobación adicional:** Un conjunto vacío debe explicarse; no debe presentar un promedio inventado.

## AZ-789 — BUG18 - Faltan controles para ordenar por precio y nombre en el catálogo

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Visitante  
**Pantalla:** `/catalog`

**Pasos:** Prueba Nombre A–Z, Nombre Z–A, Menor precio, Mayor precio y Mejor calificación; aplica un filtro después.

**Captura:** Control de orden seleccionado y primeras tarjetas coherentes con ese orden.

**Comprobación adicional:** Conservar el orden al cambiar filtros/páginas requiere la secuencia; una captura no demuestra las cinco opciones.

## AZ-790 — BUG19 - Calificación mínima se reduce a un interruptor sin indicar el umbral aplicado

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Visitante  
**Pantalla:** `/catalog`

**Pasos:** Filtros → Calificación mínima 4 → Aplicar selección; vuelve a abrir el panel.

**Captura:** Umbral de cuatro estrellas visible en panel y texto Filtro aplicado, con resultados de al menos cuatro.

**Comprobación adicional:** Restablece los filtros y comprueba que desaparece el umbral y vuelven los demás centros.

## AZ-791 — BUG20 - El inicio de sesión interpreta credenciales incorrectas como fin de sesión

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Visitante  
**Pantalla:** `/login`

**Pasos:** Escribe un usuario y una contraseña incorrecta; envía.

**Captura:** Error de credenciales, usuario conservado y contraseña vacía.

**Comprobación adicional:** No debe decir que terminó una sesión ni revelar si la cuenta existe.

## AZ-792 — BUG21 - La validación de campos vacíos en login no indica qué debe corregirse

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Visitante  
**Pantalla:** `/login`

**Pasos:** Envía el formulario vacío.

**Captura:** Errores de obligatoriedad bajo Usuario y Contraseña y resumen general.

**Comprobación adicional:** El foco debe ir al primer requerido; no debe haber solicitud de login con vacíos.

## AZ-793 — BUG22 - Los formularios de registro y acceso no señalan visualmente los campos obligatorios

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Visitante  
**Pantalla:** `/register; /login`

**Pasos:** Abre ambos formularios sin enviar.

**Captura:** Indicadores de requeridos y aclaración del asterisco.

**Comprobación adicional:** La validación y los nombres accesibles se comprueban técnicamente además de la imagen.

## AZ-794 — BUG23 - El registro exitoso inicia sesión automáticamente y omite la confirmación exigida

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Visitante  
**Pantalla:** `/register`

**Pasos:** Registra una cuenta nueva válida y espera la respuesta.

**Captura:** Confirmación Tu cuenta se creó correctamente en la página de login.

**Comprobación adicional:** No debe iniciar sesión automáticamente ni crear duplicados al reenviar.

## AZ-795 — BUG24 - El aviso de bloqueo temporal no informa la duración ni cuándo reintentar

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Visitante con cuenta de prueba  
**Pantalla:** `/login`

**Pasos:** Haz cinco intentos fallidos con una cuenta de prueba y vuelve a intentar.

**Captura:** Mensaje de bloqueo temporal con plazo de hasta quince minutos.

**Comprobación adicional:** La prueba automatizada usa reloj controlado. Para evidencia manual completa, espera el plazo y captura el acceso posterior; no uses una cuenta del equipo.

## AZ-797 — BUG26 - El cambio de contraseña conserva los tres campos tras un error de validación

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Usuario registrado  
**Pantalla:** `/profile`

**Pasos:** Cambiar contraseña: escribe una nueva sin complejidad, envía. Repite con contraseña actual errónea y nueva válida.

**Captura:** Tres campos vacíos y regla fallida conservada; campos enmascarados.

**Comprobación adicional:** La contraseña anterior debe seguir funcionando después del error.

## AZ-798 — BUG27 - El mensaje de nueva contraseña agrupa causas distintas y no identifica la regla fallida

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Usuario registrado  
**Pantalla:** `/profile`

**Pasos:** Cambiar contraseña: prueba igualdad, falta de símbolo y confirmación distinta, por separado.

**Captura:** Mensaje específico junto al campo correcto en cada variante.

**Comprobación adicional:** No uses una misma captura para afirmar que se probaron todas las reglas.

## AZ-799 — BUG28 - La validación de obligatorios del cambio de contraseña aparece en inglés y como tooltip nativo

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Usuario registrado y administrador de asilo con clave temporal  
**Pantalla:** `/profile; /center-admin/asylum`

**Pasos:** Envía ambos formularios de cambio de contraseña vacíos.

**Captura:** Mensajes en español dentro del formulario, junto a cada campo requerido.

**Comprobación adicional:** El foco debe ir al primero; no debe aparecer un tooltip nativo en inglés.

## AZ-800 — BUG29 - Las contraseñas del administrador de asilo son ilegibles al mostrarlas

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Administrador de asilo con clave temporal  
**Pantalla:** `/center-admin/asylum`

**Pasos:** En Chrome sobre Windows 11, escribe texto ficticio y alterna los ojos de los tres campos.

**Captura:** Texto visible legible sobre el fondo claro; captura también foco/error si se exige.

**Comprobación adicional:** No captures contraseñas reales. Windows 11 requiere comprobación manual en ese sistema; aquí se comprobó Chromium en Ubuntu.

## AZ-801 — BUG30 - La ayuda del cambio temporal omite la minúscula requerida y usa cotejos sin validar la entrada

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Administrador de asilo con clave temporal  
**Pantalla:** `/center-admin/asylum`

**Pasos:** Abre el cambio obligatorio y prueba una nueva sin minúscula; después una con todas las reglas.

**Captura:** Ayuda que menciona minúsculas y estado de indicadores coherente con la entrada.

**Comprobación adicional:** Los cotejos no deben presentarse como aprobados cuando la entrada no cumple.

## AZ-802 — BUG31 - El cambio temporal usa un aviso general en lugar de señalar Nueva contraseña

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Administrador de asilo con clave temporal  
**Pantalla:** `/center-admin/asylum`

**Pasos:** Introduce una nueva contraseña sin símbolo y envía; prueba igualdad y confirmación diferente por separado.

**Captura:** Error de carácter especial bajo Nueva contraseña, no solo un aviso general.

**Comprobación adicional:** La navegación al panel debe seguir bloqueada hasta completar un cambio válido.

## AZ-803 — BUG32 - El cambio de contraseña temporal no muestra la confirmación de bienvenida

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Administrador de asilo con clave temporal  
**Pantalla:** `/center-admin/asylum`

**Pasos:** Completa un cambio válido con una contraseña definitiva.

**Captura:** Bienvenida/confirmación en el panel del centro asignado.

**Comprobación adicional:** Después prueba login con definitiva y rechazo de temporal; no captures ni compartas ninguna de las dos claves.

## AZ-804 — BUG33 - Quitar la foto y guardar informa éxito, pero la imagen reaparece

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Usuario registrado  
**Pantalla:** `/profile`

**Pasos:** Editar perfil: sube una foto y guarda. Luego vuelve a editar, pulsa Quitar y Guarda cambios; recarga y entra de nuevo.

**Captura:** Avatar por defecto tras guardado, recarga y nuevo login.

**Comprobación adicional:** Quitar es un borrador hasta Guardar; cancelar debe conservar la foto anterior.

## AZ-805 — BUG34 - El municipio no se adapta a la ciudad seleccionada y permite combinaciones incompatibles

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Usuario registrado  
**Pantalla:** `/profile`

**Pasos:** Editar perfil con Azua/municipio seleccionado: cambia Ciudad a Santiago y abre Municipio.

**Captura:** Municipio anterior vacío y lista únicamente con municipios de Santiago.

**Comprobación adicional:** El servidor también rechaza combinaciones incompatibles; eso se prueba por API.

## AZ-806 — BUG35 - Los cambios de ciudad y municipio no se conservan al volver al perfil

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Usuario registrado  
**Pantalla:** `/profile`

**Pasos:** Selecciona Santiago y Santiago de los Caballeros, guarda, sal del perfil y vuelve o recarga.

**Captura:** Ambos valores recuperados después de guardar y volver.

**Comprobación adicional:** No basta una captura del borrador antes de Guardar.

## AZ-808 — BUG37 - La pantalla de consulta del perfil no muestra el rol ni un modo de consulta separado

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Usuario registrado  
**Pantalla:** `/profile`

**Pasos:** Entra al perfil sin pulsar Editar perfil.

**Captura:** Rol visible, datos en consulta y acción Editar perfil.

**Comprobación adicional:** No debe mostrarse ningún valor de contraseña.

## AZ-809 — BUG38 - La edición del perfil no ofrece Cancelar para descartar cambios

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Usuario registrado  
**Pantalla:** `/profile`

**Pasos:** Editar perfil: cambia nombre/foto sin guardar; prueba salir y después Cancelar.

**Captura:** Aviso Cambios sin guardar; otra captura del perfil con datos anteriores restaurados tras Cancelar.

**Comprobación adicional:** Cancelar no cierra sesión ni guarda foto, nombre o ubicación del borrador.

## AZ-810 — BUG39 - La cabecera muestra Servicios Verificado con concordancia incorrecta

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Cualquier rol con cabecera compartida  
**Pantalla:** `/catalog; /profile`

**Pasos:** Mira las cabeceras de catálogo y perfil.

**Captura:** Información de residencias, sin la afirmación Servicios Verificado.

**Comprobación adicional:** No se afirma una verificación que el sistema no realiza.

## AZ-811 — BUG40 - Las preguntas frecuentes anuncian citas y cancelaciones fuera del alcance de FamTree

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Visitante  
**Pantalla:** `/support`

**Pasos:** Abre las respuestas sobre visitas y cancelaciones.

**Captura:** Texto que explica contacto externo con el centro.

**Comprobación adicional:** No deben mencionarse botones Solicitar cita, Mis solicitudes ni plazos internos inexistentes.

## AZ-812 — BUG41 - El filtro de precio no permite definir un mínimo ni un rango completo

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Visitante  
**Pantalla:** `/catalog`

**Pasos:** Filtros: escribe mínimo 50000 y máximo 10000; aplica. Prueba también un número negativo.

**Captura:** Ambos límites en DOP y error que identifica rango inválido o precio negativo.

**Comprobación adicional:** Un rango válido >=0 debe poder aplicarse; la captura del error no prueba ese otro caso.

## AZ-813 — BUG42 - El filtro usa tipos de propiedad en lugar de las categorías de adulto mayor

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Visitante  
**Pantalla:** `/catalog`

**Pasos:** Abre Filtros y marca varias categorías de Tipo de adulto mayor; aplica.

**Captura:** Seis categorías de atención en su propio grupo, diferenciadas de Tipo de propiedad.

**Comprobación adicional:** Las categorías seleccionadas se aplican con lógica AND; la prueba de API comprueba la combinación.

## AZ-814 — BUG43 - El catálogo de servicios del filtro omite categorías clínicas definidas en la HU

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Visitante  
**Pantalla:** `/catalog`

**Pasos:** Abre Filtros → Servicios incluidos; contrasta con una ficha y la gestión del centro.

**Captura:** Nueve servicios, distinguiendo Fisioterapia y Terapia ocupacional.

**Comprobación adicional:** No captures solo Tipo de propiedad: ese no es el grupo de servicios.

## AZ-815 — BUG44 - Desactivar un asilo cambia su estado sin confirmación previa

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Administrador del sistema y usuario que guardó el centro  
**Pantalla:** `/system-admin/asylums`

**Pasos:** Con el asilo activo pulsa Desactivar y después Cancelar; repite para ver la confirmación.

**Captura:** Modal con nombre, impacto, Confirmar desactivación y Cancelar.

**Comprobación adicional:** Al cancelar debe conservar Activo. Si confirmas, desaparece del catálogo/mapa y permanece No disponible en favoritos.

## AZ-816 — BUG45 - La confirmación de cambio de estado del asilo no identifica acción ni centro

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Administrador del sistema  
**Pantalla:** `/system-admin/asylums`

**Pasos:** Confirma una desactivación; después actívalo otra vez.

**Captura:** Aviso que identifica centro y estado final, junto al badge y acción de esa fila.

**Comprobación adicional:** Cancelar debe dar un aviso distinto y no cambiar el estado.

## AZ-817 — BUG46 - Las acciones de asilos se representan con iconos sin etiqueta visible

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Administrador del sistema  
**Pantalla:** `/system-admin/asylums`

**Pasos:** Revisa una fila activa y una inactiva.

**Captura:** Etiquetas Ver detalle, Editar y Activar/Desactivar junto a los iconos.

**Comprobación adicional:** La acción de estado debe corresponder a la fila; no confundirse con editar.

## AZ-818 — BUG47 - El detalle administrativo omite servicios, tipos de atención y contacto institucional

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Administrador del sistema  
**Pantalla:** `/system-admin/asylums`

**Pasos:** Pulsa Ver detalle.

**Captura:** Contacto institucional, teléfono/correo/web, servicios, atención y requisitos.

**Comprobación adicional:** Si no hay sitio web debe decir No informado; la cuenta del administrador se muestra aparte.

## AZ-819 — BUG48 — La edición de asilo no indica límites de texto junto a los campos

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Administrador del sistema  
**Pantalla:** `/system-admin/asylums`

**Pasos:** Pulsa Editar en un centro poblado y escribe en los campos de texto.

**Captura:** Ayudas y contadores de nombre/sector/dirección; otra captura de descripción/requisitos/certificaciones si hace falta.

**Comprobación adicional:** Es edición, no un registro vacío; deben verse obligatoriedad, límites y contador/error.

## AZ-820 — BUG49 - El error de edición menciona rangos de fechas en un formulario sin fechas

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Administrador del sistema  
**Pantalla:** `/system-admin/asylums`

**Pasos:** Editar: deja los datos válidos y cambia solo Correo institucional a correo-invalido; Guarda cambios.

**Captura:** Error Ingresa un correo institucional válido junto al correo, conservando los demás datos.

**Comprobación adicional:** No debe aparecer un error de fechas ni errores de grupos que sí están seleccionados.

## AZ-821 — BUG50 - La falta de servicios o atención se comunica con un aviso combinado lejos de los grupos

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Administrador del sistema  
**Pantalla:** `/system-admin/asylums`

**Pasos:** Editar un centro válido: desmarca únicamente los servicios y envía; después prueba también sin atención.

**Captura:** Error junto a Servicios y, solo si falla, junto a Tipos de atención.

**Comprobación adicional:** No sirve una captura de todo el formulario vacío para este criterio.

## AZ-824 — BUG51 - Los indicadores no explican si el período filtra altas o el estado actual

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Administrador del sistema  
**Pantalla:** `/system-admin`

**Pasos:** Aplica Últimos 7 días, Último mes y Último año.

**Captura:** Período aplicado, etiquetas que explican altas/estado actual y Datos actualizados.

**Comprobación adicional:** Comprueba que los tres atajos consultan intervalos distintos.

## AZ-825 — BUG52 - El gráfico de calificaciones queda vacío sin explicación cuando el período no tiene datos

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Administrador del sistema  
**Pantalla:** `/system-admin`

**Pasos:** Consulta 2000-01-01 a 2000-01-02, después pulsa Todo el historial.

**Captura:** Mensaje sin datos en cada gráfico y acceso a Todo el historial.

**Comprobación adicional:** Un error de conexión debe mostrarse como error, no como ausencia de registros.

## AZ-826 — BUG53 - El reporte de centros expone provinceId en vez del nombre de la provincia

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Administrador del sistema  
**Pantalla:** `/system-admin/reports`

**Pasos:** Centros de atención → Provincia Santiago → Consultar datos; exporta PDF y CSV.

**Captura:** Filtro Santiago y columna Provincia con Santiago; captura también el encabezado del PDF.

**Comprobación adicional:** El ID puede existir como columna adicional, no reemplazar al nombre.

## AZ-827 — BUG54 - Las columnas de cuentas exponen firstName, lastName y códigos de rol internos

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Administrador del sistema  
**Pantalla:** `/system-admin/reports`

**Pasos:** Cuentas de usuario → Consultar datos; exporta PDF/CSV.

**Captura:** Columnas Nombre, Apellido y Rol, con los tres roles traducidos.

**Comprobación adicional:** Tabla y exportaciones usan el mismo catálogo de etiquetas del backend.

## AZ-828 — BUG55 - El PDF conserva un título de documento anónimo en el visor

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Administrador del sistema  
**Pantalla:** `/system-admin/reports`

**Pasos:** Exporta un PDF y ábrelo en el visor.

**Captura:** Barra del visor con FamTree - Reporte de centros (o el tipo elegido), no un título anónimo.

**Comprobación adicional:** La página de reportes no prueba este bug; hay que abrir el PDF. Autor/fecha se comprueban en Propiedades del documento.

## AZ-829 — BUG56 - Desbloquear una cuenta actúa sin modal ni motivo original visible

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Administrador del sistema  
**Pantalla:** `/system-admin/users`

**Pasos:** Busca una cuenta de prueba bloqueada y pulsa Desbloquear.

**Captura:** Confirmación con nombre, correo, motivo original, justificación y Confirmar desbloqueo/Cancelar.

**Comprobación adicional:** Cancelar debe conservar el bloqueo. Solo al confirmar cambia el estado y queda registrado.

## AZ-830 — BUG57 - Bloquear y desbloquear producen el mismo aviso genérico

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Administrador del sistema  
**Pantalla:** `/system-admin/users`

**Pasos:** Bloquea una cuenta de prueba con motivo y después desbloquéala con justificación.

**Captura:** Una captura del aviso de bloqueo y otra del aviso distinto de desbloqueo, con usuario y badge.

**Comprobación adicional:** Conserva búsqueda y filtros; si el nuevo estado no coincide, la fila puede desaparecer del filtro.

## AZ-831 — BUG58 - La vista de moderación omite la fecha de publicación de la reseña

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Administrador del sistema  
**Pantalla:** `/system-admin/moderation`

**Pasos:** En un reporte pendiente pulsa Moderar.

**Captura:** Fecha del reporte y Publicación de la reseña, separadas, con autor, calificación, comentario, asilo y denunciante.

**Comprobación adicional:** Deben ser fechas legibles y corresponder a los dos hechos distintos.

## AZ-832 — BUG59 - La resolución consultada no identifica al moderador responsable

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Administrador del sistema  
**Pantalla:** `/system-admin/moderation`

**Pasos:** Filtra resueltos o Todos y pulsa Ver resolución.

**Captura:** Nombre/usuario e ID del moderador, justificación histórica y fecha/hora.

**Comprobación adicional:** No debe haber controles para modificar una resolución cerrada.

## AZ-774 — BUG60 - Auditoría usa un ID de moderador sin identificación legible

**Task:** Pendiente de confirmar el ID en Azure (el CSV no incluye la relación padre/hijo).

**Rol:** Administrador del sistema  
**Pantalla:** `/system-admin/audit`

**Pasos:** Busca una resolución reciente y pulsa Ver evento.

**Captura:** Detalle con Actor (nombre/usuario e ID), Acción, Entidad, Justificación y Fecha.

**Comprobación adicional:** La prueba de cambio de nombre del moderador es técnica; no se demuestra con una única imagen.

## IDs de las tareas «Corregir Bug»

Las 58 tareas son las siguientes. Esta lista indica su orden por ID, no su correspondencia con los bugs. El ID 833 no está confirmado como tarea de BUG01. Para confirmar cada vínculo, revisa Parent/Padre o Related Work en Azure.

833, 834, 835, 836, 837, 838, 839, 840, 841, 842, 843, 844, 845, 846, 847, 848, 849, 850, 851, 852, 853, 854, 855, 856, 857, 858, 859, 860, 861, 862, 863, 864, 865, 866, 867, 868, 869, 870, 871, 872, 873, 874, 875, 876, 877, 878, 879, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890.
