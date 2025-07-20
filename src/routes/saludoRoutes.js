const express = require('express');
const router = express.Router();
const saludoController = require('../controllers/saludoController');

// Rutas del controlador de saludo
router.get('/', saludoController.saludoSimple);
router.get('/personalizado/:nombre', saludoController.saludoPersonalizado);
router.post('/datos', saludoController.saludoConDatos);
router.get('/query', saludoController.saludoConQuery);
router.get('/error', saludoController.saludoConError);
router.get('/servidor', saludoController.infoServidor);

module.exports = router;
