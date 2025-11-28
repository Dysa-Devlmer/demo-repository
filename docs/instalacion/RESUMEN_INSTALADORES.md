# 📦 RESUMEN DE INSTALADORES - ChatBotDysa Enterprise+++++

**Para instalación en restaurantes de clientes REALES con Windows**

---

## 🎯 QUÉ NECESITAS SABER

Tienes **UN SOLO INSTALADOR** que sirve para **TODOS LOS CLIENTES**:

### **USB_INSTALLER/** (El único que necesitas)

Este instalador:
- ✅ Se copia a una USB de 4GB+
- ✅ Instala TODO desde cero en Windows (Node.js, PostgreSQL, Git, etc.)
- ✅ Sirve para CUALQUIER cliente (Don Luigi, Sabores de Chile, Burger Express, etc.)
- ✅ Pregunta los datos REALES del cliente en el momento de la instalación
- ✅ Soporta restaurantes con múltiples sucursales

---

## 📂 RUTAS EXACTAS DE LOS ARCHIVOS

### **En tu Mac de desarrollo:**

```
/Users/devlmer/ChatBotDysa/INSTALADORES_CLIENTES/
│
├── USB_INSTALLER/                          ← EL ÚNICO INSTALADOR
│   ├── README.md                           ← Guía completa del instalador
│   ├── INSTRUCCIONES_PREPARAR_USB.md       ← Cómo preparar la USB paso a paso
│   │
│   └── scripts/                            ← Scripts de Windows (.bat)
│       ├── install-windows.bat             ← Instalador automático principal
│       ├── start-system.bat                ← Iniciar sistema
│       ├── stop-system.bat                 ← Detener sistema
│       ├── create-client.bat               ← Crear cliente (con sucursales)
│       └── verify-system.bat               ← Verificar que todo funcione
│
├── INSTALADOR_MASTER/                      ← Instalador para Mac (opcional)
│   ├── install-client.sh                   ← Para instalar desde Mac
│   └── README.md                           ← Guía
│
├── DON_LUIGI/                              ← Solo documentación de ejemplo
├── SABORES_CHILE/                          ← Solo documentación de ejemplo
├── BURGER_EXPRESS/                         ← Solo documentación de ejemplo
│
└── RESUMEN_INSTALADORES.md                 ← Este archivo
```

---

## 📋 PROCESO COMPLETO (Paso a Paso)

### **ANTES de ir al restaurante:**

#### 1. Preparar USB (una sola vez)

Ejecuta desde tu Mac:

```bash
# 1. Descargar instaladores de Windows:
# - Node.js 20: https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi
# - PostgreSQL 16: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
# - Git: https://git-scm.com/download/win

# 2. Crear estructura en USB (reemplaza TU_USB con el nombre de tu USB)
USB_PATH="/Volumes/TU_USB"
mkdir -p "$USB_PATH/ChatBotDysa_Installer/1_INSTALADORES_BASE"
mkdir -p "$USB_PATH/ChatBotDysa_Installer/2_CODIGO_FUENTE"
mkdir -p "$USB_PATH/ChatBotDysa_Installer/3_CONFIGURACION"
mkdir -p "$USB_PATH/ChatBotDysa_Installer/4_DOCUMENTACION"
mkdir -p "$USB_PATH/ChatBotDysa_Installer/5_MATERIALES"

# 3. Copiar instaladores descargados
cp ~/Downloads/node-v20.11.0-x64.msi \
   "$USB_PATH/ChatBotDysa_Installer/1_INSTALADORES_BASE/"

cp ~/Downloads/postgresql-*-windows-x64.exe \
   "$USB_PATH/ChatBotDysa_Installer/1_INSTALADORES_BASE/"

cp ~/Downloads/git-*-64-bit.exe \
   "$USB_PATH/ChatBotDysa_Installer/1_INSTALADORES_BASE/"

# 4. Copiar código fuente (SIN node_modules)
cp -r /Users/devlmer/ChatBotDysa \
      "$USB_PATH/ChatBotDysa_Installer/2_CODIGO_FUENTE/"

find "$USB_PATH/ChatBotDysa_Installer/2_CODIGO_FUENTE" \
     -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null

find "$USB_PATH/ChatBotDysa_Installer/2_CODIGO_FUENTE" \
     -name ".next" -type d -exec rm -rf {} + 2>/dev/null

# 5. Copiar scripts de configuración
cp /Users/devlmer/ChatBotDysa/INSTALADORES_CLIENTES/USB_INSTALLER/scripts/*.bat \
   "$USB_PATH/ChatBotDysa_Installer/3_CONFIGURACION/"

# 6. Copiar README
cp /Users/devlmer/ChatBotDysa/INSTALADORES_CLIENTES/USB_INSTALLER/README.md \
   "$USB_PATH/ChatBotDysa_Installer/"

echo "✅ USB preparada y lista para usar"
```

#### 2. Verificar USB está completa

```bash
# Ver estructura
tree "$USB_PATH/ChatBotDysa_Installer" -L 2

# Ver tamaño (~1-2 GB)
du -sh "$USB_PATH/ChatBotDysa_Installer"
```

#### 3. Checklist antes de salir

```
□ USB preparada con todo el contenido
□ Laptop cargada (100% batería)
□ Tether de internet móvil como backup
□ Tarjetas de presentación
□ Contratos en blanco para firmar
□ Material de marketing (QR codes, carteles)
□ Impresora portátil o acceso a impresora del cliente
□ Lista de datos que necesitas del cliente:
  □ Nombre exacto del restaurante
  □ Email del administrador
  □ Número WhatsApp Business
  □ RUT (opcional)
  □ ¿Tiene sucursales? ¿Cuántas?
```

---

### **EN el restaurante del cliente:**

#### PASO 1: Verificar PC del cliente (5 min)

```
Requisitos:
□ Windows 10 o Windows 11
□ 8 GB RAM (mínimo 4 GB)
□ 50 GB espacio libre en disco
□ Usuario con permisos de administrador
□ Conexión a internet (solo para setup inicial)
```

#### PASO 2: Copiar instalador al escritorio (10 min)

```
1. Conectar USB a la PC del cliente
2. Copiar: USB:\ChatBotDysa_Installer
3. Pegar en: C:\Users\[usuario]\Desktop\
   (Esto toma 5-10 minutos dependiendo de la velocidad de USB)
```

#### PASO 3: Ejecutar instalador automático (30 min)

```
1. Ir a: Desktop\ChatBotDysa_Installer\3_CONFIGURACION\
2. Click derecho en: install-windows.bat
3. Seleccionar: "Ejecutar como administrador"
4. Esperar 20-30 minutos (instala Node.js, PostgreSQL, Git, dependencias)
```

El instalador hará automáticamente:
- ✅ Instalar Node.js 20 LTS
- ✅ Instalar PostgreSQL 16 (puerto 15432, password: supersecret)
- ✅ Instalar Git para Windows
- ✅ Copiar código a `C:\ChatBotDysa\`
- ✅ Crear base de datos `chatbotdysa`
- ✅ Ejecutar migraciones
- ✅ Instalar dependencias (npm install en cada app)
- ✅ Configurar variables de entorno
- ✅ Crear accesos directos en el escritorio:
  - Iniciar ChatBotDysa
  - Detener ChatBotDysa
  - Admin Panel
  - Crear Cliente Nuevo
  - Verificar Sistema

#### PASO 4: Iniciar el sistema (2 min)

```
1. Doble click en: "Iniciar ChatBotDysa" (escritorio)
2. Esperar 15 segundos mientras inician todos los servicios
3. Se abrirá automáticamente el navegador en http://localhost:7001
```

Servicios que inician:
- ✅ PostgreSQL (puerto 15432)
- ✅ Backend API (puerto 8005)
- ✅ Admin Panel (puerto 7001)
- ✅ Landing Page (puerto 6001)
- ✅ Web Widget (puerto 3000)

#### PASO 5: Crear cuenta del cliente (10 min)

```
1. Doble click en: "Crear Cliente Nuevo" (escritorio)
2. El script preguntará:

   Nombre del restaurante: Don Luigi
   Email del administrador: admin@donluigi.cl
   Telefono WhatsApp Business: +56912345678
   RUT del negocio: 12345678-9 (opcional)
   El restaurante tiene sucursales? (S/N): S       ← SI TIENE SUCURSALES
   Cuantas sucursales tiene? 3                     ← NÚMERO DE SUCURSALES

   --- Sucursal 1 de 3 ---
   Nombre de la sucursal 1: Centro
   Direccion: Av. Providencia 123, Santiago
   Telefono WhatsApp: +56912345671
   Email: centro@donluigi.cl

   --- Sucursal 2 de 3 ---
   Nombre de la sucursal 2: Mall Plaza
   Direccion: Mall Plaza Oeste, Local 205
   Telefono WhatsApp: +56912345672
   Email: mall@donluigi.cl

   --- Sucursal 3 de 3 ---
   Nombre de la sucursal 3: Aeropuerto
   Direccion: Aeropuerto Internacional, Terminal 2
   Telefono WhatsApp: +56912345673
   Email: aeropuerto@donluigi.cl

3. Confirmar: S

4. El script creará:
   - Cuenta principal del restaurante
   - Cuentas de cada sucursal
   - Usuarios administradores de cada una
   - Credenciales únicas para cada sucursal
   - Archivo de credenciales en: C:\ChatBotDysa\client-don-luigi-credentials.txt
```

**IMPORTANTE:** Si el restaurante NO tiene sucursales, responder `N` y solo se creará una cuenta.

#### PASO 6: Verificar instalación (3 min)

```
1. Doble click en: "Verificar Sistema" (escritorio)
2. El script verificará:
   [OK] PostgreSQL corriendo
   [OK] Backend API corriendo (puerto 8005)
   [OK] Admin Panel corriendo (puerto 7001)
   [OK] Landing Page corriendo (puerto 6001)
   [OK] Web Widget corriendo (puerto 3000)
   [OK] Conexion a PostgreSQL
   [OK] Restaurantes en DB: 4 (1 principal + 3 sucursales)
   [OK] Usuarios en DB: 4
   [OK] Health Check
   [OK] Endpoints API funcionando

   TODO LISTO PARA USAR
```

#### PASO 7: Configurar con el cliente (40 min)

```
1. Abrir navegador: http://localhost:7001/login

2. Login con credenciales de la CASA MATRIZ:
   Email: admin@donluigi.cl
   Password: [ver archivo de credenciales]

3. Cambiar contraseña temporal (obligatorio)

4. Conectar WhatsApp Business de CADA SUCURSAL:
   - Ir a Configuración → Sucursales
   - Seleccionar "Centro"
   - Click en "Conectar WhatsApp"
   - Escanear QR con el WhatsApp Business de esa sucursal
   - Repetir para cada sucursal

5. Configurar horarios de cada sucursal:
   - Pueden ser diferentes por sucursal
   - O iguales para todas

6. Cargar menú:
   OPCIÓN A: Menú compartido (todas las sucursales el mismo)
   OPCIÓN B: Menú independiente por sucursal

7. Personalizar mensajes del bot por sucursal

8. Hacer pedido de prueba en cada sucursal
```

#### PASO 8: Capacitar al equipo (30 min)

```
1. Mostrar dashboard principal (casa matriz ve TODO)
2. Mostrar dashboard de cada sucursal (solo ve lo suyo)
3. Gestión de pedidos por sucursal
4. Cómo cambiar estados de pedidos
5. Cómo marcar items como no disponibles
6. Cómo ver analytics por sucursal
```

#### PASO 9: Entregar materiales (10 min)

```
1. Imprimir archivo de credenciales:
   C:\ChatBotDysa\client-don-luigi-credentials.txt

2. Entregar credenciales de CADA SUCURSAL

3. Firmar contrato de servicio

4. Entregar QR codes para cada sucursal

5. Entregar tarjeta de soporte 24/7

6. Explicar que cada sucursal puede:
   - Tener su propio WhatsApp
   - Ver solo sus pedidos
   - Gestionar su inventario
   - Casa matriz ve todo desde un dashboard central
```

---

## 🏢 CASOS DE USO POR TIPO DE RESTAURANTE

### **Caso 1: Restaurante SIN sucursales** (ej: Don Luigi único local)

```batch
El restaurante tiene sucursales? (S/N): N

Resultado:
- 1 cuenta creada
- 1 WhatsApp configurado
- 1 menú
- 1 dashboard
```

### **Caso 2: Restaurante CON sucursales** (ej: Don Luigi con 3 locales)

```batch
El restaurante tiene sucursales? (S/N): S
Cuantas sucursales tiene? 3

Resultado:
- 1 cuenta principal (Casa Matriz)
- 3 cuentas de sucursales
- Cada sucursal con su WhatsApp
- Menú compartido O independiente (a elección)
- Dashboard central que ve todo
- Dashboard de cada sucursal (solo ve lo suyo)
```

### **Caso 3: Cadena de restaurantes** (ej: Burger Express con franquicias)

```batch
El restaurante tiene sucursales? (S/N): S
Cuantas sucursales tiene? 10

Resultado:
- 1 cuenta principal (Franquicia Master)
- 10 cuentas de franquicias
- Cada franquicia independiente
- Reportes consolidados en casa matriz
- Cada franquicia gestiona su operación
```

---

## 📁 ARCHIVOS GENERADOS DESPUÉS DE LA INSTALACIÓN

### **En la PC del cliente:**

```
C:\ChatBotDysa\                              ← Sistema instalado
├── apps\
│   ├── backend\                             ← Backend API
│   ├── admin-panel\                         ← Panel de administración
│   ├── website\                             ← Landing page
│   └── web-widget\                          ← Widget de chat
│
├── database\                                ← Base de datos PostgreSQL
│
├── backups\                                 ← Backups automáticos diarios
│
└── client-don-luigi-credentials.txt        ← CREDENCIALES DEL CLIENTE

Escritorio:
├── Iniciar ChatBotDysa.lnk                  ← Acceso directo
├── Detener ChatBotDysa.lnk                  ← Acceso directo
├── Admin Panel.lnk                          ← Acceso directo
├── Crear Cliente Nuevo.lnk                  ← Acceso directo
└── Verificar Sistema.lnk                    ← Acceso directo
```

---

## 🔄 WORKFLOW DIARIO DEL CLIENTE

### **Casa Matriz (administrador principal):**

```
1. Hacer doble click en "Iniciar ChatBotDysa" (si no está corriendo)
2. Abrir navegador: http://localhost:7001
3. Ver dashboard consolidado de TODAS las sucursales
4. Monitorear pedidos, reservas, analytics
5. Gestionar menú global (si es compartido)
6. Ver reportes de ventas por sucursal
```

### **Cada Sucursal (administrador local):**

```
1. Login con sus credenciales propias
2. Ve solo pedidos y reservas de SU sucursal
3. Gestiona inventario local
4. Cambia estados de pedidos
5. Marca items como no disponibles
```

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### **Error: "Puerto 8005 ya está en uso"**

```batch
# Ejecutar:
Doble click en: Detener ChatBotDysa

# Esperar 5 segundos, luego:
Doble click en: Iniciar ChatBotDysa
```

### **Error: "No se puede conectar a la base de datos"**

```batch
# Verificar que PostgreSQL esté corriendo:
Win + R → services.msc → Buscar "postgresql-x64-16"

# Si está detenido, iniciar:
Click derecho → Iniciar
```

### **El cliente olvidó su contraseña**

```batch
# Desde la PC del cliente:
cd C:\ChatBotDysa\apps\backend
node scripts/reset-password.js --email admin@restaurante.com
```

### **Quieren agregar más sucursales después**

```batch
# Ejecutar nuevamente:
Doble click en: Crear Cliente Nuevo

# Ingresar datos de la NUEVA sucursal con el mismo nombre de restaurante principal
```

---

## 📞 SOPORTE POST-INSTALACIÓN

### **Día 1 (instalación):**
- ✅ Sistema instalado y funcionando
- ✅ Cliente puede hacer login
- ✅ WhatsApp(s) conectado(s)
- ✅ Menú cargado (al menos 10-15 items)
- ✅ Pedido de prueba exitoso

### **Día 3:**
- WhatsApp check-in: "¿Todo funcionando bien?"

### **Día 7:**
- Llamada de seguimiento
- Revisar primeros pedidos reales
- Ajustar configuración si es necesario

### **Día 15:**
- Sesión de optimización (2 horas)
- Análisis de analytics
- Estrategias para aumentar ventas

### **Día 30:**
- Reunión de resultados
- Mostrar ROI obtenido
- Planificación mes 2
- Solicitar testimonial

---

## ✅ RESUMEN EJECUTIVO

### **Lo que tienes:**

```
/Users/devlmer/ChatBotDysa/INSTALADORES_CLIENTES/USB_INSTALLER/
```

Este es un instalador completo que:
- ✅ Se copia a una USB de 4GB+
- ✅ Funciona para CUALQUIER cliente
- ✅ Instala TODO automáticamente en Windows
- ✅ Pregunta datos REALES del cliente
- ✅ Soporta múltiples sucursales
- ✅ Genera credenciales únicas
- ✅ Crea accesos directos para el cliente
- ✅ Sistema queda 100% funcional

### **Proceso simplificado:**

```
1. Preparar USB (una sola vez)
2. Ir al restaurante
3. Copiar a PC del cliente (10 min)
4. Ejecutar install-windows.bat (30 min)
5. Iniciar sistema (2 min)
6. Crear cliente (10 min, pregunta si tiene sucursales)
7. Configurar (40 min)
8. Entregar credenciales
9. Listo! 🎉
```

### **Tiempo total:** ~2 horas

---

**ChatBotDysa Enterprise+++++**
*Sistema completo portable con soporte multi-sucursal*

© 2025 ChatBotDysa - Todos los derechos reservados
