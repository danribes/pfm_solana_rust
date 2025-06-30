#!/bin/bash

# Logging Infrastructure Integration Tests
# Task 6.4.2: Logging Best Practices & Log Management

set -e

echo "=== Logging Infrastructure Integration Tests ==="

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TEST_LOG_FILE="$PROJECT_ROOT/logging-integration-test.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$TEST_LOG_FILE"
}

# Test status tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

run_test() {
    local test_name="$1"
    local test_function="$2"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    log "🧪 Running test: $test_name"
    
    if $test_function; then
        log "✅ PASSED: $test_name"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        log "❌ FAILED: $test_name"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    echo ""
}

# Test 1: Logging infrastructure files
test_logging_files() {
    log "🔍 Testing logging infrastructure files..."
    
    local logging_dir="$PROJECT_ROOT/infra/logging"
    local required_files=(
        "loki/loki.yml"
        "loki/promtail.yml"
        "loki/alerting-rules.yml"
        "docker-compose.logging.yml"
        "logrotate/logrotate.conf"
        "logrotate/pfm-logs"
    )
    
    for file in "${required_files[@]}"; do
        if [[ -f "$logging_dir/$file" ]]; then
            log "✅ Found: $file"
        else
            log "❌ Missing: $file"
            return 1
        fi
    done
    
    # Check backend logging utilities
    local backend_files=(
        "$PROJECT_ROOT/backend/utils/logger.js"
        "$PROJECT_ROOT/backend/routes/logs.js"
    )
    
    for file in "${backend_files[@]}"; do
        if [[ -f "$file" ]]; then
            log "✅ Found: $(basename $file)"
        else
            log "❌ Missing: $(basename $file)"
            return 1
        fi
    done
    
    # Check frontend logging utilities
    local frontend_file="$PROJECT_ROOT/frontend/shared/utils/logger.ts"
    if [[ -f "$frontend_file" ]]; then
        log "✅ Found: frontend logger"
    else
        log "❌ Missing: frontend logger"
        return 1
    fi
    
    return 0
}

# Test 2: Docker Compose configuration
test_docker_compose_config() {
    log "🔍 Testing Docker Compose logging configuration..."
    
    local compose_file="$PROJECT_ROOT/infra/logging/docker-compose.logging.yml"
    
    # Check if compose file is valid YAML
    if command -v docker-compose >/dev/null 2>&1; then
        if docker-compose -f "$compose_file" config >/dev/null 2>&1; then
            log "✅ Docker Compose configuration is valid"
        else
            log "❌ Docker Compose configuration is invalid"
            return 1
        fi
    else
        log "⚠️ docker-compose not available, skipping validation"
    fi
    
    # Check for required services
    local required_services=("loki" "promtail" "logrotate")
    for service in "${required_services[@]}"; do
        if grep -q "^  $service:" "$compose_file"; then
            log "✅ Found service: $service"
        else
            log "❌ Missing service: $service"
            return 1
        fi
    done
    
    return 0
}

# Test 3: Loki configuration
test_loki_configuration() {
    log "🔍 Testing Loki configuration..."
    
    local loki_config="$PROJECT_ROOT/infra/logging/loki/loki.yml"
    
    # Check for essential configuration sections
    local required_sections=(
        "auth_enabled"
        "server"
        "schema_config"
        "storage_config"
        "limits_config"
    )
    
    for section in "${required_sections[@]}"; do
        if grep -q "^$section:" "$loki_config"; then
            log "✅ Found section: $section"
        else
            log "❌ Missing section: $section"
            return 1
        fi
    done
    
    # Check retention policy
    if grep -q "retention_period:" "$loki_config"; then
        log "✅ Retention policy configured"
    else
        log "❌ Missing retention policy"
        return 1
    fi
    
    return 0
}

# Test 4: Promtail configuration
test_promtail_configuration() {
    log "🔍 Testing Promtail configuration..."
    
    local promtail_config="$PROJECT_ROOT/infra/logging/loki/promtail.yml"
    
    # Check for essential configuration sections
    local required_sections=(
        "server"
        "positions"
        "clients"
        "scrape_configs"
    )
    
    for section in "${required_sections[@]}"; do
        if grep -q "^$section:" "$promtail_config"; then
            log "✅ Found section: $section"
        else
            log "❌ Missing section: $section"
            return 1
        fi
    done
    
    # Check for job configurations
    local required_jobs=("backend" "frontend-admin" "frontend-member" "containers" "audit" "security")
    for job in "${required_jobs[@]}"; do
        if grep -q "job_name: $job" "$promtail_config"; then
            log "✅ Found job: $job"
        else
            log "❌ Missing job: $job"
            return 1
        fi
    done
    
    return 0
}

# Test 5: Alert rules configuration
test_alert_rules() {
    log "🔍 Testing Loki alert rules..."
    
    local alerts_config="$PROJECT_ROOT/infra/logging/loki/alerting-rules.yml"
    
    # Check for alert groups
    local required_groups=("pfm-log-alerts" "pfm-business-log-alerts")
    for group in "${required_groups[@]}"; do
        if grep -q "name: $group" "$alerts_config"; then
            log "✅ Found alert group: $group"
        else
            log "❌ Missing alert group: $group"
            return 1
        fi
    done
    
    # Check for essential alerts
    local required_alerts=(
        "HighErrorRate"
        "CriticalErrorBurst"
        "AuthenticationFailures"
        "SecurityIncident"
        "DatabaseConnectionErrors"
    )
    
    for alert in "${required_alerts[@]}"; do
        if grep -q "alert: $alert" "$alerts_config"; then
            log "✅ Found alert: $alert"
        else
            log "❌ Missing alert: $alert"
            return 1
        fi
    done
    
    return 0
}

# Test 6: Backend logger functionality
test_backend_logger() {
    log "🔍 Testing backend logger functionality..."
    
    local logger_file="$PROJECT_ROOT/backend/utils/logger.js"
    
    # Check for essential exports
    local required_exports=(
        "logger"
        "authLogger"
        "dbLogger"
        "blockchainLogger"
        "apiLogger"
        "securityLogger"
        "httpLogger"
        "logError"
        "logBusinessEvent"
    )
    
    for export in "${required_exports[@]}"; do
        if grep -q "$export" "$logger_file"; then
            log "✅ Found export: $export"
        else
            log "❌ Missing export: $export"
            return 1
        fi
    done
    
    # Check for sensitive data masking
    if grep -q "SENSITIVE_PATTERNS" "$logger_file"; then
        log "✅ Sensitive data masking implemented"
    else
        log "❌ Missing sensitive data masking"
        return 1
    fi
    
    # Check for log rotation
    if grep -q "maxsize" "$logger_file"; then
        log "✅ Log rotation configured"
    else
        log "❌ Missing log rotation"
        return 1
    fi
    
    return 0
}

# Test 7: Frontend logger functionality
test_frontend_logger() {
    log "🔍 Testing frontend logger functionality..."
    
    local logger_file="$PROJECT_ROOT/frontend/shared/utils/logger.ts"
    
    # Check for essential classes and exports
    local required_items=(
        "LogLevel"
        "LogEntry"
        "Logger"
        "ComponentLogger"
        "adminLogger"
        "memberLogger"
    )
    
    for item in "${required_items[@]}"; do
        if grep -q "$item" "$logger_file"; then
            log "✅ Found: $item"
        else
            log "❌ Missing: $item"
            return 1
        fi
    done
    
    # Check for log level methods
    local required_methods=("debug" "info" "warn" "error" "business" "performance" "security")
    for method in "${required_methods[@]}"; do
        if grep -q "public $method" "$logger_file"; then
            log "✅ Found method: $method"
        else
            log "❌ Missing method: $method"
            return 1
        fi
    done
    
    return 0
}

# Test 8: Log API endpoints
test_log_api_endpoints() {
    log "🔍 Testing log API endpoints..."
    
    local routes_file="$PROJECT_ROOT/backend/routes/logs.js"
    
    # Check for required endpoints
    local required_endpoints=(
        "router.post('/', logRateLimit"
        "router.get('/search'"
        "router.get('/stats'"
        "router.post('/retention'"
    )
    
    for endpoint in "${required_endpoints[@]}"; do
        if grep -q "$endpoint" "$routes_file"; then
            log "✅ Found endpoint: $(echo $endpoint | cut -d'(' -f1)"
        else
            log "❌ Missing endpoint: $(echo $endpoint | cut -d'(' -f1)"
            return 1
        fi
    done
    
    # Check for rate limiting
    if grep -q "logRateLimit" "$routes_file"; then
        log "✅ Rate limiting implemented"
    else
        log "❌ Missing rate limiting"
        return 1
    fi
    
    # Check for validation middleware
    if grep -q "validateLogEntry" "$routes_file"; then
        log "✅ Input validation implemented"
    else
        log "❌ Missing input validation"
        return 1
    fi
    
    return 0
}

# Test 9: Log rotation configuration
test_log_rotation() {
    log "🔍 Testing log rotation configuration..."
    
    local logrotate_config="$PROJECT_ROOT/infra/logging/logrotate/pfm-logs"
    
    # Check for different log types with appropriate retention
    local log_patterns=(
        "/var/log/pfm/\*.log"
        "/var/log/pfm/error.log"
        "/var/log/pfm/security.log"
        "/var/log/pfm/audit.log"
        "/var/log/pfm/performance.log"
    )
    
    for pattern in "${log_patterns[@]}"; do
        if grep -q "$pattern" "$logrotate_config"; then
            log "✅ Found rotation config for: $pattern"
        else
            log "❌ Missing rotation config for: $pattern"
            return 1
        fi
    done
    
    # Check for essential rotation parameters
    local rotation_params=("daily" "rotate" "compress" "dateext")
    for param in "${rotation_params[@]}"; do
        if grep -q "$param" "$logrotate_config"; then
            log "✅ Found rotation parameter: $param"
        else
            log "❌ Missing rotation parameter: $param"
            return 1
        fi
    done
    
    return 0
}

# Test 10: Security and compliance features
test_security_compliance() {
    log "🔍 Testing security and compliance features..."
    
    # Check for data masking in backend logger
    local logger_file="$PROJECT_ROOT/backend/utils/logger.js"
    local sensitive_patterns=("password" "token" "secret" "credit.*card" "social.*security")
    
    for pattern in "${sensitive_patterns[@]}"; do
        if grep -q "$pattern" "$logger_file"; then
            log "✅ Found masking for: $pattern"
        else
            log "❌ Missing masking for: $pattern"
            return 1
        fi
    done
    
    # Check for secure log permissions in rotation config
    local logrotate_config="$PROJECT_ROOT/infra/logging/logrotate/pfm-logs"
    if grep -q "create 600" "$logrotate_config"; then
        log "✅ Secure permissions for sensitive logs"
    else
        log "❌ Missing secure permissions"
        return 1
    fi
    
    # Check for audit log archiving
    if grep -q "archive" "$logrotate_config"; then
        log "✅ Audit log archiving configured"
    else
        log "❌ Missing audit log archiving"
        return 1
    fi
    
    return 0
}

# Test 11: Environment variable configuration
test_environment_variables() {
    log "🔍 Testing environment variable configuration..."
    
    # Check for environment variables in configurations
    local config_files=(
        "$PROJECT_ROOT/infra/logging/docker-compose.logging.yml"
        "$PROJECT_ROOT/infra/logging/loki/promtail.yml"
    )
    
    for config_file in "${config_files[@]}"; do
        if grep -q "\${ENVIRONMENT" "$config_file"; then
            log "✅ Environment variables used in: $(basename $config_file)"
        else
            log "❌ Missing environment variables in: $(basename $config_file)"
            return 1
        fi
    done
    
    return 0
}

# Test 12: Integration with monitoring system
test_monitoring_integration() {
    log "🔍 Testing integration with monitoring system..."
    
    local compose_file="$PROJECT_ROOT/infra/logging/docker-compose.logging.yml"
    
    # Check for monitoring network connection
    if grep -q "pfm_monitoring_network" "$compose_file"; then
        log "✅ Connected to monitoring network"
    else
        log "❌ Missing monitoring network connection"
        return 1
    fi
    
    # Check for alert manager integration in Loki
    local loki_config="$PROJECT_ROOT/infra/logging/loki/loki.yml"
    if grep -q "alertmanager_url" "$loki_config"; then
        log "✅ AlertManager integration configured"
    else
        log "❌ Missing AlertManager integration"
        return 1
    fi
    
    return 0
}

# Run all tests
main() {
    log "Starting logging infrastructure tests..."
    echo ""
    
    run_test "Logging Infrastructure Files" test_logging_files
    run_test "Docker Compose Configuration" test_docker_compose_config
    run_test "Loki Configuration" test_loki_configuration
    run_test "Promtail Configuration" test_promtail_configuration
    run_test "Alert Rules" test_alert_rules
    run_test "Backend Logger" test_backend_logger
    run_test "Frontend Logger" test_frontend_logger
    run_test "Log API Endpoints" test_log_api_endpoints
    run_test "Log Rotation" test_log_rotation
    run_test "Security & Compliance" test_security_compliance
    run_test "Environment Variables" test_environment_variables
    run_test "Monitoring Integration" test_monitoring_integration
    
    # Summary
    echo "========================================"
    log "📊 TEST SUMMARY"
    echo "========================================"
    log "Total Tests: $TOTAL_TESTS"
    log "Passed: $PASSED_TESTS"
    log "Failed: $FAILED_TESTS"
    log "Success Rate: $(( PASSED_TESTS * 100 / TOTAL_TESTS ))%"
    echo ""
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "${GREEN}✅ All logging infrastructure tests passed!${NC}"
        log "✅ All logging infrastructure tests passed!"
        return 0
    else
        echo -e "${RED}❌ Some tests failed. Check the log for details.${NC}"
        log "❌ Some tests failed"
        return 1
    fi
}

# Run the main function
main "$@" 