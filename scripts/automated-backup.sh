#!/bin/bash

# ============================================
# ChatBotDysa - Automated Backup System
# ============================================
# Creates backups of database, redis, and uploads
# Usage: ./scripts/automated-backup.sh [full|db|redis|uploads]
# ============================================

set -e

BACKUP_TYPE=${1:-full}
BACKUP_DIR="/opt/chatbotdysa/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30
REMOTE_BACKUP_ENABLED=${REMOTE_BACKUP_ENABLED:-false}

# Database connection
DB_HOST=${DATABASE_HOST:-localhost}
DB_PORT=${DATABASE_PORT:-15432}
DB_USER=${DATABASE_USER:-postgres}
DB_NAME=${DATABASE_NAME:-chatbotdysa}

# Redis connection
REDIS_HOST=${REDIS_HOST:-localhost}
REDIS_PORT=${REDIS_PORT:-16379}

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"; }
error() { echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"; exit 1; }
warning() { echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"; }

# Create backup directories
mkdir -p "$BACKUP_DIR"/{database,redis,uploads,logs}

# Logging
LOG_FILE="$BACKUP_DIR/logs/backup_$DATE.log"
exec > >(tee -a "$LOG_FILE") 2>&1

log "=========================================="
log "ChatBotDysa Automated Backup"
log "Type: $BACKUP_TYPE"
log "Date: $(date)"
log "=========================================="

# Function: Backup PostgreSQL
backup_database() {
    log "Starting PostgreSQL backup..."

    DUMP_FILE="$BACKUP_DIR/database/db_${DB_NAME}_$DATE.dump"

    # Using Docker if available
    if docker ps --format '{{.Names}}' | grep -q "chatbotdysa-postgres"; then
        log "Backing up via Docker container..."
        docker exec chatbotdysa-postgres-prod pg_dump \
            -U "$DB_USER" \
            -Fc \
            -f "/backups/db_${DB_NAME}_$DATE.dump" \
            "$DB_NAME"

        # Move to backup location
        mv "$BACKUP_DIR/database/../postgres/db_${DB_NAME}_$DATE.dump" "$DUMP_FILE" 2>/dev/null || true
    else
        log "Backing up via pg_dump..."
        PGPASSWORD="${DATABASE_PASSWORD}" pg_dump \
            -h "$DB_HOST" \
            -p "$DB_PORT" \
            -U "$DB_USER" \
            -Fc \
            -f "$DUMP_FILE" \
            "$DB_NAME"
    fi

    # Compress if not already compressed
    if [ -f "$DUMP_FILE" ]; then
        DUMP_SIZE=$(du -h "$DUMP_FILE" | cut -f1)
        log "Database backup created: $DUMP_FILE ($DUMP_SIZE)"
    else
        warning "Database backup file not found at expected location"
    fi
}

# Function: Backup Redis
backup_redis() {
    log "Starting Redis backup..."

    RDB_FILE="$BACKUP_DIR/redis/redis_$DATE.rdb"

    # Trigger BGSAVE and wait
    if docker ps --format '{{.Names}}' | grep -q "chatbotdysa-redis"; then
        docker exec chatbotdysa-redis-prod redis-cli BGSAVE
        sleep 5
        docker cp chatbotdysa-redis-prod:/data/dump.rdb "$RDB_FILE"
    else
        redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" BGSAVE
        sleep 5
        cp /var/lib/redis/dump.rdb "$RDB_FILE" 2>/dev/null || \
        cp /data/dump.rdb "$RDB_FILE" 2>/dev/null || \
        warning "Could not locate Redis dump file"
    fi

    if [ -f "$RDB_FILE" ]; then
        gzip "$RDB_FILE"
        log "Redis backup created: ${RDB_FILE}.gz"
    fi
}

# Function: Backup uploads
backup_uploads() {
    log "Starting uploads backup..."

    UPLOADS_DIR="/opt/chatbotdysa/apps/backend/uploads"
    UPLOADS_BACKUP="$BACKUP_DIR/uploads/uploads_$DATE.tar.gz"

    if [ -d "$UPLOADS_DIR" ]; then
        tar -czf "$UPLOADS_BACKUP" -C "$(dirname $UPLOADS_DIR)" uploads
        UPLOAD_SIZE=$(du -h "$UPLOADS_BACKUP" | cut -f1)
        log "Uploads backup created: $UPLOADS_BACKUP ($UPLOAD_SIZE)"
    else
        warning "Uploads directory not found: $UPLOADS_DIR"
    fi
}

# Function: Cleanup old backups
cleanup_old_backups() {
    log "Cleaning up backups older than $RETENTION_DAYS days..."

    find "$BACKUP_DIR/database" -name "*.dump*" -mtime +$RETENTION_DAYS -delete 2>/dev/null
    find "$BACKUP_DIR/redis" -name "*.rdb*" -mtime +$RETENTION_DAYS -delete 2>/dev/null
    find "$BACKUP_DIR/uploads" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null
    find "$BACKUP_DIR/logs" -name "*.log" -mtime +$RETENTION_DAYS -delete 2>/dev/null

    log "Cleanup completed"
}

# Function: Upload to remote storage (S3/GCS/etc)
upload_to_remote() {
    if [ "$REMOTE_BACKUP_ENABLED" = "true" ]; then
        log "Uploading to remote storage..."

        # AWS S3 (if configured)
        if [ -n "$AWS_S3_BUCKET" ]; then
            aws s3 sync "$BACKUP_DIR" "s3://$AWS_S3_BUCKET/backups/$DATE/" --exclude "logs/*"
            log "Uploaded to S3: s3://$AWS_S3_BUCKET/backups/$DATE/"
        fi

        # Google Cloud Storage (if configured)
        if [ -n "$GCS_BUCKET" ]; then
            gsutil -m rsync -r "$BACKUP_DIR" "gs://$GCS_BUCKET/backups/$DATE/"
            log "Uploaded to GCS: gs://$GCS_BUCKET/backups/$DATE/"
        fi
    fi
}

# Function: Send notification
send_notification() {
    STATUS=$1
    MESSAGE=$2

    # Slack notification (if configured)
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -s -X POST "$SLACK_WEBHOOK_URL" \
            -H 'Content-Type: application/json' \
            -d "{\"text\": \"Backup $STATUS: $MESSAGE\"}"
    fi

    # Email notification via SendGrid (if configured)
    if [ -n "$SENDGRID_API_KEY" ] && [ -n "$ADMIN_EMAIL" ]; then
        curl -s --request POST \
            --url https://api.sendgrid.com/v3/mail/send \
            --header "Authorization: Bearer $SENDGRID_API_KEY" \
            --header "Content-Type: application/json" \
            --data "{
                \"personalizations\": [{\"to\": [{\"email\": \"$ADMIN_EMAIL\"}]}],
                \"from\": {\"email\": \"backups@chatbotdysa.com\"},
                \"subject\": \"ChatBotDysa Backup $STATUS\",
                \"content\": [{\"type\": \"text/plain\", \"value\": \"$MESSAGE\"}]
            }"
    fi
}

# Function: Generate backup report
generate_report() {
    REPORT="$BACKUP_DIR/logs/report_$DATE.txt"

    cat > "$REPORT" <<EOF
ChatBotDysa Backup Report
========================
Date: $(date)
Type: $BACKUP_TYPE

Backups Created:
EOF

    if [ "$BACKUP_TYPE" = "full" ] || [ "$BACKUP_TYPE" = "db" ]; then
        echo "- Database: $(ls -lh $BACKUP_DIR/database/*$DATE* 2>/dev/null | awk '{print $NF, $5}')" >> "$REPORT"
    fi

    if [ "$BACKUP_TYPE" = "full" ] || [ "$BACKUP_TYPE" = "redis" ]; then
        echo "- Redis: $(ls -lh $BACKUP_DIR/redis/*$DATE* 2>/dev/null | awk '{print $NF, $5}')" >> "$REPORT"
    fi

    if [ "$BACKUP_TYPE" = "full" ] || [ "$BACKUP_TYPE" = "uploads" ]; then
        echo "- Uploads: $(ls -lh $BACKUP_DIR/uploads/*$DATE* 2>/dev/null | awk '{print $NF, $5}')" >> "$REPORT"
    fi

    cat >> "$REPORT" <<EOF

Disk Usage:
$(df -h "$BACKUP_DIR" | tail -n 1)

Backup Directory Size:
$(du -sh "$BACKUP_DIR"/* 2>/dev/null)

Log: $LOG_FILE
EOF

    log "Report generated: $REPORT"
    cat "$REPORT"
}

# Main execution
case "$BACKUP_TYPE" in
    full)
        backup_database
        backup_redis
        backup_uploads
        ;;
    db)
        backup_database
        ;;
    redis)
        backup_redis
        ;;
    uploads)
        backup_uploads
        ;;
    *)
        error "Unknown backup type: $BACKUP_TYPE. Use: full, db, redis, or uploads"
        ;;
esac

cleanup_old_backups
upload_to_remote
generate_report

log "=========================================="
log "Backup completed successfully!"
log "=========================================="

send_notification "SUCCESS" "Backup $BACKUP_TYPE completed at $(date)"
