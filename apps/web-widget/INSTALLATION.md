# 🚀 Instalación del ChatBot Dysa Widget

## 📋 Requisitos Previos

- Un sitio web con acceso al código HTML
- Backend de ChatBotDysa corriendo (puerto 8005 por defecto)
- Navegador moderno con soporte para ES6+

---

## 🔧 Método 1: Instalación Básica (CDN Local)

### Paso 1: Copiar archivos a tu servidor

Copia los siguientes archivos a tu servidor web:

```
/tu-servidor/chatbot/
  ├── dysabot-widget.min.js
  ├── dysabot-widget.min.css
  └── dysabot-widget.min.js.LICENSE.txt
```

### Paso 2: Agregar al HTML

Agrega el siguiente código antes del cierre de `</body>` en tu página HTML:

```html
<!-- ChatBot Dysa Widget -->
<link rel="stylesheet" href="/chatbot/dysabot-widget.min.css">
<script src="/chatbot/dysabot-widget.min.js"></script>
<script>
  // Inicializar el widget
  const widget = new DysaBotWidget({
    apiUrl: 'http://localhost:8005',  // URL de tu backend
    restaurantId: 'tu-restaurante-id',
    position: 'bottom-right',          // 'bottom-right' | 'bottom-left'
    theme: 'purple',                   // 'purple' | 'blue' | 'green'
    language: 'es',                    // 'es' | 'en' | 'pt'
    enableImageUpload: true,
    enableFileUpload: true,
    enableGeolocation: true
  });
</script>
```

---

## ⚡ Método 2: Instalación desde npm (Avanzada)

### Paso 1: Instalar paquete

```bash
npm install @chatbotdysa/web-widget
```

### Paso 2: Importar en tu aplicación

```javascript
import DysaBotWidget from '@chatbotdysa/web-widget';
import '@chatbotdysa/web-widget/dist/dysabot-widget.min.css';

const widget = new DysaBotWidget({
  apiUrl: process.env.REACT_APP_API_URL,
  restaurantId: 'tu-restaurante-id'
});
```

---

## 🎨 Configuración Avanzada

### Opciones Disponibles

```javascript
{
  // Conexión
  apiUrl: 'http://localhost:8005',      // URL del backend (REQUERIDO)
  restaurantId: 'demo',                  // ID del restaurante (REQUERIDO)

  // Apariencia
  position: 'bottom-right',              // Posición del botón
  theme: 'purple',                       // Tema de colores

  // Idioma
  language: null,                        // null = auto-detectar, 'es', 'en', 'pt'

  // Funcionalidades
  enableImageUpload: true,               // Permitir envío de imágenes
  enableFileUpload: true,                // Permitir envío de archivos
  enableGeolocation: true,               // Permitir compartir ubicación

  // Restricciones
  maxFileSize: 10485760,                 // Tamaño máximo de archivo (10MB)
  allowedFileTypes: [                    // Tipos de archivo permitidos
    'image/*',
    'application/pdf',
    '.doc',
    '.docx'
  ]
}
```

### Temas Disponibles

```javascript
// Tema Púrpura (por defecto)
theme: 'purple'

// Tema Azul
theme: 'blue'

// Tema Verde
theme: 'green'
```

### Posiciones del Botón

```javascript
position: 'bottom-right'  // Esquina inferior derecha (por defecto)
position: 'bottom-left'   // Esquina inferior izquierda
```

---

## 🌐 Ejemplo Completo

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mi Restaurante</title>

  <!-- ChatBot Dysa CSS -->
  <link rel="stylesheet" href="https://cdn.tudominio.com/chatbot/dysabot-widget.min.css">
</head>
<body>

  <!-- Tu contenido aquí -->
  <h1>Bienvenido a Mi Restaurante</h1>

  <!-- ChatBot Dysa Script -->
  <script src="https://cdn.tudominio.com/chatbot/dysabot-widget.min.js"></script>
  <script>
    // Configuración del widget
    const chatbot = new DysaBotWidget({
      apiUrl: 'https://api.tudominio.com',
      restaurantId: 'restaurante-123',
      position: 'bottom-right',
      theme: 'purple',
      language: 'es',
      enableImageUpload: true,
      enableFileUpload: false,
      enableGeolocation: true
    });

    // Opcional: Acceder a métodos del widget
    // chatbot.open();   // Abrir el chat programáticamente
    // chatbot.close();  // Cerrar el chat
    // chatbot.reset();  // Reiniciar la conversación
  </script>
</body>
</html>
```

---

## 🔒 Configuración de Seguridad

### CORS en el Backend

Asegúrate de configurar CORS en tu backend para permitir peticiones desde tu dominio:

```typescript
// backend/src/main.ts
app.enableCors({
  origin: [
    'https://tudominio.com',
    'https://www.tudominio.com'
  ],
  credentials: true
});
```

### HTTPS Recomendado

Para producción, usa HTTPS tanto en el widget como en el backend:

```javascript
{
  apiUrl: 'https://api.tudominio.com'  // Usar HTTPS
}
```

---

## 🧪 Modo de Prueba

Para probar el widget localmente:

```javascript
const widget = new DysaBotWidget({
  apiUrl: 'http://localhost:8005',
  restaurantId: 'demo',
  // ... otras opciones
});
```

---

## 📱 Responsive Design

El widget es completamente responsive y se adapta automáticamente a:

- 📱 Móviles (< 768px)
- 📱 Tablets (768px - 1024px)
- 💻 Desktop (> 1024px)

---

## 🎯 Eventos Personalizados

Puedes escuchar eventos del widget:

```javascript
const widget = new DysaBotWidget({ /* config */ });

// El widget no expone eventos públicamente todavía
// Esta funcionalidad se agregará en versiones futuras
```

---

## 🐛 Solución de Problemas

### El widget no aparece

1. Verifica que los archivos CSS y JS estén correctamente cargados
2. Revisa la consola del navegador para errores
3. Asegúrate de que el backend esté corriendo

### No se envían mensajes

1. Verifica que `apiUrl` apunte al backend correcto
2. Revisa la configuración de CORS
3. Verifica que el backend esté accesible desde el navegador

### Errores de conexión

1. Asegúrate de que Socket.IO esté habilitado en el backend
2. Verifica que no haya firewall bloqueando la conexión
3. Revisa los logs del backend

---

## 📦 Tamaño del Bundle

- **JavaScript:** ~76 KB (minificado)
- **CSS:** ~11 KB (minificado)
- **Total:** ~87 KB

---

## 🔄 Actualización

Para actualizar el widget:

1. Descarga la nueva versión de los archivos
2. Reemplaza los archivos antiguos
3. Limpia el caché del navegador (Ctrl + F5)

---

## 📞 Soporte

Para soporte técnico:

- 📧 Email: soporte@dysadev.com
- 📖 Documentación: https://docs.chatbotdysa.com
- 🐛 Issues: https://github.com/dysadev/chatbotdysa/issues

---

## 📄 Licencia

MIT License - Ver LICENSE.txt para más detalles

---

## 🚀 Próximas Características

- [ ] Eventos personalizados
- [ ] Temas personalizados
- [ ] Modo oscuro automático
- [ ] Integración con Google Analytics
- [ ] Notificaciones push
- [ ] Historial de conversaciones persistente
- [ ] Soporte para múltiples idiomas simultáneos
