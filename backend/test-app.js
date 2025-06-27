// backend/test-app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');

// Import session and security modules
const getSessionMiddleware = require('./middleware/session');
const {
  hijackingProtection,
  sessionTimeoutEnforcement,
  concurrentSessionLimit,
} = require('./session/security');
const {
  createSessionForUser,
  refreshSession,
  logoutSession,
  requireAuthenticatedSession,
} = require('./session/auth');
const sessionStore = require('./session/store');
const redis = require('./redis');

// Import routes and middleware
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

// Import models
const User = require('./models/User');

// Simple authentication middleware for testing
const authenticateWallet = (req, res, next) => {
  // Debug session data
  console.log('Session data:', {
    sessionExists: !!req.session,
    userId: req.session?.userId,
    walletAddress: req.session?.walletAddress,
    sessionId: req.session?.sessionId
  });

  if (!req.session || !req.session.userId || !req.session.walletAddress) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }
  
  // Add user info to request
  req.userId = req.session.userId;
  req.walletAddress = req.session.walletAddress;
  next();
};

// Mock authenticateUser middleware for analytics routes
const authenticateUser = (req, res, next) => {
  if (!req.session || !req.session.userId || !req.session.walletAddress) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }
  
  // Add user info to request (matching the expected format)
  req.user = {
    id: req.session.userId,
    wallet_address: req.session.walletAddress
  };
  next();
};

const app = express();

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

// Session configuration - use memory store for testing
// Commented out to avoid conflict with Redis session middleware
// app.use(session({
//   store: new session.MemoryStore(),
//   name: 'sid',
//   secret: process.env.SESSION_SECRET || 'test-session-secret',
//   resave: false,
//   saveUninitialized: false,
//   genid: () => uuidv4(),
//   cookie: {
//     httpOnly: true,
//     secure: false, // Set to false for testing
//     sameSite: 'lax',
//     maxAge: 3600000, // 1 hour
//     path: '/',
//   },
//   unset: 'destroy'
// }));

// Initialize Redis and session management
async function initializeTestApp() {
  try {
    // Initialize Redis
    await redis.initializeRedis();
    console.log('Redis initialized successfully for testing');

    // Initialize session store
    await sessionStore.initialize();
    console.log('Session store initialized successfully for testing');

    // Session middleware (must be before routes that need sessions) - commented out for testing
    // app.use(await getSessionMiddleware());

    // Security middlewares
    app.use(hijackingProtection);
    app.use(sessionTimeoutEnforcement);
    app.use(concurrentSessionLimit);

    // Register community management API routes
    const communityRoutes = require('./routes/communities');
    app.use('/api/communities', communityRoutes);

    // Register membership management API routes
    const membershipRoutes = require('./routes/memberships');
    app.use('/api', membershipRoutes);

    // Register user management API routes (remove middleware here as routes define their own)
    app.use('/api/users', userRoutes);

    // Register authentication API routes
    app.use('/auth', authRoutes);

    // Register voting question management API routes
    const questionRoutes = require('./routes/questions');
    app.use('/api/communities', questionRoutes);

    // Register voting operations API routes
    const voteRoutes = require('./routes/votes');
    app.use('/api/communities', voteRoutes);

    // Register analytics API routes
    const analyticsRoutes = require('./routes/analytics');
    app.use('/api/analytics', analyticsRoutes);

    // Health check endpoint
    app.get('/health', async (req, res) => {
      try {
        const redisHealth = await redis.performHealthCheck();
        const sessionStats = await sessionStore.getSessionStats();
        
        res.json({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          redis: redisHealth,
          sessions: sessionStats
        });
      } catch (error) {
        res.status(500).json({
          status: 'unhealthy',
          error: error.message
        });
      }
    });

    // Authentication endpoints
    app.post('/auth/login', async (req, res) => {
      try {
        const { walletAddress } = req.body;
        
        if (!walletAddress) {
          return res.status(400).json({ error: 'Wallet address is required' });
        }

        // Find or create user
        let user = await User.findOne({ where: { wallet_address: walletAddress } });
        
        if (!user) {
          // Create a test user for testing purposes
          user = await User.create({
            id: uuidv4(),
            username: `testuser_${walletAddress.slice(-6)}`,
            email: `test_${walletAddress.slice(-6)}@example.com`,
            wallet_address: walletAddress,
            is_active: true
          });
        }

        // Create session using the proper session function
        const token = await createSessionForUser(user.id, walletAddress, req, res);
        
        res.json({ 
          success: true, 
          message: 'Login successful',
          data: { 
            token,
            user: { 
              id: user.id, 
              walletAddress,
              username: user.username
            } 
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
        const sessions = await sessionStore.getUserSessions(req.session.userId);
        res.json({
          success: true,
          sessions: sessions.map(session => ({
            sessionId: session.sessionId,
            createdAt: session.createdAt,
            lastAccessed: session.lastAccessed,
            userAgent: session.userAgent,
            ipAddress: session.ipAddress
          }))
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
        const success = await sessionStore.deleteSession(sessionId);
        
        if (success) {
          res.json({ success: true, message: 'Session deleted' });
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
        const stats = await sessionStore.getSessionStats();
        res.json({
          success: true,
          stats
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

    console.log('Test app initialized successfully');

  } catch (error) {
    console.error('Failed to initialize test app:', error);
    throw error;
  }
}

// Export the app instance and initialization function for testing
module.exports = { app, initializeTestApp }; 