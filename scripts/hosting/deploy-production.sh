#!/bin/bash

# Task 6.6.1: Production Deployment Script
# Automated deployment for PFM Community Management Application

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
COMPOSE_FILE="$PROJECT_ROOT/infra/hosting/docker-compose.production.yml"
ENV_FILE="$PROJECT_ROOT/.env.production"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if running as root or with sudo
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root or with sudo"
        exit 1
    fi
    
    # Check required commands
    local required_commands=("docker" "docker-compose" "nginx" "certbot" "curl")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            log_error "Required command '$cmd' not found"
            exit 1
        fi
    done
    
    # Check environment file
    if [[ ! -f "$ENV_FILE" ]]; then
        log_error "Environment file not found: $ENV_FILE"
        log_info "Please create the production environment file with required variables"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Load environment variables
load_environment() {
    log_info "Loading environment variables..."
    source "$ENV_FILE"
    
    # Validate required environment variables
    local required_vars=("DB_NAME" "DB_USER" "DB_PASSWORD" "REDIS_PASSWORD" "JWT_SECRET")
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            log_error "Required environment variable '$var' is not set"
            exit 1
        fi
    done
    
    log_success "Environment variables loaded"
}

# Setup SSL certificates
setup_ssl() {
    log_info "Setting up SSL certificates..."
    
    local domain="pfm-community.app"
    local subdomains="app.pfm-community.app,admin.pfm-community.app,api.pfm-community.app"
    
    # Check if certificates already exist
    if [[ -d "/etc/letsencrypt/live/$domain" ]]; then
        log_warning "SSL certificates already exist for $domain"
        
        # Renew if needed
        certbot renew --quiet
        log_success "SSL certificates renewed if necessary"
    else
        # Obtain new certificates
        log_info "Obtaining SSL certificates for $domain and subdomains..."
        
        certbot certonly \
            --standalone \
            --non-interactive \
            --agree-tos \
            --email "admin@pfm-community.app" \
            -d "$domain" \
            -d "www.$domain" \
            -d "$subdomains"
        
        if [[ $? -eq 0 ]]; then
            log_success "SSL certificates obtained successfully"
        else
            log_error "Failed to obtain SSL certificates"
            exit 1
        fi
    fi
    
    # Setup auto-renewal
    if ! crontab -l | grep -q "certbot renew"; then
        (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
        log_success "SSL auto-renewal configured"
    fi
}

# Build production images
build_images() {
    log_info "Building production Docker images..."
    
    cd "$PROJECT_ROOT"
    
    # Build all production images
    docker-compose -f "$COMPOSE_FILE" build --no-cache
    
    if [[ $? -eq 0 ]]; then
        log_success "Production images built successfully"
    else
        log_error "Failed to build production images"
        exit 1
    fi
}

# Deploy application
deploy_application() {
    log_info "Deploying application..."
    
    cd "$PROJECT_ROOT"
    
    # Stop existing containers if running
    docker-compose -f "$COMPOSE_FILE" down --remove-orphans
    
    # Start new deployment
    docker-compose -f "$COMPOSE_FILE" up -d
    
    if [[ $? -eq 0 ]]; then
        log_success "Application deployed successfully"
    else
        log_error "Failed to deploy application"
        exit 1
    fi
    
    # Wait for services to be ready
    log_info "Waiting for services to be ready..."
    sleep 30
    
    # Health checks
    perform_health_checks
}

# Perform health checks
perform_health_checks() {
    log_info "Performing health checks..."
    
    local services=(
        "https://pfm-community.app:Member Portal"
        "https://admin.pfm-community.app:Admin Dashboard"
        "https://api.pfm-community.app/health:API Server"
    )
    
    local failed_checks=0
    
    for service in "${services[@]}"; do
        local url="${service%%:*}"
        local name="${service##*:}"
        
        log_info "Checking $name ($url)..."
        
        if curl -sS -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|301\|302"; then
            log_success "$name is healthy"
        else
            log_error "$name health check failed"
            ((failed_checks++))
        fi
    done
    
    if [[ $failed_checks -eq 0 ]]; then
        log_success "All health checks passed"
    else
        log_warning "$failed_checks health check(s) failed"
    fi
}

# Setup monitoring
setup_monitoring() {
    log_info "Setting up monitoring..."
    
    # Create monitoring directories
    mkdir -p /var/log/pfm-monitoring
    
    # Setup log rotation
    cat > /etc/logrotate.d/pfm-logs << 'LOGROTATE_EOF'
/var/log/nginx/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    sharedscripts
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}

/var/log/pfm-monitoring/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
}
LOGROTATE_EOF
    
    log_success "Monitoring setup complete"
}

# Backup before deployment
backup_before_deploy() {
    log_info "Creating backup before deployment..."
    
    local backup_dir="/backup/pre-deploy-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Backup database
    docker exec pfm-postgres-prod pg_dump -U "$DB_USER" "$DB_NAME" > "$backup_dir/database.sql"
    
    # Backup Redis data
    docker exec pfm-redis-prod redis-cli --rdb /data/dump.rdb
    docker cp pfm-redis-prod:/data/dump.rdb "$backup_dir/redis.rdb"
    
    # Backup current configuration
    cp -r "$PROJECT_ROOT/infra" "$backup_dir/"
    
    log_success "Backup created: $backup_dir"
}

# Main deployment function
main() {
    log_info "Starting production deployment for PFM Community Management Application"
    log_info "=========================================="
    
    check_prerequisites
    load_environment
    backup_before_deploy
    setup_ssl
    build_images
    deploy_application
    setup_monitoring
    
    log_success "=========================================="
    log_success "Production deployment completed successfully!"
    log_info "Application is now available at: https://pfm-community.app"
    log_info "Admin dashboard: https://admin.pfm-community.app"
    log_info "API endpoint: https://api.pfm-community.app"
}

# Handle script interruption
trap 'log_error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@"
