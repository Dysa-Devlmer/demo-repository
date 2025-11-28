#!/bin/bash

# ==========================================
# ChatBot Dysa Widget - Script de Instalación
# ==========================================

set -e  # Salir si hay errores

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Banner
echo -e "${PURPLE}"
echo "╔════════════════════════════════════════╗"
echo "║   ChatBot Dysa Widget Installer       ║"
echo "║   Versión 1.0.0                        ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"

# Función para imprimir con color
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "Este script debe ejecutarse desde el directorio web-widget"
    exit 1
fi

print_info "Iniciando instalación del ChatBot Dysa Widget..."
echo ""

# Paso 1: Verificar Node.js
print_info "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado"
    echo "Por favor instala Node.js desde https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v)
print_success "Node.js encontrado: $NODE_VERSION"
echo ""

# Paso 2: Verificar npm
print_info "Verificando npm..."
if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado"
    exit 1
fi

NPM_VERSION=$(npm -v)
print_success "npm encontrado: $NPM_VERSION"
echo ""

# Paso 3: Instalar dependencias
print_info "Instalando dependencias..."
npm install

if [ $? -eq 0 ]; then
    print_success "Dependencias instaladas correctamente"
else
    print_error "Error al instalar dependencias"
    exit 1
fi
echo ""

# Paso 4: Compilar el widget
print_info "Compilando widget para producción..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Widget compilado exitosamente"
else
    print_error "Error al compilar el widget"
    exit 1
fi
echo ""

# Paso 5: Verificar archivos generados
print_info "Verificando archivos generados..."

if [ -f "dist/dysabot-widget.min.js" ]; then
    FILE_SIZE=$(du -h dist/dysabot-widget.min.js | cut -f1)
    print_success "dysabot-widget.min.js ($FILE_SIZE)"
else
    print_error "dysabot-widget.min.js no fue generado"
    exit 1
fi

if [ -f "dist/dysabot-widget.min.css" ]; then
    FILE_SIZE=$(du -h dist/dysabot-widget.min.css | cut -f1)
    print_success "dysabot-widget.min.css ($FILE_SIZE)"
else
    print_error "dysabot-widget.min.css no fue generado"
    exit 1
fi
echo ""

# Paso 6: Mostrar instrucciones de uso
echo -e "${GREEN}"
echo "╔════════════════════════════════════════╗"
echo "║   ✅ INSTALACIÓN COMPLETADA            ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

print_info "Archivos del widget listos en: ./dist/"
echo ""

print_info "Para usar el widget en tu sitio web:"
echo ""
echo "1️⃣  Copia los archivos a tu servidor:"
echo "   - dist/dysabot-widget.min.js"
echo "   - dist/dysabot-widget.min.css"
echo ""

echo "2️⃣  Agrega este código a tu HTML antes de </body>:"
echo ""
echo -e "${YELLOW}"
cat << 'EOF'
<!-- ChatBot Dysa Widget -->
<link rel="stylesheet" href="/ruta/dysabot-widget.min.css">
<script src="/ruta/dysabot-widget.min.js"></script>
<script>
  const widget = new DysaBotWidget({
    apiUrl: 'http://localhost:8005',
    restaurantId: 'tu-restaurante-id',
    position: 'bottom-right',
    theme: 'purple',
    language: 'es'
  });
</script>
EOF
echo -e "${NC}"
echo ""

echo "3️⃣  Ver ejemplo completo: demo/example.html"
echo ""

echo "4️⃣  Leer documentación completa: INSTALLATION.md"
echo ""

print_info "Para probar el widget localmente:"
echo "   npm run dev"
echo "   Abre: http://localhost:7002"
echo ""

print_success "¡Todo listo! 🎉"
echo ""

# Preguntar si desea abrir el ejemplo
read -p "¿Deseas abrir el ejemplo en el navegador? (s/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[SsYy]$ ]]; then
    if command -v open &> /dev/null; then
        open demo/example.html
    elif command -v xdg-open &> /dev/null; then
        xdg-open demo/example.html
    else
        print_warning "No se pudo abrir el navegador automáticamente"
        print_info "Abre manualmente: demo/example.html"
    fi
fi

exit 0
