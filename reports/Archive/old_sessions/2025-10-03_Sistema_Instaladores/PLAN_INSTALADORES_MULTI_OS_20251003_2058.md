# 📦 PLAN DE INSTALADORES MULTI-SISTEMA OPERATIVO

**Fecha:** 3 de Octubre de 2025, 20:58 hrs
**Objetivo:** Crear instaladores para Windows, macOS y Linux
**Clientes:** 3 restaurantes

---

## 🎯 OBJETIVO

Crear paquetes de instalación que permitan instalar el sistema ChatBotDysa completo en los restaurantes de los 3 clientes, cada uno con sistema operativo diferente.

---

## 📋 SISTEMAS OPERATIVOS A SOPORTAR

### 1. Windows 10/11
- Cliente: [Nombre del restaurante]
- Formato: `.exe` (Instalador NSIS o Electron)
- Requisitos: Node.js 20.x, PostgreSQL 16, Redis

### 2. macOS (Apple Silicon / Intel)
- Cliente: [Nombre del restaurante]
- Formato: `.dmg` (Disk Image) o `.pkg`
- Requisitos: Node.js 20.x, PostgreSQL 16, Redis

### 3. Linux (Ubuntu/Debian)
- Cliente: [Nombre del restaurante]
- Formato: `.deb` o `.AppImage`
- Requisitos: Node.js 20.x, PostgreSQL 16, Redis

---

## 🏗️ ARQUITECTURA DEL INSTALADOR

### Opción 1: Instalador Todo-en-Uno con Electron
**Ventajas:**
- Un solo ejecutable para cada SO
- Incluye Node.js embebido
- Interfaz gráfica unificada
- Fácil para usuarios no técnicos

**Desventajas:**
- Tamaño grande (~200-300 MB)
- No incluye PostgreSQL ni Redis (requiere instalación separada)

### Opción 2: Script de Instalación Automatizada
**Ventajas:**
- Liviano
- Instala todas las dependencias
- Configura todo automáticamente

**Desventajas:**
- Requiere conexión a internet
- Puede fallar si hay problemas de red

### Opción 3: Docker (RECOMENDADO)
**Ventajas:**
- Funciona en Windows, macOS y Linux
- Incluye TODO (Backend, PostgreSQL, Redis, Ollama)
- Fácil de actualizar
- Aislado del sistema

**Desventajas:**
- Requiere Docker instalado
- Mayor consumo de recursos

---

## ✅ OPCIÓN RECOMENDADA: DOCKER COMPOSE

### Por qué Docker?

1. **Multiplataforma:** Un solo docker-compose.yml funciona en Windows, macOS y Linux
2. **Todo incluido:** Backend, PostgreSQL, Redis, Ollama en un solo comando
3. **Fácil actualización:** `docker-compose pull && docker-compose up -d`
4. **Fácil backup:** Volúmenes de datos fáciles de respaldar
5. **Sin conflictos:** No afecta el sistema del cliente
6. **Rollback fácil:** Si algo falla, volver atrás es simple

---

## 🔧 COMPONENTES DEL INSTALADOR DOCKER

### Servicios en Docker Compose:

```yaml
services:
  # 1. Backend NestJS
  backend:
    image: chatbotdysa/backend:latest
    ports:
      - "8005:8005"
    depends_on:
      - postgres
      - redis
      - ollama
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:supersecret@postgres:5432/chatbotdysa
      - REDIS_URL=redis://redis:6379
      - OLLAMA_URL=http://ollama:11434

  # 2. PostgreSQL
  postgres:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=supersecret
      - POSTGRES_DB=chatbotdysa

  # 3. Redis
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  # 4. Ollama (AI)
  ollama:
    image: ollama/ollama:latest
    volumes:
      - ollama_data:/root/.ollama

  # 5. Admin Panel (Next.js)
  admin-panel:
    image: chatbotdysa/admin-panel:latest
    ports:
      - "7001:7001"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8005

  # 6. Landing Page
  landing:
    image: chatbotdysa/landing-page:latest
    ports:
      - "3004:3004"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8005

volumes:
  postgres_data:
  redis_data:
  ollama_data:
```

---

## 📦 ESTRUCTURA DEL INSTALADOR

```
ChatBotDysa_Installer/
│
├── README.md                          # Instrucciones
├── docker-compose.yml                 # Configuración Docker
├── .env.example                       # Variables de entorno
│
├── scripts/
│   ├── install-windows.bat           # Script Windows
│   ├── install-macos.sh              # Script macOS
│   ├── install-linux.sh              # Script Linux
│   ├── start.bat                     # Iniciar (Windows)
│   ├── start.sh                      # Iniciar (macOS/Linux)
│   ├── stop.bat                      # Detener (Windows)
│   ├── stop.sh                       # Detener (macOS/Linux)
│   └── backup.sh                     # Backup de datos
│
├── config/
│   ├── backend.env                   # Config backend
│   ├── postgres.env                  # Config PostgreSQL
│   └── restaurante.json              # Config del restaurante
│
└── docs/
    ├── INSTALACION.md                # Guía de instalación
    ├── CONFIGURACION.md              # Guía de configuración
    └── FAQ.md                        # Preguntas frecuentes
```

---

## 🚀 PROCESO DE INSTALACIÓN

### Para Windows:

1. Instalar Docker Desktop
2. Ejecutar `install-windows.bat`
3. El script:
   - Verifica Docker
   - Descarga imágenes
   - Configura .env
   - Ejecuta `docker-compose up -d`
4. Sistema listo en http://localhost:7001

### Para macOS:

1. Instalar Docker Desktop
2. Ejecutar `./install-macos.sh`
3. Mismo proceso que Windows

### Para Linux:

1. Instalar Docker y Docker Compose
2. Ejecutar `./install-linux.sh`
3. Mismo proceso

---

## 📝 PASOS PARA CREAR LOS INSTALADORES

### FASE 1: Dockerizar los componentes (1-2 días)

#### Backend
```bash
cd apps/backend
# Crear Dockerfile
# Build: docker build -t chatbotdysa/backend:latest .
# Push: docker push chatbotdysa/backend:latest
```

#### Admin Panel
```bash
cd apps/admin-panel
# Crear Dockerfile
# Build: docker build -t chatbotdysa/admin-panel:latest .
# Push: docker push chatbotdysa/admin-panel:latest
```

#### Landing Page
```bash
cd apps/landing-page
# Crear Dockerfile
# Build: docker build -t chatbotdysa/landing-page:latest .
# Push: docker push chatbotdysa/landing-panel:latest
```

### FASE 2: Crear docker-compose.yml (1 día)

- Configurar todos los servicios
- Configurar networking
- Configurar volúmenes persistentes
- Probar en desarrollo

### FASE 3: Scripts de instalación (1 día)

#### install-windows.bat
```batch
@echo off
echo Instalando ChatBotDysa...
docker --version
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker no está instalado
    exit /b 1
)
docker-compose pull
docker-compose up -d
echo Sistema instalado. Acceder a http://localhost:7001
```

#### install-macos.sh / install-linux.sh
```bash
#!/bin/bash
echo "Instalando ChatBotDysa..."
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker no está instalado"
    exit 1
fi
docker-compose pull
docker-compose up -d
echo "Sistema instalado. Acceder a http://localhost:7001"
```

### FASE 4: Documentación (1 día)

- Guía de instalación paso a paso
- Troubleshooting común
- Configuración de restaurante
- Manual de uso

### FASE 5: Testing (2-3 días)

- Probar en Windows 10/11
- Probar en macOS (Intel y Apple Silicon)
- Probar en Ubuntu 22.04/24.04
- Probar instalación limpia
- Probar actualización
- Probar backup/restore

---

## 🔧 CONFIGURACIÓN POR RESTAURANTE

Cada instalador incluirá un archivo `config/restaurante.json`:

```json
{
  "restaurant": {
    "id": "labellaitalia",
    "name": "La Bella Italia",
    "type": "Italian Restaurant",
    "address": "Av. Providencia 1234, Santiago",
    "phone": "+56912345678",
    "email": "contacto@labellaitalia.cl",
    "hours": "Lun-Dom 12:00-23:00",
    "timezone": "America/Santiago"
  },
  "widget": {
    "theme": "red",
    "position": "bottom-right",
    "language": "es"
  },
  "features": {
    "whatsapp": true,
    "sms": false,
    "payments": true,
    "reservations": true,
    "delivery": false
  }
}
```

---

## 📊 CRONOGRAMA

| Fase | Tarea | Tiempo | Responsable |
|------|-------|--------|-------------|
| 1 | Dockerizar Backend | 1 día | Dev |
| 1 | Dockerizar Admin Panel | 4 horas | Dev |
| 1 | Dockerizar Landing Page | 4 horas | Dev |
| 2 | Crear docker-compose.yml | 1 día | Dev |
| 2 | Configurar networking | 4 horas | Dev |
| 3 | Scripts Windows | 4 horas | Dev |
| 3 | Scripts macOS/Linux | 4 horas | Dev |
| 4 | Documentación | 1 día | Dev |
| 5 | Testing multi-OS | 3 días | QA |

**Total estimado:** 7-8 días laborales

---

## 🎯 ALTERNATIVA RÁPIDA: Script de Instalación Manual

Si no se desea usar Docker, se puede crear un script que:

1. Instala Node.js 20.x
2. Instala PostgreSQL 16
3. Instala Redis
4. Clona el repositorio
5. Configura .env
6. Ejecuta npm install
7. Ejecuta migraciones
8. Inicia servicios

**Tiempo:** 2-3 días
**Ventaja:** No requiere Docker
**Desventaja:** Más complejo, más propenso a errores

---

## 📦 ENTREGABLES

Para cada cliente:

1. **USB con instalador**
   - ChatBotDysa_Installer.zip
   - README.pdf
   - Videos tutoriales

2. **Documentación impresa**
   - Guía de instalación
   - Manual de usuario
   - Contacto de soporte

3. **Acceso remoto configurado**
   - TeamViewer o AnyDesk
   - Para soporte post-instalación

---

## ✅ CHECKLIST ANTES DE ENTREGAR

- [ ] Instalador probado en Windows 10/11
- [ ] Instalador probado en macOS
- [ ] Instalador probado en Linux
- [ ] Backup automático configurado
- [ ] Logs configurados
- [ ] Monitoreo básico incluido
- [ ] Documentación completa
- [ ] Videos tutoriales grabados
- [ ] Plan de soporte definido
- [ ] Datos de prueba incluidos
- [ ] Menú de ejemplo cargado

---

## 🔄 PLAN DE ACTUALIZACIÓN

### Actualización manual:
```bash
cd ChatBotDysa_Installer
./scripts/backup.sh
docker-compose pull
docker-compose up -d
```

### Actualización automática (futuro):
- Script que verifica nuevas versiones
- Descarga e instala automáticamente
- Mantiene datos intactos

---

## 📞 SOPORTE POST-INSTALACIÓN

1. **Semana 1:** Soporte diario on-site
2. **Mes 1:** Soporte remoto 24/7
3. **Mes 2-6:** Soporte en horario laboral
4. **Mantenimiento:** Actualizaciones mensuales

---

**Creado:** 2025-10-03 20:58 hrs
**Guardado en:** `/Users/devlmer/ChatBotDysa/Reportes/Sesiones/2025-10-03_Sistema_Instaladores/`
