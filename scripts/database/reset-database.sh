#!/bin/bash

# Script para resetear la base de datos a estado limpio
# Para usar cuando se prepare el sistema para un nuevo restaurante

echo "🗑️  Limpiando base de datos ChatBotDysa..."
echo ""

# Configuración de conexión
PGPASSWORD=supersecret psql -h 127.0.0.1 -p 15432 -U postgres -d chatbotdysa << SQL

-- ==================================================
-- SCRIPT DE RESET COMPLETO DEL SISTEMA
-- ==================================================

BEGIN;

-- 1. Eliminar todas las órdenes y items relacionados
TRUNCATE TABLE orders RESTART IDENTITY CASCADE;
\echo '✅ Órdenes eliminadas'

-- 2. Eliminar todas las reservas
TRUNCATE TABLE reservations RESTART IDENTITY CASCADE;
\echo '✅ Reservas eliminadas'

-- 3. Eliminar todas las conversaciones
TRUNCATE TABLE conversations RESTART IDENTITY CASCADE;
\echo '✅ Conversaciones eliminadas'

-- 4. Eliminar todos los clientes (excepto el primero si quieres mantenerlo)
DELETE FROM customers WHERE id > 1;
ALTER SEQUENCE customers_id_seq RESTART WITH 2;
\echo '✅ Clientes de prueba eliminados'

-- 5. Opcional: Mantener el menú o eliminarlo también
-- TRUNCATE TABLE menu_items RESTART IDENTITY CASCADE;
-- \echo '✅ Menú eliminado'

-- Mostrar resumen
\echo ''
\echo '📊 Resumen de tablas:'
SELECT 'Órdenes' as tabla, COUNT(*) as registros FROM orders
UNION ALL
SELECT 'Clientes', COUNT(*) FROM customers
UNION ALL
SELECT 'Reservas', COUNT(*) FROM reservations
UNION ALL
SELECT 'Conversaciones', COUNT(*) FROM conversations
UNION ALL
SELECT 'Menú', COUNT(*) FROM menu_items;

COMMIT;

\echo ''
\echo '🎉 Base de datos lista para nuevo restaurante!'

SQL
