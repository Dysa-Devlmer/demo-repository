# 🧪 Guía de Prueba Completa - Sistema de Conversaciones

**Fecha**: 21 de noviembre de 2025
**Versión**: 1.0
**Estado**: ✅ LISTO PARA PRUEBAS

---

## 📋 Resumen de Cambios Implementados

### Backend (NestJS)
1. ✅ Endpoint `PUT /api/conversations/:id` - Actualizar conversaciones
2. ✅ Endpoint `DELETE /api/conversations/:id` - Eliminar conversaciones
3. ✅ Servicio `update()` - Actualizar status, agent_id, metadata
4. ✅ Servicio `delete()` - Eliminar conversación permanentemente

### Frontend (Next.js 14)
1. ✅ API Client `conversations.update()` - Llamar endpoint PUT
2. ✅ API Client `conversations.delete()` - Llamar endpoint DELETE
3. ✅ Validación de teléfonos chilenos en tiempo real
4. ✅ Auto-formato de números al estándar internacional
5. ✅ Normalización E.164 para el backend

---

## 🚀 Estado Actual del Sistema

```bash
✅ Backend:      http://localhost:8005  (ACTIVO)
✅ Admin Panel:  http://localhost:7001  (ACTIVO)
✅ PostgreSQL:   localhost:15432        (CONECTADO)
✅ Redis:        localhost:16379        (OPCIONAL)
```

---

## 🧪 PRUEBAS DE BACKEND

### 1. Verificar Health Check

```bash
curl -s http://localhost:8005/health | python3 -m json.tool
```

**Resultado esperado:**
```json
{
    "success": true,
    "data": {
        "status": "ok",
        "database": {
            "connected": true
        }
    }
}
```

---

### 2. Probar Endpoints de Conversations (Con Token)

#### A. Listar Conversaciones
```bash
# Necesitas un token JWT válido
TOKEN="tu_token_aqui"

curl -s http://localhost:8005/api/conversations \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

#### B. Crear Nueva Conversación
```bash
curl -s -X POST http://localhost:8005/api/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "customer_phone": "+56912345678",
    "customer_name": "Test Usuario",
    "platform": "whatsapp"
  }' | python3 -m json.tool
```

**Resultado esperado:**
```json
{
    "success": true,
    "data": {
        "id": 123,
        "session_id": "CONV-XXX",
        "customer": {
            "phone": "+56912345678"
        }
    }
}
```

#### C. Actualizar Conversación (NUEVO ✨)
```bash
CONVERSATION_ID=123

# Asignar agente
curl -s -X PUT http://localhost:8005/api/conversations/$CONVERSATION_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "agent_id": "agent-456",
    "status": "escalated"
  }' | python3 -m json.tool
```

**Resultado esperado:**
```json
{
    "success": true,
    "data": {
        "id": 123,
        "agent_id": "agent-456",
        "status": "escalated",
        "last_activity": "2025-11-21T..."
    }
}
```

#### D. Cerrar Conversación (NUEVO ✨)
```bash
curl -s -X PUT http://localhost:8005/api/conversations/$CONVERSATION_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "status": "closed"
  }' | python3 -m json.tool
```

#### E. Eliminar Conversación (NUEVO ✨)
```bash
curl -s -X DELETE http://localhost:8005/api/conversations/$CONVERSATION_ID \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

**Resultado esperado:**
```json
{
    "success": true,
    "message": "Conversación eliminada exitosamente"
}
```

---

## 🌐 PRUEBAS DE FRONTEND (Admin Panel)

### Pre-requisitos
1. Backend corriendo en `http://localhost:8005`
2. Admin Panel corriendo en `http://localhost:7001`
3. Usuario con credenciales válidas

---

### 🔐 Paso 1: Login

1. Abre tu navegador y ve a: `http://localhost:7001`
2. Ingresa credenciales (ejemplo: `mesero@zgamersa.com` / contraseña)
3. Verifica que inicies sesión correctamente

**Verificar en consola del navegador:**
- ✅ No debe haber errores en rojo
- ✅ Debe mostrar "Login successful" o similar

---

### 📝 Paso 2: Crear Nueva Conversación (Con Validación Chilena)

1. Ve a la sección **"Conversaciones"**
2. Click en **"Nueva conversación"** o **"+"**
3. Llenar formulario:
   - **Nombre**: `Test Usuario Chile`
   - **Teléfono**: Escribe `912345678` (sin código de país)

**🎯 Verificar validación en tiempo real:**
- ✅ Al escribir, debe validar el formato
- ✅ Al salir del campo (blur), debe auto-formatear a `+56 9 1234 5678`
- ✅ Si escribes un número inválido (ej: `123`), debe mostrar error en rojo
- ✅ El placeholder debe mostrar `+56 9 1234 5678` (código chileno)

4. Selecciona **Canal**: WhatsApp, Teléfono o Web
5. Click en **"Crear conversación"**

**Resultado esperado:**
- ✅ Conversación creada exitosamente
- ✅ Redirección a la página de detalles de la conversación
- ✅ No debe haber errores en consola del navegador

---

### ⚙️ Paso 3: Probar Menú de Opciones (⋮)

En la página de detalles de una conversación:

1. **Buscar el icono de menú** (tres puntos verticales `⋮`) en la esquina superior derecha
2. Click en el menú

**Opciones disponibles:**
- 🔹 Asignar agente
- 🔹 Cerrar conversación
- 🔹 Eliminar conversación

---

#### A. Asignar Agente (PUT)

1. Click en **"Asignar agente"**
2. Ingresa un ID de agente (ej: `agent-123`)
3. Click en **"Asignar"**

**Verificar:**
- ✅ Mensaje de éxito: "Agente asignado correctamente"
- ✅ La conversación muestra el agente asignado
- ✅ **Consola del navegador**: NO debe haber error `apiService.conversations.update is not a function`
- ✅ **Network tab**: Debe ver `PUT /api/conversations/:id` con status `200`

---

#### B. Cerrar Conversación (PUT)

1. Click en menú `⋮`
2. Click en **"Cerrar conversación"**
3. Confirmar acción

**Verificar:**
- ✅ Mensaje de éxito: "Conversación cerrada"
- ✅ El status de la conversación cambia a "Cerrado"
- ✅ **Consola del navegador**: Sin errores
- ✅ **Network tab**: `PUT /api/conversations/:id` con `{status: "closed"}`

---

#### C. Eliminar Conversación (DELETE)

1. Click en menú `⋮`
2. Click en **"Eliminar conversación"**
3. Confirmar eliminación

**Verificar:**
- ✅ Mensaje de éxito: "Conversación eliminada"
- ✅ Redirección a la lista de conversaciones
- ✅ La conversación ya no aparece en la lista
- ✅ **Consola del navegador**: Sin errores
- ✅ **Network tab**: `DELETE /api/conversations/:id` con status `200`

---

## 🐛 Errores que YA NO Deberían Aparecer

### ❌ Antes (PROBLEMAS):
```javascript
// En consola del navegador:
Error: apiService.conversations.update is not a function
    at page.tsx:259

// En Network tab:
PUT http://localhost:8005/api/conversations/4  404 (Not Found)

// Al intentar asignar agente:
Error al asignar agente. Por favor intenta de nuevo.
```

### ✅ Ahora (FUNCIONANDO):
```javascript
// Sin errores en consola

// En Network tab:
PUT http://localhost:8005/api/conversations/4  200 OK
{
  "success": true,
  "data": { ... }
}

// Al asignar agente:
Agente asignado correctamente ✅
```

---

## 📊 Checklist de Verificación Completa

### Backend
- [ ] ✅ Health check responde correctamente
- [ ] ✅ GET /api/conversations funciona
- [ ] ✅ POST /api/conversations crea conversaciones
- [ ] ✅ PUT /api/conversations/:id actualiza (NUEVO)
- [ ] ✅ DELETE /api/conversations/:id elimina (NUEVO)
- [ ] ✅ Los logs del backend muestran los endpoints registrados

### Frontend
- [ ] ✅ Login funciona correctamente
- [ ] ✅ Listar conversaciones funciona
- [ ] ✅ Crear conversación funciona
- [ ] ✅ Validación de teléfono chileno en tiempo real
- [ ] ✅ Auto-formato de teléfono (+56 9 XXXX XXXX)
- [ ] ✅ Menú de opciones (⋮) se muestra
- [ ] ✅ Asignar agente funciona sin errores
- [ ] ✅ Cerrar conversación funciona sin errores
- [ ] ✅ Eliminar conversación funciona sin errores
- [ ] ✅ No hay errores en consola del navegador
- [ ] ✅ Network tab muestra requests exitosos (200 OK)

### Validación de Teléfonos
- [ ] ✅ Acepta `912345678` y lo formatea a `+56 9 1234 5678`
- [ ] ✅ Acepta `+56912345678` (ya formateado)
- [ ] ✅ Rechaza `123` (muy corto) con mensaje de error
- [ ] ✅ Rechaza `+1 555 1234` (código incorrecto) con mensaje de error
- [ ] ✅ Placeholder muestra `+56 9 1234 5678` (código chileno, NO +52 mexicano)

---

## 🎯 Casos de Prueba Específicos

### Caso 1: Crear y Gestionar Conversación Completa

```
1. Crear conversación con +56912345678
2. Verificar que se creó correctamente
3. Asignar agente "agent-123"
4. Verificar que el agente aparece en la conversación
5. Cerrar la conversación
6. Verificar que el status es "closed"
7. Eliminar la conversación
8. Verificar que ya no existe
```

**Resultado esperado**: ✅ Todo funciona sin errores

---

### Caso 2: Validación de Teléfono Incorrecto

```
1. Ir a "Nueva conversación"
2. En campo teléfono escribir: "123"
3. Intentar crear conversación
```

**Resultado esperado**:
- ❌ Muestra error: "El número es demasiado corto"
- ❌ No permite crear la conversación
- ✅ Error en texto rojo debajo del campo

---

### Caso 3: Teléfono con Formato Chileno Correcto

```
1. Nueva conversación
2. Teléfono: "9 1234 5678" (sin +56)
3. Al salir del campo (blur)
```

**Resultado esperado**:
- ✅ Auto-formatea a `+56 9 1234 5678`
- ✅ Sin errores
- ✅ Permite crear conversación

---

## 🔧 Comandos Útiles para Debugging

### Ver logs del backend en tiempo real:
```bash
tail -f /tmp/backend_final_with_changes.log
```

### Ver todos los endpoints registrados:
```bash
grep "Mapped.*conversations" /tmp/backend_final_with_changes.log
```

Deberías ver:
```
Mapped {/api/conversations, GET} route
Mapped {/api/conversations/:id, GET} route
Mapped {/api/conversations, POST} route
Mapped {/api/conversations/:id/messages, POST} route
Mapped {/api/conversations/:id, PUT} route      ← NUEVO
Mapped {/api/conversations/:id, DELETE} route   ← NUEVO
```

### Verificar Admin Panel está corriendo:
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:7001
```
Debe retornar: `200`

---

## ❓ Troubleshooting

### Problema: "apiService.conversations.update is not a function"
**Solución**: ✅ YA CORREGIDO. El archivo `/apps/admin-panel/src/lib/api.ts` ahora tiene los métodos `update` y `delete`.

### Problema: 404 en PUT /api/conversations/:id
**Solución**: ✅ YA CORREGIDO. El backend ahora tiene el endpoint `@Put(':id')` en el controlador.

### Problema: Validación de teléfono no funciona
**Solución**: ✅ YA IMPLEMENTADO. El archivo `/apps/admin-panel/src/lib/phone-validation.ts` contiene todas las funciones de validación chilena.

### Problema: Placeholder muestra +52 (México)
**Solución**: ✅ YA CORREGIDO. Ahora muestra `+56 9 1234 5678` (Chile).

---

## 📝 Notas Importantes

1. **Token JWT**: Para pruebas de API directas necesitas obtener un token válido haciendo login primero
2. **Permisos**: El usuario debe tener permisos para gestionar conversaciones
3. **Browser Console**: SIEMPRE revisa la consola del navegador durante las pruebas
4. **Network Tab**: Útil para ver los requests y responses exactos

---

## ✅ Resultado Final Esperado

Después de completar todas las pruebas, deberías poder:

1. ✅ Crear conversaciones con números chilenos válidos
2. ✅ Validación automática en tiempo real
3. ✅ Auto-formato a estándar internacional
4. ✅ Asignar agentes a conversaciones
5. ✅ Cerrar conversaciones
6. ✅ Eliminar conversaciones
7. ✅ Sin errores en consola del navegador
8. ✅ Todas las operaciones funcionan correctamente

---

**¿Listo para probar?** 🚀

Abre tu navegador, ve a `http://localhost:7001` y sigue la guía paso a paso.

**Reporte cualquier error que encuentres con:**
- Captura de pantalla del error
- Mensaje en consola del navegador
- Request/response en Network tab
