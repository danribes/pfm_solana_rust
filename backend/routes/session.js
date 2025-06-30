/**
 * Session Management Routes
 * API endpoints for session security and management
 */

const express = require('express');
const router = express.Router();
const { requireAuthenticatedSession } = require('../session/auth');
const { 
  calculateSessionRisk, 
  reportSecurityEvent, 
  getSecurityMetrics,
  generateDeviceFingerprint
} = require('../session/security');
const { generateCSRFEndpoint, getCSRFStats } = require('../middleware/csrf');
const sessionStore = require('../session/store');
const redis = require('../redis');

// ============================================================================
// Session Information Routes
// ============================================================================

/**
 * Get current session information
 */
router.get('/current', requireAuthenticatedSession, async (req, res) => {
  try {
    const sessionData = {
      sessionId: req.session.sessionId,
      userId: req.session.userId,
      walletAddress: req.session.walletAddress,
      createdAt: req.session.createdAt || new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      deviceFingerprint: req.session.deviceFingerprint,
      trustedDevice: req.session.trustedDevice || false,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    };

    res.json({
      success: true,
      data: sessionData
    });
  } catch (error) {
    console.error('Get current session error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get session information'
    });
  }
});

/**
 * Get all active sessions for current user
 */
router.get('/active', requireAuthenticatedSession, async (req, res) => {
  try {
    const userId = req.session.userId;
    const redisClient = redis.getRedisClient();
    const userSessionsKey = `user_sessions:${userId}`;
    
    const sessionIds = await redisClient.smembers(userSessionsKey);
    const sessions = [];

    for (const sessionId of sessionIds) {
      try {
        // Get session data from Redis/store
        const sessionData = await sessionStore.getSession(sessionId);
        if (sessionData) {
          // Calculate risk for this session
          const riskAssessment = await calculateSessionRisk(userId, sessionId);
          
          sessions.push({
            sessionId,
            isCurrent: sessionId === req.session.sessionId,
            lastActivity: sessionData.lastActivity || new Date(),
            deviceInfo: {
              fingerprint: sessionData.deviceFingerprint,
              trusted: sessionData.trustedDevice || false,
              userAgent: sessionData.userAgent,
              ipAddress: sessionData.ipAddress
            },
            securityStatus: {
              riskLevel: riskAssessment.riskLevel,
              riskScore: riskAssessment.riskScore,
              riskFactors: riskAssessment.riskFactors
            }
          });
        }
      } catch (sessionError) {
        console.error(`Error getting session ${sessionId}:`, sessionError);
      }
    }

    res.json({
      success: true,
      data: {
        sessions,
        totalSessions: sessions.length,
        currentSessionId: req.session.sessionId
      }
    });
  } catch (error) {
    console.error('Get active sessions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get active sessions'
    });
  }
});

/**
 * Validate current session
 */
router.post('/validate', requireAuthenticatedSession, async (req, res) => {
  try {
    const userId = req.session.userId;
    const sessionId = req.session.sessionId;

    // Calculate current risk
    const riskAssessment = await calculateSessionRisk(userId, sessionId);
    
    // Check if session is still valid
    const isValid = req.session && req.session.userId && req.session.sessionId;
    
    res.json({
      success: true,
      data: {
        valid: isValid,
        sessionId: sessionId,
        riskAssessment: riskAssessment,
        lastValidated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Session validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Session validation failed'
    });
  }
});

/**
 * Refresh current session
 */
router.post('/refresh', requireAuthenticatedSession, async (req, res) => {
  try {
    // Update last activity
    req.session.lastActivity = new Date();
    
    // Save session
    req.session.save((err) => {
      if (err) {
        console.error('Session refresh error:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to refresh session'
        });
      }
      
      res.json({
        success: true,
        data: {
          sessionId: req.session.sessionId,
          refreshedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + (req.session.maxAge || 3600000)).toISOString()
        }
      });
    });
  } catch (error) {
    console.error('Session refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh session'
    });
  }
});

/**
 * Terminate specific session
 */
router.delete('/:sessionId', requireAuthenticatedSession, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.session.userId;
    
    // Verify the session belongs to the current user
    const redisClient = redis.getRedisClient();
    const userSessionsKey = `user_sessions:${userId}`;
    const userSessions = await redisClient.smembers(userSessionsKey);
    
    if (!userSessions.includes(sessionId)) {
      return res.status(403).json({
        success: false,
        error: 'Cannot terminate session that does not belong to you'
      });
    }
    
    // Terminate the session
    await sessionStore.deleteSession(sessionId);
    
    // Remove from user sessions
    await redisClient.srem(userSessionsKey, sessionId);
    
    // Log security event
    await reportSecurityEvent(userId, 'SESSION_TERMINATED', 'INFO', {
      terminatedSessionId: sessionId,
      terminatedBy: req.session.sessionId
    });
    
    res.json({
      success: true,
      message: 'Session terminated successfully'
    });
  } catch (error) {
    console.error('Session termination error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to terminate session'
    });
  }
});

/**
 * Terminate all sessions except current
 */
router.post('/terminate-all', requireAuthenticatedSession, async (req, res) => {
  try {
    const userId = req.session.userId;
    const currentSessionId = req.session.sessionId;
    
    const redisClient = redis.getRedisClient();
    const userSessionsKey = `user_sessions:${userId}`;
    const userSessions = await redisClient.smembers(userSessionsKey);
    
    let terminatedCount = 0;
    
    for (const sessionId of userSessions) {
      if (sessionId !== currentSessionId) {
        try {
          await sessionStore.deleteSession(sessionId);
          await redisClient.srem(userSessionsKey, sessionId);
          terminatedCount++;
        } catch (sessionError) {
          console.error(`Error terminating session ${sessionId}:`, sessionError);
        }
      }
    }
    
    // Log security event
    await reportSecurityEvent(userId, 'ALL_SESSIONS_TERMINATED', 'INFO', {
      terminatedCount,
      currentSessionKept: currentSessionId
    });
    
    res.json({
      success: true,
      data: {
        terminatedCount,
        currentSessionId
      }
    });
  } catch (error) {
    console.error('Terminate all sessions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to terminate sessions'
    });
  }
});

// ============================================================================
// Security Routes
// ============================================================================

/**
 * Get security status for current session
 */
router.get('/security/status', requireAuthenticatedSession, async (req, res) => {
  try {
    const userId = req.session.userId;
    const sessionId = req.session.sessionId;
    
    // Calculate risk assessment
    const riskAssessment = await calculateSessionRisk(userId, sessionId);
    
    // Get recent security events
    const redisClient = redis.getRedisClient();
    const securityEventsKey = `security_events:${userId}`;
    const recentEvents = await redisClient.lrange(securityEventsKey, 0, 9);
    const events = recentEvents.map(event => JSON.parse(event));
    
    // Get device fingerprint
    const currentFingerprint = generateDeviceFingerprint(req);
    
    const securityStatus = {
      riskAssessment,
      recentSecurityEvents: events,
      deviceFingerprint: currentFingerprint,
      trustedDevice: req.session.trustedDevice || false,
      lastSecurityCheck: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: securityStatus
    });
  } catch (error) {
    console.error('Get security status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get security status'
    });
  }
});

/**
 * Report security event
 */
router.post('/security/report', requireAuthenticatedSession, async (req, res) => {
  try {
    const { eventType, severity, description, metadata } = req.body;
    const userId = req.session.userId;
    
    if (!eventType || !severity) {
      return res.status(400).json({
        success: false,
        error: 'Event type and severity are required'
      });
    }
    
    await reportSecurityEvent(userId, eventType, severity, {
      ...metadata,
      description,
      reportedBy: 'user',
      sessionId: req.session.sessionId
    });
    
    res.json({
      success: true,
      message: 'Security event reported successfully'
    });
  } catch (error) {
    console.error('Report security event error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to report security event'
    });
  }
});

/**
 * Get security metrics
 */
router.get('/security/metrics', requireAuthenticatedSession, async (req, res) => {
  try {
    const userId = req.session.userId;
    const metrics = await getSecurityMetrics(userId);
    
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Get security metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get security metrics'
    });
  }
});

// ============================================================================
// Device Management Routes
// ============================================================================

/**
 * Trust current device
 */
router.post('/device/trust', requireAuthenticatedSession, async (req, res) => {
  try {
    req.session.trustedDevice = true;
    
    req.session.save((err) => {
      if (err) {
        console.error('Trust device error:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to trust device'
        });
      }
      
      // Log security event
      reportSecurityEvent(req.session.userId, 'DEVICE_TRUSTED', 'INFO', {
        deviceFingerprint: req.session.deviceFingerprint,
        sessionId: req.session.sessionId
      });
      
      res.json({
        success: true,
        message: 'Device trusted successfully'
      });
    });
  } catch (error) {
    console.error('Trust device error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trust device'
    });
  }
});

/**
 * Get device information
 */
router.get('/device/info', requireAuthenticatedSession, async (req, res) => {
  try {
    const currentFingerprint = generateDeviceFingerprint(req);
    
    const deviceInfo = {
      fingerprint: currentFingerprint,
      trusted: req.session.trustedDevice || false,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
      lastSeen: new Date().toISOString(),
      sessionId: req.session.sessionId
    };
    
    res.json({
      success: true,
      data: deviceInfo
    });
  } catch (error) {
    console.error('Get device info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get device information'
    });
  }
});

// ============================================================================
// CSRF Token Routes
// ============================================================================

/**
 * Generate CSRF token
 */
router.get('/csrf/token', generateCSRFEndpoint);

/**
 * Get CSRF statistics (admin only)
 */
router.get('/csrf/stats', requireAuthenticatedSession, async (req, res) => {
  try {
    // Basic authorization check - in a real app you'd check admin role
    if (!req.session.userId) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }
    
    const stats = await getCSRFStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get CSRF stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get CSRF statistics'
    });
  }
});

// ============================================================================
// Analytics Routes
// ============================================================================

/**
 * Get session analytics for current user
 */
router.get('/analytics', requireAuthenticatedSession, async (req, res) => {
  try {
    const userId = req.session.userId;
    const redisClient = redis.getRedisClient();
    
    // Get session history
    const userSessionsKey = `user_sessions:${userId}`;
    const activeSessions = await redisClient.smembers(userSessionsKey);
    
    // Get security events
    const securityEventsKey = `security_events:${userId}`;
    const securityEvents = await redisClient.lrange(securityEventsKey, 0, -1);
    const events = securityEvents.map(event => JSON.parse(event));
    
    // Calculate analytics
    const analytics = {
      totalSessions: activeSessions.length,
      activeSessions: activeSessions.length,
      securityEvents: {
        total: events.length,
        critical: events.filter(e => e.severity === 'CRITICAL').length,
        warning: events.filter(e => e.severity === 'WARNING').length,
        info: events.filter(e => e.severity === 'INFO').length
      },
      deviceStats: {
        trustedDevice: req.session.trustedDevice || false,
        deviceFingerprint: req.session.deviceFingerprint
      },
      timeRange: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        end: new Date().toISOString()
      }
    };
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get session analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get session analytics'
    });
  }
});

module.exports = router; 