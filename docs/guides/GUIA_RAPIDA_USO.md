# 🚀 Guía Rápida de Uso - ChatBotDysa Enterprise

**Fecha:** 11 de Noviembre, 2025
**Sistema:** ChatBotDysa Enterprise+++++
**Versión:** Post-Auditoría Completa

---

## 📋 Índice

1. [Inicio Rápido](#inicio-rápido)
2. [Servicios y Puertos](#servicios-y-puertos)
3. [Testing de Nuevas Funcionalidades](#testing-de-nuevas-funcionalidades)
4. [Módulos Corregidos](#módulos-corregidos)
5. [Endpoints del Backend](#endpoints-del-backend)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Inicio Rápido

### Levantar todos los servicios

```bash
cd /Users/devlmer/ChatBotDysa

# 1. Levantar infraestructura (Docker)
docker-compose up -d

# 2. Backend (puerto 8005)
cd apps/backend
npm run dev

# 3. Admin Panel (puerto 7001)
cd apps/admin-panel
npm run dev

# 4. Website Marketing (puerto 6001)
cd apps/website
npm run dev

# 5. Web Widget (puerto 7002)
cd apps/web-widget
npm run dev
```

### Verificar que todo está corriendo

```bash
# Ejecutar el script de verificación automático
./scripts/verify-all-fixes.sh
```

---

## 🌐 Servicios y Puertos

| Servicio | Puerto | URL | Descripción |
|----------|--------|-----|-------------|
| **Backend API** | 8005 | http://localhost:8005 | API REST principal |
| **Admin Panel** | 7001 | http://localhost:7001 | Panel de administración para restaurantes |
| **Website** | 6001 | http://localhost:6001 | Sitio web marketing/demo |
| **Web Widget** | 7002 | http://localhost:7002 | Widget embebible para clientes |
| **PostgreSQL** | 15432 | localhost:15432 | Base de datos |
| **Redis** | 16379 | localhost:16379 | Cache y sesiones |

---

## ✅ Testing de Nuevas Funcionalidades

### 1. **Admin Panel - Acciones Rápidas del Dashboard**

**Ubicación:** http://localhost:7001/dashboard

**Probar:**
1. Click en botón **"Ver Chats"** → Debe navegar a `/conversations`
2. Click en botón **"Nuevo Pedido"** → Debe navegar a `/orders/new`
3. Click en botón **"Gestionar Menú"** → Debe navegar a `/menu`
4. Click en botón **"Configuración"** → Debe navegar a `/settings`

**Resultado esperado:** Navegación fluida sin recarga de página (SPA).

---

### 2. **Admin Panel - Crear Nueva Conversación**

**Ubicación:** http://localhost:7001/conversations

**Probar:**
1. Click en botón **"Nueva Conversación"**
2. Completar formulario:
   - Nombre del cliente: "Juan Pérez"
   - Teléfono: "+56912345678"
   - Canal: WhatsApp
   - Mensaje inicial: "Hola, quiero hacer un pedido"
3. Click en **"Crear Conversación"**

**Resultado esperado:**
- POST a `/api/conversations` con los datos
- Redirección a `/conversations/{id}` de la nueva conversación

---

### 3. **Admin Panel - Botones de Reintentar Optimizados**

**Ubicación:**
- http://localhost:7001/orders (si hay error)
- http://localhost:7001/menu (si hay error)

**Probar:**
1. Simular error (desconectar backend)
2. Click en **"Reintentar"**

**Resultado esperado:**
- Re-fetch de datos sin recarga completa de página
- Mejor UX que `window.location.reload()`

---

### 4. **Website - Formulario de Demo**

**Ubicación:** http://localhost:6001/demo

**Probar:**
1. Completar formulario:
   - Nombre: "Carlos García"
   - Email: "carlos@restaurant.cl"
   - Teléfono: "+56987654321"
   - Restaurante: "El Buen Sabor"
   - Empleados: "10-20"
   - Fecha preferida: "2025-11-15"
   - Hora preferida: "15:00"
   - Mensaje: "Interesado en el plan Enterprise"

2. Click en **"Solicitar Demo Personalizado"**

**Resultado esperado:**
```bash
# Request al backend
POST http://localhost:8005/api/leads/demo
Content-Type: application/json

{
  "name": "Carlos García",
  "email": "carlos@restaurant.cl",
  "phone": "+56987654321",
  "restaurant": "El Buen Sabor",
  "employees": "10-20",
  "preferredDate": "2025-11-15",
  "preferredTime": "15:00",
  "message": "Interesado en el plan Enterprise"
}

# Response esperado
{
  "success": true,
  "message": "Solicitud de demo recibida exitosamente",
  "data": {
    "demoId": "demo_1731334567890_abc123",
    "scheduledFor": "2025-11-15 15:00",
    "status": "pending_confirmation"
  }
}
```

---

### 5. **Website - Formulario de Registro**

**Ubicación:** http://localhost:6001/registro

**Probar:**
1. Completar formulario completo:
   - Nombre del restaurante: "Pizza Napoli"
   - Nombre del propietario: "María López"
   - Email: "maria@pizzanapoli.cl"
   - Teléfono: "+56922334455"
   - Dirección: "Av. Providencia 1234"
   - Ciudad: "Santiago"
   - Subdominio: "pizzanapoli"
   - Plan: "saas-multi"
   - Método de pago: "credit_card"
   - ✓ Acepto términos
   - ✓ Acepto política de privacidad

2. Click en **"Crear mi cuenta ahora"**

**Resultado esperado:**
```bash
# Request al backend
POST http://localhost:8005/api/leads/register
Content-Type: application/json

{
  "restaurantName": "Pizza Napoli",
  "ownerName": "María López",
  "email": "maria@pizzanapoli.cl",
  "phone": "+56922334455",
  "address": "Av. Providencia 1234",
  "city": "Santiago",
  "subdomain": "pizzanapoli",
  "plan": "saas-multi",
  "paymentMethod": "credit_card",
  "agreedToTerms": true,
  "agreedToPrivacy": true
}

# Response esperado
{
  "success": true,
  "message": "Registro completado exitosamente",
  "data": {
    "tenantId": "tenant_1731334567890",
    "restaurantName": "Pizza Napoli",
    "subdomain": "pizzanapoli",
    "accessUrl": "https://pizzanapoli.chatbotdysa.com",
    "adminEmail": "maria@pizzanapoli.cl",
    "plan": "saas-multi",
    "createdAt": "2025-11-11T12:00:00.000Z",
    "status": "pending_payment"
  }
}
```

3. Redirección automática a `/welcome?subdomain=pizzanapoli&tenantId=tenant_1731334567890`

---

### 6. **Website - Página de Bienvenida**

**Ubicación:** http://localhost:6001/welcome?subdomain=pizzanapoli

**Probar:**
1. Click en **"Explorar Demo Interactivo Ahora"**

**Resultado esperado:**
- Navega a `http://localhost:7001` (Admin Panel Demo)
- NO debe ir a localhost hardcodeado, sino al valor de `NEXT_PUBLIC_DEMO_URL`

---

### 7. **Website - ROI Calculator**

**Ubicación:** http://localhost:6001 (scroll hasta calculadora)

**Probar:**
1. Ajustar valores:
   - Pedidos mensuales: 800
   - Ticket promedio: $20,000 CLP
   - Horas diarias atención: 10h
   - Costo hora personal: $6,000 CLP

2. Click en **"Calcular mi ROI"**
3. Revisar resultados
4. Click en **"🚀 Pide tu Demo Gratis"**

**Resultado esperado:**
- Cálculo correcto del ROI
- Botón navega a `/demo` (NO a #pricing que no existe)

---

## 🔧 Módulos Corregidos

### Admin Panel

| Archivo | Correcciones |
|---------|--------------|
| `quick-actions.tsx` | ✅ Añadidos onClick handlers a 4 botones |
| `conversations/page.tsx` | ✅ Botón "Nueva Conversación" funcional<br>✅ Cards navegación optimizada (router.push) |
| `conversations/new/page.tsx` | ✅ **CREADO** - Página completa para crear conversaciones |
| `orders/page.tsx` | ✅ Botón "Reintentar" optimizado (refetch vs reload) |
| `menu/page.tsx` | ✅ Botón "Reintentar" optimizado |
| `lib/api.ts` | ✅ Añadido método `conversations.create()` |

### Website

| Archivo | Correcciones |
|---------|--------------|
| `.env.local` | ✅ **CREADO** - Variables de entorno centralizadas |
| `demo/page.tsx` | ✅ Integración real con backend POST /api/leads/demo |
| `registro/page.tsx` | ✅ Integración real con backend POST /api/leads/register |
| `welcome/page.tsx` | ✅ URL del demo desde env var (NO hardcoded) |
| `ROICalculator.tsx` | ✅ Link corregido: /demo en vez de #pricing |
| `checkout/payment/page.tsx` | ✅ Puerto API corregido: 8005 en vez de 8000 |

### Backend

| Archivo | Estado |
|---------|--------|
| `modules/leads/dto/create-demo-request.dto.ts` | ✅ **CREADO** |
| `modules/leads/dto/create-registration.dto.ts` | ✅ **CREADO** |
| `modules/leads/leads.service.ts` | ✅ **CREADO** |
| `modules/leads/leads.controller.ts` | ✅ **CREADO** |
| `modules/leads/leads.module.ts` | ✅ **CREADO** |
| `app.module.ts` | ✅ LeadsModule importado |

---

## 🔌 Endpoints del Backend

### Módulo Leads (NUEVO)

#### POST /api/leads/demo
**Solicitar una demostración personalizada**

```bash
curl -X POST http://localhost:8005/api/leads/demo \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@restaurant.cl",
    "phone": "+56912345678",
    "restaurant": "Mi Restaurante",
    "employees": "10-20",
    "preferredDate": "2025-11-15",
    "preferredTime": "15:00",
    "message": "Quiero ver el sistema"
  }'
```

#### POST /api/leads/contact
**Formulario de contacto general**

```bash
curl -X POST http://localhost:8005/api/leads/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "María González",
    "email": "maria@example.cl",
    "subject": "Consulta sobre planes",
    "message": "Necesito información sobre precios"
  }'
```

#### POST /api/leads/register
**Registro completo de nuevo restaurante**

```bash
curl -X POST http://localhost:8005/api/leads/register \
  -H "Content-Type: application/json" \
  -d '{
    "restaurantName": "Pizza Express",
    "ownerName": "Pedro Sánchez",
    "email": "pedro@pizzaexpress.cl",
    "phone": "+56933445566",
    "address": "Los Leones 345",
    "city": "Santiago",
    "subdomain": "pizzaexpress",
    "plan": "saas-multi",
    "paymentMethod": "credit_card",
    "agreedToTerms": true,
    "agreedToPrivacy": true
  }'
```

---

## 🛠️ Troubleshooting

### Problema: "Cannot GET /api/leads/demo"

**Solución:**
```bash
# Verificar que el backend está corriendo
curl http://localhost:8005/health

# Verificar que LeadsModule está cargado
cd apps/backend
npm run build
# Debe crear: dist/src/modules/leads/
```

---

### Problema: Formularios no envían datos

**Verificar:**
1. Variable de entorno `NEXT_PUBLIC_API_URL` está definida
2. Backend está corriendo en puerto 8005
3. CORS configurado correctamente en backend

```bash
# Verificar variables de entorno (Website)
cd apps/website
cat .env.local | grep API_URL
# Debe mostrar: NEXT_PUBLIC_API_URL=http://localhost:8005/api
```

---

### Problema: Botones no navegan

**Verificar:**
1. Componente tiene directiva `'use client'` al inicio
2. Está importando `useRouter` desde `next/navigation`
3. onClick handler está definido

**Ejemplo correcto:**
```typescript
'use client'
import { useRouter } from 'next/navigation'

export default function MyComponent() {
  const router = useRouter()

  return (
    <Button onClick={() => router.push('/ruta')}>
      Click me
    </Button>
  )
}
```

---

### Problema: Admin Panel - "Nueva Conversación" no funciona

**Verificar:**
1. Archivo existe: `apps/admin-panel/src/app/conversations/new/page.tsx`
2. API tiene método: `apiService.conversations.create()`

```bash
# Verificar archivo existe
ls -la apps/admin-panel/src/app/conversations/new/page.tsx

# Debe existir y tener ~150 líneas de código
```

---

## 📊 Verificación Completa

Para verificar que TODAS las correcciones funcionan:

```bash
# Ejecutar script automático de verificación
cd /Users/devlmer/ChatBotDysa
chmod +x scripts/verify-all-fixes.sh
./scripts/verify-all-fixes.sh
```

Este script verificará:
- ✅ Servicios corriendo en puertos correctos
- ✅ Endpoints backend respondiendo
- ✅ Archivos corregidos existen
- ✅ Variables de entorno configuradas
- ✅ Compilación del backend exitosa

---

## 📞 Contacto y Soporte

- **Email:** soporte@chatbotdysa.com
- **WhatsApp:** +56912345678
- **Documentación:** http://localhost:8005/docs (Swagger)

---

**Última actualización:** 11 de Noviembre, 2025
**Documentado por:** Claude Code Assistant
**Sistema:** ChatBotDysa Enterprise+++++
