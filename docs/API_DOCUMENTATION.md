# 🔌 Documentación API - ChatBotDysa

**Versión:** 1.0.0
**Base URL:** `https://api.tu-restaurante.com`
**Fecha:** Octubre 2025

---

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Autenticación](#autenticación)
3. [Endpoints de Autenticación](#endpoints-de-autenticación)
4. [Endpoints de Clientes](#endpoints-de-clientes)
5. [Endpoints de Menú](#endpoints-de-menú)
6. [Endpoints de Órdenes](#endpoints-de-órdenes)
7. [Endpoints de Reservas](#endpoints-de-reservas)
8. [Endpoints de Conversaciones](#endpoints-de-conversaciones)
9. [Endpoints de Dashboard](#endpoints-de-dashboard)
10. [Códigos de Error](#códigos-de-error)
11. [Rate Limiting](#rate-limiting)
12. [Webhooks](#webhooks)

---

## Introducción

La API de ChatBotDysa es una API REST que utiliza JSON para las peticiones y respuestas.

### Características

- ✅ RESTful design
- ✅ Autenticación JWT
- ✅ Rate limiting
- ✅ Paginación
- ✅ Filtros y búsqueda
- ✅ Webhooks
- ✅ Documentación Swagger

### URLs Base

```
Desarrollo:  http://localhost:8005
Producción:  https://api.tu-restaurante.com
```

### Formato de Respuesta

Todas las respuestas siguen este formato:

**Exitosa:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2025-10-22T14:30:00Z",
    "version": "1.0.0"
  }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": {
      "field": "email",
      "constraint": "required"
    }
  },
  "meta": {
    "timestamp": "2025-10-22T14:30:00Z"
  }
}
```

---

## Autenticación

### JWT (JSON Web Tokens)

La API utiliza JWT para autenticación. Incluye el token en el header `Authorization`:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Obtener Token

```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@restaurante.com",
  "password": "tu-password"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600,
    "user": {
      "id": 1,
      "email": "admin@restaurante.com",
      "role": "admin"
    }
  }
}
```

### Refresh Token

```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Endpoints de Autenticación

### POST /auth/login

Iniciar sesión y obtener token JWT.

**Request:**
```json
{
  "email": "admin@restaurante.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600,
    "user": {
      "id": 1,
      "email": "admin@restaurante.com",
      "name": "Admin Usuario",
      "role": "admin"
    }
  }
}
```

**Errores:**
- `401 Unauthorized`: Credenciales incorrectas
- `400 Bad Request`: Email o password faltante

---

### POST /auth/register

Registrar nuevo usuario (solo admin).

**Request:**
```json
{
  "email": "nuevo@restaurante.com",
  "password": "password123",
  "name": "Nuevo Usuario",
  "role": "staff"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "email": "nuevo@restaurante.com",
    "name": "Nuevo Usuario",
    "role": "staff",
    "created_at": "2025-10-22T14:30:00Z"
  }
}
```

---

### POST /auth/logout

Cerrar sesión (invalidar token).

**Headers:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

## Endpoints de Clientes

### GET /api/customers

Listar todos los clientes con paginación.

**Headers:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
```
page     (number, default: 1)          - Página actual
limit    (number, default: 10)         - Items por página
search   (string, optional)            - Buscar por nombre, email, teléfono
status   (string, optional)            - Filtrar por estado (active|inactive)
sort     (string, default: created_at) - Campo para ordenar
order    (string, default: desc)       - Orden (asc|desc)
```

**Example:**
```http
GET /api/customers?page=1&limit=20&search=juan&status=active&sort=name&order=asc
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Juan Pérez",
      "email": "juan@email.com",
      "phone": "+56912345678",
      "address": "Av. Principal 123",
      "status": "active",
      "total_orders": 15,
      "total_spent": 450000,
      "last_order_date": "2025-10-20T19:30:00Z",
      "created_at": "2025-01-15T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "total_pages": 8
  }
}
```

---

### GET /api/customers/:id

Obtener detalles de un cliente específico.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@email.com",
    "phone": "+56912345678",
    "address": "Av. Principal 123",
    "birthday": "1990-05-15",
    "status": "active",
    "preferences": {
      "dietary": ["vegetarian"],
      "allergies": ["nuts"]
    },
    "stats": {
      "total_orders": 15,
      "total_spent": 450000,
      "avg_order_value": 30000,
      "last_order_date": "2025-10-20T19:30:00Z",
      "favorite_dishes": [
        {
          "name": "Pizza Margherita",
          "times_ordered": 8
        }
      ]
    },
    "recent_orders": [
      {
        "id": "ORD-123",
        "date": "2025-10-20T19:30:00Z",
        "total": 35000,
        "status": "completed"
      }
    ],
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-10-22T14:30:00Z"
  }
}
```

---

### POST /api/customers

Crear nuevo cliente.

**Request:**
```json
{
  "name": "María González",
  "email": "maria@email.com",
  "phone": "+56987654321",
  "address": "Calle Los Álamos 456",
  "birthday": "1985-08-22",
  "preferences": {
    "dietary": ["vegan"],
    "allergies": []
  },
  "notes": "Cliente VIP"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 157,
    "name": "María González",
    "email": "maria@email.com",
    "phone": "+56987654321",
    "status": "active",
    "created_at": "2025-10-22T14:30:00Z"
  }
}
```

**Errores:**
- `400 Bad Request`: Datos inválidos
- `409 Conflict`: Email o teléfono ya existe

---

### PUT /api/customers/:id

Actualizar cliente existente.

**Request:**
```json
{
  "name": "María González Silva",
  "phone": "+56987654321",
  "address": "Nueva Dirección 789"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 157,
    "name": "María González Silva",
    "phone": "+56987654321",
    "address": "Nueva Dirección 789",
    "updated_at": "2025-10-22T15:00:00Z"
  }
}
```

---

### DELETE /api/customers/:id

Eliminar cliente (soft delete).

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Customer deleted successfully"
  }
}
```

---

## Endpoints de Menú

### GET /api/menu

Listar todos los items del menú.

**Query Parameters:**
```
category     (string, optional)  - Filtrar por categoría
available    (boolean, optional) - Solo items disponibles
search       (string, optional)  - Buscar por nombre
sort         (string)            - Campo para ordenar
order        (string)            - asc|desc
```

**Example:**
```http
GET /api/menu?category=main&available=true&sort=price&order=asc
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Pizza Margherita",
      "description": "Masa artesanal, tomate fresco, mozzarella y albahaca",
      "category": "main",
      "price": 12990,
      "image_url": "https://cdn.example.com/pizza.jpg",
      "available": true,
      "preparation_time": 15,
      "tags": ["vegetarian", "popular"],
      "allergens": ["gluten", "dairy"],
      "nutrition": {
        "calories": 850,
        "protein": 35,
        "carbs": 95,
        "fat": 32
      },
      "created_at": "2025-01-10T10:00:00Z",
      "updated_at": "2025-10-22T14:00:00Z"
    }
  ]
}
```

---

### GET /api/menu/:id

Obtener detalles de un item del menú.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Pizza Margherita",
    "description": "Masa artesanal, tomate fresco, mozzarella y albahaca",
    "category": "main",
    "price": 12990,
    "image_url": "https://cdn.example.com/pizza.jpg",
    "available": true,
    "stock": 25,
    "preparation_time": 15,
    "tags": ["vegetarian", "popular"],
    "allergens": ["gluten", "dairy"],
    "ingredients": [
      "Masa de pizza",
      "Salsa de tomate",
      "Mozzarella",
      "Albahaca fresca",
      "Aceite de oliva"
    ],
    "nutrition": {
      "calories": 850,
      "protein": 35,
      "carbs": 95,
      "fat": 32,
      "fiber": 4,
      "sodium": 980
    },
    "stats": {
      "times_ordered": 245,
      "avg_rating": 4.7,
      "reviews_count": 89
    }
  }
}
```

---

### POST /api/menu

Crear nuevo item del menú.

**Request:**
```json
{
  "name": "Hamburguesa Clásica",
  "description": "Carne angus 180g, queso cheddar, lechuga, tomate",
  "category": "main",
  "price": 9990,
  "preparation_time": 12,
  "available": true,
  "stock": 30,
  "tags": ["popular"],
  "allergens": ["gluten", "dairy"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 25,
    "name": "Hamburguesa Clásica",
    "category": "main",
    "price": 9990,
    "available": true,
    "created_at": "2025-10-22T15:00:00Z"
  }
}
```

---

### PUT /api/menu/:id

Actualizar item del menú.

**Request:**
```json
{
  "price": 10990,
  "available": true,
  "stock": 20
}
```

---

### DELETE /api/menu/:id

Eliminar item del menú.

---

## Endpoints de Órdenes

### GET /api/orders

Listar todas las órdenes.

**Query Parameters:**
```
status       (string, optional)  - pending|confirmed|preparing|ready|completed|cancelled
order_type   (string, optional)  - dine-in|delivery|takeaway
date_from    (string, optional)  - Fecha desde (YYYY-MM-DD)
date_to      (string, optional)  - Fecha hasta (YYYY-MM-DD)
customer_id  (number, optional)  - ID del cliente
page         (number, default: 1)
limit        (number, default: 10)
```

**Example:**
```http
GET /api/orders?status=pending&order_type=delivery&page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "ORD-001",
      "customer": {
        "id": 1,
        "name": "Juan Pérez",
        "phone": "+56912345678"
      },
      "order_type": "delivery",
      "status": "preparing",
      "items": [
        {
          "id": 1,
          "name": "Pizza Margherita",
          "quantity": 2,
          "price": 12990,
          "subtotal": 25980
        }
      ],
      "subtotal": 25980,
      "tax": 4936,
      "delivery_fee": 3000,
      "total": 33916,
      "payment_status": "paid",
      "payment_method": "card",
      "delivery_address": "Av. Principal 123",
      "notes": "Sin cebolla",
      "estimated_time": "30-40 min",
      "created_at": "2025-10-22T14:00:00Z",
      "updated_at": "2025-10-22T14:15:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "total_pages": 3
  }
}
```

---

### GET /api/orders/:id

Obtener detalles de una orden específica.

---

### POST /api/orders

Crear nueva orden.

**Request:**
```json
{
  "customer": {
    "name": "Juan Pérez",
    "phone": "+56912345678",
    "email": "juan@email.com"
  },
  "order_type": "delivery",
  "items": [
    {
      "menu_item_id": 1,
      "quantity": 2,
      "notes": "Sin cebolla"
    },
    {
      "menu_item_id": 5,
      "quantity": 1
    }
  ],
  "delivery_address": "Av. Principal 123, Depto 5",
  "payment_method": "card",
  "notes": "Por favor tocar el timbre"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ORD-157",
    "order_number": "ORD-157",
    "status": "pending",
    "total": 33916,
    "created_at": "2025-10-22T15:00:00Z",
    "estimated_delivery": "2025-10-22T15:40:00Z"
  }
}
```

---

### PUT /api/orders/:id/status

Actualizar estado de la orden.

**Request:**
```json
{
  "status": "preparing"
}
```

**Estados válidos:**
- `pending`
- `confirmed`
- `preparing`
- `ready`
- `in_delivery`
- `completed`
- `cancelled`

---

### POST /api/orders/:id/cancel

Cancelar orden.

**Request:**
```json
{
  "reason": "Cliente solicitó cancelación"
}
```

---

## Endpoints de Conversaciones

### GET /api/conversations

Listar conversaciones.

**Query Parameters:**
```
status      (string, optional) - open|closed
channel     (string, optional) - web_widget|whatsapp|facebook
page        (number)
limit       (number)
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "customer": {
        "id": 5,
        "name": "Juan Pérez",
        "phone": "+56912345678"
      },
      "channel": "web_widget",
      "status": "open",
      "last_message": {
        "content": "¿Cuál es el horario?",
        "sender": "customer",
        "timestamp": "2025-10-22T14:30:00Z"
      },
      "messages_count": 12,
      "created_at": "2025-10-22T14:00:00Z",
      "updated_at": "2025-10-22T14:30:00Z"
    }
  ]
}
```

---

### GET /api/conversations/:id

Obtener conversación completa con todos los mensajes.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "customer": {
      "id": 5,
      "name": "Juan Pérez",
      "phone": "+56912345678"
    },
    "channel": "web_widget",
    "status": "open",
    "messages": [
      {
        "id": 1,
        "content": "Hola, ¿están abiertos?",
        "sender": "customer",
        "timestamp": "2025-10-22T14:00:00Z"
      },
      {
        "id": 2,
        "content": "¡Hola! Sí, estamos abiertos de 12:00 a 23:00",
        "sender": "bot",
        "timestamp": "2025-10-22T14:00:15Z"
      }
    ],
    "created_at": "2025-10-22T14:00:00Z"
  }
}
```

---

### POST /api/conversations

Crear nueva conversación.

**Request:**
```json
{
  "customer_phone": "+56912345678",
  "platform": "web_widget"
}
```

---

### POST /api/conversations/:id/messages

Enviar mensaje en una conversación.

**Request:**
```json
{
  "message": "¿Cuál es el horario del restaurante?",
  "sender": "customer"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_message": {
      "id": 15,
      "content": "¿Cuál es el horario del restaurante?",
      "sender": "customer",
      "timestamp": "2025-10-22T14:30:00Z"
    },
    "ai_response": "Nuestro horario es Lunes a Domingo de 12:00 a 23:00. ¡Te esperamos!",
    "message_id": 16
  }
}
```

---

## Endpoints de Dashboard

### GET /api/dashboard/stats

Obtener estadísticas del dashboard.

**Query Parameters:**
```
period (string, optional) - today|week|month|year
```

**Response:**
```json
{
  "success": true,
  "data": {
    "today": {
      "orders": {
        "total": 45,
        "completed": 38,
        "pending": 7,
        "cancelled": 2
      },
      "revenue": {
        "total": 1450000,
        "avg_order": 32222,
        "by_payment_method": {
          "cash": 450000,
          "card": 850000,
          "transfer": 150000
        }
      },
      "customers": {
        "total": 38,
        "new": 5,
        "returning": 33
      }
    },
    "week": {
      "orders_trend": [
        {"date": "2025-10-16", "count": 52},
        {"date": "2025-10-17", "count": 48},
        {"date": "2025-10-18", "count": 55},
        {"date": "2025-10-19", "count": 61},
        {"date": "2025-10-20", "count": 58},
        {"date": "2025-10-21", "count": 42},
        {"date": "2025-10-22", "count": 45}
      ],
      "revenue_trend": [
        {"date": "2025-10-16", "amount": 1650000},
        {"date": "2025-10-17", "amount": 1520000},
        {"date": "2025-10-18", "amount": 1780000},
        {"date": "2025-10-19", "amount": 1950000},
        {"date": "2025-10-20", "amount": 1850000},
        {"date": "2025-10-21", "amount": 1320000},
        {"date": "2025-10-22", "amount": 1450000}
      ]
    },
    "top_dishes": [
      {
        "id": 1,
        "name": "Pizza Margherita",
        "times_ordered": 125,
        "revenue": 1623750
      },
      {
        "id": 2,
        "name": "Hamburguesa Clásica",
        "times_ordered": 98,
        "revenue": 979020
      }
    ]
  }
}
```

---

## Códigos de Error

### HTTP Status Codes

| Código | Nombre | Descripción |
|--------|--------|-------------|
| 200 | OK | Solicitud exitosa |
| 201 | Created | Recurso creado |
| 204 | No Content | Exitoso sin contenido |
| 400 | Bad Request | Datos inválidos |
| 401 | Unauthorized | No autenticado |
| 403 | Forbidden | Sin permisos |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Conflicto (duplicado) |
| 422 | Unprocessable Entity | Validación falló |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Error del servidor |

### Error Codes

| Code | Descripción |
|------|-------------|
| `VALIDATION_ERROR` | Datos de entrada inválidos |
| `UNAUTHORIZED` | Token inválido o expirado |
| `FORBIDDEN` | Sin permisos para esta acción |
| `NOT_FOUND` | Recurso no encontrado |
| `DUPLICATE` | Recurso ya existe |
| `RATE_LIMIT_EXCEEDED` | Demasiadas peticiones |
| `INTERNAL_ERROR` | Error interno del servidor |

---

## Rate Limiting

### Límites

**Desarrollo:**
- 100 requests por minuto

**Producción:**
- 20 requests por minuto (sin autenticar)
- 60 requests por minuto (autenticado)

### Headers de Rate Limit

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1729612800
```

### Respuesta cuando se excede:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again in 60 seconds.",
    "retry_after": 60
  }
}
```

---

## Webhooks

### Configurar Webhook

1. Ir a **Configuración → Webhooks**
2. Agregar URL de callback
3. Seleccionar eventos a escuchar
4. Guardar

### Eventos Disponibles

- `order.created`
- `order.updated`
- `order.completed`
- `order.cancelled`
- `customer.created`
- `customer.updated`
- `reservation.created`
- `reservation.cancelled`
- `conversation.new_message`

### Payload de Webhook

```json
{
  "event": "order.created",
  "timestamp": "2025-10-22T15:00:00Z",
  "data": {
    "id": "ORD-157",
    "customer": {
      "id": 5,
      "name": "Juan Pérez"
    },
    "total": 33916,
    "status": "pending"
  }
}
```

### Verificación de Firma

Cada webhook incluye header `X-Webhook-Signature`:

```javascript
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(JSON.stringify(payload)).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}
```

---

## Ejemplos de Uso

### cURL

```bash
# Login
curl -X POST https://api.tu-restaurante.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@restaurante.com","password":"password123"}'

# Listar órdenes
curl -X GET https://api.tu-restaurante.com/api/orders \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Crear orden
curl -X POST https://api.tu-restaurante.com/api/orders \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {"name":"Juan","phone":"+56912345678"},
    "order_type":"delivery",
    "items":[{"menu_item_id":1,"quantity":2}]
  }'
```

### JavaScript (Fetch)

```javascript
// Login
const login = async () => {
  const response = await fetch('https://api.tu-restaurante.com/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'admin@restaurante.com',
      password: 'password123'
    })
  });

  const data = await response.json();
  return data.data.access_token;
};

// Listar órdenes
const getOrders = async (token) => {
  const response = await fetch('https://api.tu-restaurante.com/api/orders', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return await response.json();
};
```

### Python (Requests)

```python
import requests

# Login
def login():
    response = requests.post(
        'https://api.tu-restaurante.com/auth/login',
        json={
            'email': 'admin@restaurante.com',
            'password': 'password123'
        }
    )
    return response.json()['data']['access_token']

# Listar órdenes
def get_orders(token):
    response = requests.get(
        'https://api.tu-restaurante.com/api/orders',
        headers={'Authorization': f'Bearer {token}'}
    )
    return response.json()
```

---

## Swagger/OpenAPI

Accede a la documentación interactiva:

```
https://api.tu-restaurante.com/api
```

Descarga el spec OpenAPI:

```
https://api.tu-restaurante.com/api-json
```

---

## Soporte

**Documentación adicional:**
- Guía de inicio rápido: [QUICKSTART.md](./QUICKSTART.md)
- Ejemplos completos: [/examples](./examples/)
- Changelog: [CHANGELOG.md](./CHANGELOG.md)

**Contacto:**
- Email: api-support@dysadev.com
- GitHub Issues: https://github.com/dysadev/chatbotdysa/issues
