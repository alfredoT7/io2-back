const express = require('express');
const whatsappService = require('../services/whatsappService');
const { authMiddleware } = require('../middleware');

const router = express.Router();

// Obtener estado de WhatsApp
router.get('/status', authMiddleware, (req, res) => {
  try {
    const status = whatsappService.getStatus();
    res.json({
      success: true,
      whatsapp: status
    });
  } catch (error) {
    console.error('Error al obtener estado de WhatsApp:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estado de WhatsApp',
      error: error.message
    });
  }
});

// Reinicializar WhatsApp (solo para desarrollo)
router.post('/reinit', authMiddleware, async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Acción no permitida en producción'
      });
    }

    console.log('🔄 Reinicializando WhatsApp por solicitud manual...');
    await whatsappService.destroy();
    await whatsappService.initialize();
    
    res.json({
      success: true,
      message: 'WhatsApp reinicializado exitosamente'
    });
  } catch (error) {
    console.error('Error al reinicializar WhatsApp:', error);
    res.status(500).json({
      success: false,
      message: 'Error al reinicializar WhatsApp',
      error: error.message
    });
  }
});

module.exports = router;
