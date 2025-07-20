# API de Productos - Backend

API REST desarrollada con Express.js para la gestión de productos con autenticación JWT y MongoDB.

## 🚀 Deploy en Vercel

### Pasos para deployar:

1. **Instalar Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login en Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy desde la carpeta del proyecto:**
   ```bash
   vercel
   ```

4. **Configurar variables de entorno en Vercel:**
   - Ve a tu proyecto en vercel.com
   - Settings → Environment Variables
   - Agrega estas variables (usa los mismos valores de tu archivo `.env`):

   ```
   NODE_ENV=production
   PORT=3001
   MONGODB_URI=mongodb+srv://alfredo:notebok456@recluster.cbmnw.mongodb.net/pastillas_db?retryWrites=true&w=majority&appName=REcluster
   JWT_SECRET=pastillas-app-secret-key-2025-muy-segura
   JWT_EXPIRES_IN=24h
   API_URL=https://tu-proyecto.vercel.app
   ```

### 📋 Variables de entorno requeridas:

- `NODE_ENV`: production (en Vercel)
- `PORT`: 3001 
- `MONGODB_URI`: Tu conexión a MongoDB Atlas (ya configurada)
- `JWT_SECRET`: Tu clave secreta JWT (ya configurada)
- `JWT_EXPIRES_IN`: 24h
- `API_URL`: URL de tu API en Vercel

## 🚀 Instalación

1. Clona el repositorio
2. Instala las dependencias:
```bash
npm install
```

3. Copia el archivo de variables de entorno:
```bash
cp .env.example .env
```

4. Configura las variables de entorno en el archivo `.env`

## 🔧 Scripts disponibles

- `npm start` - Ejecuta el servidor en producción
- `npm run dev` - Ejecuta el servidor en modo desarrollo con nodemon

## 📁 Estructura del proyecto

```
├── src/
│   ├── app.js              # Configuración principal de Express
│   ├── controllers/        # Lógica de negocio
│   ├── routes/            # Definición de rutas
│   ├── models/            # Modelos de datos
│   ├── middleware/        # Middlewares personalizados
│   ├── services/          # Servicios y lógica de negocio
│   ├── config/            # Configuraciones
│   └── utils/             # Utilidades y funciones auxiliares
├── tests/                 # Tests del proyecto
├── public/               # Archivos estáticos
├── server.js            # Punto de entrada del servidor
└── package.json
```

## 🛠️ Tecnologías

- **Express.js** - Framework web
- **CORS** - Manejo de CORS
- **dotenv** - Variables de entorno
- **nodemon** - Desarrollo (recarga automática)

## 📝 API Endpoints

### Base URL: `http://localhost:3000`

- `GET /` - Información de la API
- `GET /api` - Información de endpoints disponibles

## 🌟 Próximos pasos

1. Configura tu base de datos
2. Implementa los modelos en `src/models/`
3. Desarrolla los controladores en `src/controllers/`
4. Define las rutas en `src/routes/`
5. Añade tests en `tests/`

## 📄 Licencia

ISC
