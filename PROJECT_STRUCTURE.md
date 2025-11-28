# 📁 Estructura del Proyecto ChatBotDysa

## 🏗️ Arquitectura de Directorios

```
ChatBotDysa/
│
├── 📁 apps/                    # Aplicaciones del sistema
│   ├── admin-panel/            # Panel de administración (Next.js)
│   ├── backend/                # API Backend (NestJS)
│   ├── landing-page/           # Página de aterrizaje
│   ├── website/                # Sitio web corporativo
│   └── web-widget/             # Widget de chat
│
├── 📁 docs/                    # Documentación completa
│   ├── api/                    # Documentación API
│   ├── deployment/             # Guías de despliegue
│   ├── development/            # Guías de desarrollo
│   ├── progress/               # Avances y notas
│   └── RESUMEN_EJECUTIVO_SISTEMA.md
│
├── 📁 scripts/                 # Scripts de automatización
│   ├── backup/                 # Scripts de respaldo
│   ├── deployment/             # Scripts de despliegue
│   └── dev/                    # Scripts de desarrollo
│
├── 📁 infrastructure/          # Configuración de infraestructura
│   ├── docker/                 # Dockerfiles
│   ├── kubernetes/             # Manifiestos K8s
│   └── terraform/              # IaC con Terraform
│
├── 📁 config/                  # ⭐ Archivos de configuración
│   ├── .env.example            # Plantilla de variables de entorno
│   ├── .env.production         # Configuración de producción
│   └── README.md               # Documentación de configuración
│
├── 📁 tests/                   # ⭐ Tests del sistema
│   ├── integration/            # Tests de integración
│   └── examples/               # Ejemplos y demos
│
├── 📁 reports/                 # ⭐ Reportes y auditorías
│   └── Sesiones/               # Reportes de sesiones de trabajo
│
├── 📁 assets/                  # Recursos estáticos
│   ├── images/                 # Imágenes
│   └── icons/                  # Iconos
│
├── 📁 logs/                    # Logs del sistema
│
├── 📄 README.md                # Documentación principal
├── 📄 PROJECT_STRUCTURE.md     # ⭐ Este archivo
├── 📄 package.json             # Dependencias del proyecto
└── 📄 tsconfig.json            # Configuración TypeScript
```

⭐ = Directorios organizados recientemente

## 🚀 Aplicaciones

### Admin Panel (Puerto 7001)
Panel de administración web con autenticación RBAC, gestión de usuarios, pedidos, menú, etc.

**Stack**: Next.js 14, React 18, TailwindCSS, shadcn/ui

### Backend API (Puerto 8005)
API REST construida con NestJS, PostgreSQL, Redis, JWT auth.

**Stack**: NestJS, TypeORM, PostgreSQL, Redis, Swagger

### Website (Puerto 6001)
Sitio web corporativo con información sobre el producto.

**Stack**: Next.js, TailwindCSS

### Landing Page (Puerto 3004)
Página de aterrizaje para captación de leads.

**Stack**: Next.js, TailwindCSS

### Web Widget (Puerto 3000)
Widget de chat embebible para sitios web de clientes.

**Stack**: React, WebSocket

## 🔐 Sistema RBAC

El sistema implementa Role-Based Access Control con:
- **4 Roles**: Admin (35 permisos), Manager (26), Staff (14), User (3)
- **35 Permisos** granulares organizados por módulos
- **JWT Authentication** con tokens de acceso y refresh
- **Guards de NestJS** para protección de endpoints

Ver `/docs/GUIA_RBAC_COMPLETA.md` para detalles.

## 🔌 Integraciones

- ✅ **Ollama AI** - Procesamiento de lenguaje natural local
- ⚠️  **WhatsApp Business** - Mensajería (verificar tokens)
- ⚠️  **Twilio** - Voz y SMS (placeholders)
- ⚠️  **MercadoPago** - Pagos (modo test)
- ❌ **SendGrid** - Email (no configurado)
- ❌ **AWS S3** - Storage (no configurado)

Ver `config/.env.example` para configuración.

## 📚 Documentación

- `/docs/` - Documentación completa del sistema
- `README.md` - Guía rápida de inicio
- `docs/api/` - Documentación de la API
- `docs/deployment/` - Guías de despliegue
- `PROJECT_STRUCTURE.md` - Estructura del proyecto (este archivo)

## 🔧 Configuración

Todos los archivos de configuración están en `/config/`.

```bash
# Desarrollo
cp config/.env.example .env

# Producción
cp config/.env.production .env
```

Ver `config/README.md` para detalles.

## 🧪 Tests

Los tests están organizados en `/tests/`:
- Integration tests con TestSprite
- Ejemplos de uso del sistema

## 📊 Reportes

Los reportes de auditoría y sesiones están en `/reports/`.

## 🚀 Quick Start

```bash
# Instalar dependencias
npm install

# Iniciar servicios (Docker)
docker-compose up -d

# Iniciar backend (desarrollo)
cd apps/backend && npm run start:dev

# Iniciar admin panel (desarrollo)
cd apps/admin-panel && npm run dev
```

---
*Última actualización: $(date +%Y-%m-%d)*
