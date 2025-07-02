#!/bin/bash

# Task 6.6.2: Web Server Deployment Script
# Automated deployment and configuration of production web server

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
WEBSERVER_CONFIG_DIR="$PROJECT_ROOT/infra/webserver"
NGINX_CONFIG_DIR="/etc/nginx"
BACKUP_DIR="/backup/nginx/$(date +%Y%m%d_%H%M%S)"

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

# Backup existing configuration
backup_config() {
    log_info "Creating backup of existing Nginx configuration..."
    
    mkdir -p "$BACKUP_DIR"
    
    if [[ -d "$NGINX_CONFIG_DIR" ]]; then
        cp -r "$NGINX_CONFIG_DIR" "$BACKUP_DIR/"
        log_success "Configuration backed up to $BACKUP_DIR"
    else
        log_warning "No existing Nginx configuration found"
    fi
}

# Validate configuration files
validate_config() {
    log_info "Validating Nginx configuration files..."
    
    # Check if configuration files exist
    local required_files=(
        "nginx.conf"
        "security-headers.conf"
        "performance.conf"
        "rate-limiting.conf"
        "upstream.conf"
        "logging.conf"
        "monitoring.conf"
        "ssl.conf"
        "sites-available/pfm-production.conf"
    )
    
    for file in "${required_files[@]}"; do
        if [[ ! -f "$WEBSERVER_CONFIG_DIR/$file" ]]; then
            log_error "Required configuration file not found: $file"
            exit 1
        fi
    done
    
    log_success "All required configuration files found"
}

# Install required packages
install_dependencies() {
    log_info "Installing required packages..."
    
    # Update package list
    apt-get update -qq
    
    # Install Nginx and additional modules
    apt-get install -y nginx nginx-module-brotli nginx-extras
    
    # Install SSL tools
    apt-get install -y openssl certbot
    
    log_success "Dependencies installed"
}

# Generate DH parameters for Perfect Forward Secrecy
generate_dhparam() {
    local dhparam_file="/etc/nginx/ssl/dhparam.pem"
    
    if [[ ! -f "$dhparam_file" ]]; then
        log_info "Generating DH parameters (this may take a while)..."
        
        mkdir -p /etc/nginx/ssl
        openssl dhparam -out "$dhparam_file" 2048
        chmod 600 "$dhparam_file"
        
        log_success "DH parameters generated"
    else
        log_info "DH parameters already exist"
    fi
}

# Deploy configuration files
deploy_config() {
    log_info "Deploying Nginx configuration files..."
    
    # Create necessary directories
    mkdir -p "$NGINX_CONFIG_DIR/conf.d"
    mkdir -p "$NGINX_CONFIG_DIR/sites-available"
    mkdir -p "$NGINX_CONFIG_DIR/sites-enabled"
    mkdir -p "/var/cache/nginx/pfm"
    mkdir -p "/var/log/nginx"
    
    # Copy main configuration
    cp "$WEBSERVER_CONFIG_DIR/nginx.conf" "$NGINX_CONFIG_DIR/"
    
    # Copy modular configurations
    cp "$WEBSERVER_CONFIG_DIR/security-headers.conf" "$NGINX_CONFIG_DIR/conf.d/"
    cp "$WEBSERVER_CONFIG_DIR/performance.conf" "$NGINX_CONFIG_DIR/conf.d/"
    cp "$WEBSERVER_CONFIG_DIR/rate-limiting.conf" "$NGINX_CONFIG_DIR/conf.d/"
    cp "$WEBSERVER_CONFIG_DIR/upstream.conf" "$NGINX_CONFIG_DIR/conf.d/"
    cp "$WEBSERVER_CONFIG_DIR/logging.conf" "$NGINX_CONFIG_DIR/conf.d/"
    cp "$WEBSERVER_CONFIG_DIR/monitoring.conf" "$NGINX_CONFIG_DIR/conf.d/"
    cp "$WEBSERVER_CONFIG_DIR/ssl.conf" "$NGINX_CONFIG_DIR/conf.d/"
    
    # Copy site configuration
    cp "$WEBSERVER_CONFIG_DIR/sites-available/pfm-production.conf" "$NGINX_CONFIG_DIR/sites-available/"
    
    # Enable site
    ln -sf "$NGINX_CONFIG_DIR/sites-available/pfm-production.conf" "$NGINX_CONFIG_DIR/sites-enabled/"
    
    # Set proper permissions
    chown -R root:root "$NGINX_CONFIG_DIR"
    chmod -R 644 "$NGINX_CONFIG_DIR"
    find "$NGINX_CONFIG_DIR" -type d -exec chmod 755 {} \;
    
    # Set cache directory permissions
    chown -R www-data:www-data "/var/cache/nginx"
    chmod -R 755 "/var/cache/nginx"
    
    log_success "Configuration files deployed"
}

# Test configuration
test_config() {
    log_info "Testing Nginx configuration..."
    
    if nginx -t; then
        log_success "Nginx configuration test passed"
    else
        log_error "Nginx configuration test failed"
        exit 1
    fi
}

# Setup log rotation
setup_log_rotation() {
    log_info "Setting up log rotation..."
    
    cat > /etc/logrotate.d/nginx-pfm << 'LOGROTATE_EOF'
/var/log/nginx/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data adm
    sharedscripts
    prerotate
        if [ -d /etc/logrotate.d/httpd-prerotate ]; then \
            run-parts /etc/logrotate.d/httpd-prerotate; \
        fi \
    endscript
    postrotate
        invoke-rc.d nginx rotate >/dev/null 2>&1
    endscript
}
LOGROTATE_EOF
    
    log_success "Log rotation configured"
}

# Start and enable Nginx
start_nginx() {
    log_info "Starting and enabling Nginx service..."
    
    systemctl enable nginx
    systemctl restart nginx
    
    if systemctl is-active --quiet nginx; then
        log_success "Nginx is running"
    else
        log_error "Failed to start Nginx"
        exit 1
    fi
}

# Verify deployment
verify_deployment() {
    log_info "Verifying web server deployment..."
    
    # Check if Nginx is running
    if ! systemctl is-active --quiet nginx; then
        log_error "Nginx is not running"
        return 1
    fi
    
    # Check if configuration is valid
    if ! nginx -t &>/dev/null; then
        log_error "Nginx configuration is invalid"
        return 1
    fi
    
    # Check if status endpoint is accessible
    if curl -s http://localhost/nginx_status &>/dev/null; then
        log_success "Status endpoint is accessible"
    else
        log_warning "Status endpoint is not accessible"
    fi
    
    # Check SSL configuration (if certificates exist)
    if [[ -f "/etc/letsencrypt/live/pfm-community.app/fullchain.pem" ]]; then
        if openssl s_client -connect localhost:443 -servername pfm-community.app </dev/null &>/dev/null; then
            log_success "SSL configuration is working"
        else
            log_warning "SSL configuration may have issues"
        fi
    else
        log_warning "SSL certificates not found - run SSL setup separately"
    fi
    
    log_success "Web server deployment verified"
}

# Main deployment function
main() {
    log_info "Starting web server deployment..."
    
    check_root
    backup_config
    validate_config
    install_dependencies
    generate_dhparam
    deploy_config
    test_config
    setup_log_rotation
    start_nginx
    verify_deployment
    
    log_success "Web server deployment completed successfully!"
    log_info "Next steps:"
    log_info "1. Configure SSL certificates if not already done"
    log_info "2. Update DNS records to point to this server"
    log_info "3. Test all endpoints and services"
    log_info "4. Monitor logs and performance"
}

# Run main function
main "$@"
