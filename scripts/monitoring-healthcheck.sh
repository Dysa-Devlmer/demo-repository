#!/bin/bash

# ============================================
# ChatBotDysa - Monitoring & Health Check
# ============================================
# Monitors all services and sends alerts
# Usage: ./scripts/monitoring-healthcheck.sh [--daemon]
# ============================================

set -e

DAEMON_MODE=${1:-""}
CHECK_INTERVAL=${CHECK_INTERVAL:-60}
ALERT_THRESHOLD=${ALERT_THRESHOLD:-3}

# Service endpoints
BACKEND_URL=${BACKEND_URL:-"http://localhost:8005/health"}
ADMIN_URL=${ADMIN_URL:-"http://localhost:7001/api/health"}
LANDING_URL=${LANDING_URL:-"http://localhost:3004"}
OLLAMA_URL=${OLLAMA_URL:-"http://localhost:21434/api/tags"}

# Database
DB_HOST=${DATABASE_HOST:-localhost}
DB_PORT=${DATABASE_PORT:-15432}
DB_USER=${DATABASE_USER:-postgres}
DB_NAME=${DATABASE_NAME:-chatbotdysa}

# Redis
REDIS_HOST=${REDIS_HOST:-localhost}
REDIS_PORT=${REDIS_PORT:-16379}

# Failure counters
declare -A FAILURE_COUNT

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"; }
error() { echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"; }
warning() { echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"; }

# Send alert notification
send_alert() {
    SERVICE=$1
    STATUS=$2
    MESSAGE=$3

    # Slack webhook
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        EMOJI=":x:"
        [ "$STATUS" = "recovered" ] && EMOJI=":white_check_mark:"

        curl -s -X POST "$SLACK_WEBHOOK_URL" \
            -H 'Content-Type: application/json' \
            -d "{
                \"text\": \"$EMOJI *ChatBotDysa Alert*\",
                \"attachments\": [{
                    \"color\": \"$([ "$STATUS" = "recovered" ] && echo 'good' || echo 'danger')\",
                    \"fields\": [
                        {\"title\": \"Service\", \"value\": \"$SERVICE\", \"short\": true},
                        {\"title\": \"Status\", \"value\": \"$STATUS\", \"short\": true},
                        {\"title\": \"Message\", \"value\": \"$MESSAGE\", \"short\": false},
                        {\"title\": \"Time\", \"value\": \"$(date)\", \"short\": true}
                    ]
                }]
            }" > /dev/null
    fi

    # PagerDuty (if critical)
    if [ -n "$PAGERDUTY_SERVICE_KEY" ] && [ "$STATUS" = "down" ]; then
        curl -s -X POST "https://events.pagerduty.com/v2/enqueue" \
            -H 'Content-Type: application/json' \
            -d "{
                \"routing_key\": \"$PAGERDUTY_SERVICE_KEY\",
                \"event_action\": \"trigger\",
                \"payload\": {
                    \"summary\": \"ChatBotDysa: $SERVICE is $STATUS\",
                    \"source\": \"monitoring-healthcheck\",
                    \"severity\": \"critical\"
                }
            }" > /dev/null
    fi

    # Discord webhook
    if [ -n "$DISCORD_WEBHOOK_URL" ]; then
        curl -s -X POST "$DISCORD_WEBHOOK_URL" \
            -H 'Content-Type: application/json' \
            -d "{
                \"embeds\": [{
                    \"title\": \"ChatBotDysa Alert\",
                    \"color\": $([ "$STATUS" = "recovered" ] && echo '65280' || echo '16711680'),
                    \"fields\": [
                        {\"name\": \"Service\", \"value\": \"$SERVICE\", \"inline\": true},
                        {\"name\": \"Status\", \"value\": \"$STATUS\", \"inline\": true},
                        {\"name\": \"Message\", \"value\": \"$MESSAGE\"}
                    ],
                    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
                }]
            }" > /dev/null
    fi

    # Log to file
    echo "$(date '+%Y-%m-%d %H:%M:%S') | $SERVICE | $STATUS | $MESSAGE" >> /var/log/chatbotdysa/alerts.log 2>/dev/null || true
}

# Check HTTP endpoint
check_http() {
    NAME=$1
    URL=$2

    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 --max-time 10 "$URL" 2>/dev/null)

    if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "201" ]; then
        if [ "${FAILURE_COUNT[$NAME]:-0}" -gt 0 ]; then
            send_alert "$NAME" "recovered" "Service is back online (HTTP $RESPONSE)"
        fi
        FAILURE_COUNT[$NAME]=0
        echo -e "${GREEN}✓${NC} $NAME: OK (HTTP $RESPONSE)"
        return 0
    else
        FAILURE_COUNT[$NAME]=$((${FAILURE_COUNT[$NAME]:-0} + 1))
        echo -e "${RED}✗${NC} $NAME: FAILED (HTTP $RESPONSE, failures: ${FAILURE_COUNT[$NAME]})"

        if [ "${FAILURE_COUNT[$NAME]}" -ge "$ALERT_THRESHOLD" ]; then
            send_alert "$NAME" "down" "Service unreachable (HTTP $RESPONSE) for ${FAILURE_COUNT[$NAME]} checks"
        fi
        return 1
    fi
}

# Check PostgreSQL
check_postgres() {
    if docker ps --format '{{.Names}}' | grep -q "chatbotdysa-postgres"; then
        if docker exec chatbotdysa-postgres-prod pg_isready -U "$DB_USER" -q 2>/dev/null; then
            echo -e "${GREEN}✓${NC} PostgreSQL: OK"
            FAILURE_COUNT[postgres]=0
            return 0
        fi
    else
        if pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -q 2>/dev/null; then
            echo -e "${GREEN}✓${NC} PostgreSQL: OK"
            FAILURE_COUNT[postgres]=0
            return 0
        fi
    fi

    FAILURE_COUNT[postgres]=$((${FAILURE_COUNT[postgres]:-0} + 1))
    echo -e "${RED}✗${NC} PostgreSQL: FAILED (failures: ${FAILURE_COUNT[postgres]})"

    if [ "${FAILURE_COUNT[postgres]}" -ge "$ALERT_THRESHOLD" ]; then
        send_alert "PostgreSQL" "down" "Database is unreachable"
    fi
    return 1
}

# Check Redis
check_redis() {
    if docker ps --format '{{.Names}}' | grep -q "chatbotdysa-redis"; then
        if docker exec chatbotdysa-redis-prod redis-cli ping 2>/dev/null | grep -q "PONG"; then
            echo -e "${GREEN}✓${NC} Redis: OK"
            FAILURE_COUNT[redis]=0
            return 0
        fi
    else
        if redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ping 2>/dev/null | grep -q "PONG"; then
            echo -e "${GREEN}✓${NC} Redis: OK"
            FAILURE_COUNT[redis]=0
            return 0
        fi
    fi

    FAILURE_COUNT[redis]=$((${FAILURE_COUNT[redis]:-0} + 1))
    echo -e "${RED}✗${NC} Redis: FAILED (failures: ${FAILURE_COUNT[redis]})"

    if [ "${FAILURE_COUNT[redis]}" -ge "$ALERT_THRESHOLD" ]; then
        send_alert "Redis" "down" "Cache server is unreachable"
    fi
    return 1
}

# Check disk space
check_disk() {
    THRESHOLD=90
    USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')

    if [ "$USAGE" -lt "$THRESHOLD" ]; then
        echo -e "${GREEN}✓${NC} Disk: OK (${USAGE}% used)"
        FAILURE_COUNT[disk]=0
    else
        echo -e "${YELLOW}!${NC} Disk: WARNING (${USAGE}% used)"
        FAILURE_COUNT[disk]=$((${FAILURE_COUNT[disk]:-0} + 1))

        if [ "${FAILURE_COUNT[disk]}" -ge "$ALERT_THRESHOLD" ]; then
            send_alert "Disk Space" "warning" "Disk usage is at ${USAGE}%"
        fi
    fi
}

# Check memory
check_memory() {
    THRESHOLD=90
    USAGE=$(free | awk 'NR==2 {printf "%.0f", $3*100/$2}')

    if [ "$USAGE" -lt "$THRESHOLD" ]; then
        echo -e "${GREEN}✓${NC} Memory: OK (${USAGE}% used)"
        FAILURE_COUNT[memory]=0
    else
        echo -e "${YELLOW}!${NC} Memory: WARNING (${USAGE}% used)"
        FAILURE_COUNT[memory]=$((${FAILURE_COUNT[memory]:-0} + 1))

        if [ "${FAILURE_COUNT[memory]}" -ge "$ALERT_THRESHOLD" ]; then
            send_alert "Memory" "warning" "Memory usage is at ${USAGE}%"
        fi
    fi
}

# Check Docker containers
check_containers() {
    EXPECTED_CONTAINERS="chatbotdysa-backend-prod chatbotdysa-admin-prod chatbotdysa-postgres-prod chatbotdysa-redis-prod chatbotdysa-ollama-prod chatbotdysa-nginx-prod"

    for CONTAINER in $EXPECTED_CONTAINERS; do
        if docker ps --format '{{.Names}}' | grep -q "$CONTAINER"; then
            STATUS=$(docker inspect --format='{{.State.Health.Status}}' "$CONTAINER" 2>/dev/null || echo "running")
            if [ "$STATUS" = "healthy" ] || [ "$STATUS" = "running" ]; then
                echo -e "${GREEN}✓${NC} Container $CONTAINER: OK"
                FAILURE_COUNT[$CONTAINER]=0
            else
                echo -e "${YELLOW}!${NC} Container $CONTAINER: $STATUS"
            fi
        else
            echo -e "${RED}✗${NC} Container $CONTAINER: NOT RUNNING"
            FAILURE_COUNT[$CONTAINER]=$((${FAILURE_COUNT[$CONTAINER]:-0} + 1))

            if [ "${FAILURE_COUNT[$CONTAINER]}" -ge "$ALERT_THRESHOLD" ]; then
                send_alert "$CONTAINER" "down" "Container is not running"
            fi
        fi
    done
}

# Run single health check
run_check() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
    echo -e "${BLUE}  ChatBotDysa Health Check - $(date)${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
    echo ""

    echo -e "${BLUE}Services:${NC}"
    check_http "Backend API" "$BACKEND_URL"
    check_http "Admin Panel" "$ADMIN_URL"
    check_http "Landing Page" "$LANDING_URL"
    check_http "Ollama AI" "$OLLAMA_URL"
    echo ""

    echo -e "${BLUE}Infrastructure:${NC}"
    check_postgres
    check_redis
    echo ""

    echo -e "${BLUE}System Resources:${NC}"
    check_disk
    check_memory
    echo ""

    if command -v docker &> /dev/null; then
        echo -e "${BLUE}Docker Containers:${NC}"
        check_containers
        echo ""
    fi
}

# Main execution
if [ "$DAEMON_MODE" = "--daemon" ]; then
    log "Starting monitoring daemon (interval: ${CHECK_INTERVAL}s, threshold: ${ALERT_THRESHOLD})"
    mkdir -p /var/log/chatbotdysa

    while true; do
        run_check >> /var/log/chatbotdysa/healthcheck.log 2>&1
        sleep "$CHECK_INTERVAL"
    done
else
    run_check
fi
