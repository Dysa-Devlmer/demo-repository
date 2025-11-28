# ChatBotDysa Enterprise - Guía de Instalación

## 🏪 Instalación Rápida para Restaurantes

### Prerrequisitos
- Docker & Docker Compose
- Node.js 18+ (para desarrollo)
- PostgreSQL 17 (administrado por Docker)
- Redis (administrado por Docker)

### 🚀 Inicio Rápido (Listo para Producción)

```bash
# 1. Clonar repositorio
git clone <repository-url>
cd ChatBotDysa

# 2. Ejecutar instalación completa
chmod +x install.sh
./install.sh

# 3. Iniciar sistema de producción
./start-complete-system.sh

# 4. Verificar instalación
./health-check.js
```

**Puntos de Acceso:**
- API Backend: http://localhost:8005
- Panel de Administración: http://localhost:8001  
- Documentación API: http://localhost:8005/api-docs

### 🔧 Pasos de Instalación Manual

1. **Configuración del Entorno**
   ```bash
   cp .env.example .env
   # Editar .env con las credenciales de tu base de datos
   ```

2. **Inicialización de Base de Datos**
   ```bash
   docker-compose up -d postgres redis
   # La base de datos se auto-inicializará con el esquema
   ```

3. **Servicio Backend**
   ```bash
   cd apps/backend
   npm install
   npm run build
   npm start
   ```

4. **Panel de Administración**
   ```bash
   cd apps/admin-panel
   npm install
   npm run build
   npm start
   ```

### 🏬 Configuración Multi-Sucursal

Para restaurantes con múltiples ubicaciones:

```bash
# Crear base de datos adicional por sucursal
export BRANCH_ID=sucursal_001
export DATABASE_NAME=chatbotdysa_${BRANCH_ID}
# Ejecutar script de instalación por sucursal
```

### 📱 Mobile y Widget Web

El sistema incluye:
- Panel de administración web responsive
- Interfaces optimizadas para móvil
- Widget web embebible para pedidos de clientes

### 🔐 Características de Seguridad

- Encriptación SSL/TLS
- Autenticación JWT
- Validación y sanitización de entrada  
- Protección contra inyección SQL
- Limitación de velocidad
- Configuración CORS

### 📊 Características Empresariales

- Analíticas en tiempo real
- Soporte multi-idioma (ES/EN/FR)
- Integración WhatsApp y SMS
- Respaldos automáticos
- Monitoreo de salud
- Registro de auditoría

### 🆘 Soporte

Para problemas de instalación:
1. Revisar logs: `./logs/app.log`
2. Ejecutar verificación de salud: `./health-check.js`
3. Reiniciar servicios: `./stop-complete-system.sh && ./start-complete-system.sh`

---

**ChatBotDysa Enterprise v1.0**
Solución completa de gestión de restaurantes