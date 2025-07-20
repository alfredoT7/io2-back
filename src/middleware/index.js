const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const { jwtConfig } = require('../config');

// Middleware de autenticación
const authMiddleware = async (req, res, next) => {
  try {
    let token;

    // Obtener token del header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        error: 'Acceso denegado',
        message: 'No se proporcionó token de autorización'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, jwtConfig.secret);
    
    // Obtener usuario del token usando el ID numérico
    const usuario = await Usuario.findOne({ id: decoded.id, activo: true });
    
    if (!usuario) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'El usuario no existe o está inactivo'
      });
    }

    // Agregar usuario al request
    req.usuario = usuario;
    next();

  } catch (error) {
    console.error('Error en autenticación:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'El token proporcionado no es válido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado',
        message: 'El token ha expirado, por favor inicia sesión nuevamente'
      });
    }

    return res.status(500).json({
      error: 'Error de autenticación',
      message: 'Error interno en la verificación del token'
    });
  }
};

// Middleware para verificar tipo de usuario
const verificarTipoUsuario = (...tiposPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        error: 'Usuario no autenticado',
        message: 'Debes estar autenticado para acceder a este recurso'
      });
    }

    if (!tiposPermitidos.includes(req.usuario.tipoUsuario)) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: `Solo usuarios de tipo ${tiposPermitidos.join(' o ')} pueden acceder a este recurso`
      });
    }

    next();
  };
};

// Middleware de logging
const loggerMiddleware = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const userInfo = req.usuario ? `Usuario: ${req.usuario.email} (${req.usuario.tipoUsuario})` : 'Usuario no autenticado';
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip} - ${userInfo}`);
  next();
};

// Middleware de validación para registro
const validarRegistro = (req, res, next) => {
  const { nombreCompleto, numeroCelular, email, password, tipoUsuario } = req.body;

  const errores = [];

  if (!nombreCompleto || nombreCompleto.trim().length < 2) {
    errores.push('El nombre completo es requerido y debe tener al menos 2 caracteres');
  }

  // Validar número de celular boliviano
  if (!numeroCelular) {
    errores.push('El número de celular es requerido');
  } else {
    // Limpiar el número (remover espacios, guiones, paréntesis, +)
    const cleanNumber = numeroCelular.replace(/[\s\-\(\)\+]/g, '');
    
    // Validar formatos bolivianos:
    // 1. 8 dígitos empezando con 6, 7 u 8
    // 2. Con código de país 591 seguido del número celular
    const isValidBolivian = /^[678]\d{7}$/.test(cleanNumber) || /^591[678]\d{7}$/.test(cleanNumber);
    
    if (!isValidBolivian) {
      errores.push('El número de celular debe ser un número boliviano válido (ej: 70000000, +591 70000000)');
    }
  }

  if (!email || !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    errores.push('El correo electrónico es requerido y debe tener un formato válido');
  }

  if (!password || password.length < 6) {
    errores.push('La contraseña es requerida y debe tener al menos 6 caracteres');
  }

  if (!tipoUsuario || !['comprador', 'vendedor'].includes(tipoUsuario)) {
    errores.push('El tipo de usuario debe ser "comprador" o "vendedor"');
  }

  // Validar dirección solo para compradores
  if (tipoUsuario === 'comprador' && (!req.body.direccion || req.body.direccion.trim().length === 0)) {
    errores.push('La dirección es requerida para usuarios compradores');
  }

  if (errores.length > 0) {
    return res.status(400).json({
      error: 'Datos de validación incorrectos',
      message: 'Hay errores en los datos proporcionados',
      errores
    });
  }

  next();
};

module.exports = {
  authMiddleware,
  verificarTipoUsuario,
  loggerMiddleware,
  validarRegistro
};
