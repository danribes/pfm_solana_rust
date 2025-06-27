/**
 * Tests for Aggregation Service
 */

const aggregationService = require('../../services/aggregation');
const streamingAnalytics = require('../../analytics/streaming');
const batchAnalytics = require('../../analytics/batch');
const dataWarehouse = require('../../analytics/warehouse');
const AnalyticsWorker = require('../../workers/analytics');
const redis = require('../../redis');
const { User, Community, Member, VotingQuestion, Vote, Analytics } = require('../../models');

// Mock dependencies
jest.mock('../../analytics/streaming');
jest.mock('../../analytics/batch');
jest.mock('../../analytics/warehouse');
jest.mock('../../workers/analytics');
jest.mock('../../redis');

describe('Aggregation Service', () => {
  let testUser, testCommunity, testQuestion;

  beforeAll(async () => {
    // Mock Redis client
    redis.getRedisClient.mockReturnValue({
      incr: jest.fn().mockResolvedValue(1),
      expire: jest.fn().mockResolvedValue(1),
      setex: jest.fn().mockResolvedValue('OK'),
      get: jest.fn().mockResolvedValue('5'),
      lpush: jest.fn().mockResolvedValue(1),
      ltrim: jest.fn().mockResolvedValue('OK'),
      lrange: jest.fn().mockResolvedValue([]),
      keys: jest.fn().mockResolvedValue([])
    });

    // Mock AnalyticsWorker
    AnalyticsWorker.mockImplementation(() => ({
      initialize: jest.fn().mockResolvedValue(undefined),
      sendTask: jest.fn(),
      getWorkerStats: jest.fn().mockReturnValue({ activeWorkers: 3 }),
      stop: jest.fn().mockResolvedValue(undefined)
    }));
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Reset aggregation service
    aggregationService.isInitialized = false;
    aggregationService.aggregationStats = {
      totalAggregations: 0,
      successfulAggregations: 0,
      failedAggregations: 0,
      lastAggregation: null
    };

    // Create test data
    testUser = {
      id: 'test-user-1',
      wallet_address: 'test-wallet-1',
      username: 'testuser1',
      email: 'test1@example.com',
      is_active: true
    };

    testCommunity = {
      id: 'test-community-1',
      name: 'Test Community 1',
      description: 'Test community description',
      created_by: testUser.id,
      is_active: true
    };

    testQuestion = {
      id: 'test-question-1',
      community_id: testCommunity.id,
      question: 'Test question?',
      options: JSON.stringify(['Option 1', 'Option 2']),
      created_by: testUser.id,
      deadline: new Date(Date.now() + 86400000),
      is_active: true
    };
  });

  describe('Initialization', () => {
    it('should initialize aggregation service', async () => {
      await aggregationService.initialize();
      
      expect(AnalyticsWorker).toHaveBeenCalled();
      expect(aggregationService.worker.initialize).toHaveBeenCalled();
      expect(aggregationService.isInitialized).toBe(true);
    });

    it('should set up event listeners', async () => {
      const emitSpy = jest.spyOn(streamingAnalytics, 'on');
      
      await aggregationService.initialize();
      
      expect(emitSpy).toHaveBeenCalledWith('eventProcessed', expect.any(Function));
      expect(emitSpy).toHaveBeenCalledWith('processingError', expect.any(Function));
    });

    it('should handle initialization errors', async () => {
      AnalyticsWorker.mockImplementationOnce(() => ({
        initialize: jest.fn().mockRejectedValue(new Error('Worker error'))
      }));

      await expect(aggregationService.initialize()).rejects.toThrow('Worker error');
    });
  });

  describe('Event Processing', () => {
    beforeEach(async () => {
      await aggregationService.initialize();
    });

    it('should process analytics event', async () => {
      const event = {
        type: 'user_joined',
        data: { user_id: testUser.id },
        timestamp: new Date().toISOString()
      };

      streamingAnalytics.processEvent.mockResolvedValue(true);

      const result = await aggregationService.processEvent(event);
      
      expect(result).toBe(true);
      expect(streamingAnalytics.processEvent).toHaveBeenCalledWith(event);
      expect(aggregationService.aggregationStats.totalAggregations).toBe(1);
      expect(aggregationService.aggregationStats.lastAggregation).toBeTruthy();
    });

    it('should handle processing errors', async () => {
      const event = {
        type: 'user_joined',
        data: { user_id: testUser.id },
        timestamp: new Date().toISOString()
      };

      streamingAnalytics.processEvent.mockRejectedValue(new Error('Processing error'));

      await expect(aggregationService.processEvent(event))
        .rejects.toThrow('Processing error');
      
      expect(aggregationService.aggregationStats.failedAggregations).toBe(1);
    });

    it('should reject events when not initialized', async () => {
      aggregationService.isInitialized = false;

      const event = {
        type: 'user_joined',
        data: { user_id: testUser.id },
        timestamp: new Date().toISOString()
      };

      await expect(aggregationService.processEvent(event))
        .rejects.toThrow('Aggregation service not initialized');
    });
  });

  describe('Event Handling', () => {
    beforeEach(async () => {
      await aggregationService.initialize();
    });

    it('should handle streaming events', async () => {
      const eventData = {
        event: { type: 'user_joined', data: { user_id: testUser.id } },
        processingTime: 100,
        timestamp: new Date().toISOString()
      };

      // Mock the event handler
      const eventHandler = streamingAnalytics.on.mock.calls.find(
        call => call[0] === 'eventProcessed'
      )[1];

      await eventHandler(eventData);

      expect(aggregationService.aggregationStats.successfulAggregations).toBe(1);
    });

    it('should handle batch events', async () => {
      const eventData = {
        period: 'daily',
        data: { userActivity: {}, communityActivity: {}, votingActivity: {} }
      };

      // Mock the event handler
      const eventHandler = batchAnalytics.on.mock.calls.find(
        call => call[0] === 'jobCompleted'
      )[1];

      await eventHandler(eventData);

      expect(aggregationService.aggregationStats.successfulAggregations).toBe(1);
    });

    it('should handle processing errors', async () => {
      const errorData = {
        error: 'Test error',
        event: { type: 'user_joined' }
      };

      // Mock the error handler
      const errorHandler = streamingAnalytics.on.mock.calls.find(
        call => call[0] === 'processingError'
      )[1];

      await errorHandler(errorData);

      expect(aggregationService.aggregationStats.failedAggregations).toBe(1);
    });
  });

  describe('Real-time Metrics', () => {
    beforeEach(async () => {
      await aggregationService.initialize();
    });

    it('should update real-time metrics', async () => {
      const eventData = {
        event: { type: 'user_joined', data: { user_id: testUser.id } },
        processingTime: 100,
        timestamp: new Date().toISOString()
      };

      // Mock the event handler
      const eventHandler = streamingAnalytics.on.mock.calls.find(
        call => call[0] === 'eventProcessed'
      )[1];

      await eventHandler(eventData);

      expect(redis.getRedisClient().incr).toHaveBeenCalledWith(
        expect.stringContaining('analytics:events:user_joined:')
      );
      expect(redis.getRedisClient().expire).toHaveBeenCalled();
    });

    it('should handle Redis errors gracefully', async () => {
      redis.getRedisClient.mockReturnValue({
        incr: jest.fn().mockRejectedValue(new Error('Redis error'))
      });

      const eventData = {
        event: { type: 'user_joined', data: { user_id: testUser.id } },
        processingTime: 100,
        timestamp: new Date().toISOString()
      };

      // Mock the event handler
      const eventHandler = streamingAnalytics.on.mock.calls.find(
        call => call[0] === 'eventProcessed'
      )[1];

      // Should not throw error
      await expect(eventHandler(eventData)).resolves.not.toThrow();
    });
  });

  describe('Batch Metrics', () => {
    beforeEach(async () => {
      await aggregationService.initialize();
    });

    it('should update batch metrics', async () => {
      const eventData = {
        period: 'daily',
        data: { userActivity: {}, communityActivity: {}, votingActivity: {} }
      };

      // Mock the event handler
      const eventHandler = batchAnalytics.on.mock.calls.find(
        call => call[0] === 'jobCompleted'
      )[1];

      await eventHandler(eventData);

      expect(redis.getRedisClient().setex).toHaveBeenCalledWith(
        expect.stringContaining('analytics:batch:daily:'),
        expect.any(Number),
        expect.any(String)
      );
    });
  });

  describe('Immediate Aggregation', () => {
    beforeEach(async () => {
      await aggregationService.initialize();
    });

    it('should trigger immediate aggregation for high-priority events', async () => {
      const eventData = {
        event: { type: 'vote_cast', data: { question_id: testQuestion.id } },
        processingTime: 100,
        timestamp: new Date().toISOString()
      };

      // Mock the event handler
      const eventHandler = streamingAnalytics.on.mock.calls.find(
        call => call[0] === 'eventProcessed'
      )[1];

      await eventHandler(eventData);

      expect(aggregationService.worker.sendTask).toHaveBeenCalledWith('streaming', {
        action: 'processEvent',
        event: eventData.event
      });
    });

    it('should not trigger immediate aggregation for low-priority events', async () => {
      const eventData = {
        event: { type: 'user_login', data: { user_id: testUser.id } },
        processingTime: 100,
        timestamp: new Date().toISOString()
      };

      // Mock the event handler
      const eventHandler = streamingAnalytics.on.mock.calls.find(
        call => call[0] === 'eventProcessed'
      )[1];

      await eventHandler(eventData);

      expect(aggregationService.worker.sendTask).not.toHaveBeenCalled();
    });
  });

  describe('Warehouse ETL', () => {
    beforeEach(async () => {
      await aggregationService.initialize();
    });

    it('should trigger warehouse ETL for batch periods', async () => {
      const eventData = {
        period: 'daily',
        data: { userActivity: {}, communityActivity: {}, votingActivity: {} }
      };

      // Mock the event handler
      const eventHandler = batchAnalytics.on.mock.calls.find(
        call => call[0] === 'jobCompleted'
      )[1];

      await eventHandler(eventData);

      expect(aggregationService.worker.sendTask).toHaveBeenCalledWith('warehouse', {
        action: 'runETL',
        date: expect.any(Date)
      });
    });
  });

  describe('Comprehensive Analytics', () => {
    beforeEach(async () => {
      await aggregationService.initialize();
    });

    it('should get comprehensive analytics', async () => {
      // Mock analytics methods
      streamingAnalytics.getRealTimeMetrics.mockResolvedValue({
        eventsProcessed: 10,
        processingTime: 1000,
        errors: 0
      });

      streamingAnalytics.getProcessingStats.mockReturnValue({
        queueLength: 0,
        isProcessing: false,
        metrics: { eventsProcessed: 10 }
      });

      batchAnalytics.getProcessingStats.mockReturnValue({
        jobsCompleted: 5,
        totalProcessingTime: 5000,
        errors: 0
      });

      const analytics = await aggregationService.getComprehensiveAnalytics();
      
      expect(analytics).toHaveProperty('realTime');
      expect(analytics).toHaveProperty('batch');
      expect(analytics).toHaveProperty('warehouse');
      expect(analytics).toHaveProperty('stats');
    });

    it('should get real-time analytics', async () => {
      streamingAnalytics.getRealTimeMetrics.mockResolvedValue({
        eventsProcessed: 10,
        processingTime: 1000,
        errors: 0
      });

      streamingAnalytics.getProcessingStats.mockReturnValue({
        queueLength: 0,
        isProcessing: false,
        metrics: { eventsProcessed: 10 }
      });

      const realTimeAnalytics = await aggregationService.getRealTimeAnalytics();
      
      expect(realTimeAnalytics).toHaveProperty('streaming');
      expect(realTimeAnalytics).toHaveProperty('processing');
      expect(realTimeAnalytics).toHaveProperty('redis');
    });

    it('should get batch analytics', async () => {
      batchAnalytics.getProcessingStats.mockReturnValue({
        jobsCompleted: 5,
        totalProcessingTime: 5000,
        errors: 0
      });

      const batchAnalyticsData = await aggregationService.getBatchAnalytics(
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );
      
      expect(batchAnalyticsData).toHaveProperty('stats');
      expect(batchAnalyticsData).toHaveProperty('results');
    });

    it('should get warehouse analytics', async () => {
      dataWarehouse.queryWarehouse.mockResolvedValue([
        { id: 1, user_id: 'user-1', total_communities: 2 }
      ]);

      const warehouseAnalytics = await aggregationService.getWarehouseAnalytics(
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );
      
      expect(warehouseAnalytics).toHaveProperty('stats');
      expect(warehouseAnalytics).toHaveProperty('userAnalytics');
      expect(warehouseAnalytics).toHaveProperty('communityAnalytics');
    });
  });

  describe('Manual Aggregation', () => {
    beforeEach(async () => {
      await aggregationService.initialize();
    });

    it('should run manual daily aggregation', async () => {
      batchAnalytics.processDailyAnalytics.mockResolvedValue(undefined);

      await aggregationService.runManualAggregation('daily');
      
      expect(batchAnalytics.processDailyAnalytics).toHaveBeenCalled();
    });

    it('should run manual weekly aggregation', async () => {
      batchAnalytics.processWeeklyAnalytics.mockResolvedValue(undefined);

      await aggregationService.runManualAggregation('weekly');
      
      expect(batchAnalytics.processWeeklyAnalytics).toHaveBeenCalled();
    });

    it('should run manual monthly aggregation', async () => {
      batchAnalytics.processMonthlyAnalytics.mockResolvedValue(undefined);

      await aggregationService.runManualAggregation('monthly');
      
      expect(batchAnalytics.processMonthlyAnalytics).toHaveBeenCalled();
    });

    it('should run manual ETL', async () => {
      const testDate = new Date('2024-01-01');
      dataWarehouse.runETL.mockResolvedValue(undefined);

      await aggregationService.runManualAggregation('etl', { date: testDate });
      
      expect(dataWarehouse.runETL).toHaveBeenCalledWith(testDate);
    });

    it('should handle unknown aggregation type', async () => {
      await expect(aggregationService.runManualAggregation('unknown'))
        .rejects.toThrow('Unknown aggregation type: unknown');
    });
  });

  describe('Statistics', () => {
    beforeEach(async () => {
      await aggregationService.initialize();
    });

    it('should get aggregation statistics', () => {
      const stats = aggregationService.getAggregationStats();
      
      expect(stats).toHaveProperty('totalAggregations');
      expect(stats).toHaveProperty('successfulAggregations');
      expect(stats).toHaveProperty('failedAggregations');
      expect(stats).toHaveProperty('lastAggregation');
      expect(stats).toHaveProperty('isInitialized');
      expect(stats).toHaveProperty('workerStats');
    });
  });

  describe('Shutdown', () => {
    beforeEach(async () => {
      await aggregationService.initialize();
    });

    it('should shutdown aggregation service', async () => {
      await aggregationService.shutdown();
      
      expect(aggregationService.worker.stop).toHaveBeenCalled();
      expect(aggregationService.isInitialized).toBe(false);
    });

    it('should handle shutdown errors', async () => {
      aggregationService.worker.stop.mockRejectedValue(new Error('Stop error'));

      await expect(aggregationService.shutdown()).rejects.toThrow('Stop error');
    });
  });

  describe('Error Logging', () => {
    beforeEach(async () => {
      await aggregationService.initialize();
    });

    it('should log errors to database and Redis', async () => {
      const error = new Error('Test error');
      const errorData = { type: 'streaming', error };

      await aggregationService.logError('streaming', error);

      expect(Analytics.create).toHaveBeenCalledWith({
        event_type: 'error',
        event_data: expect.stringContaining('Test error'),
        created_at: expect.any(Date)
      });

      expect(redis.getRedisClient().lpush).toHaveBeenCalledWith(
        'analytics:errors',
        expect.stringContaining('Test error')
      );
    });

    it('should handle logging errors gracefully', async () => {
      Analytics.create.mockRejectedValue(new Error('Database error'));
      redis.getRedisClient.mockReturnValue({
        lpush: jest.fn().mockRejectedValue(new Error('Redis error'))
      });

      const error = new Error('Test error');

      // Should not throw error
      await expect(aggregationService.logError('streaming', error))
        .resolves.not.toThrow();
    });
  });
}); 