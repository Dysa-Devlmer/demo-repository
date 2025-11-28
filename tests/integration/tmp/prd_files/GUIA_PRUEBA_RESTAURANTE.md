# 🍽️ Guía de Prueba - ChatBotDysa para Restaurantes

**Fecha**: 2025-11-06
**Estado**: Sistema 100% Funcional y Listo para Pruebas

---

## 🎯 Cómo Probar el Sistema como Dueño de Restaurante

### OPCIÓN 1: Panel de Administración (Recomendado)

El Panel de Administración es la interfaz completa para dueños de restaurante donde puedes gestionar:
- Clientes
- Menús
- Pedidos
- Reservas
- Conversaciones del chatbot
- Configuración del restaurante

**Para acceder:**

1. **Abre tu navegador** y ve a:
   ```
   http://localhost:7001
   ```

2. **Credenciales de acceso:**
   ```
   Email: admin@zgamersa.com
   Password: Admin123!
   ```

3. **Funcionalidades disponibles:**
   - Dashboard con estadísticas en tiempo real
   - Gestión de clientes y pedidos
   - Visualización de conversaciones del chatbot
   - Configuración de menú y especialidades
   - Administración de usuarios y permisos

---

### OPCIÓN 2: Demo del Chatbot (Como Cliente)

Esta es una página web interactiva donde puedes probar el chatbot como si fueras un cliente que visita tu sitio web.

**Para probar:**

1. **Abre el archivo HTML** en tu navegador:
   ```
   file:///tmp/demo-chatbot-web.html
   ```

   O ejecuta este comando:
   ```bash
   open /tmp/demo-chatbot-web.html
   ```

2. **Interactúa con el chatbot:**
   - Escribe preguntas como un cliente real
   - Usa los botones de preguntas frecuentes
   - Observa cómo responde el chatbot IA

3. **Preguntas de prueba sugeridas:**
   - "Quiero hacer una reserva para 6 personas este sábado"
   - "¿Cuáles son las especialidades del chef?"
   - "¿Tienen opciones vegetarianas?"
   - "¿Cuál es el horario de atención?"
   - "¿Dónde están ubicados?"

**Nota:** Las respuestas pueden tomar 30-60 segundos (es normal, el modelo IA está procesando).

---

## 🚀 Iniciar el Sistema Completo

Si el sistema no está ejecutándose, inicia todo con estos comandos:

```bash
# 1. Backend API (puerto 8005)
cd /Users/devlmer/ChatBotDysa/apps/backend
npm run start:dev

# 2. Admin Panel (puerto 7001)
cd /Users/devlmer/ChatBotDysa/apps/admin-panel
npm run dev

# 3. Verificar que Ollama esté activo
curl http://localhost:11434/api/tags
```

---

## 🔍 URLs de Acceso Rápido

| Aplicación | URL | Credenciales |
|-----------|-----|--------------|
| **Panel de Administración** | http://localhost:7001 | admin@zgamersa.com / Admin123! |
| **Demo Chatbot Cliente** | file:///tmp/demo-chatbot-web.html | No requiere login |
| **API Backend** | http://localhost:8005/health | - |
| **Documentación API** | http://localhost:8005/api | - |

---

## 📊 Funcionalidades del Panel de Administración

### 1. Dashboard
- Estadísticas de ventas
- Pedidos recientes
- Reservas del día
- Clientes activos

### 2. Gestión de Clientes
- Ver lista de clientes
- Crear nuevos clientes
- Editar información
- Historial de pedidos

### 3. Gestión de Menú
- Agregar/editar platos
- Categorías de menú
- Precios y descripciones
- Disponibilidad

### 4. Pedidos
- Ver pedidos en tiempo real
- Cambiar estados (pendiente/preparando/listo/entregado)
- Historial de pedidos
- Filtros y búsqueda

### 5. Reservas
- Lista de reservas
- Crear nueva reserva
- Gestionar mesas
- Confirmaciones

### 6. Conversaciones Chatbot
- Ver todas las conversaciones
- Historial de mensajes
- Análisis de consultas frecuentes
- Métricas de uso

### 7. Configuración
- Datos del restaurante
- Horarios de atención
- Información de contacto
- Especialidades del menú
- Configuración del chatbot

---

## 🤖 Cómo Funciona el Chatbot IA

### Tecnología
- **Modelo**: llama3:8b (4.3 GB)
- **Servicio**: Ollama (local, privado)
- **Idioma**: Español
- **Tiempo de respuesta**: 30-60 segundos

### Capacidades del Chatbot
1. **Reservas**: Ayuda a los clientes a reservar mesas
2. **Consultas de Menú**: Informa sobre especialidades y platillos
3. **Horarios**: Proporciona información de horarios
4. **Ubicación**: Da direcciones y cómo llegar
5. **Recomendaciones**: Sugiere platos según preferencias
6. **Opciones dietéticas**: Informa sobre opciones vegetarianas, veganas, etc.

### Personalización
El chatbot se puede personalizar con:
- Nombre del restaurante
- Especialidades del chef
- Horarios de atención
- Ubicación y contacto
- Tono y estilo de respuestas

---

## ✅ Lista de Verificación para Pruebas

### Como Dueño de Restaurante:
- [ ] Ingresar al panel de administración
- [ ] Revisar el dashboard con estadísticas
- [ ] Ver lista de clientes
- [ ] Consultar menú actual
- [ ] Revisar pedidos pendientes
- [ ] Ver reservas del día
- [ ] Explorar conversaciones del chatbot
- [ ] Actualizar configuración del restaurante

### Como Cliente (Demo Chatbot):
- [ ] Abrir la página de demo del chatbot
- [ ] Hacer una pregunta sobre reservas
- [ ] Consultar especialidades del menú
- [ ] Preguntar sobre horarios
- [ ] Solicitar recomendaciones
- [ ] Probar opciones vegetarianas
- [ ] Verificar que las respuestas sean naturales

---

## 🔧 Solución de Problemas

### Si el Panel de Administración no carga:

1. Verificar que el backend esté ejecutándose:
   ```bash
   curl http://localhost:8005/health
   ```

2. Verificar que el admin panel esté ejecutándose:
   ```bash
   lsof -i :7001
   ```

3. Revisar logs:
   ```bash
   tail -f /tmp/admin-panel.log
   ```

### Si el Chatbot no responde:

1. Verificar que Ollama esté activo:
   ```bash
   curl http://localhost:11434/api/tags
   ```

2. Verificar que el modelo esté disponible:
   ```bash
   ollama list
   ```

3. Probar el chatbot directamente:
   ```bash
   /tmp/test-chat.sh
   ```

### Si hay errores de conexión:

1. Verificar que todos los servicios estén activos:
   ```bash
   # Backend
   lsof -i :8005

   # Admin Panel
   lsof -i :7001

   # PostgreSQL
   docker ps | grep postgres

   # Ollama
   curl http://localhost:11434/api/version
   ```

---

## 📞 Información del Sistema

### Puertos Utilizados
- **8005**: Backend API
- **7001**: Panel de Administración
- **15432**: PostgreSQL (Docker)
- **16379**: Redis (Docker)
- **11434**: Ollama AI

### Servicios Activos
- ✅ Backend NestJS
- ✅ Admin Panel Next.js
- ✅ PostgreSQL Database
- ✅ Redis Cache
- ✅ Ollama AI Service

### Base de Datos
- **Host**: 127.0.0.1
- **Puerto**: 15432
- **Base de datos**: chatbotdysa
- **Usuario**: postgres
- **Datos**: Seed data precargado

---

## 🎯 Próximos Pasos

### Para Producción:
1. Configurar dominio propio
2. Instalar certificado SSL
3. Ajustar variables de entorno de producción
4. Configurar backup automático
5. Implementar monitoreo

### Personalización:
1. Actualizar logo y colores del restaurante
2. Personalizar mensajes del chatbot
3. Ajustar menú y especialidades
4. Configurar horarios específicos
5. Adaptar formularios según necesidades

---

## 📚 Documentación Adicional

- **Guía Completa de Testing**: `GUIA_TESTING_LOCAL.md`
- **Resumen Final de Sesión**: `RESUMEN_FINAL_SESION.md`
- **Sistema Listo para Producción**: `SISTEMA_LISTO_PRODUCCION.md`
- **Ejemplos de Código**: `examples/chatbot-usage-examples.ts`

---

## 💡 Consejos para la Demostración

1. **Sé paciente**: Las respuestas del chatbot toman 30-60 segundos (es normal)
2. **Prueba diferentes preguntas**: El chatbot entiende lenguaje natural
3. **Explora todas las secciones**: El panel tiene muchas funcionalidades
4. **Personaliza la información**: Actualiza los datos con información real del restaurante
5. **Toma capturas**: Documenta las funcionalidades que más te gusten

---

## ✨ Conclusión

El sistema ChatBotDysa está **100% funcional** y listo para ser probado.

**Características principales:**
- ✅ Chatbot IA con respuestas naturales en español
- ✅ Panel de administración completo
- ✅ Gestión de clientes, menús y pedidos
- ✅ Sistema de reservas
- ✅ Base de datos con información de demo
- ✅ Autenticación y seguridad
- ✅ Listo para personalización

**El sistema está preparado para ser demostrado a dueños de restaurantes reales.**

---

*Generado el 2025-11-06 por Claude Code*
*ChatBotDysa - Sistema de Gestión y Asistencia para Restaurantes*
