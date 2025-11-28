# GUIÓN VIDEO TUTORIAL - INSTALACIÓN CHATBOTDYSA
## Material de Soporte para Restaurantes

---

**📅 Fecha creación:** 2025-10-04
**⏰ Hora:** 19:54:04
**🎯 Propósito:** Guía visual para instalación de ChatBotDysa en restaurantes
**⏱️ Duración estimada:** 15-20 minutos
**👥 Audiencia:** Dueños de restaurantes, personal técnico

---

## 🎬 ESTRUCTURA DEL VIDEO

### Duración Total: ~18 minutos

**Segmento 1:** Introducción (2 min)
**Segmento 2:** Pre-requisitos (3 min)
**Segmento 3:** Instalación (8 min)
**Segmento 4:** Verificación (3 min)
**Segmento 5:** Primeros Pasos (2 min)

---

## 📝 GUIÓN COMPLETO

### SEGMENTO 1: INTRODUCCIÓN (0:00 - 2:00)

#### [PANTALLA: Logo ChatBotDysa + Música de fondo suave]

**NARRADOR:**
"Bienvenidos al tutorial de instalación de ChatBotDysa Enterprise, el sistema completo de gestión y asistente virtual para restaurantes."

#### [PANTALLA: Transición a captura de pantalla del sistema funcionando]

**NARRADOR:**
"En este video aprenderás a instalar ChatBotDysa en tu computadora en menos de 20 minutos. ChatBotDysa incluye tres componentes principales:"

#### [PANTALLA: Mostrar los 3 componentes con íconos]

**TEXTO EN PANTALLA:**
```
1. Panel de Administración - Gestión completa del restaurante
2. Landing Page - Presencia web profesional
3. Asistente IA - Chatbot inteligente para atención al cliente
```

**NARRADOR:**
"Todo esto en un solo paquete, fácil de instalar y usar."

#### [PANTALLA: Vista previa del resultado final]

**NARRADOR:**
"Al finalizar este tutorial, tendrás ChatBotDysa funcionando completamente en tu computadora. ¡Comencemos!"

---

### SEGMENTO 2: PRE-REQUISITOS (2:00 - 5:00)

#### [PANTALLA: Título "Pre-requisitos"]

**NARRADOR:**
"Antes de comenzar, necesitas tener instalados dos programas en tu computadora: Docker Desktop y Git."

#### [PANTALLA: Mostrar logo de Docker Desktop]

**TEXTO EN PANTALLA:**
```
Docker Desktop
Descarga: docker.com/products/docker-desktop
```

**NARRADOR:**
"Docker Desktop es una plataforma que permite ejecutar aplicaciones en contenedores. Es gratuito para uso personal y educativo."

#### [PANTALLA: Demostrar descarga e instalación rápida de Docker Desktop]

**NARRADOR:**
"Visita docker.com/products/docker-desktop, descarga la versión para tu sistema operativo - ya sea Windows, Mac o Linux - e instálalo siguiendo las instrucciones en pantalla."

#### [PANTALLA: Verificar Docker instalado - terminal con `docker --version`]

**TEXTO EN PANTALLA:**
```bash
$ docker --version
Docker version 24.0.0
```

**NARRADOR:**
"Para verificar que Docker está instalado correctamente, abre una terminal y escribe 'docker --version'. Deberías ver la versión instalada."

#### [PANTALLA: Mostrar logo de Git]

**TEXTO EN PANTALLA:**
```
Git
Descarga: git-scm.com
```

**NARRADOR:**
"El segundo requisito es Git, un sistema de control de versiones. Descárgalo de git-scm.com e instálalo."

#### [PANTALLA: Verificar Git - terminal con `git --version`]

**TEXTO EN PANTALLA:**
```bash
$ git --version
git version 2.40.0
```

**NARRADOR:**
"Verifica la instalación con 'git --version' en la terminal."

#### [PANTALLA: Checklist en pantalla]

**TEXTO EN PANTALLA:**
```
✅ Docker Desktop instalado y corriendo
✅ Git instalado
✅ Al menos 4 GB de RAM disponible
✅ 10 GB de espacio en disco
```

**NARRADOR:**
"Asegúrate también de tener al menos 4 GB de RAM disponible y 10 GB de espacio libre en disco."

---

### SEGMENTO 3: INSTALACIÓN (5:00 - 13:00)

#### [PANTALLA: Terminal/Línea de comandos]

**NARRADOR:**
"Ahora sí, comenzamos con la instalación. Primero, abrimos una terminal o línea de comandos."

#### [PANTALLA: Demostrar cómo abrir terminal en Windows/Mac/Linux]

**NARRADOR:**
"En Windows, presiona Windows + R, escribe 'cmd' y presiona Enter. En Mac, presiona Command + Espacio, escribe 'Terminal' y presiona Enter. En Linux, presiona Ctrl + Alt + T."

#### PASO 1: Descargar ChatBotDysa

**TEXTO EN PANTALLA:**
```bash
git clone https://github.com/tuempresa/ChatBotDysa.git
cd ChatBotDysa
```

**NARRADOR:**
"Vamos a descargar ChatBotDysa desde GitHub. Copia este comando: 'git clone' seguido de la URL del repositorio. Luego presiona Enter."

#### [PANTALLA: Mostrar descarga en progreso]

**NARRADOR:**
"La descarga tomará unos minutos dependiendo de tu conexión a internet. Verás el progreso en pantalla."

#### [PANTALLA: Descarga completada, cambiar al directorio]

**NARRADOR:**
"Una vez completada la descarga, entramos al directorio con 'cd ChatBotDysa'."

#### PASO 2: Configuración Inicial

**TEXTO EN PANTALLA:**
```bash
cp .env.example .env
```

**NARRADOR:**
"Ahora copiamos el archivo de configuración de ejemplo con este comando: 'cp .env.example .env'. Este archivo contiene las configuraciones necesarias."

#### [PANTALLA: Mostrar archivo .env abierto]

**NARRADOR:**
"Si deseas personalizar la configuración, puedes abrir el archivo .env con cualquier editor de texto. Por ahora, la configuración predeterminada funciona perfectamente."

#### PASO 3: Ejecutar el Instalador

**NARRADOR:**
"Ahora ejecutamos el instalador automático. ChatBotDysa detectará tu sistema operativo y ejecutará el script apropiado."

#### [PANTALLA: Ejecutar script de instalación]

**En macOS/Linux:**
```bash
./scripts/install-macos.sh
```

**En Windows:**
```bash
.\scripts\install-windows.bat
```

**NARRADOR:**
"En Mac o Linux, escribe './scripts/install-macos.sh'. En Windows, escribe punto-barra-invertida-scripts-barra-invertida-install-windows.bat"

#### [PANTALLA: Instalación en progreso]

**TEXTO EN PANTALLA:**
```
🔧 Instalando ChatBotDysa Enterprise...
⏳ Construyendo contenedores Docker...
📦 Descargando dependencias...
```

**NARRADOR:**
"La instalación tomará entre 10 y 15 minutos. Verás mensajes en pantalla indicando el progreso:"

#### [PANTALLA: Mostrar los diferentes pasos]

**NARRADOR:**
"Primero se construyen los contenedores Docker... luego se descargan las dependencias necesarias... y finalmente se inician todos los servicios."

#### [PANTALLA: Instalación completada]

**TEXTO EN PANTALLA:**
```
✅ ChatBotDysa instalado exitosamente!

🌐 URLs de acceso:
- Panel Admin: http://localhost:7001
- Landing Page: http://localhost:3004
- API Backend: http://localhost:8005

✨ ¡Todo listo para usar!
```

**NARRADOR:**
"Cuando veas este mensaje, la instalación ha sido exitosa. Toma nota de las URLs de acceso - las necesitarás para acceder al sistema."

---

### SEGMENTO 4: VERIFICACIÓN (13:00 - 16:00)

#### [PANTALLA: Navegador web]

**NARRADOR:**
"Ahora verificamos que todo esté funcionando correctamente. Abre tu navegador favorito - Chrome, Firefox, Safari o Edge."

#### Verificación 1: Panel de Administración

**TEXTO EN PANTALLA:**
```
http://localhost:7001
```

**NARRADOR:**
"Escribe en la barra de direcciones: 'http://localhost:7001'. Deberías ver la pantalla de inicio de sesión del Panel de Administración."

#### [PANTALLA: Pantalla de login del admin panel]

**NARRADOR:**
"Esta es la interfaz principal donde gestionarás tu restaurante: menú, pedidos, reservas y más."

#### Verificación 2: Landing Page

**TEXTO EN PANTALLA:**
```
http://localhost:3004
```

**NARRADOR:**
"Ahora verifica la Landing Page en 'http://localhost:3004'."

#### [PANTALLA: Landing page del restaurante]

**NARRADOR:**
"Esta es la página web pública de tu restaurante. Tus clientes la verán cuando busquen tu negocio en línea."

#### Verificación 3: API Backend

**TEXTO EN PANTALLA:**
```
http://localhost:8005/health
```

**NARRADOR:**
"Por último, verificamos que el backend esté funcionando visitando 'http://localhost:8005/health'."

#### [PANTALLA: Respuesta JSON del health check]

**TEXTO EN PANTALLA:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "ChatBotDysa Backend API"
  }
}
```

**NARRADOR:**
"Si ves este mensaje JSON indicando 'status: ok', todo está funcionando correctamente."

#### Verificación Docker

**NARRADOR:**
"También puedes verificar el estado en Docker Desktop."

#### [PANTALLA: Docker Desktop mostrando contenedores]

**TEXTO EN PANTALLA:**
```
chatbotdysa-admin      (healthy) ✅
chatbotdysa-backend    (healthy) ✅
chatbotdysa-landing    (healthy) ✅
chatbotdysa-postgres   (healthy) ✅
chatbotdysa-ollama     Up ✅
chatbotdysa-redis      Up ✅
```

**NARRADOR:**
"Abre Docker Desktop y verifica que todos los contenedores estén marcados como 'healthy' o 'Up'. Deberías ver seis contenedores corriendo."

---

### SEGMENTO 5: PRIMEROS PASOS (16:00 - 18:00)

#### [PANTALLA: Panel de administración - Login]

**NARRADOR:**
"¡Felicidades! ChatBotDysa está instalado y funcionando. Ahora veamos los primeros pasos."

#### Acceso Inicial

**TEXTO EN PANTALLA:**
```
Usuario por defecto: admin@restaurante.com
Contraseña: admin123
```

**NARRADOR:**
"Para tu primer acceso, usa estas credenciales: 'admin@restaurante.com' como usuario y 'admin123' como contraseña."

#### [PANTALLA: Dashboard principal]

**NARRADOR:**
"Una vez dentro, verás el dashboard principal con estadísticas de tu restaurante."

#### Configuración Rápida

**TEXTO EN PANTALLA:**
```
Próximos pasos:
1. Cambiar contraseña por defecto
2. Configurar datos del restaurante
3. Agregar productos al menú
4. Personalizar la landing page
5. Probar el chatbot
```

**NARRADOR:**
"Te recomendamos seguir estos pasos:"

**NARRADOR:**
"Primero, cambia la contraseña por defecto por seguridad. Luego configura los datos de tu restaurante como nombre, dirección y horarios. Después agrega tus productos al menú. Personaliza la landing page con tus colores y logo. Y finalmente, prueba el chatbot para ver cómo interactuará con tus clientes."

#### Soporte y Recursos

**TEXTO EN PANTALLA:**
```
📚 Recursos adicionales:
- Manual de Usuario Completo
- Guía de Configuración Avanzada
- Preguntas Frecuentes (FAQ)
- Soporte técnico: support@chatbotdysa.com
```

**NARRADOR:**
"Para más información, consulta el Manual de Usuario Completo incluido con el sistema. Si tienes problemas, escríbenos a support@chatbotdysa.com"

#### [PANTALLA: Logo ChatBotDysa + Contacto]

**NARRADOR:**
"Gracias por elegir ChatBotDysa. ¡Que tengas éxito con tu restaurante digital!"

**TEXTO EN PANTALLA:**
```
ChatBotDysa Enterprise
Tu restaurante, digitalizado.

🌐 www.chatbotdysa.com
📧 support@chatbotdysa.com
📱 Síguenos en redes sociales
```

---

## 🎨 NOTAS DE PRODUCCIÓN

### Estilo Visual
- **Paleta de colores:** Colores corporativos de ChatBotDysa (azul primario, blanco, grises)
- **Tipografía:** Sans-serif moderna, legible en tamaños pequeños
- **Música:** Background suave, no intrusiva, sin copyright
- **Velocidad:** Pausada, permitiendo seguir paso a paso

### Elementos Visuales
- **Flechas y highlights:** Para señalar botones y áreas importantes
- **Zoom in/out:** En momentos clave para mejor visibilidad
- **Picture-in-picture:** Mostrar terminal y navegador simultáneamente cuando sea necesario
- **Subtítulos:** Incluir subtítulos en español (y opcionalmente inglés)

### Capturas de Pantalla
- **Resolución:** 1920x1080 mínimo
- **Sistema operativo:** Demostrar en Windows 11 (más común en restaurantes)
- **Navegador:** Chrome (más utilizado)
- **Limpiar pantalla:** Sin notificaciones ni elementos distractores

### Audio
- **Narración:** Voz clara, pausada, amigable
- **Música de fondo:** 20-30% volumen respecto a narración
- **Efectos de sonido:** Sutiles, solo para transiciones importantes

---

## 📋 CHECKLIST PRE-PRODUCCIÓN

- [ ] Script revisado y aprobado
- [ ] Ambiente de prueba preparado (Windows, Mac, Linux)
- [ ] Docker Desktop instalado en máquinas de demo
- [ ] Screenshots y screencasts capturados
- [ ] Voz del narrador grabada
- [ ] Música de fondo seleccionada (sin copyright)
- [ ] Software de edición configurado
- [ ] Subtítulos preparados
- [ ] Logo y gráficos en alta resolución

---

## 🎬 POST-PRODUCCIÓN

### Edición
- [ ] Ensamblar segmentos
- [ ] Ajustar timing entre narraciones
- [ ] Agregar música de fondo
- [ ] Insertar transiciones suaves
- [ ] Agregar texto en pantalla
- [ ] Aplicar highlights y flechas
- [ ] Sincronizar subtítulos

### Exportación
- [ ] Formato: MP4 (H.264)
- [ ] Resolución: 1920x1080 (Full HD)
- [ ] Frame rate: 30 fps
- [ ] Bitrate: 8-10 Mbps
- [ ] Audio: AAC, 192 kbps

### Distribución
- [ ] Subir a YouTube (público o unlisted)
- [ ] Subir a Vimeo (backup)
- [ ] Incluir en documentación del proyecto
- [ ] Compartir con equipo comercial
- [ ] Enviar a clientes potenciales

---

## 📊 MÉTRICAS DE ÉXITO

### KPIs del Video
- **Retención:** Meta > 70% de viewers completan el video
- **Engagement:** Likes/Dislikes ratio > 95%
- **Conversión:** % de viewers que instalan después de ver
- **Feedback:** Comentarios y preguntas

### Iteraciones
- Recopilar feedback después de primeras 50 views
- Ajustar timing si hay puntos de drop-off
- Agregar aclaraciones si hay preguntas frecuentes
- Crear versiones cortas (5 min) para redes sociales

---

## 🌍 VERSIONES ADICIONALES

### Idiomas
- [ ] Español (principal) ✅
- [ ] Inglés
- [ ] Portugués (Brasil)

### Longitud
- [ ] Versión completa (18 min)
- [ ] Versión resumida (8 min)
- [ ] Quick start (3 min)
- [ ] Shorts para redes sociales (60 seg)

### Plataformas
- [ ] Versión horizontal (YouTube, Vimeo)
- [ ] Versión vertical (TikTok, Instagram, YouTube Shorts)
- [ ] Versión cuadrada (Facebook, LinkedIn)

---

**📅 Creado:** 2025-10-04 19:54:04
**📝 Versión:** 1.0
**👤 Autor:** ChatBotDysa Team
**✅ Estado:** Listo para producción

---

*Guión de video tutorial - ChatBotDysa Enterprise*
*Material de soporte para clientes*
