#!/bin/bash

# Deployment & Operational Documentation Integration Tests
# Task 6.5.1: Deployment & Operational Documentation

set -e

echo "=== Deployment & Operational Documentation Integration Tests ==="

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TEST_LOG_FILE="$PROJECT_ROOT/deployment-docs-test.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$TEST_LOG_FILE"
}

# Test status tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

run_test() {
    local test_name="$1"
    local test_function="$2"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    log "🧪 Running test: $test_name"
    
    if $test_function; then
        log "✅ PASSED: $test_name"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        log "❌ FAILED: $test_name"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    echo ""
}

# Test 1: Documentation files structure
test_documentation_files() {
    log "🔍 Testing documentation files structure..."
    
    local docs_dir="$PROJECT_ROOT/docs"
    local required_files=(
        "deployment-guide.md"
        "operations-runbook.md"
        "access-permissions.md"
    )
    
    for file in "${required_files[@]}"; do
        if [[ -f "$docs_dir/$file" ]]; then
            log "✅ Found: $file"
        else
            log "❌ Missing: $file"
            return 1
        fi
    done
    
    # Check main README updates
    if grep -q "Deployment Guide" "$PROJECT_ROOT/README.md"; then
        log "✅ README.md references deployment documentation"
    else
        log "❌ README.md missing deployment documentation references"
        return 1
    fi
    
    return 0
}

# Test 2: Deployment guide completeness
test_deployment_guide_completeness() {
    log "🔍 Testing deployment guide completeness..."
    
    local deployment_guide="$PROJECT_ROOT/docs/deployment-guide.md"
    
    # Check for essential sections
    local required_sections=(
        "Prerequisites"
        "Environment Setup"
        "Development Deployment"
        "Staging Deployment"
        "Production Deployment"
        "Rollback Procedures"
        "Health Checks"
        "Troubleshooting"
    )
    
    for section in "${required_sections[@]}"; do
        if grep -q "## $section" "$deployment_guide"; then
            log "✅ Found section: $section"
        else
            log "❌ Missing section: $section"
            return 1
        fi
    done
    
    # Check for Docker commands
    if grep -q "docker-compose up -d" "$deployment_guide"; then
        log "✅ Contains Docker deployment commands"
    else
        log "❌ Missing Docker deployment commands"
        return 1
    fi
    
    # Check for environment variable documentation
    if grep -q "NODE_ENV=" "$deployment_guide"; then
        log "✅ Contains environment variable configuration"
    else
        log "❌ Missing environment variable configuration"
        return 1
    fi
    
    return 0
}

# Test 3: Operations runbook completeness
test_operations_runbook_completeness() {
    log "🔍 Testing operations runbook completeness..."
    
    local operations_runbook="$PROJECT_ROOT/docs/operations-runbook.md"
    
    # Check for essential sections
    local required_sections=(
        "System Monitoring"
        "Incident Response"
        "Daily Operations"
        "Weekly Operations"
        "Monthly Operations"
        "Troubleshooting Guide"
        "Maintenance Procedures"
        "Disaster Recovery"
    )
    
    for section in "${required_sections[@]}"; do
        if grep -q "## $section" "$operations_runbook"; then
            log "✅ Found section: $section"
        else
            log "❌ Missing section: $section"
            return 1
        fi
    done
    
    # Check for monitoring URLs
    if grep -q "Grafana Dashboard:" "$operations_runbook"; then
        log "✅ Contains monitoring service URLs"
    else
        log "❌ Missing monitoring service URLs"
        return 1
    fi
    
    # Check for incident response procedures
    if grep -q "Severity 1" "$operations_runbook"; then
        log "✅ Contains incident severity classification"
    else
        log "❌ Missing incident severity classification"
        return 1
    fi
    
    return 0
}

# Test 4: Access and permissions documentation
test_access_permissions_documentation() {
    log "🔍 Testing access and permissions documentation..."
    
    local access_doc="$PROJECT_ROOT/docs/access-permissions.md"
    
    # Check for role definitions
    local required_roles=(
        "Super Admin"
        "Community Admin"
        "Community Member"
        "DevOps Engineer"
        "Developer"
    )
    
    for role in "${required_roles[@]}"; do
        if grep -q "$role" "$access_doc"; then
            log "✅ Found role definition: $role"
        else
            log "❌ Missing role definition: $role"
            return 1
        fi
    done
    
    # Check for security procedures
    if grep -q "Multi-Factor Authentication" "$access_doc"; then
        log "✅ Contains MFA documentation"
    else
        log "❌ Missing MFA documentation"
        return 1
    fi
    
    # Check for onboarding procedures
    if grep -q "Onboarding Procedures" "$access_doc"; then
        log "✅ Contains onboarding procedures"
    else
        log "❌ Missing onboarding procedures"
        return 1
    fi
    
    return 0
}

# Test 5: Script references validation
test_script_references() {
    log "🔍 Testing script references in documentation..."
    
    local docs_dir="$PROJECT_ROOT/docs"
    local script_references=(
        "./scripts/deployment/"
        "./scripts/monitoring/"
        "./scripts/backup/"
        "./scripts/security/"
        "./scripts/incident/"
    )
    
    for script_path in "${script_references[@]}"; do
        if grep -r "$script_path" "$docs_dir"/ >/dev/null 2>&1; then
            log "✅ Found script references: $script_path"
        else
            log "❌ Missing script references: $script_path"
            return 1
        fi
    done
    
    return 0
}

# Test 6: Environment-specific procedures
test_environment_procedures() {
    log "🔍 Testing environment-specific procedures..."
    
    local deployment_guide="$PROJECT_ROOT/docs/deployment-guide.md"
    
    # Check for environment-specific sections
    local environments=("development" "staging" "production")
    for env in "${environments[@]}"; do
        if grep -i "$env deployment" "$deployment_guide"; then
            log "✅ Found $env deployment procedures"
        else
            log "❌ Missing $env deployment procedures"
            return 1
        fi
    done
    
    # Check for container-specific documentation
    if grep -q "docker-compose" "$deployment_guide"; then
        log "✅ Contains Docker containerization procedures"
    else
        log "❌ Missing Docker containerization procedures"
        return 1
    fi
    
    return 0
}

# Test 7: Monitoring and alerting documentation
test_monitoring_alerting_docs() {
    log "🔍 Testing monitoring and alerting documentation..."
    
    local operations_runbook="$PROJECT_ROOT/docs/operations-runbook.md"
    
    # Check for monitoring services
    local monitoring_services=("Prometheus" "Grafana" "Loki" "AlertManager")
    for service in "${monitoring_services[@]}"; do
        if grep -q "$service" "$operations_runbook"; then
            log "✅ Found monitoring service: $service"
        else
            log "❌ Missing monitoring service: $service"
            return 1
        fi
    done
    
    # Check for alert thresholds
    if grep -q "Alert Thresholds" "$operations_runbook"; then
        log "✅ Contains alert threshold documentation"
    else
        log "❌ Missing alert threshold documentation"
        return 1
    fi
    
    return 0
}

# Test 8: Security procedures documentation
test_security_procedures() {
    log "🔍 Testing security procedures documentation..."
    
    local access_doc="$PROJECT_ROOT/docs/access-permissions.md"
    
    # Check for security policies
    local security_elements=(
        "Password Policy"
        "API Security"
        "JWT Token"
        "Rate Limiting"
        "Audit and Compliance"
    )
    
    for element in "${security_elements[@]}"; do
        if grep -q "$element" "$access_doc"; then
            log "✅ Found security element: $element"
        else
            log "❌ Missing security element: $element"
            return 1
        fi
    done
    
    return 0
}

# Test 9: Backup and recovery documentation
test_backup_recovery_docs() {
    log "🔍 Testing backup and recovery documentation..."
    
    local operations_runbook="$PROJECT_ROOT/docs/operations-runbook.md"
    
    # Check for backup procedures
    if grep -q "Backup Procedures" "$operations_runbook"; then
        log "✅ Contains backup procedures"
    else
        log "❌ Missing backup procedures"
        return 1
    fi
    
    # Check for disaster recovery
    if grep -q "Disaster Recovery" "$operations_runbook"; then
        log "✅ Contains disaster recovery procedures"
    else
        log "❌ Missing disaster recovery procedures"
        return 1
    fi
    
    # Check for rollback procedures
    local deployment_guide="$PROJECT_ROOT/docs/deployment-guide.md"
    if grep -q "Rollback Procedures" "$deployment_guide"; then
        log "✅ Contains rollback procedures"
    else
        log "❌ Missing rollback procedures"
        return 1
    fi
    
    return 0
}

# Test 10: Troubleshooting guides
test_troubleshooting_guides() {
    log "🔍 Testing troubleshooting guides..."
    
    local operations_runbook="$PROJECT_ROOT/docs/operations-runbook.md"
    
    # Check for common issues
    local common_issues=(
        "Database Connection"
        "Performance Issues"
        "Container Startup"
        "Blockchain Connectivity"
    )
    
    for issue in "${common_issues[@]}"; do
        if grep -q "$issue" "$operations_runbook"; then
            log "✅ Found troubleshooting for: $issue"
        else
            log "❌ Missing troubleshooting for: $issue"
            return 1
        fi
    done
    
    return 0
}

# Test 11: Code examples and commands validation
test_code_examples() {
    log "🔍 Testing code examples and commands..."
    
    local docs_dir="$PROJECT_ROOT/docs"
    
    # Check for bash code blocks
    if grep -r '```bash' "$docs_dir"/ >/dev/null 2>&1; then
        log "✅ Contains bash command examples"
    else
        log "❌ Missing bash command examples"
        return 1
    fi
    
    # Check for Docker commands
    if grep -r 'docker-compose' "$docs_dir"/ >/dev/null 2>&1; then
        log "✅ Contains Docker commands"
    else
        log "❌ Missing Docker commands"
        return 1
    fi
    
    # Check for API examples
    if grep -r 'curl -X' "$docs_dir"/ >/dev/null 2>&1; then
        log "✅ Contains API examples"
    else
        log "❌ Missing API examples"
        return 1
    fi
    
    return 0
}

# Test 12: Integration with existing infrastructure
test_infrastructure_integration() {
    log "🔍 Testing infrastructure integration documentation..."
    
    local deployment_guide="$PROJECT_ROOT/docs/deployment-guide.md"
    
    # Check references to existing infrastructure
    local infrastructure_components=(
        "monitoring"
        "logging"
        "CI/CD"
        "backup"
        "security"
    )
    
    for component in "${infrastructure_components[@]}"; do
        if grep -i "$component" "$deployment_guide"; then
            log "✅ References infrastructure component: $component"
        else
            log "❌ Missing infrastructure component: $component"
            return 1
        fi
    done
    
    # Check for containerization consistency
    if grep -q "fully containerized" "$deployment_guide"; then
        log "✅ Emphasizes containerization approach"
    else
        log "❌ Missing containerization emphasis"
        return 1
    fi
    
    return 0
}

# Test 13: Compliance and audit documentation
test_compliance_audit_docs() {
    log "🔍 Testing compliance and audit documentation..."
    
    local access_doc="$PROJECT_ROOT/docs/access-permissions.md"
    
    # Check for audit procedures
    if grep -q "Audit Log" "$access_doc"; then
        log "✅ Contains audit logging procedures"
    else
        log "❌ Missing audit logging procedures"
        return 1
    fi
    
    # Check for compliance frameworks
    local compliance_frameworks=("GDPR" "SOX")
    for framework in "${compliance_frameworks[@]}"; do
        if grep -q "$framework" "$access_doc"; then
            log "✅ References compliance framework: $framework"
        else
            log "❌ Missing compliance framework: $framework"
            return 1
        fi
    done
    
    return 0
}

# Test 14: Documentation maintenance procedures
test_documentation_maintenance() {
    log "🔍 Testing documentation maintenance procedures..."
    
    local operations_runbook="$PROJECT_ROOT/docs/operations-runbook.md"
    
    # Check for documentation update procedures
    if grep -q "Documentation" "$operations_runbook"; then
        log "✅ Contains documentation maintenance procedures"
    else
        log "❌ Missing documentation maintenance procedures"
        return 1
    fi
    
    # Check for version control references
    if grep -r "git" "$PROJECT_ROOT/docs"/ >/dev/null 2>&1; then
        log "✅ References version control procedures"
    else
        log "❌ Missing version control procedures"
        return 1
    fi
    
    return 0
}

# Run all tests
main() {
    log "Starting deployment and operational documentation tests..."
    echo ""
    
    run_test "Documentation Files Structure" test_documentation_files
    run_test "Deployment Guide Completeness" test_deployment_guide_completeness
    run_test "Operations Runbook Completeness" test_operations_runbook_completeness
    run_test "Access Permissions Documentation" test_access_permissions_documentation
    run_test "Script References Validation" test_script_references
    run_test "Environment Procedures" test_environment_procedures
    run_test "Monitoring & Alerting Documentation" test_monitoring_alerting_docs
    run_test "Security Procedures" test_security_procedures
    run_test "Backup & Recovery Documentation" test_backup_recovery_docs
    run_test "Troubleshooting Guides" test_troubleshooting_guides
    run_test "Code Examples & Commands" test_code_examples
    run_test "Infrastructure Integration" test_infrastructure_integration
    run_test "Compliance & Audit Documentation" test_compliance_audit_docs
    run_test "Documentation Maintenance" test_documentation_maintenance
    
    # Summary
    echo "========================================"
    log "📊 TEST SUMMARY"
    echo "========================================"
    log "Total Tests: $TOTAL_TESTS"
    log "Passed: $PASSED_TESTS"
    log "Failed: $FAILED_TESTS"
    log "Success Rate: $(( PASSED_TESTS * 100 / TOTAL_TESTS ))%"
    echo ""
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "${GREEN}✅ All deployment and operational documentation tests passed!${NC}"
        log "✅ All deployment and operational documentation tests passed!"
        return 0
    else
        echo -e "${RED}❌ Some tests failed. Check the log for details.${NC}"
        log "❌ Some tests failed"
        return 1
    fi
}

# Run the main function
main "$@" 