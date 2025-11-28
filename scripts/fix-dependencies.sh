#!/bin/bash
# ChatBotDysa Enterprise+++++ - Script de Corrección de Dependencias
# Fecha: 2025-10-13
# Versión: 1.0
# Descripción: Corrige conflictos de versiones y dependencias duplicadas

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root
PROJECT_ROOT="/Users/devlmer/ChatBotDysa"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  ChatBotDysa - Corrección Dependencias  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Function to print step
print_step() {
  echo -e "${YELLOW}▶ $1${NC}"
}

# Function to print success
print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error
print_error() {
  echo -e "${RED}✗ $1${NC}"
}

# ============================================
# Fase 1: Correcciones Críticas
# ============================================

echo -e "${BLUE}📌 Fase 1: Correcciones Críticas${NC}"
echo ""

print_step "1/3 - Eliminando @next/font del raíz..."
cd "$PROJECT_ROOT"
if npm list @next/font > /dev/null 2>&1; then
  npm uninstall @next/font > /dev/null 2>&1
  print_success "@next/font eliminado"
else
  print_success "@next/font ya no existe"
fi

print_step "2/3 - Eliminando Tailwind v4 del raíz..."
if npm list tailwindcss > /dev/null 2>&1; then
  npm uninstall tailwindcss > /dev/null 2>&1
  print_success "Tailwind CSS eliminado del raíz"
else
  print_success "Tailwind CSS ya no existe en raíz"
fi

print_step "3/3 - Actualizando @types/react en Admin Panel..."
cd "$PROJECT_ROOT/apps/admin-panel"
npm install --save-dev @types/react@^19.0.0 @types/react-dom@^19.0.0 > /dev/null 2>&1
print_success "@types/react actualizados a v19"

echo ""
print_success "Fase 1 completada"
echo ""

# ============================================
# Fase 2: Unificación de Versiones
# ============================================

echo -e "${BLUE}📌 Fase 2: Unificación de Versiones${NC}"
echo ""

print_step "1/5 - Actualizando TypeScript a 5.9.2..."
cd "$PROJECT_ROOT/apps/admin-panel"
npm install --save-dev typescript@^5.9.2 > /dev/null 2>&1
cd "$PROJECT_ROOT/apps/website"
npm install --save-dev typescript@^5.9.2 > /dev/null 2>&1
print_success "TypeScript unificado en 5.9.2"

print_step "2/5 - Actualizando @types/node en Website..."
cd "$PROJECT_ROOT/apps/website"
npm install --save-dev @types/node@^22.10.0 > /dev/null 2>&1
print_success "@types/node actualizado a 22.10.0"

print_step "3/5 - Unificando lucide-react a 0.544.0..."
cd "$PROJECT_ROOT/apps/website"
npm install lucide-react@^0.544.0 > /dev/null 2>&1
cd "$PROJECT_ROOT/apps/admin-panel"
npm install lucide-react@^0.544.0 > /dev/null 2>&1
print_success "lucide-react unificado en 0.544.0"

print_step "4/5 - Actualizando Stripe en Website..."
cd "$PROJECT_ROOT/apps/website"
npm install stripe@^18.5.0 > /dev/null 2>&1
print_success "Stripe actualizado a 18.5.0"

print_step "5/5 - Verificando eliminación de bcryptjs..."
cd "$PROJECT_ROOT/apps/backend"
if npm list bcryptjs > /dev/null 2>&1; then
  npm uninstall bcryptjs > /dev/null 2>&1
  print_success "bcryptjs eliminado"
else
  print_success "bcryptjs ya no existe"
fi

echo ""
print_success "Fase 2 completada"
echo ""

# ============================================
# Verificación de Builds
# ============================================

echo -e "${BLUE}📌 Verificación de Builds${NC}"
echo ""

print_step "Testing Backend build..."
cd "$PROJECT_ROOT/apps/backend"
if npm run build > /dev/null 2>&1; then
  print_success "Backend build exitoso"
else
  print_error "Backend build falló"
  exit 1
fi

print_step "Testing Website build..."
cd "$PROJECT_ROOT/apps/website"
if npm run build > /dev/null 2>&1; then
  print_success "Website build exitoso"
else
  print_error "Website build falló"
  exit 1
fi

print_step "Testing Admin Panel build..."
cd "$PROJECT_ROOT/apps/admin-panel"
if npm run build > /dev/null 2>&1; then
  print_success "Admin Panel build exitoso"
else
  print_error "Admin Panel build falló"
  exit 1
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✓ Corrección Completada Exitosamente  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Próximos pasos manuales:${NC}"
echo "1. Revisar package.json del Backend"
echo "   - Mover 'typeorm' de devDependencies a dependencies"
echo ""
echo "2. Considerar para futuras actualizaciones:"
echo "   - Migrar AWS SDK v2 → v3"
echo "   - Actualizar OpenTelemetry packages"
echo "   - Unificar ESLint a versión 9.35.0"
echo ""
echo -e "${BLUE}Documentación completa en:${NC}"
echo "  Reportes/2025-10/sesion_2025-10-13_09-30-00_desarrollo_mantenimiento_final/"
echo "    └─ 05_OPTIMIZACION_DEPENDENCIAS.md"
echo ""
