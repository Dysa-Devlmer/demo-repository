# 🚀 ChatBotDysa Enterprise - Guía de Instalación y Uso

## 📋 Descripción del Sistema

**ChatBotDysa Enterprise** es un sistema completo de gestión de restaurantes con ChatBot inteligente, desarrollado a **nivel empresarial** con todas las características necesarias para ser lanzado al mercado profesional.

### 🎯 Características Empresariales Principales

- **🤖 ChatBot IA Avanzado** - Atención al cliente 24/7 con Ollama
- **📊 Business Intelligence** - Analytics, reportes y dashboard ejecutivo
- **🔒 Seguridad Empresarial** - WAF, rate limiting, SQL injection protection
- **💾 Backup Automático** - Respaldos programados con retención configurable  
- **📱 Integraciones** - WhatsApp Business API, Twilio SMS
- **📈 Monitoreo en Tiempo Real** - Health checks, métricas y alertas
- **🔔 Notificaciones** - Sistema multi-canal (email, SMS, WhatsApp)
- **📚 Documentación API** - OpenAPI/Swagger completo

---

## 🏗️ Arquitectura del Sistema

```
ChatBotDysa/
├── apps/
│   ├── backend/           # API NestJS (Puerto 8005)
│   ├── admin-panel/       # Dashboard React (Puerto 8002) 
│   ├── web-widget/        # Widget Chat (Puerto 8003)
│   ├── installer/         # Instalador automático
│   └── landing-page/      # Página de marketing
├── scripts/              # Utilidades de desarrollo
├── docs/                 # Documentación técnica
└── README-ENTERPRISE.md  # Esta guía
```

---

## ⚙️ Requisitos del Sistema

### Pre-requisitos Obligatorios

1. **Node.js** v20+ y **npm** v10+
2. **PostgreSQL** v13+ (Puerto 15432)
3. **Redis** v6+ (Puerto 16379) 
4. **Ollama** con modelo llama3.2 (Puerto 21434)

### Verificación de Pre-requisitos

```bash
# Verificar Node.js
node --version  # Debe ser v20+
npm --version   # Debe ser v10+

# Verificar PostgreSQL
psql --version

# Verificar Redis
redis-cli --version

# Verificar Ollama
ollama --version
```

---

## 🚀 Instalación Rápida (5 minutos)

### Paso 1: Clonar y Configurar

```bash
# Navegar al directorio del proyecto
cd /Users/devlmer/ChatBotDysa

# Instalar dependencias de todo el monorepo
npm run install:deps

# Copiar configuración de desarrollo
cp .env.example .env.local
```

### Paso 2: Configurar Base de Datos

```bash
# Asegurar que PostgreSQL esté corriendo en puerto 15432
# Asegurar que Redis esté corriendo en puerto 16379
# Asegurar que Ollama esté corriendo en puerto 21434
```

### Paso 3: Ejecutar Sistema Completo

```bash
# Iniciar todos los servicios empresariales
./start-complete-system.sh
```

**¡Listo! 🎉** El sistema estará disponible en:

- **📱 Panel Admin:** http://localhost:8002
- **🤖 Widget Chat:** http://localhost:8003  
- **🌐 API Backend:** http://localhost:8005
- **📚 API Docs:** http://localhost:8005/api-docs

---

## 🖥️ Uso del Sistema

### Dashboard Administrativo

Accede al **Panel de Control Empresarial** en http://localhost:8002

**Funcionalidades disponibles:**
- 📊 Dashboard ejecutivo con métricas en tiempo real
- 🍽️ Gestión completa de menú y inventario
- 📋 Administración de pedidos y entregas
- 📅 Sistema de reservas con disponibilidad
- 👥 CRM completo de clientes
- 💬 Centro de conversaciones del ChatBot
- ⚙️ Configuración del sistema
- 📈 Reportes y analytics avanzados

### Widget de Chat

El **ChatBot empresarial** se integra en cualquier sitio web:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Mi Restaurante</title>
</head>
<body>
    <!-- Tu contenido web -->
    
    <!-- ChatBot Widget -->
    <script src="http://localhost:8003/dysabot-widget.js"></script>
    <script>
        new DysaBotWidget({
            apiUrl: 'http://localhost:8005',
            restaurantId: 'mi-restaurante',
            theme: 'purple',
            greeting: '¡Hola! ¿En qué puedo ayudarte hoy?'
        });
    </script>
</body>
</html>
```

### API Empresarial

**Documentación completa:** http://localhost:8005/api-docs

**Endpoints principales:**
```bash
# Analytics y BI
GET  /api/analytics/dashboard      # Dashboard ejecutivo
POST /api/analytics/reports/generate  # Generar reportes
GET  /api/analytics/insights       # Insights de IA

# Gestión de negocio  
GET  /api/orders                   # Gestión de pedidos
GET  /api/customers                # CRM de clientes
GET  /api/reservations             # Sistema de reservas
GET  /api/menu-items               # Gestión de menú

# Enterprise features
GET  /api/monitoring/health        # Health checks
GET  /api/backups/status          # Estado de backups
GET  /api/integrations/status     # Integraciones (WhatsApp/SMS)
GET  /api/notifications/stats     # Estadísticas de notificaciones
```

---

## 🔧 Gestión del Sistema

### Iniciar el Sistema

```bash
# Inicio completo con health checks
./start-complete-system.sh

# Inicio individual de servicios
npm run dev:backend    # Solo Backend API
npm run dev:admin      # Solo Admin Panel
npm run dev:widget     # Solo Web Widget
```

### Detener el Sistema

```bash
# Parada completa y limpia
./stop-complete-system.sh

# Parada de emergencia (todos los procesos Node.js)
pkill -f node
```

### Monitoreo del Sistema

```bash
# Health check general
curl http://localhost:8005/api/health

# Métricas empresariales
curl http://localhost:8005/api/monitoring/metrics

# Estado de servicios
curl http://localhost:8005/api/monitoring/performance
```

---

## 📊 Características Empresariales Avanzadas

### Business Intelligence

- **Dashboard Ejecutivo:** Métricas KPI en tiempo real
- **Reportes Automáticos:** Diarios, semanales, mensuales  
- **Analytics Predictivos:** Insights y recomendaciones de IA
- **Exportación Multi-formato:** PDF, Excel, CSV, JSON

### Seguridad Empresarial

- **WAF Integrado:** Web Application Firewall
- **Rate Limiting:** Protección contra ataques DDoS
- **SQL Injection Protection:** Validación y sanitización
- **JWT Authentication:** Tokens seguros con expiración
- **Audit Logging:** Registro completo de actividades

### Integraciones Empresariales

- **WhatsApp Business API:** Mensajería empresarial
- **Twilio SMS:** Notificaciones por SMS
- **Email Marketing:** Campañas automatizadas
- **WebHooks:** Integraciones con terceros

### Backup y Continuidad

- **Backups Automáticos:** Diarios a las 2 AM
- **Múltiples Destinos:** Local, AWS S3, Google Drive
- **Retención Configurable:** 30 días por defecto
- **Restauración Automática:** Un click recovery

---

## 🌐 Despliegue en Producción

### Variables de Entorno de Producción

```bash
# .env.production
NODE_ENV=production
PORT=8005
DATABASE_URL=postgresql://user:pass@host:5432/dbname
REDIS_URL=redis://user:pass@host:6379
JWT_SECRET=tu-clave-super-secreta-de-256-bits
OLLAMA_URL=https://tu-ollama-server.com

# WhatsApp Business
WHATSAPP_ACCESS_TOKEN=tu_token_de_whatsapp
WHATSAPP_PHONE_NUMBER_ID=tu_phone_id

# Twilio
TWILIO_ACCOUNT_SID=tu_account_sid  
TWILIO_AUTH_TOKEN=tu_auth_token
```

### Docker Deployment

```dockerfile
# Dockerfile incluido para despliegue en contenedores
docker build -t chatbotdysa-enterprise .
docker run -p 8005:8005 -e NODE_ENV=production chatbotdysa-enterprise
```

---

## 📞 Soporte y Contacto

### Información del Sistema
- **Versión:** Enterprise v1.0.0
- **Arquitectura:** Microservicios con NestJS + React
- **Base de Datos:** PostgreSQL + Redis
- **IA:** Ollama (llama3.2:latest)

### Soporte Técnico
- **Email:** support@chatbotdysa.com
- **Website:** https://chatbotdysa.com
- **Documentación:** http://localhost:8005/api-docs

### Licencia
**Enterprise License** - Uso comercial permitido
Copyright © 2024 ChatBotDysa Enterprise

---

## ✅ Sistema Listo para Producción

**ChatBotDysa Enterprise** está completamente desarrollado y probado para uso empresarial inmediato. Todas las características están implementadas y documentadas para su lanzamiento al mercado profesional.

**🎯 ¡Perfecto para ofrecer a locales y empresas!** 🚀