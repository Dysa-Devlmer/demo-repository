# 🎯 CÓMO ACCEDER Y PROBAR CHATBOTDYSA

## 📍 URLs DE ACCESO

Abre tu navegador y accede a estas URLs:

### 🔐 Panel de Administración (Principal)
```
URL: http://localhost:7001
```

### 🌐 Sitio Web Público (Landing Page)
```
URL: http://localhost:3004
```

### 📡 API Backend (Documentación)
```
URL: http://localhost:8005/docs
```

---

## 🔑 CREDENCIALES DE ACCESO

### Administrador del Sistema
```
Email:    admin@zgamersa.com
Password: Admin123!
```

---

## 📝 PASO A PASO PARA PROBAR

### 1️⃣ Acceder al Panel de Administración

1. **Abre tu navegador** (Chrome, Firefox, Safari, Edge)

2. **Ve a:** `http://localhost:7001`

3. **Deberías ver la página de Login:**
   - Campo: Email
   - Campo: Password
   - Botón: "Iniciar Sesión"

4. **Ingresa las credenciales:**
   ```
   Email:    admin@zgamersa.com
   Password: Admin123!
   ```

5. **Click en "Iniciar Sesión"**

6. **Deberías ver el Dashboard** con:
   - Estadísticas (Total Conversaciones, Clientes Activos, etc.)
   - Gráficos
   - Conversaciones recientes
   - Menú lateral con todas las opciones

---

### 2️⃣ Explorar el Dashboard

Una vez dentro, verás en el menú lateral:

```
📊 Dashboard        - Vista general del sistema
👥 Customers        - Gestión de clientes
🍽️  Menu            - Gestión de menú del restaurante
📦 Orders           - Gestión de pedidos
📅 Reservations     - Gestión de reservas
💬 Conversations    - Historial de conversaciones
📈 Analytics        - Analíticas y reportes
🤖 AI Chat          - Chat con inteligencia artificial
⚙️  Settings        - Configuración del sistema
👤 Profile          - Tu perfil de usuario
```

---

### 3️⃣ Pruebas Recomendadas

#### A) CREAR UN CLIENTE
1. Click en **"Customers"** en el menú lateral
2. Click en botón **"Nuevo Cliente"** o **"Add Customer"**
3. Llenar el formulario:
   ```
   Name:     Juan Pérez
   Email:    juan@example.com
   Phone:    +56912345678
   ```
4. Click en **"Guardar"** o **"Save"**
5. ✅ Deberías ver el cliente en la lista

#### B) CREAR UN PLATO EN EL MENÚ
1. Click en **"Menu"** en el menú lateral
2. Click en **"Nuevo Item"** o **"Add Item"**
3. Llenar el formulario:
   ```
   Name:         Paella Valenciana
   Description:  Arroz con mariscos y azafrán
   Category:     Main Course (Plato Principal)
   Price:        15000
   Available:    ✓ (marcar como disponible)
   ```
4. Click en **"Guardar"**
5. ✅ Deberías ver el plato en el menú

#### C) CREAR UN PEDIDO
1. Click en **"Orders"** en el menú lateral
2. Click en **"Nuevo Pedido"** o **"New Order"**
3. Seleccionar:
   - Cliente (el que creaste)
   - Items del menú (el plato que agregaste)
   - Cantidad
4. Click en **"Crear Pedido"**
5. ✅ Deberías ver el pedido en la lista

#### D) PROBAR EL AI CHAT
1. Click en **"AI Chat"** en el menú lateral
2. Escribir un mensaje:
   ```
   Hola, ¿qué platos tienen disponibles hoy?
   ```
3. Click en **"Enviar"**
4. ✅ Deberías recibir una respuesta de la IA

---

### 4️⃣ Ver el Sitio Web Público

1. **Abre una nueva pestaña** en tu navegador

2. **Ve a:** `http://localhost:3004`

3. **Deberías ver:**
   - Página de inicio del restaurante
   - Secciones: Features, Planes, Testimonios
   - Botones de registro y demo

4. **Prueba navegar** por las diferentes secciones

---

### 5️⃣ Ver la Documentación de la API

1. **Abre una nueva pestaña**

2. **Ve a:** `http://localhost:8005/docs`

3. **Deberías ver:**
   - Swagger UI con todos los endpoints
   - Documentación interactiva de la API
   - Posibilidad de probar endpoints directamente

4. **Prueba un endpoint:**
   - Busca `GET /health`
   - Click en **"Try it out"**
   - Click en **"Execute"**
   - ✅ Deberías ver respuesta 200 OK

---

## 🧪 TESTING RÁPIDO DESDE LA TERMINAL

Si prefieres probar desde la terminal:

### Test 1: Verificar Backend
```bash
curl http://localhost:8005/health
```
**Resultado esperado:** JSON con `"status": "ok"`

### Test 2: Verificar Admin Panel
```bash
curl http://localhost:7001/api/health
```
**Resultado esperado:** JSON con `"status": "ok"`

### Test 3: Hacer Login desde Terminal
```bash
curl -X POST http://localhost:8005/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "admin@zgamersa.com",
    "password": "Admin123!"
  }'
```
**Resultado esperado:** JSON con `accessToken` y datos del usuario

### Test 4: Obtener Lista de Clientes (con token)
```bash
# Primero hacer login y obtener token
TOKEN=$(curl -s -X POST http://localhost:8005/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@zgamersa.com","password":"Admin123!"}' \
  | jq -r '.data.accessToken')

# Luego obtener clientes
curl -H "Authorization: Bearer $TOKEN" http://localhost:8005/api/customers
```
**Resultado esperado:** JSON con array de clientes

---

## 🎥 VIDEO GUÍA (Paso a Paso Visual)

### Grabación Recomendada:

1. **Grabar tu pantalla** mientras sigues estos pasos:
   - Abrir navegador
   - Ir a http://localhost:7001
   - Hacer login
   - Explorar dashboard
   - Crear un cliente
   - Crear un plato
   - Crear un pedido

2. **Esto te servirá para:**
   - Entrenar a tu equipo
   - Mostrar a clientes potenciales
   - Documentación visual

---

## ⚠️ PROBLEMAS COMUNES

### ❌ "No se puede acceder a localhost:7001"

**Solución:**
```bash
# Verificar que el servicio está corriendo
docker ps | grep admin

# Si no está, iniciarlo
docker start chatbotdysa-admin

# Ver logs si hay error
docker logs chatbotdysa-admin
```

### ❌ "Credenciales inválidas" o "Demasiados intentos"

**Solución:**
```bash
# Esperar 2 minutos (rate limiting de seguridad)
# O limpiar el cache de Redis:
docker exec chatbotdysa-redis redis-cli FLUSHALL
```

### ❌ "La página tarda mucho en cargar"

**Solución:**
```bash
# Verificar recursos del sistema
docker stats

# Si hay poco RAM, reiniciar Docker Desktop
```

---

## 📱 ACCESO DESDE OTROS DISPOSITIVOS

Para acceder desde tu celular o tablet en la misma red:

1. **Obtener IP de tu computadora:**
   ```bash
   # En Mac/Linux:
   ifconfig | grep "inet " | grep -v 127.0.0.1

   # En Windows:
   ipconfig
   ```

2. **Acceder desde otro dispositivo:**
   ```
   http://TU_IP:7001    # Admin Panel
   http://TU_IP:3004    # Landing Page
   ```

   Ejemplo:
   ```
   http://192.168.1.100:7001
   ```

---

## 🎯 CHECKLIST DE VERIFICACIÓN

Marca cada item cuando lo pruebes:

- [ ] ✅ Puedo acceder a http://localhost:7001
- [ ] ✅ Puedo hacer login con las credenciales
- [ ] ✅ Veo el Dashboard con estadísticas
- [ ] ✅ Puedo crear un cliente nuevo
- [ ] ✅ Puedo ver la lista de clientes
- [ ] ✅ Puedo crear un item de menú
- [ ] ✅ Puedo ver el menú completo
- [ ] ✅ Puedo crear un pedido
- [ ] ✅ Puedo ver la lista de pedidos
- [ ] ✅ Puedo acceder al AI Chat
- [ ] ✅ El AI Chat responde correctamente
- [ ] ✅ Puedo acceder a http://localhost:3004 (Landing)
- [ ] ✅ Puedo acceder a http://localhost:8005/docs (API)

---

## 📸 CAPTURAS RECOMENDADAS

Toma capturas de pantalla de:

1. ✅ Página de login
2. ✅ Dashboard principal
3. ✅ Lista de clientes
4. ✅ Formulario de crear cliente
5. ✅ Lista de menú
6. ✅ Lista de pedidos
7. ✅ AI Chat funcionando
8. ✅ Landing page

**Estas capturas te servirán para:**
- Mostrar a potenciales clientes
- Documentación
- Presentaciones
- Material de marketing

---

## 🚀 SIGUIENTE PASO

Una vez que hayas probado todo y confirmes que funciona:

1. **Tomar capturas de pantalla**
2. **Listar qué funciona y qué necesitas cambiar**
3. **Decidir si está listo para mostrar a restaurantes**

---

## 💡 TIPS IMPORTANTES

### Para Demos a Restaurantes:

1. **Prepara datos de ejemplo:**
   - 5-10 clientes ficticios
   - 10-15 platos del menú
   - 3-5 pedidos de ejemplo

2. **Cambia el logo y colores** (si el tiempo lo permite)

3. **Practica la demo varias veces** antes de mostrarla

4. **Ten listo el speech:**
   - "Este es el panel donde gestionas TODO"
   - "Aquí ves tus clientes y su historial"
   - "El AI Chat ayuda a atender 24/7"

---

## 📞 ¿NECESITAS AYUDA?

Si algo no funciona:

1. **Revisar logs:**
   ```bash
   docker logs chatbotdysa-admin
   docker logs chatbotdysa-backend
   ```

2. **Reiniciar servicios:**
   ```bash
   docker restart chatbotdysa-admin
   docker restart chatbotdysa-backend
   ```

3. **Ver el archivo:** `/docs/TROUBLESHOOTING.md`

---

**¡Listo! Ahora puedes entrar y probar el sistema completo.** 🎉

**Abre tu navegador y ve a: http://localhost:7001**
