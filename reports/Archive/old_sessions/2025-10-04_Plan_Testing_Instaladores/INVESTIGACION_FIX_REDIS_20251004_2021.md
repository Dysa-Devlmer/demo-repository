# INVESTIGACIÓN Y FIX - REDIS CONNECTION ERROR
## ChatBotDysa Enterprise - Issue Crítico #1

---

**📅 Fecha:** 2025-10-04
**⏰ Hora inicio:** 20:21:00
**🎯 Objetivo:** Resolver Redis connection error que bloquea API
**🔴 Prioridad:** CRÍTICA

---

## 🐛 PROBLEMA IDENTIFICADO

### Síntoma
Backend no puede conectarse a Redis, causando:
- ❌ Endpoints API retornando 500
- ❌ Login no funcional
- ❌ Cache no operacional

### Evidencia de Logs
```
[ioredis] Unhandled error event: Error: connect ECONNREFUSED 127.0.0.1:6379
[Redis] Connecting to redis:6379
[Redis] Retry attempt 2400, waiting 2000ms
```

### Contradicción Observada
- **Log muestra:** `Connecting to redis:6379` (correcto)
- **Error muestra:** `connect ECONNREFUSED 127.0.0.1:6379` (incorrecto)

**Conclusión:** La configuración no está llegando correctamente a ioredis

---

## 📋 CÓDIGO ACTUAL

### database.module.ts (Líneas 38-67)

```typescript
CacheModule.registerAsync({
  isGlobal: true,
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (config: ConfigService) => {
    const redisHost = config.get<string>("REDIS_HOST", "redis");
    const redisPort = config.get<number>("REDIS_PORT", 6379);

    console.log(`[Redis] Connecting to ${redisHost}:${redisPort}`);

    return {
      store: await redisStore({
        socket: {                    // ← PROBLEMA AQUÍ
          host: redisHost,
          port: redisPort,
        },
        ttl: 60 * 5,
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 50, 2000);
          console.log(`[Redis] Retry attempt ${times}, waiting ${delay}ms`);
          return delay;
        },
        reconnectOnError: (err: Error) => {
          console.error('[Redis] Connection error:', err.message);
          return true;
        },
      }),
    };
  },
}),
```

---

## 🔍 ANÁLISIS DEL PROBLEMA

### Hipótesis 1: Sintaxis Incorrecta de `socket`

**Documentación cache-manager-ioredis-yet:**
La biblioteca usa ioredis bajo el capó. Según documentación de ioredis, la configuración puede ser:

**Opción A: Configuración plana (sin socket wrapper)**
```typescript
{
  host: 'redis',
  port: 6379,
  // otras opciones...
}
```

**Opción B: URL string**
```typescript
{
  url: 'redis://redis:6379',
  // otras opciones...
}
```

**Opción C: Con socket (Node-Redis style)**
```typescript
{
  socket: {
    host: 'redis',
    port: 6379,
  }
}
```

**Problema:** Estamos usando Opción C (socket wrapper) pero parece que `cache-manager-ioredis-yet` espera Opción A o B.

### Hipótesis 2: Orden de Propiedades

Es posible que `cache-manager-ioredis-yet` tenga expectativas específicas sobre el orden o estructura de las propiedades.

### Hipótesis 3: Async/Await Issue

El `await redisStore()` podría no estar manejando correctamente la configuración asíncrona.

---

## 💡 SOLUCIONES PROPUESTAS

### Solución 1: Usar Configuración Plana (RECOMENDADA)

**Cambio:**
```typescript
return {
  store: await redisStore({
    host: redisHost,          // Sin 'socket' wrapper
    port: redisPort,
    ttl: 60 * 5,
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      console.log(`[Redis] Retry attempt ${times}, waiting ${delay}ms`);
      return delay;
    },
    reconnectOnError: (err: Error) => {
      console.error('[Redis] Connection error:', err.message);
      return true;
    },
  }),
};
```

**Ventajas:**
- ✅ Sintaxis más directa
- ✅ Compatible con ioredis estándar
- ✅ Menos anidamiento

**Riesgo:** Bajo - Es sintaxis estándar de ioredis

---

### Solución 2: Usar URL String

**Cambio:**
```typescript
const redisUrl = `redis://${redisHost}:${redisPort}`;
console.log(`[Redis] Connecting to ${redisUrl}`);

return {
  store: await redisStore({
    url: redisUrl,
    ttl: 60 * 5,
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      console.log(`[Redis] Retry attempt ${times}, waiting ${delay}ms`);
      return delay;
    },
    reconnectOnError: (err: Error) => {
      console.error('[Redis] Connection error:', err.message);
      return true;
    },
  }),
};
```

**Ventajas:**
- ✅ URL es muy explícita
- ✅ Funciona en muchas bibliotecas
- ✅ Fácil de debuggear

**Riesgo:** Bajo - URL es formato estándar

---

### Solución 3: Configuración Explícita con Opciones de Socket

**Cambio:**
```typescript
return {
  store: await redisStore({
    host: redisHost,
    port: redisPort,
    connectTimeout: 10000,
    lazyConnect: false,
    ttl: 60 * 5,
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      console.log(`[Redis] Retry attempt ${times}, waiting ${delay}ms`);
      return delay;
    },
    reconnectOnError: (err: Error) => {
      console.error('[Redis] Connection error:', err.message);
      return true;
    },
  }),
};
```

**Ventajas:**
- ✅ Más control sobre conexión
- ✅ Timeout explícito
- ✅ lazyConnect: false asegura conexión inmediata

**Riesgo:** Bajo

---

## 🧪 PLAN DE TESTING

### Pre-Fix Verification
1. ✅ Verificar variables de entorno correctas
2. ✅ Verificar Redis service UP
3. ✅ Verificar conectividad de red

### Aplicar Fix
1. Implementar Solución 1 (configuración plana)
2. Rebuild backend container
3. Monitor logs de inicio

### Post-Fix Verification
1. Verificar logs NO muestran error 127.0.0.1
2. Verificar conexión Redis exitosa
3. Test endpoint `/health` - debe mostrar Redis connected
4. Test endpoint `/api/menu` - debe retornar 200
5. Test endpoint `/api/auth/login` - debe funcionar

---

## 📝 CÓDIGO COMPLETO PROPUESTO

### database.module.ts - Versión Corregida

```typescript
import { Module, Global } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { DatabaseService } from "./database.service";
import * as entities from "./entities";
import { CacheModule } from "@nestjs/cache-manager";
import { redisStore } from "cache-manager-ioredis-yet";

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        host: config.get<string>("DATABASE_HOST", "localhost"),
        port: config.get<number>("DATABASE_PORT", 5432),
        username: config.get<string>("DATABASE_USER", "postgres"),
        password:
          config.get<string>("DATABASE_PASS") ??
          config.get<string>("DATABASE_PASSWORD", "supersecret"),
        database: config.get<string>("DATABASE_NAME", "chatbotdysa"),
        entities: Object.values(entities),
        synchronize: false,
        migrationsRun: false,
        migrations: [__dirname + "/../migrations/*{.ts,.js}"],
        autoLoadEntities: true,
        retryAttempts: 10,
        retryDelay: 3000,
        logging: ["error", "migration"],
        ssl: false,
      }),
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const redisHost = config.get<string>("REDIS_HOST", "redis");
        const redisPort = config.get<number>("REDIS_PORT", 6379);

        console.log(`[Redis] Connecting to ${redisHost}:${redisPort}`);

        return {
          store: await redisStore({
            // ✅ FIX: Usar configuración plana en lugar de socket wrapper
            host: redisHost,
            port: redisPort,
            connectTimeout: 10000,
            lazyConnect: false,
            ttl: 60 * 5, // cache 5 min
            retryStrategy: (times: number) => {
              const delay = Math.min(times * 50, 2000);
              console.log(`[Redis] Retry attempt ${times}, waiting ${delay}ms`);
              return delay;
            },
            reconnectOnError: (err: Error) => {
              console.error('[Redis] Connection error:', err.message);
              return true; // Always try to reconnect
            },
          }),
        };
      },
    }),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService, TypeOrmModule, CacheModule],
})
export class DatabaseModule {}
```

### Cambios Realizados (Líneas 49-65)

**ANTES:**
```typescript
return {
  store: await redisStore({
    socket: {              // ❌ PROBLEMA
      host: redisHost,
      port: redisPort,
    },
    ttl: 60 * 5,
    // ...
  }),
};
```

**DESPUÉS:**
```typescript
return {
  store: await redisStore({
    host: redisHost,           // ✅ SOLUCIÓN
    port: redisPort,           // ✅ SOLUCIÓN
    connectTimeout: 10000,     // ✅ NUEVO
    lazyConnect: false,        // ✅ NUEVO
    ttl: 60 * 5,
    // ...
  }),
};
```

---

## 🔧 IMPLEMENTACIÓN DEL FIX

### Paso 1: Backup del Código Actual
```bash
cp apps/backend/src/database/database.module.ts \
   apps/backend/src/database/database.module.ts.backup-20251004-2021
```

### Paso 2: Aplicar Fix
Editar `apps/backend/src/database/database.module.ts` con los cambios propuestos.

### Paso 3: Rebuild Backend
```bash
cd /Users/devlmer/ChatBotDysa
docker-compose build backend
docker-compose up -d backend
```

### Paso 4: Monitor Logs
```bash
docker logs -f chatbotdysa-backend
```

**Logs Esperados (Success):**
```
[Redis] Connecting to redis:6379
[Redis] Connected successfully to redis:6379
[Nest] INFO  Application listening on port 8005
```

**Logs NO Deseados (Failure):**
```
[ioredis] Unhandled error event: Error: connect ECONNREFUSED 127.0.0.1:6379
```

### Paso 5: Testing
```bash
# Test health endpoint
curl http://localhost:8005/health

# Test menu endpoint
curl http://localhost:8005/api/menu

# Test login endpoint
curl -X POST http://localhost:8005/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@restaurante.com","password":"admin123"}'
```

---

## 📊 CRITERIOS DE ÉXITO

### ✅ Fix Exitoso Si:
1. Logs NO muestran error de 127.0.0.1:6379
2. Logs muestran "Connected successfully to redis:6379"
3. Endpoint `/health` incluye Redis connected: true
4. Endpoint `/api/menu` retorna 200 OK (no 500)
5. Endpoint `/api/auth/login` retorna 200 OK con token

### ❌ Fix Fallido Si:
1. Persisten errores de conexión
2. Endpoints siguen retornando 500
3. Logs muestran retry infinito

---

## 🎯 PRÓXIMOS PASOS POST-FIX

### Si Fix Exitoso ✅
1. **Testing Funcional Completo (Round 2)**
   - Validar TODOS los endpoints
   - Testing flujos end-to-end
   - Performance testing

2. **Commit y Documentación**
   - Commit del fix con mensaje descriptivo
   - Actualizar documentación técnica
   - Marcar Issue #1 como resuelto

3. **Continuar con Roadmap**
   - Testing Linux Ubuntu 22.04
   - Testing Windows 11
   - Deployment producción

### Si Fix Falla ❌
1. **Investigación Adicional**
   - Revisar documentación cache-manager-ioredis-yet
   - Probar Solución 2 (URL string)
   - Contactar comunidad/GitHub issues

2. **Plan B: Alternativa Redis Client**
   - Evaluar usar redis package directo
   - Evaluar cache-manager-redis-yet
   - Evaluar @nestjs/microservices Redis

---

## 📝 NOTAS DE IMPLEMENTACIÓN

### Por Qué Este Fix Debería Funcionar

**Razón 1: Sintaxis Estándar**
- ioredis acepta `{host, port}` como configuración principal
- No requiere wrapper `socket` en este caso

**Razón 2: cache-manager-ioredis-yet**
- Pasa configuración directamente a ioredis
- Espera opciones en formato ioredis estándar

**Razón 3: Evidencia**
- Logs muestran variables correctas (redis:6379)
- Error muestra hardcoded (127.0.0.1:6379)
- Indica que configuración no llega a ioredis

### Opciones Agregadas

**connectTimeout: 10000**
- Timeout de 10 segundos para conexión
- Evita hangs infinitos
- Útil para debugging

**lazyConnect: false**
- Fuerza conexión inmediata al iniciar
- Permite detectar errores en startup
- Mejor que fallar silenciosamente después

---

## 🔍 DEBUGGING ADICIONAL

Si el fix no funciona, agregar más logs:

```typescript
useFactory: async (config: ConfigService) => {
  const redisHost = config.get<string>("REDIS_HOST", "redis");
  const redisPort = config.get<number>("REDIS_PORT", 6379);

  console.log(`[Redis] Connecting to ${redisHost}:${redisPort}`);

  const redisConfig = {
    host: redisHost,
    port: redisPort,
    connectTimeout: 10000,
    lazyConnect: false,
    ttl: 60 * 5,
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      console.log(`[Redis] Retry attempt ${times}, waiting ${delay}ms`);
      return delay;
    },
    reconnectOnError: (err: Error) => {
      console.error('[Redis] Connection error:', err.message);
      return true;
    },
  };

  // ✅ NUEVO: Log completo de configuración
  console.log('[Redis] Full config:', JSON.stringify(redisConfig, null, 2));

  const store = await redisStore(redisConfig);

  // ✅ NUEVO: Log de store creado
  console.log('[Redis] Store created successfully');

  return { store };
},
```

---

**📅 Creado:** 2025-10-04 20:21:00
**🎯 Prioridad:** 🔴 CRÍTICA
**⏱️ Tiempo estimado fix:** 15-30 minutos
**🔧 Solución propuesta:** Configuración plana (sin socket wrapper)

---

*Investigación y Fix - Redis Connection Error*
*ChatBotDysa Enterprise - Issue Crítico #1*
*Estado: 📝 PROPUESTA LISTA PARA IMPLEMENTAR*

**SIGUIENTE PASO: IMPLEMENTAR FIX** →
