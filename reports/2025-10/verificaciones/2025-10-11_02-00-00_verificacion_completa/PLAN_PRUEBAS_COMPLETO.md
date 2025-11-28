# 🧪 Plan de Pruebas Completo - Verificación Total del Sistema

**Fecha**: 11 de Octubre, 2025 - 02:00
**Objetivo**: Verificar funcionamiento completo de todos los frontends y funcionalidades

---

## 📊 ESTADO ACTUAL DE SERVICIOS

### Servicios Verificados (02:00)
| Servicio | Puerto | Estado | Acción Requerida |
|----------|--------|--------|------------------|
| Backend API | 8005 | ❌ Apagado | Iniciar primero |
| Admin Panel | 7001 | ❌ Apagado | Iniciar después del backend |
| Landing Page | 3000 | ❌ Apagado | Iniciar para verificar |
| Website | 3001 | ❌ Apagado | Iniciar para verificar |
| PostgreSQL | 15432 | ❌ Apagado | Requerido para backend |
| Redis | 16379 | ❌ Apagado | Requerido para backend |

**Conclusión**: ⚠️ **TODOS LOS SERVICIOS ESTÁN APAGADOS**

---

## 🚀 FASE 1: INICIAR SERVICIOS

### Paso 1: Verificar Docker Desktop
```bash
# Verificar que Docker esté corriendo
docker ps

# Si no está corriendo:
open -a Docker

# Esperar a que Docker esté listo (ícono en barra superior)
```

### Paso 2: Iniciar Base de Datos y Cache
```bash
cd /Users/devlmer/ChatBotDysa

# Iniciar PostgreSQL y Redis
docker-compose up -d postgres redis

# Verificar que iniciaron
docker ps | grep postgres
docker ps | grep redis

# Verificar puertos
lsof -ti:15432 && echo "✅ PostgreSQL OK"
lsof -ti:16379 && echo "✅ Redis OK"
```

### Paso 3: Iniciar Backend
```bash
cd /Users/devlmer/ChatBotDysa/apps/backend

# Matar cualquier proceso previo
pkill -f "nest start"

# Iniciar backend en desarrollo
npm run start:dev

# Esperar a ver el mensaje:
# [Nest] LOG [NestApplication] Nest application successfully started
```

**Verificación Backend**:
```bash
# En otra terminal
curl http://localhost:8005/api/health

# Debe responder:
# {"status":"ok",...}
```

### Paso 4: Iniciar Admin Panel
```bash
cd /Users/devlmer/ChatBotDysa/apps/admin-panel

npm run dev

# Esperar a ver:
# ✓ Ready in X ms
# ○ Local: http://localhost:7001
```

### Paso 5: Iniciar Landing Page
```bash
cd /Users/devlmer/ChatBotDysa/apps/landing-page

npm run dev

# Debe iniciar en puerto 3000
```

### Paso 6: Iniciar Website
```bash
cd /Users/devlmer/ChatBotDysa/apps/website

npm run dev

# Debe iniciar en puerto 3001
```

---

## 🧪 FASE 2: PRUEBAS DEL ADMIN PANEL

### A. Pruebas de Autenticación

#### Login
**URL**: `http://localhost:7001/login`

**Test 1: Login Exitoso**
```
Email: admin@zgamersa.com
Password: [contraseña configurada]

Resultado Esperado:
✅ Redirect a /dashboard
✅ Token guardado en localStorage
✅ Usuario autenticado
```

**Test 2: Login Fallido**
```
Email: wrong@email.com
Password: wrongpass

Resultado Esperado:
❌ Toast de error
❌ No redirect
❌ Mensaje claro de error
```

**Checklist Login**:
- [ ] Formulario se muestra correctamente
- [ ] Campos de email y password funcionan
- [ ] Botón "Iniciar Sesión" funcional
- [ ] Login exitoso redirige a dashboard
- [ ] Login fallido muestra error
- [ ] Toast notifications funcionan

---

### B. Pruebas del Dashboard Principal

**URL**: `http://localhost:7001/dashboard`

**Elementos a Verificar**:
1. [ ] Header visible con título
2. [ ] Sidebar con todas las opciones
3. [ ] Cards de estadísticas (si existen)
4. [ ] Datos cargados del backend

**Navegación del Sidebar**:
- [ ] Dashboard → `/dashboard`
- [ ] Clientes → `/dashboard/customers`
- [ ] Pedidos → `/dashboard/orders`
- [ ] Menú → `/dashboard/menu`
- [ ] Reservas → `/dashboard/reservations`
- [ ] Promociones → `/dashboard/promotions`
- [ ] Analytics → `/dashboard/analytics`
- [ ] Configuración → `/dashboard/settings`

---

### C. Pruebas de Botones de Estado de Servicios

**URL**: `http://localhost:7001/dashboard/settings`

#### Test: Botón "Probar" de PostgreSQL
```
Acción: Click en botón "Probar" en card "Base de Datos"

Request Esperado:
POST http://localhost:8005/api/settings/test/database

Response Esperado:
{
  "success": true,
  "status": "connected",
  "message": "Base de datos conectada correctamente"
}

UI Esperada:
✅ Badge cambia a "✓ Conectado" (verde)
✅ Toast: "✅ Prueba exitosa"
✅ Descripción: "Base de datos conectada correctamente"
```

**Checklist Database Test**:
- [ ] Botón "Probar" visible
- [ ] Click hace request al backend
- [ ] Badge actualiza a "Conectado"
- [ ] Toast de éxito aparece
- [ ] Mensaje correcto mostrado

#### Test: Botón "Probar" de WhatsApp
```
Acción: Click en "Probar" en "WhatsApp Business API"

Response Esperado (sin WhatsApp config):
{
  "success": false,
  "status": "disconnected",
  "message": "WhatsApp Business API no está configurado"
}

UI Esperada:
⚪ Badge: "○ No configurado (esperado en desarrollo)"
📢 Toast informativo
```

**Checklist WhatsApp Test**:
- [ ] Botón "Probar" funciona
- [ ] Badge actualiza correctamente
- [ ] Toast muestra mensaje apropiado
- [ ] Estado refleja configuración real

#### Test: Botón "Probar" de Ollama AI
```
Acción: Click en "Probar" en "Ollama AI"

Si Ollama NO está corriendo:
❌ Badge: "Error de conexión"
❌ Toast: Error

Si Ollama SÍ está corriendo:
✅ Badge: "Conectado"
✅ Toast: Éxito
```

**Checklist Ollama Test**:
- [ ] Botón responde
- [ ] Request al endpoint correcto
- [ ] Badge refleja estado real
- [ ] Toast apropiado

#### Test: Botón "Probar" de Twilio
```
Acción: Click en "Probar" en "Twilio Voice API"

Response Esperado (sin config):
{
  "success": false,
  "status": "disconnected",
  "message": "Prueba de Twilio no implementada"
}
```

**Checklist Twilio Test**:
- [ ] Botón funcional
- [ ] Badge actualiza
- [ ] Toast muestra resultado

---

### D. Pruebas del Sistema de Notificaciones

**Ubicación**: Header - Botón de campana (🔔)

#### Test 1: Ver Notificaciones
```
Acción: Click en botón de notificaciones

Resultado Esperado:
✅ Dropdown se abre
✅ Muestra 3 notificaciones de ejemplo:
   1. 🛒 Nueva orden #1234 (hace 5 min)
   2. 📅 Reservación confirmada (hace 15 min)
   3. ⚠️ Bajo stock - Pizza (hace 30 min)
✅ Badge rojo muestra "3"
```

**Checklist Notificaciones**:
- [ ] Botón de campana visible
- [ ] Badge con contador "3"
- [ ] Dropdown se abre al click
- [ ] 3 notificaciones visibles
- [ ] Iconos correctos (🛒📅⚠️)
- [ ] Timestamps en español

#### Test 2: Marcar como Leída
```
Acción: Click en una notificación

Resultado Esperado:
✅ Notificación se marca como leída
✅ Badge contador baja de 3 a 2
✅ Background de notificación cambia
✅ Si tiene link, navega a recurso
```

**Checklist Marcar Leída**:
- [ ] Click en notificación funciona
- [ ] Se marca como leída visualmente
- [ ] Contador actualiza (3→2)
- [ ] Navegación funciona (si aplica)

#### Test 3: Eliminar Notificación
```
Acción: Click en botón "X" de una notificación

Resultado Esperado:
✅ Notificación desaparece
✅ Contador actualiza
✅ Lista se actualiza
```

**Checklist Eliminar**:
- [ ] Botón X visible
- [ ] Click elimina notificación
- [ ] Contador actualiza
- [ ] No hay errores

#### Test 4: Marcar Todas como Leídas
```
Acción: Click en botón ✓ (marcar todas)

Resultado Esperado:
✅ Todas las notificaciones se marcan como leídas
✅ Contador va a 0
✅ Badge rojo desaparece
```

**Checklist Marcar Todas**:
- [ ] Botón ✓ visible cuando hay no leídas
- [ ] Click marca todas
- [ ] Contador → 0
- [ ] Badge desaparece

---

### E. Pruebas del Perfil de Usuario

**URL**: `http://localhost:7001/profile`

#### Test 1: Ver Perfil
```
Acción: Header → Avatar → "Perfil"

Resultado Esperado:
✅ Navega a /profile
✅ Muestra información del usuario
✅ Avatar con fallback
✅ Email visible
✅ Rol: "Administrador"
```

**Checklist Ver Perfil**:
- [ ] Menú de avatar funciona
- [ ] Click en "Perfil" navega
- [ ] Página carga correctamente
- [ ] Avatar se muestra
- [ ] Email correcto
- [ ] Datos personales visibles

#### Test 2: Editar Perfil
```
Acción: Click en "Editar Perfil"

Resultado Esperado:
✅ Campos se habilitan
✅ Nombre editable
✅ Apellido editable
✅ Email editable
✅ Teléfono editable
✅ Botones "Guardar" y "Cancelar" aparecen
```

**Checklist Editar**:
- [ ] Botón "Editar Perfil" funciona
- [ ] Campos se habilitan
- [ ] Puede modificar texto
- [ ] Botón "Guardar" visible
- [ ] Botón "Cancelar" visible

#### Test 3: Guardar Cambios
```
Acción: Modificar nombre → Click "Guardar"

Resultado Esperado:
✅ Toast: "✅ Perfil actualizado"
✅ Campos se deshabilitan
✅ Cambios persistidos (placeholder)
```

**Checklist Guardar**:
- [ ] Botón "Guardar" funciona
- [ ] Toast de éxito aparece
- [ ] Campos se deshabilitan
- [ ] Modo edición termina

#### Test 4: Cambiar Foto (Placeholder)
```
Acción: Click en "Cambiar Foto"

Resultado Esperado:
📢 Toast: "🖼️ Cambiar foto de perfil"
📢 "Funcionalidad próximamente disponible"
```

---

### F. Pruebas de CRUD - Clientes

**URL**: `http://localhost:7001/dashboard/customers`

#### Test 1: Listar Clientes
```
Acción: Navegar a Clientes

Verificar:
✅ Lista de clientes carga
✅ Tabla con columnas visibles
✅ Datos del backend se muestran
✅ Paginación funciona (si existe)
```

**Checklist Listar**:
- [ ] Página carga sin errores
- [ ] Request a /api/customers exitoso
- [ ] Tabla se renderiza
- [ ] Datos se muestran correctamente
- [ ] Loading state visible mientras carga

#### Test 2: Crear Cliente
```
Acción: Click en "Nuevo Cliente" o "Agregar"

Verificar:
✅ Modal o formulario aparece
✅ Campos requeridos marcados
✅ Validación de formulario
✅ Botón "Guardar" funciona
```

**Checklist Crear**:
- [ ] Botón de crear visible
- [ ] Click abre formulario
- [ ] Campos de entrada funcionan
- [ ] Validación funciona
- [ ] Submit envía POST request
- [ ] Toast de éxito al crear
- [ ] Lista se actualiza

#### Test 3: Editar Cliente
```
Acción: Click en "Editar" en un cliente

Verificar:
✅ Formulario pre-poblado con datos
✅ Modificar campos funciona
✅ Guardar envía PUT/PATCH
✅ Lista se actualiza
```

**Checklist Editar**:
- [ ] Botón editar visible
- [ ] Formulario carga con datos
- [ ] Modificación funciona
- [ ] Request PUT/PATCH correcto
- [ ] Toast de éxito
- [ ] UI actualiza

#### Test 4: Eliminar Cliente
```
Acción: Click en "Eliminar" en un cliente

Verificar:
✅ Confirmación aparece
✅ "¿Está seguro?"
✅ Cancelar cierra modal
✅ Confirmar envía DELETE
✅ Cliente se elimina de lista
```

**Checklist Eliminar**:
- [ ] Botón eliminar visible
- [ ] Modal de confirmación aparece
- [ ] Texto de advertencia claro
- [ ] Botón cancelar funciona
- [ ] Botón confirmar envía DELETE
- [ ] Toast de éxito
- [ ] Cliente se quita de lista

---

### G. Pruebas de CRUD - Menú

**URL**: `http://localhost:7001/dashboard/menu`

**Tests a Realizar**:
- [ ] Listar items del menú
- [ ] Ver categorías
- [ ] Crear nuevo item
- [ ] Editar item existente
- [ ] Eliminar item
- [ ] Filtrar por categoría
- [ ] Buscar items

**Request Esperados**:
- GET `/api/menu` - Listar
- POST `/api/menu` - Crear
- PUT `/api/menu/:id` - Actualizar
- DELETE `/api/menu/:id` - Eliminar

---

### H. Pruebas de CRUD - Pedidos

**URL**: `http://localhost:7001/dashboard/orders`

**Tests a Realizar**:
- [ ] Listar pedidos
- [ ] Ver detalle de pedido
- [ ] Crear nuevo pedido
- [ ] Actualizar estado de pedido
- [ ] Cancelar pedido
- [ ] Filtrar por estado
- [ ] Buscar por número

**Estados de Pedido**:
- Pendiente
- En Preparación
- Listo
- Entregado
- Cancelado

---

### I. Pruebas de CRUD - Reservas

**URL**: `http://localhost:7001/dashboard/reservations`

**Tests a Realizar**:
- [ ] Listar reservas
- [ ] Crear nueva reserva
- [ ] Editar reserva
- [ ] Cancelar reserva
- [ ] Ver calendario
- [ ] Filtrar por fecha
- [ ] Cambiar estado

---

## 🧪 FASE 3: PRUEBAS DE LANDING PAGE

**URL**: `http://localhost:3000`

### Tests Generales
- [ ] Página carga correctamente
- [ ] Hero section visible
- [ ] Imágenes cargan
- [ ] Links funcionan
- [ ] Responsive design
- [ ] Sin errores en consola

### Secciones a Verificar
- [ ] Header/Navbar
- [ ] Hero section
- [ ] Features/Características
- [ ] Pricing/Precios (si existe)
- [ ] Testimonials (si existe)
- [ ] Footer
- [ ] Formulario de contacto (si existe)

---

## 🧪 FASE 4: PRUEBAS DE WEBSITE

**URL**: `http://localhost:3001`

### Tests Generales
- [ ] Página principal carga
- [ ] Navegación funciona
- [ ] Contenido visible
- [ ] Imágenes optimizadas
- [ ] SEO meta tags
- [ ] Sin errores

### Páginas a Verificar
- [ ] Home
- [ ] About/Acerca
- [ ] Services/Servicios
- [ ] Contact/Contacto
- [ ] Blog (si existe)

---

## 📊 FASE 5: VERIFICACIÓN DE SINCRONIZACIÓN

### Test de Sincronización Backend-Frontend

#### Test 1: Crear Cliente en Backend
```bash
# Crear cliente via API
curl -X POST http://localhost:8005/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "User",
    "email": "test@example.com",
    "phone": "+52 55 1234 5678"
  }'
```

**Verificar en Admin Panel**:
- [ ] Ir a /dashboard/customers
- [ ] Cliente "Test User" aparece
- [ ] Datos correctos
- [ ] Sin necesidad de refresh

#### Test 2: Actualizar en Admin Panel
```
Acción: Editar cliente desde Admin Panel

Verificar:
✅ Cambios se guardan en backend
✅ GET /api/customers muestra cambios
✅ Otros frontends ven cambios
```

---

## 🔧 COMANDOS DE PRUEBA RÁPIDA

### Script de Verificación Completa
```bash
#!/bin/bash

echo "=== VERIFICACIÓN COMPLETA DEL SISTEMA ==="
echo ""

# Verificar servicios
echo "1. Servicios:"
lsof -ti:8005 && echo "✅ Backend" || echo "❌ Backend"
lsof -ti:7001 && echo "✅ Admin Panel" || echo "❌ Admin Panel"
lsof -ti:15432 && echo "✅ PostgreSQL" || echo "❌ PostgreSQL"

echo ""

# Probar endpoints
echo "2. Endpoints Backend:"
curl -s http://localhost:8005/api/health | grep -q "ok" && echo "✅ Health" || echo "❌ Health"
curl -s http://localhost:8005/api/customers | grep -q "\[" && echo "✅ Customers" || echo "❌ Customers"

echo ""

# Verificar frontend
echo "3. Frontends:"
curl -s http://localhost:7001 | grep -q "<!DOCTYPE" && echo "✅ Admin Panel carga" || echo "❌ Admin Panel"
curl -s http://localhost:3000 | grep -q "<!DOCTYPE" && echo "✅ Landing carga" || echo "❌ Landing"
```

---

## ✅ CHECKLIST FINAL DE VERIFICACIÓN

### Servicios
- [ ] Docker Desktop corriendo
- [ ] PostgreSQL activo (15432)
- [ ] Redis activo (16379)
- [ ] Backend corriendo (8005)
- [ ] Admin Panel corriendo (7001)
- [ ] Landing Page corriendo (3000)
- [ ] Website corriendo (3001)

### Admin Panel - Autenticación
- [ ] Login funciona
- [ ] Logout funciona
- [ ] Redirecciones correctas
- [ ] Tokens manejados

### Admin Panel - Navegación
- [ ] Todas las rutas accesibles
- [ ] Sidebar funciona
- [ ] Breadcrumbs correctos
- [ ] No errores 404

### Admin Panel - Botones de Estado
- [ ] WhatsApp test funciona
- [ ] Twilio test funciona
- [ ] Ollama test funciona
- [ ] Database test funciona
- [ ] Badges actualizan
- [ ] Toasts aparecen

### Admin Panel - Notificaciones
- [ ] Badge con contador
- [ ] Dropdown funciona
- [ ] 3 notificaciones visibles
- [ ] Marcar como leída
- [ ] Eliminar notificación
- [ ] Marcar todas

### Admin Panel - Perfil
- [ ] Ver perfil funciona
- [ ] Editar perfil funciona
- [ ] Guardar cambios funciona
- [ ] Toasts de feedback

### Admin Panel - CRUD Clientes
- [ ] Listar funciona
- [ ] Crear funciona
- [ ] Editar funciona
- [ ] Eliminar funciona
- [ ] Confirmaciones

### Admin Panel - CRUD Menú
- [ ] Listar items
- [ ] Crear item
- [ ] Editar item
- [ ] Eliminar item

### Admin Panel - CRUD Pedidos
- [ ] Listar pedidos
- [ ] Ver detalle
- [ ] Actualizar estado
- [ ] Cancelar

### Admin Panel - CRUD Reservas
- [ ] Listar reservas
- [ ] Crear reserva
- [ ] Editar reserva
- [ ] Cancelar reserva

### Landing Page
- [ ] Carga correctamente
- [ ] Hero section visible
- [ ] Links funcionan
- [ ] Responsive
- [ ] Sin errores

### Website
- [ ] Carga correctamente
- [ ] Navegación funciona
- [ ] Contenido visible
- [ ] Sin errores

### Sincronización
- [ ] Backend ↔ Admin Panel
- [ ] Datos en tiempo real
- [ ] Sin necesidad de refresh
- [ ] Consistencia de datos

---

## 📝 NOTAS IMPORTANTES

### Prerrequisitos para Pruebas
1. ✅ Docker Desktop debe estar corriendo
2. ✅ PostgreSQL debe tener datos de seed
3. ✅ Backend debe estar completamente iniciado
4. ✅ Variables de entorno configuradas

### Credenciales de Prueba
```
Admin:
Email: admin@zgamersa.com
Password: [configurada en .env]

Cliente Test:
Nombre: Test User
Email: test@example.com
Teléfono: +52 55 1234 5678
```

### Endpoints Importantes
```
Backend Health:    http://localhost:8005/api/health
Backend Swagger:   http://localhost:8005/docs
Admin Panel:       http://localhost:7001
Landing Page:      http://localhost:3000
Website:           http://localhost:3001
```

---

**ChatBotDysa Enterprise+++++**
*Plan de Pruebas Completo - Verificación Total*

© 2025 ChatBotDysa - Todos los derechos reservados

**Última actualización:** 11 de Octubre, 2025 - 02:00
**Autor:** Devlmer + Claude Code
**Estado:** 📋 Plan listo - Servicios pendientes de inicio
