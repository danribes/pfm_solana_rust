# PFM Solana Project - Troubleshooting Summary

## Overview
This document summarizes all the errors encountered and solutions applied during the setup and configuration of the PFM Solana project, which consists of multiple Docker containers for backend, admin, member portals, and shared frontend code.

## Project Structure
- **Backend Container**: API services and database
- **Admin Portal**: Administrative interface
- **Member Portal**: User-facing application
- **Shared Frontend**: Common components and utilities

---

## 1. Initial Docker Container Issues

### Error: Backend Container Failed to Start
**Problem**: Missing dev dependencies and permission issues
```
Error: Cannot find module 'pino-pretty'
Error: EACCES: permission denied
```

**Solution**: 
- Updated Dockerfile to install dev dependencies
- Fixed directory ownership issues
- Adjusted user permissions in container

### Error: Frontend Containers Permission Issues
**Problem**: Permission denied on `.next` directory
```
Error: EACCES: permission denied, mkdir '.next'
```

**Solution**:
- Changed ownership of `.next` directory
- Cleaned existing `.next` build artifacts
- Fixed Docker user permissions

---

## 2. Missing Dependencies

### Error: Missing Solana Wallet Adapter Packages
**Problem**: Shared directory missing required dependencies
```
Error: Cannot find module '@solana/wallet-adapter-base'
Error: Cannot find module '@solana/wallet-adapter-react'
```

**Solution**:
- Added missing Solana wallet adapter packages to shared directory
- Installed dependencies in shared container
- Updated package.json with required dependencies

### Error: Missing CSS Import
**Problem**: CSS import error in member portal
```
Error: Cannot resolve module './globals.css'
```

**Solution**:
- Moved CSS import to member portal's `_app.tsx`
- Fixed import path resolution

---

## 3. Configuration File Issues

### Error: Missing Wallet Config File
**Problem**: Wallet configuration file not found
```
Error: Cannot find module './wallet-config'
```

**Solution**:
- Created missing wallet configuration file
- Added proper wallet adapter setup

### Error: Duplicate Export Errors
**Problem**: Multiple exports of same components
```
Error: Multiple exports of 'ComponentName'
```

**Solution**:
- Removed duplicate exports
- Consolidated component definitions

---

## 4. React Module Resolution Issues

### Error: React useState Undefined
**Problem**: React hooks not available in shared code
```
Error: useState is not a function
Error: React is not defined
```

**Root Cause**: Multiple React instances and module resolution conflicts between shared directory and member portal.

**Solutions Applied**:

#### 4.1 Webpack Configuration
```javascript
// next.config.js
module.exports = {
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'react': require.resolve('react'),
      'react-dom': require.resolve('react-dom'),
      'react/jsx-dev-runtime': require.resolve('react/jsx-dev-runtime'),
      'react/jsx-runtime': require.resolve('react/jsx-runtime'),
    };
    
    config.resolve.modules = [
      ...config.resolve.modules,
      path.resolve(__dirname, '../shared'),
    ];
    
    return config;
  },
}
```

#### 4.2 Dependency Management
- **Initial Approach**: Added React to shared dependencies
- **Problem**: Created multiple React instances
- **Final Solution**: Made React a peer dependency in shared directory
- **Result**: Shared code uses member portal's React instance

#### 4.3 Module Resolution
- Added shared directory to webpack module resolution
- Configured fallbacks for React modules
- Enabled `externalDir` experimental feature (temporarily)

---

## 5. Next.js Configuration Issues

### Error: Invalid Port Configuration
**Problem**: Invalid `port` option in next.config.js
```
Error: Invalid next.config.js options
```

**Solution**:
- Removed invalid `port` option
- Simplified configuration to essential options only

### Error: Build Manifest Issues
**Problem**: Missing fallback-build-manifest.json
```
Error: Cannot find fallback-build-manifest.json
```

**Solution**:
- Cleaned build artifacts
- Restarted development server
- Simplified Next.js configuration

---

## 6. Server-Side Rendering Issues

### Error: Navigator Undefined on Server
**Problem**: Browser API used during server-side rendering
```
Error: navigator is not defined
```

**Solution**:
- Added safe checks for browser APIs
- Implemented client-side only code execution
- Used dynamic imports for browser-specific code

### Error: Hydration Mismatch
**Problem**: Server and client rendering differences
```
Error: Hydration failed because the server rendered HTML didn't match the client
```

**Solution**:
- Added proper error boundaries
- Implemented safe rendering practices
- Fixed component initialization

---

## 7. Missing Dependencies in Production

### Error: Missing Runtime Dependencies
**Problem**: Missing packages in production builds
```
Error: Cannot find module 'pino-pretty'
Error: Cannot find module 'next-themes'
Error: Cannot find module 'react-hot-toast'
```

**Solution**:
- Added missing dependencies to package.json
- Installed dependencies in containers
- Verified all required packages are available

---

## 8. Permission and Ownership Issues

### Error: Node Modules Permission Denied
**Problem**: Cannot remove node_modules directory
```
Error: EACCES: permission denied, unlink 'node_modules'
```

**Solution**:
- Changed ownership of directories
- Used proper user permissions in Docker
- Fixed file system permissions

### Error: Build Artifacts Permission Issues
**Problem**: Cannot write to .next directory
```
Error: EACCES: permission denied, write '.next/build-manifest.json'
```

**Solution**:
- Updated Dockerfile to use existing node user (UID 1000)
- Adjusted ownership of build directories
- Fixed container user permissions

---

## 9. Node.js Version Compatibility

### Warning: Node.js Version Mismatch
**Problem**: Some packages require Node.js >=20, but running v18
```
Warning: Some packages require Node.js >=20
```

**Solution**:
- Acknowledged version warning
- Verified compatibility with current setup
- Monitored for version-related issues

---

## 10. Final Resolution Steps

### Step 1: Simplify Configuration
- Removed complex webpack configurations
- Simplified Next.js config to essential options
- Cleaned up experimental features

### Step 2: Dependency Cleanup
- Removed React from shared dependencies
- Made React a peer dependency
- Ensured single React instance usage

### Step 3: Build System Fixes
- Cleaned all build artifacts
- Reinstalled dependencies
- Restarted all containers

### Step 4: Test and Verify
- Created simple test page
- Verified all endpoints work
- Confirmed no more internal server errors

---

## Final Working Configuration

### Docker Compose
All containers running and healthy:
- Backend: API services operational
- Admin Portal: Administrative interface available
- Member Portal: User interface at http://localhost:3002

### Next.js Configuration
```javascript
// next.config.js
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
}
```

### Dependencies
- Shared directory: React as peer dependency
- Member portal: Full React implementation
- All required packages installed and working

---

## Lessons Learned

1. **Module Resolution**: Complex webpack configurations can cause more problems than they solve
2. **React Instances**: Multiple React installations lead to hook errors
3. **Docker Permissions**: Proper user setup is crucial for container stability
4. **Dependency Management**: Peer dependencies vs direct dependencies must be carefully managed
5. **Configuration Simplicity**: Minimal, working configurations are better than complex ones

---

## Current Status: ✅ RESOLVED

All issues have been successfully resolved. The PFM Solana application is now:
- ✅ Fully operational
- ✅ All containers running and healthy
- ✅ No more internal server errors
- ✅ React hooks working correctly
- ✅ Ready for development

**Application URL**: http://localhost:3002 