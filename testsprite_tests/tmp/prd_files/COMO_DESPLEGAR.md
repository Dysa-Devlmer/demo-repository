# 🚀 Cómo Desplegar ChatBotDysa - Resumen Ejecutivo

**3 formas de desplegar, elige la que mejor se adapte a ti:**

---

## 🎯 Opción 1: Instalación Automática (⭐ RECOMENDADO)

**Lo más fácil. Todo en 1 comando.**

### Para Servidor/VPS (Producción)

```bash
# 1. Conectar al servidor
ssh usuario@tu-servidor.com

# 2. Instalar Docker (si no lo tienes)
curl -fsSL https://get.docker.com | sh

# 3. Clonar proyecto
git clone https://github.com/tu-usuario/ChatBotDysa.git /opt/chatbotdysa
cd /opt/chatbotdysa

# 4. Ejecutar instalador automático
chmod +x scripts/install/install.sh
sudo ./scripts/install/install.sh

# ¡Listo! El sistema está corriendo 🎉
```

**¿Qué hace el instalador?**
- ✅ Genera contraseñas seguras automáticamente
- ✅ Configura todas las variables de entorno
- ✅ Construye todos los contenedores Docker
- ✅ Levanta todos los servicios (Backend, Admin, Landing, DB, Redis, AI)
- ✅ Ejecuta migraciones de base de datos
- ✅ Carga datos iniciales
- ✅ Verifica que todo funcione
- ✅ Te muestra las URLs de acceso

**Accede al sistema:**
- Admin Panel: `http://tu-servidor-ip:7001`
- API: `http://tu-servidor-ip:8005`
- Landing: `http://tu-servidor-ip:3004`

**Siguiente paso:** Configurar dominio y SSL (ver abajo)

---

## 🐳 Opción 2: Docker Compose (Manual)

**Si prefieres más control.**

```bash
# 1. Clonar
git clone https://github.com/tu-usuario/ChatBotDysa.git
cd ChatBotDysa

# 2. Generar secretos
chmod +x scripts/generate-secrets.sh
./scripts/generate-secrets.sh

# 3. Copiar y editar variables de entorno
cp .env.example .env.production
nano .env.production
# Edita: APP_URL, API_URL, etc.

# 4. Levantar todo
docker compose -f docker-compose.production.yml up -d

# 5. Ver que esté corriendo
docker compose -f docker-compose.production.yml ps

# 6. Ver logs
docker compose -f docker-compose.production.yml logs -f
```

**Servicios incluidos:**
- PostgreSQL (Base de datos)
- Redis (Cache)
- Ollama (IA)
- Backend API (NestJS)
- Admin Panel (Next.js)
- Landing Page (Next.js)
- Nginx (Reverse proxy)

---

## 💻 Opción 3: Desarrollo Local (Sin Docker)

**Para desarrollo o testing local.**

### Requisitos
- Node.js 20+
- PostgreSQL 16
- Redis 7
- npm o pnpm

### Backend

```bash
cd apps/backend
npm install
cp .env.example .env
# Editar .env con tus valores
npm run migration:run
npm run seed  # Opcional: datos demo
npm run start:dev
```

### Admin Panel

```bash
cd apps/admin-panel
npm install
cp .env.example .env.local
npm run dev
```

### Landing Page

```bash
cd apps/landing-page
npm install
cp .env.example .env.local
npm run dev
```

---

## 🌐 Configurar Dominio Propio (Producción)

### 1. Apuntar DNS

En tu proveedor de DNS (Cloudflare, GoDaddy, etc.):

```
A    tudominio.com          -> IP_DEL_SERVIDOR
A    www.tudominio.com      -> IP_DEL_SERVIDOR
A    api.tudominio.com      -> IP_DEL_SERVIDOR
A    admin.tudominio.com    -> IP_DEL_SERVIDOR
```

### 2. Configurar SSL (HTTPS) con Let's Encrypt

```bash
# En el servidor
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificados (reemplaza con tus dominios)
sudo certbot --nginx \
  -d tudominio.com \
  -d www.tudominio.com \
  -d api.tudominio.com \
  -d admin.tudominio.com

# Renovación automática ya está configurada
sudo systemctl status certbot.timer
```

### 3. Actualizar Variables de Entorno

```bash
nano /opt/chatbotdysa/.env.production
```

Cambiar:
```bash
APP_URL=https://tudominio.com
API_URL=https://api.tudominio.com
NEXTAUTH_URL=https://admin.tudominio.com
```

### 4. Reiniciar Servicios

```bash
cd /opt/chatbotdysa
docker compose -f docker-compose.production.yml restart
```

**¡Listo!** Ahora accede con HTTPS:
- https://admin.tudominio.com
- https://api.tudominio.com
- https://tudominio.com

---

## 📊 Verificar que Todo Funciona

```bash
# Health checks
curl http://localhost:8005/health          # Backend
curl http://localhost:7001/api/health      # Admin Panel

# Ver logs
docker compose -f docker-compose.production.yml logs -f

# Ver estado de servicios
docker compose -f docker-compose.production.yml ps

# Ver recursos (CPU, RAM)
docker stats
```

---

## 🔑 Credenciales Iniciales

**Usuario Admin:**
- Email: `admin@zgamersa.com`
- Password: `Admin123!`

**⚠️ IMPORTANTE:**
1. Inicia sesión en https://admin.tudominio.com
2. Ve a Perfil → Cambiar Contraseña
3. Cambia la contraseña inmediatamente

---

## 🛠️ Comandos Útiles

### Docker Compose

```bash
# Iniciar todos los servicios
docker compose -f docker-compose.production.yml up -d

# Detener todos los servicios
docker compose -f docker-compose.production.yml down

# Ver logs
docker compose -f docker-compose.production.yml logs -f [servicio]

# Reiniciar un servicio
docker compose -f docker-compose.production.yml restart backend

# Reconstruir y actualizar
docker compose -f docker-compose.production.yml up -d --build

# Ver estado
docker compose -f docker-compose.production.yml ps
```

### Backups

```bash
# Hacer backup manual
docker compose -f docker-compose.production.yml --profile backup up backup

# Backups automáticos (agregar a crontab)
sudo crontab -e
# Agregar:
0 2 * * * cd /opt/chatbotdysa && docker compose -f docker-compose.production.yml --profile backup up backup
```

### Actualizar Sistema

```bash
# 1. Backup primero
docker compose -f docker-compose.production.yml --profile backup up backup

# 2. Actualizar código
git pull origin main

# 3. Reconstruir y reiniciar
docker compose -f docker-compose.production.yml up -d --build

# 4. Ejecutar migraciones si hay
docker compose -f docker-compose.production.yml exec backend npm run migration:run
```

---

## 🚨 Troubleshooting Rápido

### "No puedo acceder al sistema"
```bash
# Verificar que los servicios estén corriendo
docker compose -f docker-compose.production.yml ps

# Ver logs de errores
docker compose -f docker-compose.production.yml logs backend | grep -i error

# Verificar firewall
sudo ufw status  # Debe permitir 80, 443
```

### "Error de base de datos"
```bash
# Ver logs de PostgreSQL
docker compose -f docker-compose.production.yml logs postgres

# Verificar conexión
docker compose -f docker-compose.production.yml exec backend nc -zv postgres 5432

# Reiniciar PostgreSQL
docker compose -f docker-compose.production.yml restart postgres
```

### "Sistema lento"
```bash
# Ver uso de recursos
docker stats

# Limpiar cache de Redis
docker compose -f docker-compose.production.yml exec redis redis-cli FLUSHDB

# Optimizar PostgreSQL
docker compose -f docker-compose.production.yml exec postgres psql -U postgres -d chatbotdysa -c "VACUUM ANALYZE;"
```

### "Puerto ya en uso"
```bash
# Ver qué proceso usa el puerto
sudo lsof -i :8005
sudo lsof -i :7001

# Matar proceso
sudo kill -9 PID
```

---

## 📚 Documentación Completa

Para más detalles, consulta:

1. **[QUICK_START.md](./QUICK_START.md)** - Guía rápida de 5 minutos
2. **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Guía completa y detallada
3. **[PRODUCTION_READY_IMPROVEMENTS.md](./PRODUCTION_READY_IMPROVEMENTS.md)** - Mejoras implementadas
4. **[AUDIT_ADMIN_PANEL.md](./AUDIT_ADMIN_PANEL.md)** - Auditoría del sistema

---

## 🎯 Checklist de Despliegue

- [ ] Sistema instalado y corriendo
- [ ] Health checks pasan (curl /health)
- [ ] Dominio configurado y apuntando al servidor
- [ ] SSL/HTTPS configurado (Let's Encrypt)
- [ ] Contraseña de admin cambiada
- [ ] Backups automáticos configurados (crontab)
- [ ] Firewall configurado (solo 80, 443, 22)
- [ ] Logs funcionando correctamente
- [ ] Admin Panel accesible
- [ ] API Docs accesible (/api/docs)

---

## 💡 Mejores Prácticas

1. **Seguridad:**
   - Usa contraseñas fuertes (generadas automáticamente)
   - Mantén SSL/HTTPS siempre activo
   - Configura firewall (solo puertos necesarios)
   - Actualiza regularmente

2. **Backups:**
   - Backups automáticos diarios
   - Guarda backups en ubicación externa
   - Prueba restaurar backups regularmente

3. **Monitoreo:**
   - Revisa logs diariamente
   - Monitorea uso de recursos (docker stats)
   - Configura alertas (uptime robot)

4. **Mantenimiento:**
   - Actualiza sistema mensualmente
   - Limpia logs antiguos
   - Optimiza base de datos mensualmente

---

## 🌟 Características del Sistema

Una vez desplegado, tienes acceso a:

- ✅ **Admin Panel Completo** - Gestión total del sistema
- ✅ **API REST** - Documentación Swagger incluida
- ✅ **Chat con IA** - Ollama integrado
- ✅ **Gestión de Clientes** - CRUD completo
- ✅ **Gestión de Menú** - Items, categorías, precios
- ✅ **Órdenes** - Tracking completo
- ✅ **Reservas** - Sistema de reservas
- ✅ **Reportes** - PDF, Excel, CSV
- ✅ **Usuarios y Roles** - Control de acceso
- ✅ **Configuración** - WhatsApp, Twilio, Email
- ✅ **Analytics** - Métricas y estadísticas

---

## 📞 Soporte

**¿Problemas?**

1. Revisa logs: `docker compose logs -f`
2. Consulta [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
3. Revisa sección Troubleshooting
4. Abre un issue en GitHub

---

## 🎉 ¡Felicidades!

Tu sistema ChatBotDysa está listo para producción.

**Próximos pasos:**
1. Cambiar contraseña de admin
2. Configurar integraciones (WhatsApp, Email)
3. Personalizar información del restaurante
4. Agregar menú y productos
5. ¡Empezar a usar el sistema!

---

**¿Qué opción elegir?**

- **Producción → Opción 1** (Instalador automático)
- **Control total → Opción 2** (Docker Compose)
- **Desarrollo → Opción 3** (Local sin Docker)

**¡Buena suerte con tu despliegue!** 🚀

_Última actualización: 2025-11-01_
