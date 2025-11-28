# Comandos Útiles y Troubleshooting - ChatBotDysa Enterprise

**Versión:** 1.0.0
**Fecha:** 2025-10-06
**Estado:** ✅ Guía de referencia rápida

---

## 📋 Tabla de Contenidos

1. [Comandos Docker](#comandos-docker)
2. [Comandos PostgreSQL](#comandos-postgresql)
3. [Comandos Redis](#comandos-redis)
4. [Comandos de Logs](#comandos-de-logs)
5. [Comandos de Backup](#comandos-de-backup)
6. [Troubleshooting Común](#troubleshooting-común)
7. [Monitoreo y Performance](#monitoreo-y-performance)
8. [Comandos de Desarrollo](#comandos-de-desarrollo)

---

## 🐳 Comandos Docker

### Gestión de Servicios

```bash
# Iniciar todos los servicios
docker-compose up -d

# Iniciar solo un servicio específico
docker-compose up -d backend
docker-compose up -d admin-panel
docker-compose up -d postgres

# Iniciar con logs en foreground
docker-compose up

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (⚠️ BORRA DATOS)
docker-compose down -v

# Reiniciar todos los servicios
docker-compose restart

# Reiniciar solo un servicio
docker-compose restart backend
docker-compose restart admin-panel
docker-compose restart postgres
docker-compose restart redis
docker-compose restart ollama
docker-compose restart landing-page

# Ver estado de servicios
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f admin-panel
docker-compose logs -f postgres

# Ver últimas N líneas de logs
docker-compose logs --tail=100 backend

# Ver logs desde una fecha
docker-compose logs --since "2025-10-06T12:00:00" backend

# Ver logs hasta una fecha
docker-compose logs --until "2025-10-06T13:00:00" backend
```

### Rebuild y Actualización

```bash
# Rebuild todos los servicios
docker-compose up -d --build

# Rebuild solo un servicio
docker-compose up -d --build backend

# Rebuild sin cache
docker-compose build --no-cache backend

# Pull últimas imágenes
docker-compose pull

# Ver imágenes usadas
docker-compose images

# Ver recursos usados
docker-compose top
```

### Inspección y Debug

```bash
# Ejecutar comando dentro de contenedor
docker-compose exec backend sh
docker-compose exec postgres psql -U postgres
docker-compose exec redis redis-cli

# Ver configuración de un servicio
docker-compose config

# Ver variables de entorno de un servicio
docker-compose exec backend env

# Ver uso de recursos en tiempo real
docker stats

# Ver uso de recursos sin stream
docker stats --no-stream

# Inspeccionar contenedor
docker inspect chatbotdysa-backend

# Ver redes
docker network ls
docker network inspect chatbotdysa_default

# Ver volúmenes
docker volume ls
docker volume inspect chatbotdysa_postgres_data
```

### Limpieza

```bash
# Limpiar contenedores detenidos
docker container prune

# Limpiar imágenes no usadas
docker image prune

# Limpiar todo (contenedores, imágenes, volúmenes, redes)
docker system prune -a

# Ver espacio usado por Docker
docker system df
```

---

## 🐘 Comandos PostgreSQL

### Conexión

```bash
# Conectar desde host
PGPASSWORD=supersecret psql -h 127.0.0.1 -p 15432 -U postgres -d chatbotdysa

# Conectar desde contenedor
docker-compose exec postgres psql -U postgres -d chatbotdysa

# Conectar y ejecutar comando
PGPASSWORD=supersecret psql -h 127.0.0.1 -p 15432 -U postgres -d chatbotdysa -c "SELECT COUNT(*) FROM users;"

# Conectar y ejecutar archivo SQL
PGPASSWORD=supersecret psql -h 127.0.0.1 -p 15432 -U postgres -d chatbotdysa -f script.sql
```

### Comandos Internos de psql

```sql
-- Listar bases de datos
\l

-- Conectar a base de datos
\c chatbotdysa

-- Listar tablas
\dt

-- Describir tabla
\d users
\d+ users  -- Con más detalles

-- Listar índices
\di

-- Listar vistas
\dv

-- Listar funciones
\df

-- Listar roles
\du

-- Ver tamaño de tablas
\dt+

-- Salir
\q

-- Ejecutar comando shell
\! ls -la

-- Ejecutar archivo SQL
\i /path/to/script.sql

-- Ver historial de comandos
\s

-- Guardar resultados a archivo
\o /tmp/output.txt
SELECT * FROM users;
\o  -- Desactivar output a archivo

-- Cambiar formato de salida
\x  -- Expandido (vertical)
\x  -- Toggle off

-- Ver tiempo de ejecución
\timing
```

### Consultas Útiles

```sql
-- Ver usuario admin
SELECT id, email, status, first_name, last_name, created_at
FROM users
WHERE id = 1;

-- Ver todos los clientes activos
SELECT id, name, email, phone, is_active, created_at
FROM customers
WHERE is_active = true
ORDER BY created_at DESC
LIMIT 10;

-- Ver pedidos de hoy
SELECT o.id, o.order_number, c.name, o.total_amount, o.status, o.created_at
FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE o.created_at::date = CURRENT_DATE
ORDER BY o.created_at DESC;

-- Ver reservaciones futuras
SELECT r.id, c.name, r.reservation_date, r.reservation_time, r.party_size, r.status
FROM reservations r
JOIN customers c ON r.customer_id = c.id
WHERE r.reservation_date >= CURRENT_DATE
ORDER BY r.reservation_date, r.reservation_time;

-- Ver items del menú activos
SELECT id, name, category, price, is_available
FROM menu_items
WHERE is_active = true
ORDER BY category, name;

-- Ver conversaciones de hoy
SELECT id, customer_id, session_id, status, started_at
FROM conversations
WHERE created_at::date = CURRENT_DATE
ORDER BY created_at DESC;

-- Ver logs de auditoría (últimas 100)
SELECT id, user_id, action, resource, created_at
FROM audit_logs
ORDER BY created_at DESC
LIMIT 100;

-- Ver usuarios por rol
SELECT u.id, u.email, r.name as role, u.status
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
ORDER BY r.name, u.email;

-- Ver permisos de un rol
SELECT r.name as role, p.name as permission, p.description
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.id = 1
ORDER BY p.name;
```

### Estadísticas y Performance

```sql
-- Tamaño de cada tabla
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY size_bytes DESC;

-- Número de registros por tabla
SELECT
  schemaname,
  tablename,
  n_live_tup as row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- Índices más grandes
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;

-- Uso de cache
SELECT
  sum(heap_blks_read) as heap_read,
  sum(heap_blks_hit) as heap_hit,
  sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as cache_hit_ratio
FROM pg_statio_user_tables;

-- Consultas lentas (si está habilitado pg_stat_statements)
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Conexiones activas
SELECT
  pid,
  usename,
  application_name,
  client_addr,
  backend_start,
  state,
  query
FROM pg_stat_activity
WHERE state = 'active';

-- Locks activos
SELECT
  pid,
  usename,
  pg_blocking_pids(pid) as blocked_by,
  query as blocked_query
FROM pg_stat_activity
WHERE cardinality(pg_blocking_pids(pid)) > 0;
```

### Mantenimiento

```sql
-- VACUUM completo
VACUUM FULL;

-- VACUUM por tabla
VACUUM ANALYZE customers;

-- Reindex completo
REINDEX DATABASE chatbotdysa;

-- Reindex por tabla
REINDEX TABLE customers;

-- Ver última vez que se hizo VACUUM
SELECT
  schemaname,
  tablename,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
FROM pg_stat_user_tables;
```

---

## 🔴 Comandos Redis

### Conexión

```bash
# Conectar desde host
redis-cli -h 127.0.0.1 -p 16379

# Conectar desde contenedor
docker-compose exec redis redis-cli

# Ejecutar comando directo
redis-cli -h 127.0.0.1 -p 16379 PING

# Con password (producción)
redis-cli -h 127.0.0.1 -p 16379 -a YOUR_PASSWORD
```

### Comandos Básicos

```bash
# Ping
PING

# Ver todas las keys
KEYS *

# Ver keys con patrón
KEYS menu:*
KEYS customers:*

# Contar keys
DBSIZE

# Ver info del servidor
INFO

# Ver info de memoria
INFO memory

# Ver info de stats
INFO stats

# Ver un valor
GET menu:all
GET customers:1

# Set un valor
SET test:key "valor de prueba"

# Set con expiración (segundos)
SETEX test:key 300 "expira en 5 min"

# Ver TTL de una key
TTL menu:all

# Eliminar una key
DEL test:key

# Eliminar múltiples keys
DEL key1 key2 key3

# Eliminar keys por patrón (⚠️ usar con cuidado)
redis-cli KEYS "menu:*" | xargs redis-cli DEL

# Flush toda la base (⚠️ BORRA TODO)
FLUSHDB

# Flush todas las bases (⚠️ BORRA TODO)
FLUSHALL

# Seleccionar base de datos (0-15)
SELECT 0
SELECT 1

# Ver clientes conectados
CLIENT LIST

# Monitorear comandos en tiempo real
MONITOR

# Ver configuración
CONFIG GET *
CONFIG GET maxmemory

# Cambiar configuración
CONFIG SET maxmemory 256mb
```

### Performance y Debugging

```bash
# Ver comandos más lentos
SLOWLOG GET 10

# Ver estadísticas
INFO stats

# Ver hits/misses de cache
INFO stats | grep keyspace

# Benchmark
redis-benchmark -h 127.0.0.1 -p 16379 -n 10000

# Benchmark de un comando específico
redis-benchmark -h 127.0.0.1 -p 16379 -t set,get -n 100000
```

---

## 📝 Comandos de Logs

### Logs del Sistema

```bash
# Backend logs (todos los tipos)
tail -f /var/log/chatbotdysa/application.log
tail -f /var/log/chatbotdysa/error.log
tail -f /var/log/chatbotdysa/http.log
tail -f /var/log/chatbotdysa/security.log
tail -f /var/log/chatbotdysa/performance.log

# Ver logs desde Docker
docker-compose logs -f backend

# Buscar errores en logs
grep -i error /var/log/chatbotdysa/application.log
grep -i "failed" /var/log/chatbotdysa/application.log

# Buscar por fecha
grep "2025-10-06" /var/log/chatbotdysa/application.log

# Contar errores
grep -c "ERROR" /var/log/chatbotdysa/application.log

# Ver últimas 100 líneas
tail -n 100 /var/log/chatbotdysa/application.log

# Ver líneas que contienen texto
grep "login" /var/log/chatbotdysa/security.log

# Logs de PostgreSQL
docker-compose logs postgres | grep ERROR

# Logs de Redis
docker-compose logs redis
```

### Análisis de Logs

```bash
# Top 10 endpoints más llamados
grep "GET\|POST\|PUT\|DELETE" /var/log/chatbotdysa/http.log | \
  awk '{print $3}' | sort | uniq -c | sort -nr | head -10

# Top 10 errores más frecuentes
grep ERROR /var/log/chatbotdysa/error.log | \
  awk -F': ' '{print $2}' | sort | uniq -c | sort -nr | head -10

# Requests por hora
grep "2025-10-06" /var/log/chatbotdysa/http.log | \
  awk '{print substr($1, 12, 2)}' | sort | uniq -c

# Logins fallidos
grep "Login failed" /var/log/chatbotdysa/security.log | \
  awk '{print $NF}' | sort | uniq -c | sort -nr

# Response times promedio
grep "Response time" /var/log/chatbotdysa/performance.log | \
  awk '{sum+=$NF; count++} END {print sum/count "ms"}'
```

---

## 💾 Comandos de Backup

### Crear Backups

```bash
# Backup automático (script)
./scripts/backup/daily-backup.sh

# Backup manual con pg_dump
PGPASSWORD=supersecret pg_dump \
  -h 127.0.0.1 \
  -p 15432 \
  -U postgres \
  -d chatbotdysa \
  --format=plain \
  --no-owner \
  --no-acl \
  | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Backup solo de schema
PGPASSWORD=supersecret pg_dump \
  -h 127.0.0.1 \
  -p 15432 \
  -U postgres \
  -d chatbotdysa \
  --schema-only \
  > schema_backup.sql

# Backup solo de datos
PGPASSWORD=supersecret pg_dump \
  -h 127.0.0.1 \
  -p 15432 \
  -U postgres \
  -d chatbotdysa \
  --data-only \
  > data_backup.sql

# Backup de una tabla específica
PGPASSWORD=supersecret pg_dump \
  -h 127.0.0.1 \
  -p 15432 \
  -U postgres \
  -d chatbotdysa \
  --table=customers \
  > customers_backup.sql
```

### Restaurar Backups

```bash
# Restaurar con script
./scripts/backup/restore-backup.sh /var/backups/chatbotdysa/backup.sql.gz

# Restaurar manual
gunzip -c backup.sql.gz | \
  PGPASSWORD=supersecret psql \
    -h 127.0.0.1 \
    -p 15432 \
    -U postgres \
    -d chatbotdysa

# Restaurar sin descomprimir
zcat backup.sql.gz | \
  PGPASSWORD=supersecret psql \
    -h 127.0.0.1 \
    -p 15432 \
    -U postgres \
    -d chatbotdysa

# Restaurar solo schema
PGPASSWORD=supersecret psql \
  -h 127.0.0.1 \
  -p 15432 \
  -U postgres \
  -d chatbotdysa \
  -f schema_backup.sql
```

### Verificar Backups

```bash
# Test completo de backup
./scripts/backup/test-backup.sh

# Listar backups disponibles
ls -lht /var/backups/chatbotdysa/

# Ver tamaño de backups
du -sh /var/backups/chatbotdysa/*

# Verificar integridad de archivo .gz
gunzip -t backup.sql.gz

# Ver contenido sin extraer
zless backup.sql.gz
zgrep "CREATE TABLE" backup.sql.gz
```

---

## 🔧 Troubleshooting Común

### Problema 1: Puerto ya en uso

**Síntoma:**
```
Error: bind: address already in use
```

**Diagnóstico:**
```bash
# Ver qué está usando el puerto
lsof -i :8005
lsof -i :7001
lsof -i :3004
lsof -i :15432
lsof -i :16379
lsof -i :21434

# Ver todos los puertos en uso
lsof -i -P | grep LISTEN
```

**Solución:**
```bash
# Opción 1: Matar el proceso
kill -9 [PID]

# Opción 2: Cambiar puerto en docker-compose.yml
# Editar: "8006:8005" en lugar de "8005:8005"

# Opción 3: Detener Docker y reiniciar
docker-compose down
docker-compose up -d
```

### Problema 2: Backend no responde

**Síntoma:**
```
curl: (7) Failed to connect to localhost port 8005
```

**Diagnóstico:**
```bash
# Ver estado del contenedor
docker-compose ps backend

# Ver logs del backend
docker-compose logs backend

# Ver últimas 50 líneas
docker-compose logs --tail=50 backend

# Verificar si el proceso está corriendo
docker-compose exec backend ps aux
```

**Solución:**
```bash
# Reiniciar backend
docker-compose restart backend

# Si persiste, rebuild
docker-compose up -d --build backend

# Ver si hay errores en startup
docker-compose logs backend | grep -i error

# Verificar variables de entorno
docker-compose exec backend env | grep -i database
```

### Problema 3: Database connection refused

**Síntoma:**
```
FATAL: password authentication failed for user "postgres"
ERROR: connect ECONNREFUSED 127.0.0.1:15432
```

**Diagnóstico:**
```bash
# Ver estado de PostgreSQL
docker-compose ps postgres

# Verificar que está escuchando
docker-compose exec postgres pg_isready -U postgres

# Ver logs de PostgreSQL
docker-compose logs postgres

# Probar conexión directa
PGPASSWORD=supersecret psql -h 127.0.0.1 -p 15432 -U postgres -c "SELECT 1;"
```

**Solución:**
```bash
# Verificar credenciales en .env
cat .env | grep DATABASE

# Verificar que el puerto está correcto
cat docker-compose.yml | grep -A 5 postgres

# Reiniciar PostgreSQL
docker-compose restart postgres

# Si persiste, recrear contenedor
docker-compose down
docker-compose up -d postgres

# Esperar a que esté listo
until docker-compose exec postgres pg_isready -U postgres; do sleep 1; done
```

### Problema 4: Redis connection timeout

**Síntoma:**
```
Error: Redis connection to 127.0.0.1:16379 failed - connect ETIMEDOUT
```

**Diagnóstico:**
```bash
# Ver estado de Redis
docker-compose ps redis

# Probar conexión
redis-cli -h 127.0.0.1 -p 16379 PING

# Ver logs de Redis
docker-compose logs redis
```

**Solución:**
```bash
# Reiniciar Redis
docker-compose restart redis

# Verificar configuración
cat .env | grep REDIS

# Limpiar datos si es necesario (⚠️ borra cache)
docker-compose exec redis redis-cli FLUSHDB

# Si persiste, recrear contenedor
docker-compose down redis
docker-compose up -d redis
```

### Problema 5: Admin Panel pantalla blanca

**Síntoma:**
- Página carga pero está en blanco
- Console del navegador muestra errores

**Diagnóstico:**
```bash
# Ver logs del admin panel
docker-compose logs admin-panel

# Verificar que el backend está corriendo
curl http://localhost:8005/api/health

# Ver errores de build
docker-compose logs admin-panel | grep -i error
```

**Solución:**
```bash
# Limpiar caché del navegador
# Chrome: Cmd+Shift+Delete (Mac) / Ctrl+Shift+Delete (Windows)

# Reiniciar admin panel
docker-compose restart admin-panel

# Rebuild
docker-compose up -d --build admin-panel

# Ver si la API funciona
curl http://localhost:8005/api/health

# Verificar CORS
docker-compose logs backend | grep -i cors
```

### Problema 6: Ollama no responde

**Síntoma:**
```
curl: (7) Failed to connect to localhost port 21434
```

**Diagnóstico:**
```bash
# Ver estado de Ollama
docker-compose ps ollama

# Ver logs
docker-compose logs ollama

# Verificar endpoint
curl http://localhost:21434/api/tags
```

**Solución:**
```bash
# Reiniciar Ollama
docker-compose restart ollama

# Puede tomar más tiempo en iniciar (30-60s)
sleep 30
curl http://localhost:21434/api/tags

# Verificar modelos instalados
docker-compose exec ollama ollama list

# Si no hay modelos, instalar llama2
docker-compose exec ollama ollama pull llama2
```

### Problema 7: Login no funciona

**Síntoma:**
- Email y password correctos pero error 401

**Diagnóstico:**
```bash
# Verificar credenciales en BD
PGPASSWORD=supersecret psql -h 127.0.0.1 -p 15432 -U postgres -d chatbotdysa \
  -c "SELECT id, email, LEFT(password, 20) FROM users WHERE id = 1;"

# Probar login vía API
curl -X POST http://localhost:8005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@zgamersa.com", "password": "VER_CREDENCIALES_ADMIN_SEGURAS.md"}'

# Ver logs de auth
docker-compose logs backend | grep -i "auth\|login"
```

**Solución:**
```bash
# Verificar que el password está correcto
# Ver: /Reportes/Sesiones/2025-10-06_Cierre_Final_Dia_1317/CREDENCIALES_ADMIN_SEGURAS.md

# Verificar JWT secret
cat .env | grep JWT_SECRET

# Reiniciar backend
docker-compose restart backend

# Limpiar localStorage del navegador
# Console del navegador: localStorage.clear()
```

### Problema 8: Migraciones fallan

**Síntoma:**
```
Migration "AddDatabaseIndexes" failed
error: column "status" does not exist
```

**Diagnóstico:**
```bash
# Ver schema actual
PGPASSWORD=supersecret psql -h 127.0.0.1 -p 15432 -U postgres -d chatbotdysa \
  -c "\d customers"

# Ver migraciones ejecutadas
PGPASSWORD=supersecret psql -h 127.0.0.1 -p 15432 -U postgres -d chatbotdysa \
  -c "SELECT * FROM migrations_history ORDER BY timestamp DESC;"
```

**Solución:**
```bash
# Revertir última migración
npm run migration:revert

# Crear migración manual adaptada al schema real
# Ver: apps/backend/scripts/create-indexes-manual.sql

# Ejecutar migración manual
PGPASSWORD=supersecret psql -h 127.0.0.1 -p 15432 -U postgres -d chatbotdysa \
  -f apps/backend/scripts/create-indexes-manual.sql
```

---

## 📊 Monitoreo y Performance

### System Resources

```bash
# CPU y RAM en tiempo real
docker stats

# Uso de disco
df -h

# Espacio usado por Docker
docker system df

# Top procesos
top
htop  # si está instalado

# Ver procesos de Node.js
ps aux | grep node

# Ver conexiones de red
netstat -tulpn | grep LISTEN
lsof -i -P | grep LISTEN
```

### Health Checks

```bash
# Health check completo (script)
./scripts/health-check.sh

# Health checks individuales
curl http://localhost:8005/api/health
curl http://localhost:7001
curl http://localhost:3004
curl http://localhost:21434/api/tags

# PostgreSQL
docker-compose exec postgres pg_isready -U postgres

# Redis
redis-cli -h 127.0.0.1 -p 16379 PING
```

### Performance Testing

```bash
# API benchmark con ab (Apache Bench)
ab -n 1000 -c 10 http://localhost:8005/api/health

# Con autenticación
ab -n 1000 -c 10 -H "Authorization: Bearer YOUR_JWT" \
  http://localhost:8005/api/customers

# Load testing con hey
hey -n 1000 -c 50 http://localhost:8005/api/health

# Stress test
hey -z 30s -c 100 http://localhost:8005/api/health
```

### Query Performance

```sql
-- Enable query timing
\timing

-- Ver query plan
EXPLAIN SELECT * FROM customers WHERE email = 'test@example.com';

-- Ver query plan con ejecución real
EXPLAIN ANALYZE SELECT * FROM customers WHERE email = 'test@example.com';

-- Ver query plan con buffers
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM customers WHERE email = 'test@example.com';
```

---

## 💻 Comandos de Desarrollo

### Backend

```bash
# Navegar al backend
cd apps/backend

# Instalar dependencias
npm install

# Desarrollo local (sin Docker)
npm run start:dev

# Build para producción
npm run build

# Ejecutar migraciones
npm run migration:run

# Revertir migración
npm run migration:revert

# Crear nueva migración
npm run migration:generate -- src/database/migrations/MigrationName

# Ejecutar tests
npm run test

# Tests con coverage
npm run test:cov

# Linter
npm run lint

# Format
npm run format
```

### Admin Panel

```bash
# Navegar al admin panel
cd apps/admin-panel

# Instalar dependencias
npm install

# Desarrollo local
npm run dev

# Build para producción
npm run build

# Ejecutar en producción
npm run start

# Linter
npm run lint
```

### Landing Page

```bash
# Navegar al landing
cd apps/landing-page

# Desarrollo local
npm run dev

# Build
npm run build

# Start
npm run start
```

### Git

```bash
# Ver estado
git status

# Ver cambios
git diff

# Agregar cambios
git add .

# Commit
git commit -m "feat: descripción del cambio"

# Push
git push origin main

# Pull
git pull origin main

# Ver historial
git log --oneline -10

# Crear rama
git checkout -b feature/nueva-funcionalidad

# Cambiar de rama
git checkout main

# Ver ramas
git branch -a

# Merge
git merge feature/nueva-funcionalidad
```

---

## 🚨 Comandos de Emergencia

### Sistema No Responde

```bash
# CTRL+C para detener proceso en foreground

# Detener todo
docker-compose down

# Matar todos los procesos de Docker
docker kill $(docker ps -q)

# Reiniciar Docker Desktop (Mac)
killall Docker && open /Applications/Docker.app

# Ver qué está consumiendo recursos
top
docker stats
```

### Recuperación de Desastre

```bash
# 1. Detener todo
docker-compose down

# 2. Backup de emergencia
./scripts/backup/daily-backup.sh

# 3. Eliminar volúmenes corruptos (⚠️ DATOS PERDIDOS)
docker volume rm chatbotdysa_postgres_data
docker volume rm chatbotdysa_redis_data

# 4. Restaurar desde backup
docker-compose up -d postgres
sleep 10
./scripts/backup/restore-backup.sh /var/backups/chatbotdysa/latest.sql.gz

# 5. Reiniciar servicios
docker-compose up -d
```

### Limpiar Todo y Empezar de Cero

```bash
# ⚠️ ADVERTENCIA: BORRA TODO

# 1. Detener servicios
docker-compose down

# 2. Eliminar volúmenes
docker-compose down -v

# 3. Eliminar imágenes
docker rmi chatbotdysa-backend chatbotdysa-admin chatbotdysa-landing

# 4. Limpiar sistema Docker
docker system prune -a --volumes

# 5. Reiniciar desde cero
docker-compose up -d --build
```

---

## 📚 Referencias

### Documentación

- Guía de Uso: `./GUIA_RAPIDA_USO.md`
- Arquitectura: `./ARQUITECTURA_SISTEMA.md`
- Credenciales: `./CREDENCIALES_ADMIN_SEGURAS.md`
- Checklist Producción: `../2025-10-06_Resumen_Final_Sesion_1234/CHECKLIST_PRODUCCION.md`

### URLs Útiles

- Admin Panel: http://localhost:7001
- Landing Page: http://localhost:3004
- API Backend: http://localhost:8005
- Swagger Docs: http://localhost:8005/docs

### Soporte

- Logs: `/var/log/chatbotdysa/`
- Backups: `/var/backups/chatbotdysa/`
- Documentación: `/Reportes/Sesiones/`

---

**Generado:** 2025-10-06
**Versión:** 1.0.0
**Estado:** ✅ Guía completa de comandos y troubleshooting
