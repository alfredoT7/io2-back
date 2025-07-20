const mongoose = require('mongoose');

const compraSchema = new mongoose.Schema({
  usuario: {
    type: Number,
    ref: 'Usuario',
    required: [true, 'El ID del usuario es requerido']
  },
  productos: [{
    id: {
      type: Number,
      required: [true, 'El ID del producto es requerido']
    },
    nombre: {
      type: String,
      required: [true, 'El nombre del producto es requerido']
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
      min: [0, 'El subtotal debe ser mayor o igual a 0']
    },
    imagen: {
      type: String
    }
  }],
  total: {
    type: Number,
    required: [true, 'El total es requerido'],
    min: [0, 'El total debe ser mayor a 0']
  },
  envio: {
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
    telefono: {
      type: String,
      required: [true, 'El teléfono es requerido'],
      trim: true,
      validate: {
        validator: function(telefono) {
          // Validación para números bolivianos
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
    type: String,
    required: [true, 'El método de pago es requerido'],
    enum: {
      values: ['tarjeta', 'efectivo', 'transferencia', 'paypal'],
      message: 'Método de pago no válido'
    }
  },
  estado: {
    type: String,
    enum: {
      values: ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'],
      message: 'Estado no válido'
    },
    default: 'pendiente'
  },
  notas: {
    type: String,
    default: ''
  },
  numeroOrden: {
    type: String,
    unique: true,
    trim: true
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para mejorar rendimiento
compraSchema.index({ usuario: 1, fechaCreacion: -1 });
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
