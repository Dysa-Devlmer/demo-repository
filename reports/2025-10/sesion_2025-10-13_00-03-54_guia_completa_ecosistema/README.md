# 📚 Guía Completa del Ecosistema ChatBotDysa

**Fecha**: 13 de Octubre, 2025 - 00:03
**Versión**: 1.0.0
**Estado**: ✅ COMPLETADO

---

## 🎯 PROPÓSITO DE ESTA DOCUMENTACIÓN

Esta carpeta contiene **toda la información necesaria para conocer, probar y entender el ecosistema completo de ChatBotDysa Enterprise**.

Si tienes preguntas sobre:
- ❓ **"¿Cómo pruebo todo el ecosistema?"** → Lee `01_GUIA_PRUEBAS_COMPLETA.md`
- ❓ **"¿Cómo está construido el sistema?"** → Lee `02_ARQUITECTURA_ECOSISTEMA.md`
- ❓ **"¿Todo está funcionando?"** → Lee `03_ESTADO_ACTUAL_SISTEMA.md`
- ❓ **"¿Puedo automatizar las pruebas?"** → Ejecuta `./test-ecosystem.sh`

---

## 📑 ÍNDICE DE DOCUMENTOS

### 1️⃣ [Guía de Pruebas Completa](./01_GUIA_PRUEBAS_COMPLETA.md)

**Contenido**:
- ✅ Verificación rápida del sistema
- ✅ Pruebas por servicio (Backend, Admin Panel, Landing, PostgreSQL, Redis, Ollama)
- ✅ Pruebas de integración
- ✅ Pruebas de seguridad (Rate Limiter, JWT, Validaciones)
- ✅ Pruebas de rendimiento
- ✅ Troubleshooting
- ✅ Credenciales y URLs de acceso

**Cuándo leerlo**: Cuando quieras **probar que todo funciona correctamente**

**Ejemplos de comandos**:
```bash
# Verificar health de backend
curl http://localhost:8005/health | jq '.'

# Login
curl -X POST http://localhost:8005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@zgamersa.com","password":"admin123"}'

# Verificar PostgreSQL
docker exec chatbotdysa-postgres pg_isready -U postgres
```

---

### 2️⃣ [Arquitectura del Ecosistema](./02_ARQUITECTURA_ECOSISTEMA.md)

**Contenido**:
- ✅ Visión general del ecosistema
- ✅ Arquitectura de alto nivel (diagramas)
- ✅ Componentes del sistema (Backend, Frontend, Base de datos, IA)
- ✅ Stack tecnológico completo
- ✅ Flujo de datos
- ✅ Seguridad y autenticación
- ✅ Esquema de base de datos
- ✅ Deployment con Docker Compose

**Cuándo leerlo**: Cuando quieras **entender cómo funciona el sistema internamente**

**Aprenderás**:
- Cómo se comunican los servicios
- Estructura de carpetas y archivos
- Tecnologías usadas
- Flujos de autenticación
- Integración con IA (Ollama)

---

### 3️⃣ [Estado Actual del Sistema](./03_ESTADO_ACTUAL_SISTEMA.md)

**Contenido**:
- ✅ Resumen ejecutivo del estado
- ✅ Estado de cada servicio (Backend, Admin, Landing, DB, Redis, IA)
- ✅ Endpoints disponibles
- ✅ Features activos
- ✅ Credenciales de acceso
- ✅ Métricas de rendimiento
- ✅ Problemas conocidos (ninguno actualmente ✅)
- ✅ Historial de cambios recientes
- ✅ Próximas mejoras recomendadas

**Cuándo leerlo**: Cuando quieras **saber el estado actual del sistema**

**Información clave**:
- ✅ Backend: Operativo (26+ horas uptime)
- ✅ Admin Panel: Operativo
- ✅ Landing Page: Operativo (2+ días uptime)
- ✅ PostgreSQL: Operativo y conectado
- ✅ Redis: Operativo
- ✅ Ollama AI: Operativo con modelo phi3:mini

---

### 4️⃣ [Script de Testing Automatizado](./test-ecosystem.sh)

**Propósito**: Script bash que verifica automáticamente **todos los servicios y funcionalidades**.

**Qué hace**:
1. ✅ Verifica servicios Docker
2. ✅ Prueba Backend API (health, login, endpoints)
3. ✅ Prueba Admin Panel (páginas principales)
4. ✅ Prueba Landing Page
5. ✅ Verifica PostgreSQL (conexión, base de datos, usuario admin)
6. ✅ Verifica Redis (ping, versión)
7. ✅ Verifica Ollama (modelo disponible, generación de texto)
8. ✅ Prueba Rate Limiter progresivo
9. ✅ Tests de integración end-to-end
10. ✅ Muestra uso de recursos

**Cómo usar**:
```bash
# Dar permisos de ejecución (ya está hecho)
chmod +x test-ecosystem.sh

# Ejecutar
./test-ecosystem.sh
```

**Output esperado**:
```
╔════════════════════════════════════════════════════════╗
║  ChatBotDysa - Verificación Completa del Ecosistema   ║
╚════════════════════════════════════════════════════════╝

Fecha: 2025-10-13 00:15:00

========================================
1️⃣  SERVICIOS DOCKER
========================================

➜ Verificando servicios Docker corriendo...

NAMES                  STATUS                  PORTS
chatbotdysa-backend    Up 26 hours (healthy)   0.0.0.0:8005->8005/tcp
chatbotdysa-postgres   Up 2 days (healthy)     0.0.0.0:15432->5432/tcp
...

✅ PASS - Todos los servicios Docker están corriendo (5/5)

[... más tests ...]

========================================
📊 RESUMEN DE RESULTADOS
========================================

Total de pruebas: 35
Exitosas: 35
Fallidas: 0

Tasa de éxito: 100%

╔════════════════════════════════════════════╗
║  ✅ TODOS LOS TESTS PASARON EXITOSAMENTE  ║
╚════════════════════════════════════════════╝

El ecosistema ChatBotDysa está 100% operativo
```

---

## 🚀 ACCESO RÁPIDO

### URLs del Sistema

| Servicio | URL | Puerto | Estado |
|----------|-----|--------|--------|
| Backend API | http://localhost:8005 | 8005 | ✅ Operativo |
| API Docs (Swagger) | http://localhost:8005/docs | 8005 | ✅ Disponible |
| Admin Panel | http://localhost:7001 | 7001 | ✅ Operativo |
| Landing Page | http://localhost:3004 | 3004 | ✅ Operativo |

### Credenciales

**Usuario Admin**:
- **Email**: `admin@zgamersa.com`
- **Password**: `admin123`
- **Roles**: `["admin"]`
- **Permisos**: Todos

### Servicios de Infraestructura

| Servicio | Host | Puerto | Cómo conectar |
|----------|------|--------|---------------|
| PostgreSQL | localhost | 15432 | `docker exec -it chatbotdysa-postgres psql -U postgres -d chatbotdysa` |
| Redis | localhost | 16379 | `docker exec -it chatbotdysa-redis redis-cli` |
| Ollama | localhost | 21434 | `curl http://localhost:21434/api/tags` |

---

## 🧪 PRUEBAS RÁPIDAS

### Test 1: ¿Está todo funcionando?

```bash
# Ejecutar script automatizado
./test-ecosystem.sh
```

**Tiempo**: ~30 segundos
**Resultado esperado**: "✅ TODOS LOS TESTS PASARON EXITOSAMENTE"

---

### Test 2: ¿Puedo hacer login?

```bash
curl -X POST http://localhost:8005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@zgamersa.com","password":"admin123"}' | jq '.'
```

**Resultado esperado**:
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "admin@zgamersa.com",
      "firstName": "Admin",
      "roles": ["admin"]
    }
  }
}
```

---

### Test 3: ¿La base de datos funciona?

```bash
docker exec chatbotdysa-postgres psql -U postgres -d chatbotdysa -c \
  "SELECT email, roles FROM users WHERE id = 1;"
```

**Resultado esperado**:
```
         email         |  roles
-----------------------+---------
 admin@zgamersa.com   | {admin}
```

---

### Test 4: ¿El rate limiter funciona?

```bash
# Hacer 51 intentos para activar bloqueo
for i in {1..51}; do
  curl -s -X POST http://localhost:8005/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' > /dev/null
done

# Verificar bloqueo
curl -X POST http://localhost:8005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}' | jq '.'
```

**Resultado esperado**:
```json
{
  "statusCode": 429,
  "message": "Demasiados intentos. Por favor, espera 15 segundos...",
  "error": "Límite de Solicitudes Excedido",
  "retryAfter": 15,
  "failedAttempts": 1
}
```

---

### Test 5: ¿La IA funciona?

```bash
curl -X POST http://localhost:21434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "phi3:mini",
    "prompt": "Di hola en una oración corta",
    "stream": false
  }' | jq '.response'
```

**Resultado esperado**: Respuesta generada por la IA

---

## 📊 COMANDOS ÚTILES

### Docker

```bash
# Ver todos los servicios
docker ps

# Ver logs de backend
docker logs -f chatbotdysa-backend

# Reiniciar servicio
docker-compose restart backend

# Reconstruir servicio
docker-compose build --no-cache backend

# Ver uso de recursos
docker stats --no-stream

# Limpiar sistema (⚠️ CUIDADO)
docker system prune -f
```

### PostgreSQL

```bash
# Conectar a la base de datos
docker exec -it chatbotdysa-postgres psql -U postgres -d chatbotdysa

# Ver todas las tablas
docker exec chatbotdysa-postgres psql -U postgres -d chatbotdysa -c "\dt"

# Contar registros
docker exec chatbotdysa-postgres psql -U postgres -d chatbotdysa -c \
  "SELECT 'users' as table, COUNT(*) FROM users;"

# Backup
docker exec chatbotdysa-postgres pg_dump -U postgres chatbotdysa > backup.sql
```

### Redis

```bash
# Ping
docker exec chatbotdysa-redis redis-cli ping

# Ver todas las keys
docker exec chatbotdysa-redis redis-cli KEYS '*'

# Limpiar cache (⚠️ CUIDADO)
docker exec chatbotdysa-redis redis-cli FLUSHALL
```

### Ollama

```bash
# Ver modelos disponibles
curl http://localhost:21434/api/tags | jq '.models'

# Descargar modelo
docker exec chatbotdysa-ollama ollama pull phi3:mini

# Generar texto
curl -X POST http://localhost:21434/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model":"phi3:mini","prompt":"Hola","stream":false}'
```

---

## 🛠️ TROUBLESHOOTING

### Problema: Un servicio no responde

```bash
# 1. Ver si está corriendo
docker ps | grep chatbotdysa-backend

# 2. Ver logs
docker logs chatbotdysa-backend --tail 100

# 3. Reiniciar
docker-compose restart backend

# 4. Rebuild si es necesario
docker-compose build --no-cache backend
docker-compose up -d backend
```

### Problema: Base de datos no conecta

```bash
# 1. Verificar que postgres está corriendo
docker ps | grep postgres

# 2. Verificar que acepta conexiones
docker exec chatbotdysa-postgres pg_isready -U postgres

# 3. Ver logs
docker logs chatbotdysa-postgres --tail 50

# 4. Reiniciar si es necesario
docker-compose restart postgres
```

### Problema: Admin Panel da error 500

```bash
# 1. Ver logs
docker logs chatbotdysa-admin --tail 100

# 2. Verificar que backend está accesible
curl http://localhost:8005/health

# 3. Reconstruir
docker-compose build --no-cache admin-panel
docker-compose up -d admin-panel
```

---

## 📈 ESTRUCTURA DE ARCHIVOS EN ESTA CARPETA

```
sesion_2025-10-13_00-03-54_guia_completa_ecosistema/
│
├── README.md                           # 📄 Este archivo (índice)
│
├── 01_GUIA_PRUEBAS_COMPLETA.md         # 🧪 Guía de pruebas paso a paso
│   • Verificación rápida
│   • Pruebas por servicio
│   • Pruebas de integración
│   • Pruebas de seguridad
│   • Troubleshooting
│
├── 02_ARQUITECTURA_ECOSISTEMA.md       # 🏗️ Documentación de arquitectura
│   • Visión general
│   • Diagramas
│   • Componentes
│   • Stack tecnológico
│   • Flujos de datos
│   • Base de datos
│
├── 03_ESTADO_ACTUAL_SISTEMA.md         # 📊 Reporte de estado
│   • Estado de cada servicio
│   • Features activos
│   • Métricas
│   • Problemas conocidos
│   • Historial de cambios
│
└── test-ecosystem.sh                   # 🤖 Script de testing automatizado
    • Ejecutable
    • Verifica todos los servicios
    • Tests de integración
    • Reporte de resultados
```

---

## 🎓 PARA APRENDER EL SISTEMA

### Si eres nuevo en el proyecto:

1. **Lee primero**: `02_ARQUITECTURA_ECOSISTEMA.md`
   - Entenderás cómo está construido
   - Conocerás las tecnologías
   - Verás los diagramas

2. **Luego lee**: `03_ESTADO_ACTUAL_SISTEMA.md`
   - Conocerás el estado actual
   - Verás las features disponibles
   - Obtendrás credenciales

3. **Después ejecuta**: `./test-ecosystem.sh`
   - Verificarás que todo funciona
   - Verás el sistema en acción

4. **Finalmente explora**: `01_GUIA_PRUEBAS_COMPLETA.md`
   - Aprenderás a probar cada componente
   - Conocerás todos los endpoints
   - Dominarás el troubleshooting

---

### Si eres desarrollador:

1. **Arquitectura** → `02_ARQUITECTURA_ECOSISTEMA.md`
2. **Estructura de código** → Revisa `/apps/backend/src/`
3. **APIs** → http://localhost:8005/docs (Swagger)
4. **Testing** → `./test-ecosystem.sh` y `01_GUIA_PRUEBAS_COMPLETA.md`

---

### Si eres QA/Tester:

1. **Estado del sistema** → `03_ESTADO_ACTUAL_SISTEMA.md`
2. **Guía de pruebas** → `01_GUIA_PRUEBAS_COMPLETA.md`
3. **Automatización** → `./test-ecosystem.sh`
4. **Troubleshooting** → Sección en `01_GUIA_PRUEBAS_COMPLETA.md`

---

### Si eres admin/DevOps:

1. **Deployment** → Sección en `02_ARQUITECTURA_ECOSISTEMA.md`
2. **Estado del sistema** → `03_ESTADO_ACTUAL_SISTEMA.md`
3. **Monitoreo** → `./test-ecosystem.sh` (ejecutar periódicamente)
4. **Troubleshooting** → `01_GUIA_PRUEBAS_COMPLETA.md`

---

## 📞 INFORMACIÓN DE CONTACTO

### Proyecto
- **Nombre**: ChatBotDysa Enterprise
- **Versión**: 1.0.0
- **Entorno**: Desarrollo/Producción

### URLs
- Backend: http://localhost:8005
- Admin: http://localhost:7001
- Landing: http://localhost:3004

### Repositorio
- Ubicación: `/Users/devlmer/ChatBotDysa/`
- Documentación: `/Users/devlmer/ChatBotDysa/docs/`
- Reportes: `/Users/devlmer/ChatBotDysa/Reportes/`

---

## ✅ CHECKLIST DE USO

### Para verificar el sistema ahora mismo:

- [ ] Ejecutar `./test-ecosystem.sh`
- [ ] Abrir http://localhost:7001 en navegador
- [ ] Hacer login con admin@zgamersa.com / admin123
- [ ] Ver http://localhost:8005/docs (API docs)
- [ ] Probar endpoint de health: `curl http://localhost:8005/health`

### Para aprender el sistema:

- [ ] Leer `02_ARQUITECTURA_ECOSISTEMA.md`
- [ ] Leer `03_ESTADO_ACTUAL_SISTEMA.md`
- [ ] Explorar `01_GUIA_PRUEBAS_COMPLETA.md`
- [ ] Ejecutar comandos de prueba
- [ ] Revisar código en `/apps/backend/src/`

---

## 🎉 CONCLUSIÓN

Esta carpeta contiene **TODO lo que necesitas saber sobre el ecosistema ChatBotDysa**:

✅ **Cómo probarlo** - Guía completa + Script automatizado
✅ **Cómo funciona** - Arquitectura detallada + Diagramas
✅ **Estado actual** - Reporte completo de todos los servicios

**Sistema 100% documentado y funcional** 🚀

---

**Creado**: 13 de Octubre, 2025
**Última actualización**: 13 de Octubre, 2025
**Desarrollado por**: Claude Code (Anthropic)
**Estado**: ✅ COMPLETADO
