const mongoose = require('mongoose');
const Usuario = require('./src/models/Usuario');

// Script para migrar usuarios existentes y asignarles IDs numéricos
async function migrarUsuarios() {
  try {
    console.log('🔄 Iniciando migración de usuarios...');
    
    // Conectar a MongoDB
    await mongoose.connect('mongodb+srv://alfredo:notebok456@recluster.cbmnw.mongodb.net/pastillas_db');
    console.log('✅ Conectado a MongoDB');

    // Obtener todos los usuarios que no tienen ID numérico
    const usuariosSinId = await Usuario.find({ 
      $or: [
        { id: { $exists: false } },
        { id: null }
      ]
    }).sort({ createdAt: 1 });

    console.log(`📊 Usuarios encontrados sin ID numérico: ${usuariosSinId.length}`);

    if (usuariosSinId.length === 0) {
      console.log('✅ No hay usuarios para migrar');
      return;
    }

    // Buscar el último ID numérico usado
    const ultimoUsuarioConId = await Usuario.findOne({ 
      id: { $exists: true, $ne: null } 
    }).sort({ id: -1 });
    
    let contadorId = ultimoUsuarioConId ? ultimoUsuarioConId.id + 1 : 1;

    console.log(`🚀 Iniciando asignación desde ID: ${contadorId}`);

    // Asignar IDs numéricos a cada usuario
    for (const usuario of usuariosSinId) {
      usuario.id = contadorId;
      await usuario.save();
      console.log(`✅ Usuario ${usuario.email} -> ID: ${contadorId}`);
      contadorId++;
    }

    console.log('🎉 Migración completada exitosamente');
    console.log(`📈 Total de usuarios migrados: ${usuariosSinId.length}`);
    
  } catch (error) {
    console.error('❌ Error en la migración:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    process.exit();
  }
}

// Ejecutar migración si el script se ejecuta directamente
if (require.main === module) {
  migrarUsuarios();
}

module.exports = migrarUsuarios;
