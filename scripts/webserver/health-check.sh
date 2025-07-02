#!/bin/bash

# Task 6.6.2: Web Server Health Check Script
# Comprehensive health monitoring for production web server

set -euo pipefail

# Configuration
TIMEOUT=10
MAX_RETRIES=3
CHECK_INTERVAL=5
ENDPOINTS=(
    "http://localhost/health"
    "http://localhost/nginx_status"
    "https://localhost/health"
)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Exit codes
EXIT_OK=0
EXIT_WARNING=1
EXIT_CRITICAL=2
EXIT_UNKNOWN=3

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Nginx process is running
check_nginx_process() {
    local status="OK"
    local message=""
    
    if pgrep nginx > /dev/null; then
        local process_count=$(pgrep nginx | wc -l)
        message="Nginx is running ($process_count processes)"
        log_success "$message"
    else
        status="CRITICAL"
        message="Nginx process not found"
        log_error "$message"
    fi
    
    echo "$status|$message"
}

# Check Nginx service status
check_nginx_service() {
    local status="OK"
    local message=""
    
    if systemctl is-active --quiet nginx; then
        local service_status=$(systemctl is-active nginx)
        message="Nginx service is $service_status"
        log_success "$message"
    else
        status="CRITICAL"
        message="Nginx service is not active"
        log_error "$message"
    fi
    
    echo "$status|$message"
}

# Check configuration validity
check_nginx_config() {
    local status="OK"
    local message=""
    
    if nginx -t &>/dev/null; then
        message="Nginx configuration is valid"
        log_success "$message"
    else
        status="CRITICAL"
        message="Nginx configuration is invalid"
        log_error "$message"
    fi
    
    echo "$status|$message"
}

# Check HTTP endpoint
check_http_endpoint() {
    local url="$1"
    local expected_code="${2:-200}"
    local status="OK"
    local message=""
    
    local response_code
    local response_time
    
    if response_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "$url" 2>/dev/null); then
        response_time=$(curl -s -o /dev/null -w "%{time_total}" --max-time "$TIMEOUT" "$url" 2>/dev/null)
        
        if [[ "$response_code" == "$expected_code" ]]; then
            message="$url responded with $response_code (${response_time}s)"
            log_success "$message"
        else
            status="WARNING"
            message="$url responded with $response_code (expected $expected_code)"
            log_warning "$message"
        fi
    else
        status="CRITICAL"
        message="$url is unreachable"
        log_error "$message"
    fi
    
    echo "$status|$message"
}

# Check SSL certificate
check_ssl_certificate() {
    local domain="$1"
    local port="${2:-443}"
    local status="OK"
    local message=""
    
    if command -v openssl &> /dev/null; then
        local cert_info
        if cert_info=$(echo | openssl s_client -connect "$domain:$port" -servername "$domain" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null); then
            local not_after=$(echo "$cert_info" | grep "notAfter" | cut -d= -f2)
            local expiry_date=$(date -d "$not_after" +%s)
            local current_date=$(date +%s)
            local days_until_expiry=$(( (expiry_date - current_date) / 86400 ))
            
            if [[ $days_until_expiry -gt 30 ]]; then
                message="SSL certificate for $domain expires in $days_until_expiry days"
                log_success "$message"
            elif [[ $days_until_expiry -gt 7 ]]; then
                status="WARNING"
                message="SSL certificate for $domain expires in $days_until_expiry days"
                log_warning "$message"
            else
                status="CRITICAL"
                message="SSL certificate for $domain expires in $days_until_expiry days"
                log_error "$message"
            fi
        else
            status="WARNING"
            message="Could not retrieve SSL certificate information for $domain"
            log_warning "$message"
        fi
    else
        status="UNKNOWN"
        message="OpenSSL not available to check certificates"
        log_warning "$message"
    fi
    
    echo "$status|$message"
}

# Check memory usage
check_memory_usage() {
    local status="OK"
    local message=""
    local warning_threshold=80
    local critical_threshold=90
    
    if command -v ps &> /dev/null; then
        local nginx_memory=$(ps -o pid,vsz,rss,comm -C nginx 2>/dev/null | awk 'NR>1 {rss+=$3} END {printf "%.1f", rss/1024}')
        local total_memory=$(free -m | awk '/^Mem:/ {print $2}')
        local memory_percent=$(echo "$nginx_memory $total_memory" | awk '{printf "%.1f", ($1/$2)*100}')
        
        if (( $(echo "$memory_percent > $critical_threshold" | bc -l) )); then
            status="CRITICAL"
            message="Nginx memory usage: ${nginx_memory}MB (${memory_percent}% of total)"
            log_error "$message"
        elif (( $(echo "$memory_percent > $warning_threshold" | bc -l) )); then
            status="WARNING"
            message="Nginx memory usage: ${nginx_memory}MB (${memory_percent}% of total)"
            log_warning "$message"
        else
            message="Nginx memory usage: ${nginx_memory}MB (${memory_percent}% of total)"
            log_success "$message"
        fi
    else
        status="UNKNOWN"
        message="Cannot check memory usage (ps command not available)"
        log_warning "$message"
    fi
    
    echo "$status|$message"
}

# Check active connections
check_connections() {
    local status="OK"
    local message=""
    local warning_threshold=1000
    local critical_threshold=2000
    
    if curl -s http://localhost/nginx_status &>/dev/null; then
        local connections=$(curl -s http://localhost/nginx_status | grep "Active connections" | awk '{print $3}')
        
        if [[ $connections -gt $critical_threshold ]]; then
            status="CRITICAL"
            message="Active connections: $connections (exceeds critical threshold: $critical_threshold)"
            log_error "$message"
        elif [[ $connections -gt $warning_threshold ]]; then
            status="WARNING"
            message="Active connections: $connections (exceeds warning threshold: $warning_threshold)"
            log_warning "$message"
        else
            message="Active connections: $connections"
            log_success "$message"
        fi
    else
        status="WARNING"
        message="Cannot retrieve connection statistics"
        log_warning "$message"
    fi
    
    echo "$status|$message"
}

# Check disk space
check_disk_space() {
    local status="OK"
    local message=""
    local warning_threshold=80
    local critical_threshold=90
    
    local log_dir="/var/log/nginx"
    local cache_dir="/var/cache/nginx"
    
    for dir in "$log_dir" "$cache_dir"; do
        if [[ -d "$dir" ]]; then
            local usage=$(df "$dir" | awk 'NR==2 {print $5}' | sed 's/%//')
            
            if [[ $usage -gt $critical_threshold ]]; then
                status="CRITICAL"
                message="Disk usage for $dir: ${usage}% (critical)"
                log_error "$message"
                break
            elif [[ $usage -gt $warning_threshold ]]; then
                status="WARNING"
                message="Disk usage for $dir: ${usage}% (warning)"
                log_warning "$message"
            fi
        fi
    done
    
    if [[ "$status" == "OK" ]]; then
        message="Disk space usage is normal"
        log_success "$message"
    fi
    
    echo "$status|$message"
}

# Check error logs
check_error_logs() {
    local status="OK"
    local message=""
    local error_log="/var/log/nginx/error.log"
    local critical_keywords=("emerg" "alert" "crit")
    local warning_keywords=("error" "warn")
    
    if [[ -f "$error_log" ]]; then
        # Check for critical errors in the last 5 minutes
        local recent_errors=$(find "$error_log" -mmin -5 -exec tail -n 100 {} \; 2>/dev/null || echo "")
        
        for keyword in "${critical_keywords[@]}"; do
            if echo "$recent_errors" | grep -qi "$keyword"; then
                status="CRITICAL"
                message="Critical errors found in nginx error log"
                log_error "$message"
                return
            fi
        done
        
        for keyword in "${warning_keywords[@]}"; do
            if echo "$recent_errors" | grep -qi "$keyword"; then
                status="WARNING"
                message="Warning errors found in nginx error log"
                log_warning "$message"
                return
            fi
        done
        
        message="No recent errors in nginx log"
        log_success "$message"
    else
        status="WARNING"
        message="Nginx error log not found"
        log_warning "$message"
    fi
    
    echo "$status|$message"
}

# Generate health report
generate_report() {
    local checks=(
        "Process:$(check_nginx_process)"
        "Service:$(check_nginx_service)"
        "Config:$(check_nginx_config)"
        "Memory:$(check_memory_usage)"
        "Connections:$(check_connections)"
        "Disk:$(check_disk_space)"
        "ErrorLogs:$(check_error_logs)"
    )
    
    # Check HTTP endpoints
    for endpoint in "${ENDPOINTS[@]}"; do
        checks+=("Endpoint($endpoint):$(check_http_endpoint "$endpoint")")
    done
    
    # Check SSL certificates
    if [[ -f "/etc/letsencrypt/live/pfm-community.app/fullchain.pem" ]]; then
        checks+=("SSL(pfm-community.app):$(check_ssl_certificate "localhost")")
    fi
    
    local overall_status="OK"
    local critical_count=0
    local warning_count=0
    
    echo "=========================================="
    echo "Nginx Health Check Report"
    echo "Timestamp: $(date)"
    echo "=========================================="
    
    for check in "${checks[@]}"; do
        local check_name=$(echo "$check" | cut -d: -f1)
        local check_status=$(echo "$check" | cut -d: -f2 | cut -d'|' -f1)
        local check_message=$(echo "$check" | cut -d'|' -f2)
        
        printf "%-20s: %-8s %s\n" "$check_name" "$check_status" "$check_message"
        
        case "$check_status" in
            "CRITICAL")
                ((critical_count++))
                overall_status="CRITICAL"
                ;;
            "WARNING")
                ((warning_count++))
                if [[ "$overall_status" != "CRITICAL" ]]; then
                    overall_status="WARNING"
                fi
                ;;
        esac
    done
    
    echo "=========================================="
    echo "Overall Status: $overall_status"
    echo "Warnings: $warning_count, Critical: $critical_count"
    echo "=========================================="
    
    # Return appropriate exit code
    case "$overall_status" in
        "OK") exit $EXIT_OK ;;
        "WARNING") exit $EXIT_WARNING ;;
        "CRITICAL") exit $EXIT_CRITICAL ;;
        *) exit $EXIT_UNKNOWN ;;
    esac
}

# Main function
main() {
    local operation="${1:-report}"
    
    case "$operation" in
        "report")
            generate_report
            ;;
        "process")
            check_nginx_process
            ;;
        "service")
            check_nginx_service
            ;;
        "config")
            check_nginx_config
            ;;
        "endpoint")
            if [[ -n "${2:-}" ]]; then
                check_http_endpoint "$2" "${3:-200}"
            else
                echo "Usage: $0 endpoint <url> [expected_code]"
                exit 1
            fi
            ;;
        "ssl")
            if [[ -n "${2:-}" ]]; then
                check_ssl_certificate "$2" "${3:-443}"
            else
                echo "Usage: $0 ssl <domain> [port]"
                exit 1
            fi
            ;;
        *)
            echo "Usage: $0 {report|process|service|config|endpoint|ssl}"
            echo ""
            echo "Commands:"
            echo "  report              - Generate complete health report"
            echo "  process             - Check if Nginx process is running"
            echo "  service             - Check Nginx service status"
            echo "  config              - Test Nginx configuration"
            echo "  endpoint <url>      - Check specific HTTP endpoint"
            echo "  ssl <domain>        - Check SSL certificate"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
