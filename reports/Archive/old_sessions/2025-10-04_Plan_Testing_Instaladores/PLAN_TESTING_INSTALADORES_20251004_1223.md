# 🧪 PLAN DE TESTING DE INSTALADORES DOCKER

**Fecha:** 4 de Octubre de 2025
**Hora:** 12:23 hrs
**Estado:** 📋 PLANIFICACIÓN

---

## 🎯 OBJETIVO

Probar los 3 instaladores Docker (Windows, macOS, Linux) en entornos limpios para verificar que funcionan correctamente antes de llevar el sistema a los restaurantes.

---

## 📊 ESTADO ACTUAL

### ✅ Lo que tenemos listo:

1. **Sistema Docker Operacional**
   - 6 servicios activos y funcionando
   - Backend: HTTP 200 ✅
   - Admin Panel: HTTP 200 ✅
   - Landing Page: HTTP 200 ✅
   - PostgreSQL, Redis, Ollama: Activos ✅

2. **Instaladores Creados**
   - ✅ `install-macos.sh` (2.4 KB)
   - ✅ `install-linux.sh` (3.0 KB)
   - ✅ `install-windows.bat` (2.3 KB)

3. **Documentación**
   - ✅ 8 archivos de reportes generados
   - ✅ Guías técnicas completas
   - ✅ Troubleshooting documentado

---

## 🧪 PLAN DE TESTING

### Fase 1: Testing en macOS (ACTUAL)
**Sistema:** macOS (actual)
**Duración estimada:** 30 minutos
**Prioridad:** 🔴 ALTA

#### Pasos:
1. **Preparación (5 min)**
   - [ ] Detener servicios Docker actuales
   - [ ] Limpiar volúmenes Docker
   - [ ] Verificar que Docker Desktop está corriendo
   - [ ] Ir a una carpeta temporal

2. **Ejecución del Instalador (15 min)**
   - [ ] Copiar proyecto a carpeta temporal
   - [ ] Ejecutar `./scripts/install-macos.sh`
   - [ ] Observar todo el proceso
   - [ ] Tomar notas de warnings/errores
   - [ ] Medir tiempo total de instalación

3. **Verificación (10 min)**
   - [ ] Verificar que todos los servicios levantaron
   - [ ] Probar endpoint Backend (8005)
   - [ ] Probar Admin Panel (7001)
   - [ ] Probar Landing Page (3004)
   - [ ] Verificar logs de cada servicio
   - [ ] Hacer login en Admin Panel
   - [ ] Verificar conexión a base de datos

4. **Documentación (5 min)**
   - [ ] Capturar pantallas del proceso
   - [ ] Documentar tiempo real vs estimado
   - [ ] Anotar problemas encontrados
   - [ ] Crear reporte de testing

### Fase 2: Testing en Linux (VM)
**Sistema:** Ubuntu 22.04 LTS en VM
**Duración estimada:** 45 minutos
**Prioridad:** 🟡 MEDIA

#### Preparación de VM:
- [ ] Crear VM Ubuntu 22.04 (4 cores, 8 GB RAM, 50 GB disco)
- [ ] Actualizar sistema: `sudo apt update && sudo apt upgrade`
- [ ] Instalar herramientas básicas
- [ ] Copiar proyecto ChatBotDysa a VM

#### Ejecución:
1. **Sin Docker Preinstalado**
   - [ ] Ejecutar `./scripts/install-linux.sh`
   - [ ] Verificar que instala Docker automáticamente
   - [ ] Verificar que instala Docker Compose
   - [ ] Verificar que agrega usuario a grupo docker

2. **Verificación**
   - [ ] Todos los servicios levantados
   - [ ] Endpoints respondiendo
   - [ ] Base de datos accesible
   - [ ] Volúmenes creados correctamente

3. **Documentación**
   - [ ] Capturar proceso completo
   - [ ] Tiempo de instalación
   - [ ] Reporte de testing Linux

### Fase 3: Testing en Windows (VM)
**Sistema:** Windows 11 en VM
**Duración estimada:** 45 minutos
**Prioridad:** 🟡 MEDIA

#### Preparación de VM:
- [ ] Crear VM Windows 11 (4 cores, 8 GB RAM, 50 GB disco)
- [ ] Instalar Docker Desktop for Windows
- [ ] Habilitar WSL2
- [ ] Copiar proyecto ChatBotDysa a VM

#### Ejecución:
1. **Con Docker Desktop Instalado**
   - [ ] Abrir PowerShell como Administrador
   - [ ] Navegar a carpeta ChatBotDysa
   - [ ] Ejecutar `scripts\install-windows.bat`
   - [ ] Observar proceso completo

2. **Verificación**
   - [ ] Todos los servicios levantados
   - [ ] Endpoints respondiendo desde navegador
   - [ ] Admin Panel accesible
   - [ ] Landing Page visible

3. **Documentación**
   - [ ] Screenshots del proceso
   - [ ] Tiempo de instalación
   - [ ] Reporte de testing Windows

---

## 📋 CHECKLIST DE VERIFICACIÓN

Para cada instalador, verificar:

### Servicios Docker
- [ ] Backend status: healthy
- [ ] Admin Panel status: running
- [ ] Landing Page status: running
- [ ] PostgreSQL status: healthy
- [ ] Redis status: running
- [ ] Ollama status: running

### Endpoints HTTP
- [ ] `curl http://localhost:8005/health` → 200 OK
- [ ] `curl http://localhost:7001` → 200 OK
- [ ] `curl http://localhost:3004` → 200 OK

### Volúmenes Persistentes
- [ ] chatbotdysa-postgres-data creado
- [ ] chatbotdysa-redis-data creado
- [ ] chatbotdysa-ollama-data creado
- [ ] chatbotdysa-backend-logs creado
- [ ] chatbotdysa-backend-uploads creado

### Funcionalidad
- [ ] Admin Panel muestra página de login
- [ ] Backend responde a API calls
- [ ] Landing Page renderiza correctamente
- [ ] Base de datos tiene tablas iniciales

### Performance
- [ ] Tiempo de instalación < 20 minutos
- [ ] Uso de RAM < 6 GB
- [ ] Uso de CPU < 80% durante instalación
- [ ] Espacio en disco usado ~2 GB

---

## 🔧 PREPARACIÓN DEL ENTORNO DE TESTING

### Para macOS (Local)

```bash
# 1. Detener servicios actuales
cd /Users/devlmer/ChatBotDysa
docker-compose down

# 2. Limpiar volúmenes (CUIDADO: borra datos)
docker-compose down -v

# 3. Crear carpeta temporal de testing
mkdir -p /tmp/chatbotdysa-test
cp -r /Users/devlmer/ChatBotDysa /tmp/chatbotdysa-test/

# 4. Ir a carpeta temporal
cd /tmp/chatbotdysa-test/ChatBotDysa

# 5. Ejecutar instalador
./scripts/install-macos.sh
```

### Para Linux (VM)

```bash
# 1. Actualizar sistema
sudo apt update && sudo apt upgrade -y

# 2. Instalar git si no está
sudo apt install git -y

# 3. Copiar proyecto
# (usar USB, SCP, o compartir carpeta de VM)

# 4. Dar permisos de ejecución
chmod +x scripts/install-linux.sh

# 5. Ejecutar instalador
./scripts/install-linux.sh
```

### Para Windows (VM)

```powershell
# 1. Instalar Docker Desktop
# Descargar de: https://www.docker.com/products/docker-desktop

# 2. Habilitar WSL2
wsl --install

# 3. Reiniciar PC

# 4. Copiar proyecto ChatBotDysa a C:\ChatBotDysa

# 5. Abrir PowerShell como Administrador
cd C:\ChatBotDysa

# 6. Ejecutar instalador
scripts\install-windows.bat
```

---

## 📊 MÉTRICAS A RECOLECTAR

### Por cada instalador:

1. **Tiempo de Ejecución**
   - Tiempo de verificación de Docker: __ min
   - Tiempo de descarga de imágenes: __ min
   - Tiempo de construcción: __ min
   - Tiempo de inicio de servicios: __ min
   - **Tiempo Total:** __ min

2. **Recursos Utilizados**
   - RAM máxima usada: __ GB
   - CPU máxima usada: __ %
   - Espacio en disco usado: __ GB

3. **Problemas Encontrados**
   - Errores durante instalación: [lista]
   - Warnings: [lista]
   - Servicios que no levantaron: [lista]

4. **Resultados de Verificación**
   - Servicios activos: __/6
   - Endpoints HTTP 200: __/3
   - Funcionalidad: ✅ / ❌

---

## 🐛 PROBLEMAS POTENCIALES Y SOLUCIONES

### macOS

**Problema:** Docker Desktop no está corriendo
**Solución:** `open -a Docker` y esperar 15 segundos

**Problema:** Permisos denegados
**Solución:** `chmod +x scripts/install-macos.sh`

**Problema:** Puerto ya en uso
**Solución:** `lsof -ti:8005 | xargs kill -9`

### Linux

**Problema:** Docker no está instalado
**Solución:** El script lo instala automáticamente

**Problema:** Usuario sin permisos para Docker
**Solución:** Reiniciar sesión después de instalación

**Problema:** Docker Compose no encontrado
**Solución:** El script lo instala automáticamente

### Windows

**Problema:** WSL2 no habilitado
**Solución:** `wsl --install` y reiniciar

**Problema:** Docker Desktop no inicia
**Solución:** Verificar virtualización en BIOS

**Problema:** Firewall bloquea puertos
**Solución:** Permitir puertos 8005, 7001, 3004 en Windows Defender

---

## 📝 PLANTILLA DE REPORTE DE TESTING

```markdown
# Testing del Instalador [OS]

**Fecha:** YYYY-MM-DD HH:MM
**Sistema Operativo:** [Windows 11 / macOS / Ubuntu 22.04]
**Versión Docker:** X.X.X

## Preparación
- Tiempo de preparación: __ min
- Problemas durante preparación: [ninguno / lista]

## Instalación
- Comando ejecutado: [comando]
- Inicio: HH:MM
- Fin: HH:MM
- Duración total: __ min

## Verificación
- Servicios activos: 6/6 ✅
- Endpoints HTTP 200: 3/3 ✅
- Volúmenes creados: 5/5 ✅
- Funcionalidad: ✅

## Problemas Encontrados
1. [Problema 1 - Severidad: Alta/Media/Baja]
   - Solución: [descripción]
2. [Problema 2]
   - Solución: [descripción]

## Recursos
- RAM máxima: __ GB
- CPU máxima: __ %
- Disco usado: __ GB

## Conclusión
[✅ APROBADO / ❌ RECHAZADO / ⚠️ CON OBSERVACIONES]

## Screenshots
- [Adjuntar capturas de pantalla]
```

---

## 🎯 CRITERIOS DE ACEPTACIÓN

Para que un instalador sea considerado **APROBADO**, debe cumplir:

### Obligatorios (Críticos)
- ✅ Instalación completa exitosa (sin errores fatales)
- ✅ 6/6 servicios levantados y corriendo
- ✅ 3/3 endpoints respondiendo HTTP 200
- ✅ Admin Panel accesible desde navegador
- ✅ Base de datos conectada y accesible

### Deseables (No Críticos)
- ✅ Tiempo de instalación < 20 minutos
- ✅ Sin warnings mayores
- ✅ Uso de recursos dentro de lo esperado
- ✅ Volúmenes persistentes creados correctamente
- ✅ Health checks funcionando

### Opcionales (Mejoras)
- ⚪ Mensajes de progreso claros
- ⚪ Estimación de tiempo restante
- ⚪ Rollback automático en caso de error
- ⚪ Verificación post-instalación automática

---

## 📅 CRONOGRAMA DE TESTING

### Hoy - Viernes 4 de Octubre

**12:30 - 13:00** → Testing macOS (local)
- Preparación: 5 min
- Ejecución: 15 min
- Verificación: 10 min
- Documentación: 5 min

**Tarde** → Preparación de VMs
- Crear VM Ubuntu: 20 min
- Crear VM Windows: 20 min
- Configurar ambas VMs: 30 min

### Sábado 5 de Octubre

**10:00 - 11:00** → Testing Linux (VM)
- Ejecución completa: 45 min
- Documentación: 15 min

**15:00 - 16:00** → Testing Windows (VM)
- Ejecución completa: 45 min
- Documentación: 15 min

**16:30 - 17:00** → Reporte consolidado
- Análisis de resultados
- Ajustes necesarios
- Reporte final de testing

---

## 🚀 ACCIONES POST-TESTING

### Si todos los instaladores pasan:
1. ✅ Marcar instaladores como APROBADOS
2. ✅ Crear videos tutoriales
3. ✅ Preparar manual impreso
4. ✅ Programar instalaciones en restaurantes

### Si hay problemas menores:
1. 🔧 Documentar problemas
2. 🔧 Crear fix para cada problema
3. 🔧 Re-testear instaladores afectados
4. ✅ Continuar con preparación

### Si hay problemas mayores:
1. 🚨 Documentar problema crítico
2. 🚨 Crear fix urgente
3. 🚨 Re-testear completamente
4. ⏸️ Posponer instalaciones si es necesario

---

## 📁 ESTRUCTURA DE DOCUMENTACIÓN

```
Reportes/Sesiones/2025-10-04_Plan_Testing_Instaladores/
├── PLAN_TESTING_INSTALADORES_20251004_1223.md (este archivo)
├── TESTING_MACOS_20251004_HHMM.md (por crear)
├── TESTING_LINUX_20251004_HHMM.md (por crear)
├── TESTING_WINDOWS_20251004_HHMM.md (por crear)
└── REPORTE_CONSOLIDADO_TESTING_20251004_HHMM.md (por crear)
```

---

## 🎯 PRÓXIMO PASO INMEDIATO

**TESTING DEL INSTALADOR macOS EN LOCAL**

**Duración estimada:** 30 minutos
**Riesgo:** Bajo (entorno conocido)
**Beneficio:** Verificación inmediata del instalador principal

### Comando para iniciar:
```bash
# Ir a carpeta temporal
cd /tmp && rm -rf chatbotdysa-test && mkdir chatbotdysa-test

# Copiar proyecto
cp -r /Users/devlmer/ChatBotDysa /tmp/chatbotdysa-test/

# Detener servicios actuales en el proyecto original
cd /Users/devlmer/ChatBotDysa && docker-compose down

# Ir a copia temporal
cd /tmp/chatbotdysa-test/ChatBotDysa

# Ejecutar instalador
./scripts/install-macos.sh
```

---

**Creado:** 2025-10-04 12:23 hrs
**Por:** Sistema ChatBotDysa
**Estado:** 📋 PLAN LISTO PARA EJECUCIÓN

**🧪 READY TO TEST**
