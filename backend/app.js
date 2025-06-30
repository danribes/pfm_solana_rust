const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import session and security modules
const { getSessionMiddleware } = require('./middleware/sessionConfig');
const {
  hijackingProtection,
  sessionTimeoutEnforcement,
  concurrentSessionLimit,
  sessionFixationPrevention,
  deviceFingerprintValidation,
  locationSecurityMonitoring,
  enhancedRateLimit
} = require('./session/security');
const {
  csrfProtection,
  startCSRFCleanup,
  injectCSRFToken
} = require('./middleware/csrf');
const {
  createSessionForUser,
  refreshSession,
  logoutSession,
  requireAuthenticatedSession,
} = require('./session/auth');
const redis = require('./redis');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoints (available for both production and testing)
const healthHandler = async (req, res) => {
  try {
    // In test environment, provide a simple health response
    if (process.env.NODE_ENV === 'test') {
      return res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        redis: {
          isHealthy: true,
          responseTime: 1
        },
        sessions: {
          status: 'active',
          store: 'redis',
          timestamp: new Date().toISOString()
        }
      });
    }

    // In production, perform actual health checks
    const redisHealth = await redis.performHealthCheck();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      redis: redisHealth,
      sessions: {
        status: 'active',
        store: 'redis',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
};

// Add health endpoints at both paths for compatibility
app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// Initialize Redis and session management
async function initializeApp() {
  try {
    // Initialize Redis
    await redis.initializeRedis();
    console.log('Redis initialized successfully');

    // Session middleware (must be before routes that need sessions)
    app.use(await getSessionMiddleware());
    console.log('Session middleware initialized successfully');

    // Enhanced security middlewares
    app.use(sessionFixationPrevention);
    app.use(deviceFingerprintValidation);
    app.use(locationSecurityMonitoring);
    app.use(hijackingProtection);
    app.use(sessionTimeoutEnforcement);
    app.use(concurrentSessionLimit);
    app.use(enhancedRateLimit(10, 15 * 60 * 1000)); // 10 requests per 15 minutes
    app.use(csrfProtection());
    app.use(injectCSRFToken);

    // Start CSRF token cleanup
    startCSRFCleanup();

    // Register community management API routes
    const communityRoutes = require('./routes/communities');
    app.use('/api/communities', communityRoutes);

    // Register membership management API routes
    const membershipRoutes = require('./routes/memberships');
    app.use('/api', membershipRoutes);

    // Register user management API routes
    const userRoutes = require('./routes/users');
    app.use('/api/users', userRoutes);

    // Register authentication API routes
    const authRoutes = require('./routes/auth');
    app.use('/api/auth', authRoutes);

    // Register voting question management API routes
    const questionRoutes = require('./routes/questions');
    app.use('/api/communities', questionRoutes);

    // Register voting operations API routes
    const voteRoutes = require('./routes/votes');
    app.use('/api/communities', voteRoutes);

    // Register analytics API routes
    const analyticsRoutes = require('./routes/analytics');
    app.use('/api/analytics', analyticsRoutes);

    // Register session management API routes
    const sessionRoutes = require('./routes/session');
    app.use('/api/sessions', sessionRoutes);

    // Authentication endpoints
    app.post('/auth/login', async (req, res) => {
      try {
        const { walletAddress, signature } = req.body;
        
        // TODO: Implement actual wallet signature verification
        // For now, we'll simulate successful authentication
        if (!walletAddress) {
          return res.status(400).json({ error: 'Wallet address required' });
        }

        // Simulate user ID (in real app, this would come from database)
        const userId = `user_${walletAddress.substring(0, 8)}`;
        
        // Create session for user
        const token = await createSessionForUser(userId, walletAddress, req, res);
        
        res.json({
          success: true,
          message: 'Login successful',
          token,
          user: {
            id: userId,
            walletAddress
          }
        });
      } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
      }
    });

    app.post('/auth/logout', requireAuthenticatedSession, async (req, res) => {
      try {
        await logoutSession(req, res);
        res.json({ success: true, message: 'Logout successful' });
      } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Logout failed' });
      }
    });

    app.post('/auth/refresh', requireAuthenticatedSession, async (req, res) => {
      try {
        const newToken = await refreshSession(req, res);
        if (newToken) {
          res.json({
            success: true,
            message: 'Session refreshed',
            token: newToken
          });
        } else {
          res.status(401).json({ error: 'Session refresh failed' });
        }
      } catch (error) {
        console.error('Session refresh error:', error);
        res.status(500).json({ error: 'Session refresh failed' });
      }
    });

    // Protected endpoints
    app.get('/api/profile', requireAuthenticatedSession, (req, res) => {
      res.json({
        success: true,
        user: {
          id: req.session.userId,
          walletAddress: req.session.walletAddress,
          sessionId: req.session.sessionId
        }
      });
    });

    app.get('/api/sessions', requireAuthenticatedSession, async (req, res) => {
      try {
        // For now, return the current session info
        // In a full implementation, you'd track multiple sessions per user
        res.json({
          success: true,
          sessions: [{
            sessionId: req.session.sessionId || 'current',
            userId: req.session.userId,
            walletAddress: req.session.walletAddress,
            createdAt: new Date().toISOString(),
            lastAccessed: new Date().toISOString(),
            userAgent: req.get('User-Agent'),
            ipAddress: req.ip
          }]
        });
      } catch (error) {
        console.error('Get sessions error:', error);
        res.status(500).json({ error: 'Failed to get sessions' });
      }
    });

    // Session management endpoints
    app.delete('/api/sessions/:sessionId', requireAuthenticatedSession, async (req, res) => {
      try {
        const { sessionId } = req.params;
        
        // Destroy the current session if it matches
        if (req.session.sessionId === sessionId) {
          req.session.destroy((err) => {
            if (err) {
              console.error('Session destruction error:', err);
              return res.status(500).json({ error: 'Failed to delete session' });
            }
            res.json({ success: true, message: 'Session deleted' });
          });
        } else {
          res.status(404).json({ error: 'Session not found' });
        }
      } catch (error) {
        console.error('Delete session error:', error);
        res.status(500).json({ error: 'Failed to delete session' });
      }
    });

    // Admin endpoints (for monitoring)
    app.get('/api/admin/sessions', requireAuthenticatedSession, async (req, res) => {
      try {
        const redisClient = redis.getRedisClient();
        const sessionKeys = await redisClient.keys('session:*');
        
        res.json({
          success: true,
          stats: {
            totalSessions: sessionKeys.length,
            timestamp: new Date().toISOString()
          }
        });
      } catch (error) {
        console.error('Get session stats error:', error);
        res.status(500).json({ error: 'Failed to get session stats' });
      }
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error('Unhandled error:', err);
      res.status(500).json({ error: 'Internal server error' });
    });

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({ error: 'Endpoint not found' });
    });

    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ PFM Community Backend API listening on port ${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth`);
      console.log(`📝 Documentation: http://localhost:${PORT}/api/docs`);
    });

  } catch (error) {
    console.error('Failed to initialize app:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  try {
    await redis.shutdownRedis();
    console.log('Redis shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  try {
    await redis.shutdownRedis();
    console.log('Redis shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

// Initialize the application
if (process.env.NODE_ENV !== 'test') {
  initializeApp();
}

// Export the app instance for testing
module.exports = app; 