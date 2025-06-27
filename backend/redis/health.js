const redisConnection = require('./connection');

class RedisHealthCheck {
  constructor() {
    this.lastHealthCheck = null;
    this.healthCheckInterval = null;
    this.healthStatus = {
      isHealthy: false,
      lastCheck: null,
      responseTime: null,
      errorCount: 0,
      uptime: null,
      memoryUsage: null,
      connectedClients: null,
    };
  }

  /**
   * Perform a comprehensive health check
   */
  async performHealthCheck() {
    const startTime = Date.now();
    
    try {
      // Check basic connectivity
      const isConnected = redisConnection.isRedisConnected();
      if (!isConnected) {
        throw new Error('Redis not connected');
      }

      // Ping Redis
      const pingResult = await redisConnection.ping();
      if (!pingResult) {
        throw new Error('Redis ping failed');
      }

      // Get Redis info
      const info = await redisConnection.getInfo();
      const infoLines = info.split('\r\n');
      const infoMap = {};
      
      infoLines.forEach(line => {
        if (line.includes(':')) {
          const [key, value] = line.split(':');
          infoMap[key] = value;
        }
      });

      // Calculate response time
      const responseTime = Date.now() - startTime;

      // Update health status
      this.healthStatus = {
        isHealthy: true,
        lastCheck: new Date(),
        responseTime,
        errorCount: 0,
        uptime: infoMap.uptime_in_seconds ? parseInt(infoMap.uptime_in_seconds) : null,
        memoryUsage: infoMap.used_memory_human || null,
        connectedClients: infoMap.connected_clients ? parseInt(infoMap.connected_clients) : null,
        redisVersion: infoMap.redis_version || null,
        totalCommandsProcessed: infoMap.total_commands_processed ? parseInt(infoMap.total_commands_processed) : null,
        keyspaceHits: infoMap.keyspace_hits ? parseInt(infoMap.keyspace_hits) : null,
        keyspaceMisses: infoMap.keyspace_misses ? parseInt(infoMap.keyspace_misses) : null,
      };

      if (process.env.NODE_ENV !== 'test') console.log('Redis health check passed:', {
        responseTime: `${responseTime}ms`,
        uptime: `${this.healthStatus.uptime}s`,
        memoryUsage: this.healthStatus.memoryUsage,
        connectedClients: this.healthStatus.connectedClients,
      });

      return this.healthStatus;

    } catch (error) {
      this.healthStatus.errorCount++;
      this.healthStatus.isHealthy = false;
      this.healthStatus.lastCheck = new Date();
      this.healthStatus.responseTime = Date.now() - startTime;

      if (process.env.NODE_ENV !== 'test') console.error('Redis health check failed:', error.message);
      
      return this.healthStatus;
    }
  }

  /**
   * Start periodic health checks
   */
  startHealthChecks(intervalMs = 30000) { // Default: 30 seconds
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, intervalMs);

    if (process.env.NODE_ENV !== 'test') console.log(`Redis health checks started with ${intervalMs}ms interval`);
  }

  /**
   * Stop periodic health checks
   */
  stopHealthChecks() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
      if (process.env.NODE_ENV !== 'test') console.log('Redis health checks stopped');
    }
  }

  /**
   * Get current health status
   */
  getHealthStatus() {
    return this.healthStatus;
  }

  /**
   * Check if Redis is healthy
   */
  isHealthy() {
    return this.healthStatus.isHealthy;
  }

  /**
   * Get health check metrics
   */
  getMetrics() {
    return {
      isHealthy: this.healthStatus.isHealthy,
      responseTime: this.healthStatus.responseTime,
      uptime: this.healthStatus.uptime,
      memoryUsage: this.healthStatus.memoryUsage,
      connectedClients: this.healthStatus.connectedClients,
      errorCount: this.healthStatus.errorCount,
      lastCheck: this.healthStatus.lastCheck,
    };
  }

  /**
   * Reset error count
   */
  resetErrorCount() {
    this.healthStatus.errorCount = 0;
  }

  /**
   * Get detailed health report
   */
  async getDetailedReport() {
    const healthStatus = await this.performHealthCheck();
    
    return {
      ...healthStatus,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      redisConfig: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || '6379',
        db: process.env.REDIS_DB || '0',
      },
    };
  }
}

// Create singleton instance
const redisHealthCheck = new RedisHealthCheck();

module.exports = redisHealthCheck; 