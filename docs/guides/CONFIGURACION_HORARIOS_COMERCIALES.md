# 🕐 Configuración de Horarios Comerciales - Mistura del Perú

## 📋 Descripción General

El sistema ahora incluye **horarios comerciales automáticos** que controlan cuándo el chatbot responde con IA y cuándo envía un mensaje de "fuera de horario".

### ✅ Características Implementadas

1. **Verificación automática de horarios** antes de procesar mensajes
2. **Respuestas con IA** durante horario de atención (Lun-Dom: 12:00 - 22:00)
3. **Mensaje automático de cierre** fuera de horario de atención
4. **Soporte para plantillas de WhatsApp** (opcional) aprobadas por Meta
5. **Zona horaria configurable** (por defecto: America/Santiago)

---

## 🚀 Cómo Funciona

### Durante Horario de Atención (ABIERTO)
```
Cliente envía mensaje
     ↓
Sistema verifica horario → ABIERTO
     ↓
Ollama genera respuesta con IA
     ↓
WhatsApp envía respuesta personalizada
```

### Fuera de Horario de Atención (CERRADO)
```
Cliente envía mensaje
     ↓
Sistema verifica horario → CERRADO
     ↓
Se envía mensaje de cierre automático
(Plantilla de Meta o mensaje de texto)
```

---

## ⚙️ Configuración en el .env

Agrega las siguientes variables a tu archivo `.env`:

```bash
# Horarios Comerciales
RESTAURANT_TIMEZONE=America/Santiago

# Plantilla WhatsApp (opcional)
USE_WHATSAPP_TEMPLATE_CLOSED=false
WHATSAPP_CLOSED_TEMPLATE_NAME=mistura_fuera_horario
```

### Opciones de Configuración

| Variable | Descripción | Valores | Por Defecto |
|----------|-------------|---------|-------------|
| `RESTAURANT_TIMEZONE` | Zona horaria del restaurante | Timezone válido (ej: `America/Santiago`, `America/Mexico_City`) | `America/Santiago` |
| `USE_WHATSAPP_TEMPLATE_CLOSED` | Usar plantilla de WhatsApp cuando esté cerrado | `true` o `false` | `false` |
| `WHATSAPP_CLOSED_TEMPLATE_NAME` | Nombre de la plantilla aprobada en Meta | Nombre de tu plantilla | - |

---

## 📅 Horarios Predeterminados

Por defecto, el restaurante está configurado:

```
Lunes a Domingo: 12:00 - 22:00
Zona horaria: America/Santiago (Chile)
```

### Modificar Horarios

Para cambiar los horarios, edita el archivo:
`apps/backend/src/modules/whatsapp/business-hours.service.ts`

```typescript
schedule: [
  { dayOfWeek: 0, openTime: "12:00", closeTime: "22:00" }, // Domingo
  { dayOfWeek: 1, openTime: "12:00", closeTime: "22:00" }, // Lunes
  { dayOfWeek: 2, openTime: "12:00", closeTime: "22:00" }, // Martes
  { dayOfWeek: 3, openTime: "12:00", closeTime: "22:00" }, // Miércoles
  { dayOfWeek: 4, openTime: "12:00", closeTime: "22:00" }, // Jueves
  { dayOfWeek: 5, openTime: "12:00", closeTime: "22:00" }, // Viernes
  { dayOfWeek: 6, openTime: "12:00", closeTime: "22:00" }, // Sábado
],
```

**Ejemplo: Cerrado los lunes**
```typescript
{ dayOfWeek: 1, openTime: "00:00", closeTime: "00:00" }, // Lunes cerrado
```

**Ejemplo: Diferentes horarios entre semana y fin de semana**
```typescript
{ dayOfWeek: 1, openTime: "11:00", closeTime: "22:00" }, // Lun-Jue
{ dayOfWeek: 2, openTime: "11:00", closeTime: "22:00" },
{ dayOfWeek: 3, openTime: "11:00", closeTime: "22:00" },
{ dayOfWeek: 4, openTime: "11:00", closeTime: "22:00" },
{ dayOfWeek: 5, openTime: "11:00", closeTime: "23:30" }, // Viernes
{ dayOfWeek: 6, openTime: "11:00", closeTime: "23:30" }, // Sábado
{ dayOfWeek: 0, openTime: "12:00", closeTime: "22:00" }, // Domingo
```

---

## 📱 Configurar Plantilla de WhatsApp en Meta

### ¿Por qué usar plantillas?

Las plantillas de WhatsApp Business tienen ventajas:
- ✅ **Mejor entrega**: Meta garantiza entrega de plantillas aprobadas
- ✅ **Respuesta rápida**: No requiere sesión activa de 24h
- ✅ **Profesional**: Formato consistente y aprobado por Meta
- ✅ **Gratuita**: Sin costo adicional
- ⚠️ **Requiere aprobación**: Meta debe aprobar tu plantilla (1-2 días hábiles)

### Paso 1: Acceder a Meta Business Manager

1. Ve a [https://business.facebook.com](https://business.facebook.com)
2. Inicia sesión con tu cuenta de Facebook
3. Selecciona tu **Business Account** (zgamersa o el que uses)

### Paso 2: Ir a WhatsApp Manager

1. En el menú lateral, busca **"WhatsApp Accounts"** o **"Cuentas de WhatsApp"**
2. Selecciona tu número de WhatsApp Business: `+56965419765`
3. Haz clic en **"Message Templates"** o **"Plantillas de Mensajes"**

### Paso 3: Crear Nueva Plantilla

1. Haz clic en **"Create Template"** o **"Crear Plantilla"**
2. Completa el formulario:

**Información Básica:**
```
Nombre: mistura_fuera_horario
Categoría: UTILITY (Utilidad)
Idioma: Spanish (es)
```

**Contenido del Mensaje:**

```
🇵🇪 *Mistura del Perú*

¡Gracias por contactarnos! 😊

En este momento estamos *fuera de nuestro horario de atención*.

📅 *Horario de atención:*
Lunes a Domingo: 12:00 - 22:00

Responderemos tu mensaje apenas abramos. ¡Esperamos servirte pronto!

_El auténtico sabor peruano_ 🍽️
```

**Componentes:**
- **Header**: Ninguno (opcional: puedes agregar "Mistura del Perú")
- **Body**: El mensaje de arriba
- **Footer**: Ninguno (opcional)
- **Buttons**: Ninguno

### Paso 4: Enviar para Aprobación

1. Revisa tu plantilla
2. Haz clic en **"Submit"** o **"Enviar"**
3. Meta revisará tu plantilla (generalmente 1-2 días hábiles)
4. Recibirás notificación por email cuando esté aprobada

### Paso 5: Activar en el Sistema

Una vez aprobada la plantilla por Meta:

1. Edita tu archivo `.env`:
```bash
USE_WHATSAPP_TEMPLATE_CLOSED=true
WHATSAPP_CLOSED_TEMPLATE_NAME=mistura_fuera_horario
```

2. Reinicia el backend:
```bash
cd /Users/devlmer/ChatBotDysa/apps/backend
pkill -f "node.*nest"
npm run start:dev
```

---

## 🧪 Probar el Sistema

### Prueba 1: Durante Horario de Atención

**Condición**: Hora actual entre 12:00 - 22:00

```bash
# Envía mensaje de prueba
curl -X POST http://localhost:8005/api/whatsapp/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "changes": [{
        "value": {
          "messages": [{
            "from": "56948500380",
            "id": "test_msg_1",
            "timestamp": "'$(date +%s)'",
            "type": "text",
            "text": {
              "body": "Hola, ¿tienen ceviche?"
            }
          }]
        }
      }]
    }]
  }'
```

**Resultado Esperado**: Respuesta generada por IA sobre el ceviche

### Prueba 2: Fuera de Horario de Atención

**Condición**: Hora actual fuera de 12:00 - 22:00

```bash
# Mismo comando que arriba
```

**Resultado Esperado**: Mensaje automático de cierre

---

## 🔍 Verificar Estado del Sistema

### Endpoint de Salud

```bash
curl http://localhost:8005/api/whatsapp/health
```

**Respuesta:**
```json
{
  "service": "WhatsApp Business API",
  "configured": true,
  "phoneNumberId": "905984725929536",
  "apiVersion": "v18.0"
}
```

### Logs del Backend

```bash
# Ver logs en tiempo real
tail -f /tmp/backend_mistura.log

# Buscar verificación de horarios
grep "Business hours check" /tmp/backend_mistura.log

# Buscar mensajes de cierre
grep "Restaurant is CLOSED" /tmp/backend_mistura.log
```

---

## 🎯 Casos de Uso

### Caso 1: Mensaje Recibido a las 14:00 (Abierto)
```
Cliente: "Hola, ¿tienen delivery?"
Sistema: ✅ ABIERTO
Ollama: "¡Hola! Sí, en Mistura del Perú ofrecemos delivery..."
```

### Caso 2: Mensaje Recibido a las 23:00 (Cerrado)
```
Cliente: "Hola, ¿tienen delivery?"
Sistema: ❌ CERRADO
Respuesta: "🇵🇪 Mistura del Perú
¡Gracias por contactarnos! 😊
En este momento estamos fuera de nuestro horario..."
```

### Caso 3: Sistema Offline (Backend Apagado)
```
Cliente: "Hola"
WhatsApp: Sin respuesta automática
(O plantilla de Meta si está configurada como Away Message)
```

---

## 🛠️ Troubleshooting

### Problema: Siempre responde como CERRADO

**Solución:**
1. Verifica la zona horaria:
```bash
# En el backend
grep "RESTAURANT_TIMEZONE" /Users/devlmer/ChatBotDysa/apps/backend/.env
```

2. Verifica hora actual del servidor:
```bash
TZ=America/Santiago date
```

3. Revisa logs:
```bash
grep "Business hours check" /tmp/backend_mistura.log
```

### Problema: Plantilla de WhatsApp no funciona

**Causas comunes:**
1. ❌ Plantilla no aprobada por Meta
2. ❌ Nombre de plantilla incorrecto en `.env`
3. ❌ Variable `USE_WHATSAPP_TEMPLATE_CLOSED=false`

**Solución:**
```bash
# 1. Verifica estado en Meta Business Manager
# 2. Verifica nombre exacto de la plantilla
# 3. Verifica configuración .env

cat /Users/devlmer/ChatBotDysa/apps/backend/.env | grep TEMPLATE
```

### Problema: Backend no arranca después de cambios

**Error común:**
```
Error: Nest can't resolve dependencies of WhatsAppController
```

**Solución:**
```bash
# Limpia y reinicia
cd /Users/devlmer/ChatBotDysa/apps/backend
rm -rf dist/
rm -rf node_modules/.cache/
npm run start:dev
```

---

## 📊 Archivos Modificados/Creados

### Nuevos Archivos
- `apps/backend/src/modules/whatsapp/business-hours.service.ts` - Servicio de horarios
- `CONFIGURACION_HORARIOS_COMERCIALES.md` - Esta documentación

### Archivos Modificados
- `apps/backend/src/modules/whatsapp/whatsapp.controller.ts` - Lógica de verificación de horarios
- `apps/backend/src/modules/whatsapp/whatsapp.service.ts` - Método sendTemplateMessage
- `apps/backend/src/modules/whatsapp/whatsapp.module.ts` - Registro de BusinessHoursService

---

## 🌍 Zonas Horarias Disponibles

Algunas zonas horarias útiles para restaurantes:

| País/Región | Timezone |
|-------------|----------|
| Chile | `America/Santiago` |
| México (CDMX) | `America/Mexico_City` |
| Perú | `America/Lima` |
| Argentina | `America/Argentina/Buenos_Aires` |
| Colombia | `America/Bogota` |
| España | `Europe/Madrid` |

Ver lista completa: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones

---

## 💡 Recomendaciones

### Para Producción

1. **Usa plantillas de WhatsApp aprobadas**
   - Mejor entrega
   - Más profesional
   - Funciona aunque el backend esté offline (configurar en Meta)

2. **Configura Away Message en Meta**
   - En WhatsApp Manager → Settings → Away Message
   - Se envía automáticamente cuando backend está offline
   - Complementa el sistema de horarios

3. **Monitorea logs de horarios**
   - Verifica que la zona horaria sea correcta
   - Asegúrate que los horarios se aplican bien

4. **Actualiza horarios según temporada**
   - Feriados
   - Vacaciones
   - Eventos especiales

---

## 🚀 Próximos Pasos Recomendados

1. ✅ **Crear plantilla en Meta Business Manager** (1-2 días para aprobación)
2. ✅ **Configurar Away Message en Meta** (para cuando el sistema esté offline)
3. ✅ **Probar en horarios reales** antes de producción
4. ✅ **Configurar alertas** cuando el sistema esté fuera de línea
5. ✅ **Documentar horarios especiales** (feriados, eventos)

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs: `tail -f /tmp/backend_mistura.log`
2. Verifica configuración `.env`
3. Verifica estado de plantillas en Meta Business Manager
4. Reinicia el backend después de cambios

---

**Documentación actualizada**: $(date)
**Versión del sistema**: 1.0.0
**Restaurante**: Mistura del Perú 🇵🇪
