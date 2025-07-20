# Ejemplos de uso del sistema de productos

## 🛍️ **Crear Producto (Solo Vendedores)**

**POST** `http://localhost:3001/api/productos`

**Headers:**
```
Authorization: Bearer <token_del_vendedor>
Content-Type: application/json
```

**Ejemplo 1 - Pastillas Efervescentes Rosa:**
```json
{
  "title": "Pastillas Efervescentes Rosa - Pack 28 unidades",
  "price": 23.95,
  "description": "Pastillas efervescentes con delicada fragancia de rosa. Cuida el planeta eliminando envases innecesarios. Suave limpieza que protege superficies sensibles y deja un aroma floral duradero.",
  "category": "limpieza ecológica",
  "image": "https://senti2.com.es/wp-content/uploads/2023/07/TabletasLimpiadoras_Aplicacion.webp",
  "stock": 50,
  "rating": {
    "rate": 4.8,
    "count": 15
  }
}
```

**Ejemplo 2 - Pastillas Efervescentes Coco:**
```json
{
  "title": "Pastillas Efervescentes Coco - Pack 24 unidades",
  "price": 25.30,
  "description": "Pastillas efervescentes con tropical aroma a coco. Innovación en limpieza que reduce drasticamente los residuos plásticos. Efectivo desinfectante con fragancia paradisíaca para tu hogar.",
  "category": "limpieza ecológica",
  "image": "https://senti2.com.es/wp-content/uploads/2023/07/TabletasLimpiadoras_Aplicacion.webp",
  "stock": 30
}
```

**Ejemplo 3 - Con Rating Personalizado:**
```json
{
  "title": "iPhone 15 Pro Max 256GB",
  "price": 1199.99,
  "description": "El iPhone más avanzado con chip A17 Pro, cámara de 48MP y pantalla Super Retina XDR de 6.7 pulgadas",
  "category": "electronics",
  "image": "https://example.com/iphone15pro.jpg",
  "stock": 25,
  "rating": {
    "rate": 4.7,
    "count": 324
  }
}
```

**Respuesta esperada:**
```json
{
  "id": 11,
  "title": "Pastillas Efervescentes Rosa - Pack 28 unidades",
  "price": 23.95,
  "description": "Pastillas efervescentes con delicada fragancia de rosa. Cuida el planeta eliminando envases innecesarios. Suave limpieza que protege superficies sensibles y deja un aroma floral duradero.",
  "category": "limpieza ecológica",
  "image": "https://senti2.com.es/wp-content/uploads/2023/07/TabletasLimpiadoras_Aplicacion.webp",
  "rating": {
    "rate": 0,
    "count": 0
  }
}
```

## 📱 **Otro ejemplo - Producto de Electrónicos:**

```json
{
  "title": "iPhone 15 Pro Max 256GB",
  "price": 1199.99,
  "description": "El iPhone más avanzado con chip A17 Pro, cámara de 48MP y pantalla Super Retina XDR de 6.7 pulgadas",
  "category": "electronics",
  "image": "https://example.com/iphone15pro.jpg",
  "stock": 25
}
```

## 👕 **Ejemplo - Ropa de Mujer:**

```json
{
  "title": "Vestido Casual de Verano",
  "price": 45.99,
  "description": "Hermoso vestido casual perfecto para el verano, tela ligera y cómoda",
  "category": "women's clothing",
  "image": "https://example.com/vestido-verano.jpg",
  "stock": 100
}
```

## ⭐ **Rating Opcional al Crear Productos:**

**¿Se puede especificar rating al crear?** ✅ **SÍ**

El campo `rating` es **opcional** al crear un producto:

**Opción 1 - Sin rating (valores por defecto):**
```json
{
  "title": "Producto básico",
  "price": 19.99,
  "description": "Descripción del producto",
  "category": "electronics",
  "image": "https://example.com/imagen.jpg",
  "stock": 10
}
```
**Resultado:** `rating: { rate: 0, count: 0 }`

**Opción 2 - Con rating personalizado:**
```json
{
  "title": "Producto con historial",
  "price": 19.99,
  "description": "Descripción del producto",
  "category": "electronics", 
  "image": "https://example.com/imagen.jpg",
  "stock": 10,
  "rating": {
    "rate": 4.5,
    "count": 120
  }
}
```
**Resultado:** `rating: { rate: 4.5, count: 120 }`

**Opción 3 - Rating parcial:**
```json
{
  "rating": {
    "rate": 3.8
  }
}
```
**Resultado:** `rating: { rate: 3.8, count: 0 }`

## 🔍 **Ver Todos los Productos (Público)**

**GET** `http://localhost:3001/api/productos`

**Query Parameters opcionales:**
- `category=electronics`
- `limit=10`
- `page=1`

**Ejemplo:** `http://localhost:3001/api/productos?category=electronics&limit=5`

## 🆔 **Ver Producto por ID (Público)**

**GET** `http://localhost:3001/api/productos/64a1b2c3d4e5f6789abcdef0`

## 📂 **Ver Productos por Categoría (Público)**

**GET** `http://localhost:3001/api/productos/category/electronics`

## 🏪 **Ver Mis Productos (Solo Vendedores)**

**GET** `http://localhost:3001/api/productos/mis/productos`

**Headers:**
```
Authorization: Bearer <token_del_vendedor>
```

## ✏️ **Actualizar Producto (Solo el vendedor propietario)**

**PUT** `http://localhost:3001/api/productos/64a1b2c3d4e5f6789abcdef0`

**Headers:**
```
Authorization: Bearer <token_del_vendedor>
```

**Body:**
```json
{
  "title": "Nuevo título actualizado",
  "price": 99.99,
  "stock": 75
}
```

## 🗑️ **Eliminar Producto (Solo el vendedor propietario)**

**DELETE** `http://localhost:3001/api/productos/64a1b2c3d4e5f6789abcdef0`

**Headers:**
```
Authorization: Bearer <token_del_vendedor>
```

## ⭐ **Calificar Producto (Solo Compradores)**

**POST** `http://localhost:3001/api/productos/64a1b2c3d4e5f6789abcdef0/rating`

**Headers:**
```
Authorization: Bearer <token_del_comprador>
```

**Body:**
```json
{
  "rating": 4.5
}
```

## 📋 **Categorías Disponibles:**

- "men's clothing"
- "women's clothing"
- "jewelery"
- "electronics"
- "books"
- "home & garden"
- "sports"
- "beauty"
- "toys"
- "automotive"

## 🔑 **Flujo Completo:**

1. **Registrar Vendedor:** `POST /api/auth/registro`
2. **Hacer Login:** `POST /api/auth/login` (obtener token)
3. **Crear Producto:** `POST /api/productos` (con token de vendedor)
4. **Ver Productos:** `GET /api/productos` (público)

## 📊 **Respuesta del Producto Creado:**

```json
{
  "message": "Producto creado exitosamente",
  "data": {
    "id": "64a1b2c3d4e5f6789abcdef0",
    "title": "Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops",
    "price": 109.95,
    "description": "Your perfect pack for everyday use...",
    "category": "men's clothing",
    "image": "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg",
    "rating": {
      "rate": 0,
      "count": 0
    },
    "vendedor": {
      "nombreCompleto": "María García López",
      "email": "maria.vendedor@gmail.com"
    },
    "stock": 50,
    "activo": true,
    "createdAt": "2025-07-20T...",
    "updatedAt": "2025-07-20T..."
  }
}
```
