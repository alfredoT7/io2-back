const mongoose = require('mongoose');
const { dbConfig } = require('./index');

const connectDB = async () => {
  try {
    console.log('🔄 Conectando a MongoDB...');
    
    const conn = await mongoose.connect(dbConfig.uri, dbConfig.options);
    
    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
    console.log(`📁 Base de datos: ${conn.connection.name}`);
    
    return conn;
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    console.error('🔍 Verifica:');
    console.error('  - Que tu IP esté en la whitelist de MongoDB Atlas');
    console.error('  - Que el password sea correcto');
    console.error('  - Que tengas acceso a internet');
    process.exit(1);
  }
};

// Manejar eventos de conexión
mongoose.connection.on('connected', () => {
  console.log('🟢 Mongoose conectado a MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('🔴 Error de conexión de Mongoose:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🟡 Mongoose desconectado de MongoDB');
});

// Cerrar conexión cuando la aplicación se termina
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🔐 Conexión de MongoDB cerrada debido a terminación de la aplicación');
  process.exit(0);
});

module.exports = connectDB;
