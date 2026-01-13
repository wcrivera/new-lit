# LTI Canvas Integration - Básico

Proyecto básico de integración LTI 1.1 con Canvas LMS.

## Instalación
```bash
cd backend
npm install
```

## Configuración

1. Edita el archivo `.env` con tus credenciales de Canvas:
   - `CONSUMER_KEY`: La clave que configurarás en Canvas
   - `CONSUMER_SECRET`: El secreto compartido
   - `JWT_SECRET`: Una clave secreta para los tokens JWT

## Ejecución
```bash
npm start
```

El servidor correrá en `http://localhost:3000`

## Configuración en Canvas

1. Ve a tu curso → Settings → Apps
2. Click en "Add App" → "Manual Entry"
3. Configura:
   - **Name**: LTI Test App
   - **Consumer Key**: (el mismo que en .env)
   - **Shared Secret**: (el mismo que en .env)
   - **Launch URL**: http://localhost:3000/lti/launch
   - **Privacy**: Public

## Funcionalidades

- ✅ Validación OAuth 1.0
- ✅ Extracción de datos del usuario (nombre, email, rol)
- ✅ Generación de token JWT
- ✅ Visualización de información del usuario

## Endpoints

- `POST /lti/launch` - Endpoint principal de lanzamiento LTI
- `POST /api/validate-token` - Validar un token JWT
- `GET /health` - Health check del servidor# new-lit
