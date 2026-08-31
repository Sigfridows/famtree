cat << 'EOF' > README.md
# 🌳 FamTree

> Sistema para la gestión, organización y visualización interactiva de asilos.

---

## 📌 Tabla de Contenidos
- [Tecnologías y Arquitectura](#-tecnologías-y-arquitectura)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Requisitos Previos](#-requisitos-previos)
- [Configuración del Entorno Local](#-configuración-del-entorno-local)
- [Flujo de Trabajo en Git (Git Workflow)](#-flujo-de-trabajo-en-git-git-workflow)
- [Convención de Commits](#-convención-de-commits)
- [Ciclo de Desarrollo y Pull Requests](#-ciclo-de-desarrollo-y-pull-requests)
- [Integración Continua (CI/CD)](#-integración-continua-cicd)

---

## 🛠️ Tecnologías y Arquitectura

* **Frontend:** Next.js, React, Tailwind CSS
* **Backend:** NestJS (Node.js v20)
* **Base de Datos:** PostgreSQL
* **Infraestructura Local:** Docker / Docker Compose
* **CI/CD:** GitHub Actions
* **Despliegue:** Vercel (Frontend)

---

## 📂 Estructura del Proyecto

```text
famtree/
├── .github/
│   └── workflows/          # Pipelines de CI para frontend y backend
├── back-end/               # API REST en NestJS
├── front-end/              # Aplicación web en Next.js
├── docker-compose.yml      # Configuración de servicios locales (PostgreSQL)
├── schema.sql              # Estructura inicial de la base de datos
└── README.md               # Documentación del proyecto
🧰 Requisitos Previos
Asegúrate de tener instaladas las siguientes herramientas en tu sistema antes de iniciar:

Node.js (versión 20 LTS o superior)

Docker Desktop (debe estar en ejecución para la BD)

Git

⚙️ Configuración del Entorno Local
1. Clonar el repositorio
Bash
git clone [https://github.com/Sigfridows/famtree.git](https://github.com/Sigfridows/famtree.git)
cd famtree
2. Levantar la Base de Datos (Docker)
Levanta la instancia local de PostgreSQL sin necesidad de instalar el motor en tu sistema:

Bash
docker compose up -d
💡 La base de datos quedará corriendo en localhost:5432 con la estructura definida en schema.sql.

3. Configurar e Iniciar el Backend
Bash
cd back-end
npm install
npm run start:dev
💡 El servicio backend estará disponible en http://localhost:3000.

4. Configurar e Iniciar el Frontend
En una nueva pestaña de la terminal:

Bash
cd front-end
npm install
npm run dev
💡 El cliente frontend estará disponible en http://localhost:3001 (o el puerto asignado).

🌿 Flujo de Trabajo en Git (Git Workflow)
Para mantener el historial limpio y evitar conflictos de integración, seguimos las siguientes reglas innegociables:

Reglas Principales
Rama main protegida: Nadie hace push directo a main. Todo cambio entra vía Pull Request (PR).

Nombres de ramas por funcionalidad: El nombre de la rama indica qué se está construyendo, nunca quién lo está haciendo.

✅ Correcto: feature/login-ui, feature/user-service, bugfix/navbar-overlap

📝 Convención de Commits
Utilizamos el estándar Conventional Commits. Cada commit debe llevar un prefijo indicando el propósito del cambio:

Prefijo	Uso	Ejemplo
feat	Nueva funcionalidad	feat: agregar componente de nodo del arbol
fix	Corrección de un error (bug fix)	fix: corregir fallo de autenticacion en login
docs	Cambios en la documentación	docs: actualizar instrucciones de instalacion
style	Formato, espacios, comas (sin cambios en lógica)	style: aplicar prettier en componentes
refactor	Reestructuración de código existente	refactor: optimizar consulta de relaciones
perf	Mejoras de rendimiento	perf: lazy loading en imagenes de miembros
test	Adición o ajuste de pruebas unitarias	test: agregar prueba unitaria para servicio usuario
build	Cambios en dependencias o build	build: actualizar version de tailwindcss
ci	Ajustes en workflows de GitHub Actions	ci: actualizar runner de ubuntu
chore	Tareas de mantenimiento general	chore: actualizar archivo .gitignore
💡 Tip: Puedes incluir un alcance opcional: feat(front-end): agregar boton de zoom o fix(back-end): corregir status code 500.

🔄 Ciclo de Desarrollo y Pull Requests
Sigue estos pasos detallados para realizar tus aportes al proyecto:

Paso 1: Actualizar main
Antes de iniciar cualquier tarea:

Bash
git checkout main
git pull origin main
Paso 2: Crear una nueva rama
Bash
git checkout -b feature/nombre-de-tu-tarea
Paso 3: Guardar cambios en commits
Bash
git add .
git commit -m "feat: implementada interfaz del arbol"
Paso 4: Subir la rama a GitHub
Bash
git push -u origin feature/nombre-de-tu-tarea
Paso 5: Abrir un Pull Request
Ve a la pestaña Pull Requests en GitHub.

Haz clic en New Pull Request y selecciona tu rama hacia main.

Asigna un título descriptivo y explica brevemente los cambios.

Espera a que los chequeos automáticos de GitHub Actions finalicen en verde (🟢).

Solicita revisión a tus compañeros y realiza el Merge.

🤖 Integración Continua (CI/CD)
El repositorio cuenta con dos automatizaciones mediante GitHub Actions:

Backend CI (backend-ci.yml): Compila NestJS, valida tipos de TypeScript y verifica contenedores en Docker.

Frontend CI (frontend-ci.yml): Compila Next.js, ejecuta linter (ESLint) y valida estilos con Tailwind.

ℹ️ Nota sobre commits de solo documentación:

Si realizas cambios exclusivos en documentación o archivos .md y deseas omitir la ejecución de los pipelines, añade [skip ci] al final del mensaje de commit:

git commit -m "docs: corregir ortografia en readme [skip ci]"
EOF


Para subir las correcciones a GitHub:

```bash
git add README.md
git commit -m "docs: corregir formato de tablas y encabezados en README"
git push origin main