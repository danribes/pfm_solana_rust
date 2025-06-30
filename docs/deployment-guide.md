# PFM Community Management Application - Deployment Guide

## Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Development Deployment](#development-deployment)
- [Staging Deployment](#staging-deployment)
- [Production Deployment](#production-deployment)
- [CI/CD Pipeline Deployment](#cicd-pipeline-deployment)
- [Rollback Procedures](#rollback-procedures)
- [Health Checks and Validation](#health-checks-and-validation)
- [Troubleshooting](#troubleshooting)

---

## Overview

The PFM Community Management Application is a fully containerized blockchain-enabled voting platform built on Solana. This guide covers deployment procedures for all environments using Docker Compose, Kubernetes, and automated CI/CD pipelines.

**Architecture Components:**
- **Solana Smart Contracts** - On-chain voting and community management logic
- **Backend API** - Express.js server with authentication and business logic
- **Admin Portal** - Next.js application for community administration
- **Member Portal** - Next.js application for community participation
- **Supporting Services** - PostgreSQL, Redis, Solana validator
- **Infrastructure** - Monitoring (Prometheus, Grafana), Logging (Loki, Promtail)

---

## Prerequisites

### System Requirements
- **Docker Engine:** 20.10+ with Docker Compose v2
- **Memory:** Minimum 8GB RAM, Recommended 16GB+
- **Storage:** 50GB+ available disk space
- **Network:** Stable internet connection for blockchain connectivity

### Required Software
```bash
# Docker Desktop (includes Docker Compose)
# Download from: https://www.docker.com/products/docker-desktop/

# Node.js (for local development and CI/CD)
curl -fsSL https://nodejs.org/dist/v18.18.0/node-v18.18.0-linux-x64.tar.xz | tar -xJ
```

### Access Requirements
- **Container Registry Access** - Docker Hub or private registry credentials
- **Environment Variables** - Access to environment-specific configuration
- **Blockchain Networks** - RPC endpoints for DevNet (staging) and MainNet (production)
- **External Services** - SMTP, monitoring endpoints, log aggregation services

---

## Environment Setup

### Environment Variables Configuration

#### Core Application Variables
```bash
# Application Configuration
NODE_ENV=production                    # development|staging|production
APP_VERSION=1.0.0                     # Application version
ENVIRONMENT=production                 # Environment identifier

# Database Configuration
DB_HOST=pfm-production-postgres        # Database hostname
DB_PORT=5432                          # Database port
DB_NAME=pfm_community_production      # Database name
DB_USER=pfm_user                      # Database username
DB_PASSWORD=your_secure_password      # Database password (use secrets)

# Redis Configuration  
REDIS_HOST=pfm-production-redis       # Redis hostname
REDIS_PORT=6379                       # Redis port
REDIS_PASSWORD=your_redis_password    # Redis password (use secrets)

# Solana Blockchain Configuration
SOLANA_NETWORK=mainnet-beta           # devnet|testnet|mainnet-beta
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com  # RPC endpoint
SOLANA_PROGRAM_ID=your_program_id     # Deployed smart contract ID

# Authentication & Security
JWT_SECRET=your_jwt_secret_key        # JWT signing key (use secrets)
SESSION_SECRET=your_session_secret    # Session encryption key (use secrets)
ENCRYPTION_KEY=your_encryption_key    # Data encryption key (use secrets)

# External Services
SMTP_HOST=smtp.gmail.com              # Email service host
SMTP_PORT=587                         # Email service port
SMTP_USERNAME=alerts@pfm-community.com # Email username
SMTP_PASSWORD=your_smtp_password      # Email password (use secrets)

# Monitoring & Logging
PROMETHEUS_PORT=9090                  # Metrics collection port
GRAFANA_PORT=3003                     # Dashboard port
LOKI_PORT=3100                        # Log aggregation port
LOG_LEVEL=info                        # debug|info|warn|error
```

#### Environment-Specific Variables
```bash
# Development Environment (.env.development)
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
DB_NAME=pfm_community_development
LOG_LEVEL=debug

# Staging Environment (.env.staging)  
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
DB_NAME=pfm_community_staging
LOG_LEVEL=info

# Production Environment (.env.production)
SOLANA_NETWORK=mainnet-beta
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
DB_NAME=pfm_community_production
LOG_LEVEL=warn
```

### Secrets Management

#### Using Docker Secrets (Production)
```bash
# Create secrets directory
mkdir -p /var/secrets/pfm

# Store sensitive values
echo "your_secure_db_password" | docker secret create pfm_db_password -
echo "your_jwt_secret_key" | docker secret create pfm_jwt_secret -
echo "your_session_secret" | docker secret create pfm_session_secret -
```

#### Using Environment Files (Development/Staging)
```bash
# Copy template and customize
cp environments/staging.env.example environments/staging.env
cp environments/production.env.example environments/production.env

# Edit with secure values (never commit to version control)
nano environments/production.env
```

---

## Development Deployment

### Local Development Setup

#### 1. Clone and Initialize Repository
```bash
# Clone the repository
git clone https://github.com/your-org/pfm-docker.git
cd pfm-docker

# Create environment file
cp environments/development.env.example .env

# Initialize dependencies
npm install
```

#### 2. Build and Start Services
```bash
# Build all container images
docker-compose build

# Start all services in development mode
docker-compose up -d

# View service status
docker-compose ps

# View logs for specific service
docker-compose logs -f backend
```

#### 3. Initialize Application Data
```bash
# Run database migrations
docker-compose exec backend npm run db:migrate

# Seed initial data
docker-compose exec backend npm run db:seed

# Deploy smart contracts to local validator
cd contracts/voting && anchor deploy
```

#### 4. Validate Deployment
```bash
# Health check all services
curl -f http://localhost:3000/health    # Backend API
curl -f http://localhost:3001/health    # Admin Portal  
curl -f http://localhost:3002/health    # Member Portal

# Check blockchain connectivity
docker-compose exec backend npm run blockchain:validate

# Run integration tests
npm run test:integration
```

### Development Workflow Commands
```bash
# Start services
docker-compose up -d

# Stop services  
docker-compose down

# Restart specific service
docker-compose restart backend

# View real-time logs
docker-compose logs -f

# Update container images
docker-compose pull
docker-compose up -d

# Clean up volumes and images
docker-compose down -v
docker system prune -a
```

---

## Staging Deployment

### Staging Environment Setup

#### 1. Infrastructure Preparation
```bash
# Set staging environment
export ENVIRONMENT=staging

# Create staging network
docker network create pfm_staging_network

# Prepare configuration
cp environments/staging.env.example environments/staging.env
# Edit environments/staging.env with staging-specific values
```

#### 2. Deploy Infrastructure Services
```bash
# Deploy infrastructure stack
cd infra && docker-compose -f docker-compose/staging.yml up -d

# Deploy monitoring stack
cd infra/monitoring && docker-compose -f docker-compose.monitoring.yml up -d

# Deploy logging stack  
cd infra/logging && docker-compose -f docker-compose.logging.yml up -d

# Validate infrastructure
./scripts/infrastructure/validate-environment.sh staging
```

#### 3. Deploy Application Services
```bash
# Deploy application with staging configuration
ENVIRONMENT=staging docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d

# Run database migrations
docker-compose exec backend npm run db:migrate

# Deploy smart contracts to DevNet
cd contracts/voting
anchor build
anchor deploy --provider.cluster devnet
```

#### 4. Configure Monitoring and Alerting
```bash
# Import Grafana dashboards
./scripts/monitoring/import-dashboards.sh staging

# Validate alert rules
./scripts/monitoring/validate-alerts.sh staging

# Test notification channels
./scripts/monitoring/test-notifications.sh staging
```

#### 5. Staging Validation
```bash
# Run comprehensive health checks
./scripts/infrastructure/test-infrastructure.sh

# Validate application functionality
npm run test:staging

# Performance baseline testing
./scripts/testing/performance-test.sh staging

# Security validation
./scripts/testing/security-scan.sh staging
```

---

## Production Deployment

### Production Environment Setup

#### 1. Pre-Deployment Checklist
```bash
# Verify all prerequisites
./scripts/deployment/pre-deployment-check.sh production

# Backup existing data
./scripts/backup/backup-production.sh

# Validate configuration
./scripts/deployment/validate-config.sh production

# Security scan
./scripts/security/production-security-check.sh
```

#### 2. Infrastructure Deployment
```bash
# Set production environment
export ENVIRONMENT=production

# Deploy infrastructure using Terraform (if applicable)
cd infra/terraform
terraform init
terraform plan -var-file="production.tfvars"
terraform apply -var-file="production.tfvars"

# Or deploy using Docker Compose
cd infra && docker-compose -f docker-compose/production.yml up -d
```

#### 3. Application Deployment (Blue-Green Strategy)
```bash
# Deploy to green environment
DEPLOYMENT_SLOT=green ENVIRONMENT=production \
  docker-compose -f docker-compose.yml -f docker-compose.production.yml up -d

# Run smoke tests on green environment
./scripts/testing/smoke-test.sh green

# Switch traffic to green environment
./scripts/deployment/switch-traffic.sh green

# Validate production functionality
./scripts/testing/production-validation.sh

# Cleanup blue environment after successful deployment
./scripts/deployment/cleanup-blue.sh
```

#### 4. Database Migration (Production)
```bash
# Create database backup before migration
./scripts/backup/backup-database.sh production

# Run migrations with rollback preparation
docker-compose exec backend npm run db:migrate:production

# Validate data integrity
docker-compose exec backend npm run db:validate

# Update smart contracts on MainNet (if needed)
cd contracts/voting
anchor build
anchor deploy --provider.cluster mainnet-beta
```

#### 5. Post-Deployment Validation
```bash
# Comprehensive health checks
./scripts/monitoring/health-check-all.sh production

# Performance validation
./scripts/testing/performance-validation.sh production

# Security validation
./scripts/security/post-deployment-security-check.sh

# Monitoring setup validation
./scripts/monitoring/validate-production-monitoring.sh

# Alert testing
./scripts/monitoring/test-production-alerts.sh
```

---

## CI/CD Pipeline Deployment

### GitHub Actions Deployment

#### Pipeline Trigger Commands
```bash
# Trigger staging deployment
git push origin main
# Automatically triggers staging deployment pipeline

# Trigger production deployment
git tag v1.0.0
git push origin v1.0.0
# Triggers production deployment pipeline

# Manual deployment trigger
gh workflow run cd-master.yml -f environment=production -f version=v1.0.0
```

#### Pipeline Monitoring
```bash
# View pipeline status
gh run list --workflow=cd-master.yml

# View specific run details
gh run view <run-id>

# Download pipeline artifacts
gh run download <run-id>

# View pipeline logs
gh run view <run-id> --log
```

### Manual Pipeline Execution
```bash
# Run CI pipeline locally
./scripts/ci/run-ci-locally.sh

# Run CD pipeline steps manually
./scripts/cd/run-deployment.sh staging
./scripts/cd/run-deployment.sh production

# Validate deployment
./scripts/cd/validate-deployment.sh production
```

---

## Rollback Procedures

### Automated Rollback
```bash
# Trigger automatic rollback on health check failure
./scripts/deployment/rollback.sh production --reason="health-check-failure"

# Rollback to specific version
./scripts/deployment/rollback.sh production --version="v1.0.0"

# Rollback database to backup
./scripts/backup/restore-database.sh production --backup-id="backup-20240101-120000"
```

### Manual Rollback Procedures

#### Application Rollback
```bash
# 1. Stop current deployment
docker-compose down

# 2. Switch to previous version
git checkout tags/v1.0.0

# 3. Deploy previous version
ENVIRONMENT=production docker-compose up -d

# 4. Validate rollback
./scripts/testing/smoke-test.sh production

# 5. Update monitoring
./scripts/monitoring/update-deployment-status.sh production rollback
```

#### Database Rollback
```bash
# 1. Stop application services
docker-compose stop backend admin-portal member-portal

# 2. Restore database from backup
./scripts/backup/restore-database.sh production --backup-id="latest"

# 3. Restart services
docker-compose start backend admin-portal member-portal

# 4. Validate data integrity
docker-compose exec backend npm run db:validate
```

#### Smart Contract Rollback
```bash
# Note: Smart contracts cannot be "rolled back" once deployed
# Use upgrade mechanisms or deploy new version

# 1. Deploy corrected contract version
cd contracts/voting
anchor build
anchor deploy --provider.cluster mainnet-beta

# 2. Update application configuration
# Update SOLANA_PROGRAM_ID in environment variables

# 3. Restart application services
docker-compose restart backend

# 4. Validate blockchain connectivity
./scripts/blockchain/validate-connection.sh production
```

---

## Health Checks and Validation

### Automated Health Checks
```bash
# Application health checks
curl -f http://localhost:3000/health        # Backend API
curl -f http://localhost:3001/health        # Admin Portal
curl -f http://localhost:3002/health        # Member Portal

# Infrastructure health checks
curl -f http://localhost:9090/api/v1/query  # Prometheus
curl -f http://localhost:3003/api/health    # Grafana
curl -f http://localhost:3100/ready         # Loki

# Database connectivity
docker-compose exec backend npm run db:ping

# Redis connectivity
docker-compose exec backend npm run cache:ping

# Blockchain connectivity
docker-compose exec backend npm run blockchain:ping
```

### Comprehensive Validation Script
```bash
#!/bin/bash
# ./scripts/deployment/validate-deployment.sh

ENVIRONMENT=${1:-staging}
echo "Validating deployment for environment: $ENVIRONMENT"

# Health check all services
echo "Checking service health..."
for service in backend admin-portal member-portal; do
    if curl -f "http://localhost:300${i}/health"; then
        echo "✅ $service healthy"
    else
        echo "❌ $service unhealthy"
        exit 1
    fi
done

# Database validation
echo "Validating database..."
docker-compose exec backend npm run db:validate || exit 1

# Smart contract validation
echo "Validating smart contract..."
docker-compose exec backend npm run blockchain:validate || exit 1

# Performance check
echo "Running performance validation..."
./scripts/testing/performance-check.sh $ENVIRONMENT || exit 1

echo "✅ All validations passed"
```

---

## Troubleshooting

### Common Deployment Issues

#### Container Startup Failures
```bash
# Check container status
docker-compose ps

# View container logs
docker-compose logs backend

# Check resource usage
docker stats

# Restart failed service
docker-compose restart backend

# Rebuild container if needed
docker-compose build backend
docker-compose up -d backend
```

#### Database Connection Issues
```bash
# Check database container status
docker-compose ps postgres

# View database logs
docker-compose logs postgres

# Test database connectivity
docker-compose exec postgres psql -U pfm_user -d pfm_community_production -c "SELECT 1"

# Reset database connection pool
docker-compose restart backend
```

#### Blockchain Connectivity Issues
```bash
# Check Solana RPC endpoint
curl -X POST https://api.mainnet-beta.solana.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getVersion"}'

# Validate smart contract deployment
anchor verify <program-id>

# Check application blockchain configuration
docker-compose exec backend node -e "console.log(process.env.SOLANA_RPC_URL)"
```

#### Performance Issues
```bash
# Check resource usage
docker stats

# View slow queries
docker-compose exec backend npm run db:slow-queries

# Check cache hit rates
docker-compose exec backend npm run cache:stats

# Monitor application metrics
curl http://localhost:9090/api/v1/query?query=pfm_http_requests_total
```

### Emergency Procedures

#### Service Recovery
```bash
# Emergency service restart
docker-compose down && docker-compose up -d

# Force container recreation
docker-compose up -d --force-recreate

# Emergency rollback
./scripts/deployment/emergency-rollback.sh production
```

#### Data Recovery
```bash
# Emergency database restore
./scripts/backup/emergency-restore.sh production

# Container volume recovery
docker volume ls
docker run --rm -v pfm_db_data:/backup alpine tar -czf - /backup
```

---

## Best Practices

### Security Best Practices
- Use Docker secrets for sensitive data in production
- Regularly rotate encryption keys and passwords
- Keep container images updated with security patches
- Use non-root users in containers
- Implement network segmentation between environments

### Performance Best Practices
- Monitor resource usage and scale horizontally when needed
- Use Redis caching for frequently accessed data
- Implement database connection pooling
- Optimize smart contract calls to reduce blockchain fees
- Use CDN for static assets in production

### Operational Best Practices
- Implement comprehensive monitoring and alerting
- Maintain automated backup and recovery procedures
- Use blue-green or canary deployments for zero-downtime updates
- Keep deployment documentation updated with infrastructure changes
- Practice disaster recovery procedures regularly

---

This deployment guide provides comprehensive procedures for deploying the PFM Community Management Application across all environments. Follow these procedures for reliable, secure, and scalable deployments. 