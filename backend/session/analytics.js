const sessionStore = require('./store');
const auditService = require('../services/audit');
const redis = require('../redis');

/**
 * Session Analytics and Monitoring Service
 * Provides comprehensive analytics for session patterns, user behavior, and security metrics
 */
class SessionAnalytics {
  constructor() {
    this.redisPrefix = 'session_analytics:';
    this.metricsPrefix = 'session_metrics:';
    this.retentionDays = 30; // Keep analytics data for 30 days
  }

  /**
   * Track session creation
   */
  async trackSessionCreation(sessionData) {
    try {
      const redisClient = redis.getRedisClient();
      const timestamp = Date.now();
      const dateKey = new Date().toISOString().split('T')[0];
      
      // Track daily session creation
      await redisClient.hincrby(`${this.metricsPrefix}daily:${dateKey}`, 'sessions_created', 1);
      
      // Track user session creation
      if (sessionData.userId) {
        await redisClient.hincrby(`${this.metricsPrefix}user:${sessionData.userId}`, 'sessions_created', 1);
        await redisClient.hincrby(`${this.metricsPrefix}user:${sessionData.userId}`, 'last_session', timestamp);
      }
      
      // Track session by user agent
      if (sessionData.userAgent) {
        const userAgentKey = this.sanitizeUserAgent(sessionData.userAgent);
        await redisClient.hincrby(`${this.metricsPrefix}user_agents`, userAgentKey, 1);
      }
      
      // Track session by IP
      if (sessionData.ipAddress) {
        await redisClient.hincrby(`${this.metricsPrefix}ip_addresses`, sessionData.ipAddress, 1);
      }
      
      // Log analytics event
      await auditService.logSessionEvent('session_created', {
        userId: sessionData.userId,
        sessionId: sessionData.sessionId,
        ipAddress: sessionData.ipAddress,
        userAgent: sessionData.userAgent,
        details: { analytics: true }
      });
      
    } catch (error) {
      console.error('Failed to track session creation:', error.message);
    }
  }

  /**
   * Track session activity
   */
  async trackSessionActivity(sessionData) {
    try {
      const redisClient = redis.getRedisClient();
      const timestamp = Date.now();
      const dateKey = new Date().toISOString().split('T')[0];
      
      // Track daily activity
      await redisClient.hincrby(`${this.metricsPrefix}daily:${dateKey}`, 'session_activity', 1);
      
      // Track user activity
      if (sessionData.userId) {
        await redisClient.hincrby(`${this.metricsPrefix}user:${sessionData.userId}`, 'session_activity', 1);
        await redisClient.hincrby(`${this.metricsPrefix}user:${sessionData.userId}`, 'last_activity', timestamp);
      }
      
      // Track session duration
      if (sessionData.createdAt) {
        const duration = timestamp - sessionData.createdAt;
        await redisClient.lpush(`${this.metricsPrefix}session_durations`, duration);
        await redisClient.ltrim(`${this.metricsPrefix}session_durations`, 0, 9999); // Keep last 10k durations
      }
      
    } catch (error) {
      console.error('Failed to track session activity:', error.message);
    }
  }

  /**
   * Track session termination
   */
  async trackSessionTermination(sessionData, reason = 'unknown') {
    try {
      const redisClient = redis.getRedisClient();
      const timestamp = Date.now();
      const dateKey = new Date().toISOString().split('T')[0];
      
      // Track daily terminations
      await redisClient.hincrby(`${this.metricsPrefix}daily:${dateKey}`, 'sessions_terminated', 1);
      await redisClient.hincrby(`${this.metricsPrefix}daily:${dateKey}`, `termination_${reason}`, 1);
      
      // Track user terminations
      if (sessionData.userId) {
        await redisClient.hincrby(`${this.metricsPrefix}user:${sessionData.userId}`, 'sessions_terminated', 1);
        await redisClient.hincrby(`${this.metricsPrefix}user:${sessionData.userId}`, `termination_${reason}`, 1);
      }
      
      // Track session duration at termination
      if (sessionData.createdAt) {
        const duration = timestamp - sessionData.createdAt;
        await redisClient.lpush(`${this.metricsPrefix}session_lifetimes`, duration);
        await redisClient.ltrim(`${this.metricsPrefix}session_lifetimes`, 0, 9999);
      }
      
      // Log analytics event
      await auditService.logSessionEvent('session_terminated', {
        userId: sessionData.userId,
        sessionId: sessionData.sessionId,
        ipAddress: sessionData.ipAddress,
        userAgent: sessionData.userAgent,
        details: { reason, analytics: true }
      });
      
    } catch (error) {
      console.error('Failed to track session termination:', error.message);
    }
  }

  /**
   * Track security events
   */
  async trackSecurityEvent(event, sessionData) {
    try {
      const redisClient = redis.getRedisClient();
      const dateKey = new Date().toISOString().split('T')[0];
      
      // Track daily security events
      await redisClient.hincrby(`${this.metricsPrefix}daily:${dateKey}`, 'security_events', 1);
      await redisClient.hincrby(`${this.metricsPrefix}daily:${dateKey}`, `security_${event}`, 1);
      
      // Track user security events
      if (sessionData.userId) {
        await redisClient.hincrby(`${this.metricsPrefix}user:${sessionData.userId}`, 'security_events', 1);
        await redisClient.hincrby(`${this.metricsPrefix}user:${sessionData.userId}`, `security_${event}`, 1);
      }
      
      // Track IP security events
      if (sessionData.ipAddress) {
        await redisClient.hincrby(`${this.metricsPrefix}ip_security:${sessionData.ipAddress}`, event, 1);
      }
      
    } catch (error) {
      console.error('Failed to track security event:', error.message);
    }
  }

  /**
   * Get session analytics
   */
  async getSessionAnalytics(days = 7) {
    try {
      const redisClient = redis.getRedisClient();
      const analytics = {
        period: `${days} days`,
        timestamp: new Date().toISOString(),
        daily: {},
        summary: {
          totalSessions: 0,
          totalActivity: 0,
          totalTerminations: 0,
          totalSecurityEvents: 0,
          averageSessionDuration: 0,
          uniqueUsers: 0,
          uniqueIPs: 0
        },
        topUserAgents: [],
        topIPs: [],
        securityEvents: {}
      };
      
      // Get daily metrics for the period
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateKey = d.toISOString().split('T')[0];
        const dailyMetrics = await redisClient.hgetall(`${this.metricsPrefix}daily:${dateKey}`);
        
        if (Object.keys(dailyMetrics).length > 0) {
          analytics.daily[dateKey] = {
            sessionsCreated: parseInt(dailyMetrics.sessions_created || '0', 10),
            sessionActivity: parseInt(dailyMetrics.session_activity || '0', 10),
            sessionsTerminated: parseInt(dailyMetrics.sessions_terminated || '0', 10),
            securityEvents: parseInt(dailyMetrics.security_events || '0', 10)
          };
          
          // Aggregate summary
          analytics.summary.totalSessions += analytics.daily[dateKey].sessionsCreated;
          analytics.summary.totalActivity += analytics.daily[dateKey].sessionActivity;
          analytics.summary.totalTerminations += analytics.daily[dateKey].sessionsTerminated;
          analytics.summary.totalSecurityEvents += analytics.daily[dateKey].securityEvents;
        }
      }
      
      // Get top user agents
      const userAgents = await redisClient.hgetall(`${this.metricsPrefix}user_agents`);
      analytics.topUserAgents = Object.entries(userAgents)
        .map(([agent, count]) => ({ agent, count: parseInt(count, 10) }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      // Get top IP addresses
      const ipAddresses = await redisClient.hgetall(`${this.metricsPrefix}ip_addresses`);
      analytics.topIPs = Object.entries(ipAddresses)
        .map(([ip, count]) => ({ ip, count: parseInt(count, 10) }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      // Calculate average session duration
      const durations = await redisClient.lrange(`${this.metricsPrefix}session_lifetimes`, 0, -1);
      if (durations.length > 0) {
        const totalDuration = durations.reduce((sum, duration) => sum + parseInt(duration, 10), 0);
        analytics.summary.averageSessionDuration = Math.round(totalDuration / durations.length);
      }
      
      // Get unique users and IPs
      const userKeys = await redisClient.keys(`${this.metricsPrefix}user:*`);
      const ipKeys = await redisClient.keys(`${this.metricsPrefix}ip_security:*`);
      analytics.summary.uniqueUsers = userKeys.length;
      analytics.summary.uniqueIPs = ipKeys.length;
      
      return analytics;
    } catch (error) {
      console.error('Failed to get session analytics:', error.message);
      return {
        period: `${days} days`,
        timestamp: new Date().toISOString(),
        error: error.message,
        daily: {},
        summary: {
          totalSessions: 0,
          totalActivity: 0,
          totalTerminations: 0,
          totalSecurityEvents: 0,
          averageSessionDuration: 0,
          uniqueUsers: 0,
          uniqueIPs: 0
        },
        topUserAgents: [],
        topIPs: [],
        securityEvents: {}
      };
    }
  }

  /**
   * Get user session analytics
   */
  async getUserSessionAnalytics(userId) {
    try {
      const redisClient = redis.getRedisClient();
      const userMetrics = await redisClient.hgetall(`${this.metricsPrefix}user:${userId}`);
      
      if (Object.keys(userMetrics).length === 0) {
        return null;
      }
      
      return {
        userId,
        timestamp: new Date().toISOString(),
        sessionsCreated: parseInt(userMetrics.sessions_created || '0', 10),
        sessionActivity: parseInt(userMetrics.session_activity || '0', 10),
        sessionsTerminated: parseInt(userMetrics.sessions_terminated || '0', 10),
        securityEvents: parseInt(userMetrics.security_events || '0', 10),
        lastSession: userMetrics.last_session ? new Date(parseInt(userMetrics.last_session, 10)).toISOString() : null,
        lastActivity: userMetrics.last_activity ? new Date(parseInt(userMetrics.last_activity, 10)).toISOString() : null,
        terminationReasons: {
          timeout: parseInt(userMetrics.termination_timeout || '0', 10),
          logout: parseInt(userMetrics.termination_logout || '0', 10),
          hijacking: parseInt(userMetrics.termination_hijacking || '0', 10),
          limit: parseInt(userMetrics.termination_limit || '0', 10)
        },
        securityEvents: {
          hijacking: parseInt(userMetrics.security_hijacking || '0', 10),
          timeout: parseInt(userMetrics.security_timeout || '0', 10),
          limit: parseInt(userMetrics.security_limit || '0', 10)
        }
      };
    } catch (error) {
      console.error('Failed to get user session analytics:', error.message);
      return null;
    }
  }

  /**
   * Get security analytics
   */
  async getSecurityAnalytics(days = 7) {
    try {
      const redisClient = redis.getRedisClient();
      const security = {
        period: `${days} days`,
        timestamp: new Date().toISOString(),
        daily: {},
        summary: {
          totalSecurityEvents: 0,
          hijackingAttempts: 0,
          timeoutEvents: 0,
          limitEnforcements: 0,
          suspiciousIPs: []
        }
      };
      
      // Get daily security metrics
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateKey = d.toISOString().split('T')[0];
        const dailyMetrics = await redisClient.hgetall(`${this.metricsPrefix}daily:${dateKey}`);
        
        if (Object.keys(dailyMetrics).length > 0) {
          security.daily[dateKey] = {
            securityEvents: parseInt(dailyMetrics.security_events || '0', 10),
            hijacking: parseInt(dailyMetrics.security_hijacking || '0', 10),
            timeout: parseInt(dailyMetrics.security_timeout || '0', 10),
            limit: parseInt(dailyMetrics.security_limit || '0', 10)
          };
          
          security.summary.totalSecurityEvents += security.daily[dateKey].securityEvents;
          security.summary.hijackingAttempts += security.daily[dateKey].hijacking;
          security.summary.timeoutEvents += security.daily[dateKey].timeout;
          security.summary.limitEnforcements += security.daily[dateKey].limit;
        }
      }
      
      // Get suspicious IPs
      const ipKeys = await redisClient.keys(`${this.metricsPrefix}ip_security:*`);
      for (const ipKey of ipKeys) {
        const ip = ipKey.replace(`${this.metricsPrefix}ip_security:`, '');
        const ipMetrics = await redisClient.hgetall(ipKey);
        const totalEvents = Object.values(ipMetrics).reduce((sum, count) => sum + parseInt(count, 10), 0);
        
        if (totalEvents > 5) { // Consider IP suspicious if more than 5 security events
          security.summary.suspiciousIPs.push({
            ip,
            totalEvents,
            events: ipMetrics
          });
        }
      }
      
      security.summary.suspiciousIPs.sort((a, b) => b.totalEvents - a.totalEvents);
      
      return security;
    } catch (error) {
      console.error('Failed to get security analytics:', error.message);
      return {
        period: `${days} days`,
        timestamp: new Date().toISOString(),
        error: error.message,
        daily: {},
        summary: {
          totalSecurityEvents: 0,
          hijackingAttempts: 0,
          timeoutEvents: 0,
          limitEnforcements: 0,
          suspiciousIPs: []
        }
      };
    }
  }

  /**
   * Clean up old analytics data
   */
  async cleanupOldAnalytics() {
    try {
      const redisClient = redis.getRedisClient();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);
      
      // Clean up daily metrics older than retention period
      const dailyKeys = await redisClient.keys(`${this.metricsPrefix}daily:*`);
      let cleanedCount = 0;
      
      for (const key of dailyKeys) {
        const dateStr = key.replace(`${this.metricsPrefix}daily:`, '');
        const keyDate = new Date(dateStr);
        
        if (keyDate < cutoffDate) {
          await redisClient.del(key);
          cleanedCount++;
        }
      }
      
      console.log(`Cleaned up ${cleanedCount} old analytics entries`);
      return cleanedCount;
    } catch (error) {
      console.error('Failed to cleanup old analytics:', error.message);
      return 0;
    }
  }

  /**
   * Sanitize user agent string for analytics
   */
  sanitizeUserAgent(userAgent) {
    if (!userAgent) return 'unknown';
    
    // Extract browser and OS information
    const browserMatch = userAgent.match(/(chrome|firefox|safari|edge|opera|ie)\/?\s*(\d+)/i);
    const osMatch = userAgent.match(/(windows|mac|linux|android|ios)\s*[^)]*/i);
    
    const browser = browserMatch ? `${browserMatch[1]}_${browserMatch[2]}` : 'unknown_browser';
    const os = osMatch ? osMatch[1] : 'unknown_os';
    
    return `${browser}_${os}`;
  }
}

// Create singleton instance
const sessionAnalytics = new SessionAnalytics();

module.exports = sessionAnalytics; 