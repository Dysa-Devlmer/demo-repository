# 👤 Guía de Usuario - ChatBotDysa

**Versión:** 1.0.0
**Fecha:** Octubre 2025
**Audiencia:** Administradores de Restaurante

---

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Acceso al Sistema](#acceso-al-sistema)
3. [Panel de Control (Dashboard)](#panel-de-control-dashboard)
4. [Gestión de Clientes](#gestión-de-clientes)
5. [Gestión de Menú](#gestión-de-menú)
6. [Gestión de Órdenes](#gestión-de-órdenes)
7. [Gestión de Reservas](#gestión-de-reservas)
8. [Chat con IA](#chat-con-ia)
9. [Conversaciones](#conversaciones)
10. [Configuración](#configuración)
11. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## Introducción

ChatBotDysa es un sistema integral de gestión para restaurantes que incluye:

✅ **Panel de Administración Web:** Gestiona órdenes, menú, clientes y reservas
✅ **Chatbot con IA:** Asistente virtual 24/7 para atender clientes
✅ **Widget Web:** Integrable en tu sitio web
✅ **Sistema de Órdenes:** Control completo de pedidos
✅ **Gestión de Menú:** Administra platillos, precios y disponibilidad

---

## Acceso al Sistema

### Iniciar Sesión

1. Abrir navegador web
2. Ir a la URL del panel: `https://admin.tu-restaurante.com`
3. Ingresar credenciales:
   - **Email:** tu-email@restaurante.com
   - **Password:** Tu contraseña segura

![Login Screen](./images/login-screen.png)

### Recuperar Contraseña

1. Clic en "¿Olvidaste tu contraseña?"
2. Ingresar email registrado
3. Revisar bandeja de entrada
4. Seguir enlace para crear nueva contraseña

### Primer Acceso

Al iniciar sesión por primera vez:

1. Se te pedirá cambiar la contraseña temporal
2. Completa tu perfil (nombre, teléfono)
3. Configura la información del restaurante

---

## Panel de Control (Dashboard)

### Vista General

El dashboard muestra métricas clave en tiempo real:

```
┌─────────────────────────────────────────────────────┐
│  Dashboard - Restaurante La Delicia                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📊 MÉTRICAS DEL DÍA                                │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ Órdenes  │  │ Ventas   │  │ Clientes │         │
│  │   45     │  │ $450.000 │  │    32    │         │
│  └──────────┘  └──────────┘  └──────────┘         │
│                                                     │
│  📈 GRÁFICO DE VENTAS (Últimos 7 días)             │
│  [Gráfico de barras]                               │
│                                                     │
│  📋 ÓRDENES RECIENTES                               │
│  ┌────────────────────────────────────┐            │
│  │ ORD-001 │ Mesa 5 │ $25.000 │ ✓    │            │
│  │ ORD-002 │ Delivery│ $18.500│ 🕐   │            │
│  └────────────────────────────────────┘            │
└─────────────────────────────────────────────────────┘
```

### Tarjetas de Métricas

**1. Total de Órdenes:**
- Órdenes del día actual
- Comparación con ayer
- Tendencia (↑ o ↓)

**2. Ventas del Día:**
- Total en pesos (CLP)
- Desglose: efectivo, tarjeta, transferencia
- Promedio por orden

**3. Clientes Atendidos:**
- Clientes únicos del día
- Clientes nuevos
- Clientes recurrentes

**4. Órdenes Pendientes:**
- Número de órdenes en proceso
- Tiempo promedio de preparación
- Alertas de retrasos

### Gráficos

**Ventas por Día:**
- Últimos 7 días
- Últimos 30 días
- Comparación mensual

**Platillos Más Vendidos:**
- Top 10 del mes
- Tendencias
- Categorías populares

---

## Gestión de Clientes

### Ver Lista de Clientes

1. Clic en **"Clientes"** en el menú lateral
2. Se muestra tabla con todos los clientes

**Columnas:**
- ID
- Nombre completo
- Email
- Teléfono
- Órdenes totales
- Última visita
- Estado (activo/inactivo)

### Búsqueda y Filtros

**Búsqueda:**
```
┌──────────────────────────────────┐
│ 🔍 Buscar cliente...             │
└──────────────────────────────────┘
```
Busca por: nombre, email, teléfono

**Filtros:**
- Estado: Activo | Inactivo | Todos
- Tipo: Regular | VIP | Nuevo
- Fecha de registro: Última semana | Último mes | Personalizado

### Crear Nuevo Cliente

1. Clic en **"+ Nuevo Cliente"**
2. Completar formulario:
   ```
   Nombre completo: *
   Email: *
   Teléfono: *
   Dirección: (opcional)
   Fecha de nacimiento: (opcional)
   Preferencias dietéticas: (opcional)
   Notas: (opcional)
   ```
3. Clic en **"Guardar"**

**Campos requeridos (*):**
- Nombre completo
- Email o Teléfono (al menos uno)

### Ver Detalles de Cliente

Clic en cualquier cliente para ver:

**Información Personal:**
- Datos de contacto
- Historial de órdenes
- Total gastado
- Platillos favoritos

**Órdenes Históricas:**
- Últimas 10 órdenes
- Frecuencia de pedidos
- Ticket promedio

**Acciones Disponibles:**
- ✏️ Editar información
- 📧 Enviar email
- 📱 Enviar WhatsApp
- 🗑️ Desactivar cliente

### Editar Cliente

1. Abrir detalles del cliente
2. Clic en **"Editar"**
3. Modificar campos necesarios
4. Clic en **"Guardar Cambios"**

### Exportar Clientes

1. Clic en **"Exportar"**
2. Seleccionar formato:
   - CSV (Excel)
   - PDF
   - JSON
3. Descargar archivo

---

## Gestión de Menú

### Ver Menú Completo

**Vista de Tarjetas:**
```
┌──────────────────────────────────────┐
│  🍕 Menú del Restaurante             │
├──────────────────────────────────────┤
│                                      │
│  [Entradas] [Platos Principales]     │
│  [Postres]  [Bebidas]                │
│                                      │
│  ┌─────────┐  ┌─────────┐           │
│  │ 🍕 Pizza│  │ 🍔 Burger│          │
│  │ $12.990 │  │ $9.990  │           │
│  │ ✓ Disp. │  │ ✗ Agot. │           │
│  └─────────┘  └─────────┘           │
└──────────────────────────────────────┘
```

**Vista de Lista:**
```
┌────────────────────────────────────────────────┐
│ Nombre       │ Categoría │ Precio  │ Estado   │
├────────────────────────────────────────────────┤
│ Pizza Marg.  │ Principal │ $12.990 │ ✓ Disp.  │
│ Hamburguesa  │ Principal │ $9.990  │ ✗ Agotado│
│ Ensalada     │ Entrada   │ $6.990  │ ✓ Disp.  │
└────────────────────────────────────────────────┘
```

### Categorías de Menú

**Categorías predefinidas:**
- 🥗 Entradas
- 🍝 Platos Principales
- 🍰 Postres
- 🥤 Bebidas
- 🍷 Vinos
- ☕ Cafetería

**Gestionar Categorías:**
1. Clic en **"Gestionar Categorías"**
2. Agregar, editar o eliminar
3. Reordenar arrastrando

### Agregar Nuevo Platillo

1. Clic en **"+ Nuevo Platillo"**
2. Completar formulario:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Información Básica
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Nombre del platillo: *
  ┌─────────────────────────────┐
  │ Pizza Margherita            │
  └─────────────────────────────┘

Categoría: *
  ┌─────────────────────────────┐
  │ Platos Principales ▼        │
  └─────────────────────────────┘

Descripción:
  ┌─────────────────────────────┐
  │ Masa artesanal, tomate      │
  │ fresco, mozzarella y        │
  │ albahaca                     │
  └─────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Precio y Disponibilidad
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Precio: *
  ┌─────────────────────────────┐
  │ $ 12.990                    │
  └─────────────────────────────┘

Disponible: ☑ Sí  ☐ No

Stock disponible:
  ┌─────────────────────────────┐
  │ 20 unidades                 │
  └─────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Opciones Adicionales
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Etiquetas:
  ☑ Vegetariano
  ☐ Vegano
  ☐ Sin Gluten
  ☑ Picante
  ☐ Orgánico

Tiempo de preparación:
  ┌─────────────────────────────┐
  │ 15 minutos                  │
  └─────────────────────────────┘

Imagen:
  [Subir imagen] (JPG, PNG - Max 2MB)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  [Cancelar]  [Guardar Platillo]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

3. Clic en **"Guardar Platillo"**

### Editar Platillo

1. Clic en el platillo a editar
2. Modificar campos
3. Guardar cambios

**Edición rápida:**
- Clic en icono de lápiz
- Cambiar precio o disponibilidad directamente
- Auto-guardado

### Cambiar Disponibilidad

**Marcar como agotado:**
1. Clic en toggle de disponibilidad
2. Automáticamente se oculta para nuevas órdenes

**Marcar como disponible:**
1. Clic nuevamente en toggle
2. Vuelve a aparecer en el menú

### Eliminar Platillo

⚠️ **Precaución:** Esta acción no se puede deshacer.

1. Abrir detalles del platillo
2. Clic en **"Eliminar"**
3. Confirmar eliminación
4. Platillo removido permanentemente

**Alternativa recomendada:**
- En lugar de eliminar, marcar como "no disponible"
- Mantiene historial de órdenes pasadas

---

## Gestión de Órdenes

### Ver Todas las Órdenes

**Vista de Tabla:**
```
┌──────────────────────────────────────────────────────┐
│ ID      │ Cliente  │ Tipo     │ Total    │ Estado   │
├──────────────────────────────────────────────────────┤
│ ORD-001 │ Juan P.  │ Mesa 5   │ $25.000  │ ✓ Listo  │
│ ORD-002 │ María G. │ Delivery │ $18.500  │ 🕐 Prep. │
│ ORD-003 │ Carlos L.│ Retiro   │ $32.000  │ 📋 Pend. │
└──────────────────────────────────────────────────────┘
```

**Estados de Orden:**
- 📋 **Pendiente:** Recién recibida, esperando confirmación
- ✅ **Confirmada:** Aceptada, en cola para preparación
- 🍳 **En Preparación:** Siendo preparada en cocina
- ✓ **Lista:** Preparada, lista para servir/entregar
- 🚚 **En Delivery:** En camino al cliente
- ✅ **Completada:** Entregada y finalizada
- ❌ **Cancelada:** Cancelada por cliente o restaurante

### Filtrar Órdenes

**Filtros disponibles:**

1. **Por Estado:**
   - Pendientes
   - En preparación
   - Completadas
   - Todas

2. **Por Tipo:**
   - Dine-in (Mesa)
   - Delivery
   - Retiro (Take away)

3. **Por Fecha:**
   - Hoy
   - Ayer
   - Última semana
   - Último mes
   - Rango personalizado

4. **Por Cliente:**
   - Buscar por nombre
   - Buscar por teléfono

### Crear Nueva Orden

1. Clic en **"+ Nueva Orden"**
2. Se abre diálogo de creación:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  CREAR NUEVA ORDEN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─ Información del Cliente ─────────┐
│                                   │
│ Nombre: *                         │
│ ┌───────────────────────────────┐ │
│ │ Juan Pérez                    │ │
│ └───────────────────────────────┘ │
│                                   │
│ Teléfono: *                       │
│ ┌───────────────────────────────┐ │
│ │ +56 9 1234 5678               │ │
│ └───────────────────────────────┘ │
│                                   │
│ Email: (opcional)                 │
│ ┌───────────────────────────────┐ │
│ │ juan@email.com                │ │
│ └───────────────────────────────┘ │
└───────────────────────────────────┘

┌─ Tipo de Orden ───────────────────┐
│                                   │
│ ○ Dine-in (Mesa)                  │
│   Mesa N°: [___]                  │
│                                   │
│ ● Delivery                        │
│   Dirección: *                    │
│   ┌─────────────────────────────┐ │
│   │ Av. Principal 123, Depto 5  │ │
│   └─────────────────────────────┘ │
│                                   │
│ ○ Retiro (Take away)              │
│   Hora estimada: [15:30]          │
└───────────────────────────────────┘

┌─ Items de la Orden ───────────────┐
│                                   │
│ Buscar platillo:                  │
│ ┌───────────────────────────────┐ │
│ │ 🔍 Pizza...                   │ │
│ └───────────────────────────────┘ │
│                                   │
│ Items seleccionados:              │
│                                   │
│ ┌─────────────────────────────┐   │
│ │ 🍕 Pizza Margherita         │   │
│ │    $12.990  x  [2]  $25.980 │   │
│ │    [Quitar]                 │   │
│ └─────────────────────────────┘   │
│                                   │
│ ┌─────────────────────────────┐   │
│ │ 🥤 Coca Cola                │   │
│ │    $1.500   x  [2]  $3.000  │   │
│ │    [Quitar]                 │   │
│ └─────────────────────────────┘   │
│                                   │
│ [+ Agregar Platillo]              │
└───────────────────────────────────┘

┌─ Resumen ─────────────────────────┐
│                                   │
│ Subtotal:         $28.980         │
│ IVA (19%):        $5.506          │
│ Delivery:         $3.000          │
│ ─────────────────────────         │
│ TOTAL:            $37.486         │
│                                   │
└───────────────────────────────────┘

┌─ Notas Adicionales ───────────────┐
│ ┌───────────────────────────────┐ │
│ │ Sin cebolla en la pizza       │ │
│ │                               │ │
│ └───────────────────────────────┘ │
└───────────────────────────────────┘

  [Cancelar]  [Crear Orden]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

3. Completar información del cliente
4. Seleccionar tipo de orden
5. Agregar items del menú
6. Clic en **"Crear Orden"**

**Cálculo Automático:**
- Subtotal se calcula automáticamente
- IVA 19% se agrega
- Delivery fee se suma si es delivery
- Total final se muestra

### Ver Detalles de Orden

Clic en cualquier orden para ver:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ORDEN #ORD-002
  Estado: 🍳 En Preparación
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─ Información del Cliente ─────────┐
│                                   │
│ 👤 María González                 │
│ 📧 maria@email.com                │
│ 📱 +56 9 8765 4321                │
│ 📍 Calle Los Álamos 456           │
│                                   │
└───────────────────────────────────┘

┌─ Detalles de la Orden ────────────┐
│                                   │
│ Tipo: Delivery                    │
│ Fecha: 22 Oct 2025, 14:30         │
│ Tiempo estimado: 30-40 min        │
│                                   │
│ Notas:                            │
│ "Por favor tocar el timbre"       │
│                                   │
└───────────────────────────────────┘

┌─ Items del Pedido ────────────────┐
│                                   │
│ 🍕 Pizza Margherita               │
│    Cantidad: 1                    │
│    Precio: $12.990                │
│    Subtotal: $12.990              │
│                                   │
│ 🥤 Coca Cola 500ml                │
│    Cantidad: 2                    │
│    Precio: $1.500                 │
│    Subtotal: $3.000               │
│                                   │
│ ─────────────────────────         │
│                                   │
│ Subtotal:          $15.990        │
│ IVA (19%):         $3.038         │
│ Delivery Fee:      $3.000         │
│ ─────────────────────────         │
│ TOTAL:             $22.028        │
│                                   │
└───────────────────────────────────┘

  [Cambiar Estado]  [Imprimir]  [✕]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Cambiar Estado de Orden

1. Abrir detalles de orden
2. Clic en **"Cambiar Estado"**
3. Seleccionar nuevo estado:
   - Confirmar
   - Iniciar preparación
   - Marcar como lista
   - Despachar (delivery)
   - Completar
   - Cancelar

**Flujo normal:**
```
📋 Pendiente
    ↓
✅ Confirmada
    ↓
🍳 En Preparación
    ↓
✓ Lista
    ↓
🚚 En Delivery (si aplica)
    ↓
✅ Completada
```

### Imprimir Orden

1. Abrir detalles de orden
2. Clic en **"Imprimir"**
3. Se abre vista previa de impresión
4. Imprimir o guardar como PDF

**Formatos disponibles:**
- Ticket de cocina (80mm)
- Comprobante de cliente (A4)
- Factura (A4)

### Cancelar Orden

⚠️ **Solo disponible para órdenes pendientes o confirmadas**

1. Abrir detalles de orden
2. Clic en **"Cancelar Orden"**
3. Ingresar motivo de cancelación
4. Confirmar cancelación

**Motivos comunes:**
- Cliente solicitó cancelación
- Producto no disponible
- Error en la orden
- Otros (especificar)

---

## Gestión de Reservas

### Ver Reservas

**Vista de Calendario:**
```
┌──────────────────────────────────────┐
│   Octubre 2025                       │
│                                      │
│  L  M  M  J  V  S  D                 │
│        1  2  3  4  5                 │
│  6  7  8 [9] 10 11 12                │
│  13 14 15 16 17 18 19                │
│                                      │
│  Reservas del día (9 Oct):           │
│  ┌────────────────────────────────┐  │
│  │ 19:00 - Mesa 5 - Juan P. (4p) │  │
│  │ 20:00 - Mesa 8 - María G. (2p)│  │
│  │ 21:00 - Mesa 3 - Carlos L. (6p)│ │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

**Vista de Lista:**
```
┌────────────────────────────────────────────────┐
│ Fecha    │ Hora  │ Cliente  │ Mesa │ Personas │
├────────────────────────────────────────────────┤
│ 9 Oct    │ 19:00 │ Juan P.  │ 5    │ 4        │
│ 9 Oct    │ 20:00 │ María G. │ 8    │ 2        │
│ 9 Oct    │ 21:00 │ Carlos L.│ 3    │ 6        │
└────────────────────────────────────────────────┘
```

### Crear Reserva

1. Clic en **"+ Nueva Reserva"**
2. Completar formulario:
   - Nombre del cliente *
   - Teléfono *
   - Email (opcional)
   - Fecha *
   - Hora *
   - Número de personas *
   - Mesa (se asigna automáticamente)
   - Notas especiales

3. Clic en **"Crear Reserva"**

**Sistema de asignación automática:**
- Sugiere mesa disponible según capacidad
- Considera distancia entre mesas
- Optimiza ocupación del restaurante

### Confirmar/Cancelar Reservas

**Confirmar:**
1. Abrir reserva
2. Clic en **"Confirmar"**
3. Se envía SMS/Email de confirmación

**Cancelar:**
1. Abrir reserva
2. Clic en **"Cancelar"**
3. Ingresar motivo
4. Se notifica al cliente

### Gestión de Mesas

**Configurar mesas:**
1. Ir a **Configuración → Mesas**
2. Agregar/editar mesas:
   - Número de mesa
   - Capacidad (personas)
   - Ubicación (interior/terraza/barra)
   - Estado (disponible/ocupada/reservada)

**Layout visual:**
- Arrastrar y soltar mesas
- Cambiar tamaños
- Agrupar zonas

---

## Chat con IA

### Acceder al Chat

1. Clic en **"AI Chat"** en el menú
2. Se abre interfaz de chat

```
┌──────────────────────────────────────┐
│  🤖 Asistente Virtual                │
├──────────────────────────────────────┤
│                                      │
│  Modelo: phi3:mini 🟢 Activo         │
│                                      │
│  ┌────────────────────────────────┐  │
│  │                                │  │
│  │  Bot: ¡Hola! ¿En qué puedo    │  │
│  │       ayudarte hoy?            │  │
│  │                         14:30  │  │
│  │                                │  │
│  │  Tú: ¿Cuántas órdenes hay hoy?│  │
│  │                         14:31  │  │
│  │                                │  │
│  │  Bot: Actualmente hay 15       │  │
│  │       órdenes registradas hoy. │  │
│  │       12 completadas y 3       │  │
│  │       pendientes.              │  │
│  │                         14:31  │  │
│  │                                │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Escribe un mensaje...          │  │
│  └────────────────────────────────┘  │
│                           [Enviar]   │
└──────────────────────────────────────┘
```

### Funciones del Chat con IA

**Consultas que puedes hacer:**

1. **Información de órdenes:**
   - "¿Cuántas órdenes hay hoy?"
   - "Muéstrame las órdenes pendientes"
   - "¿Cuál es el total de ventas?"

2. **Información del menú:**
   - "¿Qué platillos tenemos disponibles?"
   - "¿Cuál es el precio de la pizza?"
   - "¿Hay platillos vegetarianos?"

3. **Estadísticas:**
   - "¿Cuántos clientes atendimos esta semana?"
   - "¿Cuál es el platillo más vendido?"
   - "Muéstrame las ventas del mes"

4. **Recomendaciones:**
   - "¿Qué debería mejorar en el menú?"
   - "¿Cómo puedo optimizar las órdenes?"
   - "Dame consejos para aumentar ventas"

### Cambiar Modelo de IA

1. Clic en selector de modelo
2. Elegir entre:
   - **phi3:mini** (rápido, recomendado)
   - **llama3:8b** (balanceado)
   - **mistral:7b** (conversacional)
   - **gemma:7b** (versátil)

3. Modelo se cambia instantáneamente

**Características por modelo:**
- **phi3:mini:** Respuestas rápidas (2-5s)
- **llama3:8b:** Más contexto (5-10s)
- **mistral:7b:** Muy natural (5-10s)
- **gemma:7b:** Multiuso (5-10s)

---

## Conversaciones

### Ver Historial de Conversaciones

Lista de todas las conversaciones con clientes via chatbot:

```
┌──────────────────────────────────────────────┐
│ Cliente      │ Canal    │ Última Msg │ Estado│
├──────────────────────────────────────────────┤
│ Juan Pérez   │ Web      │ 14:30      │ Abierto│
│ María G.     │ WhatsApp │ 13:15      │ Cerrado│
│ Carlos L.    │ Web      │ 12:00      │ Abierto│
└──────────────────────────────────────────────┘
```

### Responder Conversación

1. Clic en conversación
2. Ver historial completo
3. Escribir respuesta manual (si es necesario)
4. Enviar

**Modo automático vs manual:**
- **Automático:** Bot responde con IA
- **Manual:** Tú respondes directamente
- **Mixto:** Bot sugiere, tú apruebas

### Cerrar Conversación

1. Abrir conversación
2. Clic en **"Cerrar Conversación"**
3. Agregar notas de cierre
4. Confirmar

---

## Configuración

### Información del Restaurante

**Configurar:**
1. Ir a **Configuración → Restaurante**
2. Completar:
   - Nombre del restaurante
   - Dirección completa
   - Teléfono principal
   - Email de contacto
   - Horarios de atención
   - Redes sociales

### Configuración del Chatbot

**Personalizar mensajes:**
1. Ir a **Configuración → Chatbot**
2. Editar:
   - Mensaje de bienvenida
   - Mensajes automáticos
   - Tono de conversación
   - Idioma preferido

**Ejemplo:**
```
Mensaje de bienvenida:
┌────────────────────────────────┐
│ ¡Hola! Bienvenido a            │
│ Restaurante La Delicia.        │
│ ¿En qué puedo ayudarte?        │
└────────────────────────────────┘
```

### Usuarios y Permisos

**Agregar usuario:**
1. Ir a **Configuración → Usuarios**
2. Clic en **"+ Nuevo Usuario"**
3. Completar:
   - Nombre completo
   - Email
   - Contraseña temporal
   - Rol (Admin, Chef, Mesero, etc.)

**Roles disponibles:**
- **Admin:** Acceso total
- **Chef:** Solo órdenes y menú
- **Mesero:** Órdenes y reservas
- **Cajero:** Solo órdenes y ventas

### Notificaciones

**Configurar alertas:**
1. Ir a **Configuración → Notificaciones**
2. Activar/desactivar:
   - Email para nuevas órdenes
   - SMS para reservas
   - WhatsApp para confirmaciones
   - Notificaciones push

---

## Preguntas Frecuentes

### ¿Cómo cambio mi contraseña?

1. Clic en tu nombre (esquina superior derecha)
2. Seleccionar **"Perfil"**
3. Clic en **"Cambiar Contraseña"**
4. Ingresar contraseña actual
5. Ingresar nueva contraseña (2 veces)
6. Guardar

### ¿Puedo acceder desde mi teléfono?

Sí, el panel es 100% responsive. Accede desde cualquier navegador móvil.

### ¿Cómo exporto mis datos?

1. Ir a **Configuración → Exportar Datos**
2. Seleccionar qué exportar (órdenes, clientes, menú)
3. Elegir formato (CSV, Excel, JSON)
4. Descargar

### ¿Qué pasa si olvido mi contraseña?

1. Ir a la página de login
2. Clic en **"¿Olvidaste tu contraseña?"**
3. Ingresar tu email
4. Revisar bandeja de entrada
5. Seguir instrucciones del email

### ¿Puedo personalizar los colores del sistema?

Actualmente no, pero está planificado para futuras versiones.

### ¿Cómo contacto soporte técnico?

- **Email:** soporte@dysadev.com
- **WhatsApp:** +56 9 XXXX XXXX
- **Horario:** Lun-Vie 9:00-18:00

### ¿Los datos están respaldados?

Sí, el sistema hace backups automáticos cada 24 horas.

### ¿Puedo integrar con otros sistemas?

Sí, mediante nuestra API REST. Ver [documentación API](./API.md).

---

## Atajos de Teclado

### Globales
- `Ctrl + K`: Búsqueda rápida
- `Ctrl + N`: Nueva orden
- `Ctrl + M`: Ver menú
- `Ctrl + ,`: Configuración

### En Órdenes
- `Ctrl + Enter`: Confirmar orden
- `Ctrl + P`: Imprimir orden
- `Escape`: Cerrar diálogo

### En Menú
- `Ctrl + E`: Editar platillo
- `Ctrl + D`: Duplicar platillo
- `Delete`: Eliminar platillo (con confirmación)

---

## Glosario

- **Dine-in:** Orden para consumir en el restaurante
- **Delivery:** Orden para entrega a domicilio
- **Take away:** Orden para retirar en el local
- **Chatbot:** Asistente virtual automatizado
- **Widget:** Componente instalable en sitio web
- **IVA:** Impuesto al Valor Agregado (19% en Chile)
- **API:** Interfaz de programación de aplicaciones

---

**¿Necesitas más ayuda?**

Consulta la [Guía de Troubleshooting](./TROUBLESHOOTING.md) o contacta a soporte.
