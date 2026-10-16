# FamTree — Evidencias de correcciones de bugs

## Alcance y fuente

Exportaciones originales: `data.csv` y `tasks.csv`. Ambos archivos son idénticos: 202 elementos; contienen 61 bugs y 71 tareas. Los 60 bugs numerados incluyen 2 retirados; el bug antiguo 155 no tiene una pantalla ni criterios verificables.

**58 bugs activos con comprobaciones focalizadas y capturas.** Cada carpeta usa el ID real de Azure, no el número de fila del CSV. Las capturas son del entorno local; no representan un despliegue ni un cambio de estado en Azure.

## Cómo adjuntar las evidencias

1. Abrir el bug por su ID en Azure DevOps.
2. Adjuntar `AZ-ID/solucion-verificada.png` y, si procede, `caso.md`.
3. Para BUG55 (ID 828), se incluye además el PDF exportado.
4. No asignar automáticamente una tarea “Corregir Bug”: el CSV no contiene relaciones padre/hijo ni una descripción que permita asociarlas con seguridad.

## Excepciones y límites

- BUG25 / ID796 y BUG36 / ID807: retirados en la exportación, excluidos de corrección.
- ID155 “Arreglar icono”: pendiente de identificar pantalla/iconos y tamaño esperado; no se declara resuelto.
- BUG01: se aplica la decisión expresa del usuario de redirigir directamente a inicio de sesión, en lugar del modal solicitado originalmente en Azure.
- BUG23: se conserva el acceso automático aprobado, con confirmación visible de creación de cuenta.
- La auditoría conserva el nombre histórico de las nuevas resoluciones. Para resoluciones antiguas sin ese dato, muestra “Nombre histórico no registrado” junto al ID; no inventa nombres históricos.
- “Verificado” significa que pasó la comprobación descrita en `verificacion.json`; no significa que se ejecutaron todas las combinaciones posibles de todos los criterios. Las capturas de filtros validan controles y catálogos, no todas las combinaciones de filtros. No se simuló una interrupción del proveedor de mapas ni se esperaron 15 minutos reales para el desbloqueo.
- Las pruebas usan cuentas y denuncias ficticias locales; el centro desactivado para comprobar el aviso fue reactivado al terminar. No se incluyen contraseñas en este paquete.

## Índice

| Azure | Bug | Resultado | Evidencia |
|---|---|---|---|
| 155 | Arreglar icono | Pendiente de aclaración | — |
| 770 | BUG01 - El aviso de favoritos para visitantes usa una alerta nativa sin accesos a autenticación | Comprobación aprobada | `AZ-770/solucion-verificada.png` (carpeta de evidencias local) |
| 771 | BUG02 - Guardados presenta una lista personal vacía a un visitante sin explicar la restricción | Comprobación aprobada | `AZ-771/solucion-verificada.png` (carpeta de evidencias local) |
| 772 | BUG03 - La campana y el panel de notificaciones se muestran sin autenticación | Comprobación aprobada | `AZ-772/solucion-verificada.png` (carpeta de evidencias local) |
| 773 | BUG04 - La comparación pública exige guardar otro asilo en favoritos y bloquea al visitante | Comprobación aprobada | `AZ-773/solucion-verificada.png` (carpeta de evidencias local) |
| 774 | BUG60 - Auditoría usa un ID de moderador sin identificación legible | Comprobación aprobada | `AZ-774/solucion-verificada.png` (carpeta de evidencias local) |
| 776 | BUG05 - La columna Provincia de la selección comparativa muestra una dirección de calle | Comprobación aprobada | `AZ-776/solucion-verificada.png` (carpeta de evidencias local) |
| 777 | BUG06 - La ficha de asilo omite provincia, municipio y sector de la dirección | Comprobación aprobada | `AZ-777/solucion-verificada.png` (carpeta de evidencias local) |
| 778 | BUG07 - La ficha pública no presenta capacidad ni requisitos de ingreso | Comprobación aprobada | `AZ-778/solucion-verificada.png` (carpeta de evidencias local) |
| 779 | BUG08 - Los distintivos Verificado y Seguro no muestran certificaciones ni fecha de actualización | Comprobación aprobada | `AZ-779/solucion-verificada.png` (carpeta de evidencias local) |
| 780 | BUG09 - La ficha omite el acceso al sitio web registrado del asilo | Comprobación aprobada | `AZ-780/solucion-verificada.png` (carpeta de evidencias local) |
| 781 | BUG10 - El detalle no ofrece un mapa individual de la ubicación del centro | Comprobación aprobada | `AZ-781/solucion-verificada.png` (carpeta de evidencias local) |
| 782 | BUG11 - El detalle abierto desde el mapa pierde el precio máximo mensual | Comprobación aprobada | `AZ-782/solucion-verificada.png` (carpeta de evidencias local) |
| 783 | BUG12 - El detalle desde el mapa omite servicios y tipos de cuidado visibles en catálogo | Comprobación aprobada | `AZ-783/solucion-verificada.png` (carpeta de evidencias local) |
| 784 | BUG13 - Al alejar el mapa quedan grandes áreas grises y una franja cartográfica incompleta | Comprobación aprobada | `AZ-784/solucion-verificada.png` (carpeta de evidencias local) |
| 785 | BUG14 - El encuadre inicial del mapa se limita al entorno de Santo Domingo | Comprobación aprobada | `AZ-785/solucion-verificada.png` (carpeta de evidencias local) |
| 786 | BUG15 - El resumen lateral del mapa omite foto, municipio/provincia y rango mensual | Comprobación aprobada | `AZ-786/solucion-verificada.png` (carpeta de evidencias local) |
| 787 | BUG16 - Dar Reseña desde un asilo muestra opiniones de otros centros | Comprobación aprobada | `AZ-787/solucion-verificada.png` (carpeta de evidencias local) |
| 788 | BUG17 - No se presenta el resumen de reseñas por centro ni la distribución de estrellas | Comprobación aprobada | `AZ-788/solucion-verificada.png` (carpeta de evidencias local) |
| 789 | BUG18 - Faltan controles para ordenar por precio y nombre en el catálogo | Comprobación aprobada | `AZ-789/solucion-verificada.png` (carpeta de evidencias local) |
| 790 | BUG19 - Calificación mínima se reduce a un interruptor sin indicar el umbral aplicado | Comprobación aprobada | `AZ-790/solucion-verificada.png` (carpeta de evidencias local) |
| 791 | BUG20 - El inicio de sesión interpreta credenciales incorrectas como fin de sesión | Comprobación aprobada | `AZ-791/solucion-verificada.png` (carpeta de evidencias local) |
| 792 | BUG21 - La validación de campos vacíos en login no indica qué debe corregirse | Comprobación aprobada | `AZ-792/solucion-verificada.png` (carpeta de evidencias local) |
| 793 | BUG22 - Los formularios de registro y acceso no señalan visualmente los campos obligatorios | Comprobación aprobada | `AZ-793/solucion-verificada.png` (carpeta de evidencias local) |
| 794 | BUG23 - El registro exitoso inicia sesión automáticamente y omite la confirmación exigida | Comprobación aprobada | `AZ-794/solucion-verificada.png` (carpeta de evidencias local) |
| 795 | BUG24 - El aviso de bloqueo temporal no informa la duración ni cuándo reintentar | Comprobación aprobada | `AZ-795/solucion-verificada.png` (carpeta de evidencias local) |
| 796 | BUG25 - Cerrar sesión desde el perfil redirige a login en lugar del catálogo visitante | Retirado / excluido | — |
| 797 | BUG26 - El cambio de contraseña conserva los tres campos tras un error de validación | Comprobación aprobada | `AZ-797/solucion-verificada.png` (carpeta de evidencias local) |
| 798 | BUG27 - El mensaje de nueva contraseña agrupa causas distintas y no identifica la regla fallida | Comprobación aprobada | `AZ-798/solucion-verificada.png` (carpeta de evidencias local) |
| 799 | BUG28 - La validación de obligatorios del cambio de contraseña aparece en inglés y como tooltip nativo | Comprobación aprobada | `AZ-799/solucion-verificada.png` (carpeta de evidencias local) |
| 800 | BUG29 - Las contraseñas del administrador de asilo son ilegibles al mostrarlas | Comprobación aprobada | `AZ-800/solucion-verificada.png` (carpeta de evidencias local) |
| 801 | BUG30 - La ayuda del cambio temporal omite la minúscula requerida y usa cotejos sin validar la entrada | Comprobación aprobada | `AZ-801/solucion-verificada.png` (carpeta de evidencias local) |
| 802 | BUG31 - El cambio temporal usa un aviso general en lugar de señalar Nueva contraseña | Comprobación aprobada | `AZ-802/solucion-verificada.png` (carpeta de evidencias local) |
| 803 | BUG32 - El cambio de contraseña temporal no muestra la confirmación de bienvenida | Comprobación aprobada | `AZ-803/solucion-verificada.png` (carpeta de evidencias local) |
| 804 | BUG33 - Quitar la foto y guardar informa éxito, pero la imagen reaparece | Comprobación aprobada | `AZ-804/solucion-verificada.png` (carpeta de evidencias local) |
| 805 | BUG34 - El municipio no se adapta a la ciudad seleccionada y permite combinaciones incompatibles | Comprobación aprobada | `AZ-805/solucion-verificada.png` (carpeta de evidencias local) |
| 806 | BUG35 - Los cambios de ciudad y municipio no se conservan al volver al perfil | Comprobación aprobada | `AZ-806/solucion-verificada.png` (carpeta de evidencias local) |
| 807 | BUG36 - El correo del perfil permite edición y guardado pese a estar protegido en la HU | Retirado / excluido | — |
| 808 | BUG37 - La pantalla de consulta del perfil no muestra el rol ni un modo de consulta separado | Comprobación aprobada | `AZ-808/solucion-verificada.png` (carpeta de evidencias local) |
| 809 | BUG38 - La edición del perfil no ofrece Cancelar para descartar cambios | Comprobación aprobada | `AZ-809/solucion-verificada.png` (carpeta de evidencias local) |
| 810 | BUG39 - La cabecera muestra Servicios Verificado con concordancia incorrecta | Comprobación aprobada | `AZ-810/solucion-verificada.png` (carpeta de evidencias local) |
| 811 | BUG40 - Las preguntas frecuentes anuncian citas y cancelaciones fuera del alcance de FamTree | Comprobación aprobada | `AZ-811/solucion-verificada.png` (carpeta de evidencias local) |
| 812 | BUG41 - El filtro de precio no permite definir un mínimo ni un rango completo | Comprobación aprobada | `AZ-812/solucion-verificada.png` (carpeta de evidencias local) |
| 813 | BUG42 - El filtro usa tipos de propiedad en lugar de las categorías de adulto mayor | Comprobación aprobada | `AZ-813/solucion-verificada.png` (carpeta de evidencias local) |
| 814 | BUG43 - El catálogo de servicios del filtro omite categorías clínicas definidas en la HU | Comprobación aprobada | `AZ-814/solucion-verificada.png` (carpeta de evidencias local) |
| 815 | BUG44 - Desactivar un asilo cambia su estado sin confirmación previa | Comprobación aprobada | `AZ-815/solucion-verificada.png` (carpeta de evidencias local) |
| 816 | BUG45 - La confirmación de cambio de estado del asilo no identifica acción ni centro | Comprobación aprobada | `AZ-816/solucion-verificada.png` (carpeta de evidencias local) |
| 817 | BUG46 - Las acciones de asilos se representan con iconos sin etiqueta visible | Comprobación aprobada | `AZ-817/solucion-verificada.png` (carpeta de evidencias local) |
| 818 | BUG47 - El detalle administrativo omite servicios, tipos de atención y contacto institucional | Comprobación aprobada | `AZ-818/solucion-verificada.png` (carpeta de evidencias local) |
| 819 | BUG48 — La edición de asilo no indica límites de texto junto a los campos | Comprobación aprobada | `AZ-819/solucion-verificada.png` (carpeta de evidencias local) |
| 820 | BUG49 - El error de edición menciona rangos de fechas en un formulario sin fechas | Comprobación aprobada | `AZ-820/solucion-verificada.png` (carpeta de evidencias local) |
| 821 | BUG50 - La falta de servicios o atención se comunica con un aviso combinado lejos de los grupos | Comprobación aprobada | `AZ-821/solucion-verificada.png` (carpeta de evidencias local) |
| 824 | BUG51 - Los indicadores no explican si el período filtra altas o el estado actual | Comprobación aprobada | `AZ-824/solucion-verificada.png` (carpeta de evidencias local) |
| 825 | BUG52 - El gráfico de calificaciones queda vacío sin explicación cuando el período no tiene datos | Comprobación aprobada | `AZ-825/solucion-verificada.png` (carpeta de evidencias local) |
| 826 | BUG53 - El reporte de centros expone provinceId en vez del nombre de la provincia | Comprobación aprobada | `AZ-826/solucion-verificada.png` (carpeta de evidencias local) |
| 827 | BUG54 - Las columnas de cuentas exponen firstName, lastName y códigos de rol internos | Comprobación aprobada | `AZ-827/solucion-verificada.png` (carpeta de evidencias local) |
| 828 | BUG55 - El PDF conserva un título de documento anónimo en el visor | Comprobación aprobada | `AZ-828/solucion-verificada.png` (carpeta de evidencias local) |
| 829 | BUG56 - Desbloquear una cuenta actúa sin modal ni motivo original visible | Comprobación aprobada | `AZ-829/solucion-verificada.png` (carpeta de evidencias local) |
| 830 | BUG57 - Bloquear y desbloquear producen el mismo aviso genérico | Comprobación aprobada | `AZ-830/solucion-verificada.png` (carpeta de evidencias local) |
| 831 | BUG58 - La vista de moderación omite la fecha de publicación de la reseña | Comprobación aprobada | `AZ-831/solucion-verificada.png` (carpeta de evidencias local) |
| 832 | BUG59 - La resolución consultada no identifica al moderador responsable | Comprobación aprobada | `AZ-832/solucion-verificada.png` (carpeta de evidencias local) |

## Validación técnica

- Backend: 85 pruebas aprobadas; controles de estilo, tipos, seguridad y migraciones aprobados.
- Frontend: TypeScript, ESLint, 38 pruebas y compilación de producción aprobados.
- PDF: `pdfinfo` confirma título “FamTree - Reporte de centros” y autor “FamTree”.

## Cambios registrados

```text
08d2064 fix(seed): use visible demo cover images
8179062 fix(favorites): show auth feedback in page
91e3f41 fix(seed): avoid duplicate demo cover images
119bfc3 fix(catalog): make asylum sharing functional
d1a673f fix(feedback): distinguish informational messages
febaa48 fix(favorites): redirect guests to login
d78e41e fix(reviews): explain comment length limits
3b5a245 fix(reviews): show initials when profile photo is missing
010f50b Merge remote-tracking branch 'origin/main' into fix/azure-bug-verification
de3a85e fix(favorites): require login before opening saved residences
a299dd6 fix(notifications): hide private inbox for visitors
20f4afc fix(asylums): share complete detail data between catalog and map
38f0dea fix(asylums): label province municipality and sector in public detail
94ac41f fix(asylums): show admission requirements and capacity
c8f5f49 fix(header): remove unsupported service verification claim
742b190 fix(support): align frequently asked questions with available features
6ed57b5 fix(asylums): show declared certifications and update date
2815906 fix(asylums): expose valid website phone and email links
e46d9a8 fix(comparison): keep province separate from street address
eb33d51 fix(comparison): allow visitors to choose public residences
019da61 fix(map): start with Dominican Republic overview and reset control
5042d97 fix(map): handle tile failures and resize the map canvas
75ae47c fix(asylums): include a map for each residence location
23ceab5 fix(map): include image location and full prices in summaries
f31f370 fix(reviews): scope residence review navigation to its selected center
99e00f6 fix(reviews): preserve selected residence through sign in
9ab2b52 fix(reviews): show per-center rating totals and distribution
a872c1d fix(filters): connect location care services and budget to real catalogs
9c8b09b fix(catalog): expose sorting and retain filters across pages
d70d5e9 fix(login): describe invalid credentials without claiming session expiry
ce36fad fix(login): label required fields and focus missing input
1ff1c62 fix(register): identify required inputs with accessible labels
ed0ac70 fix(register): confirm account creation when signing users in
fdac4b8 fix(feedback): preserve confirmations across auth and admin routes
d6a9af4 fix(login): explain temporary lockout and restore safe return routes
5a76499 fix(passwords): identify validation rules and clear rejected secrets
a98d3ba fix(center-admin): confirm first password change and welcome administrator
ca1585a fix(profile): persist removal of profile pictures
5b5d89b fix(profile): persist valid province and municipality selections
4cd6930 fix(profile): show account role and allow cancelling profile edits
c482144 fix(centers): identify residence and final publication state
34e806d fix(centers): give management actions visible labels
2105c9f fix(centers): complete institutional detail and care information
7bcd638 fix(center-form): explain field limits and keep gallery optional
d9dec4f fix(center-form): show Spanish validation beside each invalid field
ea67bed fix(admin): remove unrelated date instructions from validation errors
3ecfad0 fix(center-form): associate service and care validation with each group
5f38083 fix(users): identify account state changes and explain block justification
d077c9d fix(users): show original block reason before confirming unblock
3ef25dc fix(moderation): preserve moderator identity and review publication dates
d378b7e fix(reports): include readable province names in center reports
123c287 fix(reports): translate account columns and role values
96fdec2 fix(reports): give generated PDF documents a title and author
4110066 fix(reports): use readable field and value labels in exported files
dc1927a fix(reports): make province joins explicit and verify public map fields
eaca846 fix(admin): show the saved center capacity in its details
5794c8e fix(reports): translate the PDF document title
```


Carpeta local: `/home/isaac/Downloads/FamTree_Evidencias_Bugs`.

Reproducir: `FAMTREE_CASES=770,771 node qa/manual/verify-azure-bugs.mjs` desde la raíz, con Docker Compose activo. El ejecutor requiere los archivos locales de fixtures en `backend/.runtime/`, deliberadamente excluidos de Git. No ejecutar contra producción: crea cuentas y modifica datos de prueba. Los casos 800–803 necesitan una cuenta con cambio temporal pendiente; después de 803 debe prepararse una nueva cuenta temporal antes de repetirlos.

## Revisión de capturas

Se repitieron los 58 casos activos y se revisaron visualmente las nuevas capturas. Todas tienen 1440 × 1000 píxeles y muestran el área visible del navegador tras esperar la carga y las transiciones. Se ocultó únicamente el indicador de desarrollo de Next.js, sin modificar los datos ni los controles de la aplicación. AZ-773 espera a la tabla comparativa; AZ-828 muestra el PDF abierto en el visor real de Chromium.

En la carpeta local, `GALERIA.html` permite buscar y abrir las imágenes originales. `CAPTURAS/` contiene las copias para adjuntar en Azure, y `revision-capturas.json` registra fecha, dimensiones y hash de cada imagen. Los estados de Azure no se modificaron.

## Correspondencia con el bug

Se contrastaron los 58 casos activos con la descripción y los criterios originales. La galería y `CORRESPONDENCIA.md` indican qué demuestra cada captura y qué no puede demostrarse solo con una imagen. Se incluyen 13 capturas complementarias.

Correcciones de esta revisión:

- AZ-776 / BUG05: el título ahora dice Comparar residencias; se seleccionan dos centros y se cotejan Peravia y Puerto Plata con la API. La columna está en la selección previa a comparar, no en la tabla final de servicios.
- AZ-773: captura adicional con cuatro centros seleccionados, quinto deshabilitado y tabla final de dos centros.
- AZ-782/783: mismo centro desde mapa y catálogo en imágenes separadas.
- AZ-789: cinco capturas de las cinco opciones de orden y registro de resultados.
- AZ-790: umbral de cuatro estrellas aplicado antes de obtener la captura.
- AZ-800: texto ficticio visible en los tres campos para demostrar contraste. No son credenciales.
- AZ-805: cambio de Azua a Santiago limpia el municipio y muestra las opciones dependientes. AZ-806: guardado desde la interfaz y recarga de la combinación Santiago / Santiago de los Caballeros.
- AZ-809: borrador y Cancelar en una captura adicional; valores restaurados en la principal.
- AZ-819/820/821: se prueba EDICIÓN con datos poblados. AZ-820 solo invalida el correo; AZ-821 solo desmarca los grupos exigidos.
- AZ-826: filtro Santiago y columna Provincia Santiago visibles.
- AZ-830: avisos separados de bloqueo y desbloqueo en imágenes distintas; cuenta restaurada a Activo.
- AZ-831: publicación de reseña y fecha de reporte separadas en el modal.

Validación posterior: TypeScript y ESLint aprobados, 38 pruebas de frontend aprobadas; 58 comprobaciones focalizadas de navegador conservadas sin fallos registrados. La galería contiene 58 casos y su búsqueda por 776 devuelve únicamente el caso de Provincia. No se cambiaron estados de Azure ni se hizo push.
