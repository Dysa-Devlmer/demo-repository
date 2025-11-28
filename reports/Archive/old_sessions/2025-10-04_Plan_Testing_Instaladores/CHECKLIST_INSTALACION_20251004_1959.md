# CHECKLIST DE INSTALACIÓN CHATBOTDYSA
## Guía Rápida para Restaurantes

---

**📅 Fecha:** 2025-10-04
**⏰ Hora:** 19:59:00
**📄 Versión:** 1.0
**📏 Formato:** A4 - Listo para imprimir
**⏱️ Tiempo estimado:** 20-30 minutos

---

## 🎯 ANTES DE EMPEZAR

### ✅ Requisitos del Sistema

- [ ] **Computadora con:**
  - Procesador: Intel Core i3 o superior
  - RAM: Mínimo 4 GB (recomendado 8 GB)
  - Disco duro: 10 GB de espacio libre
  - Sistema Operativo:
    - ☐ Windows 10/11
    - ☐ macOS 10.15 o superior
    - ☐ Linux Ubuntu 20.04 o superior

- [ ] **Conexión a Internet** (mínimo 5 Mbps)

- [ ] **Navegador Web Actualizado:**
  - ☐ Google Chrome 90+
  - ☐ Mozilla Firefox 88+
  - ☐ Safari 14+
  - ☐ Microsoft Edge 90+

---

## 📥 PASO 1: INSTALAR PRE-REQUISITOS

### Docker Desktop

- [ ] **Descargar Docker Desktop**
  - URL: https://docker.com/products/docker-desktop
  - Versión para tu sistema operativo

- [ ] **Instalar Docker Desktop**
  - Ejecutar instalador descargado
  - Seguir instrucciones en pantalla
  - Aceptar términos y condiciones
  - **Reiniciar computadora** (si es requerido)

- [ ] **Verificar Docker instalado**
  - Abrir Terminal/CMD
  - Ejecutar: `docker --version`
  - Debe mostrar versión (ej. "Docker version 24.0.0")

- [ ] **Iniciar Docker Desktop**
  - Buscar ícono de Docker en aplicaciones
  - Abrir Docker Desktop
  - Esperar a que muestre "Docker Desktop is running"

### Git

- [ ] **Descargar Git**
  - URL: https://git-scm.com/downloads
  - Versión para tu sistema operativo

- [ ] **Instalar Git**
  - Ejecutar instalador
  - Mantener opciones por defecto
  - Click en "Next" hasta completar

- [ ] **Verificar Git instalado**
  - Abrir Terminal/CMD
  - Ejecutar: `git --version`
  - Debe mostrar versión (ej. "git version 2.40.0")

---

## 💾 PASO 2: DESCARGAR CHATBOTDYSA

- [ ] **Abrir Terminal/Línea de Comandos**
  - Windows: Presiona `Win + R`, escribe `cmd`, Enter
  - Mac: Presiona `Cmd + Espacio`, escribe `Terminal`, Enter
  - Linux: Presiona `Ctrl + Alt + T`

- [ ] **Navegar a carpeta de instalación**
  ```bash
  cd Documentos
  ```
  (O cualquier carpeta donde quieras instalar)

- [ ] **Clonar repositorio ChatBotDysa**
  ```bash
  git clone https://github.com/tuempresa/ChatBotDysa.git
  ```

- [ ] **Esperar descarga completa**
  - Se descargará ~500 MB
  - Tomará 2-5 minutos según Internet
  - Verás progreso en pantalla

- [ ] **Entrar al directorio**
  ```bash
  cd ChatBotDysa
  ```

---

## ⚙️ PASO 3: CONFIGURACIÓN INICIAL

- [ ] **Copiar archivo de configuración**
  ```bash
  cp .env.example .env
  ```

- [ ] **Abrir archivo .env** (opcional - solo para personalización)
  - Con cualquier editor de texto
  - Modificar variables si es necesario:
    - `RESTAURANT_NAME=` (nombre de tu restaurante)
    - `RESTAURANT_PHONE=` (teléfono)
    - `RESTAURANT_EMAIL=` (email)

- [ ] **Guardar cambios** (si modificaste .env)

---

## 🚀 PASO 4: INSTALAR CHATBOTDYSA

### En Windows:

- [ ] **Ejecutar instalador de Windows**
  ```bash
  .\scripts\install-windows.bat
  ```

### En macOS/Linux:

- [ ] **Dar permisos al script**
  ```bash
  chmod +x scripts/install-macos.sh
  ```

- [ ] **Ejecutar instalador**
  ```bash
  ./scripts/install-macos.sh
  ```

### Durante la Instalación:

- [ ] **Esperar a que termine** (10-15 minutos)

- [ ] **Monitorear mensajes en pantalla:**
  - ☑ "Construyendo contenedores Docker..."
  - ☑ "Descargando dependencias..."
  - ☑ "Iniciando servicios..."
  - ☑ "ChatBotDysa instalado exitosamente!"

- [ ] **Anotar URLs de acceso** mostradas al final:
  ```
  Panel Admin: http://localhost:7001
  Landing Page: http://localhost:3004
  API Backend: http://localhost:8005
  ```

---

## ✅ PASO 5: VERIFICACIÓN

### Verificar Docker

- [ ] **Abrir Docker Desktop**

- [ ] **Ver contenedores corriendo**
  - Debe mostrar 6 contenedores:
    - ☑ chatbotdysa-admin (healthy)
    - ☑ chatbotdysa-backend (healthy)
    - ☑ chatbotdysa-landing (healthy)
    - ☑ chatbotdysa-postgres (healthy)
    - ☑ chatbotdysa-ollama (Up)
    - ☑ chatbotdysa-redis (Up)

### Verificar Panel de Administración

- [ ] **Abrir navegador web**

- [ ] **Ir a:** `http://localhost:7001`

- [ ] **Debe mostrar pantalla de login**
  - Si muestra error, espera 2-3 minutos más

- [ ] **Iniciar sesión con credenciales por defecto:**
  - Usuario: `admin@restaurante.com`
  - Contraseña: `admin123`

- [ ] **Debe cargar el Dashboard**

### Verificar Landing Page

- [ ] **Abrir nueva pestaña**

- [ ] **Ir a:** `http://localhost:3004`

- [ ] **Debe mostrar landing page del restaurante**

### Verificar API Backend

- [ ] **Abrir nueva pestaña**

- [ ] **Ir a:** `http://localhost:8005/health`

- [ ] **Debe mostrar JSON:**
  ```json
  {
    "success": true,
    "data": {
      "status": "ok"
    }
  }
  ```

---

## 🔐 PASO 6: CONFIGURACIÓN INICIAL

### Cambiar Contraseña

- [ ] **En el Dashboard, click en tu nombre** (esquina superior derecha)

- [ ] **Seleccionar "Mi Perfil"**

- [ ] **Click en "Cambiar Contraseña"**

- [ ] **Ingresar:**
  - Contraseña actual: `admin123`
  - Nueva contraseña: (elegir una segura)
  - Confirmar nueva contraseña

- [ ] **Click en "Guardar Cambios"**

- [ ] **Anotar nueva contraseña en lugar seguro**

### Configurar Datos del Restaurante

- [ ] **Ir a:** Configuración → General

- [ ] **Completar:**
  - Nombre del restaurante
  - Dirección
  - Teléfono(s)
  - Email de contacto
  - Horarios de atención

- [ ] **Click en "Guardar"**

### Subir Logo

- [ ] **Ir a:** Configuración → Apariencia

- [ ] **Click en "Subir Logo"**

- [ ] **Seleccionar archivo** (PNG o JPG, máx 2 MB)

- [ ] **Ajustar recorte** si es necesario

- [ ] **Click en "Guardar"**

---

## 📋 PASO 7: CONFIGURACIÓN BÁSICA DEL MENÚ

### Crear Categorías

- [ ] **Ir a:** Menú → Categorías

- [ ] **Crear categorías básicas:**
  - ☐ Entradas
  - ☐ Platos Principales
  - ☐ Postres
  - ☐ Bebidas

### Agregar Primeros Productos

- [ ] **Ir a:** Menú → Productos

- [ ] **Click en "Nuevo Producto"**

- [ ] **Agregar al menos 3 productos de ejemplo:**

  **Producto 1:**
  - [ ] Nombre
  - [ ] Descripción
  - [ ] Categoría
  - [ ] Precio
  - [ ] Imagen (opcional)
  - [ ] Click en "Guardar"

  **Producto 2:**
  - [ ] (Repetir proceso)

  **Producto 3:**
  - [ ] (Repetir proceso)

---

## 🤖 PASO 8: CONFIGURAR CHATBOT

### Información Básica

- [ ] **Ir a:** Configuración → Chatbot

- [ ] **Completar:**
  - Nombre del bot (ej. "AsistenteBot")
  - Mensaje de bienvenida
  - Horarios de atención

- [ ] **Click en "Guardar"**

### Agregar FAQs Básicas

- [ ] **Click en pestaña "FAQ"**

- [ ] **Agregar preguntas frecuentes:**

  **FAQ 1 - Horarios:**
  - [ ] Pregunta: "¿Cuál es el horario?"
  - [ ] Respuesta: (Tus horarios)

  **FAQ 2 - Dirección:**
  - [ ] Pregunta: "¿Dónde están ubicados?"
  - [ ] Respuesta: (Tu dirección)

  **FAQ 3 - Delivery:**
  - [ ] Pregunta: "¿Hacen delivery?"
  - [ ] Respuesta: (Sí/No y condiciones)

- [ ] **Click en "Guardar Cambios"**

---

## 🌐 PASO 9: PERSONALIZAR LANDING PAGE

### Contenido Principal

- [ ] **Ir a:** Configuración → Landing Page

- [ ] **Sección Hero:**
  - [ ] Título principal
  - [ ] Subtítulo
  - [ ] Imagen destacada
  - [ ] Botón CTA (ej. "Ver Menú")

- [ ] **Sección Sobre Nosotros:**
  - [ ] Historia del restaurante
  - [ ] Misión/valores
  - [ ] Fotos del local

- [ ] **Sección Contacto:**
  - [ ] Dirección
  - [ ] Teléfono
  - [ ] Email
  - [ ] Mapa (se genera automático)

- [ ] **Click en "Guardar Cambios"**

### Estilo y Colores

- [ ] **Pestaña "Apariencia"**

- [ ] **Seleccionar tema:** (Elegante / Casual / Moderno / Tradicional)

- [ ] **Personalizar colores:**
  - [ ] Color primario
  - [ ] Color secundario

- [ ] **Click en "Guardar"**

---

## 🧪 PASO 10: PRUEBAS FINALES

### Prueba de Pedido

- [ ] **Crear un pedido de prueba:**
  - [ ] Ir a: Pedidos → Nuevo Pedido
  - [ ] Agregar cliente de prueba
  - [ ] Agregar 2-3 productos
  - [ ] Configurar tipo de entrega
  - [ ] Click en "Crear Pedido"

- [ ] **Verificar que aparece en lista de pendientes**

- [ ] **Cambiar estado del pedido:**
  - [ ] A "En Proceso"
  - [ ] A "Listo"
  - [ ] A "Completado"

### Prueba de Reserva

- [ ] **Crear una reserva de prueba:**
  - [ ] Ir a: Reservas → Nueva Reserva
  - [ ] Ingresar datos del cliente
  - [ ] Seleccionar fecha y hora
  - [ ] Número de personas
  - [ ] Click en "Crear Reserva"

- [ ] **Verificar que aparece en calendario**

### Prueba de Chatbot

- [ ] **Abrir landing page:** `http://localhost:3004`

- [ ] **Click en el widget del chatbot** (esquina inferior derecha)

- [ ] **Escribir mensaje de prueba:** "Hola"

- [ ] **Verificar que el bot responde**

- [ ] **Hacer una pregunta sobre horarios**

- [ ] **Verificar respuesta del bot**

---

## ✅ CHECKLIST FINAL

### Sistema

- [ ] Docker Desktop corriendo
- [ ] 6 contenedores saludables (healthy/Up)
- [ ] Panel admin accesible
- [ ] Landing page accesible
- [ ] API respondiendo

### Configuración

- [ ] Contraseña cambiada
- [ ] Datos del restaurante configurados
- [ ] Logo subido
- [ ] Horarios configurados

### Contenido

- [ ] Al menos 4 categorías creadas
- [ ] Al menos 3 productos agregados
- [ ] Al menos 3 FAQs configuradas
- [ ] Landing page personalizada

### Pruebas

- [ ] Pedido de prueba creado y procesado
- [ ] Reserva de prueba creada
- [ ] Chatbot respondiendo

---

## 🎉 ¡INSTALACIÓN COMPLETADA!

### Próximos Pasos

1. **Agregar más productos al menú**
2. **Configurar zonas de delivery** (si aplica)
3. **Configurar métodos de pago**
4. **Agregar más FAQs al chatbot**
5. **Capacitar al personal** en el uso del sistema
6. **Promocionar** la nueva landing page y chatbot

### Recursos Útiles

📖 **Manual de Usuario Completo**
- Incluido en la instalación
- Archivo: `MANUAL_USUARIO_RESTAURANTES.pdf`

🎥 **Videos Tutoriales**
- YouTube: youtube.com/@ChatBotDysa
- Duración: 3-5 min cada uno

💬 **Soporte**
- Email: support@chatbotdysa.com
- Chat: www.chatbotdysa.com/soporte
- WhatsApp: +56 9 XXXX XXXX

---

## 🔧 COMANDOS ÚTILES

### Iniciar Sistema

```bash
cd ChatBotDysa
docker-compose up -d
```

### Detener Sistema

```bash
docker-compose down
```

### Ver Logs

```bash
docker-compose logs -f
```

### Actualizar Sistema

```bash
git pull
docker-compose down
docker-compose up -d --build
```

---

## 📞 ¿NECESITAS AYUDA?

### Problemas Comunes

**"No puedo acceder a localhost:7001"**
→ Espera 3-5 minutos después de iniciar
→ Verifica que Docker esté corriendo

**"Docker dice que no hay espacio"**
→ Libera 10 GB en tu disco
→ Borra contenedores viejos en Docker Desktop

**"Olvidé mi contraseña"**
→ Click en "¿Olvidaste tu contraseña?" en login
→ O contacta soporte para reset manual

### Contacto de Emergencia

📧 **Email:** support@chatbotdysa.com

💬 **Chat en Vivo:** www.chatbotdysa.com/soporte
   - Lunes a Viernes: 9:00 - 18:00

📱 **WhatsApp:** +56 9 XXXX XXXX
   - Solo emergencias
   - Lunes a Viernes: 9:00 - 18:00

---

## 📝 NOTAS Y OBSERVACIONES

Usa este espacio para anotar cualquier información importante durante la instalación:

```
_________________________________________________________________

_________________________________________________________________

_________________________________________________________________

_________________________________________________________________

_________________________________________________________________

_________________________________________________________________

_________________________________________________________________
```

---

**Fecha de instalación:** _____ / _____ / _________

**Instalado por:** _______________________________

**Versión instalada:** ChatBotDysa Enterprise v1.0

**Sistema operativo:** ☐ Windows  ☐ macOS  ☐ Linux

---

*Checklist de Instalación - ChatBotDysa Enterprise*
*Versión 1.0 - 2025-10-04*
*Todos los derechos reservados © 2025*

---

## 🖨️ INSTRUCCIONES DE IMPRESIÓN

- **Formato:** A4
- **Orientación:** Vertical
- **Color:** Preferible (pero funciona en blanco y negro)
- **Páginas:** Imprimir ambas caras (ahorra papel)
- **Encuadernado:** Engrapar en esquina superior izquierda
- **Copias:** 2 recomendadas (una para instalador, una para archivo)
