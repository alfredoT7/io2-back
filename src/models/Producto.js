const mongoose = require('mongoose');

// Contador para generar IDs incrementales
const contadorSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const Contador = mongoose.model('Contador', contadorSchema);

// Esquema de Producto
const productoSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true
  },
  title: {
    type: String,
    required: [true, 'El título del producto es requerido'],
    trim: true,
    maxlength: [200, 'El título no puede exceder 200 caracteres']
  },
  price: {
    type: Number,
    required: [true, 'El precio es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  description: {
    type: String,
    required: [true, 'La descripción es requerida'],
    trim: true,
    maxlength: [1000, 'La descripción no puede exceder 1000 caracteres']
  },
  category: {
    type: String,
    required: [true, 'La categoría es requerida'],
    trim: true
  },
  image: {
    type: String,
    required: [true, 'La imagen es requerida'],
    validate: {
      validator: function(v) {
        // Validar URL con extensión de imagen
        const isValidURL = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
        
        // Validar base64 (data:image/tipo;base64,...)
        const isValidBase64 = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/.test(v);
        
        return isValidURL || isValidBase64;
      },
      message: 'La imagen debe ser una URL válida (jpg, jpeg, png, gif, webp) o una imagen en base64'
    }
  },
  rating: {
    rate: {
      type: Number,
      default: 0,
      min: [0, 'La calificación no puede ser menor a 0'],
      max: [5, 'La calificación no puede ser mayor a 5']
    },
    count: {
      type: Number,
      default: 0,
      min: [0, 'El conteo no puede ser negativo']
    }
  },
  // Información del vendedor que creó el producto
  vendedor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'El vendedor es requerido']
  },
  activo: {
    type: Boolean,
    default: true
  },
  stock: {
    type: Number,
    default: 1,
    min: [0, 'El stock no puede ser negativo']
  }
}, {
  timestamps: true,
  collection: 'productos'
});

// Pre-hook para generar ID incremental antes de guardar
productoSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const contador = await Contador.findByIdAndUpdate(
        'productoid',
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.id = contador.seq;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Índices para mejorar el rendimiento
productoSchema.index({ category: 1 });
productoSchema.index({ vendedor: 1 });
productoSchema.index({ activo: 1 });
productoSchema.index({ price: 1 });
productoSchema.index({ 'rating.rate': -1 });
productoSchema.index({ id: 1 }, { unique: true });

// Configurar JSON para devolver exactamente la estructura requerida
productoSchema.set('toJSON', { 
  transform: function(doc, ret) {
    // Crear el objeto con la estructura exacta requerida
    return {
      id: ret.id,
      title: ret.title,
      price: ret.price,
      description: ret.description,
      category: ret.category,
      image: ret.image,
      rating: {
        rate: ret.rating.rate,
        count: ret.rating.count
      }
    };
  }
});

// Método estático para buscar por categoría
productoSchema.statics.findByCategory = function(category) {
  return this.find({ category, activo: true });
};

// Método estático para buscar por vendedor
productoSchema.statics.findByVendedor = function(vendedorId) {
  return this.find({ vendedor: vendedorId, activo: true });
};

// Método para actualizar rating
productoSchema.methods.actualizarRating = function(nuevaCalificacion) {
  const totalCalificaciones = this.rating.count;
  const ratingActual = this.rating.rate;
  
  // Calcular nuevo promedio
  const nuevoTotal = totalCalificaciones + 1;
  const nuevoRating = ((ratingActual * totalCalificaciones) + nuevaCalificacion) / nuevoTotal;
  
  this.rating.rate = Math.round(nuevoRating * 10) / 10; // Redondear a 1 decimal
  this.rating.count = nuevoTotal;
  
  return this.save();
};

const Producto = mongoose.model('Producto', productoSchema);

module.exports = Producto;
