# ⚡ Quick Start - ChatBotDysa

**¿Quieres desplegar en 5 minutos?** Sigue esta guía rápida.

---

## 🚀 Opción 1: Instalación Automática (Más Rápida)

### Requisitos Previos
```bash
✅ Docker instalado
✅ Git instalado
✅ 4 GB RAM mínimo
```

### Pasos

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/ChatBotDysa.git
cd ChatBotDysa

# 2. Ejecutar instalador automático
chmod +x scripts/install/install.sh
sudo ./scripts/install/install.sh

# ¡Eso es todo! 🎉
```

El script automáticamente:
- ✅ Verifica prerrequisitos
- ✅ Genera contraseñas seguras
- ✅ Configura variables de entorno
- ✅ Construye y levanta todos los servicios
- ✅ Ejecuta migraciones
- ✅ Carga datos iniciales

**Accede al sistema:**
- Admin Panel: http://localhost:7001
- API Docs: http://localhost:8005/api
- Landing Page: http://localhost:3004

---

## 🐳 Opción 2: Docker Compose Manual

```bash
# 1. Clonar
git clone https://github.com/tu-usuario/ChatBotDysa.git
cd ChatBotDysa

# 2. Configurar entorno
cp .env.example .env.production
./scripts/generate-secrets.sh

# 3. Levantar servicios
docker compose -f docker-compose.production.yml up -d

# 4. Ver logs
docker compose -f docker-compose.production.yml logs -f

# 5. Acceder
# Admin Panel: http://localhost:7001
# API: http://localhost:8005
```

---

## 💻 Opción 3: Desarrollo Local (Sin Docker)

### Backend

```bash
# 1. Instalar dependencias
cd apps/backend
npm install

# 2. Configurar .env
cp .env.example .env
nano .env  # Editar con tus valores

# 3. Base de datos (PostgreSQL local)
# Asegúrate de tener PostgreSQL corriendo
createdb chatbotdysa

# 4. Ejecutar migraciones
npm run migration:run

# 5. Seeds (opcional)
npm run seed

# 6. Iniciar
npm run start:dev

# Backend corriendo en http://localhost:8005
```

### Admin Panel

```bash
# En otra terminal
cd apps/admin-panel
npm install

# Configurar .env
cp .env.example .env.local
nano .env.local  # Editar NEXT_PUBLIC_API_URL

# Iniciar
npm run dev

# Admin Panel en http://localhost:7001
```

### Landing Page

```bash
# En otra terminal
cd apps/landing-page
npm install

cp .env.example .env.local
nano .env.local

npm run dev

# Landing en http://localhost:3004
```

---

## 🔑 Credenciales por Defecto

**Admin:**
- Email: `admin@zgamersa.com`
- Password: `Admin123!`

**⚠️ CAMBIA LA CONTRASEÑA INMEDIATAMENTE EN PRODUCCIÓN**

---

## 📊 Verificar que Todo Funciona

```bash
# Health checks
curl http://localhost:8005/health          # Backend
curl http://localhost:7001/api/health      # Admin Panel

# API Docs
open http://localhost:8005/api             # Swagger UI

# Ver logs
docker compose logs -f                      # Todos los servicios
docker compose logs -f backend              # Solo backend
```

---

## 🛠️ Comandos Útiles

```bash
# Detener todo
docker compose down

# Reiniciar un servicio
docker compose restart backend

# Ver estado
docker compose ps

# Ver logs
docker compose logs -f [servicio]

# Entrar a un contenedor
docker compose exec backend sh

# Rebuild
docker compose up -d --build [servicio]
```

---

## 🚨 Troubleshooting Rápido

### "Puerto ya en uso"
```bash
# Ver qué usa el puerto
lsof -i :8005
lsof -i :7001

# Matar proceso
kill -9 PID
```

### "Cannot connect to database"
```bash
# Verificar que PostgreSQL esté corriendo
docker compose ps postgres

# Ver logs
docker compose logs postgres

# Reiniciar
docker compose restart postgres
```

### "Out of memory"
```bash
# Ver recursos
docker stats

# Limpiar
docker system prune -a
```

### Errores de permisos
```bash
# Dar permisos
sudo chown -R $USER:$USER .
chmod +x scripts/*.sh
```

---

## 🌐 Despliegue en Servidor (Producción)

### VPS/Cloud (DigitalOcean, AWS, etc.)

```bash
# 1. SSH al servidor
ssh root@tu-servidor.com

# 2. Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 3. Clonar proyecto
git clone https://github.com/tu-usuario/ChatBotDysa.git /opt/chatbotdysa
cd /opt/chatbotdysa

# 4. Configurar dominio en .env
nano .env.production
# Cambiar:
# APP_URL=https://tudominio.com
# API_URL=https://api.tudominio.com

# 5. Ejecutar instalador
chmod +x scripts/install/install.sh
sudo ./scripts/install/install.sh

# 6. Configurar SSL (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d tudominio.com -d api.tudominio.com -d admin.tudominio.com

# ¡Listo! Accede a https://tudominio.com
```

---

## 📱 Configuración de DNS

Apunta tus dominios a la IP del servidor:

```
A    tudominio.com          -> IP_DEL_SERVIDOR
A    www.tudominio.com      -> IP_DEL_SERVIDOR
A    api.tudominio.com      -> IP_DEL_SERVIDOR
A    admin.tudominio.com    -> IP_DEL_SERVIDOR
```

---

## 🎯 Próximos Pasos

Después de instalar:

1. **Cambiar contraseña de admin**
   - Ir a Admin Panel → Perfil → Cambiar Contraseña

2. **Configurar WhatsApp/Twilio** (opcional)
   - Admin Panel → Configuración → Integraciones

3. **Personalizar marca**
   - Admin Panel → Configuración → Restaurante

4. **Hacer backup**
   ```bash
   docker compose --profile backup up backup
   ```

5. **Monitorear**
   ```bash
   docker compose logs -f
   docker stats
   ```

---

## 📖 Documentación Completa

Para más detalles, consulta:
- 📘 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Guía completa de despliegue
- 📗 [PRODUCTION_READY_IMPROVEMENTS.md](./PRODUCTION_READY_IMPROVEMENTS.md) - Mejoras implementadas
- 📕 [AUDIT_ADMIN_PANEL.md](./AUDIT_ADMIN_PANEL.md) - Auditoría del sistema
- 📙 [docs/](./docs/) - Documentación técnica

---

## 💬 ¿Necesitas Ayuda?

1. **Logs primero:** `docker compose logs -f`
2. **Health check:** `curl http://localhost:8005/health`
3. **Troubleshooting:** Ver sección en esta guía
4. **Documentación:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

**¡Disfruta de ChatBotDysa!** 🎉

_Última actualización: 2025-11-01_
