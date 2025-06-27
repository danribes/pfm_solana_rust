/**
 * Data Aggregation Service
 * Coordinates streaming, batch, and warehouse processing for comprehensive analytics
 */

const streamingAnalytics = require('../analytics/streaming');
const batchAnalytics = require('../analytics/batch');
const dataWarehouse = require('../analytics/warehouse');
const AnalyticsWorker = require('../workers/analytics');
const redis = require('../redis');
const { User, Community, Member, VotingQuestion, Vote, Analytics } = require('../models');

class AggregationService {
  constructor() {
    this.worker = null;
    this.isInitialized = false;
    this.aggregationStats = {
      totalAggregations: 0,
      successfulAggregations: 0,
      failedAggregations: 0,
      lastAggregation: null
    };
  }

  /**
   * Initialize aggregation service
   */
  async initialize() {
    try {
      // Initialize analytics worker
      this.worker = new AnalyticsWorker();
      await this.worker.initialize();
      
      // Set up event listeners
      this.setupEventListeners();
      
      this.isInitialized = true;
      console.log('Aggregation service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize aggregation service:', error);
      throw error;
    }
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Listen for streaming analytics events
    streamingAnalytics.on('eventProcessed', (data) => {
      this.handleStreamingEvent(data);
    });

    streamingAnalytics.on('processingError', (error) => {
      this.handleProcessingError('streaming', error);
    });

    // Listen for batch analytics events
    batchAnalytics.on('jobCompleted', (data) => {
      this.handleBatchEvent(data);
    });

    batchAnalytics.on('jobError', (error) => {
      this.handleProcessingError('batch', error);
    });
  }

  /**
   * Handle streaming analytics events
   */
  async handleStreamingEvent(data) {
    try {
      // Update real-time metrics
      await this.updateRealTimeMetrics(data);
      
      // Trigger immediate aggregation if needed
      if (this.shouldTriggerImmediateAggregation(data)) {
        await this.triggerImmediateAggregation(data);
      }
      
      this.aggregationStats.successfulAggregations++;
    } catch (error) {
      this.handleProcessingError('streaming', error);
    }
  }

  /**
   * Handle batch analytics events
   */
  async handleBatchEvent(data) {
    try {
      // Update batch processing metrics
      await this.updateBatchMetrics(data);
      
      // Trigger warehouse ETL if needed
      if (data.period === 'daily' || data.period === 'weekly' || data.period === 'monthly') {
        await this.triggerWarehouseETL(data);
      }
      
      this.aggregationStats.successfulAggregations++;
    } catch (error) {
      this.handleProcessingError('batch', error);
    }
  }

  /**
   * Handle processing errors
   */
  handleProcessingError(type, error) {
    console.error(`${type} processing error:`, error);
    this.aggregationStats.failedAggregations++;
    
    // Log error for monitoring
    this.logError(type, error);
  }

  /**
   * Update real-time metrics
   */
  async updateRealTimeMetrics(data) {
    try {
      if (!redis.getRedisClient()) return;

      const timestamp = new Date().toISOString();
      const dateKey = timestamp.split('T')[0];
      
      // Update event counters
      await redis.getRedisClient().incr(`analytics:events:${data.event.type}:${dateKey}`);
      await redis.getRedisClient().expire(`analytics:events:${data.event.type}:${dateKey}`, 86400);
      
      // Update processing time metrics
      await redis.getRedisClient().zadd('analytics:processing_times', data.processingTime, timestamp);
      await redis.getRedisClient().expire('analytics:processing_times', 3600); // 1 hour
      
      // Update activity metrics
      if (data.event.data.user_id) {
        await redis.getRedisClient().zadd('analytics:user_activity', timestamp, data.event.data.user_id);
        await redis.getRedisClient().expire('analytics:user_activity', 86400);
      }
      
    } catch (error) {
      console.error('Failed to update real-time metrics:', error);
    }
  }

  /**
   * Update batch metrics
   */
  async updateBatchMetrics(data) {
    try {
      if (!redis.getRedisClient()) return;

      const timestamp = new Date().toISOString();
      
      // Store batch processing results
      await redis.getRedisClient().setex(
        `analytics:batch:${data.period}:${timestamp}`,
        604800, // 7 days
        JSON.stringify(data)
      );
      
      // Update batch processing statistics
      await redis.getRedisClient().incr(`analytics:batch:${data.period}:count`);
      await redis.getRedisClient().expire(`analytics:batch:${data.period}:count`, 2592000); // 30 days
      
    } catch (error) {
      console.error('Failed to update batch metrics:', error);
    }
  }

  /**
   * Check if immediate aggregation should be triggered
   */
  shouldTriggerImmediateAggregation(data) {
    // Trigger for high-priority events
    const highPriorityEvents = ['vote_cast', 'question_created', 'member_approved'];
    return highPriorityEvents.includes(data.event.type);
  }

  /**
   * Trigger immediate aggregation
   */
  async triggerImmediateAggregation(data) {
    try {
      // Send task to worker for immediate processing
      this.worker.sendTask('streaming', {
        action: 'processEvent',
        event: data.event
      });
      
      console.log('Immediate aggregation triggered for event:', data.event.type);
    } catch (error) {
      console.error('Failed to trigger immediate aggregation:', error);
    }
  }

  /**
   * Trigger warehouse ETL
   */
  async triggerWarehouseETL(data) {
    try {
      // Send ETL task to warehouse worker
      this.worker.sendTask('warehouse', {
        action: 'runETL',
        date: new Date()
      });
      
      console.log('Warehouse ETL triggered for period:', data.period);
    } catch (error) {
      console.error('Failed to trigger warehouse ETL:', error);
    }
  }

  /**
   * Log error for monitoring
   */
  async logError(type, error) {
    try {
      // Store error in database for monitoring
      await Analytics.create({
        event_type: 'error',
        event_data: JSON.stringify({
          type,
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        }),
        created_at: new Date()
      });
      
      // Also log to Redis for real-time monitoring
      if (redis.getRedisClient()) {
        await redis.getRedisClient().lpush('analytics:errors', JSON.stringify({
          type,
          error: error.message,
          timestamp: new Date().toISOString()
        }));
        await redis.getRedisClient().ltrim('analytics:errors', 0, 99); // Keep last 100 errors
      }
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }

  /**
   * Get comprehensive analytics data
   */
  async getComprehensiveAnalytics(options = {}) {
    try {
      const {
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        endDate = new Date(),
        includeRealTime = true,
        includeBatch = true,
        includeWarehouse = true
      } = options;

      const analytics = {};

      // Get real-time analytics
      if (includeRealTime) {
        analytics.realTime = await this.getRealTimeAnalytics();
      }

      // Get batch analytics
      if (includeBatch) {
        analytics.batch = await this.getBatchAnalytics(startDate, endDate);
      }

      // Get warehouse analytics
      if (includeWarehouse) {
        analytics.warehouse = await this.getWarehouseAnalytics(startDate, endDate);
      }

      // Get aggregation statistics
      analytics.stats = this.getAggregationStats();

      return analytics;
    } catch (error) {
      throw new Error(`Failed to get comprehensive analytics: ${error.message}`);
    }
  }

  /**
   * Get real-time analytics
   */
  async getRealTimeAnalytics() {
    try {
      const streamingMetrics = await streamingAnalytics.getRealTimeMetrics();
      const processingStats = streamingAnalytics.getProcessingStats();
      
      // Get Redis-based real-time metrics
      let redisMetrics = {};
      if (redis.getRedisClient()) {
        const today = new Date().toISOString().split('T')[0];
        const eventTypes = ['user_joined', 'vote_cast', 'question_created', 'member_approved'];
        
        for (const eventType of eventTypes) {
          const count = await redis.getRedisClient().get(`analytics:events:${eventType}:${today}`) || 0;
          redisMetrics[`${eventType}_today`] = parseInt(count);
        }
        
        // Get recent errors
        const recentErrors = await redis.getRedisClient().lrange('analytics:errors', 0, 9);
        redisMetrics.recentErrors = recentErrors.map(error => JSON.parse(error));
      }
      
      return {
        streaming: streamingMetrics,
        processing: processingStats,
        redis: redisMetrics
      };
    } catch (error) {
      throw new Error(`Failed to get real-time analytics: ${error.message}`);
    }
  }

  /**
   * Get batch analytics
   */
  async getBatchAnalytics(startDate, endDate) {
    try {
      const batchStats = batchAnalytics.getProcessingStats();
      
      // Get batch processing results from Redis
      let batchResults = {};
      if (redis.getRedisClient()) {
        const periods = ['daily', 'weekly', 'monthly'];
        
        for (const period of periods) {
          const keys = await redis.getRedisClient().keys(`analytics:batch:${period}:*`);
          const results = [];
          
          for (const key of keys.slice(-10)) { // Last 10 results
            const data = await redis.getRedisClient().get(key);
            if (data) {
              results.push(JSON.parse(data));
            }
          }
          
          batchResults[period] = results;
        }
      }
      
      return {
        stats: batchStats,
        results: batchResults
      };
    } catch (error) {
      throw new Error(`Failed to get batch analytics: ${error.message}`);
    }
  }

  /**
   * Get warehouse analytics
   */
  async getWarehouseAnalytics(startDate, endDate) {
    try {
      const warehouseStats = dataWarehouse.getProcessingStats();
      
      // Query warehouse data
      const userAnalytics = await dataWarehouse.queryWarehouse(`
        SELECT * FROM user_analytics_fact 
        WHERE date_key >= ? AND date_key <= ?
        ORDER BY date_key DESC
        LIMIT 100
      `, [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]);
      
      const communityAnalytics = await dataWarehouse.queryWarehouse(`
        SELECT * FROM community_analytics_fact 
        WHERE date_key >= ? AND date_key <= ?
        ORDER BY date_key DESC
        LIMIT 100
      `, [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]);
      
      return {
        stats: warehouseStats,
        userAnalytics,
        communityAnalytics
      };
    } catch (error) {
      throw new Error(`Failed to get warehouse analytics: ${error.message}`);
    }
  }

  /**
   * Get aggregation statistics
   */
  getAggregationStats() {
    return {
      ...this.aggregationStats,
      isInitialized: this.isInitialized,
      workerStats: this.worker ? this.worker.getWorkerStats() : null
    };
  }

  /**
   * Process analytics event
   */
  async processEvent(event) {
    try {
      if (!this.isInitialized) {
        throw new Error('Aggregation service not initialized');
      }

      this.aggregationStats.totalAggregations++;
      this.aggregationStats.lastAggregation = new Date().toISOString();

      // Process through streaming analytics
      await streamingAnalytics.processEvent(event);
      
      return true;
    } catch (error) {
      this.handleProcessingError('aggregation', error);
      throw error;
    }
  }

  /**
   * Run manual aggregation
   */
  async runManualAggregation(type, options = {}) {
    try {
      switch (type) {
        case 'daily':
          await batchAnalytics.processDailyAnalytics();
          break;
        case 'weekly':
          await batchAnalytics.processWeeklyAnalytics();
          break;
        case 'monthly':
          await batchAnalytics.processMonthlyAnalytics();
          break;
        case 'etl':
          await dataWarehouse.runETL(options.date);
          break;
        default:
          throw new Error(`Unknown aggregation type: ${type}`);
      }
      
      console.log(`Manual aggregation completed: ${type}`);
    } catch (error) {
      throw new Error(`Manual aggregation failed: ${error.message}`);
    }
  }

  /**
   * Shutdown aggregation service
   */
  async shutdown() {
    try {
      if (this.worker) {
        await this.worker.stop();
      }
      
      this.isInitialized = false;
      console.log('Aggregation service shutdown successfully');
    } catch (error) {
      console.error('Failed to shutdown aggregation service:', error);
      throw error;
    }
  }
}

// Create singleton instance
const aggregationService = new AggregationService();

module.exports = aggregationService; 