#!/bin/bash
# SSL Validation and Testing Script for PFM Community Management
# Task 6.6.3: SSL/TLS Certificate Management & Security

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LOG_FILE="/var/log/ssl-validation.log"

# Default configuration
DOMAINS="${DOMAINS:-pfm-community.app,api.pfm-community.app,admin.pfm-community.app,member.pfm-community.app}"
TEST_TIMEOUT="${TEST_TIMEOUT:-10}"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Test SSL certificate for domain
test_ssl_certificate() {
    local domain="$1"
    local port="${2:-443}"
    local test_passed=true
    
    log "Testing SSL certificate for $domain:$port"
    
    # Test certificate validity
    if ! echo | timeout "$TEST_TIMEOUT" openssl s_client -servername "$domain" -connect "$domain:$port" -verify_return_error >/dev/null 2>&1; then
        log "FAIL: Certificate validation failed for $domain"
        test_passed=false
    else
        log "PASS: Certificate validation successful for $domain"
    fi
    
    # Test HSTS header
    if curl -s -I "https://$domain" --max-time "$TEST_TIMEOUT" | grep -i "strict-transport-security" >/dev/null; then
        log "PASS: HSTS header present for $domain"
    else
        log "FAIL: HSTS header missing for $domain"
        test_passed=false
    fi
    
    if [[ "$test_passed" == "true" ]]; then
        log "OVERALL: SSL configuration for $domain PASSED"
        return 0
    else
        log "OVERALL: SSL configuration for $domain FAILED"
        return 1
    fi
}

# Main validation function
main() {
    log "Starting SSL validation..."
    
    local overall_result=true
    local total_domains=0
    local passed_domains=0
    
    IFS=',' read -ra DOMAIN_ARRAY <<< "$DOMAINS"
    
    for domain in "${DOMAIN_ARRAY[@]}"; do
        domain=$(echo "$domain" | xargs)
        ((total_domains++))
        
        if test_ssl_certificate "$domain"; then
            ((passed_domains++))
        else
            overall_result=false
        fi
    done
    
    log "=== VALIDATION SUMMARY ==="
    log "Total domains tested: $total_domains"
    log "Domains passed: $passed_domains"
    log "Success rate: $(( passed_domains * 100 / total_domains ))%"
    
    if [[ "$overall_result" == "true" ]]; then
        log "OVERALL RESULT: ALL SSL CONFIGURATIONS PASSED"
        exit 0
    else
        log "OVERALL RESULT: SOME SSL CONFIGURATIONS FAILED"
        exit 1
    fi
}

case "${1:-validate}" in
    "validate"|"test")
        main
        ;;
    *)
        echo "Usage: $0 [validate|test]"
        exit 1
        ;;
esac
