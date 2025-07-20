const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosController');
const { authMiddleware, verificarTipoUsuario } = require('../middleware');

// Rutas públicas (no requieren autenticación)
router.get('/', productosController.obtenerTodos);
router.get('/:id', productosController.obtenerPorId);
router.get('/category/:category', productosController.obtenerPorCategoria);

// Rutas protegidas para vendedores
router.post('/', authMiddleware, verificarTipoUsuario('vendedor'), productosController.crear);
router.put('/:id', authMiddleware, verificarTipoUsuario('vendedor'), productosController.actualizar);
router.delete('/:id', authMiddleware, verificarTipoUsuario('vendedor'), productosController.eliminar);
router.get('/mis/productos', authMiddleware, verificarTipoUsuario('vendedor'), productosController.misProductos);

// Rutas protegidas para compradores
router.post('/:id/rating', authMiddleware, verificarTipoUsuario('comprador'), productosController.calificar);

module.exports = router;
