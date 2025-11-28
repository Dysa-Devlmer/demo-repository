# 📊 Guía Paso a Paso: Configuración de Analytics y Servicios

**Proyecto:** ChatBotDysa Enterprise+++++
**Fecha:** 2 de Octubre, 2025
**Versión:** 1.0.0
**Estado:** 📚 GUÍA PRÁCTICA
**Prioridad:** 🔥🔥🔥 CRÍTICO - HACER HOY
**Tiempo total:** ~1 hora 15 minutos

---

## 📋 Resumen Ejecutivo

Guía práctica paso a paso para configurar los 3 servicios críticos necesarios para lanzar a producción:

1. **Google Analytics 4** (30 min) - Tracking de conversiones
2. **Meta Pixel** (30 min) - Tracking de Facebook/Instagram
3. **SendGrid** (15 min) - Sistema de emails

**¡IMPORTANTE!** Estos pasos deben completarse HOY para que el tracking funcione en producción.

---

## 1️⃣ GOOGLE ANALYTICS 4 (GA4)

**Tiempo estimado:** 30 minutos
**Prioridad:** 🔥🔥🔥 CRÍTICO

### ¿Por qué es crítico?

Sin GA4 configurado:
- ❌ No puedes medir conversiones
- ❌ No sabes de dónde vienen tus clientes
- ❌ No puedes optimizar campañas de marketing
- ❌ No tienes datos para tomar decisiones

### Paso 1: Crear cuenta de Google Analytics

**1.1. Ir a Google Analytics:**
```
https://analytics.google.com
```

**1.2. Iniciar sesión:**
- Usar cuenta de Google de la empresa
- Si no tienes, crear una nueva: admin@chatbotdysa.com

**1.3. Hacer click en "Empezar a medir"**

---

### Paso 2: Configurar cuenta y propiedad

**2.1. Crear cuenta:**
- **Nombre de cuenta:** ChatBotDysa
- **Compartir datos:** Marcar las opciones recomendadas
- Click "Siguiente"

**2.2. Crear propiedad:**
- **Nombre de propiedad:** ChatBotDysa Production
- **Zona horaria:** (GMT-03:00) Santiago
- **Moneda:** Chilean Peso (CLP)
- Click "Siguiente"

**2.3. Información del negocio:**
- **Categoría:** Internet y telecomunicaciones
- **Tamaño:** Pequeña (1-10 empleados) [o la que corresponda]
- **Objetivo:** Generar leads
- Click "Crear"

**2.4. Aceptar términos:**
- Leer y aceptar Términos del Servicio
- Aceptar Enmienda de Procesamiento de Datos

---

### Paso 3: Configurar Data Stream (Flujo de datos)

**3.1. Seleccionar plataforma:**
- Click en "Web"

**3.2. Configurar flujo de datos web:**
- **URL del sitio web:** `https://chatbotdysa.com`
- **Nombre del stream:** ChatBotDysa Website
- **Enhanced measurement:** ACTIVAR (dejar por defecto)
- Click "Crear stream"

---

### Paso 4: Obtener Measurement ID

**4.1. En la pantalla del stream, verás:**
```
MEASUREMENT ID
G-XXXXXXXXXX
```

**Ejemplo:**
```
G-1A2B3C4D5E
```

**4.2. COPIAR este ID** (lo necesitarás ahora)

---

### Paso 5: Configurar en tu aplicación

**5.1. Abrir archivo de variables de entorno:**
```bash
# Website
/apps/website/.env.local
```

**5.2. Agregar el Measurement ID:**
```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-1A2B3C4D5E
```

**5.3. Si usas .env.production (para Vercel):**
```bash
# En Vercel Dashboard → Project Settings → Environment Variables
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-1A2B3C4D5E
```

---

### Paso 6: Configurar Conversiones

**6.1. Ir a Admin → Events:**
- En el menú lateral: Admin
- En la columna "Property": Events
- Click "Mark as conversion" en estos eventos:

**Eventos a marcar como conversión:**
1. ✅ `purchase` - CONVERSIÓN PRINCIPAL
2. ✅ `generate_lead` - Conversión secundaria
3. ✅ `begin_checkout` - Para optimización

**6.2. Configurar Enhanced E-commerce:**
- Admin → Data display → E-commerce purchases
- Toggle ON: "Show e-commerce purchases"

---

### Paso 7: Verificar que funciona

**7.1. Abrir tu sitio en navegador:**
```bash
npm run dev
# Abrir http://localhost:3000
```

**7.2. En GA4, ir a Reports → Realtime:**
- Deberías ver "1 user active now"
- Navegar por tu sitio y ver eventos aparecer en tiempo real

**7.3. Hacer una conversión de prueba:**
- Completar checkout hasta la página de éxito
- Verificar que aparece evento "purchase" en Realtime

---

### Paso 8: Configurar Alertas (opcional pero recomendado)

**8.1. Admin → Custom alerts:**
- Click "Create custom alert"
- Nombre: "Caída en conversiones"
- Condición: Purchases < 5 per day
- Email: admin@chatbotdysa.com

---

### ✅ Checklist de verificación GA4:

- [ ] Cuenta creada
- [ ] Propiedad creada con nombre correcto
- [ ] Data Stream web configurado
- [ ] Measurement ID obtenido y copiado
- [ ] ID agregado a .env.local
- [ ] Conversiones configuradas (purchase, generate_lead)
- [ ] E-commerce habilitado
- [ ] Verificado en Realtime reports
- [ ] Alert configurado

---

## 2️⃣ META PIXEL (FACEBOOK/INSTAGRAM)

**Tiempo estimado:** 30 minutos
**Prioridad:** 🔥🔥🔥 CRÍTICO

### ¿Por qué es crítico?

Meta Pixel te permite:
- ✅ Hacer retargeting a visitantes del sitio
- ✅ Medir conversiones de ads de Facebook/Instagram
- ✅ Crear audiencias personalizadas
- ✅ Optimizar campañas publicitarias

### Paso 1: Crear cuenta Business Manager

**1.1. Ir a Facebook Business:**
```
https://business.facebook.com
```

**1.2. Crear Business Manager (si no tienes):**
- Click "Create account"
- **Nombre de empresa:** ChatBotDysa
- **Tu nombre:** [Tu nombre]
- **Email empresarial:** admin@chatbotdysa.com
- Click "Siguiente"

**1.3. Agregar información:**
- **Dirección:** Tu dirección de empresa
- **Sitio web:** chatbotdysa.com
- **Número de teléfono:** +56 9 XXXX XXXX
- Click "Enviar"

---

### Paso 2: Ir a Events Manager

**2.1. En el menú superior:**
- Click en el ícono de 9 cuadrados (menú de todas las herramientas)
- Buscar "Events Manager"
- Click en "Events Manager"

**2.2. Si es primera vez:**
- Click "Conectar fuentes de datos"

---

### Paso 3: Crear Pixel

**3.1. En Events Manager:**
- Click "Conectar fuentes de datos" (botón verde)
- Seleccionar "Web"
- Click "Conectar"

**3.2. Seleccionar método de conexión:**
- Seleccionar "Meta Pixel"
- Click "Conectar"

**3.3. Configurar Pixel:**
- **Nombre del pixel:** ChatBotDysa
- Click "Crear pixel"

---

### Paso 4: Configurar Pixel

**4.1. Método de configuración:**
- Seleccionar "Instalar código manualmente"
- Click "Continuar"

**4.2. COPIAR el Pixel ID:**

En la pantalla verás algo como:
```html
<!-- Meta Pixel Code -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '123456789012345'); // ← ESTE ES TU PIXEL ID
  fbq('track', 'PageView');
</script>
```

**El Pixel ID es el número de 15 dígitos:**
```
123456789012345
```

**COPIAR este ID**

---

### Paso 5: Configurar en tu aplicación

**5.1. Abrir archivo de variables de entorno:**
```bash
# Website
/apps/website/.env.local
```

**5.2. Agregar el Pixel ID:**
```bash
NEXT_PUBLIC_META_PIXEL_ID=123456789012345
```

---

### Paso 6: Configurar eventos de conversión

**6.1. En Events Manager:**
- Click en tu Pixel "ChatBotDysa"
- Click en pestaña "Configuración"
- Scroll hasta "Eventos"

**6.2. Agregar eventos personalizados:**
- Click "Agregar eventos"
- Seleccionar "Desde código"

Ya no necesitas hacer nada más, los eventos ya están implementados en el código.

**6.3. Configurar eventos de conversión:**
- En el menú lateral: "Aggregated Event Measurement"
- Click "Configure Web Events"
- Click "Add Events"
- Agregar en este orden:
  1. `Purchase` (prioridad 1) - CRÍTICO
  2. `Lead` (prioridad 2)
  3. `InitiateCheckout` (prioridad 3)

---

### Paso 7: Verificar con Facebook Pixel Helper

**7.1. Instalar extensión de Chrome:**
```
https://chrome.google.com/webstore/detail/facebook-pixel-helper
```

**7.2. Abrir tu sitio:**
```bash
npm run dev
# Abrir http://localhost:3000
```

**7.3. Click en el ícono del Pixel Helper:**
- Debería mostrar: "Pixel found: 123456789012345"
- Estado: verde ✅
- Eventos disparados: "PageView"

**7.4. Navegar a página de éxito:**
- Completar checkout
- En success page, Pixel Helper debe mostrar:
  - "Purchase" event ✅

---

### Paso 8: Crear audiencias personalizadas (opcional)

**8.1. En Events Manager → Audiences:**
- Click "Crear audiencia"
- Seleccionar "Audiencia personalizada"
- Fuente: "Sitio web"
- Eventos: "Purchase" en últimos 180 días
- Nombre: "Compradores - ChatBotDysa"
- Click "Crear audiencia"

**8.2. Crear audiencia de retargeting:**
- Eventos: "ViewContent" pero NO "Purchase"
- Nombre: "Visitantes sin comprar"
- Usar para retargeting

---

### ✅ Checklist de verificación Meta Pixel:

- [ ] Business Manager creado
- [ ] Pixel creado con nombre "ChatBotDysa"
- [ ] Pixel ID obtenido y copiado
- [ ] ID agregado a .env.local
- [ ] Facebook Pixel Helper instalado
- [ ] Pixel verificado en sitio (verde en helper)
- [ ] Eventos de conversión configurados
- [ ] Audiencia de compradores creada

---

## 3️⃣ SENDGRID (EMAILS)

**Tiempo estimado:** 15 minutos
**Prioridad:** 🔥🔥 ALTA

### ¿Por qué es necesario?

SendGrid permite:
- ✅ Enviar emails transaccionales (confirmaciones, facturas)
- ✅ Emails de onboarding automatizados
- ✅ Recordatorios de trial ending
- ✅ Alta deliverability (tus emails no van a spam)

### Paso 1: Crear cuenta SendGrid

**1.1. Ir a SendGrid:**
```
https://signup.sendgrid.com
```

**1.2. Registrarse:**
- **Email:** admin@chatbotdysa.com
- **Password:** [Contraseña segura]
- **First Name:** [Tu nombre]
- **Last Name:** [Tu apellido]
- **Company:** ChatBotDysa
- **Website:** chatbotdysa.com
- Click "Create Account"

**1.3. Verificar email:**
- Revisar inbox de admin@chatbotdysa.com
- Click en link de verificación

---

### Paso 2: Completar setup inicial

**2.1. Tell us about yourself:**
- **Role:** Developer
- **Do you write code?** Yes
- **Team size:** 1-10
- Click "Get Started"

**2.2. Choose your plan:**
- Seleccionar "Free" (100 emails/día)
- Click "Choose Free"

---

### Paso 3: Verificar dominio (Sender Authentication)

**3.1. En Dashboard → Settings → Sender Authentication:**
- Click "Get Started"

**3.2. Authenticate Your Domain:**
- Click "Authenticate Your Domain"
- **DNS Host:** [Tu proveedor de DNS, ej: Cloudflare, GoDaddy]
- **Domain:** chatbotdysa.com
- Click "Next"

**3.3. Agregar DNS Records:**

SendGrid te mostrará 3 records CNAME que debes agregar:

```
Type  Name                           Value
CNAME s1._domainkey.chatbotdysa.com  s1.domainkey.u12345.wl123.sendgrid.net
CNAME s2._domainkey.chatbotdysa.com  s2.domainkey.u12345.wl123.sendgrid.net
CNAME em1234.chatbotdysa.com         u12345.wl123.sendgrid.net
```

**3.4. Ir a tu proveedor de DNS:**
- Ej: Cloudflare, GoDaddy, Namecheap
- Agregar los 3 CNAME records
- Guardar cambios

**3.5. Volver a SendGrid:**
- Click "Verify" (puede tardar 5-15 min)
- Esperar hasta que diga "Verified" ✅

---

### Paso 4: Crear API Key

**4.1. En Dashboard → Settings → API Keys:**
- Click "Create API Key"

**4.2. Configurar API Key:**
- **Name:** ChatBotDysa Backend Production
- **Permissions:** Full Access (para empezar)
- Click "Create & View"

**4.3. COPIAR la API Key:**

Verás algo como:
```
SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**⚠️ IMPORTANTE:** Esta es la ÚNICA vez que verás esta key. Cópiala ahora.

---

### Paso 5: Configurar en el backend

**5.1. Abrir archivo de variables de entorno:**
```bash
# Backend
/apps/backend/.env.local
```

**5.2. Agregar credenciales de SendGrid:**
```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@chatbotdysa.com
SENDGRID_FROM_NAME=ChatBotDysa
```

---

### Paso 6: Crear Sender Identity (From email)

**6.1. En Dashboard → Settings → Sender Authentication → Single Sender Verification:**
- Click "Create New Sender"

**6.2. Configurar remitente:**
- **From Name:** ChatBotDysa
- **From Email Address:** noreply@chatbotdysa.com
- **Reply To:** soporte@chatbotdysa.com
- **Company Address:** [Tu dirección]
- **City:** Santiago
- **Country:** Chile
- Click "Create"

**6.3. Verificar email:**
- Revisar inbox de noreply@chatbotdysa.com
- Click en link de verificación
- Ahora puedes enviar desde noreply@chatbotdysa.com

---

### Paso 7: Crear Templates (opcional - se puede hacer después)

**7.1. En Dashboard → Email API → Dynamic Templates:**
- Click "Create a Dynamic Template"

**Crear estos templates:**

1. **Welcome Email:**
   - Name: "Bienvenida - ChatBotDysa"
   - Subject: "¡Bienvenido a ChatBotDysa! 🎉"

2. **Payment Confirmation:**
   - Name: "Confirmación de Pago"
   - Subject: "Pago confirmado - Factura #{{transaction_id}}"

3. **Account Activation:**
   - Name: "Cuenta Activada"
   - Subject: "Tu cuenta está activa - ¡Comienza ahora!"

4. **Trial Ending:**
   - Name: "Trial por terminar"
   - Subject: "⏰ Tu trial termina en {{days_left}} días"

**Para cada template:**
- Click "Add Version"
- Elegir "Blank Template"
- Diseñar con el editor (o usar HTML)
- Click "Save"
- Copiar el Template ID (formato: `d-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

---

### Paso 8: Test de envío

**8.1. Crear archivo de test:**
```bash
# Crear: /apps/backend/src/test-email.ts
```

```typescript
import * as sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

const msg = {
  to: 'tu-email@gmail.com', // Cambiar por tu email
  from: 'noreply@chatbotdysa.com',
  subject: 'Test de SendGrid',
  text: 'Este es un email de prueba desde ChatBotDysa',
  html: '<strong>Este es un email de prueba desde ChatBotDysa</strong>',
};

sgMail.send(msg)
  .then(() => console.log('✅ Email enviado!'))
  .catch((error) => console.error('❌ Error:', error));
```

**8.2. Ejecutar test:**
```bash
cd apps/backend
npx ts-node src/test-email.ts
```

**8.3. Verificar:**
- Revisar tu email
- Debería llegar en 5-10 segundos
- Si no llega, revisar spam

---

### ✅ Checklist de verificación SendGrid:

- [ ] Cuenta creada y verificada
- [ ] Dominio autenticado (DNS records agregados)
- [ ] API Key creada y copiada
- [ ] API Key agregada a .env en backend
- [ ] Sender Identity verificado (noreply@chatbotdysa.com)
- [ ] Test de envío exitoso
- [ ] Templates creados (opcional)

---

## 📊 RESUMEN FINAL

### ✅ Checklist general de configuración:

**Google Analytics 4:**
- [ ] Cuenta y propiedad creadas
- [ ] Measurement ID: `G-XXXXXXXXXX` configurado
- [ ] Conversiones marcadas (purchase, generate_lead)
- [ ] Verificado en Realtime

**Meta Pixel:**
- [ ] Pixel creado
- [ ] Pixel ID: `123456789012345` configurado
- [ ] Eventos de conversión configurados
- [ ] Verificado con Pixel Helper

**SendGrid:**
- [ ] Cuenta creada
- [ ] Dominio verificado
- [ ] API Key configurada
- [ ] Test de envío exitoso

---

## 🚀 Próximos pasos después de configurar

Una vez que tengas estos 3 servicios configurados:

1. **Deploy a producción:**
   - Los IDs ya están en .env.production
   - Tracking funcionará automáticamente

2. **Monitorear primeras conversiones:**
   - GA4 Realtime → Ver compras
   - Meta Events Manager → Ver purchases
   - SendGrid Activity → Ver emails enviados

3. **Optimizar:**
   - Analizar funnel en GA4
   - Crear campañas de retargeting con Meta
   - A/B test de emails en SendGrid

---

## ⏱️ Tiempo total invertido

| Servicio | Tiempo |
|----------|--------|
| Google Analytics 4 | 30 min |
| Meta Pixel | 30 min |
| SendGrid | 15 min |
| **TOTAL** | **1h 15min** |

---

## 🆘 ¿Problemas?

### GA4 no muestra datos en Realtime:
- Verificar que el Measurement ID sea correcto
- Verificar que esté en .env.local
- Reiniciar servidor: `npm run dev`
- Limpiar cache del navegador

### Meta Pixel Helper muestra error:
- Verificar que el Pixel ID sea correcto
- Refrescar página
- Verificar que el pixel esté activo en Events Manager

### SendGrid no envía emails:
- Verificar API Key es correcta
- Verificar dominio está verificado
- Verificar sender identity está verificado
- Revisar SendGrid Activity para ver errores

---

## 📚 Recursos adicionales

**Google Analytics 4:**
- [Documentación oficial](https://support.google.com/analytics/)
- [Guía de configuración](https://support.google.com/analytics/answer/9304153)

**Meta Pixel:**
- [Documentación oficial](https://developers.facebook.com/docs/meta-pixel)
- [Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper)

**SendGrid:**
- [Documentación oficial](https://docs.sendgrid.com/)
- [Guía de verificación de dominio](https://docs.sendgrid.com/ui/account-and-settings/how-to-set-up-domain-authentication)

---

**ChatBotDysa Enterprise+++++**
*Guía de Configuración de Analytics y Servicios*

© 2025 ChatBotDysa - Todos los derechos reservados

**⏰ HACER HOY** - Estas configuraciones son críticas para el lanzamiento
