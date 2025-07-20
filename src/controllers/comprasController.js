const Compra = require('../models/Compra');
const Usuario = require('../models/Usuario');
const Producto = require('../models/Producto');
const mongoose = require('mongoose');
const whatsappService = require('../services/whatsappService');

// Crear una nueva compra
const crearCompra = async (req, res) => {
  try {
    const compraData = req.body;
    
    // El usuario viene del middleware de autenticación
    const usuario = req.usuario;
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Calcular subtotales y total
    const productosConSubtotal = compraData.productos.map(producto => ({
      ...producto,
      subtotal: producto.precio * producto.cantidad
    }));

    const total = productosConSubtotal.reduce((sum, producto) => sum + producto.subtotal, 0);

    // Crear la compra con el usuario del token
    const nuevaCompra = new Compra({
      usuario: usuario.id, // Usar el ID numérico del usuario autenticado
      productos: productosConSubtotal,
      total: total,
      metodoPago: compraData.metodoPago,
      envio: compraData.envio,
      notas: compraData.notas || '',
      estado: 'pendiente'
    });

    const compraGuardada = await nuevaCompra.save();

    // *** NUEVO: Enviar mensaje de WhatsApp ***
    try {
      await whatsappService.enviarMensajeCompra(compraGuardada, usuario);
      console.log('✅ Mensaje de WhatsApp enviado para orden:', compraGuardada.numeroOrden);
    } catch (whatsappError) {
      console.error('⚠️ Error al enviar WhatsApp (compra registrada correctamente):', whatsappError);
      // No fallar la compra si WhatsApp falla
    }

    res.status(201).json({
      success: true,
      message: 'Compra registrada exitosamente',
      compra: compraGuardada
    });

  } catch (error) {
    console.error('Error al crear compra:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Datos de compra inválidos',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener órdenes de un usuario
const obtenerOrdenesPorUsuario = async (req, res) => {
  try {
    const { idUsuario } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      estado, 
      fechaInicio, 
      fechaFin 
    } = req.query;

    // Validar que el usuario existe usando el ID numérico
    const usuario = await Usuario.findOne({ id: parseInt(idUsuario), activo: true });
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Construir filtros con el campo usuario (no idUsuario)
    const filtros = { usuario: parseInt(idUsuario) };

    if (estado) {
      filtros.estado = estado;
    }

    if (fechaInicio || fechaFin) {
      filtros.fechaCreacion = {};
      if (fechaInicio) {
        filtros.fechaCreacion.$gte = new Date(fechaInicio);
      }
      if (fechaFin) {
        filtros.fechaCreacion.$lte = new Date(fechaFin);
      }
    }

    // Configurar paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Obtener compras con paginación
    const compras = await Compra.find(filtros)
      .sort({ fechaCreacion: -1 })
      .skip(skip)
      .limit(limitNum);

    // Contar total de compras
    const totalCompras = await Compra.countDocuments(filtros);
    const totalPaginas = Math.ceil(totalCompras / limitNum);

    res.status(200).json({
      success: true,
      message: 'Compras obtenidas exitosamente',
      compras,
      total: totalCompras,
      paginacion: {
        paginaActual: parseInt(page),
        totalPaginas,
        totalCompras,
        comprasPorPagina: limitNum
      }
    });

  } catch (error) {
    console.error('Error al obtener compras:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener una orden específica por ID
const obtenerOrdenPorId = async (req, res) => {
  try {
    const { idOrden } = req.params;

    const orden = await Compra.findById(idOrden)
      .populate('idUsuario', 'id nombreCompleto email numeroCelular')
      .populate('productos.idProducto', 'titulo precio imagen descripcion');

    if (!orden) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Orden obtenida exitosamente',
      data: orden
    });

  } catch (error) {
    console.error('Error al obtener orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar estado de una orden
const actualizarEstadoOrden = async (req, res) => {
  try {
    const { idOrden } = req.params;
    const { estado } = req.body;

    const estadosValidos = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'];
    
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado no válido',
        estadosValidos
      });
    }

    const orden = await Compra.findByIdAndUpdate(
      idOrden,
      { estado },
      { new: true, runValidators: true }
    ).populate('idUsuario', 'id nombreCompleto email')
     .populate('productos.idProducto', 'titulo precio');

    if (!orden) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Estado de orden actualizado exitosamente',
      data: orden
    });

  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estadísticas de compras de un usuario
const obtenerEstadisticasUsuario = async (req, res) => {
  try {
    const { idUsuario } = req.params;

    // Validar que el usuario existe usando el ID numérico
    const usuario = await Usuario.findOne({ id: parseInt(idUsuario), activo: true });
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const idUsuarioNumerico = parseInt(idUsuario);

    const estadisticas = await Compra.aggregate([
      { $match: { usuario: idUsuarioNumerico } },
      {
        $group: {
          _id: null,
          totalCompras: { $sum: 1 },
          montoTotal: { $sum: '$total' },
          promedioCompra: { $avg: '$total' }
        }
      }
    ]);

    // Contar compras por estado
    const comprasPorEstado = await Compra.aggregate([
      { $match: { usuario: idUsuarioNumerico } },
      {
        $group: {
          _id: '$estado',
          cantidad: { $sum: 1 }
        }
      }
    ]);

    // Método de pago más usado
    const metodoPagoMasUsado = await Compra.aggregate([
      { $match: { usuario: idUsuarioNumerico } },
      {
        $group: {
          _id: '$metodoPago',
          cantidad: { $sum: 1 }
        }
      },
      { $sort: { cantidad: -1 } },
      { $limit: 1 }
    ]);

    const resultado = estadisticas[0] || {
      totalCompras: 0,
      montoTotal: 0,
      promedioCompra: 0
    };

    resultado.estadoCompras = comprasPorEstado.reduce((acc, item) => {
      acc[item._id] = item.cantidad;
      return acc;
    }, {});

    resultado.metodoPagoMasUsado = metodoPagoMasUsado[0] ? metodoPagoMasUsado[0]._id : null;

    res.status(200).json({
      success: true,
      message: 'Estadísticas obtenidas exitosamente',
      estadisticas: resultado
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  crearCompra,
  obtenerOrdenesPorUsuario,
  obtenerOrdenPorId,
  actualizarEstadoOrden,
  obtenerEstadisticasUsuario
};
