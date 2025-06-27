// Wallet-specific session management service
// Integrates with existing Redis session store for wallet authentication

const sessionStore = require('../session/store');
const sessionAuth = require('../session/auth');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

class WalletSessionManager {
  constructor() {
    this.sessionPrefix = 'wallet_session:';
    this.sessionTimeout = parseInt(process.env.WALLET_SESSION_TIMEOUT || '7200000', 10); // 2 hours default
    this.refreshThreshold = parseInt(process.env.WALLET_REFRESH_THRESHOLD || '1800000', 10); // 30 minutes
  }

  /**
   * Create a new wallet authentication session
   * @param {string} walletAddress - Wallet address
   * @param {Object} authResult - Authentication result from wallet service
   * @param {Object} req - Express request object
   * @returns {Object} Session data with token and metadata
   */
  async createWalletSession(walletAddress, authResult, req) {
    try {
      const sessionId = uuidv4();
      const sessionToken = this.generateWalletSessionToken(walletAddress, sessionId);
      
      const sessionData = {
        sessionId,
        walletAddress,
        sessionToken,
        authenticatedAt: authResult.authenticatedAt,
        walletType: authResult.walletType,
        userAgent: req.headers['user-agent'] || '',
        ipAddress: req.ip || req.connection.remoteAddress || '',
        lastAccessed: Date.now(),
        isActive: true
      };

      // Create session in Redis store
      await sessionStore.createSession(sessionId, sessionData, walletAddress);
      
      // Set up Express session
      if (req.session) {
        req.session.sessionId = sessionId;
        req.session.walletAddress = walletAddress;
        req.session.sessionToken = sessionToken;
        req.session.authenticatedAt = authResult.authenticatedAt;
      }

      console.log(`Wallet session created: ${sessionId} for ${walletAddress}`);
      
      return {
        sessionId,
        sessionToken,
        walletAddress,
        authenticatedAt: authResult.authenticatedAt,
        expiresAt: Date.now() + this.sessionTimeout
      };
    } catch (error) {
      console.error('Failed to create wallet session:', error.message);
      throw error;
    }
  }

  /**
   * Validate a wallet session
   * @param {string} sessionId - Session ID
   * @param {string} sessionToken - Session token
   * @returns {Object|null} Session data if valid, null otherwise
   */
  async validateWalletSession(sessionId, sessionToken) {
    try {
      const sessionData = await sessionStore.getSession(sessionId);
      
      if (!sessionData || !sessionData.isActive) {
        return null;
      }

      // Verify session token
      if (!this.verifyWalletSessionToken(sessionToken, sessionData.walletAddress, sessionId)) {
        return null;
      }

      // Check if session is expired
      if (this.isSessionExpired(sessionData)) {
        await this.invalidateWalletSession(sessionId);
        return null;
      }

      // Update last accessed time
      sessionData.lastAccessed = Date.now();
      await sessionStore.updateSession(sessionId, sessionData);

      return sessionData;
    } catch (error) {
      console.error('Failed to validate wallet session:', error.message);
      return null;
    }
  }

  /**
   * Refresh a wallet session
   * @param {string} sessionId - Session ID
   * @param {Object} req - Express request object
   * @returns {Object|null} New session data if refreshed, null otherwise
   */
  async refreshWalletSession(sessionId, req) {
    try {
      const sessionData = await sessionStore.getSession(sessionId);
      
      if (!sessionData || !sessionData.isActive) {
        return null;
      }

      // Check if refresh is needed
      if (!this.shouldRefreshSession(sessionData)) {
        return sessionData;
      }

      // Generate new session token
      const newSessionToken = this.generateWalletSessionToken(sessionData.walletAddress, sessionId);
      
      const updatedData = {
        ...sessionData,
        sessionToken: newSessionToken,
        lastAccessed: Date.now(),
        refreshedAt: Date.now()
      };

      await sessionStore.updateSession(sessionId, updatedData);

      // Update Express session
      if (req.session) {
        req.session.sessionToken = newSessionToken;
        req.session.lastAccessed = Date.now();
      }

      console.log(`Wallet session refreshed: ${sessionId}`);
      
      return updatedData;
    } catch (error) {
      console.error('Failed to refresh wallet session:', error.message);
      return null;
    }
  }

  /**
   * Invalidate a wallet session (logout)
   * @param {string} sessionId - Session ID
   * @param {Object} req - Express request object
   * @returns {boolean} True if successful
   */
  async invalidateWalletSession(sessionId, req = null) {
    try {
      const sessionData = await sessionStore.getSession(sessionId);
      
      if (sessionData) {
        // Mark session as inactive
        sessionData.isActive = false;
        sessionData.loggedOutAt = Date.now();
        await sessionStore.updateSession(sessionId, sessionData);
        
        // Delete session from store
        await sessionStore.deleteSession(sessionId);
      }

      // Clear Express session
      if (req && req.session) {
        req.session.destroy(() => {});
      }

      console.log(`Wallet session invalidated: ${sessionId}`);
      return true;
    } catch (error) {
      console.error('Failed to invalidate wallet session:', error.message);
      return false;
    }
  }

  /**
   * Get all active sessions for a wallet address
   * @param {string} walletAddress - Wallet address
   * @returns {Array} Array of active sessions
   */
  async getWalletSessions(walletAddress) {
    try {
      const sessions = await sessionStore.getUserSessions(walletAddress);
      return sessions.filter(session => session.isActive);
    } catch (error) {
      console.error('Failed to get wallet sessions:', error.message);
      return [];
    }
  }

  /**
   * Invalidate all sessions for a wallet address
   * @param {string} walletAddress - Wallet address
   * @returns {boolean} True if successful
   */
  async invalidateAllWalletSessions(walletAddress) {
    try {
      const sessions = await this.getWalletSessions(walletAddress);
      
      for (const session of sessions) {
        await this.invalidateWalletSession(session.sessionId);
      }

      console.log(`All wallet sessions invalidated for: ${walletAddress}`);
      return true;
    } catch (error) {
      console.error('Failed to invalidate all wallet sessions:', error.message);
      return false;
    }
  }

  /**
   * Generate a secure wallet session token
   * @param {string} walletAddress - Wallet address
   * @param {string} sessionId - Session ID
   * @returns {string} Session token
   */
  generateWalletSessionToken(walletAddress, sessionId) {
    const tokenData = {
      walletAddress,
      sessionId,
    };
    
    const tokenString = JSON.stringify(tokenData);
    return crypto.createHash('sha256').update(tokenString).digest('hex');
  }

  /**
   * Verify a wallet session token
   * @param {string} sessionToken - Session token
   * @param {string} walletAddress - Expected wallet address
   * @param {string} sessionId - Expected session ID
   * @returns {boolean} True if valid
   */
  verifyWalletSessionToken(sessionToken, walletAddress, sessionId) {
    try {
      // This is a simplified verification - in production, you might want to store
      // the original token data for verification
      const expectedToken = this.generateWalletSessionToken(walletAddress, sessionId);
      return sessionToken === expectedToken;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if session should be refreshed
   * @param {Object} sessionData - Session data
   * @returns {boolean} True if refresh is needed
   */
  shouldRefreshSession(sessionData) {
    const timeSinceLastAccess = Date.now() - sessionData.lastAccessed;
    return timeSinceLastAccess > this.refreshThreshold;
  }

  /**
   * Check if session is expired
   * @param {Object} sessionData - Session data
   * @returns {boolean} True if expired
   */
  isSessionExpired(sessionData) {
    const timeSinceCreation = Date.now() - sessionData.authenticatedAt;
    return timeSinceCreation > this.sessionTimeout;
  }

  /**
   * Get session statistics
   * @returns {Object} Session statistics
   */
  async getSessionStats() {
    try {
      const stats = await sessionStore.getSessionStats();
      return {
        ...stats,
        walletSessionTimeout: this.sessionTimeout,
        walletRefreshThreshold: this.refreshThreshold
      };
    } catch (error) {
      console.error('Failed to get session stats:', error.message);
      return {};
    }
  }
}

// Create singleton instance
const walletSessionManager = new WalletSessionManager();

module.exports = walletSessionManager; 