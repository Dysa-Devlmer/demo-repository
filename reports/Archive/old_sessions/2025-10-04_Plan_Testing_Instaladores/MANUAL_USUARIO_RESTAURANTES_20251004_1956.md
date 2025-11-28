# MANUAL DE USUARIO - CHATBOTDYSA ENTERPRISE
## Guía Completa para Restaurantes

---

**📅 Fecha:** 2025-10-04
**⏰ Hora creación:** 19:56:00
**📖 Versión:** 1.0
**👥 Audiencia:** Dueños y personal de restaurantes
**📄 Páginas:** ~35

---

## 📑 TABLA DE CONTENIDOS

1. [Introducción](#1-introducción)
2. [Primeros Pasos](#2-primeros-pasos)
3. [Panel de Administración](#3-panel-de-administración)
4. [Gestión del Menú](#4-gestión-del-menú)
5. [Gestión de Pedidos](#5-gestión-de-pedidos)
6. [Gestión de Reservas](#6-gestión-de-reservas)
7. [Gestión de Clientes](#7-gestión-de-clientes)
8. [Chatbot IA](#8-chatbot-ia)
9. [Landing Page](#9-landing-page)
10. [Reportes y Analytics](#10-reportes-y-analytics)
11. [Configuración](#11-configuración)
12. [Preguntas Frecuentes](#12-preguntas-frecuentes)
13. [Solución de Problemas](#13-solución-de-problemas)
14. [Soporte Técnico](#14-soporte-técnico)

---

## 1. INTRODUCCIÓN

### 1.1 ¿Qué es ChatBotDysa?

ChatBotDysa Enterprise es un sistema completo de gestión para restaurantes que integra:

- **Panel de Administración**: Gestiona menú, pedidos, reservas y clientes
- **Landing Page**: Presencia web profesional para tu restaurante
- **Chatbot IA**: Asistente virtual inteligente para atención al cliente 24/7
- **Backend API**: Sistema robusto para procesar todas las operaciones

### 1.2 Beneficios para tu Restaurante

✅ **Automatización**: Reduce tareas manuales y errores humanos
✅ **Disponibilidad 24/7**: El chatbot atiende consultas a cualquier hora
✅ **Presencia Digital**: Landing page profesional siempre actualizada
✅ **Análisis de Datos**: Reportes y métricas para tomar mejores decisiones
✅ **Ahorro de Tiempo**: Gestión centralizada de todas las operaciones
✅ **Mejor Experiencia**: Clientes satisfechos con respuestas rápidas

### 1.3 Requisitos del Sistema

**Hardware mínimo:**
- Procesador: Intel Core i3 o equivalente
- RAM: 4 GB (recomendado 8 GB)
- Disco: 10 GB de espacio libre
- Conexión a Internet

**Software requerido:**
- Docker Desktop (instalado automáticamente en algunos casos)
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Sistema Operativo: Windows 10+, macOS 10.15+, o Linux Ubuntu 20.04+

---

## 2. PRIMEROS PASOS

### 2.1 Acceso al Sistema

**URL del Panel de Administración:**
```
http://localhost:7001
```

**Credenciales iniciales:**
- **Usuario:** `admin@restaurante.com`
- **Contraseña:** `admin123`

⚠️ **IMPORTANTE**: Cambia la contraseña inmediatamente después del primer acceso.

### 2.2 Primer Inicio de Sesión

1. Abre tu navegador web
2. Navega a `http://localhost:7001`
3. Verás la pantalla de inicio de sesión
4. Ingresa el email: `admin@restaurante.com`
5. Ingresa la contraseña: `admin123`
6. Click en "Iniciar Sesión"

**Cambiar Contraseña:**

1. Click en tu nombre (esquina superior derecha)
2. Selecciona "Mi Perfil"
3. Click en "Cambiar Contraseña"
4. Ingresa la contraseña actual
5. Ingresa la nueva contraseña (mínimo 8 caracteres)
6. Confirma la nueva contraseña
7. Click en "Guardar Cambios"

### 2.3 Tour Rápido del Dashboard

Al iniciar sesión verás el **Dashboard Principal** con:

**Panel izquierdo (Menú de navegación):**
- Dashboard
- Menú
- Pedidos
- Reservas
- Clientes
- Analytics
- Configuración

**Panel central (Contenido principal):**
- Estadísticas del día
- Gráficos de ventas
- Pedidos recientes
- Reservas próximas

**Panel superior (Barra de navegación):**
- Logo del restaurante
- Buscador rápido
- Notificaciones
- Perfil de usuario

---

## 3. PANEL DE ADMINISTRACIÓN

### 3.1 Dashboard Principal

El dashboard muestra información en tiempo real:

#### Tarjetas de Estadísticas

**Ventas del Día:**
- Monto total vendido hoy
- Comparación con ayer (% de cambio)
- Gráfico de evolución por hora

**Pedidos:**
- Total de pedidos del día
- Pendientes / En proceso / Completados
- Promedio de tiempo de preparación

**Reservas:**
- Reservas confirmadas para hoy
- Capacidad ocupada (% de mesas)
- Próximas reservas (siguiente 2 horas)

**Clientes:**
- Nuevos clientes del mes
- Total de clientes activos
- Cliente más frecuente del mes

#### Gráficos

**Ventas Semanales:**
- Gráfico de barras con ventas de los últimos 7 días
- Hover para ver detalles por día
- Click para drill-down en detalles

**Productos Más Vendidos:**
- Top 5 productos del día/semana/mes
- Cantidad vendida de cada uno
- Porcentaje del total de ventas

**Horarios de Mayor Actividad:**
- Heatmap mostrando horas pico
- Ayuda a planificar personal y producción
- Filtrable por día de la semana

### 3.2 Navegación

**Menú Lateral:**

```
📊 Dashboard       - Vista general y estadísticas
🍽️  Menú           - Gestión de productos
📦 Pedidos         - Administrar pedidos
📅 Reservas        - Gestión de mesas
👥 Clientes        - Base de datos clientes
📈 Analytics       - Reportes detallados
⚙️  Configuración  - Ajustes del sistema
```

**Accesos Rápidos:**

- **Buscador Global** (Ctrl+K): Busca productos, pedidos, clientes
- **Nuevo Pedido** (botón +): Crear pedido manual rápidamente
- **Notificaciones** (campana): Alertas de pedidos, reservas, sistema

---

## 4. GESTIÓN DEL MENÚ

### 4.1 Ver Menú Actual

**Acceso:** Dashboard → Menú

Verás una lista de todos los productos organizados por categorías:

- **Entradas**
- **Platos Principales**
- **Postres**
- **Bebidas**
- **Especiales del Día**

**Vista de Lista:**
- Nombre del producto
- Precio
- Categoría
- Estado (Disponible / Agotado)
- Acciones (Editar / Eliminar)

**Vista de Tarjetas:**
- Imagen del producto
- Nombre y descripción
- Precio destacado
- Etiquetas (Nuevo, Popular, Vegetariano, etc.)

### 4.2 Agregar Nuevo Producto

1. Click en "Nuevo Producto" (botón superior derecho)
2. Completa el formulario:

**Información Básica:**
- **Nombre**: Ej. "Pizza Margarita Familiar"
- **Descripción**: Descripción apetitosa del producto
- **Categoría**: Selecciona del dropdown
- **Precio**: Ingresa monto (sin símbolo de moneda)
- **Tiempo de preparación**: En minutos

**Imagen:**
- Click en "Subir Imagen"
- Selecciona archivo (JPG, PNG, max 5MB)
- Recorta/ajusta si es necesario
- Click en "Confirmar"

**Opciones Adicionales:**
- **Disponible**: Toggle para activar/desactivar
- **Destacado**: Marca para mostrar en home
- **Vegetariano/Vegano**: Etiquetas especiales
- **Alérgenos**: Lista de ingredientes alergénicos

**Extras y Modificadores:**
- Agregar opciones extras (ej. "Agregar queso extra: +$2")
- Configurar tamaños (ej. "Pequeña / Mediana / Grande")
- Definir modificadores (ej. "Sin cebolla")

3. Click en "Guardar Producto"

### 4.3 Editar Producto Existente

1. Busca el producto en la lista
2. Click en ícono de "Editar" (lápiz)
3. Modifica los campos necesarios
4. Click en "Guardar Cambios"

### 4.4 Eliminar Producto

1. Busca el producto en la lista
2. Click en ícono de "Eliminar" (papelera)
3. Confirma la eliminación en el modal
4. El producto se archiva (no se borra permanentemente)

⚠️ **Nota**: Los productos eliminados no se muestran en el menú pero se mantienen en el historial para reportes.

### 4.5 Gestión de Categorías

**Crear Nueva Categoría:**
1. Click en "Categorías" (tab superior)
2. Click en "Nueva Categoría"
3. Ingresa nombre y descripción
4. Selecciona ícono
5. Define orden de aparición
6. Click en "Guardar"

**Reordenar Categorías:**
- Drag and drop en la lista de categorías
- El orden se refleja automáticamente en el menú público

### 4.6 Marcar Productos como Agotados

**Método Rápido:**
1. En la lista de productos, click en el toggle "Disponible"
2. El producto se marca como "Agotado" inmediatamente
3. Desaparece del menú público pero permanece en admin

**Método Detallado:**
1. Editar producto
2. Desmarcar checkbox "Disponible"
3. Opcionalmente agregar nota: "Agotado hasta [fecha]"
4. Guardar cambios

---

## 5. GESTIÓN DE PEDIDOS

### 5.1 Ver Pedidos Activos

**Acceso:** Dashboard → Pedidos

**Vista en Tiempo Real:**

Tres columnas representando estados:

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  PENDIENTES │  │ EN PROCESO  │  │ COMPLETADOS │
│             │  │             │  │             │
│ Pedido #123 │  │ Pedido #120 │  │ Pedido #118 │
│ Pedido #122 │  │ Pedido #119 │  │ Pedido #117 │
│ Pedido #121 │  │             │  │ Pedido #116 │
└─────────────┘  └─────────────┘  └─────────────┘
```

**Información de cada Pedido:**
- Número de pedido
- Cliente (nombre y teléfono)
- Items y cantidades
- Total del pedido
- Tiempo transcurrido desde creación
- Método de entrega (Local / Delivery / Takeout)

### 5.2 Procesar un Pedido

**Flujo Normal:**

1. **Pedido Nuevo** → Se muestra en columna "Pendientes"
   - Suena notificación
   - Se muestra toast en pantalla
   - Email/SMS al cliente confirmando recepción

2. **Aceptar Pedido**:
   - Click en pedido
   - Revisar detalles
   - Click en "Aceptar Pedido"
   - Se mueve a columna "En Proceso"
   - Notificación al cliente

3. **Marcar como Listo**:
   - Click en "Marcar como Listo"
   - Se mueve a columna "Listos para Entregar"
   - Notificación al cliente (si es delivery)

4. **Completar Pedido**:
   - Click en "Entregar/Completar"
   - Confirmar entrega
   - Se mueve a columna "Completados"
   - Se archiva después de 24 horas

**Rechazar Pedido:**
- Click en pedido
- Click en "Rechazar"
- Seleccionar motivo (Fuera de horario / Producto agotado / Otro)
- Agregar nota opcional
- Confirmar rechazo
- Notificación automática al cliente

### 5.3 Crear Pedido Manual

Para pedidos telefónicos o presenciales:

1. Click en "Nuevo Pedido" (+)
2. **Seleccionar Cliente**:
   - Buscar cliente existente, o
   - Click en "Cliente Nuevo" e ingresa datos

3. **Agregar Productos**:
   - Busca productos por nombre o categoría
   - Click en producto para agregarlo
   - Ajusta cantidad (+/-)
   - Agrega notas especiales si es necesario

4. **Configurar Entrega**:
   - Tipo: Local / Delivery / Takeout
   - Si es delivery: Agregar dirección
   - Tiempo estimado de entrega

5. **Forma de Pago**:
   - Efectivo
   - Tarjeta
   - Transferencia
   - Otro

6. **Confirmar Pedido**:
   - Revisar resumen
   - Click en "Crear Pedido"
   - Se genera número de pedido
   - Se agrega a cola de pendientes

### 5.4 Filtros y Búsqueda

**Filtrar por:**
- Estado (Pendiente / En proceso / Completado)
- Fecha (Hoy / Esta semana / Personalizado)
- Tipo de entrega (Local / Delivery / Takeout)
- Método de pago

**Buscar:**
- Por número de pedido
- Por nombre de cliente
- Por teléfono
- Por productos incluidos

### 5.5 Historial de Pedidos

**Acceso:** Pedidos → Historial

Ver todos los pedidos históricos con:
- Exportar a Excel/PDF
- Filtros avanzados
- Gráficos de tendencias
- Comparaciones por períodos

---

## 6. GESTIÓN DE RESERVAS

### 6.1 Ver Reservas

**Acceso:** Dashboard → Reservas

**Vista de Calendario:**
- Calendario mensual con reservas marcadas
- Click en fecha para ver detalles del día
- Colores indican estado (Confirmada / Pendiente / Cancelada)

**Vista de Lista:**
- Lista de reservas próximas
- Filtros por fecha, estado, número de personas
- Búsqueda por nombre o teléfono

### 6.2 Crear Nueva Reserva

1. Click en "Nueva Reserva"
2. **Información del Cliente**:
   - Nombre completo
   - Teléfono
   - Email (opcional)
   - Cliente existente o nuevo

3. **Detalles de la Reserva**:
   - Fecha
   - Hora
   - Número de personas
   - Ocasión especial (opcional)
   - Preferencias/Notas

4. **Selección de Mesa**:
   - Sistema sugiere mesa apropiada según capacidad
   - Puedes seleccionar mesa específica
   - Verifica disponibilidad en tiempo real

5. **Confirmar**:
   - Revisar detalles
   - Click en "Crear Reserva"
   - Se envía confirmación automática al cliente

### 6.3 Gestión de Mesas

**Configuración de Mesas:**

1. Configuración → Mesas
2. **Agregar Mesa**:
   - Número/Nombre de mesa
   - Capacidad (número de personas)
   - Ubicación (Interior / Terraza / VIP)
   - Estado (Disponible / Ocupada / Reservada)

3. **Mapa de Mesas** (opcional):
   - Drag and drop para ubicar mesas
   - Vista visual del restaurante
   - Estados en tiempo real

### 6.4 Confirmar/Cancelar Reservas

**Confirmar:**
- Click en reserva pendiente
- Click en "Confirmar"
- Se envía confirmación al cliente

**Cancelar:**
- Click en reserva
- Click en "Cancelar"
- Seleccionar motivo
- Agregar nota (opcional)
- Confirmar cancelación
- Notificación automática al cliente

### 6.5 Check-in de Reservas

Cuando el cliente llega:

1. Busca la reserva del día
2. Click en "Check-in"
3. Confirma llegada del cliente
4. Asigna mesa si aún no está asignada
5. Reserva cambia a estado "En curso"
6. Cuando el cliente se va, click en "Finalizar"

---

## 7. GESTIÓN DE CLIENTES

### 7.1 Base de Datos de Clientes

**Acceso:** Dashboard → Clientes

Ver lista completa de clientes con:
- Nombre
- Teléfono
- Email
- Total de pedidos
- Fecha de último pedido
- Monto total gastado

### 7.2 Ver Detalles de Cliente

Click en cualquier cliente para ver:

**Información Personal:**
- Nombre completo
- Teléfono(s)
- Email
- Dirección(es) de entrega
- Fecha de registro

**Historial de Pedidos:**
- Lista de todos los pedidos
- Productos más pedidos
- Frecuencia de compra
- Ticket promedio

**Historial de Reservas:**
- Reservas pasadas
- Reservas futuras
- Tasa de cumplimiento (% que asistió)

**Preferencias:**
- Platos favoritos
- Restricciones alimentarias
- Notas especiales

### 7.3 Agregar Cliente Manualmente

1. Click en "Nuevo Cliente"
2. Completa el formulario:
   - Nombre y apellido
   - Teléfono (requerido)
   - Email
   - Dirección
   - Notas/preferencias
3. Click en "Guardar Cliente"

### 7.4 Editar/Eliminar Cliente

**Editar:**
- Click en cliente
- Click en "Editar"
- Modifica campos
- Guardar cambios

**Eliminar:**
- Click en cliente
- Click en "Eliminar"
- Confirmar eliminación
- El cliente se archiva (mantiene historial)

### 7.5 Segmentación de Clientes

**Crear Segmentos:**
- Clientes VIP (más de $X en compras)
- Clientes frecuentes (más de X pedidos/mes)
- Nuevos clientes (menos de 30 días)
- Inactivos (sin pedidos en 90+ días)

**Usar Segmentos:**
- Enviar promociones dirigidas
- Analizar comportamiento
- Crear campañas de re-engagement

---

## 8. CHATBOT IA

### 8.1 Funcionamiento del Chatbot

El chatbot de ChatBotDysa está disponible 24/7 y puede:

✅ Responder preguntas sobre el menú
✅ Tomar pedidos
✅ Gestionar reservas
✅ Consultar horarios y ubicación
✅ Ofrecer recomendaciones personalizadas
✅ Responder preguntas frecuentes

### 8.2 Configurar el Chatbot

**Acceso:** Configuración → Chatbot

**Personalización:**

1. **Información Básica**:
   - Nombre del bot (ej. "AsistenteBot")
   - Saludo inicial
   - Mensaje de bienvenida
   - Idioma principal

2. **Respuestas Automáticas**:
   - Horarios de atención
   - Dirección
   - Teléfonos de contacto
   - Redes sociales
   - Políticas de envío

3. **Tono y Estilo**:
   - Formal / Casual
   - Uso de emojis (sí/no)
   - Longitud de respuestas

4. **Integraciones**:
   - WhatsApp Business
   - Facebook Messenger
   - Instagram DM
   - Widget de sitio web

### 8.3 Entrenar al Chatbot

**Agregar Preguntas Frecuentes:**

1. Configuración → Chatbot → FAQ
2. Click en "Nueva FAQ"
3. **Pregunta**: "¿Cuál es el horario de atención?"
4. **Respuesta**: "Abrimos de lunes a domingo de 11:00 a 23:00"
5. **Variaciones**: Agrega formas alternativas de preguntar
6. Click en "Guardar"

**Ejemplos de FAQ importantes:**
- Horarios
- Formas de pago
- Zona de delivery
- Tiempo de entrega
- Políticas de cancelación
- Menú del día
- Promociones vigentes

### 8.4 Monitorear Conversaciones

**Acceso:** Analytics → Conversaciones Chatbot

Ver:
- Total de conversaciones del día/mes
- Preguntas más frecuentes
- Tasa de resolución (% resueltas sin intervención humana)
- Conversaciones que requirieron escalamiento
- Pedidos generados por el bot
- Reservas generadas por el bot

**Exportar Conversaciones:**
- Útil para mejorar respuestas
- Identificar nuevas FAQ
- Entrenamiento adicional del modelo

### 8.5 Intervención Manual

Si el bot no puede resolver una consulta:

1. El cliente recibe: "Te estoy transfiriendo con un agente humano"
2. Aparece notificación en el panel admin
3. Un operador toma la conversación
4. El operador continúa el chat en vivo
5. Se registra el historial completo

---

## 9. LANDING PAGE

### 9.1 Acceder a la Landing Page

**URL pública:**
```
http://localhost:3004
```

(En producción será tu dominio personalizado: `www.turestaurante.com`)

### 9.2 Personalizar Landing Page

**Acceso:** Configuración → Landing Page

**Secciones Configurables:**

**1. Header:**
- Logo del restaurante (subir imagen)
- Nombre del restaurante
- Slogan/tagline
- Menú de navegación

**2. Hero Section:**
- Imagen principal destacada
- Título principal
- Subtítulo
- Call-to-action (ej. "Ver Menú", "Ordenar Ahora")

**3. Sobre Nosotros:**
- Historia del restaurante
- Misión y valores
- Imágenes del local
- Equipo/chefs

**4. Menú Destacado:**
- Productos más populares
- Platos del día
- Promociones

**5. Galería:**
- Fotos de platos
- Fotos del ambiente
- Eventos especiales

**6. Testimonios:**
- Reseñas de clientes
- Calificaciones
- Fotos de clientes (con permiso)

**7. Contacto:**
- Dirección
- Teléfono(s)
- Email
- Redes sociales
- Mapa integrado (Google Maps)
- Formulario de contacto

**8. Footer:**
- Enlaces rápidos
- Horarios
- Políticas
- Derechos reservados

### 9.3 Temas y Estilos

**Seleccionar Tema:**
1. Configuración → Landing Page → Apariencia
2. Selecciona de temas prediseñados:
   - Elegante (Fine dining)
   - Casual (Fast casual)
   - Moderno (Fusion)
   - Tradicional (Comida regional)

**Personalizar Colores:**
- Color primario
- Color secundario
- Color de acentos
- Color de texto
- Color de fondo

**Tipografía:**
- Fuente de títulos
- Fuente de texto
- Tamaños de fuente

### 9.4 Integración de Chatbot

El chatbot aparece automáticamente en la landing page como:

- **Widget flotante** (esquina inferior derecha)
- Click para abrir chat
- Notificación de bienvenida
- Disponible 24/7

---

## 10. REPORTES Y ANALYTICS

### 10.1 Dashboard de Analytics

**Acceso:** Dashboard → Analytics

**Métricas Principales:**

**Ventas:**
- Ventas del día vs. objetivo
- Ventas de la semana
- Ventas del mes
- Comparación con período anterior
- Tendencias

**Pedidos:**
- Total de pedidos
- Pedidos por canal (App / Web / Teléfono / Presencial)
- Ticket promedio
- Productos por pedido

**Clientes:**
- Nuevos clientes
- Clientes recurrentes
- Tasa de retención
- Lifetime value promedio

**Performance:**
- Tiempo promedio de preparación
- Tiempo promedio de entrega
- Tasa de satisfacción
- Tasa de cancelación

### 10.2 Reportes Disponibles

**Reporte de Ventas:**
- Por día/semana/mes/año
- Por categoría de producto
- Por canal de venta
- Por forma de pago
- Exportable a Excel/PDF

**Reporte de Productos:**
- Más vendidos
- Menos vendidos
- Tendencias de popularidad
- Análisis de rentabilidad

**Reporte de Clientes:**
- Clientes top por gasto
- Clientes top por frecuencia
- Nuevos vs. recurrentes
- Segmentación demográfica

**Reporte de Horarios:**
- Horas pico
- Días de mayor actividad
- Estacionalidad
- Optimización de personal

### 10.3 Exportar Reportes

1. Selecciona tipo de reporte
2. Configura filtros (fechas, categorías, etc.)
3. Click en "Generar Reporte"
4. Selecciona formato:
   - Excel (.xlsx)
   - PDF
   - CSV
5. Click en "Descargar"

### 10.4 Programar Reportes Automáticos

**Envío de Reportes por Email:**

1. Analytics → Reportes Programados
2. Click en "Nuevo Reporte Programado"
3. Configura:
   - Tipo de reporte
   - Frecuencia (Diario / Semanal / Mensual)
   - Día/Hora de envío
   - Destinatarios (emails)
4. Click en "Guardar"

Los reportes se enviarán automáticamente según la programación.

---

## 11. CONFIGURACIÓN

### 11.1 Datos del Restaurante

**Acceso:** Configuración → General

**Información Básica:**
- Nombre del restaurante
- Nombre legal/comercial
- RUT o identificación fiscal
- Dirección principal
- Teléfonos
- Email de contacto
- Sitio web
- Redes sociales

**Horarios de Atención:**
- Por día de la semana
- Horario de apertura
- Horario de cierre
- Horarios especiales (feriados)
- Días cerrados

### 11.2 Usuarios y Permisos

**Acceso:** Configuración → Usuarios

**Roles Disponibles:**

1. **Administrador**:
   - Acceso completo al sistema
   - Puede crear/editar/eliminar todo
   - Acceso a configuración
   - Acceso a reportes financieros

2. **Gerente**:
   - Gestión de pedidos y reservas
   - Gestión de menú
   - Ver reportes
   - Sin acceso a configuración crítica

3. **Mesero**:
   - Tomar pedidos
   - Gestionar reservas
   - Ver menú
   - Sin acceso a reportes financieros

4. **Cocina**:
   - Ver pedidos pendientes
   - Marcar pedidos como listos
   - Sin acceso a precios ni reportes

**Crear Nuevo Usuario:**
1. Click en "Nuevo Usuario"
2. Completa:
   - Nombre completo
   - Email
   - Contraseña temporal
   - Rol
   - Permisos adicionales (opcional)
3. Click en "Crear Usuario"
4. El usuario recibirá email con credenciales

### 11.3 Métodos de Pago

**Acceso:** Configuración → Pagos

**Configurar:**
- Efectivo (siempre disponible)
- Tarjeta de crédito/débito
- Transferencia bancaria
- Otros métodos personalizados

**Integración de Pasarelas:**
- Mercado Pago
- PayPal
- Stripe
- Transbank (Chile)
- Otras pasarelas locales

### 11.4 Zonas de Delivery

**Acceso:** Configuración → Delivery

**Configurar Zonas:**
1. Click en "Nueva Zona"
2. Nombre de la zona (ej. "Centro")
3. Dibuja área en el mapa, o
4. Ingresa direcciones límite
5. Costo de envío para esta zona
6. Tiempo estimado de entrega
7. Mínimo de compra (opcional)
8. Click en "Guardar"

**Zonas de Ejemplo:**
- Centro: $2.000, 30 min
- Periferia: $3.500, 45 min
- Fuera de ciudad: No disponible

### 11.5 Notificaciones

**Acceso:** Configuración → Notificaciones

**Configurar cuándo enviar notificaciones:**

**Al Cliente:**
- Pedido recibido
- Pedido aceptado
- Pedido en camino
- Pedido entregado
- Reserva confirmada
- Recordatorio de reserva (2 horas antes)

**Al Restaurante:**
- Nuevo pedido
- Nuevo cliente registrado
- Pedido retrasado
- Nueva reserva
- Objetivo de ventas alcanzado

**Canales:**
- Email
- SMS (requiere integración)
- Push notifications (app móvil)
- WhatsApp Business

### 11.6 Respaldos y Seguridad

**Respaldos Automáticos:**
- Diarios (a las 3:00 AM)
- Semanales (domingos)
- Mensuales (primer día del mes)

**Descargar Respaldo Manual:**
1. Configuración → Respaldos
2. Click en "Crear Respaldo Ahora"
3. Espera a que se genere
4. Click en "Descargar"

**Restaurar desde Respaldo:**
1. Configuración → Respaldos
2. Selecciona respaldo de la lista
3. Click en "Restaurar"
4. Confirma acción
5. Sistema se reinicia con datos restaurados

⚠️ **IMPORTANTE**: Restaurar un respaldo sobrescribirá todos los datos actuales.

---

## 12. PREGUNTAS FRECUENTES

### 12.1 General

**P: ¿Puedo usar ChatBotDysa en múltiples dispositivos?**
R: Sí, puedes acceder desde cualquier computadora o tablet con navegador web en la misma red local.

**P: ¿Los datos están seguros?**
R: Sí, todos los datos se almacenan localmente en tu computadora. Se realizan respaldos automáticos diarios.

**P: ¿Necesito Internet?**
R: Para funcionamiento básico no es necesario. Para chatbot IA, notificaciones y actualizaciones sí se requiere Internet.

**P: ¿Puedo personalizar el sistema?**
R: Sí, la mayoría de los elementos son personalizables: colores, logos, textos, etc.

### 12.2 Menú

**P: ¿Cuántos productos puedo agregar?**
R: No hay límite. Puedes agregar tantos productos como necesites.

**P: ¿Puedo tener diferentes menús para diferentes horarios?**
R: Sí, puedes configurar menús por horario (desayuno, almuerzo, cena) o días especiales.

**P: ¿Cómo actualizo precios masivamente?**
R: Analytics → Menú → Actualización Masiva → Selecciona productos → Aplica % de aumento/descuento.

### 12.3 Pedidos

**P: ¿Los pedidos del chatbot se agregan automáticamente?**
R: Sí, aparecen en la cola de pendientes igual que los pedidos manuales.

**P: ¿Puedo modificar un pedido después de creado?**
R: Sí, siempre que esté en estado "Pendiente". Si está "En proceso", consulta con cocina primero.

**P: ¿Cómo cancelo un pedido?**
R: Click en el pedido → "Cancelar" → Selecciona motivo → Confirma.

### 12.4 Reservas

**P: ¿Cuánto tiempo antes pueden reservar?**
R: Configurable. Por defecto: desde 2 horas hasta 60 días de anticipación.

**P: ¿El sistema bloquea doble reserva de una mesa?**
R: Sí, automáticamente. No permite dos reservas de la misma mesa en horarios superpuestos.

**P: ¿Puedo poner una mesa en mantenimiento?**
R: Sí. Configuración → Mesas → Selecciona mesa → Estado: "Mantenimiento".

### 12.5 Chatbot

**P: ¿El chatbot funciona en español?**
R: Sí, soporta español y otros idiomas configurables.

**P: ¿Puedo desactivar el chatbot temporalmente?**
R: Sí. Configuración → Chatbot → Toggle "Activo/Inactivo".

**P: ¿El chatbot puede tomar pagos?**
R: No directamente, pero puede recolectar el pedido y dirigir al cliente a completar el pago.

---

## 13. SOLUCIÓN DE PROBLEMAS

### 13.1 No puedo acceder al sistema

**Problema:** No carga la página de login.

**Soluciones:**
1. Verifica que Docker Desktop esté corriendo (ícono en la barra de tareas)
2. Espera 2-3 minutos después de iniciar Docker
3. Verifica la URL: debe ser exactamente `http://localhost:7001`
4. Prueba en modo incógnito/privado del navegador
5. Limpia caché del navegador (Ctrl+Shift+Del)

### 13.2 Olvidé mi contraseña

**Solución:**
1. En la pantalla de login, click en "¿Olvidaste tu contraseña?"
2. Ingresa tu email
3. Recibirás un link de reseteo
4. Click en el link y crea nueva contraseña

**Solución alternativa (admin):**
1. Accede con cuenta de administrador
2. Configuración → Usuarios
3. Busca el usuario
4. Click en "Resetear Contraseña"
5. Se generará contraseña temporal y se enviará al usuario

### 13.3 El sistema está lento

**Causas y Soluciones:**

1. **Muchas imágenes sin optimizar**:
   - Reduce tamaño de imágenes antes de subirlas
   - Usa formatos JPG para fotos, PNG para logos

2. **Muchos pedidos activos**:
   - Completa pedidos antiguos
   - Archiva pedidos viejos (más de 7 días)

3. **Computadora con pocos recursos**:
   - Cierra aplicaciones no necesarias
   - Verifica tener al menos 4 GB RAM disponible
   - Considera aumentar RAM a 8 GB

4. **Docker necesita más recursos**:
   - Docker Desktop → Settings → Resources
   - Aumenta RAM asignada a Docker (mínimo 4 GB)
   - Aumenta CPU cores (mínimo 2)

### 13.4 No se muestran las imágenes

**Soluciones:**
1. Verifica formato de imagen (JPG, PNG, WEBP)
2. Verifica tamaño máximo (5 MB)
3. Sube la imagen nuevamente
4. Limpia caché del navegador
5. Prueba en otro navegador

### 13.5 El chatbot no responde

**Soluciones:**
1. Verifica conexión a Internet (el chatbot requiere IA online)
2. Configuración → Chatbot → Verifica que esté "Activo"
3. Verifica que el servicio Ollama esté corriendo (Docker Desktop)
4. Reinicia el contenedor chatbotdysa-ollama

### 13.6 Error al generar reportes

**Soluciones:**
1. Verifica que el rango de fechas sea válido
2. Reduce el rango de fechas (máximo 1 año por reporte)
3. Espera a que termine si está procesando
4. Limpia caché y vuelve a intentar
5. Exporta en formato CSV si Excel falla

---

## 14. SOPORTE TÉCNICO

### 14.1 Canales de Soporte

**Email:** support@chatbotdysa.com
- Tiempo de respuesta: 24 horas hábiles
- Incluye capturas de pantalla y descripción detallada

**Chat en Vivo:** www.chatbotdysa.com/soporte
- Lunes a Viernes: 9:00 - 18:00
- Respuesta inmediata

**WhatsApp Business:** +56 9 XXXX XXXX
- Lunes a Viernes: 9:00 - 18:00
- Solo consultas urgentes

**Centro de Ayuda:** help.chatbotdysa.com
- Artículos y tutoriales
- Videos explicativos
- Disponible 24/7

### 14.2 Información a Proveer al Reportar un Problema

Para ayudarte más rápido, incluye:

1. **Descripción del problema**: ¿Qué intentabas hacer? ¿Qué sucedió?
2. **Pasos para reproducir**: ¿Cómo se reproduce el error?
3. **Capturas de pantalla**: Del error o comportamiento inesperado
4. **Información del sistema**:
   - Sistema operativo (Windows/Mac/Linux)
   - Versión de ChatBotDysa (en Configuración → Acerca de)
   - Navegador utilizado
5. **Logs** (si aplica):
   - Docker Desktop → Containers → chatbotdysa-backend → Logs
   - Copia los últimos 50 líneas

### 14.3 Actualizaciones

**Verificar Actualizaciones:**
1. Configuración → Actualizaciones
2. El sistema verifica automáticamente cada semana
3. Si hay actualización disponible, aparecerá notificación

**Instalar Actualización:**
1. Configuración → Actualizaciones
2. Click en "Descargar Actualización"
3. Una vez descargada, click en "Instalar"
4. El sistema se reiniciará automáticamente
5. Proceso toma ~5-10 minutos

⚠️ **Recomendación**: Instala actualizaciones fuera de horarios pico.

### 14.4 Capacitación Adicional

**Sesiones de Onboarding:**
- 2 horas de capacitación inicial incluidas
- Personalizada según tu restaurante
- Presencial u online

**Videos Tutoriales:**
- Biblioteca de videos cortos (3-5 min)
- Cada funcionalidad explicada
- Disponible en YouTube y Centro de Ayuda

**Webinars Mensuales:**
- Tips y mejores prácticas
- Nuevas funcionalidades
- Q&A en vivo
- Gratis para todos los usuarios

### 14.5 Comunidad

**Foro de Usuarios:** community.chatbotdysa.com
- Comparte experiencias
- Aprende de otros restaurantes
- Sugerencias de mejoras

**Grupo de Facebook:** ChatBotDysa Restaurantes
- Comunidad de propietarios
- Intercambio de ideas
- Anuncios de actualizaciones

---

## APÉNDICES

### A. Glosario de Términos

**Backend**: Servidor que procesa la lógica del negocio
**Chatbot**: Asistente virtual automatizado
**Dashboard**: Panel principal con vista general
**Docker**: Plataforma de contenedores
**Landing Page**: Página web pública del restaurante
**Localhost**: Dirección local de tu computadora (127.0.0.1)
**Widget**: Componente visual pequeño (ej. chat flotante)

### B. Atajos de Teclado

```
Ctrl+K       - Búsqueda global
Ctrl+N       - Nuevo pedido
Ctrl+R       - Actualizar vista
Ctrl+S       - Guardar cambios
Esc          - Cerrar modal
F5           - Recargar página
```

### C. Límites y Capacidades

```
Productos en menú: Ilimitados
Pedidos simultáneos: 1000
Clientes en base de datos: Ilimitados
Reservas diarias: 500
Tamaño de imagen: 5 MB máximo
Usuarios del sistema: 50 máximo
```

---

**📅 Versión del Manual:** 1.0
**📅 Fecha:** 2025-10-04
**📄 Páginas:** 35
**✍️ Autor:** ChatBotDysa Team

---

*Manual de Usuario - ChatBotDysa Enterprise*
*Todos los derechos reservados © 2025*
