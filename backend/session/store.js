const { RedisStore } = require('connect-redis');
const redis = require('../redis');
const crypto = require('crypto-js');
require('dotenv').config();

class SessionStore {
  constructor() {
    this.redisClient = null;
    this.store = null;
    this.encryptionKey = process.env.SESSION_ENCRYPTION_KEY || 'default-session-key-change-in-production';
    this.sessionPrefix = 'session:';
    this.maxSessionsPerUser = parseInt(process.env.MAX_SESSIONS_PER_USER || '5', 10);
    this.sessionTimeout = parseInt(process.env.SESSION_TIMEOUT || '3600000', 10); // 1 hour default
  }

  /**
   * Initialize the session store
   */
  async initialize() {
    try {
      console.log('Initializing Redis session store...');
      
      // Get Redis client
      this.redisClient = redis.getRedisClient();
      
      // Create Redis store configuration - simplified to avoid syntax errors
      const storeConfig = {
        client: this.redisClient,
        prefix: this.sessionPrefix,
        ttl: this.sessionTimeout / 1000, // Convert to seconds
      };

      // Create Redis store instance
      this.store = new RedisStore(storeConfig);

      console.log('Redis session store initialized successfully');
      return this.store;
    } catch (error) {
      console.error('Failed to initialize session store:', error.message);
      throw error;
    }
  }

  /**
   * Encrypt session data
   */
  encryptSession(data) {
    try {
      const jsonData = JSON.stringify(data);
      return crypto.AES.encrypt(jsonData, this.encryptionKey).toString();
    } catch (error) {
      console.error('Session encryption failed:', error.message);
      return JSON.stringify(data); // Fallback to plain JSON
    }
  }

  /**
   * Decrypt session data
   */
  decryptSession(encryptedData) {
    try {
      const decrypted = crypto.AES.decrypt(encryptedData, this.encryptionKey);
      const jsonData = decrypted.toString(crypto.enc.Utf8);
      return JSON.parse(jsonData);
    } catch (error) {
      console.error('Session decryption failed:', error.message);
      // Try to parse as plain JSON (for backward compatibility)
      try {
        return JSON.parse(encryptedData);
      } catch (parseError) {
        console.error('Session data parsing failed:', parseError.message);
        return {};
      }
    }
  }

  /**
   * Track user session (for session management)
   */
  async trackUserSession(userId, sessionId) {
    try {
      const userSessionsKey = `user_sessions:${userId}`;
      await this.redisClient.sadd(userSessionsKey, sessionId);
      await this.redisClient.expire(userSessionsKey, this.sessionTimeout / 1000);
    } catch (error) {
      console.error('Failed to track user session:', error.message);
    }
  }

  /**
   * Remove user session from tracking
   */
  async removeUserSession(userId, sessionId) {
    try {
      const userSessionsKey = `user_sessions:${userId}`;
      await this.redisClient.srem(userSessionsKey, sessionId);
    } catch (error) {
      console.error('Failed to remove user session tracking:', error.message);
    }
  }

  /**
   * Get all sessions for a user
   */
  async getUserSessions(userId) {
    try {
      const userSessionsKey = `user_sessions:${userId}`;
      const sessionIds = await this.redisClient.smembers(userSessionsKey);
      
      const sessions = [];
      for (const sessionId of sessionIds) {
        // Use the RedisStore to get session data
        const sessionData = await this.store.get(sessionId);
        if (sessionData) {
          sessions.push({
            sessionId,
            ...sessionData
          });
        }
      }
      
      return sessions;
    } catch (error) {
      console.error('Failed to get user sessions:', error.message);
      return [];
    }
  }

  /**
   * Enforce session limit per user
   */
  async enforceSessionLimit(userId) {
    try {
      const userSessionsKey = `user_sessions:${userId}`;
      const userSessions = await this.redisClient.smembers(userSessionsKey);
      
      if (userSessions.length >= this.maxSessionsPerUser) {
        // Remove oldest session
        const oldestSession = userSessions[0];
        await this.store.destroy(oldestSession);
        await this.removeUserSession(userId, oldestSession);
        console.log(`Removed oldest session for user ${userId} due to limit`);
      }
    } catch (error) {
      console.error('Failed to enforce session limit:', error.message);
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions() {
    try {
      console.log('Cleaning up expired sessions...');
      
      // This is handled automatically by Redis TTL
      // But we can add additional cleanup logic here if needed
      
      console.log('Session cleanup completed');
    } catch (error) {
      console.error('Failed to cleanup sessions:', error.message);
    }
  }

  /**
   * Get session statistics
   */
  async getSessionStats() {
    try {
      const keys = await this.redisClient.keys(`${this.sessionPrefix}*`);
      const userSessionKeys = await this.redisClient.keys('user_sessions:*');
      
      return {
        totalSessions: keys.length,
        activeUsers: userSessionKeys.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to get session stats:', error.message);
      return {
        totalSessions: 0,
        activeUsers: 0,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Create a new session
   */
  async createSession(sessionId, data, userId = null) {
    try {
      if (!this.store) {
        throw new Error('Session store not initialized');
      }

      // Check concurrent session limit
      if (userId) {
        await this.enforceSessionLimit(userId);
      }

      // Track user sessions if userId is provided
      if (userId) {
        await this.trackUserSession(userId, sessionId);
      }

      console.log(`Session tracking created for: ${sessionId}`);
      return data;
    } catch (error) {
      console.error('Failed to create session tracking:', error.message);
      throw error;
    }
  }

  /**
   * Get session data
   */
  async getSession(sessionId) {
    try {
      if (!this.store) {
        throw new Error('Session store not initialized');
      }

      // Use the RedisStore to get session data
      const sessionData = await this.store.get(sessionId);
      return sessionData;
    } catch (error) {
      console.error('Failed to get session:', error.message);
      return null;
    }
  }

  /**
   * Update session data
   */
  async updateSession(sessionId, data) {
    try {
      if (!this.store) {
        throw new Error('Session store not initialized');
      }

      // Use the RedisStore to update session data
      await this.store.set(sessionId, data);
      console.log(`Session updated: ${sessionId}`);
      return data;
    } catch (error) {
      console.error('Failed to update session:', error.message);
      throw error;
    }
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId) {
    try {
      if (!this.store) {
        throw new Error('Session store not initialized');
      }

      // Use the RedisStore to delete session
      await this.store.destroy(sessionId);
      
      console.log(`Session deleted: ${sessionId}`);
      return true;
    } catch (error) {
      console.error('Failed to delete session:', error.message);
      return false;
    }
  }
}

module.exports = new SessionStore(); 