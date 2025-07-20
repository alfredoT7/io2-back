const express = require('express');
const router = express.Router();

// Importar rutas específicas
const saludoRoutes = require('./saludoRoutes');
const authRoutes = require('./authRoutes');
const productosRoutes = require('./productosRoutes');
const comprasRoutes = require('./comprasRoutes');

// Usar las rutas
router.use('/saludo', saludoRoutes);
router.use('/auth', authRoutes);
router.use('/productos', productosRoutes);
router.use('/compras', comprasRoutes);

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
      compras: {
        // Rutas para compras
        crearCompra: {
          url: '/api/compras',
          metodo: 'POST',
          descripcion: 'Registrar una nueva compra',
          requiereToken: true,
          bodyRequerido: {
            idUsuario: 'number (ID numérico del usuario comprador)',
            productos: [{
              idProducto: 'ObjectId',
              titulo: 'string',
              precio: 'number',
              cantidad: 'number',
              subtotal: 'number'
            }],
            resumenCompra: {
              subtotal: 'number',
              impuestos: 'number',
              descuentos: 'number (opcional)',
              total: 'number'
            },
            datosEnvio: {
              direccion: 'string',
              ciudad: 'string',
              codigoPostal: 'string',
              pais: 'string',
              telefono: 'string'
            },
            metodoPago: {
              tipo: 'string (tarjeta_credito, tarjeta_debito, transferencia, efectivo, paypal)',
              ultimosDigitos: 'string (4 dígitos, requerido para tarjetas)',
              fechaTransaccion: 'ISO Date string'
            },
            fechaPedido: 'ISO Date string (opcional)',
            estado: 'string (opcional, default: pendiente)',
            numeroOrden: 'string (opcional, se genera automáticamente)'
          }
        },
        obtenerOrdenes: {
          url: '/api/compras/usuario/:idUsuario',
          metodo: 'GET',
          descripcion: 'Obtener todas las órdenes de un usuario',
          requiereToken: true,
          ejemplo: '/api/compras/usuario/123',
          queryParams: {
            page: 'number (página, default: 1)',
            limit: 'number (límite por página, default: 10)',
            estado: 'string (filtrar por estado)',
            fechaInicio: 'ISO Date string',
            fechaFin: 'ISO Date string'
          }
        },
        obtenerOrdenPorId: {
          url: '/api/compras/:idOrden',
          metodo: 'GET',
          descripcion: 'Obtener una orden específica por ID',
          requiereToken: true,
          ejemplo: '/api/compras/64a1b2c3d4e5f6789abcdef0'
        },
        actualizarEstado: {
          url: '/api/compras/:idOrden/estado',
          metodo: 'PUT',
          descripcion: 'Actualizar estado de una orden',
          requiereToken: true,
          bodyRequerido: {
            estado: 'string (pendiente, procesando, enviado, entregado, cancelado)'
          }
        },
        estadisticas: {
          url: '/api/compras/usuario/:idUsuario/estadisticas',
          metodo: 'GET',
          descripcion: 'Obtener estadísticas de compras de un usuario',
          requiereToken: true,
          ejemplo: '/api/compras/usuario/123/estadisticas'
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
