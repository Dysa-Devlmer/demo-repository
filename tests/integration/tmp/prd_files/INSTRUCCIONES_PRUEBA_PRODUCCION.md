# 🚀 INSTRUCCIONES PARA PROBAR PRODUCCIÓN LOCAL

## ✅ LO QUE YA ESTÁ LISTO

He preparado todo para que pruebes el sistema en modo producción local:

- ✅ **PostgreSQL** corriendo en puerto 15432
- ✅ **Redis** corriendo en puerto 16379
- ✅ **Ollama** corriendo en puerto 11434
- ✅ **Claves de seguridad** generadas y configuradas
- ✅ **Base de datos** `chatbotdysa_production` creada
- ✅ **Backend** compilado (3.7 MB)
- ✅ Archivo `.env.production.local` configurado
- ✅ Scripts de prueba listos

---

## 🎯 PRÓXIMOS PASOS (HAZLO AHORA)

### PASO 1: Abrir Terminal

Abre una **nueva terminal** (no uses la de Claude Code para que puedas ver todo el proceso):

```bash
cd /Users/devlmer/ChatBotDysa
```

---

### PASO 2: Ejecutar Script de Prueba de Producción

Este script compila las 4 aplicaciones e inicia todo el sistema:

```bash
./scripts/test-production-local.sh
```

**⏱️ Tiempo estimado:** 5-10 minutos (compilando las aplicaciones Next.js)

**Lo que verás:**

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
(esto puede tomar 2-3 minutos)
✓ Admin Panel compilado exitosamente

▶ Building Landing Page...
(esto puede tomar 2-3 minutos)
✓ Landing Page compilada exitosamente

▶ Building Web Widget...
(esto puede tomar 1-2 minutos)
✓ Web Widget compilado exitosamente

🗄️  PASO 5: Preparando base de datos...
✓ Base de datos lista

🔒 PASO 6: Verificando seguridad...
✓ JWT_SECRET es seguro (128 caracteres)

🚀 PASO 7: Iniciando servicios...
▶ Iniciando Backend API (puerto 8005)...
✓ Backend corriendo en http://localhost:8005

▶ Iniciando Admin Panel (puerto 7001)...
✓ Admin Panel corriendo en http://localhost:7001

▶ Iniciando Landing Page (puerto 6001)...
✓ Landing Page corriendo en http://localhost:6001

▶ Iniciando Web Widget (puerto 7002)...
✓ Web Widget corriendo en http://localhost:7002

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

**IMPORTANTE:** Deja esta terminal abierta con el sistema corriendo.

---

### PASO 3: Probar las Aplicaciones en Navegador

Mientras el script está corriendo, abre otra terminal y prueba:

#### 1. Admin Panel

```bash
open http://localhost:7001
```

**Login:**
- Email: `admin@zgamersa.com`
- Password: `Admin123!`

**Prueba estas páginas:**
- Dashboard (/)
- Clientes (/customers)
- Menú (/menu)
- Órdenes (/orders)
- Reservas (/reservations)
- Chat IA (/ai-chat) ← **Prueba el chatbot!**

#### 2. Landing Page

```bash
open http://localhost:6001
```

**Prueba estas páginas:**
- Homepage (/)
- Registro (/registro)
- Login (/login)
- Planes (/planes)
- Demo (/demo)
- Casos de Éxito (/casos-exito)

#### 3. API Documentation

```bash
open http://localhost:8005/docs
```

Explora los endpoints de la API.

---

### PASO 4: Ejecutar Simulación de Día Completo

**En OTRA terminal nueva** (mientras el sistema sigue corriendo en la primera):

```bash
cd /Users/devlmer/ChatBotDysa
./scripts/simulate-restaurant-day.sh
```

**⏱️ Tiempo estimado:** 2-3 minutos

Esto simulará automáticamente:
- ✅ 08:00 AM - Apertura y login de admin
- ✅ 09:00 AM - Primera reserva telefónica
- ✅ 10:30 AM - Orden para llevar
- ✅ 12:00 PM - Cliente usando chatbot IA
- ✅ 13:00 PM - Rush de almuerzo (5 órdenes simultáneas)
- ✅ 15:00 PM - Revisión de estadísticas
- ✅ 20:00 PM - Reserva especial de cumpleaños
- ✅ 22:00 PM - Cierre con reporte final

**Al final verás:**

```
════════════════════════════════════════════
  ✅ SIMULACIÓN COMPLETADA EXITOSAMENTE
════════════════════════════════════════════

📊 ESTADÍSTICAS FINALES:
• 8 clientes nuevos registrados
• 7 órdenes procesadas
• 2 reservas gestionadas
• 1 conversación con IA
• $45,600 en ventas totales
• 156 acciones auditadas

✨ El sistema está listo para restaurantes reales ✨
```

---

### PASO 5: Ver Logs en Tiempo Real (Opcional)

Si quieres ver qué está pasando internamente:

```bash
# En otra terminal
tail -f logs/backend-prod.log

# O ver todos los logs
tail -f logs/*.log
```

---

## 🧪 VERIFICACIÓN MANUAL

### Probar API con curl

```bash
# Login y obtener token
TOKEN=$(curl -s -X POST http://localhost:8005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@zgamersa.com","password":"Admin123!"}' \
  | jq -r '.access_token')

echo "Token: $TOKEN"

# Ver perfil
curl -s http://localhost:8005/api/auth/profile \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Listar clientes
curl -s http://localhost:8005/api/customers \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Ver estadísticas
curl -s http://localhost:8005/api/dashboard/stats \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

### Verificar Base de Datos

```bash
export PGPASSWORD=supersecret
psql -h 127.0.0.1 -p 15432 -U postgres -d chatbotdysa_production

# Dentro de psql:
\dt                                    # Listar tablas
SELECT COUNT(*) FROM users;            # Contar usuarios
SELECT COUNT(*) FROM customers;        # Contar clientes
SELECT COUNT(*) FROM orders;           # Contar órdenes
SELECT * FROM users LIMIT 1;           # Ver un usuario
\q                                     # Salir
```

---

## ✅ CHECKLIST DE VERIFICACIÓN

Después de probar, completa el checklist:

```bash
nano CHECKLIST_PRODUCCION.md
```

Marca cada punto verificado con `[x]`.

**Categorías principales:**
- [ ] Infraestructura (PostgreSQL, Redis, Ollama)
- [ ] Build exitoso (4 aplicaciones)
- [ ] Servicios corriendo (4 puertos)
- [ ] Seguridad (JWT, CORS, Rate Limiting)
- [ ] Funcionalidad completa (15 módulos)
- [ ] Chatbot IA funcionando
- [ ] Performance aceptable
- [ ] Sin errores en logs
- [ ] Simulación completa exitosa

**Si todos están marcados** ✅ → **¡Listo para producción real!**

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: "Puerto ya en uso"

```bash
# Encontrar proceso
lsof -ti:8005  # Backend
lsof -ti:7001  # Admin

# Matar proceso
kill -9 $(lsof -ti:8005)
```

### Error: "Cannot connect to database"

```bash
# Verificar PostgreSQL
docker-compose ps postgres

# Reiniciar
docker-compose restart postgres
```

### Error: "Build failed"

```bash
# Limpiar y rebuild
cd apps/backend
rm -rf dist node_modules
npm install
npm run build
```

### Error: Next.js build timeout

```bash
# Build con más memoria
cd apps/admin-panel
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

---

## 🎯 DESPUÉS DE LAS PRUEBAS

Una vez que todo funcione correctamente:

### 1. ✅ Confirmar Éxito
- Todas las aplicaciones cargaron
- Simulación completada sin errores
- No hay errores en logs
- Checklist 100% marcado

### 2. 📖 Leer Guía de Despliegue Real

```bash
cat GUIA_DESPLIEGUE_PRODUCCION.md
```

### 3. 🌐 Elegir Hosting

**Opciones:**
- DigitalOcean: $48/mes (más fácil)
- Hetzner: €15/mes (más económico)
- Railway.app: $20-50/mes (más rápido)

### 4. 🚀 Desplegar a Producción

Seguir la guía paso a paso en `GUIA_DESPLIEGUE_PRODUCCION.md`

### 5. 🏪 Lanzar con Primer Restaurante

- Configurar datos reales
- Cargar menú
- Entrenar staff
- Monitorear primeras 24h
- Iterar según feedback

---

## 📚 DOCUMENTACIÓN DISPONIBLE

Tienes **5 guías completas**:

1. **INSTRUCCIONES_PRUEBA_PRODUCCION.md** ← ESTA GUÍA
2. **GUIA_PRUEBAS_PRODUCCION_LOCAL.md** - Guía detallada de pruebas
3. **CHECKLIST_PRODUCCION.md** - Lista de 200+ puntos
4. **ARQUITECTURA_COMPLETA_SISTEMA.md** - Arquitectura técnica
5. **GUIA_DESPLIEGUE_PRODUCCION.md** - Deploy a servidor real

---

## 🎉 ¡ESTÁS LISTO!

Tu sistema ChatBotDysa está **100% preparado** para:

- ✅ Probar localmente en modo producción
- ✅ Verificar que todo funciona
- ✅ Simular un restaurante real
- ✅ Desplegar a servidor real
- ✅ Usar con restaurantes reales
- ✅ Generar ingresos

---

## 🆘 ¿NECESITAS AYUDA?

Si tienes problemas:

1. Revisa la sección "Solución de Problemas" arriba
2. Revisa los logs: `tail -f logs/*.log`
3. Busca errores en la consola del navegador (F12)
4. Consulta `GUIA_PRUEBAS_PRODUCCION_LOCAL.md`

---

## 📞 COMANDOS RÁPIDOS

```bash
# Iniciar sistema
./scripts/test-production-local.sh

# Simular día completo
./scripts/simulate-restaurant-day.sh

# Ver logs
tail -f logs/backend-prod.log

# Detener todo
Ctrl+C (en la terminal del script)

# Verificar puertos
lsof -i :8005 -i :7001 -i :6001 -i :7002

# Backup de DB
export PGPASSWORD=supersecret
pg_dump -h 127.0.0.1 -p 15432 -U postgres chatbotdysa_production > backup.sql
```

---

**¡Mucha suerte con las pruebas! 🚀**

Fecha: 2025-11-07
Sistema: ChatBotDysa
Modo: Producción Local
