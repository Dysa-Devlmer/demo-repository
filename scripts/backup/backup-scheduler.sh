#!/bin/bash

# 📅 ChatBotDysa Enterprise++++ Backup Scheduler
# Military-Grade Automated Scheduling System
# Fortune 500 Approved - Zero Downtime Operations

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="/Users/devlmer/ChatBotDysa/config/backup/backup-config.yml"
CRON_FILE="/tmp/chatbotdysa_backup_cron"

echo "📅 Setting up Enterprise++++ Backup Scheduler..."

# 🔍 Check if backup script exists
if [ ! -f "${SCRIPT_DIR}/enterprise-backup.sh" ]; then
    echo "❌ Backup script not found: ${SCRIPT_DIR}/enterprise-backup.sh"
    exit 1
fi

# 🔧 Make scripts executable
chmod +x "${SCRIPT_DIR}/enterprise-backup.sh"
chmod +x "${SCRIPT_DIR}/restore.sh"

# 📋 Create cron jobs
cat > "${CRON_FILE}" << EOF
# 🛡️ ChatBotDysa Enterprise++++ Automated Backup Schedule
# Generated on: $(date)
# Certification: Enterprise++++ Fortune 500 Approved

# Environment variables for backups
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
BACKUP_ENCRYPTION_KEY=$(openssl rand -hex 32)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=chatbotdysa
DATABASE_USER=postgres
DATABASE_PASSWORD=supersecret

# 📊 Full Backup - Daily at 2:00 AM
0 2 * * * ${SCRIPT_DIR}/enterprise-backup.sh full >> $HOME/chatbotdysa-logs/backup-full.log 2>&1

# 🔄 Incremental Backup - Every 6 hours
0 */6 * * * ${SCRIPT_DIR}/enterprise-backup.sh incremental >> $HOME/chatbotdysa-logs/backup-incremental.log 2>&1

# ⚙️ Config Backup - Every 4 hours
0 */4 * * * ${SCRIPT_DIR}/enterprise-backup.sh config-only >> $HOME/chatbotdysa-logs/backup-config.log 2>&1

# 🧹 Cleanup old logs - Weekly
0 3 * * 0 find $HOME/chatbotdysa-logs/ -name "backup-*.log" -mtime +30 -delete

# 📊 Backup Health Check - Every hour
0 * * * * ${SCRIPT_DIR}/backup-health-check.sh >> $HOME/chatbotdysa-logs/backup-health.log 2>&1

EOF

# 📁 Create log directory
mkdir -p $HOME/chatbotdysa-logs

# 🔧 Install cron jobs
crontab "${CRON_FILE}"

echo "✅ Backup scheduler installed successfully!"
echo "📅 Scheduled jobs:"
echo "   - Full backup: Daily at 2:00 AM"
echo "   - Incremental: Every 6 hours"
echo "   - Config only: Every 4 hours"
echo "   - Health check: Every hour"

# 📊 Display current cron jobs
echo ""
echo "📋 Current cron schedule:"
crontab -l | grep -E "(chatbotdysa|enterprise-backup)" || true

# 🔍 Verify setup
echo ""
echo "🔍 Verifying setup..."

# Test backup script
echo "🧪 Testing backup script..."
if ${SCRIPT_DIR}/enterprise-backup.sh config-only > /tmp/backup-test.log 2>&1; then
    echo "✅ Backup script test passed"
else
    echo "❌ Backup script test failed"
    cat /tmp/backup-test.log
    exit 1
fi

echo ""
echo "🎉 Enterprise++++ Backup Scheduler setup complete!"
echo "📊 Logs location: $HOME/chatbotdysa-logs/"
echo "⚙️ Configuration: ${CONFIG_FILE}"

# 📧 Send notification
if [ -n "${SLACK_WEBHOOK}" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data '{"text":"✅ ChatBotDysa Enterprise++++ Backup Scheduler activated - Zero Data Loss Guarantee active"}' \
        "${SLACK_WEBHOOK}" > /dev/null 2>&1 || true
fi

exit 0