#!/bin/bash
# Emergency Certificate Renewal Script for PFM Community Management
# Task 6.6.3: SSL/TLS Certificate Management & Security

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LOG_FILE="/var/log/ssl-emergency.log"
NOTIFICATION_EMAIL="${NOTIFICATION_EMAIL:-admin@pfm-community.app}"

# Logging function with emergency prefix
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [EMERGENCY] $1" | tee -a "$LOG_FILE"
    logger -t ssl-emergency "EMERGENCY: $1"
}

# Error handling with emergency notifications
error() {
    log "CRITICAL ERROR: $1"
    send_emergency_notification "SSL Certificate Emergency - Critical Error" "$1"
    exit 1
}

# Send emergency notification
send_emergency_notification() {
    local subject="$1"
    local message="$2"
    
    # Email notification (high priority)
    if command -v mail >/dev/null 2>&1 && [[ -n "$NOTIFICATION_EMAIL" ]]; then
        {
            echo "EMERGENCY SSL CERTIFICATE ALERT"
            echo "================================"
            echo "Time: $(date)"
            echo "Host: $HOSTNAME"
            echo ""
            echo "Subject: $subject"
            echo "Message: $message"
            echo ""
            echo "This is an emergency notification requiring immediate attention."
        } | mail -s "[EMERGENCY] $subject" "$NOTIFICATION_EMAIL"
    fi
}

# Check if emergency renewal is needed
check_emergency_status() {
    local domain="$1"
    local cert_file="/etc/letsencrypt/live/$domain/fullchain.pem"
    
    if [[ ! -f "$cert_file" ]]; then
        log "Certificate file missing for $domain - EMERGENCY SITUATION"
        return 2 # Emergency
    fi
    
    # Check certificate expiry
    local expiry_date=$(openssl x509 -enddate -noout -in "$cert_file" | cut -d= -f2)
    local expiry_epoch=$(date -d "$expiry_date" +%s)
    local current_epoch=$(date +%s)
    local days_until_expiry=$(( (expiry_epoch - current_epoch) / 86400 ))
    
    log "Certificate for $domain expires in $days_until_expiry days"
    
    if [[ $days_until_expiry -le 0 ]]; then
        log "Certificate for $domain has EXPIRED - EMERGENCY SITUATION"
        return 2 # Emergency
    elif [[ $days_until_expiry -le 3 ]]; then
        log "Certificate for $domain expires in $days_until_expiry days - CRITICAL SITUATION"
        return 1 # Critical
    else
        log "Certificate for $domain is valid - NO EMERGENCY"
        return 0 # No emergency
    fi
}

# Create emergency backup
create_emergency_backup() {
    log "Creating emergency backup of certificates..."
    
    local backup_timestamp=$(date +%Y%m%d_%H%M%S)
    local emergency_backup_dir="/var/backups/ssl/emergency_$backup_timestamp"
    
    mkdir -p "$emergency_backup_dir"
    
    # Backup certificates
    if [[ -d "/etc/letsencrypt" ]]; then
        cp -r /etc/letsencrypt "$emergency_backup_dir/" || log "Warning: Failed to backup certificates"
    fi
    
    # Compress backup
    tar -czf "${emergency_backup_dir}.tar.gz" -C "$(dirname "$emergency_backup_dir")" "$(basename "$emergency_backup_dir")"
    rm -rf "$emergency_backup_dir"
    
    log "Emergency backup created: ${emergency_backup_dir}.tar.gz"
}

# Attempt emergency certificate renewal
emergency_renewal() {
    local domain="$1"
    
    log "Starting emergency renewal for $domain"
    
    # Try standard renewal
    if certbot renew --cert-name "$domain" --force-renewal; then
        log "Emergency renewal succeeded for $domain"
        return 0
    else
        log "Emergency renewal failed for $domain"
        return 1
    fi
}

# Main emergency function
main() {
    log "===== EMERGENCY SSL CERTIFICATE RENEWAL INITIATED ====="
    
    # Check if running as root
    if [[ $EUID -ne 0 ]]; then
        error "Emergency renewal must be run as root"
    fi
    
    # Get domains to check
    local domains="${1:-pfm-community.app,api.pfm-community.app,admin.pfm-community.app,member.pfm-community.app}"
    
    IFS=',' read -ra DOMAIN_ARRAY <<< "$domains"
    
    local emergency_needed=false
    local emergency_domains=()
    
    # Check status of all domains
    for domain in "${DOMAIN_ARRAY[@]}"; do
        domain=$(echo "$domain" | xargs)
        
        check_emergency_status "$domain"
        local status=$?
        
        if [[ $status -ge 1 ]]; then
            emergency_needed=true
            emergency_domains+=("$domain")
        fi
    done
    
    if [[ "$emergency_needed" != "true" ]]; then
        log "No emergency renewal needed"
        exit 0
    fi
    
    log "Emergency renewal needed for domains: ${emergency_domains[*]}"
    
    # Send initial emergency notification
    send_emergency_notification "SSL Certificate Emergency Detected" "Emergency renewal initiated for domains: ${emergency_domains[*]}"
    
    # Create emergency backup
    create_emergency_backup
    
    # Process emergency domains
    local success=true
    for domain in "${emergency_domains[@]}"; do
        if ! emergency_renewal "$domain"; then
            success=false
        fi
    done
    
    if [[ "$success" == "true" ]]; then
        log "===== EMERGENCY SSL CERTIFICATE RENEWAL COMPLETED SUCCESSFULLY ====="
        send_emergency_notification "SSL Certificate Emergency Resolved" "All certificates have been renewed successfully."
    else
        error "Emergency renewal completed with errors - manual intervention required"
    fi
}

# Handle script arguments
case "${1:-emergency}" in
    "emergency"|"renew")
        shift
        main "$@"
        ;;
    "check")
        DOMAIN="${2:-pfm-community.app}"
        check_emergency_status "$DOMAIN"
        ;;
    "backup")
        create_emergency_backup
        ;;
    *)
        echo "Usage: $0 [emergency|renew|check|backup] [domains]"
        exit 1
        ;;
esac
