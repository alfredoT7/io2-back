const mongoose = require('mongoose');

const compraSchema = new mongoose.Schema({
  idUsuario: {
    type: Number,
    ref: 'Usuario',
    required: [true, 'El ID del usuario es requerido']
  },
  productos: [{
    idProducto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Producto',
      required: [true, 'El ID del producto es requerido']
    },
    titulo: {
      type: String,
      required: [true, 'El título del producto es requerido']
    },
    precio: {
      type: Number,
      required: [true, 'El precio del producto es requerido'],
      min: [0, 'El precio debe ser mayor a 0']
    },
    cantidad: {
      type: Number,
      required: [true, 'La cantidad es requerida'],
      min: [1, 'La cantidad debe ser mayor a 0']
    },
    subtotal: {
      type: Number,
      required: [true, 'El subtotal es requerido'],
      min: [0, 'El subtotal debe ser mayor o igual a 0']
    }
  }],
  resumenCompra: {
    subtotal: {
      type: Number,
      required: [true, 'El subtotal es requerido'],
      min: [0, 'El subtotal debe ser mayor o igual a 0']
    },
    impuestos: {
      type: Number,
      required: [true, 'Los impuestos son requeridos'],
      min: [0, 'Los impuestos deben ser mayor o igual a 0']
    },
    descuentos: {
      type: Number,
      default: 0,
      min: [0, 'Los descuentos deben ser mayor o igual a 0']
    },
    total: {
      type: Number,
      required: [true, 'El total es requerido'],
      min: [0, 'El total debe ser mayor a 0']
    }
  },
  datosEnvio: {
    direccion: {
      type: String,
      required: [true, 'La dirección es requerida'],
      trim: true
    },
    ciudad: {
      type: String,
      required: [true, 'La ciudad es requerida'],
      trim: true
    },
    codigoPostal: {
      type: String,
      required: [true, 'El código postal es requerido'],
      trim: true
    },
    pais: {
      type: String,
      required: [true, 'El país es requerido'],
      trim: true
    },
    telefono: {
      type: String,
      required: [true, 'El teléfono es requerido'],
      trim: true,
      validate: {
        validator: function(telefono) {
          // Validación para números bolivianos y internacionales
          const bolivianPhoneRegex = /^[6-8]\d{7}$/;
          const internationalPhoneRegex = /^(\+591\s?)?[6-8]\d{7}$/;
          const generalInternationalRegex = /^\+\d{1,4}\s?\d{6,14}$/;
          
          return bolivianPhoneRegex.test(telefono) || 
                 internationalPhoneRegex.test(telefono) || 
                 generalInternationalRegex.test(telefono);
        },
        message: 'El teléfono debe ser un número válido'
      }
    }
  },
  metodoPago: {
    tipo: {
      type: String,
      required: [true, 'El tipo de método de pago es requerido'],
      enum: {
        values: ['tarjeta_credito', 'tarjeta_debito', 'transferencia', 'efectivo', 'paypal'],
        message: 'Tipo de pago no válido'
      }
    },
    ultimosDigitos: {
      type: String,
      validate: {
        validator: function(digitos) {
          // Solo validar si el tipo de pago es tarjeta
          if (this.metodoPago.tipo === 'tarjeta_credito' || this.metodoPago.tipo === 'tarjeta_debito') {
            return digitos && /^\d{4}$/.test(digitos);
          }
          return true;
        },
        message: 'Los últimos dígitos deben ser 4 números'
      }
    },
    fechaTransaccion: {
      type: Date,
      required: [true, 'La fecha de transacción es requerida']
    }
  },
  fechaPedido: {
    type: Date,
    default: Date.now,
    required: [true, 'La fecha del pedido es requerida']
  },
  estado: {
    type: String,
    enum: {
      values: ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'],
      message: 'Estado no válido'
    },
    default: 'pendiente'
  },
  numeroOrden: {
    type: String,
    required: [true, 'El número de orden es requerido'],
    unique: true,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para mejorar rendimiento
compraSchema.index({ idUsuario: 1, fechaPedido: -1 });
compraSchema.index({ numeroOrden: 1 });
compraSchema.index({ estado: 1 });

// Virtual para calcular cantidad total de productos
compraSchema.virtual('cantidadTotalProductos').get(function() {
  return this.productos.reduce((total, producto) => total + producto.cantidad, 0);
});

// Método para generar número de orden automático
compraSchema.statics.generarNumeroOrden = async function() {
  const fecha = new Date();
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  
  // Buscar el último número de orden del día
  const inicioFecha = `ORD-${year}${month}${day}`;
  const ultimaOrden = await this.findOne({
    numeroOrden: { $regex: `^${inicioFecha}` }
  }).sort({ numeroOrden: -1 });
  
  let contador = 1;
  if (ultimaOrden) {
    const ultimoNumero = ultimaOrden.numeroOrden.split('-').pop();
    contador = parseInt(ultimoNumero) + 1;
  }
  
  return `${inicioFecha}-${String(contador).padStart(3, '0')}`;
};

// Middleware pre-save para generar número de orden si no existe
compraSchema.pre('save', async function(next) {
  if (!this.numeroOrden) {
    this.numeroOrden = await this.constructor.generarNumeroOrden();
  }
  next();
});

module.exports = mongoose.model('Compra', compraSchema);
