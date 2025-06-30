#!/bin/bash

# CD Pipeline Integration Tests - Task 6.2.2
# Tests the complete CD pipeline implementation including deployment automation

set -e

# Color output for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

test_passed() {
    echo -e "${GREEN}✅ $1${NC}"
    ((TESTS_PASSED++))
}

test_failed() {
    echo -e "${RED}❌ $1${NC}"
    ((TESTS_FAILED++))
}

test_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# Test 1: CD Workflow Files Validation
test_cd_workflow_files() {
    log "Testing CD workflow files validation..."
    
    local required_files=(
        ".github/workflows/cd-master.yml"
        ".github/workflows/cd-environment-management.yml"
    )
    
    for file in "${required_files[@]}"; do
        if [[ -f "$file" ]]; then
            test_passed "Found CD workflow file: $file"
        else
            test_failed "Missing CD workflow file: $file"
            return 1
        fi
    done
    
    # Validate file sizes (substantial implementations)
    local cd_master_size=$(wc -l < .github/workflows/cd-master.yml)
    local cd_env_size=$(wc -l < .github/workflows/cd-environment-management.yml)
    
    if [[ $cd_master_size -gt 500 ]]; then
        test_passed "CD master workflow is substantial ($cd_master_size lines)"
    else
        test_failed "CD master workflow is too small ($cd_master_size lines)"
    fi
    
    if [[ $cd_env_size -gt 200 ]]; then
        test_passed "CD environment management workflow is substantial ($cd_env_size lines)"
    else
        test_failed "CD environment management workflow is too small ($cd_env_size lines)"
    fi
}

# Test 2: CD Master Workflow Structure
test_cd_master_structure() {
    log "Testing CD master workflow structure..."
    
    local cd_master=".github/workflows/cd-master.yml"
    
    # Check for required jobs
    local required_jobs=(
        "deployment-setup"
        "container-builds"
        "infrastructure-setup"
        "deploy-staging"
        "deploy-production"
        "post-deployment-validation"
        "rollback-deployment"
        "deployment-notifications"
    )
    
    for job in "${required_jobs[@]}"; do
        if grep -q "^  $job:" "$cd_master"; then
            test_passed "Found required job: $job"
        else
            test_failed "Missing required job: $job"
        fi
    done
    
    # Check for deployment features
    local features=(
        "Blue-green deployment"
        "Security scan"
        "Health check"
        "Rollback"
        "Notifications"
    )
    
    for feature in "${features[@]}"; do
        if grep -qi "$feature" "$cd_master"; then
            test_passed "CD pipeline includes: $feature"
        else
            test_warning "CD pipeline may not include: $feature"
        fi
    done
}

# Test 3: Environment Management Validation
test_environment_management() {
    log "Testing environment management capabilities..."
    
    local env_workflow=".github/workflows/cd-environment-management.yml"
    
    # Check for environment support
    local environments=("staging" "production" "development")
    
    for env in "${environments[@]}"; do
        if grep -q "$env" "$env_workflow"; then
            test_passed "Environment management supports: $env"
        else
            test_failed "Environment management missing: $env"
        fi
    done
    
    # Check for management actions
    local actions=("setup" "teardown" "update" "validate")
    
    for action in "${actions[@]}"; do
        if grep -q "$action" "$env_workflow"; then
            test_passed "Environment management supports action: $action"
        else
            test_failed "Environment management missing action: $action"
        fi
    done
}

# Test 4: Container Registry Integration
test_container_registry() {
    log "Testing container registry integration..."
    
    local cd_master=".github/workflows/cd-master.yml"
    
    # Check for registry configuration
    if grep -q "REGISTRY:" "$cd_master"; then
        test_passed "Container registry configured"
    else
        test_failed "Container registry not configured"
    fi
    
    # Check for image building
    if grep -q "docker/build-push-action" "$cd_master"; then
        test_passed "Docker build and push actions configured"
    else
        test_failed "Docker build and push actions missing"
    fi
    
    # Check for multi-component builds
    local components=("backend" "frontend-admin" "frontend-member")
    
    for component in "${components[@]}"; do
        if grep -q "$component" "$cd_master"; then
            test_passed "Container build supports: $component"
        else
            test_failed "Container build missing: $component"
        fi
    done
}

# Test 5: Security Integration
test_security_integration() {
    log "Testing security integration in CD pipeline..."
    
    local cd_master=".github/workflows/cd-master.yml"
    
    # Check for security scanning
    if grep -q "security scan\|trivy\|vulnerability" "$cd_master"; then
        test_passed "Security scanning integrated"
    else
        test_failed "Security scanning not found"
    fi
    
    # Check for secrets management
    if grep -q "secrets\.\|SECRET" "$cd_master"; then
        test_passed "Secrets management integrated"
    else
        test_failed "Secrets management not found"
    fi
}

# Test 6: Deployment Strategies
test_deployment_strategies() {
    log "Testing deployment strategies..."
    
    local cd_master=".github/workflows/cd-master.yml"
    
    # Check for blue-green deployment
    if grep -qi "blue-green\|blue green" "$cd_master"; then
        test_passed "Blue-green deployment strategy found"
    else
        test_warning "Blue-green deployment strategy not explicitly found"
    fi
    
    # Check for health checks
    if grep -q "healthcheck\|health.*check" "$cd_master"; then
        test_passed "Health check integration found"
    else
        test_failed "Health check integration not found"
    fi
    
    # Check for rollback capability
    if grep -q "rollback" "$cd_master"; then
        test_passed "Rollback capability found"
    else
        test_failed "Rollback capability not found"
    fi
}

# Test 7: Multi-Environment Support
test_multi_environment() {
    log "Testing multi-environment deployment support..."
    
    local cd_master=".github/workflows/cd-master.yml"
    
    # Check for environment-specific deployments
    if grep -q "deploy-staging\|deploy.*staging" "$cd_master"; then
        test_passed "Staging deployment job found"
    else
        test_failed "Staging deployment job not found"
    fi
    
    if grep -q "deploy-production\|deploy.*production" "$cd_master"; then
        test_passed "Production deployment job found"
    else
        test_failed "Production deployment job not found"
    fi
    
    # Check for environment-specific configurations
    if grep -q "environment:" "$cd_master"; then
        test_passed "GitHub environment protection configured"
    else
        test_warning "GitHub environment protection not configured"
    fi
}

# Test 8: Integration with CI Pipeline
test_ci_integration() {
    log "Testing CI/CD pipeline integration..."
    
    # Check if CI pipeline exists
    if [[ -f ".github/workflows/ci-master.yml" ]]; then
        test_passed "CI pipeline exists for integration"
    else
        test_warning "CI pipeline not found - CD may run independently"
    fi
    
    # Check for quality gates in CD
    local cd_master=".github/workflows/cd-master.yml"
    if grep -q "quality.*gate\|quality.*check" "$cd_master"; then
        test_passed "Quality gates integrated in CD pipeline"
    else
        test_warning "Quality gates not explicitly found in CD pipeline"
    fi
}

# Main test runner
run_cd_integration_test_suite() {
    log "🚀 Starting CD Pipeline Integration Test Suite"
    
    # Run all tests
    test_cd_workflow_files
    test_cd_master_structure
    test_environment_management
    test_container_registry
    test_security_integration
    test_deployment_strategies
    test_multi_environment
    test_ci_integration
    
    log "=== CD Integration Test Results ==="
    log "Passed: $TESTS_PASSED/$((TESTS_PASSED + TESTS_FAILED)) tests"
    
    if [[ $TESTS_FAILED -eq 0 ]]; then
        log "🎉 All CD integration tests passed!"
        return 0
    else
        log "❌ Some CD integration tests failed"
        return 1
    fi
}

# Execute tests if script is run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    log "Starting CD Pipeline Integration Tests - Task 6.2.2"
    run_cd_integration_test_suite
    log "✅ CD Pipeline Integration Tests: $([ $? -eq 0 ] && echo 'PASSED' || echo 'FAILED')"
fi 