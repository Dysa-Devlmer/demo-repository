# 🏪 ChatBotDysa Enterprise - Guía de Instalación Súper Fácil

## 📋 **Para Personas Sin Conocimientos Técnicos**

Esta guía está escrita para que **cualquier persona** pueda instalar ChatBotDysa en su restaurante, **sin necesidad de ser un experto en computadoras**.

---

## 🍎 **INSTALACIÓN EN MAC (macOS)**

### **Paso 1: Verificar tu Mac**
1. Haz clic en el **🍎 menú Apple** (esquina superior izquierda)
2. Selecciona **"Acerca de este Mac"**
3. Verifica que tengas **macOS 12 o superior** (Monterey, Ventura, Sonoma, etc.)

### **Paso 2: Descargar los programas necesarios**

**A. Instalar Docker Desktop:**
1. Ve a: https://www.docker.com/products/docker-desktop
2. Haz clic en **"Download for Mac"**
3. Descarga el archivo **Docker.dmg**
4. Haz **doble clic** en Docker.dmg
5. **Arrastra** el ícono de Docker a la carpeta **Aplicaciones**
6. Abre **Launchpad** y haz clic en **Docker**
7. Si aparece un mensaje de seguridad, ve a **Preferencias del Sistema > Seguridad** y permite Docker
8. Docker tardará unos minutos en iniciarse (verás un ícono de ballena en la barra superior)

**B. Instalar Node.js:**
1. Ve a: https://nodejs.org
2. Haz clic en **"Download"** (descarga la versión LTS)
3. Haz **doble clic** en el archivo descargado (.pkg)
4. Sigue el asistente de instalación haciendo clic en **"Continuar"** y luego **"Instalar"**

### **Paso 3: Descargar ChatBotDysa**
1. Descarga el archivo **ChatBotDysa-Enterprise.zip**
2. Haz **doble clic** para descomprimir
3. **Arrastra** la carpeta **ChatBotDysa** al **Escritorio**

### **Paso 4: Instalar ChatBotDysa**
1. Abre **Terminal** (busca "Terminal" en Spotlight - lupa superior derecha)
2. Escribe exactamente esto y presiona **Enter**:
   ```
   cd Desktop/ChatBotDysa
   ```
3. Escribe esto y presiona **Enter**:
   ```
   chmod +x install.sh
   ```
4. Escribe esto y presiona **Enter** (cambia "Mi Restaurante" por el nombre de tu restaurante):
   ```
   sudo ./install.sh
   ```
5. Te pedirá tu contraseña de Mac - escríbela (no verás las letras, es normal)
6. **¡Espera! La instalación tomará 10-15 minutos**

### **Paso 5: Iniciar el Sistema**
1. En la misma ventana de Terminal, escribe:
   ```
   ./start-complete-system.sh
   ```
2. **¡Listo!** Tu navegador se abrirá automáticamente
3. Verás el panel de administración en: **http://localhost:8001**

---

## 🖥️ **INSTALACIÓN EN WINDOWS 8**

### **⚠️ NOTA IMPORTANTE PARA WINDOWS 8:**
Windows 8 es muy antiguo y puede tener problemas. **Recomendamos actualizar a Windows 10 o 11**, pero si no es posible, sigue estos pasos:

### **Paso 1: Verificar tu Windows**
1. Presiona **tecla Windows + R**
2. Escribe **"winver"** y presiona **Enter**
3. Verifica que tienes **Windows 8.1** (si tienes Windows 8.0, actualiza primero)

### **Paso 2: Instalar PowerShell 5.0 o superior**
1. Ve a: https://www.microsoft.com/en-us/download/details.aspx?id=54616
2. Descarga e instala **Windows Management Framework 5.1**
3. **Reinicia** tu computadora

### **Paso 3: Descargar los programas necesarios**

**A. Instalar Docker Desktop:**
⚠️ **Docker Desktop NO funciona en Windows 8**
Necesitas usar **Docker Toolbox** (más complicado):
1. Ve a: https://github.com/docker/toolbox/releases
2. Descarga **DockerToolbox.exe**
3. Ejecuta como **Administrador**
4. Sigue el asistente de instalación

**B. Instalar Node.js:**
1. Ve a: https://nodejs.org
2. Descarga la **versión LTS**
3. Ejecuta el instalador como **Administrador**

### **Paso 4: Instalación de ChatBotDysa**
1. Descarga **ChatBotDysa-Enterprise.zip**
2. **Descomprime** en **C:\ChatBotDysa**
3. Haz **clic derecho** en el menú **Inicio**
4. Selecciona **"Símbolo del sistema (Administrador)"**
5. Escribe:
   ```
   cd C:\ChatBotDysa
   ```
6. Escribe:
   ```
   powershell -ExecutionPolicy Bypass -File install.ps1
   ```

**💡 RECOMENDACIÓN:** Actualiza a Windows 10 o 11 para mejor experiencia.

---

## 🖥️ **INSTALACIÓN EN WINDOWS 10**

### **Paso 1: Verificar tu Windows**
1. Haz **clic derecho** en **"Este equipo"**
2. Selecciona **"Propiedades"**
3. Verifica que tienes **Windows 10** versión 1903 o superior

### **Paso 2: Descargar los programas necesarios**

**A. Instalar Docker Desktop:**
1. Ve a: https://www.docker.com/products/docker-desktop
2. Haz clic en **"Download for Windows"**
3. Ejecuta **Docker Desktop Installer.exe** como **Administrador**
4. Sigue el asistente y **reinicia** cuando te lo pida
5. Abre **Docker Desktop** desde el menú Inicio
6. Espera a que aparezca el ícono de Docker en la bandeja del sistema

**B. Instalar Node.js:**
1. Ve a: https://nodejs.org
2. Haz clic en **"Download"** (versión LTS)
3. Ejecuta el archivo **.msi** como **Administrador**
4. Sigue el asistente haciendo clic en **"Next"** hasta terminar

### **Paso 3: Descargar ChatBotDysa**
1. Descarga **ChatBotDysa-Enterprise.zip**
2. **Clic derecho** > **"Extraer todo"**
3. Extrae en **C:\ChatBotDysa**

### **Paso 4: Instalar ChatBotDysa**
1. Presiona **tecla Windows + X**
2. Selecciona **"Windows PowerShell (Administrador)"**
3. Haz clic en **"Sí"** cuando aparezca el control de usuario
4. Escribe (cambia "Mi Restaurante" por tu nombre):
   ```
   cd C:\ChatBotDysa
   PowerShell -ExecutionPolicy Bypass -File install.ps1 -RestaurantName "Mi Restaurante" -Language "es"
   ```
5. Presiona **Enter** y espera 15-20 minutos

### **Paso 5: Iniciar el Sistema**
1. En la misma ventana de PowerShell, escribe:
   ```
   .\start.ps1
   ```
2. **¡Listo!** Tu navegador se abrirá automáticamente
3. Panel de administración: **http://localhost:8001**

---

## 🖥️ **INSTALACIÓN EN WINDOWS 11**

### **Paso 1: Verificar tu Windows**
1. Presiona **tecla Windows + I**
2. Ve a **"Sistema"**
3. Confirma que tienes **Windows 11**

### **Paso 2: Descargar los programas necesarios**

**A. Instalar Docker Desktop:**
1. Ve a: https://www.docker.com/products/docker-desktop
2. Haz clic en **"Download for Windows"**
3. Ejecuta **Docker Desktop Installer.exe**
4. Selecciona **"Usar contenedores Linux"** durante la instalación
5. **Reinicia** cuando te lo pida
6. Abre **Docker Desktop** y espera a que inicie completamente

**B. Instalar Node.js:**
1. Ve a: https://nodejs.org
2. Descarga la **versión LTS** (recomendada)
3. Ejecuta el instalador **.msi**
4. Acepta todos los valores predeterminados

### **Paso 3: Descargar ChatBotDysa**
1. Descarga **ChatBotDysa-Enterprise.zip**
2. **Clic derecho** > **"Extraer todo"** > **"Extraer"**
3. Mueve la carpeta a **C:\ChatBotDysa**

### **Paso 4: Instalar ChatBotDysa**
1. Haz **clic derecho** en el botón **Inicio**
2. Selecciona **"Terminal (Administrador)"**
3. Haz clic en **"Sí"** para permitir cambios
4. Escribe (personaliza el nombre de tu restaurante):
   ```
   cd C:\ChatBotDysa
   PowerShell -ExecutionPolicy Bypass -File install.ps1 -RestaurantName "Pizza Deliciosa" -Language "es"
   ```
5. Presiona **Enter** y **¡paciencia!** - tomará 15-20 minutos

### **Paso 5: Iniciar el Sistema**
1. En la misma terminal, escribe:
   ```
   .\start.ps1
   ```
2. **¡Perfecto!** El sistema se abrirá automáticamente en tu navegador
3. Accede al panel: **http://localhost:8001**

---

## 🐧 **INSTALACIÓN EN LINUX (Ubuntu)**

### **Paso 1: Verificar tu Linux**
1. Abre **Terminal** (Ctrl + Alt + T)
2. Escribe:
   ```
   lsb_release -a
   ```
3. Verifica que tienes **Ubuntu 20.04** o superior

### **Paso 2: Instalar los programas necesarios**

**A. Actualizar el sistema:**
```bash
sudo apt update && sudo apt upgrade -y
```

**B. Instalar Docker:**
```bash
# Descargar e instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Agregar tu usuario al grupo docker
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo apt install docker-compose -y

# Reiniciar servicios
sudo systemctl enable docker
sudo systemctl start docker
```

**C. Instalar Node.js:**
```bash
# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### **Paso 3: Descargar ChatBotDysa**
1. Descarga **ChatBotDysa-Enterprise.zip**
2. Extrae en tu carpeta personal:
   ```bash
   cd ~
   unzip ChatBotDysa-Enterprise.zip
   cd ChatBotDysa
   ```

### **Paso 4: Instalar ChatBotDysa**
```bash
# Hacer ejecutable el instalador
chmod +x install.sh

# Instalar (cambia "Mi Restaurante" por tu nombre)
sudo ./install.sh
```

### **Paso 5: Iniciar el Sistema**
```bash
# Iniciar todos los servicios
./start-complete-system.sh
```

**¡Listo!** Abre tu navegador y ve a: **http://localhost:8001**

---

## 🆘 **¿PROBLEMAS? SOLUCIONES RÁPIDAS**

### **Si Docker no inicia:**
- **Windows:** Reinicia y espera 5 minutos
- **Mac:** Ve a **Aplicaciones > Docker** y ábrelo
- **Linux:** `sudo systemctl restart docker`

### **Si aparece "Puerto ocupado":**
1. Reinicia tu computadora
2. Cierra otros programas antes de iniciar ChatBotDysa

### **Si la instalación se detiene:**
1. Verifica tu conexión a internet
2. Desactiva temporalmente el antivirus
3. Ejecuta como Administrador (Windows) o con sudo (Mac/Linux)

### **Para verificar que todo funciona:**
```bash
# Ejecutar verificación de salud
node health-check.js
```

---

## 📞 **CONTACTO Y SOPORTE**

**¿Necesitas ayuda?**
- 📧 Email: support@chatbotdysa.com
- 📱 WhatsApp: +1-XXX-XXX-XXXX
- 🌐 Web: https://chatbotdysa.com/soporte

**Horarios de Soporte:**
- Lunes a Viernes: 8:00 AM - 8:00 PM
- Sábados: 9:00 AM - 5:00 PM
- Domingos: 10:00 AM - 2:00 PM

---

## ✅ **¡FELICITACIONES!**

Si llegaste hasta aquí, **¡tu restaurante ya tiene ChatBotDysa Enterprise funcionando!**

### **Próximos pasos:**
1. **Configurar tu restaurante:** Nombre, logo, horarios
2. **Agregar tu menú:** Categorías, platillos, precios
3. **Crear usuarios:** Cajeros, cocineros, administradores
4. **Probar pedidos:** Hacer pedidos de prueba
5. **Capacitar al personal:** Mostrar cómo usar el sistema

### **URLs importantes que debes recordar:**
- **Panel de Administración:** http://localhost:8001
- **API del Sistema:** http://localhost:8005
- **Documentación:** http://localhost:8005/api-docs

**🎉 ¡Bienvenido a ChatBotDysa Enterprise!**
*La solución más completa para gestionar tu restaurante*