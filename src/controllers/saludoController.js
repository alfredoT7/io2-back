// Controlador de ejemplo para saludos
const saludoController = {
  // Saludo simple
  saludoSimple: (req, res) => {
    res.json({
      message: '¡Hola! Bienvenido a la API de Pastillas',
      timestamp: new Date().toISOString()
    });
  },

  // Saludo personalizado con nombre
  saludoPersonalizado: (req, res) => {
    const { nombre } = req.params;
    
    if (!nombre) {
      return res.status(400).json({
        error: 'Nombre requerido',
        message: 'Debes proporcionar un nombre en la URL'
      });
    }

    res.json({
      message: `¡Hola ${nombre}! Bienvenido a la API de Pastillas`,
      nombre: nombre,
      timestamp: new Date().toISOString()
    });
  },

  // Saludo con datos del body
  saludoConDatos: (req, res) => {
    const { nombre, apellido, edad } = req.body;

    // Validación básica
    if (!nombre) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'El nombre es requerido'
      });
    }

    const respuesta = {
      message: `¡Hola ${nombre}!`,
      datos: {
        nombre,
        apellido: apellido || 'No proporcionado',
        edad: edad || 'No proporcionada'
      },
      timestamp: new Date().toISOString()
    };

    res.json(respuesta);
  },

  // Saludo con query parameters
  saludoConQuery: (req, res) => {
    const { nombre, idioma = 'es' } = req.query;

    const saludos = {
      es: '¡Hola',
      en: 'Hello',
      fr: 'Bonjour',
      de: 'Hallo',
      it: 'Ciao'
    };

    const saludo = saludos[idioma] || saludos.es;
    const nombreCompleto = nombre ? ` ${nombre}` : '';

    res.json({
      message: `${saludo}${nombreCompleto}!`,
      idioma: idioma,
      idiomasDisponibles: Object.keys(saludos),
      timestamp: new Date().toISOString()
    });
  },

  // Ejemplo con manejo de errores
  saludoConError: (req, res) => {
    try {
      const { provocarError } = req.query;
      
      if (provocarError === 'true') {
        throw new Error('Error provocado para demostración');
      }

      res.json({
        message: '¡Saludo exitoso sin errores!',
        status: 'success'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Error en el saludo',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  },

  // Saludo con información del servidor
  infoServidor: (req, res) => {
    res.json({
      message: '¡Hola! Información del servidor',
      servidor: {
        nodejs: process.version,
        plataforma: process.platform,
        memoria: {
          usada: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
        },
        uptime: Math.round(process.uptime()) + ' segundos'
      },
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = saludoController;
