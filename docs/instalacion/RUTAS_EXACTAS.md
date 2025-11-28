═══════════════════════════════════════════════════════════════
    RUTAS EXACTAS - INSTALADORES CHATBOTDYSA ENTERPRISE+++++
═══════════════════════════════════════════════════════════════

📦 INSTALADOR PRINCIPAL (EL ÚNICO QUE NECESITAS):

/Users/devlmer/ChatBotDysa/INSTALADORES_CLIENTES/USB_INSTALLER/

Contiene:
  ├── README.md                           → Guía completa del instalador
  ├── INSTRUCCIONES_PREPARAR_USB.md       → Cómo preparar USB paso a paso
  └── scripts/
      ├── install-windows.bat             → Instalador automático (30 min)
      ├── start-system.bat                → Iniciar sistema
      ├── stop-system.bat                 → Detener sistema
      ├── create-client.bat               → Crear cliente con sucursales
      └── verify-system.bat               → Verificar instalación

═══════════════════════════════════════════════════════════════
📋 ARCHIVOS DE DOCUMENTACIÓN:
═══════════════════════════════════════════════════════════════

GUÍA COMPLETA DEL INSTALADOR:
/Users/devlmer/ChatBotDysa/INSTALADORES_CLIENTES/USB_INSTALLER/README.md

CÓMO PREPARAR LA USB:
/Users/devlmer/ChatBotDysa/INSTALADORES_CLIENTES/USB_INSTALLER/INSTRUCCIONES_PREPARAR_USB.md

RESUMEN DE TODOS LOS INSTALADORES:
/Users/devlmer/ChatBotDysa/INSTALADORES_CLIENTES/RESUMEN_INSTALADORES.md

ESTE ARCHIVO:
/Users/devlmer/ChatBotDysa/INSTALADORES_CLIENTES/RUTAS_EXACTAS.txt

═══════════════════════════════════════════════════════════════
🚀 CÓMO USAR:
═══════════════════════════════════════════════════════════════

PASO 1: Preparar USB (UNA SOLA VEZ)
────────────────────────────────────
Abrir:
/Users/devlmer/ChatBotDysa/INSTALADORES_CLIENTES/USB_INSTALLER/INSTRUCCIONES_PREPARAR_USB.md

Seguir instrucciones para:
- Descargar Node.js, PostgreSQL, Git para Windows
- Copiar código fuente a la USB
- Copiar scripts .bat a la USB
- Resultado: USB lista para llevar a cualquier restaurante

PASO 2: En el restaurante del cliente
────────────────────────────────────
1. Conectar USB a PC del cliente (Windows 10/11)

2. Copiar carpeta USB:\ChatBotDysa_Installer al escritorio

3. Ejecutar como ADMINISTRADOR:
   Desktop\ChatBotDysa_Installer\3_CONFIGURACION\install-windows.bat
   (Esperar 30 minutos mientras instala todo)

4. Hacer doble click: "Iniciar ChatBotDysa" (escritorio)

5. Hacer doble click: "Crear Cliente Nuevo" (escritorio)
   → Ingresar datos REALES del cliente
   → Preguntar: ¿Tiene sucursales? (S/N)
   → Si sí, ingresar datos de cada sucursal

6. Abrir: http://localhost:7001/login
   → Login con credenciales generadas
   → Configurar WhatsApp, menú, horarios

7. Entregar credenciales impresas al cliente

═══════════════════════════════════════════════════════════════
💾 ESTRUCTURA DE LA USB (después de prepararla):
═══════════════════════════════════════════════════════════════

USB:\ChatBotDysa_Installer\
│
├── 1_INSTALADORES_BASE\          ← Instaladores de Windows
│   ├── node-v20.11.0-x64.msi
│   ├── postgresql-16.1-windows-x64.exe
│   ├── git-2.43.0-64-bit.exe
│   └── chrome-installer.exe
│
├── 2_CODIGO_FUENTE\              ← Todo el código de ChatBotDysa
│   └── ChatBotDysa\
│       ├── apps\
│       │   ├── backend\
│       │   ├── admin-panel\
│       │   ├── website\
│       │   └── web-widget\
│       └── [todos los archivos]
│
├── 3_CONFIGURACION\              ← Scripts que usa el cliente
│   ├── install-windows.bat       ← Ejecutar primero
│   ├── start-system.bat          ← Iniciar ChatBotDysa
│   ├── stop-system.bat           ← Detener ChatBotDysa
│   ├── create-client.bat         ← Crear cliente
│   └── verify-system.bat         ← Verificar sistema
│
├── 4_DOCUMENTACION\
│   ├── GUIA_INSTALACION.txt
│   └── FAQ.txt
│
├── 5_MATERIALES\
│   ├── contratos\
│   ├── marketing\
│   └── tarjetas_soporte\
│
└── README.md                     ← Guía completa

═══════════════════════════════════════════════════════════════
🏢 SOPORTE MULTI-SUCURSAL:
═══════════════════════════════════════════════════════════════

El script create-client.bat pregunta:

¿El restaurante tiene sucursales? (S/N): S
¿Cuantas sucursales tiene? 3

Luego pide datos de cada sucursal:
  - Nombre
  - Dirección
  - WhatsApp Business
  - Email

Crea automáticamente:
  ✅ Cuenta principal (Casa Matriz)
  ✅ Cuenta de cada sucursal
  ✅ Usuarios admin de cada una
  ✅ Credenciales únicas para cada sucursal
  ✅ Dashboard central que ve todo
  ✅ Dashboard individual por sucursal

═══════════════════════════════════════════════════════════════
📊 ARCHIVOS GENERADOS EN PC DEL CLIENTE:
═══════════════════════════════════════════════════════════════

Después de la instalación:

C:\ChatBotDysa\                              ← Sistema instalado
├── apps\                                    ← Aplicaciones
├── database\                                ← Base de datos
├── backups\                                 ← Backups automáticos
└── client-[nombre]-credentials.txt         ← CREDENCIALES

Escritorio del cliente:
├── Iniciar ChatBotDysa.lnk                  ← Usar a diario
├── Detener ChatBotDysa.lnk                  ← Si necesita apagar
├── Admin Panel.lnk                          ← Acceso directo
├── Crear Cliente Nuevo.lnk                  ← Para más clientes
└── Verificar Sistema.lnk                    ← Diagnosticar problemas

═══════════════════════════════════════════════════════════════
⏱️ TIEMPOS:
═══════════════════════════════════════════════════════════════

Preparar USB (una sola vez):     30-40 minutos
Copiar a PC del cliente:         10 minutos
Ejecutar install-windows.bat:    30 minutos
Iniciar sistema:                 2 minutos
Crear cliente (con sucursales):  10 minutos
Configurar con cliente:          40 minutos
                                 ──────────────
TOTAL EN EL RESTAURANTE:         ~2 horas

═══════════════════════════════════════════════════════════════
✅ CHECKLIST FINAL:
═══════════════════════════════════════════════════════════════

ANTES DE IR:
□ USB preparada con contenido completo
□ Laptop cargada (100%)
□ Tether de internet móvil
□ Tarjetas de presentación
□ Contratos en blanco
□ Material de marketing
□ Impresora portátil

EN EL RESTAURANTE:
□ Verificar requisitos PC (Win 10/11, 8GB RAM, 50GB disco)
□ Copiar USB a escritorio
□ Ejecutar install-windows.bat
□ Iniciar sistema
□ Crear cliente (preguntar por sucursales)
□ Verificar instalación
□ Configurar WhatsApp, menú, horarios
□ Hacer pedido de prueba
□ Capacitar equipo
□ Entregar credenciales impresas
□ Firmar contrato
□ Agendar follow-up 7 días

═══════════════════════════════════════════════════════════════
📞 SOPORTE:
═══════════════════════════════════════════════════════════════

WhatsApp: +56 9 XXXX XXXX
Email: soporte@chatbotdysa.cl
Teléfono: 800 CHATBOT (242826)

═══════════════════════════════════════════════════════════════

ChatBotDysa Enterprise+++++
Sistema completo portable con soporte multi-sucursal

© 2025 ChatBotDysa - Todos los derechos reservados

═══════════════════════════════════════════════════════════════
