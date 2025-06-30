# PFM Community Management Application - Monitoring & Logging Guide

## Table of Contents
- [Overview](#overview)
- [Monitoring Architecture](#monitoring-architecture)
- [Logging Architecture](#logging-architecture)
- [Dashboard Configuration](#dashboard-configuration)
- [Alert Management](#alert-management)
- [Log Analysis](#log-analysis)
- [Performance Monitoring](#performance-monitoring)
- [Security Monitoring](#security-monitoring)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

---

## Overview

This guide provides comprehensive procedures for monitoring and logging the PFM Community Management Application. The system uses Prometheus/Grafana for metrics and Loki/Promtail for centralized logging, providing complete observability across all containerized services.

**Monitoring Stack:**
- **Prometheus** - Metrics collection and alerting
- **Grafana** - Visualization and dashboards
- **AlertManager** - Alert routing and notifications
- **Node Exporter** - Host system metrics

**Logging Stack:**
- **Loki** - Log aggregation and storage
- **Promtail** - Log collection agent
- **Grafana** - Log visualization and analysis

---

## Monitoring Architecture

### Service Endpoints
```bash
# Monitoring Services
Prometheus:     http://localhost:9090     # Metrics and queries
Grafana:        http://localhost:3003     # Dashboards (admin/admin)
AlertManager:   http://localhost:9093     # Alert management
Node Exporter:  http://localhost:9100     # Host metrics

# Application Health Endpoints
Backend API:    http://localhost:3000/health
Admin Portal:   http://localhost:3001/health  
Member Portal:  http://localhost:3002/health
Metrics:        http://localhost:3000/metrics
```

### Key Metrics Collection

#### Application Metrics
```prometheus
# HTTP Request Metrics
pfm_http_requests_total{method="GET",endpoint="/api/communities",status="200"}
pfm_http_request_duration_seconds{method="POST",endpoint="/api/votes"}

# Business Logic Metrics
pfm_votes_total                    # Total votes cast
pfm_communities_total              # Total communities
pfm_wallet_connections_total       # Successful wallet connections
pfm_active_users                   # Current active users

# Error Tracking
pfm_errors_total{type="authentication"}
pfm_errors_total{type="database"}
pfm_errors_total{type="blockchain"}
```

#### Infrastructure Metrics
```prometheus
# Container Resources
container_memory_usage_bytes{name="pfm-backend"}
container_cpu_usage_seconds_total{name="pfm-backend"}

# Database Health
postgresql_up
postgresql_connections_active
postgresql_slow_queries_total

# Cache Performance  
redis_memory_usage_bytes
redis_hit_rate
redis_connected_clients
```

---

## Logging Architecture

### Log Collection Sources
```yaml
# Application Logs
Backend API:          /var/log/pfm/backend.log
Admin Portal:         /var/log/pfm/admin.log
Member Portal:        /var/log/pfm/member.log

# Specialized Logs
Security Events:      /var/log/pfm/security.log
Audit Trail:          /var/log/pfm/audit.log
Performance Logs:     /var/log/pfm/performance.log
Error Logs:           /var/log/pfm/error.log

# System Logs
Container Logs:       Docker container stdout/stderr
System Logs:          /var/log/syslog
Application Logs:     JSON structured format
```

### Log Format Standards
```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "level": "INFO",
  "service": "pfm-backend",
  "category": "API",
  "message": "User authentication successful",
  "requestId": "req-12345",
  "userId": "user-67890",
  "sessionId": "sess-abc123",
  "endpoint": "/api/auth/login",
  "method": "POST",
  "statusCode": 200,
  "duration": 150,
  "ipAddress": "192.168.1.100"
}
```

---

## Dashboard Configuration

### Grafana Dashboard Setup
```bash
# Access Grafana
URL: http://localhost:3003
Login: admin / admin

# Import Dashboards
1. PFM Overview Dashboard - Application metrics and health
2. Infrastructure Dashboard - System resources and performance
3. Security Dashboard - Authentication and security events
4. Business Metrics Dashboard - Voting and community analytics
5. Logs Dashboard - Centralized log analysis
```

### Key Dashboard Panels

#### PFM Overview Dashboard
```yaml
Panels:
  - Service Status: Real-time health of all services
  - Request Rate: HTTP requests per second by service
  - Error Rate: Error percentage with alerting thresholds
  - Response Time: 95th percentile response times
  - Active Users: Current user sessions
  - Blockchain Status: Solana RPC connectivity
  - Database Performance: Query times and connections
  - Memory Usage: Container memory utilization
```

#### Security Dashboard
```yaml
Panels:
  - Failed Login Attempts: Authentication failure tracking
  - Suspicious Activity: Unusual access patterns
  - Security Alerts: Real-time security incidents
  - Admin Actions: Administrative activity monitoring
  - API Key Usage: API access monitoring
  - Wallet Connections: Blockchain authentication events
```

---

## Alert Management

### Alert Configuration

#### Critical Alerts (Immediate Response)
```yaml
Service Down:
  condition: up == 0
  duration: 1m
  severity: critical
  notification: email + slack

High Error Rate:
  condition: rate(pfm_errors_total[5m]) > 0.05
  duration: 2m
  severity: critical
  notification: email + slack

Database Unavailable:
  condition: postgresql_up == 0
  duration: 30s
  severity: critical
  notification: email + slack + sms
```

#### Warning Alerts (15-minute Response)
```yaml
High Response Time:
  condition: histogram_quantile(0.95, pfm_http_request_duration_seconds) > 2
  duration: 5m
  severity: warning
  notification: slack

Memory Usage High:
  condition: container_memory_usage_bytes / container_spec_memory_limit_bytes > 0.8
  duration: 10m
  severity: warning
  notification: slack

Cache Miss Rate High:
  condition: redis_hit_rate < 0.8
  duration: 10m
  severity: warning
  notification: slack
```

### AlertManager Configuration
```yaml
# /etc/alertmanager/alertmanager.yml
global:
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'alerts@pfm-community.com'

route:
  group_by: ['alertname', 'service']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 1h
  receiver: 'default'
  routes:
  - match:
      severity: critical
    receiver: 'critical'
  - match:
      severity: warning  
    receiver: 'warning'

receivers:
- name: 'critical'
  email_configs:
  - to: 'oncall@pfm-community.com'
    subject: 'CRITICAL: {{ .GroupLabels.alertname }}'
  slack_configs:
  - api_url: 'https://hooks.slack.com/services/...'
    channel: '#alerts-critical'

- name: 'warning'
  slack_configs:
  - api_url: 'https://hooks.slack.com/services/...'
    channel: '#alerts-warning'
```

---

## Log Analysis

### Loki Query Examples

#### Application Log Queries
```logql
# All backend errors in last hour
{service="pfm-backend",level="error"} [1h]

# Authentication failures
{service="pfm-backend",category="AUTH"} |~ "failed|error"

# Slow database queries
{service="pfm-backend",category="DATABASE"} |~ "slow query"

# User activity by session
{service="pfm-backend"} | json | sessionId="sess-abc123"

# Error rate by service
rate({service=~"pfm-.*",level="error"} [5m])
```

#### Security Log Queries
```logql
# Failed login attempts
{service="pfm-backend",category="SECURITY"} |~ "login.*failed"

# Suspicious IP activity
{service="pfm-backend"} | json | ipAddress="192.168.1.100" | level="warn"

# Admin privilege escalation
{service="pfm-backend",category="AUTH"} |~ "admin.*granted"

# API abuse detection
rate({service="pfm-backend"} | json | ipAddress=~".*" [1m]) > 10
```

#### Performance Log Queries
```logql
# Request duration analysis
{service="pfm-backend",category="API"} | json | duration > 1000

# Database connection issues
{service="pfm-backend",category="DATABASE"} |~ "connection.*failed"

# Memory usage warnings
{service="pfm-backend"} |~ "memory.*high|out of memory"

# 95th percentile response times
quantile_over_time(0.95, {service="pfm-backend"} | json | unwrap duration [5m])
```

---

## Performance Monitoring

### Application Performance Metrics

#### Response Time Monitoring
```bash
# Check current response times
curl -w "@curl-format.txt" -s http://localhost:3000/api/health

# Grafana query for 95th percentile
histogram_quantile(0.95, 
  rate(pfm_http_request_duration_seconds_bucket[5m])
)

# Alert on slow responses
pfm_http_request_duration_seconds{quantile="0.95"} > 2
```

#### Database Performance
```sql
-- Slow query analysis
SELECT query, calls, total_time, mean_time, rows
FROM pg_stat_statements 
ORDER BY total_time DESC LIMIT 10;

-- Connection pool status
SELECT count(*), state FROM pg_stat_activity GROUP BY state;

-- Lock contention
SELECT schemaname, tablename, attname, n_tup_ins, n_tup_upd, n_tup_del
FROM pg_stat_user_tables ORDER BY n_tup_upd DESC;
```

#### Cache Performance
```bash
# Redis performance metrics
docker-compose exec redis redis-cli info stats

# Cache hit rate
redis_keyspace_hits / (redis_keyspace_hits + redis_keyspace_misses)

# Memory usage
redis_memory_used_bytes / redis_memory_max_bytes
```

### Blockchain Performance
```bash
# Solana RPC latency
curl -X POST $SOLANA_RPC_URL \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getVersion"}' \
  -w "%{time_total}"

# Transaction success rate
solana_transaction_success_total / solana_transaction_total

# Program performance
solana_program_execution_time_seconds{program_id="your_program_id"}
```

---

## Security Monitoring

### Authentication Monitoring
```logql
# Failed login attempts by IP
sum by (ipAddress) (
  rate({service="pfm-backend",category="AUTH"} |~ "login.*failed" [5m])
)

# Brute force detection
rate({service="pfm-backend",category="AUTH"} |~ "failed" [1m]) > 5

# Successful admin logins
{service="pfm-backend",category="AUTH"} |~ "admin.*login.*success"
```

### Security Incident Detection
```prometheus
# Multiple failed attempts (rate > 10/min)
rate(pfm_failed_login_attempts_total[1m]) > 10

# Unusual API access patterns
rate(pfm_http_requests_total{endpoint!~"/health|/metrics"}[5m]) > 100

# Security policy violations
pfm_security_violations_total > 0
```

### Compliance Monitoring
```bash
# Audit log completeness
{service="pfm-backend",category="AUDIT"} | json | count > 0

# Data access tracking
{service="pfm-backend"} |~ "user_data_access" | json | userId=~".*"

# Administrative action logging
{service="pfm-backend",category="ADMIN"} | json | action=~"CREATE|UPDATE|DELETE"
```

---

## Troubleshooting

### Common Monitoring Issues

#### Missing Metrics
```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Verify service discovery
curl http://localhost:9090/api/v1/label/__name__/values

# Check application /metrics endpoint
curl http://localhost:3000/metrics
```

#### Dashboard Issues
```bash
# Check Grafana data sources
curl -u admin:admin http://localhost:3003/api/datasources

# Test Prometheus connectivity
curl -u admin:admin "http://localhost:3003/api/datasources/proxy/1/api/v1/query?query=up"

# Verify dashboard imports
curl -u admin:admin http://localhost:3003/api/search
```

#### Alert Problems
```bash
# Check AlertManager status
curl http://localhost:9093/api/v1/status

# View active alerts
curl http://localhost:9093/api/v1/alerts

# Test notification channels
curl -XPOST http://localhost:9093/api/v1/alerts \
  -H "Content-Type: application/json" \
  -d '[{"labels":{"alertname":"test"}}]'
```

### Log Troubleshooting

#### Log Collection Issues
```bash
# Check Promtail status
curl http://localhost:9080/targets

# Verify log file permissions
ls -la /var/log/pfm/

# Test Loki connectivity
curl http://localhost:3100/ready
```

#### Query Performance
```bash
# Check Loki metrics
curl http://localhost:3100/metrics

# Optimize query performance
{service="pfm-backend"} | json | line_format "{{.level}}: {{.message}}"

# Use label filters efficiently
{service="pfm-backend",level="error"} [1h]
```

---

## Best Practices

### Monitoring Best Practices

#### Metric Design
- Use consistent naming conventions (pfm_metric_name_unit)
- Include relevant labels for filtering and grouping
- Monitor business metrics alongside technical metrics
- Set appropriate retention periods for different metric types

#### Dashboard Design
- Group related metrics in logical panels
- Use appropriate visualization types for data
- Include alert status indicators
- Provide drill-down capabilities

#### Alert Configuration
- Set meaningful thresholds based on baseline performance
- Avoid alert fatigue with proper grouping and inhibition
- Include runbook links in alert descriptions
- Test alert routing regularly

### Logging Best Practices

#### Log Structure
- Use structured JSON format for machine parsing
- Include correlation IDs for request tracing
- Mask sensitive data in logs
- Use appropriate log levels consistently

#### Log Retention
- Security logs: 90 days minimum
- Application logs: 30 days standard
- Error logs: 60 days for debugging
- Performance logs: 14 days for analysis

#### Query Optimization
- Use label filters before parsing
- Limit time ranges for better performance
- Use aggregation functions for summaries
- Cache frequently used queries

---

This monitoring and logging guide ensures comprehensive observability for the PFM Community Management Application, enabling proactive maintenance and rapid incident response. 