const Compra = require('../models/Compra');
const Usuario = require('../models/Usuario');
const Producto = require('../models/Producto');
const mongoose = require('mongoose');

// Crear una nueva compra
const crearCompra = async (req, res) => {
  try {
    const compraData = req.body;
    
    // Validar que el usuario existe usando el ID numérico
    const usuario = await Usuario.findOne({ id: compraData.idUsuario, activo: true });
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Validar que todos los productos existen
    for (const producto of compraData.productos) {
      const productoExiste = await Producto.findById(producto.idProducto);
      if (!productoExiste) {
        return res.status(404).json({
          success: false,
          message: `Producto con ID ${producto.idProducto} no encontrado`
        });
      }
    }

    // Validar cálculos
    const subtotalCalculado = compraData.productos.reduce((total, producto) => {
      const subtotalProducto = producto.precio * producto.cantidad;
      if (subtotalProducto !== producto.subtotal) {
        throw new Error(`Subtotal incorrecto para producto ${producto.titulo}`);
      }
      return total + subtotalProducto;
    }, 0);

    if (Math.abs(subtotalCalculado - compraData.resumenCompra.subtotal) > 0.01) {
      return res.status(400).json({
        success: false,
        message: 'El subtotal no coincide con los cálculos'
      });
    }

    const totalCalculado = compraData.resumenCompra.subtotal + 
                          compraData.resumenCompra.impuestos - 
                          compraData.resumenCompra.descuentos;

    if (Math.abs(totalCalculado - compraData.resumenCompra.total) > 0.01) {
      return res.status(400).json({
        success: false,
        message: 'El total no coincide con los cálculos'
      });
    }

    // Si no se proporciona número de orden, se generará automáticamente
    const nuevaCompra = new Compra(compraData);
    const compraGuardada = await nuevaCompra.save();

    // Poblar la información del usuario y productos para la respuesta
    await compraGuardada.populate('idUsuario', 'id nombreCompleto email');
    await compraGuardada.populate('productos.idProducto', 'titulo precio imagen');

    res.status(201).json({
      success: true,
      message: 'Compra registrada exitosamente',
      data: compraGuardada
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

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'El número de orden ya existe'
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

    // Construir filtros con el ID numérico
    const filtros = { idUsuario: parseInt(idUsuario) };

    if (estado) {
      filtros.estado = estado;
    }

    if (fechaInicio || fechaFin) {
      filtros.fechaPedido = {};
      if (fechaInicio) {
        filtros.fechaPedido.$gte = new Date(fechaInicio);
      }
      if (fechaFin) {
        filtros.fechaPedido.$lte = new Date(fechaFin);
      }
    }

    // Configurar paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Obtener órdenes con paginación
    const ordenes = await Compra.find(filtros)
      .populate('idUsuario', 'id nombreCompleto email')
      .populate('productos.idProducto', 'titulo precio imagen')
      .sort({ fechaPedido: -1 })
      .skip(skip)
      .limit(limitNum);

    // Contar total de órdenes
    const totalOrdenes = await Compra.countDocuments(filtros);
    const totalPaginas = Math.ceil(totalOrdenes / limitNum);

    res.status(200).json({
      success: true,
      message: 'Órdenes obtenidas exitosamente',
      data: {
        ordenes,
        paginacion: {
          paginaActual: parseInt(page),
          totalPaginas,
          totalOrdenes,
          ordenesPorPagina: limitNum
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener órdenes:', error);
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
      { $match: { idUsuario: idUsuarioNumerico } },
      {
        $group: {
          _id: null,
          totalOrdenes: { $sum: 1 },
          totalGastado: { $sum: '$resumenCompra.total' },
          promedioOrden: { $avg: '$resumenCompra.total' },
          ordenesPorEstado: {
            $push: {
              estado: '$estado',
              total: '$resumenCompra.total'
            }
          }
        }
      }
    ]);

    // Contar órdenes por estado
    const ordenesPorEstado = await Compra.aggregate([
      { $match: { idUsuario: idUsuarioNumerico } },
      {
        $group: {
          _id: '$estado',
          cantidad: { $sum: 1 }
        }
      }
    ]);

    const resultado = estadisticas[0] || {
      totalOrdenes: 0,
      totalGastado: 0,
      promedioOrden: 0
    };

    resultado.ordenesPorEstado = ordenesPorEstado.reduce((acc, item) => {
      acc[item._id] = item.cantidad;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      message: 'Estadísticas obtenidas exitosamente',
      data: resultado
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
