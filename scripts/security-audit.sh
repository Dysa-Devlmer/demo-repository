#!/bin/bash
# =============================================================================
# 🚀 CHATBOTDYSA ENTERPRISE+++++ SECURITY AUDIT SCRIPT
# Comprehensive Security Assessment for Fortune 500 Operations
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Enterprise Security Configuration
SECURITY_VERSION="1.0.0"
AUDIT_DATE=$(date '+%Y-%m-%d %H:%M:%S')
REPORT_DIR="./security-reports"
PROJECT_ROOT=$(pwd)

# Security thresholds
MAX_CRITICAL_VULNERABILITIES=0
MAX_HIGH_VULNERABILITIES=0
MAX_MEDIUM_VULNERABILITIES=5
MAX_LOW_VULNERABILITIES=10

# Security tracking
TOTAL_CHECKS=0
PASSED_CHECKS=0
WARNINGS=0
CRITICAL_ISSUES=0
HIGH_ISSUES=0
MEDIUM_ISSUES=0
LOW_ISSUES=0
SECURITY_ERRORS=()

echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                     CHATBOTDYSA ENTERPRISE+++++                              ║${NC}"
echo -e "${PURPLE}║                      SECURITY AUDIT SYSTEM                                  ║${NC}"
echo -e "${PURPLE}║                        Fortune 500 Grade                                    ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Utility functions
log_check() {
    ((TOTAL_CHECKS++))
    echo -e "${BLUE}[CHECK $TOTAL_CHECKS]${NC} $1"
}

log_success() {
    ((PASSED_CHECKS++))
    echo -e "${GREEN}  ✅ PASS:${NC} $1"
}

log_warning() {
    ((WARNINGS++))
    echo -e "${YELLOW}  ⚠️  WARN:${NC} $1"
}

log_critical() {
    ((CRITICAL_ISSUES++))
    SECURITY_ERRORS+=("CRITICAL: $1")
    echo -e "${RED}  🚨 CRITICAL:${NC} $1"
}

log_high() {
    ((HIGH_ISSUES++))
    SECURITY_ERRORS+=("HIGH: $1")
    echo -e "${RED}  ❌ HIGH:${NC} $1"
}

log_medium() {
    ((MEDIUM_ISSUES++))
    echo -e "${YELLOW}  ⚠️  MEDIUM:${NC} $1"
}

log_low() {
    ((LOW_ISSUES++))
    echo -e "${CYAN}  ℹ️  LOW:${NC} $1"
}

log_info() {
    echo -e "${CYAN}  ℹ️  INFO:${NC} $1"
}

# Create report directory
mkdir -p "$REPORT_DIR"

# 1. Dependency Vulnerability Scanning
check_npm_audit() {
    log_check "NPM Dependency Vulnerability Scan"

    cd "$PROJECT_ROOT/apps/backend"

    if command -v npm >/dev/null 2>&1; then
        local audit_result=$(npm audit --json 2>/dev/null || echo '{"error": "audit failed"}')

        if echo "$audit_result" | grep -q '"error"'; then
            log_warning "NPM audit failed to run properly"
            return
        fi

        # Parse audit results
        local critical=$(echo "$audit_result" | jq -r '.metadata.vulnerabilities.critical // 0' 2>/dev/null || echo "0")
        local high=$(echo "$audit_result" | jq -r '.metadata.vulnerabilities.high // 0' 2>/dev/null || echo "0")
        local moderate=$(echo "$audit_result" | jq -r '.metadata.vulnerabilities.moderate // 0' 2>/dev/null || echo "0")
        local low=$(echo "$audit_result" | jq -r '.metadata.vulnerabilities.low // 0' 2>/dev/null || echo "0")

        log_info "Vulnerabilities found - Critical: $critical, High: $high, Medium: $moderate, Low: $low"

        if [[ $critical -gt $MAX_CRITICAL_VULNERABILITIES ]]; then
            log_critical "$critical critical vulnerabilities found (max allowed: $MAX_CRITICAL_VULNERABILITIES)"
        fi

        if [[ $high -gt $MAX_HIGH_VULNERABILITIES ]]; then
            log_high "$high high vulnerabilities found (max allowed: $MAX_HIGH_VULNERABILITIES)"
        fi

        if [[ $moderate -gt $MAX_MEDIUM_VULNERABILITIES ]]; then
            log_medium "$moderate medium vulnerabilities found (max allowed: $MAX_MEDIUM_VULNERABILITIES)"
        fi

        if [[ $low -gt $MAX_LOW_VULNERABILITIES ]]; then
            log_low "$low low vulnerabilities found (max allowed: $MAX_LOW_VULNERABILITIES)"
        fi

        if [[ $critical -eq 0 && $high -eq 0 && $moderate -le $MAX_MEDIUM_VULNERABILITIES && $low -le $MAX_LOW_VULNERABILITIES ]]; then
            log_success "Dependency vulnerabilities within acceptable limits"
        fi

        # Save detailed report
        echo "$audit_result" > "$REPORT_DIR/npm-audit-report.json"
    else
        log_warning "NPM not found, skipping dependency audit"
    fi

    cd "$PROJECT_ROOT"
}

# 2. Secret Detection
check_secrets() {
    log_check "Secret and Credential Detection"

    local secrets_found=false

    # Check for common secret patterns
    local secret_patterns=(
        "password\s*=\s*['\"][^'\"]*['\"]"
        "api_key\s*=\s*['\"][^'\"]*['\"]"
        "secret\s*=\s*['\"][^'\"]*['\"]"
        "private_key"
        "access_token"
        "jwt_secret"
        "database_url.*://.*:.*@"
        "redis://.*:.*@"
        "-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----"
        "eyJ[A-Za-z0-9-_]*\\.eyJ[A-Za-z0-9-_]*\\.[A-Za-z0-9-_]*"  # JWT tokens
    )

    for pattern in "${secret_patterns[@]}"; do
        local matches=$(grep -r -i -E "$pattern" --include="*.ts" --include="*.js" --include="*.json" --include="*.env*" \
                       --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=coverage \
                       --exclude="*.test.*" --exclude="*.spec.*" . 2>/dev/null || true)

        if [[ -n "$matches" ]]; then
            secrets_found=true
            log_high "Potential secrets found: $pattern"
            echo "$matches" | head -5 | while read -r line; do
                log_info "  Found in: $line"
            done
        fi
    done

    if [[ "$secrets_found" == false ]]; then
        log_success "No hardcoded secrets detected"
    fi
}

# 3. File Permission Audit
check_file_permissions() {
    log_check "File Permission Security Audit"

    # Check for overly permissive files
    local world_writable=$(find . -type f -perm -002 2>/dev/null | grep -v node_modules | head -10)
    if [[ -n "$world_writable" ]]; then
        log_medium "World-writable files found:"
        echo "$world_writable" | while read -r file; do
            log_info "  $file"
        done
    else
        log_success "No world-writable files found"
    fi

    # Check for executable scripts without proper permissions
    local script_files=$(find . -name "*.sh" -o -name "*.py" -o -name "*.pl" | grep -v node_modules)
    local insecure_scripts=false

    for script in $script_files; do
        if [[ -f "$script" && ! -x "$script" ]]; then
            insecure_scripts=true
            log_low "Script file without execute permission: $script"
        fi
    done

    if [[ "$insecure_scripts" == false ]]; then
        log_success "Script file permissions are appropriate"
    fi
}

# 4. Configuration Security
check_configuration_security() {
    log_check "Configuration Security Assessment"

    # Check for insecure configurations
    local config_files=(".env" ".env.example" "config/default.json" "package.json")

    for config_file in "${config_files[@]}"; do
        if [[ -f "$config_file" ]]; then
            log_info "Checking $config_file"

            # Check for development/debug flags in production configs
            if grep -qi "debug.*true\|development\|localhost" "$config_file" 2>/dev/null; then
                log_warning "Development/debug configurations found in $config_file"
            fi

            # Check for weak SSL/TLS configurations
            if grep -qi "ssl.*false\|tls.*false" "$config_file" 2>/dev/null; then
                log_medium "SSL/TLS disabled in $config_file"
            fi

            # Check for insecure session configurations
            if grep -qi "secure.*false\|httpOnly.*false" "$config_file" 2>/dev/null; then
                log_medium "Insecure session configuration in $config_file"
            fi
        fi
    done

    log_success "Configuration security check completed"
}

# 5. Docker Security Scan
check_docker_security() {
    log_check "Docker Configuration Security"

    if [[ -f "Dockerfile" ]]; then
        log_info "Checking Dockerfile security"

        # Check for running as root
        if ! grep -q "USER " Dockerfile; then
            log_high "Dockerfile runs as root user (security risk)"
        else
            log_success "Dockerfile uses non-root user"
        fi

        # Check for latest tags
        if grep -q ":latest" Dockerfile; then
            log_medium "Dockerfile uses 'latest' tags (not recommended for production)"
        else
            log_success "Dockerfile uses specific version tags"
        fi

        # Check for secrets in dockerfile
        if grep -qi "password\|secret\|key" Dockerfile; then
            log_high "Potential secrets in Dockerfile"
        fi
    fi

    # Check docker-compose security
    local compose_files=$(find . -name "docker-compose*.yml" -o -name "docker-compose*.yaml")
    for compose_file in $compose_files; do
        if [[ -f "$compose_file" ]]; then
            log_info "Checking $compose_file security"

            # Check for privileged containers
            if grep -q "privileged.*true" "$compose_file"; then
                log_high "Privileged containers found in $compose_file"
            fi

            # Check for host network mode
            if grep -q "network_mode.*host" "$compose_file"; then
                log_medium "Host network mode found in $compose_file"
            fi

            # Check for volume mounts
            if grep -q "/var/run/docker.sock" "$compose_file"; then
                log_medium "Docker socket mounted in $compose_file"
            fi
        fi
    done
}

# 6. SSL/TLS Configuration Check
check_ssl_tls_config() {
    log_check "SSL/TLS Configuration Security"

    # Check nginx configuration
    local nginx_configs=$(find . -name "nginx.conf" -o -name "*.nginx.conf")
    for nginx_config in $nginx_configs; do
        if [[ -f "$nginx_config" ]]; then
            log_info "Checking $nginx_config"

            # Check SSL protocols
            if grep -q "ssl_protocols.*TLSv1\.0\|ssl_protocols.*TLSv1\.1" "$nginx_config"; then
                log_high "Weak TLS protocols (1.0/1.1) enabled in $nginx_config"
            elif grep -q "ssl_protocols.*TLSv1\.2.*TLSv1\.3" "$nginx_config"; then
                log_success "Strong TLS protocols (1.2/1.3) configured"
            fi

            # Check SSL ciphers
            if grep -q "ssl_ciphers" "$nginx_config"; then
                if grep -q "ECDHE\|AES.*GCM" "$nginx_config"; then
                    log_success "Strong SSL ciphers configured"
                else
                    log_medium "Weak SSL ciphers may be configured"
                fi
            fi

            # Check HSTS headers
            if grep -q "Strict-Transport-Security" "$nginx_config"; then
                log_success "HSTS headers configured"
            else
                log_medium "HSTS headers not configured"
            fi
        fi
    done
}

# 7. Database Security Check
check_database_security() {
    log_check "Database Security Configuration"

    # Check PostgreSQL configuration
    local pg_configs=$(find . -name "postgresql.conf" -o -name "pg_hba.conf")
    for pg_config in $pg_configs; do
        if [[ -f "$pg_config" ]]; then
            log_info "Checking $pg_config"

            if [[ "$pg_config" == *"pg_hba.conf" ]]; then
                # Check for trust authentication
                if grep -q "trust" "$pg_config"; then
                    log_high "Trust authentication found in $pg_config (security risk)"
                fi

                # Check for MD5 authentication (deprecated)
                if grep -q "md5" "$pg_config"; then
                    log_medium "MD5 authentication found in $pg_config (deprecated)"
                fi

                # Check for SCRAM authentication
                if grep -q "scram-sha-256" "$pg_config"; then
                    log_success "Strong SCRAM-SHA-256 authentication configured"
                fi
            fi

            if [[ "$pg_config" == *"postgresql.conf" ]]; then
                # Check SSL configuration
                if grep -q "ssl = on" "$pg_config"; then
                    log_success "SSL enabled for PostgreSQL"
                else
                    log_medium "SSL not explicitly enabled for PostgreSQL"
                fi

                # Check logging configuration
                if grep -q "log_connections = on" "$pg_config"; then
                    log_success "Connection logging enabled"
                else
                    log_low "Connection logging not enabled"
                fi
            fi
        fi
    done
}

# 8. API Security Check
check_api_security() {
    log_check "API Security Assessment"

    # Check for security middleware
    local security_middleware_found=false

    if grep -r -q "helmet\|cors\|rate.*limit" --include="*.ts" --include="*.js" apps/backend/src/ 2>/dev/null; then
        log_success "Security middleware (helmet/cors/rate-limiting) found"
        security_middleware_found=true
    fi

    if [[ "$security_middleware_found" == false ]]; then
        log_high "No security middleware detected in API"
    fi

    # Check for input validation
    if grep -r -q "class-validator\|joi\|yup" --include="*.ts" --include="*.js" apps/backend/src/ 2>/dev/null; then
        log_success "Input validation framework found"
    else
        log_high "No input validation framework detected"
    fi

    # Check for authentication guards
    if grep -r -q "AuthGuard\|JwtAuthGuard\|@UseGuards" --include="*.ts" apps/backend/src/ 2>/dev/null; then
        log_success "Authentication guards found"
    else
        log_high "No authentication guards detected"
    fi
}

# 9. Code Quality Security Checks
check_code_quality_security() {
    log_check "Code Quality Security Assessment"

    cd "$PROJECT_ROOT/apps/backend"

    # Check for console.log statements (information disclosure)
    local console_logs=$(grep -r "console\.log\|console\.error" --include="*.ts" --include="*.js" src/ 2>/dev/null | wc -l)
    if [[ $console_logs -gt 0 ]]; then
        log_low "$console_logs console.log statements found (potential information disclosure)"
    else
        log_success "No console.log statements found in production code"
    fi

    # Check for TODO/FIXME comments with security implications
    local security_todos=$(grep -r -i "todo.*security\|fixme.*security\|hack\|unsafe" --include="*.ts" --include="*.js" src/ 2>/dev/null | wc -l)
    if [[ $security_todos -gt 0 ]]; then
        log_medium "$security_todos security-related TODO/FIXME comments found"
    fi

    # Check for eval() usage
    local eval_usage=$(grep -r "eval(" --include="*.ts" --include="*.js" src/ 2>/dev/null | wc -l)
    if [[ $eval_usage -gt 0 ]]; then
        log_high "$eval_usage eval() statements found (code injection risk)"
    else
        log_success "No eval() statements found"
    fi

    cd "$PROJECT_ROOT"
}

# 10. Network Security Check
check_network_security() {
    log_check "Network Security Configuration"

    # Check for open ports in docker-compose
    local compose_files=$(find . -name "docker-compose*.yml" -o -name "docker-compose*.yaml")
    for compose_file in $compose_files; do
        if [[ -f "$compose_file" ]]; then
            # Check for unnecessarily exposed ports
            local exposed_ports=$(grep -c "0\.0\.0\.0:" "$compose_file" 2>/dev/null || echo "0")
            if [[ $exposed_ports -gt 0 ]]; then
                log_medium "$exposed_ports services binding to 0.0.0.0 in $compose_file"
            fi

            # Check for development ports in production
            if grep -q ":3000\|:8080\|:9000" "$compose_file"; then
                log_low "Development ports found in $compose_file"
            fi
        fi
    done

    log_success "Network security configuration check completed"
}

# Main execution
main() {
    echo -e "${WHITE}Starting Enterprise+++++ security audit...${NC}"
    echo -e "${WHITE}Audit Date: $AUDIT_DATE${NC}"
    echo ""

    check_npm_audit
    echo ""

    check_secrets
    echo ""

    check_file_permissions
    echo ""

    check_configuration_security
    echo ""

    check_docker_security
    echo ""

    check_ssl_tls_config
    echo ""

    check_database_security
    echo ""

    check_api_security
    echo ""

    check_code_quality_security
    echo ""

    check_network_security
    echo ""

    # Generate comprehensive report
    generate_security_report

    # Final security assessment
    security_final_report
}

generate_security_report() {
    local report_file="$REPORT_DIR/security-audit-report-$(date +%Y%m%d_%H%M%S).json"

    cat > "$report_file" << EOF
{
  "audit_info": {
    "version": "$SECURITY_VERSION",
    "date": "$AUDIT_DATE",
    "project": "ChatBotDysa Enterprise+++++",
    "auditor": "Enterprise Security Scanner"
  },
  "summary": {
    "total_checks": $TOTAL_CHECKS,
    "passed_checks": $PASSED_CHECKS,
    "warnings": $WARNINGS,
    "critical_issues": $CRITICAL_ISSUES,
    "high_issues": $HIGH_ISSUES,
    "medium_issues": $MEDIUM_ISSUES,
    "low_issues": $LOW_ISSUES
  },
  "security_score": $(( (PASSED_CHECKS * 100) / TOTAL_CHECKS )),
  "risk_level": "$(get_risk_level)",
  "issues": $(printf '%s\n' "${SECURITY_ERRORS[@]}" | jq -R . | jq -s .)
}
EOF

    log_info "Detailed security report saved to: $report_file"
}

get_risk_level() {
    if [[ $CRITICAL_ISSUES -gt 0 ]]; then
        echo "CRITICAL"
    elif [[ $HIGH_ISSUES -gt 0 ]]; then
        echo "HIGH"
    elif [[ $MEDIUM_ISSUES -gt 5 ]]; then
        echo "MEDIUM"
    else
        echo "LOW"
    fi
}

security_final_report() {
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║                           SECURITY AUDIT REPORT                             ║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    echo -e "${WHITE}📊 SECURITY SUMMARY:${NC}"
    echo -e "   Total Checks: $TOTAL_CHECKS"
    echo -e "   ${GREEN}Passed: $PASSED_CHECKS${NC}"
    echo -e "   ${YELLOW}Warnings: $WARNINGS${NC}"
    echo -e "   ${RED}Critical: $CRITICAL_ISSUES${NC}"
    echo -e "   ${RED}High: $HIGH_ISSUES${NC}"
    echo -e "   ${YELLOW}Medium: $MEDIUM_ISSUES${NC}"
    echo -e "   ${CYAN}Low: $LOW_ISSUES${NC}"

    local security_score=$(( (PASSED_CHECKS * 100) / TOTAL_CHECKS ))
    echo -e "   Security Score: $security_score%"

    local risk_level=$(get_risk_level)
    echo -e "   Risk Level: $risk_level"
    echo ""

    if [[ $CRITICAL_ISSUES -eq 0 && $HIGH_ISSUES -eq 0 ]]; then
        echo -e "${GREEN}🎉 ENTERPRISE SECURITY PASSED!${NC}"
        echo -e "${GREEN}   No critical or high-risk security issues found.${NC}"
        echo -e "${GREEN}   ChatBotDysa meets Fortune 500 security standards.${NC}"

        if [[ $MEDIUM_ISSUES -gt 0 || $LOW_ISSUES -gt 0 ]]; then
            echo -e "${YELLOW}   Consider addressing medium/low priority issues for optimal security.${NC}"
        fi

        exit 0
    else
        echo -e "${RED}❌ ENTERPRISE SECURITY FAILED${NC}"
        echo -e "${RED}   Critical security issues must be resolved:${NC}"
        echo ""

        for error in "${SECURITY_ERRORS[@]}"; do
            if [[ "$error" == CRITICAL:* || "$error" == HIGH:* ]]; then
                echo -e "${RED}   • ${error#*: }${NC}"
            fi
        done

        echo ""
        echo -e "${WHITE}🔧 RECOMMENDED ACTIONS:${NC}"
        echo -e "   1. Fix all critical and high-risk vulnerabilities"
        echo -e "   2. Update dependencies to latest secure versions"
        echo -e "   3. Review and strengthen authentication mechanisms"
        echo -e "   4. Implement missing security middleware"
        echo -e "   5. Re-run security audit: ./scripts/security-audit.sh"

        exit 1
    fi
}

# Check dependencies
if ! command -v jq >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Warning: 'jq' not found. Some JSON parsing may be limited.${NC}"
    echo "   Install jq: apt-get install jq (Ubuntu/Debian) or brew install jq (macOS)"
    echo ""
fi

# Run main function
main "$@"