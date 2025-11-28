# 🚀 Quick Start - Acceso Rápido para Probar ChatBotDysa

**Tiempo estimado**: 5 minutos

---

## 📍 ACCESO DIRECTO

### 🔗 URLs:

```
🏢 Panel de Administración:  http://localhost:7001
🌐 Landing Page (Público):   http://localhost:3004
🔌 Backend API:              http://localhost:8005
```

### 🔑 Credenciales:

```
📧 Email:    admin@zgamersa.com
🔒 Password: admin123
```

---

## ⚡ 3 PASOS RÁPIDOS

### 1️⃣ Abrir Panel de Admin

```bash
# Abre tu navegador y ve a:
http://localhost:7001

# O ejecuta en terminal:
open http://localhost:7001
```

### 2️⃣ Iniciar Sesión

```
Email: admin@zgamersa.com
Password: admin123
```

### 3️⃣ Explorar el Dashboard

Ya estás dentro! Verás:
- 📊 Estadísticas del día
- 👥 Clientes recientes
- 🛒 Pedidos activos
- 💬 Conversaciones

---

## 🧪 PRUEBA RÁPIDA

### Opción A: Probar el Chat desde la Landing Page

```bash
# Abre en otra pestaña:
open http://localhost:3004

# Click en el botón de chat (💬)
# Escribe: "Hola, quiero ver el menú"
```

### Opción B: Probar con cURL

```bash
# Obtener JWT
curl -X POST http://localhost:8005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@zgamersa.com",
    "password": "admin123"
  }'

# Usar el token para ver el menú
JWT="<token-aqui>"
curl -H "Authorization: Bearer $JWT" \
  http://localhost:8005/api/menu
```

---

## 📋 FUNCIONALIDADES PRINCIPALES

### ✅ Lo que puedes hacer:

1. **Ver Dashboard**
   - Estadísticas en tiempo real
   - Gráficas de actividad

2. **Gestionar Menú**
   - Ver platillos
   - Agregar nuevos
   - Editar precios

3. **Ver Pedidos**
   - Pedidos activos
   - Historial
   - Cambiar estados

4. **Conversaciones**
   - Ver chats con clientes
   - Intervenir manualmente
   - Revisar historial

5. **Estadísticas**
   - Ventas del día/semana
   - Platillos más vendidos
   - Horarios pico

6. **Configuración**
   - Personalizar bot
   - Ajustar integraciones

---

## 🎯 CASOS DE USO RÁPIDOS

### Caso 1: Ver el Menú
1. Panel → 📋 Menú
2. Verás todos los platillos

### Caso 2: Crear un Pedido de Prueba
1. Landing Page → Chat
2. "Quiero ordenar tacos"
3. Panel → Ver nuevo pedido

### Caso 3: Revisar Estadísticas
1. Panel → 📊 Estadísticas
2. Ver métricas del día

---

## 🆘 PROBLEMAS?

### El panel no carga?
```bash
# Verifica servicios
docker ps | grep chatbotdysa

# Si no están activos
cd /Users/devlmer/ChatBotDysa
docker-compose up -d
```

### Olvidaste las credenciales?
```
Email: admin@zgamersa.com
Password: admin123
```

---

## 📚 SIGUIENTE PASO

**Lee la guía completa**: `01_GUIA_COMPLETA_DUENO_RESTAURANTE.md`

---

✅ **¡Ya estás listo para probar ChatBotDysa!**
