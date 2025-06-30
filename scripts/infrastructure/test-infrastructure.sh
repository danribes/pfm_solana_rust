#!/bin/bash

# Infrastructure Integration Tests for PFM Community Management Application
# Task 6.3.1: Staging & Production Environment Setup

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

test_passed() {
    echo -e "${GREEN}✅ $1${NC}"
    ((TESTS_PASSED++))
}

test_failed() {
    echo -e "${RED}❌ $1${NC}"
    ((TESTS_FAILED++))
}

# Test 1: Infrastructure Files Validation
test_infrastructure_files() {
    log "Testing infrastructure files validation..."
    
    local required_files=(
        "infra/terraform/main.tf"
        "infra/terraform/variables.tf"
        "infra/kubernetes/namespace.yaml"
        "infra/kubernetes/deployments.yaml"
        "infra/docker-compose/staging.yml"
    )
    
    for file in "${required_files[@]}"; do
        if [[ -f "$file" ]]; then
            test_passed "Found infrastructure file: $file"
        else
            test_failed "Missing infrastructure file: $file"
        fi
    done
}

# Test 2: Terraform Configuration Validation
test_terraform_configuration() {
    log "Testing Terraform configuration..."
    
    if [[ -d "infra/terraform" ]]; then
        cd infra/terraform
        
        # Check if Terraform validates
        if terraform validate; then
            test_passed "Terraform configuration is valid"
        else
            test_failed "Terraform configuration validation failed"
        fi
        
        # Check if plan can be generated
        if terraform plan -out=test.tfplan &>/dev/null; then
            test_passed "Terraform plan generation successful"
            rm -f test.tfplan
        else
            test_failed "Terraform plan generation failed"
        fi
        
        cd ../..
    else
        test_failed "Terraform directory not found"
    fi
}

# Test 3: Kubernetes Manifests Validation
test_kubernetes_manifests() {
    log "Testing Kubernetes manifests..."
    
    if command -v kubectl &> /dev/null; then
        local k8s_files=(
            "infra/kubernetes/namespace.yaml"
            "infra/kubernetes/deployments.yaml"
        )
        
        for file in "${k8s_files[@]}"; do
            if [[ -f "$file" ]]; then
                # Validate YAML syntax
                if ENVIRONMENT=staging envsubst < "$file" | kubectl apply --dry-run=client -f - &>/dev/null; then
                    test_passed "Kubernetes manifest valid: $file"
                else
                    test_failed "Kubernetes manifest invalid: $file"
                fi
            fi
        done
    else
        test_failed "kubectl not available for Kubernetes validation"
    fi
}

# Test 4: Docker Compose Configuration Validation
test_docker_compose_configuration() {
    log "Testing Docker Compose configuration..."
    
    local compose_file="infra/docker-compose/staging.yml"
    
    if [[ -f "$compose_file" ]]; then
        # Validate Docker Compose syntax
        if docker-compose -f "$compose_file" config &>/dev/null; then
            test_passed "Docker Compose configuration is valid"
        else
            test_failed "Docker Compose configuration validation failed"
        fi
        
        # Check for required services
        local required_services=("postgres" "redis" "backend" "frontend-admin" "frontend-member")
        
        for service in "${required_services[@]}"; do
            if docker-compose -f "$compose_file" config --services | grep -q "$service"; then
                test_passed "Docker Compose service defined: $service"
            else
                test_failed "Docker Compose service missing: $service"
            fi
        done
    else
        test_failed "Docker Compose staging file not found"
    fi
}

# Test 5: Deployment Scripts Validation
test_deployment_scripts() {
    log "Testing deployment scripts..."
    
    local scripts=(
        "scripts/infrastructure/deploy.sh"
        "scripts/infrastructure/validate-environment.sh"
    )
    
    for script in "${scripts[@]}"; do
        if [[ -f "$script" ]]; then
            if [[ -x "$script" ]]; then
                test_passed "Deployment script is executable: $script"
            else
                test_failed "Deployment script is not executable: $script"
            fi
            
            # Check if script has help option
            if bash "$script" --help &>/dev/null; then
                test_passed "Deployment script has help: $script"
            else
                test_failed "Deployment script missing help: $script"
            fi
        else
            test_failed "Deployment script not found: $script"
        fi
    done
}

# Test 6: Environment Configuration Validation
test_environment_configuration() {
    log "Testing environment configuration..."
    
    # Test Terraform variables
    if [[ -f "infra/terraform/variables.tf" ]]; then
        local required_vars=("environment" "cloud_provider" "project_name")
        
        for var in "${required_vars[@]}"; do
            if grep -q "variable \"$var\"" infra/terraform/variables.tf; then
                test_passed "Terraform variable defined: $var"
            else
                test_failed "Terraform variable missing: $var"
            fi
        done
    fi
    
    # Test environment-specific configurations
    local environments=("staging" "production")
    
    for env in "${environments[@]}"; do
        # Check if environment has proper configuration in Terraform locals
        if grep -q "$env" infra/terraform/variables.tf; then
            test_passed "Environment configuration found: $env"
        else
            test_failed "Environment configuration missing: $env"
        fi
    done
}

# Test 7: Cloud Provider Support Validation
test_cloud_provider_support() {
    log "Testing cloud provider support..."
    
    local supported_providers=("aws" "gcp" "azure" "digitalocean" "local")
    
    for provider in "${supported_providers[@]}"; do
        if grep -q "$provider" infra/terraform/variables.tf; then
            test_passed "Cloud provider supported: $provider"
        else
            test_failed "Cloud provider support missing: $provider"
        fi
    done
}

# Test 8: Multi-Environment Resource Naming
test_resource_naming() {
    log "Testing resource naming conventions..."
    
    # Check Terraform resource naming
    if grep -q "local.resource_prefix\|local.name_prefix" infra/terraform/main.tf; then
        test_passed "Resource naming convention implemented in Terraform"
    else
        test_failed "Resource naming convention missing in Terraform"
    fi
    
    # Check Docker Compose naming
    if grep -q "pfm-\${ENVIRONMENT}" infra/docker-compose/staging.yml; then
        test_passed "Resource naming convention implemented in Docker Compose"
    else
        test_failed "Resource naming convention missing in Docker Compose"
    fi
}

# Test 9: Security Configuration Validation
test_security_configuration() {
    log "Testing security configuration..."
    
    # Check for environment-specific password handling
    if grep -q "production.*CHANGE_IN_PRODUCTION" infra/terraform/main.tf; then
        test_passed "Production password security implemented"
    else
        test_failed "Production password security missing"
    fi
    
    # Check for secrets management in Kubernetes
    if grep -q "secretKeyRef" infra/kubernetes/deployments.yaml; then
        test_passed "Kubernetes secrets management implemented"
    else
        test_failed "Kubernetes secrets management missing"
    fi
    
    # Check for health checks
    if grep -q "healthcheck" infra/docker-compose/staging.yml; then
        test_passed "Health checks implemented in Docker Compose"
    else
        test_failed "Health checks missing in Docker Compose"
    fi
}

# Test 10: Monitoring and Observability Setup
test_monitoring_setup() {
    log "Testing monitoring and observability setup..."
    
    # Check for monitoring services in Docker Compose
    if grep -q "prometheus\|grafana" infra/docker-compose/staging.yml; then
        test_passed "Monitoring services defined in Docker Compose"
    else
        test_failed "Monitoring services missing in Docker Compose"
    fi
    
    # Check for resource constraints
    if grep -q "resources:" infra/kubernetes/deployments.yaml; then
        test_passed "Resource constraints defined in Kubernetes"
    else
        test_failed "Resource constraints missing in Kubernetes"
    fi
}

# Main test runner
run_infrastructure_integration_tests() {
    log "🚀 Starting Infrastructure Integration Test Suite"
    
    # Run all tests
    test_infrastructure_files
    test_terraform_configuration
    test_kubernetes_manifests
    test_docker_compose_configuration
    test_deployment_scripts
    test_environment_configuration
    test_cloud_provider_support
    test_resource_naming
    test_security_configuration
    test_monitoring_setup
    
    log "=== Infrastructure Integration Test Results ==="
    log "Passed: $TESTS_PASSED/$((TESTS_PASSED + TESTS_FAILED)) tests"
    
    if [[ $TESTS_FAILED -eq 0 ]]; then
        log "🎉 All infrastructure integration tests passed!"
        return 0
    else
        log "❌ Some infrastructure integration tests failed"
        return 1
    fi
}

# Execute tests if script is run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    log "Starting Infrastructure Integration Tests - Task 6.3.1"
    run_infrastructure_integration_tests
    log "✅ Infrastructure Integration Tests: $([ $? -eq 0 ] && echo 'PASSED' || echo 'FAILED')"
fi 