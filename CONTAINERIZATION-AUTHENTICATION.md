# 🐳 PFM Authentication Infrastructure - Containerization Guide

## Overview

This document provides comprehensive guidance for deploying and managing the PFM Community Management Application's authentication infrastructure in containerized environments. The authentication system is fully container-aware and supports Docker Compose, Kubernetes, and cloud deployments.

## Architecture

### Container Services

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Admin Portal  │    │  Member Portal  │    │   Backend API   │
│   (Port 3001)   │    │   (Port 3002)   │    │   (Port 3000)   │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Auth Client │ │    │ │ Auth Client │ │    │ │ Auth Server │ │
│ │   Service   │ │    │ │   Service   │ │    │ │   Service   │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │      Redis      │    │ Solana Validator│
│   (Port 5432)   │    │   (Port 6379)   │    │   (Port 8899)   │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ User Data   │ │    │ │  Sessions   │ │    │ │  Blockchain │ │
│ │ Persistence │ │    │ │   Cache     │ │    │ │    RPC      │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Authentication Flow in Containers

1. **Frontend Authentication** (Admin/Member Portals)
   - Container-aware configuration detects environment
   - Service discovery resolves backend authentication endpoints
   - Browser-based wallet integration (non-containerized)
   - Session management with Redis backend

2. **Backend Authentication** (API Server)
   - Wallet signature verification
   - Session creation and validation
   - Role-based access control
   - Database and Redis integration

3. **Cross-Container Communication**
   - Internal service URLs for container-to-container communication
   - External service URLs for browser access
   - Health check monitoring across all services

## Container Configuration

### Environment Variables

#### Core Container Variables
```bash
# Container identification
DOCKER_CONTAINER=true
CONTAINER_ENV=development|testing|production
CONTAINER_NAME=pfm-service-name

# Service discovery (Internal)
BACKEND_SERVICE_URL=http://backend:3000
AUTH_SERVICE_URL=http://backend:3000/api/auth
SESSION_SERVICE_URL=http://backend:3000/api/session
REDIS_URL=redis://redis:6379
DATABASE_URL=postgresql://pfm_user:pfm_password@postgres:5432/pfm_community

# Service discovery (External)
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:3000/api/auth
NEXT_PUBLIC_SESSION_SERVICE_URL=http://localhost:3000/api/session
```

#### Authentication-Specific Variables
```bash
# Authentication configuration
WALLET_AUTH_ENABLED=true
AUTH_RATE_LIMIT_MAX=5
AUTH_RATE_LIMIT_WINDOW=15
SESSION_MAX_AGE=86400000
SESSION_RENEWAL_THRESHOLD=3600000

# Frontend authentication
NEXT_PUBLIC_AUTH_RATE_LIMIT_MAX=5
NEXT_PUBLIC_AUTH_RATE_LIMIT_WINDOW=15
NEXT_PUBLIC_SESSION_MAX_AGE=86400000
NEXT_PUBLIC_SESSION_RENEWAL_THRESHOLD=3600000
```

#### Health Check Variables
```bash
# Health monitoring
HEALTH_CHECK_TIMEOUT=5000
HEALTH_CHECK_RETRIES=3
```

### Docker Compose Configuration

#### Backend Service (Enhanced)
```yaml
backend:
  build:
    context: ./backend
    dockerfile: Dockerfile
  container_name: pfm-backend
  environment:
    # Core service configuration
    - NODE_ENV=development
    - CONTAINER_ENV=development
    - DOCKER_CONTAINER=true
    - CONTAINER_NAME=pfm-backend
    
    # Authentication configuration
    - WALLET_AUTH_ENABLED=true
    - AUTH_RATE_LIMIT_MAX=5
    - AUTH_RATE_LIMIT_WINDOW=15
    - SESSION_MAX_AGE=86400000
    - SESSION_RENEWAL_THRESHOLD=3600000
    
    # Service discovery
    - BACKEND_SERVICE_URL=http://backend:3000
    - AUTH_SERVICE_URL=http://backend:3000/api/auth
    - SESSION_SERVICE_URL=http://backend:3000/api/session
    
    # Database and cache
    - DATABASE_URL=postgresql://pfm_user:pfm_password@postgres:5432/pfm_community
    - REDIS_URL=redis://redis:6379
    
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 40s
```

#### Frontend Services (Admin Portal)
```yaml
admin-portal:
  build:
    context: ./frontend/admin
    dockerfile: Dockerfile
  container_name: pfm-admin-portal
  environment:
    # Container configuration
    - DOCKER_CONTAINER=true
    - CONTAINER_NAME=pfm-admin-portal
    
    # External URLs (browser access)
    - NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:3000/api/auth
    - NEXT_PUBLIC_SESSION_SERVICE_URL=http://localhost:3000/api/session
    
    # Internal URLs (container-to-container)
    - AUTH_SERVICE_URL=http://backend:3000/api/auth
    - SESSION_SERVICE_URL=http://backend:3000/api/session
    
    # Authentication configuration
    - NEXT_PUBLIC_AUTH_RATE_LIMIT_MAX=5
    - NEXT_PUBLIC_AUTH_RATE_LIMIT_WINDOW=15
    
  healthcheck:
    test: ["CMD", "node", "/shared/docker/auth-healthcheck.js"]
    interval: 30s
    timeout: 10s
    retries: 3
```

## Deployment Instructions

### Development Environment

#### Quick Start
```bash
# Clone repository
git clone <repository-url>
cd pfm-docker

# Start all services with authentication
docker-compose up -d

# Verify authentication services
docker-compose ps
docker-compose logs backend admin-portal member-portal
```

#### Detailed Setup
```bash
# 1. Environment preparation
cp frontend/shared/.env.container.example .env.container

# 2. Start core services first
docker-compose up -d postgres redis solana-local-validator

# 3. Wait for core services to be healthy
docker-compose ps

# 4. Start application services
docker-compose up -d backend admin-portal member-portal

# 5. Verify authentication functionality
curl http://localhost:3000/api/health
curl http://localhost:3001 # Admin portal
curl http://localhost:3002 # Member portal
```

#### Health Check Validation
```bash
# Run authentication health checks
docker exec pfm-admin-portal node /shared/docker/auth-healthcheck.js
docker exec pfm-member-portal node /shared/docker/auth-healthcheck.js

# Check individual service health
curl http://localhost:3000/api/health
curl http://localhost:3000/api/auth/health
curl http://localhost:3000/api/session/health
```

### Testing Environment

```bash
# Set testing environment
export CONTAINER_ENV=testing
export NODE_ENV=test

# Use testing configuration
docker-compose -f docker-compose.yml -f docker-compose.test.yml up -d

# Run authentication tests
docker exec pfm-backend npm run test:auth
docker exec pfm-admin-portal npm run test:auth
docker exec pfm-member-portal npm run test:auth
```

### Production Environment

#### Environment Setup
```bash
# Set production environment
export NODE_ENV=production
export CONTAINER_ENV=production

# Configure production URLs
export NEXT_PUBLIC_APP_URL=https://admin.your-domain.com
export NEXT_PUBLIC_AUTH_SERVICE_URL=https://api.your-domain.com/api/auth
export NEXT_PUBLIC_SESSION_SERVICE_URL=https://api.your-domain.com/api/session

# Enhanced security settings
export NEXT_PUBLIC_AUTH_RATE_LIMIT_MAX=3
export NEXT_PUBLIC_AUTH_RATE_LIMIT_WINDOW=30
```

#### Production Deployment
```bash
# Deploy with production configuration
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Verify production deployment
curl https://api.your-domain.com/api/health
curl https://admin.your-domain.com
curl https://member.your-domain.com
```

## Container Health Monitoring

### Authentication Health Check Script

Location: `frontend/shared/docker/auth-healthcheck.js`

Features:
- **Backend API health**: Checks authentication endpoint availability
- **Service connectivity**: Validates Redis and database connections
- **Authentication functionality**: Tests session generation and storage
- **Retry logic**: Configurable retry attempts with backoff
- **Container logging**: JSON-formatted results for log aggregation

Usage:
```bash
# Run health check manually
docker exec pfm-admin-portal node /shared/docker/auth-healthcheck.js

# View health check logs
docker logs pfm-admin-portal | grep "Health Check"

# Monitor continuous health
watch "docker exec pfm-admin-portal node /shared/docker/auth-healthcheck.js"
```

### Health Check Configuration

```bash
# Health check environment variables
HEALTH_CHECK_TIMEOUT=5000       # Request timeout in milliseconds
HEALTH_CHECK_RETRIES=3          # Number of retry attempts
BACKEND_SERVICE_URL=http://backend:3000
AUTH_SERVICE_URL=http://backend:3000/api/auth
```

### Docker Compose Health Checks

```yaml
# Backend health check
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s

# Frontend health check (authentication-specific)
healthcheck:
  test: ["CMD", "node", "/shared/docker/auth-healthcheck.js"]
  interval: 30s
  timeout: 10s
  retries: 3
```

## Service Discovery

### Container-to-Container Communication

Internal service URLs for container communication:
```
Backend API:     http://backend:3000
Auth Service:    http://backend:3000/api/auth
Session Service: http://backend:3000/api/session
Redis:           redis://redis:6379
PostgreSQL:      postgresql://pfm_user:pfm_password@postgres:5432/pfm_community
```

### External Access

External URLs for browser access:
```
Admin Portal:    http://localhost:3001
Member Portal:   http://localhost:3002
Backend API:     http://localhost:3000
Auth Endpoints:  http://localhost:3000/api/auth
Session API:     http://localhost:3000/api/session
```

### Service Discovery Implementation

```typescript
// Automatic service discovery based on container environment
export function getContainerServiceUrls() {
  const isContainer = isContainerized();
  
  if (isContainer) {
    // Container-to-container communication
    return {
      backendUrl: 'http://backend:3000',
      authServiceUrl: 'http://backend:3000/api/auth',
      sessionServiceUrl: 'http://backend:3000/api/session'
    };
  } else {
    // External access
    return {
      backendUrl: 'http://localhost:3000',
      authServiceUrl: 'http://localhost:3000/api/auth',
      sessionServiceUrl: 'http://localhost:3000/api/session'
    };
  }
}
```

## Troubleshooting

### Common Issues

#### 1. Container Communication Issues
```bash
# Verify container network
docker network ls
docker network inspect pfm-network

# Check container connectivity
docker exec pfm-admin-portal ping backend
docker exec pfm-admin-portal nslookup backend
```

#### 2. Authentication Service Unavailable
```bash
# Check backend service logs
docker logs pfm-backend

# Verify authentication endpoints
curl http://localhost:3000/api/auth/health
curl http://localhost:3000/api/session/health

# Check environment variables
docker exec pfm-backend env | grep AUTH
```

#### 3. Session Management Issues
```bash
# Check Redis connectivity
docker exec pfm-backend redis-cli -h redis ping

# Verify session storage
docker exec pfm-backend redis-cli -h redis keys "pfm_session_*"

# Check session configuration
docker exec pfm-admin-portal env | grep SESSION
```

#### 4. Health Check Failures
```bash
# Debug health check script
docker exec pfm-admin-portal node /shared/docker/auth-healthcheck.js

# Check health check configuration
docker exec pfm-admin-portal env | grep HEALTH_CHECK

# Manual health verification
curl -f http://localhost:3000/api/health
curl -f http://localhost:3001/api/health
curl -f http://localhost:3002/api/health
```

### Debugging Commands

```bash
# View all container logs
docker-compose logs -f

# Check specific service logs
docker-compose logs -f backend
docker-compose logs -f admin-portal
docker-compose logs -f member-portal

# Inspect container configuration
docker inspect pfm-backend
docker inspect pfm-admin-portal
docker inspect pfm-member-portal

# Verify environment variables
docker exec pfm-backend env
docker exec pfm-admin-portal env
docker exec pfm-member-portal env

# Check container resource usage
docker stats

# Verify service connectivity
docker exec pfm-admin-portal curl http://backend:3000/api/health
docker exec pfm-member-portal curl http://backend:3000/api/auth/health
```

## Security Considerations

### Container Security

1. **Network Isolation**
   - All services run in isolated `pfm-network`
   - No direct external access to internal services
   - Service-to-service communication uses internal DNS

2. **Environment Variables**
   - Sensitive variables (secrets, passwords) should use Docker secrets
   - Container environment detection prevents configuration leaks
   - Production environments use stricter rate limiting

3. **Health Check Security**
   - Health checks use internal endpoints only
   - No sensitive information exposed in health check responses
   - Timeout and retry limits prevent resource exhaustion

### Authentication Security

1. **Rate Limiting**
   - Container-aware rate limiting configuration
   - Stricter limits in production environments
   - Per-container rate limiting isolation

2. **Session Management**
   - Redis-backed session storage with encryption
   - Container-to-container session validation
   - Session fingerprinting for anomaly detection

3. **Service Discovery**
   - Internal service URLs not exposed externally
   - Environment-based URL resolution
   - Container network isolation

## Scaling and Production

### Horizontal Scaling

```yaml
# Scale frontend services
docker-compose up -d --scale admin-portal=3 --scale member-portal=3

# Load balancer configuration (nginx example)
upstream admin_backend {
    server admin-portal-1:3001;
    server admin-portal-2:3001;
    server admin-portal-3:3001;
}
```

### Kubernetes Deployment

```yaml
# Example Kubernetes deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pfm-admin-portal
spec:
  replicas: 3
  selector:
    matchLabels:
      app: pfm-admin-portal
  template:
    metadata:
      labels:
        app: pfm-admin-portal
    spec:
      containers:
      - name: admin-portal
        image: pfm-admin-portal:latest
        env:
        - name: DOCKER_CONTAINER
          value: "true"
        - name: CONTAINER_ENV
          value: "production"
        - name: AUTH_SERVICE_URL
          value: "http://pfm-backend-service:3000/api/auth"
        livenessProbe:
          exec:
            command:
            - node
            - /shared/docker/auth-healthcheck.js
          initialDelaySeconds: 30
          periodSeconds: 30
```

### Cloud Deployment

1. **AWS ECS**
   - Task definitions with container environment variables
   - Service discovery using AWS Service Discovery
   - Application Load Balancer for external access

2. **Google Cloud Run**
   - Container-to-container communication via VPC
   - Cloud SQL for PostgreSQL
   - Cloud Memorystore for Redis

3. **Azure Container Instances**
   - Container groups for service orchestration
   - Azure Database for PostgreSQL
   - Azure Cache for Redis

## Monitoring and Logging

### Container Logging

```bash
# JSON-formatted logs for log aggregation
export LOG_FORMAT=json
export LOG_LEVEL=info

# View structured logs
docker-compose logs -f | jq '.level, .message, .container'
```

### Monitoring Integration

```yaml
# Prometheus monitoring
version: '3.8'
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

### Log Aggregation

```yaml
# ELK Stack for log aggregation
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.15.0
  
  logstash:
    image: docker.elastic.co/logstash/logstash:7.15.0
    
  kibana:
    image: docker.elastic.co/kibana/kibana:7.15.0
    ports:
      - "5601:5601"
```

This containerization guide provides comprehensive coverage of deploying and managing the PFM authentication infrastructure in containerized environments, from development to production. 