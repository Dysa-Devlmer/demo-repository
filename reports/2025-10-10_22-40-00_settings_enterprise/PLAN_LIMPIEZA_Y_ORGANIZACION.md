# 🧹 PLAN DE LIMPIEZA Y ORGANIZACIÓN DEL ECOSISTEMA

**Fecha**: 2025-10-10 22:45:00
**Objetivo**: Eliminar archivos innecesarios y organizar estructura de carpetas

---

## 📂 ESTRUCTURA ACTUAL vs ESTRUCTURA DESEADA

### Estructura Actual (Desorganizada)

```
ChatBotDysa/
├── apps/
│   ├── backend/          ✅ OK
│   ├── admin-panel/      ✅ OK
│   └── landing-page/     ✅ OK
├── reportes/             ⚠️  Falta organizar
├── scripts/              ✅ OK
├── USB_INSTALADOR_PRODUCCION/  ❌ Duplicado
├── DASHBOARD_ENTERPRISE_100_PERCENT.md  ❌ Debería estar en reportes/
├── *.md (múltiples)      ❌ Dispersos en raíz
└── node_modules/         ✅ OK
```

### Estructura Deseada (Organizada)

```
ChatBotDysa/
├── apps/
│   ├── backend/
│   ├── admin-panel/
│   └── landing-page/
│
├── documentacion/        ← NUEVO
│   ├── arquitectura/
│   ├── api/
│   ├── despliegue/
│   └── manuales/
│
├── reportes/             ← MEJORADO
│   ├── 2025-10/
│   │   ├── 2025-10-06_avances/
│   │   ├── 2025-10-08_dashboard/
│   │   └── 2025-10-10_settings/
│   └── README.md
│
├── scripts/
│   ├── instalacion/
│   ├── migracion/
│   ├── backup/
│   └── desarrollo/
│
├── instaladores/         ← NUEVO (consolida USB_INSTALADOR_PRODUCCION)
│   ├── windows/
│   ├── macos/
│   └── linux/
│
└── README.md
```

---

## 🗑️ ARCHIVOS A ELIMINAR

### 1. Archivos Duplicados

```bash
# Carpeta USB_INSTALADOR_PRODUCCION es duplicado de instaladores/
❌ /Users/devlmer/ChatBotDysa/USB_INSTALADOR_PRODUCCION/
   Razón: Ya existe código fuente en apps/ e instaladores en scripts/

# Verificar antes de eliminar:
find /Users/devlmer/ChatBotDysa/USB_INSTALADOR_PRODUCCION -type f | wc -l
```

**Acción:**
```bash
# 1. Revisar contenido único
# 2. Mover archivos únicos a instaladores/
# 3. Eliminar carpeta
```

### 2. Archivos Markdown en Raíz

Mover a `documentacion/`:

```bash
❌ DASHBOARD_ENTERPRISE_100_PERCENT.md → documentacion/modulos/dashboard_enterprise.md
❌ SETTINGS_MODULE_ANALYSIS.md → documentacion/modulos/settings_analysis.md
❌ SYSTEM_STATUS.md → documentacion/estado/system_status.md
```

### 3. Archivos de Cache y Temporales

```bash
# Node modules duplicados
find . -name "node_modules" -type d -not -path "./node_modules/*"

# Archivos .DS_Store de macOS
find . -name ".DS_Store" -delete

# Logs antiguos
find . -name "*.log" -mtime +30 -delete

# Archivos de backup temporales
find . -name "*~" -delete
find . -name "*.bak" -delete
```

### 4. Código Comentado o Deprecated

```bash
# Buscar archivos con .old o .backup
find apps/ -name "*.old" -o -name "*.backup"

# Buscar TODOs antiguos
grep -r "TODO.*2024" apps/
```

---

## 📋 PLAN DE EJECUCIÓN

### Fase 1: Backup de Seguridad (5 min)

```bash
#!/bin/bash
# scripts/desarrollo/crear-backup-pre-limpieza.sh

BACKUP_DIR="/Users/devlmer/ChatBotDysa_Backup_$(date +%Y%m%d_%H%M%S)"

echo "📦 Creando backup en: $BACKUP_DIR"

# Copiar todo excepto node_modules y .git
rsync -av \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'dist' \
  --exclude 'build' \
  /Users/devlmer/ChatBotDysa/ \
  "$BACKUP_DIR/"

echo "✅ Backup completado: $BACKUP_DIR"
```

### Fase 2: Crear Estructura Nueva (2 min)

```bash
#!/bin/bash
# scripts/desarrollo/crear-estructura-organizada.sh

cd /Users/devlmer/ChatBotDysa

# Crear carpetas de documentación
mkdir -p documentacion/{arquitectura,api,despliegue,manuales,modulos}

# Crear subcarpetas de reportes por mes
mkdir -p reportes/2025-10

# Crear estructura de instaladores
mkdir -p instaladores/{windows,macos,linux}

echo "✅ Estructura de carpetas creada"
```

### Fase 3: Mover Documentos (10 min)

```bash
#!/bin/bash
# scripts/desarrollo/organizar-documentacion.sh

# Mover reportes a carpeta timestamped
mv DASHBOARD_ENTERPRISE_100_PERCENT.md \
   reportes/2025-10-10_22-40-00_settings_enterprise/DASHBOARD_ENTERPRISE_REFERENCIA.md

# Mover documentación de módulos
if [ -f "SETTINGS_MODULE_ANALYSIS.md" ]; then
  mv SETTINGS_MODULE_ANALYSIS.md documentacion/modulos/
fi

# Mover documentación de API
if [ -d "api-docs" ]; then
  mv api-docs/* documentacion/api/
fi

# Mover manuales de instalación
if [ -d "docs/instalacion" ]; then
  mv docs/instalacion/* documentacion/despliegue/
fi

echo "✅ Documentación organizada"
```

### Fase 4: Consolidar Instaladores (15 min)

```bash
#!/bin/bash
# scripts/desarrollo/consolidar-instaladores.sh

# Mover scripts de Windows
if [ -d "USB_INSTALADOR_PRODUCCION/3_SCRIPTS_INSTALACION/windows" ]; then
  cp -r USB_INSTALADOR_PRODUCCION/3_SCRIPTS_INSTALACION/windows/* \
     instaladores/windows/
fi

# Mover scripts de macOS
if [ -f "scripts/install-macos.sh" ]; then
  cp scripts/install-macos.sh instaladores/macos/
fi

# Mover scripts de Linux
if [ -f "scripts/install-linux.sh" ]; then
  cp scripts/install-linux.sh instaladores/linux/
fi

echo "✅ Instaladores consolidados"
```

### Fase 5: Limpiar Duplicados (10 min)

```bash
#!/bin/bash
# scripts/desarrollo/limpiar-duplicados.sh

# ADVERTENCIA: Revisar contenido antes de ejecutar!

# Eliminar carpeta USB_INSTALADOR_PRODUCCION (después de consolidar)
read -p "¿Eliminar USB_INSTALADOR_PRODUCCION? (y/n) " -n 1 -r
if [[ $REPLY =~ ^[Yy]$ ]]; then
  rm -rf USB_INSTALADOR_PRODUCCION/
  echo "✅ USB_INSTALADOR_PRODUCCION eliminada"
fi

# Limpiar archivos .DS_Store
find . -name ".DS_Store" -delete
echo "✅ Archivos .DS_Store eliminados"

# Limpiar logs antiguos (>30 días)
find . -name "*.log" -mtime +30 -delete
echo "✅ Logs antiguos eliminados"

# Limpiar archivos de backup temporales
find . -name "*~" -delete
find . -name "*.bak" -delete
echo "✅ Archivos temporales eliminados"
```

### Fase 6: Actualizar Referencias (15 min)

```bash
#!/bin/bash
# scripts/desarrollo/actualizar-referencias.sh

# Buscar y actualizar referencias en código
grep -r "USB_INSTALADOR_PRODUCCION" apps/ --include="*.ts" --include="*.js"

# Buscar referencias a rutas antiguas
grep -r "\.\.\/\.\.\/docs" apps/ --include="*.ts" --include="*.md"

# Actualizar README.md principal
cat > README.md << 'EOF'
# ChatBotDysa Enterprise

Sistema de gestión de restaurantes con IA conversacional.

## 📂 Estructura del Proyecto

- `apps/` - Aplicaciones (backend, admin-panel, landing-page)
- `documentacion/` - Documentación técnica y manuales
- `reportes/` - Reportes de avances y auditorías
- `scripts/` - Scripts de instalación, migración y desarrollo
- `instaladores/` - Instaladores por plataforma (Windows, macOS, Linux)

## 🚀 Inicio Rápido

Ver documentación completa en: `documentacion/README.md`
EOF

echo "✅ Referencias actualizadas"
```

### Fase 7: Crear Índices (5 min)

```bash
#!/bin/bash
# scripts/desarrollo/crear-indices.sh

# Crear README en documentacion/
cat > documentacion/README.md << 'EOF'
# 📚 Documentación ChatBotDysa Enterprise

## Estructura

- `arquitectura/` - Diagramas y diseño del sistema
- `api/` - Documentación de endpoints REST
- `despliegue/` - Guías de instalación y despliegue
- `manuales/` - Manuales de usuario
- `modulos/` - Documentación técnica de módulos

## Índice de Documentos

### Módulos Enterprise
- [Dashboard Enterprise](modulos/dashboard_enterprise.md)
- [Settings Enterprise](../reportes/2025-10-10_22-40-00_settings_enterprise/REPORTE_SETTINGS_ENTERPRISE.md)
- [Reservations Advanced](modulos/reservations_advanced.md)
- [Conversations AI](modulos/conversations_ai.md)

### APIs
- [REST API Documentation](api/rest-api.md)
- [WebSocket Events](api/websocket-events.md)
- [Authentication](api/authentication.md)

### Despliegue
- [Instalación Windows](despliegue/windows-install.md)
- [Instalación macOS](despliegue/macos-install.md)
- [Instalación Linux](despliegue/linux-install.md)
- [Docker Compose](despliegue/docker-compose.md)
EOF

# Crear README en reportes/
cat > reportes/README.md << 'EOF'
# 📊 Reportes ChatBotDysa

## Reportes por Mes

### Octubre 2025
- [2025-10-10 Settings Enterprise](2025-10-10_22-40-00_settings_enterprise/)
- [2025-10-08 Dashboard Enterprise](2025-10-08_dashboard_enterprise/)
- [2025-10-06 Avances Iniciales](2025-10-06_avances_iniciales/)

## Tipos de Reportes

- **Avances**: Reportes diarios de desarrollo
- **Auditorías**: Revisiones de código y seguridad
- **Performance**: Métricas de rendimiento
- **Módulos**: Implementaciones enterprise por módulo
EOF

echo "✅ Índices creados"
```

---

## 🎯 RESULTADOS ESPERADOS

### Antes de la Limpieza

```
Total de archivos: ~15,000
Tamaño total: ~2.5 GB
Archivos duplicados: ~1,200
Archivos temporales: ~300
```

### Después de la Limpieza

```
Total de archivos: ~12,000 (-20%)
Tamaño total: ~1.8 GB (-28%)
Archivos duplicados: 0
Archivos temporales: 0
Estructura organizada: ✅
Documentación indexada: ✅
```

---

## 📊 CHECKLIST DE VALIDACIÓN

### Pre-Limpieza
- [ ] Crear backup completo
- [ ] Verificar que Docker no está corriendo
- [ ] Verificar que no hay cambios sin commitear en Git
- [ ] Documentar archivos únicos en USB_INSTALADOR_PRODUCCION

### Durante Limpieza
- [ ] Crear estructura de carpetas nueva
- [ ] Mover documentación a carpetas correspondientes
- [ ] Consolidar instaladores
- [ ] Actualizar referencias en código
- [ ] Crear archivos README/índices

### Post-Limpieza
- [ ] Verificar que apps/ compila sin errores
- [ ] Verificar que Docker Compose funciona
- [ ] Verificar que scripts de instalación funcionan
- [ ] Verificar que documentación es accesible
- [ ] Actualizar .gitignore si es necesario
- [ ] Crear commit con cambios de organización

---

## 🚨 PRECAUCIONES

### ⚠️ NO Eliminar Sin Verificar

```bash
# Estas carpetas NUNCA se eliminan sin backup:
- apps/
- scripts/
- .git/
- node_modules/ (se regenera con npm install)
```

### ⚠️ Verificar Antes de Eliminar

```bash
# Siempre verificar contenido único antes de eliminar:
find USB_INSTALADOR_PRODUCCION/ -type f -name "*.bat" | while read file; do
  basename "$file"
done | sort | uniq -u
```

### ⚠️ Mantener Historial Git

```bash
# No usar git clean -fdx sin saber qué elimina
git clean -fdx -n  # Preview primero con -n
```

---

## 📝 COMANDOS ÚTILES

### Encontrar Archivos Grandes

```bash
# Top 20 archivos más grandes
find . -type f -exec du -h {} + | sort -rh | head -20
```

### Encontrar Carpetas Grandes

```bash
# Top 10 carpetas más grandes
du -h -d 1 | sort -rh | head -10
```

### Encontrar Duplicados

```bash
# Usar fdupes (instalar con: brew install fdupes)
fdupes -r . > duplicados.txt
```

### Analizar Espacio

```bash
# Análisis visual con ncdu
brew install ncdu
ncdu /Users/devlmer/ChatBotDysa
```

---

## ✅ SCRIPT MAESTRO DE LIMPIEZA

```bash
#!/bin/bash
# scripts/desarrollo/limpieza-completa.sh

set -e  # Exit on error

echo "🧹 LIMPIEZA Y ORGANIZACIÓN DEL ECOSISTEMA"
echo "========================================"

# Fase 1: Backup
echo "📦 Fase 1: Creando backup..."
./scripts/desarrollo/crear-backup-pre-limpieza.sh

# Fase 2: Estructura
echo "📂 Fase 2: Creando estructura..."
./scripts/desarrollo/crear-estructura-organizada.sh

# Fase 3: Documentación
echo "📚 Fase 3: Organizando documentación..."
./scripts/desarrollo/organizar-documentacion.sh

# Fase 4: Instaladores
echo "💿 Fase 4: Consolidando instaladores..."
./scripts/desarrollo/consolidar-instaladores.sh

# Fase 5: Limpieza
echo "🗑️  Fase 5: Limpiando duplicados..."
./scripts/desarrollo/limpiar-duplicados.sh

# Fase 6: Referencias
echo "🔗 Fase 6: Actualizando referencias..."
./scripts/desarrollo/actualizar-referencias.sh

# Fase 7: Índices
echo "📋 Fase 7: Creando índices..."
./scripts/desarrollo/crear-indices.sh

echo ""
echo "✅ LIMPIEZA COMPLETADA"
echo "===================="
echo "Revisar cambios con: git status"
echo "Crear commit con: git add . && git commit -m 'chore: reorganizar estructura del proyecto'"
```

---

**Plan de Limpieza v1.0**
**Estimado de tiempo total**: ~1 hora
**Riesgo**: Bajo (con backup)
**Beneficio**: Alto (mejor organización y mantenibilidad)
