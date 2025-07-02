#!/bin/bash
# Task 6.6.1: Production Health Check Script
set -euo pipefail

# Health check endpoints
ENDPOINTS=(
    "https://pfm-community.app"
    "https://app.pfm-community.app" 
    "https://admin.pfm-community.app"
    "https://api.pfm-community.app/health"
)

# Container names
CONTAINERS=(
    "pfm-nginx-proxy"
    "pfm-member-portal-prod"
    "pfm-admin-dashboard-prod"
    "pfm-api-server-prod"
)

log_info() {
    echo "[INFO] $1"
}

log_success() {
    echo "[SUCCESS] $1"
}

log_error() {
    echo "[ERROR] $1"
}

# Check containers
for container in "${CONTAINERS[@]}"; do
    if docker ps | grep -q "$container"; then
        log_success "Container $container is running"
    else
        log_error "Container $container is not running"
    fi
done

# Check endpoints
for endpoint in "${ENDPOINTS[@]}"; do
    if curl -sS --max-time 10 "$endpoint" > /dev/null; then
        log_success "Endpoint $endpoint is healthy"
    else
        log_error "Endpoint $endpoint failed health check"
    fi
done

echo "Health check completed"

# SSL certificate check (using certbot for verification)
# certbot certificates --quiet

