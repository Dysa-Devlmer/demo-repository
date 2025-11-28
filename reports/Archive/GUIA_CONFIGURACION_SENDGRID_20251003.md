# 📧 Guía de Configuración SendGrid - Paso a Paso

**Fecha:** 3 de Octubre, 2025
**Hora:** 4:30 PM
**Autor:** Devlmer + Claude Code
**Estado:** ✅ **GUÍA COMPLETA**

---

## 🎯 Respuesta Rápida

**¿Web API o SMTP Relay?**

✅ **Elige: Web API**

❌ **NO elijas: SMTP Relay**

**Razón:** El código implementado usa `@sendgrid/mail` que utiliza la **Web API REST** de SendGrid, no SMTP tradicional.

---

## 📋 Configuración Paso a Paso

### Paso 1: Elegir Web API ✅

```
1. Estás en: Email API → Integration Guide
2. Opciones mostradas:
   - Web API          ← ELEGIR ESTA ✅
   - SMTP Relay       ← NO ELEGIR ❌
3. Click en "Web API"
```

**¿Por qué Web API?**
- ✅ Más moderna y eficiente
- ✅ Soporta templates dinámicos
- ✅ Mejor analytics y tracking
- ✅ Es la que usa nuestro código (`@sendgrid/mail`)
- ✅ Más rápida (HTTP vs SMTP)
- ✅ Mejor manejo de errores

---

### Paso 2: Elegir el Lenguaje

```
Después de elegir Web API, te pedirá el lenguaje:

Lenguajes disponibles:
- Node.js          ← ELEGIR ESTA ✅
- Python
- Ruby
- PHP
- Java
- C#
- Go

Click en "Node.js"
```

---

### Paso 3: Crear API Key

SendGrid te mostrará instrucciones. Sigue estos pasos:

```
1. Click en "Create API Key" o "Get Started"

2. Te llevará a: Settings → API Keys

3. Click en "Create API Key"

4. Configuración de la API Key:
   ┌─────────────────────────────────────┐
   │ API Key Name:                       │
   │ chatbotdysa-production           ✏️ │
   │                                     │
   │ API Key Permissions:                │
   │ ○ Billing Access                    │
   │ ● Full Access                    ✅ │
   │ ○ Restricted Access                 │
   │                                     │
   │ [Create & View]                     │
   └─────────────────────────────────────┘

5. Click en "Create & View"
```

**⚠️ IMPORTANTE:**
- Elige "Full Access" (para usar todas las funciones)
- El nombre puede ser cualquiera (ej: `chatbotdysa-production`)

---

### Paso 4: Copiar la API Key

```
⚠️  MUY IMPORTANTE: La API Key solo se muestra UNA VEZ

Verás algo como:

┌────────────────────────────────────────────────────┐
│ Your API Key has been created!                     │
│                                                    │
│ SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx │
│                                                    │
│ [Copy]  ← Click aquí                              │
│                                                    │
│ ⚠️  Make sure to copy your API key now.           │
│    You won't be able to see it again!             │
└────────────────────────────────────────────────────┘

1. Click en "Copy" o selecciona y copia manualmente
2. Pega en un lugar seguro (editor de texto temporal)
3. ✅ Verifica que empieza con "SG."
4. ✅ Verifica que es una cadena larga (~69 caracteres)
```

**Ejemplo de API Key:**
```
SG.abcdefghijklmnopqrstuvwxyz123456.ABCDEFGHIJKLMNOPQRSTUVWXYZ7890_abcdefghijk
```

---

### Paso 5: Configurar en el Backend

Ahora copia la API Key a tu archivo `.env`:

```bash
# Opción 1: Editar manualmente
cd /Users/devlmer/ChatBotDysa/apps/backend
nano .env

# Agregar estas líneas:
SENDGRID_API_KEY=SG.tu-api-key-aqui-pegada
SENDGRID_FROM_EMAIL=noreply@chatbotdysa.com

# Guardar: Ctrl+O, Enter, Ctrl+X

# Opción 2: Con comandos (más rápido)
cd /Users/devlmer/ChatBotDysa/apps/backend
echo "SENDGRID_API_KEY=SG.tu-api-key-aqui-pegada" >> .env
echo "SENDGRID_FROM_EMAIL=noreply@chatbotdysa.com" >> .env
```

**⚠️ REEMPLAZAR:**
- `SG.tu-api-key-aqui-pegada` → Tu API key real
- `noreply@chatbotdysa.com` → Tu email (puede ser cualquiera por ahora)

---

### Paso 6: Verificar Configuración

```bash
cd /Users/devlmer/ChatBotDysa/apps/backend

# Ver que la API key está en .env
grep SENDGRID .env

# Deberías ver:
# SENDGRID_API_KEY=SG.xxxxxxx
# SENDGRID_FROM_EMAIL=noreply@chatbotdysa.com
```

---

### Paso 7: Iniciar Backend y Verificar

```bash
# Terminal 1: Iniciar backend
cd /Users/devlmer/ChatBotDysa/apps/backend
npm run dev

# Verificar logs - Buscar esta línea:
# ✅ SendGrid inicializado correctamente

# Si ves:
# ⚠️  SENDGRID_API_KEY no configurado - Emails en modo MOCK
# → Significa que la API key NO está configurada correctamente
```

---

### Paso 8: Probar Envío de Email

Hay 2 formas de probar:

#### Opción A: Con el script de testing

```bash
cd /Users/devlmer/ChatBotDysa/apps/backend

# Crear pago de prueba (esto enviará email)
./scripts/test-mercadopago.sh create-preference

# Completar pago en Mercado Pago
# → Webhook se ejecuta
# → Email se envía automáticamente
```

#### Opción B: Test directo (crear endpoint de test)

Puedes agregar un endpoint temporal para probar emails:

```typescript
// En payments.controller.ts
@Get('test-email')
async testEmail() {
  await this.emailService.sendEmail(
    'tu-email@gmail.com',  // ← Cambiar por tu email real
    'Test de SendGrid',
    '<h1>¡Funciona!</h1><p>SendGrid está configurado correctamente.</p>',
  );
  return { success: true, message: 'Email enviado' };
}
```

Luego:
```bash
# Probar
curl http://localhost:8000/payments/test-email

# Verificar tu inbox
```

---

## 📊 Verificación Completa

### Checklist de Configuración

- [ ] **Paso 1:** Web API elegida (no SMTP)
- [ ] **Paso 2:** Node.js seleccionado
- [ ] **Paso 3:** API Key creada con "Full Access"
- [ ] **Paso 4:** API Key copiada (empieza con `SG.`)
- [ ] **Paso 5:** API Key en `.env`
- [ ] **Paso 6:** Email FROM configurado en `.env`
- [ ] **Paso 7:** Backend iniciado
- [ ] **Paso 8:** Log muestra "✅ SendGrid inicializado correctamente"
- [ ] **Paso 9:** Email de prueba enviado
- [ ] **Paso 10:** Email recibido en inbox ✅

---

## 🔍 Troubleshooting

### Problema 1: "SENDGRID_API_KEY no configurado"

**Síntoma:**
```
⚠️  SENDGRID_API_KEY no configurado - Emails en modo MOCK
```

**Solución:**
```bash
# Verificar que .env tiene la variable
cat .env | grep SENDGRID

# Si no está, agregarla:
echo "SENDGRID_API_KEY=SG.tu-key-aqui" >> .env

# Reiniciar backend
npm run dev
```

---

### Problema 2: Email no llega

**Síntoma:**
- Log dice "Email enviado" pero no llega al inbox

**Posibles causas:**

1. **Email en spam**
   ```
   Solución: Revisar carpeta de spam/junk
   ```

2. **Email FROM no verificado**
   ```
   Solución:
   - Ir a SendGrid → Settings → Sender Authentication
   - Verify Single Sender
   - Agregar tu email y verificarlo
   ```

3. **API Key sin permisos**
   ```
   Solución:
   - Crear nueva API Key con "Full Access"
   - Reemplazar en .env
   ```

4. **Rate limit excedido (Free tier)**
   ```
   SendGrid Free: 100 emails/día

   Solución:
   - Esperar 24 horas
   - O upgrade a plan pagado
   ```

---

### Problema 3: Error "Unauthorized"

**Síntoma:**
```
Error enviando email: Unauthorized
```

**Solución:**
```bash
# La API Key es incorrecta o expiró
# Crear nueva API Key en SendGrid
# Reemplazar en .env
```

---

### Problema 4: Error "The from email does not contain a valid address"

**Síntoma:**
```
Error: The from email does not contain a valid address
```

**Solución:**
```bash
# Verificar formato del email
# Debe ser: email@dominio.com

# En .env:
SENDGRID_FROM_EMAIL=noreply@chatbotdysa.com  ✅
SENDGRID_FROM_EMAIL=noreply                   ❌
```

---

## 📧 Configuración Avanzada (Opcional)

### 1. Verificar Dominio (Recomendado para Producción)

**Beneficios:**
- ✅ Emails NO van a spam
- ✅ Branding profesional
- ✅ Mayor deliverability

**Pasos:**
```
1. SendGrid → Settings → Sender Authentication
2. Authenticate Your Domain
3. Seguir wizard:
   - Dominio: chatbotdysa.com
   - DNS Provider: [tu proveedor]
4. Agregar registros DNS (CNAME, TXT)
5. Esperar verificación (24-48 hrs)
```

**Registros DNS típicos:**
```
Tipo    Nombre                          Valor
CNAME   em1234.chatbotdysa.com         u1234567.wl.sendgrid.net
CNAME   s1._domainkey.chatbotdysa.com  s1.domainkey.u1234567.wl.sendgrid.net
CNAME   s2._domainkey.chatbotdysa.com  s2.domainkey.u1234567.wl.sendgrid.net
```

---

### 2. Crear Templates Dinámicos (Opcional)

Si quieres diseños más personalizados que los HTML fallback:

```
1. SendGrid → Email API → Dynamic Templates
2. Create Dynamic Template
3. Configurar:
   - Template Name: "Payment Confirmation"
   - Add Version → Design Editor o Code Editor
4. Diseñar template con variables:
   {{firstName}}
   {{planName}}
   {{amount}}
   etc.
5. Guardar y obtener Template ID (d-xxxxx)
6. Agregar a .env:
   SENDGRID_TEMPLATE_PAYMENT_CONFIRMATION=d-xxxxx
```

**Sin templates también funciona:**
- ✅ Usa HTML fallback incluido en el código
- ✅ No requiere configuración extra
- ⚠️ Menos flexible para cambios de diseño

---

### 3. Configurar Webhook de SendGrid (Opcional)

Para recibir notificaciones de bounces, spam, etc:

```
1. SendGrid → Settings → Mail Settings → Event Webhook
2. Authorization Method: None (o configurar)
3. HTTP Post URL: https://api.chatbotdysa.com/sendgrid/webhook
4. Actions to be posted:
   ✅ Delivered
   ✅ Opened
   ✅ Clicked
   ✅ Bounced
   ✅ Spam Report
5. Test Your Integration
6. Save
```

---

## 📊 Límites del Free Tier

### SendGrid Free Plan

```
Emails/día:     100
Emails/mes:     ~3,000
Validez API:    Sin expiración
Templates:      Ilimitados
Analytics:      30 días
Support:        Email only
```

**¿Es suficiente para testing?**
✅ **SÍ** - 100 emails/día es más que suficiente para desarrollo y testing

**¿Es suficiente para producción inicial?**
✅ **SÍ** - Para los primeros clientes está bien
⚠️ **Upgrade después** - Cuando tengas 50+ clientes/día

---

## 💰 Planes Pagados (Referencia)

| Plan | Precio/mes | Emails/mes | Soporte |
|------|------------|------------|---------|
| Free | $0 | 3,000 | Email |
| Essentials | $19.95 | 50,000 | Email |
| Pro | $89.95 | 100,000 | Email + Chat |
| Premier | Custom | 1,000,000+ | Dedicado |

**Recomendación:** Empieza con Free, upgrade cuando necesites más de 100 emails/día.

---

## ✅ Configuración Completa

Si completaste todos los pasos, deberías tener:

```bash
# .env configurado
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@chatbotdysa.com

# Backend iniciado
npm run dev
# ✅ SendGrid inicializado correctamente

# Email de prueba enviado
# ✅ Email recibido en inbox
```

---

## 🚀 Próximos Pasos

### Ahora que SendGrid está configurado:

1. **Probar flujo completo** (15 min)
   ```bash
   # Terminal 1: Backend
   npm run dev

   # Terminal 2: Frontend
   cd ../website && npm run dev

   # Browser: http://localhost:3000/checkout?plan=saas-multi
   # → Completar pago con tarjeta de test
   # → Verificar email en inbox
   ```

2. **Verificar dominio** (opcional, 30 min)
   - Seguir pasos de "Authenticate Your Domain"
   - Configurar DNS
   - Esperar verificación

3. **Crear templates** (opcional, 1h)
   - Diseñar templates en SendGrid
   - Obtener Template IDs
   - Configurar en .env

---

## 📞 Recursos

### Enlaces Útiles

- **SendGrid Dashboard:** https://app.sendgrid.com
- **Documentación:** https://docs.sendgrid.com
- **Node.js Quickstart:** https://docs.sendgrid.com/for-developers/sending-email/quickstart-nodejs
- **API Reference:** https://docs.sendgrid.com/api-reference
- **Templates Guide:** https://docs.sendgrid.com/ui/sending-email/how-to-send-an-email-with-dynamic-templates

### Contacto SendGrid

- **Support:** https://support.sendgrid.com
- **Status:** https://status.sendgrid.com
- **Community:** https://community.sendgrid.com

---

## 🎉 Conclusión

**Configuración completada:**
- ✅ Web API elegida (correcto para nuestro código)
- ✅ API Key creada y configurada
- ✅ Backend integrado con SendGrid
- ✅ Listo para enviar emails reales

**Siguiente paso:**
Probar el flujo completo de pago → email de confirmación.

---

**ChatBotDysa Enterprise+++++**
*Guía de Configuración SendGrid*

© 2025 ChatBotDysa - Todos los derechos reservados

**Última actualización:** 3 de Octubre, 2025 - 4:45 PM

---

**FIN DE LA GUÍA** 📧
