#!/bin/bash

# Cloud-Agnostic Deployment Script for PFM Community Management Application
# Task 6.3.1: Staging & Production Environment Setup

set -e

# Color output for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
INFRA_DIR="${PROJECT_ROOT}/infra"

# Default values
DEFAULT_ENVIRONMENT="staging"
DEFAULT_CLOUD_PROVIDER="local"
DEFAULT_DEPLOYMENT_METHOD="docker-compose"

# Global variables
ENVIRONMENT=""
CLOUD_PROVIDER=""
DEPLOYMENT_METHOD=""
DRY_RUN=false
FORCE_DEPLOY=false
VERBOSE=false
CONFIG_FILE=""

log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

info() {
    if [[ "$VERBOSE" == true ]]; then
        echo -e "${BLUE}ℹ️ $1${NC}"
    fi
}

show_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Cloud-agnostic deployment script for PFM Community Management Application.

OPTIONS:
    -e, --environment ENVIRONMENT    Target environment (staging, production, development)
    -c, --cloud-provider PROVIDER   Cloud provider (aws, gcp, azure, digitalocean, local)
    -m, --method METHOD             Deployment method (docker-compose, kubernetes, terraform)
    -f, --config-file FILE          Path to configuration file
    -d, --dry-run                   Show what would be deployed without executing
    --force                         Force deployment even if environment exists
    -v, --verbose                   Enable verbose output
    -h, --help                      Show this help message

EXAMPLES:
    # Deploy to staging using Docker Compose
    $0 -e staging -c local -m docker-compose

    # Deploy to production on AWS using Kubernetes
    $0 -e production -c aws -m kubernetes

    # Dry run for production deployment
    $0 -e production -c gcp -m terraform --dry-run

    # Deploy with custom configuration
    $0 -e staging -f ./custom-config.env

SUPPORTED CLOUD PROVIDERS:
    - local         Local Docker deployment
    - aws           Amazon Web Services
    - gcp           Google Cloud Platform
    - azure         Microsoft Azure
    - digitalocean  DigitalOcean
    - linode        Linode
    - vultr         Vultr

DEPLOYMENT METHODS:
    - docker-compose  Docker Compose for local/single-server deployment
    - kubernetes      Kubernetes for container orchestration
    - terraform       Terraform for infrastructure-as-code deployment
EOF
}

validate_dependencies() {
    log "Validating deployment dependencies..."
    
    local required_tools=()
    
    case "$DEPLOYMENT_METHOD" in
        "docker-compose")
            required_tools=("docker" "docker-compose")
            ;;
        "kubernetes")
            required_tools=("kubectl" "helm")
            ;;
        "terraform")
            required_tools=("terraform")
            ;;
    esac
    
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            error "Required tool '$tool' is not installed or not in PATH"
        fi
        info "Found $tool: $(command -v "$tool")"
    done
    
    success "All required dependencies are available"
}

load_configuration() {
    log "Loading configuration for environment: $ENVIRONMENT"
    
    # Load default configuration
    local default_config="${INFRA_DIR}/config/default.env"
    if [[ -f "$default_config" ]]; then
        source "$default_config"
        info "Loaded default configuration"
    fi
    
    # Load environment-specific configuration
    local env_config="${INFRA_DIR}/config/${ENVIRONMENT}.env"
    if [[ -f "$env_config" ]]; then
        source "$env_config"
        info "Loaded environment configuration: $env_config"
    fi
    
    # Load cloud provider-specific configuration
    local cloud_config="${INFRA_DIR}/config/${CLOUD_PROVIDER}.env"
    if [[ -f "$cloud_config" ]]; then
        source "$cloud_config"
        info "Loaded cloud provider configuration: $cloud_config"
    fi
    
    # Load custom configuration if specified
    if [[ -n "$CONFIG_FILE" && -f "$CONFIG_FILE" ]]; then
        source "$CONFIG_FILE"
        info "Loaded custom configuration: $CONFIG_FILE"
    fi
    
    # Set default values if not configured
    export ENVIRONMENT="${ENVIRONMENT}"
    export CLOUD_PROVIDER="${CLOUD_PROVIDER}"
    export PROJECT_NAME="${PROJECT_NAME:-pfm-community}"
    export CONTAINER_REGISTRY="${CONTAINER_REGISTRY:-ghcr.io}"
    export IMAGE_TAG="${IMAGE_TAG:-latest}"
    
    success "Configuration loaded successfully"
}

validate_environment() {
    log "Validating environment configuration..."
    
    # Check required environment variables
    local required_vars=()
    
    if [[ "$ENVIRONMENT" == "production" ]]; then
        required_vars=(
            "DB_PASSWORD"
            "REDIS_PASSWORD" 
            "SESSION_SECRET"
            "JWT_SECRET"
        )
    fi
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            error "Required environment variable '$var' is not set for $ENVIRONMENT environment"
        fi
    done
    
    # Validate cloud provider credentials
    case "$CLOUD_PROVIDER" in
        "aws")
            if [[ -z "$AWS_ACCESS_KEY_ID" || -z "$AWS_SECRET_ACCESS_KEY" ]]; then
                warning "AWS credentials not found. Make sure AWS CLI is configured."
            fi
            ;;
        "gcp")
            if [[ -z "$GOOGLE_APPLICATION_CREDENTIALS" ]]; then
                warning "GCP credentials not found. Make sure gcloud is authenticated."
            fi
            ;;
        "azure")
            if ! az account show &>/dev/null; then
                warning "Azure credentials not found. Run 'az login' to authenticate."
            fi
            ;;
    esac
    
    success "Environment validation completed"
}

deploy_docker_compose() {
    log "Deploying using Docker Compose..."
    
    local compose_file="${INFRA_DIR}/docker-compose/${ENVIRONMENT}.yml"
    
    if [[ ! -f "$compose_file" ]]; then
        error "Docker Compose file not found: $compose_file"
    fi
    
    # Create environment file
    local env_file="${INFRA_DIR}/docker-compose/.env.${ENVIRONMENT}"
    create_env_file "$env_file"
    
    if [[ "$DRY_RUN" == true ]]; then
        log "DRY RUN: Would execute:"
        echo "docker-compose -f $compose_file --env-file $env_file up -d"
        return 0
    fi
    
    # Deploy services
    log "Starting services with Docker Compose..."
    docker-compose -f "$compose_file" --env-file "$env_file" up -d
    
    # Wait for services to be healthy
    log "Waiting for services to become healthy..."
    wait_for_services_docker_compose "$compose_file" "$env_file"
    
    success "Docker Compose deployment completed successfully"
}

deploy_kubernetes() {
    log "Deploying using Kubernetes..."
    
    local k8s_dir="${INFRA_DIR}/kubernetes"
    
    if [[ ! -d "$k8s_dir" ]]; then
        error "Kubernetes manifests directory not found: $k8s_dir"
    fi
    
    # Apply namespace
    local namespace_file="${k8s_dir}/namespace.yaml"
    if [[ -f "$namespace_file" ]]; then
        if [[ "$DRY_RUN" == true ]]; then
            log "DRY RUN: Would apply namespace"
        else
            envsubst < "$namespace_file" | kubectl apply -f -
        fi
    fi
    
    # Create secrets
    create_kubernetes_secrets
    
    # Apply deployments
    local deployments_file="${k8s_dir}/deployments.yaml"
    if [[ -f "$deployments_file" ]]; then
        if [[ "$DRY_RUN" == true ]]; then
            log "DRY RUN: Would apply deployments"
        else
            envsubst < "$deployments_file" | kubectl apply -f -
        fi
    fi
    
    # Apply services
    local services_file="${k8s_dir}/services.yaml"
    if [[ -f "$services_file" ]]; then
        if [[ "$DRY_RUN" == true ]]; then
            log "DRY RUN: Would apply services"
        else
            envsubst < "$services_file" | kubectl apply -f -
        fi
    fi
    
    if [[ "$DRY_RUN" == false ]]; then
        # Wait for deployments to be ready
        log "Waiting for deployments to be ready..."
        kubectl wait --for=condition=available --timeout=600s deployment --all -n "pfm-${ENVIRONMENT}"
        
        success "Kubernetes deployment completed successfully"
    else
        success "Kubernetes dry run completed"
    fi
}

deploy_terraform() {
    log "Deploying using Terraform..."
    
    local terraform_dir="${INFRA_DIR}/terraform"
    
    if [[ ! -d "$terraform_dir" ]]; then
        error "Terraform directory not found: $terraform_dir"
    fi
    
    cd "$terraform_dir"
    
    # Initialize Terraform
    if [[ "$DRY_RUN" == true ]]; then
        log "DRY RUN: Would initialize Terraform"
    else
        terraform init
    fi
    
    # Create terraform.tfvars
    create_terraform_vars
    
    # Plan deployment
    log "Creating Terraform execution plan..."
    if [[ "$DRY_RUN" == true ]]; then
        terraform plan -var-file="terraform.tfvars"
    else
        terraform plan -var-file="terraform.tfvars" -out="tfplan"
        
        # Apply deployment
        log "Applying Terraform configuration..."
        terraform apply "tfplan"
        
        success "Terraform deployment completed successfully"
    fi
    
    cd "$PROJECT_ROOT"
}

create_env_file() {
    local env_file="$1"
    
    log "Creating environment file: $env_file"
    
    cat > "$env_file" << EOF
# Environment Configuration for $ENVIRONMENT
ENVIRONMENT=$ENVIRONMENT
CLOUD_PROVIDER=$CLOUD_PROVIDER

# Project Configuration
PROJECT_NAME=$PROJECT_NAME
CONTAINER_REGISTRY=$CONTAINER_REGISTRY
IMAGE_TAG=$IMAGE_TAG

# Database Configuration
DB_USER=${DB_USER:-pfm_user}
DB_PASSWORD=${DB_PASSWORD:-$(generate_password)}
DB_PORT=${DB_PORT:-5432}

# Redis Configuration
REDIS_PASSWORD=${REDIS_PASSWORD:-$(generate_password)}
REDIS_PORT=${REDIS_PORT:-6379}

# Application Secrets
SESSION_SECRET=${SESSION_SECRET:-$(generate_secret)}
JWT_SECRET=${JWT_SECRET:-$(generate_secret)}

# Blockchain Configuration
SOLANA_RPC_URL=${SOLANA_RPC_URL:-https://api.devnet.solana.com}

# Domain Configuration
DOMAIN_NAME=${DOMAIN_NAME:-}
ACME_EMAIL=${ACME_EMAIL:-admin@example.com}

# Monitoring Configuration
GRAFANA_USER=${GRAFANA_USER:-admin}
GRAFANA_PASSWORD=${GRAFANA_PASSWORD:-$(generate_password)}
EOF
    
    info "Environment file created: $env_file"
}

create_kubernetes_secrets() {
    log "Creating Kubernetes secrets..."
    
    if [[ "$DRY_RUN" == true ]]; then
        log "DRY RUN: Would create Kubernetes secrets"
        return 0
    fi
    
    # Create namespace if it doesn't exist
    kubectl create namespace "pfm-${ENVIRONMENT}" --dry-run=client -o yaml | kubectl apply -f -
    
    # Create database credentials secret
    kubectl create secret generic postgres-credentials \
        --from-literal=username="${DB_USER:-pfm_user}" \
        --from-literal=password="${DB_PASSWORD:-$(generate_password)}" \
        --namespace="pfm-${ENVIRONMENT}" \
        --dry-run=client -o yaml | kubectl apply -f -
    
    # Create Redis credentials secret
    kubectl create secret generic redis-credentials \
        --from-literal=password="${REDIS_PASSWORD:-$(generate_password)}" \
        --namespace="pfm-${ENVIRONMENT}" \
        --dry-run=client -o yaml | kubectl apply -f -
    
    # Create backend configuration secret
    kubectl create secret generic backend-config \
        --from-literal=database-url="postgresql://${DB_USER:-pfm_user}:${DB_PASSWORD}@postgres:5432/pfm_community_${ENVIRONMENT}" \
        --from-literal=redis-url="redis://:${REDIS_PASSWORD}@redis:6379" \
        --from-literal=session-secret="${SESSION_SECRET:-$(generate_secret)}" \
        --from-literal=jwt-secret="${JWT_SECRET:-$(generate_secret)}" \
        --namespace="pfm-${ENVIRONMENT}" \
        --dry-run=client -o yaml | kubectl apply -f -
    
    info "Kubernetes secrets created"
}

create_terraform_vars() {
    local vars_file="terraform.tfvars"
    
    log "Creating Terraform variables file: $vars_file"
    
    cat > "$vars_file" << EOF
# Terraform Variables for $ENVIRONMENT Environment

environment = "$ENVIRONMENT"
cloud_provider = "$CLOUD_PROVIDER"
project_name = "$PROJECT_NAME"

# Container Configuration
container_registry = "$CONTAINER_REGISTRY"
image_tag = "$IMAGE_TAG"

# Blockchain Configuration
solana_network = "${SOLANA_NETWORK:-devnet}"
solana_rpc_url = "$SOLANA_RPC_URL"

# Domain Configuration
domain_name = "$DOMAIN_NAME"

# Feature Flags
ssl_enabled = ${SSL_ENABLED:-true}
backup_enabled = ${BACKUP_ENABLED:-true}
monitoring_enabled = ${MONITORING_ENABLED:-true}
EOF
    
    info "Terraform variables file created: $vars_file"
}

wait_for_services_docker_compose() {
    local compose_file="$1"
    local env_file="$2"
    local max_wait=300
    local wait_time=0
    
    log "Waiting for services to become healthy..."
    
    while [[ $wait_time -lt $max_wait ]]; do
        if docker-compose -f "$compose_file" --env-file "$env_file" ps | grep -q "unhealthy"; then
            info "Services still starting... ($wait_time/${max_wait}s)"
            sleep 10
            wait_time=$((wait_time + 10))
        else
            success "All services are healthy"
            return 0
        fi
    done
    
    warning "Some services may not be fully healthy yet"
}

run_health_checks() {
    log "Running health checks..."
    
    case "$DEPLOYMENT_METHOD" in
        "docker-compose")
            run_health_checks_docker_compose
            ;;
        "kubernetes")
            run_health_checks_kubernetes
            ;;
        "terraform")
            run_health_checks_terraform
            ;;
    esac
}

run_health_checks_docker_compose() {
    local services=("backend" "frontend-admin" "frontend-member")
    local base_url="http://localhost"
    
    for service in "${services[@]}"; do
        case "$service" in
            "backend")
                local url="${base_url}:3000/health"
                ;;
            "frontend-admin")
                local url="${base_url}:3001"
                ;;
            "frontend-member")
                local url="${base_url}:3002"
                ;;
        esac
        
        if curl -f "$url" &>/dev/null; then
            success "$service is healthy"
        else
            warning "$service health check failed"
        fi
    done
}

run_health_checks_kubernetes() {
    local namespace="pfm-${ENVIRONMENT}"
    
    log "Checking pod status in namespace: $namespace"
    kubectl get pods -n "$namespace"
    
    log "Checking service endpoints..."
    kubectl get services -n "$namespace"
}

generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-25
}

generate_secret() {
    openssl rand -hex 32
}

cleanup() {
    log "Cleaning up temporary files..."
    # Clean up any temporary files created during deployment
}

main() {
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -e|--environment)
                ENVIRONMENT="$2"
                shift 2
                ;;
            -c|--cloud-provider)
                CLOUD_PROVIDER="$2"
                shift 2
                ;;
            -m|--method)
                DEPLOYMENT_METHOD="$2"
                shift 2
                ;;
            -f|--config-file)
                CONFIG_FILE="$2"
                shift 2
                ;;
            -d|--dry-run)
                DRY_RUN=true
                shift
                ;;
            --force)
                FORCE_DEPLOY=true
                shift
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                ;;
        esac
    done
    
    # Set defaults
    ENVIRONMENT="${ENVIRONMENT:-$DEFAULT_ENVIRONMENT}"
    CLOUD_PROVIDER="${CLOUD_PROVIDER:-$DEFAULT_CLOUD_PROVIDER}"
    DEPLOYMENT_METHOD="${DEPLOYMENT_METHOD:-$DEFAULT_DEPLOYMENT_METHOD}"
    
    log "🚀 Starting PFM Community Management Application Deployment"
    log "Environment: $ENVIRONMENT"
    log "Cloud Provider: $CLOUD_PROVIDER"
    log "Deployment Method: $DEPLOYMENT_METHOD"
    
    if [[ "$DRY_RUN" == true ]]; then
        warning "DRY RUN MODE - No actual deployment will occur"
    fi
    
    # Validate inputs
    if [[ ! "$ENVIRONMENT" =~ ^(staging|production|development)$ ]]; then
        error "Invalid environment: $ENVIRONMENT"
    fi
    
    if [[ ! "$DEPLOYMENT_METHOD" =~ ^(docker-compose|kubernetes|terraform)$ ]]; then
        error "Invalid deployment method: $DEPLOYMENT_METHOD"
    fi
    
    # Execute deployment pipeline
    validate_dependencies
    load_configuration
    validate_environment
    
    case "$DEPLOYMENT_METHOD" in
        "docker-compose")
            deploy_docker_compose
            ;;
        "kubernetes")
            deploy_kubernetes
            ;;
        "terraform")
            deploy_terraform
            ;;
    esac
    
    if [[ "$DRY_RUN" == false ]]; then
        run_health_checks
    fi
    
    cleanup
    
    success "🎉 Deployment completed successfully!"
    log "Environment: $ENVIRONMENT"
    log "Cloud Provider: $CLOUD_PROVIDER"
    log "Method: $DEPLOYMENT_METHOD"
}

# Trap cleanup on exit
trap cleanup EXIT

# Execute main function
main "$@" 