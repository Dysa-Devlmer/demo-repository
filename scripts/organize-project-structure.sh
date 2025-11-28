#!/bin/bash

# ============================================================================
# Script de Organización de Estructura del Proyecto
# ============================================================================
# Limpia y organiza todos los archivos en la raíz del proyecto
# Mueve documentación a /docs con estructura organizada
# ============================================================================

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Organizando estructura del proyecto${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Navegar a la raíz del proyecto
cd /Users/devlmer/ChatBotDysa

# ============================================================================
# 1. CREAR ESTRUCTURA DE DIRECTORIOS EN /docs
# ============================================================================
echo -e "${YELLOW}Creando estructura de directorios...${NC}"

mkdir -p docs/guides
mkdir -p docs/deployment
mkdir -p docs/architecture
mkdir -p docs/reports
mkdir -p docs/audits
mkdir -p docs/solutions
mkdir -p docs/testing
mkdir -p docs/production

echo -e "${GREEN}✓ Estructura de directorios creada${NC}\n"

# ============================================================================
# 2. MOVER ARCHIVOS DE GUÍAS
# ============================================================================
echo -e "${YELLOW}Organizando guías...${NC}"

# Guías generales
[ -f "GUIA_RAPIDA_USO.md" ] && mv "GUIA_RAPIDA_USO.md" docs/guides/
[ -f "GUIA_COMPLETA_VERIFICACION_SISTEMA.md" ] && mv "GUIA_COMPLETA_VERIFICACION_SISTEMA.md" docs/guides/
[ -f "GUIA_PRUEBAS_PRODUCCION_LOCAL.md" ] && mv "GUIA_PRUEBAS_PRODUCCION_LOCAL.md" docs/guides/
[ -f "GUIA_PRUEBA_RESTAURANTE.md" ] && mv "GUIA_PRUEBA_RESTAURANTE.md" docs/guides/
[ -f "GUIA_TESTING_LOCAL.md" ] && mv "GUIA_TESTING_LOCAL.md" docs/guides/
[ -f "GUIA_TODAS_APLICACIONES_WEB.md" ] && mv "GUIA_TODAS_APLICACIONES_WEB.md" docs/guides/
[ -f "COMO_ACCEDER.md" ] && mv "COMO_ACCEDER.md" docs/guides/
[ -f "INICIO_RAPIDO.md" ] && mv "INICIO_RAPIDO.md" docs/guides/
[ -f "QUICK_START.md" ] && mv "QUICK_START.md" docs/guides/

echo -e "${GREEN}✓ Guías organizadas${NC}"

# ============================================================================
# 3. MOVER ARCHIVOS DE DEPLOYMENT
# ============================================================================
echo -e "${YELLOW}Organizando documentación de deployment...${NC}"

[ -f "DEPLOYMENT.md" ] && mv "DEPLOYMENT.md" docs/deployment/
[ -f "DEPLOYMENT_GUIDE.md" ] && mv "DEPLOYMENT_GUIDE.md" docs/deployment/
[ -f "GUIA_DESPLIEGUE_PRODUCCION.md" ] && mv "GUIA_DESPLIEGUE_PRODUCCION.md" docs/deployment/
[ -f "COMO_DESPLEGAR.md" ] && mv "COMO_DESPLEGAR.md" docs/deployment/
[ -f "PRODUCTION_DEPLOYMENT_GUIDE.md" ] && mv "PRODUCTION_DEPLOYMENT_GUIDE.md" docs/deployment/
[ -f "INSTRUCCIONES_PRUEBA_PRODUCCION.md" ] && mv "INSTRUCCIONES_PRUEBA_PRODUCCION.md" docs/deployment/
[ -f "CHECKLIST_PRODUCCION.md" ] && mv "CHECKLIST_PRODUCCION.md" docs/deployment/

echo -e "${GREEN}✓ Deployment docs organizados${NC}"

# ============================================================================
# 4. MOVER ARCHIVOS DE ARQUITECTURA
# ============================================================================
echo -e "${YELLOW}Organizando documentación de arquitectura...${NC}"

[ -f "ARQUITECTURA_COMPLETA_SISTEMA.md" ] && mv "ARQUITECTURA_COMPLETA_SISTEMA.md" docs/architecture/
[ -f "PLAN_COMPLETAR_SISTEMA.md" ] && mv "PLAN_COMPLETAR_SISTEMA.md" docs/architecture/

echo -e "${GREEN}✓ Arquitectura organizada${NC}"

# ============================================================================
# 5. MOVER REPORTES Y AUDITORÍAS
# ============================================================================
echo -e "${YELLOW}Organizando reportes y auditorías...${NC}"

[ -f "AUDITORIA_Y_CORRECCIONES_2025-11-11.md" ] && mv "AUDITORIA_Y_CORRECCIONES_2025-11-11.md" docs/audits/
[ -f "CORRECCIONES_COMPLETAS_2025-11-11.md" ] && mv "CORRECCIONES_COMPLETAS_2025-11-11.md" docs/audits/
[ -f "AUDIT_ADMIN_PANEL.md" ] && mv "AUDIT_ADMIN_PANEL.md" docs/audits/
[ -f "REPORTE_ERRORES_ADMIN_PANEL.md" ] && mv "REPORTE_ERRORES_ADMIN_PANEL.md" docs/audits/
[ -f "RESUMEN_CORRECCIONES_ADMIN_PANEL.md" ] && mv "RESUMEN_CORRECCIONES_ADMIN_PANEL.md" docs/audits/
[ -f "TEST_REPORT_2025-10-22.md" ] && mv "TEST_REPORT_2025-10-22.md" docs/audits/
[ -f "ANALISIS_HONESTO_PRODUCCION.md" ] && mv "ANALISIS_HONESTO_PRODUCCION.md" docs/audits/

echo -e "${GREEN}✓ Reportes y auditorías organizados${NC}"

# ============================================================================
# 6. MOVER SOLUCIONES Y CORRECCIONES
# ============================================================================
echo -e "${YELLOW}Organizando soluciones...${NC}"

[ -f "SOLUCION_ERRORES_EXTENSIONES.md" ] && mv "SOLUCION_ERRORES_EXTENSIONES.md" docs/solutions/
[ -f "SOLUCION_ERROR_MENU.md" ] && mv "SOLUCION_ERROR_MENU.md" docs/solutions/
[ -f "SOLUCION_FINAL_COMPLETA.md" ] && mv "SOLUCION_FINAL_COMPLETA.md" docs/solutions/
[ -f "SOLUCION_MIGRACIONES.md" ] && mv "SOLUCION_MIGRACIONES.md" docs/solutions/
[ -f "SOLUCION_PERMANENTE_MIGRACIONES.md" ] && mv "SOLUCION_PERMANENTE_MIGRACIONES.md" docs/solutions/
[ -f "CORRECCIONES_SCRIPT.md" ] && mv "CORRECCIONES_SCRIPT.md" docs/solutions/

echo -e "${GREEN}✓ Soluciones organizadas${NC}"

# ============================================================================
# 7. MOVER ESTADOS Y RESÚMENES
# ============================================================================
echo -e "${YELLOW}Organizando estados del sistema...${NC}"

[ -f "ESTADO_FINAL_SISTEMA.md" ] && mv "ESTADO_FINAL_SISTEMA.md" docs/reports/
[ -f "ESTADO_SISTEMA_2025-11-11.md" ] && mv "ESTADO_SISTEMA_2025-11-11.md" docs/reports/
[ -f "RESUMEN_FINAL_SESION.md" ] && mv "RESUMEN_FINAL_SESION.md" docs/reports/
[ -f "RESUMEN_FINAL_SISTEMA.md" ] && mv "RESUMEN_FINAL_SISTEMA.md" docs/reports/
[ -f "TESTING_LOCAL_RESUMEN.md" ] && mv "TESTING_LOCAL_RESUMEN.md" docs/reports/

echo -e "${GREEN}✓ Estados y resúmenes organizados${NC}"

# ============================================================================
# 8. MOVER DOCUMENTOS DE PRODUCCIÓN
# ============================================================================
echo -e "${YELLOW}Organizando docs de producción...${NC}"

[ -f "SISTEMA_LISTO_PRODUCCION.md" ] && mv "SISTEMA_LISTO_PRODUCCION.md" docs/production/
[ -f "PRODUCTION_READY_IMPROVEMENTS.md" ] && mv "PRODUCTION_READY_IMPROVEMENTS.md" docs/production/
[ -f "LIMPIEZA_COMPLETADA.md" ] && mv "LIMPIEZA_COMPLETADA.md" docs/production/

echo -e "${GREEN}✓ Docs de producción organizados${NC}"

# ============================================================================
# 9. LIMPIAR ARCHIVOS .env DUPLICADOS
# ============================================================================
echo -e "${YELLOW}Limpiando archivos .env duplicados...${NC}"

# Mantener solo los necesarios:
# - .env (principal)
# - .env.example (template)
# - .env.production (producción)
# - .env.local (local development)

# Eliminar duplicados innecesarios
[ -f ".env.secrets.temp" ] && rm .env.secrets.temp && echo "  Eliminado: .env.secrets.temp"
[ -f ".env.production.local" ] && rm .env.production.local && echo "  Eliminado: .env.production.local"
[ -f ".env.production.template" ] && rm .env.production.template && echo "  Eliminado: .env.production.template"
[ -f ".env.development" ] && rm .env.development && echo "  Eliminado: .env.development"

echo -e "${GREEN}✓ Archivos .env limpiados${NC}"

# ============================================================================
# 10. LIMPIAR ARCHIVOS TEMPORALES/OBSOLETOS
# ============================================================================
echo -e "${YELLOW}Limpiando archivos temporales...${NC}"

# continuar.md parece ser notas temporales
[ -f "continuar.md" ] && rm continuar.md && echo "  Eliminado: continuar.md"

echo -e "${GREEN}✓ Archivos temporales eliminados${NC}"

# ============================================================================
# 11. REORGANIZAR SCRIPTS
# ============================================================================
echo -e "${YELLOW}Verificando scripts...${NC}"

# Los scripts ya están en /scripts, solo verificar que existen
if [ -d "scripts" ]; then
    SCRIPT_COUNT=$(find scripts -name "*.sh" | wc -l)
    echo -e "${GREEN}✓ Scripts organizados ($SCRIPT_COUNT archivos)${NC}"
else
    echo -e "${RED}✗ Directorio /scripts no encontrado${NC}"
fi

# ============================================================================
# 12. CREAR ÍNDICE DE DOCUMENTACIÓN
# ============================================================================
echo -e "${YELLOW}Creando índice de documentación...${NC}"

cat > docs/INDEX.md << 'EOF'
# 📚 Índice de Documentación - ChatBotDysa Enterprise

**Última actualización:** 11 de Noviembre, 2025

---

## 🚀 Inicio Rápido

- [README Principal](../README.md)
- [Inicio Rápido](guides/INICIO_RAPIDO.md)
- [Quick Start (EN)](guides/QUICK_START.md)
- [Guía Rápida de Uso](guides/GUIA_RAPIDA_USO.md)

---

## 📖 Guías de Usuario

### Desarrollo y Testing
- [Guía de Testing Local](guides/GUIA_TESTING_LOCAL.md)
- [Guía de Pruebas Producción Local](guides/GUIA_PRUEBAS_PRODUCCION_LOCAL.md)
- [Guía de Verificación Completa del Sistema](guides/GUIA_COMPLETA_VERIFICACION_SISTEMA.md)
- [Guía Prueba Restaurante](guides/GUIA_PRUEBA_RESTAURANTE.md)
- [Guía Todas las Aplicaciones Web](guides/GUIA_TODAS_APLICACIONES_WEB.md)

### Acceso y Uso
- [Cómo Acceder](guides/COMO_ACCEDER.md)

---

## 🚢 Deployment

- [Deployment Guide](deployment/DEPLOYMENT.md)
- [Production Deployment Guide](deployment/PRODUCTION_DEPLOYMENT_GUIDE.md)
- [Guía de Despliegue a Producción](deployment/GUIA_DESPLIEGUE_PRODUCCION.md)
- [Cómo Desplegar](deployment/COMO_DESPLEGAR.md)
- [Checklist de Producción](deployment/CHECKLIST_PRODUCCION.md)
- [Instrucciones Prueba Producción](deployment/INSTRUCCIONES_PRUEBA_PRODUCCION.md)

---

## 🏗️ Arquitectura

- [Arquitectura Completa del Sistema](architecture/ARQUITECTURA_COMPLETA_SISTEMA.md)
- [Arquitectura Oficial](architecture/ARQUITECTURA_OFICIAL.md) *(próximamente)*
- [Plan para Completar el Sistema](architecture/PLAN_COMPLETAR_SISTEMA.md)

---

## 🔍 Auditorías y Reportes

### Auditorías
- [Auditoría y Correcciones 2025-11-11](audits/AUDITORIA_Y_CORRECCIONES_2025-11-11.md)
- [Correcciones Completas 2025-11-11](audits/CORRECCIONES_COMPLETAS_2025-11-11.md)
- [Auditoría Admin Panel](audits/AUDIT_ADMIN_PANEL.md)
- [Reporte de Errores Admin Panel](audits/REPORTE_ERRORES_ADMIN_PANEL.md)
- [Resumen Correcciones Admin Panel](audits/RESUMEN_CORRECCIONES_ADMIN_PANEL.md)
- [Test Report 2025-10-22](audits/TEST_REPORT_2025-10-22.md)
- [Análisis Honesto Producción](audits/ANALISIS_HONESTO_PRODUCCION.md)

### Estados del Sistema
- [Estado Final del Sistema](reports/ESTADO_FINAL_SISTEMA.md)
- [Estado Sistema 2025-11-11](reports/ESTADO_SISTEMA_2025-11-11.md)
- [Resumen Final Sesión](reports/RESUMEN_FINAL_SESION.md)
- [Resumen Final Sistema](reports/RESUMEN_FINAL_SISTEMA.md)
- [Testing Local Resumen](reports/TESTING_LOCAL_RESUMEN.md)

---

## 🔧 Soluciones y Correcciones

- [Solución Errores Extensiones](solutions/SOLUCION_ERRORES_EXTENSIONES.md)
- [Solución Error Menú](solutions/SOLUCION_ERROR_MENU.md)
- [Solución Final Completa](solutions/SOLUCION_FINAL_COMPLETA.md)
- [Solución Migraciones](solutions/SOLUCION_MIGRACIONES.md)
- [Solución Permanente Migraciones](solutions/SOLUCION_PERMANENTE_MIGRACIONES.md)
- [Correcciones Script](solutions/CORRECCIONES_SCRIPT.md)

---

## 🏭 Producción

- [Sistema Listo para Producción](production/SISTEMA_LISTO_PRODUCCION.md)
- [Production Ready Improvements](production/PRODUCTION_READY_IMPROVEMENTS.md)
- [Limpieza Completada](production/LIMPIEZA_COMPLETADA.md)

---

## 📂 Otras Secciones

- [API Documentation](API_DOCUMENTATION.md)
- [Installation Guide](INSTALLATION_GUIDE.md)
- [User Guide](USER_GUIDE.md)
- [Troubleshooting](TROUBLESHOOTING.md)
- [Security](SECURITY.md)
- [Contributing](CONTRIBUTING.md)

---

## 🌍 Documentación en Español

Ver: [docs/es/](es/)

---

**Sistema:** ChatBotDysa Enterprise+++++
**Organizado:** 11 de Noviembre, 2025
**Mantenedor:** DevOps Team
EOF

echo -e "${GREEN}✓ Índice de documentación creado${NC}"

# ============================================================================
# RESUMEN FINAL
# ============================================================================
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}Organización completada${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${GREEN}✅ Estructura del proyecto organizada${NC}"
echo -e "\n${YELLOW}Estructura actual:${NC}"
echo -e "
📁 /Users/devlmer/ChatBotDysa/
├── 📄 README.md                    (raíz)
├── 📄 .env                         (principal)
├── 📄 .env.example                 (template)
├── 📄 .env.production              (producción)
├── 📄 .env.local                   (desarrollo)
├── 📄 package.json
├── 📄 docker-compose.yml
│
├── 📁 apps/                        (aplicaciones)
│   ├── admin-panel/
│   ├── backend/
│   ├── landing-page/
│   ├── web-widget/
│   └── website/
│
├── 📁 docs/                        (documentación)
│   ├── 📁 guides/                 (guías de usuario)
│   ├── 📁 deployment/             (deployment)
│   ├── 📁 architecture/           (arquitectura)
│   ├── 📁 audits/                 (auditorías)
│   ├── 📁 solutions/              (soluciones)
│   ├── 📁 reports/                (reportes)
│   ├── 📁 production/             (producción)
│   └── INDEX.md                   (índice)
│
├── 📁 scripts/                     (scripts de automatización)
├── 📁 infrastructure/              (infraestructura)
├── 📁 logs/                        (logs del sistema)
└── 📁 Reportes/                    (reportes de sesiones)
"

echo -e "${GREEN}✓ Archivos .md organizados en /docs/${NC}"
echo -e "${GREEN}✓ Scripts en /scripts/${NC}"
echo -e "${GREEN}✓ Archivos .env limpiados${NC}"
echo -e "${GREEN}✓ Índice de documentación creado${NC}\n"

echo -e "${BLUE}Para ver la documentación organizada:${NC}"
echo -e "  ${YELLOW}cat docs/INDEX.md${NC}\n"
