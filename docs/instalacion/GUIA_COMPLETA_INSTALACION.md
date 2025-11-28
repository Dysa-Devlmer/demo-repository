# 🚀 Guía Completa de Instalación - ChatBotDysa Enterprise+++++

**Sistema de instalación para restaurantes con Windows**

---

## 📦 Instalador Principal

**Ruta:** `/Users/devlmer/ChatBotDysa/INSTALADORES_CLIENTES/USB_INSTALLER/`

**Contiene:**
- ✅ `README.md` - Guía completa del instalador
- ✅ `INSTRUCCIONES_PREPARAR_USB.md` - Cómo preparar la USB paso a paso
- ✅ `scripts/`
  - `install-windows.bat` - Instala Node.js, PostgreSQL, Git, dependencias (30 min)
  - `start-system.bat` - Inicia todos los servicios
  - `stop-system.bat` - Detiene todos los servicios
  - `create-client.bat` - Crea cliente CON SOPORTE MULTI-SUCURSAL
  - `verify-system.bat` - Verifica que todo esté funcionando

---

## 🚀 Proceso de Instalación

### ANTES de ir al restaurante (una sola vez)

#### 1. Leer documentación

```bash
cat /Users/devlmer/ChatBotDysa/INSTALADORES_CLIENTES/RUTAS_EXACTAS.txt
```

#### 2. Preparar USB

Seguir instrucciones en:
```
/Users/devlmer/ChatBotDysa/INSTALADORES_CLIENTES/USB_INSTALLER/INSTRUCCIONES_PREPARAR_USB.md
```

**Descargar e incluir en la USB:**
- Node.js 20 para Windows: https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi
- PostgreSQL 16 para Windows: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
- Git para Windows: https://git-scm.com/download/win
- Todo el código fuente de ChatBotDysa (sin node_modules)

#### 3. Checklist pre-salida

```
□ USB preparada con contenido completo
□ Laptop cargada (100%)
□ Tether de internet móvil como backup
□ Tarjetas de presentación
□ Contratos en blanco para firmar
□ Material de marketing (QR codes, carteles)
□ Impresora portátil o acceso a impresora del cliente
```

---

### EN el restaurante del cliente

#### PASO 1: Verificar PC (5 min)

**Requisitos:**
```
□ Windows 10 o Windows 11
□ 8 GB RAM (mínimo 4 GB)
□ 50 GB espacio libre en disco
□ Usuario con permisos de administrador
□ Conexión a internet (solo para setup inicial)
```

#### PASO 2: Copiar instalador (10 min)

```
1. Conectar USB a la PC del cliente
2. Copiar: USB:\ChatBotDysa_Installer
3. Pegar en: C:\Users\[usuario]\Desktop\
   (Toma 5-10 minutos dependiendo de velocidad USB)
```

#### PASO 3: Ejecutar instalador (30 min)

```
1. Ir a: Desktop\ChatBotDysa_Installer\3_CONFIGURACION\
2. Click derecho en: install-windows.bat
3. Seleccionar: "Ejecutar como administrador"
4. Esperar 20-30 minutos
```

**El instalador hará automáticamente:**
- ✅ Instalar Node.js 20 LTS
- ✅ Instalar PostgreSQL 16 (puerto 15432, password: supersecret)
- ✅ Instalar Git para Windows
- ✅ Copiar código a `C:\ChatBotDysa\`
- ✅ Crear base de datos `chatbotdysa`
- ✅ Ejecutar migraciones
- ✅ Instalar dependencias (npm install en cada app)
- ✅ Configurar variables de entorno
- ✅ Crear accesos directos en el escritorio

#### PASO 4: Iniciar sistema (2 min)

```
1. Doble click en: "Iniciar ChatBotDysa" (escritorio)
2. Esperar 15 segundos
3. Se abrirá automáticamente http://localhost:7001
```

**Servicios que inician:**
- ✅ PostgreSQL (puerto 15432)
- ✅ Backend API (puerto 8005)
- ✅ Admin Panel (puerto 7001)
- ✅ Landing Page (puerto 6001)
- ✅ Web Widget (puerto 3000)

#### PASO 5: Crear cliente (10 min)

```
1. Doble click en: "Crear Cliente Nuevo" (escritorio)
2. El script preguntará:

   Nombre del restaurante: [Cliente te lo dice]
   Email del administrador: [Cliente te lo da]
   Telefono WhatsApp Business: [Cliente te lo da]
   RUT del negocio: [Opcional]

   ¿El restaurante tiene sucursales? (S/N): [S o N]

   Si respondió S:
   ¿Cuantas sucursales tiene? [Número]

   Para cada sucursal:
   - Nombre
   - Dirección
   - Teléfono WhatsApp
   - Email

3. Confirmar: S
4. Se genera archivo de credenciales
```

#### PASO 6: Verificar instalación (3 min)

```
1. Doble click en: "Verificar Sistema" (escritorio)
2. Debe mostrar:
   [OK] Todos los servicios corriendo
   [OK] Base de datos conectada
   [OK] Endpoints API funcionando

   TODO LISTO PARA USAR
```

#### PASO 7: Configurar (40 min)

```
1. Abrir navegador: http://localhost:7001/login
2. Login con credenciales generadas
3. Cambiar contraseña temporal
4. Conectar WhatsApp Business de cada sucursal
5. Configurar horarios
6. Cargar menú
7. Personalizar mensajes del bot
8. Hacer pedido de prueba
```

#### PASO 8: Capacitar equipo (30 min)

```
1. Dashboard principal
2. Gestión de pedidos
3. Edición de menú
4. Analytics básico
5. Soporte 24/7
```

#### PASO 9: Entregar materiales (10 min)

```
1. Imprimir credenciales: C:\ChatBotDysa\client-[nombre]-credentials.txt
2. Firmar contrato
3. Entregar QR codes
4. Tarjeta de soporte 24/7
5. Agendar follow-up 7 días
```

---

## 🏢 Soporte Multi-Sucursal

**El script `create-client.bat` pregunta:**

```batch
¿El restaurante tiene sucursales? (S/N): S
¿Cuantas sucursales tiene? 3

--- Sucursal 1 de 3 ---
Nombre: Centro
Dirección: Av. Providencia 123
WhatsApp: +56912345671
Email: centro@restaurante.com

--- Sucursal 2 de 3 ---
Nombre: Mall Plaza
Dirección: Mall Plaza Oeste, Local 205
WhatsApp: +56912345672
Email: mall@restaurante.com

--- Sucursal 3 de 3 ---
Nombre: Aeropuerto
Dirección: Aeropuerto Internacional, Terminal 2
WhatsApp: +56912345673
Email: aeropuerto@restaurante.com
```

**Crea automáticamente:**
- ✅ Cuenta principal (Casa Matriz)
- ✅ Cuenta de cada sucursal
- ✅ Usuarios admin de cada una
- ✅ Credenciales únicas para cada sucursal
- ✅ Dashboard central que ve todo
- ✅ Dashboard individual por sucursal

---

## 📁 Archivos Generados en PC del Cliente

```
C:\ChatBotDysa\                              ← Sistema completo instalado
├── apps\
│   ├── backend\                             ← Backend API
│   ├── admin-panel\                         ← Panel de administración
│   ├── website\                             ← Landing page
│   └── web-widget\                          ← Widget de chat
├── database\                                ← Base de datos PostgreSQL
├── backups\                                 ← Backups automáticos diarios
└── client-[nombre]-credentials.txt          ← CREDENCIALES (IMPRIMIR)

Escritorio del cliente:
├── Iniciar ChatBotDysa.lnk                  ← Usar a diario
├── Detener ChatBotDysa.lnk                  ← Si necesita apagar
├── Admin Panel.lnk                          ← Acceso directo navegador
├── Crear Cliente Nuevo.lnk                  ← Para más clientes
└── Verificar Sistema.lnk                    ← Diagnosticar problemas
```

---

## ⏱️ Tiempos

```
Preparar USB (una sola vez):     30-40 minutos
Copiar a PC del cliente:         10 minutos
Ejecutar install-windows.bat:    30 minutos
Iniciar sistema:                 2 minutos
Crear cliente (con sucursales):  10 minutos
Configurar con cliente:          40 minutos
Capacitar equipo:                30 minutos
Entregar materiales:             10 minutos
                                 ──────────────
TOTAL EN EL RESTAURANTE:         ~2 horas 10 min
```

---

## 🆘 Solución de Problemas

### Error: "Puerto 8005 ya está en uso"

```batch
Doble click en: Detener ChatBotDysa
Esperar 5 segundos
Doble click en: Iniciar ChatBotDysa
```

### Error: "No se puede conectar a la base de datos"

```batch
Win + R → services.msc
Buscar: postgresql-x64-16
Click derecho → Iniciar
```

### Cliente olvidó contraseña

```batch
cd C:\ChatBotDysa\apps\backend
node scripts/reset-password.js --email admin@restaurante.com
```

### Agregar más sucursales después

```batch
Doble click en: Crear Cliente Nuevo
Ingresar datos de la nueva sucursal con el mismo nombre del restaurante
```

---

## 📞 Soporte Post-Instalación

**Día 1:** Sistema instalado, cliente puede operar
**Día 3:** WhatsApp check-in
**Día 7:** Llamada de seguimiento + revisión datos
**Día 15:** Sesión de optimización (2 horas)
**Día 30:** Reunión de resultados + solicitar testimonial

---

## 📊 Métricas de Éxito

**Día 1:**
- ✅ Cliente puede hacer login
- ✅ WhatsApp(s) conectado(s)
- ✅ Al menos 10-15 items de menú
- ✅ 1 pedido de prueba exitoso

**Día 7:**
- ✅ 10+ pedidos reales procesados
- ✅ Cliente usa el sistema diariamente
- ✅ 0 tickets de soporte críticos

**Día 30:**
- ✅ 100+ pedidos procesados
- ✅ 60%+ de automatización
- ✅ Cliente satisfecho (NPS > 8)
- ✅ Renovación confirmada

---

**ChatBotDysa Enterprise+++++**
*Sistema completo portable con soporte multi-sucursal*

© 2025 ChatBotDysa - Todos los derechos reservados
