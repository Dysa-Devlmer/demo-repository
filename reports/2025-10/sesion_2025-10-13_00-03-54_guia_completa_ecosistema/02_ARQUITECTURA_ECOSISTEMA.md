# 🏗️ Arquitectura Completa del Ecosistema ChatBotDysa

**Fecha**: 13 de Octubre, 2025 - 00:05
**Versión**: 1.0.0
**Estado**: ✅ Documentación Completa

---

## 📋 ÍNDICE

1. [Visión General del Ecosistema](#visión-general-del-ecosistema)
2. [Arquitectura de Alto Nivel](#arquitectura-de-alto-nivel)
3. [Componentes del Sistema](#componentes-del-sistema)
4. [Stack Tecnológico](#stack-tecnológico)
5. [Flujo de Datos](#flujo-de-datos)
6. [Seguridad y Autenticación](#seguridad-y-autenticación)
7. [Base de Datos](#base-de-datos)
8. [Deployment](#deployment)

---

## 🌟 VISIÓN GENERAL DEL ECOSISTEMA

ChatBotDysa Enterprise es un **sistema completo de gestión de restaurantes con inteligencia artificial** que incluye:

### Propósito
- Gestión integral de restaurantes
- Chatbot con IA para atención al cliente
- Panel de administración web
- Sistema de órdenes y reservas
- Integración con pagos (MercadoPago)

### Audiencia
- Restaurantes pequeños y medianos
- Propietarios y administradores
- Personal operativo
- Clientes finales

### Alcance
- **3 Restaurantes** (instalación inicial)
- **Multi-tenant** (arquitectura preparada para escalar)
- **Offline-first** (funciona sin internet)
- **Multi-plataforma** (Windows, macOS, Linux)

---

## 🏗️ ARQUITECTURA DE ALTO NIVEL

```
┌─────────────────────────────────────────────────────────────────┐
│                        USUARIOS FINALES                          │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│   Clientes   │   Personal   │   Admins     │   Propietarios     │
└──────┬───────┴──────┬───────┴──────┬───────┴──────┬─────────────┘
       │              │              │              │
       │              │              │              │
┌──────▼──────┐ ┌─────▼──────┐ ┌────▼─────┐ ┌──────▼──────────┐
│  Landing    │ │ Web Widget │ │  Admin   │ │  Mobile App     │
│  Page       │ │  Chat      │ │  Panel   │ │  (Futuro)       │
│  (Next.js)  │ │  (React)   │ │(Next.js) │ │  (React Native) │
└──────┬──────┘ └─────┬──────┘ └────┬─────┘ └──────┬──────────┘
       │              │              │              │
       └──────────────┴──────────────┴──────────────┘
                      │
                      │  HTTP/HTTPS + JWT
                      │
       ┌──────────────▼──────────────────┐
       │      API GATEWAY / NGINX         │
       │   (Rate Limiting, SSL, CORS)     │
       └──────────────┬──────────────────┘
                      │
       ┌──────────────▼──────────────────┐
       │       BACKEND API (NestJS)       │
       │  ┌────────────────────────────┐  │
       │  │  Authentication Module      │  │
       │  │  Users & Roles Module       │  │
       │  │  Customers Module           │  │
       │  │  Menu Module                │  │
       │  │  Orders Module              │  │
       │  │  Reservations Module        │  │
       │  │  Conversations Module (AI)  │  │
       │  │  Payments Module            │  │
       │  │  Settings Module            │  │
       │  └────────────────────────────┘  │
       └──────────┬──────────┬────────────┘
                  │          │
         ┌────────▼──┐   ┌───▼────────┐
         │PostgreSQL │   │   Redis    │
         │  Database │   │   Cache    │
         └───────────┘   └────────────┘
                  │
         ┌────────▼──────────┐
         │   Ollama AI       │
         │  (phi3:mini)      │
         │  Local LLM        │
         └───────────────────┘

┌────────────────────────────────────────────────┐
│         SERVICIOS EXTERNOS (Opcionales)        │
├────────────┬──────────────┬──────────────────┤
│ SendGrid   │ MercadoPago  │   Twilio         │
│ (Email)    │ (Pagos)      │   (WhatsApp)     │
└────────────┴──────────────┴──────────────────┘
```

---

## 🧩 COMPONENTES DEL SISTEMA

### 1. 🎯 BACKEND API (NestJS)

**Responsabilidad**: API REST principal, lógica de negocio

**Tecnologías**:
- **Framework**: NestJS 10
- **Lenguaje**: TypeScript
- **Runtime**: Node.js 20 LTS
- **Puerto**: 8005

**Módulos Principales**:

```
apps/backend/src/
├── main.ts                          # Entry point
├── app.module.ts                    # Módulo raíz
│
├── auth/                            # Autenticación y autorización
│   ├── auth.controller.ts           # Login, logout, refresh
│   ├── auth.service.ts              # Lógica de autenticación
│   ├── jwt.strategy.ts              # Estrategia JWT
│   └── guards/
│       ├── jwt-auth.guard.ts        # Guard de JWT
│       └── roles.guard.ts           # Guard de roles
│
├── users/                           # Gestión de usuarios
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── user.entity.ts               # Entity TypeORM
│   └── dto/
│
├── customers/                       # Clientes del restaurante
│   ├── customers.controller.ts
│   ├── customers.service.ts
│   └── customer.entity.ts
│
├── menu/                            # Menú del restaurante
│   ├── menu.controller.ts
│   ├── menu.service.ts
│   ├── menu-item.entity.ts
│   └── category.entity.ts
│
├── orders/                          # Órdenes/Pedidos
│   ├── orders.controller.ts
│   ├── orders.service.ts
│   ├── order.entity.ts
│   └── order-item.entity.ts
│
├── reservations/                    # Reservas de mesas
│   ├── reservations.controller.ts
│   ├── reservations.service.ts
│   └── reservation.entity.ts
│
├── conversations/                   # Conversaciones con IA
│   ├── conversations.controller.ts
│   ├── conversations.service.ts
│   ├── conversation.entity.ts
│   ├── message.entity.ts
│   └── ollama.service.ts            # Integración con Ollama
│
├── payments/                        # Integración de pagos
│   ├── payments.controller.ts
│   ├── payments.service.ts
│   └── mercadopago.service.ts       # MercadoPago
│
├── settings/                        # Configuración del sistema
│   ├── settings.controller.ts
│   ├── settings.service.ts
│   └── setting.entity.ts
│
└── common/                          # Utilidades compartidas
    ├── guards/
    │   └── rate-limit.guard.ts      # Rate limiter progresivo
    ├── filters/
    │   └── all-exceptions.filter.ts # Manejo global de errores
    ├── interceptors/
    │   └── logging.interceptor.ts   # Logging
    └── decorators/
        └── roles.decorator.ts       # Decorador de roles
```

**Features Clave**:
- ✅ Autenticación JWT
- ✅ Rate Limiting Progresivo
- ✅ RBAC (Role-Based Access Control)
- ✅ Validación de DTOs (class-validator)
- ✅ Manejo global de errores
- ✅ Logging estructurado
- ✅ Healthchecks
- ✅ Swagger/OpenAPI docs

---

### 2. 🖥️ ADMIN PANEL (Next.js 15)

**Responsabilidad**: Panel de administración web para gestión del restaurante

**Tecnologías**:
- **Framework**: Next.js 15 (App Router)
- **Lenguaje**: TypeScript
- **UI Library**: Shadcn/ui + Tailwind CSS
- **State**: React Context + Hooks
- **Puerto**: 7001

**Estructura**:

```
apps/admin-panel/src/
├── app/                             # App Router de Next.js 15
│   ├── layout.tsx                   # Layout principal
│   ├── page.tsx                     # Home (redirect a /dashboard)
│   │
│   ├── login/                       # Login page
│   │   └── page.tsx
│   │
│   ├── dashboard/                   # Dashboard principal
│   │   └── page.tsx
│   │
│   ├── customers/                   # Gestión de clientes
│   │   ├── page.tsx                 # Listado
│   │   ├── [id]/                    # Detalle/Edición
│   │   └── new/                     # Crear nuevo
│   │
│   ├── menu/                        # Gestión de menú
│   │   ├── page.tsx
│   │   ├── [id]/
│   │   └── new/
│   │
│   ├── orders/                      # Gestión de órdenes
│   │   ├── page.tsx
│   │   └── [id]/
│   │
│   ├── reservations/                # Gestión de reservas
│   │   ├── page.tsx
│   │   └── [id]/
│   │
│   ├── ai-chat/                     # Chat con IA
│   │   └── page.tsx
│   │
│   ├── analytics/                   # Reportes y análisis
│   │   └── page.tsx
│   │
│   ├── settings/                    # Configuración
│   │   ├── page.tsx
│   │   ├── users/
│   │   ├── roles/
│   │   └── general/
│   │
│   └── api/                         # API Routes (si es necesario)
│
├── components/                      # Componentes React
│   ├── ui/                          # Componentes de Shadcn/ui
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── dashboard/
│   │   ├── StatsCard.tsx
│   │   └── RecentOrders.tsx
│   ├── customers/
│   │   ├── CustomerList.tsx
│   │   └── CustomerForm.tsx
│   └── ...
│
├── hooks/                           # Custom React Hooks
│   ├── useAuth.ts
│   ├── useApi.ts
│   ├── useTranslation.ts            # i18n
│   └── useWebSocket.ts
│
├── lib/                             # Utilidades
│   ├── api.ts                       # Cliente HTTP
│   ├── auth.ts                      # Helpers de autenticación
│   └── utils.ts
│
├── contexts/                        # React Contexts
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
│
├── types/                           # TypeScript types
│   ├── api.ts
│   ├── user.ts
│   └── ...
│
└── styles/
    └── globals.css                  # Estilos globales
```

**Features**:
- ✅ Server-Side Rendering (SSR)
- ✅ Responsive Design (móvil, tablet, desktop)
- ✅ Dark Mode
- ✅ Multi-idioma (es, en, fr)
- ✅ Tablas con paginación
- ✅ Gráficos interactivos
- ✅ Formularios validados
- ✅ Drag & Drop para imágenes
- ✅ Real-time updates (WebSocket)

---

### 3. 🌐 LANDING PAGE (Next.js 15)

**Responsabilidad**: Página pública del restaurante

**Tecnologías**:
- **Framework**: Next.js 15
- **Lenguaje**: TypeScript
- **Styling**: Tailwind CSS
- **Puerto**: 3004

**Estructura**:

```
apps/landing-page/src/
├── app/
│   ├── page.tsx                     # Home
│   ├── about/                       # Acerca de nosotros
│   ├── menu/                        # Menú público
│   ├── contact/                     # Contacto
│   ├── reservations/                # Hacer reserva
│   └── order/                       # Hacer pedido online
│
├── components/
│   ├── Hero.tsx
│   ├── MenuSection.tsx
│   ├── ContactForm.tsx
│   ├── ReservationForm.tsx
│   └── Footer.tsx
│
└── lib/
    └── api.ts
```

**Features**:
- ✅ SEO Optimizado
- ✅ Responsive
- ✅ Imágenes optimizadas (Next.js Image)
- ✅ Formularios de contacto
- ✅ Integración con Google Maps
- ✅ Menú dinámico desde backend

---

### 4. 🧮 WEB WIDGET (React)

**Responsabilidad**: Widget embebible de chat para sitios web

**Tecnologías**:
- **Library**: React 18
- **Bundler**: Vite
- **Tamaño**: < 100KB gzipped

**Integración**:
```html
<!-- En cualquier sitio web -->
<script src="https://cdn.chatbotdysa.com/widget.js"></script>
<script>
  ChatBotDysa.init({
    restaurantId: "restaurant_xyz",
    position: "bottom-right",
    primaryColor: "#FF6B6B"
  });
</script>
```

**Features**:
- ✅ Minimizado (icono flotante)
- ✅ Expandible (ventana de chat)
- ✅ Respuestas en tiempo real con IA
- ✅ Hacer pedidos
- ✅ Hacer reservas
- ✅ Consultar menú
- ✅ Historial de conversación

---

### 5. 🗄️ POSTGRESQL (Base de Datos)

**Responsabilidad**: Almacenamiento persistente de datos

**Tecnologías**:
- **Versión**: PostgreSQL 16
- **Puerto**: 15432 (host) → 5432 (container)

**Esquema de Datos**:

```sql
-- USUARIOS Y AUTENTICACIÓN
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(100),
    "lastName" VARCHAR(100),
    roles TEXT[],                    -- Array de roles
    permissions TEXT[],              -- Array de permisos
    status VARCHAR(20) DEFAULT 'active',
    "failedLoginAttempts" INT DEFAULT 0,
    "accountLockedUntil" TIMESTAMP,
    "lastLoginAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- CLIENTES
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    "dateOfBirth" DATE,
    preferences JSONB,               -- Preferencias del cliente
    "loyaltyPoints" INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- MENÚ - CATEGORÍAS
CREATE TABLE menu_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    "displayOrder" INT DEFAULT 0,
    active BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- MENÚ - ITEMS
CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    "categoryId" INT REFERENCES menu_categories(id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    "imageUrl" VARCHAR(500),
    ingredients TEXT[],
    allergens TEXT[],
    "isAvailable" BOOLEAN DEFAULT true,
    "preparationTime" INT,           -- Minutos
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- ÓRDENES
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    "customerId" INT REFERENCES customers(id),
    "orderNumber" VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "deliveryAddress" TEXT,
    "deliveryNotes" TEXT,
    "paymentMethod" VARCHAR(50),
    "paymentStatus" VARCHAR(20) DEFAULT 'pending',
    "estimatedDeliveryTime" TIMESTAMP,
    "actualDeliveryTime" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- ITEMS DE ÓRDENES
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    "orderId" INT REFERENCES orders(id) ON DELETE CASCADE,
    "menuItemId" INT REFERENCES menu_items(id),
    quantity INT NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    notes TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW()
);

-- RESERVAS
CREATE TABLE reservations (
    id SERIAL PRIMARY KEY,
    "customerId" INT REFERENCES customers(id),
    "reservationDate" TIMESTAMP NOT NULL,
    "numberOfGuests" INT NOT NULL,
    "tableNumber" VARCHAR(20),
    status VARCHAR(20) DEFAULT 'pending',
    "specialRequests" TEXT,
    "confirmedAt" TIMESTAMP,
    "cancelledAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- CONVERSACIONES (CHAT IA)
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    "customerId" INT REFERENCES customers(id),
    "sessionId" VARCHAR(100) UNIQUE NOT NULL,
    channel VARCHAR(20) DEFAULT 'web',
    status VARCHAR(20) DEFAULT 'active',
    metadata JSONB,
    "startedAt" TIMESTAMP DEFAULT NOW(),
    "endedAt" TIMESTAMP
);

-- MENSAJES
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    "conversationId" INT REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,       -- 'user' o 'assistant'
    content TEXT NOT NULL,
    metadata JSONB,
    "createdAt" TIMESTAMP DEFAULT NOW()
);

-- CONFIGURACIÓN
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    "updatedBy" INT REFERENCES users(id),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- ÍNDICES
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_orders_customer ON orders("customerId");
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders("createdAt");
CREATE INDEX idx_reservations_date ON reservations("reservationDate");
CREATE INDEX idx_messages_conversation ON messages("conversationId");
```

**Backups**:
- Backup diario automático
- Retención: 30 días
- Backup manual antes de updates

---

### 6. 🔴 REDIS (Cache)

**Responsabilidad**: Cache, sesiones, rate limiting

**Tecnologías**:
- **Versión**: Redis 7
- **Puerto**: 16379 (host) → 6379 (container)

**Uso**:
- **Sesiones**: Almacenar sesiones JWT
- **Rate Limiting**: Contador de requests por IP/usuario
- **Cache**: Resultados de queries frecuentes
- **Pub/Sub**: Real-time notifications

**Estructura de Keys**:
```
ratelimit:ip:<IP>                    # Rate limiting por IP
ratelimit:user:<USER_ID>             # Rate limiting por usuario
cache:menu:list                      # Cache de menú
cache:stats:dashboard                # Cache de estadísticas
session:<SESSION_ID>                 # Sesiones
```

---

### 7. 🤖 OLLAMA (IA Local)

**Responsabilidad**: Generación de respuestas de chatbot con IA

**Tecnologías**:
- **Modelo**: phi3:mini (3.8B parámetros)
- **Puerto**: 21434 (host) → 11434 (container)

**Capacidades**:
- Responder preguntas sobre el menú
- Recomendar platos
- Tomar órdenes por chat
- Agendar reservas
- Responder preguntas frecuentes
- Multi-idioma (es, en)

**Integración**:
```typescript
// En backend/src/conversations/ollama.service.ts
async generateResponse(prompt: string, context?: string) {
  const response = await axios.post('http://ollama:11434/api/generate', {
    model: 'phi3:mini',
    prompt: `${context}\n\nUsuario: ${prompt}\nAsistente:`,
    stream: false
  });
  return response.data.response;
}
```

---

## 🔄 FLUJO DE DATOS

### Flujo 1: Login de Usuario

```
[Usuario]
   ↓
   email + password
   ↓
[Admin Panel] → POST /api/auth/login
   ↓
[Rate Limit Guard] → Verificar intentos
   ↓
[Auth Controller]
   ↓
[Auth Service] → Validar credenciales
   ↓
[PostgreSQL] → SELECT * FROM users WHERE email = ?
   ↓
[bcrypt] → Comparar password hash
   ↓
[JWT Service] → Generar token
   ↓
[Redis] → Guardar sesión
   ↓
[Response] → {access_token, user}
   ↓
[Admin Panel] → Guardar en localStorage
   ↓
[Usuario] → Redirigir a /dashboard
```

### Flujo 2: Crear Orden

```
[Cliente]
   ↓
   items[] + dirección
   ↓
[Landing Page] → POST /api/orders
   ↓
[JWT Guard] → Verificar token
   ↓
[Orders Controller]
   ↓
[Orders Service]
   ↓
┌────────────────────────┐
│ [Transaction]          │
│   1. Crear orden       │
│   2. Crear order_items │
│   3. Actualizar stock  │
│   4. Crear payment     │
└────────────────────────┘
   ↓
[PostgreSQL] → INSERT INTO orders...
   ↓
[WebSocket] → Notificar admin panel
   ↓
[Email Service] → Enviar confirmación
   ↓
[Response] → {order_id, status}
   ↓
[Cliente] → Ver confirmación
```

### Flujo 3: Chat con IA

```
[Cliente]
   ↓
   "Quiero una pizza"
   ↓
[Web Widget] → POST /api/conversations/:id/messages
   ↓
[Conversations Controller]
   ↓
[Conversations Service]
   ↓
[PostgreSQL] → Guardar mensaje user
   ↓
[Ollama Service] → Generar respuesta
   ↓
[Ollama AI] → POST /api/generate
   ↓
   ← Respuesta: "¡Claro! Tenemos pizzas Margherita, Pepperoni..."
   ↓
[PostgreSQL] → Guardar mensaje assistant
   ↓
[Response] → {message, id}
   ↓
[Web Widget] → Mostrar respuesta
   ↓
[Cliente] → Lee respuesta
```

---

## 🔒 SEGURIDAD Y AUTENTICACIÓN

### Estrategia de Autenticación

**JWT (JSON Web Tokens)**:
```
Header:  { "alg": "HS256", "typ": "JWT" }
Payload: {
  "sub": 1,                         // User ID
  "email": "admin@zgamersa.com",
  "roles": ["admin"],
  "permissions": ["users.read", "orders.write", ...],
  "iat": 1697123456,                // Issued at
  "exp": 1697127056                 // Expiration (1 hora)
}
Signature: HMACSHA256(...)
```

**Flujo de Autenticación**:
1. Usuario envía email + password
2. Backend valida y genera JWT
3. Cliente guarda JWT en localStorage/cookies
4. Cada request incluye: `Authorization: Bearer <JWT>`
5. Backend valida JWT en cada request

### Rate Limiting Progresivo

**Configuración**:
- **Desarrollo**: 50 requests/minuto
- **Producción**: 5 requests/15 minutos

**Progresión**:
```
Intento 1: 15 segundos
Intento 2: 30 segundos
Intento 3: 60 segundos
Intento 4: 2 minutos
Intento 5: 4 minutos
...
Máximo: 1 hora
```

### RBAC (Role-Based Access Control)

**Roles**:
- `admin`: Acceso completo
- `manager`: Gestión operativa
- `staff`: Operaciones básicas
- `customer`: Acceso limitado

**Permisos**:
```typescript
const permissions = {
  'users.read': ['admin', 'manager'],
  'users.write': ['admin'],
  'orders.read': ['admin', 'manager', 'staff'],
  'orders.write': ['admin', 'manager', 'staff'],
  'menu.read': ['admin', 'manager'],
  'menu.write': ['admin'],
  // ...
};
```

### Validaciones

**DTOs (Data Transfer Objects)**:
```typescript
// CreateOrderDto
export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  items: OrderItemDto[];

  @IsString()
  @IsNotEmpty()
  deliveryAddress: string;

  @IsEnum(['cash', 'card', 'mercadopago'])
  paymentMethod: string;
}
```

---

## 📦 DEPLOYMENT

### Docker Compose

**Servicios**:
- backend (NestJS)
- admin-panel (Next.js)
- landing (Next.js)
- postgres (PostgreSQL 16)
- redis (Redis 7)
- ollama (Ollama AI)

**Comandos**:
```bash
# Iniciar todo
docker-compose up -d

# Ver logs
docker-compose logs -f backend

# Reiniciar servicio
docker-compose restart backend

# Rebuild
docker-compose build --no-cache backend

# Parar todo
docker-compose down

# Parar y eliminar volúmenes (⚠️ CUIDADO)
docker-compose down -v
```

### Variables de Entorno

```bash
# .env
NODE_ENV=production
PORT=8005

# Database
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=supersecret
DATABASE_NAME=chatbotdysa

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRATION=1h

# Ollama
OLLAMA_URL=http://ollama:11434
OLLAMA_MODEL=phi3:mini

# External Services
SENDGRID_API_KEY=your_key
MERCADOPAGO_ACCESS_TOKEN=your_token
```

### Health Checks

**Backend**:
```bash
GET /health
→ {
  "status": "ok",
  "info": {
    "database": {"status": "up"},
    "redis": {"status": "up"},
    "ollama": {"status": "up"}
  }
}
```

**Postgres**:
```bash
docker exec chatbotdysa-postgres pg_isready
→ /var/run/postgresql:5432 - accepting connections
```

**Redis**:
```bash
docker exec chatbotdysa-redis redis-cli ping
→ PONG
```

---

## 📊 MONITOREO Y LOGS

### Logs

**Backend**:
```bash
# Logs en tiempo real
docker logs -f chatbotdysa-backend

# Últimas 100 líneas
docker logs chatbotdysa-backend --tail 100

# Logs con timestamps
docker logs -t chatbotdysa-backend
```

**Formato de Logs**:
```json
{
  "timestamp": "2025-10-13T00:05:00.000Z",
  "level": "info",
  "context": "OrdersService",
  "message": "Order created successfully",
  "data": {
    "orderId": 123,
    "customerId": 45,
    "total": 25.50
  }
}
```

### Métricas

**Recursos**:
```bash
# CPU y Memoria
docker stats --no-stream

# Espacio en disco
docker system df
```

---

## 🌐 URLS Y PUERTOS

| Servicio | URL Local | Puerto | Descripción |
|----------|-----------|--------|-------------|
| Backend API | http://localhost:8005 | 8005 | API REST principal |
| API Docs | http://localhost:8005/docs | 8005 | Swagger UI |
| Admin Panel | http://localhost:7001 | 7001 | Panel web de admin |
| Landing Page | http://localhost:3004 | 3004 | Página pública |
| PostgreSQL | localhost:15432 | 15432 | Base de datos |
| Redis | localhost:16379 | 16379 | Cache |
| Ollama | localhost:21434 | 21434 | IA local |

---

## 📁 ESTRUCTURA DE DIRECTORIOS

```
/Users/devlmer/ChatBotDysa/
├── apps/                           # Aplicaciones
│   ├── admin-panel/                # Panel de administración
│   ├── backend/                    # API Backend
│   ├── landing-page/               # Landing page
│   ├── web-widget/                 # Widget de chat
│   ├── website/                    # Sitio corporativo
│   └── installer/                  # Instalador
│
├── docs/                           # Documentación
│   ├── api/                        # Docs de API
│   ├── architecture/               # Arquitectura
│   └── reportes/                   # Reportes y estados
│       ├── enterprise/
│       └── estados-sistema/
│
├── Reportes/                       # Reportes de sesiones
│   └── 2025-10/
│
├── config/                         # Configuraciones
│   ├── nginx/
│   └── ssl/
│
├── docker-configs/                 # Configs de Docker
├── monitoring/                     # Grafana, Prometheus
├── assets/                         # Recursos estáticos
├── certs/                          # Certificados SSL
│
├── docker-compose.yml              # Orquestación
├── .env                            # Variables de entorno
├── .gitignore
└── README.md
```

---

## 🎯 PRÓXIMOS PASOS

### Corto Plazo
- [ ] Implementar WebSocket para real-time updates
- [ ] Agregar tests unitarios y e2e
- [ ] Configurar CI/CD con GitHub Actions
- [ ] Implementar monitoreo con Grafana

### Medio Plazo
- [ ] Aplicación móvil (React Native)
- [ ] Integración con WhatsApp Business
- [ ] Sistema de notificaciones push
- [ ] Dashboard de analytics avanzado

### Largo Plazo
- [ ] Multi-tenant completo
- [ ] Marketplace de plugins
- [ ] Sistema de franquicias
- [ ] Integración con POS físicos

---

**FIN DE LA ARQUITECTURA DEL ECOSISTEMA**

✅ Documentación completa del sistema ChatBotDysa Enterprise
