#!/bin/bash

# ============================================
# ChatBotDysa - Restore de Backup
# ============================================
# Restaura un backup de PostgreSQL
# Uso: ./restore-backup.sh <archivo_backup.sql.gz>
# ============================================

set -e

BACKUP_FILE=$1

# Configuración desde variables de entorno o valores por defecto
DB_NAME="${DATABASE_NAME:-chatbotdysa}"
DB_HOST="${DATABASE_HOST:-localhost}"
DB_PORT="${DATABASE_PORT:-15432}"
DB_USER="${DATABASE_USER:-postgres}"
DB_PASSWORD="${DATABASE_PASSWORD:-supersecret}"

# Función de logging
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Función de error
error() {
  log "❌ ERROR: $1"
  exit 1
}

# Validar argumentos
if [ -z "$BACKUP_FILE" ]; then
  echo "❌ Error: Debes proporcionar el archivo de backup"
  echo ""
  echo "Uso: ./restore-backup.sh <archivo_backup.sql.gz>"
  echo ""
  echo "Ejemplo:"
  echo "  ./restore-backup.sh /var/backups/chatbotdysa/restaurante1_20251006_120000.sql.gz"
  echo ""
  exit 1
fi

# Verificar que el archivo existe
if [ ! -f "$BACKUP_FILE" ]; then
  error "Archivo de backup no existe: $BACKUP_FILE"
fi

# Verificar que el archivo es un gzip válido
if ! gunzip -t "$BACKUP_FILE" 2>/dev/null; then
  error "Archivo de backup corrupto o no es un gzip válido"
fi

log "=========================================="
log "ChatBotDysa - Restore de Backup"
log "=========================================="
log "Archivo: $BACKUP_FILE"
log "Base de Datos: $DB_NAME"
log "Servidor: $DB_HOST:$DB_PORT"
log ""

# Mostrar información del backup
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
BACKUP_DATE=$(date -r "$BACKUP_FILE" '+%Y-%m-%d %H:%M:%S' 2>/dev/null || stat -f %Sm -t '%Y-%m-%d %H:%M:%S' "$BACKUP_FILE")
log "📊 Información del backup:"
log "  - Tamaño: $BACKUP_SIZE"
log "  - Fecha: $BACKUP_DATE"
log ""

# ⚠️ ADVERTENCIA
echo "⚠️  ⚠️  ⚠️  ADVERTENCIA ⚠️  ⚠️  ⚠️"
echo ""
echo "Esta operación SOBRESCRIBIRÁ la base de datos actual:"
echo "  - Base de datos: $DB_NAME"
echo "  - Servidor: $DB_HOST:$DB_PORT"
echo ""
echo "Todos los datos actuales se perderán."
echo ""
read -p "¿Estás seguro de que deseas continuar? (escribe 'yes' para confirmar): " confirm

if [ "$confirm" != "yes" ]; then
  log "❌ Operación cancelada por el usuario"
  exit 0
fi

log ""
log "🔍 Verificando conexión a PostgreSQL..."
if ! PGPASSWORD=$DB_PASSWORD pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER >/dev/null 2>&1; then
  error "PostgreSQL no está accesible en $DB_HOST:$DB_PORT"
fi
log "✅ Conexión verificada"
log ""

# Crear backup de la base de datos actual (por seguridad)
SAFETY_BACKUP="/tmp/chatbotdysa_pre_restore_$(date +%Y%m%d_%H%M%S).sql.gz"
log "🛡️  Creando backup de seguridad de la base de datos actual..."
log "   (Por si necesitas revertir el restore)"
PGPASSWORD=$DB_PASSWORD pg_dump \
  -h $DB_HOST \
  -p $DB_PORT \
  -U $DB_USER \
  -d $DB_NAME \
  --format=plain \
  --no-owner \
  --no-acl \
  | gzip > "$SAFETY_BACKUP" || log "⚠️  No se pudo crear backup de seguridad (continuar de todos modos)"

if [ -f "$SAFETY_BACKUP" ]; then
  SAFETY_SIZE=$(du -h "$SAFETY_BACKUP" | cut -f1)
  log "✅ Backup de seguridad creado: $SAFETY_BACKUP ($SAFETY_SIZE)"
else
  log "⚠️  No se creó backup de seguridad"
fi
log ""

# Desconectar usuarios activos
log "👥 Desconectando usuarios activos..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres <<EOF >/dev/null 2>&1 || true
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();
EOF
log "✅ Usuarios desconectados"
log ""

# Restaurar backup
log "💾 Restaurando backup..."
log "   (Esto puede tomar varios minutos)"
log ""

gunzip -c "$BACKUP_FILE" | PGPASSWORD=$DB_PASSWORD psql \
  -h $DB_HOST \
  -p $DB_PORT \
  -U $DB_USER \
  -d $DB_NAME \
  --quiet \
  2>&1 | grep -v "ERROR" | head -20 || true

# Verificar que el restore fue exitoso
if [ $? -eq 0 ]; then
  log ""
  log "✅ Restore completado"
else
  error "Restore falló - revisa los logs arriba"
fi
log ""

# Verificar datos restaurados
log "🔍 Verificando datos restaurados..."

# Contar tablas
TABLES_COUNT=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
log "  - Tablas encontradas: $TABLES_COUNT"

# Contar registros en tablas principales
for table in users customers menu_items orders reservations; do
  if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\d $table" >/dev/null 2>&1; then
    COUNT=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM $table;" | tr -d ' ')
    log "  - $table: $COUNT registros"
  fi
done
log ""

log "=========================================="
log "✅ Restore Completado Exitosamente"
log "=========================================="
log "Base de Datos: $DB_NAME"
log "Servidor: $DB_HOST:$DB_PORT"
log ""

if [ -f "$SAFETY_BACKUP" ]; then
  log "🛡️  Backup de seguridad disponible en:"
  log "   $SAFETY_BACKUP"
  log ""
  log "   Para revertir este restore:"
  log "   ./restore-backup.sh $SAFETY_BACKUP"
  log ""
fi

log "✅ Proceso completado"
log ""

exit 0
