# 📂 Rutas y Estructura del Sistema de Instalación

**ChatBotDysa Enterprise+++++**

---

## 🎯 Instalador Principal

**Ruta del instalador:**
```
/Users/devlmer/ChatBotDysa/INSTALADORES_CLIENTES/USB_INSTALLER/
```

**Estructura:**
```
USB_INSTALLER/
├── README.md                           → Guía completa del instalador
├── INSTRUCCIONES_PREPARAR_USB.md       → Paso a paso preparación USB
└── scripts/                            → Scripts de Windows
    ├── install-windows.bat             → Instalador automático (30 min)
    ├── start-system.bat                → Iniciar todos los servicios
    ├── stop-system.bat                 → Detener todos los servicios
    ├── create-client.bat               → Crear cliente con sucursales
    └── verify-system.bat               → Verificar instalación
```

---

## 📋 Documentación del Sistema

**Ruta de documentación:**
```
/Users/devlmer/ChatBotDysa/docs/
```

**Estructura actual:**
```
docs/
├── instalacion/
│   ├── GUIA_COMPLETA_INSTALACION.md    → Guía paso a paso completa
│   ├── RUTAS_Y_ESTRUCTURA.md           → Este archivo
│   └── MULTI_SUCURSAL.md               → Gestión de sucursales
│
└── [otras carpetas de documentación]
```

---

## 💾 Estructura de la USB (Después de prepararla)

```
USB:\ChatBotDysa_Installer\
│
├── 1_INSTALADORES_BASE\                ← Instaladores de Windows
│   ├── node-v20.11.0-x64.msi
│   ├── postgresql-16.1-windows-x64.exe
│   ├── git-2.43.0-64-bit.exe
│   └── chrome-installer.exe (opcional)
│
├── 2_CODIGO_FUENTE\                    ← Todo el código
│   └── ChatBotDysa\
│       ├── apps\
│       │   ├── backend\
│       │   ├── admin-panel\
│       │   ├── website\
│       │   └── web-widget\
│       ├── docs\
│       ├── scripts\
│       └── [archivos del proyecto]
│
├── 3_CONFIGURACION\                    ← Scripts de instalación
│   ├── install-windows.bat
│   ├── start-system.bat
│   ├── stop-system.bat
│   ├── create-client.bat
│   └── verify-system.bat
│
├── 4_DOCUMENTACION\                    ← Docs para el cliente
│   ├── GUIA_INSTALACION.txt
│   └── FAQ.txt
│
├── 5_MATERIALES\                       ← Materiales físicos
│   ├── contratos\
│   ├── marketing\
│   └── tarjetas_soporte\
│
└── README.md                           → Guía principal
```

**Tamaño aproximado:** 1-2 GB

---

## 🖥️ Estructura en PC del Cliente (Después de instalar)

```
C:\ChatBotDysa\                         ← Sistema instalado
│
├── apps\                               ← Aplicaciones
│   ├── backend\                        ← API Backend (puerto 8005)
│   ├── admin-panel\                    ← Panel Admin (puerto 7001)
│   ├── website\                        ← Landing (puerto 6001)
│   └── web-widget\                     ← Widget (puerto 3000)
│
├── database\                           ← PostgreSQL data
│
├── backups\                            ← Backups automáticos
│   └── [backups diarios a las 3 AM]
│
├── logs\                               ← Logs del sistema
│   ├── backend.log
│   ├── admin-panel.log
│   └── errors.log
│
└── client-[nombre]-credentials.txt     ← CREDENCIALES DEL CLIENTE

Escritorio:
├── Iniciar ChatBotDysa.lnk
├── Detener ChatBotDysa.lnk
├── Admin Panel.lnk
├── Crear Cliente Nuevo.lnk
└── Verificar Sistema.lnk
```

---

## 📁 Archivos de Configuración Importantes

### En el servidor (tu Mac de desarrollo)

```
/Users/devlmer/ChatBotDysa/
│
├── apps/
│   ├── backend/
│   │   ├── .env                        → Variables de entorno
│   │   ├── prisma/schema.prisma        → Schema de base de datos
│   │   └── scripts/
│   │       ├── create-new-client.js    → Script de creación cliente
│   │       └── seed-demo-clients.sql   → Datos de demo
│   │
│   ├── admin-panel/
│   │   └── .env.local                  → Config Next.js
│   │
│   └── website/
│       └── .env.local                  → Config Next.js
│
├── docs/                               ← DOCUMENTACIÓN
│   └── instalacion/
│       ├── GUIA_COMPLETA_INSTALACION.md
│       ├── RUTAS_Y_ESTRUCTURA.md
│       └── MULTI_SUCURSAL.md
│
├── INSTALADORES_CLIENTES/              ← INSTALADORES
│   ├── USB_INSTALLER/                  ← PRINCIPAL
│   ├── INSTALADOR_MASTER/              ← Para Mac (opcional)
│   ├── RUTAS_EXACTAS.txt              ← Referencia rápida
│   └── RESUMEN_INSTALADORES.md        ← Resumen completo
│
├── GUIA_DEMO_CLIENTES.md              ← Guía de demostración
├── PROCESO_ONBOARDING_CLIENTES.md     ← Proceso onboarding
├── RESUMEN_EJECUTIVO_DEMO.md          ← Estado del sistema
│
└── scripts/
    └── verify-demo-ready.sh            → Verificar sistema demo
```

### En PC del cliente (Windows)

```
C:\ChatBotDysa\
│
├── apps\backend\.env                   → Config backend
│   DATABASE_URL=postgresql://postgres:supersecret@localhost:15432/chatbotdysa
│   JWT_SECRET=your-secret-key
│   PORT=8005
│   NODE_ENV=production
│
├── apps\admin-panel\.env.local         → Config admin panel
│   NEXT_PUBLIC_API_URL=http://localhost:8005
│
└── apps\website\.env.local             → Config website
    NEXT_PUBLIC_API_URL=http://localhost:8005
```

---

## 🔄 Workflow de Archivos

### 1. Preparación USB (una sola vez)

```bash
# Desde tu Mac de desarrollo:

# Crear estructura
mkdir -p /Volumes/USB/ChatBotDysa_Installer/{1_INSTALADORES_BASE,2_CODIGO_FUENTE,3_CONFIGURACION,4_DOCUMENTACION,5_MATERIALES}

# Copiar instaladores descargados
cp ~/Downloads/node-*.msi /Volumes/USB/ChatBotDysa_Installer/1_INSTALADORES_BASE/
cp ~/Downloads/postgresql-*.exe /Volumes/USB/ChatBotDysa_Installer/1_INSTALADORES_BASE/
cp ~/Downloads/git-*.exe /Volumes/USB/ChatBotDysa_Installer/1_INSTALADORES_BASE/

# Copiar código fuente (sin node_modules)
cp -r /Users/devlmer/ChatBotDysa /Volumes/USB/ChatBotDysa_Installer/2_CODIGO_FUENTE/
find /Volumes/USB/ChatBotDysa_Installer/2_CODIGO_FUENTE -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null

# Copiar scripts
cp /Users/devlmer/ChatBotDysa/INSTALADORES_CLIENTES/USB_INSTALLER/scripts/*.bat \
   /Volumes/USB/ChatBotDysa_Installer/3_CONFIGURACION/
```

### 2. En el restaurante

```batch
REM Copiar al escritorio
xcopy /E /I USB:\ChatBotDysa_Installer C:\Users\usuario\Desktop\ChatBotDysa_Installer

REM Ejecutar instalador
cd Desktop\ChatBotDysa_Installer\3_CONFIGURACION
install-windows.bat

REM Resultado: Todo se instala en C:\ChatBotDysa\
```

### 3. Operación diaria del cliente

```batch
REM Iniciar sistema
Doble click: Iniciar ChatBotDysa.lnk

REM Acceder al sistema
Doble click: Admin Panel.lnk
→ Se abre http://localhost:7001

REM Detener sistema (fin del día)
Doble click: Detener ChatBotDysa.lnk
```

---

## 📊 Resumen de Rutas Clave

| Descripción | Ruta |
|-------------|------|
| **Instalador USB** | `/Users/devlmer/ChatBotDysa/INSTALADORES_CLIENTES/USB_INSTALLER/` |
| **Docs instalación** | `/Users/devlmer/ChatBotDysa/docs/instalacion/` |
| **Scripts Windows** | `/Users/devlmer/ChatBotDysa/INSTALADORES_CLIENTES/USB_INSTALLER/scripts/` |
| **Guías demo** | `/Users/devlmer/ChatBotDysa/GUIA_DEMO_CLIENTES.md` |
| **Script creación cliente** | `/Users/devlmer/ChatBotDysa/apps/backend/scripts/create-new-client.js` |
| **Sistema en cliente** | `C:\ChatBotDysa\` |
| **Credenciales cliente** | `C:\ChatBotDysa\client-[nombre]-credentials.txt` |
| **Admin Panel** | `http://localhost:7001` |
| **Backend API** | `http://localhost:8005` |

---

## 🔍 Archivos Importantes por Función

### Para instalar nuevo cliente

```
1. USB_INSTALLER/INSTRUCCIONES_PREPARAR_USB.md    → Preparar USB
2. USB con todo el contenido                      → Llevar al restaurante
3. install-windows.bat                            → Ejecutar en PC cliente
4. create-client.bat                              → Crear cuenta del cliente
5. GUIA_COMPLETA_INSTALACION.md                   → Seguir paso a paso
```

### Para hacer demo a clientes

```
1. GUIA_DEMO_CLIENTES.md                          → Script de demostración
2. verify-demo-ready.sh                           → Verificar sistema
3. RESUMEN_EJECUTIVO_DEMO.md                      → Estado del sistema
```

### Para onboarding post-venta

```
1. PROCESO_ONBOARDING_CLIENTES.md                 → Proceso completo
2. create-new-client.js                           → Crear cuenta
3. Credenciales generadas                         → Entregar al cliente
```

---

**ChatBotDysa Enterprise+++++**
*Documentación técnica del sistema*

© 2025 ChatBotDysa - Todos los derechos reservados
