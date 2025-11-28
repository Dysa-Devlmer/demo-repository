# 🍽️ Guía Completa - Cómo Probar ChatBotDysa como Dueño de Restaurante

**Fecha**: 11 de Octubre, 2025 - 21:45
**Audiencia**: Dueños de Restaurantes
**Tiempo estimado**: 15-20 minutos

---

## 🎯 INTRODUCCIÓN

Esta guía te muestra **paso a paso** cómo probar el sistema ChatBotDysa Enterprise como si fueras el dueño de un restaurante. Podrás:

✅ Acceder al panel de administración
✅ Gestionar tu menú
✅ Ver conversaciones de clientes
✅ Administrar pedidos y reservas
✅ Consultar estadísticas
✅ Configurar el chatbot

---

## 📋 TABLA DE CONTENIDOS

1. [Acceso Rápido](#acceso-rápido)
2. [Inicio de Sesión](#inicio-de-sesión)
3. [Tour del Panel de Administración](#tour-del-panel)
4. [Gestión del Menú](#gestión-del-menú)
5. [Conversaciones con Clientes](#conversaciones)
6. [Pedidos y Reservas](#pedidos-y-reservas)
7. [Estadísticas](#estadísticas)
8. [Configuración](#configuración)
9. [Prueba desde el Cliente](#prueba-cliente)

---

## 🚀 ACCESO RÁPIDO

### URLs Principales:

```
🏢 Panel de Administración:  http://localhost:7001
🌐 Landing Page (Público):   http://localhost:3004
🔌 Backend API:              http://localhost:8005
📊 API Docs (Swagger):       http://localhost:8005/docs
```

### Credenciales de Prueba:

```
📧 Email:    admin@zgamersa.com
🔒 Password: admin123
```

**Restaurante**: ZG Amersa (Restaurante de ejemplo)

---

## 🔐 INICIO DE SESIÓN

### Paso 1: Abrir el Panel de Administración

1. Abre tu navegador (Chrome, Firefox, Safari)
2. Ve a: **http://localhost:7001**
3. Verás la página de login de ChatBotDysa

### Paso 2: Ingresar Credenciales

```
📧 Email:    admin@zgamersa.com
🔒 Password: admin123
```

### Paso 3: Hacer Click en "Iniciar Sesión"

Serás redirigido al **Dashboard Principal**

---

## 🏠 TOUR DEL PANEL DE ADMINISTRACIÓN

### Vista del Dashboard Principal

Al iniciar sesión verás:

```
┌─────────────────────────────────────────────────────────┐
│  🏠 Dashboard                                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📊 Estadísticas Hoy:                                   │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │ 👥 Clientes │  │ 💬 Mensajes │  │ 🛒 Pedidos  │   │
│  │     45      │  │     128     │  │     12      │   │
│  └─────────────┘  └─────────────┘  └─────────────┘   │
│                                                         │
│  📈 Gráfica de Conversaciones (últimos 7 días)         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Menú Lateral:

```
📍 Dashboard          - Vista general
👥 Clientes          - Lista de clientes
📋 Menú              - Gestión de platillos
🛒 Pedidos           - Órdenes activas
📅 Reservas          - Reservaciones
💬 Conversaciones    - Chat con clientes
📊 Estadísticas      - Analytics
⚙️  Configuración    - Ajustes del sistema
🤖 Chat IA           - Configuración del bot
```

---

## 🍕 GESTIÓN DEL MENÚ

### Ver el Menú Actual

1. Click en **"📋 Menú"** en el menú lateral
2. Verás la lista de platillos actuales

**Ejemplo de Vista**:

```
┌──────────────────────────────────────────────────────┐
│  📋 Menú del Restaurante                             │
├──────────────────────────────────────────────────────┤
│                                                      │
│  [+ Agregar Platillo]                                │
│                                                      │
│  🍕 Entradas                                         │
│  ┌─────────────────────────────────────────────┐    │
│  │ 🥗 Ensalada César            - $89.00       │    │
│  │ 🍤 Camarones al Ajillo       - $149.00      │    │
│  │ 🧀 Queso Fundido             - $95.00       │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  🍽️ Platos Principales                               │
│  ┌─────────────────────────────────────────────┐    │
│  │ 🥩 Filete de Res             - $289.00      │    │
│  │ 🍗 Pollo a la Plancha        - $169.00      │    │
│  │ 🐟 Salmón Grillado           - $249.00      │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Agregar un Nuevo Platillo

1. Click en **[+ Agregar Platillo]**
2. Llena el formulario:

```
┌─────────────────────────────────────────┐
│  Agregar Nuevo Platillo                 │
├─────────────────────────────────────────┤
│                                         │
│  Nombre: ___________________________    │
│  Descripción: ______________________    │
│  Precio: $__________                    │
│  Categoría: [▼ Seleccionar]             │
│    • Entradas                           │
│    • Platos Principales                 │
│    • Postres                            │
│    • Bebidas                            │
│                                         │
│  Disponible: [✓] Sí  [ ] No            │
│                                         │
│  [Cancelar]  [Guardar Platillo]         │
└─────────────────────────────────────────┘
```

**Ejemplo**:
```
Nombre: Tacos al Pastor
Descripción: 3 tacos con carne de cerdo marinada, piña, cilantro y cebolla
Precio: $85.00
Categoría: Platos Principales
Disponible: ✓ Sí
```

3. Click en **[Guardar Platillo]**

---

## 💬 CONVERSACIONES CON CLIENTES

### Ver Conversaciones Activas

1. Click en **"💬 Conversaciones"** en el menú lateral
2. Verás todas las conversaciones recientes

**Vista de Conversaciones**:

```
┌───────────────────────────────────────────────────────────┐
│  💬 Conversaciones                                        │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  Activas (3)  │  Archivadas (12)                          │
│  ─────────────                                            │
│                                                           │
│  ┌─────────────────────────────────────────────────┐     │
│  │ 👤 Juan Pérez                    Hace 2 min     │     │
│  │ "¿Tienen tacos al pastor?"                      │     │
│  │ Estado: ⏳ Esperando respuesta                   │     │
│  └─────────────────────────────────────────────────┘     │
│                                                           │
│  ┌─────────────────────────────────────────────────┐     │
│  │ 👤 María González                Hace 15 min    │     │
│  │ "Quiero hacer una reserva para 4 personas"      │     │
│  │ Estado: ✅ Atendida                              │     │
│  └─────────────────────────────────────────────────┘     │
│                                                           │
│  ┌─────────────────────────────────────────────────┐     │
│  │ 👤 Carlos Ramírez               Hace 1 hora     │     │
│  │ "¿Cuál es su horario?"                          │     │
│  │ Estado: ✅ Respondida por Bot                    │     │
│  └─────────────────────────────────────────────────┘     │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### Abrir una Conversación

1. Click en cualquier conversación
2. Verás el historial completo del chat

**Vista de Chat Individual**:

```
┌─────────────────────────────────────────────────────┐
│  👤 Juan Pérez - WhatsApp: +52 55 1234 5678        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  👤 Juan Pérez                     18:30            │
│  ┌──────────────────────────────────────────┐      │
│  │ Hola, ¿tienen tacos al pastor?           │      │
│  └──────────────────────────────────────────┘      │
│                                                     │
│                              18:31  🤖 ChatBot      │
│      ┌──────────────────────────────────────────┐  │
│      │ ¡Hola Juan! Sí, tenemos deliciosos      │  │
│      │ tacos al pastor a $85 los 3 tacos.      │  │
│      │ ¿Te gustaría ordenar?                   │  │
│      └──────────────────────────────────────────┘  │
│                                                     │
│  👤 Juan Pérez                     18:32            │
│  ┌──────────────────────────────────────────┐      │
│  │ Sí, quiero una orden para llevar          │      │
│  └──────────────────────────────────────────┘      │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ Escribe tu mensaje...                       │   │
│  │ [Enviar]                                    │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  [Tomar Control]  [Resolver]  [Archivar]           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Intervenir en una Conversación

**Opción 1: Dejar que el Bot responda** (Automático)
- El ChatBot responderá automáticamente

**Opción 2: Tomar Control Manual**
1. Click en **[Tomar Control]**
2. Escribe tu mensaje
3. El cliente recibirá tu respuesta directamente

---

## 🛒 PEDIDOS Y RESERVAS

### Ver Pedidos Activos

1. Click en **"🛒 Pedidos"** en el menú lateral

**Vista de Pedidos**:

```
┌──────────────────────────────────────────────────────┐
│  🛒 Pedidos                                          │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Filtros: [Todos] [Pendientes] [En preparación]     │
│                                                      │
│  ┌────────────────────────────────────────────┐     │
│  │ Pedido #1024                               │     │
│  │ 👤 Juan Pérez - +52 55 1234 5678           │     │
│  │ 🕐 18:32 - Para llevar                      │     │
│  │                                             │     │
│  │ • 1x Tacos al Pastor           $85.00      │     │
│  │ • 1x Refresco                  $25.00      │     │
│  │                                             │     │
│  │ Total: $110.00                              │     │
│  │                                             │     │
│  │ Estado: 🟡 Pendiente                        │     │
│  │ [Aceptar] [Rechazar]                        │     │
│  └────────────────────────────────────────────┘     │
│                                                      │
│  ┌────────────────────────────────────────────┐     │
│  │ Pedido #1023                               │     │
│  │ 👤 María González - Mesa 5                 │     │
│  │ 🕐 18:15 - En local                         │     │
│  │                                             │     │
│  │ • 2x Filete de Res             $578.00     │     │
│  │ • 1x Vino Tinto                $350.00     │     │
│  │                                             │     │
│  │ Total: $928.00                              │     │
│  │                                             │     │
│  │ Estado: 🟢 En preparación                   │     │
│  │ [Listo para servir]                         │     │
│  └────────────────────────────────────────────┘     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Gestionar un Pedido

**Cambiar Estado del Pedido**:

1. **Pendiente** → Click en [Aceptar] → **En preparación**
2. **En preparación** → Click en [Listo] → **Listo para servir**
3. **Listo** → Click en [Entregado] → **Completado**

### Ver Reservas

1. Click en **"📅 Reservas"** en el menú lateral

**Vista de Reservas**:

```
┌──────────────────────────────────────────────────────┐
│  📅 Reservas                                         │
├──────────────────────────────────────────────────────┤
│                                                      │
│  🗓️ Hoy - Viernes 11 de Octubre                     │
│                                                      │
│  ┌────────────────────────────────────────────┐     │
│  │ 19:00 - Mesa 3                             │     │
│  │ 👤 Carlos Mendoza - 4 personas             │     │
│  │ 📞 +52 55 9876 5432                         │     │
│  │ Estado: ✅ Confirmada                       │     │
│  │ [Ver detalles] [Contactar]                 │     │
│  └────────────────────────────────────────────┘     │
│                                                      │
│  ┌────────────────────────────────────────────┐     │
│  │ 20:30 - Mesa 8                             │     │
│  │ 👤 Ana Rodríguez - 2 personas              │     │
│  │ 📞 +52 55 5555 1234                         │     │
│  │ Estado: ⏳ Por confirmar                    │     │
│  │ [Confirmar] [Cancelar]                      │     │
│  └────────────────────────────────────────────┘     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 📊 ESTADÍSTICAS

### Acceder a Analytics

1. Click en **"📊 Estadísticas"** en el menú lateral

**Dashboard de Estadísticas**:

```
┌──────────────────────────────────────────────────────────┐
│  📊 Estadísticas y Analytics                            │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  📅 Periodo: [▼ Últimos 7 días]                          │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ 💬 Mensajes │  │ 🛒 Pedidos  │  │ 💰 Ingresos │     │
│  │    856      │  │     89      │  │  $24,580    │     │
│  │   +12.5%    │  │   +8.3%     │  │   +15.2%    │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ 👥 Clientes │  │ ⭐ Satisf.  │  │ ⏱️ Resp.    │     │
│  │    124      │  │   4.8/5.0   │  │  2.3 min    │     │
│  │   +18.9%    │  │   +0.2      │  │   -0.5 min  │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                          │
│  📈 Conversaciones por Día                               │
│  ┌──────────────────────────────────────────────┐       │
│  │                                 ▁▃▅▇█         │       │
│  │  L   M   M   J   V   S   D                   │       │
│  └──────────────────────────────────────────────┘       │
│                                                          │
│  🏆 Platillos Más Vendidos                               │
│  ┌──────────────────────────────────────────────┐       │
│  │ 1. 🥩 Filete de Res            42 órdenes    │       │
│  │ 2. 🍕 Tacos al Pastor          38 órdenes    │       │
│  │ 3. 🍗 Pollo a la Plancha       31 órdenes    │       │
│  │ 4. 🐟 Salmón Grillado          28 órdenes    │       │
│  │ 5. 🥗 Ensalada César           24 órdenes    │       │
│  └──────────────────────────────────────────────┘       │
│                                                          │
│  ⏰ Horarios de Mayor Demanda                            │
│  ┌──────────────────────────────────────────────┐       │
│  │ 13:00-15:00  ████████████████ 45% (Comida)  │       │
│  │ 20:00-22:00  ██████████████   38% (Cena)    │       │
│  │ 18:00-20:00  ████████         17% (Tarde)   │       │
│  └──────────────────────────────────────────────┘       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Información Disponible:

- **Mensajes totales**: Cantidad de conversaciones
- **Pedidos**: Órdenes recibidas
- **Ingresos**: Ventas generadas
- **Clientes nuevos**: Registros
- **Satisfacción**: Calificación promedio
- **Tiempo de respuesta**: Rapidez del bot
- **Platillos populares**: Más vendidos
- **Horarios pico**: Momentos de mayor actividad

---

## ⚙️ CONFIGURACIÓN

### Acceder a Configuración

1. Click en **"⚙️ Configuración"** en el menú lateral

**Panel de Configuración**:

```
┌──────────────────────────────────────────────────────┐
│  ⚙️ Configuración del Restaurante                    │
├──────────────────────────────────────────────────────┤
│                                                      │
│  📝 Información General                              │
│  ┌────────────────────────────────────────────┐     │
│  │ Nombre: _______________________________    │     │
│  │ Teléfono: _____________________________    │     │
│  │ Dirección: ____________________________    │     │
│  │ Email: ________________________________    │     │
│  │ Horario: ______________________________    │     │
│  └────────────────────────────────────────────┘     │
│                                                      │
│  🤖 Configuración del ChatBot                        │
│  ┌────────────────────────────────────────────┐     │
│  │ Nombre del Bot: _______________________    │     │
│  │ Saludo Inicial: ________________________   │     │
│  │ Idioma: [▼ Español]                        │     │
│  │ Tono: [▼ Amigable]                         │     │
│  │                                            │     │
│  │ Respuestas Automáticas:                    │     │
│  │ [✓] Horarios                               │     │
│  │ [✓] Ubicación                              │     │
│  │ [✓] Menú                                   │     │
│  │ [✓] Reservas                               │     │
│  │ [✓] Pedidos                                │     │
│  └────────────────────────────────────────────┘     │
│                                                      │
│  📱 Integraciones                                    │
│  ┌────────────────────────────────────────────┐     │
│  │ WhatsApp Business:                         │     │
│  │ [✓] Conectado - +52 55 1234 5678           │     │
│  │ [Configurar]                               │     │
│  │                                            │     │
│  │ Widget Web:                                │     │
│  │ [✓] Activo en www.mirestaurante.com       │     │
│  │ [Obtener código]                           │     │
│  │                                            │     │
│  │ Twilio (Llamadas):                         │     │
│  │ [ ] No configurado                         │     │
│  │ [Configurar]                               │     │
│  └────────────────────────────────────────────┘     │
│                                                      │
│  [Cancelar]  [Guardar Cambios]                      │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Ajustes Importantes:

1. **Información del Restaurante**: Nombre, teléfono, dirección
2. **Configuración del Bot**: Personaliza el tono y respuestas
3. **Integraciones**: Conecta WhatsApp, Web, Twilio
4. **Horarios**: Define cuándo está disponible el bot

---

## 🧪 PRUEBA DESDE EL CLIENTE

### Probar el Widget Web

1. Abre una nueva pestaña
2. Ve a: **http://localhost:3004** (Landing Page)
3. Verás un **botón de chat flotante** en la esquina inferior derecha

**Vista del Cliente**:

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│     ChatBotDysa - Página Principal                   │
│                                                      │
│     [🍽️ Ver Menú]  [📅 Reservar]  [📞 Contacto]      │
│                                                      │
│                                                      │
│                                                      │
│                                         ┌──────┐    │
│                                         │  💬  │    │
│                                         └──────┘    │
│                                          Chat       │
└──────────────────────────────────────────────────────┘
```

### Iniciar Conversación

1. Click en el **botón de chat** (💬)
2. El widget se abrirá

**Widget de Chat**:

```
┌──────────────────────────────────────┐
│  🤖 ChatBot - ZG Amersa          [×] │
├──────────────────────────────────────┤
│                                      │
│  🤖 ChatBot            Ahora         │
│  ┌────────────────────────────┐     │
│  │ ¡Hola! Soy el asistente    │     │
│  │ virtual de ZG Amersa.      │     │
│  │ ¿En qué puedo ayudarte?    │     │
│  └────────────────────────────┘     │
│                                      │
│  Sugerencias:                        │
│  [Ver menú]  [Hacer pedido]          │
│  [Reservar mesa]  [Horarios]         │
│                                      │
│  ┌─────────────────────────────┐    │
│  │ Escribe tu mensaje...       │    │
│  │ [Enviar]                    │    │
│  └─────────────────────────────┘    │
│                                      │
└──────────────────────────────────────┘
```

### Probar Flujos Comunes

**Flujo 1: Consultar el Menú**

```
👤 Tú: Quiero ver el menú

🤖 Bot: ¡Claro! Aquí está nuestro menú:

      🥗 Entradas:
      • Ensalada César - $89
      • Camarones al Ajillo - $149
      • Queso Fundido - $95

      🍽️ Platos Principales:
      • Filete de Res - $289
      • Tacos al Pastor - $85
      • Pollo a la Plancha - $169
      • Salmón Grillado - $249

      ¿Te gustaría ordenar algo?
```

**Flujo 2: Hacer un Pedido**

```
👤 Tú: Quiero ordenar tacos al pastor

🤖 Bot: ¡Excelente elección! Los tacos al pastor cuestan $85.
      ¿Cuántas órdenes deseas?

👤 Tú: 2 órdenes

🤖 Bot: Perfecto, 2 órdenes de Tacos al Pastor = $170

      ¿Algo más para tu pedido?
      [Sí, agregar más] [No, finalizar pedido]

👤 Tú: [No, finalizar pedido]

🤖 Bot: ¡Genial! Tu pedido total es:
      • 2x Tacos al Pastor - $170

      ¿Para recoger o delivery?
      [Recoger en local] [Delivery]

👤 Tú: [Recoger en local]

🤖 Bot: Perfecto. Por favor proporciona:
      • Tu nombre
      • Tu teléfono
      • Hora estimada de recogida

👤 Tú: Juan Pérez, 55 1234 5678, en 30 minutos

🤖 Bot: ✅ ¡Pedido confirmado!

      Resumen:
      • 2x Tacos al Pastor - $170
      • Recoger en: 30 minutos
      • Contacto: Juan Pérez - 55 1234 5678

      Tu número de pedido es: #1025

      Te esperamos en 30 minutos. ¡Gracias!
```

**Flujo 3: Hacer una Reserva**

```
👤 Tú: Quiero hacer una reserva

🤖 Bot: ¡Encantado de ayudarte con tu reserva!

      ¿Para cuántas personas?

👤 Tú: 4 personas

🤖 Bot: Perfecto, reserva para 4 personas.
      ¿Qué día prefieres?

👤 Tú: Hoy en la noche

🤖 Bot: ¿A qué hora te gustaría reservar?

      Horarios disponibles hoy:
      [19:00] [19:30] [20:00] [20:30] [21:00]

👤 Tú: [20:00]

🤖 Bot: Excelente. Por favor proporciona:
      • Tu nombre
      • Tu teléfono
      • Alguna preferencia (mesa cerca de ventana, etc.)

👤 Tú: María González, 55 9876 5432, mesa cerca de ventana

🤖 Bot: ✅ ¡Reserva confirmada!

      Detalles:
      • Fecha: Viernes 11 de Octubre
      • Hora: 20:00
      • Personas: 4
      • Nombre: María González
      • Teléfono: 55 9876 5432
      • Preferencia: Mesa cerca de ventana

      Tu número de reserva es: #R-1025

      ¡Te esperamos! 🎉
```

---

## 🔍 VERIFICAR EL PEDIDO EN EL PANEL

### Volver al Panel de Administración

1. Regresa a la pestaña del panel: **http://localhost:7001**
2. Ve a **"🛒 Pedidos"**
3. Deberías ver el nuevo pedido #1025

**Pedido Recibido**:

```
┌────────────────────────────────────────────┐
│ Pedido #1025                 🆕 NUEVO      │
│ 👤 Juan Pérez - +52 55 1234 5678           │
│ 🕐 19:15 - Para recoger en 30 min          │
│                                             │
│ • 2x Tacos al Pastor           $170.00     │
│                                             │
│ Total: $170.00                              │
│                                             │
│ Estado: 🟡 Pendiente                        │
│ [Aceptar] [Rechazar]                        │
└────────────────────────────────────────────┘
```

---

## 📱 PRUEBA POR WhatsApp (Si está configurado)

### Si tienes WhatsApp Business configurado:

1. Abre WhatsApp en tu teléfono
2. Busca el número del restaurante
3. Envía un mensaje: "Hola"
4. El bot responderá automáticamente

**Conversación en WhatsApp**:

```
[Tu contacto: ZG Amersa Restaurante]

Tú (19:20):
Hola

ZG Amersa Bot (19:20):
¡Hola! 👋 Soy el asistente virtual de ZG Amersa.
¿En qué puedo ayudarte hoy?

• Ver menú 📋
• Hacer pedido 🛒
• Hacer reserva 📅
• Consultar horarios 🕐
• Ubicación 📍

Tú (19:21):
Ver menú

ZG Amersa Bot (19:21):
🍽️ *Menú de ZG Amersa*

*Entradas:*
🥗 Ensalada César - $89
🍤 Camarones al Ajillo - $149
🧀 Queso Fundido - $95

*Platos Principales:*
🥩 Filete de Res - $289
🌮 Tacos al Pastor - $85
🍗 Pollo a la Plancha - $169
🐟 Salmón Grillado - $249

*Postres:*
🍰 Cheesecake - $75
🍮 Flan Napolitano - $65

*Bebidas:*
🥤 Refrescos - $25
🍺 Cerveza - $45

¿Te gustaría ordenar algo? 😊
```

**Ver la conversación en el Panel**:

1. En el panel: **"💬 Conversaciones"**
2. Busca la conversación con tu número
3. Podrás ver todo el historial
4. Opción de intervenir manualmente si lo deseas

---

## 📊 RESUMEN DE FUNCIONALIDADES

### Como Dueño de Restaurante puedes:

✅ **Gestionar Menú**
- Agregar/editar/eliminar platillos
- Cambiar precios
- Marcar disponibilidad

✅ **Ver y Gestionar Pedidos**
- Recibir pedidos automáticamente
- Aceptar/rechazar órdenes
- Cambiar estados (pendiente → preparando → listo)

✅ **Gestionar Reservas**
- Ver reservas del día/semana
- Confirmar/cancelar reservaciones
- Contactar clientes

✅ **Monitorear Conversaciones**
- Ver todas las interacciones con clientes
- Intervenir manualmente cuando sea necesario
- Revisar historial completo

✅ **Consultar Estadísticas**
- Ingresos, pedidos, mensajes
- Platillos más vendidos
- Horarios pico
- Satisfacción del cliente

✅ **Configurar el Sistema**
- Personalizar el chatbot
- Conectar integraciones (WhatsApp, Web)
- Ajustar respuestas automáticas

---

## 🎯 CASOS DE USO REALES

### Caso 1: Recibir Pedido Durante Hora Pico

**Situación**: Es viernes a las 21:00, el restaurante está lleno

**Flujo**:
1. Cliente envía mensaje por WhatsApp: "Quiero ordenar para llevar"
2. Bot responde automáticamente, muestra el menú
3. Cliente hace su pedido: "2 filetes de res"
4. Bot procesa el pedido, confirma total
5. **Panel de Admin**: Aparece nuevo pedido #1026
6. Tú (dueño) revisas el pedido en el panel
7. Click en [Aceptar]
8. Cliente recibe confirmación automática
9. Cocina prepara el pedido
10. Click en [Listo para entregar]
11. Cliente recibe notificación: "Tu pedido está listo"

**Resultado**: Pedido procesado en 2 minutos, sin llamadas telefónicas, sin errores

---

### Caso 2: Reserva de Último Minuto

**Situación**: Cliente quiere reservar para esa misma noche

**Flujo**:
1. Cliente envía: "¿Tienen mesa para 6 personas hoy a las 22:00?"
2. Bot verifica disponibilidad automáticamente
3. Bot responde: "Sí, tenemos disponibilidad"
4. Cliente confirma datos
5. **Panel de Admin**: Nueva reserva aparece en el calendario
6. Tú verificas la mesa asignada
7. Click en [Confirmar]
8. Cliente recibe confirmación

**Resultado**: Reserva confirmada en 3 minutos, sin necesidad de responder manualmente

---

### Caso 3: Consulta de Información

**Situación**: Cliente nuevo pregunta sobre el restaurante

**Flujo**:
1. Cliente: "¿Cuál es su horario?"
2. Bot: "Estamos abiertos de Lunes a Domingo, 13:00-23:00"
3. Cliente: "¿Dónde están ubicados?"
4. Bot: "Estamos en [Dirección]. ¿Te comparto la ubicación?"
5. Cliente: "Sí"
6. Bot envía link de Google Maps

**Resultado**: Cliente informado sin intervención humana, tú puedes enfocarte en otras tareas

---

## 💡 TIPS PARA DUEÑOS DE RESTAURANTE

### 1. Revisa las Estadísticas Diariamente
- Identifica los platillos más vendidos
- Optimiza inventario según demanda
- Ajusta precios basado en popularidad

### 2. Monitorea las Conversaciones
- Lee feedback de clientes
- Identifica problemas comunes
- Mejora el menú según preferencias

### 3. Intervén Cuando Sea Necesario
- El bot maneja el 90% de consultas
- Intervén en casos especiales o quejas
- Toma control para dar servicio personalizado

### 4. Mantén el Menú Actualizado
- Marca platillos no disponibles
- Actualiza precios regularmente
- Agrega nuevos platillos

### 5. Configura Respuestas Personalizadas
- Ajusta el tono del bot según tu marca
- Agrega promociones temporales
- Personaliza saludos por horario

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Problema 1: No puedo iniciar sesión

**Solución**:
```bash
# Verificar que el backend esté activo
curl http://localhost:8005/health

# Si no responde, iniciar servicios
cd /Users/devlmer/ChatBotDysa
docker-compose up -d
```

### Problema 2: No veo el menú

**Solución**:
- Verifica que hayas iniciado sesión correctamente
- Refresca la página (Cmd+R o Ctrl+R)
- Revisa la consola del navegador (F12)

### Problema 3: El bot no responde

**Solución**:
```bash
# Verificar servicio de IA
curl http://localhost:21434/api/tags

# Reiniciar Ollama si es necesario
docker-compose restart ollama
```

### Problema 4: No aparecen los pedidos

**Solución**:
- Verifica la conexión a la base de datos
- Ve a: Estadísticas → Dashboard
- Si ves datos ahí, el sistema está funcionando

---

## 📞 CONTACTO Y SOPORTE

### Necesitas Ayuda?

- **Documentación**: `/docs` en el proyecto
- **Logs del sistema**: `docker-compose logs backend`
- **Panel de Admin**: http://localhost:7001
- **API Docs**: http://localhost:8005/docs

---

## 🎉 ¡LISTO PARA EMPEZAR!

### Checklist Final:

- [ ] Servicios activos (Backend, Admin Panel)
- [ ] Inicio de sesión exitoso
- [ ] Menú visible y editable
- [ ] Prueba de conversación con el bot
- [ ] Pedido de prueba creado
- [ ] Estadísticas funcionando

### Próximos Pasos:

1. **Familiarízate con el panel** (15 minutos)
2. **Agrega tu menú real** (30 minutos)
3. **Personaliza el bot** (15 minutos)
4. **Prueba todos los flujos** (20 minutos)
5. **Conecta WhatsApp** (si lo deseas)
6. **¡Comienza a recibir pedidos!** 🚀

---

**FIN DE LA GUÍA**

✅ **Ahora estás listo para usar ChatBotDysa como un dueño de restaurante profesional**
🍽️ **Automatiza tu negocio y mejora la experiencia de tus clientes**
📊 **Toma decisiones basadas en datos reales**

**Fecha**: 11 de Octubre, 2025
**Versión**: 1.0
**Proyecto**: ChatBotDysa Enterprise
