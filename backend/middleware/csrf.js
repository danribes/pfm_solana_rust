/**
 * Enhanced CSRF Protection Middleware
 * Provides comprehensive CSRF attack protection for session security
 */

const crypto = require('crypto');
const redis = require('../redis');

// CSRF Configuration
const CSRF_CONFIG = {
  tokenLength: 32,
  tokenExpiry: 30 * 60 * 1000, // 30 minutes
  cookieName: 'pfm_csrf_token',
  headerName: 'X-CSRF-Token',
  keyPrefix: 'csrf:',
  rotationInterval: 15 * 60 * 1000, // 15 minutes
  maxTokensPerSession: 5,
  doubleSubmitPattern: true
};

/**
 * Generate a secure CSRF token
 */
function generateCSRFToken() {
  return crypto.randomBytes(CSRF_CONFIG.tokenLength).toString('hex');
}

/**
 * Store CSRF token in Redis with expiration
 */
async function storeCSRFToken(sessionId, token) {
  try {
    const redisClient = redis.getRedisClient();
    const key = `${CSRF_CONFIG.keyPrefix}${sessionId}`;
    
    // Store token with metadata
    const tokenData = {
      token,
      createdAt: Date.now(),
      expiresAt: Date.now() + CSRF_CONFIG.tokenExpiry,
      used: false
    };
    
    await redisClient.setex(key, Math.floor(CSRF_CONFIG.tokenExpiry / 1000), JSON.stringify(tokenData));
    
    console.log(`CSRF token stored for session: ${sessionId}`);
    return true;
  } catch (error) {
    console.error('Failed to store CSRF token:', error);
    return false;
  }
}

/**
 * Retrieve and validate CSRF token from Redis
 */
async function validateCSRFToken(sessionId, providedToken) {
  try {
    const redisClient = redis.getRedisClient();
    const key = `${CSRF_CONFIG.keyPrefix}${sessionId}`;
    
    const tokenDataStr = await redisClient.get(key);
    if (!tokenDataStr) {
      return { valid: false, reason: 'Token not found' };
    }
    
    const tokenData = JSON.parse(tokenDataStr);
    
    // Check if token is expired
    if (Date.now() > tokenData.expiresAt) {
      await redisClient.del(key);
      return { valid: false, reason: 'Token expired' };
    }
    
    // Check if token matches
    if (tokenData.token !== providedToken) {
      return { valid: false, reason: 'Token mismatch' };
    }
    
    // Check if token was already used (for single-use tokens)
    if (tokenData.used) {
      return { valid: false, reason: 'Token already used' };
    }
    
    return { valid: true, tokenData };
  } catch (error) {
    console.error('Failed to validate CSRF token:', error);
    return { valid: false, reason: 'Validation error' };
  }
}

/**
 * Mark CSRF token as used
 */
async function markTokenAsUsed(sessionId, token) {
  try {
    const redisClient = redis.getRedisClient();
    const key = `${CSRF_CONFIG.keyPrefix}${sessionId}`;
    
    const tokenDataStr = await redisClient.get(key);
    if (tokenDataStr) {
      const tokenData = JSON.parse(tokenDataStr);
      if (tokenData.token === token) {
        tokenData.used = true;
        tokenData.usedAt = Date.now();
        
        const remainingTTL = await redisClient.ttl(key);
        if (remainingTTL > 0) {
          await redisClient.setex(key, remainingTTL, JSON.stringify(tokenData));
        }
      }
    }
  } catch (error) {
    console.error('Failed to mark CSRF token as used:', error);
  }
}

/**
 * Rotate CSRF token for enhanced security
 */
async function rotateCSRFToken(sessionId) {
  try {
    const newToken = generateCSRFToken();
    await storeCSRFToken(sessionId, newToken);
    return newToken;
  } catch (error) {
    console.error('Failed to rotate CSRF token:', error);
    return null;
  }
}

/**
 * CSRF token generation endpoint middleware
 */
async function generateCSRFEndpoint(req, res) {
  try {
    const sessionId = req.session?.sessionId || req.sessionID;
    
    if (!sessionId) {
      return res.status(401).json({
        success: false,
        error: 'Session required for CSRF token generation'
      });
    }
    
    const token = generateCSRFToken();
    const stored = await storeCSRFToken(sessionId, token);
    
    if (!stored) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate CSRF token'
      });
    }
    
    // Set token in cookie for double-submit pattern
    if (CSRF_CONFIG.doubleSubmitPattern) {
      res.cookie(CSRF_CONFIG.cookieName, token, {
        httpOnly: false, // Must be accessible to JavaScript for header submission
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: CSRF_CONFIG.tokenExpiry
      });
    }
    
    res.json({
      success: true,
      data: {
        csrfToken: token,
        expiresAt: new Date(Date.now() + CSRF_CONFIG.tokenExpiry).toISOString(),
        headerName: CSRF_CONFIG.headerName
      }
    });
  } catch (error) {
    console.error('CSRF token generation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Main CSRF protection middleware
 */
function csrfProtection(options = {}) {
  const config = { ...CSRF_CONFIG, ...options };
  
  return async (req, res, next) => {
    try {
      // Skip CSRF protection for safe methods
      const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
      if (safeMethods.includes(req.method)) {
        return next();
      }
      
      // Skip for certain endpoints
      const skipEndpoints = ['/api/auth/csrf', '/health'];
      if (skipEndpoints.some(endpoint => req.path.startsWith(endpoint))) {
        return next();
      }
      
      const sessionId = req.session?.sessionId || req.sessionID;
      
      if (!sessionId) {
        return res.status(401).json({
          success: false,
          error: 'Session required',
          code: 'CSRF_SESSION_REQUIRED'
        });
      }
      
      // Get CSRF token from header or body
      let providedToken = req.headers[config.headerName.toLowerCase()] || 
                         req.body?._csrfToken ||
                         req.query?._csrfToken;
      
      if (!providedToken) {
        return res.status(403).json({
          success: false,
          error: 'CSRF token required',
          code: 'CSRF_TOKEN_MISSING'
        });
      }
      
      // Validate token
      const validation = await validateCSRFToken(sessionId, providedToken);
      
      if (!validation.valid) {
        // Log potential CSRF attack
        console.warn(`CSRF validation failed for session ${sessionId}:`, {
          reason: validation.reason,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          path: req.path,
          method: req.method
        });
        
        return res.status(403).json({
          success: false,
          error: 'Invalid CSRF token',
          code: 'CSRF_TOKEN_INVALID',
          reason: validation.reason
        });
      }
      
      // Mark token as used if configured for single-use
      if (config.singleUse) {
        await markTokenAsUsed(sessionId, providedToken);
      }
      
      // Check if token needs rotation
      const tokenAge = Date.now() - validation.tokenData.createdAt;
      if (tokenAge > config.rotationInterval) {
        const newToken = await rotateCSRFToken(sessionId);
        if (newToken) {
          res.set('X-New-CSRF-Token', newToken);
        }
      }
      
      next();
    } catch (error) {
      console.error('CSRF protection error:', error);
      res.status(500).json({
        success: false,
        error: 'CSRF protection failed',
        code: 'CSRF_INTERNAL_ERROR'
      });
    }
  };
}

/**
 * CSRF token validation for specific requests
 */
async function validateCSRFForRequest(req) {
  try {
    const sessionId = req.session?.sessionId || req.sessionID;
    const providedToken = req.headers[CSRF_CONFIG.headerName.toLowerCase()];
    
    if (!sessionId || !providedToken) {
      return { valid: false, reason: 'Missing session or token' };
    }
    
    return await validateCSRFToken(sessionId, providedToken);
  } catch (error) {
    console.error('CSRF request validation error:', error);
    return { valid: false, reason: 'Validation error' };
  }
}

/**
 * Middleware to inject CSRF token into response
 */
function injectCSRFToken(req, res, next) {
  const originalJson = res.json;
  
  res.json = function(data) {
    // Inject CSRF token info into successful responses
    if (data && data.success !== false && req.session?.sessionId) {
      data._csrf = {
        headerName: CSRF_CONFIG.headerName,
        cookieName: CSRF_CONFIG.cookieName
      };
    }
    
    return originalJson.call(this, data);
  };
  
  next();
}

/**
 * Clean up expired CSRF tokens
 */
async function cleanupExpiredTokens() {
  try {
    const redisClient = redis.getRedisClient();
    const pattern = `${CSRF_CONFIG.keyPrefix}*`;
    const keys = await redisClient.keys(pattern);
    
    let cleaned = 0;
    
    for (const key of keys) {
      try {
        const tokenDataStr = await redisClient.get(key);
        if (tokenDataStr) {
          const tokenData = JSON.parse(tokenDataStr);
          if (Date.now() > tokenData.expiresAt) {
            await redisClient.del(key);
            cleaned++;
          }
        }
      } catch (error) {
        // If we can't parse the token data, delete the key
        await redisClient.del(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`Cleaned up ${cleaned} expired CSRF tokens`);
    }
  } catch (error) {
    console.error('CSRF token cleanup failed:', error);
  }
}

/**
 * Start periodic cleanup of expired tokens
 */
function startCSRFCleanup() {
  // Run cleanup every 30 minutes
  setInterval(cleanupExpiredTokens, 30 * 60 * 1000);
  
  // Run initial cleanup
  setTimeout(cleanupExpiredTokens, 5000);
}

/**
 * Get CSRF statistics
 */
async function getCSRFStats() {
  try {
    const redisClient = redis.getRedisClient();
    const pattern = `${CSRF_CONFIG.keyPrefix}*`;
    const keys = await redisClient.keys(pattern);
    
    let activeTokens = 0;
    let expiredTokens = 0;
    let usedTokens = 0;
    
    for (const key of keys) {
      try {
        const tokenDataStr = await redisClient.get(key);
        if (tokenDataStr) {
          const tokenData = JSON.parse(tokenDataStr);
          
          if (Date.now() > tokenData.expiresAt) {
            expiredTokens++;
          } else if (tokenData.used) {
            usedTokens++;
          } else {
            activeTokens++;
          }
        }
      } catch (error) {
        // Count unparseable tokens as expired
        expiredTokens++;
      }
    }
    
    return {
      activeTokens,
      expiredTokens,
      usedTokens,
      totalTokens: keys.length,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to get CSRF stats:', error);
    return {
      activeTokens: 0,
      expiredTokens: 0,
      usedTokens: 0,
      totalTokens: 0,
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
}

module.exports = {
  csrfProtection,
  generateCSRFEndpoint,
  validateCSRFForRequest,
  injectCSRFToken,
  generateCSRFToken,
  storeCSRFToken,
  validateCSRFToken,
  rotateCSRFToken,
  startCSRFCleanup,
  cleanupExpiredTokens,
  getCSRFStats,
  CSRF_CONFIG
}; 