# 🔧 Guía de Troubleshooting - ChatBotDysa

**Versión:** 1.0.0
**Fecha:** Octubre 2025

---

## 📋 Tabla de Contenidos

1. [Problemas de Instalación](#problemas-de-instalación)
2. [Problemas con Docker](#problemas-con-docker)
3. [Problemas de Base de Datos](#problemas-de-base-de-datos)
4. [Problemas con el Backend](#problemas-con-el-backend)
5. [Problemas con el Frontend](#problemas-con-el-frontend)
6. [Problemas con Ollama AI](#problemas-con-ollama-ai)
7. [Problemas de Red y Conectividad](#problemas-de-red-y-conectividad)
8. [Problemas de Performance](#problemas-de-performance)
9. [Problemas con el Widget](#problemas-con-el-widget)
10. [Problemas de Seguridad](#problemas-de-seguridad)
11. [Logs y Debugging](#logs-y-debugging)

---

## Problemas de Instalación

### Error: "Docker no está instalado"

**Síntoma:**
```bash
$ docker --version
bash: docker: command not found
```

**Solución:**

**macOS:**
```bash
# Opción 1: Docker Desktop
# Descargar desde https://www.docker.com/products/docker-desktop

# Opción 2: Homebrew
brew install --cask docker
```

**Ubuntu/Debian:**
```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER

# Reiniciar sesión
exit
```

**Verificar:**
```bash
docker --version
# Docker version 24.0.0, build abcdef1
```

---

### Error: "Permission denied" al ejecutar Docker

**Síntoma:**
```bash
$ docker ps
permission denied while trying to connect to the Docker daemon socket
```

**Solución:**
```bash
# Agregar usuario al grupo docker
sudo usermod -aG docker $USER

# Reiniciar sesión o aplicar cambios
newgrp docker

# Verificar
docker ps
```

---

### Error: "Puerto ya en uso"

**Síntoma:**
```bash
Error starting userland proxy: listen tcp 0.0.0.0:8005: bind: address already in use
```

**Solución:**

**Encontrar proceso usando el puerto:**
```bash
# Linux/macOS
lsof -i :8005

# Windows
netstat -ano | findstr :8005
```

**Detener proceso:**
```bash
# Linux/macOS
kill -9 <PID>

# Windows
taskkill /PID <PID> /F
```

**Cambiar puerto en .env:**
```bash
PORT=8006  # Usar otro puerto
```

---

## Problemas con Docker

### Contenedores no inician

**Síntoma:**
```bash
$ docker-compose ps
NAME                   STATUS
chatbotdysa-postgres   Exited (1)
chatbotdysa-backend    Restarting
```

**Diagnóstico:**
```bash
# Ver logs del contenedor
docker logs chatbotdysa-backend

# Ver logs en tiempo real
docker logs -f chatbotdysa-backend
```

**Soluciones comunes:**

1. **Recrear contenedores:**
```bash
docker-compose down
docker-compose up -d
```

2. **Rebuild imágenes:**
```bash
docker-compose down
docker-compose up -d --build
```

3. **Limpiar volúmenes:**
```bash
docker-compose down -v
docker-compose up -d
```

---

### Contenedor se reinicia constantemente

**Síntoma:**
```bash
chatbotdysa-backend   Restarting (1) 5 seconds ago
```

**Diagnóstico:**
```bash
# Ver últimas 50 líneas de logs
docker logs --tail 50 chatbotdysa-backend

# Ver eventos de Docker
docker events --filter container=chatbotdysa-backend
```

**Causas comunes:**

1. **Error en variables de entorno:**
```bash
# Verificar .env
cat .env

# Verificar que todas las variables requeridas estén definidas
```

2. **Base de datos no disponible:**
```bash
# Verificar que PostgreSQL esté healthy
docker inspect chatbotdysa-postgres | grep Health

# Esperar a que PostgreSQL esté listo
docker-compose up -d postgres
sleep 30
docker-compose up -d backend
```

3. **Puerto en conflicto:**
```bash
# Cambiar puerto en docker-compose.yml
ports:
  - "8006:8005"  # Usar 8006 externamente
```

---

### Error: "No space left on device"

**Síntoma:**
```bash
Error response from daemon: no space left on device
```

**Solución:**

```bash
# Ver uso de espacio de Docker
docker system df

# Limpiar imágenes no usadas
docker image prune -a

# Limpiar contenedores detenidos
docker container prune

# Limpiar volúmenes no usados
docker volume prune

# Limpiar todo (CUIDADO: elimina todo lo no usado)
docker system prune -a --volumes
```

---

## Problemas de Base de Datos

### PostgreSQL no acepta conexiones

**Síntoma:**
```bash
Error: connect ECONNREFUSED 127.0.0.1:15432
```

**Diagnóstico:**
```bash
# Verificar que PostgreSQL esté corriendo
docker ps | grep postgres

# Ver logs
docker logs chatbotdysa-postgres

# Intentar conectar manualmente
docker exec -it chatbotdysa-postgres psql -U postgres -c "SELECT 1"
```

**Soluciones:**

1. **PostgreSQL no está corriendo:**
```bash
docker-compose up -d postgres
```

2. **Puerto incorrecto:**
```bash
# Verificar puerto en .env
DATABASE_PORT=15432  # Debe coincidir con docker-compose.yml
```

3. **Password incorrecto:**
```bash
# Verificar password en .env
DATABASE_PASSWORD=supersecret

# Debe coincidir con POSTGRES_PASSWORD en docker-compose.yml
```

---

### Error: "relation does not exist"

**Síntoma:**
```bash
ERROR: relation "users" does not exist
```

**Causa:** Las migraciones no se ejecutaron.

**Solución:**
```bash
# Opción 1: Desde el contenedor del backend
docker exec chatbotdysa-backend npm run migration:run

# Opción 2: Manualmente
docker exec -it chatbotdysa-postgres psql -U postgres -d chatbotdysa

# Ver tablas existentes
\dt

# Si no hay tablas, ejecutar script de inicialización
```

---

### Base de datos corrupta

**Síntoma:**
```bash
ERROR: could not read block 0 in file "base/16384/12345": read only 0 of 8192 bytes
```

**Solución:**

**⚠️ PRECAUCIÓN: Haz backup primero**

```bash
# 1. Hacer backup (si es posible)
docker exec chatbotdysa-postgres pg_dump -U postgres chatbotdysa > backup.sql

# 2. Detener servicios
docker-compose down

# 3. Eliminar volumen de datos
docker volume rm chatbotdysa_postgres_data

# 4. Reiniciar servicios
docker-compose up -d

# 5. Restaurar backup
docker exec -i chatbotdysa-postgres psql -U postgres -d chatbotdysa < backup.sql
```

---

## Problemas con el Backend

### Backend no responde

**Síntoma:**
```bash
$ curl http://localhost:8005/health
curl: (7) Failed to connect to localhost port 8005: Connection refused
```

**Diagnóstico:**
```bash
# Verificar que el contenedor esté corriendo
docker ps | grep backend

# Ver logs
docker logs chatbotdysa-backend

# Ver últimas 100 líneas
docker logs --tail 100 chatbotdysa-backend

# Seguir logs en tiempo real
docker logs -f chatbotdysa-backend
```

**Soluciones:**

1. **Contenedor no está corriendo:**
```bash
docker-compose up -d backend
```

2. **Error en el código:**
```bash
# Ver logs para encontrar el error
docker logs chatbotdysa-backend | grep -i error

# Reiniciar contenedor
docker restart chatbotdysa-backend
```

3. **Variables de entorno faltantes:**
```bash
# Verificar variables en el contenedor
docker exec chatbotdysa-backend env | grep -E "DATABASE|JWT|PORT"

# Actualizar .env y recrear
docker-compose up -d --force-recreate backend
```

---

### Error 401: Unauthorized

**Síntoma:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Causas y soluciones:**

1. **Token no enviado:**
```bash
# Incluir header Authorization
curl -H "Authorization: Bearer tu-token" http://localhost:8005/api/customers
```

2. **Token expirado:**
```bash
# Obtener nuevo token
curl -X POST http://localhost:8005/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@zgamersa.com","password":"Admin123!"}'
```

3. **JWT_SECRET cambió:**
```bash
# Todos los tokens anteriores son inválidos
# Iniciar sesión nuevamente
```

---

### Error 500: Internal Server Error

**Síntoma:**
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

**Diagnóstico:**
```bash
# Ver logs completos
docker logs chatbotdysa-backend | tail -200

# Buscar stack trace
docker logs chatbotdysa-backend | grep -A 20 "Error:"

# Ver logs de base de datos también
docker logs chatbotdysa-postgres | tail -50
```

**Soluciones comunes:**

1. **Problema con la base de datos:**
```bash
# Verificar conexión
docker exec chatbotdysa-backend npm run typeorm -- query "SELECT 1"
```

2. **Dependencia faltante:**
```bash
# Reinstalar dependencias
docker exec chatbotdysa-backend npm install

# O rebuild imagen
docker-compose up -d --build backend
```

---

## Problemas con el Frontend

### Admin Panel no carga

**Síntoma:**
- Página en blanco
- Error 404
- Loading infinito

**Diagnóstico:**
```bash
# Ver consola del navegador (F12)
# Buscar errores en Network y Console

# Ver logs si está en Docker
docker logs chatbotdysa-admin
```

**Soluciones:**

1. **Backend no disponible:**
```bash
# Verificar que NEXT_PUBLIC_API_URL esté correcto
echo $NEXT_PUBLIC_API_URL

# Debe apuntar al backend
# Desarrollo: http://localhost:8005
# Producción: https://api.tu-dominio.com
```

2. **Problemas de CORS:**
```javascript
// En backend main.ts, verificar:
app.enableCors({
  origin: ['http://localhost:7001', 'https://admin.tu-dominio.com'],
  credentials: true
});
```

3. **Rebuild frontend:**
```bash
cd apps/admin-panel
rm -rf .next
npm run build
npm run dev  # o npm start para producción
```

---

### Error: "hydration mismatch"

**Síntoma:**
```
Hydration failed because the server rendered HTML didn't match the client
```

**Causa:** Diferencia entre SSR y CSR.

**Solución:**
```bash
# Limpiar caché de Next.js
cd apps/admin-panel
rm -rf .next

# Reinstalar dependencias
rm -rf node_modules
npm install

# Rebuild
npm run build
npm run dev
```

---

## Problemas con Ollama AI

### Ollama no descarga modelos

**Síntoma:**
```bash
$ docker exec chatbotdysa-ollama ollama pull phi3:mini
Error: connection refused
```

**Diagnóstico:**
```bash
# Verificar que Ollama esté corriendo
docker ps | grep ollama

# Ver logs
docker logs chatbotdysa-ollama

# Verificar conectividad
docker exec chatbotdysa-ollama curl -I http://localhost:11434
```

**Soluciones:**

1. **Ollama no está corriendo:**
```bash
docker-compose up -d ollama
```

2. **Sin internet:**
```bash
# Verificar conexión desde contenedor
docker exec chatbotdysa-ollama ping -c 3 ollama.ai

# Si falla, revisar configuración de red
```

3. **Sin espacio en disco:**
```bash
# Modelos ocupan 2-5 GB cada uno
df -h

# Limpiar espacio si es necesario
docker system prune -a
```

---

### Generación de IA muy lenta

**Síntoma:**
Respuestas toman más de 30 segundos.

**Diagnóstico:**
```bash
# Ver uso de recursos
docker stats chatbotdysa-ollama

# Verificar modelo usado
curl http://localhost:21434/api/tags
```

**Soluciones:**

1. **Usar modelo más rápido:**
```bash
# phi3:mini es el más rápido (2-5 segundos)
# llama3:8b es más lento pero mejor (5-15 segundos)

# Cambiar en configuración del chatbot
```

2. **Asignar más recursos:**
```yaml
# En docker-compose.yml
ollama:
  deploy:
    resources:
      limits:
        cpus: '4'      # Aumentar CPUs
        memory: 4G     # Aumentar memoria
```

3. **Usar GPU (si disponible):**
```bash
# Instalar NVIDIA Container Toolkit
# Modificar docker-compose.yml para usar GPU
```

---

### Error: "model not found"

**Síntoma:**
```json
{
  "error": "model 'phi3:mini' not found"
}
```

**Solución:**
```bash
# Entrar al contenedor
docker exec -it chatbotdysa-ollama bash

# Listar modelos instalados
ollama list

# Instalar modelo faltante
ollama pull phi3:mini

# Salir
exit
```

---

## Problemas de Red y Conectividad

### No hay conexión entre contenedores

**Síntoma:**
Backend no puede conectar a PostgreSQL:
```
Error: getaddrinfo ENOTFOUND postgres
```

**Diagnóstico:**
```bash
# Verificar red de Docker
docker network ls

# Ver contenedores en la red
docker network inspect chatbotdysa_default

# Probar conectividad
docker exec chatbotdysa-backend ping -c 3 postgres
```

**Solución:**
```bash
# Recrear red
docker-compose down
docker network prune
docker-compose up -d
```

---

### CORS errors en el navegador

**Síntoma:**
```
Access to fetch at 'http://localhost:8005/api/customers' from origin 'http://localhost:7001'
has been blocked by CORS policy
```

**Solución:**

**En el backend (apps/backend/src/main.ts):**
```typescript
app.enableCors({
  origin: [
    'http://localhost:7001',     // Admin panel dev
    'http://localhost:3004',     // Landing dev
    'https://admin.tu-dominio.com',  // Admin prod
    'https://www.tu-dominio.com'     // Landing prod
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
});
```

**Reiniciar backend:**
```bash
docker restart chatbotdysa-backend
```

---

## Problemas de Performance

### Sistema muy lento

**Diagnóstico:**
```bash
# Ver uso de recursos
docker stats

# Ver procesos en el host
top  # o htop

# Ver uso de disco
df -h

# Ver espacio usado por Docker
docker system df
```

**Soluciones:**

1. **Asignar más recursos a Docker:**
   - Docker Desktop → Preferences → Resources
   - Aumentar CPU y memoria

2. **Optimizar base de datos:**
```sql
-- Conectar a PostgreSQL
docker exec -it chatbotdysa-postgres psql -U postgres -d chatbotdysa

-- Analizar tablas
ANALYZE;

-- Vacuum
VACUUM;

-- Ver tamaño de tablas
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

3. **Limpiar logs:**
```bash
# Rotar logs de Docker
docker-compose down
truncate -s 0 $(docker inspect --format='{{.LogPath}}' chatbotdysa-backend)
docker-compose up -d
```

---

### Queries lentas en la base de datos

**Diagnóstico:**
```sql
-- Conectar a PostgreSQL
docker exec -it chatbotdysa-postgres psql -U postgres -d chatbotdysa

-- Ver queries lentas
SELECT pid, query, state, query_start
FROM pg_stat_activity
WHERE state = 'active'
AND query_start < NOW() - INTERVAL '10 seconds';

-- Matar query lenta
SELECT pg_terminate_backend(pid);
```

**Soluciones:**

1. **Agregar índices:**
```sql
-- Índices recomendados
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_menu_items_category ON menu_items(category);
```

2. **Optimizar queries:**
```sql
-- Usar EXPLAIN ANALYZE
EXPLAIN ANALYZE SELECT * FROM orders WHERE status = 'pending';
```

---

## Problemas con el Widget

### Widget no aparece en el sitio web

**Diagnóstico:**
```javascript
// En la consola del navegador (F12)
console.log(typeof DysaBotWidget);
// Debe mostrar: "function"
```

**Soluciones:**

1. **Script no cargado:**
```html
<!-- Verificar que las rutas sean correctas -->
<script src="/ruta/correcta/dysabot-widget.min.js"></script>
```

2. **Error en la inicialización:**
```javascript
// Ver consola del navegador para errores
// Verificar configuración
const widget = new DysaBotWidget({
  apiUrl: 'http://localhost:8005',  // URL correcta
  restaurantId: 'demo'               // ID válido
});
```

3. **Conflicto de CSS:**
```html
<!-- El widget tiene CSS aislado, pero por si acaso -->
<link rel="stylesheet" href="/dysabot-widget.min.css">
```

---

### Widget no se conecta al backend

**Síntoma:**
Widget carga pero no muestra mensajes.

**Diagnóstico:**
```javascript
// En consola del navegador
// Buscar errores de red (Network tab en DevTools)
// Buscar CORS errors
```

**Soluciones:**

1. **URL incorrecta:**
```javascript
const widget = new DysaBotWidget({
  apiUrl: 'https://api.tu-dominio.com',  // HTTPS en producción
  restaurantId: 'tu-id'
});
```

2. **CORS no configurado:**
```typescript
// En backend, agregar dominio del sitio web
app.enableCors({
  origin: ['https://www.tu-sitio.com']
});
```

---

## Problemas de Seguridad

### Secretos expuestos

**⚠️ URGENTE:** Si expusiste secrets accidentalmente:

1. **Rotar inmediatamente:**
```bash
# Generar nuevos secrets
./scripts/generate-secrets.sh mi-restaurante-new

# Actualizar .env.production
cp secrets/mi-restaurante-new/.env.production apps/backend/.env.production

# Reiniciar servicios
docker-compose restart
```

2. **Cambiar passwords de DB:**
```bash
# Conectar a PostgreSQL
docker exec -it chatbotdysa-postgres psql -U postgres

# Cambiar password
ALTER USER postgres PASSWORD 'nuevo-password-seguro';

# Actualizar .env
DATABASE_PASSWORD=nuevo-password-seguro
```

3. **Invalidar todos los JWT tokens:**
```bash
# Cambiar JWT_SECRET en .env
JWT_SECRET=nuevo-secret-generado

# Todos los usuarios deben hacer login nuevamente
```

---

## Logs y Debugging

### Ver todos los logs

```bash
# Todos los servicios
docker-compose logs

# Solo backend
docker-compose logs backend

# Últimas 100 líneas
docker-compose logs --tail 100

# Seguir en tiempo real
docker-compose logs -f

# Con timestamps
docker-compose logs -t
```

### Niveles de log

**En .env:**
```bash
# Desarrollo
LOG_LEVEL=debug

# Producción
LOG_LEVEL=info
```

### Habilitar debug mode

**Backend:**
```bash
# En .env
NODE_ENV=development
LOG_LEVEL=debug

# Reiniciar
docker restart chatbotdysa-backend
```

### Exportar logs

```bash
# Exportar logs de los últimos 24 horas
docker-compose logs --since 24h > logs-$(date +%Y%m%d).txt

# Exportar logs de un servicio específico
docker logs chatbotdysa-backend > backend-logs.txt 2>&1
```

---

## Comandos Útiles de Diagnóstico

### Verificar salud del sistema

```bash
#!/bin/bash
echo "=== Health Check ==="

# Docker
echo "Docker version:"
docker --version

# Contenedores
echo -e "\nContenedores corriendo:"
docker ps --format "table {{.Names}}\t{{.Status}}"

# Base de datos
echo -e "\nPostgreSQL:"
docker exec chatbotdysa-postgres pg_isready -U postgres

# Backend
echo -e "\nBackend API:"
curl -s http://localhost:8005/health | head -c 100

# Redis
echo -e "\nRedis:"
docker exec chatbotdysa-redis redis-cli ping

# Ollama
echo -e "\nOllama:"
curl -s http://localhost:21434/api/tags | head -c 100

# Disco
echo -e "\nEspacio en disco:"
df -h | grep -E "Filesystem|/$"

# Docker disk usage
echo -e "\nDocker disk usage:"
docker system df
```

### Script de reset completo

**⚠️ CUIDADO: Elimina todos los datos**

```bash
#!/bin/bash
echo "⚠️  RESET COMPLETO - Se perderán TODOS los datos"
read -p "¿Estás seguro? (escribe 'SI' para continuar): " confirm

if [ "$confirm" != "SI" ]; then
    echo "Cancelado"
    exit 1
fi

echo "🛑 Deteniendo servicios..."
docker-compose down

echo "🗑️  Eliminando volúmenes..."
docker-compose down -v

echo "🗑️  Eliminando imágenes..."
docker-compose down --rmi all

echo "🧹 Limpiando sistema Docker..."
docker system prune -af --volumes

echo "✅ Reset completo"
echo "Para reiniciar: docker-compose up -d"
```

---

## Contacto de Soporte

Si ninguna de estas soluciones funciona:

**Email:** soporte@dysadev.com
**GitHub Issues:** https://github.com/dysadev/chatbotdysa/issues
**Horario:** Lun-Vie 9:00-18:00 (GMT-3)

**Al contactar, incluye:**
1. Descripción del problema
2. Pasos para reproducir
3. Logs relevantes
4. Versión del sistema (`cat VERSION` o `git rev-parse HEAD`)
5. Sistema operativo y versión de Docker
