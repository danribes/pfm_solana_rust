const sessionStore = require('./store');
const sessionAnalytics = require('./analytics');
const auditService = require('../services/audit');
const redis = require('../redis');

/**
 * Session Health Check Service
 * Provides comprehensive health monitoring for session management system
 */
class SessionHealthCheck {
  constructor() {
    this.healthCheckInterval = parseInt(process.env.SESSION_HEALTH_CHECK_INTERVAL || '300000', 10); // 5 minutes
    this.lastHealthCheck = null;
    this.healthStatus = {
      status: 'unknown',
      timestamp: null,
      checks: {},
      metrics: {},
      alerts: []
    };
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck() {
    const startTime = Date.now();
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {},
      metrics: {},
      alerts: [],
      duration: 0
    };

    try {
      // Check Redis connection
      health.checks.redis = await this.checkRedisConnection();
      
      // Check session store
      health.checks.sessionStore = await this.checkSessionStore();
      
      // Check session analytics
      health.checks.analytics = await this.checkAnalytics();
      
      // Check security status
      health.checks.security = await this.checkSecurityStatus();
      
      // Check performance metrics
      health.metrics = await this.getPerformanceMetrics();
      
      // Determine overall status
      const failedChecks = Object.values(health.checks).filter(check => !check.status);
      if (failedChecks.length > 0) {
        health.status = 'unhealthy';
        health.alerts.push(`Health check failed: ${failedChecks.length} checks failed`);
      } else if (health.alerts.length > 0) {
        health.status = 'warning';
      }

      health.duration = Date.now() - startTime;
      this.healthStatus = health;
      this.lastHealthCheck = new Date();

      // Log health check result
      await auditService.logAuditEvent('session_health_check', {
        level: health.status === 'healthy' ? 'INFO' : 'WARNING',
        category: 'HEALTH',
        details: {
          status: health.status,
          duration: health.duration,
          failedChecks: failedChecks.length,
          alerts: health.alerts.length
        }
      });

      return health;
    } catch (error) {
      console.error('Health check failed:', error.message);
      
      const errorHealth = {
        status: 'error',
        timestamp: new Date().toISOString(),
        checks: {},
        metrics: {},
        alerts: [`Health check error: ${error.message}`],
        duration: Date.now() - startTime,
        error: error.message
      };

      this.healthStatus = errorHealth;
      this.lastHealthCheck = new Date();

      await auditService.logAuditEvent('session_health_check_error', {
        level: 'ERROR',
        category: 'HEALTH',
        details: { error: error.message }
      });

      return errorHealth;
    }
  }

  /**
   * Check Redis connection health
   */
  async checkRedisConnection() {
    try {
      const redisClient = redis.getRedisClient();
      const startTime = Date.now();
      
      // Test basic operations
      await redisClient.ping();
      await redisClient.set('health_check_test', 'ok', 'EX', 60);
      const testValue = await redisClient.get('health_check_test');
      await redisClient.del('health_check_test');
      
      const duration = Date.now() - startTime;
      
      return {
        status: true,
        message: 'Redis connection healthy',
        duration,
        details: {
          ping: 'ok',
          read: 'ok',
          write: 'ok',
          delete: 'ok'
        }
      };
    } catch (error) {
      return {
        status: false,
        message: `Redis connection failed: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * Check session store health
   */
  async checkSessionStore() {
    try {
      const startTime = Date.now();
      
      // Get session statistics
      const stats = await sessionStore.getSessionStats();
      
      // Test session operations
      const testSessionId = 'health_check_test_session';
      const testData = { test: true, timestamp: Date.now() };
      
      await sessionStore.createSession(testSessionId, testData);
      const retrievedData = await sessionStore.getSession(testSessionId);
      await sessionStore.deleteSession(testSessionId);
      
      const duration = Date.now() - startTime;
      
      return {
        status: true,
        message: 'Session store healthy',
        duration,
        details: {
          totalSessions: stats.totalSessions,
          activeUsers: stats.activeUsers,
          create: 'ok',
          read: 'ok',
          delete: 'ok'
        }
      };
    } catch (error) {
      return {
        status: false,
        message: `Session store check failed: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * Check analytics system health
   */
  async checkAnalytics() {
    try {
      const startTime = Date.now();
      
      // Test analytics operations
      const analytics = await sessionAnalytics.getSessionAnalytics(1);
      const security = await sessionAnalytics.getSecurityAnalytics(1);
      
      const duration = Date.now() - startTime;
      
      return {
        status: true,
        message: 'Analytics system healthy',
        duration,
        details: {
          sessionAnalytics: 'ok',
          securityAnalytics: 'ok',
          dataPoints: analytics.summary.totalSessions + security.summary.totalSecurityEvents
        }
      };
    } catch (error) {
      return {
        status: false,
        message: `Analytics check failed: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * Check security status
   */
  async checkSecurityStatus() {
    try {
      const startTime = Date.now();
      
      // Get recent security events
      const securityEvents = await auditService.getSecurityEvents(10);
      const recentSessions = await sessionStore.getSessionStats();
      
      // Check for suspicious activity
      const suspiciousEvents = securityEvents.filter(event => 
        event.event.includes('hijacking') || 
        event.event.includes('timeout') || 
        event.event.includes('limit')
      );
      
      const duration = Date.now() - startTime;
      
      let status = true;
      let message = 'Security status normal';
      let alerts = [];
      
      // Alert if too many security events
      if (suspiciousEvents.length > 5) {
        status = false;
        message = 'High number of security events detected';
        alerts.push(`High security events: ${suspiciousEvents.length} in last 10 events`);
      }
      
      // Alert if too many active sessions
      if (recentSessions.activeUsers > 1000) {
        alerts.push(`High active users: ${recentSessions.activeUsers}`);
      }
      
      return {
        status,
        message,
        duration,
        details: {
          securityEvents: securityEvents.length,
          suspiciousEvents: suspiciousEvents.length,
          activeUsers: recentSessions.activeUsers,
          alerts
        }
      };
    } catch (error) {
      return {
        status: false,
        message: `Security check failed: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics() {
    try {
      const redisClient = redis.getRedisClient();
      
      // Get Redis info
      const redisInfo = await redisClient.info();
      
      // Parse Redis metrics
      const metrics = {
        redis: {
          connectedClients: 0,
          usedMemory: 0,
          totalCommands: 0,
          keyspaceHits: 0,
          keyspaceMisses: 0
        },
        sessions: {
          totalSessions: 0,
          activeUsers: 0,
          averageSessionDuration: 0
        },
        performance: {
          averageResponseTime: 0,
          requestsPerSecond: 0
        }
      };
      
      // Parse Redis info
      const lines = redisInfo.split('\n');
      for (const line of lines) {
        if (line.startsWith('connected_clients:')) {
          metrics.redis.connectedClients = parseInt(line.split(':')[1], 10);
        } else if (line.startsWith('used_memory:')) {
          metrics.redis.usedMemory = parseInt(line.split(':')[1], 10);
        } else if (line.startsWith('total_commands_processed:')) {
          metrics.redis.totalCommands = parseInt(line.split(':')[1], 10);
        } else if (line.startsWith('keyspace_hits:')) {
          metrics.redis.keyspaceHits = parseInt(line.split(':')[1], 10);
        } else if (line.startsWith('keyspace_misses:')) {
          metrics.redis.keyspaceMisses = parseInt(line.split(':')[1], 10);
        }
      }
      
      // Get session metrics
      const sessionStats = await sessionStore.getSessionStats();
      const sessionAnalyticsData = await sessionAnalytics.getSessionAnalytics(1);
      
      metrics.sessions.totalSessions = sessionStats.totalSessions;
      metrics.sessions.activeUsers = sessionStats.activeUsers;
      metrics.sessions.averageSessionDuration = sessionAnalyticsData.summary.averageSessionDuration;
      
      // Calculate hit rate
      const totalRequests = metrics.redis.keyspaceHits + metrics.redis.keyspaceMisses;
      metrics.redis.hitRate = totalRequests > 0 ? (metrics.redis.keyspaceHits / totalRequests * 100).toFixed(2) : 0;
      
      return metrics;
    } catch (error) {
      console.error('Failed to get performance metrics:', error.message);
      return {
        redis: {},
        sessions: {},
        performance: {},
        error: error.message
      };
    }
  }

  /**
   * Get current health status
   */
  getCurrentHealth() {
    return this.healthStatus;
  }

  /**
   * Check if system is healthy
   */
  isHealthy() {
    return this.healthStatus.status === 'healthy';
  }

  /**
   * Get health check summary
   */
  getHealthSummary() {
    const health = this.healthStatus;
    
    return {
      status: health.status,
      timestamp: health.timestamp,
      lastCheck: this.lastHealthCheck,
      checks: Object.keys(health.checks).length,
      failedChecks: Object.values(health.checks).filter(check => !check.status).length,
      alerts: health.alerts.length,
      metrics: {
        totalSessions: health.metrics.sessions?.totalSessions || 0,
        activeUsers: health.metrics.sessions?.activeUsers || 0,
        redisConnectedClients: health.metrics.redis?.connectedClients || 0
      }
    };
  }

  /**
   * Start periodic health checks
   */
  startPeriodicHealthChecks() {
    if (this.healthCheckInterval) {
      setInterval(async () => {
        await this.performHealthCheck();
      }, this.healthCheckInterval);
      
      console.log(`Started periodic health checks every ${this.healthCheckInterval}ms`);
    }
  }

  /**
   * Stop periodic health checks
   */
  stopPeriodicHealthChecks() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      console.log('Stopped periodic health checks');
    }
  }

  /**
   * Get detailed health report
   */
  async getDetailedHealthReport() {
    const health = await this.performHealthCheck();
    
    return {
      ...health,
      recommendations: this.generateRecommendations(health),
      trends: await this.getHealthTrends()
    };
  }

  /**
   * Generate health recommendations
   */
  generateRecommendations(health) {
    const recommendations = [];
    
    if (health.status !== 'healthy') {
      recommendations.push('Investigate failed health checks immediately');
    }
    
    if (health.metrics.redis?.hitRate < 80) {
      recommendations.push('Consider optimizing Redis cache hit rate');
    }
    
    if (health.metrics.sessions?.activeUsers > 1000) {
      recommendations.push('Monitor session load and consider scaling');
    }
    
    if (health.alerts.length > 0) {
      recommendations.push('Review and address security alerts');
    }
    
    return recommendations;
  }

  /**
   * Get health trends (placeholder for future implementation)
   */
  async getHealthTrends() {
    // This would typically query historical health data
    return {
      status: 'No historical data available',
      trend: 'stable'
    };
  }
}

// Create singleton instance
const sessionHealthCheck = new SessionHealthCheck();

module.exports = sessionHealthCheck; 