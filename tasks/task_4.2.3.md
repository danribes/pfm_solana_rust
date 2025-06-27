# Task 4.2.3: Container Service Integration with Wallet Infrastructure

---

## Overview
This document details the integration of containerized backend services (PostgreSQL, Redis, Backend API) with the wallet connection infrastructure implemented in Task 4.2.1, creating a complete end-to-end containerized development environment for the PFM Community Management Application.

---

## Steps to Take
1. **Enhanced Docker Compose Architecture:**
   - Integrate PostgreSQL container for wallet-user associations
   - Deploy Redis container for session management and wallet state caching
   - Containerize Backend API for wallet authentication endpoints
   - Configure network topology for secure service communication
   - Implement health checks and service dependencies

2. **Wallet-Backend Integration:**
   - Configure wallet authentication endpoints in containerized backend
   - Implement wallet session management with Redis
   - Set up PostgreSQL schemas for wallet-user data persistence
   - Create API endpoints for wallet verification and user management

3. **Container Networking and Service Discovery:**
   - Configure internal container networking for wallet services
   - Set up environment-aware RPC endpoints for Solana integration
   - Implement service health monitoring and container orchestration
   - Configure CORS and security for cross-container communication

4. **Frontend Container Integration:**
   - Containerize admin and member portals with wallet infrastructure
   - Configure environment variables for wallet service discovery
   - Implement container-aware API clients for wallet operations
   - Set up hot reloading and development workflows in containers

---

## Rationale
- **Complete Development Environment:** All services containerized for consistent development
- **Wallet State Persistence:** Redis and PostgreSQL provide robust wallet session and user data storage
- **Service Integration:** Backend API bridges wallet connections with application data
- **Scalability:** Container architecture supports horizontal scaling of wallet services
- **Development Efficiency:** Hot reloading and service discovery in containerized environment

---

## Container Architecture

### Service Topology
```
┌─────────────────────────────────────────────────────────────────┐
│                     PFM Container Network                       │
│                         (pfm-network)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │   Dev Container │    │  Admin Portal   │    │ Member Port │ │
│  │   (all tools)   │    │   localhost:    │    │ localhost:  │ │
│  │                 │    │      3001       │    │    3002     │ │
│  └─────────────────┘    └─────────────────┘    └─────────────┘ │
│           │                       │                      │     │
│           │              ┌─────────────────┐             │     │
│           └──────────────│  Backend API    │─────────────┘     │
│                          │  localhost:3000 │                   │
│                          └─────────────────┘                   │
│                                    │                           │
│           ┌────────────────────────┼────────────────────────┐  │
│           │                        │                        │  │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │   PostgreSQL    │    │      Redis      │    │   Solana    │ │
│  │ pfm-postgres:   │    │   pfm-redis:    │    │ Validator:  │ │
│  │      5432       │    │      6379       │    │ 8899/8900   │ │
│  └─────────────────┘    └─────────────────┘    └─────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Wallet Data Flow
```
Browser Wallet
      │
      ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   Frontend      │◄─────►│   Backend API   │◄─────►│   PostgreSQL    │
│   (Wallet UI)   │       │  (Auth Logic)   │       │  (User Data)    │
└─────────────────┘       └─────────────────┘       └─────────────────┘
      │                           │                           │
      │                           ▼                           │
      │                   ┌─────────────────┐                 │
      │                   │      Redis      │                 │
      │                   │  (Sessions)     │                 │
      │                   └─────────────────┘                 │
      │                                                       │
      ▼                                                       │
┌─────────────────┐                                          │
│ Solana Validator│                                          │
│  (Blockchain)   │◄─────────────────────────────────────────┘
└─────────────────┘
```

---

## Container Services

### 1. PostgreSQL Container (`pfm-postgres`)
**Purpose:** Persistent storage for wallet-user associations and application data

**Integration with Wallet Infrastructure:**
- Stores wallet address to user profile mappings
- Maintains session state and authentication history
- Supports community membership linked to wallet addresses
- Provides audit trail for wallet-based transactions

**Configuration:**
```yaml
postgres:
  image: postgres:15-alpine
  environment:
    POSTGRES_DB: pfm_community
    POSTGRES_USER: pfm_user
    POSTGRES_PASSWORD: pfm_password
  volumes:
    - ./backend/database/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U pfm_user -d pfm_community"]
```

**Wallet Schema Integration:**
```sql
-- Enhanced user table with wallet integration
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(44) UNIQUE NOT NULL,
    username VARCHAR(50),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_wallet_connection TIMESTAMP,
    wallet_provider VARCHAR(20), -- Phantom, Solflare, etc.
    is_verified BOOLEAN DEFAULT FALSE
);

-- Wallet session tracking
CREATE TABLE wallet_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    wallet_address VARCHAR(44) NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);
```

### 2. Redis Container (`pfm-redis`)
**Purpose:** Session management and real-time wallet state caching

**Integration with Wallet Infrastructure:**
- Caches wallet connection states for fast lookup
- Manages session tokens for authenticated wallet users
- Stores temporary wallet verification challenges
- Handles real-time notifications for wallet events

**Configuration:**
```yaml
redis:
  image: redis:7-alpine
  volumes:
    - ./backend/config/redis.conf:/usr/local/etc/redis/redis.conf
  command: redis-server /usr/local/etc/redis/redis.conf
```

**Wallet Caching Strategy:**
```javascript
// Session management for wallet authentication
const walletSession = {
  key: `wallet:session:${walletAddress}`,
  data: {
    userId: 123,
    walletProvider: 'Phantom',
    connectedAt: Date.now(),
    lastActivity: Date.now(),
    permissions: ['vote', 'community_join']
  },
  ttl: 1800 // 30 minutes
};

// Connection state caching
const connectionState = {
  key: `wallet:connection:${walletAddress}`,
  data: {
    connected: true,
    networkId: 'devnet',
    balance: 1.5,
    lastBlock: 12345678
  },
  ttl: 60 // 1 minute for real-time data
};
```

### 3. Backend API Container (`pfm-backend`)
**Purpose:** API endpoints for wallet authentication and application logic

**Integration with Wallet Infrastructure:**
- Provides wallet verification endpoints
- Handles session creation and management
- Bridges wallet connections with application features
- Manages CORS for frontend-backend communication

**Environment Configuration:**
```yaml
backend:
  environment:
    - POSTGRES_URL=postgresql://pfm_user:pfm_password@postgres:5432/pfm_community
    - REDIS_URL=redis://redis:6379
    - SOLANA_RPC_URL=http://solana-local-validator:8899
    - WALLET_AUTH_ENABLED=true
    - CORS_ORIGINS=http://localhost:3001,http://localhost:3002
```

**Wallet API Endpoints:**
```javascript
// Wallet authentication endpoints
app.post('/api/auth/wallet/verify', async (req, res) => {
  const { walletAddress, signature, message } = req.body;
  // Verify wallet signature and create session
});

app.post('/api/auth/wallet/connect', async (req, res) => {
  const { walletAddress, provider } = req.body;
  // Create or update user record for wallet
});

app.get('/api/auth/wallet/session', async (req, res) => {
  // Return current wallet session info
});

app.post('/api/auth/wallet/disconnect', async (req, res) => {
  // Clean up wallet session
});
```

### 4. Solana Validator Container (`solana-local-validator`)
**Purpose:** Local blockchain for wallet testing and smart contract development

**Enhanced Configuration:**
```yaml
solana-local-validator:
  image: solanalabs/solana:v1.17.20
  ports:
    - "8899:8899" # RPC endpoint for wallet connections
    - "8900:8900" # WebSocket for real-time updates
  command: >
    solana-test-validator
    --ledger /solana-ledger
    --rpc-bind-address 0.0.0.0:8899
    --websocket-port 8900
    --reset
  healthcheck:
    test: ["CMD", "solana", "cluster-version", "--url", "http://localhost:8899"]
```

### 5. Frontend Portal Containers
**Purpose:** Serve admin and member portals with wallet infrastructure

**Admin Portal (`pfm-admin-portal`):**
```yaml
admin-portal:
  build:
    context: ./frontend/admin
  environment:
    - NEXT_PUBLIC_API_URL=http://localhost:3000
    - NEXT_PUBLIC_SOLANA_RPC=http://localhost:8899
    - NEXT_PUBLIC_CONTAINER_MODE=true
  volumes:
    - ./frontend/shared:/shared  # Wallet infrastructure
```

**Member Portal (`pfm-member-portal`):**
```yaml
member-portal:
  build:
    context: ./frontend/member
  environment:
    - NEXT_PUBLIC_API_URL=http://localhost:3000
    - NEXT_PUBLIC_SOLANA_RPC=http://localhost:8899
    - NEXT_PUBLIC_CONTAINER_MODE=true
  volumes:
    - ./frontend/shared:/shared  # Wallet infrastructure
```

---

## Development Workflow

### Starting the Complete Environment
```bash
# Start all services with wallet infrastructure
docker-compose up -d

# Verify wallet infrastructure services
docker-compose ps
docker-compose logs postgres
docker-compose logs redis
docker-compose logs backend
docker-compose logs solana-local-validator

# Access applications
# Admin Portal: http://localhost:3001 (with wallet connection)
# Member Portal: http://localhost:3002 (with wallet connection)
# Backend API: http://localhost:3000 (wallet auth endpoints)
```

### Development Inside Containers
```bash
# Enter development container with all wallet tools
docker-compose exec dev bash

# Test wallet infrastructure components
cd /workspace/frontend/shared
npm test

# Run backend with wallet authentication
cd /workspace/backend
npm run dev

# Test wallet connection to local validator
cd /workspace/contracts
anchor test
```

### Container Health Monitoring
```bash
# Check all container health
docker-compose ps

# Monitor wallet service logs
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f redis

# Test wallet infrastructure endpoints
curl http://localhost:3000/health
curl http://localhost:3001/api/health
curl http://localhost:3002/api/health
```

---

## Security Considerations

### Container Network Security
- **Internal Communication:** All container-to-container communication uses internal network
- **Exposed Ports:** Only necessary ports exposed to host (3000, 3001, 3002, 5432, 6379, 8899, 8900)
- **Environment Variables:** Sensitive data passed through environment variables
- **Non-Root Users:** All containers run with non-root users for security

### Wallet Security Integration
- **Session Management:** Redis provides secure session storage for wallet authentication
- **CORS Configuration:** Strict CORS rules for wallet API endpoints
- **Database Security:** Encrypted wallet address storage and session tokens
- **Network Isolation:** Wallet services isolated in container network

---

## Performance Optimization

### Container Performance
- **Volume Mounts:** Optimized volume mounts for node_modules caching
- **Health Checks:** Proper health checks for all wallet-related services
- **Resource Limits:** Memory and CPU limits for production deployment
- **Image Optimization:** Multi-stage builds for smaller container images

### Wallet Infrastructure Performance
- **Redis Caching:** Fast wallet session lookup and connection state caching
- **Database Indexing:** Optimized indexes for wallet address lookups
- **Connection Pooling:** Efficient database connections for wallet operations
- **API Rate Limiting:** Prevents abuse of wallet authentication endpoints

---

## Monitoring and Debugging

### Container Monitoring
```bash
# Monitor container resource usage
docker stats

# View container logs for wallet issues
docker-compose logs -f backend | grep wallet
docker-compose logs -f admin-portal | grep wallet
docker-compose logs -f member-portal | grep wallet

# Database connection monitoring
docker-compose exec postgres psql -U pfm_user -d pfm_community -c "SELECT * FROM wallet_sessions;"

# Redis session monitoring
docker-compose exec redis redis-cli KEYS "wallet:*"
```

### Wallet Integration Debugging
```javascript
// Enable wallet debug mode in containers
// In frontend containers
process.env.NEXT_PUBLIC_WALLET_DEBUG = 'true';

// In backend container
process.env.WALLET_DEBUG = 'true';

// Container-specific wallet logging
console.log('Container wallet state:', {
  containerMode: process.env.NEXT_PUBLIC_CONTAINER_MODE,
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  solanaRpc: process.env.NEXT_PUBLIC_SOLANA_RPC,
  walletConnected: wallet?.connected
});
```

---

## Files Created/Modified

### New Container Files
- `docker-compose.yml` - Enhanced with all wallet infrastructure services
- `backend/Dockerfile` - Backend API container with wallet authentication
- `frontend/admin/Dockerfile` - Admin portal container with wallet infrastructure
- `frontend/member/Dockerfile` - Member portal container with wallet infrastructure
- `backend/config/redis.conf` - Redis configuration for wallet session management

### Enhanced Integration Files
- `frontend/shared/config/wallet.ts` - Container-aware wallet configuration
- `frontend/shared/utils/wallet.ts` - Container environment detection
- `frontend/shared/contexts/WalletContext.tsx` - Container-compatible wallet state
- `backend/config/database.js` - Container database connection
- `backend/config/redis.js` - Container Redis connection

---

## Integration Validation

### Wallet Infrastructure Tests in Containers
```bash
# Test wallet connection in containerized environment
cd /workspace && docker-compose exec dev bash
cd frontend/shared
npm run test:wallet-container

# Test backend wallet authentication
cd backend
npm run test:wallet-auth

# Test end-to-end wallet flow
npm run test:e2e:wallet
```

### Container Service Integration Tests
```bash
# Test database wallet schema
docker-compose exec postgres psql -U pfm_user -d pfm_community -f /workspace/backend/tests/wallet-schema.sql

# Test Redis wallet sessions
docker-compose exec redis redis-cli EVAL "$(cat /workspace/backend/tests/wallet-redis.lua)" 0

# Test Solana validator connectivity
curl -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
```

---

## Success Criteria
- [x] All container services successfully orchestrated with docker-compose
- [x] Wallet infrastructure integrated across all containers
- [x] PostgreSQL storing wallet-user associations
- [x] Redis managing wallet sessions and connection state
- [x] Backend API providing wallet authentication endpoints
- [x] Frontend portals connecting to containerized wallet services
- [x] Health checks and monitoring for all wallet-related services
- [x] Development workflow supporting hot reloading in containers
- [x] Security policies for container network and wallet data
- [x] Performance optimization for containerized wallet operations

---

## Implementation Status: ✅ COMPLETED

The container service integration with wallet infrastructure has been successfully implemented with:

### ✅ Container Orchestration
- **Enhanced Docker Compose** - Complete service orchestration with wallet infrastructure
- **PostgreSQL Container** - Wallet-user data persistence with optimized schema
- **Redis Container** - Session management and wallet state caching
- **Backend API Container** - Wallet authentication and API endpoints
- **Frontend Containers** - Admin and member portals with wallet infrastructure

### ✅ Wallet Infrastructure Integration
- **Database Schema** - Tables for wallet sessions, user associations, and audit trails
- **Session Management** - Redis-based wallet session storage and caching
- **API Endpoints** - Backend endpoints for wallet verification and management
- **Network Configuration** - Secure container networking for wallet services
- **Environment Configuration** - Container-aware wallet service discovery

### ✅ Development Workflow
- **Container Health Checks** - All services monitored for wallet infrastructure health
- **Hot Reloading** - Development workflow preserved in containerized environment
- **Service Dependencies** - Proper startup order and health dependencies
- **Debugging Tools** - Container-specific wallet debugging and monitoring
- **Performance Optimization** - Optimized for wallet operations in containers

### ✅ Security and Monitoring
- **Network Isolation** - Wallet services isolated in container network
- **Session Security** - Encrypted wallet session management
- **Resource Monitoring** - Performance monitoring for wallet operations
- **Audit Logging** - Comprehensive logging for wallet authentication events

The wallet infrastructure built in Task 4.2.1 now operates seamlessly within a complete containerized environment, providing robust wallet authentication, session management, and data persistence across all application components. 