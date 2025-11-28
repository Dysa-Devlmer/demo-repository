# 🔓 Solución: Rate Limiter Bloqueado

**Fecha**: 13 de Octubre, 2025
**Problema**: "Demasiados intentos. Por favor, espera XXX segundos"
**Estado**: ✅ RESUELTO

---

## 📋 DESCRIPCIÓN DEL PROBLEMA

### Error Original
```
Demasiados intentos. Por favor, espera 444 segundos antes de volver a intentarlo.
```

### Causa
El **rate limiter progresivo** bloqueó los intentos de login porque detectó demasiados intentos fallidos consecutivos (probablemente de pruebas del sistema).

### Por Qué Ocurrió
- El rate limiter tiene progresión exponencial: 15s → 30s → 60s → 2min → 4min → 8min → ...
- Después de múltiples bloqueos, llegó a **444 segundos (7.4 minutos)**
- Esto es **correcto** según el diseño del sistema de seguridad

---

## ✅ SOLUCIONES

### Solución 1: Reiniciar Backend (Recomendado)

El rate limiter guarda el estado en memoria del backend. Al reiniciar, se limpia automáticamente.

```bash
# Reiniciar backend
docker-compose restart backend

# Esperar 5 segundos
sleep 5

# Verificar que está activo
curl http://localhost:8005/health
```

**Tiempo**: ~10 segundos
**Efectividad**: 100%

---

### Solución 2: Esperar el Tiempo Indicado

Si no quieres reiniciar el backend (por ejemplo, en producción con usuarios activos):

```bash
# El mensaje dice cuánto tiempo esperar
# Ejemplo: "espera 444 segundos"
# Convertir a minutos: 444 / 60 = 7.4 minutos

# Esperar y luego intentar de nuevo
```

**Ventaja**: No interrumpe el servicio
**Desventaja**: Puede ser un tiempo largo

---

### Solución 3: Limpiar Redis (Si se usa Redis para rate limiting)

**Nota**: Actualmente el rate limiter usa memoria in-process, no Redis. Pero si se cambia a Redis en el futuro:

```bash
# Ver keys de rate limiting
docker exec chatbotdysa-redis redis-cli KEYS 'ratelimit:*'

# Eliminar todas las keys de rate limiting
docker exec chatbotdysa-redis redis-cli --scan --pattern 'ratelimit:*' | \
  xargs -I {} docker exec chatbotdysa-redis redis-cli DEL {}

# O eliminar una IP específica
docker exec chatbotdysa-redis redis-cli DEL 'ratelimit:ip:127.0.0.1'
```

---

## 🔍 DIAGNÓSTICO

### Verificar si estás bloqueado

```bash
curl -X POST http://localhost:8005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}'
```

**Respuesta si está bloqueado**:
```json
{
  "statusCode": 429,
  "message": "Demasiados intentos. Por favor, espera 15 segundos...",
  "error": "Límite de Solicitudes Excedido",
  "retryAfter": 15,
  "failedAttempts": 1,
  "detail": "Intento 1: Espera 15s. Cada intento erróneo duplica el tiempo de espera."
}
```

**Respuesta si NO está bloqueado**:
```json
{
  "statusCode": 401,
  "message": "Credenciales inválidas",
  "error": "Unauthorized"
}
```

---

## 📊 PROGRESIÓN DEL RATE LIMITER

| Intento Fallido | Tiempo de Bloqueo | Total Acumulado |
|-----------------|-------------------|-----------------|
| 1° | 15 segundos | 15s |
| 2° | 30 segundos | 45s |
| 3° | 60 segundos (1 min) | 1m 45s |
| 4° | 120 segundos (2 min) | 3m 45s |
| 5° | 240 segundos (4 min) | 7m 45s |
| 6° | 480 segundos (8 min) | 15m 45s |
| 7° | 960 segundos (16 min) | 31m 45s |
| 8° | 1920 segundos (32 min) | 1h 3m 45s |
| 9+ | 3600 segundos (1 hora) | Máximo |

---

## 🛠️ COMANDOS ÚTILES

### Reiniciar Backend
```bash
docker-compose restart backend
```

### Ver Logs del Backend
```bash
docker logs -f chatbotdysa-backend
```

### Verificar Health después de Reiniciar
```bash
curl http://localhost:8005/health | jq '.data.status'
```

### Test de Login
```bash
curl -X POST http://localhost:8005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@zgamersa.com","password":"admin123"}' | jq '.success'
```

---

## 🚨 PREVENCIÓN

### Evitar Bloqueos Durante Desarrollo

1. **No hacer muchos intentos fallidos consecutivos**
   - Máximo: 5 intentos en desarrollo (50 requests/min)
   - Máximo: 5 intentos en producción (5 requests/15min)

2. **Usar credenciales correctas**
   - Email: `admin@zgamersa.com`
   - Password: `admin123`

3. **Reiniciar backend antes de tests exhaustivos**
   ```bash
   docker-compose restart backend
   ```

4. **No ejecutar scripts de testing múltiples veces**
   - El script `test-ecosystem.sh` hace 51 intentos para probar el rate limiter
   - Solo ejecutar cuando sea necesario

---

### Configurar Rate Limiter para Testing

Si necesitas desactivar temporalmente el rate limiter para desarrollo:

**Opción 1: Aumentar límites en desarrollo**

Editar `/apps/backend/src/common/guards/rate-limit.guard.ts`:

```typescript
const rateLimitConfig = {
  windowMs: isProd ? 15 * 60 * 1000 : 60 * 1000,
  maxRequests: isProd ? 5 : 1000,  // ← Aumentar a 1000 para dev
};
```

**Opción 2: Desactivar rate limiter en rutas específicas**

Agregar decorador en el controller:

```typescript
import { SkipRateLimit } from '@common/decorators/skip-rate-limit.decorator';

@SkipRateLimit()  // Desactiva rate limiter para este endpoint
@Post('login')
async login(@Body() loginDto: LoginDto) {
  // ...
}
```

---

## 📝 CASOS DE USO

### Caso 1: Desarrollo Local

**Situación**: Estás probando el login y te bloqueas accidentalmente

**Solución**:
```bash
docker-compose restart backend
# Esperar 5 segundos
# Probar de nuevo
```

---

### Caso 2: Testing Automatizado

**Situación**: Necesitas ejecutar tests que hacen muchos requests

**Solución**:
```bash
# Antes de ejecutar tests
docker-compose restart backend

# Ejecutar tests
npm run test

# Si se bloquea durante tests
docker-compose restart backend
npm run test
```

---

### Caso 3: Producción - Usuario Real Bloqueado

**Situación**: Un usuario legítimo se bloqueó por error

**Opciones**:

**A. Esperar** (Recomendado si el bloqueo es corto):
- Informar al usuario el tiempo de espera
- El bloqueo expira automáticamente

**B. Limpiar rate limiter para ese usuario**:
```bash
# Si se usa Redis (futuro)
docker exec chatbotdysa-redis redis-cli DEL 'ratelimit:user:USER_ID'
```

**C. Reiniciar backend** (Último recurso):
```bash
# Solo si hay pocos usuarios activos
docker-compose restart backend
```

---

### Caso 4: Ataque de Fuerza Bruta Detectado

**Situación**: El rate limiter está funcionando correctamente bloqueando un atacante

**Acción**:
- ✅ **No hacer nada** - El sistema está funcionando como debe
- ✅ Monitorear logs para ver la IP del atacante
- ✅ Considerar bloquear la IP permanentemente en firewall/nginx
- ✅ Documentar el incidente

```bash
# Ver logs del backend
docker logs chatbotdysa-backend --tail 100 | grep "429"
```

---

## 🎯 RESULTADO FINAL

### Después de Aplicar la Solución

```bash
# Test de login exitoso
curl -X POST http://localhost:8005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@zgamersa.com","password":"admin123"}'
```

**Respuesta esperada**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "admin@zgamersa.com",
      "firstName": "Admin",
      "roles": ["admin"]
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

✅ **Login funcionando correctamente**

---

## 📚 DOCUMENTACIÓN RELACIONADA

- **Implementación del Rate Limiter**: `Reportes/2025-10/sesion_2025-10-12_23-53-18_rate_limiter_y_limpieza/03_RATE_LIMITER_TECNICO.md`
- **Guía de Pruebas**: `Reportes/2025-10/sesion_2025-10-13_00-03-54_guia_completa_ecosistema/01_GUIA_PRUEBAS_COMPLETA.md`
- **Troubleshooting General**: `Reportes/2025-10/sesion_2025-10-13_00-03-54_guia_completa_ecosistema/README.md`

---

## ✅ CHECKLIST DE SOLUCIÓN

- [x] Backend reiniciado
- [x] Health check verificado
- [x] Login probado exitosamente
- [x] Usuario puede acceder al sistema
- [x] Documentación actualizada

---

**FIN DE LA SOLUCIÓN**

✅ Rate Limiter reseteado y funcionando correctamente
✅ Login operativo
✅ Sistema seguro y accesible
