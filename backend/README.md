# Community Management Backend API

A secure Express.js backend with Redis session management, authentication, and comprehensive security features.

## Features

- **Session Management**: Redis-based session storage with encryption
- **Authentication**: Wallet-based authentication with session tokens
- **Security Middleware**: 
  - Session hijacking protection
  - Session timeout enforcement
  - Concurrent session limits
  - Audit logging
- **Health Monitoring**: Redis and session health checks
- **CORS Support**: Configurable cross-origin requests
- **Graceful Shutdown**: Proper cleanup on application termination

## Prerequisites

- Node.js (v14 or higher)
- Redis server
- PostgreSQL (for future database integration)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env`:
```bash
# Server
PORT=3000
NODE_ENV=development

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Session
SESSION_SECRET=your-super-secret-session-key
SESSION_MAX_AGE=86400000
SESSION_ENCRYPTION_KEY=your-32-character-encryption-key

# Security
MAX_CONCURRENT_SESSIONS=5
SESSION_TIMEOUT_MINUTES=30
AUDIT_LOG_ENABLED=true

# CORS
CORS_ORIGIN=http://localhost:3000
```

3. Start Redis server:
```bash
redis-server
```

## Usage

### Start the server:
```bash
node app.js
```

### Test the endpoints:
```bash
node test-app.js
```

## API Endpoints

### Health Check
- `GET /health` - System health status

### Authentication
- `POST /auth/login` - Login with wallet address
- `POST /auth/logout` - Logout (requires authentication)
- `POST /auth/refresh` - Refresh session token (requires authentication)

### Protected Endpoints
- `GET /api/profile` - Get user profile (requires authentication)
- `GET /api/sessions` - Get user's active sessions (requires authentication)
- `DELETE /api/sessions/:sessionId` - Delete specific session (requires authentication)

### Admin Endpoints
- `GET /api/admin/sessions` - Get session statistics (requires authentication)

## Request Examples

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "0x1234567890abcdef1234567890abcdef12345678"}'
```

### Access Protected Endpoint
```bash
curl -X GET http://localhost:3000/api/profile \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

## Security Features

### Session Hijacking Protection
- Validates session against stored fingerprint
- Prevents session reuse from different devices

### Session Timeout Enforcement
- Automatically expires sessions after configured timeout
- Forces re-authentication for expired sessions

### Concurrent Session Limits
- Limits number of active sessions per user
- Automatically removes oldest sessions when limit exceeded

### Audit Logging
- Logs all session events (login, logout, refresh, etc.)
- Tracks IP addresses and user agents
- Configurable logging levels

## Session Management

Sessions are stored in Redis with the following features:
- **Encryption**: Session data is encrypted at rest
- **TTL**: Automatic expiration based on configuration
- **Fingerprinting**: Device fingerprinting for security
- **Metadata**: IP address, user agent, and timestamp tracking

## Error Handling

The application includes comprehensive error handling:
- Graceful Redis connection failures
- Session validation errors
- Authentication failures
- Rate limiting responses

## Monitoring

### Health Check Response
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "redis": {
    "status": "connected",
    "latency": 2.5
  },
  "sessions": {
    "total": 10,
    "active": 8,
    "expired": 2
  }
}
```

## Development

### Running Tests
```bash
npm test
```

### Code Structure
```
backend/
├── app.js                 # Main Express application
├── redis.js              # Redis client configuration
├── session/
│   ├── store.js          # Session storage implementation
│   ├── auth.js           # Authentication functions
│   └── security.js       # Security middleware
├── middleware/
│   └── session.js        # Express session middleware
└── test-app.js           # Integration test script
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `REDIS_HOST` | Redis host | localhost |
| `REDIS_PORT` | Redis port | 6379 |
| `REDIS_PASSWORD` | Redis password | (empty) |
| `SESSION_SECRET` | Session encryption secret | (required) |
| `SESSION_MAX_AGE` | Session max age in ms | 86400000 |
| `MAX_CONCURRENT_SESSIONS` | Max sessions per user | 5 |
| `SESSION_TIMEOUT_MINUTES` | Session timeout in minutes | 30 |

## Troubleshooting

### Common Issues

1. **Redis Connection Failed**
   - Ensure Redis server is running
   - Check Redis host/port configuration
   - Verify Redis password if required

2. **Session Creation Failed**
   - Check SESSION_SECRET is set
   - Verify SESSION_ENCRYPTION_KEY is 32 characters
   - Ensure Redis is accessible

3. **Authentication Errors**
   - Verify session token is valid
   - Check session hasn't expired
   - Ensure proper Authorization header format

### Logs

The application logs important events:
- Redis connection status
- Session creation/deletion
- Authentication attempts
- Security violations
- Application startup/shutdown

## License

MIT License 