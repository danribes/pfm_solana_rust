#!/bin/bash

# Task 6.6.2: Log Rotation Management Script
# Advanced log rotation and management for Nginx

set -euo pipefail

# Configuration
LOG_DIR="/var/log/nginx"
ARCHIVE_DIR="/var/log/nginx/archive"
RETENTION_DAYS=30
COMPRESSION_THRESHOLD=7  # Days after which to compress logs
MAX_LOG_SIZE="100M"
ROTATE_FREQUENCY="daily"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root or with sudo"
        exit 1
    fi
}

# Setup log rotation configuration
setup_logrotate() {
    log_info "Setting up logrotate configuration..."
    
    cat > /etc/logrotate.d/nginx-pfm << 'LOGROTATE_EOF'
/var/log/nginx/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data adm
    size 100M
    sharedscripts
    
    prerotate
        # Archive large logs before rotation
        /usr/local/bin/nginx-log-archive.sh
    endscript
    
    postrotate
        # Reload nginx to reopen log files
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
        
        # Send log rotation notification
        /usr/local/bin/nginx-log-notify.sh "rotated"
    endscript
}

# Separate configuration for JSON logs
/var/log/nginx/*.json {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 www-data adm
    size 50M
    copytruncate
    
    postrotate
        # Process JSON logs for analytics
        /usr/local/bin/process-json-logs.sh "$1"
    endscript
}

# High-frequency logs (security, performance)
/var/log/nginx/security.log /var/log/nginx/performance.log {
    hourly
    missingok
    rotate 168  # 7 days worth of hourly logs
    compress
    delaycompress
    notifempty
    create 644 www-data adm
    size 10M
    copytruncate
}
LOGROTATE_EOF
    
    log_success "Logrotate configuration created"
}

# Create log archive script
create_archive_script() {
    log_info "Creating log archive script..."
    
    cat > /usr/local/bin/nginx-log-archive.sh << 'ARCHIVE_EOF'
#!/bin/bash

# Nginx Log Archive Script
set -euo pipefail

LOG_DIR="/var/log/nginx"
ARCHIVE_DIR="/var/log/nginx/archive"
MAX_SIZE_MB=50

# Create archive directory
mkdir -p "$ARCHIVE_DIR"

# Archive large logs
for log_file in "$LOG_DIR"/*.log; do
    if [[ -f "$log_file" ]]; then
        file_size_mb=$(du -m "$log_file" | cut -f1)
        
        if [[ $file_size_mb -gt $MAX_SIZE_MB ]]; then
            base_name=$(basename "$log_file" .log)
            archive_name="${base_name}_$(date +%Y%m%d_%H%M%S).log.gz"
            
            gzip -c "$log_file" > "$ARCHIVE_DIR/$archive_name"
            
            # Truncate original log
            > "$log_file"
            
            echo "Archived: $log_file -> $ARCHIVE_DIR/$archive_name"
        fi
    fi
done

# Clean old archives
find "$ARCHIVE_DIR" -name "*.log.gz" -mtime +30 -delete

ARCHIVE_EOF
    
    chmod +x /usr/local/bin/nginx-log-archive.sh
    log_success "Archive script created"
}

# Create notification script
create_notify_script() {
    log_info "Creating notification script..."
    
    cat > /usr/local/bin/nginx-log-notify.sh << 'NOTIFY_EOF'
#!/bin/bash

# Nginx Log Notification Script
set -euo pipefail

EVENT="$1"
HOSTNAME=$(hostname)
TIMESTAMP=$(date)

# Log the event
echo "[$TIMESTAMP] Log rotation event: $EVENT on $HOSTNAME" >> /var/log/nginx/rotation.log

# Send notification via webhook (configure URL as needed)
WEBHOOK_URL="${NGINX_LOG_WEBHOOK_URL:-}"

if [[ -n "$WEBHOOK_URL" ]]; then
    curl -s -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{
            \"event\": \"$EVENT\",
            \"hostname\": \"$HOSTNAME\",
            \"timestamp\": \"$TIMESTAMP\",
            \"service\": \"nginx\"
        }" || true
fi

# Send email notification (if configured)
EMAIL_RECIPIENT="${NGINX_LOG_EMAIL:-}"

if [[ -n "$EMAIL_RECIPIENT" ]] && command -v mail &> /dev/null; then
    echo "Nginx log rotation event: $EVENT on $HOSTNAME at $TIMESTAMP" | \
        mail -s "Nginx Log Rotation - $HOSTNAME" "$EMAIL_RECIPIENT" || true
fi

NOTIFY_EOF
    
    chmod +x /usr/local/bin/nginx-log-notify.sh
    log_success "Notification script created"
}

# Create JSON log processor
create_json_processor() {
    log_info "Creating JSON log processor..."
    
    cat > /usr/local/bin/process-json-logs.sh << 'JSON_EOF'
#!/bin/bash

# JSON Log Processor
set -euo pipefail

ROTATED_LOG="$1"
ANALYTICS_DIR="/var/log/nginx/analytics"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create analytics directory
mkdir -p "$ANALYTICS_DIR"

if [[ -f "$ROTATED_LOG" ]]; then
    # Extract metrics from JSON logs
    {
        echo "# Nginx Analytics Report - $TIMESTAMP"
        echo ""
        
        # Request count
        echo "## Request Statistics"
        echo "Total requests: $(wc -l < "$ROTATED_LOG")"
        
        # Status code distribution
        echo ""
        echo "## Status Code Distribution"
        jq -r '.status' "$ROTATED_LOG" 2>/dev/null | sort | uniq -c | sort -nr | head -10 || true
        
        # Top user agents
        echo ""
        echo "## Top User Agents"
        jq -r '.http_user_agent' "$ROTATED_LOG" 2>/dev/null | sort | uniq -c | sort -nr | head -10 || true
        
        # Response time statistics
        echo ""
        echo "## Response Time Statistics"
        jq -r '.request_time' "$ROTATED_LOG" 2>/dev/null | sort -n | awk '
            {
                sum += $1
                count++
                values[count] = $1
            }
            END {
                if (count > 0) {
                    printf "Average: %.3fs\n", sum/count
                    printf "Median: %.3fs\n", values[int(count/2)]
                    printf "95th percentile: %.3fs\n", values[int(count*0.95)]
                }
            }
        ' || true
        
    } > "$ANALYTICS_DIR/report_$TIMESTAMP.txt"
    
    echo "Analytics report generated: $ANALYTICS_DIR/report_$TIMESTAMP.txt"
    
    # Compress the processed log
    gzip "$ROTATED_LOG"
fi

JSON_EOF
    
    chmod +x /usr/local/bin/process-json-logs.sh
    log_success "JSON processor created"
}

# Setup log directories
setup_directories() {
    log_info "Setting up log directories..."
    
    # Create necessary directories
    mkdir -p "$LOG_DIR"
    mkdir -p "$ARCHIVE_DIR"
    mkdir -p "/var/log/nginx/analytics"
    
    # Set proper permissions
    chown -R www-data:adm "$LOG_DIR"
    chmod -R 755 "$LOG_DIR"
    
    # Create rotation log
    touch "/var/log/nginx/rotation.log"
    chown www-data:adm "/var/log/nginx/rotation.log"
    chmod 644 "/var/log/nginx/rotation.log"
    
    log_success "Directories configured"
}

# Test log rotation
test_rotation() {
    log_info "Testing log rotation configuration..."
    
    # Test logrotate configuration
    if logrotate -d /etc/logrotate.d/nginx-pfm; then
        log_success "Logrotate configuration test passed"
    else
        log_error "Logrotate configuration test failed"
        return 1
    fi
    
    # Test archive script
    if /usr/local/bin/nginx-log-archive.sh; then
        log_success "Archive script test passed"
    else
        log_error "Archive script test failed"
        return 1
    fi
    
    log_success "All tests passed"
}

# Force log rotation
force_rotation() {
    log_info "Forcing log rotation..."
    
    logrotate -f /etc/logrotate.d/nginx-pfm
    
    log_success "Log rotation completed"
}

# Clean old logs
clean_old_logs() {
    local days="${1:-$RETENTION_DAYS}"
    
    log_info "Cleaning logs older than $days days..."
    
    # Clean archived logs
    find "$ARCHIVE_DIR" -name "*.log.gz" -mtime +$days -delete
    
    # Clean analytics reports
    find "/var/log/nginx/analytics" -name "*.txt" -mtime +$days -delete
    
    # Clean compressed rotated logs
    find "$LOG_DIR" -name "*.gz" -mtime +$days -delete
    
    log_success "Old logs cleaned"
}

# Show log statistics
show_stats() {
    log_info "Nginx log statistics:"
    echo "======================================"
    
    # Current log sizes
    echo "Current log files:"
    if [[ -d "$LOG_DIR" ]]; then
        du -h "$LOG_DIR"/*.log 2>/dev/null | sort -hr || echo "No active log files found"
    fi
    
    echo ""
    echo "Archived logs:"
    if [[ -d "$ARCHIVE_DIR" ]]; then
        du -sh "$ARCHIVE_DIR" 2>/dev/null || echo "No archived logs found"
        echo "Archive file count: $(find "$ARCHIVE_DIR" -name "*.gz" | wc -l)"
    fi
    
    echo ""
    echo "Disk usage:"
    df -h "$LOG_DIR" | tail -1
    
    echo ""
    echo "Recent rotation events:"
    if [[ -f "/var/log/nginx/rotation.log" ]]; then
        tail -5 "/var/log/nginx/rotation.log" || echo "No rotation events found"
    fi
    
    echo "======================================"
}

# Main function
main() {
    local operation="${1:-setup}"
    
    case "$operation" in
        "setup")
            check_root
            setup_directories
            setup_logrotate
            create_archive_script
            create_notify_script
            create_json_processor
            test_rotation
            log_success "Log rotation setup completed"
            ;;
            
        "rotate")
            check_root
            force_rotation
            ;;
            
        "clean")
            check_root
            clean_old_logs "${2:-$RETENTION_DAYS}"
            ;;
            
        "test")
            test_rotation
            ;;
            
        "stats")
            show_stats
            ;;
            
        *)
            echo "Usage: $0 {setup|rotate|clean|test|stats}"
            echo ""
            echo "Commands:"
            echo "  setup     - Set up log rotation configuration and scripts"
            echo "  rotate    - Force immediate log rotation"
            echo "  clean     - Clean old log files"
            echo "  test      - Test log rotation configuration"
            echo "  stats     - Show log statistics"
            echo ""
            echo "Environment variables:"
            echo "  NGINX_LOG_WEBHOOK_URL  - Webhook URL for notifications"
            echo "  NGINX_LOG_EMAIL        - Email address for notifications"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
