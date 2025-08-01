const express = require('express');
const router = express.Router();
const { 
  crearCompra, 
  obtenerOrdenesPorUsuario, 
  obtenerOrdenPorId,
  actualizarEstadoOrden,
  obtenerEstadisticasUsuario,
  obtenerTodasLasCompras,
  verificarCompra
} = require('../controllers/comprasController');
const { authMiddleware } = require('../middleware');

// Ruta para crear una nueva compra
// POST /api/compras
router.post('/', authMiddleware, crearCompra);

// Ruta para obtener TODAS las compras (para administradores)
// GET /api/compras
// Query params opcionales: page, limit, estado, fechaInicio, fechaFin, usuario
router.get('/', authMiddleware, obtenerTodasLasCompras);

// Ruta para verificar una compra (cambiar de pendiente a verificado)
// PATCH /api/compras/:idOrden/verificar
router.patch('/:idOrden/verificar', authMiddleware, verificarCompra);

// Ruta para obtener todas las órdenes de un usuario específico
// GET /api/compras/usuario/:idUsuario
// Query params opcionales: page, limit, estado, fechaInicio, fechaFin
router.get('/usuario/:idUsuario', authMiddleware, obtenerOrdenesPorUsuario);

// Ruta para obtener una orden específica por ID
// GET /api/compras/:idOrden
router.get('/:idOrden', authMiddleware, obtenerOrdenPorId);

// Ruta para actualizar el estado de una orden
// PUT /api/compras/:idOrden/estado
router.put('/:idOrden/estado', authMiddleware, actualizarEstadoOrden);

// Ruta para obtener estadísticas de compras de un usuario
// GET /api/compras/usuario/:idUsuario/estadisticas
router.get('/usuario/:idUsuario/estadisticas', authMiddleware, obtenerEstadisticasUsuario);

module.exports = router;
