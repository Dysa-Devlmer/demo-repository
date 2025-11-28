# Checklist de Producción - ChatBotDysa Enterprise

**Fecha de Generación:** 2025-10-06 12:35 PM
**Estado del Sistema:** 99% Listo para Producción
**Versión:** 1.0.0

---

## 📋 Instrucciones de Uso

Este checklist debe completarse **ANTES** de desplegar a producción. Marca cada item con `[x]` cuando esté completado.

**Códigos de Prioridad:**
- 🔴 **CRÍTICO** - Debe estar completado antes del deploy
- 🟡 **IMPORTANTE** - Debe completarse en la primera semana
- 🟢 **OPCIONAL** - Puede completarse después

---

## 🔴 PRE-DEPLOY CRÍTICO

### Infraestructura

- [ ] 🔴 Servidor configurado (VPS/Cloud con mínimo 4GB RAM)
- [ ] 🔴 Docker instalado en servidor (version 20.10+)
- [ ] 🔴 Docker Compose instalado (version 2.0+)
- [ ] 🔴 PostgreSQL 14+ instalado o containerizado
- [ ] 🔴 Redis 6+ instalado o containerizado
- [ ] 🔴 Puertos abiertos: 80 (HTTP), 443 (HTTPS), 22 (SSH)
- [ ] 🔴 Firewall configurado (solo puertos necesarios)

**Verificación:**
```bash
# En el servidor de producción
docker --version
docker-compose --version
systemctl status docker
```

### Dominio y DNS

- [ ] 🔴 Dominio registrado (ej: chatbotdysa.com)
- [ ] 🔴 DNS configurado:
  - [ ] Registro A para dominio principal → IP servidor
  - [ ] Registro A para api.dominio.com → IP servidor
  - [ ] Registro A para admin.dominio.com → IP servidor
  - [ ] Registro CNAME para www.dominio.com → dominio.com
- [ ] 🔴 DNS propagado (verificar con `dig` o `nslookup`)

**Verificación:**
```bash
dig api.tudominio.com +short
# Debe mostrar la IP de tu servidor
```

### SSL/HTTPS

- [ ] 🔴 Certbot instalado en servidor
- [ ] 🔴 Certificados SSL generados (Let's Encrypt)
- [ ] 🔴 Certificados configurados en Nginx/Traefik
- [ ] 🔴 Renovación automática configurada
- [ ] 🔴 Redirect HTTP → HTTPS configurado

**Generación de Certificados:**
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Generar certificados
sudo certbot --nginx -d tudominio.com -d www.tudominio.com -d api.tudominio.com -d admin.tudominio.com

# Verificar renovación automática
sudo certbot renew --dry-run
```

### Base de Datos

- [ ] 🔴 PostgreSQL accesible desde backend
- [ ] 🔴 Base de datos `chatbotdysa` creada
- [ ] 🔴 Usuario `postgres` con contraseña segura
- [ ] 🔴 Todas las migraciones ejecutadas
- [ ] 🔴 Datos iniciales cargados (roles, permisos)
- [ ] 🔴 Backup inicial creado

**Ejecutar Migraciones:**
```bash
cd /opt/chatbotdysa/apps/backend
npm run migration:run
npm run migration:show  # Verificar que todas estén aplicadas
```

**Crear Backup Inicial:**
```bash
./scripts/backup/daily-backup.sh
# Verificar que se creó el archivo en /var/backups/chatbotdysa/
```

### Secrets y Variables de Entorno

- [ ] 🔴 Secrets únicos generados para cliente
- [ ] 🔴 Archivo `.env.production` creado en servidor
- [ ] 🔴 Variables de entorno configuradas:
  - [ ] `NODE_ENV=production`
  - [ ] `DATABASE_PASSWORD` (único, 128-bit)
  - [ ] `JWT_SECRET` (único, 256-bit)
  - [ ] `CSRF_SECRET` (único, 256-bit)
  - [ ] `NEXTAUTH_SECRET` (único, 256-bit)
  - [ ] `REDIS_PASSWORD` (único, 128-bit)
  - [ ] `API_KEY_INTERNAL` (único, 256-bit)
- [ ] 🔴 Permisos del archivo: `chmod 600 .env.production`
- [ ] 🔴 Secrets NO están en Git

**Copiar Secrets al Servidor:**
```bash
# Desde tu máquina local
scp secrets/restaurante1/.env.production usuario@servidor:/opt/chatbotdysa/apps/backend/.env.production

# En el servidor
cd /opt/chatbotdysa/apps/backend
chmod 600 .env.production
chown chatbotdysa:chatbotdysa .env.production
```

### Aplicación

- [ ] 🔴 Código fuente subido al servidor
- [ ] 🔴 `node_modules` instalados (`npm install`)
- [ ] 🔴 Build de producción generado (`npm run build`)
- [ ] 🔴 Docker images construidas
- [ ] 🔴 Docker Compose configurado
- [ ] 🔴 Containers iniciados y saludables

**Deploy de la Aplicación:**
```bash
cd /opt/chatbotdysa

# Construir images
docker-compose build

# Iniciar servicios
docker-compose up -d

# Verificar containers
docker-compose ps
# Todos deben estar "Up" y "healthy"
```

---

## 🟡 POST-DEPLOY IMPORTANTE

### Verificación del Sistema

- [ ] 🟡 Health check ejecutado exitosamente
  ```bash
  ./scripts/health-check.sh
  # Debe mostrar: ✅ Sistema 100% SALUDABLE
  ```

- [ ] 🟡 Todos los endpoints responden:
  - [ ] `https://api.tudominio.com/health` → 200 OK
  - [ ] `https://api.tudominio.com/api/menu` → 200/401 OK
  - [ ] `https://admin.tudominio.com` → 200 OK
  - [ ] `https://tudominio.com` → 200 OK

- [ ] 🟡 Swagger docs accesible:
  - [ ] `https://api.tudominio.com/docs`

- [ ] 🟡 Cache funcionando:
  ```bash
  redis-cli -h 127.0.0.1 -p 16379 PING
  # Debe responder: PONG
  ```

### Backups y Recovery

- [ ] 🟡 Cron job de backup diario configurado
  ```bash
  # Editar crontab
  sudo crontab -e

  # Añadir línea:
  0 3 * * * cd /opt/chatbotdysa && ./scripts/backup/daily-backup.sh >> /var/log/chatbotdysa-backup.log 2>&1
  ```

- [ ] 🟡 Test de backup ejecutado y exitoso
  ```bash
  ./scripts/backup/test-backup.sh
  # Debe mostrar: ✅ TEST EXITOSO
  ```

- [ ] 🟡 Script de restore probado en DB de prueba
- [ ] 🟡 Backup remoto configurado (S3/Google Cloud/etc)

### Monitoreo y Logs

- [ ] 🟡 Logs centralizados funcionando
  ```bash
  ls -lh /opt/chatbotdysa/logs/
  # Debe mostrar archivos .log del día actual
  ```

- [ ] 🟡 Rotación de logs configurada
- [ ] 🟡 Health check cron job configurado
  ```bash
  # Cada 5 minutos
  */5 * * * * cd /opt/chatbotdysa && ./scripts/health-check.sh || echo "ALERTA: Health check falló" | mail -s "ChatBotDysa Alert" admin@tudominio.com
  ```

- [ ] 🟡 Alertas configuradas (email/Slack/Discord)
- [ ] 🟡 Sentry o herramienta de error tracking configurada

### Seguridad

- [ ] 🟡 Rate limiting verificado
  ```bash
  # Ejecutar 110 requests rápidos
  for i in {1..110}; do curl https://api.tudominio.com/api/menu; done
  # Los últimos 10 deben retornar 429 (Too Many Requests)
  ```

- [ ] 🟡 CORS configurado correctamente
- [ ] 🟡 CSRF protection habilitado
- [ ] 🟡 Headers de seguridad configurados:
  - [ ] `X-Content-Type-Options: nosniff`
  - [ ] `X-Frame-Options: DENY`
  - [ ] `Strict-Transport-Security: max-age=31536000`

- [ ] 🟡 Fail2ban configurado (opcional pero recomendado)
  ```bash
  sudo apt install fail2ban
  sudo systemctl enable fail2ban
  sudo systemctl start fail2ban
  ```

### Performance

- [ ] 🟡 Índices de base de datos aplicados
  ```bash
  # Verificar índices
  PGPASSWORD=$DB_PASSWORD psql -h 127.0.0.1 -p 15432 -U postgres -d chatbotdysa -c "
    SELECT tablename, indexname
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND indexname LIKE 'IDX_%'
    ORDER BY tablename;
  "
  # Debe mostrar 32 índices
  ```

- [ ] 🟡 Cache Redis funcionando
  ```bash
  # Verificar cache hit
  curl https://api.tudominio.com/api/menu
  redis-cli -h 127.0.0.1 -p 16379 KEYS "menu:*"
  # Debe mostrar keys de cache
  ```

- [ ] 🟡 CDN configurado para assets estáticos (opcional)

---

## 🟢 POST-DEPLOY OPCIONAL

### Testing

- [ ] 🟢 Tests automatizados configurados
- [ ] 🟢 CI/CD pipeline configurado
- [ ] 🟢 Smoke tests ejecutados post-deploy
- [ ] 🟢 Load testing ejecutado

### Documentación

- [ ] 🟢 Documentación de deployment actualizada
- [ ] 🟢 Procedimientos de emergencia documentados
- [ ] 🟢 Runbook para equipo de soporte
- [ ] 🟢 Documentación de API actualizada en Swagger

### Monitoreo Avanzado

- [ ] 🟢 Datadog/New Relic configurado
- [ ] 🟢 Uptime monitoring configurado (Pingdom/UptimeRobot)
- [ ] 🟢 Dashboard de métricas (Grafana)
- [ ] 🟢 Alertas avanzadas configuradas

### Usuarios y Roles

- [ ] 🟢 Usuario admin creado
- [ ] 🟢 Roles de prueba creados
- [ ] 🟢 Permisos verificados
- [ ] 🟢 Usuarios de prueba eliminados

---

## 📊 Verificación Final

### Checklist Rápido Pre-Deploy

Ejecutar estos comandos en el servidor justo antes del deploy:

```bash
# 1. Verificar Docker
docker --version && docker-compose --version

# 2. Verificar DNS
dig api.tudominio.com +short

# 3. Verificar SSL
curl -I https://api.tudominio.com/health

# 4. Verificar Base de Datos
PGPASSWORD=$DB_PASSWORD psql -h 127.0.0.1 -p 15432 -U postgres -d chatbotdysa -c "SELECT COUNT(*) FROM users;"

# 5. Verificar Redis
redis-cli -h 127.0.0.1 -p 16379 PING

# 6. Verificar Migraciones
cd /opt/chatbotdysa/apps/backend && npm run migration:show

# 7. Verificar Secrets
cat /opt/chatbotdysa/apps/backend/.env.production | grep JWT_SECRET

# 8. Verificar Backups
ls -lh /var/backups/chatbotdysa/
```

Si TODOS los comandos anteriores tienen éxito, puedes proceder con el deploy.

### Checklist Post-Deploy

Ejecutar inmediatamente después del deploy:

```bash
# 1. Health Check
cd /opt/chatbotdysa && ./scripts/health-check.sh

# 2. Verificar Endpoints
curl -I https://api.tudominio.com/health
curl -I https://api.tudominio.com/api/menu
curl -I https://admin.tudominio.com
curl -I https://tudominio.com

# 3. Verificar Logs
tail -100 /opt/chatbotdysa/logs/application-$(date +%Y-%m-%d).log

# 4. Verificar Cache
redis-cli -h 127.0.0.1 -p 16379 INFO stats

# 5. Verificar Containers
docker-compose ps

# 6. Crear Backup Post-Deploy
./scripts/backup/daily-backup.sh
```

---

## 🚨 Rollback Plan

Si algo sale mal durante o después del deploy:

### Rollback Rápido

```bash
# 1. Detener containers actuales
docker-compose down

# 2. Restaurar código anterior
cd /opt/chatbotdysa
git checkout <commit-anterior>

# 3. Restaurar base de datos (si necesario)
./scripts/backup/restore-backup.sh /var/backups/chatbotdysa/pre_deploy_backup.sql.gz

# 4. Reiniciar containers
docker-compose up -d

# 5. Verificar
./scripts/health-check.sh
```

### Contactos de Emergencia

- **Developer Lead:** [Nombre] - [email] - [teléfono]
- **DevOps:** [Nombre] - [email] - [teléfono]
- **CTO:** [Nombre] - [email] - [teléfono]

---

## 📝 Notas y Observaciones

### Deploy #1 - [Fecha]

**Checklist completado por:** ________________
**Fecha:** ________________
**Hora inicio:** ________________
**Hora fin:** ________________

**Problemas encontrados:**
-
-
-

**Acciones correctivas:**
-
-
-

**Resultado final:** ☐ Éxito  ☐ Fallo  ☐ Parcial

**Tiempo de downtime:** ________________

**Observaciones:**




---

**Versión del Checklist:** 1.0.0
**Última actualización:** 2025-10-06
**Próxima revisión:** 2025-11-06
