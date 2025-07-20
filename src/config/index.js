// Configuración de MongoDB
const dbConfig = {
  uri: process.env.MONGODB_URI?.replace('<db_password>', process.env.DB_PASSWORD) || 'mongodb://localhost:27017/pastillas_local',
  options: {
    // useNewUrlParser: true, // Deprecated en Mongoose 6+
    // useUnifiedTopology: true, // Deprecated en Mongoose 6+
  }
};

// Configuración del servidor
const serverConfig = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development'
};

// Configuración JWT
const jwtConfig = {
  secret: process.env.JWT_SECRET || 'tu-secret-key-aqui',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h'
};

module.exports = {
  dbConfig,
  serverConfig,
  jwtConfig
};
