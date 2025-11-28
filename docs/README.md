# 🤖 ChatBotDysa - Plataforma de Chatbot IA para Restaurantes

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10+-red.svg)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)

**Solución empresarial completa de chatbot con IA para automatizar la atención al cliente en restaurantes**

[🚀 Instalación](#-instalación-rápida) •
[📖 Documentación](#-documentación) •
[🎯 Características](#-características-principales) •
[🛠️ Desarrollo](#️-desarrollo) •
[📞 Soporte](#-soporte)

</div>

---

## 🎯 Características Principales

### 🤖 Inteligencia Artificial Avanzada
- **IA Local con Ollama**: Procesamiento seguro sin dependencias externas
- **Comprensión contextual**: Mantiene el contexto de las conversaciones
- **Respuestas naturales**: Comunicación fluida y personalizada
- **Aprendizaje continuo**: Mejora con cada interacción

### 📱 Canales de Comunicación
- **WhatsApp Business API**: Integración nativa con WhatsApp
- **Twilio Voice**: Respuesta automática de llamadas telefónicas
- **Widget Web**: Integración directa en sitio web del restaurante
- **SMS**: Notificaciones y confirmaciones por SMS

### 🍽️ Especializado para Restaurantes
- **Gestión de menús**: Catálogo digital completo con precios y descripciones
- **Pedidos automáticos**: Toma de pedidos con cálculo automático de totales
- **Reservas inteligentes**: Sistema de reservas con disponibilidad en tiempo real
- **Horarios y ubicación**: Información actualizada automáticamente

### 🎛️ Panel de Administración
- **Dashboard en tiempo real**: Métricas y estadísticas actualizadas
- **Gestión de conversaciones**: Supervisión y intervención manual
- **Administración de menú**: CRUD completo de productos y categorías
- **Gestión de clientes**: Base de datos de clientes con historial
- **Reportes avanzados**: Análisis detallado de rendimiento

### 🔒 Seguridad y Escalabilidad
- **Autenticación JWT**: Seguridad de nivel empresarial
- **Rate limiting**: Protección contra abuso y spam
- **Logs centralizados**: Auditoría completa del sistema
- **Backup automático**: Respaldo programado de datos críticos
- **Escalado horizontal**: Arquitectura preparada para crecer

## 🚀 Instalación Rápida

### Método 1: Script Automático (Recomendado)
```bash
# Clonar repositorio
git clone <repository-url> chatbotdysa
cd chatbotdysa

# Ejecutar instalación automática
chmod +x install.sh
./install.sh
```

### Método 2: Docker Compose
```bash
# Clonar y configurar
git clone <repository-url> chatbotdysa
cd chatbotdysa
cp .env.example .env

# Editar variables de entorno
nano .env

# Iniciar con Docker
docker-compose -f docker-compose.production.yml up -d

# Verificar estado
docker-compose -f docker-compose.production.yml ps
```

### Método 3: Instalación Manual
```bash
# Instalar dependencias
npm ci

# Construir aplicaciones
npm run build

# Iniciar servicios de infraestructura
docker-compose -f docker-compose.production.yml up -d postgres redis ollama

# Iniciar aplicaciones
pm2 start ecosystem.config.js --env production
```

## 🌐 Acceso al Sistema

Una vez instalado, accede a:

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **API Backend** | `http://localhost:3005` | API principal del sistema |
| **Panel Admin** | `http://localhost:3001` | Interfaz de administración |
| **Widget Web** | `http://localhost:3002` | Widget para sitio web |
| **Health Check** | `http://localhost:3005/health` | Estado del sistema |
| **Grafana** | `http://localhost:3000` | Monitoreo y métricas |

### Credenciales por Defecto
- **Panel Admin**: Configurar en primer acceso
- **Grafana**: `admin` / `admin123` (cambiar inmediatamente)

## 📋 Requisitos del Sistema

### Desarrollo
- **Node.js**: 18.0 o superior
- **npm**: 8.0 o superior  
- **Docker**: 20.0 o superior
- **Docker Compose**: 2.0 o superior
- **Sistema Operativo**: Linux, macOS, Windows WSL2

### Producción
- **CPU**: 4+ cores (8+ recomendado)
- **RAM**: 8GB (16GB+ recomendado)
- **Almacenamiento**: 50GB SSD (100GB+ recomendado)
- **Sistema**: Ubuntu 22.04 LTS, CentOS 8+, RHEL 8+
- **Ollama** (opcional, para IA local): https://ollama.ai/

---

## 🛑 Detener DysaBot

```bash
npm stop
# o directamente:
./stop-dysabot.sh
```

---

## 🔧 Configuración Opcional

### WhatsApp Business y Twilio

1. **Edita el archivo `.env`:**
```bash
# WhatsApp Business API
WA_BUSINESS_PHONE_ID=tu_phone_id
WA_ACCESS_TOKEN=tu_access_token
WA_WEBHOOK_VERIFY_TOKEN=tu_verify_token

# Twilio
TWILIO_ACCOUNT_SID=tu_account_sid
TWILIO_AUTH_TOKEN=tu_auth_token
TWILIO_PHONE_NUMBER=tu_numero_twilio
```

2. **Reinicia DysaBot**

### Instalar IA Local (Ollama)

```bash
# Instalar Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Descargar modelo
ollama pull llama3:8b

# Verificar
curl http://localhost:11434/api/version
```

---

## 📱 Cómo Probar el Chatbot

### 1. **Panel de Administración** (http://localhost:3001)
- Configura tu restaurante
- Agrega elementos al menú
- Ve conversaciones en tiempo real

### 2. **Widget Web** (http://localhost:3002)
- Chat directo con el bot
- Prueba hacer reservas y pedidos
- Interactúa con el menú

### 3. **API Direct** (Postman/curl)
```bash
# Enviar mensaje al bot
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hola, quiero hacer una reserva",
    "sessionId": "test-session-123"
  }'
```

---

## 🐛 Troubleshooting

### Error: "Docker not running"
```bash
# Inicia Docker Desktop manualmente
open -a Docker  # macOS
# o busca "Docker Desktop" en el menú de inicio
```

### Error: "Port already in use"
```bash
# Detener procesos en puerto 3000/3001/3002
lsof -ti :3000 | xargs kill -9
lsof -ti :3001 | xargs kill -9
lsof -ti :3002 | xargs kill -9
```

### Ver Logs
```bash
# Ver logs en tiempo real
tail -f backend.log
tail -f admin.log  
tail -f widget.log
```

---

## 📂 Estructura Simplificada

```
ChatBotDysa/
├── 🚀 start-dysabot.sh         # Script de inicio
├── 🛑 stop-dysabot.sh          # Script de parada
├── ⚙️ .env.example             # Configuración ejemplo
├── apps/
│   ├── 🖥️ backend/             # API NestJS
│   ├── 📊 admin-panel/         # Dashboard Next.js
│   └── 💬 web-widget/          # Widget React
├── infra/chatdocker/           # PostgreSQL + Redis
├── 📖 README_USER.md           # Manual completo usuario
└── 📖 README_DEV.md            # Manual desarrollador
```

---

## 💼 Producción

Para usar en producción:

1. **Configura WhatsApp Business API**
2. **Configura Twilio Voice** (opcional)
3. **Obtén tu licencia** en https://www.zgamersa.com/chatbot
4. **Despliega en tu servidor** siguiendo README_DEV.md

---

## 🆘 Soporte

- **Email:** soporte@zgamersa.com
- **Web:** https://www.zgamersa.com/chatbot
- **Documentación:** README_USER.md y README_DEV.md

---

**© 2024 DysaDev SpA - Desarrollado por Devlmer**