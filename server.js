// Cargar variables de entorno
require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/database');
const whatsappService = require('./src/services/whatsappService');

const PORT = process.env.PORT || 3000;

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // Conectar a MongoDB
    await connectDB();
    
    // Inicializar WhatsApp (en desarrollo únicamente)
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔄 Inicializando WhatsApp Service...');
      whatsappService.initialize().catch(error => {
        console.error('⚠️ WhatsApp no se pudo inicializar:', error.message);
        console.log('📱 Las compras funcionarán sin notificaciones de WhatsApp');
      });
    } else {
      console.log('🏭 Modo producción: WhatsApp deshabilitado');
    }
    
    // Iniciar el servidor
    app.listen(PORT, () => {
      console.log('🎉 ¡Servidor iniciado exitosamente!');
      console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
      console.log(`📱 API disponible en: http://localhost:${PORT}`);
      console.log(`� Documentación: http://localhost:${PORT}/api`);
      console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
      console.log(`📄 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log('=====================================');
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error.message);
    process.exit(1);
  }
};

startServer();
