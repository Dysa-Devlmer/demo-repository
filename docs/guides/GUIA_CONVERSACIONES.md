# 📱 GUÍA COMPLETA: Sistema de Conversaciones

## 🎯 ¿QUÉ ES ESTA INTERFAZ?

Es un **chat en vivo** donde puedes comunicarte con clientes que contactan al restaurante. Funciona como WhatsApp o cualquier app de mensajería, pero desde el panel de administración.

---

## 🖥️ ANATOMÍA DE LA INTERFAZ

```
┌─────────────────────────────────────────────────────────┐
│ [←] Juan Pérez              [Activa]        [⋮]        │ ← HEADER
│     +56912345678                                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────┐                              │
│  │ Hola, necesito una   │  ← MENSAJE DEL CLIENTE      │
│  │ reserva para 4       │     (izquierda, gris)       │
│  │ personas  🕐 14:30   │                              │
│  └──────────────────────┘                              │
│                                                         │
│                    ┌─────────────────────┐             │
│                    │ Claro, ¿para qué    │ ← MENSAJE  │
│                    │ día?  🕐 14:31      │   TUYO     │
│                    │            [Agente] │   (derecha)│
│                    └─────────────────────┘             │
│                                                         │
│                    ┌─────────────────────┐             │
│                    │ Tenemos disponibili-│ ← RESPUESTA│
│                    │ dad...  🕐 14:31    │   DEL BOT  │
│                    │               [Bot] │   (azul)   │
│                    └─────────────────────┘             │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ [Escribe tu respuesta...]                    [✈️ Enviar]│ ← INPUT
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 FLUJO DE TRABAJO COMPLETO

### **PASO 1: Ver lista de conversaciones**
```
Conversaciones → [Lista de chats activos]
```
Aquí ves todos los clientes que están escribiendo o han escrito recientemente.

### **PASO 2: Abrir una conversación**
```
Click en una conversación → Se abre el chat completo
```
Verás todo el historial de mensajes con ese cliente.

### **PASO 3: Responder al cliente**

#### Opción A: Respuesta Manual (TÚ escribes)
```
1. Escribe tu mensaje en el campo de texto
2. Presiona ENTER o click en el botón [✈️]
3. Tu mensaje aparece a la DERECHA con etiqueta "Agente"
4. El bot (Ollama) responde automáticamente
5. La respuesta del bot aparece también a la DERECHA con etiqueta "Bot"
```

#### Opción B: Solo observar
```
- El cliente escribe → Aparece a la IZQUIERDA
- El bot responde automáticamente → Aparece a la DERECHA
- Tú solo monitoreas la conversación
```

### **PASO 4: Intervenir cuando sea necesario**
```
Si el bot no puede responder bien:
1. TÚ escribes un mensaje manualmente
2. Tu mensaje sobrescribe temporalmente al bot
3. El cliente recibe tu respuesta directa
```

---

## ⋮ MENÚ DE OPCIONES (3 PUNTOS)

### **1. Cerrar conversación** 🚫
- **¿Qué hace?** Marca la conversación como "Cerrada"
- **¿Cuándo usar?** Cuando el cliente ya no necesita ayuda
- **Efecto:** Badge cambia de "Activa" → "Cerrada"

### **2. Asignar agente** 👤
- **¿Qué hace?** Asigna la conversación a un agente específico
- **¿Cuándo usar?** Para delegar la conversación a otro miembro del equipo
- **Efecto:** Aparece el nombre del agente asignado en el header

### **3. Ver historial** 📋
- **¿Qué hace?** Muestra todos los mensajes en formato de texto
- **¿Cuándo usar?** Para revisar rápidamente toda la conversación
- **Efecto:** Abre un popup con el historial completo

### **4. Exportar conversación** 💾
- **¿Qué hace?** Descarga la conversación completa en formato JSON
- **¿Cuándo usar?** Para respaldos, análisis o registros legales
- **Efecto:** Descarga archivo `conversation_[ID]_[timestamp].json`

### **5. Eliminar conversación** 🗑️
- **¿Qué hace?** ELIMINA PERMANENTEMENTE la conversación
- **¿Cuándo usar?** ⚠️ SOLO si es spam o contenido inapropiado
- **Efecto:** La conversación desaparece completamente (NO SE PUEDE DESHACER)

---

## 🎨 CÓDIGO DE COLORES

### **Mensajes del Cliente**
```
┌──────────────────────────┐
│ FONDO GRIS               │ ← Cliente
│ Texto negro              │   (izquierda)
│ Sin etiqueta             │
└──────────────────────────┘
```

### **Mensajes del Agente (TÚ)**
```
                ┌──────────────────────────┐
                │ FONDO AZUL/PRIMARIO      │ ← Agente
                │ Texto blanco             │   (derecha)
                │ Etiqueta: "Agente"       │
                └──────────────────────────┘
```

### **Mensajes del Bot (IA)**
```
                ┌──────────────────────────┐
                │ FONDO AZUL CLARO         │ ← Bot
                │ Texto blanco             │   (derecha)
                │ Etiqueta: "Bot"          │
                └──────────────────────────┘
```

---

## 🔔 ESTADOS DE CONVERSACIÓN

### 🟢 **Activa** (verde)
- Cliente está escribiendo o esperando respuesta
- Requiere atención inmediata
- Bot puede responder automáticamente

### 🟡 **En espera** (amarillo)
- Cliente pausó la conversación
- Puede volver en cualquier momento
- Mantener monitoreada

### ⚪ **Cerrada** (gris)
- Conversación finalizada
- Cliente obtuvo lo que necesitaba
- No requiere más atención

---

## 💡 EJEMPLOS DE USO REAL

### **Ejemplo 1: Reserva de Mesa**
```
Cliente:  "Hola, quiero hacer una reserva"
Bot:      "¡Hola! ¿Para cuántas personas?"
Cliente:  "4 personas"
Bot:      "¿Qué día y hora prefieres?"
Cliente:  "Mañana a las 8pm"
Bot:      "Perfecto, tenemos disponibilidad..."
```
👉 **Tú no intervienes** - El bot maneja todo

### **Ejemplo 2: Pregunta Compleja**
```
Cliente:  "¿Tienen menú sin gluten para celíacos?"
Bot:      "Sí, contamos con opciones sin gluten..."
Cliente:  "¿Pero están certificadas?"
```
👉 **AQUÍ INTERVIENES TÚ:**
```
Tú:       "Sí, nuestros platos sin gluten están certificados
           por [entidad]. También tenemos cocina separada."
```

### **Ejemplo 3: Cliente Enojado**
```
Cliente:  "¡Mi pedido llegó frío!"
Bot:      "Lamento mucho eso. Déjame ayudarte..."
```
👉 **INTERVIENES INMEDIATAMENTE:**
```
Tú:       "Mil disculpas por el inconveniente. Te enviaremos
           un pedido nuevo sin costo. ¿Cuál es tu dirección?"
```

---

## 🚀 TIPS PROFESIONALES

### ✅ **HACER**
- Responder rápido (menos de 2 minutos)
- Usar lenguaje amable y profesional
- Dejar que el bot maneje preguntas simples
- Intervenir en situaciones sensibles
- Cerrar conversaciones cuando terminen

### ❌ **NO HACER**
- Dejar conversaciones abiertas sin responder
- Eliminar conversaciones sin razón
- Ser brusco o cortante
- Ignorar mensajes del cliente
- Dar información incorrecta

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### **"No veo mensajes nuevos"**
✅ Refresca la página (F5)
✅ Verifica que el backend esté corriendo

### **"El bot no responde"**
✅ Verifica que Ollama esté activo (puerto 11434)
✅ Revisa los logs del backend

### **"No puedo enviar mensajes"**
✅ Verifica tu conexión a internet
✅ Asegúrate de estar autenticado
✅ Verifica que la conversación no esté cerrada

### **"El menú de opciones no abre"**
✅ Actualiza la página
✅ Verifica que estés usando un navegador moderno

---

## 📊 MÉTRICAS IMPORTANTES

### **Tiempo de Respuesta**
- **Ideal:** < 1 minuto
- **Aceptable:** 1-5 minutos
- **Malo:** > 5 minutos

### **Tasa de Resolución**
- **Objetivo:** > 90% resueltos por bot
- **Intervención manual:** < 10%

### **Satisfacción del Cliente**
- **Objetivo:** ⭐⭐⭐⭐⭐ (5 estrellas)
- **Mínimo aceptable:** ⭐⭐⭐⭐ (4 estrellas)

---

## 🎓 FLUJO RECOMENDADO PARA NUEVOS AGENTES

### **Día 1-3: Observación**
```
1. Solo OBSERVA cómo el bot maneja conversaciones
2. Identifica patrones comunes de preguntas
3. Aprende el tono y estilo del bot
```

### **Día 4-7: Intervención Limitada**
```
1. INTERVIENE solo cuando el bot falla
2. Practica respuestas rápidas
3. Usa el menú de opciones
```

### **Día 8+: Agente Completo**
```
1. Maneja conversaciones complejas
2. Asigna conversaciones a otros agentes
3. Cierra y organiza conversaciones
4. Exporta datos para reportes
```

---

## 📞 SOPORTE

¿Tienes dudas? Contacta al equipo técnico:
- Backend: http://localhost:8005
- Admin Panel: http://localhost:7001
- Documentación API: http://localhost:8005/docs

---

## ✅ CHECKLIST DIARIO

- [ ] Revisar conversaciones activas
- [ ] Responder mensajes pendientes
- [ ] Cerrar conversaciones finalizadas
- [ ] Exportar conversaciones importantes
- [ ] Verificar que el bot esté funcionando
- [ ] Reportar problemas técnicos

---

**¡Listo! Ahora sabes todo lo necesario para manejar conversaciones profesionalmente. 🎉**
