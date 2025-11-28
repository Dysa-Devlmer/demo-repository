# 🏗️ ARQUITECTURA COMPLETA DEL SISTEMA CHATBOTDYSA

## 📋 ÍNDICE
1. [Descripción General](#descripción-general)
2. [Arquitectura de Alto Nivel](#arquitectura-de-alto-nivel)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Aplicaciones del Sistema](#aplicaciones-del-sistema)
5. [Base de Datos](#base-de-datos)
6. [API Backend](#api-backend)
7. [Flujos de Datos](#flujos-de-datos)
8. [Seguridad](#seguridad)
9. [Despliegue](#despliegue)

---

## 📝 DESCRIPCIÓN GENERAL

**ChatBotDysa** es un sistema empresarial completo para gestión de restaurantes con inteligencia artificial integrada. El sistema utiliza una arquitectura de **monorepo** con múltiples aplicaciones que trabajan de forma sincronizada.

### 🎯 Propósito
- Automatizar atención al cliente mediante chatbot IA
- Gestionar operaciones de restaurante (órdenes, reservas, menú)
- Proporcionar análisis y reportes empresariales
- Integrar múltiples canales de comunicación (WhatsApp, Web, Twilio)

### 👥 Usuarios
- **Administradores**: Gestión completa del sistema
- **Personal del restaurante**: Operaciones diarias
- **Clientes**: Interacción mediante chatbot y widget web

---

## 🏗️ ARQUITECTURA DE ALTO NIVEL

```
┌─────────────────────────────────────────────────────────────────┐
│                         CAPA DE PRESENTACIÓN                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Landing    │  │    Admin     │  │     Web      │          │
│  │     Page     │  │    Panel     │  │    Widget    │          │
│  │  (Next.js)   │  │  (Next.js)   │  │  (Webpack)   │          │
│  │  Port 6001   │  │  Port 7001   │  │  Port 7002   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                           │                  │                  │
└───────────────────────────┼──────────────────┼──────────────────┘
                            │                  │
                            ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                       CAPA DE APLICACIÓN                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Backend API (NestJS)                         │  │
│  │                   Port 8005                               │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                           │  │
│  │  • REST API          • JWT Auth      • WebSockets        │  │
│  │  • Rate Limiting     • RBAC          • CORS              │  │
│  │  • Security          • Audit Logs    • Caching           │  │
│  │                                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                    │
└────────────────────────────┼────────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CAPA DE SERVICIOS                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  PostgreSQL  │  │    Redis     │  │   Ollama     │          │
│  │   Database   │  │    Cache     │  │  IA (LLM)    │          │
│  │  Port 15432  │  │  Port 16379  │  │  Port 11434  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
              │              │              │
              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    INTEGRACIONES EXTERNAS                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    WhatsApp Business  │  Twilio Voice  │  Stripe Payments       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ STACK TECNOLÓGICO

### **Frontend**
| Tecnología | Versión | Uso |
|------------|---------|-----|
| Next.js | 15.5.3 | Framework React para SSR |
| React | 18.3.1 | Librería UI |
| TypeScript | 5.9.2 | Tipado estático |
| TailwindCSS | 3.x | Estilos |
| Radix UI | Latest | Componentes accesibles |
| Framer Motion | 12.x | Animaciones |
| Lucide React | 0.544.0 | Iconos |

### **Backend**
| Tecnología | Versión | Uso |
|------------|---------|-----|
| NestJS | 11.1.6 | Framework Node.js |
| TypeScript | 5.9.2 | Tipado estático |
| TypeORM | 0.3.20 | ORM para PostgreSQL |
| Passport JWT | 11.0.0 | Autenticación |
| Class Validator | 0.14.1 | Validación DTOs |
| Socket.io | Latest | WebSockets |

### **Base de Datos**
| Tecnología | Versión | Uso |
|------------|---------|-----|
| PostgreSQL | 15.x | Base de datos relacional |
| Redis | Latest | Cache y sesiones |

### **Inteligencia Artificial**
| Tecnología | Modelo | Tamaño |
|------------|---------|--------|
| Ollama | llama3:8b | 4.3 GB |

### **DevOps**
| Tecnología | Uso |
|------------|-----|
| Docker | Contenedores |
| Docker Compose | Orquestación |
| Electron | App Desktop (opcional) |

---

## 🌐 APLICACIONES DEL SISTEMA

### **1️⃣ Landing Page (Website)**
```
📁 Ubicación: apps/website/
🌐 Puerto: 6001
🎯 Framework: Next.js 14
📄 Páginas:
   - / (Home)
   - /registro (Registro de restaurantes)
   - /login (Inicio de sesión)
   - /planes (Planes de suscripción)
   - /demo (Demo del sistema)
   - /casos-exito (Casos de éxito)
```

**Propósito**: Sitio público para captación de nuevos restaurantes clientes.

---

### **2️⃣ Admin Panel (Dashboard)**
```
📁 Ubicación: apps/admin-panel/
🌐 Puerto: 7001
🎯 Framework: Next.js 14
🔐 Autenticación: JWT Bearer Token
```

#### **Páginas del Admin Panel (18 páginas)**

| Ruta | Descripción |
|------|-------------|
| `/` | Dashboard principal con métricas |
| `/login` | Inicio de sesión |
| `/customers` | Gestión de clientes |
| `/menu` | Gestión del menú del restaurante |
| `/orders` | Gestión de órdenes |
| `/reservations` | Gestión de reservas |
| `/conversations` | Historial de conversaciones chatbot |
| `/analytics` | Análisis y reportes |
| `/settings` | Configuración del sistema |
| `/users` | Gestión de usuarios del sistema |
| `/ai-chat` | Interfaz de prueba del chatbot |
| `/roles` | Gestión de roles y permisos |
| `/reports` | Generación de reportes |
| `/notifications` | Centro de notificaciones |
| `/profile` | Perfil del usuario |
| `/security` | Configuración de seguridad |
| `/integrations` | Integraciones (WhatsApp, Twilio) |
| `/backup` | Respaldos y restauración |

---

### **3️⃣ Web Widget**
```
📁 Ubicación: apps/web-widget/
🌐 Puerto: 7002
🎯 Build Tool: Webpack 5
📦 Output: dysabot-widget.js (438 KB)
```

**Propósito**: Widget JavaScript embebible en sitios web de restaurantes para chat en vivo con IA.

**Características**:
- Chat en tiempo real con Socket.io
- Interfaz responsive
- Conexión con backend API
- Personalizable por restaurante

---

### **4️⃣ Backend API**
```
📁 Ubicación: apps/backend/
🌐 Puerto: 8005
🎯 Framework: NestJS 11
🔐 Autenticación: JWT + RBAC
📚 Documentación: Swagger en /api/docs
```

#### **Módulos del Backend** (20 módulos)

1. **AuthModule** - Autenticación y autorización
2. **UsersModule** - Gestión de usuarios
3. **CustomersModule** - Gestión de clientes
4. **MenuModule** - Gestión de menú
5. **OrdersModule** - Gestión de órdenes
6. **ReservationsModule** - Gestión de reservas
7. **PromotionsModule** - Gestión de promociones
8. **ConversationsModule** - Historial de chat
9. **DashboardModule** - Métricas y estadísticas
10. **ReportsModule** - Generación de reportes
11. **AiModule** - Integración con Ollama
12. **WebSocketsModule** - WebSockets
13. **WhatsAppModule** - Integración WhatsApp
14. **TwilioModule** - Integración Twilio
15. **SettingsModule** - Configuración
16. **SecurityModule** - Seguridad empresarial
17. **DemoModule** - Modo demo con reset
18. **PaymentsModule** - Procesamiento de pagos
19. **UploadsModule** - Carga de archivos
20. **CommonModule** - Utilidades compartidas

---

## 🗄️ BASE DE DATOS

### **Esquema PostgreSQL** (23 tablas)

#### **Tablas de Autenticación y Usuarios**
```sql
users                 -- Usuarios del sistema
├── id (PK)
├── email (UNIQUE)
├── password (hashed)
├── firstName
├── lastName
├── role
├── status (enum: active, inactive, suspended)
├── isEmailVerified
├── isTwoFactorEnabled
├── createdAt
└── updatedAt

roles                 -- Roles del sistema
├── id (PK)
├── name (UNIQUE)
├── description
├── createdAt
└── updatedAt

permissions           -- Permisos granulares
├── id (PK)
├── resource
├── action
├── description
└── createdAt

user_roles           -- Relación usuarios-roles (M:N)
├── userId (FK)
└── roleId (FK)

role_permissions     -- Relación roles-permisos (M:N)
├── roleId (FK)
└── permissionId (FK)
```

#### **Tablas de Clientes**
```sql
customers            -- Clientes del restaurante
├── id (PK)
├── name
├── email (UNIQUE, nullable)
├── phone (nullable)
├── whatsapp_phone (nullable)
├── source (enum: whatsapp, web_widget, phone, admin)
├── address (nullable)
├── preferences (JSONB)
│   ├── dietary_restrictions
│   ├── favorite_dishes
│   ├── preferred_contact_method
│   └── language
├── metadata (JSONB)
│   ├── first_visit
│   ├── total_orders
│   ├── total_spent
│   ├── loyalty_points
│   └── notes
├── is_active
├── last_interaction
├── created_at
└── updated_at
```

#### **Tablas de Operaciones**
```sql
menu_items           -- Elementos del menú
├── id (PK)
├── name
├── description
├── category
├── price
├── image_url
├── is_available
├── dietary_info (JSONB)
├── created_at
└── updated_at

orders               -- Órdenes
├── id (PK)
├── order_number (UNIQUE)
├── customer_name
├── customer_phone
├── customer_email
├── order_type (enum: dine_in, takeaway, delivery)
├── status (enum: pending, confirmed, preparing, ready, delivered, cancelled)
├── items (JSONB)
├── subtotal
├── tax
├── tip
├── total
├── delivery_address
├── notes
├── payment_intent_id
├── payment_provider
├── payment_status (enum: pending, paid, failed, refunded)
├── whatsapp_notified
├── email_notified
├── sms_notified
├── notification_history (JSONB)
├── integration_metadata (JSONB)
├── created_at
└── updated_at

order_items          -- Items de órdenes
├── id (PK)
├── orderId (FK)
├── menuItemId (FK)
├── quantity
├── unit_price
├── subtotal
├── special_requests
└── created_at

reservations         -- Reservas de mesas
├── id (PK)
├── reservation_code (UNIQUE)
├── customerId (FK)
├── reservation_date
├── customer_name
├── customer_phone
├── customer_email
├── party_size
├── status (enum: pending, confirmed, seated, completed, cancelled, no_show)
├── notes
├── special_requests (JSONB)
├── created_at
└── updated_at

tables               -- Mesas del restaurante
├── id (PK)
├── table_number
├── capacity
├── section (enum: indoor, outdoor, private, bar)
├── is_available
├── created_at
└── updated_at

promotions           -- Promociones
├── id (PK)
├── name
├── description
├── discount_type
├── discount_value
├── start_date
├── end_date
├── is_active
├── conditions (JSONB)
├── created_at
└── updated_at

reviews              -- Reseñas de clientes
├── id (PK)
├── customerId (FK)
├── rating
├── comment
├── response
├── status
├── created_at
└── updated_at
```

#### **Tablas de Comunicación**
```sql
conversations        -- Conversaciones del chatbot
├── id (PK)
├── customerId (FK)
├── session_id
├── channel (enum: web_widget, whatsapp, phone)
├── status (enum: active, closed, archived)
├── metadata (JSONB)
├── started_at
├── ended_at
├── created_at
└── updated_at

messages             -- Mensajes de conversaciones
├── id (PK)
├── conversationId (FK)
├── sender_type (enum: customer, bot, agent)
├── content
├── message_type (enum: text, image, audio, file)
├── metadata (JSONB)
├── is_read
├── created_at
└── updated_at

notifications        -- Notificaciones del sistema
├── id (PK)
├── customerId (FK)
├── type
├── title
├── message
├── channel
├── status
├── sent_at
├── read_at
├── metadata (JSONB)
└── created_at
```

#### **Tablas del Sistema**
```sql
settings             -- Configuración del sistema
├── id (PK)
├── key (UNIQUE)
├── value (JSONB)
├── category
├── is_public
├── created_at
└── updated_at

setting_history      -- Historial de cambios
├── id (PK)
├── settingId (FK)
├── previous_value
├── new_value
├── changed_by
├── created_at
└── updated_at

dashboard_snapshots  -- Snapshots del dashboard
├── id (PK)
├── snapshot_date
├── data (JSONB)
├── created_at
└── updated_at

reports              -- Reportes generados
├── id (PK)
├── name
├── type
├── parameters (JSONB)
├── file_path
├── generated_by
├── created_at
└── updated_at

audit_logs           -- Logs de auditoría
├── id (PK)
├── userId (FK)
├── action
├── resource
├── resource_id
├── ip_address
├── user_agent
├── metadata (JSONB)
└── created_at

migrations           -- Migraciones de DB
├── id (PK)
├── timestamp
├── name
└── executed_at

migrations_history   -- Historial de migraciones
├── id (PK)
├── version
├── applied_at
└── rollback_at
```

---

## 🔌 API BACKEND

### **Endpoints Principales** (29 controllers)

#### **Autenticación** (`/api/auth`)
```
POST   /api/auth/register          - Registro de usuario
POST   /api/auth/login             - Login (retorna JWT)
POST   /api/auth/logout            - Logout
POST   /api/auth/refresh           - Refresh token
POST   /api/auth/forgot-password   - Recuperar contraseña
POST   /api/auth/reset-password    - Resetear contraseña
POST   /api/auth/verify-email      - Verificar email
GET    /api/auth/me                - Obtener usuario actual
```

#### **Usuarios** (`/api/users`)
```
GET    /api/users                  - Listar usuarios
GET    /api/users/:id              - Obtener usuario
POST   /api/users                  - Crear usuario
PUT    /api/users/:id              - Actualizar usuario
DELETE /api/users/:id              - Eliminar usuario
GET    /api/users/:id/roles        - Roles del usuario
POST   /api/users/:id/roles        - Asignar rol
```

#### **Clientes** (`/api/customers`)
```
GET    /api/customers              - Listar clientes
GET    /api/customers/:id          - Obtener cliente
POST   /api/customers              - Crear cliente
PUT    /api/customers/:id          - Actualizar cliente
DELETE /api/customers/:id          - Eliminar cliente
GET    /api/customers/export       - Exportar clientes
```

#### **Menú** (`/api/menu`)
```
GET    /api/menu                   - Listar items del menú
GET    /api/menu/:id               - Obtener item
POST   /api/menu                   - Crear item
PUT    /api/menu/:id               - Actualizar item
DELETE /api/menu/:id               - Eliminar item
PATCH  /api/menu/:id/availability  - Cambiar disponibilidad
```

#### **Órdenes** (`/api/orders`)
```
GET    /api/orders                 - Listar órdenes
GET    /api/orders/:id             - Obtener orden
POST   /api/orders                 - Crear orden
PUT    /api/orders/:id             - Actualizar orden
DELETE /api/orders/:id             - Eliminar orden
PATCH  /api/orders/:id/status      - Cambiar estado
POST   /api/orders/:id/notify      - Enviar notificación
```

#### **Reservas** (`/api/reservations`)
```
GET    /api/reservations           - Listar reservas
GET    /api/reservations/:id       - Obtener reserva
POST   /api/reservations           - Crear reserva
PUT    /api/reservations/:id       - Actualizar reserva
DELETE /api/reservations/:id       - Eliminar reserva
PATCH  /api/reservations/:id/status - Cambiar estado
```

#### **Conversaciones** (`/api/conversations`)
```
GET    /api/conversations          - Listar conversaciones
GET    /api/conversations/:id      - Obtener conversación
GET    /api/conversations/:id/messages - Mensajes
POST   /api/conversations          - Crear conversación
PATCH  /api/conversations/:id/close - Cerrar conversación
```

#### **IA y Chatbot** (`/api/ai`)
```
POST   /api/ai/chat                - Enviar mensaje al chatbot
POST   /api/ai/analyze             - Analizar sentimiento
GET    /api/ai/models              - Listar modelos disponibles
POST   /api/ai/train               - Entrenar modelo
```

#### **Dashboard** (`/api/dashboard`)
```
GET    /api/dashboard/stats        - Estadísticas generales
GET    /api/dashboard/revenue      - Estadísticas de ingresos
GET    /api/dashboard/orders       - Estadísticas de órdenes
GET    /api/dashboard/customers    - Estadísticas de clientes
GET    /api/dashboard/snapshots    - Snapshots históricos
POST   /api/dashboard/snapshot     - Crear snapshot
```

#### **Reportes** (`/api/reports`)
```
GET    /api/reports                - Listar reportes
POST   /api/reports/generate       - Generar reporte
GET    /api/reports/:id/download   - Descargar reporte
DELETE /api/reports/:id            - Eliminar reporte
```

#### **Configuración** (`/api/settings`)
```
GET    /api/settings               - Obtener configuración
PUT    /api/settings               - Actualizar configuración
GET    /api/settings/history       - Historial de cambios
POST   /api/settings/restore       - Restaurar configuración
```

#### **Seguridad** (`/api/security`)
```
GET    /api/security/audit-logs    - Logs de auditoría
GET    /api/security/sessions      - Sesiones activas
DELETE /api/security/sessions/:id  - Cerrar sesión
POST   /api/security/2fa/enable    - Activar 2FA
POST   /api/security/2fa/verify    - Verificar código 2FA
```

#### **Integraciones**
```
POST   /api/whatsapp/send          - Enviar mensaje WhatsApp
POST   /api/whatsapp/webhook       - Webhook WhatsApp
POST   /api/twilio/call            - Hacer llamada Twilio
POST   /api/twilio/webhook         - Webhook Twilio
```

#### **Sistema**
```
GET    /api/health                 - Health check
GET    /api                        - Info de la API
```

---

## 📊 FLUJOS DE DATOS

### **Flujo de Autenticación**
```
1. Usuario → Frontend (Admin Panel)
   └─> Envía email + password

2. Frontend → Backend API
   └─> POST /api/auth/login

3. Backend → PostgreSQL
   └─> Verifica credenciales
   └─> Obtiene roles y permisos

4. Backend → JWT Service
   └─> Genera access token (1h)
   └─> Genera refresh token (7d)

5. Backend → Frontend
   └─> Retorna tokens

6. Frontend → LocalStorage
   └─> Guarda tokens

7. Frontend → Backend (requests subsecuentes)
   └─> Header: Authorization: Bearer <token>

8. Backend → JWT Guard
   └─> Valida token
   └─> Verifica permisos RBAC
   └─> Permite/Deniega acceso
```

### **Flujo del Chatbot IA**
```
1. Cliente → Widget/WhatsApp
   └─> Envía mensaje "Hola, ¿tienen mesas disponibles?"

2. Widget/WhatsApp → Backend API
   └─> POST /api/ai/chat
   └─> { message, customerName, context }

3. Backend → Conversations Service
   └─> Busca/Crea conversación
   └─> Guarda mensaje en PostgreSQL

4. Backend → AI Service
   └─> Construye prompt con contexto
   └─> Contexto incluye:
       • Info del restaurante
       • Menú disponible
       • Reservas del día
       • Órdenes recientes

5. AI Service → Ollama (llama3:8b)
   └─> POST http://localhost:11434/api/generate
   └─> Modelo procesa y genera respuesta

6. Ollama → AI Service
   └─> Retorna respuesta generada

7. AI Service → Backend
   └─> Procesa respuesta
   └─> Guarda en PostgreSQL

8. Backend → Widget/WhatsApp
   └─> Retorna respuesta al cliente
   └─> { response, conversationId, timestamp }

9. Widget → Cliente
   └─> Muestra respuesta en chat
```

### **Flujo de Orden de Comida**
```
1. Cliente → Widget
   └─> Selecciona items del menú

2. Widget → Backend API
   └─> POST /api/orders
   └─> { items, customer, total, orderType }

3. Backend → Orders Service
   └─> Valida items (precio, disponibilidad)
   └─> Genera order_number único
   └─> Calcula subtotal + tax + tip

4. Orders Service → PostgreSQL
   └─> INSERT en tabla orders
   └─> INSERT en tabla order_items

5. Orders Service → Payments Service
   └─> Procesa pago (Stripe/otro)

6. Payments Service → Stripe API
   └─> Crea payment_intent
   └─> Procesa tarjeta

7. Payments Service → Orders Service
   └─> Actualiza payment_status

8. Orders Service → Notifications Service
   └─> Envía confirmación al cliente
   └─> Notifica a cocina

9. Notifications Service → WhatsApp/Email/SMS
   └─> Envía notificaciones

10. Backend → Widget
    └─> Retorna confirmación de orden

11. Backend → WebSocket
    └─> Notifica a Admin Panel en tiempo real
    └─> Dashboard se actualiza automáticamente
```

### **Flujo de Reserva de Mesa**
```
1. Cliente → Widget/WhatsApp
   └─> Solicita reserva para 4 personas

2. Widget → Backend API
   └─> POST /api/reservations
   └─> { date, partySize, customerInfo }

3. Backend → Reservations Service
   └─> Verifica disponibilidad
   └─> Genera reservation_code

4. Reservations Service → PostgreSQL
   └─> INSERT en tabla reservations
   └─> Asocia con customer

5. Reservations Service → Notifications Service
   └─> Envía confirmación

6. Backend → Cliente
   └─> Retorna reservation_code

7. Cliente recibe confirmación por:
   └─> Widget (inmediato)
   └─> WhatsApp (opcional)
   └─> Email (opcional)
```

---

## 🔐 SEGURIDAD

### **Autenticación y Autorización**

#### **JWT (JSON Web Tokens)**
- **Access Token**: 1 hora de validez
- **Refresh Token**: 7 días de validez
- **Algoritmo**: HS256
- **Payload**:
  ```json
  {
    "sub": 1,
    "email": "admin@zgamersa.com",
    "roles": ["admin"],
    "permissions": [
      "dashboard.read",
      "customers.read",
      "customers.write",
      "orders.read",
      "orders.write",
      "menu.read",
      "menu.write",
      "users.read",
      "users.write",
      "system.admin"
    ],
    "iat": 1234567890,
    "exp": 1234571490,
    "aud": "chatbotdysa-clients",
    "iss": "chatbotdysa-enterprise"
  }
  ```

#### **RBAC (Role-Based Access Control)**
Roles predefinidos:
- **admin**: Acceso completo al sistema
- **staff**: Operaciones diarias (órdenes, reservas)
- **viewer**: Solo lectura

Permisos granulares:
- `dashboard.read` / `dashboard.manage`
- `customers.create` / `customers.read` / `customers.update` / `customers.delete` / `customers.export`
- `orders.create` / `orders.read` / `orders.update` / `orders.delete`
- `menu.create` / `menu.read` / `menu.update` / `menu.delete`
- `reservations.create` / `reservations.read` / `reservations.update` / `reservations.delete`
- `users.create` / `users.read` / `users.update` / `users.delete`
- `roles.create` / `roles.read` / `roles.update` / `roles.delete`
- `settings.read` / `settings.update`
- `system.admin` / `system.manage`
- `reports.read` / `reports.export`
- `audit.read`

### **Seguridad en Capas**

#### **1. Middleware de Seguridad**
```typescript
// apps/backend/src/common/middleware/security.middleware.ts
- Helmet (headers HTTP seguros)
- CORS (dominios permitidos)
- Rate Limiting (prevención DDoS)
- Input Sanitization (prevención XSS)
- SQL Injection Prevention (TypeORM parameterizado)
```

#### **2. Middleware de Auditoría**
```typescript
// apps/backend/src/common/middleware/audit.middleware.ts
- Registra todas las acciones en audit_logs
- Captura: usuario, acción, recurso, IP, user-agent
- Almacenamiento en PostgreSQL
```

#### **3. Rate Limiting**
```typescript
// Límites configurados en app.module.ts
{
  name: 'default',
  ttl: 60000,      // 1 minuto
  limit: 100       // 100 requests por minuto
},
{
  name: 'auth',
  ttl: 60000,      // 1 minuto
  limit: 5         // 5 intentos de login por minuto
}
```

#### **4. Cifrado de Datos**
- **Contraseñas**: bcrypt con salt rounds = 10
- **Datos sensibles**: Cifrado AES-256 en JSONB
- **Comunicación**: HTTPS/TLS en producción

### **Seguridad de la Base de Datos**
```
1. PostgreSQL con autenticación por contraseña
2. Usuario dedicado con privilegios limitados
3. Conexiones solo desde localhost en desarrollo
4. Backups automáticos diarios
5. Cifrado de columnas sensibles (JSONB)
```

---

## 🚀 DESPLIEGUE

### **Arquitectura de Despliegue en Desarrollo**

```
Host Machine (macOS)
└── ChatBotDysa/
    ├── Terminal 1: Backend API
    │   └── Port 8005
    │
    ├── Terminal 2: Admin Panel
    │   └── Port 7001
    │
    ├── Terminal 3: Landing Page
    │   └── Port 6001
    │
    ├── Terminal 4: Web Widget
    │   └── Port 7002
    │
    ├── PostgreSQL (Docker/Local)
    │   └── Port 15432
    │
    ├── Redis (Docker/Local)
    │   └── Port 16379
    │
    └── Ollama (Local)
        └── Port 11434
```

### **Variables de Entorno**

#### **Backend (.env)**
```bash
# Database
DATABASE_HOST=localhost
DATABASE_PORT=15432
DATABASE_USER=postgres
DATABASE_PASSWORD=supersecret
DATABASE_NAME=chatbotdysa

# Redis
REDIS_HOST=localhost
REDIS_PORT=16379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Ollama
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3:8b

# App
PORT=8005
NODE_ENV=development
API_PREFIX=api

# CORS
CORS_ORIGIN=http://localhost:7001,http://localhost:6001,http://localhost:7002

# WhatsApp (opcional)
WHATSAPP_PHONE_ID=
WHATSAPP_TOKEN=
WHATSAPP_VERIFY_TOKEN=

# Twilio (opcional)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Stripe (opcional)
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

### **Scripts de Inicio**

#### **Inicio Completo del Sistema**
```bash
# Terminal 1 - Backend
cd apps/backend
npm run start:dev

# Terminal 2 - Admin Panel
cd apps/admin-panel
npm run dev

# Terminal 3 - Landing Page
cd apps/website
npm run dev

# Terminal 4 - Web Widget
cd apps/web-widget
npm run dev
```

#### **Inicio con Docker (Servicios)**
```bash
# PostgreSQL + Redis
docker-compose up -d postgres redis

# Verificar servicios
docker-compose ps
```

### **Arquitectura de Despliegue en Producción**

```
                    ┌─────────────────┐
                    │   Load Balancer │
                    │     (Nginx)     │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
       ┌──────────┐   ┌──────────┐   ┌──────────┐
       │ Backend  │   │ Backend  │   │ Backend  │
       │Instance 1│   │Instance 2│   │Instance 3│
       └──────────┘   └──────────┘   └──────────┘
              │              │              │
              └──────────────┼──────────────┘
                             │
                    ┌────────▼────────┐
                    │   PostgreSQL    │
                    │    (Primary)    │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   PostgreSQL    │
                    │    (Replica)    │
                    └─────────────────┘

       Frontend Apps:
       ┌──────────────────────────────┐
       │   CDN (Cloudflare)           │
       ├──────────────────────────────┤
       │ - Landing Page (Static)      │
       │ - Admin Panel (Static)       │
       │ - Web Widget (Static JS)     │
       └──────────────────────────────┘
```

### **Configuración de Producción**
- **Backend**: PM2 para gestión de procesos
- **Frontend**: Build estático en CDN
- **Base de Datos**: PostgreSQL con replicación
- **Cache**: Redis Cluster
- **IA**: Ollama en servidor dedicado con GPU
- **Backups**: Automatizados cada 6 horas
- **Monitoreo**: Logs centralizados + alertas
- **SSL**: Certificados Let's Encrypt

---

## 📊 MÉTRICAS DEL SISTEMA

### **Componentes del Sistema**
- **Aplicaciones Web**: 4 (Landing, Admin, Widget, Backend)
- **Servicios**: 3 (PostgreSQL, Redis, Ollama)
- **Tablas de Base de Datos**: 23
- **Módulos Backend**: 20
- **API Endpoints**: ~150+
- **Entidades TypeORM**: 20

### **Tecnologías**
- **Lenguajes**: TypeScript (100%)
- **Frameworks**: NestJS, Next.js
- **Base de Datos**: PostgreSQL
- **Cache**: Redis
- **IA**: Ollama (llama3:8b, 4.3 GB)

### **Tamaños**
- **Backend Build**: ~50 MB
- **Admin Panel Build**: ~100 MB
- **Widget Bundle**: 438 KB
- **Modelo IA**: 4.3 GB

---

## 🔗 RELACIONES ENTRE ENTIDADES

```
User ─┬─< UserRoles >─┬─ Role ─┬─< RolePermissions >─┬─ Permission
      │               │        │                     │
      └─> AuditLog    └────────┘                     │
                                                      │
Customer ─┬─> Reservation                            │
          ├─> Order                                   │
          ├─> Conversation ─> Message                │
          ├─> Review                                  │
          └─> Notification                            │
                                                      │
MenuItem ─> OrderItem ─> Order                        │
                                                      │
Table ─> Reservation                                  │
                                                      │
Settings ─> SettingHistory                            │
                                                      │
Dashboard ─> DashboardSnapshot                        │
                                                      │
Report                                                │
                                                      │
Promotion                                             │
```

---

## 📈 MEJORAS FUTURAS

### **Funcionalidades Planificadas**
1. ✅ Sistema de pagos integrado (Stripe)
2. ✅ Modo demo con reset automático
3. ✅ Backups automáticos
4. ⏳ App móvil nativa (React Native)
5. ⏳ Panel de analytics avanzado
6. ⏳ Integraciones adicionales (Uber Eats, DoorDash)
7. ⏳ Sistema de fidelización de clientes
8. ⏳ Multi-restaurante (multi-tenant)
9. ⏳ IA con aprendizaje continuo
10. ⏳ Voice bot con Twilio

### **Optimizaciones Técnicas**
1. ⏳ Server-Side Rendering para SEO
2. ⏳ GraphQL API alternativa
3. ⏳ Microservicios independientes
4. ⏳ Kubernetes para orquestación
5. ⏳ Elasticsearch para búsquedas

---

## 📚 RECURSOS ADICIONALES

### **Documentación**
- [GUIA_TODAS_APLICACIONES_WEB.md](./GUIA_TODAS_APLICACIONES_WEB.md) - Guía completa de aplicaciones
- [RESUMEN_CORRECCIONES_ADMIN_PANEL.md](./RESUMEN_CORRECCIONES_ADMIN_PANEL.md) - Correcciones aplicadas
- README.md - Instrucciones de instalación

### **Scripts de Verificación**
- `/tmp/probar-todas-aplicaciones.sh` - Test completo del sistema
- `/tmp/estado-sincronizacion.sh` - Verificación de sincronización

### **Credenciales de Prueba**
```
Email: admin@zgamersa.com
Password: Admin123!
```

---

**Última actualización**: 2025-11-06
**Versión del sistema**: 1.0.0
**Estado**: ✅ Sistema 100% funcional y sincronizado
