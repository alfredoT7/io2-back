# Ejemplos de Uso - API de Compras

## 1. Crear una Nueva Compra

### Endpoint
```
POST /api/compras
```

### Headers
```
Authorization: Bearer <tu_jwt_token>
Content-Type: application/json
```

### Body de ejemplo (SIN idUsuario - se obtiene del token)
```json
{
  "productos": [
    {
      "idProducto": "64a1b2c3d4e5f6789abcdef1",
      "titulo": "Pastillas Efervescentes Normales Unidades pequeñas",
      "precio": 10,
      "cantidad": 3,
      "subtotal": 30
    },
    {
      "idProducto": "64a1b2c3d4e5f6789abcdef2",
      "titulo": "Pastillas Efervescentes Limón - Pack 20",
      "precio": 15.99,
      "cantidad": 1,
      "subtotal": 15.99
    }
  ],
  "resumenCompra": {
    "subtotal": 45.99,
    "impuestos": 4.14,
    "descuentos": 0,
    "total": 50.13
  },
  "datosEnvio": {
    "direccion": "Calle Principal 123",
    "ciudad": "La Paz",
    "codigoPostal": "12345",
    "pais": "Bolivia",
    "telefono": "67443153"
  },
  "metodoPago": {
    "tipo": "tarjeta_credito",
    "ultimosDigitos": "1234",
    "fechaTransaccion": "2025-07-20T14:30:00Z"
  },
  "fechaPedido": "2025-07-20T14:30:00Z",
  "estado": "pendiente"
}
```

### Respuesta exitosa (201)
```json
{
  "success": true,
  "message": "Compra registrada exitosamente",
  "data": {
    "_id": "64a1b2c3d4e5f6789abcdef3",
    "idUsuario": {
      "_id": "687c8d4a8efc8af290be036f",
      "nombre": "Juan Carlos Pérez",
      "email": "juan.comprador@gmail.com"
    },
    "productos": [...],
    "resumenCompra": {...},
    "datosEnvio": {...},
    "metodoPago": {...},
    "numeroOrden": "ORD-20250720-001",
    "estado": "pendiente",
    "fechaPedido": "2025-07-20T14:30:00.000Z",
    "createdAt": "2025-07-20T14:30:00.000Z",
    "updatedAt": "2025-07-20T14:30:00.000Z"
  }
}
```

## 2. Obtener MIS Órdenes (Usuario Autenticado)

### Endpoint
```
GET /api/compras/mis-ordenes
```

### Ejemplos de uso
```
# Todas mis órdenes
GET /api/compras/mis-ordenes

# Con paginación
GET /api/compras/mis-ordenes?page=1&limit=5

# Filtrar por estado
GET /api/compras/mis-ordenes?estado=entregado

# Filtrar por fechas
GET /api/compras/mis-ordenes?fechaInicio=2025-01-01&fechaFin=2025-07-20

# Combinando filtros
GET /api/compras/mis-ordenes?estado=pendiente&page=1&limit=10
```

### Headers
```
Authorization: Bearer <tu_jwt_token>
```

### Respuesta exitosa (200)
```json
{
  "success": true,
  "message": "Órdenes obtenidas exitosamente",
  "data": {
    "ordenes": [
      {
        "_id": "64a1b2c3d4e5f6789abcdef3",
        "numeroOrden": "ORD-20250720-001",
        "estado": "pendiente",
        "fechaPedido": "2025-07-20T14:30:00.000Z",
        "resumenCompra": {
          "total": 50.13
        },
        "productos": [...],
        "datosEnvio": {...}
      }
    ],
    "paginacion": {
      "paginaActual": 1,
      "totalPaginas": 3,
      "totalOrdenes": 25,
      "ordenesPorPagina": 10
    }
  }
}
```

## 3. Obtener una Orden Específica

### Endpoint
```
GET /api/compras/:idOrden
```

### Ejemplo
```
GET /api/compras/64a1b2c3d4e5f6789abcdef3
```

### Headers
```
Authorization: Bearer <tu_jwt_token>
```

### Respuesta exitosa (200)
```json
{
  "success": true,
  "message": "Orden obtenida exitosamente",
  "data": {
    "_id": "64a1b2c3d4e5f6789abcdef3",
    "numeroOrden": "ORD-20250720-001",
    "idUsuario": {
      "_id": "64a1b2c3d4e5f6789abcdef0",
      "nombre": "Juan Pérez",
      "email": "juan@email.com",
      "telefono": "67443153"
    },
    "productos": [
      {
        "idProducto": {
          "_id": "64a1b2c3d4e5f6789abcdef1",
          "titulo": "Pastillas Efervescentes Normales",
          "precio": 10,
          "imagen": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
          "descripcion": "Pastillas efervescentes para..."
        },
        "titulo": "Pastillas Efervescentes Normales Unidades pequeñas",
        "precio": 10,
        "cantidad": 3,
        "subtotal": 30
      }
    ],
    "resumenCompra": {
      "subtotal": 45.99,
      "impuestos": 4.14,
      "descuentos": 0,
      "total": 50.13
    },
    "datosEnvio": {
      "direccion": "Calle Principal 123",
      "ciudad": "La Paz",
      "codigoPostal": "12345",
      "pais": "Bolivia",
      "telefono": "67443153"
    },
    "metodoPago": {
      "tipo": "tarjeta_credito",
      "ultimosDigitos": "1234",
      "fechaTransaccion": "2025-07-20T14:30:00.000Z"
    },
    "estado": "pendiente",
    "fechaPedido": "2025-07-20T14:30:00.000Z",
    "cantidadTotalProductos": 4
  }
}
```

## 4. Actualizar Estado de una Orden

### Endpoint
```
PUT /api/compras/:idOrden/estado
```

### Ejemplo
```
PUT /api/compras/64a1b2c3d4e5f6789abcdef3/estado
```

### Headers
```
Authorization: Bearer <tu_jwt_token>
Content-Type: application/json
```

### Body
```json
{
  "estado": "enviado"
}
```

### Estados válidos
- `pendiente` - Orden recién creada
- `procesando` - Orden en proceso de preparación
- `enviado` - Orden enviada al cliente
- `entregado` - Orden entregada exitosamente
- `cancelado` - Orden cancelada

### Respuesta exitosa (200)
```json
{
  "success": true,
  "message": "Estado de orden actualizado exitosamente",
  "data": {
    "_id": "64a1b2c3d4e5f6789abcdef3",
    "numeroOrden": "ORD-20250720-001",
    "estado": "enviado",
    "idUsuario": {...},
    "productos": [...],
    "updatedAt": "2025-07-20T15:30:00.000Z"
  }
}
```

## 5. Obtener Estadísticas de Compras de un Usuario

### Endpoint
```
GET /api/compras/usuario/:idUsuario/estadisticas
```

### Ejemplo
```
GET /api/compras/usuario/123/estadisticas
```

### Headers
```
Authorization: Bearer <tu_jwt_token>
```

### Respuesta exitosa (200)
```json
{
  "success": true,
  "message": "Estadísticas obtenidas exitosamente",
  "data": {
    "totalOrdenes": 15,
    "totalGastado": 752.45,
    "promedioOrden": 50.16,
    "ordenesPorEstado": {
      "pendiente": 2,
      "procesando": 1,
      "enviado": 3,
      "entregado": 8,
      "cancelado": 1
    }
  }
}
```

## Códigos de Error Comunes

### 400 - Datos inválidos
```json
{
  "success": false,
  "message": "Datos de compra inválidos",
  "errors": [
    "El precio debe ser mayor a 0",
    "El teléfono debe ser un número válido"
  ]
}
```

### 401 - No autorizado
```json
{
  "success": false,
  "message": "Token no proporcionado"
}
```

### 404 - Usuario/Orden no encontrado
```json
{
  "success": false,
  "message": "Usuario no encontrado"
}
```

### 500 - Error del servidor
```json
{
  "success": false,
  "message": "Error interno del servidor",
  "error": "Descripción del error"
}
```

## Notas Importantes

1. **Autenticación**: Todas las rutas requieren un token JWT válido
2. **Validaciones**: Los cálculos de subtotales y total son validados automáticamente
3. **Números de Orden**: Se generan automáticamente con formato `ORD-YYYYMMDD-XXX`
4. **Teléfonos**: Soporta formatos bolivianos (67443153) e internacionales (+591 67443153)
5. **Paginación**: Por defecto retorna 10 órdenes por página
6. **Referencias**: Las respuestas incluyen información poblada de usuarios y productos
