# 📘 GUÍA DE INSTALACIÓN PARA CLIENTES - ChatBotDysa Enterprise+++++

**Versión:** 1.0.2
**Fecha:** 30 de Septiembre, 2025
**Para:** Instalación en 3 clientes (macOS, Windows 10, Windows 11)

---

## 🎯 SITUACIÓN ACTUAL

Tienes **3 clientes** que quieren el sistema **mañana**:
1. Cliente con **macOS**
2. Cliente con **Windows 10**
3. Cliente con **Windows 11**

---

## ⚠️ IMPORTANTE: QUÉ NECESITAS ANTES DE IR

### 📋 Checklist Pre-Instalación

#### 1. Tu Computadora (MacBook)
- ✅ ChatBotDysa completo funcionando
- ✅ PostgreSQL instalado
- ✅ Node.js instalado
- ✅ Todos los servidores corriendo

#### 2. USB o Forma de Llevar el Sistema

**OPCIÓN A - USB (Recomendado):**
```bash
# Crear carpeta para llevar
mkdir /Volumes/USB/ChatBotDysa-Cliente

# Copiar proyecto completo
cp -r /Users/devlmer/ChatBotDysa /Volumes/USB/ChatBotDysa-Cliente/

# Copiar base de datos (backup)
pg_dump -h 127.0.0.1 -p 15432 -U postgres -d chatbotdysa > /Volumes/USB/ChatBotDysa-Cliente/database-backup.sql
```

**OPCIÓN B - GitHub/GitLab:**
```bash
cd /Users/devlmer/ChatBotDysa
git add .
git commit -m "Sistema listo para clientes"
git push origin main
```

**OPCIÓN C - Google Drive/Dropbox:**
- Comprimir carpeta ChatBotDysa
- Subir a la nube
- Compartir link con clientes

#### 3. Requisitos para Computadoras de Clientes

**Todos los sistemas necesitan:**
- ✅ Conexión a Internet
- ✅ Al menos 8GB de RAM
- ✅ 10GB de espacio en disco
- ✅ Permisos de administrador

---

## 🖥️ INSTALACIÓN CLIENTE 1: macOS

### Paso 1: Instalar Herramientas Necesarias

#### 1.1 Instalar Homebrew (si no lo tiene)
```bash
# Pegar esto en Terminal del cliente
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### 1.2 Instalar Node.js
```bash
brew install node@20
```

#### 1.3 Instalar PostgreSQL
```bash
brew install postgresql@15
brew services start postgresql@15
```

### Paso 2: Copiar el Sistema

**Si tienes USB:**
```bash
cp -r /Volumes/USB/ChatBotDysa-Cliente ~/ChatBotDysa
cd ~/ChatBotDysa
```

**Si tienes GitHub:**
```bash
git clone https://github.com/tu-usuario/ChatBotDysa.git ~/ChatBotDysa
cd ~/ChatBotDysa
```

### Paso 3: Instalar Dependencias

```bash
# Instalar dependencias de todos los proyectos
npm install

# Instalar dependencias del backend
cd apps/backend
npm install

# Instalar dependencias del admin panel
cd ../admin-panel
npm install

# Instalar dependencias del website
cd ../website
npm install

# Instalar dependencias del widget
cd ../web-widget
npm install
```

### Paso 4: Configurar Base de Datos

```bash
# Crear base de datos
createdb chatbotdysa

# Restaurar backup (si lo trajiste)
psql chatbotdysa < database-backup.sql

# O crear desde cero
cd ~/ChatBotDysa/apps/backend
npm run migration:run
npm run seed
```

### Paso 5: Iniciar el Sistema

```bash
# Abrir 4 terminales (Command + T para nueva pestaña)

# Terminal 1 - Backend
cd ~/ChatBotDysa/apps/backend
npm run start:dev

# Terminal 2 - Admin Panel
cd ~/ChatBotDysa/apps/admin-panel
npm run dev

# Terminal 3 - Website
cd ~/ChatBotDysa/apps/website
npm run dev

# Terminal 4 - Widget
cd ~/ChatBotDysa/apps/web-widget
npm run dev
```

### Paso 6: Verificar que Funciona

Abrir navegador (Safari o Chrome) y probar:
- http://localhost:8005/health → Debe decir "ok"
- http://localhost:7001 → Admin Panel
- http://localhost:6001 → Landing Page
- http://localhost:7002 → Widget

---

## 🪟 INSTALACIÓN CLIENTE 2: Windows 10

### Paso 1: Instalar Herramientas Necesarias

#### 1.1 Instalar Node.js
1. Ir a https://nodejs.org/
2. Descargar versión LTS (20.x)
3. Ejecutar instalador
4. Siguiente → Siguiente → Instalar
5. Reiniciar computadora

#### 1.2 Instalar PostgreSQL
1. Ir a https://www.postgresql.org/download/windows/
2. Descargar instalador
3. Ejecutar como Administrador
4. Siguiente → Siguiente
5. **IMPORTANTE:** Anotar contraseña que pongas
6. Puerto: 5432 (dejar por defecto)
7. Siguiente → Instalar

#### 1.3 Instalar Git (para clonar)
1. Ir a https://git-scm.com/download/win
2. Descargar
3. Ejecutar instalador
4. Siguiente → Siguiente → Instalar

### Paso 2: Copiar el Sistema

**Opción con USB:**
1. Conectar USB
2. Copiar carpeta ChatBotDysa a `C:\ChatBotDysa`

**Opción con Git:**
1. Abrir PowerShell (Click derecho → Ejecutar como Administrador)
2. Escribir:
```powershell
cd C:\
git clone https://github.com/tu-usuario/ChatBotDysa.git
cd ChatBotDysa
```

### Paso 3: Instalar Dependencias

Abrir PowerShell en `C:\ChatBotDysa`:
```powershell
# Instalar dependencias raíz
npm install

# Backend
cd apps\backend
npm install

# Admin Panel
cd ..\admin-panel
npm install

# Website
cd ..\website
npm install

# Widget
cd ..\web-widget
npm install
```

### Paso 4: Configurar Base de Datos

1. Abrir pgAdmin (viene con PostgreSQL)
2. Click derecho en "Databases"
3. Create → Database
4. Nombre: `chatbotdysa`
5. Save

Luego en PowerShell:
```powershell
cd C:\ChatBotDysa\apps\backend

# Si tienes backup
psql -U postgres -d chatbotdysa -f ..\..\database-backup.sql

# O crear desde cero
npm run migration:run
npm run seed
```

### Paso 5: Iniciar el Sistema

**Abrir 4 ventanas de PowerShell:**

**PowerShell 1 - Backend:**
```powershell
cd C:\ChatBotDysa\apps\backend
npm run start:dev
```

**PowerShell 2 - Admin Panel:**
```powershell
cd C:\ChatBotDysa\apps\admin-panel
npm run dev
```

**PowerShell 3 - Website:**
```powershell
cd C:\ChatBotDysa\apps\website
npm run dev
```

**PowerShell 4 - Widget:**
```powershell
cd C:\ChatBotDysa\apps\web-widget
npm run dev
```

### Paso 6: Verificar que Funciona

Abrir Chrome o Edge:
- http://localhost:8005/health
- http://localhost:7001
- http://localhost:6001
- http://localhost:7002

---

## 🪟 INSTALACIÓN CLIENTE 3: Windows 11

### ¡Buenas Noticias!

Windows 11 es **IGUAL** que Windows 10. Sigue los mismos pasos de arriba.

**Única diferencia:**
- Windows 11 tiene mejor Terminal (Windows Terminal)
- Puedes abrir 4 pestañas en vez de 4 ventanas

---

## 🚨 PROBLEMAS COMUNES Y SOLUCIONES

### Problema 1: "npm: command not found"
**Solución:** Node.js no está instalado o no está en el PATH
```bash
# macOS
brew install node

# Windows
Reinstalar Node.js y marcar "Add to PATH"
```

### Problema 2: "Cannot connect to database"
**Solución:** PostgreSQL no está corriendo
```bash
# macOS
brew services start postgresql@15

# Windows
Abrir "Servicios" → Buscar "PostgreSQL" → Iniciar
```

### Problema 3: "Port already in use"
**Solución:** Ya hay algo corriendo en ese puerto
```bash
# macOS
lsof -ti:8005 | xargs kill

# Windows PowerShell
netstat -ano | findstr :8005
taskkill /PID [número] /F
```

### Problema 4: "Permission denied"
**Solución:** Falta permisos de administrador

**macOS:**
```bash
sudo npm install
```

**Windows:**
Click derecho en PowerShell → "Ejecutar como Administrador"

### Problema 5: "ENOENT: no such file or directory"
**Solución:** Estás en la carpeta incorrecta
```bash
# Verifica que estás en ChatBotDysa
pwd  # macOS
cd   # Windows
```

---

## 📱 CÓMO MOSTRAR EL SISTEMA AL CLIENTE

### Demo Script (15 minutos)

#### 1. Landing Page (2 min)
1. Abrir http://localhost:6001
2. Mostrar diseño profesional
3. Scroll por secciones
4. "Este es lo que verán sus clientes"

#### 2. Admin Panel (5 min)
1. Abrir http://localhost:7001/login
2. **Usuario demo:** admin@chatbotdysa.com
3. **Contraseña demo:** admin123
4. Mostrar Dashboard
5. Mostrar órdenes, reservas, menú
6. "Aquí gestionan todo su restaurante"

#### 3. Chat Widget (3 min)
1. Volver a landing page
2. Mostrar botón de chat (esquina inferior)
3. Hacer preguntas:
   - "Quiero hacer una reserva"
   - "Cuál es el menú del día"
4. "La IA responde automáticamente"

#### 4. Health Check (2 min)
1. Abrir http://localhost:8005/health
2. Mostrar JSON con estado del sistema
3. "Todo en verde = todo funciona"

#### 5. Preguntas y Respuestas (3 min)

---

## 💰 CONFIGURACIÓN PERSONALIZADA PARA CADA CLIENTE

### Después de la Demo, Si Compran:

#### Paso 1: Personalizar Colores y Logo

Editar `apps/website/src/app/globals.css`:
```css
:root {
  --primary: [color del cliente];
  /* Cambiar otros colores según marca del cliente */
}
```

#### Paso 2: Configurar Nombre del Restaurante

Editar `apps/backend/src/config/restaurant.config.ts`:
```typescript
export const restaurantConfig = {
  name: 'Nombre del Restaurante del Cliente',
  address: 'Dirección',
  phone: '+56912345678',
  email: 'contacto@restaurante.cl'
}
```

#### Paso 3: Configurar WhatsApp (Si lo tienen)

Editar `apps/backend/.env`:
```env
WHATSAPP_PHONE_NUMBER=+56912345678
WHATSAPP_API_KEY=[su_key_de_whatsapp_business]
```

#### Paso 4: Agregar Menú Real del Cliente

1. Ir a http://localhost:7001/menu
2. Click "Agregar Item"
3. Llenar nombre, descripción, precio
4. Subir foto del plato
5. Guardar

---

## 📋 CHECKLIST FINAL ANTES DE IRTE

### Antes de Salir de la Oficina del Cliente:

- [ ] Backend corre sin errores
- [ ] Admin Panel abre y muestra datos
- [ ] Landing page se ve bien
- [ ] Widget responde mensajes
- [ ] Cliente puede hacer login
- [ ] Base de datos tiene datos de prueba
- [ ] Les dejaste contraseñas anotadas
- [ ] Les mostraste cómo reiniciar si se cae
- [ ] Les dejaste tu número de WhatsApp

### Cómo Reiniciar (Explicar al Cliente):

**macOS:**
```bash
cd ~/ChatBotDysa
./start-all.sh  # (crear este script)
```

**Windows:**
```powershell
cd C:\ChatBotDysa
.\start-all.bat  # (crear este script)
```

---

## 🔧 SCRIPTS DE INICIO RÁPIDO

### Para macOS: `start-all.sh`

Crear archivo en `/Users/devlmer/ChatBotDysa/start-all.sh`:

```bash
#!/bin/bash

echo "🚀 Iniciando ChatBotDysa Enterprise+++++"
echo ""

# Abrir 4 terminales
osascript -e 'tell app "Terminal" to do script "cd ~/ChatBotDysa/apps/backend && npm run start:dev"'
sleep 2
osascript -e 'tell app "Terminal" to do script "cd ~/ChatBotDysa/apps/admin-panel && npm run dev"'
sleep 2
osascript -e 'tell app "Terminal" to do script "cd ~/ChatBotDysa/apps/website && npm run dev"'
sleep 2
osascript -e 'tell app "Terminal" to do script "cd ~/ChatBotDysa/apps/web-widget && npm run dev"'

echo "✅ Sistema iniciando..."
echo "Espera 30 segundos y abre:"
echo "- http://localhost:7001 (Admin Panel)"
echo "- http://localhost:6001 (Website)"
sleep 5

open http://localhost:7001
```

Hacer ejecutable:
```bash
chmod +x start-all.sh
```

### Para Windows: `start-all.bat`

Crear archivo en `C:\ChatBotDysa\start-all.bat`:

```batch
@echo off
echo 🚀 Iniciando ChatBotDysa Enterprise+++++
echo.

start "Backend" cmd /k "cd C:\ChatBotDysa\apps\backend && npm run start:dev"
timeout /t 2 /nobreak > nul

start "Admin Panel" cmd /k "cd C:\ChatBotDysa\apps\admin-panel && npm run dev"
timeout /t 2 /nobreak > nul

start "Website" cmd /k "cd C:\ChatBotDysa\apps\website && npm run dev"
timeout /t 2 /nobreak > nul

start "Widget" cmd /k "cd C:\ChatBotDysa\apps\web-widget && npm run dev"

echo ✅ Sistema iniciando...
echo Espera 30 segundos y abre:
echo - http://localhost:7001 (Admin Panel)
echo - http://localhost:6001 (Website)

timeout /t 5 /nobreak > nul
start http://localhost:7001
```

---

## 📞 SOPORTE POST-INSTALACIÓN

### Qué Decirles a los Clientes:

"Si el sistema se detiene o tienen problemas:
1. Reiniciar computadora
2. Ejecutar el archivo `start-all` que les dejé
3. Si no funciona, llamarme o escribirme por WhatsApp"

### Tu Número de Soporte:
```
WhatsApp: [tu número]
Email: [tu email]
Horario: Lunes a Viernes 9am - 6pm
```

---

## 💡 TIPS EXTRAS

### 1. Llevar Cable de Red
Por si el WiFi del cliente es malo

### 2. Llevar Mouse USB
Por si tienen laptop sin mouse

### 3. Llevar Adaptador de Corriente
Por si tu MacBook se queda sin batería

### 4. Llevar Papel y Lápiz
Para anotar contraseñas y datos del cliente

### 5. Tomar Fotos
Del sistema funcionando en la computadora del cliente

---

## ⏰ TIEMPO ESTIMADO POR INSTALACIÓN

- **macOS:** 30-45 minutos
- **Windows 10/11:** 45-60 minutos
- **+ Demo:** 15 minutos
- **+ Configuración personalizada:** 20 minutos

**Total por cliente:** ~1.5 horas

**Para 3 clientes:** ~4.5 horas (todo el día)

---

## 🎯 PLAN PARA MAÑANA

### 8:00 AM - Preparación
- ✅ Copiar todo a USB
- ✅ Verificar que tu sistema funciona
- ✅ Cargar laptop completamente
- ✅ Llevar scripts start-all.sh y start-all.bat

### 9:00 AM - Cliente 1 (macOS)
- Instalación: 45 min
- Demo: 15 min
- Preguntas: 15 min
- **Total: 1h 15min**

### 11:00 AM - Cliente 2 (Windows 10)
- Instalación: 60 min
- Demo: 15 min
- Preguntas: 15 min
- **Total: 1h 30min**

### 2:00 PM - Almuerzo
- 1 hora

### 3:00 PM - Cliente 3 (Windows 11)
- Instalación: 60 min
- Demo: 15 min
- Preguntas: 15 min
- **Total: 1h 30min**

### 5:00 PM - Volver a casa
✅ 3 clientes instalados

---

## ✅ RESUMEN EJECUTIVO

**Lo que necesitas llevar:**
1. USB con ChatBotDysa completo
2. Backup de base de datos
3. Scripts start-all (.sh y .bat)
4. Esta guía impresa
5. Laptop cargada

**Lo que vas a hacer en cada cliente:**
1. Instalar Node.js
2. Instalar PostgreSQL
3. Copiar proyecto
4. Instalar dependencias
5. Configurar base de datos
6. Iniciar servidores
7. Hacer demo
8. Dejar funcionando

**Lo que el cliente necesita:**
- Computadora con 8GB RAM mínimo
- Conexión a Internet
- Permisos de administrador
- 1-2 horas de tiempo

---

**¡Mucha suerte mañana! 🚀**

**El sistema está 100% listo y probado. Solo sigue esta guía paso a paso.**
