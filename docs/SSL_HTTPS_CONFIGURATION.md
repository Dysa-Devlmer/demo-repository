# 🔒 Configuración SSL/HTTPS para ChatBotDysa

## 📋 Índice

1. [Introducción](#introducción)
2. [Requisitos Previos](#requisitos-previos)
3. [Opción 1: Let's Encrypt (Recomendado)](#opción-1-lets-encrypt-recomendado)
4. [Opción 2: Certificado Comercial](#opción-2-certificado-comercial)
5. [Opción 3: Cloudflare (Más Fácil)](#opción-3-cloudflare-más-fácil)
6. [Configuración de Nginx](#configuración-de-nginx)
7. [Configuración del Backend](#configuración-del-backend)
8. [Renovación Automática](#renovación-automática)
9. [Testing y Verificación](#testing-y-verificación)
10. [Troubleshooting](#troubleshooting)

---

## Introducción

Este documento explica cómo configurar SSL/HTTPS para ChatBotDysa en producción. **HTTPS es REQUERIDO** para:

- ✅ Seguridad de datos del cliente
- ✅ Autenticación JWT segura
- ✅ Cumplimiento de estándares web
- ✅ SEO y confianza del usuario
- ✅ Funcionalidades del navegador (geolocalización, cámara)

---

## Requisitos Previos

Antes de comenzar, asegúrate de tener:

- ✅ Un dominio registrado (ej: `restaurante.com`)
- ✅ DNS configurado apuntando a tu servidor
- ✅ Servidor con IP pública
- ✅ Puerto 80 y 443 abiertos en firewall
- ✅ Acceso SSH al servidor

### Verificar DNS

```bash
# Verificar que el dominio apunte a tu servidor
dig restaurante.com +short
# Debe mostrar la IP de tu servidor

# Verificar subdominios
dig admin.restaurante.com +short
dig www.restaurante.com +short
```

---

## Opción 1: Let's Encrypt (Recomendado)

**Ventajas:**
- ✅ 100% Gratis
- ✅ Renovación automática
- ✅ Reconocido por todos los navegadores
- ✅ Fácil de configurar

### Paso 1: Instalar Certbot

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

**CentOS/RHEL:**
```bash
sudo yum install certbot python3-certbot-nginx -y
```

**macOS:**
```bash
brew install certbot
```

### Paso 2: Obtener Certificados

**Método Automático (Nginx):**
```bash
# Certificado para todos los dominios
sudo certbot --nginx -d restaurante.com \
  -d www.restaurante.com \
  -d admin.restaurante.com \
  -d api.restaurante.com
```

**Método Manual:**
```bash
# Solo obtener certificados (sin configurar Nginx automáticamente)
sudo certbot certonly --nginx -d restaurante.com \
  -d www.restaurante.com \
  -d admin.restaurante.com \
  -d api.restaurante.com
```

**Durante la instalación:**
1. Proporcionar email para notificaciones
2. Aceptar términos de servicio
3. Elegir si compartir email con EFF (opcional)

**Resultado:**
```
Certificates:
  /etc/letsencrypt/live/restaurante.com/fullchain.pem
  /etc/letsencrypt/live/restaurante.com/privkey.pem
```

### Paso 3: Renovación Automática

Certbot configura automáticamente un cron job. Verificar:

```bash
# Ver timer de renovación
sudo systemctl status certbot.timer

# Probar renovación (dry-run)
sudo certbot renew --dry-run

# Renovar manualmente si es necesario
sudo certbot renew
```

---

## Opción 2: Certificado Comercial

Si prefieres un certificado comercial (ej: DigiCert, GlobalSign):

### Paso 1: Generar CSR

```bash
# Generar clave privada
openssl genrsa -out restaurante.com.key 2048

# Generar CSR (Certificate Signing Request)
openssl req -new -key restaurante.com.key -out restaurante.com.csr
```

**Datos a proporcionar:**
- Country Name: CL
- State: Región Metropolitana
- Locality: Santiago
- Organization Name: Nombre del Restaurante
- Common Name: restaurante.com
- Email: admin@restaurante.com

### Paso 2: Enviar CSR a la Autoridad Certificadora

1. Copiar contenido de `restaurante.com.csr`
2. Enviarlo a tu proveedor de certificados
3. Completar verificación de dominio
4. Descargar certificados recibidos

### Paso 3: Instalar Certificados

```bash
# Copiar archivos al servidor
sudo mkdir -p /etc/ssl/certs/restaurante
sudo cp restaurante.com.crt /etc/ssl/certs/restaurante/
sudo cp restaurante.com.key /etc/ssl/certs/restaurante/
sudo cp intermediate.crt /etc/ssl/certs/restaurante/

# Proteger clave privada
sudo chmod 600 /etc/ssl/certs/restaurante/restaurante.com.key
```

---

## Opción 3: Cloudflare (Más Fácil)

**Ventajas:**
- ✅ Configuración en 5 minutos
- ✅ SSL gratis incluido
- ✅ CDN incluido (aceleración)
- ✅ Protección DDoS incluida
- ✅ No requiere instalar certificados en servidor

### Paso 1: Crear Cuenta en Cloudflare

1. Ir a https://cloudflare.com
2. Crear cuenta gratuita
3. Agregar tu dominio

### Paso 2: Cambiar Nameservers

Cloudflare te proporcionará nameservers:
```
ava.ns.cloudflare.com
ben.ns.cloudflare.com
```

Cambia los nameservers en tu registrador de dominio (ej: GoDaddy, Namecheap).

### Paso 3: Configurar SSL en Cloudflare

1. En Cloudflare Dashboard, ir a **SSL/TLS**
2. Seleccionar modo: **Full (strict)** (recomendado)
3. Habilitar **Always Use HTTPS**
4. Habilitar **Automatic HTTPS Rewrites**

### Paso 4: Crear Certificado Origin

1. En **SSL/TLS** > **Origin Server**
2. Clic en **Create Certificate**
3. Seleccionar todos los dominios
4. Copiar certificado y clave privada
5. Instalar en tu servidor Nginx

**Archivo: `/etc/ssl/certs/cloudflare/cert.pem`**
```
-----BEGIN CERTIFICATE-----
[Certificado de Cloudflare]
-----END CERTIFICATE-----
```

**Archivo: `/etc/ssl/certs/cloudflare/key.pem`**
```
-----BEGIN PRIVATE KEY-----
[Clave privada]
-----END PRIVATE KEY-----
```

### Paso 5: Configurar Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name restaurante.com;

    ssl_certificate /etc/ssl/certs/cloudflare/cert.pem;
    ssl_certificate_key /etc/ssl/certs/cloudflare/key.pem;

    # ... resto de configuración
}
```

---

## Configuración de Nginx

### Archivo: `/etc/nginx/sites-available/chatbotdysa`

```nginx
# ============================================
# Redirect HTTP to HTTPS
# ============================================
server {
    listen 80;
    server_name restaurante.com www.restaurante.com admin.restaurante.com;

    # Let's Encrypt validation
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# ============================================
# Backend API (api.restaurante.com)
# ============================================
server {
    listen 443 ssl http2;
    server_name api.restaurante.com;

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/restaurante.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/restaurante.com/privkey.pem;

    # SSL Configuration (Modern)
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Backend
    location / {
        proxy_pass http://localhost:8005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket Support
    location /socket.io/ {
        proxy_pass http://localhost:8005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# ============================================
# Admin Panel (admin.restaurante.com)
# ============================================
server {
    listen 443 ssl http2;
    server_name admin.restaurante.com;

    ssl_certificate /etc/letsencrypt/live/restaurante.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/restaurante.com/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Proxy to Admin Panel
    location / {
        proxy_pass http://localhost:7001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# ============================================
# Landing Page (www.restaurante.com)
# ============================================
server {
    listen 443 ssl http2;
    server_name www.restaurante.com restaurante.com;

    ssl_certificate /etc/letsencrypt/live/restaurante.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/restaurante.com/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Proxy to Landing Page
    location / {
        proxy_pass http://localhost:3004;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Activar Configuración

```bash
# Verificar sintaxis
sudo nginx -t

# Crear symlink
sudo ln -s /etc/nginx/sites-available/chatbotdysa /etc/nginx/sites-enabled/

# Recargar Nginx
sudo systemctl reload nginx
```

---

## Configuración del Backend

### Actualizar Variables de Entorno

**Archivo: `/opt/chatbotdysa/apps/backend/.env.production`**

```bash
# URLs con HTTPS
API_URL=https://api.restaurante.com
FRONTEND_URL=https://www.restaurante.com
ADMIN_URL=https://admin.restaurante.com

# CORS con dominios HTTPS
CORS_ORIGIN=https://restaurante.com,https://www.restaurante.com,https://admin.restaurante.com

# NextAuth URL
NEXTAUTH_URL=https://admin.restaurante.com

# Cookies seguros
SESSION_SECURE=true
COOKIE_SECURE=true
```

### Configurar NestJS para Proxy

**Archivo: `apps/backend/src/main.ts`**

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Trust proxy (Nginx)
  app.set('trust proxy', 1);

  // CORS Configuration
  app.enableCors({
    origin: [
      'https://restaurante.com',
      'https://www.restaurante.com',
      'https://admin.restaurante.com'
    ],
    credentials: true,
  });

  await app.listen(8005);
}
bootstrap();
```

---

## Renovación Automática

### Verificar Renovación Automática

```bash
# Ver configuración de cron/timer
sudo systemctl status certbot.timer

# Ver logs de renovación
sudo journalctl -u certbot.timer

# Probar renovación sin aplicar cambios
sudo certbot renew --dry-run
```

### Renovación Manual

```bash
# Renovar todos los certificados
sudo certbot renew

# Renovar certificado específico
sudo certbot renew --cert-name restaurante.com

# Forzar renovación (si faltan menos de 30 días)
sudo certbot renew --force-renewal
```

### Hook Post-Renovación

Crear script que recargue Nginx después de renovar:

**Archivo: `/etc/letsencrypt/renewal-hooks/post/reload-nginx.sh`**

```bash
#!/bin/bash
nginx -t && systemctl reload nginx
```

```bash
# Hacer ejecutable
sudo chmod +x /etc/letsencrypt/renewal-hooks/post/reload-nginx.sh
```

---

## Testing y Verificación

### Verificar Certificado

```bash
# Verificar instalación SSL
openssl s_client -connect restaurante.com:443 -servername restaurante.com

# Verificar fecha de expiración
echo | openssl s_client -connect restaurante.com:443 2>/dev/null | openssl x509 -noout -dates

# Verificar cadena de certificados
echo | openssl s_client -connect restaurante.com:443 -showcerts
```

### Testing en Navegador

1. Abrir https://restaurante.com
2. Verificar candado verde en barra de direcciones
3. Clic en candado → Ver certificado
4. Verificar que sea válido y no haya advertencias

### SSL Labs Test

Probar calificación SSL:

```bash
# Visitar:
https://www.ssllabs.com/ssltest/analyze.html?d=restaurante.com

# Objetivo: Calificación A o A+
```

### HSTS Preload

Para máxima seguridad, agregar dominio a HSTS preload list:

1. Configurar header con includeSubDomains y preload
2. Ir a https://hstspreload.org
3. Enviar tu dominio

---

## Troubleshooting

### Error: "Certificate verification failed"

**Solución:**
```bash
# Verificar que la cadena de certificados esté completa
sudo nginx -t

# Regenerar certificado con cadena completa
sudo certbot renew --force-renewal
```

### Error: "Mixed Content"

Cuando tienes recursos HTTP en página HTTPS.

**Solución:**
1. Cambiar todas las URLs de recursos a HTTPS
2. Usar URLs relativas: `/assets/image.png`
3. Agregar header: `Content-Security-Policy: upgrade-insecure-requests`

### Error: "ERR_CERT_AUTHORITY_INVALID"

El certificado no es confiado por el navegador.

**Solución:**
- Usar Let's Encrypt o certificado comercial válido
- No usar certificados autofirmados en producción

### Puerto 443 no responde

```bash
# Verificar que Nginx escuche en 443
sudo netstat -tlnp | grep :443

# Verificar firewall
sudo ufw status
sudo ufw allow 443/tcp

# Si usas iptables
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
```

### Renovación falla

```bash
# Ver logs detallados
sudo certbot renew --dry-run --debug

# Verificar que puerto 80 esté abierto (necesario para validación)
sudo ufw allow 80/tcp

# Verificar configuración de Nginx
sudo nginx -t
```

---

## Checklist de Seguridad SSL

Antes de ir a producción:

- [ ] Certificado SSL instalado y válido
- [ ] Todas las URLs usan HTTPS (no HTTP)
- [ ] Redirect HTTP → HTTPS configurado
- [ ] HSTS header configurado
- [ ] CORS configurado correctamente
- [ ] Cookies marcados como Secure
- [ ] Mixed content eliminado
- [ ] SSL Labs test aprobado (A o A+)
- [ ] Renovación automática configurada
- [ ] Backup de certificados creado
- [ ] Variables de entorno actualizadas
- [ ] Testing en todos los navegadores
- [ ] Testing en dispositivos móviles

---

## Referencias

- **Let's Encrypt:** https://letsencrypt.org/
- **Certbot Documentation:** https://certbot.eff.org/
- **Cloudflare SSL:** https://www.cloudflare.com/ssl/
- **SSL Labs:** https://www.ssllabs.com/ssltest/
- **HSTS Preload:** https://hstspreload.org/
- **Mozilla SSL Configuration:** https://ssl-config.mozilla.org/

---

**Siguiente Paso:** [Configuración de Docker para Producción](./DOCKER_PRODUCTION.md)
