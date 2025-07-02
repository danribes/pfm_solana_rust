#!/bin/bash
# Certificate Deployment Script for PFM Community Management
# Task 6.6.3: SSL/TLS Certificate Management & Security

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SSL_CONFIG_DIR="$PROJECT_ROOT/infra/ssl/config"
CERT_DIR="/etc/letsencrypt/live"
BACKUP_DIR="/var/backups/ssl"
LOG_FILE="/var/log/ssl-deployment.log"

# Load configuration
source "$SSL_CONFIG_DIR/deployment.env" 2>/dev/null || true

# Default configuration
DOMAINS="${DOMAINS:-pfm-community.app,api.pfm-community.app,admin.pfm-community.app,member.pfm-community.app}"
NGINX_CONFIG_DIR="${NGINX_CONFIG_DIR:-/etc/nginx}"
CERTBOT_WEBROOT="${CERTBOT_WEBROOT:-/var/www/certbot}"
NOTIFICATION_EMAIL="${NOTIFICATION_EMAIL:-admin@pfm-community.app}"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Error handling
error() {
    log "ERROR: $1"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if running as root
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root"
    fi
    
    # Check required commands
    for cmd in nginx certbot openssl; do
        if ! command -v "$cmd" >/dev/null 2>&1; then
            error "Required command not found: $cmd"
        fi
    done
    
    log "Prerequisites check passed"
}

# Backup existing certificates
backup_certificates() {
    log "Backing up existing certificates..."
    
    local backup_timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_path="$BACKUP_DIR/$backup_timestamp"
    
    mkdir -p "$backup_path"
    
    if [[ -d "$CERT_DIR" ]]; then
        cp -r "$CERT_DIR" "$backup_path/" || true
    fi
    
    # Compress backup
    tar -czf "$backup_path.tar.gz" -C "$BACKUP_DIR" "$backup_timestamp"
    rm -rf "$backup_path"
    
    log "Backup created: $backup_path.tar.gz"
}

# Obtain certificates using Certbot
obtain_certificates() {
    log "Obtaining SSL certificates..."
    
    IFS=',' read -ra DOMAIN_ARRAY <<< "$DOMAINS"
    
    for domain in "${DOMAIN_ARRAY[@]}"; do
        domain=$(echo "$domain" | xargs) # Trim whitespace
        log "Processing domain: $domain"
        
        # Create webroot directory
        mkdir -p "$CERTBOT_WEBROOT"
        
        # Obtain or renew certificate
        certbot certonly \
            --config "$SSL_CONFIG_DIR/certbot-config.ini" \
            --webroot \
            --webroot-path "$CERTBOT_WEBROOT" \
            --domains "$domain" \
            --force-renewal || error "Failed to obtain certificate for $domain"
        
        log "Certificate obtained for $domain"
    done
}

# Main deployment function
main() {
    log "Starting certificate deployment..."
    
    check_prerequisites
    backup_certificates
    obtain_certificates
    
    log "Certificate deployment completed successfully"
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "backup")
        backup_certificates
        ;;
    *)
        echo "Usage: $0 [deploy|backup]"
        exit 1
        ;;
esac
