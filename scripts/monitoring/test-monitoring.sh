#!/bin/bash

# Monitoring System Integration Tests for PFM Community Management Application
# Task 6.4.1: Monitoring & Alerting for All Services

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

test_passed() {
    echo -e "${GREEN}✅ $1${NC}"
    ((TESTS_PASSED++))
}

test_failed() {
    echo -e "${RED}❌ $1${NC}"
    ((TESTS_FAILED++))
}

test_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# Test 1: Monitoring Infrastructure Files
test_monitoring_files() {
    log "Testing monitoring infrastructure files..."
    
    local required_files=(
        "infra/monitoring/prometheus/prometheus.yml"
        "infra/monitoring/prometheus/alerts/application.yml"
        "infra/monitoring/alertmanager/alertmanager.yml"
        "infra/monitoring/grafana/dashboards/pfm-overview.json"
        "infra/monitoring/docker-compose.monitoring.yml"
        "backend/middleware/monitoring.js"
    )
    
    for file in "${required_files[@]}"; do
        if [[ -f "$file" ]]; then
            test_passed "Found monitoring file: $file"
        else
            test_failed "Missing monitoring file: $file"
        fi
    done
}

# Test 2: Docker Compose Configuration Validation
test_docker_compose_monitoring() {
    log "Testing Docker Compose monitoring configuration..."
    
    local compose_file="infra/monitoring/docker-compose.monitoring.yml"
    
    if [[ -f "$compose_file" ]]; then
        if docker-compose -f "$compose_file" config &>/dev/null; then
            test_passed "Docker Compose monitoring configuration is valid"
        else
            test_failed "Docker Compose monitoring configuration validation failed"
        fi
        
        # Check for required services
        local required_services=("prometheus" "alertmanager" "grafana" "node-exporter")
        
        for service in "${required_services[@]}"; do
            if docker-compose -f "$compose_file" config --services | grep -q "$service"; then
                test_passed "Monitoring service defined: $service"
            else
                test_failed "Monitoring service missing: $service"
            fi
        done
    else
        test_failed "Docker Compose monitoring file not found"
    fi
}

# Test 3: Prometheus Configuration Validation
test_prometheus_config() {
    log "Testing Prometheus configuration..."
    
    local prometheus_config="infra/monitoring/prometheus/prometheus.yml"
    
    if [[ -f "$prometheus_config" ]]; then
        # Check for required scrape configs
        local required_jobs=("pfm-backend" "pfm-frontend-admin" "pfm-frontend-member" "postgres-exporter" "redis-exporter")
        
        for job in "${required_jobs[@]}"; do
            if grep -q "$job" "$prometheus_config"; then
                test_passed "Prometheus job configured: $job"
            else
                test_failed "Prometheus job missing: $job"
            fi
        done
        
        # Check for alerting configuration
        if grep -q "alertmanager" "$prometheus_config"; then
            test_passed "Prometheus alerting configuration found"
        else
            test_failed "Prometheus alerting configuration missing"
        fi
    else
        test_failed "Prometheus configuration file not found"
    fi
}

# Test 4: Alert Rules Validation
test_alert_rules() {
    log "Testing alert rules configuration..."
    
    local alerts_file="infra/monitoring/prometheus/alerts/application.yml"
    
    if [[ -f "$alerts_file" ]]; then
        # Check for required alert rules
        local required_alerts=("ServiceDown" "HighErrorRate" "PostgreSQLDown" "RedisDown" "SolanaRPCDown")
        
        for alert in "${required_alerts[@]}"; do
            if grep -q "$alert" "$alerts_file"; then
                test_passed "Alert rule configured: $alert"
            else
                test_failed "Alert rule missing: $alert"
            fi
        done
    else
        test_failed "Alert rules file not found"
    fi
}

# Test 5: AlertManager Configuration Validation
test_alertmanager_config() {
    log "Testing AlertManager configuration..."
    
    local alertmanager_config="infra/monitoring/alertmanager/alertmanager.yml"
    
    if [[ -f "$alertmanager_config" ]]; then
        # Check for required receivers
        local required_receivers=("critical-alerts" "security-alerts" "platform-alerts" "development-alerts")
        
        for receiver in "${required_receivers[@]}"; do
            if grep -q "$receiver" "$alertmanager_config"; then
                test_passed "AlertManager receiver configured: $receiver"
            else
                test_failed "AlertManager receiver missing: $receiver"
            fi
        done
        
        # Check for notification channels
        if grep -q "email_configs" "$alertmanager_config"; then
            test_passed "Email notification configured"
        else
            test_warning "Email notification not configured"
        fi
        
        if grep -q "slack_configs" "$alertmanager_config"; then
            test_passed "Slack notification configured"
        else
            test_warning "Slack notification not configured"
        fi
    else
        test_failed "AlertManager configuration file not found"
    fi
}

# Test 6: Backend Monitoring Middleware
test_backend_monitoring() {
    log "Testing backend monitoring middleware..."
    
    local monitoring_middleware="backend/middleware/monitoring.js"
    
    if [[ -f "$monitoring_middleware" ]]; then
        # Check for required metrics
        local required_metrics=("http_requests_total" "pfm_votes_total" "pfm_wallet_connections_total")
        
        for metric in "${required_metrics[@]}"; do
            if grep -q "$metric" "$monitoring_middleware"; then
                test_passed "Backend metric configured: $metric"
            else
                test_failed "Backend metric missing: $metric"
            fi
        done
        
        # Check for health check endpoint
        if grep -q "createHealthCheck" "$monitoring_middleware"; then
            test_passed "Health check endpoint configured"
        else
            test_failed "Health check endpoint missing"
        fi
        
        # Check for metrics endpoint
        if grep -q "metricsEndpoint" "$monitoring_middleware"; then
            test_passed "Metrics endpoint configured"
        else
            test_failed "Metrics endpoint missing"
        fi
    else
        test_failed "Backend monitoring middleware not found"
    fi
}

# Test 7: Grafana Dashboard Configuration
test_grafana_dashboards() {
    log "Testing Grafana dashboard configuration..."
    
    local dashboard_file="infra/monitoring/grafana/dashboards/pfm-overview.json"
    
    if [[ -f "$dashboard_file" ]]; then
        # Check if it's valid JSON
        if jq empty "$dashboard_file" &>/dev/null; then
            test_passed "Grafana dashboard JSON is valid"
        else
            test_failed "Grafana dashboard JSON is invalid"
        fi
        
        # Check for required panels
        local required_panels=("Service Status" "Request Rate" "Error Rate" "Database Connections" "Redis Memory Usage")
        
        for panel in "${required_panels[@]}"; do
            if grep -q "$panel" "$dashboard_file"; then
                test_passed "Dashboard panel configured: $panel"
            else
                test_failed "Dashboard panel missing: $panel"
            fi
        done
    else
        test_failed "Grafana dashboard file not found"
    fi
}

# Test 8: Service Health Checks
test_service_health_checks() {
    log "Testing service health check endpoints..."
    
    # Check if backend has health endpoint
    if grep -r "/health" backend/ &>/dev/null; then
        test_passed "Backend health endpoint configured"
    else
        test_warning "Backend health endpoint not found in code"
    fi
    
    # Check if frontend has health endpoint
    if grep -r "/health\|/api/health" frontend/ &>/dev/null; then
        test_passed "Frontend health endpoint configured"
    else
        test_warning "Frontend health endpoint not found in code"
    fi
}

# Test 9: Monitoring Network Configuration
test_monitoring_network() {
    log "Testing monitoring network configuration..."
    
    local compose_file="infra/monitoring/docker-compose.monitoring.yml"
    
    if [[ -f "$compose_file" ]]; then
        if grep -q "pfm_monitoring_network" "$compose_file"; then
            test_passed "Monitoring network configured"
        else
            test_failed "Monitoring network missing"
        fi
        
        # Check for external network reference
        if grep -q "external: true" "$compose_file"; then
            test_passed "External application network reference configured"
        else
            test_warning "External application network reference not found"
        fi
    fi
}

# Test 10: Environment Variable Configuration
test_environment_variables() {
    log "Testing environment variable configuration..."
    
    # Check for monitoring environment variables in config files
    local config_files=(
        "infra/config/staging.env"
        "infra/config/production.env"
    )
    
    for config_file in "${config_files[@]}"; do
        if [[ -f "$config_file" ]]; then
            if grep -q "GRAFANA\|PROMETHEUS\|SLACK_WEBHOOK" "$config_file"; then
                test_passed "Monitoring environment variables configured in $config_file"
            else
                test_warning "Monitoring environment variables not found in $config_file"
            fi
        fi
    done
}

# Test 11: Business Metrics Implementation
test_business_metrics() {
    log "Testing business metrics implementation..."
    
    local monitoring_file="backend/middleware/monitoring.js"
    
    if [[ -f "$monitoring_file" ]]; then
        # Check for PFM-specific metrics
        local business_metrics=("pfm_votes_total" "pfm_wallet_connections" "pfm_communities")
        
        for metric in "${business_metrics[@]}"; do
            if grep -q "$metric" "$monitoring_file"; then
                test_passed "Business metric implemented: $metric"
            else
                test_warning "Business metric not implemented: $metric"
            fi
        done
    fi
}

# Test 12: Security Monitoring
test_security_monitoring() {
    log "Testing security monitoring configuration..."
    
    local alerts_file="infra/monitoring/prometheus/alerts/application.yml"
    
    if [[ -f "$alerts_file" ]]; then
        # Check for security-related alerts
        local security_alerts=("TooManyFailedLogins" "SuspiciousAPIActivity" "UnauthorizedAccess")
        
        for alert in "${security_alerts[@]}"; do
            if grep -q "$alert" "$alerts_file"; then
                test_passed "Security alert configured: $alert"
            else
                test_warning "Security alert not configured: $alert"
            fi
        done
    fi
}

# Main test runner
run_monitoring_integration_tests() {
    log "🚀 Starting Monitoring System Integration Test Suite"
    
    # Run all tests
    test_monitoring_files
    test_docker_compose_monitoring
    test_prometheus_config
    test_alert_rules
    test_alertmanager_config
    test_backend_monitoring
    test_grafana_dashboards
    test_service_health_checks
    test_monitoring_network
    test_environment_variables
    test_business_metrics
    test_security_monitoring
    
    log "=== Monitoring Integration Test Results ==="
    log "Passed: $TESTS_PASSED/$((TESTS_PASSED + TESTS_FAILED)) tests"
    
    if [[ $TESTS_FAILED -eq 0 ]]; then
        log "🎉 All monitoring integration tests passed!"
        return 0
    else
        log "❌ Some monitoring integration tests failed"
        return 1
    fi
}

# Execute tests if script is run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    log "Starting Monitoring Integration Tests - Task 6.4.1"
    run_monitoring_integration_tests
    log "✅ Monitoring Integration Tests: $([ $? -eq 0 ] && echo 'PASSED' || echo 'FAILED')"
fi 