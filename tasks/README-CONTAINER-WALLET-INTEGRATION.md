# PFM Container & Wallet Infrastructure Integration

This README documents the complete containerized development environment with integrated wallet connection infrastructure for the PFM Community Management Application.

## 🏗️ Architecture Overview

The application consists of multiple containerized services that work together to provide a complete blockchain-enabled community management platform:

```
┌─────────────────────────────────────────────────────────────────┐
│                     PFM Container Network                       │
│                      (pfm-network)                             │
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

## 🚀 Quick Start

### Prerequisites
- Docker Desktop or Docker Engine (20.10+)
- Docker Compose (2.0+)
- VS Code with Dev Containers extension (recommended)

### Start the Complete Environment

```bash
# Clone the repository
git clone <repository-url>
cd pfm-docker

# Start all services
docker-compose up -d

# Verify services are running
docker-compose ps

# Check service health
curl http://localhost:3000/health  # Backend API
curl http://localhost:3001/api/health  # Admin Portal
curl http://localhost:3002/api/health  # Member Portal
```

### Access the Applications

- **Admin Portal**: http://localhost:3001
  - Wallet connection for administrative functions
  - Community management interface
  - Analytics and reporting dashboard

- **Member Portal**: http://localhost:3002
  - Wallet connection for community participation
  - Voting interface
  - Community discovery

- **Backend API**: http://localhost:3000
  - Wallet authentication endpoints
  - Community and voting APIs
  - Health monitoring endpoints

## 🔧 Development Workflow

### Using VS Code Dev Container (Recommended)

1. Open the project in VS Code
2. When prompted, click "Reopen in Container"
3. VS Code will build and start the dev container with all tools

```bash
# Inside the dev container
cd /workspace

# Run backend services
cd backend && npm run dev &

# Run admin portal
cd frontend/admin && npm run dev:container &

# Run member portal
cd frontend/member && npm run dev:container &

# Test smart contracts
cd contracts && anchor test
```

### Manual Container Management

```bash
# Start specific services
docker-compose up postgres redis solana-local-validator -d

# View logs
docker-compose logs -f backend
docker-compose logs -f admin-portal
docker-compose logs -f member-portal

# Enter development container
docker-compose exec dev bash

# Stop all services
docker-compose down

# Clean up volumes (⚠️ will delete data)
docker-compose down -v
```

## 💼 Container Services

### 1. PostgreSQL (`pfm-postgres`)
**Purpose**: Persistent storage for user data and wallet associations

**Features**:
- Stores wallet address to user profile mappings
- Community membership data
- Voting records and session history
- Automatic schema initialization

**Access**:
```bash
# Connect to database
docker-compose exec postgres psql -U pfm_user -d pfm_community

# Example queries
SELECT * FROM users WHERE wallet_address = '...';
SELECT * FROM wallet_sessions WHERE expires_at > NOW();
```

### 2. Redis (`pfm-redis`)
**Purpose**: Session management and caching

**Features**:
- Wallet session storage
- Connection state caching
- Real-time data caching
- Optimized for wallet operations

**Access**:
```bash
# Connect to Redis
docker-compose exec redis redis-cli

# View wallet sessions
KEYS "wallet:*"
GET "wallet:session:ABC123..."
```

### 3. Backend API (`pfm-backend`)
**Purpose**: REST API for application logic

**Features**:
- Wallet authentication endpoints
- Community management APIs
- Integration with PostgreSQL and Redis
- CORS configured for frontend containers

**Endpoints**:
```bash
# Health check
GET http://localhost:3000/health

# Wallet authentication
POST http://localhost:3000/api/auth/wallet/verify
POST http://localhost:3000/api/auth/wallet/connect
GET http://localhost:3000/api/auth/wallet/session
POST http://localhost:3000/api/auth/wallet/disconnect

# Community APIs
GET http://localhost:3000/api/communities
POST http://localhost:3000/api/communities
GET http://localhost:3000/api/communities/:id/members
```

### 4. Solana Validator (`solana-local-validator`)
**Purpose**: Local blockchain for development and testing

**Features**:
- Local Solana blockchain
- RPC endpoint for wallet connections
- WebSocket for real-time updates
- Smart contract deployment target

**Access**:
```bash
# Check validator health
curl -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'

# Deploy smart contracts
cd contracts && anchor deploy
```

### 5. Frontend Portals
**Purpose**: Web interfaces with wallet integration

**Admin Portal Features**:
- Multi-wallet support (Phantom, Solflare, Backpack, Glow, Slope)
- Container-aware configuration
- Health monitoring dashboard
- Community management interface

**Member Portal Features**:
- Wallet connection for voting
- Community discovery and joining
- Real-time voting results
- Mobile-responsive design

## 🔗 Wallet Infrastructure Integration

### Supported Wallets
- **Phantom**: Most popular Solana wallet
- **Solflare**: Feature-rich DeFi wallet
- **Backpack**: Modern social wallet
- **Glow**: Security-focused wallet
- **Slope**: Mobile-first wallet

### Container-Aware Configuration

The wallet infrastructure automatically detects the container environment:

```typescript
// Environment-aware RPC endpoints
const RPC_ENDPOINTS = {
  'localhost': process.env.NEXT_PUBLIC_LOCALHOST_RPC_URL || 'http://localhost:8899',
  'devnet': process.env.NEXT_PUBLIC_DEVNET_RPC_URL || clusterApiUrl('devnet'),
  'mainnet-beta': process.env.NEXT_PUBLIC_MAINNET_RPC_URL || clusterApiUrl('mainnet-beta')
};

// Container service discovery
const API_URL = process.env.NEXT_PUBLIC_CONTAINER_MODE === 'true'
  ? 'http://backend:3000'  // Internal container networking
  : 'http://localhost:3000'; // Host networking
```

### Wallet Data Flow

```
1. User connects wallet in browser
2. Frontend validates connection
3. Backend creates session in Redis
4. User data stored in PostgreSQL
5. Smart contract interactions via Solana validator
6. Real-time updates via WebSocket
```

## 🔐 Security Features

### Container Network Security
- **Isolated Network**: All containers run in isolated network
- **Port Exposure**: Only necessary ports exposed to host
- **Internal Communication**: Services communicate via internal hostnames
- **Environment Variables**: Sensitive data passed securely

### Wallet Security
- **Session Management**: Secure session storage in Redis
- **Signature Verification**: Server-side wallet signature validation
- **CORS Protection**: Strict CORS rules for API endpoints
- **Network Isolation**: Wallet services isolated in container network

## 📊 Monitoring and Health Checks

### Service Health Endpoints
```bash
# Check all service health
curl http://localhost:3000/health | jq
curl http://localhost:3001/api/health | jq
curl http://localhost:3002/api/health | jq

# Check container resource usage
docker stats

# Monitor service logs
docker-compose logs -f --tail=100 backend
docker-compose logs -f --tail=100 postgres
docker-compose logs -f --tail=100 redis
```

### Health Check Response Example
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "containerMode": true,
  "services": {
    "backend": {"status": "healthy", "latency": 45},
    "postgres": {"status": "healthy", "latency": 12},
    "redis": {"status": "healthy", "latency": 8},
    "solana": {"status": "healthy", "latency": 120}
  },
  "walletInfrastructure": {
    "configured": true,
    "supportedWallets": ["Phantom", "Solflare", "Backpack", "Glow", "Slope"],
    "networkEndpoint": "http://localhost:8899",
    "containerAware": true
  }
}
```

## 🧪 Testing

### Wallet Infrastructure Tests
```bash
# Enter development container
docker-compose exec dev bash

# Test wallet components
cd /workspace/frontend/shared
npm test

# Test backend wallet authentication
cd /workspace/backend
npm run test:wallet

# Test smart contract integration
cd /workspace/contracts
anchor test
```

### Container Integration Tests
```bash
# Test database connectivity
docker-compose exec postgres psql -U pfm_user -d pfm_community -c "SELECT 1;"

# Test Redis connectivity
docker-compose exec redis redis-cli ping

# Test Solana validator
curl -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getVersion"}'
```

## 🚨 Troubleshooting

### Common Issues

**Services won't start**:
```bash
# Check Docker is running
docker version

# Check port conflicts
docker-compose ps
netstat -tulpn | grep :3000

# Reset containers
docker-compose down -v
docker-compose up -d
```

**Wallet connection fails**:
```bash
# Check Solana validator
docker-compose logs solana-local-validator

# Verify RPC endpoint
curl http://localhost:8899 -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'

# Check frontend environment variables
docker-compose exec admin-portal printenv | grep SOLANA
```

**Database connection issues**:
```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres psql -U pfm_user -d pfm_community -c "SELECT NOW();"

# Reset database
docker-compose down
docker volume rm pfm-docker_postgres_data
docker-compose up -d postgres
```

### Debug Mode

Enable debug logging:
```bash
# Add to docker-compose.yml environment
- DEBUG=wallet:*
- NEXT_PUBLIC_WALLET_DEBUG=true
- POSTGRES_LOG_STATEMENT=all
- REDIS_LOG_LEVEL=debug
```

## 📈 Performance Optimization

### Container Performance
- **Volume Caching**: Node modules cached in separate volumes
- **Health Checks**: Optimized health check intervals
- **Resource Limits**: Memory and CPU limits configured
- **Multi-stage Builds**: Optimized Docker images

### Wallet Performance
- **Redis Caching**: Fast session lookup
- **Connection Pooling**: Efficient database connections
- **RPC Optimization**: Optimized Solana RPC calls
- **State Management**: Efficient React state updates

## 🔄 Development vs Production

### Development (Current Setup)
- All services in single Docker Compose
- Hot reloading enabled
- Debug logging enabled
- Local Solana validator
- Development databases

### Production Deployment
- Separate container orchestration (Kubernetes/Docker Swarm)
- Production databases (managed PostgreSQL/Redis)
- Mainnet Solana endpoints
- SSL/TLS termination
- Load balancing and scaling

## 📚 Additional Resources

- [Task 4.2.1: Wallet Connection Infrastructure](tasks/task_4.2.1.md)
- [Task 4.2.3: Container Service Integration](tasks/task_4.2.3.md)
- [Wallet Integration Examples](frontend/shared/examples/wallet-integration-example.tsx)
- [Container Architecture Documentation](frontend/shared/docs/containerization-integration.md)

## 🤝 Contributing

When adding new services or wallet features:

1. Update `docker-compose.yml` with new service
2. Add health checks and environment variables
3. Update wallet configuration if needed
4. Add integration tests
5. Update this README

## 📄 License

MIT License - see LICENSE file for details

---

**✅ Container + Wallet Integration Complete**

This setup provides a complete containerized development environment with robust wallet infrastructure, ready for blockchain-enabled community management application development. 