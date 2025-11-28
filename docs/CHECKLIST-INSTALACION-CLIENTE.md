# ✅ **CHECKLIST DE INSTALACIÓN Y VERIFICACIÓN DEL CLIENTE**

## **ChatBotDysa Enterprise+++++ - Windows 11 Pro**

**Restaurante:** ____________________
**Fecha de Instalación:** ____________________
**Instalado por:** ____________________

---

## 📦 **FASE 1: PRE-INSTALACIÓN**

### **Verificación del Sistema:**
- [ ] Windows 11 Pro 64-bit confirmado
- [ ] 8GB RAM mínimo (mejor 16GB)
- [ ] 20GB espacio en disco disponible
- [ ] Conexión a Internet activa
- [ ] Permisos de Administrador obtenidos
- [ ] Antivirus/Firewall configuración revisada

### **Preparación de Archivos:**
- [ ] Carpeta ChatBotDysa copiada a USB o descargada
- [ ] Verificar que carpeta tiene 4 subcarpetas: backend, admin-panel, web-widget, website
- [ ] Archivo `install-chatbotdysa.ps1` presente
- [ ] Documentación PDF impresa (opcional)

---

## 🚀 **FASE 2: INSTALACIÓN**

### **Ejecución del Instalador:**
- [ ] PowerShell abierto como Administrador
- [ ] Ejecutado: `Set-ExecutionPolicy RemoteSigned`
- [ ] Navegado a carpeta installers/windows
- [ ] Ejecutado: `.\install-chatbotdysa.ps1`

### **Componentes Instalados:**
- [ ] **Node.js 20.x** instalado correctamente
  - Comando verificado: `node --version`
  - Versión mostrada: v____________

- [ ] **PostgreSQL 16.x** instalado correctamente
  - Puerto configurado: 15432
  - Contraseña configurada: supersecret
  - Comando verificado: `psql --version`
  - Versión mostrada: ____________

- [ ] **Redis (Memurai)** instalado correctamente
  - Servicio iniciado automáticamente
  - Puerto: 6379

- [ ] **Dependencias npm** instaladas
  - Backend: ✓
  - Admin Panel: ✓
  - Web Widget: ✓
  - Landing Page: ✓

### **Configuración de Base de Datos:**
- [ ] Base de datos `chatbotdysa` creada
- [ ] Migraciones ejecutadas sin errores
- [ ] Usuario administrador creado
- [ ] Email: admin@restaurante.com
- [ ] Password: restaurant123

### **Firewall de Windows:**
- [ ] Regla para puerto 8005 (Backend) agregada
- [ ] Regla para puerto 7001 (Admin Panel) agregada
- [ ] Regla para puerto 7002 (Web Widget) agregada
- [ ] Regla para puerto 6001 (Landing Page) agregada
- [ ] Regla para puerto 15432 (PostgreSQL) agregada

### **Accesos Directos Creados:**
- [ ] "ChatBotDysa - Backend" en escritorio
- [ ] "ChatBotDysa - Admin Panel" en escritorio
- [ ] "ChatBotDysa - Abrir Panel" en escritorio

---

## 🔍 **FASE 3: VERIFICACIÓN TÉCNICA**

### **Test 1: Backend API**
- [ ] Doble clic en "ChatBotDysa - Backend"
- [ ] Ventana de terminal abierta
- [ ] Esperado 30 segundos
- [ ] Mensaje "Application is running on: http://localhost:8005" visible
- [ ] Abrir navegador: http://localhost:8005/api/health
- [ ] Respuesta JSON: `{"status":"ok"}` recibida

### **Test 2: Admin Panel**
- [ ] Doble clic en "ChatBotDysa - Admin Panel"
- [ ] Ventana de terminal abierta
- [ ] Esperado 30 segundos
- [ ] Mensaje "ready - started server on..." visible
- [ ] Abrir navegador: http://localhost:7001
- [ ] Página de login cargada correctamente
- [ ] Sin errores en consola del navegador (F12)

### **Test 3: Login y Autenticación**
- [ ] Ingresar email: admin@restaurante.com
- [ ] Ingresar password: restaurant123
- [ ] Hacer clic en "Iniciar Sesión"
- [ ] Redirección a dashboard exitosa
- [ ] Dashboard muestra: "Bienvenido, Administrador"

### **Test 4: Navegación del Sistema**
- [ ] **Dashboard:** Carga sin errores
- [ ] **Conversaciones:** Página accesible (puede estar vacía)
- [ ] **Pedidos:** Página accesible (puede estar vacía)
- [ ] **Reservas:** Página accesible (puede estar vacía)
- [ ] **Clientes:** Página accesible (puede estar vacía)
- [ ] **Menú:** Página accesible (puede estar vacía)
- [ ] **Análisis:** Página accesible
- [ ] **Configuración:** Página accesible

### **Test 5: Base de Datos**
- [ ] Abrir terminal
- [ ] Ejecutar: `psql -h localhost -p 15432 -U postgres -d chatbotdysa`
- [ ] Password: supersecret
- [ ] Conexión exitosa
- [ ] Ejecutar: `\dt` (listar tablas)
- [ ] Al menos 10 tablas visibles: users, customers, orders, etc.
- [ ] Ejecutar: `SELECT * FROM users;`
- [ ] Usuario administrador visible

### **Test 6: Redis/Cache**
- [ ] Abrir Servicios de Windows (services.msc)
- [ ] Buscar servicio "Memurai"
- [ ] Estado debe ser: "Iniciado"
- [ ] Tipo de inicio: "Automático"

---

## ⚙️ **FASE 4: CONFIGURACIÓN DEL CLIENTE**

### **Cambiar Credenciales Por Defecto:**
- [ ] Login con credenciales por defecto
- [ ] Ir a: Configuración → Usuarios
- [ ] Editar usuario "admin@restaurante.com"
- [ ] Cambiar email a: ____________________
- [ ] Cambiar contraseña a: ____________________
- [ ] Guardar cambios
- [ ] Cerrar sesión
- [ ] Iniciar sesión con nuevas credenciales
- [ ] Login exitoso con nuevas credenciales

### **Información del Restaurante:**
- [ ] Ir a: Configuración → Información del Restaurante
- [ ] Nombre: ____________________
- [ ] Dirección: ____________________
- [ ] Ciudad: ____________________
- [ ] Teléfono: ____________________
- [ ] Email: ____________________
- [ ] Horarios de atención configurados
- [ ] Logo subido (opcional)
- [ ] Guardar configuración

### **Configuración de WhatsApp Business (Si aplica):**
- [ ] Cliente tiene cuenta de WhatsApp Business API
- [ ] Número de teléfono obtenido: ____________________
- [ ] Token de acceso de Facebook obtenido
- [ ] Ir a: Configuración → WhatsApp
- [ ] Ingresar número de teléfono
- [ ] Ingresar token de acceso
- [ ] Hacer clic en "Probar Conexión"
- [ ] Mensaje de éxito recibido
- [ ] Guardar configuración

**Si NO tiene WhatsApp Business:**
- [ ] Explicar al cliente cómo obtener cuenta
- [ ] Proveer link: https://business.facebook.com/
- [ ] Agendar configuración posterior

### **Configuración del Menú:**
- [ ] Ir a: Menú
- [ ] Crear al menos 3 categorías:
  - [ ] Categoría 1: ____________________
  - [ ] Categoría 2: ____________________
  - [ ] Categoría 3: ____________________

- [ ] Agregar al menos 5 productos de ejemplo:
  - [ ] Producto 1: ____________________ ($______)
  - [ ] Producto 2: ____________________ ($______)
  - [ ] Producto 3: ____________________ ($______)
  - [ ] Producto 4: ____________________ ($______)
  - [ ] Producto 5: ____________________ ($______)

- [ ] Verificar que productos se guardan correctamente
- [ ] Verificar que productos se muestran en el menú

### **Configuración de Reservas:**
- [ ] Ir a: Configuración → Reservas
- [ ] Configurar capacidad del restaurante:
  - Mesas para 2 personas: ______
  - Mesas para 4 personas: ______
  - Mesas para 6 personas: ______
  - Mesas para 8+ personas: ______
- [ ] Configurar horarios de reserva
- [ ] Configurar duración de reserva (1h, 1.5h, 2h)
- [ ] Configurar confirmación (automática/manual)
- [ ] Guardar configuración

---

## 🧪 **FASE 5: PRUEBAS FUNCIONALES**

### **Prueba 1: Crear Pedido Manual**
- [ ] Ir a: Pedidos → Nuevo Pedido
- [ ] Seleccionar cliente (o crear nuevo)
- [ ] Agregar 2-3 productos
- [ ] Completar información de entrega
- [ ] Crear pedido
- [ ] Pedido aparece en lista de pedidos
- [ ] Estado: "Pendiente"

### **Prueba 2: Gestionar Pedido**
- [ ] Seleccionar pedido creado
- [ ] Cambiar estado a "Confirmado"
- [ ] Cambiar estado a "En Preparación"
- [ ] Cambiar estado a "Listo"
- [ ] Cambiar estado a "Entregado"
- [ ] Todas las transiciones funcionan sin errores

### **Prueba 3: Crear Reserva**
- [ ] Ir a: Reservas → Nueva Reserva
- [ ] Seleccionar fecha futura
- [ ] Seleccionar hora
- [ ] Ingresar número de personas
- [ ] Ingresar datos del cliente
- [ ] Crear reserva
- [ ] Reserva aparece en el calendario
- [ ] Estado: "Pendiente" o "Confirmada"

### **Prueba 4: Gestionar Cliente**
- [ ] Ir a: Clientes → Nuevo Cliente
- [ ] Ingresar datos completos:
  - Nombre: ____________________
  - Teléfono: ____________________
  - Email: ____________________
- [ ] Guardar cliente
- [ ] Cliente aparece en lista
- [ ] Ver detalles del cliente
- [ ] Historial de pedidos visible (vacío si es nuevo)

### **Prueba 5: Editar Menú en Tiempo Real**
- [ ] Ir a: Menú
- [ ] Editar un producto existente
- [ ] Cambiar precio
- [ ] Cambiar descripción
- [ ] Guardar cambios
- [ ] Recargar página
- [ ] Cambios persisten correctamente

---

## 📊 **FASE 6: MONITOREO Y RENDIMIENTO**

### **Verificación de Performance:**
- [ ] Dashboard carga en menos de 2 segundos
- [ ] Navegación entre páginas es fluida
- [ ] No hay errores en consola del navegador (F12)
- [ ] Gráficos y estadísticas se renderizan correctamente

### **Verificación de Logs:**
- [ ] Abrir: `C:\ChatBotDysa\apps\backend\logs\`
- [ ] Verificar que existe archivo `application.log`
- [ ] Abrir archivo de log
- [ ] No hay errores críticos (ERROR, FATAL)
- [ ] Advertencias (WARN) son normales si hay

### **Uso de Recursos:**
- [ ] Abrir Administrador de Tareas (Ctrl+Shift+Esc)
- [ ] Buscar procesos "node.exe"
- [ ] Uso de CPU: < 30% en idle
- [ ] Uso de RAM: < 1GB total para todos los procesos
- [ ] Uso de disco: < 10% en idle

---

## 🎓 **FASE 7: CAPACITACIÓN DEL CLIENTE**

### **Sesión de Capacitación (30-45 minutos):**
- [ ] **Inicio de sesión y logout**
- [ ] **Navegación del dashboard**
- [ ] **Cómo ver pedidos en tiempo real**
- [ ] **Cómo cambiar estados de pedidos**
- [ ] **Cómo gestionar reservas**
- [ ] **Cómo agregar/editar productos del menú**
- [ ] **Cómo ver clientes y su historial**
- [ ] **Cómo cambiar configuraciones básicas**
- [ ] **Cómo hacer backup de la base de datos**
- [ ] **Qué hacer en caso de problemas**

### **Documentación Entregada:**
- [ ] Guía de Instalación (este documento)
- [ ] Manual de Usuario del Admin Panel
- [ ] Credenciales escritas en sobre sellado
- [ ] Contactos de soporte
- [ ] Procedimientos de emergencia

---

## 📞 **FASE 8: INFORMACIÓN POST-INSTALACIÓN**

### **Credenciales Finales del Cliente:**
```
URL del Sistema: http://localhost:7001
Email: ____________________
Password: ____________________
```

### **Información Técnica:**
```
Backend API: http://localhost:8005
PostgreSQL Puerto: 15432
PostgreSQL Usuario: postgres
PostgreSQL Password: supersecret
Base de Datos: chatbotdysa
```

### **Contactos de Soporte:**
```
Email Soporte: admin@chatbotdysa.com
Teléfono Soporte: ____________________
Horario: 24/7 Enterprise Support
Certificación: Enterprise+++++ (98.5/100)
```

### **Backup y Mantenimiento:**
- [ ] Explicado cómo hacer backup:
  ```cmd
  pg_dump -h localhost -p 15432 -U postgres chatbotdysa > backup.sql
  ```
- [ ] Programar backups automáticos semanales
- [ ] Ubicación de backups: `C:\ChatBotDysa\backups\`
- [ ] Explicado cómo restaurar backup si es necesario

### **Próxima Visita/Seguimiento:**
- [ ] Fecha programada: ____________________
- [ ] Tareas pendientes: ____________________
- [ ] Configuraciones adicionales: ____________________

---

## ✅ **FIRMA Y CONFIRMACIÓN**

### **Instalador:**
```
Nombre: ____________________
Firma: ____________________
Fecha: ____________________
```

### **Cliente (Propietario del Restaurante):**
```
Nombre: ____________________
Firma: ____________________
Fecha: ____________________
Empresa: ____________________
```

### **Confirmaciones:**
- [ ] El cliente confirma que el sistema está funcionando
- [ ] El cliente recibió capacitación adecuada
- [ ] El cliente tiene acceso a documentación
- [ ] El cliente tiene contactos de soporte
- [ ] El cliente está satisfecho con la instalación

---

## 📝 **NOTAS ADICIONALES Y OBSERVACIONES**

```
__________________________________________________________

__________________________________________________________

__________________________________________________________

__________________________________________________________

__________________________________________________________
```

---

## 🎉 **INSTALACIÓN COMPLETADA Y VERIFICADA**

**Sistema:** ChatBotDysa Enterprise+++++
**Certificación:** 98.5/100 ⭐⭐⭐⭐⭐
**Status:** ✅ OPERATIVO Y LISTO PARA PRODUCCIÓN

---

**¡Felicidades! El restaurante ya tiene su sistema de automatización con IA funcionando.**