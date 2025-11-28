#!/bin/bash

# ============================================
# ChatBotDysa - Backup Diario Automático
# ============================================
# Crea backup de PostgreSQL y lo comprime
# Se ejecuta automáticamente vía cron
# Retención: 30 días
# ============================================

set -e

# Configuración desde variables de entorno o valores por defecto
BACKUP_DIR="${BACKUP_DIR:-/var/backups/chatbotdysa}"
RESTAURANT_NAME="${RESTAURANT_NAME:-restaurante}"
DB_NAME="${DATABASE_NAME:-chatbotdysa}"
DB_HOST="${DATABASE_HOST:-localhost}"
DB_PORT="${DATABASE_PORT:-15432}"
DB_USER="${DATABASE_USER:-postgres}"
DB_PASSWORD="${DATABASE_PASSWORD:-supersecret}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# Variables de backup
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${RESTAURANT_NAME}_${DATE}.sql.gz"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_FILE"
LOG_FILE="$BACKUP_DIR/backup.log"

# Función de logging
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Función de error
error() {
  log "❌ ERROR: $1"
  exit 1
}

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR" || error "No se pudo crear directorio de backups"

log "=========================================="
log "Iniciando Backup Diario"
log "=========================================="
log "Restaurante: $RESTAURANT_NAME"
log "Base de Datos: $DB_NAME"
log "Servidor: $DB_HOST:$DB_PORT"
log "Archivo: $BACKUP_FILE"
log ""

# Verificar que PostgreSQL esté accesible
log "🔍 Verificando conexión a PostgreSQL..."
if ! PGPASSWORD=$DB_PASSWORD pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER >/dev/null 2>&1; then
  error "PostgreSQL no está accesible en $DB_HOST:$DB_PORT"
fi
log "✅ Conexión verificada"
log ""

# Realizar backup
log "💾 Creando backup de base de datos..."
PGPASSWORD=$DB_PASSWORD pg_dump \
  -h $DB_HOST \
  -p $DB_PORT \
  -U $DB_USER \
  -d $DB_NAME \
  --format=plain \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  | gzip > "$BACKUP_PATH" || error "Backup falló"

# Verificar que el archivo se creó correctamente
if [ ! -f "$BACKUP_PATH" ]; then
  error "Archivo de backup no se creó: $BACKUP_PATH"
fi

# Verificar que el archivo tiene contenido
BACKUP_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
if [ "$BACKUP_SIZE" = "0B" ] || [ "$BACKUP_SIZE" = "0" ]; then
  error "Archivo de backup está vacío"
fi

log "✅ Backup creado exitosamente"
log "📊 Tamaño: $BACKUP_SIZE"
log ""

# Limpiar backups antiguos
log "🗑️  Eliminando backups anteriores a $RETENTION_DAYS días..."
DELETED_COUNT=$(find "$BACKUP_DIR" -name "${RESTAURANT_NAME}_*.sql.gz" -mtime +$RETENTION_DAYS -type f | wc -l | tr -d ' ')

if [ "$DELETED_COUNT" -gt 0 ]; then
  find "$BACKUP_DIR" -name "${RESTAURANT_NAME}_*.sql.gz" -mtime +$RETENTION_DAYS -type f -delete
  log "✅ Eliminados $DELETED_COUNT backups antiguos"
else
  log "ℹ️  No hay backups antiguos para eliminar"
fi
log ""

# Contar backups actuales
TOTAL_BACKUPS=$(find "$BACKUP_DIR" -name "${RESTAURANT_NAME}_*.sql.gz" -type f | wc -l | tr -d ' ')
log "📁 Total de backups: $TOTAL_BACKUPS"
log ""

# Listar últimos 5 backups
log "📋 Últimos 5 backups:"
find "$BACKUP_DIR" -name "${RESTAURANT_NAME}_*.sql.gz" -type f -printf "%T@ %p\n" | \
  sort -nr | \
  head -5 | \
  while read timestamp filepath; do
    size=$(du -h "$filepath" | cut -f1)
    date=$(date -d @${timestamp%.*} '+%Y-%m-%d %H:%M:%S' 2>/dev/null || date -r ${timestamp%.*} '+%Y-%m-%d %H:%M:%S')
    filename=$(basename "$filepath")
    log "  - $filename ($size) - $date"
  done
log ""

# Verificar integridad del backup (optional but recommended)
log "🔍 Verificando integridad del backup..."
if gunzip -t "$BACKUP_PATH" 2>/dev/null; then
  log "✅ Backup verificado correctamente"
else
  error "Backup corrupto - falla verificación de integridad"
fi
log ""

# Estadísticas
DISK_USAGE=$(du -sh "$BACKUP_DIR" | cut -f1)
log "📊 Estadísticas:"
log "  - Espacio usado: $DISK_USAGE"
log "  - Backups totales: $TOTAL_BACKUPS"
log "  - Retención: $RETENTION_DAYS días"
log ""

log "=========================================="
log "✅ Backup Completado Exitosamente"
log "=========================================="
log "Archivo: $BACKUP_PATH"
log "Tamaño: $BACKUP_SIZE"
log ""

# Opcional: Copiar a ubicación remota (S3, Google Cloud, etc.)
if [ -n "$REMOTE_BACKUP_COMMAND" ]; then
  log "☁️  Copiando a ubicación remota..."
  if eval "$REMOTE_BACKUP_COMMAND $BACKUP_PATH"; then
    log "✅ Backup remoto completado"
  else
    log "⚠️  Backup remoto falló (backup local exitoso)"
  fi
  log ""
fi

# Retornar éxito
exit 0
