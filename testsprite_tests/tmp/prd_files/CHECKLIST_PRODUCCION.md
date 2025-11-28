# ✅ CHECKLIST DE VERIFICACIÓN PARA PRODUCCIÓN

## 📋 GUÍA DE USO

Este checklist te ayudará a verificar que todo está listo para producción antes de desplegar a un servidor real.

**Instrucciones:**
- ✅ = Verificado y funcionando
- ⚠️ = Requiere atención
- ❌ = No funciona o falta

---

## 🔧 1. INFRAESTRUCTURA Y SERVICIOS

### Base de Datos PostgreSQL
- [ ] PostgreSQL corriendo
- [ ] Puerto 15432 accesible
- [ ] Base de datos `chatbotdysa_production` creada
- [ ] Usuario y contraseña configurados
- [ ] Migraciones ejecutadas sin errores
- [ ] Datos de seed cargados (usuarios, roles, permisos)
- [ ] Respaldo automático configurado

**Verificación:**
```bash
PGPASSWORD=supersecret psql -h 127.0.0.1 -p 15432 -U postgres -d chatbotdysa_production -c "\dt"
```

**Resultado esperado:** Lista de 23 tablas

---

### Redis Cache
- [ ] Redis corriendo
- [ ] Puerto 16379 accesible
- [ ] Conexión desde backend exitosa
- [ ] Sesiones guardándose correctamente
- [ ] TTL configurado para cache

**Verificación:**
```bash
redis-cli -p 16379 ping
```

**Resultado esperado:** `PONG`

---

### Ollama IA
- [ ] Ollama service corriendo
- [ ] Modelo llama3:8b descargado (4.3 GB)
- [ ] Puerto 11434 accesible
- [ ] Backend puede conectarse
- [ ] Respuestas del chatbot funcionando

**Verificación:**
```bash
curl http://localhost:11434/api/tags
```

**Resultado esperado:** JSON con modelo llama3:8b

---

## 🔨 2. BUILD Y COMPILACIÓN

### Backend API
- [ ] `npm run build` sin errores
- [ ] Directorio `dist/` creado
- [ ] TypeScript compilado correctamente
- [ ] Tamaño del build razonable (~5-10 MB)
- [ ] No hay warnings críticos

**Verificación:**
```bash
cd apps/backend && npm run build
ls -lh dist/
```

---

### Admin Panel (Next.js)
- [ ] `npm run build` sin errores
- [ ] Directorio `.next/` creado
- [ ] Build optimizado para producción
- [ ] Static files generados
- [ ] Tamaño del build < 50 MB

**Verificación:**
```bash
cd apps/admin-panel && npm run build
du -sh .next/
```

---

### Landing Page (Next.js)
- [ ] `npm run build` sin errores
- [ ] Directorio `.next/` creado
- [ ] Páginas estáticas generadas
- [ ] Assets optimizados
- [ ] Lighthouse score > 90

**Verificación:**
```bash
cd apps/landing-page && npm run build
```

---

### Web Widget (Next.js)
- [ ] `npm run build` sin errores
- [ ] Directorio `.next/` creado
- [ ] Bundle size < 1 MB
- [ ] Script embebible generado

**Verificación:**
```bash
cd apps/web-widget && npm run build
```

---

## 🚀 3. SERVICIOS CORRIENDO

### Backend API (Puerto 8005)
- [ ] Servicio iniciado sin errores
- [ ] Health check responde: `/api/health`
- [ ] Swagger docs accesible: `/docs`
- [ ] Database conectada
- [ ] Redis conectado
- [ ] No hay errores en logs

**Verificación:**
```bash
curl http://localhost:8005/api/health
```

**Resultado esperado:** `{"status":"ok"}`

---

### Admin Panel (Puerto 7001)
- [ ] Aplicación accesible
- [ ] Login page carga correctamente
- [ ] No errores en consola del navegador
- [ ] Assets cargando correctamente
- [ ] Conexión al backend funciona

**Verificación:**
```bash
curl http://localhost:7001
```

**Resultado esperado:** HTML de la página

---

### Landing Page (Puerto 6001)
- [ ] Homepage carga correctamente
- [ ] Todas las 6 páginas accesibles
- [ ] Navegación funciona
- [ ] Formularios funcionan
- [ ] Links a admin panel funcionan

**Verificación:**
```bash
curl http://localhost:6001
```

---

### Web Widget (Puerto 7002)
- [ ] Widget carga correctamente
- [ ] Script embebible disponible
- [ ] Chat se abre/cierra correctamente
- [ ] Mensajes se envían
- [ ] Conexión WebSocket funciona

**Verificación:**
```bash
curl http://localhost:7002
```

---

## 🔐 4. SEGURIDAD

### Autenticación JWT
- [ ] JWT_SECRET tiene al menos 64 caracteres
- [ ] Tokens se generan correctamente
- [ ] Tokens expiran después de 1 hora
- [ ] Refresh tokens funcionan
- [ ] Logout invalida tokens

**Verificación:**
```bash
# Login
curl -X POST http://localhost:8005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@zgamersa.com","password":"Admin123!"}'
```

**Resultado esperado:** JSON con `access_token` y `refresh_token`

---

### RBAC (Roles y Permisos)
- [ ] 3 roles creados (admin, manager, staff)
- [ ] Permisos asignados correctamente
- [ ] Middleware de permisos funciona
- [ ] Admin tiene acceso total
- [ ] Manager tiene acceso limitado
- [ ] Staff solo lectura

**Verificación:**
```bash
# Obtener perfil con token
curl http://localhost:8005/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Rate Limiting
- [ ] Límite de 20 requests/minuto configurado
- [ ] Se bloquea después del límite
- [ ] Headers incluyen límite actual
- [ ] Se resetea después de 1 minuto

**Verificación:**
```bash
# Hacer 25 requests rápidos
for i in {1..25}; do
  curl -w "%{http_code}\n" http://localhost:8005/api/health
done
```

**Resultado esperado:** Primeros 20 con código 200, siguientes con 429

---

### CORS
- [ ] Orígenes permitidos configurados
- [ ] Landing page puede acceder al backend
- [ ] Admin panel puede acceder al backend
- [ ] Web widget puede acceder al backend
- [ ] Otros orígenes son bloqueados

**Verificación:**
```bash
curl -H "Origin: http://localhost:7001" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS http://localhost:8005/api/health -v
```

---

### Cifrado de Contraseñas
- [ ] bcrypt con 12 rounds configurado
- [ ] Contraseñas nunca se guardan en texto plano
- [ ] Login compara hashes correctamente
- [ ] Cambio de contraseña funciona

---

## 📊 5. FUNCIONALIDAD COMPLETA

### Módulo de Autenticación
- [ ] Login con email y contraseña
- [ ] Registro de nuevos usuarios
- [ ] Recuperación de contraseña
- [ ] Cambio de contraseña
- [ ] Cierre de sesión
- [ ] Refresh token

**Test:**
1. Login: `admin@zgamersa.com` / `Admin123!`
2. Ver perfil
3. Cambiar contraseña
4. Logout
5. Login con nueva contraseña

---

### Módulo de Clientes (Customers)
- [ ] Listar clientes con paginación
- [ ] Crear nuevo cliente
- [ ] Ver detalle de cliente
- [ ] Editar cliente existente
- [ ] Eliminar cliente (soft delete)
- [ ] Buscar clientes por nombre/email/teléfono
- [ ] Exportar a CSV
- [ ] Filtros funcionan

**Test:**
```bash
JWT="YOUR_TOKEN"

# Listar clientes
curl http://localhost:8005/api/customers -H "Authorization: Bearer $JWT"

# Crear cliente
curl -X POST http://localhost:8005/api/customers \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Juan",
    "last_name": "Pérez",
    "email": "juan.perez@test.com",
    "phone": "+5491123456789"
  }'
```

---

### Módulo de Menú (Menu Items)
- [ ] Listar items del menú
- [ ] Crear nuevo item
- [ ] Editar item existente
- [ ] Eliminar item
- [ ] Categorías funcionan
- [ ] Imágenes se suben correctamente
- [ ] Precios se muestran correctamente
- [ ] Items agotados marcados

**Test:**
```bash
# Listar menú
curl http://localhost:8005/api/menu -H "Authorization: Bearer $JWT"

# Crear item
curl -X POST http://localhost:8005/api/menu \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pizza Margherita",
    "description": "Pizza clásica italiana",
    "price": 1500,
    "category": "Pizzas",
    "available": true
  }'
```

---

### Módulo de Órdenes (Orders)
- [ ] Crear nueva orden
- [ ] Ver todas las órdenes
- [ ] Ver detalle de orden
- [ ] Actualizar estado de orden
- [ ] Calcular total correctamente
- [ ] Items de orden vinculados
- [ ] Cliente vinculado
- [ ] Estados: pending, confirmed, preparing, ready, delivered, cancelled

**Test:**
```bash
# Crear orden
curl -X POST http://localhost:8005/api/orders \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "items": [
      {"menu_item_id": 1, "quantity": 2}
    ],
    "delivery_address": "Av. Siempre Viva 123"
  }'
```

---

### Módulo de Reservas (Reservations)
- [ ] Crear reserva
- [ ] Ver todas las reservas
- [ ] Ver detalle de reserva
- [ ] Actualizar estado de reserva
- [ ] Verificar disponibilidad de mesas
- [ ] Notificaciones de confirmación
- [ ] Estados: pending, confirmed, seated, completed, cancelled

**Test:**
```bash
# Crear reserva
curl -X POST http://localhost:8005/api/reservations \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "date": "2025-11-10",
    "time": "20:00",
    "party_size": 4,
    "notes": "Mesa junto a la ventana"
  }'
```

---

### Módulo de Conversaciones (Chatbot)
- [ ] Crear nueva conversación
- [ ] Enviar mensaje
- [ ] Recibir respuesta del bot
- [ ] Historial de mensajes
- [ ] Cerrar conversación
- [ ] Múltiples conversaciones simultáneas

**Test:**
```bash
# Iniciar conversación
curl -X POST http://localhost:8005/api/conversations \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1
  }'

# Enviar mensaje
curl -X POST http://localhost:8005/api/conversations/1/messages \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hola, quiero hacer una reserva"
  }'
```

---

### Módulo de Dashboard
- [ ] Estadísticas generales
- [ ] Total de órdenes del día
- [ ] Total de ventas del día
- [ ] Órdenes pendientes
- [ ] Reservas de hoy
- [ ] Clientes nuevos
- [ ] Gráficas funcionan

**Test:**
```bash
curl http://localhost:8005/api/dashboard/stats -H "Authorization: Bearer $JWT"
```

---

### Módulo de Reportes
- [ ] Reporte de ventas
- [ ] Reporte de clientes
- [ ] Reporte de reservas
- [ ] Exportar a PDF
- [ ] Exportar a Excel
- [ ] Filtros por fecha funcionan

**Test:**
```bash
curl "http://localhost:8005/api/reports/sales?from=2025-11-01&to=2025-11-07" \
  -H "Authorization: Bearer $JWT"
```

---

### Módulo de Configuración (Settings)
- [ ] Ver configuraciones
- [ ] Actualizar configuraciones
- [ ] Logo del restaurante
- [ ] Información de contacto
- [ ] Horarios de atención
- [ ] Redes sociales

**Test:**
```bash
# Ver settings
curl http://localhost:8005/api/settings -H "Authorization: Bearer $JWT"

# Actualizar
curl -X PATCH http://localhost:8005/api/settings \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "restaurant_name": "Mi Restaurante",
    "phone": "+5491123456789"
  }'
```

---

## 🤖 6. CHATBOT IA

### Ollama Integration
- [ ] Ollama corriendo en puerto 11434
- [ ] Modelo llama3:8b cargado
- [ ] Backend puede conectarse a Ollama
- [ ] Respuestas coherentes
- [ ] Tiempo de respuesta < 5 segundos
- [ ] Manejo de errores

**Test:**
```bash
# Test directo a Ollama
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3:8b",
    "prompt": "¿Qué platillos recomiendas?",
    "stream": false
  }'
```

---

### Chatbot en Admin Panel
- [ ] Página /ai-chat accesible
- [ ] Chat se carga correctamente
- [ ] Mensajes se envían
- [ ] Respuestas se reciben
- [ ] Historial se guarda
- [ ] Múltiples conversaciones

**Test manual:**
1. Ir a http://localhost:7001/ai-chat
2. Enviar: "Hola"
3. Esperar respuesta del bot
4. Verificar que el historial se guarde

---

### Chatbot en Web Widget
- [ ] Widget embebible en sitio web
- [ ] Botón flotante funciona
- [ ] Chat se abre/cierra
- [ ] Mensajes en tiempo real
- [ ] Conexión WebSocket estable

**Test:**
1. Ir a http://localhost:7002
2. Hacer clic en el botón flotante
3. Enviar mensaje
4. Verificar respuesta

---

## 🌐 7. APLICACIONES WEB

### Landing Page

#### Homepage (/)
- [ ] Hero section carga
- [ ] Features section visible
- [ ] CTA buttons funcionan
- [ ] Links funcionan
- [ ] Responsive en móvil

#### Registro (/registro)
- [ ] Formulario de registro funciona
- [ ] Validaciones de campos
- [ ] Envío exitoso
- [ ] Errores se muestran correctamente

#### Login (/login)
- [ ] Formulario de login funciona
- [ ] Redirección después de login
- [ ] Remember me funciona
- [ ] Forgot password funciona

#### Planes (/planes)
- [ ] 3 planes se muestran
- [ ] Precios correctos
- [ ] Botones de selección funcionan

#### Demo (/demo)
- [ ] Demo interactivo funciona
- [ ] Formulario de contacto funciona

#### Casos de Éxito (/casos-exito)
- [ ] Testimonios se muestran
- [ ] Casos de estudio cargados

---

### Admin Panel

#### Dashboard (/)
- [ ] Estadísticas cargan
- [ ] Gráficas se muestran
- [ ] Datos en tiempo real

#### Clientes (/customers)
- [ ] Lista de clientes
- [ ] Paginación funciona
- [ ] Búsqueda funciona
- [ ] Crear cliente
- [ ] Editar cliente
- [ ] Eliminar cliente

#### Menú (/menu)
- [ ] Lista de items
- [ ] Crear item con imagen
- [ ] Editar item
- [ ] Eliminar item
- [ ] Categorías funcionan

#### Órdenes (/orders)
- [ ] Lista de órdenes
- [ ] Ver detalle
- [ ] Cambiar estado
- [ ] Filtros por estado

#### Reservas (/reservations)
- [ ] Lista de reservas
- [ ] Calendario de reservas
- [ ] Crear reserva
- [ ] Confirmar/Cancelar

#### Analytics (/analytics)
- [ ] Gráficas de ventas
- [ ] Métricas de clientes
- [ ] Productos más vendidos

#### Configuración (/settings)
- [ ] Ver configuración actual
- [ ] Actualizar información
- [ ] Subir logo
- [ ] Cambiar horarios

#### Usuarios (/users)
- [ ] Lista de usuarios del sistema
- [ ] Crear usuario
- [ ] Asignar roles
- [ ] Cambiar permisos

#### Chat IA (/ai-chat)
- [ ] Chatbot funciona
- [ ] Respuestas coherentes
- [ ] Historial se guarda

---

## 🔌 8. INTEGRACIONES EXTERNAS

### WhatsApp Business API (Modo Test)
- [ ] Credenciales configuradas
- [ ] Webhook configurado
- [ ] Envío de mensajes (modo test)
- [ ] Recepción de mensajes
- [ ] Templates aprobados

**Nota:** En producción local, dejar `WHATSAPP_ENABLED=false`

---

### Twilio SMS/Voice (Modo Test)
- [ ] Account SID configurado
- [ ] Auth Token configurado
- [ ] Número de teléfono asignado
- [ ] Envío de SMS (modo test)

**Nota:** En producción local, dejar `TWILIO_ENABLED=false`

---

### Stripe Payments (Test Mode)
- [ ] Test API keys configuradas
- [ ] Webhook secret configurado
- [ ] Pagos de prueba funcionan
- [ ] Webhooks procesados

**Nota:** Usar solo test keys: `sk_test_...`

---

### SendGrid Email (Test Mode)
- [ ] API key configurado
- [ ] Email de remitente verificado
- [ ] Envío de emails funciona
- [ ] Templates funcionan

**Nota:** En producción local, dejar `SENDGRID_ENABLED=false`

---

## 📱 9. PRUEBAS DE USUARIO FINAL

### Como Cliente
- [ ] Puedo ver el menú
- [ ] Puedo hacer una orden
- [ ] Puedo hacer una reserva
- [ ] Puedo chatear con el bot
- [ ] Recibo confirmaciones

---

### Como Staff
- [ ] Puedo ver órdenes pendientes
- [ ] Puedo actualizar estado de órdenes
- [ ] Puedo ver reservas
- [ ] Puedo ver información de clientes

---

### Como Manager
- [ ] Todo lo de Staff
- [ ] Puedo crear/editar menú
- [ ] Puedo ver reportes
- [ ] Puedo gestionar clientes

---

### Como Admin
- [ ] Todo lo de Manager
- [ ] Puedo crear usuarios
- [ ] Puedo asignar roles
- [ ] Puedo cambiar configuración
- [ ] Puedo ver logs de auditoría

---

## 🚨 10. MANEJO DE ERRORES

### Errores de Red
- [ ] Timeout manejado correctamente
- [ ] Reconexión automática
- [ ] Mensajes de error claros

---

### Errores de Base de Datos
- [ ] Conexión perdida manejada
- [ ] Queries fallidos no rompen app
- [ ] Logs de errores guardados

---

### Errores de IA
- [ ] Ollama no disponible manejado
- [ ] Timeout de IA (> 30s) manejado
- [ ] Mensaje alternativo al usuario

---

### Errores de Validación
- [ ] Campos requeridos validados
- [ ] Formatos validados (email, teléfono)
- [ ] Mensajes de error claros

---

## 📊 11. PERFORMANCE

### Tiempos de Carga
- [ ] Homepage < 2 segundos
- [ ] Admin dashboard < 3 segundos
- [ ] API response < 500ms
- [ ] Chatbot response < 5 segundos

---

### Lighthouse Scores (Admin Panel)
- [ ] Performance: > 80
- [ ] Accessibility: > 90
- [ ] Best Practices: > 90
- [ ] SEO: > 80

---

### Database Performance
- [ ] Queries < 100ms
- [ ] Índices creados
- [ ] Conexiones pool configurado

---

## 🔍 12. LOGS Y MONITOREO

### Logs del Sistema
- [ ] Logs guardándose en archivos
- [ ] Rotación de logs configurada
- [ ] Niveles de log correctos (info, warn, error)
- [ ] Logs no contienen información sensible

**Verificación:**
```bash
tail -f logs/backend-prod.log
tail -f logs/admin-prod.log
```

---

### Logs de Auditoría
- [ ] Todas las acciones críticas registradas
- [ ] Login/logout registrado
- [ ] Cambios en datos registrados
- [ ] Usuario que hizo la acción registrado

**Verificación:**
```bash
# Ver últimas acciones de auditoría
PGPASSWORD=supersecret psql -h 127.0.0.1 -p 15432 -U postgres -d chatbotdysa_production \
  -c "SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;"
```

---

## 💾 13. RESPALDOS

### Backup de Base de Datos
- [ ] Script de backup configurado
- [ ] Backups automáticos cada 24 horas
- [ ] Backups guardados en directorio seguro
- [ ] Retención de 30 días
- [ ] Backup funciona manualmente

**Test:**
```bash
# Crear backup manual
PGPASSWORD=supersecret pg_dump -h 127.0.0.1 -p 15432 -U postgres chatbotdysa_production > backup_$(date +%Y%m%d).sql

# Verificar
ls -lh backup_*.sql
```

---

### Backup de Archivos
- [ ] Imágenes respaldadas
- [ ] Uploads respaldados
- [ ] Logs respaldados

---

## 📈 14. PRUEBAS DE ESTRÉS

### Carga de Usuarios
- [ ] 10 usuarios simultáneos
- [ ] 50 usuarios simultáneos
- [ ] 100 usuarios simultáneos
- [ ] No hay memory leaks
- [ ] No hay crashes

**Test:**
```bash
# Usar Apache Bench
ab -n 1000 -c 10 http://localhost:8005/api/health
```

---

### Carga de Base de Datos
- [ ] 1,000 clientes
- [ ] 5,000 órdenes
- [ ] 10,000 mensajes
- [ ] Queries siguen siendo rápidas
- [ ] Paginación funciona correctamente

---

## 🎯 15. LISTA FINAL PRE-PRODUCCIÓN

### Documentación
- [x] ARQUITECTURA_COMPLETA_SISTEMA.md creado
- [x] GUIA_DESPLIEGUE_PRODUCCION.md creado
- [x] GUIA_TODAS_APLICACIONES_WEB.md creado
- [x] CHECKLIST_PRODUCCION.md creado
- [ ] README.md actualizado

---

### Seguridad
- [ ] Todas las claves secretas son seguras (64+ caracteres)
- [ ] No hay claves hardcodeadas en código
- [ ] .env.production.local en .gitignore
- [ ] Credenciales de producción separadas de desarrollo

---

### Código
- [ ] No hay console.log en producción
- [ ] No hay debuggers
- [ ] Código comentado removido
- [ ] TODOs resueltos o documentados

---

### Dependencias
- [ ] Todas las dependencias actualizadas
- [ ] No hay vulnerabilidades críticas
- [ ] No hay dependencias sin usar

**Verificación:**
```bash
npm audit
npm outdated
```

---

### Final
- [ ] Todos los tests del checklist pasados
- [ ] Simulación de día completo exitosa
- [ ] Performance aceptable
- [ ] Sin errores en logs
- [ ] Cliente de prueba satisfecho

---

## 🎉 ¡SISTEMA LISTO PARA PRODUCCIÓN!

Una vez que hayas completado este checklist, tu sistema estará listo para desplegarse en un servidor real y usarse con restaurantes de verdad.

### Próximos Pasos:
1. ✅ Completar este checklist
2. 📝 Documentar cualquier problema encontrado
3. 🔧 Corregir todos los problemas
4. 🚀 Desplegar a servidor de producción
5. 🎯 Lanzar con primer restaurante piloto
6. 📊 Monitorear primeras 24 horas
7. 🔄 Iterar basado en feedback

---

**Fecha de verificación:** __________

**Verificado por:** __________

**Resultado:** [ ] ✅ Aprobado para producción  [ ] ⚠️ Requiere correcciones
