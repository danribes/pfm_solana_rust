# Admin Portal Containerization Considerations

## Overview
This document addresses how the admin portal wireframes and implementation must account for the containerized architecture of the PFM application.

## Current Container Architecture

### Development Environment
```
┌─────────────────────────────────────────────────────────────────┐
│                    Docker Development Setup                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                Dev Container                              │  │
│  │  ┌─────────────────┬─────────────────┬─────────────────┐  │  │
│  │  │   Backend API   │  Admin Portal   │ Member Portal   │  │  │
│  │  │   Port: 3000    │   Port: 3001    │   Port: 3002    │  │  │
│  │  │   Express.js    │    Next.js      │    Next.js      │  │  │
│  │  └─────────────────┴─────────────────┴─────────────────┘  │  │
│  │                                                           │  │
│  │  ┌─────────────────┬─────────────────┬─────────────────┐  │  │
│  │  │   Smart         │    Testing      │   Dev Tools     │  │  │
│  │  │  Contracts      │    Suite        │   (VS Code)     │  │  │
│  │  │   Anchor        │     Jest        │                 │  │  │
│  │  └─────────────────┴─────────────────┴─────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              External Services                            │  │
│  │  ┌─────────────────┬─────────────────┬─────────────────┐  │  │
│  │  │ Solana Validator│   PostgreSQL    │     Redis       │  │  │
│  │  │  Ports: 8899/   │   Port: 5432    │   Port: 6379    │  │  │
│  │  │        8900     │  (container)    │  (container)    │  │  │
│  │  └─────────────────┴─────────────────┴─────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Wireframe Updates Required for Containerization

### 1. **Environment Configuration Management**

#### API Endpoint Configuration
The admin portal wireframes need to account for different API endpoints based on environment:

```typescript
// Environment-based API configuration
const API_CONFIG = {
  development: {
    backend: 'http://localhost:3000',
    solana: 'http://localhost:8899',
    websocket: 'ws://localhost:8900'
  },
  docker: {
    backend: 'http://backend:3000',
    solana: 'http://solana-local-validator:8899',
    websocket: 'ws://solana-local-validator:8900'
  },
  production: {
    backend: process.env.NEXT_PUBLIC_API_URL,
    solana: process.env.NEXT_PUBLIC_SOLANA_RPC,
    websocket: process.env.NEXT_PUBLIC_SOLANA_WS
  }
};
```

#### Updated Environment Variables for Admin Portal
```bash
# Container Network Configuration
NEXT_PUBLIC_API_URL=http://backend:3000
NEXT_PUBLIC_SOLANA_RPC=http://solana-local-validator:8899
NEXT_PUBLIC_SOLANA_WS=ws://solana-local-validator:8900

# Development Overrides
NEXT_PUBLIC_DEV_API_URL=http://localhost:3000
NEXT_PUBLIC_DEV_SOLANA_RPC=http://localhost:8899
NEXT_PUBLIC_DEV_SOLANA_WS=ws://localhost:8900

# Container-specific settings
CONTAINER_MODE=true
SERVICE_DISCOVERY_ENABLED=true
INTERNAL_PORT=3001
EXTERNAL_PORT=3001
```

### 2. **Service Discovery Integration**

#### Updated Wireframe: Settings Panel
The settings wireframe should include container networking configuration:

```
┌─────────────────────────────────────────────────────────────────┐
│ System Settings - Container Configuration                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Container Environment:                                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Mode: [Development Container ▼]                            │ │
│ │ Backend Service: backend:3000 ✅ Connected                 │ │
│ │ Solana Service: solana-local-validator:8899 ✅ Connected   │ │
│ │ Database: postgres:5432 ✅ Connected                       │ │
│ │ Redis: redis:6379 ✅ Connected                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Service Health Checks:                                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ✅ Backend API (Response: 45ms)                            │ │
│ │ ✅ Solana RPC (Response: 120ms)                            │ │
│ │ ✅ Database (Response: 12ms)                               │ │
│ │ ✅ Redis Cache (Response: 8ms)                             │ │
│ │ ⚠️  WebSocket (Intermittent connection)                    │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Container Networking:                                           │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Internal Network: pfm-docker_default                       │ │
│ │ External Ports: 3001 (Admin), 3002 (Member)               │ │
│ │ Service Mesh: [Enabled ▼]                                 │ │
│ │ Load Balancing: [Round Robin ▼]                           │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 3. **Docker-Compose Integration**

#### Required docker-compose.yml Updates
```yaml
version: '3.8'

services:
  # Development container with all frontend/backend
  dev:
    build:
      context: .
      dockerfile: .devcontainer/Dockerfile
    container_name: dev-container
    volumes:
      - .:/workspace:cached
    working_dir: /workspace
    ports:
      - "3000:3000"  # Backend API
      - "3001:3001"  # Admin Portal
      - "3002:3002"  # Member Portal
    environment:
      - NODE_ENV=development
      - CONTAINER_MODE=true
    depends_on:
      - postgres
      - redis
      - solana-local-validator
    networks:
      - pfm-network
    command: bash -c "
      cd backend && npm run dev &
      cd frontend/admin && npm run dev &
      cd frontend/member && npm run dev &
      wait"

  # PostgreSQL Database
  postgres:
    image: postgres:15
    container_name: community-postgres
    environment:
      POSTGRES_DB: pfm_community
      POSTGRES_USER: pfm_user
      POSTGRES_PASSWORD: pfm_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - pfm-network

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: community-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - pfm-network

  # Solana Local Validator
  solana-local-validator:
    image: solanalabs/solana:v1.17.20
    container_name: solana-local-validator
    ports:
      - "8899:8899"  # RPC
      - "8900:8900"  # WebSocket
    networks:
      - pfm-network
    command: solana-test-validator --no-bpf-strict

volumes:
  postgres_data:
  redis_data:

networks:
  pfm-network:
    driver: bridge
```

### 4. **Health Check Integration in Admin Wireframes**

#### Enhanced Dashboard with Container Monitoring
```
┌─────────────────────────────────────────────────────────────────┐
│ Dashboard - Container Health Overview                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─────────────┬─────────────┬─────────────┬─────────────────────┐ │
│ │   System    │ Container   │   Service   │    Network         │ │
│ │   Health    │   Status    │   Mesh      │    Latency         │ │
│ │             │             │             │                    │ │
│ │  🟢 Healthy │ 4/4 Running │  ✅ Active  │   45ms avg         │ │
│ │  98% Uptime │ 0 Restarted │  Load: 67%  │   (Target: <100ms) │ │
│ └─────────────┴─────────────┴─────────────┴─────────────────────┘ │
│                                                                 │
│ Container Status:                                               │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🟢 dev-container        │ Running │ CPU: 45% │ RAM: 1.2GB  │ │
│ │ 🟢 community-postgres   │ Running │ CPU: 12% │ RAM: 256MB  │ │
│ │ 🟢 community-redis      │ Running │ CPU: 8%  │ RAM: 64MB   │ │
│ │ 🟢 solana-local-validator│ Running │ CPU: 23% │ RAM: 512MB  │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Service Discovery:                                              │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ backend:3000      │ ✅ Healthy │ Last check: 30s ago       │ │
│ │ postgres:5432     │ ✅ Healthy │ Last check: 30s ago       │ │
│ │ redis:6379        │ ✅ Healthy │ Last check: 30s ago       │ │
│ │ solana:8899       │ ✅ Healthy │ Last check: 30s ago       │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 5. **Development vs Production Considerations**

#### Environment-Specific Wireframe Adaptations

**Development Mode (Docker Container):**
- Show container networking status
- Display service discovery information
- Include hot reload status
- Show development tool integration

**Production Mode (Container Orchestration):**
- Display load balancer status
- Show horizontal scaling metrics
- Include failover mechanisms
- Display SSL/TLS certificate status

### 6. **API Client Configuration for Containers**

#### Updated API Client Setup
```typescript
// api/client.ts
class ContainerAwareAPIClient {
  private baseURL: string;
  private isContainer: boolean;

  constructor() {
    this.isContainer = process.env.CONTAINER_MODE === 'true';
    this.baseURL = this.getAPIEndpoint();
  }

  private getAPIEndpoint(): string {
    if (typeof window !== 'undefined') {
      // Client-side: use external URLs
      return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    } else if (this.isContainer) {
      // Server-side in container: use internal service names
      return 'http://backend:3000';
    } else {
      // Server-side local development
      return 'http://localhost:3000';
    }
  }

  // Health check method for container environments
  async checkServiceHealth(): Promise<ServiceHealthStatus> {
    const services = ['backend', 'postgres', 'redis', 'solana'];
    const healthChecks = await Promise.allSettled(
      services.map(service => this.pingService(service))
    );
    
    return this.parseHealthResults(healthChecks);
  }
}
```

### 7. **Error Handling for Container Environments**

#### Enhanced Error States in Wireframes
```
┌─────────────────────────────────────────────────────────────────┐
│ ⚠️ Service Connection Error                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Cannot connect to backend service (backend:3000)               │
│                                                                 │
│ Container Status:                                               │
│ • dev-container: 🟢 Running                                    │
│ • backend service: 🔴 Unavailable                              │
│ • Network: pfm-docker_default                                  │
│                                                                 │
│ Troubleshooting:                                                │
│ 1. Check if backend container is running                       │
│ 2. Verify port 3000 is exposed in docker-compose.yml          │
│ 3. Ensure services are on the same Docker network             │
│                                                                 │
│ [🔄 Retry Connection] [🔧 Check Container Logs] [📋 Copy Info] │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation Updates Required

### 1. **Package.json Scripts for Container Environment**
```json
{
  "scripts": {
    "dev": "next dev -p 3001",
    "dev:container": "next dev -p 3001 -H 0.0.0.0",
    "build": "next build",
    "start": "next start -p 3001 -H 0.0.0.0",
    "start:container": "NODE_ENV=production next start -p 3001 -H 0.0.0.0",
    "health-check": "node scripts/health-check.js"
  }
}
```

### 2. **Next.js Configuration for Containers**
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for containers
  output: process.env.CONTAINER_MODE === 'true' ? 'standalone' : undefined,
  
  // Configure for container networking
  async rewrites() {
    if (process.env.CONTAINER_MODE === 'true') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://backend:3000/api/:path*'
        }
      ];
    }
    return [];
  },

  // Environment variables for containers
  env: {
    CONTAINER_MODE: process.env.CONTAINER_MODE,
    INTERNAL_API_URL: process.env.INTERNAL_API_URL
  }
};

module.exports = nextConfig;
```

### 3. **Health Check Implementation**
```typescript
// scripts/health-check.js
const services = [
  { name: 'backend', url: 'http://backend:3000/health' },
  { name: 'postgres', url: 'postgresql://postgres:5432' },
  { name: 'redis', url: 'redis://redis:6379' },
  { name: 'solana', url: 'http://solana-local-validator:8899' }
];

async function performHealthChecks() {
  const results = await Promise.allSettled(
    services.map(service => checkService(service))
  );
  
  return {
    healthy: results.filter(r => r.status === 'fulfilled').length,
    total: services.length,
    details: results
  };
}
```

## Conclusion

The Task 4.1.1 wireframes provide an excellent foundation, but they need these containerization enhancements to work effectively in the Docker environment. The main areas requiring updates are:

1. **Service Discovery**: Using container service names instead of localhost
2. **Health Monitoring**: Container-aware health checks in the admin interface
3. **Environment Configuration**: Proper environment variable management
4. **Error Handling**: Container-specific error states and troubleshooting
5. **Network Configuration**: Proper port mapping and internal networking

These updates ensure the admin portal works seamlessly in both development containers and production container orchestration environments. 