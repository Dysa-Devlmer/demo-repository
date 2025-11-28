# 🚀 INICIO RÁPIDO - ChatBotDysa

## Iniciar el Sistema Completo

### Método 1: Script Automático (Recomendado)
```bash
cd /Users/devlmer/ChatBotDysa
./scripts/test-production-local.sh
```

### Método 2: Inicio Manual de Servicios

#### 1. Verificar servicios base están activos
```bash
# PostgreSQL debe estar en puerto 15432
# Redis debe estar en puerto 16379
# Ollama debe estar en puerto 11434
```

#### 2. Iniciar Backend (Puerto 8005)
```bash
cd /Users/devlmer/ChatBotDysa/apps/backend
npm run start:dev > ../../logs/backend-dev.log 2>&1 &
```

#### 3. Iniciar Admin Panel (Puerto 7001)
```bash
cd /Users/devlmer/ChatBotDysa/apps/admin-panel
npm run dev -- -p 7001 > ../../logs/admin-dev.log 2>&1 &
```

#### 4. Iniciar Website (Puerto 6001)
```bash
cd /Users/devlmer/ChatBotDysa/apps/website
npm run dev -- -p 6001 > ../../logs/website-dev.log 2>&1 &
```

#### 5. Iniciar Web Widget (Puerto 7002)
```bash
cd /Users/devlmer/ChatBotDysa/apps/web-widget
npm run start > ../../logs/widget-dev.log 2>&1 &
```

---

## Verificar el Sistema

### 1. Verificación rápida de puertos
```bash
for port in 8005 7001 6001 7002; do
  echo -n "Puerto $port: "
  curl -s -o /dev/null -w "%{http_code}" http://localhost:$port
  echo ""
done
```

### 2. Prueba completa del sistema
```bash
bash /tmp/test-api-completo.sh
```

---

## URLs de Acceso

- **Admin Panel:** http://localhost:7001
- **Website:** http://localhost:6001
- **Web Widget:** http://localhost:7002
- **Backend API:** http://localhost:8005
- **API Docs:** http://localhost:8005/docs

## Credenciales

- **Email:** admin@zgamersa.com
- **Password:** Admin123!

---

## Problemas Comunes y Soluciones

### Error: "Module parse failed: Unexpected character '@'" (Tailwind CSS)
**Solución:** Limpiar cache de Next.js
```bash
rm -rf apps/admin-panel/.next apps/website/.next
```

### Error: "Missing script: dev" en Backend
**Solución:** Usar el comando correcto
```bash
npm run start:dev  # ✅ Correcto
# NO: npm run dev  # ❌ Incorrecto
```

### Puerto ocupado
**Solución:** Liberar puerto
```bash
lsof -ti:PUERTO | xargs kill -9
# Ejemplo: lsof -ti:8005 | xargs kill -9
```

### Detener todos los servicios
```bash
lsof -ti:8005 | xargs kill -9
lsof -ti:7001 | xargs kill -9
lsof -ti:6001 | xargs kill -9
lsof -ti:7002 | xargs kill -9
```

---

## Logs

Ver logs en tiempo real:
```bash
# Backend
tail -f logs/backend-dev.log

# Admin Panel
tail -f logs/admin-dev.log

# Website
tail -f logs/website-dev.log

# Web Widget
tail -f logs/widget-dev.log
```

---

## Estado Actual del Sistema

✅ **Última verificación:** 2025-11-11 21:05 GMT
✅ **Todos los servicios:** OPERATIVOS
✅ **Pruebas:** 10/10 pasadas (100%)
✅ **Base de datos:** Conectada y funcionando
✅ **Cache Redis:** Activo
✅ **AI Ollama:** Funcionando

---

## Próximos Pasos

1. ✅ Abrir http://localhost:7001 en navegador
2. ✅ Login con credenciales
3. ✅ Probar todas las funcionalidades
4. ✅ Verificar integración con IA
5. ✅ Probar creación de órdenes, reservas, etc.
