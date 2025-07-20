// Utilidades comunes para el proyecto

// Función para formatear respuestas de la API
const formatResponse = (success, data = null, message = '', error = null) => {
  return {
    success,
    message,
    data,
    error,
    timestamp: new Date().toISOString()
  };
};

// Función para validar email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Función para generar IDs únicos
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Función para sanitizar entrada de datos
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

// Función para paginar resultados
const paginate = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return { offset, limit: parseInt(limit) };
};

module.exports = {
  formatResponse,
  isValidEmail,
  generateId,
  sanitizeInput,
  paginate
};
