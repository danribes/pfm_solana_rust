#!/bin/bash

# Task 6.6.2: Configuration Reload Script
# Safely reload Nginx configuration with validation and rollback

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
WEBSERVER_CONFIG_DIR="$PROJECT_ROOT/infra/webserver"
NGINX_CONFIG_DIR="/etc/nginx"
BACKUP_DIR="/tmp/nginx_backup_$(date +%Y%m%d_%H%M%S)"

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

# Backup current configuration
backup_current_config() {
    log_info "Backing up current Nginx configuration..."
    
    mkdir -p "$BACKUP_DIR"
    cp -r "$NGINX_CONFIG_DIR" "$BACKUP_DIR/"
    
    log_success "Configuration backed up to $BACKUP_DIR"
}

# Validate new configuration files
validate_new_config() {
    log_info "Validating new configuration files..."
    
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

# Deploy new configuration
deploy_new_config() {
    log_info "Deploying new configuration files..."
    
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
    
    # Copy main configuration (be careful with this)
    if [[ "${DEPLOY_MAIN_CONFIG:-no}" == "yes" ]]; then
        cp "$WEBSERVER_CONFIG_DIR/nginx.conf" "$NGINX_CONFIG_DIR/"
        log_info "Main nginx.conf deployed"
    else
        log_info "Skipping main nginx.conf (use DEPLOY_MAIN_CONFIG=yes to override)"
    fi
    
    log_success "New configuration deployed"
}

# Test configuration
test_config() {
    log_info "Testing Nginx configuration..."
    
    if nginx -t; then
        log_success "Configuration test passed"
        return 0
    else
        log_error "Configuration test failed"
        return 1
    fi
}

# Rollback configuration
rollback_config() {
    log_error "Rolling back to previous configuration..."
    
    if [[ -d "$BACKUP_DIR/nginx" ]]; then
        rm -rf "$NGINX_CONFIG_DIR"
        mv "$BACKUP_DIR/nginx" "$NGINX_CONFIG_DIR"
        
        if nginx -t; then
            log_success "Rollback successful"
            return 0
        else
            log_error "Rollback failed - manual intervention required"
            return 1
        fi
    else
        log_error "Backup not found - cannot rollback"
        return 1
    fi
}

# Reload Nginx
reload_nginx() {
    log_info "Reloading Nginx configuration..."
    
    if systemctl reload nginx; then
        log_success "Nginx configuration reloaded successfully"
        return 0
    else
        log_error "Failed to reload Nginx"
        return 1
    fi
}

# Verify reload
verify_reload() {
    log_info "Verifying configuration reload..."
    
    # Check if Nginx is still running
    if ! systemctl is-active --quiet nginx; then
        log_error "Nginx is not running after reload"
        return 1
    fi
    
    # Check if status endpoint is accessible
    local max_attempts=5
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -s -o /dev/null -w "%{http_code}" http://localhost/nginx_status | grep -q "200"; then
            log_success "Status endpoint is accessible"
            return 0
        fi
        
        log_info "Attempt $attempt/$max_attempts: Waiting for server..."
        sleep 2
        ((attempt++))
    done
    
    log_error "Status endpoint not accessible after reload"
    return 1
}

# Display server status
show_status() {
    log_info "Current server status:"
    echo "======================================"
    
    # Nginx status
    if systemctl is-active --quiet nginx; then
        echo "Nginx: Running"
    else
        echo "Nginx: Stopped"
    fi
    
    # Configuration test
    if nginx -t &>/dev/null; then
        echo "Configuration: Valid"
    else
        echo "Configuration: Invalid"
    fi
    
    # Process information
    echo "Nginx processes: $(pgrep nginx | wc -l)"
    
    # Memory usage
    local nginx_memory=$(ps -o pid,vsz,rss,comm -C nginx | awk 'NR>1 {vsz+=$2; rss+=$3} END {printf "VSZ: %.1fMB, RSS: %.1fMB\n", vsz/1024, rss/1024}')
    echo "Memory usage: $nginx_memory"
    
    # Active connections
    if curl -s http://localhost/nginx_status &>/dev/null; then
        local connections=$(curl -s http://localhost/nginx_status | grep "Active connections" | awk '{print $3}')
        echo "Active connections: $connections"
    fi
    
    echo "======================================"
}

# Main function
main() {
    local operation="${1:-reload}"
    
    case "$operation" in
        "reload")
            log_info "Starting configuration reload..."
            
            check_root
            backup_current_config
            validate_new_config
            deploy_new_config
            
            if test_config; then
                if reload_nginx && verify_reload; then
                    log_success "Configuration reload completed successfully!"
                    show_status
                    
                    # Clean up old backup
                    rm -rf "$BACKUP_DIR"
                else
                    log_error "Reload verification failed"
                    if rollback_config && reload_nginx; then
                        log_warning "Rollback completed - please check configuration"
                    else
                        log_error "Rollback failed - manual intervention required"
                        exit 1
                    fi
                fi
            else
                log_error "Configuration test failed"
                rollback_config
                exit 1
            fi
            ;;
            
        "test")
            log_info "Testing current configuration..."
            test_config
            ;;
            
        "status")
            show_status
            ;;
            
        "rollback")
            if [[ -n "${2:-}" ]] && [[ -d "$2" ]]; then
                BACKUP_DIR="$2"
                log_info "Rolling back to backup: $BACKUP_DIR"
                rollback_config
                reload_nginx
            else
                log_error "Please specify backup directory: $0 rollback /path/to/backup"
                exit 1
            fi
            ;;
            
        *)
            echo "Usage: $0 {reload|test|status|rollback <backup_dir>}"
            echo ""
            echo "Commands:"
            echo "  reload    - Deploy new configuration and reload Nginx"
            echo "  test      - Test current Nginx configuration"
            echo "  status    - Show current server status"
            echo "  rollback  - Rollback to specified backup"
            echo ""
            echo "Environment variables:"
            echo "  DEPLOY_MAIN_CONFIG=yes  - Also deploy main nginx.conf"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
