# Ejemplos de uso del sistema de autenticación

## 🔐 Registro de Comprador

**POST** `http://localhost:3000/api/auth/registro`

```json
{
  "nombreCompleto": "Juan Pérez González",
  "numeroCelular": "3001234567",
  "email": "juan.comprador@email.com",
  "direccion": "Calle 123 #45-67, Bogotá, Colombia",
  "password": "mipassword123",
  "tipoUsuario": "comprador"
}
```

## 🏪 Registro de Vendedor

**POST** `http://localhost:3000/api/auth/registro`

```json
{
  "nombreCompleto": "María García López",
  "numeroCelular": "3109876543",
  "email": "maria.vendedor@email.com",
  "password": "mipassword456",
  "tipoUsuario": "vendedor"
}
```

## 🚪 Login

**POST** `http://localhost:3000/api/auth/login`

```json
{
  "email": "juan.comprador@email.com",
  "password": "mipassword123"
}
```

**Respuesta:**
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "64a1b2c3d4e5f6789abcdef0",
    "nombreCompleto": "Juan Pérez González",
    "email": "juan.comprador@email.com",
    "tipoUsuario": "comprador"
  }
}
```

## 👤 Obtener Perfil

**GET** `http://localhost:3000/api/auth/perfil`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## ✏️ Actualizar Perfil

**PUT** `http://localhost:3000/api/auth/perfil`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Body:**
```json
{
  "nombreCompleto": "Juan Carlos Pérez González",
  "numeroCelular": "3001234568",
  "direccion": "Nueva dirección 456 #78-90"
}
```

## 📋 Listar Usuarios

**GET** `http://localhost:3000/api/auth/usuarios?tipoUsuario=comprador`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🏥 Health Check

**GET** `http://localhost:3000/api/health`

## 📖 Documentación Completa

**GET** `http://localhost:3000/api`
