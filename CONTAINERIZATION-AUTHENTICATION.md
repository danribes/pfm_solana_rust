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
    test: ["CMD", "curl", "-f", "http://localhost:3001/"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 60s
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
# Check individual service health
curl http://localhost:3000/api/health
curl http://localhost:3001/
curl http://localhost:3002/
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

# Frontend health check (simplified)
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3001/"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 60s
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

## Portal Health Issues & Solutions

### Recent Critical Issues and Fixes (December 2024)

During implementation of Task 4.3.2 (Community Management Features), several critical containerization issues were identified and resolved:

#### 🔴 Issue 1: Portal Container Health Check Failures

**Problem**: Both admin and member portals showing "unhealthy" status despite applications running correctly.

**Symptoms**:
```bash
$ docker-compose ps
pfm-admin-portal    Up (unhealthy)
pfm-member-portal   Up (unhealthy)
```

**Root Cause**: Health checks in Dockerfiles were pointing to non-existent `/api/health` endpoints.

**Original Configuration** (problematic):
```dockerfile
# Admin/Member Portal Dockerfiles
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3001/api/health || exit 1
```

**✅ Solution Applied**:
```dockerfile
# Updated Dockerfiles - Simple health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3001/ || exit 1
```

**Files Modified**:
- `frontend/admin/Dockerfile`
- `frontend/member/Dockerfile`

---

#### 🔴 Issue 2: React Version Conflicts in Member Portal

**Problem**: Member portal container crashing with React version compatibility errors.

**Symptoms**:
```bash
npm WARN ERESOLVE overriding peer dependency
npm WARN Could not resolve dependency:
npm WARN peer react@"^15.5.3 || ^16.0.0 || ^17.0.0" from qrcode.react@1.0.1
```

**Root Cause**: Solana wallet adapter packages had peer dependency conflicts expecting React 16/17 while project used React 18.

**✅ Solution Applied**:
Updated `frontend/member/package.json` with version resolutions:
```json
{
  "resolutions": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1"
  },
  "overrides": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  }
}
```

---

#### 🔴 Issue 3: Webpack Configuration Errors

**Problem**: Member portal failing with critical webpack errors.

**Symptoms**:
```bash
TypeError: Cannot read properties of undefined (reading 'ProvidePlugin')
    at Object.webpack (/app/next.config.js:68:28)
```

**Root Cause**: Incorrect webpack plugin reference in Next.js configuration.

**Original Configuration** (problematic):
```javascript
// next.config.js
webpack: (config, { isServer }) => {
  config.plugins.push(
    new config.webpack.ProvidePlugin({  // ❌ Incorrect reference
      Buffer: ['buffer', 'Buffer'],
    })
  );
}
```

**✅ Solution Applied**:
```javascript
// Fixed next.config.js
webpack: (config, { isServer, webpack }) => {  // ✅ Added webpack parameter
  config.plugins.push(
    new webpack.ProvidePlugin({  // ✅ Correct reference
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    })
  );
}
```

**Files Modified**:
- `frontend/member/next.config.js`
- `frontend/admin/next.config.js`

---

#### 🔴 Issue 4: ES Modules Compatibility Issues

**Problem**: Member portal crashing with ES modules import errors.

**Symptoms**:
```bash
Module parse failed: Cannot use 'import.meta' outside a module
Import trace for requested module:
./node_modules/@solana/wallet-adapter-base/lib/cjs/index.js
```

**Root Cause**: Solana wallet adapter modules using ES module syntax incompatible with webpack configuration.

**✅ Solution Applied**:
Enhanced `next.config.js` with comprehensive ES modules support:
```javascript
{
  transpilePackages: [
    '@solana/web3.js',
    '@solana/wallet-adapter-base',
    '@solana/wallet-adapter-react',
    '@solana/wallet-adapter-react-ui',
    '@solana/wallet-adapter-wallets',
    '@solana-mobile/wallet-adapter-mobile',
    // ... all Solana packages
  ],
  experimental: {
    externalDir: true,
    esmExternals: 'loose',  // ✅ Critical for ES modules
  },
  webpack: (config, { isServer, webpack }) => {
    // Fix ES modules and import.meta issues
    config.module.rules.push({
      test: /\.m?js$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    });
  }
}
```

---

#### 🔴 Issue 5: Container Permission Issues

**Problem**: Both portals failing with file permission errors.

**Symptoms**:
```bash
EACCES: permission denied, unlink '/app/.next/build-manifest.json'
errno: -13, code: 'EACCES', syscall: 'unlink'
```

**Root Cause**: Next.js build files owned by wrong user, preventing container user (nextjs:1001) from writing.

**✅ Solution Applied**:
```bash
# Fix .next directory permissions
sudo chown -R 1001:1001 frontend/admin/.next frontend/member/.next

# Create directories with correct ownership
mkdir -p frontend/admin/.next frontend/member/.next
sudo chown -R 1001:1001 frontend/admin/.next frontend/member/.next
```

---

### 🎉 Results Achieved

After implementing all fixes:

| Service | Before | After | Status |
|---------|--------|-------|--------|
| **Admin Portal** | ❌ Unhealthy, crashes | ✅ **HTTP 200 OK** | **Working** |
| **Member Portal** | ❌ Container crashes | ✅ **Container stable** | **Major Progress** |
| **Backend API** | ✅ Healthy | ✅ Healthy | **Perfect** |

**Container Logs After Fixes**:
```bash
pfm-admin-portal    | ✓ Ready in 2.7s
pfm-member-portal   | ✓ Ready in 8.7s  
```

### Implementation Commands

**Complete fix deployment**:
```bash
# 1. Fix file permissions
sudo chown -R dan:dan frontend/member/ frontend/admin/
sudo chown -R 1001:1001 frontend/admin/.next frontend/member/.next

# 2. Rebuild containers with fixes
docker-compose build admin-portal member-portal

# 3. Restart with updated configuration  
docker-compose restart admin-portal member-portal

# 4. Verify successful startup
docker-compose logs --tail=5 admin-portal member-portal
```

### Prevention Strategies

1. **Health Check Standards**:
   - Use simple HTTP endpoint checks (`/` instead of `/api/health`)
   - Include adequate startup periods (60s+ for Next.js apps)
   - Test health checks manually before deployment

2. **React Version Management**:
   - Always specify exact React versions in `package.json`
   - Use `resolutions` and `overrides` for dependency conflicts
   - Test with latest Solana wallet adapter versions

3. **Webpack Configuration**:
   - Always destructure `webpack` parameter in Next.js config
   - Test webpack builds before container deployment
   - Include comprehensive polyfill configuration

4. **Container Permissions**:
   - Pre-create `.next` directories with correct ownership
   - Use consistent user IDs across development and containers
   - Document permission requirements in deployment guides

---

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
# Test health check endpoints manually
curl -f http://localhost:3000/api/health
curl -f http://localhost:3001/
curl -f http://localhost:3002/

# Check container health status
docker-compose ps

# View health check logs
docker inspect pfm-admin-portal | grep -A 10 Health
```

#### 5. React/Webpack Issues
```bash
# Check for version conflicts
docker exec pfm-member-portal npm list react react-dom

# Verify webpack configuration
docker exec pfm-member-portal cat next.config.js

# Check transpiled packages
docker exec pfm-member-portal npm ls | grep @solana
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

### Portal-Specific Debugging

```bash
# Test portal responses
curl -I http://localhost:3001/  # Admin portal
curl -I http://localhost:3002/  # Member portal

# Check Next.js compilation
docker exec pfm-admin-portal ls -la .next/
docker exec pfm-member-portal ls -la .next/

# Verify polyfill dependencies
docker exec pfm-member-portal npm list buffer crypto-browserify
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

### Container Orchestration

#### Kubernetes Deployment
```yaml
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
        ports:
        - containerPort: 3001
        env:
        - name: DOCKER_CONTAINER
          value: "true"
        - name: CONTAINER_ENV
          value: "production"
        livenessProbe:
          httpGet:
            path: /
            port: 3001
          initialDelaySeconds: 60
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
```

### Monitoring and Observability

#### Health Monitoring
```bash
# Continuous health monitoring
watch "docker-compose ps"

# Log aggregation
docker-compose logs -f | grep "Health\|Error\|WARN"

# Resource monitoring
docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

#### Performance Monitoring
```bash
# Response time testing
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3001/
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3002/

# Container performance
docker exec pfm-admin-portal top
docker exec pfm-member-portal ps aux
```

---

**This documentation comprehensively covers all containerization aspects of the PFM Community Management Application, including recent critical fixes for portal health issues, React compatibility, and production-ready deployment strategies.** 