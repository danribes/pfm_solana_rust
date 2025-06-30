const sessionStore = require('./store');
const redis = require('../redis');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SESSION_TIMEOUT = parseInt(process.env.SESSION_TIMEOUT || '3600000', 10); // 1 hour
const AUDIT_LOG_PATH = process.env.SESSION_AUDIT_LOG_PATH || path.join(__dirname, '../../logs/session_audit.log');

// Enhanced security configuration
const SECURITY_CONFIG = {
  sessionFixationPrevention: true,
  fingerprintValidation: true,
  locationTracking: process.env.NODE_ENV === 'production',
  deviceTrustRequired: false,
  maxSessionsPerUser: 5,
  suspiciousActivityThreshold: 3,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  riskCalculationInterval: 60 * 1000 // 1 minute
};

/**
 * Middleware: Protect against session hijacking (user agent & IP binding)
 */
function hijackingProtection(req, res, next) {
  if (req.session && req.session.userId) {
    const currentUA = req.headers['user-agent'] || '';
    const currentIP = req.ip || req.connection.remoteAddress || '';
    if (
      req.session.userAgent && req.session.userAgent !== currentUA ||
      req.session.ipAddress && req.session.ipAddress !== currentIP
    ) {
      // Log the event
      logAuditEvent('Hijacking detected', req.session.userId, req.session.sessionId, currentIP, currentUA);
      // Destroy session
      req.session.destroy(() => {});
      return res.status(401).json({ error: 'Session hijacking detected. You have been logged out.' });
    }
  }
  next();
}

/**
 * Middleware: Enforce session timeout and automatic logout
 */
function sessionTimeoutEnforcement(req, res, next) {
  if (req.session && req.session.lastAccessed) {
    const now = Date.now();
    if (now - req.session.lastAccessed > SESSION_TIMEOUT) {
      logAuditEvent('Session timeout', req.session.userId, req.session.sessionId, req.ip, req.headers['user-agent']);
      req.session.destroy(() => {});
      return res.status(440).json({ error: 'Session expired. Please log in again.' });
    }
    // Update last accessed
    req.session.lastAccessed = now;
  }
  next();
}

/**
 * Middleware: Enforce concurrent session limits (defense-in-depth)
 */
async function concurrentSessionLimit(req, res, next) {
  if (req.session && req.session.userId) {
    const userSessions = await sessionStore.getUserSessions(req.session.userId);
    const maxSessions = sessionStore.maxSessionsPerUser;
    if (userSessions.length > maxSessions) {
      // Remove oldest session(s)
      const sorted = userSessions.sort((a, b) => a.createdAt - b.createdAt);
      for (let i = 0; i < userSessions.length - maxSessions; i++) {
        await sessionStore.deleteSession(sorted[i].sessionId);
        logAuditEvent('Concurrent session limit enforced', req.session.userId, sorted[i].sessionId, req.ip, req.headers['user-agent']);
      }
    }
  }
  next();
}

/**
 * Log session audit events
 */
function logAuditEvent(event, userId, sessionId, ip, userAgent) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    userId,
    sessionId,
    ip,
    userAgent,
  };
  const line = JSON.stringify(logEntry) + '\n';
  fs.appendFile(AUDIT_LOG_PATH, line, (err) => {
    if (err) console.error('Failed to write session audit log:', err.message);
  });
}

/**
 * Session fixation prevention middleware
 */
function sessionFixationPrevention(req, res, next) {
  if (!SECURITY_CONFIG.sessionFixationPrevention) {
    return next();
  }

  try {
    // If this is a login or authentication request, regenerate session ID
    const authPaths = ['/api/auth/wallet/connect', '/auth/login', '/api/auth/login'];
    const isAuthRequest = authPaths.some(path => req.path.includes(path));

    if (isAuthRequest && req.method === 'POST') {
      const oldSessionId = req.sessionID;
      
      // Regenerate session ID
      req.session.regenerate((err) => {
        if (err) {
          console.error('Session regeneration failed:', err);
          logAuditEvent('Session fixation prevention failed', req.session?.userId, oldSessionId, req.ip, req.headers['user-agent']);
          return next();
        }

        // Log the session regeneration
        logAuditEvent('Session ID regenerated', req.session?.userId, req.sessionID, req.ip, req.headers['user-agent']);
        next();
      });
    } else {
      next();
    }
  } catch (error) {
    console.error('Session fixation prevention error:', error);
    next();
  }
}

/**
 * Device fingerprinting and validation middleware
 */
async function deviceFingerprintValidation(req, res, next) {
  if (!SECURITY_CONFIG.fingerprintValidation) {
    return next();
  }

  try {
    if (req.session && req.session.userId) {
      const currentFingerprint = generateDeviceFingerprint(req);
      
      // If this is the first time we're seeing this session, store the fingerprint
      if (!req.session.deviceFingerprint) {
        req.session.deviceFingerprint = currentFingerprint;
        req.session.trustedDevice = false;
        logAuditEvent('Device fingerprint recorded', req.session.userId, req.session.sessionId, req.ip, req.headers['user-agent']);
      } else {
        // Validate fingerprint hasn't changed significantly
        const similarity = calculateFingerprintSimilarity(req.session.deviceFingerprint, currentFingerprint);
        
        if (similarity < 0.8) { // 80% similarity threshold
          logAuditEvent('Device fingerprint mismatch detected', req.session.userId, req.session.sessionId, req.ip, req.headers['user-agent']);
          
          // If device is not trusted, terminate session
          if (!req.session.trustedDevice) {
            req.session.destroy(() => {});
            return res.status(401).json({ 
              error: 'Device authentication failed. Session terminated for security.',
              code: 'DEVICE_MISMATCH'
            });
          }
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('Device fingerprint validation error:', error);
    next();
  }
}

/**
 * Generate device fingerprint from request headers
 */
function generateDeviceFingerprint(req) {
  const components = [
    req.headers['user-agent'] || '',
    req.headers['accept-language'] || '',
    req.headers['accept-encoding'] || '',
    req.headers['accept'] || '',
    req.ip || ''
  ];
  
  const fingerprintString = components.join('|');
  return crypto.createHash('sha256').update(fingerprintString).digest('hex');
}

/**
 * Calculate similarity between two fingerprints
 */
function calculateFingerprintSimilarity(fp1, fp2) {
  if (fp1 === fp2) return 1.0;
  
  // Simple similarity calculation - can be enhanced
  let matches = 0;
  const minLength = Math.min(fp1.length, fp2.length);
  
  for (let i = 0; i < minLength; i++) {
    if (fp1[i] === fp2[i]) matches++;
  }
  
  return matches / Math.max(fp1.length, fp2.length);
}

/**
 * Location-based security monitoring
 */
async function locationSecurityMonitoring(req, res, next) {
  if (!SECURITY_CONFIG.locationTracking) {
    return next();
  }

  try {
    if (req.session && req.session.userId) {
      const currentLocation = {
        ip: req.ip,
        country: req.headers['cf-ipcountry'] || req.headers['x-country-code'] || 'Unknown',
        timestamp: Date.now()
      };

      // Store location history in Redis
      const redisClient = redis.getRedisClient();
      const locationKey = `location:${req.session.userId}`;
      
      const recentLocations = await redisClient.lrange(locationKey, 0, 9);
      const locationHistory = recentLocations.map(loc => JSON.parse(loc));

      // Check for unusual location patterns
      if (locationHistory.length > 0) {
        const lastLocation = locationHistory[0];
        const timeDiff = currentLocation.timestamp - lastLocation.timestamp;
        
        // Flag if location changed within suspiciously short time
        if (lastLocation.country !== currentLocation.country && timeDiff < 60000) { // 1 minute
          logAuditEvent('Suspicious location change detected', req.session.userId, req.session.sessionId, req.ip, req.headers['user-agent']);
          await reportSecurityEvent(req.session.userId, 'LOCATION_CHANGE', 'WARNING', {
            previousLocation: lastLocation,
            currentLocation: currentLocation,
            timeDiff: timeDiff
          });
        }
      }

      // Store current location
      await redisClient.lpush(locationKey, JSON.stringify(currentLocation));
      await redisClient.ltrim(locationKey, 0, 9); // Keep last 10 locations
      await redisClient.expire(locationKey, 7 * 24 * 60 * 60); // Expire after 7 days
    }
    
    next();
  } catch (error) {
    console.error('Location security monitoring error:', error);
    next();
  }
}

/**
 * Enhanced session risk calculation
 */
async function calculateSessionRisk(userId, sessionId) {
  try {
    let riskScore = 0;
    const riskFactors = [];

    const redisClient = redis.getRedisClient();

    // Check recent security events
    const securityEventsKey = `security_events:${userId}`;
    const recentEvents = await redisClient.lrange(securityEventsKey, 0, 9);
    
    const events = recentEvents.map(event => JSON.parse(event));
    const criticalEvents = events.filter(event => event.severity === 'CRITICAL').length;
    const warningEvents = events.filter(event => event.severity === 'WARNING').length;

    if (criticalEvents > 0) {
      riskScore += criticalEvents * 50;
      riskFactors.push(`${criticalEvents} critical security events`);
    }

    if (warningEvents > 2) {
      riskScore += warningEvents * 10;
      riskFactors.push(`${warningEvents} warning events`);
    }

    // Check concurrent sessions
    const userSessionsKey = `user_sessions:${userId}`;
    const activeSessions = await redisClient.smembers(userSessionsKey);
    
    if (activeSessions.length > SECURITY_CONFIG.maxSessionsPerUser) {
      riskScore += (activeSessions.length - SECURITY_CONFIG.maxSessionsPerUser) * 20;
      riskFactors.push(`${activeSessions.length} concurrent sessions`);
    }

    // Check failed login attempts
    const failedAttemptsKey = `failed_attempts:${userId}`;
    const failedAttempts = await redisClient.get(failedAttemptsKey);
    
    if (failedAttempts && parseInt(failedAttempts) > 3) {
      riskScore += parseInt(failedAttempts) * 15;
      riskFactors.push(`${failedAttempts} failed login attempts`);
    }

    // Determine risk level
    let riskLevel = 'LOW';
    if (riskScore >= 100) riskLevel = 'CRITICAL';
    else if (riskScore >= 50) riskLevel = 'HIGH';
    else if (riskScore >= 20) riskLevel = 'MEDIUM';

    return {
      riskScore,
      riskLevel,
      riskFactors,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Session risk calculation error:', error);
    return {
      riskScore: 0,
      riskLevel: 'LOW',
      riskFactors: [],
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
}

/**
 * Report security event to monitoring system
 */
async function reportSecurityEvent(userId, eventType, severity, metadata = {}) {
  try {
    const redisClient = redis.getRedisClient();
    const securityEvent = {
      id: crypto.randomUUID(),
      userId,
      eventType,
      severity,
      timestamp: Date.now(),
      metadata
    };

    // Store in Redis for quick access
    const securityEventsKey = `security_events:${userId}`;
    await redisClient.lpush(securityEventsKey, JSON.stringify(securityEvent));
    await redisClient.ltrim(securityEventsKey, 0, 49); // Keep last 50 events
    await redisClient.expire(securityEventsKey, 7 * 24 * 60 * 60); // Expire after 7 days

    // Log to audit file
    logAuditEvent(`Security event: ${eventType}`, userId, null, null, null, metadata);

    console.log(`Security event reported: ${eventType} for user ${userId}`);
  } catch (error) {
    console.error('Failed to report security event:', error);
  }
}

/**
 * Enhanced rate limiting with progressive penalties
 */
function enhancedRateLimit(maxAttempts = 5, windowMs = 15 * 60 * 1000) {
  const attemptStore = new Map();

  return async (req, res, next) => {
    try {
      const identifier = req.ip + (req.session?.userId || '');
      const now = Date.now();
      const windowStart = now - windowMs;

      // Clean old attempts
      if (attemptStore.has(identifier)) {
        const attempts = attemptStore.get(identifier);
        attemptStore.set(identifier, attempts.filter(time => time > windowStart));
      }

      // Get current attempts
      const attempts = attemptStore.get(identifier) || [];
      
      if (attempts.length >= maxAttempts) {
        // Progressive penalty - longer lockout for repeat offenders
        const penalties = Math.floor(attempts.length / maxAttempts);
        const lockoutTime = windowMs * Math.pow(2, Math.min(penalties, 5)); // Max 32x multiplier

        // Log suspicious activity
        logAuditEvent('Rate limit exceeded', req.session?.userId, req.session?.sessionId, req.ip, req.headers['user-agent']);
        
        if (req.session?.userId) {
          await reportSecurityEvent(req.session.userId, 'RATE_LIMIT_EXCEEDED', 'WARNING', {
            attempts: attempts.length,
            penalty: penalties,
            lockoutTime: lockoutTime
          });
        }

        return res.status(429).json({
          error: 'Too many attempts',
          retryAfter: Math.ceil(lockoutTime / 1000),
          code: 'RATE_LIMIT_EXCEEDED'
        });
      }

      // Record this attempt
      attempts.push(now);
      attemptStore.set(identifier, attempts);

      next();
    } catch (error) {
      console.error('Enhanced rate limit error:', error);
      next();
    }
  };
}

/**
 * Session security monitoring dashboard data
 */
async function getSecurityMetrics(userId = null) {
  try {
    const redisClient = redis.getRedisClient();
    const metrics = {
      totalActiveSessions: 0,
      securityEvents: { total: 0, critical: 0, warning: 0 },
      riskLevels: { low: 0, medium: 0, high: 0, critical: 0 },
      deviceStats: { trusted: 0, untrusted: 0 },
      locationStats: {},
      timestamp: new Date().toISOString()
    };

    if (userId) {
      // User-specific metrics
      const userSessionsKey = `user_sessions:${userId}`;
      const userSessions = await redisClient.smembers(userSessionsKey);
      metrics.totalActiveSessions = userSessions.length;

      const securityEventsKey = `security_events:${userId}`;
      const events = await redisClient.lrange(securityEventsKey, 0, -1);
      const parsedEvents = events.map(event => JSON.parse(event));
      
      metrics.securityEvents.total = parsedEvents.length;
      metrics.securityEvents.critical = parsedEvents.filter(e => e.severity === 'CRITICAL').length;
      metrics.securityEvents.warning = parsedEvents.filter(e => e.severity === 'WARNING').length;
    } else {
      // System-wide metrics
      const allSessionKeys = await redisClient.keys('user_sessions:*');
      for (const key of allSessionKeys) {
        const sessions = await redisClient.smembers(key);
        metrics.totalActiveSessions += sessions.length;
      }

      const allSecurityKeys = await redisClient.keys('security_events:*');
      for (const key of allSecurityKeys) {
        const events = await redisClient.lrange(key, 0, -1);
        const parsedEvents = events.map(event => JSON.parse(event));
        
        metrics.securityEvents.total += parsedEvents.length;
        metrics.securityEvents.critical += parsedEvents.filter(e => e.severity === 'CRITICAL').length;
        metrics.securityEvents.warning += parsedEvents.filter(e => e.severity === 'WARNING').length;
      }
    }

    return metrics;
  } catch (error) {
    console.error('Failed to get security metrics:', error);
    return {
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = {
  hijackingProtection,
  sessionTimeoutEnforcement,
  concurrentSessionLimit,
  sessionFixationPrevention,
  deviceFingerprintValidation,
  locationSecurityMonitoring,
  enhancedRateLimit,
  calculateSessionRisk,
  reportSecurityEvent,
  getSecurityMetrics,
  generateDeviceFingerprint,
  logAuditEvent,
  SECURITY_CONFIG
}; 