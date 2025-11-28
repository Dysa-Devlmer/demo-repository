# 🧪 Guía de Pruebas del Sistema ChatBotDysa

**Fecha**: 19 de Noviembre, 2025
**Sistema**: ChatBotDysa Enterprise
**Enfoque**: Pruebas del Sistema RBAC y Funcionalidades

---

## 🌐 SERVICIOS ACTIVOS

### Aplicaciones Web
- **Admin Panel**: http://localhost:7001
- **Website**: http://localhost:6001
- **Landing Page**: http://localhost:3004

### API
- **Backend**: http://localhost:8005
- **Swagger UI**: http://localhost:8005/docs
- **Health Check**: http://localhost:8005/health

### Base de Datos
- **PostgreSQL**: localhost:15432
- **Redis**: localhost:16379

---

## 👥 USUARIOS DE PRUEBA

### 👑 Administrador (35 permisos)
```
Email: admin@zgamersa.com
Password: (tu password actual)
Rol: admin
```
**Permisos**: Control total del sistema

### 👔 Gerente (26 permisos)
```
Email: gerente@zgamersa.com
Password: Manager123!
Rol: manager
```
**Permisos**:
- ✅ Crear, ver, editar y ELIMINAR clientes
- ✅ Gestionar pedidos completos
- ✅ Administrar menú y reservas
- ✅ Ver conversaciones del chatbot
- ✅ Acceder a reportes y auditoría
- ✅ Modificar configuración del sistema
- ❌ NO puede gestionar roles ni permisos del sistema

### 👨‍🍳 Empleado (14 permisos)
```
Email: mesero@zgamersa.com
Password: Staff123!
Rol: staff
```
**Permisos**:
- ✅ Ver dashboard (solo lectura)
- ✅ Crear clientes nuevos
- ✅ Crear y editar pedidos
- ✅ Crear y editar reservas
- ✅ Ver y editar menú
- ❌ NO puede eliminar nada
- ❌ NO puede acceder a usuarios ni configuración
- ❌ NO puede ver reportes de auditoría

### 👤 Usuario Básico (3 permisos)
```
Email: cliente@zgamersa.com
Password: User123!
Rol: user
```
**Permisos**:
- ✅ Ver dashboard (muy limitado)
- ✅ Ver menú
- ✅ Ver sus pedidos
- ❌ NO puede crear, editar ni eliminar NADA

---

## 🎯 PLAN DE PRUEBAS

### Prueba 1: Login y Dashboard

**Objetivo**: Verificar que cada usuario ve diferentes niveles de información

1. **Login como Gerente**
   - URL: http://localhost:7001/login
   - Email: gerente@zgamersa.com
   - Password: Manager123!

   **Verificar**:
   - ✅ Login exitoso
   - ✅ Dashboard completo con estadísticas
   - ✅ Menú lateral con todas las opciones disponibles
   - ✅ Nombre "Carlos Rodríguez" en el perfil

2. **Login como Empleado** (en otra pestaña/ventana incógnita)
   - Email: mesero@zgamersa.com
   - Password: Staff123!

   **Verificar**:
   - ✅ Login exitoso
   - ✅ Dashboard con menos estadísticas que el Gerente
   - ⚠️ Menú lateral con opciones limitadas
   - ❌ NO debe ver opción de "Usuarios"
   - ❌ NO debe ver opción de "Configuración"
   - ✅ Nombre "María González" en el perfil

3. **Login como Usuario** (en otra pestaña/ventana incógnita)
   - Email: cliente@zgamersa.com
   - Password: User123!

   **Verificar**:
   - ✅ Login exitoso
   - ✅ Dashboard muy básico
   - ⚠️ Menú lateral MUY limitado (solo dashboard, menú, pedidos)
   - ✅ Nombre "Ana Martínez" en el perfil

---

### Prueba 2: Gestión de Clientes

**Objetivo**: Verificar permisos de CRUD en el módulo Clientes

#### Test 2.1: Ver Clientes
- **Gerente**: ✅ Debe ver lista completa con botones de editar/eliminar
- **Empleado**: ✅ Debe ver lista completa con botón de editar (sin eliminar)
- **Usuario**: ❌ Debe mostrar "No tienes permisos" o no ver el módulo

#### Test 2.2: Crear Cliente
1. Click en "Clientes" → "Nuevo Cliente"
2. Llenar formulario:
   ```
   Nombre: Juan
   Apellido: Pérez
   Email: juan.perez@example.com
   Teléfono: +56912345678
   ```

**Resultado esperado**:
- **Gerente**: ✅ Puede crear
- **Empleado**: ✅ Puede crear
- **Usuario**: ❌ No debe ver el botón "Nuevo Cliente"

#### Test 2.3: Editar Cliente
1. Click en un cliente existente
2. Modificar el teléfono
3. Guardar cambios

**Resultado esperado**:
- **Gerente**: ✅ Puede editar
- **Empleado**: ✅ Puede editar
- **Usuario**: ❌ No debe tener opción de editar

#### Test 2.4: Eliminar Cliente
1. Click en el botón "Eliminar" de un cliente
2. Confirmar eliminación

**Resultado esperado**:
- **Gerente**: ✅ Puede eliminar
- **Empleado**: ❌ NO debe ver botón "Eliminar" o debe dar error 403
- **Usuario**: ❌ NO debe ver botón "Eliminar"

---

### Prueba 3: Gestión de Pedidos

**Objetivo**: Verificar permisos en el módulo Pedidos

#### Test 3.1: Ver Pedidos
- **Gerente**: ✅ Debe ver todos los pedidos
- **Empleado**: ✅ Debe ver todos los pedidos
- **Usuario**: ✅ Debe ver solo SUS pedidos (si tiene)

#### Test 3.2: Crear Pedido
1. Click en "Pedidos" → "Nuevo Pedido"
2. Seleccionar cliente
3. Agregar items del menú
4. Confirmar pedido

**Resultado esperado**:
- **Gerente**: ✅ Puede crear
- **Empleado**: ✅ Puede crear
- **Usuario**: ❌ No debe ver botón "Nuevo Pedido"

#### Test 3.3: Actualizar Estado de Pedido
1. Click en un pedido existente
2. Cambiar estado (ej: "Pendiente" → "En Preparación")
3. Guardar

**Resultado esperado**:
- **Gerente**: ✅ Puede actualizar
- **Empleado**: ✅ Puede actualizar
- **Usuario**: ❌ No debe poder modificar

#### Test 3.4: Eliminar Pedido
1. Click en "Eliminar" en un pedido
2. Confirmar eliminación

**Resultado esperado**:
- **Gerente**: ✅ Puede eliminar
- **Empleado**: ❌ Error 403 o botón no visible
- **Usuario**: ❌ Botón no visible

---

### Prueba 4: Gestión de Menú

**Objetivo**: Verificar permisos en el módulo Menú

#### Test 4.1: Ver Menú
- **Todos**: ✅ Todos pueden ver el menú

#### Test 4.2: Crear Item del Menú
1. Click en "Menú" → "Nuevo Item"
2. Llenar:
   ```
   Nombre: Pizza Margherita
   Descripción: Pizza tradicional italiana
   Precio: 12990
   Categoría: Platos principales
   ```

**Resultado esperado**:
- **Gerente**: ✅ Puede crear
- **Empleado**: ✅ Puede crear
- **Usuario**: ❌ No debe ver botón "Nuevo Item"

#### Test 4.3: Editar Item del Menú
**Resultado esperado**:
- **Gerente**: ✅ Puede editar
- **Empleado**: ✅ Puede editar
- **Usuario**: ❌ No puede editar

#### Test 4.4: Eliminar Item del Menú
**Resultado esperado**:
- **Gerente**: ✅ Puede eliminar
- **Empleado**: ❌ Error 403
- **Usuario**: ❌ Sin opción

---

### Prueba 5: Gestión de Usuarios del Sistema

**Objetivo**: Verificar que SOLO el Admin puede gestionar usuarios

1. Intentar acceder a "Usuarios" en el menú

**Resultado esperado**:
- **Admin**: ✅ Puede acceder y gestionar usuarios
- **Gerente**: ❌ Error 403 o opción no visible
- **Empleado**: ❌ Opción no visible en el menú
- **Usuario**: ❌ Opción no visible en el menú

---

### Prueba 6: Configuración del Sistema

**Objetivo**: Verificar acceso a configuración

1. Intentar acceder a "Configuración" en el menú

**Resultado esperado**:
- **Gerente**: ✅ Puede ver y modificar configuración
- **Empleado**: ❌ Opción no visible
- **Usuario**: ❌ Opción no visible

---

### Prueba 7: API con Swagger

**Objetivo**: Probar permisos directamente en la API

1. Abre http://localhost:8005/docs

2. **Login y obtener token**:
   - Expande `POST /api/auth/login`
   - Click "Try it out"
   - Body:
     ```json
     {
       "email": "gerente@zgamersa.com",
       "password": "Manager123!"
     }
     ```
   - Click "Execute"
   - Copia el `accessToken` de la respuesta

3. **Autorizar en Swagger**:
   - Click en "Authorize" (candado arriba a la derecha)
   - Pega el token
   - Click "Authorize"

4. **Probar endpoints**:

   **GET /api/customers**
   - ✅ Debe funcionar y devolver lista de clientes

   **POST /api/customers**
   - Body:
     ```json
     {
       "firstName": "María",
       "lastName": "López",
       "email": "maria.lopez@example.com",
       "phone": "+56987654321"
     }
     ```
   - ✅ Debe funcionar y crear el cliente

   **DELETE /api/customers/{id}**
   - Usar ID de un cliente existente
   - ✅ Gerente: Debe eliminar exitosamente
   - ❌ Empleado: Debe dar error 403

5. **Repetir con token de Empleado** para verificar diferencias

---

### Prueba 8: Auditoría y Logs

**Objetivo**: Verificar que todas las acciones quedan registradas

1. Realiza varias acciones (login, crear cliente, eliminar, etc.)

2. Consulta los logs de auditoría:
   ```bash
   PGPASSWORD=supersecret psql -h 127.0.0.1 -p 15432 -U postgres -d chatbotdysa -c "
   SELECT
     action,
     entity_type,
     entity_id,
     user_id,
     timestamp
   FROM audit_logs
   ORDER BY timestamp DESC
   LIMIT 20;
   "
   ```

3. **Verificar**:
   - ✅ Todos los logins están registrados
   - ✅ Creaciones de datos registradas
   - ✅ Eliminaciones registradas
   - ✅ Cada acción tiene el user_id correcto

---

## 🐛 PROBLEMAS COMUNES Y SOLUCIONES

### Problema 1: "Credenciales inválidas" al hacer login
**Solución**: Verifica que estás usando las contraseñas correctas:
- Gerente: `Manager123!`
- Empleado: `Staff123!`
- Usuario: `User123!`

### Problema 2: Página en blanco o error 500
**Solución**:
1. Verifica que el backend esté corriendo: http://localhost:8005/health
2. Revisa logs: `tail -f /tmp/backend.log`
3. Reinicia el servicio si es necesario

### Problema 3: "No tienes permisos" cuando debería tener
**Solución**:
1. Verifica el rol del usuario en la base de datos
2. Cierra sesión y vuelve a iniciar
3. Verifica que el token JWT no haya expirado (1 hora)

### Problema 4: Cambios en la base de datos no se reflejan
**Solución**:
1. Refresca la página (F5)
2. Cierra sesión y vuelve a iniciar
3. Limpia caché del navegador

---

## 📊 CHECKLIST DE PRUEBAS

### Autenticación ✅
- [ ] Login exitoso con Gerente
- [ ] Login exitoso con Empleado
- [ ] Login exitoso con Usuario
- [ ] Error al usar contraseña incorrecta
- [ ] Token JWT se genera correctamente

### Dashboard ✅
- [ ] Gerente ve dashboard completo
- [ ] Empleado ve dashboard limitado
- [ ] Usuario ve dashboard muy básico

### Clientes ✅
- [ ] Gerente puede crear/editar/eliminar
- [ ] Empleado puede crear/editar pero NO eliminar
- [ ] Usuario NO puede hacer nada

### Pedidos ✅
- [ ] Gerente puede crear/editar/eliminar
- [ ] Empleado puede crear/editar pero NO eliminar
- [ ] Usuario solo puede ver

### Menú ✅
- [ ] Gerente puede crear/editar/eliminar items
- [ ] Empleado puede crear/editar pero NO eliminar
- [ ] Usuario solo puede ver

### Usuarios del Sistema ✅
- [ ] Solo Admin puede acceder
- [ ] Gerente NO puede acceder
- [ ] Empleado NO puede acceder
- [ ] Usuario NO puede acceder

### API (Swagger) ✅
- [ ] Autenticación funciona
- [ ] Endpoints respetan permisos
- [ ] Error 403 cuando no hay permisos

### Auditoría ✅
- [ ] Logins registrados
- [ ] Acciones CRUD registradas
- [ ] User ID correcto en logs

---

## 🎯 ESCENARIOS DE USO REAL

### Escenario 1: Día típico del Gerente
1. Login a las 9:00 AM
2. Revisa dashboard con ventas del día anterior
3. Agrega nuevo plato especial al menú
4. Revisa pedidos pendientes
5. Aprueba reservas para el almuerzo
6. Elimina cliente duplicado
7. Genera reporte de ventas
8. Cierra sesión

**Todas estas acciones deben ser exitosas** ✅

### Escenario 2: Día típico del Empleado
1. Login a las 10:00 AM
2. Revisa pedidos pendientes
3. Crea nuevo pedido para cliente walk-in
4. Actualiza estado de pedidos a "En preparación"
5. Agrega cliente nuevo que llamó
6. Intenta eliminar pedido antiguo → **ERROR 403** ❌
7. Intenta acceder a Usuarios → **NO VISIBLE** ❌
8. Cierra sesión

**Acciones permitidas funcionan, bloqueadas dan error** ✅

### Escenario 3: Cliente usando la app
1. Login en la app
2. Ve el menú del día
3. Ve su historial de pedidos
4. Intenta crear pedido → **BLOQUEADO** ❌
5. Intenta editar su perfil → **BLOQUEADO** ❌
6. Cierra sesión

**Solo lectura funciona** ✅

---

## 📈 MÉTRICAS DE ÉXITO

La prueba es exitosa si:
- ✅ Todos los usuarios pueden hacer login
- ✅ Cada usuario ve diferentes opciones en el menú
- ✅ Permisos se respetan (403 cuando corresponde)
- ✅ Dashboard muestra diferentes niveles de información
- ✅ API respeta permisos con tokens JWT
- ✅ Auditoría registra todas las acciones

---

**Fecha de pruebas**: _______________
**Probado por**: _______________
**Resultado**: ✅ Exitoso / ❌ Fallos encontrados

---

*Generado: 19 de Noviembre, 2025*
