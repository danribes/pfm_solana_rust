const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const redis = require('../redis');
require('dotenv').config();

/**
 * Comprehensive Audit Service
 * Provides logging, monitoring, and analytics for security events and user actions
 */
class AuditService {
  constructor() {
    this.auditLogPath = process.env.AUDIT_LOG_PATH || path.join(__dirname, '../logs/audit.log');
    this.securityLogPath = process.env.SECURITY_LOG_PATH || path.join(__dirname, '../logs/security.log');
    this.sessionLogPath = process.env.SESSION_LOG_PATH || path.join(__dirname, '../logs/session.log');
    this.performanceLogPath = process.env.PERFORMANCE_LOG_PATH || path.join(__dirname, '../logs/performance.log');
    
    this.redisPrefix = 'audit:';
    this.maxLogSize = parseInt(process.env.MAX_LOG_SIZE || '10485760', 10); // 10MB
    this.logRetentionDays = parseInt(process.env.LOG_RETENTION_DAYS || '90', 10);
    
    this.ensureLogDirectories();
  }

  /**
   * Ensure log directories exist
   */
  ensureLogDirectories() {
    const logDir = path.dirname(this.auditLogPath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  /**
   * Log audit event with comprehensive metadata
   */
  async logAuditEvent(event, metadata = {}) {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      event,
      level: metadata.level || 'INFO',
      userId: metadata.userId || null,
      sessionId: metadata.sessionId || null,
      ipAddress: metadata.ipAddress || null,
      userAgent: metadata.userAgent || null,
      endpoint: metadata.endpoint || null,
      method: metadata.method || null,
      statusCode: metadata.statusCode || null,
      requestId: metadata.requestId || this.generateRequestId(),
      details: metadata.details || {},
      severity: metadata.severity || 'MEDIUM',
      category: metadata.category || 'GENERAL'
    };

    try {
      // Write to file
      await this.writeToLog(this.auditLogPath, auditEntry);
      
      // Store in Redis for real-time monitoring
      await this.storeInRedis(auditEntry);
      
      // Log to console in development
      if (process.env.NODE_ENV !== 'production') {
        console.log('AUDIT:', JSON.stringify(auditEntry, null, 2));
      }
      
      return auditEntry.requestId;
    } catch (error) {
      console.error('Failed to log audit event:', error.message);
      return null;
    }
  }

  /**
   * Log security event
   */
  async logSecurityEvent(event, metadata = {}) {
    metadata.category = 'SECURITY';
    metadata.level = metadata.level || 'WARNING';
    metadata.severity = metadata.severity || 'HIGH';
    
    return this.logAuditEvent(event, metadata);
  }

  /**
   * Log session event
   */
  async logSessionEvent(event, metadata = {}) {
    metadata.category = 'SESSION';
    metadata.level = metadata.level || 'INFO';
    
    const sessionEntry = {
      timestamp: new Date().toISOString(),
      event,
      userId: metadata.userId || null,
      sessionId: metadata.sessionId || null,
      ipAddress: metadata.ipAddress || null,
      userAgent: metadata.userAgent || null,
      action: metadata.action || null,
      details: metadata.details || {}
    };

    try {
      await this.writeToLog(this.sessionLogPath, sessionEntry);
      return true;
    } catch (error) {
      console.error('Failed to log session event:', error.message);
      return false;
    }
  }

  /**
   * Log performance metrics
   */
  async logPerformanceEvent(event, metadata = {}) {
    metadata.category = 'PERFORMANCE';
    metadata.level = metadata.level || 'INFO';
    
    const performanceEntry = {
      timestamp: new Date().toISOString(),
      event,
      duration: metadata.duration || null,
      endpoint: metadata.endpoint || null,
      method: metadata.method || null,
      statusCode: metadata.statusCode || null,
      userId: metadata.userId || null,
      sessionId: metadata.sessionId || null,
      details: metadata.details || {}
    };

    try {
      await this.writeToLog(this.performanceLogPath, performanceEntry);
      return true;
    } catch (error) {
      console.error('Failed to log performance event:', error.message);
      return false;
    }
  }

  /**
   * Write log entry to file
   */
  async writeToLog(logPath, entry) {
    return new Promise((resolve, reject) => {
      const logLine = JSON.stringify(entry) + '\n';
      
      fs.appendFile(logPath, logLine, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Store audit entry in Redis for real-time monitoring
   */
  async storeInRedis(auditEntry) {
    try {
      const redisClient = redis.getRedisClient();
      const key = `${this.redisPrefix}${auditEntry.timestamp}`;
      
      // Store with TTL for automatic cleanup
      await redisClient.setex(key, this.logRetentionDays * 24 * 60 * 60, JSON.stringify(auditEntry));
      
      // Add to recent events list
      await redisClient.lpush(`${this.redisPrefix}recent`, JSON.stringify(auditEntry));
      await redisClient.ltrim(`${this.redisPrefix}recent`, 0, 999); // Keep last 1000 events
      
      // Add to category-specific lists
      await redisClient.lpush(`${this.redisPrefix}${auditEntry.category.toLowerCase()}`, JSON.stringify(auditEntry));
      await redisClient.ltrim(`${this.redisPrefix}${auditEntry.category.toLowerCase()}`, 0, 999);
      
    } catch (error) {
      console.error('Failed to store audit entry in Redis:', error.message);
    }
  }

  /**
   * Generate unique request ID
   */
  generateRequestId() {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Get recent audit events
   */
  async getRecentEvents(limit = 100, category = null) {
    try {
      const redisClient = redis.getRedisClient();
      const key = category 
        ? `${this.redisPrefix}${category.toLowerCase()}`
        : `${this.redisPrefix}recent`;
      
      const events = await redisClient.lrange(key, 0, limit - 1);
      return events.map(event => JSON.parse(event));
    } catch (error) {
      console.error('Failed to get recent events:', error.message);
      return [];
    }
  }

  /**
   * Get security events
   */
  async getSecurityEvents(limit = 100) {
    return this.getRecentEvents(limit, 'SECURITY');
  }

  /**
   * Get session events
   */
  async getSessionEvents(limit = 100) {
    return this.getRecentEvents(limit, 'SESSION');
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(limit = 100) {
    return this.getRecentEvents(limit, 'PERFORMANCE');
  }

  /**
   * Search audit logs
   */
  async searchAuditLogs(criteria = {}) {
    try {
      const redisClient = redis.getRedisClient();
      const keys = await redisClient.keys(`${this.redisPrefix}*`);
      
      const results = [];
      for (const key of keys) {
        if (key.includes('recent') || key.includes('category')) continue;
        
        const value = await redisClient.get(key);
        if (value) {
          const entry = JSON.parse(value);
          
          // Apply filters
          let matches = true;
          if (criteria.userId && entry.userId !== criteria.userId) matches = false;
          if (criteria.category && entry.category !== criteria.category) matches = false;
          if (criteria.level && entry.level !== criteria.level) matches = false;
          if (criteria.startDate && new Date(entry.timestamp) < new Date(criteria.startDate)) matches = false;
          if (criteria.endDate && new Date(entry.timestamp) > new Date(criteria.endDate)) matches = false;
          
          if (matches) {
            results.push(entry);
          }
        }
      }
      
      return results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      console.error('Failed to search audit logs:', error.message);
      return [];
    }
  }

  /**
   * Get audit statistics
   */
  async getAuditStats() {
    try {
      const redisClient = redis.getRedisClient();
      const keys = await redisClient.keys(`${this.redisPrefix}*`);
      
      const stats = {
        totalEvents: keys.length,
        categories: {},
        levels: {},
        recentActivity: []
      };
      
      // Get recent events for activity overview
      const recentEvents = await this.getRecentEvents(50);
      stats.recentActivity = recentEvents.map(event => ({
        timestamp: event.timestamp,
        event: event.event,
        category: event.category,
        level: event.level
      }));
      
      // Count by category and level
      for (const event of recentEvents) {
        stats.categories[event.category] = (stats.categories[event.category] || 0) + 1;
        stats.levels[event.level] = (stats.levels[event.level] || 0) + 1;
      }
      
      return stats;
    } catch (error) {
      console.error('Failed to get audit stats:', error.message);
      return {
        totalEvents: 0,
        categories: {},
        levels: {},
        recentActivity: []
      };
    }
  }

  /**
   * Clean up old audit logs
   */
  async cleanupOldLogs() {
    try {
      const redisClient = redis.getRedisClient();
      const keys = await redisClient.keys(`${this.redisPrefix}*`);
      const cutoffTime = Date.now() - (this.logRetentionDays * 24 * 60 * 60 * 1000);
      
      let cleanedCount = 0;
      for (const key of keys) {
        const value = await redisClient.get(key);
        if (value) {
          const entry = JSON.parse(value);
          if (new Date(entry.timestamp).getTime() < cutoffTime) {
            await redisClient.del(key);
            cleanedCount++;
          }
        }
      }
      
      console.log(`Cleaned up ${cleanedCount} old audit log entries`);
      return cleanedCount;
    } catch (error) {
      console.error('Failed to cleanup old logs:', error.message);
      return 0;
    }
  }

  /**
   * Export audit logs
   */
  async exportAuditLogs(format = 'json', criteria = {}) {
    try {
      const events = await this.searchAuditLogs(criteria);
      
      if (format === 'csv') {
        return this.convertToCSV(events);
      } else {
        return JSON.stringify(events, null, 2);
      }
    } catch (error) {
      console.error('Failed to export audit logs:', error.message);
      return null;
    }
  }

  /**
   * Convert events to CSV format
   */
  convertToCSV(events) {
    if (events.length === 0) return '';
    
    const headers = Object.keys(events[0]);
    const csvRows = [headers.join(',')];
    
    for (const event of events) {
      const row = headers.map(header => {
        const value = event[header];
        if (typeof value === 'object') {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        return `"${String(value || '').replace(/"/g, '""')}"`;
      });
      csvRows.push(row.join(','));
    }
    
    return csvRows.join('\n');
  }
}

// Create singleton instance
const auditService = new AuditService();

module.exports = auditService; 