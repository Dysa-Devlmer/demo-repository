#!/bin/bash

# ============================================================================
# Script de Preparación para Nuevo Restaurante
# ============================================================================
#
# Este script limpia todos los datos de prueba y prepara el sistema
# para ser usado por un nuevo restaurante en producción.
#
# PRECAUCIÓN: Este script ELIMINARÁ PERMANENTEMENTE todos los datos.
# Solo usar cuando estés 100% seguro.
#
# ============================================================================

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║        ChatBotDysa - Preparación para Producción          ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Confirmación de seguridad
echo -e "${RED}⚠️  ADVERTENCIA: Este script eliminará TODOS los datos de prueba${NC}"
echo ""
echo "Se eliminarán:"
echo "  • Todas las órdenes"
echo "  • Todas las reservas"
echo "  • Todas las conversaciones"
echo "  • TODOS los clientes (el restaurante crea los suyos)"
echo "  • TODO el menú"
echo "  • TODOS los usuarios (excepto admin)"
echo "  • Todos los mensajes"
echo ""
echo -e "${YELLOW}El sistema quedará completamente limpio y listo para un nuevo restaurante.${NC}"
echo ""
read -p "¿Estás seguro de continuar? (escribe 'SI' para confirmar): " confirmacion

if [ "$confirmacion" != "SI" ]; then
    echo -e "${YELLOW}❌ Operación cancelada${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}🔐 Ingresa la contraseña de la base de datos:${NC}"
read -s DB_PASSWORD
echo ""

# Ejecutar limpieza
echo -e "${BLUE}🗑️  Iniciando limpieza de base de datos...${NC}"
echo ""

PGPASSWORD=$DB_PASSWORD psql -h 127.0.0.1 -p 15432 -U postgres -d chatbotdysa << SQL

-- ==================================================
-- RESET COMPLETO PARA PRODUCCIÓN
-- ==================================================

BEGIN;

-- 1. Órdenes
TRUNCATE TABLE orders RESTART IDENTITY CASCADE;

-- 2. Reservas
TRUNCATE TABLE reservations RESTART IDENTITY CASCADE;

-- 3. Conversaciones
TRUNCATE TABLE conversations RESTART IDENTITY CASCADE;

-- 4. ELIMINAR TODOS LOS CLIENTES (el nuevo restaurante crea los suyos)
TRUNCATE TABLE customers RESTART IDENTITY CASCADE;

-- 5. Limpiar mensajes
TRUNCATE TABLE messages RESTART IDENTITY CASCADE;

-- 6. ELIMINAR TODO EL MENÚ (restaurante nuevo necesita crear su propio menú)
TRUNCATE TABLE menu_items RESTART IDENTITY CASCADE;

-- 7. ELIMINAR TODOS LOS USUARIOS (excepto admin ID = 1)
DELETE FROM users WHERE id > 1;
ALTER SEQUENCE users_id_seq RESTART WITH 2;

-- Resumen
SELECT
    'Órdenes' as tabla,
    COUNT(*) as registros,
    CASE WHEN COUNT(*) = 0 THEN '✅' ELSE '⚠️' END as status
FROM orders
UNION ALL
SELECT 'Clientes', COUNT(*), CASE WHEN COUNT(*) = 0 THEN '✅' ELSE '⚠️' END FROM customers
UNION ALL
SELECT 'Reservas', COUNT(*), CASE WHEN COUNT(*) = 0 THEN '✅' ELSE '⚠️' END FROM reservations
UNION ALL
SELECT 'Conversaciones', COUNT(*), CASE WHEN COUNT(*) = 0 THEN '✅' ELSE '⚠️' END FROM conversations
UNION ALL
SELECT 'Mensajes', COUNT(*), CASE WHEN COUNT(*) = 0 THEN '✅' ELSE '⚠️' END FROM messages
UNION ALL
SELECT 'Menú', COUNT(*), CASE WHEN COUNT(*) = 0 THEN '✅' ELSE '⚠️' END FROM menu_items
UNION ALL
SELECT 'Usuarios', COUNT(*), CASE WHEN COUNT(*) <= 1 THEN '✅' ELSE '⚠️' END FROM users;

COMMIT;

SQL

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                            ║${NC}"
    echo -e "${GREEN}║     ✅ Base de datos lista para producción ✅              ║${NC}"
    echo -e "${GREEN}║                                                            ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}📝 Próximos pasos para el nuevo restaurante:${NC}"
    echo "   1. Actualizar información del restaurante en Settings"
    echo "   2. Crear MENÚ completo del restaurante (actualmente vacío)"
    echo "   3. Crear usuarios del restaurante (meseros, cocineros, etc.)"
    echo "   4. Configurar WhatsApp Business API"
    echo "   5. Configurar horarios y zonas de entrega"
    echo "   6. Cargar clientes iniciales (si los hay)"
    echo ""
    echo -e "${BLUE}💡 El sistema está listo para comenzar desde cero${NC}"
    echo ""
else
    echo -e "${RED}❌ Error durante la limpieza${NC}"
    exit 1
fi
