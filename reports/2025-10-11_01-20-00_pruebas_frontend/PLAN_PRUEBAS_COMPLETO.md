# 🧪 Plan de Pruebas Completo - Frontends ChatBotDysa
## Verificación de Sincronización, Compatibilidad y Funcionalidad

**Fecha**: 11 de Octubre, 2025 - 01:20
**Autor**: Devlmer + Claude Code
**Objetivo**: Probar TODOS los frontends exhaustivamente

---

## 📊 Resumen Ejecutivo

Este documento contiene el plan completo para probar TODOS los frontends del ecosistema ChatBotDysa, verificando:

✅ **Sincronización** con backend
✅ **Compatibilidad** entre componentes
✅ **Funcionalidad** completa de botones
✅ **Notificaciones** funcionando
✅ **CRUD** completo (Crear, Leer, Actualizar, Eliminar)
✅ **Estados** de servicios (DB, IA, servidores)
✅ **Health checks** de todos los servicios

---

## 🎯 Frontends a Probar

### 1. Admin Panel (Puerto 7001)
**Tecnología**: Next.js 14 + App Router
**Funcionalidades**: Panel completo de administración

### 2. Website (Puerto 3004)
**Tecnología**: Next.js 14 + App Router
**Funcionalidades**: Website principal público

### 3. Landing Page (Puerto 3000)
**Tecnología**: Next.js (Pages Router)
**Funcionalidades**: Página de aterrizaje marketing

### 4. Web Widget (Embebible)
**Tecnología**: React standalone
**Funcionalidades**: Chat widget embebible

---

## 🔧 Pre-requisitos

### Servicios Necesarios

```bash
# Backend API
Puerto: 8005
Comando: cd apps/backend && npm run start:dev

# PostgreSQL
Puerto: 15432
Comando: docker-compose up -d postgres

# Redis
Puerto: 16379
Comando: docker-compose up -d redis

# Ollama (Opcional - para IA)
Puerto: 11434
Comando: ollama serve
```

### Verificar Servicios Corriendo

```bash
# Script de verificación
echo "=== Verificando Servicios ==="
lsof -ti:8005 && echo "✅ Backend" || echo "❌ Backend"
lsof -ti:15432 && echo "✅ PostgreSQL" || echo "❌ PostgreSQL"
lsof -ti:16379 && echo "✅ Redis" || echo "❌ Redis"
lsof -ti:11434 && echo "✅ Ollama" || echo "❌ Ollama"
```

---

## 📋 PLAN DE PRUEBAS - ADMIN PANEL

### Fase 1: Inicio y Acceso

#### 1.1 Iniciar Admin Panel
```bash
cd /Users/devlmer/ChatBotDysa/apps/admin-panel
npm run dev
# Debe iniciar en http://localhost:7001
```

#### 1.2 Verificar Página de Login
- [ ] Navegar a http://localhost:7001
- [ ] Verificar que cargue la página de login
- [ ] Verificar que el formulario aparezca correctamente
- [ ] Verificar estilos y diseño

#### 1.3 Login con Credenciales
```javascript
// Credenciales de prueba
Email: admin@zgamersa.com
Password: [verificar en .env]
```

**Verificaciones**:
- [ ] Login exitoso
- [ ] Token JWT recibido
- [ ] Redirección a dashboard
- [ ] Notificación de bienvenida

---

### Fase 2: Dashboard y Navegación

#### 2.1 Dashboard Principal
**URL**: `/dashboard`

**Elementos a Verificar**:
- [ ] Estadísticas cargando correctamente
- [ ] Gráficos renderizando (si hay)
- [ ] Cards de resumen funcionando
- [ ] Datos actualizados del backend

#### 2.2 Navegación del Menú
**Verificar todos los enlaces**:
- [ ] Dashboard
- [ ] Customers (Clientes)
- [ ] Menu (Menú)
- [ ] Orders (Órdenes)
- [ ] Reservations (Reservaciones)
- [ ] Conversations (Conversaciones)
- [ ] Analytics
- [ ] Settings (Configuraciones)
- [ ] AI Chat
- [ ] Users (Usuarios)

**Para cada enlace**:
- [ ] Clic funciona
- [ ] Página carga sin errores
- [ ] URL actualiza correctamente
- [ ] Navegación es fluida

---

### Fase 3: Módulo CUSTOMERS (CRUD Completo)

#### 3.1 Listar Customers
**URL**: `/dashboard/customers`

**Verificaciones**:
- [ ] Tabla de customers carga
- [ ] Datos del backend aparecen
- [ ] Paginación funciona (si hay)
- [ ] Búsqueda funciona (si hay)
- [ ] Filtros funcionan (si hay)

#### 3.2 Crear Customer (CREATE)
**Acción**: Clic en botón "Nuevo Cliente" o similar

**Verificaciones**:
- [ ] Formulario de creación abre
- [ ] Todos los campos visibles
- [ ] Validaciones funcionan
- [ ] Botón "Guardar" habilitado

**Campos a llenar**:
```javascript
{
  name: "Cliente Prueba",
  email: "test@example.com",
  phone: "+1234567890",
  // otros campos según formulario
}
```

**Después de Submit**:
- [ ] Request POST al backend
- [ ] Notificación de éxito aparece
- [ ] Customer aparece en lista
- [ ] Modal/formulario se cierra
- [ ] Lista se actualiza automáticamente

#### 3.3 Ver Detalles Customer (READ)
**Acción**: Clic en un customer de la lista

**Verificaciones**:
- [ ] Vista de detalles abre
- [ ] Todos los datos se muestran
- [ ] Información correcta del backend
- [ ] Botones de acción visibles

#### 3.4 Editar Customer (UPDATE)
**Acción**: Clic en botón "Editar"

**Verificaciones**:
- [ ] Formulario de edición abre
- [ ] Campos pre-poblados con datos actuales
- [ ] Modificar campos funciona
- [ ] Validaciones en edición

**Modificar**:
```javascript
{
  name: "Cliente Prueba EDITADO",
  phone: "+0987654321"
}
```

**Después de Submit**:
- [ ] Request PUT/PATCH al backend
- [ ] Notificación de actualización
- [ ] Datos actualizados en lista
- [ ] Cambios persistentes

#### 3.5 Eliminar Customer (DELETE)
**Acción**: Clic en botón "Eliminar"

**Verificaciones**:
- [ ] Modal de confirmación aparece
- [ ] Advertencia clara mostrada
- [ ] Opción de cancelar funciona
- [ ] Opción de confirmar funciona

**Después de Confirmar**:
- [ ] Request DELETE al backend
- [ ] Notificación de eliminación
- [ ] Customer removido de lista
- [ ] No aparece error 404 después

#### 3.6 Estados y Filtros
**Verificar**:
- [ ] Filtro por estado (activo/inactivo)
- [ ] Filtro por fecha
- [ ] Ordenamiento por columnas
- [ ] Exportar datos (si existe)

---

### Fase 4: Módulo MENU (CRUD Completo)

#### 4.1 Listar Items del Menú
**URL**: `/dashboard/menu`

**Verificaciones**:
- [ ] Tabla/grid de items carga
- [ ] Imágenes de items se muestran
- [ ] Precios formateados correctamente
- [ ] Categorías visibles

#### 4.2 Crear Item de Menú (CREATE)
**Campos**:
```javascript
{
  name: "Pizza Prueba",
  description: "Descripción de prueba",
  price: 15.99,
  category: "Pizzas",
  available: true,
  image: "[URL o upload]"
}
```

**Verificaciones**:
- [ ] Formulario completo
- [ ] Upload de imagen funciona
- [ ] Precio acepta decimales
- [ ] Categorías en dropdown
- [ ] Item creado correctamente

#### 4.3 Editar Item (UPDATE)
- [ ] Edición de nombre
- [ ] Edición de precio
- [ ] Cambio de categoría
- [ ] Toggle de disponibilidad
- [ ] Cambio de imagen

#### 4.4 Eliminar Item (DELETE)
- [ ] Confirmación antes de eliminar
- [ ] Item eliminado de lista
- [ ] No afecta otros items

#### 4.5 Estados del Menú
- [ ] Marcar como disponible/no disponible
- [ ] Destacar items especiales
- [ ] Ordenar items por categoría

---

### Fase 5: Módulo ORDERS (CRUD + Estados)

#### 5.1 Listar Orders
**URL**: `/dashboard/orders`

**Verificaciones**:
- [ ] Lista de órdenes carga
- [ ] Estados visibles (pendiente, en proceso, completado)
- [ ] Información de customer visible
- [ ] Totales calculados correctamente

#### 5.2 Ver Detalles de Order
**Verificaciones**:
- [ ] Items de la orden listados
- [ ] Cantidad y precios correctos
- [ ] Subtotal y total calculados
- [ ] Información de entrega (si aplica)

#### 5.3 Cambiar Estado de Order
**Estados a probar**:
- [ ] Pendiente → En Proceso
- [ ] En Proceso → Completado
- [ ] Completado → Entregado
- [ ] Cualquier estado → Cancelado

**Verificaciones**:
- [ ] Botones de cambio de estado visibles
- [ ] Request PATCH al backend
- [ ] Notificación de cambio de estado
- [ ] Estado actualizado en lista
- [ ] Timeline de estados (si existe)

#### 5.4 Crear Nueva Order (si aplica)
- [ ] Seleccionar customer
- [ ] Agregar items
- [ ] Calcular total automáticamente
- [ ] Crear orden exitosamente

#### 5.5 Cancelar/Eliminar Order
- [ ] Confirmación requerida
- [ ] Razón de cancelación (si existe)
- [ ] Order marcado como cancelado
- [ ] No se puede editar después

---

### Fase 6: Módulo RESERVATIONS

#### 6.1 Listar Reservaciones
- [ ] Calendario view (si existe)
- [ ] Lista view
- [ ] Filtros por fecha
- [ ] Estados de reservación

#### 6.2 Crear Reservación
**Campos**:
```javascript
{
  customerName: "Cliente Prueba",
  customerPhone: "+1234567890",
  customerEmail: "test@example.com",
  date: "2025-10-15",
  time: "19:00",
  numberOfPeople: 4,
  specialRequests: "Mesa junto a ventana"
}
```

**Verificaciones**:
- [ ] Selector de fecha funciona
- [ ] Selector de hora funciona
- [ ] Validación de capacidad
- [ ] Conflictos de horario detectados
- [ ] Reservación creada exitosamente

#### 6.3 Modificar Reservación
- [ ] Cambiar fecha
- [ ] Cambiar hora
- [ ] Cambiar número de personas
- [ ] Actualización exitosa

#### 6.4 Cancelar Reservación
- [ ] Confirmación requerida
- [ ] Estado cambia a cancelado
- [ ] Notificación enviada (si aplica)

---

### Fase 7: Módulo CONVERSATIONS (Chat)

#### 7.1 Listar Conversaciones
**URL**: `/dashboard/conversations`

**Verificaciones**:
- [ ] Lista de conversaciones carga
- [ ] Mensajes recientes visibles
- [ ] Estados de conversación (activa, cerrada)
- [ ] Cliente asociado visible

#### 7.2 Ver Conversación
**Verificaciones**:
- [ ] Timeline de mensajes completo
- [ ] Mensajes ordenados cronológicamente
- [ ] Avatar/nombre de usuario visible
- [ ] Timestamps correctos

#### 7.3 Responder en Conversación
**Acción**: Escribir y enviar mensaje

**Verificaciones**:
- [ ] Campo de texto funcional
- [ ] Botón enviar habilitado
- [ ] Mensaje enviado al backend
- [ ] Mensaje aparece en timeline
- [ ] Scroll automático al último mensaje

#### 7.4 Cambiar Estado de Conversación
**Estados**:
- [ ] Abrir conversación cerrada
- [ ] Cerrar conversación activa
- [ ] Marcar como resuelta
- [ ] Asignar a agente (si existe)

---

### Fase 8: Módulo ANALYTICS

#### 8.1 Dashboard de Analytics
**URL**: `/dashboard/analytics`

**Verificaciones**:
- [ ] Gráficos cargan correctamente
- [ ] Datos del backend se muestran
- [ ] Filtros por fecha funcionan
- [ ] Exportar reportes (si existe)

#### 8.2 Métricas a Verificar
- [ ] Ventas totales
- [ ] Número de órdenes
- [ ] Customers nuevos
- [ ] Reservaciones
- [ ] Conversaciones
- [ ] Items más vendidos

#### 8.3 Gráficos
**Tipos de gráficos**:
- [ ] Gráfico de líneas (ventas por tiempo)
- [ ] Gráfico de barras (comparativas)
- [ ] Gráfico de pie/donut (distribución)
- [ ] Tablas de datos

---

### Fase 9: Módulo SETTINGS (Settings Enterprise)

#### 9.1 Listar Settings
**URL**: `/dashboard/settings`

**Verificaciones**:
- [ ] Settings cargando del backend
- [ ] Categorías organizadas
- [ ] Valores actuales visibles

#### 9.2 Ver/Editar Settings
**Settings a probar**:
```javascript
{
  "app.name": "ChatBotDysa Enterprise",
  "restaurant.name": "ZG Amers Restaurant",
  "restaurant.timezone": "America/Los_Angeles",
  "whatsapp.enabled": true/false,
  "ollama.enabled": true/false,
  "ollama.model": "llama3.2"
}
```

**Verificaciones**:
- [ ] Cada setting editable
- [ ] Validaciones funcionan
- [ ] Cambios se guardan
- [ ] Request PUT/PATCH al backend
- [ ] Notificación de actualización

#### 9.3 Estados de Settings
- [ ] Active
- [ ] Draft
- [ ] Archived

**Verificar cambios de estado**:
- [ ] Active → Draft
- [ ] Draft → Active
- [ ] Active → Archived

#### 9.4 Historial de Settings
**Verificaciones**:
- [ ] Ver historial de cambios
- [ ] Timestamp de cada cambio
- [ ] Usuario que hizo el cambio
- [ ] Valor anterior vs nuevo

---

### Fase 10: Módulo AI CHAT

#### 10.1 Chat con IA
**URL**: `/dashboard/ai-chat`

**Verificaciones**:
- [ ] Interfaz de chat carga
- [ ] Campo de texto funcional
- [ ] Enviar mensaje funciona

#### 10.2 Interacción con IA
**Mensajes de prueba**:
```
1. "Hola"
2. "¿Cuál es el menú de hoy?"
3. "Quiero hacer una reservación"
```

**Verificaciones**:
- [ ] Mensaje enviado al backend
- [ ] Backend conecta con Ollama
- [ ] Respuesta de IA recibida
- [ ] Respuesta mostrada en chat
- [ ] Conversación fluida

#### 10.3 Estados de IA
**Verificar**:
- [ ] Indicador de "escribiendo..."
- [ ] Manejo de errores si Ollama no está disponible
- [ ] Timeout manejado correctamente

---

### Fase 11: Módulo USERS (Gestión de Usuarios)

#### 11.1 Listar Usuarios
**Verificaciones**:
- [ ] Lista de usuarios del sistema
- [ ] Roles visibles
- [ ] Estados (activo/inactivo)

#### 11.2 Crear Usuario
**Campos**:
```javascript
{
  email: "newuser@example.com",
  firstName: "Nuevo",
  lastName: "Usuario",
  role: "admin" | "manager" | "staff",
  password: "securePassword123"
}
```

**Verificaciones**:
- [ ] Formulario completo
- [ ] Validación de email
- [ ] Validación de contraseña
- [ ] Selección de rol
- [ ] Usuario creado

#### 11.3 Editar Usuario
- [ ] Cambiar rol
- [ ] Cambiar estado
- [ ] Actualizar información
- [ ] Resetear contraseña (si existe)

#### 11.4 Eliminar/Desactivar Usuario
- [ ] Confirmación requerida
- [ ] Usuario desactivado
- [ ] No puede hacer login después

---

### Fase 12: NOTIFICACIONES

#### 12.1 Tipos de Notificaciones a Verificar

**Notificaciones de Éxito**:
- [ ] "Cliente creado exitosamente"
- [ ] "Orden actualizada"
- [ ] "Reservación confirmada"
- [ ] "Setting guardado"

**Notificaciones de Error**:
- [ ] "Error al crear cliente"
- [ ] "Campos requeridos faltantes"
- [ ] "Error de conexión con backend"

**Notificaciones de Advertencia**:
- [ ] "¿Estás seguro de eliminar?"
- [ ] "Esta acción no se puede deshacer"

**Notificaciones de Información**:
- [ ] "Cargando datos..."
- [ ] "Sincronizando con servidor..."

#### 12.2 Sistema de Notificaciones
**Verificar**:
- [ ] Posición correcta (top-right, bottom-right, etc.)
- [ ] Duración apropiada (3-5 segundos)
- [ ] Cerrar manual funciona
- [ ] Auto-dismiss funciona
- [ ] Múltiples notificaciones no se solapan
- [ ] Iconos apropiados (success ✓, error ✗, warning ⚠)

---

### Fase 13: ESTADOS DE SERVICIOS

#### 13.1 Health Check del Backend
**Endpoint**: `GET /api/health`

**Verificar en UI**:
- [ ] Indicador de estado del backend (verde/rojo)
- [ ] Mensaje de estado
- [ ] Timestamp de última verificación

#### 13.2 Estado de Base de Datos
**Endpoint**: `GET /api/health/database` (si existe)

**Verificar**:
- [ ] Estado de PostgreSQL visible
- [ ] Conexión activa/inactiva
- [ ] Número de conexiones (si aplica)
- [ ] Indicador visual (🟢/🔴)

#### 13.3 Estado de Redis
**Endpoint**: `GET /api/health/redis` (si existe)

**Verificar**:
- [ ] Estado de Redis visible
- [ ] Conexión activa/inactiva
- [ ] Indicador visual

#### 13.4 Estado de IA (Ollama)
**Endpoint**: `GET /api/health/ai` o similar

**Verificar**:
- [ ] Estado de Ollama visible
- [ ] Modelo actual en uso
- [ ] Disponibilidad del servicio
- [ ] Indicador visual

#### 13.5 Panel de Estados
**Ubicación**: Dashboard principal o página `/status`

**Debe mostrar**:
```
✅ Backend API      - Healthy (200ms)
✅ PostgreSQL       - Connected
✅ Redis            - Connected
✅ Ollama AI        - Running (llama3.2)
✅ WhatsApp         - Configured
✅ Twilio           - Configured
```

**Verificaciones**:
- [ ] Todos los servicios listados
- [ ] Estados actualizados
- [ ] Refresh manual funciona
- [ ] Auto-refresh cada X segundos (si existe)

---

### Fase 14: BOTONES Y ACCIONES

#### 14.1 Botones Primarios
**Verificar en cada módulo**:
- [ ] "Crear Nuevo" - funciona
- [ ] "Guardar" - funciona y muestra loading
- [ ] "Actualizar" - funciona
- [ ] "Eliminar" - requiere confirmación
- [ ] "Cancelar" - cierra modal/formulario

#### 14.2 Botones Secundarios
- [ ] "Ver Detalles" - abre modal/página
- [ ] "Editar" - abre formulario
- [ ] "Duplicar" - crea copia (si existe)
- [ ] "Exportar" - descarga datos (si existe)

#### 14.3 Estados de Botones
- [ ] Disabled cuando no es apropiado
- [ ] Loading cuando procesa request
- [ ] Habilitado solo con datos válidos
- [ ] Tooltips informativos (si existen)

#### 14.4 Atajos de Teclado (si existen)
- [ ] Ctrl/Cmd + S para guardar
- [ ] Esc para cerrar modal
- [ ] Enter para submit formulario

---

## 📋 PLAN DE PRUEBAS - WEBSITE

### Fase 1: Páginas Públicas

#### 1.1 Página de Inicio
**URL**: `http://localhost:3004`

**Verificaciones**:
- [ ] Página carga sin errores
- [ ] Hero section visible
- [ ] Imágenes cargan
- [ ] Animaciones funcionan (si hay)
- [ ] Enlaces de navegación funcionan

#### 1.2 Navegación
**Verificar enlaces**:
- [ ] Home
- [ ] About
- [ ] Services
- [ ] Menu (si existe)
- [ ] Contact
- [ ] Login/Register

#### 1.3 Formularios
**Formulario de Contacto**:
```javascript
{
  name: "Test User",
  email: "test@example.com",
  message: "Mensaje de prueba"
}
```

**Verificaciones**:
- [ ] Formulario visible
- [ ] Validaciones funcionan
- [ ] Submit envía al backend
- [ ] Notificación de éxito
- [ ] Email enviado (si está configurado)

#### 1.4 Integración con Backend
**Verificar**:
- [ ] Datos del menú del backend
- [ ] Información de contacto del backend
- [ ] Horarios desde settings
- [ ] Precios actualizados

---

## 📋 PLAN DE PRUEBAS - LANDING PAGE

### Fase 1: Página de Marketing

#### 1.1 Hero Section
**URL**: `http://localhost:3000`

**Verificaciones**:
- [ ] Título y subtítulo visibles
- [ ] CTA button funcional
- [ ] Imagen/video de fondo carga

#### 1.2 Secciones
- [ ] Features section
- [ ] Pricing section (si existe)
- [ ] Testimonials section
- [ ] FAQ section
- [ ] CTA section

#### 1.3 Formularios de Captura
**Lead Capture Form**:
```javascript
{
  email: "lead@example.com",
  name: "Potential Customer"
}
```

**Verificaciones**:
- [ ] Formulario funcional
- [ ] Validación de email
- [ ] Submit al backend
- [ ] Almacenado en DB
- [ ] Email de confirmación (si aplica)

---

## 📋 PLAN DE PRUEBAS - WEB WIDGET

### Fase 1: Widget Embebible

#### 1.1 Inicialización del Widget
**HTML de prueba**:
```html
<!DOCTYPE html>
<html>
<head>
  <title>Test Widget</title>
</head>
<body>
  <h1>Prueba de Widget</h1>
  <script src="http://localhost:PUERTO/widget.js"></script>
</body>
</html>
```

**Verificaciones**:
- [ ] Widget se carga
- [ ] Icono de chat aparece
- [ ] Posición correcta (bottom-right típicamente)

#### 1.2 Abrir Chat
**Acción**: Clic en icono del widget

**Verificaciones**:
- [ ] Ventana de chat se abre
- [ ] Animación de apertura
- [ ] Dimensiones correctas
- [ ] Cerrar funciona

#### 1.3 Enviar Mensaje
**Mensajes de prueba**:
```
1. "Hola"
2. "Necesito ayuda"
3. "¿Cuál es su horario?"
```

**Verificaciones**:
- [ ] Mensaje enviado al backend
- [ ] Mensaje aparece en chat
- [ ] Respuesta automática (si existe)
- [ ] Conexión con IA (si aplica)

#### 1.4 Estados del Widget
- [ ] Online/Offline
- [ ] Escribiendo...
- [ ] Conectando...
- [ ] Error de conexión

---

## 🔍 VERIFICACIONES DE INTEGRACIÓN

### Sincronización Backend-Frontend

#### 1. Consistencia de Datos
**Verificar**:
- [ ] Datos creados en admin panel aparecen en website
- [ ] Cambios en settings se reflejan inmediatamente
- [ ] Estados actualizados en tiempo real (si aplica)

#### 2. Manejo de Errores
**Probar escenarios**:
- [ ] Backend apagado → mensaje de error apropiado
- [ ] Request timeout → manejo correcto
- [ ] 401 Unauthorized → redirect a login
- [ ] 403 Forbidden → mensaje de permisos
- [ ] 404 Not Found → mensaje apropiado
- [ ] 500 Server Error → error genérico

#### 3. Autenticación y Autorización
**Verificar**:
- [ ] Token JWT en headers
- [ ] Token expira → redirect a login
- [ ] Refresh token funciona (si existe)
- [ ] Permisos por rol respetados

#### 4. WebSockets (si aplica)
**Verificar**:
- [ ] Conexión establecida
- [ ] Mensajes en tiempo real
- [ ] Reconexión automática
- [ ] Manejo de desconexión

---

## ✅ CHECKLIST FINAL DE VERIFICACIÓN

### General
- [ ] Todos los frontends inician sin errores
- [ ] Todas las páginas cargan correctamente
- [ ] No hay errores en consola del navegador
- [ ] No hay warnings críticos

### CRUD Completo
- [ ] Crear funciona en todos los módulos
- [ ] Leer/Listar funciona
- [ ] Actualizar funciona
- [ ] Eliminar funciona con confirmación

### Notificaciones
- [ ] Notificaciones de éxito aparecen
- [ ] Notificaciones de error son claras
- [ ] Notificaciones se auto-cierran
- [ ] Sistema de notificaciones no interfiere con UI

### Estados de Servicios
- [ ] Health check del backend funciona
- [ ] Estado de DB visible y correcto
- [ ] Estado de Redis visible
- [ ] Estado de IA visible
- [ ] Refresh de estados funciona

### Botones y Acciones
- [ ] Todos los botones responden al clic
- [ ] Estados de loading visibles
- [ ] Botones disabled cuando apropiado
- [ ] Confirmaciones antes de acciones destructivas

### Performance
- [ ] Carga inicial rápida (<3s)
- [ ] Navegación fluida
- [ ] Sin memory leaks
- [ ] Imágenes optimizadas

### Responsive
- [ ] Desktop funciona
- [ ] Tablet funciona (si aplica)
- [ ] Mobile funciona (si aplica)

---

## 📝 SIGUIENTE PASO

Para ejecutar estas pruebas, necesitamos:

1. **Iniciar servicios**:
```bash
# Terminal 1: Backend
cd apps/backend && npm run start:dev

# Terminal 2: Admin Panel
cd apps/admin-panel && npm run dev

# Terminal 3: Website
cd apps/website && npm run dev

# Terminal 4: Landing Page
cd apps/landing-page && npm run dev
```

2. **Verificar servicios de infraestructura**:
```bash
docker-compose up -d postgres redis
```

3. **Ejecutar pruebas** siguiendo este plan paso a paso

---

**ChatBotDysa Enterprise+++++**
*Plan de Pruebas Exhaustivo*

© 2025 ChatBotDysa - Todos los derechos reservados

**Última actualización:** 11 de Octubre, 2025 - 01:20
**Autor:** Devlmer + Claude Code
**Estado:** ⏳ Pendiente de ejecución (servicios apagados)
