#!/bin/bash

# CI Pipeline Integration Tests
# Task 6.2.1: CI Pipeline Structure & Workflow Design

set -e

echo "=== CI Pipeline Integration Tests ==="

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TEST_LOG_FILE="$PROJECT_ROOT/ci-integration-test.log"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$TEST_LOG_FILE"
}

# Test workflow files
test_workflow_files() {
    log "🔍 Testing CI workflow files structure..."
    
    local workflows_dir="$PROJECT_ROOT/.github/workflows"
    local required_workflows=(
        "ci-master.yml"
        "ci-contracts.yml"
        "ci-backend.yml"
        "ci-frontend.yml"
        "reusable-setup.yml"
    )
    
    for workflow in "${required_workflows[@]}"; do
        if [[ -f "$workflows_dir/$workflow" ]]; then
            log "✅ Found workflow: $workflow"
        else
            log "❌ Missing workflow: $workflow"
            return 1
        fi
    done
    
    log "✅ All workflow files validated successfully"
    return 0
}

# Test master workflow structure
test_master_workflow_structure() {
    log "🔍 Testing master workflow structure..."
    
    local master_workflow="$PROJECT_ROOT/.github/workflows/ci-master.yml"
    
    # Check for required jobs
    local required_jobs=(
        "pipeline-setup"
        "contracts-pipeline"
        "backend-pipeline"
        "frontend-pipeline"
        "integration-tests"
        "security-analysis"
        "quality-gates"
        "notifications"
    )
    
    for job in "${required_jobs[@]}"; do
        if grep -q "$job:" "$master_workflow"; then
            log "✅ Found required job: $job"
        else
            log "❌ Missing required job: $job"
            return 1
        fi
    done
    
    log "✅ Master workflow structure validated"
    return 0
}

# Run test suite
run_integration_test_suite() {
    log "🚀 Starting CI Pipeline Integration Test Suite"
    
    local tests=(
        "test_workflow_files"
        "test_master_workflow_structure"
    )
    
    local passed=0
    local total=${#tests[@]}
    
    for test in "${tests[@]}"; do
        log "Running test: $test"
        if $test; then
            ((passed++))
            log "✅ Test passed: $test"
        else
            log "❌ Test failed: $test"
        fi
        echo ""
    done
    
    log "=== Integration Test Results ==="
    log "Passed: $passed/$total tests"
    
    if [[ $passed -eq $total ]]; then
        log "🎉 All integration tests passed!"
        return 0
    else
        log "❌ Some integration tests failed"
        return 1
    fi
}

# Main execution
main() {
    log "Starting CI Pipeline Integration Tests - Task 6.2.1"
    cd "$PROJECT_ROOT"
    
    if run_integration_test_suite; then
        log "✅ CI Pipeline Integration Tests: PASSED"
        exit 0
    else
        log "❌ CI Pipeline Integration Tests: FAILED"
        exit 1
    fi
}

main "$@"
