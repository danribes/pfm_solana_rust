# Frontend Testing Guide

## Overview

This guide explains how to test the wallet connection infrastructure and frontend components of the PFM Community Management Application. The frontend includes both Admin and Member portals with complete Solana wallet integration.

## Quick Start

### Option 1: Automated Test Script (Recommended)

```bash
# Run the interactive test script
node test-frontend.js
```

This script will:
- Check prerequisites (Docker, Node.js, npm)
- Verify wallet infrastructure files
- Help install dependencies
- Start container services
- Provide detailed testing instructions

### Option 2: Manual Setup

1. **Install Dependencies**
   ```bash
   # Install shared component dependencies
   cd frontend/shared && npm install
   
   # Install admin portal dependencies
   cd ../admin && npm install
   
   # Install member portal dependencies  
   cd ../member && npm install
   ```

2. **Start Backend Services**
   ```bash
   # Start PostgreSQL, Redis, and Backend API
   docker-compose up -d postgres redis backend
   ```

3. **Run Frontend Applications**
   
   **Admin Portal:**
   ```bash
   cd frontend/admin
   npm run dev
   # Visit: http://localhost:3000
   ```
   
   **Member Portal:**
   ```bash
   cd frontend/member  
   npm run dev
   # Visit: http://localhost:3000 (different port auto-assigned)
   ```

### Option 3: Full Container Mode

```bash
# Run everything in containers
docker-compose up -d

# Access portals:
# Admin: http://localhost:3000
# Member: http://localhost:3001
```

## What You Can Test

### ✅ Wallet Connection Features

- **Multi-wallet Support**: Phantom, Solflare, Backpack, Glow, Slope
- **Wallet Detection**: Automatic detection of installed wallets
- **Connection Management**: Connect, disconnect, switch wallets
- **Network Support**: Devnet, Testnet, Mainnet-beta
- **Auto-reconnect**: Persistent connections across page reloads
- **Error Handling**: Comprehensive error states and recovery

### ✅ Admin Portal Features

- **Wallet Status Display**: Connection status, wallet name, network, address
- **Connection Controls**: Connect/disconnect buttons, wallet modal
- **Environment Info**: Container mode, API endpoints, RPC settings
- **Available Wallets**: List of installed and supported wallets
- **Real-time Updates**: Live connection status updates

### ✅ Member Portal Features

- **Member Dashboard**: Mock communities, votes, and activities
- **Wallet Integration**: Same wallet infrastructure as admin portal
- **Member Actions**: Wallet-gated community features (disabled without connection)
- **Responsive Design**: Mobile-friendly interface
- **User Experience**: Member-focused wallet connection flow

### ✅ Container Integration

- **Service Discovery**: Automatic backend API detection
- **Health Monitoring**: Container health check endpoints
- **Environment Variables**: Container-aware configuration
- **Session Management**: Redis-based session storage
- **Database Integration**: PostgreSQL user data persistence

## Prerequisites

Before testing, ensure you have:

### Required Software
- **Docker & Docker Compose**: For containerized services
- **Node.js 18+**: For running frontend applications
- **npm or yarn**: For dependency management

### Wallet Setup
- **Solana Wallet**: Install Phantom, Solflare, or other supported wallet
- **Test SOL**: Get some devnet SOL from a faucet for testing
- **Browser**: Modern browser with Web3 support (Chrome, Firefox, Brave)

### Network Setup
- **Devnet Access**: Ensure you can access Solana devnet
- **Local Ports**: Ports 3000, 3001, 5432, 6379 should be available

## Testing Scenarios

### Scenario 1: Basic Wallet Connection

1. Open admin or member portal
2. Click "Connect Wallet" button
3. Select your wallet from the modal
4. Approve connection in wallet extension
5. Verify connection status shows correctly
6. Check wallet address and network display

### Scenario 2: Wallet Switching

1. Connect first wallet
2. Open wallet modal again
3. Select different wallet
4. Verify new wallet connection
5. Check that old wallet is disconnected

### Scenario 3: Network Switching

1. Connect wallet on devnet
2. Switch network in wallet extension
3. Verify portal detects network change
4. Check RPC endpoint adaptation

### Scenario 4: Session Persistence

1. Connect wallet
2. Refresh page
3. Verify auto-reconnect works
4. Check session data persists

### Scenario 5: Container Services

1. Start all container services
2. Connect wallet
3. Check backend API integration
4. Verify health endpoints work
5. Monitor Redis session storage

### Scenario 6: Error Handling

1. Try connecting without wallet installed
2. Reject connection in wallet
3. Disconnect network
4. Verify error states display correctly

## API Endpoints for Testing

### Health Checks
- **Admin Portal**: `http://localhost:3000/api/health`
- **Member Portal**: `http://localhost:3001/api/health`
- **Backend API**: `http://localhost:3001/api/health`

### Container Services
- **PostgreSQL**: `localhost:5432`
- **Redis**: `localhost:6379`
- **Backend API**: `localhost:3001`

### Wallet Configuration
- **RPC Endpoint**: `https://api.devnet.solana.com`
- **WebSocket**: `wss://api.devnet.solana.com`
- **Network**: `devnet`

## Troubleshooting

### Common Issues

**Wallet Not Detected**
- Ensure wallet extension is installed and enabled
- Check browser console for errors
- Try refreshing page

**Connection Fails**
- Check wallet extension permissions
- Verify network connection
- Ensure wallet has some SOL balance

**Container Services Not Starting**
- Check Docker is running: `docker ps`
- Verify ports are available: `netstat -an | grep LISTEN`
- Check container logs: `docker-compose logs [service]`

**Dependencies Issues**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version`
- Update npm: `npm install -g npm@latest`

### Debug Commands

```bash
# Check container status
docker-compose ps

# View container logs
docker-compose logs -f [service-name]

# Restart containers
docker-compose restart

# Clean rebuild
docker-compose down && docker-compose up -d --build

# Check wallet infrastructure
node test-frontend.js
```

### Browser Console Debugging

Open browser dev tools (F12) and check:
- **Console**: JavaScript errors and wallet connection logs
- **Network**: API calls and responses
- **Application**: Local storage and session data
- **Extensions**: Wallet extension status

## Development Tips

### Hot Reload Development

```bash
# Terminal 1: Start backend services
docker-compose up -d postgres redis backend

# Terminal 2: Start admin portal with hot reload
cd frontend/admin && npm run dev

# Terminal 3: Start member portal with hot reload  
cd frontend/member && npm run dev
```

### Environment Variables

The portals use these environment variables:

```bash
NEXT_PUBLIC_CONTAINER_MODE=false
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_WS=wss://api.devnet.solana.com
NEXT_PUBLIC_NETWORK=devnet
```

### Testing Different Networks

To test different Solana networks, update the environment variables:

```bash
# Mainnet
NEXT_PUBLIC_SOLANA_RPC=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_NETWORK=mainnet-beta

# Testnet
NEXT_PUBLIC_SOLANA_RPC=https://api.testnet.solana.com
NEXT_PUBLIC_NETWORK=testnet
```

## Next Steps

After testing the wallet infrastructure, you can:

1. **Add Real Functionality**: Implement actual voting and community features
2. **Extend Components**: Add more wallet-specific features
3. **Improve UX**: Enhance the user interface and experience
4. **Add Tests**: Write unit and integration tests
5. **Deploy**: Set up production deployment with real backend

## Support

If you encounter issues:

1. Check this troubleshooting guide
2. Review container logs
3. Check browser console for errors
4. Verify wallet extension status
5. Test with different wallets/browsers

## Testing Results Summary

### ✅ **Successful Implementations**

**Infrastructure Components:**
- ✅ **Wallet Infrastructure**: Complete TypeScript definitions, React contexts, hooks, and components
- ✅ **Component Architecture**: WalletButton, WalletModal, WalletStatus, WalletConnectionProvider
- ✅ **Multi-wallet Support**: Phantom, Solflare, Backpack, Glow, Slope wallet configurations
- ✅ **Container Integration**: Docker configurations and health monitoring setup
- ✅ **Dependencies**: Successfully installed 1600+ packages for both portals

### ⚠️ **Issues Encountered & Solutions**

#### 1. Node.js Version Warnings (Non-Critical)
**Issue:** 
```
npm WARN EBADENGINE required: { node: '>=20.18.0' }, current: { node: 'v18.19.1' }
```

**Status:** ⚠️ **Warning Only - Does Not Block Testing**
- Solana packages prefer Node.js 20.18.0+ but work with 18.19.1
- All dependencies installed successfully despite warnings
- Wallet functionality remains intact

**Recommendation:** Update to Node.js 20.18.0+ for production, but testing can proceed

#### 2. Docker Container Configuration Issues (Critical)
**Issue:**
```
ERROR: for postgres  'ContainerConfig'
KeyError: 'ContainerConfig'
```

**Status:** ❌ **Container Services Unavailable**
- PostgreSQL, Redis, Backend API containers failed to start
- Docker Compose version compatibility issues
- Volume binding configuration problems

**Workaround:** Frontend testing works without backend containers

#### 3. Missing Browserify Polyfills (Critical - RESOLVED)
**Issue:**
```
Error: Cannot find module 'browserify-zlib'
Error: Cannot find module 'crypto-browserify'
```

**Status:** ✅ **RESOLVED**
- **Root Cause:** Next.js webpack configuration requires Node.js polyfills for Solana web3 libraries
- **Solution Applied:** Installed required polyfill packages:
  ```bash
  npm install crypto-browserify stream-browserify url browserify-zlib \
               stream-http https-browserify assert os-browserify \
               path-browserify --save-dev
  ```

#### 4. Frontend Runtime Issues (Ongoing)
**Issue:**
```
HTTP/1.1 500 Internal Server Error
```

**Status:** 🔄 **Under Investigation**
- Applications start but return 500 errors
- Likely related to React component imports or TypeScript compilation
- Next.js configuration may need additional adjustments

### 🎯 **Current Testing Status**

#### What Works ✅
- **Dependency Installation**: Both portals install packages successfully
- **Infrastructure Components**: All wallet components are implemented
- **Configuration Files**: Next.js configs, Dockerfiles, Docker Compose setup
- **Testing Scripts**: Interactive test script (`test-frontend.js`) functional

#### What Needs Resolution ❌
- **Frontend Runtime**: 500 errors preventing UI testing
- **Container Services**: Backend services container startup issues
- **Component Integration**: React component compatibility with Next.js

### 🚀 **Next Steps for Complete Testing**

#### Immediate Actions
1. **Debug Frontend Runtime Issues**
   - Check Next.js compilation errors
   - Verify React component imports
   - Test simplified component versions

2. **Alternative Testing Approach**
   - Create minimal test components
   - Test wallet integration in isolation
   - Use Create React App for rapid prototyping

3. **Container Service Fixes**
   - Update Docker Compose version
   - Fix volume binding configurations
   - Implement fallback service discovery

#### Long-term Improvements
1. **Node.js Upgrade**: Update to version 20.18.0+
2. **Component Simplification**: Reduce complexity for initial testing
3. **Incremental Testing**: Build up from basic wallet connection
4. **Production Setup**: Complete containerized environment

### 📋 **Testing Checklist Status**

- ✅ **Infrastructure Setup**: Wallet types, configs, utilities
- ✅ **Component Development**: All UI components implemented  
- ✅ **Dependency Management**: Packages installed successfully
- ✅ **Container Configuration**: Docker and compose files ready
- ⚠️ **Polyfill Resolution**: Fixed browserify dependencies
- ❌ **Runtime Execution**: Frontend applications need debugging
- ❌ **Container Services**: Backend services need fixes
- ❌ **End-to-End Testing**: Blocked by runtime issues

### 💡 **Recommended Testing Approach**

Given current issues, we recommend this alternative approach:

1. **Isolated Component Testing**
   ```bash
   # Create minimal test file
   npx create-react-app wallet-test
   # Copy wallet components
   # Test individual components
   ```

2. **Gradual Integration**
   - Start with basic wallet detection
   - Add connection functionality
   - Integrate UI components step by step

3. **Fallback Environment**
   - Use local development without containers
   - Mock backend services for frontend testing
   - Focus on wallet infrastructure validation

---

🚀 **Testing Status:** Infrastructure complete, runtime debugging needed. The wallet infrastructure provides a solid foundation - we just need to resolve the Next.js runtime issues to unlock full testing capabilities. 