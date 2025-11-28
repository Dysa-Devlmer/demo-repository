#!/bin/bash

# ============================================
# ChatBotDysa - Test de Backups
# ============================================
# Prueba que los backups funcionan correctamente
# Crea un backup, lo restaura en una DB temporal y verifica
# Se recomienda ejecutar mensualmente
# ============================================

set -e

# Configuración
DB_HOST="${DATABASE_HOST:-localhost}"
DB_PORT="${DATABASE_PORT:-15432}"
DB_USER="${DATABASE_USER:-postgres}"
DB_PASSWORD="${DATABASE_PASSWORD:-supersecret}"
DB_NAME="${DATABASE_NAME:-chatbotdysa}"
RESTAURANT_NAME="${RESTAURANT_NAME:-restaurante}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/chatbotdysa}"
TEST_DB="chatbotdysa_backup_test_$(date +%s)"

# Función de logging
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Función de error
error() {
  log "❌ ERROR: $1"
  cleanup
  exit 1
}

# Función de cleanup
cleanup() {
  log ""
  log "🧹 Limpiando recursos de prueba..."

  # Eliminar base de datos de prueba
  if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $TEST_DB; then
    PGPASSWORD=$DB_PASSWORD dropdb -h $DB_HOST -p $DB_PORT -U $DB_USER $TEST_DB 2>/dev/null || true
    log "✅ Base de datos de prueba eliminada"
  fi

  # Eliminar archivo de backup temporal
  if [ -n "$TEMP_BACKUP" ] && [ -f "$TEMP_BACKUP" ]; then
    rm -f "$TEMP_BACKUP"
    log "✅ Archivo de backup temporal eliminado"
  fi
}

# Trap para cleanup en caso de error
trap cleanup EXIT

log "=========================================="
log "ChatBotDysa - Test de Backups"
log "=========================================="
log "Fecha: $(date '+%Y-%m-%d %H:%M:%S')"
log "Restaurante: $RESTAURANT_NAME"
log "Base de Datos: $DB_NAME"
log "Servidor: $DB_HOST:$DB_PORT"
log ""

# Paso 1: Crear backup de prueba
log "📝 Paso 1/5: Creando backup de prueba..."
TEMP_BACKUP="/tmp/chatbotdysa_test_backup_$(date +%s).sql.gz"

PGPASSWORD=$DB_PASSWORD pg_dump \
  -h $DB_HOST \
  -p $DB_PORT \
  -U $DB_USER \
  -d $DB_NAME \
  --format=plain \
  --no-owner \
  --no-acl \
  | gzip > "$TEMP_BACKUP" || error "Backup falló"

BACKUP_SIZE=$(du -h "$TEMP_BACKUP" | cut -f1)
log "✅ Backup creado: $BACKUP_SIZE"
log ""

# Paso 2: Verificar integridad del archivo
log "📝 Paso 2/5: Verificando integridad del archivo..."
if gunzip -t "$TEMP_BACKUP" 2>/dev/null; then
  log "✅ Archivo de backup válido"
else
  error "Archivo de backup corrupto"
fi
log ""

# Paso 3: Crear base de datos temporal
log "📝 Paso 3/5: Creando base de datos temporal..."
PGPASSWORD=$DB_PASSWORD createdb \
  -h $DB_HOST \
  -p $DB_PORT \
  -U $DB_USER \
  $TEST_DB || error "No se pudo crear base de datos de prueba"

log "✅ Base de datos temporal creada: $TEST_DB"
log ""

# Paso 4: Restaurar backup en DB temporal
log "📝 Paso 4/5: Restaurando backup en DB temporal..."
gunzip -c "$TEMP_BACKUP" | PGPASSWORD=$DB_PASSWORD psql \
  -h $DB_HOST \
  -p $DB_PORT \
  -U $DB_USER \
  -d $TEST_DB \
  --quiet \
  2>&1 | grep -v "ERROR" || true

log "✅ Backup restaurado en DB temporal"
log ""

# Paso 5: Verificar datos restaurados
log "📝 Paso 5/5: Verificando datos restaurados..."
log ""

# Verificar que las tablas principales existen
EXPECTED_TABLES=("users" "customers" "menu_items" "orders" "reservations" "roles" "permissions")
MISSING_TABLES=()

for table in "${EXPECTED_TABLES[@]}"; do
  if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $TEST_DB -c "\d $table" >/dev/null 2>&1; then
    COUNT=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $TEST_DB -t -c "SELECT COUNT(*) FROM $table;" | tr -d ' ')
    log "  ✅ $table: $COUNT registros"
  else
    MISSING_TABLES+=("$table")
    log "  ❌ $table: NO EXISTE"
  fi
done

log ""

# Comparar conteos con base de datos original
log "🔍 Comparando con base de datos original..."
DIFFERENCES=()

for table in "${EXPECTED_TABLES[@]}"; do
  if [[ ! " ${MISSING_TABLES[@]} " =~ " ${table} " ]]; then
    ORIGINAL_COUNT=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM $table;" 2>/dev/null | tr -d ' ' || echo "0")
    RESTORED_COUNT=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $TEST_DB -t -c "SELECT COUNT(*) FROM $table;" 2>/dev/null | tr -d ' ' || echo "0")

    if [ "$ORIGINAL_COUNT" = "$RESTORED_COUNT" ]; then
      log "  ✅ $table: $ORIGINAL_COUNT registros (coincide)"
    else
      log "  ⚠️  $table: Original=$ORIGINAL_COUNT, Restaurado=$RESTORED_COUNT (diferencia: $((ORIGINAL_COUNT - RESTORED_COUNT)))"
      DIFFERENCES+=("$table")
    fi
  fi
done

log ""
log "=========================================="

# Resultado final
if [ ${#MISSING_TABLES[@]} -eq 0 ] && [ ${#DIFFERENCES[@]} -eq 0 ]; then
  log "✅ TEST EXITOSO"
  log "=========================================="
  log ""
  log "📊 Resumen:"
  log "  - Backup creado: ✅"
  log "  - Integridad verificada: ✅"
  log "  - Restauración exitosa: ✅"
  log "  - Datos coinciden: ✅"
  log "  - Tamaño backup: $BACKUP_SIZE"
  log ""
  log "🎯 Conclusión: Los backups están funcionando correctamente"
  log ""
  EXIT_CODE=0
else
  log "⚠️  TEST CON ADVERTENCIAS"
  log "=========================================="
  log ""

  if [ ${#MISSING_TABLES[@]} -gt 0 ]; then
    log "❌ Tablas faltantes:"
    for table in "${MISSING_TABLES[@]}"; do
      log "   - $table"
    done
    log ""
  fi

  if [ ${#DIFFERENCES[@]} -gt 0 ]; then
    log "⚠️  Tablas con diferencias en conteo:"
    for table in "${DIFFERENCES[@]}"; do
      log "   - $table"
    done
    log ""
  fi

  log "⚠️  Conclusión: Revisar los backups antes de confiar en ellos"
  log ""
  EXIT_CODE=1
fi

# Recomendaciones
log "📝 Recomendaciones:"
log "  - Ejecutar este test mensualmente"
log "  - Revisar logs de backup diario"
log "  - Mantener al menos 30 días de backups"
log "  - Configurar backup remoto (S3/Cloud)"
log ""

exit $EXIT_CODE
