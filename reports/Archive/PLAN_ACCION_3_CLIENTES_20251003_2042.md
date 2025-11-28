# 🚀 PLAN DE ACCIÓN: Sistema para 3 Clientes

**Fecha:** 3 de Octubre, 2025
**Hora:** 20:42
**Prioridad:** 🔴🔴🔴 MÁXIMA URGENCIA
**Objetivo:** Sistema completo funcionando para 3 restaurantes

---

## 🎯 Objetivo Final

**Entregar un sistema 100% funcional a 3 restaurantes con:**
- Panel de administración operativo
- Widget funcional embebible
- Chat AI funcionando
- Gestión de menú, pedidos y reservas
- Notificaciones por email
- Todo sincronizado y en tiempo real

---

## ⏱️ Timeline Propuesto

### FASE 1: Verificación y Levantamiento (1-2 horas)
```
20:45 - 21:00 (15 min) → Verificar base de datos
21:00 - 21:30 (30 min) → Levantar Admin Panel
21:30 - 22:00 (30 min) → Levantar Widget
22:00 - 22:15 (15 min) → Verificar integración
```

### FASE 2: Testing y Corrección (2-3 horas)
```
22:15 - 22:45 (30 min) → Test end-to-end flujo completo
22:45 - 23:30 (45 min) → Correcciones y ajustes
23:30 - 00:00 (30 min) → Documentación de cambios
```

### FASE 3: Configuración para Clientes (3-4 horas)
```
Día siguiente:
- Crear 3 usuarios de restaurante
- Configurar menú de ejemplo para cada uno
- Generar widgets personalizados
- Documentación para clientes
- Capacitación básica
```

**Tiempo total estimado:** 6-9 horas

---

## 📋 FASE 1: Verificación y Levantamiento

### ✅ Paso 1: Verificar Base de Datos (15 min)

**Acción:**
```bash
# Conectar a base de datos
cd /Users/devlmer/ChatBotDysa/apps/backend

# Verificar con endpoint del backend
curl http://localhost:8005/health

# Ver logs del backend para verificar conexión DB
tail -f /tmp/backend-logs.txt | grep -i "database\|connected"
```

**Verificar:**
```
✓ PostgreSQL conectado
✓ Todas las tablas existen
✓ Relaciones funcionando
✓ Usuario admin existe
```

**Si falta algo:**
```bash
# Ejecutar migraciones si es necesario
cd /Users/devlmer/ChatBotDysa/apps/backend
npm run typeorm:migration:run
```

---

### 🔴 Paso 2: Levantar Admin Panel (30 min)

**Ubicación:** `/Users/devlmer/ChatBotDysa/apps/admin-panel`

#### 2.1. Verificar Configuración (5 min)

```bash
cd /Users/devlmer/ChatBotDysa/apps/admin-panel

# Verificar si existe .env.local
ls -la | grep env

# Si no existe, crear
```

**Crear `.env.local` con:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8005
NEXT_PUBLIC_WS_URL=ws://localhost:8005
```

#### 2.2. Instalar Dependencias (10 min)

```bash
# Verificar node_modules existe
ls -la | grep node_modules

# Si no existe, instalar
npm install
```

#### 2.3. Iniciar Admin Panel (5 min)

```bash
# Iniciar en desarrollo
npm run dev

# Debería mostrar:
# - ready started server on 0.0.0.0:7001
# - Local: http://localhost:7001
```

#### 2.4. Verificar en Navegador (10 min)

```
1. Abrir: http://localhost:7001
2. Verificar que carga la página
3. Intentar login con:
   - Email: admin@chatbotdysa.com
   - Password: (verificar en DB o crear)
4. Verificar dashboard carga
5. Verificar menú de navegación
```

**Si hay errores:**
```
- Verificar console del navegador
- Verificar logs del terminal
- Verificar que backend responde: curl http://localhost:8005/health
- Verificar CORS en backend
```

---

### 🔴 Paso 3: Levantar Widget (30 min)

**Ubicación:** `/Users/devlmer/ChatBotDysa/apps/web-widget`

#### 3.1. Verificar Configuración (5 min)

```bash
cd /Users/devlmer/ChatBotDysa/apps/web-widget

# Ver estructura
ls -la

# Verificar si hay archivo de config
cat webpack.config.js | grep -i "url\|port" || echo "Verificar config manual"
```

#### 3.2. Instalar Dependencias (10 min)

```bash
npm install
```

#### 3.3. Iniciar Widget en Dev (5 min)

```bash
# Iniciar webpack dev server
npm run dev

# Debería mostrar:
# - webpack compiled successfully
# - Servidor corriendo en algún puerto
```

#### 3.4. Generar Build (5 min)

```bash
# Generar build de producción
npm run build

# Debería crear:
# - dist/dysabot-widget.min.js
```

#### 3.5. Probar Widget (5 min)

**Crear archivo de prueba `test-widget.html`:**
```html
<!DOCTYPE html>
<html>
<head>
    <title>Test Widget</title>
</head>
<body>
    <h1>Test ChatBotDysa Widget</h1>

    <!-- Widget Script -->
    <script src="http://localhost:8080/dysabot-widget.js"></script>
    <script>
        DysaBot.init({
            apiUrl: 'http://localhost:8005',
            wsUrl: 'ws://localhost:8005',
            restaurantId: 1
        });
    </script>
</body>
</html>
```

**Abrir en navegador y verificar:**
```
✓ Widget aparece en la esquina
✓ Se puede abrir el chat
✓ Se conecta al backend
✓ Responde mensajes
```

---

### 🟡 Paso 4: Levantar Landing Page (15 min) - OPCIONAL

**Ubicación:** `/Users/devlmer/ChatBotDysa/apps/landing-page`

```bash
cd /Users/devlmer/ChatBotDysa/apps/landing-page

# Instalar dependencias
npm install

# Iniciar
npm run dev

# Verificar en:
# http://localhost:3004
```

**Nota:** Landing no es crítico para que los clientes usen el sistema, pero es bueno tenerlo funcionando para demos.

---

### ✅ Paso 5: Verificar Integración (15 min)

#### 5.1. Backend ↔ Admin Panel
```
1. Login en Panel funciona
2. Dashboard muestra datos reales
3. Crear un item de menú
4. Verificar se guarda en DB
5. Recargar y verificar persiste
```

#### 5.2. Backend ↔ Widget
```
1. Widget se conecta via WebSocket
2. Chat responde mensajes
3. Menú se muestra correctamente
4. Hacer pedido funciona
5. Hacer reserva funciona
```

#### 5.3. WebSocket en Tiempo Real
```
1. Abrir Admin Panel en una ventana
2. Abrir Widget en otra ventana
3. Enviar mensaje desde Widget
4. Verificar aparece en Admin Panel en tiempo real
5. Responder desde Admin Panel
6. Verificar aparece en Widget en tiempo real
```

---

## 📋 FASE 2: Testing y Corrección

### Test End-to-End Completo (30 min)

#### Escenario 1: Cliente Hace Pedido

```
CLIENTE (Widget):
1. Abrir widget en sitio web
2. Ver menú disponible
3. Seleccionar items
4. Hacer pedido
5. Confirmar datos
6. Recibir confirmación

ADMIN (Panel):
7. Ver notificación de nuevo pedido
8. Abrir detalles del pedido
9. Marcar como confirmado
10. Cliente recibe email de confirmación (SendGrid)
11. Marcar como completado
12. Cliente recibe email de completado
```

#### Escenario 2: Cliente Hace Reserva

```
CLIENTE (Widget):
1. Abrir widget
2. Seleccionar "Reservar mesa"
3. Elegir fecha y hora
4. Ingresar datos (nombre, teléfono, personas)
5. Confirmar reserva
6. Recibir confirmación

ADMIN (Panel):
7. Ver notificación de nueva reserva
8. Abrir detalles de reserva
9. Confirmar disponibilidad
10. Cliente recibe email de confirmación
11. Marcar como completada (después de la fecha)
```

#### Escenario 3: Chat con Bot AI

```
CLIENTE (Widget):
1. Abrir chat
2. Preguntar: "¿Qué platos tienen?"
3. Bot responde con el menú (via Ollama AI)
4. Preguntar: "¿Tienen promociones?"
5. Bot responde con promociones activas
6. Preguntar algo específico
7. Si bot no puede responder, escalas a humano

ADMIN (Panel):
8. Recibe notificación de chat escalado
9. Entra a la conversación
10. Responde al cliente en tiempo real
11. Cliente ve respuesta inmediatamente
```

### Correcciones Esperadas (45 min)

**Problemas Comunes y Soluciones:**

```
PROBLEMA: CORS error en Admin Panel
SOLUCIÓN: Agregar localhost:7001 a CORS_ORIGIN en backend

PROBLEMA: Widget no se conecta via WebSocket
SOLUCIÓN: Verificar WebSocket Gateway en backend permite conexiones

PROBLEMA: Login no funciona
SOLUCIÓN: Verificar JWT_SECRET configurado y user existe en DB

PROBLEMA: Menú no aparece en Widget
SOLUCIÓN: Verificar endpoint /api/menu responde y tiene datos

PROBLEMA: Emails no se envían
SOLUCIÓN: Verificar SendGrid API Key y FROM email (ya configurado)

PROBLEMA: AI no responde
SOLUCIÓN: Verificar Ollama está corriendo en puerto 21434
```

---

## 📋 FASE 3: Configuración para Clientes

### Paso 1: Crear 3 Restaurantes de Demo (1 hora)

#### Restaurante 1: "La Bella Italia"
```json
{
  "name": "La Bella Italia",
  "type": "Italiana",
  "email": "admin@labellaitalia.com",
  "phone": "+56912345001",
  "address": "Av. Italia 123, Santiago",
  "menu": [
    {
      "name": "Pizza Margherita",
      "description": "Tomate, mozzarella, albahaca",
      "price": 8500,
      "category": "Pizzas"
    },
    {
      "name": "Pasta Carbonara",
      "description": "Pasta con salsa cremosa de queso y tocino",
      "price": 7500,
      "category": "Pastas"
    },
    {
      "name": "Tiramisú",
      "description": "Postre tradicional italiano",
      "price": 3500,
      "category": "Postres"
    }
  ]
}
```

#### Restaurante 2: "Sushi Master"
```json
{
  "name": "Sushi Master",
  "type": "Japonesa",
  "email": "admin@sushimaster.com",
  "phone": "+56912345002",
  "address": "Av. Apoquindo 456, Las Condes",
  "menu": [
    {
      "name": "Sushi Roll Clásico",
      "description": "10 piezas de sushi variado",
      "price": 9500,
      "category": "Rolls"
    },
    {
      "name": "Sashimi Mixto",
      "description": "Selección de pescados frescos",
      "price": 12000,
      "category": "Sashimi"
    },
    {
      "name": "Mochi de Té Verde",
      "description": "Postre japonés tradicional",
      "price": 2500,
      "category": "Postres"
    }
  ]
}
```

#### Restaurante 3: "Parrilla Don José"
```json
{
  "name": "Parrilla Don José",
  "type": "Parrilla",
  "email": "admin@parrilladonjose.com",
  "phone": "+56912345003",
  "address": "Av. Providencia 789, Providencia",
  "menu": [
    {
      "name": "Bife de Chorizo",
      "description": "350g de carne premium a la parrilla",
      "price": 15000,
      "category": "Carnes"
    },
    {
      "name": "Choripán",
      "description": "Chorizo artesanal con chimichurri",
      "price": 4500,
      "category": "Entradas"
    },
    {
      "name": "Flan Casero",
      "description": "Flan con dulce de leche",
      "price": 3000,
      "category": "Postres"
    }
  ]
}
```

### Paso 2: Configurar Widgets Personalizados (30 min)

**Para cada restaurante, generar código de embed:**

```html
<!-- La Bella Italia -->
<script src="http://localhost:8005/widget/dysabot-widget.min.js"></script>
<script>
  DysaBot.init({
    restaurantId: 1,
    apiUrl: 'http://localhost:8005',
    wsUrl: 'ws://localhost:8005',
    primaryColor: '#e74c3c', // Rojo italiano
    welcomeMessage: '¡Benvenuto a La Bella Italia! 🍕'
  });
</script>
```

```html
<!-- Sushi Master -->
<script src="http://localhost:8005/widget/dysabot-widget.min.js"></script>
<script>
  DysaBot.init({
    restaurantId: 2,
    apiUrl: 'http://localhost:8005',
    wsUrl: 'ws://localhost:8005',
    primaryColor: '#2c3e50', // Azul japonés
    welcomeMessage: 'こんにちは a Sushi Master! 🍣'
  });
</script>
```

```html
<!-- Parrilla Don José -->
<script src="http://localhost:8005/widget/dysabot-widget.min.js"></script>
<script>
  DysaBot.init({
    restaurantId: 3,
    apiUrl: 'http://localhost:8005',
    wsUrl: 'ws://localhost:8005',
    primaryColor: '#8b4513', // Marrón parrilla
    welcomeMessage: '¡Bienvenido a Parrilla Don José! 🥩'
  });
</script>
```

### Paso 3: Documentación para Clientes (1 hora)

**Crear guía rápida: `GUIA_RAPIDA_CLIENTE.md`**

```markdown
# Guía Rápida - ChatBotDysa

## Acceder al Panel de Administración

URL: http://localhost:7001
Email: (su email)
Password: (su password)

## Gestionar su Menú

1. Ir a "Menú" en el menú lateral
2. Click "Agregar Plato"
3. Completar información
4. Guardar

## Ver y Gestionar Pedidos

1. Ir a "Pedidos"
2. Ver lista de pedidos
3. Click en pedido para detalles
4. Cambiar estado (Confirmado, En Preparación, Completado)

## Ver y Gestionar Reservas

1. Ir a "Reservas"
2. Ver calendario de reservas
3. Confirmar o rechazar reservas

## Chat en Vivo

1. Ir a "Conversaciones"
2. Ver chats activos
3. Click en chat para responder en tiempo real

## Agregar Widget a su Sitio Web

1. Copiar el código JavaScript proporcionado
2. Pegarlo antes del cierre de </body> en su sitio
3. El widget aparecerá automáticamente
```

---

## 📊 Checklist de Entrega

### Para Cada Cliente:

#### Cuenta y Acceso ✓
- [ ] Usuario creado en sistema
- [ ] Email configurado
- [ ] Password temporal enviado
- [ ] Login verificado funciona

#### Configuración Básica ✓
- [ ] Información del restaurante completa
- [ ] Logo subido (si tienen)
- [ ] Colores personalizados
- [ ] Horarios de atención configurados

#### Menú ✓
- [ ] Al menos 5-10 platos cargados
- [ ] Categorías configuradas
- [ ] Precios correctos
- [ ] Descripciones completas
- [ ] Imágenes (si tienen)

#### Widget ✓
- [ ] Código de embed generado
- [ ] Personalización (colores, mensaje)
- [ ] Instrucciones de instalación
- [ ] Página de prueba funcionando

#### Funcionalidades ✓
- [ ] Chat bot respondiendo
- [ ] Pedidos funcionando
- [ ] Reservas funcionando
- [ ] Emails enviándose
- [ ] Panel mostrando todo en tiempo real

#### Capacitación ✓
- [ ] Guía rápida entregada
- [ ] Demo en vivo realizada
- [ ] Preguntas respondidas
- [ ] Contacto de soporte proporcionado

---

## ⚠️ Consideraciones Importantes

### MercadoPago
```
⚠️ Actualmente en modo TEST
Para producción:
1. Cambiar ACCESS_TOKEN a producción
2. Configurar webhooks en MP
3. Probar pagos reales
```

### WhatsApp
```
⚠️ No está configurado
Para activar:
1. Obtener credenciales de WhatsApp Business API
2. Configurar en backend
3. Probar envío de mensajes
```

### Hosting y Dominio
```
⚠️ Actualmente en localhost
Para producción:
1. Deployer backend en servidor (ej: Railway, Heroku, VPS)
2. Deployer Admin Panel en Vercel
3. Configurar dominio propio
4. HTTPS obligatorio
5. Actualizar URLs en widgets
```

---

## 🎯 Objetivo de Hoy

**Mínimo Viable:**
```
✅ Backend funcionando (YA ESTÁ)
✅ Admin Panel funcionando
✅ Widget funcionando
✅ 1 Restaurante configurado completo
✅ Test end-to-end exitoso
```

**Ideal:**
```
✅ Todo lo de arriba
✅ 3 Restaurantes configurados
✅ Widgets personalizados
✅ Documentación completa
✅ Demo para cada cliente
```

**Timeline:**
```
Hoy (20:42 - 23:00): Fases 1 y 2
Mañana: Fase 3 completa
Total: 6-9 horas de trabajo
```

---

**ChatBotDysa Enterprise+++++**
*Plan de Acción para 3 Clientes*

© 2025 ChatBotDysa
**Fecha:** 3 de Octubre, 2025 - 20:42
**Archivo:** PLAN_ACCION_3_CLIENTES_20251003_2042.md
**Prioridad:** 🔴🔴🔴 MÁXIMA
**Deadline:** Lo antes posible
**Estado:** ⚠️ EN EJECUCIÓN

**SIGUIENTE PASO:** Ejecutar FASE 1 - Verificar DB y levantar componentes
