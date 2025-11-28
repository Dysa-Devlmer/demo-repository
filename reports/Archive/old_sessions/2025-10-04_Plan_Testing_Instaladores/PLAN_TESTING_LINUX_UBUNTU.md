# PLAN DE TESTING - Linux Ubuntu 22.04
## ChatBotDysa - Verificación Multi-OS

---

**📅 Fecha de creación:** 2025-10-04 19:03
**🎯 Objetivo:** Verificar funcionamiento del instalador en Linux Ubuntu 22.04
**⏱️ Duración estimada:** 1-2 horas
**📋 Estado:** ⏳ Pendiente

---

## 1. CONTEXTO

### 1.1 Avances Previos

✅ **macOS Testing - COMPLETADO**
- Instalador probado y funcionando
- Health checks 4/4 operativos
- Endpoints HTTP 3/3 funcionales
- Sistema production-ready verificado

⏳ **Linux Ubuntu 22.04 - PENDIENTE**
- VM a preparar
- Instalador a ejecutar
- Verificaciones a realizar

⏳ **Windows 11 - PENDIENTE**
- Fase posterior al testing Linux

### 1.2 Archivos del Instalador

```bash
scripts/
├── install-macos.sh        # ✅ Probado y funcionando
├── install-linux.sh        # ⏳ A probar
└── install-windows.ps1     # ⏳ Fase posterior
```

---

## 2. REQUISITOS PREVIOS

### 2.1 Hardware y Software

**VM Requirements:**
- [ ] Sistema: Ubuntu 22.04 LTS (Server o Desktop)
- [ ] RAM: Mínimo 4GB, recomendado 8GB
- [ ] Disco: Mínimo 20GB libres
- [ ] CPU: 2 cores mínimo, 4 recomendado
- [ ] Red: Conexión a Internet activa

**Software a instalar (si no existe):**
- [ ] Docker Engine (latest)
- [ ] Docker Compose (v2.x)
- [ ] Git (para clonar repo)
- [ ] curl/wget (para health checks)
- [ ] jq (para parsing JSON)

### 2.2 Preparación del Ambiente

```bash
# 1. Actualizar sistema
sudo apt update && sudo apt upgrade -y

# 2. Instalar Docker (si no existe)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# 3. Verificar instalación Docker
docker --version
docker-compose --version

# 4. Instalar herramientas adicionales
sudo apt install -y git curl wget jq net-tools

# 5. Clonar repositorio
git clone [REPO_URL] /tmp/chatbotdysa-test
cd /tmp/chatbotdysa-test/ChatBotDysa
```

---

## 3. PLAN DE EJECUCIÓN

### 3.1 Fase 1: Preparación (15-20 min)

**Tareas:**
1. [ ] Crear/iniciar VM Ubuntu 22.04
2. [ ] Actualizar sistema operativo
3. [ ] Instalar Docker y Docker Compose
4. [ ] Verificar instalación de Docker
5. [ ] Instalar herramientas de testing
6. [ ] Clonar repositorio del proyecto

**Verificaciones:**
```bash
# Docker instalado correctamente
docker --version  # Debe mostrar versión
docker-compose --version  # Debe mostrar versión
docker ps  # Debe ejecutarse sin error

# Herramientas disponibles
which curl wget jq git  # Todas deben estar presentes

# Espacio en disco
df -h  # Verificar al menos 20GB libres
```

**Documentación:**
- Capturar versiones instaladas
- Screenshot de verificaciones exitosas

---

### 3.2 Fase 2: Ejecución del Instalador (20-30 min)

**Comando principal:**
```bash
cd /tmp/chatbotdysa-test/ChatBotDysa
chmod +x scripts/install-linux.sh
./scripts/install-linux.sh 2>&1 | tee /tmp/installer-test-linux.log
```

**Monitoreo durante instalación:**
```bash
# En otra terminal (si es posible)
watch -n 2 docker-compose ps
watch -n 5 docker stats --no-stream
```

**Puntos de verificación:**
1. [ ] Script inicia correctamente
2. [ ] Variables de entorno creadas (.env)
3. [ ] Imágenes Docker descargadas/construidas
4. [ ] Contenedores iniciados
5. [ ] Health checks ejecutándose
6. [ ] Sin errores críticos en logs

**Documentación:**
- Capturar log completo de instalación
- Timing de cada fase
- Errores encontrados (si los hay)

---

### 3.3 Fase 3: Verificación de Health Checks (10-15 min)

**Objetivo:** Verificar que todos los servicios marcan "healthy"

**Comando:**
```bash
# Esperar 90 segundos para que health checks se ejecuten
sleep 90

# Verificar estado de servicios
docker-compose ps

# Verificar health de cada servicio
docker inspect --format='{{json .State.Health}}' chatbotdysa-admin | jq
docker inspect --format='{{json .State.Health}}' chatbotdysa-backend | jq
docker inspect --format='{{json .State.Health}}' chatbotdysa-landing | jq
docker inspect --format='{{json .State.Health}}' chatbotdysa-postgres | jq
```

**Resultados esperados:**
```
NAME                   STATUS
chatbotdysa-admin      Up X minutes (healthy)   ✅
chatbotdysa-backend    Up X minutes (healthy)   ✅
chatbotdysa-landing    Up X minutes (healthy)   ✅
chatbotdysa-postgres   Up X minutes (healthy)   ✅
chatbotdysa-ollama     Up X minutes             ✅
chatbotdysa-redis      Up X minutes             ✅
```

**Si hay problemas:**
- [ ] Verificar logs: `docker logs chatbotdysa-[servicio]`
- [ ] Verificar networking: `docker network inspect chatbotdysa`
- [ ] Verificar puertos: `netstat -tuln | grep -E "(7001|8005|3004)"`

**Documentación:**
- Screenshot de `docker-compose ps`
- Estado de health de cada servicio
- Tiempo que tomó marcar healthy

---

### 3.4 Fase 4: Verificación de Endpoints HTTP (10 min)

**Objetivo:** Verificar que todos los endpoints responden correctamente

**Comandos:**
```bash
# Backend health
curl -s http://localhost:8005/health | jq

# Admin Panel health
curl -s http://localhost:7001/api/health | jq

# Landing Page health
curl -s http://localhost:3004/api/health/ | jq
```

**Resultados esperados:**
```json
// Backend
{
  "success": true,
  "data": {
    "status": "ok",
    "database": {"connected": true},
    ...
  }
}

// Admin Panel
{
  "status": "ok",
  "service": "ChatBotDysa Admin Panel",
  ...
}

// Landing Page
{
  "status": "ok",
  "service": "ChatBotDysa Landing Page",
  ...
}
```

**Métricas a capturar:**
```bash
# Response time de cada endpoint
time curl -s http://localhost:8005/health > /dev/null
time curl -s http://localhost:7001/api/health > /dev/null
time curl -s http://localhost:3004/api/health/ > /dev/null
```

**Documentación:**
- Response completo de cada endpoint
- Response time de cada uno
- Screenshot de verificaciones exitosas

---

### 3.5 Fase 5: Verificación de Logs (10 min)

**Objetivo:** Verificar que los logs muestran las mejoras implementadas

**Redis Logs:**
```bash
docker logs chatbotdysa-backend 2>&1 | grep -i "\[redis\]" | head -20
```

**Verificar:**
- [ ] Log de conexión: `[Redis] Connecting to redis:6379`
- [ ] Retry strategy visible: `[Redis] Retry attempt X, waiting Yms`
- [ ] Sin errores críticos

**Backend General:**
```bash
docker logs chatbotdysa-backend --tail 50
```

**Verificar:**
- [ ] Aplicación iniciada correctamente
- [ ] Base de datos conectada
- [ ] Sin errores de dependencias

**Documentación:**
- Capturar logs relevantes de Redis
- Capturar logs de inicio de servicios
- Identificar diferencias con macOS (si las hay)

---

### 3.6 Fase 6: Testing Funcional Básico (15-20 min)

**Objetivo:** Verificar funcionalidad básica del sistema

**Admin Panel:**
```bash
# Abrir en navegador
xdg-open http://localhost:7001  # Linux Desktop
# O usar curl para verificar
curl -I http://localhost:7001
```

**Verificaciones:**
- [ ] Panel admin carga correctamente
- [ ] Assets estáticos sirven bien
- [ ] No hay errores en consola del navegador

**Landing Page:**
```bash
# Abrir en navegador
xdg-open http://localhost:3004  # Linux Desktop
# O usar curl
curl -I http://localhost:3004
```

**Verificaciones:**
- [ ] Landing page carga correctamente
- [ ] Imágenes y estilos cargan
- [ ] No hay errores 404

**Backend API:**
```bash
# Verificar endpoints principales (sin auth)
curl -s http://localhost:8005/health
curl -s http://localhost:8005/api/v1/menu  # Si es público
```

**Documentación:**
- Screenshots de interfaces cargadas
- Response de endpoints probados
- Errores encontrados (si los hay)

---

## 4. COMPARACIÓN CON macOS

### 4.1 Puntos de Comparación

**A verificar si hay diferencias:**

1. **Tiempo de instalación**
   - macOS: [X] minutos
   - Linux: [Y] minutos
   - Diferencia: [Y-X] minutos

2. **Tiempo para health checks**
   - macOS: ~90 segundos
   - Linux: [?] segundos

3. **Response time de endpoints**
   - Backend: macOS ~50ms vs Linux [?]ms
   - Admin: macOS ~30ms vs Linux [?]ms
   - Landing: macOS ~25ms vs Linux [?]ms

4. **Logs y errores**
   - Comparar logs de Redis
   - Comparar errores de inicio
   - Identificar diferencias de networking

5. **Consumo de recursos**
   ```bash
   docker stats --no-stream
   ```
   - Comparar RAM usage
   - Comparar CPU usage

### 4.2 Formato de Documentación

```markdown
## Comparación macOS vs Linux

| Métrica | macOS | Linux | Diferencia |
|---------|-------|-------|------------|
| Tiempo instalación | Xm | Ym | ±Zm |
| Health checks | 90s | Ys | ±Zs |
| Backend response | 50ms | Yms | ±Zms |
| Admin response | 30ms | Yms | ±Zms |
| Landing response | 25ms | Yms | ±Zms |
| RAM total | XMB | YMB | ±ZMB |
| CPU usage | X% | Y% | ±Z% |
```

---

## 5. MANEJO DE ERRORES

### 5.1 Errores Comunes en Linux

**Docker permission denied:**
```bash
# Solución
sudo usermod -aG docker $USER
newgrp docker
# O usar sudo con docker-compose
```

**Puertos en uso:**
```bash
# Verificar puertos
sudo netstat -tuln | grep -E "(7001|8005|3004|15432|16379|21434)"

# Liberar puerto si es necesario
sudo lsof -ti:8005 | xargs kill
```

**Falta de memoria:**
```bash
# Verificar memoria disponible
free -h

# Aumentar swap si es necesario
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

**SELinux/AppArmor:**
```bash
# Si hay problemas de permisos de volumes
sudo setenforce 0  # RHEL/CentOS
# O
sudo aa-complain /etc/apparmor.d/*  # Ubuntu
```

### 5.2 Plan de Rollback

**Si la instalación falla:**
```bash
# 1. Detener servicios
docker-compose down

# 2. Limpiar volúmenes (si es necesario)
docker-compose down -v

# 3. Limpiar imágenes
docker system prune -a

# 4. Revisar logs
cat /tmp/installer-test-linux.log

# 5. Re-intentar con debug
DEBUG=1 ./scripts/install-linux.sh
```

---

## 6. DOCUMENTACIÓN A GENERAR

### 6.1 Archivo Principal

**Nombre:** `TESTING_LINUX_UBUNTU_20251005_[HORA].md`

**Estructura:**
```markdown
# TESTING LINUX UBUNTU 22.04

## 1. RESUMEN EJECUTIVO
- Resultado final
- Tiempo total
- Problemas encontrados

## 2. PREPARACIÓN DEL AMBIENTE
- Versiones instaladas
- Configuración VM
- Screenshots

## 3. EJECUCIÓN DEL INSTALADOR
- Log completo
- Timing de fases
- Errores (si los hay)

## 4. VERIFICACIÓN HEALTH CHECKS
- Estado de servicios
- Tiempo para healthy
- Comparación con macOS

## 5. VERIFICACIÓN ENDPOINTS HTTP
- Response de cada endpoint
- Response times
- Comparación con macOS

## 6. VERIFICACIÓN DE LOGS
- Logs Redis
- Logs backend
- Diferencias con macOS

## 7. TESTING FUNCIONAL
- Admin panel
- Landing page
- Backend API

## 8. COMPARACIÓN MULTI-OS
- Tabla comparativa completa
- Gráficos (opcional)
- Conclusiones

## 9. PROBLEMAS Y SOLUCIONES
- Issues encontrados
- Fixes aplicados
- Lecciones aprendidas

## 10. CONCLUSIONES
- Sistema funcional: SI/NO
- Recomendaciones
- Próximos pasos
```

### 6.2 Screenshots Requeridos

- [ ] `ubuntu_docker_version.png` - Versión de Docker instalada
- [ ] `ubuntu_compose_ps.png` - Estado de servicios
- [ ] `ubuntu_health_checks.png` - Health checks exitosos
- [ ] `ubuntu_admin_panel.png` - Admin panel cargado
- [ ] `ubuntu_landing_page.png` - Landing page cargada
- [ ] `ubuntu_docker_stats.png` - Estadísticas de recursos

### 6.3 Logs a Capturar

```bash
# Crear directorio para logs
mkdir -p /tmp/chatbotdysa-logs-linux

# Capturar logs
docker-compose logs > /tmp/chatbotdysa-logs-linux/all_services.log
docker logs chatbotdysa-backend > /tmp/chatbotdysa-logs-linux/backend.log
docker logs chatbotdysa-admin > /tmp/chatbotdysa-logs-linux/admin.log
docker logs chatbotdysa-landing > /tmp/chatbotdysa-logs-linux/landing.log
docker stats --no-stream > /tmp/chatbotdysa-logs-linux/stats.log

# Crear archivo comprimido
cd /tmp
tar -czf chatbotdysa-logs-linux.tar.gz chatbotdysa-logs-linux/
```

---

## 7. CHECKLIST DE VERIFICACIÓN

### ⏳ Pre-Testing
- [ ] VM Ubuntu 22.04 preparada
- [ ] Docker instalado y funcionando
- [ ] Herramientas de testing instaladas
- [ ] Repositorio clonado

### ⏳ Durante Testing
- [ ] Instalador ejecutado sin errores
- [ ] Servicios iniciados correctamente
- [ ] Health checks exitosos (4/4)
- [ ] Endpoints HTTP funcionando (3/3)
- [ ] Logs capturados

### ⏳ Post-Testing
- [ ] Documentación completa generada
- [ ] Screenshots capturados
- [ ] Logs guardados
- [ ] Comparación con macOS realizada
- [ ] Conclusiones documentadas

---

## 8. MÉTRICAS DE ÉXITO

### 8.1 Criterios de Aceptación

**ÉXITO COMPLETO si:**
- ✅ Instalador ejecuta sin errores críticos
- ✅ 4/4 servicios marcan (healthy)
- ✅ 3/3 endpoints HTTP responden correctamente
- ✅ Logs muestran mejoras implementadas
- ✅ Admin panel y landing page cargan
- ✅ Performance similar a macOS (±20%)

**ÉXITO PARCIAL si:**
- ✅ Sistema funciona pero con warnings
- ✅ Performance aceptable (±50% vs macOS)
- ✅ Problemas menores documentados y solucionables

**FALLO si:**
- ❌ Instalador no completa
- ❌ Servicios no inician
- ❌ Health checks fallan persistentemente
- ❌ Endpoints no responden
- ❌ Errores críticos sin solución

### 8.2 KPIs a Medir

1. **Tiempo de instalación:** < 15 minutos
2. **Tiempo a healthy:** < 120 segundos
3. **Response time backend:** < 100ms
4. **Response time admin:** < 100ms
5. **Response time landing:** < 100ms
6. **RAM usage total:** < 2GB
7. **CPU usage promedio:** < 50%

---

## 9. PRÓXIMOS PASOS POST-TESTING

### Si el testing es exitoso:

1. **✅ Proceder con Windows 11**
   - Preparar VM Windows
   - Ejecutar instalador PowerShell
   - Documentar resultados

2. **✅ Crear matriz de compatibilidad**
   ```markdown
   | OS | Versión | Estado | Notas |
   |----|---------|--------|-------|
   | macOS | 14.x | ✅ | Sin problemas |
   | Linux | 22.04 | ✅/⚠️/❌ | [Detalles] |
   | Windows | 11 | ⏳ | Pendiente |
   ```

3. **✅ Actualizar documentación**
   - README con requisitos multi-OS
   - Troubleshooting específico por OS
   - FAQ actualizado

### Si hay problemas:

1. **⚠️ Debug y corrección**
   - Identificar causa raíz
   - Aplicar fix
   - Re-testing

2. **⚠️ Documentar workarounds**
   - Instrucciones específicas Linux
   - Modificaciones necesarias
   - Limitaciones conocidas

3. **⚠️ Considerar alternativas**
   - Instalador manual para Linux
   - Scripts adicionales
   - Documentación detallada

---

## 10. RECURSOS Y REFERENCIAS

### 10.1 Documentación Ubuntu

- Docker en Ubuntu: https://docs.docker.com/engine/install/ubuntu/
- Docker Compose: https://docs.docker.com/compose/install/
- Networking Ubuntu: https://ubuntu.com/server/docs/network-configuration

### 10.2 Documentación del Proyecto

- `/Users/devlmer/ChatBotDysa/README.md`
- `/Users/devlmer/ChatBotDysa/scripts/install-linux.sh`
- Documentación de sesión macOS (referencia)

### 10.3 Comandos de Referencia

```bash
# Información del sistema
uname -a
lsb_release -a
hostnamectl

# Docker
docker version
docker-compose version
docker system info

# Networking
ip addr show
netstat -tuln
ss -tuln

# Recursos
free -h
df -h
top -bn1 | head -20
```

---

## ✅ PREPARACIÓN COMPLETADA

Este plan está listo para ser ejecutado. Próximos pasos:

1. ⏳ Preparar VM Ubuntu 22.04
2. ⏳ Ejecutar este plan paso a paso
3. ⏳ Documentar resultados con timestamps
4. ⏳ Comparar con resultados macOS
5. ⏳ Generar reporte final

---

**Creado:** 2025-10-04 19:03
**Estado:** ⏳ Listo para ejecución
**Próxima sesión:** TBD

---

*Documento generado automáticamente por Claude Code*
*Basado en resultados exitosos de testing macOS*
