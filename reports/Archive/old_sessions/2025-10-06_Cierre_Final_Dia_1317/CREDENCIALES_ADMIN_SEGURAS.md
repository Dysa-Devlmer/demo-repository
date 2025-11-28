# Credenciales de Administrador - ChatBotDysa Enterprise

**Fecha de Actualización:** 2025-10-06 13:17 PM
**Razón:** Corrección de vulnerabilidad de seguridad crítica
**Estado:** ✅ PASSWORD ACTUALIZADO EN BASE DE DATOS

---

## 🔐 CREDENCIALES DE ACCESO

### Admin Panel
**URL:** http://localhost:7001 (desarrollo) / https://admin.chatbotdysa.com (producción)

**Email:**
```
admin@zgamersa.com
```

**Password:**
```
VvuOayZOstHMhxEb6Lb/6haZYRFZMr8qoaUXb3fuuZM=
```

**Rol:** Administrador (acceso completo)
**Permisos:** 35 permisos (todos los módulos)

---

## ⚠️ SEGURIDAD

### Características del Password

- **Longitud:** 44 caracteres
- **Entropía:** 256 bits
- **Generado con:** OpenSSL (`openssl rand -base64 32`)
- **Hash bcrypt:** `$2b$10$6bbXrkSLMsqkAcLbAi/8eu3fAO7YhV61HVtC5NPonRpJKiqFECq5q`
- **Fecha de creación:** 2025-10-06 13:17 PM

### Historial de Passwords

| Fecha | Password | Estado | Razón |
|-------|----------|--------|-------|
| < 2025-10-06 | `Admin123!` | ❌ COMPROMETIDO | Expuesto en frontend |
| 2025-10-06 13:07 | (temporal) | ❌ TEMPORAL | Corrección inicial |
| 2025-10-06 13:17 | `VvuOayZOstHM...` | ✅ ACTUAL | Password seguro definitivo |

---

## 📋 INSTRUCCIONES DE USO

### Primera Vez

1. **Acceder al Admin Panel**
   - Abrir: http://localhost:7001 (o URL de producción)
   - Ingresar email: `admin@zgamersa.com`
   - Ingresar password: `VvuOayZOstHMhxEb6Lb/6haZYRFZMr8qoaUXb3fuuZM=`
   - Click en "Iniciar Sesión"

2. **Verificar Acceso**
   - Deberías ver el dashboard principal
   - Verificar que tienes acceso a todos los módulos:
     - Dashboard
     - Clientes
     - Pedidos
     - Menú
     - Reservaciones
     - Conversaciones
     - Configuración
     - Usuarios
     - Roles

3. **Cambiar Password (Recomendado)**
   - Ir a "Configuración" → "Mi Perfil"
   - Click en "Cambiar Contraseña"
   - Ingresar password actual (el de este documento)
   - Ingresar nuevo password (mínimo 12 caracteres)
   - Guardar cambios

### Login Vía API

```bash
curl -X POST http://localhost:8005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@zgamersa.com",
    "password": "VvuOayZOstHMhxEb6Lb/6haZYRFZMr8qoaUXb3fuuZM="
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "admin@zgamersa.com",
      "roles": ["admin"]
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600
  }
}
```

---

## 🛡️ POLÍTICAS DE SEGURIDAD

### Manejo del Password

- ❌ **NO compartir** por email no cifrado
- ❌ **NO guardar** en archivos sin cifrar
- ❌ **NO usar** en múltiples sistemas
- ✅ **SÍ guardar** en gestor de passwords (1Password, LastPass, Bitwarden)
- ✅ **SÍ compartir** por canal seguro (Signal, WhatsApp cifrado)
- ✅ **SÍ cambiar** cada 90 días

### Recomendaciones

1. **Usar Gestor de Passwords**
   - 1Password (recomendado para empresas)
   - LastPass
   - Bitwarden (open source)

2. **Habilitar 2FA (Próxima Implementación)**
   - Autenticación de dos factores
   - Google Authenticator / Authy
   - Códigos SMS de respaldo

3. **Cambiar Password Regularmente**
   - Cada 90 días (recomendado)
   - Inmediatamente si hay sospecha de compromiso
   - Después de acceso desde dispositivo desconocido

4. **Monitorear Accesos**
   - Revisar logs de audit_logs
   - Verificar IPs de acceso
   - Alertar accesos fuera de horario

---

## 📊 Permisos del Administrador

El usuario `admin@zgamersa.com` tiene **35 permisos** que incluyen:

### Dashboard (2)
- `dashboard.read` - Ver métricas
- `dashboard.manage` - Gestionar dashboard

### Clientes (5)
- `customers.create` - Crear clientes
- `customers.read` - Ver clientes
- `customers.update` - Actualizar clientes
- `customers.delete` - Eliminar clientes
- `customers.export` - Exportar datos

### Pedidos (4)
- `orders.create` - Crear pedidos
- `orders.read` - Ver pedidos
- `orders.update` - Actualizar pedidos
- `orders.delete` - Eliminar pedidos

### Menú (4)
- `menu.create` - Crear items
- `menu.read` - Ver menú
- `menu.update` - Actualizar items
- `menu.delete` - Eliminar items

### Reservaciones (4)
- `reservations.create` - Crear reservas
- `reservations.read` - Ver reservas
- `reservations.update` - Actualizar reservas
- `reservations.delete` - Eliminar reservas

### Conversaciones (2)
- `conversations.read` - Ver conversaciones
- `conversations.manage` - Gestionar chat IA

### Configuración (2)
- `settings.read` - Ver configuración
- `settings.update` - Modificar configuración

### Usuarios (4)
- `users.create` - Crear usuarios
- `users.read` - Ver usuarios
- `users.update` - Actualizar usuarios
- `users.delete` - Eliminar usuarios

### Roles (4)
- `roles.create` - Crear roles
- `roles.read` - Ver roles
- `roles.update` - Actualizar roles
- `roles.delete` - Eliminar roles

### Sistema (1)
- `system.manage` - Gestión completa

### Reportes (2)
- `reports.read` - Ver reportes
- `reports.export` - Exportar reportes

### Auditoría (1)
- `audit.read` - Ver logs de auditoría

---

## 🔄 Rotación de Password

### Próximas Fechas de Cambio

| Fecha | Acción | Estado |
|-------|--------|--------|
| 2025-10-06 | Password actualizado | ✅ Completado |
| 2026-01-04 | Cambio de password (90 días) | ⏳ Pendiente |
| 2026-04-04 | Cambio de password (180 días) | ⏳ Pendiente |

### Procedimiento de Cambio

1. **Generar nuevo password**
   ```bash
   openssl rand -base64 32
   ```

2. **Generar hash bcrypt**
   ```bash
   node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('NUEVO_PASSWORD', 10).then(console.log);"
   ```

3. **Actualizar en base de datos**
   ```sql
   UPDATE users
   SET password = 'NUEVO_HASH_AQUI'
   WHERE id = 1;
   ```

4. **Actualizar este documento**
   - Fecha de actualización
   - Nuevo password
   - Historial de passwords

---

## 📞 Soporte

### En Caso de Problema

**Password no funciona:**
1. Verificar que no hay espacios al copiar/pegar
2. Verificar que estás en el ambiente correcto (dev/prod)
3. Verificar en base de datos:
   ```sql
   SELECT id, email, LEFT(password, 20) FROM users WHERE id = 1;
   ```

**Cuenta bloqueada:**
1. Verificar logs de auditoría
2. Contactar al administrador del sistema
3. Revisar rate limiting (5 intentos por 15 min)

**Olvidé el password:**
1. Usar el procedimiento de "Rotación de Password" arriba
2. Generar nuevo password seguro
3. Actualizar en base de datos

---

## 📄 Historial de Cambios

| Fecha | Versión | Cambios |
|-------|---------|---------|
| 2025-10-06 13:17 | 1.0.0 | Documento inicial con password seguro |

---

## ⚠️ ADVERTENCIAS FINALES

### ESTE DOCUMENTO CONTIENE INFORMACIÓN SENSIBLE

- 🔴 **NO compartir** públicamente
- 🔴 **NO subir** a Git
- 🔴 **NO enviar** por email no cifrado
- 🔴 **NO dejar** en computadora compartida
- ✅ **SÍ guardar** en lugar seguro
- ✅ **SÍ cifrar** si es necesario compartir
- ✅ **SÍ eliminar** después de guardar en gestor de passwords

### Archivo protegido

**Permisos recomendados:**
```bash
chmod 600 CREDENCIALES_ADMIN_SEGURAS.md
chown admin:admin CREDENCIALES_ADMIN_SEGURAS.md
```

**Ubicación segura:**
- `/Reportes/Sesiones/2025-10-06_Cierre_Final_Dia_1317/`
- Backup cifrado en lugar seguro
- Gestor de passwords (recomendado)

---

**Documento generado:** 2025-10-06 13:17 PM
**Estado:** ✅ PASSWORD ACTUALIZADO Y SEGURO
**Próxima acción:** Guardar en gestor de passwords y eliminar este archivo

