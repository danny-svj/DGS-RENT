# DGS Rent a Car

Sistema web de renta de autos para clientes particulares y empresas (portal B2B). Proyecto academico de la materia Ingenieria de Software — Actividad de Implementacion, seguridad, pruebas y cierre.

Repositorio: https://github.com/danny-svj/DGS-RENT

## Estructura

```
backend/    API REST (Node.js + Express + JWT + SQLite)
frontend/   Sitio publico + portal de usuario + panel de administrador (HTML/CSS/JS)
.github/workflows/   Pipelines de CI/CD (tests, cobertura, despliegue, seguridad, calidad)
render.yaml           Blueprint para desplegar el backend en Render
```

## Modulo implementado (Actividad de implementacion)

**Autenticacion y usuarios** con JWT y roles `admin` / `user`, mas el modulo de **vehiculos** (CRUD), usados como los "modulos basicos" de la actividad:

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/vehicles`, `GET /api/vehicles/:id` (publico)
- `POST /api/vehicles`, `PUT /api/vehicles/:id`, `DELETE /api/vehicles/:id` (solo admin)
- `GET/POST /api/reservations`, `PUT /api/reservations/:id/status`, `DELETE /api/reservations/:id`
- `GET /api/users` (solo admin)

## Correr en local

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev        # http://localhost:4000
```

Usuarios semilla (creados automaticamente):
- Admin: `admin@dgsrent.com` / `Admin123!`
- Cliente: `cliente@dgsrent.com` / `Cliente123!`

### Frontend

Es un sitio estatico. Basta con abrirlo con un servidor estatico, por ejemplo:

```bash
cd frontend
npx serve .         # o "Live Server" en VS Code
```

Con el backend corriendo en `localhost:4000`, el frontend detecta el entorno local automaticamente (ver `frontend/js/config.js`).

## Pruebas y cobertura

```bash
cd backend
npm run test:coverage
```

Cobertura minima exigida (configurada en `package.json > jest.coverageThreshold`): 80% en `src/routes/auth.js` y `src/routes/vehicles.js`.

## CI/CD (GitHub Actions)

| Workflow | Que hace |
|---|---|
| `ci.yml` | Instala dependencias, corre ESLint, corre Jest con cobertura en cada push/PR a `main` |
| `deploy-pages.yml` | Publica `frontend/` en GitHub Pages en cada push a `main` |
| `security-scan.yml` | Levanta la API y ejecuta un escaneo baseline con OWASP ZAP |
| `sonarcloud.yml` | Analisis de calidad de codigo con SonarCloud (requiere activarlo, ver abajo) |

## Despliegue publico

### Frontend — GitHub Pages (automatico)

1. En GitHub: **Settings > Pages > Build and deployment > Source: GitHub Actions**.
2. Cada push a `main` publica el sitio automaticamente en:
   `https://danny-svj.github.io/DGS-RENT/`

### Backend — Render (un clic)

1. Entra a [render.com](https://render.com) e inicia sesion con tu cuenta de GitHub (gratis, sin tarjeta).
2. **New > Blueprint**, selecciona el repositorio `danny-svj/DGS-RENT`. Render detecta `render.yaml` automaticamente.
3. Confirma la creacion. Cada push a `main` vuelve a desplegar el backend.
4. Copia la URL publica que te da Render (algo como `https://dgs-rent-api.onrender.com`) y actualiza `frontend/js/config.js` con esa URL.

> Nota: el plan gratuito de Render "duerme" tras inactividad y su disco es efimero (los datos de ejemplo se regeneran en cada arranque). Suficiente para una demo academica.

### Activar SonarCloud (opcional, para el analisis de calidad)

1. Entra a [sonarcloud.io](https://sonarcloud.io) e inicia sesion con GitHub.
2. Importa el repositorio `danny-svj/DGS-RENT` y crea un token (**My Account > Security**).
3. En GitHub: **Settings > Secrets and variables > Actions > New repository secret**, agrega `SONAR_TOKEN` con ese valor.
4. En **Settings > Secrets and variables > Actions > Variables**, agrega `SONAR_ENABLED` = `true`.
5. Vuelve a correr el workflow `sonarcloud.yml` desde la pestana Actions.

## Seguridad

- Contrasenas cifradas con bcrypt.
- Autenticacion via JWT (expira en 8h).
- Autorizacion por rol (`admin` / `user`) en endpoints sensibles.
- Validacion de entradas con `express-validator`.
- Escaneo automatico de vulnerabilidades con OWASP ZAP en cada push (ver Actions > Seguridad).

## 

Daniel Alejandro Gonzalez Salazar — Ingenieria en Desarrollo de Software, Universidad Tecmilenio.
