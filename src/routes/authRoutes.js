const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware, validarRegistro } = require('../middleware');

// Rutas públicas (no requieren autenticación)
router.post('/registro', validarRegistro, authController.registro);
router.post('/login', authController.login);

// Rutas protegidas (requieren autenticación)
router.get('/perfil', authMiddleware, authController.perfil);
router.put('/perfil', authMiddleware, authController.actualizarPerfil);

// Ruta para listar usuarios (para desarrollo/admin)
router.get('/usuarios', authMiddleware, authController.listarUsuarios);

module.exports = router;
