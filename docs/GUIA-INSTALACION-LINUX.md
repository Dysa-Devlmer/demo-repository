# 🐧 ChatBotDysa Enterprise - Guía de Instalación para Linux

## 📋 **Para Personas Sin Conocimientos Técnicos**

Esta guía está escrita para que **cualquier persona** pueda instalar ChatBotDysa en su restaurante en **Linux Ubuntu**, **sin necesidad de ser un experto en computadoras**.

---

## 🐧 **INSTALACIÓN EN LINUX (Ubuntu)**

### **Paso 1: Verificar tu Linux**
1. Abre **Terminal** (presiona **Ctrl + Alt + T**)
2. Escribe exactamente esto y presiona **Enter**:
   ```
   lsb_release -a
   ```
3. Verifica que tienes **Ubuntu 20.04** o superior

### **Paso 2: Instalar los programas necesarios**

**A. Actualizar el sistema:**
Copia y pega este comando en Terminal, luego presiona **Enter**:
```bash
sudo apt update && sudo apt upgrade -y
```
*Te pedirá tu contraseña - escríbela (no verás las letras, es normal)*

**B. Instalar Docker:**
Copia y pega estos comandos uno por uno:

```bash
# Descargar e instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

```bash
# Agregar tu usuario al grupo docker
sudo usermod -aG docker $USER
```

```bash
# Instalar Docker Compose
sudo apt install docker-compose -y
```

```bash
# Reiniciar servicios
sudo systemctl enable docker
sudo systemctl start docker
```

**C. Instalar Node.js:**
Copia y pega estos comandos:

```bash
# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### **Paso 3: Descargar ChatBotDysa**
1. Descarga **ChatBotDysa-Enterprise.zip** a tu carpeta **Descargas**
2. Abre **Terminal** y escribe:
   ```bash
   cd ~
   unzip Descargas/ChatBotDysa-Enterprise.zip
   cd ChatBotDysa
   ```

### **Paso 4: Instalar ChatBotDysa**
En la misma Terminal, escribe estos comandos:

```bash
# Hacer ejecutable el instalador
chmod +x install.sh
```

```bash
# Instalar (cambia "Mi Restaurante" por tu nombre)
sudo ./install.sh
```

**¡Espera! La instalación tomará 10-15 minutos**

### **Paso 5: Iniciar el Sistema**
Cuando termine la instalación, escribe:

```bash
# Iniciar todos los servicios
./start-complete-system.sh
```

**¡Listo!** Abre tu navegador y ve a: **http://localhost:8001**

---

## 🆘 **¿PROBLEMAS? SOLUCIONES RÁPIDAS**

### **Si Docker no inicia:**
```bash
# Reiniciar Docker
sudo systemctl restart docker

# Verificar que está funcionando
sudo systemctl status docker
```

### **Si aparece "Puerto ocupado":**
1. Reinicia tu computadora
2. Cierra otros programas antes de iniciar ChatBotDysa

### **Si la instalación se detiene:**
1. Verifica tu conexión a internet
2. Ejecuta los comandos con sudo (como se muestra arriba)

### **Para verificar que todo funciona:**
```bash
# Ejecutar verificación de salud
node health-check.js
```

### **Si no puedes abrir Terminal:**
- Presiona **Ctrl + Alt + T**
- O busca "Terminal" en el menú de aplicaciones
- O haz clic derecho en el escritorio > "Abrir terminal"

### **Error de permisos:**
```bash
# Si aparecen errores de permisos, ejecuta:
sudo chown -R $USER:$USER ~/ChatBotDysa
```

### **Verificar instalación de Node.js:**
```bash
# Verificar que Node.js está instalado
node --version
npm --version
```

### **Verificar instalación de Docker:**
```bash
# Verificar que Docker está instalado
docker --version
docker-compose --version
```

---

## 🔧 **Comandos Útiles**

### **Parar el sistema:**
```bash
# Detener todos los servicios
./stop-complete-system.sh
```

### **Ver logs del sistema:**
```bash
# Ver logs en tiempo real
tail -f logs/app.log
```

### **Reiniciar servicios:**
```bash
# Parar y iniciar de nuevo
./stop-complete-system.sh
./start-complete-system.sh
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

Si llegaste hasta aquí, **¡tu restaurante ya tiene ChatBotDysa Enterprise funcionando en Linux!**

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

### **Ventajas de Linux para tu restaurante:**
- ✅ **Más seguro:** Menos virus y malware
- ✅ **Más estable:** Funciona sin problemas por días
- ✅ **Gratuito:** No necesitas licencias costosas
- ✅ **Rápido:** Mejor rendimiento que Windows
- ✅ **Confiable:** Ideal para negocios 24/7

**🎉 ¡Bienvenido a ChatBotDysa Enterprise!**
*La solución más completa para gestionar tu restaurante*