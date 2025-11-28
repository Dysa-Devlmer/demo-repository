# TESTING FUNCIONAL COMPLETO - CHATBOTDYSA
## Verificación End-to-End del Sistema

---

**📅 Fecha:** 2025-10-04
**⏰ Hora inicio:** 20:12:45
**🎯 Objetivo:** Validar funcionamiento completo del sistema en producción
**⏱️ Duración estimada:** 1.5-2 horas

---

## 🎯 OBJETIVOS DEL TESTING

### Verificar:
- ✅ Todos los endpoints HTTP funcionando
- ✅ Base de datos operacional
- ✅ Redis funcionando correctamente
- ✅ Flujos end-to-end completos
- ✅ Integración entre servicios
- ✅ Performance y tiempos de respuesta
- ✅ Manejo de errores

---

## 📊 ESTADO INICIAL DEL SISTEMA

### Docker Services (20:12)

| Servicio | Estado | Uptime |
|----------|--------|--------|
| chatbotdysa-admin | ✅ (healthy) | >1 hora |
| chatbotdysa-backend | ✅ (healthy) | >1 hora |
| chatbotdysa-landing | ✅ (healthy) | >1 hora |
| chatbotdysa-postgres | ✅ (healthy) | >1 hora |
| chatbotdysa-ollama | ✅ Up | >1 hora |
| chatbotdysa-redis | ✅ Up | >1 hora |

**Resultado:** ✅ Todos los servicios operacionales

### Health Checks Iniciales

**Backend API:**
```bash
curl http://localhost:8005/health
```
**Resultado:** ✅ 200 OK
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2025-10-04T23:12:41.893Z",
    "service": "ChatBotDysa Backend API",
    "version": "1.0.0",
    "environment": "production",
    "database": {
      "connected": true,
      "host": "postgres",
      "port": "5432",
      "database": "chatbotdysa",
      "message": "Database connection successful"
    }
  }
}
```

**Admin Panel:**
```bash
curl http://localhost:7001/api/health
```
**Resultado:** ✅ 200 OK

**Landing Page:**
```bash
curl http://localhost:3004/api/health/
```
**Resultado:** ✅ 200 OK

---

## 🧪 FASE 1: TESTING DE ENDPOINTS BACKEND

### 1.1 Health Check ✅

**Endpoint:** `GET /health`
**Resultado:** ✅ EXITOSO
- Status: 200 OK
- Database: Connected
- Redis: Connected (inferido del backend funcionando)
- Response time: ~50ms

### 1.2 Testing API Core

#### A. Menú (Menu Items)

**Listar Menú:**
```bash
curl -X GET http://localhost:8005/api/menu
```

**Crear Item de Menú:**
```bash
curl -X POST http://localhost:8005/api/menu \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pizza Margarita",
    "description": "Pizza clásica italiana con mozzarella y albahaca",
    "price": 12000,
    "category": "Platos Principales",
    "available": true
  }'
```

#### B. Pedidos (Orders)

**Listar Pedidos:**
```bash
curl -X GET http://localhost:8005/api/orders
```

**Crear Pedido:**
```bash
curl -X POST http://localhost:8005/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Juan Pérez",
    "customerPhone": "+56912345678",
    "items": [
      {
        "menuItemId": 1,
        "quantity": 2,
        "notes": "Sin cebolla"
      }
    ],
    "deliveryType": "delivery",
    "deliveryAddress": "Av. Principal 123, Santiago"
  }'
```

#### C. Reservas (Reservations)

**Listar Reservas:**
```bash
curl -X GET http://localhost:8005/api/reservations
```

**Crear Reserva:**
```bash
curl -X POST http://localhost:8005/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "María González",
    "customerPhone": "+56987654321",
    "date": "2025-10-05",
    "time": "20:00",
    "numberOfPeople": 4,
    "specialRequests": "Mesa junto a la ventana"
  }'
```

#### D. Clientes (Customers)

**Listar Clientes:**
```bash
curl -X GET http://localhost:8005/api/customers
```

**Crear Cliente:**
```bash
curl -X POST http://localhost:8005/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pedro Rodríguez",
    "phone": "+56911111111",
    "email": "pedro@example.com",
    "address": "Calle Falsa 123"
  }'
```

#### E. Promociones (Promotions)

**Listar Promociones:**
```bash
curl -X GET http://localhost:8005/api/promotions
```

---

## 🧪 FASE 2: TESTING DE AUTENTICACIÓN

### 2.1 Login de Usuario

**Endpoint:** `POST /api/auth/login`

**Test de Login Admin:**
```bash
curl -X POST http://localhost:8005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@restaurante.com",
    "password": "admin123"
  }'
```

**Resultado Esperado:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "admin@restaurante.com",
      "role": "admin"
    }
  }
}
```

### 2.2 Validar Token

**Endpoint:** `GET /api/auth/profile`

```bash
curl -X GET http://localhost:8005/api/auth/profile \
  -H "Authorization: Bearer {TOKEN}"
```

### 2.3 Logout

**Endpoint:** `POST /api/auth/logout`

```bash
curl -X POST http://localhost:8005/api/auth/logout \
  -H "Authorization: Bearer {TOKEN}"
```

---

## 🧪 FASE 3: TESTING DE FLUJOS END-TO-END

### 3.1 Flujo Completo de Pedido

**Paso 1:** Cliente consulta menú
**Paso 2:** Cliente selecciona items
**Paso 3:** Cliente crea pedido
**Paso 4:** Sistema confirma pedido
**Paso 5:** Restaurante acepta pedido
**Paso 6:** Pedido en preparación
**Paso 7:** Pedido listo
**Paso 8:** Pedido entregado

### 3.2 Flujo Completo de Reserva

**Paso 1:** Cliente solicita disponibilidad
**Paso 2:** Sistema verifica mesas disponibles
**Paso 3:** Cliente crea reserva
**Paso 4:** Sistema confirma reserva
**Paso 5:** Envío de confirmación
**Paso 6:** Check-in del cliente
**Paso 7:** Finalización de reserva

### 3.3 Flujo de Gestión de Menú

**Paso 1:** Admin agrega producto nuevo
**Paso 2:** Producto aparece en menú público
**Paso 3:** Cliente ve producto
**Paso 4:** Admin marca producto como agotado
**Paso 5:** Producto desaparece de menú público
**Paso 6:** Admin reactiva producto

---

## 🧪 FASE 4: TESTING DE INTEGRACIÓN CHATBOT

### 4.1 Verificar Servicio Ollama

```bash
curl http://localhost:21434/api/tags
```

**Resultado Esperado:** Lista de modelos disponibles

### 4.2 Testing de Conversación

**Endpoint:** `POST /api/chatbot/message`

```bash
curl -X POST http://localhost:8005/api/chatbot/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hola, ¿cuál es el horario de atención?",
    "sessionId": "test-session-123"
  }'
```

### 4.3 Testing de Preguntas Frecuentes

**Consulta de Horarios:**
```json
{
  "message": "¿A qué hora abren?",
  "sessionId": "test-session-123"
}
```

**Consulta de Menú:**
```json
{
  "message": "¿Qué pizzas tienen?",
  "sessionId": "test-session-123"
}
```

**Realizar Pedido:**
```json
{
  "message": "Quiero pedir una pizza margarita",
  "sessionId": "test-session-123"
}
```

---

## 🧪 FASE 5: TESTING DE PERFORMANCE

### 5.1 Tiempos de Respuesta

**Endpoint Health Check:**
- Target: < 100ms
- Medición: tiempo real de respuesta

**Endpoint Listado (Menu/Orders/etc):**
- Target: < 200ms
- Medición: con 0 items, 10 items, 100 items

**Endpoint Creación:**
- Target: < 300ms
- Medición: crear nuevo registro

### 5.2 Carga Concurrente

**Test con 10 requests simultáneos:**
```bash
for i in {1..10}; do
  curl -s http://localhost:8005/health &
done
wait
```

**Test con 50 requests simultáneos:**
```bash
for i in {1..50}; do
  curl -s http://localhost:8005/api/menu &
done
wait
```

### 5.3 Uso de Recursos

**Verificar CPU:**
```bash
docker stats --no-stream
```

**Verificar RAM:**
```bash
docker stats --no-stream --format "table {{.Name}}\t{{.MemUsage}}"
```

**Verificar Disk I/O:**
```bash
docker stats --no-stream --format "table {{.Name}}\t{{.BlockIO}}"
```

---

## 🧪 FASE 6: TESTING DE MANEJO DE ERRORES

### 6.1 Endpoints con Datos Inválidos

**Request sin campo requerido:**
```bash
curl -X POST http://localhost:8005/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test"
  }'
```

**Resultado Esperado:** 400 Bad Request con mensaje de error

### 6.2 Autenticación Fallida

**Login con credenciales incorrectas:**
```bash
curl -X POST http://localhost:8005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "wrong@email.com",
    "password": "wrongpassword"
  }'
```

**Resultado Esperado:** 401 Unauthorized

### 6.3 Token Expirado/Inválido

**Request con token inválido:**
```bash
curl -X GET http://localhost:8005/api/auth/profile \
  -H "Authorization: Bearer invalid_token_here"
```

**Resultado Esperado:** 401 Unauthorized

### 6.4 Recursos No Encontrados

**GET de recurso inexistente:**
```bash
curl -X GET http://localhost:8005/api/orders/99999
```

**Resultado Esperado:** 404 Not Found

---

## 🧪 FASE 7: TESTING DE PERSISTENCIA

### 7.1 Verificar Datos Persisten

**Paso 1:** Crear un pedido nuevo
**Paso 2:** Reiniciar contenedor backend
**Paso 3:** Verificar que el pedido sigue existiendo

```bash
# Crear pedido
curl -X POST http://localhost:8005/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Test Persistence","items":[]}'

# Reiniciar backend
docker-compose restart backend

# Esperar 10 segundos
sleep 10

# Listar pedidos
curl -X GET http://localhost:8005/api/orders
```

### 7.2 Verificar Redis Cache

**Paso 1:** Hacer request que genera cache
**Paso 2:** Hacer mismo request nuevamente
**Paso 3:** Verificar tiempo de respuesta mejorado

---

## 🧪 FASE 8: TESTING DE FRONTEND

### 8.1 Panel de Administración

**Acceso Visual:**
1. Abrir navegador en `http://localhost:7001`
2. Verificar pantalla de login carga
3. Iniciar sesión con credenciales admin
4. Verificar dashboard carga
5. Navegar por todas las secciones

**Funcionalidades a Probar:**
- [ ] Login/Logout
- [ ] Ver dashboard con estadísticas
- [ ] Listar menú
- [ ] Crear producto nuevo
- [ ] Editar producto existente
- [ ] Eliminar producto
- [ ] Ver pedidos
- [ ] Cambiar estado de pedido
- [ ] Ver reservas
- [ ] Crear nueva reserva
- [ ] Ver clientes
- [ ] Agregar cliente nuevo
- [ ] Ver analytics/reportes
- [ ] Modificar configuración

### 8.2 Landing Page

**Acceso Visual:**
1. Abrir navegador en `http://localhost:3004`
2. Verificar landing page carga
3. Ver menú público
4. Probar widget de chatbot

**Funcionalidades a Probar:**
- [ ] Landing page carga correctamente
- [ ] Menú se muestra completo
- [ ] Formulario de contacto funciona
- [ ] Chatbot widget aparece
- [ ] Chatbot responde a mensajes
- [ ] Enlaces y navegación funcionan
- [ ] Imágenes cargan correctamente

---

## 📊 RESULTADOS ESPERADOS

### Criterios de Éxito

**Backend API:**
- ✅ Todos los endpoints responden 200 OK (o código apropiado)
- ✅ Tiempos de respuesta < 300ms promedio
- ✅ Manejo correcto de errores (4xx, 5xx)
- ✅ Base de datos conectada y operacional
- ✅ Redis funcionando como cache

**Frontend:**
- ✅ Admin panel carga sin errores
- ✅ Landing page carga sin errores
- ✅ Todas las funcionalidades accesibles
- ✅ UI responsive y funcional

**Integración:**
- ✅ Chatbot responde correctamente
- ✅ Flujos end-to-end completos
- ✅ Datos persisten correctamente
- ✅ Cache mejora performance

**Performance:**
- ✅ CPU < 5% en operación normal
- ✅ RAM < 500 MB total
- ✅ Soporta 50 requests concurrentes
- ✅ Sin memory leaks

---

## 🐛 REGISTRO DE ISSUES

### Issues Encontrados

| # | Descripción | Severidad | Estado |
|---|-------------|-----------|--------|
| - | (A completar durante testing) | - | - |

### Mejoras Sugeridas

| # | Descripción | Prioridad | Notas |
|---|-------------|-----------|-------|
| - | (A completar durante testing) | - | - |

---

## 📝 NOTAS DE TESTING

### Observaciones Generales

(A completar durante la ejecución del testing)

### Hallazgos Importantes

(A completar durante la ejecución del testing)

### Recomendaciones

(A completar durante la ejecución del testing)

---

**📅 Creado:** 2025-10-04 20:12:45
**👤 Tester:** devlmer + Claude Code
**🎯 Estado:** ⏳ En Progreso

---

*Testing Funcional Completo - ChatBotDysa Enterprise*
*Jornada: 2025-10-04*
*Objetivo: Validación End-to-End del Sistema*

**TESTING INICIADO** ▶️
