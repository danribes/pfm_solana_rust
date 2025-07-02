#!/bin/bash
# SSL Certificate Monitoring Script for PFM Community Management
# Task 6.6.3: SSL/TLS Certificate Management & Security

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SSL_CONFIG_DIR="$PROJECT_ROOT/infra/ssl/config"
LOG_FILE="/var/log/ssl-monitoring.log"
METRICS_FILE="/var/lib/ssl-metrics/monitoring.json"

# Default configuration
DOMAINS="${DOMAINS:-pfm-community.app,api.pfm-community.app,admin.pfm-community.app,member.pfm-community.app}"
WARNING_DAYS="${WARNING_DAYS:-14}"
CRITICAL_DAYS="${CRITICAL_DAYS:-7}"
NOTIFICATION_EMAIL="${NOTIFICATION_EMAIL:-admin@pfm-community.app}"
WEBHOOK_URL="${WEBHOOK_URL:-}"
CHECK_ONLINE="${CHECK_ONLINE:-true}"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Error handling
error() {
    log "ERROR: $1"
    send_notification "SSL Monitoring Error" "$1" "critical"
}

# Warning handling
warning() {
    log "WARNING: $1"
    send_notification "SSL Monitoring Warning" "$1" "warning"
}

# Send notification function
send_notification() {
    local subject="$1"
    local message="$2"
    local severity="${3:-info}"
    
    # Create notification payload
    local payload=$(cat <<EOF
{
    "timestamp": "$(date -Iseconds)",
    "hostname": "$HOSTNAME",
    "service": "ssl-monitoring",
    "severity": "$severity",
    "subject": "$subject",
    "message": "$message",
    "check_type": "certificate_monitoring"
}
EOF
)
    
    # Email notification
    if command -v mail >/dev/null 2>&1 && [[ -n "$NOTIFICATION_EMAIL" ]]; then
        echo "$message" | mail -s "[$HOSTNAME] $subject" "$NOTIFICATION_EMAIL"
    fi
    
    # Webhook notification
    if [[ -n "$WEBHOOK_URL" ]]; then
        curl -s -X POST "$WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "$payload" \
            --max-time 30 || log "Failed to send webhook notification"
    fi
    
    # Syslog notification
    logger -t ssl-monitoring "$severity: $subject - $message"
}

# Initialize metrics
init_metrics() {
    mkdir -p "$(dirname "$METRICS_FILE")"
    cat > "$METRICS_FILE" <<EOF
{
    "last_check": "$(date -Iseconds)",
    "total_domains": 0,
    "healthy_certificates": 0,
    "warning_certificates": 0,
    "critical_certificates": 0,
    "failed_checks": 0,
    "domains": {}
}
EOF
}

# Update metrics
update_metrics() {
    local key="$1"
    local value="$2"
    
    if command -v jq >/dev/null 2>&1; then
        local temp_file=$(mktemp)
        jq ".$key = $value" "$METRICS_FILE" > "$temp_file" && mv "$temp_file" "$METRICS_FILE"
    fi
}

# Check local certificate file
check_local_certificate() {
    local domain="$1"
    local cert_file="/etc/letsencrypt/live/$domain/fullchain.pem"
    
    if [[ ! -f "$cert_file" ]]; then
        log "Local certificate file not found for $domain"
        return 1
    fi
    
    # Check if certificate is valid
    if ! openssl x509 -in "$cert_file" -text -noout >/dev/null 2>&1; then
        error "Invalid certificate format for $domain"
        return 1
    fi
    
    # Get certificate expiry
    local expiry_date=$(openssl x509 -enddate -noout -in "$cert_file" | cut -d= -f2)
    local expiry_epoch=$(date -d "$expiry_date" +%s)
    local current_epoch=$(date +%s)
    local days_until_expiry=$(( (expiry_epoch - current_epoch) / 86400 ))
    
    # Get certificate subject and issuer
    local subject=$(openssl x509 -subject -noout -in "$cert_file" | sed 's/subject=//')
    local issuer=$(openssl x509 -issuer -noout -in "$cert_file" | sed 's/issuer=//')
    
    # Update metrics
    if command -v jq >/dev/null 2>&1; then
        local temp_file=$(mktemp)
        jq ".domains[\"$domain\"].local = {
            \"expiry_date\": \"$expiry_date\",
            \"days_until_expiry\": $days_until_expiry,
            \"subject\": \"$subject\",
            \"issuer\": \"$issuer\",
            \"status\": \"valid\"
        }" "$METRICS_FILE" > "$temp_file" && mv "$temp_file" "$METRICS_FILE"
    fi
    
    log "Local certificate for $domain expires in $days_until_expiry days"
    
    # Check expiry thresholds
    if [[ $days_until_expiry -le $CRITICAL_DAYS ]]; then
        error "Certificate for $domain expires in $days_until_expiry days (CRITICAL)"
        update_metrics "critical_certificates" "$(($(jq -r '.critical_certificates // 0' "$METRICS_FILE") + 1))"
        return 2
    elif [[ $days_until_expiry -le $WARNING_DAYS ]]; then
        warning "Certificate for $domain expires in $days_until_expiry days (WARNING)"
        update_metrics "warning_certificates" "$(($(jq -r '.warning_certificates // 0' "$METRICS_FILE") + 1))"
        return 1
    else
        update_metrics "healthy_certificates" "$(($(jq -r '.healthy_certificates // 0' "$METRICS_FILE") + 1))"
        return 0
    fi
}

# Check online certificate
check_online_certificate() {
    local domain="$1"
    local port="${2:-443}"
    
    if [[ "$CHECK_ONLINE" != "true" ]]; then
        return 0
    fi
    
    log "Checking online certificate for $domain:$port"
    
    # Get certificate information using openssl
    local cert_info
    if ! cert_info=$(echo | timeout 10 openssl s_client -servername "$domain" -connect "$domain:$port" 2>/dev/null | openssl x509 -text -noout 2>/dev/null); then
        error "Failed to retrieve online certificate for $domain"
        update_metrics "failed_checks" "$(($(jq -r '.failed_checks // 0' "$METRICS_FILE") + 1))"
        return 1
    fi
    
    # Extract certificate details
    local expiry_date=$(echo "$cert_info" | grep "Not After" | sed 's/.*Not After : //')
    local expiry_epoch=$(date -d "$expiry_date" +%s)
    local current_epoch=$(date +%s)
    local days_until_expiry=$(( (expiry_epoch - current_epoch) / 86400 ))
    
    local subject=$(echo "$cert_info" | grep "Subject:" | head -1 | sed 's/.*Subject: //')
    local issuer=$(echo "$cert_info" | grep "Issuer:" | head -1 | sed 's/.*Issuer: //')
    
    # Check certificate chain
    local chain_valid="unknown"
    if echo | timeout 10 openssl s_client -servername "$domain" -connect "$domain:$port" -verify_return_error >/dev/null 2>&1; then
        chain_valid="true"
    else
        chain_valid="false"
        warning "Certificate chain validation failed for $domain"
    fi
    
    # Check OCSP stapling
    local ocsp_status="unknown"
    if echo | timeout 10 openssl s_client -servername "$domain" -connect "$domain:$port" -status 2>/dev/null | grep -q "OCSP Response Status: successful"; then
        ocsp_status="successful"
    else
        ocsp_status="failed"
    fi
    
    # Update metrics
    if command -v jq >/dev/null 2>&1; then
        local temp_file=$(mktemp)
        jq ".domains[\"$domain\"].online = {
            \"expiry_date\": \"$expiry_date\",
            \"days_until_expiry\": $days_until_expiry,
            \"subject\": \"$subject\",
            \"issuer\": \"$issuer\",
            \"chain_valid\": \"$chain_valid\",
            \"ocsp_status\": \"$ocsp_status\",
            \"status\": \"valid\"
        }" "$METRICS_FILE" > "$temp_file" && mv "$temp_file" "$METRICS_FILE"
    fi
    
    log "Online certificate for $domain expires in $days_until_expiry days, chain valid: $chain_valid, OCSP: $ocsp_status"
    
    return 0
}

# Check SSL configuration
check_ssl_configuration() {
    local domain="$1"
    
    if [[ "$CHECK_ONLINE" != "true" ]]; then
        return 0
    fi
    
    log "Checking SSL configuration for $domain"
    
    # Check TLS versions
    local tls12_support="false"
    local tls13_support="false"
    local sslv3_support="false"
    
    if echo | timeout 10 openssl s_client -servername "$domain" -connect "$domain:443" -tls1_2 >/dev/null 2>&1; then
        tls12_support="true"
    fi
    
    if echo | timeout 10 openssl s_client -servername "$domain" -connect "$domain:443" -tls1_3 >/dev/null 2>&1; then
        tls13_support="true"
    fi
    
    if echo | timeout 10 openssl s_client -servername "$domain" -connect "$domain:443" -ssl3 >/dev/null 2>&1; then
        sslv3_support="true"
        warning "SSL 3.0 is supported on $domain (security risk)"
    fi
    
    # Check cipher suites
    local cipher_info
    cipher_info=$(echo | timeout 10 openssl s_client -servername "$domain" -connect "$domain:443" -cipher 'ALL' 2>/dev/null | grep "Cipher" | head -1)
    
    # Check HSTS header
    local hsts_status="false"
    if curl -s -I "https://$domain" --max-time 10 | grep -i "strict-transport-security" >/dev/null; then
        hsts_status="true"
    else
        warning "HSTS header not found for $domain"
    fi
    
    # Update metrics
    if command -v jq >/dev/null 2>&1; then
        local temp_file=$(mktemp)
        jq ".domains[\"$domain\"].ssl_config = {
            \"tls12_support\": \"$tls12_support\",
            \"tls13_support\": \"$tls13_support\",
            \"sslv3_support\": \"$sslv3_support\",
            \"hsts_enabled\": \"$hsts_status\",
            \"cipher_info\": \"$cipher_info\"
        }" "$METRICS_FILE" > "$temp_file" && mv "$temp_file" "$METRICS_FILE"
    fi
    
    log "SSL configuration for $domain - TLS 1.2: $tls12_support, TLS 1.3: $tls13_support, HSTS: $hsts_status"
    
    return 0
}

# Perform SSL Labs test
ssl_labs_test() {
    local domain="$1"
    
    if [[ "$CHECK_ONLINE" != "true" ]] || ! command -v curl >/dev/null 2>&1; then
        return 0
    fi
    
    log "Initiating SSL Labs test for $domain (this may take a while)..."
    
    # Start SSL Labs analysis
    local api_url="https://api.ssllabs.com/api/v3/analyze"
    local start_response
    start_response=$(curl -s "$api_url?host=$domain&startNew=on" || echo '{}')
    
    # Wait for analysis to complete (simplified check)
    local status="IN_PROGRESS"
    local attempts=0
    local max_attempts=10
    
    while [[ "$status" == "IN_PROGRESS" && $attempts -lt $max_attempts ]]; do
        sleep 30
        local check_response
        check_response=$(curl -s "$api_url?host=$domain" || echo '{}')
        status=$(echo "$check_response" | jq -r '.status // "ERROR"')
        ((attempts++))
    done
    
    if [[ "$status" == "READY" ]]; then
        local grade=$(echo "$check_response" | jq -r '.endpoints[0].grade // "Unknown"')
        log "SSL Labs grade for $domain: $grade"
        
        # Update metrics
        if command -v jq >/dev/null 2>&1; then
            local temp_file=$(mktemp)
            jq ".domains[\"$domain\"].ssl_labs = {
                \"grade\": \"$grade\",
                \"last_test\": \"$(date -Iseconds)\"
            }" "$METRICS_FILE" > "$temp_file" && mv "$temp_file" "$METRICS_FILE"
        fi
    else
        log "SSL Labs test for $domain did not complete (status: $status)"
    fi
    
    return 0
}

# Generate monitoring report
generate_report() {
    log "Generating monitoring report..."
    
    local report_file="/tmp/ssl-monitoring-report-$(date +%Y%m%d_%H%M%S).json"
    
    if command -v jq >/dev/null 2>&1; then
        # Add summary to metrics
        local temp_file=$(mktemp)
        jq ". + {
            \"summary\": {
                \"total_domains\": .total_domains,
                \"healthy\": .healthy_certificates,
                \"warnings\": .warning_certificates,
                \"critical\": .critical_certificates,
                \"failed\": .failed_checks,
                \"success_rate\": ((.healthy_certificates / .total_domains * 100) | floor)
            }
        }" "$METRICS_FILE" > "$temp_file" && mv "$temp_file" "$METRICS_FILE"
        
        cp "$METRICS_FILE" "$report_file"
        log "Monitoring report generated: $report_file"
        
        # Send report via webhook
        if [[ -n "$WEBHOOK_URL" ]]; then
            curl -s -X POST "$WEBHOOK_URL/monitoring-report" \
                -H "Content-Type: application/json" \
                -d @"$report_file" \
                --max-time 30 || log "Failed to send monitoring report"
        fi
    fi
}

# Main monitoring function
main() {
    log "Starting SSL certificate monitoring..."
    
    init_metrics
    
    # Parse domains
    IFS=',' read -ra DOMAIN_ARRAY <<< "$DOMAINS"
    local total_domains=${#DOMAIN_ARRAY[@]}
    
    update_metrics "total_domains" "$total_domains"
    
    local critical_count=0
    local warning_count=0
    local healthy_count=0
    local failed_count=0
    
    # Check each domain
    for domain in "${DOMAIN_ARRAY[@]}"; do
        domain=$(echo "$domain" | xargs) # Trim whitespace
        log "Monitoring domain: $domain"
        
        # Initialize domain in metrics
        if command -v jq >/dev/null 2>&1; then
            local temp_file=$(mktemp)
            jq ".domains[\"$domain\"] = {}" "$METRICS_FILE" > "$temp_file" && mv "$temp_file" "$METRICS_FILE"
        fi
        
        # Check local certificate
        local local_status=0
        if check_local_certificate "$domain"; then
            local_status=$?
        else
            local_status=$?
        fi
        
        # Check online certificate
        check_online_certificate "$domain"
        
        # Check SSL configuration
        check_ssl_configuration "$domain"
        
        # Count status
        case $local_status in
            0) ((healthy_count++)) ;;
            1) ((warning_count++)) ;;
            2) ((critical_count++)) ;;
            *) ((failed_count++)) ;;
        esac
    done
    
    # Update final metrics
    update_metrics "healthy_certificates" "$healthy_count"
    update_metrics "warning_certificates" "$warning_count"
    update_metrics "critical_certificates" "$critical_count"
    update_metrics "failed_checks" "$failed_count"
    
    # Generate report
    generate_report
    
    # Send summary notification
    local summary="SSL Monitoring Summary: $healthy_count healthy, $warning_count warnings, $critical_count critical, $failed_count failed"
    
    if [[ $critical_count -gt 0 ]]; then
        send_notification "SSL Monitoring Alert" "$summary - CRITICAL certificates found!" "critical"
    elif [[ $warning_count -gt 0 ]]; then
        send_notification "SSL Monitoring Warning" "$summary" "warning"
    else
        log "$summary - All certificates healthy"
    fi
    
    log "SSL certificate monitoring completed"
}

# Handle script arguments
case "${1:-check}" in
    "check"|"monitor")
        main
        ;;
    "report")
        generate_report
        ;;
    "test-notifications")
        send_notification "SSL Monitoring Test" "This is a test notification from SSL monitoring" "info"
        ;;
    *)
        echo "Usage: $0 [check|monitor|report|test-notifications]"
        echo "  check/monitor: Run certificate monitoring (default)"
        echo "  report:        Generate monitoring report"
        echo "  test-notifications: Test notification system"
        exit 1
        ;;
esac 