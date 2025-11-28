# 🍎 ChatBotDysa Enterprise - Guía de Instalación para macOS

## 📋 **Para Personas Sin Conocimientos Técnicos**

Esta guía está escrita para que **cualquier persona** pueda instalar ChatBotDysa en su restaurante en **Mac**, **sin necesidad de ser un experto en computadoras**.

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

## 🆘 **¿PROBLEMAS? SOLUCIONES RÁPIDAS**

### **Si Docker no inicia:**
- Ve a **Aplicaciones > Docker** y ábrelo
- Espera 5 minutos para que inicie completamente

### **Si aparece "Puerto ocupado":**
1. Reinicia tu Mac
2. Cierra otros programas antes de iniciar ChatBotDysa

### **Si la instalación se detiene:**
1. Verifica tu conexión a internet
2. Desactiva temporalmente el antivirus
3. Ejecuta con sudo (como se muestra arriba)

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

Si llegaste hasta aquí, **¡tu restaurante ya tiene ChatBotDysa Enterprise funcionando en Mac!**

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