# 🧪 GUÍA DE PRUEBAS DE PRODUCCIÓN LOCAL

## 📋 ÍNDICE
1. [¿Qué es esto?](#qué-es-esto)
2. [¿Por qué probar localmente?](#por-qué-probar-localmente)
3. [Requisitos Previos](#requisitos-previos)
4. [Preparación del Entorno](#preparación-del-entorno)
5. [Ejecución de Pruebas](#ejecución-de-pruebas)
6. [Verificación Manual](#verificación-manual)
7. [Simulación Completa](#simulación-completa)
8. [Solución de Problemas](#solución-de-problemas)
9. [Próximos Pasos](#próximos-pasos)

---

## 🤔 ¿Qué es esto?

Esta guía te permite **probar tu sistema ChatBotDysa en modo producción** pero corriendo **localmente en tu Mac**, antes de gastarte dinero en un servidor real.

Podrás verificar que **todo funciona exactamente como funcionaría en un restaurante real**, sin riesgo y sin costo.

---

## 🎯 ¿Por qué probar localmente?

### Ventajas

✅ **Sin costos**: No pagas hosting hasta estar 100% seguro
✅ **Sin riesgos**: Si algo falla, no afecta a clientes reales
✅ **Iteración rápida**: Puedes hacer cambios y probar inmediatamente
✅ **Debugging fácil**: Tienes acceso completo a logs y base de datos
✅ **Confianza total**: Vas a producción sabiendo que todo funciona

### Lo que simularás

🏪 Un día completo en un restaurante
📱 Clientes reales haciendo órdenes
📅 Reservas de mesas
🤖 Conversaciones con el chatbot IA
👨‍🍳 Staff actualizando estados
📊 Reportes de ventas
🔐 Seguridad y autenticación

---

## ✅ Requisitos Previos

Antes de empezar, verifica que tengas:

### Software Necesario

- [x] **Node.js** (v18 o superior)
- [x] **npm** (v9 o superior)
- [x] **PostgreSQL** corriendo en puerto 15432
- [x] **Redis** corriendo en puerto 16379
- [x] **Ollama** (opcional, para IA) en puerto 11434

### Verificación Rápida

```bash
# Verificar versiones
node --version    # Debe ser v18+
npm --version     # Debe ser v9+

# Verificar PostgreSQL
nc -z localhost 15432 && echo "✓ PostgreSQL corriendo" || echo "✗ PostgreSQL no disponible"

# Verificar Redis
nc -z localhost 16379 && echo "✓ Redis corriendo" || echo "✗ Redis no disponible"

# Verificar Ollama
nc -z localhost 11434 && echo "✓ Ollama corriendo" || echo "✗ Ollama no disponible"
```

### Iniciar Servicios (si no están corriendo)

```bash
# Con Docker Compose (recomendado)
docker-compose up -d postgres redis

# O manualmente
# PostgreSQL: brew services start postgresql
# Redis: brew services start redis
# Ollama: ollama serve
```

---

## ⚙️ Preparación del Entorno

### Paso 1: Generar Claves Secretas

Primero, genera claves seguras para producción:

```bash
cd /Users/devlmer/ChatBotDysa
node scripts/generate-secrets.js
```

**Salida esperada:**
```
🔐 GENERADOR DE CLAVES SECRETAS PARA PRODUCCIÓN

JWT_SECRET=8a7b6c5d4e3f2g1h...
JWT_REFRESH_SECRET=9z8y7x6w5v4u3t2s...
SESSION_SECRET=1a2b3c4d5e6f7g8h...
DATABASE_PASSWORD=xK9mN2pQ5rS8tU1v...
```

**IMPORTANTE:** Guarda estas claves, las necesitarás en el siguiente paso.

---

### Paso 2: Configurar Variables de Entorno

El archivo `.env.production.local` ya está creado. Solo necesitas:

1. **Revisar el archivo:**
```bash
nano .env.production.local
```

2. **Actualizar las claves generadas:**
```env
# Pegar las claves generadas en el paso anterior
JWT_SECRET=PEGAR_AQUI_TU_CLAVE_GENERADA
JWT_REFRESH_SECRET=PEGAR_AQUI_TU_CLAVE_GENERADA
SESSION_SECRET=PEGAR_AQUI_TU_CLAVE_GENERADA
```

3. **Verificar configuración:**
```env
NODE_ENV=production              # ✓ Debe ser "production"
DB_NAME=chatbotdysa_production   # ✓ Base de datos de producción
WHATSAPP_ENABLED=false           # ✓ Deshabilitado en local
STRIPE_ENABLED=false             # ✓ Deshabilitado en local
AI_ENABLED=true                  # ✓ Habilitado si tienes Ollama
```

4. **Guardar:** Ctrl+O, Enter, Ctrl+X

---

### Paso 3: Preparar Base de Datos

Crear base de datos de producción:

```bash
# Crear base de datos
PGPASSWORD=supersecret psql -h 127.0.0.1 -p 15432 -U postgres -c "CREATE DATABASE chatbotdysa_production;"

# Verificar que se creó
PGPASSWORD=supersecret psql -h 127.0.0.1 -p 15432 -U postgres -l | grep chatbotdysa_production
```

---

## 🚀 Ejecución de Pruebas

### Opción 1: Script Automático (Recomendado)

El script `test-production-local.sh` hace todo automáticamente:

```bash
cd /Users/devlmer/ChatBotDysa
./scripts/test-production-local.sh
```

**Lo que hace el script:**
1. ✅ Verifica requisitos (Node, PostgreSQL, Redis)
2. ✅ Carga variables de entorno de producción
3. ✅ Instala dependencias si hace falta
4. ✅ Compila todas las aplicaciones en modo producción
5. ✅ Prepara la base de datos
6. ✅ Verifica seguridad (JWT, passwords)
7. ✅ Inicia los 4 servicios
8. ✅ Verifica que todo esté corriendo

**Salida esperada:**
```
🚀 ======================================
🚀 PRUEBA DE PRODUCCIÓN LOCAL
🚀 ======================================

📋 PASO 1: Verificando requisitos...
✓ Node.js v20.x.x
✓ npm 10.x.x
✓ PostgreSQL corriendo en puerto 15432
✓ Redis corriendo en puerto 16379
✓ Ollama corriendo

⚙️  PASO 2: Configurando entorno de producción...
✓ Variables de entorno cargadas
✓ NODE_ENV=production

📦 PASO 3: Verificando dependencias...
✓ node_modules existe

🔨 PASO 4: Compilando aplicaciones...
▶ Building Backend API...
✓ Backend compilado exitosamente

▶ Building Admin Panel...
✓ Admin Panel compilado exitosamente

▶ Building Landing Page...
✓ Landing Page compilada exitosamente

▶ Building Web Widget...
✓ Web Widget compilado exitosamente

🗄️  PASO 5: Preparando base de datos...
✓ Base de datos lista

🔒 PASO 6: Verificando seguridad...
✓ JWT_SECRET es seguro (64 caracteres)

🚀 PASO 7: Iniciando servicios...
▶ Iniciando Backend API (puerto 8005)...
✓ Backend corriendo en http://localhost:8005

▶ Iniciando Admin Panel (puerto 7001)...
▶ Iniciando Landing Page (puerto 6001)...
▶ Iniciando Web Widget (puerto 7002)...

✅ PASO 8: Verificando servicios...
✓ Backend API: http://localhost:8005
✓ Admin Panel: http://localhost:7001
✓ Landing Page: http://localhost:6001
✓ Web Widget: http://localhost:7002

✨ ======================================
✨ SISTEMA EN MODO PRODUCCIÓN LOCAL
✨ ======================================

📱 APLICACIONES:
   • Backend API:    http://localhost:8005
   • Admin Panel:    http://localhost:7001
   • Landing Page:   http://localhost:6001
   • Web Widget:     http://localhost:7002

📊 DOCUMENTACIÓN:
   • API Docs:       http://localhost:8005/docs

📝 LOGS:
   • Backend:        tail -f logs/backend-prod.log
   • Admin:          tail -f logs/admin-prod.log
   • Landing:        tail -f logs/landing-prod.log
   • Widget:         tail -f logs/widget-prod.log

⏹️  Presiona Ctrl+C para detener todos los servicios
```

**El script quedará corriendo**. Déjalo abierto y continúa con las pruebas en otra terminal.

---

### Opción 2: Manual (Paso a Paso)

Si prefieres hacerlo manualmente:

```bash
# Terminal 1: Backend
cd apps/backend
NODE_ENV=production npm run build
NODE_ENV=production npm run start:prod

# Terminal 2: Admin Panel
cd apps/admin-panel
NODE_ENV=production npm run build
NODE_ENV=production npm run start

# Terminal 3: Landing Page
cd apps/landing-page
NODE_ENV=production npm run build
NODE_ENV=production npm run start

# Terminal 4: Web Widget
cd apps/web-widget
NODE_ENV=production npm run build
NODE_ENV=production npm run start
```

---

## 🔍 Verificación Manual

Una vez que todos los servicios estén corriendo, verifica manualmente:

### 1. Verificar Backend API

```bash
# Health check
curl http://localhost:8005/api/health

# Debe responder: {"status":"ok"}
```

Abrir en navegador: http://localhost:8005/docs (Swagger docs)

---

### 2. Verificar Admin Panel

**Abrir en navegador:** http://localhost:7001

**Login:**
- Email: `admin@zgamersa.com`
- Password: `Admin123!`

**Verificar páginas:**
- ✅ Dashboard (/)
- ✅ Clientes (/customers)
- ✅ Menú (/menu)
- ✅ Órdenes (/orders)
- ✅ Reservas (/reservations)
- ✅ Analytics (/analytics)
- ✅ Configuración (/settings)
- ✅ Chat IA (/ai-chat)

---

### 3. Verificar Landing Page

**Abrir en navegador:** http://localhost:6001

**Verificar páginas:**
- ✅ Homepage (/)
- ✅ Registro (/registro)
- ✅ Login (/login)
- ✅ Planes (/planes)
- ✅ Demo (/demo)
- ✅ Casos de Éxito (/casos-exito)

---

### 4. Verificar Web Widget

**Abrir en navegador:** http://localhost:7002

**Verificar:**
- ✅ Botón flotante visible
- ✅ Chat se abre al hacer clic
- ✅ Se puede enviar mensaje
- ✅ Bot responde (si Ollama está corriendo)

---

### 5. Probar API con curl

```bash
# Login y obtener token
TOKEN=$(curl -s -X POST http://localhost:8005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@zgamersa.com","password":"Admin123!"}' \
  | jq -r '.access_token')

echo "Token obtenido: $TOKEN"

# Ver perfil
curl -s http://localhost:8005/api/auth/profile \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Listar clientes
curl -s http://localhost:8005/api/customers \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Ver estadísticas
curl -s http://localhost:8005/api/dashboard/stats \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Listar menú
curl -s http://localhost:8005/api/menu \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Listar órdenes
curl -s http://localhost:8005/api/orders \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

---

### 6. Verificar Base de Datos

```bash
# Conectar a la base de datos
PGPASSWORD=supersecret psql -h 127.0.0.1 -p 15432 -U postgres -d chatbotdysa_production

# Dentro de psql:
\dt                    # Listar tablas
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM customers;
SELECT COUNT(*) FROM orders;
SELECT * FROM users WHERE email = 'admin@zgamersa.com';

# Salir
\q
```

---

### 7. Verificar Logs

```bash
# En otra terminal
cd /Users/devlmer/ChatBotDysa

# Ver logs en tiempo real
tail -f logs/backend-prod.log
tail -f logs/admin-prod.log
tail -f logs/landing-prod.log
tail -f logs/widget-prod.log
```

**Buscar errores:**
```bash
grep -i "error" logs/backend-prod.log
grep -i "warning" logs/backend-prod.log
```

---

## 🎬 Simulación Completa

Ahora viene lo mejor: simular un día completo en un restaurante real.

### Ejecutar Simulación Automática

```bash
# En otra terminal (mientras los servicios corren)
cd /Users/devlmer/ChatBotDysa
./scripts/simulate-restaurant-day.sh
```

**Lo que hace la simulación:**

#### 08:00 AM - Apertura
- ✅ Administrador inicia sesión
- ✅ Revisa dashboard
- ✅ Verifica menú del día

#### 09:00 AM - Primeros Clientes
- ✅ Cliente llama para reserva
- ✅ Se registra cliente nuevo
- ✅ Se confirma reserva para la noche

#### 10:30 AM - Orden para Llevar
- ✅ Cliente hace orden en local
- ✅ Orden se envía a cocina
- ✅ Estados actualizados: pending → preparing → ready → delivered

#### 12:00 PM - Chatbot
- ✅ Cliente interactúa con chatbot
- ✅ Hace preguntas sobre el menú
- ✅ Bot responde con IA
- ✅ Completa reserva via chat

#### 13:00 PM - Rush de Almuerzo
- ✅ 5 órdenes llegando simultáneamente
- ✅ Sistema maneja carga sin problemas
- ✅ Todas las órdenes procesadas

#### 15:00 PM - Revisión de Medio Día
- ✅ Estadísticas actualizadas
- ✅ Reporte de ventas
- ✅ Métricas de performance

#### 20:00 PM - Reserva Especial
- ✅ Cliente con reserva llega
- ✅ Mesa asignada
- ✅ Orden especial de cumpleaños
- ✅ Experiencia completa

#### 22:00 PM - Cierre del Día
- ✅ Reporte final generado
- ✅ Total de ventas calculado
- ✅ Auditoría de todas las acciones
- ✅ Base de datos íntegra

**Salida esperada al final:**

```
════════════════════════════════════════════
  ✅ SIMULACIÓN COMPLETADA EXITOSAMENTE
════════════════════════════════════════════

📋 RESULTADOS:
✓ Sistema manejó un día completo de operaciones
✓ Todas las funcionalidades probadas exitosamente
✓ Base de datos mantiene integridad
✓ Auditoría registrando todas las acciones
✓ Performance aceptable bajo carga

📊 ESTADÍSTICAS FINALES:
• 8 clientes nuevos registrados
• 7 órdenes procesadas
• 2 reservas gestionadas
• 1 conversaciones con IA
• $45,600 en ventas totales
• 156 acciones auditadas

✨ El sistema está listo para usarse en restaurantes reales ✨
```

---

## ✅ Checklist de Verificación

Después de la simulación, completa el checklist:

```bash
# Abrir checklist
nano CHECKLIST_PRODUCCION.md
```

**Marca cada punto verificado con:** `[x]`

**Categorías principales:**
1. ✅ Infraestructura (PostgreSQL, Redis, Ollama)
2. ✅ Build y Compilación (Backend, Admin, Landing, Widget)
3. ✅ Servicios Corriendo (4 aplicaciones)
4. ✅ Seguridad (JWT, RBAC, Rate Limiting, CORS)
5. ✅ Funcionalidad Completa (15 módulos)
6. ✅ Chatbot IA (Ollama integration)
7. ✅ Aplicaciones Web (18 páginas admin, 6 landing)
8. ✅ Integraciones (WhatsApp, Twilio, Stripe en test mode)
9. ✅ Pruebas de Usuario (Cliente, Staff, Manager, Admin)
10. ✅ Manejo de Errores
11. ✅ Performance (Tiempos de carga, Lighthouse)
12. ✅ Logs y Monitoreo
13. ✅ Respaldos
14. ✅ Pruebas de Estrés
15. ✅ Lista Final Pre-Producción

---

## 🐛 Solución de Problemas

### Problema: PostgreSQL no conecta

```bash
# Verificar que esté corriendo
docker-compose ps postgres

# Ver logs
docker-compose logs postgres

# Reiniciar
docker-compose restart postgres
```

---

### Problema: Redis no conecta

```bash
# Verificar
docker-compose ps redis

# Reiniciar
docker-compose restart redis

# Probar manualmente
redis-cli -p 16379 ping
```

---

### Problema: Error al compilar Backend

```bash
cd apps/backend

# Limpiar y reinstalar
rm -rf dist node_modules
npm install
npm run build
```

---

### Problema: Error al compilar Next.js apps

```bash
cd apps/admin-panel  # o landing-page, o web-widget

# Limpiar
rm -rf .next node_modules

# Reinstalar
npm install

# Build con más memoria
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

---

### Problema: JWT Invalid Signature

**Causa:** El JWT_SECRET cambió entre dev y producción.

**Solución:**
1. Logout de todas las sesiones
2. Borrar cookies del navegador
3. Login nuevamente
4. Obtener nuevo token

```bash
# Obtener nuevo token
curl -X POST http://localhost:8005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@zgamersa.com","password":"Admin123!"}'
```

---

### Problema: Ollama no responde

```bash
# Verificar que esté corriendo
curl http://localhost:11434/api/tags

# Si no responde, iniciar Ollama
ollama serve

# Verificar modelo
ollama list

# Si no está el modelo, descargarlo
ollama pull llama3:8b
```

---

### Problema: Base de datos no tiene tablas

```bash
# Ejecutar migraciones
cd apps/backend
npm run typeorm:run

# O recrear base de datos
PGPASSWORD=supersecret psql -h 127.0.0.1 -p 15432 -U postgres -c "DROP DATABASE chatbotdysa_production;"
PGPASSWORD=supersecret psql -h 127.0.0.1 -p 15432 -U postgres -c "CREATE DATABASE chatbotdysa_production;"

# Ejecutar migraciones
npm run typeorm:run

# Seed de datos iniciales
npm run seed:prod
```

---

### Problema: Puerto ya en uso

```bash
# Encontrar qué proceso usa el puerto
lsof -ti:8005  # Backend
lsof -ti:7001  # Admin Panel
lsof -ti:6001  # Landing Page
lsof -ti:7002  # Web Widget

# Matar proceso
kill -9 $(lsof -ti:8005)

# O cambiar puerto en .env.production.local
PORT=8006  # En lugar de 8005
```

---

### Problema: "Error: ENOSPC" (No hay espacio)

```bash
# Limpiar builds anteriores
rm -rf apps/backend/dist
rm -rf apps/admin-panel/.next
rm -rf apps/landing-page/.next
rm -rf apps/web-widget/.next

# Limpiar node_modules innecesarios
find . -name "node_modules" -type d -prune -exec rm -rf '{}' +

# Reinstalar desde raíz
npm install
```

---

### Problema: Admin panel muestra página en blanco

1. Abrir consola del navegador (F12)
2. Ver errores de JavaScript
3. Verificar que el backend esté corriendo
4. Verificar CORS en .env.production.local:

```env
CORS_ORIGINS=http://localhost:7001,http://localhost:6001,http://localhost:7002
```

5. Reiniciar backend

---

## 🎯 Próximos Pasos

Una vez que hayas completado todas las pruebas locales:

### 1. ✅ Confirmar que todo funciona

- [ ] Todos los puntos del checklist marcados
- [ ] Simulación completa exitosa
- [ ] No hay errores en logs
- [ ] Performance aceptable
- [ ] Todas las páginas cargan correctamente

---

### 2. 📸 Tomar Screenshots

Toma capturas de pantalla de:
- Dashboard principal
- Página de clientes
- Página de órdenes
- Chatbot funcionando
- Reportes

Guárdalas en `/docs/screenshots/` para referencia.

---

### 3. 📝 Documentar Issues

Si encontraste problemas:

```bash
# Crear archivo de issues
nano ISSUES_ENCONTRADOS.md
```

Documenta:
- Qué problema encontraste
- Cuándo ocurre
- Cómo reproducirlo
- Si lo solucionaste, cómo

---

### 4. 🚀 Preparar para Producción Real

Ahora sí, estás listo para ir a producción real:

```bash
# Leer guía de despliegue
cat GUIA_DESPLIEGUE_PRODUCCION.md
```

**Pasos sugeridos:**

1. **Elegir hosting** (DigitalOcean, Hetzner, Railway)
2. **Comprar dominio** (Namecheap, Porkbun)
3. **Configurar servidor** (Ubuntu 22.04)
4. **Configurar variables de entorno reales**
5. **Deploy del código**
6. **Configurar dominio y SSL**
7. **Configurar integraciones** (WhatsApp, Stripe reales)
8. **Lanzar con primer restaurante piloto**

---

### 5. 📊 Monitoreo Post-Lanzamiento

Después del lanzamiento:

- Monitorear logs las primeras 24 horas
- Verificar que no haya errores
- Recolectar feedback del restaurante
- Hacer ajustes si es necesario
- Iterar y mejorar

---

## 💡 Tips Finales

### Mejores Prácticas

✅ **Siempre prueba localmente antes de producción**
✅ **Mantén logs organizados y revisalos frecuentemente**
✅ **Haz backups de la base de datos antes de cambios grandes**
✅ **Documenta cualquier cambio que hagas**
✅ **Usa el checklist para no olvidar nada**

### Comandos Útiles

```bash
# Ver todas las aplicaciones corriendo
lsof -i :8005 -i :7001 -i :6001 -i :7002

# Ver uso de memoria
ps aux | grep node

# Limpiar todo y empezar de nuevo
./scripts/clean-all.sh  # Si existe

# Backup rápido de DB
PGPASSWORD=supersecret pg_dump -h 127.0.0.1 -p 15432 -U postgres chatbotdysa_production > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
PGPASSWORD=supersecret psql -h 127.0.0.1 -p 15432 -U postgres chatbotdysa_production < backup_20251107.sql
```

---

## 🎉 ¡Felicitaciones!

Si llegaste hasta aquí y todo funcionó, ¡felicitaciones! 🎊

Tu sistema ChatBotDysa está **100% listo para producción real**.

Ahora puedes:
- 🏢 Desplegarlo en un servidor real
- 🍽️ Usarlo con restaurantes reales
- 💰 Empezar a generar ingresos
- 📈 Escalar a múltiples restaurantes

---

## 📚 Documentación Relacionada

- **ARQUITECTURA_COMPLETA_SISTEMA.md** - Arquitectura técnica completa
- **GUIA_DESPLIEGUE_PRODUCCION.md** - Cómo desplegar a servidor real
- **GUIA_TODAS_APLICACIONES_WEB.md** - Cómo usar las aplicaciones
- **CHECKLIST_PRODUCCION.md** - Lista de verificación completa

---

## 🆘 ¿Necesitas Ayuda?

Si tienes problemas:

1. Revisa la sección "Solución de Problemas" arriba
2. Revisa los logs en `/logs/`
3. Busca errores en la consola del navegador (F12)
4. Verifica que todos los servicios estén corriendo
5. Consulta la documentación de arquitectura

---

**¡Mucha suerte con tu lanzamiento! 🚀**

Fecha de última actualización: 2025-11-07
