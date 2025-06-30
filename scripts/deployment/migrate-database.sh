#!/bin/bash

# Database Migration Script for Deployments
# Task 6.2.2: CD Pipeline Structure & Deployment Automation

set -e

echo "=== Database Migration for Deployment ==="

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
MIGRATION_LOG_FILE="$PROJECT_ROOT/database-migration.log"

# Default configuration
ENVIRONMENT=${ENVIRONMENT:-staging}
DRY_RUN=${DRY_RUN:-false}
FORCE_MIGRATION=${FORCE_MIGRATION:-false}

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$MIGRATION_LOG_FILE"
}

# Validate migration environment
validate_migration_environment() {
    log "🔍 Validating migration environment..."
    
    # Check database connectivity
    log "🔍 Checking database connectivity..."
    cd "$PROJECT_ROOT/backend"
    
    if npm run db:check > /dev/null 2>&1; then
        log "✅ Database connectivity verified"
    else
        log "❌ Database connectivity check failed"
        return 1
    fi
    
    # Check migration files
    if [ -d "database/migrations" ]; then
        MIGRATION_COUNT=$(find database/migrations -name "*.sql" | wc -l)
        log "📊 Found $MIGRATION_COUNT migration files"
    else
        log "⚠️ No migration directory found"
    fi
    
    return 0
}

# Run database migrations
run_migrations() {
    log "🗄️ Running database migrations for $ENVIRONMENT..."
    
    cd "$PROJECT_ROOT/backend"
    
    if [ "$DRY_RUN" == "true" ]; then
        log "🔍 DRY RUN: Would execute database migrations"
        log "🔍 DRY RUN: npm run db:migrate"
        return 0
    fi
    
    # Execute migrations
    if npm run db:migrate; then
        log "✅ Database migrations completed successfully"
        return 0
    else
        log "❌ Database migrations failed"
        return 1
    fi
}

# Main execution
main() {
    log "Starting database migration - Task 6.2.2"
    log "Environment: $ENVIRONMENT"
    log "Dry run: $DRY_RUN"
    
    if validate_migration_environment && run_migrations; then
        log "🎉 Database migration: COMPLETED"
        exit 0
    else
        log "❌ Database migration: FAILED"
        exit 1
    fi
}

main "$@"
