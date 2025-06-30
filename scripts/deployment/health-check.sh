#!/bin/bash

# Deployment Health Check Script
# Task 6.2.2: CD Pipeline Structure & Deployment Automation

set -e

echo "=== Deployment Health Check ==="

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
HEALTH_LOG_FILE="$PROJECT_ROOT/deployment-health-check.log"

# Default configuration
ENVIRONMENT=${ENVIRONMENT:-staging}
BACKEND_URL=${BACKEND_URL:-http://localhost:3000}
ADMIN_URL=${ADMIN_URL:-http://localhost:3001}
MEMBER_URL=${MEMBER_URL:-http://localhost:3002}
TIMEOUT=${TIMEOUT:-30}
MAX_RETRIES=${MAX_RETRIES:-5}

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$HEALTH_LOG_FILE"
}

# Health check function
check_endpoint() {
    local url=$1
    local service_name=$2
    local retries=0
    
    log "🔍 Checking $service_name at $url"
    
    while [ $retries -lt $MAX_RETRIES ]; do
        if curl -f -s --max-time $TIMEOUT "$url" > /dev/null 2>&1; then
            log "✅ $service_name is healthy"
            return 0
        else
            retries=$((retries + 1))
            log "⚠️ $service_name check failed (attempt $retries/$MAX_RETRIES)"
            sleep 5
        fi
    done
    
    log "❌ $service_name health check failed after $MAX_RETRIES attempts"
    return 1
}

# Comprehensive health check
run_comprehensive_health_check() {
    log "🚀 Starting comprehensive health check for $ENVIRONMENT environment"
    log "Configuration: Backend=$BACKEND_URL, Admin=$ADMIN_URL, Member=$MEMBER_URL"
    
    local checks_passed=0
    local total_checks=0
    
    # Core service checks
    local services=(
        "$BACKEND_URL/health:Backend API"
        "$ADMIN_URL:Admin Portal"
        "$MEMBER_URL:Member Portal"
    )
    
    for service in "${services[@]}"; do
        IFS=':' read -r url name <<< "$service"
        ((total_checks++))
        if check_endpoint "$url" "$name"; then
            ((checks_passed++))
        fi
    done
    
    # Calculate success rate
    local success_rate=$((checks_passed * 100 / total_checks))
    
    log "=== Health Check Results ==="
    log "Passed: $checks_passed/$total_checks checks"
    log "Success rate: $success_rate%"
    
    if [ $success_rate -ge 80 ]; then
        log "✅ Overall health status: HEALTHY"
        return 0
    else
        log "❌ Overall health status: UNHEALTHY"
        return 1
    fi
}

# Main execution
main() {
    log "Starting deployment health check - Task 6.2.2"
    log "Environment: $ENVIRONMENT"
    
    if run_comprehensive_health_check; then
        log "🎉 Deployment health check: PASSED"
        exit 0
    else
        log "❌ Deployment health check: FAILED"
        exit 1
    fi
}

main "$@"
