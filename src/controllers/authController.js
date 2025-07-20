const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config');

// Función para generar JWT
const generarToken = (id) => {
  return jwt.sign({ id }, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  });
};

const authController = {
  // Registro de usuarios
  registro: async (req, res) => {
    try {
      const { 
        nombreCompleto, 
        numeroCelular, 
        email, 
        direccion, 
        password, 
        tipoUsuario 
      } = req.body;

      // Validar que el email no esté registrado
      const usuarioExistente = await Usuario.findByEmail(email);
      if (usuarioExistente) {
        return res.status(400).json({
          error: 'Email ya registrado',
          message: 'Ya existe un usuario con este correo electrónico'
        });
      }

      // Validar que para vendedores no se requiera dirección
      if (tipoUsuario === 'vendedor' && direccion) {
        delete req.body.direccion; // Eliminar dirección para vendedores
      }

      // Crear nuevo usuario
      const nuevoUsuario = new Usuario({
        nombreCompleto,
        numeroCelular,
        email,
        direccion: tipoUsuario === 'comprador' ? direccion : undefined,
        password,
        tipoUsuario
      });

      const usuarioGuardado = await nuevoUsuario.save();

      // Generar token
      const token = generarToken(usuarioGuardado._id);

      res.status(201).json({
        message: `${tipoUsuario === 'comprador' ? 'Comprador' : 'Vendedor'} registrado exitosamente`,
        token,
        usuario: {
          id: usuarioGuardado._id,
          nombreCompleto: usuarioGuardado.nombreCompleto,
          email: usuarioGuardado.email,
          tipoUsuario: usuarioGuardado.tipoUsuario
        }
      });

    } catch (error) {
      console.error('Error en registro:', error);
      
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          error: 'Datos de validación incorrectos',
          message: error.message,
          details: Object.values(error.errors).map(err => ({
            field: err.path,
            message: err.message
          }))
        });
      }

      if (error.code === 11000) {
        return res.status(400).json({
          error: 'Email ya registrado',
          message: 'Ya existe un usuario con este correo electrónico'
        });
      }

      res.status(500).json({
        error: 'Error en el registro',
        message: error.message
      });
    }
  },

  // Login de usuarios
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validar que se proporcionen email y password
      if (!email || !password) {
        return res.status(400).json({
          error: 'Datos incompletos',
          message: 'Email y contraseña son requeridos'
        });
      }

      // Buscar usuario por email (incluyendo password para comparación)
      const usuario = await Usuario.findOne({ email, activo: true }).select('+password');
      
      if (!usuario) {
        return res.status(401).json({
          error: 'Credenciales inválidas',
          message: 'Email o contraseña incorrectos'
        });
      }

      // Verificar contraseña
      const passwordValida = await usuario.compararPassword(password);
      
      if (!passwordValida) {
        return res.status(401).json({
          error: 'Credenciales inválidas',
          message: 'Email o contraseña incorrectos'
        });
      }

      // Actualizar fecha de último login
      await usuario.actualizarUltimoLogin();

      // Generar token
      const token = generarToken(usuario._id);

      res.json({
        message: 'Login exitoso',
        token,
        usuario: {
          id: usuario._id,
          nombreCompleto: usuario.nombreCompleto,
          email: usuario.email,
          tipoUsuario: usuario.tipoUsuario,
          numeroCelular: usuario.numeroCelular,
          direccion: usuario.direccion,
          fechaUltimoLogin: usuario.fechaUltimoLogin
        }
      });

    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        error: 'Error en el login',
        message: error.message
      });
    }
  },

  // Obtener perfil del usuario autenticado
  perfil: async (req, res) => {
    try {
      const usuario = await Usuario.findById(req.usuario.id);
      
      if (!usuario) {
        return res.status(404).json({
          error: 'Usuario no encontrado',
          message: 'No se encontró el usuario'
        });
      }

      res.json({
        message: 'Perfil obtenido exitosamente',
        usuario: {
          id: usuario._id,
          nombreCompleto: usuario.nombreCompleto,
          email: usuario.email,
          tipoUsuario: usuario.tipoUsuario,
          numeroCelular: usuario.numeroCelular,
          direccion: usuario.direccion,
          fechaUltimoLogin: usuario.fechaUltimoLogin,
          createdAt: usuario.createdAt
        }
      });

    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({
        error: 'Error al obtener el perfil',
        message: error.message
      });
    }
  },

  // Actualizar perfil
  actualizarPerfil: async (req, res) => {
    try {
      const { nombreCompleto, numeroCelular, direccion } = req.body;
      const usuario = await Usuario.findById(req.usuario.id);

      if (!usuario) {
        return res.status(404).json({
          error: 'Usuario no encontrado',
          message: 'No se encontró el usuario'
        });
      }

      // Actualizar campos permitidos
      if (nombreCompleto) usuario.nombreCompleto = nombreCompleto;
      if (numeroCelular) usuario.numeroCelular = numeroCelular;
      
      // Solo actualizar dirección para compradores
      if (usuario.tipoUsuario === 'comprador' && direccion !== undefined) {
        usuario.direccion = direccion;
      }

      const usuarioActualizado = await usuario.save();

      res.json({
        message: 'Perfil actualizado exitosamente',
        usuario: {
          id: usuarioActualizado._id,
          nombreCompleto: usuarioActualizado.nombreCompleto,
          email: usuarioActualizado.email,
          tipoUsuario: usuarioActualizado.tipoUsuario,
          numeroCelular: usuarioActualizado.numeroCelular,
          direccion: usuarioActualizado.direccion
        }
      });

    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          error: 'Datos de validación incorrectos',
          message: error.message
        });
      }

      res.status(500).json({
        error: 'Error al actualizar el perfil',
        message: error.message
      });
    }
  },

  // Listar usuarios (solo para propósitos de desarrollo/admin)
  listarUsuarios: async (req, res) => {
    try {
      const { tipoUsuario } = req.query;
      const filtros = { activo: true };
      
      if (tipoUsuario) {
        filtros.tipoUsuario = tipoUsuario;
      }

      const usuarios = await Usuario.find(filtros).sort({ createdAt: -1 });

      res.json({
        message: 'Lista de usuarios obtenida exitosamente',
        count: usuarios.length,
        usuarios: usuarios.map(user => ({
          id: user._id,
          nombreCompleto: user.nombreCompleto,
          email: user.email,
          tipoUsuario: user.tipoUsuario,
          numeroCelular: user.numeroCelular,
          direccion: user.direccion,
          createdAt: user.createdAt
        }))
      });

    } catch (error) {
      console.error('Error al listar usuarios:', error);
      res.status(500).json({
        error: 'Error al obtener la lista de usuarios',
        message: error.message
      });
    }
  }
};

module.exports = authController;
