# Solución al Error 401 Unauthorized

## 📋 Problema Identificado

El Admin Panel mostraba errores 401 (Unauthorized) en todos los endpoints del perfil:
- `GET /api/users/me`
- `POST /api/users/me/avatar`
- `PATCH /api/users/me`
- `POST /api/auth/change-password`
- `POST /api/auth/2fa/enable`
- etc.

## 🔍 Diagnóstico

### Causa Raíz
El token JWT almacenado en el `localStorage` del navegador estaba **expirado** o era **inválido**.

### Verificación
Los endpoints del backend funcionan correctamente:
```bash
✅ Backend funcionando (puerto 8005)
✅ Todos los endpoints responden 200 con token fresco
❌ Token del navegador expirado
```

## ✅ Solución Implementada

### 1. Solución Inmediata (Para el Usuario)

**OPCIÓN A: Hacer Logout/Login**
1. Abre el Admin Panel (http://localhost:7001)
2. Haz click en tu avatar → Logout
3. Vuelve a iniciar sesión con tus credenciales
4. El sistema generará un token fresco

**OPCIÓN B: Limpiar localStorage manualmente**
1. Abre Chrome DevTools (F12)
2. Ve a la pestaña "Console"
3. Ejecuta:
   ```javascript
   localStorage.clear();
   window.location.href = '/login';
   ```

### 2. Mejoras Implementadas en el Código

He actualizado **5 archivos** del Admin Panel para manejar automáticamente los errores 401:

#### Archivos Modificados:

1. **`/apps/admin-panel/src/app/profile/page.tsx`**
   - Detecta error 401 al cargar perfil
   - Muestra notificación: "⚠️ Sesión expirada"
   - Redirige automáticamente al login después de 2 segundos

2. **`/apps/admin-panel/src/components/profile/change-password-dialog.tsx`**
   - Detecta error 401 al cambiar contraseña
   - Redirige al login automáticamente

3. **`/apps/admin-panel/src/components/profile/setup-2fa-dialog.tsx`**
   - Detecta error 401 en 2 lugares:
     - Al iniciar setup de 2FA
     - Al verificar código 2FA
   - Redirige al login en ambos casos

4. **`/apps/admin-panel/src/components/profile/avatar-upload-dialog.tsx`**
   - Detecta error 401 al subir avatar
   - Redirige al login automáticamente

### 3. Comportamiento Mejorado

**ANTES:**
```
❌ Error genérico: "No se pudo cargar el perfil"
❌ Usuario confundido, no sabe qué hacer
❌ Endpoints siguen fallando
```

**AHORA:**
```
✅ Notificación clara: "⚠️ Sesión expirada"
✅ Mensaje útil: "Por favor, inicia sesión nuevamente"
✅ Redirección automática al login en 2 segundos
✅ localStorage limpiado automáticamente
```

## 🧪 Script de Diagnóstico

He creado un script que puedes ejecutar en la consola del navegador para diagnosticar problemas de token:

**Ubicación:** `/tmp/fix-token-issue.js`

**Cómo usar:**
1. Abre Chrome DevTools (F12)
2. Ve a la pestaña "Console"
3. Copia y pega el contenido del archivo `fix-token-issue.js`
4. Presiona Enter

El script te mostrará:
- ✅ Si existe un token en localStorage
- ✅ Si el token está expirado o es válido
- ✅ Cuánto tiempo le queda al token
- ✅ Si el backend acepta el token
- ✅ Instrucciones para solucionar el problema

## 📝 Código de Ejemplo

### Detección de Error 401

```typescript
const response = await fetch(`${API_URL}/api/users/me`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});

// NUEVO: Detectar específicamente error 401
if (response.status === 401) {
  toast({
    title: '⚠️ Sesión expirada',
    description: 'Tu sesión ha expirado. Redirigiendo al login...',
    variant: 'destructive',
  });

  // Limpiar localStorage
  setTimeout(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    router.push('/login');
  }, 2000);

  return;
}

// Continuar con el flujo normal
if (!response.ok) {
  throw new Error('Failed to load profile');
}
```

## 🔒 Prevención Futura

### Por qué expiran los tokens

Los tokens JWT tienen un tiempo de expiración configurado por seguridad:
- **Tiempo de vida:** 1 hora (3600 segundos)
- **Razón:** Si un token es robado, solo será válido por 1 hora
- **Solución:** El usuario debe hacer login nuevamente

### Cuándo ocurre el problema

1. **Backend reiniciado:** Si reinicias el backend, los tokens anteriores se invalidan
2. **Token expirado:** Después de 1 hora sin actividad
3. **localStorage limpiado:** Si se limpia la caché del navegador

### Recomendaciones para Producción

1. **Implementar refresh tokens:**
   - Token de acceso: 15 minutos
   - Refresh token: 7 días
   - Renovación automática en background

2. **Interceptor HTTP global:**
   - Detectar todos los 401 en un solo lugar
   - Renovar token automáticamente
   - Solo redirigir si el refresh también falla

3. **Notificación de expiración:**
   - Mostrar banner: "Tu sesión expirará en 5 minutos"
   - Botón: "Extender sesión"

## 📊 Resumen

| Componente | Estado | Acción |
|-----------|---------|--------|
| Backend | ✅ Funcionando | Todos los endpoints OK |
| Token fresco | ✅ Funcionando | Login genera token válido |
| Token expirado | ✅ Manejado | Redirección automática |
| Experiencia usuario | ✅ Mejorada | Mensajes claros |

## 🚀 Próximos Pasos

1. **Ahora mismo:** Hacer logout/login para obtener token fresco
2. **Futuro cercano:** Implementar refresh token automático
3. **Futuro lejano:** Sistema de sesiones con Redis

## 📞 Verificación

Para verificar que todo funciona:

```bash
# Ejecutar script de prueba
bash /tmp/test-endpoints.sh
```

Deberías ver:
```
✅ Token obtenido
✅ 200 - Perfil cargado correctamente
✅ 200 - Sesiones obtenidas
✅ TODOS LOS ENDPOINTS FUNCIONANDO CORRECTAMENTE
```

---

**Fecha:** 2025-11-12
**Estado:** ✅ SOLUCIONADO
