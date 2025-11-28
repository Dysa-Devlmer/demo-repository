# 📊 Analytics Setup Guide

Este documento explica cómo configurar Google Analytics 4, Meta Pixel y Hotjar para ChatBotDysa.

## 🎯 Paso 1: Google Analytics 4 (GA4)

### Crear cuenta y propiedad:

1. Ve a [Google Analytics](https://analytics.google.com)
2. Crea una cuenta nueva (o usa una existente)
3. Crea una propiedad nueva:
   - Nombre: "ChatBotDysa Website"
   - Zona horaria: Chile (GMT-3)
   - Moneda: CLP (Peso Chileno)
4. En "Flujo de datos web", haz clic en "Agregar flujo"
5. Ingresa:
   - URL: `https://chatbotdysa.cl`
   - Nombre del flujo: "ChatBotDysa Landing"
6. Copia el **ID de medición** (formato: `G-XXXXXXXXXX`)

### Configurar en el proyecto:

```bash
cd apps/website
cp .env.local.example .env.local
```

Edita `.env.local` y agrega:
```
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## 📘 Paso 2: Meta Pixel (Facebook Pixel)

### Crear Pixel:

1. Ve a [Facebook Business Manager](https://business.facebook.com)
2. Ve a **Herramientas comerciales** → **Administrador de eventos**
3. Haz clic en **Conectar orígenes de datos** → **Web** → **Facebook Pixel**
4. Nombra tu pixel: "ChatBotDysa Website"
5. No uses "Configuración de Partner" - elige "Instalar código manualmente"
6. Copia el **ID del pixel** (número de 15-16 dígitos)

### Configurar en el proyecto:

Edita `.env.local` y agrega:
```
NEXT_PUBLIC_META_PIXEL_ID=000000000000000
```

### Eventos importantes a trackear:

El componente ya trackea automáticamente:
- `PageView` - Vista de página
- Puedes agregar eventos personalizados para:
  - Click en "Pide tu Demo" → `Lead`
  - Envío de formulario → `CompleteRegistration`
  - Click en planes → `ViewContent`

---

## 🔥 Paso 3: Hotjar (Opcional - Heatmaps)

### Crear cuenta:

1. Ve a [Hotjar](https://www.hotjar.com)
2. Crea una cuenta gratis (hasta 35 sesiones/día)
3. Agrega un nuevo sitio:
   - URL: `https://chatbotdysa.cl`
   - Nombre: "ChatBotDysa Landing"
4. Copia el **Site ID** (número de 7 dígitos)

### Configurar en el proyecto:

Edita `.env.local` y agrega:
```
NEXT_PUBLIC_HOTJAR_ID=0000000
```

### Funcionalidades de Hotjar:

- **Heatmaps**: Ve dónde hacen click los usuarios
- **Recordings**: Mira sesiones grabadas de usuarios
- **Surveys**: Crea encuestas en el sitio
- **Feedback**: Widget de feedback

---

## ✅ Paso 4: Verificar instalación

1. Reinicia el servidor de desarrollo:
```bash
npm run dev
```

2. Abre tu navegador en `http://localhost:6001`

3. Abre DevTools → Console y busca:
   - `gtag` - Google Analytics cargado
   - `fbq` - Meta Pixel cargado
   - `hj` - Hotjar cargado

4. Verifica en tiempo real:
   - **GA4**: Analytics → Informes → Tiempo real
   - **Meta Pixel**: Events Manager → Test Events
   - **Hotjar**: Dashboard → Recordings

---

## 🚀 Eventos personalizados recomendados

### Para GA4:

```javascript
// En el botón "Pide tu Demo"
gtag('event', 'generate_lead', {
  'currency': 'CLP',
  'value': 99990
});
```

### Para Meta Pixel:

```javascript
// En el formulario de registro
fbq('track', 'Lead', {
  currency: 'CLP',
  value: 99990
});
```

---

## 📈 KPIs importantes a medir:

1. **Tráfico**:
   - Visitas totales
   - Usuarios únicos
   - Duración promedio de sesión

2. **Conversión**:
   - Click en "Pide tu Demo"
   - Envíos de formulario
   - Tasa de conversión (%)

3. **Comportamiento**:
   - Scroll depth (qué tan abajo llegan)
   - Clicks en secciones (Features, Pricing, Testimonials)
   - Tasa de rebote

4. **Fuentes**:
   - Orgánico (Google)
   - Directo
   - Redes sociales
   - Referencias

---

## 🔒 Privacidad y GDPR

Considera agregar un banner de cookies:

```bash
npm install react-cookie-consent
```

O usa un servicio como:
- Cookiebot
- OneTrust
- Termly

---

## 📞 Soporte

Si tienes problemas con la configuración:
1. Verifica que los IDs estén correctos en `.env.local`
2. Asegúrate de haber reiniciado el servidor
3. Revisa la consola del navegador para errores
4. Verifica que las extensiones de bloqueo de ads estén desactivadas

---

**Última actualización**: 2025-10-01
