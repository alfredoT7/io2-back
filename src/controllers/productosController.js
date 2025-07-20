const Producto = require('../models/Producto');

const productosController = {
  // Obtener todos los productos (público)
  obtenerTodos: async (req, res) => {
    try {
      const { category, limit = 20, page = 1 } = req.query;
      const filtros = { activo: true };
      
      if (category) {
        filtros.category = category;
      }

      const skip = (page - 1) * limit;
      const productos = await Producto.find(filtros)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip);

      const total = await Producto.countDocuments(filtros);

      // Formatear productos con la estructura exacta requerida
      const productosFormateados = productos.map(producto => ({
        id: producto.id,
        title: producto.title,
        price: producto.price,
        description: producto.description,
        category: producto.category,
        image: producto.image,
        rating: {
          rate: producto.rating.rate,
          count: producto.rating.count
        }
      }));

      res.json(productosFormateados);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      res.status(500).json({
        error: 'Error al obtener los productos',
        message: error.message
      });
    }
  },

  // Obtener un producto por ID (público)
  obtenerPorId: async (req, res) => {
    try {
      const { id } = req.params;
      const producto = await Producto.findOne({ id: parseInt(id), activo: true });
      
      if (!producto) {
        return res.status(404).json({
          error: 'Producto no encontrado',
          message: `No se encontró un producto con el ID: ${id}`
        });
      }

      // Devolver con la estructura exacta requerida
      res.json({
        id: producto.id,
        title: producto.title,
        price: producto.price,
        description: producto.description,
        category: producto.category,
        image: producto.image,
        rating: {
          rate: producto.rating.rate,
          count: producto.rating.count
        }
      });
    } catch (error) {
      console.error('Error al obtener producto:', error);
      res.status(500).json({
        error: 'Error al obtener el producto',
        message: error.message
      });
    }
  },

  // Crear un nuevo producto (solo vendedores)
  crear: async (req, res) => {
    try {
      // Verificar que el usuario sea vendedor
      if (req.usuario.tipoUsuario !== 'vendedor') {
        return res.status(403).json({
          error: 'Acceso denegado',
          message: 'Solo los vendedores pueden crear productos'
        });
      }

      const { title, price, description, category, image, stock = 1, rating } = req.body;
      
      // Configurar rating con valores por defecto o los proporcionados
      const ratingData = {
        rate: rating?.rate || 0,
        count: rating?.count || 0
      };
      
      const nuevoProducto = new Producto({
        title,
        price,
        description,
        category,
        image,
        stock,
        vendedor: req.usuario._id,
        rating: ratingData
      });

      const productoGuardado = await nuevoProducto.save();
      
      // Devolver con la estructura exacta requerida
      res.status(201).json({
        id: productoGuardado.id,
        title: productoGuardado.title,
        price: productoGuardado.price,
        description: productoGuardado.description,
        category: productoGuardado.category,
        image: productoGuardado.image,
        rating: {
          rate: productoGuardado.rating.rate,
          count: productoGuardado.rating.count
        }
      });

    } catch (error) {
      console.error('Error al crear producto:', error);
      
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
      
      res.status(500).json({
        error: 'Error al crear el producto',
        message: error.message
      });
    }
  },

  // Actualizar un producto (solo el vendedor que lo creó)
  actualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const producto = await Producto.findById(id);

      if (!producto) {
        return res.status(404).json({
          error: 'Producto no encontrado',
          message: `No se encontró un producto con el ID: ${id}`
        });
      }

      // Verificar que el usuario sea el vendedor que creó el producto
      if (producto.vendedor.toString() !== req.usuario._id.toString()) {
        return res.status(403).json({
          error: 'Acceso denegado',
          message: 'Solo puedes actualizar tus propios productos'
        });
      }

      const { title, price, description, category, image, stock } = req.body;
      
      // Actualizar solo los campos proporcionados
      if (title !== undefined) producto.title = title;
      if (price !== undefined) producto.price = price;
      if (description !== undefined) producto.description = description;
      if (category !== undefined) producto.category = category;
      if (image !== undefined) producto.image = image;
      if (stock !== undefined) producto.stock = stock;

      const productoActualizado = await producto.save();
      await productoActualizado.populate('vendedor', 'nombreCompleto email');

      res.json({
        message: 'Producto actualizado exitosamente',
        data: productoActualizado
      });

    } catch (error) {
      console.error('Error al actualizar producto:', error);
      
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          error: 'Datos de validación incorrectos',
          message: error.message
        });
      }
      
      res.status(500).json({
        error: 'Error al actualizar el producto',
        message: error.message
      });
    }
  },

  // Eliminar un producto (solo el vendedor que lo creó)
  eliminar: async (req, res) => {
    try {
      const { id } = req.params;
      const producto = await Producto.findById(id);

      if (!producto) {
        return res.status(404).json({
          error: 'Producto no encontrado',
          message: `No se encontró un producto con el ID: ${id}`
        });
      }

      // Verificar que el usuario sea el vendedor que creó el producto
      if (producto.vendedor.toString() !== req.usuario._id.toString()) {
        return res.status(403).json({
          error: 'Acceso denegado',
          message: 'Solo puedes eliminar tus propios productos'
        });
      }

      // Soft delete
      producto.activo = false;
      await producto.save();

      res.json({
        message: 'Producto eliminado exitosamente',
        data: producto
      });

    } catch (error) {
      console.error('Error al eliminar producto:', error);
      res.status(500).json({
        error: 'Error al eliminar el producto',
        message: error.message
      });
    }
  },

  // Obtener productos por categoría (público)
  obtenerPorCategoria: async (req, res) => {
    try {
      const { category } = req.params;
      const productos = await Producto.find({ category, activo: true });
      
      // Formatear productos con la estructura exacta requerida
      const productosFormateados = productos.map(producto => ({
        id: producto.id,
        title: producto.title,
        price: producto.price,
        description: producto.description,
        category: producto.category,
        image: producto.image,
        rating: {
          rate: producto.rating.rate,
          count: producto.rating.count
        }
      }));

      res.json(productosFormateados);
    } catch (error) {
      console.error('Error al obtener productos por categoría:', error);
      res.status(500).json({
        error: 'Error al obtener productos por categoría',
        message: error.message
      });
    }
  },

  // Obtener productos del vendedor autenticado
  misProductos: async (req, res) => {
    try {
      if (req.usuario.tipoUsuario !== 'vendedor') {
        return res.status(403).json({
          error: 'Acceso denegado',
          message: 'Solo los vendedores pueden ver sus productos'
        });
      }

      const productos = await Producto.findByVendedor(req.usuario._id);
      
      res.json({
        message: 'Mis productos obtenidos exitosamente',
        count: productos.length,
        data: productos
      });
    } catch (error) {
      console.error('Error al obtener mis productos:', error);
      res.status(500).json({
        error: 'Error al obtener tus productos',
        message: error.message
      });
    }
  },

  // Calificar un producto (solo compradores)
  calificar: async (req, res) => {
    try {
      if (req.usuario.tipoUsuario !== 'comprador') {
        return res.status(403).json({
          error: 'Acceso denegado',
          message: 'Solo los compradores pueden calificar productos'
        });
      }

      const { id } = req.params;
      const { rating } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          error: 'Calificación inválida',
          message: 'La calificación debe ser un número entre 1 y 5'
        });
      }

      const producto = await Producto.findById(id);
      
      if (!producto || !producto.activo) {
        return res.status(404).json({
          error: 'Producto no encontrado',
          message: `No se encontró un producto con el ID: ${id}`
        });
      }

      await producto.actualizarRating(rating);
      await producto.populate('vendedor', 'nombreCompleto email');

      res.json({
        message: 'Producto calificado exitosamente',
        data: producto
      });

    } catch (error) {
      console.error('Error al calificar producto:', error);
      res.status(500).json({
        error: 'Error al calificar el producto',
        message: error.message
      });
    }
  }
};

module.exports = productosController;
