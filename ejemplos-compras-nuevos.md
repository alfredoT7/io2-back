# Nuevos Endpoints de Compras

## 1. Obtener TODAS las compras

**Endpoint:** `GET /api/compras`

**Descripción:** Obtiene todas las compras del sistema con paginación y filtros opcionales.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters (opcionales):**
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 10)
- `estado`: Filtrar por estado (pendiente, verificado, procesando, enviado, entregado, cancelado)
- `usuario`: Filtrar por ID de usuario
- `fechaInicio`: Fecha de inicio (formato: YYYY-MM-DD)
- `fechaFin`: Fecha de fin (formato: YYYY-MM-DD)

**Ejemplos de uso:**

### Obtener todas las compras (primera página)
```http
GET /api/compras
```

### Obtener compras pendientes
```http
GET /api/compras?estado=pendiente
```

### Obtener compras de un usuario específico
```http
GET /api/compras?usuario=123
```

### Obtener compras con paginación
```http
GET /api/compras?page=2&limit=20
```

### Obtener compras por rango de fechas
```http
GET /api/compras?fechaInicio=2024-01-01&fechaFin=2024-01-31
```

### Respuesta exitosa:
```json
{
  "success": true,
  "message": "Todas las compras obtenidas exitosamente",
  "compras": [
    {
      "_id": "60f8b1234567890abcdef123",
      "usuario": {
        "id": 123,
        "nombreCompleto": "Juan Pérez",
        "email": "juan@example.com",
        "numeroCelular": "76543210"
      },
      "productos": [
        {
          "id": 1,
          "nombre": "Producto A",
          "precio": 50,
          "cantidad": 2,
          "subtotal": 100,
          "imagen": "imagen.jpg"
        }
      ],
      "total": 100,
      "estado": "pendiente",
      "metodoPago": "tarjeta",
      "numeroOrden": "ORD-20240726-001",
      "fechaCreacion": "2024-07-26T10:30:00.000Z",
      "envio": {
        "direccion": "Calle 123",
        "ciudad": "La Paz",
        "codigoPostal": "12345",
        "telefono": "76543210"
      },
      "notas": "Entregar en horario de oficina"
    }
  ],
  "total": 1,
  "paginacion": {
    "paginaActual": 1,
    "totalPaginas": 1,
    "totalCompras": 1,
    "comprasPorPagina": 10
  }
}
```

## 2. Verificar una compra

**Endpoint:** `PATCH /api/compras/:idOrden/verificar`

**Descripción:** Cambia el estado de una compra de "pendiente" a "verificado".

**Headers:**
```
Authorization: Bearer <token>
```

**Parámetros de URL:**
- `idOrden`: ID de la compra a verificar

**Ejemplo de uso:**

### Verificar una compra
```http
PATCH /api/compras/60f8b1234567890abcdef123/verificar
```

### Respuesta exitosa:
```json
{
  "success": true,
  "message": "Compra verificada exitosamente",
  "compra": {
    "_id": "60f8b1234567890abcdef123",
    "usuario": {
      "id": 123,
      "nombreCompleto": "Juan Pérez",
      "email": "juan@example.com"
    },
    "productos": [
      {
        "id": 1,
        "nombre": "Producto A",
        "precio": 50,
        "cantidad": 2,
        "subtotal": 100,
        "imagen": "imagen.jpg"
      }
    ],
    "total": 100,
    "estado": "verificado",
    "metodoPago": "tarjeta",
    "numeroOrden": "ORD-20240726-001",
    "fechaCreacion": "2024-07-26T10:30:00.000Z",
    "envio": {
      "direccion": "Calle 123",
      "ciudad": "La Paz",
      "codigoPostal": "12345",
      "telefono": "76543210"
    },
    "notas": "Entregar en horario de oficina"
  }
}
```

### Respuesta de error (compra no encontrada):
```json
{
  "success": false,
  "message": "Compra no encontrada"
}
```

### Respuesta de error (compra no está pendiente):
```json
{
  "success": false,
  "message": "No se puede verificar una compra en estado \"procesando\". Solo se pueden verificar compras pendientes.",
  "estadoActual": "procesando"
}
```

## Estados de compras disponibles

Los estados actuales son:
1. `pendiente` - Estado inicial
2. `verificado` - Compra verificada por el administrador
3. `procesando` - En proceso de preparación
4. `enviado` - Enviado al cliente
5. `entregado` - Entregado al cliente
6. `cancelado` - Compra cancelada

## Notas importantes

- Todos los endpoints requieren autenticación (token Bearer).
- El endpoint para obtener todas las compras está pensado para usuarios administradores.
- Solo se pueden verificar compras que estén en estado "pendiente".
- Los filtros son opcionales y se pueden combinar.
- La paginación ayuda a manejar grandes volúmenes de datos.
