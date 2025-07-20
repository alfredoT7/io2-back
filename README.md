# API de Pastillas - Backend

API REST desarrollada con Express.js para la gestión de pastillas.

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
