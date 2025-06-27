const { cacheClient } = require('./client');

class CacheAnalytics {
  constructor() {
    this.metrics = {
      requests: 0,
      hits: 0,
      misses: 0,
      errors: 0,
      avgResponseTime: 0,
      totalResponseTime: 0,
      startTime: Date.now()
    };

    this.performanceThresholds = {
      hitRate: 80, // 80% minimum hit rate
      avgResponseTime: 50, // 50ms maximum average response time
      errorRate: 5 // 5% maximum error rate
    };

    this.alerts = [];
    this.enableMonitoring = process.env.CACHE_MONITORING_ENABLED !== 'false';
  }

  // Track cache request
  trackRequest(type, startTime, success = true, error = null) {
    if (!this.enableMonitoring) return;

    const responseTime = Date.now() - startTime;
    
    this.metrics.requests++;
    this.metrics.totalResponseTime += responseTime;
    this.metrics.avgResponseTime = this.metrics.totalResponseTime / this.metrics.requests;

    if (type === 'hit') {
      this.metrics.hits++;
    } else if (type === 'miss') {
      this.metrics.misses++;
    }

    if (!success) {
      this.metrics.errors++;
    }

    // Check for performance issues
    this.checkPerformanceThresholds();
  }

  // Get cache performance metrics
  getMetrics() {
    const hitRate = this.metrics.hits + this.metrics.misses > 0 
      ? (this.metrics.hits / (this.metrics.hits + this.metrics.misses)) * 100 
      : 0;

    const errorRate = this.metrics.requests > 0 
      ? (this.metrics.errors / this.metrics.requests) * 100 
      : 0;

    const uptime = Date.now() - this.metrics.startTime;

    return {
      ...this.metrics,
      hitRate: Math.round(hitRate * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
      uptime: Math.round(uptime / 1000), // in seconds
      isHealthy: this.isHealthy(),
      alerts: this.alerts.slice(-10) // Last 10 alerts
    };
  }

  // Check performance thresholds and generate alerts
  checkPerformanceThresholds() {
    const hitRate = this.metrics.hits + this.metrics.misses > 0 
      ? (this.metrics.hits / (this.metrics.hits + this.metrics.misses)) * 100 
      : 0;

    const errorRate = this.metrics.requests > 0 
      ? (this.metrics.errors / this.metrics.requests) * 100 
      : 0;

    // Check hit rate
    if (hitRate < this.performanceThresholds.hitRate) {
      this.addAlert('warning', `Cache hit rate is low: ${Math.round(hitRate)}%`);
    }

    // Check average response time
    if (this.metrics.avgResponseTime > this.performanceThresholds.avgResponseTime) {
      this.addAlert('warning', `Cache response time is high: ${Math.round(this.metrics.avgResponseTime)}ms`);
    }

    // Check error rate
    if (errorRate > this.performanceThresholds.errorRate) {
      this.addAlert('error', `Cache error rate is high: ${Math.round(errorRate)}%`);
    }
  }

  // Add alert
  addAlert(level, message) {
    const alert = {
      level,
      message,
      timestamp: new Date().toISOString(),
      metrics: this.getMetrics()
    };

    this.alerts.push(alert);

    // Log alert
    console.log(`[CACHE ${level.toUpperCase()}] ${message}`);

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
  }

  // Check if cache is healthy
  isHealthy() {
    const hitRate = this.metrics.hits + this.metrics.misses > 0 
      ? (this.metrics.hits / (this.metrics.hits + this.metrics.misses)) * 100 
      : 0;

    const errorRate = this.metrics.requests > 0 
      ? (this.metrics.errors / this.metrics.requests) * 100 
      : 0;

    return (
      hitRate >= this.performanceThresholds.hitRate &&
      this.metrics.avgResponseTime <= this.performanceThresholds.avgResponseTime &&
      errorRate <= this.performanceThresholds.errorRate &&
      cacheClient.isConnected
    );
  }

  // Get detailed performance report
  async getPerformanceReport() {
    const metrics = this.getMetrics();
    const cacheStats = cacheClient.getStats();
    const cacheInfo = await cacheClient.getInfo();

    return {
      summary: {
        isHealthy: this.isHealthy(),
        hitRate: metrics.hitRate,
        avgResponseTime: Math.round(metrics.avgResponseTime),
        errorRate: metrics.errorRate,
        uptime: metrics.uptime
      },
      metrics,
      cacheStats,
      cacheInfo: cacheInfo ? 'Available' : 'Not available',
      alerts: this.alerts,
      recommendations: this.getRecommendations()
    };
  }

  // Get performance recommendations
  getRecommendations() {
    const recommendations = [];
    const hitRate = this.metrics.hits + this.metrics.misses > 0 
      ? (this.metrics.hits / (this.metrics.hits + this.metrics.misses)) * 100 
      : 0;

    const errorRate = this.metrics.requests > 0 
      ? (this.metrics.errors / this.metrics.requests) * 100 
      : 0;

    if (hitRate < this.performanceThresholds.hitRate) {
      recommendations.push({
        type: 'hit_rate',
        priority: 'high',
        message: 'Consider increasing cache TTL or implementing cache warming',
        action: 'Review cache expiration policies and frequently accessed data'
      });
    }

    if (this.metrics.avgResponseTime > this.performanceThresholds.avgResponseTime) {
      recommendations.push({
        type: 'response_time',
        priority: 'medium',
        message: 'Cache response time is above threshold',
        action: 'Check Redis connection and consider optimizing cache operations'
      });
    }

    if (errorRate > this.performanceThresholds.errorRate) {
      recommendations.push({
        type: 'error_rate',
        priority: 'high',
        message: 'Cache error rate is too high',
        action: 'Investigate Redis connection issues and error handling'
      });
    }

    if (!cacheClient.isConnected) {
      recommendations.push({
        type: 'connection',
        priority: 'critical',
        message: 'Cache client is not connected to Redis',
        action: 'Check Redis server status and connection configuration'
      });
    }

    return recommendations;
  }

  // Reset metrics
  resetMetrics() {
    this.metrics = {
      requests: 0,
      hits: 0,
      misses: 0,
      errors: 0,
      avgResponseTime: 0,
      totalResponseTime: 0,
      startTime: Date.now()
    };
    this.alerts = [];
  }

  // Set performance thresholds
  setPerformanceThresholds(thresholds) {
    this.performanceThresholds = {
      ...this.performanceThresholds,
      ...thresholds
    };
  }

  // Enable/disable monitoring
  setMonitoringEnabled(enabled) {
    this.enableMonitoring = enabled;
  }

  // Get cache health status
  async getHealthStatus() {
    const isHealthy = this.isHealthy();
    const cacheConnected = cacheClient.isConnected;
    const pingResult = await cacheClient.ping();

    return {
      status: isHealthy && cacheConnected && pingResult ? 'healthy' : 'unhealthy',
      cache: {
        connected: cacheConnected,
        ping: pingResult,
        stats: cacheClient.getStats()
      },
      performance: {
        hitRate: this.getMetrics().hitRate,
        avgResponseTime: Math.round(this.metrics.avgResponseTime),
        errorRate: this.getMetrics().errorRate
      },
      timestamp: new Date().toISOString()
    };
  }

  // Export metrics for external monitoring
  exportMetrics() {
    return {
      timestamp: new Date().toISOString(),
      metrics: this.getMetrics(),
      health: this.isHealthy(),
      connection: cacheClient.isConnected
    };
  }
}

// Create singleton instance
const cacheAnalytics = new CacheAnalytics();

module.exports = {
  CacheAnalytics,
  cacheAnalytics
}; 