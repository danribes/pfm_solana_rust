#!/bin/bash

# Deploy Monitoring Stack for PFM Community Management Application
# Task 6.4.1: Monitoring & Alerting for All Services

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ENVIRONMENT=${ENVIRONMENT:-staging}

log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# Deploy monitoring stack
deploy_monitoring() {
    log "🚀 Deploying monitoring stack for environment: $ENVIRONMENT"
    
    # Check if monitoring compose file exists
    local compose_file="infra/monitoring/docker-compose.monitoring.yml"
    if [[ ! -f "$compose_file" ]]; then
        error "Monitoring compose file not found: $compose_file"
    fi
    
    # Create monitoring network if it doesn't exist
    if ! docker network ls | grep -q "pfm_monitoring_network"; then
        log "Creating monitoring network..."
        docker network create pfm_monitoring_network
        success "Monitoring network created"
    fi
    
    # Deploy monitoring services
    log "Starting monitoring services..."
    cd infra/monitoring
    docker-compose -f docker-compose.monitoring.yml up -d
    cd ../..
    
    success "Monitoring stack deployed successfully"
}

# Validate monitoring deployment
validate_deployment() {
    log "🔍 Validating monitoring deployment..."
    
    local services=("prometheus" "alertmanager" "grafana" "node-exporter")
    
    for service in "${services[@]}"; do
        local container_name="pfm-${ENVIRONMENT}-${service}"
        if docker ps | grep -q "$container_name"; then
            success "Service running: $service"
        else
            error "Service not running: $service"
        fi
    done
    
    # Wait for services to be ready
    log "Waiting for services to be ready..."
    sleep 30
    
    # Check service health
    local endpoints=(
        "http://localhost:9090/-/healthy:Prometheus"
        "http://localhost:9093/-/healthy:AlertManager"
        "http://localhost:3003/api/health:Grafana"
    )
    
    for endpoint_info in "${endpoints[@]}"; do
        local url=$(echo "$endpoint_info" | cut -d: -f1,2,3)
        local service=$(echo "$endpoint_info" | cut -d: -f4)
        
        if curl -f "$url" --max-time 10 &>/dev/null; then
            success "$service is healthy"
        else
            warning "$service health check failed"
        fi
    done
}

# Show monitoring URLs
show_urls() {
    log "📊 Monitoring Services URLs:"
    echo "  🎯 Prometheus: http://localhost:9090"
    echo "  🔔 AlertManager: http://localhost:9093"  
    echo "  📈 Grafana: http://localhost:3003 (admin/admin)"
    echo "  📊 Node Exporter: http://localhost:9100"
    echo "  🐳 cAdvisor: http://localhost:8080"
}

# Main function
main() {
    log "Starting monitoring deployment for PFM Community Management Application"
    
    deploy_monitoring
    validate_deployment
    show_urls
    
    success "🎉 Monitoring stack deployment completed successfully!"
}

# Execute if run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
