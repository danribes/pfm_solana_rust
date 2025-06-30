# PFM Community Management Application - Operations Runbook

## Table of Contents
- [Overview](#overview)
- [System Monitoring](#system-monitoring)
- [Incident Response](#incident-response)
- [Daily Operations](#daily-operations)
- [Weekly Operations](#weekly-operations)
- [Monthly Operations](#monthly-operations)
- [Troubleshooting Guide](#troubleshooting-guide)
- [Maintenance Procedures](#maintenance-procedures)
- [Performance Optimization](#performance-optimization)
- [Security Operations](#security-operations)
- [Disaster Recovery](#disaster-recovery)

---

## Overview

This operations runbook provides procedures for monitoring, maintaining, and troubleshooting the PFM Community Management Application in production environments. The application is fully containerized and includes blockchain functionality, requiring specialized operational procedures.

**Key Components:**
- **Application Services:** Backend API, Admin Portal, Member Portal
- **Data Layer:** PostgreSQL database, Redis cache
- **Blockchain:** Solana smart contracts and RPC connectivity
- **Infrastructure:** Monitoring (Prometheus/Grafana), Logging (Loki/Promtail)
- **Container Orchestration:** Docker Compose / Kubernetes

---

## System Monitoring

### Health Check Dashboard Access
```bash
# Primary Monitoring URLs
Grafana Dashboard:     http://monitoring.pfm-community.com:3003
Prometheus Metrics:    http://monitoring.pfm-community.com:9090
Loki Logs:            http://monitoring.pfm-community.com:3100
AlertManager:         http://monitoring.pfm-community.com:9093

# Application Health Endpoints
Backend API:          http://api.pfm-community.com/health
Admin Portal:         http://admin.pfm-community.com/health
Member Portal:        http://app.pfm-community.com/health
```

### Key Metrics to Monitor

#### Application Performance Metrics
```bash
# HTTP Request Metrics
- pfm_http_requests_total (requests per second by service)
- pfm_http_request_duration_seconds (response time percentiles)
- pfm_http_errors_total (error rate by service and status code)

# Business Logic Metrics
- pfm_votes_total (voting activity)
- pfm_communities_total (community count)
- pfm_wallet_connections_total (blockchain connectivity)
- pfm_active_users (user engagement)

# System Resource Metrics
- container_memory_usage_bytes (memory utilization)
- container_cpu_usage_seconds_total (CPU utilization)
- container_disk_usage_bytes (disk space usage)
- database_connections_active (database pool usage)
```

#### Infrastructure Health Metrics
```bash
# Database Metrics
- postgresql_up (database availability)
- postgresql_connections_active (connection count)
- postgresql_slow_queries (query performance)
- postgresql_locks_waiting (lock contention)

# Cache Metrics
- redis_up (cache availability)
- redis_memory_usage_bytes (memory usage)
- redis_hit_rate (cache effectiveness)
- redis_connections_active (connection count)

# Blockchain Metrics
- solana_rpc_health (RPC endpoint status)
- solana_rpc_latency_seconds (response time)
- solana_transaction_success_rate (transaction reliability)
```

### Alert Thresholds

#### Critical Alerts (Immediate Response Required)
```yaml
Service Down: Any service unavailable for > 1 minute
High Error Rate: > 5% error rate for > 2 minutes
Database Down: PostgreSQL unavailable for > 30 seconds
Memory Critical: > 90% memory usage for > 5 minutes
Disk Critical: > 95% disk usage
Security Incident: Authentication failures > 10/minute
```

#### Warning Alerts (Response Within 15 Minutes)
```yaml
High Response Time: > 2 seconds 95th percentile for > 5 minutes
Database Slow Queries: > 5 slow queries/minute
Cache Miss Rate: < 80% hit rate for > 10 minutes
Resource Usage: > 80% CPU/memory for > 10 minutes
Blockchain Latency: > 5 seconds RPC response time
```

---

## Incident Response

### Incident Classification

#### Severity 1 (Critical)
- **Definition:** Complete service outage or data corruption
- **Response Time:** Immediate (< 5 minutes)
- **Examples:** Database down, all services unavailable, security breach

#### Severity 2 (High)
- **Definition:** Major functionality impaired
- **Response Time:** 15 minutes
- **Examples:** Single service down, high error rates, blockchain connectivity lost

#### Severity 3 (Medium)
- **Definition:** Reduced performance or minor functionality issues
- **Response Time:** 1 hour
- **Examples:** Slow response times, cache issues, minor UI problems

#### Severity 4 (Low)
- **Definition:** Minor issues not affecting core functionality
- **Response Time:** 4 hours
- **Examples:** Log errors, monitoring alerts, documentation updates

### Incident Response Procedures

#### 1. Initial Response (First 5 Minutes)
```bash
# Assess incident severity
./scripts/incident/assess-severity.sh

# Gather initial information
./scripts/incident/gather-info.sh
# - Check service status
# - Review recent deployments
# - Check monitoring dashboards
# - Review error logs

# Notify stakeholders
./scripts/incident/notify-stakeholders.sh <severity>
# - Operations team
# - Development team
# - Management (for Sev 1/2)
```

#### 2. Investigation (5-15 Minutes)
```bash
# Check service health
docker-compose ps
curl -f http://api.pfm-community.com/health

# Review recent logs
docker-compose logs --tail=100 backend
docker-compose logs --tail=100 admin-portal
docker-compose logs --tail=100 member-portal

# Check system resources
docker stats
df -h

# Review monitoring dashboards
# Check Grafana alerts and metrics
# Review Loki logs for error patterns
```

#### 3. Immediate Mitigation
```bash
# Service restart (if needed)
docker-compose restart <service-name>

# Emergency rollback (if deployment-related)
./scripts/deployment/emergency-rollback.sh production

# Scale resources (if resource-related)
docker-compose scale backend=3

# Isolate affected components
./scripts/incident/isolate-component.sh <component>
```

#### 4. Root Cause Analysis
```bash
# Detailed log analysis
./scripts/incident/analyze-logs.sh --since="1 hour ago"

# Performance analysis
./scripts/incident/performance-analysis.sh

# Database query analysis
docker-compose exec postgres psql -U pfm_user -c "
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY total_time DESC LIMIT 10;"

# Review code changes
git log --oneline --since="24 hours ago"
```

#### 5. Resolution and Follow-up
```bash
# Apply permanent fix
./scripts/incident/apply-fix.sh

# Validate resolution
./scripts/incident/validate-fix.sh

# Update stakeholders
./scripts/incident/update-stakeholders.sh "Incident resolved"

# Document incident
./scripts/incident/create-incident-report.sh
```

### Common Incident Scenarios

#### Database Connection Pool Exhaustion
```bash
# Symptoms: HTTP 500 errors, "too many connections" messages
# Investigation:
docker-compose exec postgres psql -U pfm_user -c "SELECT count(*) FROM pg_stat_activity;"

# Immediate Fix:
docker-compose restart backend

# Permanent Fix:
# Increase max_connections in PostgreSQL configuration
# Optimize connection pool settings in application
```

#### Memory Leak in Application
```bash
# Symptoms: Gradual memory increase, eventual OOM kills
# Investigation:
docker stats
docker-compose logs backend | grep -i "memory\|oom"

# Immediate Fix:
docker-compose restart backend

# Permanent Fix:
# Review application code for memory leaks
# Implement memory monitoring and limits
```

#### Blockchain RPC Failure
```bash
# Symptoms: Transaction failures, blockchain connectivity errors
# Investigation:
curl -X POST https://api.mainnet-beta.solana.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getVersion"}'

# Immediate Fix:
# Switch to backup RPC endpoint
export SOLANA_RPC_URL=https://backup-rpc.solana.com
docker-compose restart backend

# Permanent Fix:
# Implement RPC endpoint failover
# Add RPC health monitoring
```

---

## Daily Operations

### Morning Checklist (9:00 AM)
```bash
# 1. Review overnight alerts
./scripts/daily/review-alerts.sh

# 2. Check service health
./scripts/daily/health-check.sh

# 3. Review resource usage
./scripts/daily/resource-check.sh

# 4. Check backup status
./scripts/daily/backup-status.sh

# 5. Review error rates
./scripts/daily/error-analysis.sh

# 6. Validate blockchain connectivity
./scripts/daily/blockchain-check.sh
```

### Evening Checklist (6:00 PM)
```bash
# 1. Review daily metrics
./scripts/daily/metrics-summary.sh

# 2. Check log volume and errors
./scripts/daily/log-summary.sh

# 3. Validate monitoring systems
./scripts/daily/monitoring-check.sh

# 4. Review user activity
./scripts/daily/user-activity-report.sh

# 5. Check upcoming maintenance
./scripts/daily/maintenance-schedule.sh
```

### Daily Maintenance Commands
```bash
# Clean up docker images and containers
docker system prune -f

# Rotate logs manually if needed
docker-compose exec backend npm run logs:rotate

# Update security definitions
./scripts/security/update-definitions.sh

# Validate SSL certificates
./scripts/security/check-ssl.sh

# Performance baseline check
./scripts/performance/daily-baseline.sh
```

---

## Weekly Operations

### Monday - System Review
```bash
# 1. Weekly system health report
./scripts/weekly/system-health-report.sh

# 2. Performance analysis
./scripts/weekly/performance-analysis.sh

# 3. Security log review
./scripts/weekly/security-review.sh

# 4. Capacity planning review
./scripts/weekly/capacity-review.sh
```

### Wednesday - Maintenance Window
```bash
# 1. Apply security updates
./scripts/weekly/security-updates.sh

# 2. Database maintenance
docker-compose exec postgres psql -U pfm_user -c "
VACUUM ANALYZE;
REINDEX DATABASE pfm_community_production;"

# 3. Clear Redis cache (if needed)
docker-compose exec redis redis-cli FLUSHDB

# 4. Update container images
docker-compose pull
./scripts/deployment/rolling-update.sh production
```

### Friday - Week Wrap-up
```bash
# 1. Weekly performance report
./scripts/weekly/performance-report.sh

# 2. Incident summary
./scripts/weekly/incident-summary.sh

# 3. Backup validation
./scripts/weekly/backup-validation.sh

# 4. Weekend preparation
./scripts/weekly/weekend-prep.sh
```

---

## Monthly Operations

### First Week - Infrastructure Review
```bash
# 1. Infrastructure audit
./scripts/monthly/infrastructure-audit.sh

# 2. Security assessment
./scripts/monthly/security-assessment.sh

# 3. Cost analysis
./scripts/monthly/cost-analysis.sh

# 4. Capacity planning
./scripts/monthly/capacity-planning.sh
```

### Second Week - Performance Optimization
```bash
# 1. Database optimization
./scripts/monthly/database-optimization.sh

# 2. Application performance tuning
./scripts/monthly/performance-tuning.sh

# 3. CDN and caching optimization
./scripts/monthly/cache-optimization.sh

# 4. Blockchain optimization
./scripts/monthly/blockchain-optimization.sh
```

### Third Week - Security Operations
```bash
# 1. Security patch review
./scripts/monthly/security-patches.sh

# 2. Access review
./scripts/monthly/access-review.sh

# 3. Vulnerability scanning
./scripts/monthly/vulnerability-scan.sh

# 4. Compliance check
./scripts/monthly/compliance-check.sh
```

### Fourth Week - Disaster Recovery Testing
```bash
# 1. Backup and restore testing
./scripts/monthly/backup-restore-test.sh

# 2. Failover testing
./scripts/monthly/failover-test.sh

# 3. Documentation updates
./scripts/monthly/update-documentation.sh

# 4. Monthly report generation
./scripts/monthly/generate-report.sh
```

---

## Troubleshooting Guide

### Performance Issues

#### High CPU Usage
```bash
# Investigation:
docker stats
top -p $(docker-compose exec backend pidof node)

# Solutions:
# - Scale horizontally: docker-compose scale backend=3
# - Optimize code: Review profiling data
# - Increase resources: Update docker-compose.yml
```

#### High Memory Usage
```bash
# Investigation:
docker stats
docker-compose exec backend node -e "console.log(process.memoryUsage())"

# Solutions:
# - Restart service: docker-compose restart backend
# - Investigate memory leaks: Use heap profiling
# - Increase memory limits: Update container configuration
```

#### Database Performance Issues
```bash
# Investigation:
docker-compose exec postgres psql -U pfm_user -c "
SELECT query, calls, total_time, mean_time, rows
FROM pg_stat_statements 
ORDER BY total_time DESC LIMIT 10;"

# Solutions:
# - Analyze slow queries: Add indexes, optimize queries
# - Connection pool tuning: Adjust pool size
# - Database maintenance: VACUUM, ANALYZE, REINDEX
```

### Connectivity Issues

#### Database Connection Failures
```bash
# Investigation:
docker-compose logs postgres
docker-compose exec postgres psql -U pfm_user -l

# Solutions:
# - Check connection strings in application
# - Verify network connectivity
# - Check PostgreSQL configuration
# - Restart database service if needed
```

#### Redis Connection Failures
```bash
# Investigation:
docker-compose logs redis
docker-compose exec redis redis-cli ping

# Solutions:
# - Check Redis configuration
# - Verify network connectivity
# - Clear Redis memory if full
# - Restart Redis service if needed
```

#### Blockchain Connectivity Issues
```bash
# Investigation:
curl -X POST $SOLANA_RPC_URL \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getVersion"}'

# Solutions:
# - Switch RPC endpoints
# - Check network connectivity
# - Verify smart contract deployment
# - Update blockchain configuration
```

---

## Maintenance Procedures

### Regular Maintenance Schedule

#### Daily (Automated)
- Log rotation
- Temporary file cleanup
- Health checks
- Metric collection
- Backup verification

#### Weekly (Semi-Automated)
- Security updates
- Database maintenance
- Cache cleanup
- Performance analysis
- Container image updates

#### Monthly (Manual)
- Security assessment
- Infrastructure review
- Disaster recovery testing
- Documentation updates
- Capacity planning

### Database Maintenance

#### Regular Database Tasks
```bash
# Database statistics update
docker-compose exec postgres psql -U pfm_user -c "ANALYZE;"

# Index maintenance
docker-compose exec postgres psql -U pfm_user -c "REINDEX DATABASE pfm_community_production;"

# Clean up old data (if applicable)
docker-compose exec backend npm run db:cleanup

# Database backup
./scripts/backup/backup-database.sh production
```

#### Database Health Check
```bash
# Check database size and growth
docker-compose exec postgres psql -U pfm_user -c "
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(tablename::regclass)) as size
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY pg_total_relation_size(tablename::regclass) DESC;"

# Check for blocking queries
docker-compose exec postgres psql -U pfm_user -c "
SELECT pid, usename, application_name, client_addr, state, query
FROM pg_stat_activity 
WHERE state = 'active' AND query != '<IDLE>';"
```

### Container Maintenance

#### Container Health Management
```bash
# Remove unused containers and images
docker system prune -f

# Update container images
docker-compose pull

# Recreate containers with new images
docker-compose up -d --force-recreate

# Check container resource usage
docker stats --no-stream
```

#### Log Management
```bash
# Check log sizes
docker system df

# Clean up container logs
./scripts/maintenance/cleanup-logs.sh

# Rotate application logs
docker-compose exec backend npm run logs:rotate
```

---

## Performance Optimization

### Application Performance

#### Backend API Optimization
```bash
# Enable APM monitoring
export NEW_RELIC_LICENSE_KEY=your_key
docker-compose restart backend

# Profile application performance
docker-compose exec backend npm run profile

# Optimize database queries
./scripts/performance/optimize-queries.sh

# Implement caching strategies
./scripts/performance/optimize-caching.sh
```

#### Database Performance Tuning
```bash
# Analyze query performance
docker-compose exec postgres psql -U pfm_user -c "
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements 
ORDER BY mean_time DESC LIMIT 10;"

# Update PostgreSQL configuration
# Edit postgresql.conf for optimal settings
# - shared_buffers = 256MB
# - effective_cache_size = 1GB
# - random_page_cost = 1.1

# Create performance indexes
docker-compose exec backend npm run db:create-indexes
```

### Infrastructure Optimization

#### Redis Performance Tuning
```bash
# Check Redis performance
docker-compose exec redis redis-cli info stats

# Optimize Redis configuration
# Edit redis.conf:
# - maxmemory 512mb
# - maxmemory-policy allkeys-lru
# - save 900 1 300 10 60 10000

# Monitor cache hit rates
docker-compose exec redis redis-cli info stats | grep hit_rate
```

#### Container Resource Optimization
```bash
# Set appropriate resource limits
# Update docker-compose.yml:
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
        reservations:
          memory: 512M
          cpus: '0.25'
```

---

## Security Operations

### Security Monitoring

#### Daily Security Checks
```bash
# Check for failed login attempts
./scripts/security/check-failed-logins.sh

# Review security logs
./scripts/security/security-log-review.sh

# Check for unusual activity
./scripts/security/activity-analysis.sh

# Validate SSL certificates
./scripts/security/ssl-check.sh
```

#### Security Incident Response
```bash
# Investigate security alerts
./scripts/security/investigate-alert.sh <alert-id>

# Block suspicious IPs
./scripts/security/block-ip.sh <ip-address>

# Force user logout (if needed)
./scripts/security/force-logout.sh <user-id>

# Enable security mode
./scripts/security/enable-security-mode.sh
```

### Access Management

#### User Access Review
```bash
# List active users
docker-compose exec backend npm run users:list-active

# Review admin privileges
docker-compose exec backend npm run users:list-admins

# Check API key usage
docker-compose exec backend npm run api-keys:usage

# Audit log review
./scripts/security/audit-log-review.sh
```

---

## Disaster Recovery

### Backup Procedures

#### Automated Backup Validation
```bash
# Verify daily backups
./scripts/backup/verify-backups.sh

# Test backup restoration
./scripts/backup/test-restore.sh staging

# Check backup integrity
./scripts/backup/integrity-check.sh
```

#### Manual Backup Creation
```bash
# Create emergency backup
./scripts/backup/emergency-backup.sh production

# Backup configuration files
./scripts/backup/backup-config.sh

# Export application data
docker-compose exec backend npm run export:data
```

### Recovery Procedures

#### Service Recovery
```bash
# Recover from backup
./scripts/recovery/recover-from-backup.sh production <backup-id>

# Validate recovery
./scripts/recovery/validate-recovery.sh

# Switch traffic back
./scripts/recovery/restore-traffic.sh
```

#### Disaster Recovery Testing
```bash
# Monthly DR test
./scripts/dr/monthly-test.sh

# Validate recovery procedures
./scripts/dr/validate-procedures.sh

# Update DR documentation
./scripts/dr/update-documentation.sh
```

---

This operations runbook provides comprehensive procedures for maintaining the PFM Community Management Application. Regular review and updates ensure operational excellence and system reliability. 