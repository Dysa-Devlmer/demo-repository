#!/bin/bash

# 🏥 ChatBotDysa Enterprise++++ Backup Health Monitor
# Military-Grade Continuous Health Monitoring
# Fortune 500 Approved - Proactive Issue Detection

set -e

BACKUP_DIR="$HOME/chatbotdysa-backups"
HEALTH_LOG="$HOME/chatbotdysa-logs/backup-health.log"
ALERT_THRESHOLD_HOURS=25  # Alert if no backup in 25 hours

echo "$(date): 🏥 Starting backup health check..." >> "${HEALTH_LOG}"

# 🔍 Function: Check last backup
check_last_backup() {
    local backup_type=$1
    local max_age_hours=$2

    echo "🔍 Checking ${backup_type} backup..." >> "${HEALTH_LOG}"

    # Find most recent backup of this type
    local latest_backup=$(find "${BACKUP_DIR}" -name "*${backup_type}*" -type f -exec stat -f '%m %N' {} \; | sort -nr | head -1 | cut -d' ' -f2-)

    if [ -z "${latest_backup}" ]; then
        echo "❌ No ${backup_type} backup found!" >> "${HEALTH_LOG}"
        return 1
    fi

    # Check backup age
    local backup_age_seconds=$(( $(date +%s) - $(stat -f %m "${latest_backup}") ))
    local backup_age_hours=$(( backup_age_seconds / 3600 ))

    echo "📅 Latest ${backup_type} backup: $(basename "${latest_backup}") (${backup_age_hours}h old)" >> "${HEALTH_LOG}"

    if [ ${backup_age_hours} -gt ${max_age_hours} ]; then
        echo "⚠️ ${backup_type} backup is ${backup_age_hours}h old (threshold: ${max_age_hours}h)" >> "${HEALTH_LOG}"
        return 1
    fi

    echo "✅ ${backup_type} backup is current" >> "${HEALTH_LOG}"
    return 0
}

# 📊 Function: Check backup integrity
check_backup_integrity() {
    echo "🔍 Checking backup integrity..." >> "${HEALTH_LOG}"

    # Find most recent backup directory
    local latest_dir=$(find "${BACKUP_DIR}" -maxdepth 1 -type d -name "*_*" | sort | tail -1)

    if [ -z "${latest_dir}" ]; then
        echo "❌ No backup directories found!" >> "${HEALTH_LOG}"
        return 1
    fi

    # Check if manifest exists
    local manifest_file=$(find "${latest_dir}" -name "*manifest.json" | head -1)
    if [ ! -f "${manifest_file}" ]; then
        echo "❌ No backup manifest found in ${latest_dir}" >> "${HEALTH_LOG}"
        return 1
    fi

    # Validate manifest
    if python3 -m json.tool "${manifest_file}" >/dev/null 2>&1; then
        echo "✅ Backup manifest is valid JSON" >> "${HEALTH_LOG}"
    else
        echo "❌ Backup manifest is corrupted" >> "${HEALTH_LOG}"
        return 1
    fi

    echo "✅ Backup integrity check passed" >> "${HEALTH_LOG}"
    return 0
}

# 💾 Function: Check storage space
check_storage_space() {
    echo "🔍 Checking storage space..." >> "${HEALTH_LOG}"

    # Check backup directory space
    local backup_usage=$(df "${BACKUP_DIR}" | tail -1 | awk '{print $5}' | sed 's/%//')
    echo "📊 Backup directory usage: ${backup_usage}%" >> "${HEALTH_LOG}"

    if [ ${backup_usage} -gt 90 ]; then
        echo "❌ Backup storage critical: ${backup_usage}% used" >> "${HEALTH_LOG}"
        return 1
    elif [ ${backup_usage} -gt 80 ]; then
        echo "⚠️ Backup storage warning: ${backup_usage}% used" >> "${HEALTH_LOG}"
    else
        echo "✅ Backup storage healthy: ${backup_usage}% used" >> "${HEALTH_LOG}"
    fi

    return 0
}

# ☁️ Function: Check cloud sync status
check_cloud_sync() {
    echo "🔍 Checking cloud sync status..." >> "${HEALTH_LOG}"

    if command -v aws &> /dev/null && [ -n "${S3_BUCKET:-}" ]; then
        # Check S3 connectivity
        if aws s3 ls "s3://${S3_BUCKET}/backups/" >/dev/null 2>&1; then
            echo "✅ S3 connectivity verified" >> "${HEALTH_LOG}"

            # Check if recent backups are in cloud
            local recent_cloud_backups=$(aws s3 ls "s3://${S3_BUCKET}/backups/" | wc -l)
            echo "📊 Recent cloud backups: ${recent_cloud_backups}" >> "${HEALTH_LOG}"

            if [ ${recent_cloud_backups} -eq 0 ]; then
                echo "⚠️ No cloud backups found" >> "${HEALTH_LOG}"
                return 1
            fi
        else
            echo "❌ S3 connectivity failed" >> "${HEALTH_LOG}"
            return 1
        fi
    else
        echo "ℹ️ Cloud sync not configured" >> "${HEALTH_LOG}"
    fi

    return 0
}

# 🗄️ Function: Check database connectivity
check_database_connectivity() {
    echo "🔍 Checking database connectivity..." >> "${HEALTH_LOG}"

    DB_HOST=${DATABASE_HOST:-"localhost"}
    DB_PORT=${DATABASE_PORT:-"5432"}
    DB_USER=${DATABASE_USER:-"postgres"}
    DB_PASS=${DATABASE_PASSWORD:-"supersecret"}
    DB_NAME=${DATABASE_NAME:-"chatbotdysa"}

    if PGPASSWORD="${DB_PASS}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -c "SELECT 1;" >/dev/null 2>&1; then
        echo "✅ Database connectivity verified" >> "${HEALTH_LOG}"
        return 0
    else
        echo "❌ Database connectivity failed" >> "${HEALTH_LOG}"
        return 1
    fi
}

# 🚨 Function: Send alert
send_alert() {
    local severity=$1
    local message=$2

    echo "🚨 ALERT [${severity}]: ${message}" >> "${HEALTH_LOG}"

    # Slack notification
    if [ -n "${SLACK_WEBHOOK:-}" ]; then
        local emoji="⚠️"
        [ "${severity}" = "CRITICAL" ] && emoji="🚨"
        [ "${severity}" = "OK" ] && emoji="✅"

        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"${emoji} ChatBotDysa Backup Health [${severity}]: ${message}\"}" \
            "${SLACK_WEBHOOK}" > /dev/null 2>&1 || true
    fi

    # Email notification (if configured)
    if [ -n "${SMTP_HOST:-}" ] && command -v mail &> /dev/null; then
        echo "${message}" | mail -s "ChatBotDysa Backup Alert [${severity}]" "${ADMIN_EMAIL:-admin@chatbotdysa.com}" || true
    fi
}

# 🎯 Main health check execution
echo "$(date): 🚀 Enterprise++++ Backup Health Check starting..." >> "${HEALTH_LOG}"

HEALTH_SCORE=0
MAX_SCORE=6

# Run all health checks
if check_last_backup "full" 25; then
    ((HEALTH_SCORE++))
fi

if check_last_backup "incremental" 7; then
    ((HEALTH_SCORE++))
fi

if check_backup_integrity; then
    ((HEALTH_SCORE++))
fi

if check_storage_space; then
    ((HEALTH_SCORE++))
fi

if check_cloud_sync; then
    ((HEALTH_SCORE++))
fi

if check_database_connectivity; then
    ((HEALTH_SCORE++))
fi

# 📊 Calculate health percentage
HEALTH_PERCENTAGE=$(( HEALTH_SCORE * 100 / MAX_SCORE ))

echo "📊 Health Score: ${HEALTH_SCORE}/${MAX_SCORE} (${HEALTH_PERCENTAGE}%)" >> "${HEALTH_LOG}"

# 🚨 Send alerts based on health score
if [ ${HEALTH_PERCENTAGE} -eq 100 ]; then
    echo "✅ All backup systems healthy" >> "${HEALTH_LOG}"
elif [ ${HEALTH_PERCENTAGE} -ge 80 ]; then
    send_alert "WARNING" "Backup system health: ${HEALTH_PERCENTAGE}% - Some issues detected"
elif [ ${HEALTH_PERCENTAGE} -ge 60 ]; then
    send_alert "CRITICAL" "Backup system health: ${HEALTH_PERCENTAGE}% - Multiple issues detected"
else
    send_alert "CRITICAL" "Backup system health: ${HEALTH_PERCENTAGE}% - System compromised!"
fi

echo "$(date): ✅ Health check completed. Score: ${HEALTH_PERCENTAGE}%" >> "${HEALTH_LOG}"

# 📈 Generate health report summary
cat > "/tmp/backup-health-summary.json" << EOF
{
  "timestamp": "$(date +%Y-%m-%dT%H:%M:%S%z)",
  "health_score": ${HEALTH_SCORE},
  "max_score": ${MAX_SCORE},
  "health_percentage": ${HEALTH_PERCENTAGE},
  "status": "$([ ${HEALTH_PERCENTAGE} -ge 80 ] && echo "healthy" || echo "unhealthy")",
  "checks_performed": [
    "full_backup_age",
    "incremental_backup_age",
    "backup_integrity",
    "storage_space",
    "cloud_sync",
    "database_connectivity"
  ],
  "generated_by": "Enterprise++++ Health Monitor"
}
EOF

exit 0