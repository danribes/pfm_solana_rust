# PFM Community Management Application - Access & Permissions Guide

## Table of Contents
- [Overview](#overview)
- [Role-Based Access Control](#role-based-access-control)
- [Environment Access](#environment-access)
- [Service Authentication](#service-authentication)
- [API Security](#api-security)
- [Database Access](#database-access)
- [Infrastructure Access](#infrastructure-access)
- [Onboarding Procedures](#onboarding-procedures)
- [Offboarding Procedures](#offboarding-procedures)
- [Security Policies](#security-policies)
- [Audit and Compliance](#audit-and-compliance)

---

## Overview

This guide defines access control, permissions, and security procedures for the PFM Community Management Application. The system implements role-based access control (RBAC) with multi-layer security including application-level, infrastructure-level, and blockchain-level permissions.

---

## Role-Based Access Control

### Application Roles

#### Super Admin
```yaml
Permissions:
  - Full system administration
  - User management (create, modify, delete)
  - System configuration changes
  - Financial operations
  - Security settings management
  - Audit log access

Access:
  - Admin Portal: Full access
  - Backend API: All endpoints
  - Database: Read/write access
  - Infrastructure: Full monitoring access
```

#### Community Admin
```yaml
Permissions:
  - Community management
  - Member approval/rejection
  - Voting question creation
  - Community configuration
  - Member communications
  - Community analytics

Access:
  - Admin Portal: Community management sections
  - Backend API: Community endpoints
  - Database: Community-scoped read/write
  - Infrastructure: Community metrics only
```

#### Community Member
```yaml
Permissions:
  - View community information
  - Participate in voting
  - View voting results
  - Update profile information
  - Connect wallet

Access:
  - Member Portal: Full member functionality
  - Backend API: Member endpoints only
  - Database: Personal data read/write only
  - Infrastructure: No access
```

#### Read-Only User
```yaml
Permissions:
  - View public community information
  - View voting results
  - View member profiles (public)

Access:
  - Member Portal: Read-only access
  - Backend API: Public endpoints only
  - Database: Read-only public data
  - Infrastructure: No access
```

### Technical Roles

#### DevOps Engineer
```yaml
Permissions:
  - Infrastructure management
  - Deployment operations
  - Monitoring and alerting
  - Backup and recovery
  - Performance optimization

Access:
  - All environments
  - CI/CD pipelines
  - Monitoring dashboards
  - Log analysis tools
  - Infrastructure configurations
```

#### Developer
```yaml
Permissions:
  - Code repository access
  - Development environment access
  - Test environment deployment
  - Debug information access

Access:
  - Development environment: Full
  - Staging environment: Read-only
  - Production environment: No direct access
  - Monitoring: Development/staging only
```

#### Security Analyst
```yaml
Permissions:
  - Security log analysis
  - Incident investigation
  - Access control review
  - Vulnerability assessment

Access:
  - Security dashboards
  - Audit logs (all environments)
  - User access reports
  - Security monitoring tools
```

---

## Environment Access

### Development Environment
```bash
# Access Requirements
- Developer role or higher
- VPN connection (if remote)
- SSH key authentication

# Access Commands
ssh dev-server.pfm-community.com
docker-compose -f docker-compose.dev.yml up -d

# Monitoring Access
http://dev-monitoring.pfm-community.com:3003
```

### Staging Environment
```bash
# Access Requirements
- DevOps Engineer or Senior Developer role
- Multi-factor authentication
- VPN connection required

# Access Commands
ssh staging-server.pfm-community.com
kubectl config use-context staging
docker-compose -f docker-compose.staging.yml up -d
```

### Production Environment
```bash
# Access Requirements
- DevOps Engineer role only
- Multi-factor authentication required
- Break-glass procedure for emergency access
- All access logged and monitored

# Access Commands (Break-glass only)
./scripts/access/request-emergency-access.sh production
./scripts/access/emergency-login.sh production
```

---

## Service Authentication

### JWT Token Configuration
```javascript
// Token Settings
const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: '24h',
  issuer: 'pfm-community-app',
  audience: 'pfm-users'
};

// Token Validation Middleware
const validateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  jwt.verify(token, jwtConfig.secret, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.user = decoded;
    next();
  });
};
```

### API Key Management
```bash
# Generate API Key
curl -X POST http://api.pfm-community.com/api-keys \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"name": "External Integration", "permissions": ["read:communities"]}'

# Revoke API Key
curl -X DELETE http://api.pfm-community.com/api-keys/$API_KEY_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# List Active API Keys
curl -X GET http://api.pfm-community.com/api-keys \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Wallet Authentication
```javascript
// Solana Wallet Verification
const verifyWalletSignature = async (publicKey, signature, message) => {
  try {
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = base58.decode(signature);
    const publicKeyBytes = base58.decode(publicKey);
    
    return nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    );
  } catch (error) {
    return false;
  }
};
```

---

## API Security

### Rate Limiting
```javascript
// API Rate Limits by Role
const rateLimits = {
  'super-admin': { requests: 1000, window: '15m' },
  'community-admin': { requests: 500, window: '15m' },
  'member': { requests: 100, window: '15m' },
  'read-only': { requests: 50, window: '15m' },
  'anonymous': { requests: 20, window: '15m' }
};

// Implementation
const rateLimit = require('express-rate-limit');
const createRateLimit = (role) => rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: rateLimits[role].requests,
  message: 'Too many requests from this IP'
});
```

### Input Validation
```javascript
// Request Validation Schemas
const createCommunitySchema = {
  name: { type: 'string', minLength: 3, maxLength: 100 },
  description: { type: 'string', maxLength: 1000 },
  isPrivate: { type: 'boolean' },
  adminWalletAddress: { type: 'string', pattern: '^[1-9A-HJ-NP-Za-km-z]{32,44}$' }
};

// Validation Middleware
const validateInput = (schema) => (req, res, next) => {
  const { error } = ajv.validate(schema, req.body);
  if (error) return res.status(400).json({ error: error.message });
  next();
};
```

---

## Database Access

### Database User Roles
```sql
-- Application Users
CREATE ROLE pfm_app_user WITH LOGIN PASSWORD 'secure_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO pfm_app_user;

-- Read-Only Analytics User
CREATE ROLE pfm_analytics_user WITH LOGIN PASSWORD 'analytics_password';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO pfm_analytics_user;

-- Admin User (Emergency Access Only)
CREATE ROLE pfm_admin_user WITH LOGIN PASSWORD 'admin_password';
GRANT ALL PRIVILEGES ON DATABASE pfm_community TO pfm_admin_user;

-- Backup User
CREATE ROLE pfm_backup_user WITH LOGIN PASSWORD 'backup_password';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO pfm_backup_user;
```

### Database Security Configuration
```sql
-- Enable Row Level Security
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Community Admin Policy
CREATE POLICY community_admin_policy ON communities
  FOR ALL TO pfm_app_user
  USING (admin_wallet_address = current_setting('app.current_user_wallet'));

-- Member Data Policy
CREATE POLICY member_data_policy ON community_members
  FOR ALL TO pfm_app_user
  USING (wallet_address = current_setting('app.current_user_wallet'));
```

---

## Infrastructure Access

### Docker Container Access
```bash
# Production Container Access (Emergency Only)
./scripts/access/request-container-access.sh production backend
docker exec -it pfm-production-backend /bin/bash

# Staging Container Access
docker exec -it pfm-staging-backend /bin/bash

# Development Container Access
docker exec -it pfm-dev-backend /bin/bash
```

### Monitoring System Access
```yaml
# Grafana User Roles
Admin:
  - All dashboards
  - User management
  - Data source configuration
  - Alert management

Editor:
  - Create/edit dashboards
  - View all dashboards
  - Create/edit alerts

Viewer:
  - View dashboards only
  - No editing capabilities
```

### Log System Access
```bash
# Loki Query Access by Role
Admin: All logs across all services
DevOps: Infrastructure and application logs
Developer: Application logs for assigned services
Security: Security and audit logs only

# Example Queries
# Admin - All backend errors
{service="backend",level="error"}

# Developer - Application logs for specific service
{service="backend",category!="security"}

# Security - Authentication and security events
{category="security"} |= "authentication"
```

---

## Onboarding Procedures

### New Employee Onboarding
```bash
# 1. Create User Account
./scripts/access/create-user.sh \
  --email="newuser@company.com" \
  --role="developer" \
  --teams="frontend,backend"

# 2. Generate SSH Keys
ssh-keygen -t ed25519 -C "newuser@company.com"
./scripts/access/add-ssh-key.sh newuser@company.com ~/.ssh/id_ed25519.pub

# 3. Setup Development Environment
./scripts/onboarding/setup-dev-environment.sh newuser@company.com

# 4. Grant Repository Access
./scripts/access/grant-repo-access.sh newuser@company.com pfm-docker

# 5. Setup MFA
./scripts/access/setup-mfa.sh newuser@company.com
```

### Application User Onboarding
```bash
# Community Admin Registration
curl -X POST http://api.pfm-community.com/auth/register-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@community.com",
    "walletAddress": "wallet_address_here",
    "communityName": "My Community"
  }'

# Member Registration
curl -X POST http://api.pfm-community.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "member_wallet_address",
    "communityId": "community_id_here"
  }'
```

---

## Offboarding Procedures

### Employee Offboarding
```bash
# 1. Disable User Account
./scripts/access/disable-user.sh user@company.com

# 2. Revoke SSH Keys
./scripts/access/revoke-ssh-keys.sh user@company.com

# 3. Remove Repository Access
./scripts/access/revoke-repo-access.sh user@company.com

# 4. Disable MFA
./scripts/access/disable-mfa.sh user@company.com

# 5. Archive User Data
./scripts/access/archive-user-data.sh user@company.com

# 6. Generate Offboarding Report
./scripts/access/generate-offboarding-report.sh user@company.com
```

### Application User Deactivation
```bash
# Deactivate Community Admin
curl -X PUT http://api.pfm-community.com/admin/users/$USER_ID/deactivate \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN"

# Remove Member from Community
curl -X DELETE http://api.pfm-community.com/communities/$COMMUNITY_ID/members/$MEMBER_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## Security Policies

### Password Policy
```yaml
Requirements:
  - Minimum 12 characters
  - Mixed case letters required
  - Numbers required
  - Special characters required
  - No dictionary words
  - No personal information

Rotation:
  - Service accounts: 90 days
  - User accounts: 180 days
  - API keys: 365 days
  - Database passwords: 30 days (production)
```

### Multi-Factor Authentication
```bash
# MFA Requirements
Production Access: TOTP + Hardware Key required
Staging Access: TOTP required
Development Access: Password only (internal networks)

# MFA Setup
./scripts/security/setup-totp.sh user@company.com
./scripts/security/register-hardware-key.sh user@company.com
```

### Network Security
```yaml
Firewall Rules:
  - Development: Internal network only
  - Staging: VPN required
  - Production: Whitelist + VPN required

SSL/TLS:
  - Minimum TLS 1.2
  - Perfect Forward Secrecy required
  - Certificate rotation every 90 days
```

---

## Audit and Compliance

### Access Audit Procedures
```bash
# Weekly Access Review
./scripts/audit/weekly-access-review.sh

# Monthly Privileged Access Review
./scripts/audit/privileged-access-review.sh

# Quarterly Comprehensive Audit
./scripts/audit/quarterly-audit.sh

# Generate Compliance Report
./scripts/audit/compliance-report.sh --type=SOX
```

### Audit Log Configuration
```javascript
// Audit Log Events
const auditEvents = [
  'user_login',
  'user_logout', 
  'admin_action',
  'data_modification',
  'permission_change',
  'system_configuration',
  'emergency_access'
];

// Audit Log Format
const auditLog = {
  timestamp: new Date().toISOString(),
  event_type: 'user_login',
  user_id: 'user123',
  ip_address: '192.168.1.100',
  user_agent: 'Mozilla/5.0...',
  resource: '/admin/users',
  action: 'CREATE',
  result: 'SUCCESS',
  details: { target_user: 'newuser@company.com' }
};
```

### Compliance Monitoring
```bash
# GDPR Compliance Check
./scripts/compliance/gdpr-check.sh

# SOX Compliance Validation
./scripts/compliance/sox-validation.sh

# PCI Compliance Scan
./scripts/compliance/pci-scan.sh

# Generate Compliance Dashboard
./scripts/compliance/generate-dashboard.sh
```

---

This access and permissions guide ensures secure, auditable, and compliant access management for the PFM Community Management Application across all environments and user types. 