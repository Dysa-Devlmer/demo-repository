#!/bin/bash

# ============================================
# ChatBotDysa - Generador de Secrets de Producción
# ============================================
# Genera secrets únicos y seguros para cada cliente
# Uso: ./generate-secrets.sh <nombre_restaurante>
# ============================================

set -e

RESTAURANT_NAME=$1

if [ -z "$RESTAURANT_NAME" ]; then
  echo "❌ Error: Debes proporcionar el nombre del restaurante"
  echo "Uso: ./generate-secrets.sh <nombre_restaurante>"
  echo "Ejemplo: ./generate-secrets.sh restaurante1"
  exit 1
fi

echo "=========================================="
echo "Generando Secrets de Producción"
echo "Restaurante: $RESTAURANT_NAME"
echo "Fecha: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="
echo ""

# Crear directorio de secrets
SECRETS_DIR="secrets/$RESTAURANT_NAME"
mkdir -p $SECRETS_DIR

# Generar secrets aleatorios
echo "📝 Generando secrets..."

# JWT Secret (256 bits)
JWT_SECRET=$(openssl rand -base64 32 | tr -d '\n')
echo "✅ JWT_SECRET generado (256 bits)"

# Database Password (128 bits, sin caracteres especiales)
DB_PASSWORD=$(openssl rand -base64 24 | tr -d '/+=' | head -c 24)
echo "✅ DATABASE_PASSWORD generado (128 bits)"

# CSRF Secret (256 bits)
CSRF_SECRET=$(openssl rand -base64 32 | tr -d '\n')
echo "✅ CSRF_SECRET generado (256 bits)"

# NextAuth Secret (256 bits)
NEXTAUTH_SECRET=$(openssl rand -base64 32 | tr -d '\n')
echo "✅ NEXTAUTH_SECRET generado (256 bits)"

# Redis Password (128 bits)
REDIS_PASSWORD=$(openssl rand -base64 24 | tr -d '/+=' | head -c 24)
echo "✅ REDIS_PASSWORD generado (128 bits)"

# API Key Internal (256 bits)
API_KEY_INTERNAL=$(openssl rand -hex 32)
echo "✅ API_KEY_INTERNAL generado (256 bits)"

echo ""
echo "📄 Creando archivo .env.production..."

# Crear archivo .env.production
cat > $SECRETS_DIR/.env.production <<EOF
# ============================================
# ChatBotDysa - Configuración de Producción
# ============================================
# Restaurante: $RESTAURANT_NAME
# Generado: $(date '+%Y-%m-%d %H:%M:%S')
# ⚠️  IMPORTANTE: Este archivo contiene información sensible
# ⚠️  NO compartir ni subir a Git
# ============================================

# Entorno
NODE_ENV=production

# Base de Datos PostgreSQL
DATABASE_HOST=localhost
DATABASE_PORT=15432
DATABASE_USER=postgres
DATABASE_PASSWORD=$DB_PASSWORD
DATABASE_NAME=chatbotdysa_$RESTAURANT_NAME

# Redis Cache
REDIS_HOST=localhost
REDIS_PORT=16379
REDIS_PASSWORD=$REDIS_PASSWORD

# Ollama AI Service
OLLAMA_URL=http://localhost:21434
OLLAMA_MODEL=phi3:mini

# Backend API
PORT=8005
API_URL=https://$RESTAURANT_NAME.tudominio.com

# JWT Authentication
JWT_SECRET=$JWT_SECRET
JWT_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d

# CSRF Protection
CSRF_SECRET=$CSRF_SECRET

# NextAuth (Admin Panel)
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
NEXTAUTH_URL=https://$RESTAURANT_NAME.tudominio.com

# Frontend URLs
FRONTEND_URL=https://$RESTAURANT_NAME.tudominio.com
ADMIN_URL=https://admin.$RESTAURANT_NAME.tudominio.com
LANDING_URL=https://www.$RESTAURANT_NAME.tudominio.com

# CORS
CORS_ORIGIN=https://$RESTAURANT_NAME.tudominio.com,https://admin.$RESTAURANT_NAME.tudominio.com,https://www.$RESTAURANT_NAME.tudominio.com

# Rate Limiting (Producción)
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=20

# Security
API_KEY_INTERNAL=$API_KEY_INTERNAL

# Logging
LOG_LEVEL=info

# ============================================
# Servicios Externos (Configurar con cliente)
# ============================================

# SendGrid (Email Service)
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=noreply@$RESTAURANT_NAME.tudominio.com

# Mercado Pago (Chilean Payment Gateway)
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_PUBLIC_KEY=

# Twilio (WhatsApp Business API)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# ============================================
# Información del Restaurante
# ============================================

RESTAURANT_NAME=$RESTAURANT_NAME
RESTAURANT_TIMEZONE=America/Santiago
RESTAURANT_CURRENCY=CLP
RESTAURANT_LOCALE=es-CL
EOF

echo "✅ Archivo creado: $SECRETS_DIR/.env.production"
echo ""

# Crear archivo README con instrucciones
cat > $SECRETS_DIR/README.md <<EOF
# Secrets de Producción - $RESTAURANT_NAME

**Generado:** $(date '+%Y-%m-%d %H:%M:%S')

## ⚠️ SEGURIDAD

Este directorio contiene información **ALTAMENTE SENSIBLE**:
- Contraseñas de base de datos
- Secrets de JWT
- API keys internas

**NUNCA:**
- Subir a Git
- Compartir por email/chat
- Dejar en repositorio público

## 📁 Archivos

- \`.env.production\` - Variables de entorno para producción

## 🔐 Secrets Generados

| Secret | Longitud | Uso |
|--------|----------|-----|
| JWT_SECRET | 256 bits | Firma de tokens JWT |
| DATABASE_PASSWORD | 128 bits | Contraseña PostgreSQL |
| CSRF_SECRET | 256 bits | Protección CSRF |
| NEXTAUTH_SECRET | 256 bits | NextAuth sessions |
| REDIS_PASSWORD | 128 bits | Contraseña Redis |
| API_KEY_INTERNAL | 256 bits | API key interna |

## 📝 Próximos Pasos

1. **Configurar servicios externos:**
   - SendGrid API Key (emails)
   - Mercado Pago tokens (pagos)
   - Twilio credentials (WhatsApp)

2. **Actualizar URLs:**
   - Reemplazar \`tudominio.com\` con dominio real
   - Configurar DNS

3. **Copiar a servidor:**
   \`\`\`bash
   scp .env.production usuario@servidor:/opt/chatbotdysa/apps/backend/
   \`\`\`

4. **Proteger archivo en servidor:**
   \`\`\`bash
   chmod 600 /opt/chatbotdysa/apps/backend/.env.production
   chown chatbotdysa:chatbotdysa /opt/chatbotdysa/apps/backend/.env.production
   \`\`\`

## 🔄 Rotación de Secrets

Se recomienda rotar los secrets cada 90 días. Para regenerar:

\`\`\`bash
./scripts/generate-secrets.sh $RESTAURANT_NAME
\`\`\`

**⚠️ Importante:** Al rotar secrets, todos los usuarios deben volver a hacer login.
EOF

echo "📚 README creado: $SECRETS_DIR/README.md"
echo ""

# Crear .gitignore en la carpeta secrets
if [ ! -f "secrets/.gitignore" ]; then
  cat > secrets/.gitignore <<EOF
# Ignorar todos los archivos en secrets/
*
!.gitignore
!README.md
EOF
  echo "🔒 .gitignore creado en secrets/"
fi

# Mostrar resumen
echo "=========================================="
echo "✅ Secrets Generados Exitosamente"
echo "=========================================="
echo ""
echo "📁 Ubicación: $SECRETS_DIR/"
echo ""
echo "📄 Archivos creados:"
echo "  - .env.production (secrets de producción)"
echo "  - README.md (instrucciones)"
echo ""
echo "🔐 Secrets generados:"
echo "  ✓ JWT_SECRET (256 bits)"
echo "  ✓ DATABASE_PASSWORD (128 bits)"
echo "  ✓ CSRF_SECRET (256 bits)"
echo "  ✓ NEXTAUTH_SECRET (256 bits)"
echo "  ✓ REDIS_PASSWORD (128 bits)"
echo "  ✓ API_KEY_INTERNAL (256 bits)"
echo ""
echo "📝 Próximos pasos:"
echo "  1. Revisar archivo: $SECRETS_DIR/.env.production"
echo "  2. Configurar servicios externos (SendGrid, MercadoPago, Twilio)"
echo "  3. Actualizar URLs con dominio real"
echo "  4. Copiar a servidor de producción"
echo ""
echo "⚠️  IMPORTANTE: Este archivo NO debe subirse a Git"
echo "=========================================="
