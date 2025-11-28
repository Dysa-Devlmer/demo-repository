#!/bin/bash

# ============================================
# ChatBotDysa - Generador de Certificados SSL
# ============================================
# Genera certificados SSL auto-firmados para desarrollo
# Para producción, usar Let's Encrypt o certificados comerciales
# ============================================

set -e

# Configuración
CERTS_DIR="${CERTS_DIR:-./certs}"
DAYS_VALID="${DAYS_VALID:-365}"
COUNTRY="${COUNTRY:-CR}"
STATE="${STATE:-San Jose}"
CITY="${CITY:-San Jose}"
ORG="${ORG:-ChatBotDysa}"
OU="${OU:-Development}"
COMMON_NAME="${COMMON_NAME:-localhost}"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función de logging
log() {
  echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
  echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
  exit 1
}

warning() {
  echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

log "=========================================="
log "ChatBotDysa - Generador de Certificados SSL"
log "=========================================="
log ""

# Verificar que openssl está instalado
if ! command -v openssl &> /dev/null; then
  error "OpenSSL no está instalado. Instalar con: brew install openssl"
fi

log "✅ OpenSSL encontrado: $(openssl version)"
log ""

# Crear directorio de certificados
mkdir -p "$CERTS_DIR"
log "📁 Directorio de certificados: $CERTS_DIR"
log ""

# Archivos de salida
KEY_FILE="$CERTS_DIR/private.key"
CERT_FILE="$CERTS_DIR/certificate.crt"
CSR_FILE="$CERTS_DIR/request.csr"
PEM_FILE="$CERTS_DIR/fullchain.pem"

# Verificar si ya existen certificados
if [ -f "$KEY_FILE" ] && [ -f "$CERT_FILE" ]; then
  warning "Ya existen certificados en $CERTS_DIR"
  echo ""
  echo "¿Deseas regenerar los certificados? (Los anteriores se sobrescribirán)"
  read -p "Escribe 'yes' para continuar: " confirm

  if [ "$confirm" != "yes" ]; then
    log "❌ Operación cancelada"
    exit 0
  fi
  log ""
fi

# Paso 1: Generar clave privada
log "🔐 Paso 1/4: Generando clave privada RSA (2048 bits)..."
openssl genrsa -out "$KEY_FILE" 2048 2>/dev/null || error "Fallo al generar clave privada"
chmod 600 "$KEY_FILE"
log "✅ Clave privada generada: $KEY_FILE"
log ""

# Paso 2: Crear solicitud de firma de certificado (CSR)
log "📝 Paso 2/4: Creando solicitud de certificado (CSR)..."

# Crear archivo de configuración para el CSR
cat > "$CERTS_DIR/openssl.cnf" <<EOF
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = v3_req

[dn]
C=$COUNTRY
ST=$STATE
L=$CITY
O=$ORG
OU=$OU
CN=$COMMON_NAME

[v3_req]
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
DNS.3 = 127.0.0.1
DNS.4 = chatbotdysa.local
DNS.5 = *.chatbotdysa.local
IP.1 = 127.0.0.1
IP.2 = ::1
EOF

openssl req -new -key "$KEY_FILE" -out "$CSR_FILE" -config "$CERTS_DIR/openssl.cnf" || error "Fallo al crear CSR"
log "✅ CSR creado: $CSR_FILE"
log ""

# Paso 3: Generar certificado auto-firmado
log "🎫 Paso 3/4: Generando certificado auto-firmado (válido por $DAYS_VALID días)..."

# Crear extensión para certificado
cat > "$CERTS_DIR/v3.ext" <<EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
DNS.3 = 127.0.0.1
DNS.4 = chatbotdysa.local
DNS.5 = *.chatbotdysa.local
IP.1 = 127.0.0.1
IP.2 = ::1
EOF

openssl x509 -req \
  -in "$CSR_FILE" \
  -signkey "$KEY_FILE" \
  -out "$CERT_FILE" \
  -days "$DAYS_VALID" \
  -sha256 \
  -extfile "$CERTS_DIR/v3.ext" \
  2>/dev/null || error "Fallo al generar certificado"

log "✅ Certificado generado: $CERT_FILE"
log ""

# Paso 4: Crear archivo PEM combinado
log "📦 Paso 4/4: Creando archivo PEM combinado..."
cat "$CERT_FILE" "$KEY_FILE" > "$PEM_FILE"
chmod 600 "$PEM_FILE"
log "✅ PEM generado: $PEM_FILE"
log ""

# Limpiar archivos temporales
rm -f "$CSR_FILE" "$CERTS_DIR/openssl.cnf" "$CERTS_DIR/v3.ext"

# Mostrar información del certificado
log "=========================================="
log "📊 Información del Certificado"
log "=========================================="
log ""

# Extraer información
SUBJECT=$(openssl x509 -in "$CERT_FILE" -noout -subject | sed 's/subject=//')
ISSUER=$(openssl x509 -in "$CERT_FILE" -noout -issuer | sed 's/issuer=//')
VALID_FROM=$(openssl x509 -in "$CERT_FILE" -noout -startdate | sed 's/notBefore=//')
VALID_UNTIL=$(openssl x509 -in "$CERT_FILE" -noout -enddate | sed 's/notAfter=//')
FINGERPRINT=$(openssl x509 -in "$CERT_FILE" -noout -fingerprint -sha256 | sed 's/SHA256 Fingerprint=//')

log "Subject: $SUBJECT"
log "Issuer: $ISSUER"
log "Valid From: $VALID_FROM"
log "Valid Until: $VALID_UNTIL"
log "Fingerprint (SHA256): $FINGERPRINT"
log ""

# Mostrar SANs
log "Subject Alternative Names (SANs):"
openssl x509 -in "$CERT_FILE" -noout -text | grep -A 1 "Subject Alternative Name" | tail -n 1 | sed 's/^[[:space:]]*/  - /'
log ""

# Archivos generados
log "=========================================="
log "📁 Archivos Generados"
log "=========================================="
log ""
log "  - $KEY_FILE (Clave privada - PROTEGER)"
log "  - $CERT_FILE (Certificado público)"
log "  - $PEM_FILE (Certificado + Clave combinados)"
log ""

# Configuración para aplicaciones
log "=========================================="
log "🔧 Configuración en Aplicaciones"
log "=========================================="
log ""

cat <<EOF
Backend (NestJS):
-----------------
// main.ts
const httpsOptions = {
  key: fs.readFileSync('$KEY_FILE'),
  cert: fs.readFileSync('$CERT_FILE'),
};
await app.listen(8005, '0.0.0.0', () => {
  console.log('HTTPS Server running on https://localhost:8005');
});

Admin Panel (Next.js):
----------------------
// package.json
"dev": "next dev --experimental-https --experimental-https-key=$KEY_FILE --experimental-https-cert=$CERT_FILE"

// O usando node:
"dev": "node server.js"

// server.js
const https = require('https');
const fs = require('fs');
const next = require('next');
const app = next({ dev: true });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  https.createServer({
    key: fs.readFileSync('$KEY_FILE'),
    cert: fs.readFileSync('$CERT_FILE')
  }, (req, res) => handle(req, res))
  .listen(7001, () => console.log('https://localhost:7001'));
});

Nginx (Proxy reverso):
----------------------
server {
    listen 443 ssl;
    server_name localhost;

    ssl_certificate $CERT_FILE;
    ssl_certificate_key $KEY_FILE;

    location / {
        proxy_pass http://localhost:8005;
    }
}

Docker Compose:
---------------
services:
  backend:
    volumes:
      - ./certs:/app/certs:ro
    environment:
      - SSL_KEY_FILE=/app/certs/private.key
      - SSL_CERT_FILE=/app/certs/certificate.crt
EOF

log ""
log "=========================================="
log "⚠️  IMPORTANTE - Certificados Auto-firmados"
log "=========================================="
log ""
warning "Estos certificados son SOLO para desarrollo/testing"
warning "Los navegadores mostrarán advertencias de seguridad"
warning "Para producción, usar Let's Encrypt o certificados comerciales"
log ""

log "Para confiar en estos certificados en tu sistema:"
log ""
log "macOS:"
log "  sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain $CERT_FILE"
log ""
log "Linux:"
log "  sudo cp $CERT_FILE /usr/local/share/ca-certificates/chatbotdysa.crt"
log "  sudo update-ca-certificates"
log ""
log "Windows:"
log "  certutil -addstore -f \"ROOT\" $CERT_FILE"
log ""

log "=========================================="
log "✅ Certificados SSL Generados Exitosamente"
log "=========================================="
log ""

exit 0
