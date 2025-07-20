const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const usuarioSchema = new mongoose.Schema({
  nombreCompleto: {
    type: String,
    required: [true, 'El nombre completo es requerido'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  numeroCelular: {
    type: String,
    required: [true, 'El número de celular es requerido'],
    trim: true,
    validate: {
      validator: function(v) {
        // Formato boliviano: 
        // - 8 dígitos empezando con 6, 7 u 8: 60000000, 70000000, 80000000
        // - Con código de país: +59160000000 o 59160000000
        // - Con espacios o guiones: +591 6000-0000, 591-6000-0000, etc.
        
        // Limpiar el número (remover espacios, guiones, paréntesis, +)
        const cleanNumber = v.replace(/[\s\-\(\)\+]/g, '');
        
        // Validar formatos bolivianos:
        // 1. 8 dígitos empezando con 6, 7 u 8
        if (/^[678]\d{7}$/.test(cleanNumber)) {
          return true;
        }
        
        // 2. Con código de país 591 seguido del número celular
        if (/^591[678]\d{7}$/.test(cleanNumber)) {
          return true;
        }
        
        return false;
      },
      message: 'El número de celular debe ser un número boliviano válido (ej: 70000000, +591 70000000)'
    }
  },
  email: {
    type: String,
    required: [true, 'El correo electrónico es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'El formato del correo electrónico no es válido'
    }
  },
  direccion: {
    type: String,
    required: function() {
      return this.tipoUsuario === 'comprador';
    },
    trim: true,
    maxlength: [200, 'La dirección no puede exceder 200 caracteres']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },
  tipoUsuario: {
    type: String,
    required: [true, 'El tipo de usuario es requerido'],
    enum: {
      values: ['comprador', 'vendedor'],
      message: 'El tipo de usuario debe ser "comprador" o "vendedor"'
    }
  },
  activo: {
    type: Boolean,
    default: true
  },
  fechaUltimoLogin: {
    type: Date
  }
}, {
  timestamps: true,
  collection: 'usuarios'
});

// Índices
usuarioSchema.index({ email: 1 });
usuarioSchema.index({ tipoUsuario: 1 });
usuarioSchema.index({ activo: 1 });

// Pre-hook para normalizar el número de celular antes de guardar
usuarioSchema.pre('save', function(next) {
  if (this.isModified('numeroCelular')) {
    // Limpiar y normalizar el número de celular
    const cleanNumber = this.numeroCelular.replace(/[\s\-\(\)\+]/g, '');
    
    // Si tiene código de país 591, mantenerlo
    if (cleanNumber.startsWith('591')) {
      this.numeroCelular = cleanNumber;
    } else if (/^[678]\d{7}$/.test(cleanNumber)) {
      // Si es solo el número local, mantenerlo así
      this.numeroCelular = cleanNumber;
    }
  }
  next();
});

// Pre-hook para hashear la contraseña antes de guardar
usuarioSchema.pre('save', async function(next) {
  // Solo hashear la contraseña si ha sido modificada (o es nueva)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash de la contraseña con salt de 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar contraseñas
usuarioSchema.methods.compararPassword = async function(passwordIngresada) {
  return await bcrypt.compare(passwordIngresada, this.password);
};

// Método para actualizar fecha de último login
usuarioSchema.methods.actualizarUltimoLogin = function() {
  this.fechaUltimoLogin = new Date();
  return this.save();
};

// Método virtual para verificar si es comprador
usuarioSchema.virtual('esComprador').get(function() {
  return this.tipoUsuario === 'comprador';
});

// Método virtual para verificar si es vendedor
usuarioSchema.virtual('esVendedor').get(function() {
  return this.tipoUsuario === 'vendedor';
});

// Configurar JSON para no mostrar password
usuarioSchema.methods.toJSON = function() {
  const usuario = this.toObject();
  delete usuario.password;
  return usuario;
};

// Método estático para encontrar por email
usuarioSchema.statics.findByEmail = function(email) {
  return this.findOne({ email, activo: true });
};

// Método estático para encontrar por tipo de usuario
usuarioSchema.statics.findByTipo = function(tipoUsuario) {
  return this.find({ tipoUsuario, activo: true });
};

const Usuario = mongoose.model('Usuario', usuarioSchema);

module.exports = Usuario;
