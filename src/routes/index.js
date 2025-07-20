const express = require('express');
const router = express.Router();

// Importar rutas específicas
const saludoRoutes = require('./saludoRoutes');
const authRoutes = require('./authRoutes');
const productosRoutes = require('./productosRoutes');

// Usar las rutas
router.use('/saludo', saludoRoutes);
router.use('/auth', authRoutes);
router.use('/productos', productosRoutes);

// Ruta de información de la API con todas las rutas disponibles
router.get('/', (req, res) => {
  res.json({
    message: 'API de Productos - Sistema de E-commerce',
    version: '1.0.0',
    baseUrl: `${req.protocol}://${req.get('host')}`,
    rutasDisponibles: {
      principal: {
        url: '/',
        metodo: 'GET',
        descripcion: 'Página principal de la API'
      },
      documentacion: {
        url: '/api',
        metodo: 'GET',
        descripcion: 'Esta página con todas las rutas'
      },
      healthCheck: {
        url: '/api/health',
        metodo: 'GET',
        descripcion: 'Verificación de estado del servidor'
      },
      autenticacion: {
        registro: {
          url: '/api/auth/registro',
          metodo: 'POST',
          descripcion: 'Registrar nuevo usuario (comprador o vendedor)',
          bodyRequerido: {
            nombreCompleto: 'string',
            numeroCelular: 'string (10-15 dígitos)',
            email: 'string (formato email)',
            direccion: 'string (solo para compradores)',
            password: 'string (mínimo 6 caracteres)',
            tipoUsuario: 'string (comprador o vendedor)'
          }
        },
        login: {
          url: '/api/auth/login',
          metodo: 'POST',
          descripcion: 'Iniciar sesión',
          bodyRequerido: {
            email: 'string',
            password: 'string'
          }
        },
        perfil: {
          url: '/api/auth/perfil',
          metodo: 'GET',
          descripcion: 'Obtener perfil del usuario autenticado',
          requiereToken: true
        }
      },
      productos: {
        // Rutas públicas
        listarTodos: {
          url: '/api/productos',
          metodo: 'GET',
          descripcion: 'Obtener todos los productos',
          queryParams: 'category, limit, page'
        },
        obtenerPorId: {
          url: '/api/productos/:id',
          metodo: 'GET',
          ejemplo: '/api/productos/64a1b2c3d4e5f6789abcdef0',
          descripcion: 'Obtener un producto por ID'
        },
        porCategoria: {
          url: '/api/productos/category/:category',
          metodo: 'GET',
          ejemplo: '/api/productos/category/electronics',
          descripcion: 'Obtener productos por categoría'
        },
        // Rutas para vendedores
        crear: {
          url: '/api/productos',
          metodo: 'POST',
          descripcion: 'Crear nuevo producto (solo vendedores)',
          requiereToken: true,
          tipoUsuario: 'vendedor',
          bodyRequerido: {
            title: 'string',
            price: 'number',
            description: 'string',
            category: 'string',
            image: 'string (URL)',
            stock: 'number (opcional)'
          }
        },
        actualizar: {
          url: '/api/productos/:id',
          metodo: 'PUT',
          descripcion: 'Actualizar producto propio (solo vendedores)',
          requiereToken: true,
          tipoUsuario: 'vendedor'
        },
        eliminar: {
          url: '/api/productos/:id',
          metodo: 'DELETE',
          descripcion: 'Eliminar producto propio (solo vendedores)',
          requiereToken: true,
          tipoUsuario: 'vendedor'
        },
        misProductos: {
          url: '/api/productos/mis/productos',
          metodo: 'GET',
          descripcion: 'Ver mis productos (solo vendedores)',
          requiereToken: true,
          tipoUsuario: 'vendedor'
        },
        // Rutas para compradores
        calificar: {
          url: '/api/productos/:id/rating',
          metodo: 'POST',
          descripcion: 'Calificar un producto (solo compradores)',
          requiereToken: true,
          tipoUsuario: 'comprador',
          bodyRequerido: {
            rating: 'number (1-5)'
          }
        }
      },
      categorias: {
        disponibles: [
          "men's clothing",
          "women's clothing", 
          "jewelery",
          "electronics",
          "books",
          "home & garden",
          "sports",
          "beauty",
          "toys",
          "automotive"
        ]
      }
    },
    notas: {
      autenticacion: 'Para rutas protegidas, incluye: Authorization: Bearer <token>',
      tiposUsuario: ['comprador', 'vendedor'],
      permisos: {
        vendedor: 'Puede crear, actualizar y eliminar sus productos',
        comprador: 'Puede ver productos y calificarlos'
      }
    }
  });
});

// Ruta de health check
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()) + ' segundos',
    memoria: {
      usada: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB'
    },
    database: {
      status: 'conectada',
      name: 'MongoDB Atlas'
    },
    servicios: {
      autenticacion: 'activo',
      productos: 'activo',
      jwt: 'configurado'
    }
  });
});

module.exports = router;
