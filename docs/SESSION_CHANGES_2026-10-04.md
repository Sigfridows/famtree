# Cambios de usabilidad y administración

## Incluido

- Se añadió `tipo_propiedad` al modelo de asilos, con migración `20261004_0009`, validación API, edición administrativa y filtro público.
- La búsqueda se movió fuera del encabezado y quedó integrada en el subencabezado del catálogo.
- Los favoritos, perfil, autenticación y administración muestran mensajes en lenguaje claro mediante feedback visual; se eliminaron alertas técnicas del flujo de favoritos y perfil.
- Las preferencias de notificaciones y ofertas se cargan y guardan mediante la API persistente.
- El administrador del sistema puede editar nombre, apellido, correo, teléfono y descripción de usuarios.
- El desbloqueo solicita una justificación y la conserva en el historial de bloqueos.
- El panel de usuarios muestra el historial de bloqueos y desbloqueos de la cuenta seleccionada.
- La moderación usa las acciones “Aceptar reporte” y “Rechazar reporte” con justificación obligatoria.
- Se quitó el botón redundante de búsqueda en reseñas; la búsqueda se ejecuta con Enter y los filtros siguen siendo selectores.
- La ubicación de un asilo muestra rangos válidos de República Dominicana, ejemplos decimales y teclado numérico.
- El sitio web y las imágenes iniciales son opcionales al registrar un asilo. La galería puede completarse después; cuando hay imágenes se mantiene el máximo de 15 y una portada única mediante la migración `20261004_0010`.
- Los formularios de creación y edición validan campos obligatorios, teléfono, correo, URLs, rangos de precios y catálogos antes de enviar, con ayuda explícita para las credenciales del administrador.

## Fuera de alcance

- No se modificaron ni añadieron integraciones o contenido relacionado con Azure.

## Verificación

- Backend: 84 pruebas, migraciones y checks de Ruff/Mypy/Bandit correctos (incluida la subida y bajada de `20261004_0010`).
- Frontend: typecheck, lint, 38 pruebas y cobertura por encima de los umbrales.
- Build Next.js correcto con las rutas públicas y ambos paneles administrativos.
