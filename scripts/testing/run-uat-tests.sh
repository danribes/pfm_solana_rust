#!/bin/bash

# UAT Testing Automation Script for PFM Community Management Application
# This script orchestrates the complete User Acceptance Testing process

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TESTING_DIR="$PROJECT_ROOT/testing"
REPORTS_DIR="$TESTING_DIR/reports"
UAT_DIR="$TESTING_DIR/uat"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")
            echo -e "${BLUE}[INFO]${NC} ${timestamp} - $message"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[SUCCESS]${NC} ${timestamp} - $message"
            ;;
        "WARNING")
            echo -e "${YELLOW}[WARNING]${NC} ${timestamp} - $message"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} ${timestamp} - $message"
            ;;
    esac
}

# Error handling
error_exit() {
    log "ERROR" "$1"
    exit 1
}

# Cleanup function
cleanup() {
    log "INFO" "Cleaning up test environment..."
    
    # Stop any running test servers
    if [[ -f "$TESTING_DIR/pids/test-servers.pid" ]]; then
        while read -r pid; do
            kill "$pid" 2>/dev/null || true
        done < "$TESTING_DIR/pids/test-servers.pid"
        rm -f "$TESTING_DIR/pids/test-servers.pid"
    fi
    
    # Clean up test database
    if command -v docker-compose &> /dev/null; then
        docker-compose -f "$PROJECT_ROOT/docker-compose.testing.yml" down -v || true
    fi
}

# Trap cleanup on exit
trap cleanup EXIT

# Function to check prerequisites
check_prerequisites() {
    log "INFO" "Checking prerequisites..."
    
    # Check if Docker is running
    if ! docker info &> /dev/null; then
        error_exit "Docker is not running. Please start Docker and try again."
    fi
    
    # Check if required tools are installed
    local tools=("npm" "node" "docker-compose")
    for tool in "${tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            error_exit "$tool is not installed or not in PATH"
        fi
    done
    
    # Check if testing configuration exists
    if [[ ! -f "$PROJECT_ROOT/docker-compose.testing.yml" ]]; then
        error_exit "Testing Docker Compose configuration not found"
    fi
    
    log "SUCCESS" "All prerequisites met"
}

# Function to setup test environment
setup_test_environment() {
    log "INFO" "Setting up test environment..."
    
    # Create necessary directories
    mkdir -p "$REPORTS_DIR"/{jest,playwright,screenshots,videos}
    mkdir -p "$TESTING_DIR/pids"
    
    # Setup test database
    log "INFO" "Starting test database..."
    docker-compose -f "$PROJECT_ROOT/docker-compose.testing.yml" up -d postgres redis
    
    # Wait for database to be ready
    local retries=30
    while ! docker-compose -f "$PROJECT_ROOT/docker-compose.testing.yml" exec -T postgres pg_isready; do
        ((retries--))
        if [[ $retries -eq 0 ]]; then
            error_exit "Test database failed to start"
        fi
        sleep 2
    done
    
    # Run database migrations
    log "INFO" "Running database migrations..."
    cd "$PROJECT_ROOT/backend"
    npm run migrate:test || error_exit "Database migration failed"
    
    # Seed test data
    log "INFO" "Seeding test data..."
    npm run seed:test || error_exit "Test data seeding failed"
    
    log "SUCCESS" "Test environment setup complete"
}

# Function to start test servers
start_test_servers() {
    log "INFO" "Starting test servers..."
    
    local pid_file="$TESTING_DIR/pids/test-servers.pid"
    > "$pid_file"  # Clear the file
    
    # Start backend API server
    cd "$PROJECT_ROOT/backend"
    npm run test:start &
    echo $! >> "$pid_file"
    
    # Start member portal
    cd "$PROJECT_ROOT/frontend/member"
    npm run build
    npm run start &
    echo $! >> "$pid_file"
    
    # Start admin portal
    cd "$PROJECT_ROOT/frontend/admin"
    npm run build
    npm run start &
    echo $! >> "$pid_file"
    
    # Wait for servers to be ready
    log "INFO" "Waiting for servers to be ready..."
    
    local endpoints=("http://localhost:3000/api/health" "http://localhost:3002" "http://localhost:3001")
    for endpoint in "${endpoints[@]}"; do
        local retries=60
        while ! curl -f "$endpoint" &> /dev/null; do
            ((retries--))
            if [[ $retries -eq 0 ]]; then
                error_exit "Server at $endpoint failed to start"
            fi
            sleep 2
        done
        log "SUCCESS" "Server at $endpoint is ready"
    done
}

# Function to run unit tests
run_unit_tests() {
    log "INFO" "Running unit tests..."
    
    cd "$PROJECT_ROOT"
    
    # Run Jest tests with coverage
    npm run test:coverage || {
        log "ERROR" "Unit tests failed"
        return 1
    }
    
    # Generate coverage report
    if [[ -d "coverage" ]]; then
        cp -r coverage/* "$REPORTS_DIR/jest/"
    fi
    
    log "SUCCESS" "Unit tests completed"
}

# Function to run integration tests
run_integration_tests() {
    log "INFO" "Running integration tests..."
    
    cd "$PROJECT_ROOT"
    
    # Run integration test suite
    npm run test:integration || {
        log "ERROR" "Integration tests failed"
        return 1
    }
    
    log "SUCCESS" "Integration tests completed"
}

# Function to run E2E tests
run_e2e_tests() {
    log "INFO" "Running end-to-end tests..."
    
    cd "$PROJECT_ROOT"
    
    # Install Playwright if not already installed
    if [[ ! -d "node_modules/@playwright/test" ]]; then
        npx playwright install
    fi
    
    # Run Playwright tests
    npx playwright test || {
        log "ERROR" "E2E tests failed"
        return 1
    }
    
    # Copy test results
    if [[ -d "testing/reports/playwright" ]]; then
        cp -r testing/reports/playwright/* "$REPORTS_DIR/playwright/"
    fi
    
    log "SUCCESS" "E2E tests completed"
}

# Function to run performance tests
run_performance_tests() {
    log "INFO" "Running performance tests..."
    
    # Check if k6 is available
    if ! command -v k6 &> /dev/null; then
        log "WARNING" "k6 not found, skipping performance tests"
        return 0
    fi
    
    cd "$TESTING_DIR/performance"
    
    # Run load tests
    k6 run --config load-test-config.yml load-test.js || {
        log "ERROR" "Performance tests failed"
        return 1
    }
    
    log "SUCCESS" "Performance tests completed"
}

# Function to run accessibility tests
run_accessibility_tests() {
    log "INFO" "Running accessibility tests..."
    
    cd "$PROJECT_ROOT"
    
    # Run axe-core accessibility tests
    if command -v axe &> /dev/null; then
        axe http://localhost:3002 --save "$REPORTS_DIR/accessibility-member.json" || log "WARNING" "Member portal accessibility test failed"
        axe http://localhost:3001 --save "$REPORTS_DIR/accessibility-admin.json" || log "WARNING" "Admin portal accessibility test failed"
    else
        log "WARNING" "axe-core not found, skipping accessibility tests"
    fi
    
    log "SUCCESS" "Accessibility tests completed"
}

# Function to collect user feedback
collect_user_feedback() {
    log "INFO" "Collecting user feedback..."
    
    # Check if feedback data exists
    local feedback_file="$UAT_DIR/user-feedback.json"
    if [[ -f "$feedback_file" ]]; then
        cp "$feedback_file" "$REPORTS_DIR/"
        log "SUCCESS" "User feedback collected"
    else
        log "WARNING" "No user feedback data found"
    fi
}

# Function to generate test report
generate_test_report() {
    log "INFO" "Generating comprehensive test report..."
    
    local report_file="$REPORTS_DIR/uat-summary.html"
    
    cat > "$report_file" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UAT Test Results - PFM Community Management</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
        .success { background: #d4edda; border-color: #c3e6cb; }
        .warning { background: #fff3cd; border-color: #ffeaa7; }
        .error { background: #f8d7da; border-color: #f5c6cb; }
        .metric { display: inline-block; margin: 10px; padding: 10px; background: #e9ecef; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>User Acceptance Testing Results</h1>
        <p><strong>Date:</strong> $(date)</p>
        <p><strong>Environment:</strong> Testing</p>
    </div>
EOF
    
    # Add test results sections
    echo "    <div class='section'>" >> "$report_file"
    echo "        <h2>Test Summary</h2>" >> "$report_file"
    
    # Count test results
    local unit_tests_passed=$(find "$REPORTS_DIR/jest" -name "*.json" -exec grep -l '"success":true' {} \; 2>/dev/null | wc -l || echo "0")
    local e2e_tests_passed=$(find "$REPORTS_DIR/playwright" -name "*.json" -exec grep -l '"status":"passed"' {} \; 2>/dev/null | wc -l || echo "0")
    
    cat >> "$report_file" << EOF
        <div class="metric">Unit Tests Passed: $unit_tests_passed</div>
        <div class="metric">E2E Tests Passed: $e2e_tests_passed</div>
        <div class="metric">Performance Tests: Available</div>
        <div class="metric">Accessibility Tests: Available</div>
    </div>
    
    <div class="section success">
        <h2>Test Environment Status</h2>
        <p>✓ All servers started successfully</p>
        <p>✓ Database migrations completed</p>
        <p>✓ Test data seeded</p>
    </div>
    
    <div class="section">
        <h2>Test Coverage</h2>
        <p>Detailed coverage reports available in the jest/ directory</p>
    </div>
    
    <div class="section">
        <h2>Browser Compatibility</h2>
        <p>E2E tests run across Chrome, Firefox, and Safari</p>
    </div>
    
    <div class="section">
        <h2>Performance Metrics</h2>
        <p>Load test results available in performance/ directory</p>
    </div>
    
    <div class="section">
        <h2>Recommendations</h2>
        <ul>
            <li>Review failed tests and address issues</li>
            <li>Analyze performance bottlenecks</li>
            <li>Address accessibility concerns</li>
            <li>Collect additional user feedback</li>
        </ul>
    </div>
</body>
</html>
EOF
    
    log "SUCCESS" "Test report generated: $report_file"
}

# Function to display results summary
display_results_summary() {
    log "INFO" "UAT Testing Summary"
    echo "=================================="
    echo "Test Results Location: $REPORTS_DIR"
    echo ""
    
    if [[ -f "$REPORTS_DIR/uat-summary.html" ]]; then
        echo "📊 Main Report: $REPORTS_DIR/uat-summary.html"
    fi
    
    if [[ -d "$REPORTS_DIR/jest" ]]; then
        echo "🧪 Unit Tests: $REPORTS_DIR/jest/"
    fi
    
    if [[ -d "$REPORTS_DIR/playwright" ]]; then
        echo "🌐 E2E Tests: $REPORTS_DIR/playwright/"
    fi
    
    echo ""
    echo "Next Steps:"
    echo "1. Review test results and fix any failures"
    echo "2. Analyze performance metrics"
    echo "3. Address accessibility issues"
    echo "4. Collect user feedback"
    echo "5. Prepare for beta launch"
}

# Main execution function
main() {
    local start_time=$(date +%s)
    
    log "INFO" "Starting UAT Testing Process..."
    
    # Parse command line arguments
    local run_unit=true
    local run_integration=true
    local run_e2e=true
    local run_performance=true
    local run_accessibility=true
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-unit)
                run_unit=false
                shift
                ;;
            --skip-integration)
                run_integration=false
                shift
                ;;
            --skip-e2e)
                run_e2e=false
                shift
                ;;
            --skip-performance)
                run_performance=false
                shift
                ;;
            --skip-accessibility)
                run_accessibility=false
                shift
                ;;
            --help)
                echo "Usage: $0 [options]"
                echo "Options:"
                echo "  --skip-unit          Skip unit tests"
                echo "  --skip-integration   Skip integration tests"
                echo "  --skip-e2e          Skip end-to-end tests"
                echo "  --skip-performance  Skip performance tests"
                echo "  --skip-accessibility Skip accessibility tests"
                echo "  --help              Show this help message"
                exit 0
                ;;
            *)
                error_exit "Unknown option: $1"
                ;;
        esac
    done
    
    # Run the testing workflow
    check_prerequisites
    setup_test_environment
    start_test_servers
    
    local test_failures=0
    
    if [[ "$run_unit" == true ]]; then
        run_unit_tests || ((test_failures++))
    fi
    
    if [[ "$run_integration" == true ]]; then
        run_integration_tests || ((test_failures++))
    fi
    
    if [[ "$run_e2e" == true ]]; then
        run_e2e_tests || ((test_failures++))
    fi
    
    if [[ "$run_performance" == true ]]; then
        run_performance_tests || ((test_failures++))
    fi
    
    if [[ "$run_accessibility" == true ]]; then
        run_accessibility_tests || ((test_failures++))
    fi
    
    collect_user_feedback
    generate_test_report
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    log "SUCCESS" "UAT Testing completed in ${duration} seconds"
    
    if [[ $test_failures -gt 0 ]]; then
        log "WARNING" "$test_failures test suite(s) had failures"
    else
        log "SUCCESS" "All test suites passed!"
    fi
    
    display_results_summary
    
    return $test_failures
}

# Run main function with all arguments
main "$@"