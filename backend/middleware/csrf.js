const crypto = require('crypto');
const sessionStore = require('../session/store');

/**
 * CSRF Protection Middleware
 * Implements double-submit cookie pattern for CSRF protection
 */
class CSRFProtection {
  constructor() {
    this.tokenLength = 32;
    this.tokenExpiry = 24 * 60 * 60 * 1000; // 24 hours
  }

  /**
   * Generate a CSRF token
   */
  generateToken() {
    return crypto.randomBytes(this.tokenLength).toString('hex');
  }

  /**
   * Validate CSRF token
   */
  validateToken(token, sessionToken) {
    if (!token || !sessionToken) {
      return false;
    }
    return token === sessionToken;
  }

  /**
   * Middleware to generate CSRF token for GET requests
   */
  generateTokenMiddleware() {
    return (req, res, next) => {
      if (req.method === 'GET' && req.session) {
        const csrfToken = this.generateToken();
        req.session.csrfToken = csrfToken;
        req.session.csrfTokenExpiry = Date.now() + this.tokenExpiry;
        
        // Set CSRF token in response header
        res.setHeader('X-CSRF-Token', csrfToken);
        
        // Also set as cookie for double-submit pattern
        res.cookie('csrf-token', csrfToken, {
          httpOnly: false, // Allow JavaScript access for double-submit
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: this.tokenExpiry
        });
      }
      next();
    };
  }

  /**
   * Middleware to validate CSRF token for state-changing requests
   */
  validateTokenMiddleware() {
    return (req, res, next) => {
      // Skip CSRF validation for GET requests
      if (req.method === 'GET') {
        return next();
      }

      // Skip CSRF validation for authentication endpoints
      if (req.path.startsWith('/auth/') || req.path.startsWith('/api/auth/')) {
        return next();
      }

      // Get token from header or body
      const headerToken = req.headers['x-csrf-token'];
      const bodyToken = req.body._csrf;
      const cookieToken = req.cookies['csrf-token'];
      
      const providedToken = headerToken || bodyToken;
      const sessionToken = req.session?.csrfToken;

      // Validate token
      if (!this.validateToken(providedToken, sessionToken)) {
        return res.status(403).json({
          error: 'CSRF token validation failed',
          message: 'Invalid or missing CSRF token'
        });
      }

      // Check token expiry
      if (req.session.csrfTokenExpiry && Date.now() > req.session.csrfTokenExpiry) {
        return res.status(403).json({
          error: 'CSRF token expired',
          message: 'CSRF token has expired. Please refresh the page.'
        });
      }

      next();
    };
  }

  /**
   * Middleware to refresh CSRF token after successful state-changing requests
   */
  refreshTokenMiddleware() {
    return (req, res, next) => {
      const originalSend = res.send;
      
      res.send = function(data) {
        // If request was successful and session exists, refresh CSRF token
        if (res.statusCode < 400 && req.session) {
          const newCsrfToken = this.generateToken();
          req.session.csrfToken = newCsrfToken;
          req.session.csrfTokenExpiry = Date.now() + this.tokenExpiry;
          
          // Set new token in response header
          res.setHeader('X-CSRF-Token', newCsrfToken);
          
          // Update cookie
          res.cookie('csrf-token', newCsrfToken, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: this.tokenExpiry
          });
        }
        
        originalSend.call(this, data);
      }.bind(this);
      
      next();
    };
  }

  /**
   * Get CSRF token info for debugging
   */
  getTokenInfo(req) {
    return {
      hasSession: !!req.session,
      hasToken: !!req.session?.csrfToken,
      tokenExpiry: req.session?.csrfTokenExpiry,
      isExpired: req.session?.csrfTokenExpiry ? Date.now() > req.session.csrfTokenExpiry : true
    };
  }
}

// Create singleton instance
const csrfProtection = new CSRFProtection();

module.exports = csrfProtection; 