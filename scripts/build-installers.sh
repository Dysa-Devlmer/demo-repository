#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# ChatBotDysa Enterprise+++++ - Script de Creación de Instaladores
# ═══════════════════════════════════════════════════════════════

set -e

echo "═══════════════════════════════════════════════════════════════"
echo "   ChatBotDysa - Creador de Instaladores Autocontenidos"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Variables
BASE_DIR="/Users/devlmer/ChatBotDysa"
DOWNLOADS_DIR="$HOME/Downloads"
INSTALLERS_DIR="$DOWNLOADS_DIR/ChatBotDysa_Installers"
TEMP_DIR="$INSTALLERS_DIR/temp"
VERSION="1.0.0"

# URLs de descarga
NODE_VERSION="20.11.0"
POSTGRES_VERSION="16.1-1"
GIT_VERSION="2.43.0"

NODE_WIN_URL="https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-x64.msi"
NODE_MAC_URL="https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}.pkg"
POSTGRES_WIN_URL="https://get.enterprisedb.com/postgresql/postgresql-${POSTGRES_VERSION}-windows-x64.exe"
POSTGRES_MAC_URL="https://github.com/PostgresApp/PostgresApp/releases/download/v2.6.7/Postgres-2.6.7-16.dmg"
GIT_WIN_URL="https://github.com/git-for-windows/git/releases/download/v${GIT_VERSION}.windows.1/Git-${GIT_VERSION}-64-bit.exe"
GIT_MAC_URL="https://sourceforge.net/projects/git-osx-installer/files/git-${GIT_VERSION}-intel-universal-mavericks.pkg/download"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_step() {
    echo -e "${BLUE}[PASO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Función para verificar espacio en disco
check_disk_space() {
    print_step "Verificando espacio en disco..."
    FREE_SPACE=$(df -h "$DOWNLOADS_DIR" | awk 'NR==2 {print $4}' | sed 's/Gi//')
    if [ "$FREE_SPACE" -lt 10 ]; then
        print_error "Espacio insuficiente. Se requieren al menos 10 GB libres."
        exit 1
    fi
    print_success "Espacio disponible: ${FREE_SPACE}G"
}

# Función para limpiar instaladores anteriores
clean_previous() {
    print_step "Limpiando instaladores anteriores..."
    rm -rf "$INSTALLERS_DIR"
    print_success "Limpieza completada"
}

# Función para crear estructura de carpetas
create_structure() {
    print_step "Creando estructura de carpetas..."
    mkdir -p "$INSTALLERS_DIR"/{Windows,macOS,temp}
    mkdir -p "$TEMP_DIR/downloads"
    print_success "Estructura creada"
}

# Función para descargar dependencias
download_dependencies() {
    print_step "Descargando dependencias..."

    cd "$TEMP_DIR/downloads"

    # Node.js
    if [ ! -f "node-win.msi" ]; then
        print_step "Descargando Node.js para Windows..."
        curl -# -L -o node-win.msi "$NODE_WIN_URL" || {
            print_error "Error descargando Node.js Windows"
            return 1
        }
    fi

    if [ ! -f "node-mac.pkg" ]; then
        print_step "Descargando Node.js para macOS..."
        curl -# -L -o node-mac.pkg "$NODE_MAC_URL" || {
            print_error "Error descargando Node.js macOS"
            return 1
        }
    fi

    # PostgreSQL
    if [ ! -f "postgres-win.exe" ]; then
        print_step "Descargando PostgreSQL para Windows..."
        curl -# -L -o postgres-win.exe "$POSTGRES_WIN_URL" || {
            print_warning "No se pudo descargar PostgreSQL Windows (puede requerir autenticación)"
        }
    fi

    if [ ! -f "postgres-mac.dmg" ]; then
        print_step "Descargando PostgreSQL para macOS..."
        curl -# -L -o postgres-mac.dmg "$POSTGRES_MAC_URL" || {
            print_error "Error descargando PostgreSQL macOS"
            return 1
        }
    fi

    # Git
    if [ ! -f "git-win.exe" ]; then
        print_step "Descargando Git para Windows..."
        curl -# -L -o git-win.exe "$GIT_WIN_URL" || {
            print_error "Error descargando Git Windows"
            return 1
        }
    fi

    if [ ! -f "git-mac.pkg" ]; then
        print_step "Descargando Git para macOS..."
        curl -# -L -o git-mac.pkg "$GIT_MAC_URL" || {
            print_warning "Git viene preinstalado en macOS"
        }
    fi

    print_success "Dependencias descargadas"
}

# Función para copiar y limpiar código fuente
prepare_code() {
    print_step "Preparando código fuente..."

    # Copiar código
    cp -R "$BASE_DIR" "$TEMP_DIR/ChatBotDysa"

    cd "$TEMP_DIR/ChatBotDysa"

    # Limpiar archivos innecesarios
    print_step "Limpiando archivos innecesarios..."
    find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
    find . -name ".next" -type d -exec rm -rf {} + 2>/dev/null || true
    find . -name ".git" -type d -exec rm -rf {} + 2>/dev/null || true
    find . -name "dist" -type d -exec rm -rf {} + 2>/dev/null || true
    find . -name ".turbo" -type d -exec rm -rf {} + 2>/dev/null || true
    find . -name ".DS_Store" -type f -delete 2>/dev/null || true
    find . -name "*.log" -type f -delete 2>/dev/null || true

    print_success "Código preparado"
}

# Función para crear instalador de Windows
build_windows_installer() {
    print_step "Creando instalador para Windows..."

    WIN_DIR="$INSTALLERS_DIR/Windows/ChatBotDysa_Windows_Installer"
    mkdir -p "$WIN_DIR"/{1_INSTALADORES_BASE,2_CODIGO_FUENTE,3_CONFIGURACION,4_DOCUMENTACION}

    # Copiar instaladores base
    cp "$TEMP_DIR/downloads/node-win.msi" "$WIN_DIR/1_INSTALADORES_BASE/" 2>/dev/null || print_warning "Node.js Windows no disponible"
    cp "$TEMP_DIR/downloads/postgres-win.exe" "$WIN_DIR/1_INSTALADORES_BASE/" 2>/dev/null || print_warning "PostgreSQL Windows no disponible"
    cp "$TEMP_DIR/downloads/git-win.exe" "$WIN_DIR/1_INSTALADORES_BASE/" 2>/dev/null || print_warning "Git Windows no disponible"

    # Copiar código fuente
    cp -R "$TEMP_DIR/ChatBotDysa" "$WIN_DIR/2_CODIGO_FUENTE/"

    # Copiar scripts de configuración
    cp "$BASE_DIR/INSTALADORES_CLIENTES/USB_INSTALLER/scripts"/*.bat "$WIN_DIR/3_CONFIGURACION/" 2>/dev/null || true

    # Copiar documentación
    cp -R "$BASE_DIR/docs" "$WIN_DIR/4_DOCUMENTACION/"

    # Crear README
    cat > "$WIN_DIR/LEEME_PRIMERO.txt" << 'EOF'
═══════════════════════════════════════════════════════════════
   INSTALADOR CHATBOTDYSA ENTERPRISE+++++ PARA WINDOWS 10/11
═══════════════════════════════════════════════════════════════

CONTENIDO:
  - Node.js 20 LTS
  - PostgreSQL 16
  - Git para Windows
  - Código completo de ChatBotDysa
  - Scripts de configuración automática

INSTRUCCIONES:

1. Extraer este ZIP al Escritorio
2. Abrir la carpeta extraída
3. Click derecho en "3_CONFIGURACION/install-windows.bat"
4. Seleccionar "Ejecutar como administrador"
5. Esperar 30 minutos mientras se instala todo
6. Ejecutar "create-client.bat" para crear la cuenta del cliente
7. Hacer doble click en "Iniciar ChatBotDysa" del escritorio

REQUISITOS:
  - Windows 10 o Windows 11 Pro
  - 8 GB RAM (16 GB recomendado)
  - 50 GB espacio libre
  - Permisos de administrador

SOPORTE: soporte@chatbotdysa.cl
═══════════════════════════════════════════════════════════════
EOF

    # Comprimir
    cd "$INSTALLERS_DIR/Windows"
    print_step "Comprimiendo instalador de Windows..."
    zip -r -q "ChatBotDysa_Windows_v${VERSION}.zip" ChatBotDysa_Windows_Installer/

    SIZE=$(du -h "ChatBotDysa_Windows_v${VERSION}.zip" | cut -f1)
    print_success "Instalador Windows creado: ChatBotDysa_Windows_v${VERSION}.zip ($SIZE)"
}

# Función para crear instalador de macOS
build_macos_installer() {
    print_step "Creando instalador para macOS..."

    MAC_DIR="$INSTALLERS_DIR/macOS/ChatBotDysa_macOS_Installer"
    mkdir -p "$MAC_DIR"/{instaladores,codigo,scripts,documentacion}

    # Copiar instaladores base
    cp "$TEMP_DIR/downloads/node-mac.pkg" "$MAC_DIR/instaladores/" 2>/dev/null || print_warning "Node.js macOS no disponible"
    cp "$TEMP_DIR/downloads/postgres-mac.dmg" "$MAC_DIR/instaladores/" 2>/dev/null || print_warning "PostgreSQL macOS no disponible"
    cp "$TEMP_DIR/downloads/git-mac.pkg" "$MAC_DIR/instaladores/" 2>/dev/null || print_warning "Git macOS no disponible"

    # Copiar código fuente
    cp -R "$TEMP_DIR/ChatBotDysa" "$MAC_DIR/codigo/"

    # Crear script de instalación
    cat > "$MAC_DIR/scripts/install-macos.sh" << 'EOFMAC'
#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# ChatBotDysa Enterprise+++++ - Instalador para macOS
# ═══════════════════════════════════════════════════════════════

echo "═══════════════════════════════════════════════════════════════"
echo "   ChatBotDysa Enterprise+++++ - Instalador para macOS"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Verificar que se ejecuta como administrador
if [ "$EUID" -ne 0 ]; then
    echo "Por favor ejecuta con sudo:"
    echo "sudo ./install-macos.sh"
    exit 1
fi

# Paso 1: Instalar Node.js
echo "[1/5] Instalando Node.js 20 LTS..."
installer -pkg ../instaladores/node-mac.pkg -target /

# Paso 2: Instalar PostgreSQL
echo "[2/5] Instalando PostgreSQL 16..."
hdiutil attach ../instaladores/postgres-mac.dmg
cp -R /Volumes/Postgres/Postgres.app /Applications/
hdiutil detach /Volumes/Postgres
open /Applications/Postgres.app

# Paso 3: Instalar Git (si es necesario)
echo "[3/5] Verificando Git..."
if ! command -v git &> /dev/null; then
    installer -pkg ../instaladores/git-mac.pkg -target /
fi

# Paso 4: Copiar código a /Applications
echo "[4/5] Copiando código a /Applications/ChatBotDysa..."
mkdir -p /Applications/ChatBotDysa
cp -R ../codigo/ChatBotDysa/* /Applications/ChatBotDysa/

# Paso 5: Instalar dependencias
echo "[5/5] Instalando dependencias del proyecto..."
cd /Applications/ChatBotDysa/apps/backend && npm install --legacy-peer-deps
cd /Applications/ChatBotDysa/apps/admin-panel && npm install --legacy-peer-deps
cd /Applications/ChatBotDysa/apps/website && npm install --legacy-peer-deps
cd /Applications/ChatBotDysa/apps/web-widget && npm install --legacy-peer-deps

# Crear script de inicio
cat > /Applications/ChatBotDysa/start.sh << 'EOFSTART'
#!/bin/bash
cd /Applications/ChatBotDysa/apps/backend && npm run start:dev &
cd /Applications/ChatBotDysa/apps/admin-panel && npm run dev &
cd /Applications/ChatBotDysa/apps/website && npm run dev &
cd /Applications/ChatBotDysa/apps/web-widget && npm run dev &
sleep 5
open http://localhost:7001
EOFSTART

chmod +x /Applications/ChatBotDysa/start.sh

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✅ INSTALACIÓN COMPLETADA"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Para iniciar ChatBotDysa:"
echo "/Applications/ChatBotDysa/start.sh"
echo ""
EOFMAC

    chmod +x "$MAC_DIR/scripts/install-macos.sh"

    # Copiar documentación
    cp -R "$BASE_DIR/docs" "$MAC_DIR/documentacion/"

    # Crear README
    cat > "$MAC_DIR/LEEME_PRIMERO.txt" << 'EOF'
═══════════════════════════════════════════════════════════════
   INSTALADOR CHATBOTDYSA ENTERPRISE+++++ PARA macOS
═══════════════════════════════════════════════════════════════

CONTENIDO:
  - Node.js 20 LTS
  - PostgreSQL 16 (Postgres.app)
  - Git para macOS
  - Código completo de ChatBotDysa
  - Scripts de configuración automática

INSTRUCCIONES:

1. Extraer este archivo .tar.gz
2. Abrir Terminal
3. Navegar a la carpeta: cd ~/Downloads/ChatBotDysa_macOS_Installer
4. Ejecutar: sudo ./scripts/install-macos.sh
5. Ingresar contraseña de administrador
6. Esperar 30 minutos mientras se instala todo
7. Iniciar: /Applications/ChatBotDysa/start.sh

REQUISITOS:
  - macOS 12 Monterey o superior
  - 8 GB RAM (16 GB recomendado)
  - 50 GB espacio libre
  - Permisos de administrador

SOPORTE: soporte@chatbotdysa.cl
═══════════════════════════════════════════════════════════════
EOF

    # Comprimir
    cd "$INSTALLERS_DIR/macOS"
    print_step "Comprimiendo instalador de macOS..."
    tar -czf "ChatBotDysa_macOS_v${VERSION}.tar.gz" ChatBotDysa_macOS_Installer/

    SIZE=$(du -h "ChatBotDysa_macOS_v${VERSION}.tar.gz" | cut -f1)
    print_success "Instalador macOS creado: ChatBotDysa_macOS_v${VERSION}.tar.gz ($SIZE)"
}

# Función para limpiar archivos temporales
cleanup() {
    print_step "Limpiando archivos temporales..."
    rm -rf "$TEMP_DIR"
    print_success "Limpieza completada"
}

# Función para mostrar resumen
show_summary() {
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo -e "${GREEN}✅ INSTALADORES CREADOS EXITOSAMENTE${NC}"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    echo "📦 Ubicación de los instaladores:"
    echo ""

    if [ -f "$INSTALLERS_DIR/Windows/ChatBotDysa_Windows_v${VERSION}.zip" ]; then
        WIN_SIZE=$(du -h "$INSTALLERS_DIR/Windows/ChatBotDysa_Windows_v${VERSION}.zip" | cut -f1)
        echo "   Windows:"
        echo "   $INSTALLERS_DIR/Windows/ChatBotDysa_Windows_v${VERSION}.zip"
        echo "   Tamaño: $WIN_SIZE"
        echo ""
    fi

    if [ -f "$INSTALLERS_DIR/macOS/ChatBotDysa_macOS_v${VERSION}.tar.gz" ]; then
        MAC_SIZE=$(du -h "$INSTALLERS_DIR/macOS/ChatBotDysa_macOS_v${VERSION}.tar.gz" | cut -f1)
        echo "   macOS:"
        echo "   $INSTALLERS_DIR/macOS/ChatBotDysa_macOS_v${VERSION}.tar.gz"
        echo "   Tamaño: $MAC_SIZE"
        echo ""
    fi

    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    echo "📋 Próximos pasos:"
    echo ""
    echo "1. Copiar los instaladores a USB:"
    echo "   cp $INSTALLERS_DIR/Windows/*.zip /Volumes/USB/"
    echo "   cp $INSTALLERS_DIR/macOS/*.tar.gz /Volumes/USB/"
    echo ""
    echo "2. Llevar USB al restaurante"
    echo ""
    echo "3. Seguir instrucciones en LEEME_PRIMERO.txt"
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
}

# Función principal
main() {
    check_disk_space
    clean_previous
    create_structure
    download_dependencies
    prepare_code
    build_windows_installer
    build_macos_installer
    cleanup
    show_summary
}

# Ejecutar script principal
main
