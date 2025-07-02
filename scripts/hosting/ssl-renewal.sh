#!/bin/bash

# Task 6.6.1: SSL Certificate Renewal Script
# Automated SSL certificate renewal for PFM Community Application

set -euo pipefail

# Configuration
DOMAIN="pfm-community.app"
SUBDOMAINS="app.pfm-community.app admin.pfm-community.app api.pfm-community.app status.pfm-community.app"
CERT_PATH="/etc/letsencrypt/live/$DOMAIN"
NGINX_CONTAINER="pfm-nginx-proxy"
LOG_FILE="/var/log/ssl-renewal.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
    log "INFO: $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    log "SUCCESS: $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    log "WARNING: $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    log "ERROR: $1"
}

# Check certificate expiry
check_certificate_expiry() {
    log_info "Checking certificate expiry for $DOMAIN..."
    
    if [[ ! -f "$CERT_PATH/cert.pem" ]]; then
        log_error "Certificate file not found: $CERT_PATH/cert.pem"
        return 1
    fi
    
    # Get certificate expiry date
    local expiry_date
    expiry_date=$(openssl x509 -enddate -noout -in "$CERT_PATH/cert.pem" | cut -d= -f2)
    
    # Convert to timestamp
    local expiry_timestamp
    expiry_timestamp=$(date -d "$expiry_date" +%s)
    
    # Get current timestamp
    local current_timestamp
    current_timestamp=$(date +%s)
    
    # Calculate days until expiry
    local days_until_expiry
    days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))
    
    log_info "Certificate expires in $days_until_expiry days ($expiry_date)"
    
    # Return 0 if renewal needed (less than 30 days), 1 otherwise
    if [[ $days_until_expiry -lt 30 ]]; then
        log_warning "Certificate renewal needed (expires in $days_until_expiry days)"
        return 0
    else
        log_info "Certificate renewal not needed yet"
        return 1
    fi
}

# Stop Nginx temporarily for standalone renewal
stop_nginx() {
    log_info "Stopping Nginx for certificate renewal..."
    
    if docker ps | grep -q "$NGINX_CONTAINER"; then
        docker stop "$NGINX_CONTAINER"
        if [[ $? -eq 0 ]]; then
            log_success "Nginx stopped successfully"
            return 0
        else
            log_error "Failed to stop Nginx"
            return 1
        fi
    else
        log_info "Nginx container is not running"
        return 0
    fi
}

# Start Nginx after renewal
start_nginx() {
    log_info "Starting Nginx after certificate renewal..."
    
    docker start "$NGINX_CONTAINER"
    if [[ $? -eq 0 ]]; then
        log_success "Nginx started successfully"
        
        # Wait for Nginx to be ready
        sleep 5
        
        # Test Nginx configuration
        if docker exec "$NGINX_CONTAINER" nginx -t; then
            log_success "Nginx configuration is valid"
            return 0
        else
            log_error "Nginx configuration test failed"
            return 1
        fi
    else
        log_error "Failed to start Nginx"
        return 1
    fi
}

# Renew SSL certificates
renew_certificates() {
    log_info "Renewing SSL certificates for $DOMAIN and subdomains..."
    
    # Build certbot command
    local certbot_cmd="certbot certonly --standalone --non-interactive --agree-tos"
    certbot_cmd="$certbot_cmd --email admin@pfm-community.app"
    certbot_cmd="$certbot_cmd -d $DOMAIN -d www.$DOMAIN"
    
    # Add subdomains
    for subdomain in $SUBDOMAINS; do
        certbot_cmd="$certbot_cmd -d $subdomain"
    done
    
    # Execute renewal
    log_info "Executing: $certbot_cmd"
    
    if eval "$certbot_cmd"; then
        log_success "SSL certificates renewed successfully"
        return 0
    else
        log_error "SSL certificate renewal failed"
        return 1
    fi
}

# Backup existing certificates
backup_certificates() {
    log_info "Backing up existing certificates..."
    
    local backup_dir="/backup/ssl/$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$backup_dir"
    
    if [[ -d "$CERT_PATH" ]]; then
        cp -r "$CERT_PATH" "$backup_dir/"
        log_success "Certificates backed up to $backup_dir"
        return 0
    else
        log_warning "No existing certificates to backup"
        return 0
    fi
}

# Verify renewed certificates
verify_certificates() {
    log_info "Verifying renewed certificates..."
    
    # Check if certificate file exists
    if [[ ! -f "$CERT_PATH/cert.pem" ]]; then
        log_error "Certificate file not found after renewal"
        return 1
    fi
    
    # Check certificate validity
    if openssl x509 -checkend 86400 -noout -in "$CERT_PATH/cert.pem"; then
        log_success "Certificate is valid for at least 24 hours"
    else
        log_error "Certificate validation failed"
        return 1
    fi
    
    # Check certificate chain
    if openssl verify -CAfile "$CERT_PATH/chain.pem" "$CERT_PATH/cert.pem"; then
        log_success "Certificate chain is valid"
    else
        log_error "Certificate chain validation failed"
        return 1
    fi
    
    # Test HTTPS connectivity
    local test_urls=(
        "https://$DOMAIN"
        "https://app.pfm-community.app"
        "https://admin.pfm-community.app"
        "https://api.pfm-community.app/health"
    )
    
    for url in "${test_urls[@]}"; do
        if curl -sS --max-time 10 "$url" > /dev/null; then
            log_success "HTTPS test successful for $url"
        else
            log_warning "HTTPS test failed for $url"
        fi
    done
    
    return 0
}

# Send notification
send_notification() {
    local status="$1"
    local message="$2"
    
    # Email notification
    if command -v mail &> /dev/null; then
        echo "$message" | mail -s "SSL Renewal $status - PFM Community" "admin@pfm-community.app"
        log_info "Email notification sent"
    fi
    
    # Slack notification (if webhook configured)
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        local emoji
        local color
        
        if [[ "$status" == "SUCCESS" ]]; then
            emoji=":white_check_mark:"
            color="good"
        else
            emoji=":x:"
            color="danger"
        fi
        
        local payload=$(cat <<EOF
{
    "text": "$emoji SSL Certificate Renewal $status",
    "attachments": [
        {
            "color": "$color",
            "fields": [
                {
                    "title": "Domain",
                    "value": "$DOMAIN",
                    "short": true
                },
                {
                    "title": "Status",
                    "value": "$status",
                    "short": true
                },
                {
                    "title": "Message",
                    "value": "$message",
                    "short": false
                }
            ]
        }
    ]
}
