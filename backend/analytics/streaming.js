/**
 * Real-time Data Processing for Analytics
 * Handles streaming data processing for live analytics and event-driven aggregation
 */

const EventEmitter = require('events');
const { User, Community, Member, VotingQuestion, Vote, Analytics } = require('../models');
const redis = require('../redis');

class StreamingAnalytics extends EventEmitter {
  constructor() {
    super();
    this.processingQueue = [];
    this.isProcessing = false;
    this.metrics = {
      eventsProcessed: 0,
      processingTime: 0,
      errors: 0
    };
  }

  /**
   * Process real-time events
   */
  async processEvent(event) {
    try {
      const startTime = Date.now();
      
      // Validate event data
      if (!this.validateEvent(event)) {
        throw new Error('Invalid event data');
      }

      // Add to processing queue
      this.processingQueue.push(event);
      
      // Process queue if not already processing
      if (!this.isProcessing) {
        await this.processQueue();
      }

      const processingTime = Date.now() - startTime;
      this.metrics.eventsProcessed++;
      this.metrics.processingTime += processingTime;

      // Emit processed event
      this.emit('eventProcessed', {
        event,
        processingTime,
        timestamp: new Date().toISOString()
      });

      return true;
    } catch (error) {
      this.metrics.errors++;
      this.emit('processingError', { error: error.message, event });
      throw error;
    }
  }

  /**
   * Validate event data
   */
  validateEvent(event) {
    const requiredFields = ['type', 'data', 'timestamp'];
    return requiredFields.every(field => event.hasOwnProperty(field));
  }

  /**
   * Process the event queue
   */
  async processQueue() {
    if (this.isProcessing || this.processingQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.processingQueue.length > 0) {
        const event = this.processingQueue.shift();
        await this.processEventByType(event);
      }
    } catch (error) {
      this.emit('queueProcessingError', { error: error.message });
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process event based on type
   */
  async processEventByType(event) {
    switch (event.type) {
      case 'user_joined':
        await this.processUserJoined(event.data);
        break;
      case 'vote_cast':
        await this.processVoteCast(event.data);
        break;
      case 'question_created':
        await this.processQuestionCreated(event.data);
        break;
      case 'member_approved':
        await this.processMemberApproved(event.data);
        break;
      default:
        console.warn(`Unknown event type: ${event.type}`);
    }
  }

  /**
   * Process user joined event
   */
  async processUserJoined(data) {
    try {
      // Update user analytics
      const analytics = await Analytics.findOne({
        where: { user_id: data.user_id }
      });

      if (analytics) {
        await analytics.update({
          last_activity: new Date(),
          activity_count: analytics.activity_count + 1
        });
      } else {
        await Analytics.create({
          user_id: data.user_id,
          event_type: 'user_joined',
          event_count: 1,
          last_activity: new Date()
        });
      }

      // Update real-time metrics in Redis
      if (redis.getRedisClient()) {
        await redis.getRedisClient().incr('analytics:users:joined:today');
        await redis.getRedisClient().expire('analytics:users:joined:today', 86400); // 24 hours
      }

      this.emit('userJoinedProcessed', data);
    } catch (error) {
      throw new Error(`Failed to process user joined event: ${error.message}`);
    }
  }

  /**
   * Process vote cast event
   */
  async processVoteCast(data) {
    try {
      // Update voting analytics
      const analytics = await Analytics.findOne({
        where: { question_id: data.question_id }
      });

      if (analytics) {
        await analytics.update({
          event_count: analytics.event_count + 1,
          last_activity: new Date()
        });
      } else {
        await Analytics.create({
          question_id: data.question_id,
          event_type: 'vote_cast',
          event_count: 1,
          last_activity: new Date()
        });
      }

      // Update real-time voting metrics
      if (redis.getRedisClient()) {
        const key = `analytics:voting:${data.question_id}`;
        await redis.getRedisClient().incr(key);
        await redis.getRedisClient().expire(key, 3600); // 1 hour
      }

      this.emit('voteCastProcessed', data);
    } catch (error) {
      throw new Error(`Failed to process vote cast event: ${error.message}`);
    }
  }

  /**
   * Process question created event
   */
  async processQuestionCreated(data) {
    try {
      // Update community analytics
      const analytics = await Analytics.findOne({
        where: { community_id: data.community_id }
      });

      if (analytics) {
        await analytics.update({
          event_count: analytics.event_count + 1,
          last_activity: new Date()
        });
      } else {
        await Analytics.create({
          community_id: data.community_id,
          event_type: 'question_created',
          event_count: 1,
          last_activity: new Date()
        });
      }

      // Update real-time community metrics
      if (redis.getRedisClient()) {
        const key = `analytics:community:${data.community_id}:questions`;
        await redis.getRedisClient().incr(key);
        await redis.getRedisClient().expire(key, 86400); // 24 hours
      }

      this.emit('questionCreatedProcessed', data);
    } catch (error) {
      throw new Error(`Failed to process question created event: ${error.message}`);
    }
  }

  /**
   * Process member approved event
   */
  async processMemberApproved(data) {
    try {
      // Update community analytics
      const analytics = await Analytics.findOne({
        where: { community_id: data.community_id }
      });

      if (analytics) {
        await analytics.update({
          event_count: analytics.event_count + 1,
          last_activity: new Date()
        });
      } else {
        await Analytics.create({
          community_id: data.community_id,
          event_type: 'member_approved',
          event_count: 1,
          last_activity: new Date()
        });
      }

      // Update real-time member metrics
      if (redis.getRedisClient()) {
        const key = `analytics:community:${data.community_id}:members`;
        await redis.getRedisClient().incr(key);
        await redis.getRedisClient().expire(key, 86400); // 24 hours
      }

      this.emit('memberApprovedProcessed', data);
    } catch (error) {
      throw new Error(`Failed to process member approved event: ${error.message}`);
    }
  }

  /**
   * Get real-time metrics
   */
  async getRealTimeMetrics() {
    try {
      const metrics = { ...this.metrics };
      
      // Get Redis-based real-time metrics
      if (redis.getRedisClient()) {
        const usersJoinedToday = await redis.getRedisClient().get('analytics:users:joined:today') || 0;
        metrics.usersJoinedToday = parseInt(usersJoinedToday);
      }

      return metrics;
    } catch (error) {
      throw new Error(`Failed to get real-time metrics: ${error.message}`);
    }
  }

  /**
   * Get processing statistics
   */
  getProcessingStats() {
    return {
      queueLength: this.processingQueue.length,
      isProcessing: this.isProcessing,
      metrics: this.metrics,
      averageProcessingTime: this.metrics.eventsProcessed > 0 
        ? this.metrics.processingTime / this.metrics.eventsProcessed 
        : 0
    };
  }

  /**
   * Clear processing queue
   */
  clearQueue() {
    this.processingQueue = [];
    this.emit('queueCleared');
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      eventsProcessed: 0,
      processingTime: 0,
      errors: 0
    };
    this.emit('metricsReset');
  }
}

// Create singleton instance
const streamingAnalytics = new StreamingAnalytics();

module.exports = streamingAnalytics; 