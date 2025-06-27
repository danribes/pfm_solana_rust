/**
 * Tests for Streaming Analytics
 */

const streamingAnalytics = require('../../analytics/streaming');
const { User, Community, Member, VotingQuestion, Vote, Analytics } = require('../../models');
const redis = require('../../redis');

describe('Streaming Analytics', () => {
  let testUser, testCommunity, testQuestion;

  beforeAll(async () => {
    // Mock Redis client
    jest.spyOn(redis, 'getRedisClient').mockReturnValue({
      incr: jest.fn().mockResolvedValue(1),
      expire: jest.fn().mockResolvedValue(1),
      setex: jest.fn().mockResolvedValue('OK'),
      get: jest.fn().mockResolvedValue('5')
    });
  });

  beforeEach(async () => {
    // Clear database
    await Analytics.destroy({ where: {} });
    await Vote.destroy({ where: {} });
    await VotingQuestion.destroy({ where: {} });
    await Member.destroy({ where: {} });
    await Community.destroy({ where: {} });
    await User.destroy({ where: {} });

    // Create test data
    testUser = await User.create({
      id: 'test-user-1',
      wallet_address: 'test-wallet-1',
      username: 'testuser1',
      email: 'test1@example.com',
      is_active: true
    });

    testCommunity = await Community.create({
      id: 'test-community-1',
      name: 'Test Community 1',
      description: 'Test community description',
      created_by: testUser.id,
      is_active: true
    });

    testQuestion = await VotingQuestion.create({
      id: 'test-question-1',
      community_id: testCommunity.id,
      question: 'Test question?',
      options: JSON.stringify(['Option 1', 'Option 2']),
      created_by: testUser.id,
      deadline: new Date(Date.now() + 86400000), // 24 hours from now
      is_active: true
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Event Processing', () => {
    it('should process user joined event', async () => {
      const event = {
        type: 'user_joined',
        data: { user_id: testUser.id },
        timestamp: new Date().toISOString()
      };

      const result = await streamingAnalytics.processEvent(event);
      expect(result).toBe(true);

      // Check if analytics record was created
      const analytics = await Analytics.findOne({
        where: { user_id: testUser.id, event_type: 'user_joined' }
      });
      expect(analytics).toBeTruthy();
      expect(analytics.event_count).toBe(1);
    });

    it('should process vote cast event', async () => {
      const event = {
        type: 'vote_cast',
        data: { 
          question_id: testQuestion.id,
          user_id: testUser.id,
          selected_options: JSON.stringify(['Option 1'])
        },
        timestamp: new Date().toISOString()
      };

      const result = await streamingAnalytics.processEvent(event);
      expect(result).toBe(true);

      // Check if analytics record was created
      const analytics = await Analytics.findOne({
        where: { question_id: testQuestion.id, event_type: 'vote_cast' }
      });
      expect(analytics).toBeTruthy();
      expect(analytics.event_count).toBe(1);
    });

    it('should process question created event', async () => {
      const event = {
        type: 'question_created',
        data: { 
          community_id: testCommunity.id,
          question_id: testQuestion.id
        },
        timestamp: new Date().toISOString()
      };

      const result = await streamingAnalytics.processEvent(event);
      expect(result).toBe(true);

      // Check if analytics record was created
      const analytics = await Analytics.findOne({
        where: { community_id: testCommunity.id, event_type: 'question_created' }
      });
      expect(analytics).toBeTruthy();
      expect(analytics.event_count).toBe(1);
    });

    it('should process member approved event', async () => {
      const event = {
        type: 'member_approved',
        data: { 
          community_id: testCommunity.id,
          user_id: testUser.id
        },
        timestamp: new Date().toISOString()
      };

      const result = await streamingAnalytics.processEvent(event);
      expect(result).toBe(true);

      // Check if analytics record was created
      const analytics = await Analytics.findOne({
        where: { community_id: testCommunity.id, event_type: 'member_approved' }
      });
      expect(analytics).toBeTruthy();
      expect(analytics.event_count).toBe(1);
    });

    it('should handle invalid event data', async () => {
      const invalidEvent = {
        type: 'user_joined',
        // Missing data and timestamp
      };

      await expect(streamingAnalytics.processEvent(invalidEvent))
        .rejects.toThrow('Invalid event data');
    });

    it('should handle unknown event type', async () => {
      const event = {
        type: 'unknown_event',
        data: { user_id: testUser.id },
        timestamp: new Date().toISOString()
      };

      const result = await streamingAnalytics.processEvent(event);
      expect(result).toBe(true); // Should not throw error for unknown types
    });
  });

  describe('Event Validation', () => {
    it('should validate correct event data', () => {
      const validEvent = {
        type: 'user_joined',
        data: { user_id: testUser.id },
        timestamp: new Date().toISOString()
      };

      expect(streamingAnalytics.validateEvent(validEvent)).toBe(true);
    });

    it('should reject event missing required fields', () => {
      const invalidEvent = {
        type: 'user_joined',
        data: { user_id: testUser.id }
        // Missing timestamp
      };

      expect(streamingAnalytics.validateEvent(invalidEvent)).toBe(false);
    });
  });

  describe('Queue Processing', () => {
    it('should process multiple events in queue', async () => {
      const events = [
        {
          type: 'user_joined',
          data: { user_id: testUser.id },
          timestamp: new Date().toISOString()
        },
        {
          type: 'vote_cast',
          data: { question_id: testQuestion.id },
          timestamp: new Date().toISOString()
        }
      ];

      // Add events to queue
      for (const event of events) {
        await streamingAnalytics.processEvent(event);
      }

      // Check if all events were processed
      const analytics = await Analytics.findAll();
      expect(analytics).toHaveLength(2);
    });

    it('should handle queue processing errors gracefully', async () => {
      // Mock a database error
      jest.spyOn(Analytics, 'create').mockRejectedValueOnce(new Error('Database error'));

      const event = {
        type: 'user_joined',
        data: { user_id: testUser.id },
        timestamp: new Date().toISOString()
      };

      await expect(streamingAnalytics.processEvent(event))
        .rejects.toThrow('Failed to process user joined event');
    });
  });

  describe('Real-time Metrics', () => {
    it('should return real-time metrics', async () => {
      const metrics = await streamingAnalytics.getRealTimeMetrics();
      
      expect(metrics).toHaveProperty('eventsProcessed');
      expect(metrics).toHaveProperty('processingTime');
      expect(metrics).toHaveProperty('errors');
      expect(metrics).toHaveProperty('usersJoinedToday');
    });

    it('should handle Redis errors gracefully', async () => {
      // Mock Redis error
      jest.spyOn(redis, 'getRedisClient').mockReturnValue({
        get: jest.fn().mockRejectedValue(new Error('Redis error'))
      });

      const metrics = await streamingAnalytics.getRealTimeMetrics();
      expect(metrics).toHaveProperty('eventsProcessed');
      expect(metrics).toHaveProperty('processingTime');
      expect(metrics).toHaveProperty('errors');
    });
  });

  describe('Processing Statistics', () => {
    it('should return processing statistics', () => {
      const stats = streamingAnalytics.getProcessingStats();
      
      expect(stats).toHaveProperty('queueLength');
      expect(stats).toHaveProperty('isProcessing');
      expect(stats).toHaveProperty('metrics');
      expect(stats).toHaveProperty('averageProcessingTime');
    });

    it('should calculate average processing time correctly', async () => {
      const event = {
        type: 'user_joined',
        data: { user_id: testUser.id },
        timestamp: new Date().toISOString()
      };

      await streamingAnalytics.processEvent(event);
      
      const stats = streamingAnalytics.getProcessingStats();
      expect(stats.averageProcessingTime).toBeGreaterThan(0);
    });
  });

  describe('Queue Management', () => {
    it('should clear processing queue', () => {
      const clearSpy = jest.spyOn(streamingAnalytics, 'emit');
      
      streamingAnalytics.clearQueue();
      
      expect(clearSpy).toHaveBeenCalledWith('queueCleared');
      expect(streamingAnalytics.processingQueue).toHaveLength(0);
    });

    it('should reset metrics', () => {
      const resetSpy = jest.spyOn(streamingAnalytics, 'emit');
      
      streamingAnalytics.resetMetrics();
      
      expect(resetSpy).toHaveBeenCalledWith('metricsReset');
      expect(streamingAnalytics.metrics.eventsProcessed).toBe(0);
      expect(streamingAnalytics.metrics.processingTime).toBe(0);
      expect(streamingAnalytics.metrics.errors).toBe(0);
    });
  });

  describe('Event Emission', () => {
    it('should emit eventProcessed event', (done) => {
      const event = {
        type: 'user_joined',
        data: { user_id: testUser.id },
        timestamp: new Date().toISOString()
      };

      streamingAnalytics.once('eventProcessed', (data) => {
        expect(data).toHaveProperty('event');
        expect(data).toHaveProperty('processingTime');
        expect(data).toHaveProperty('timestamp');
        done();
      });

      streamingAnalytics.processEvent(event);
    });

    it('should emit processingError event', (done) => {
      // Mock a processing error
      jest.spyOn(Analytics, 'create').mockRejectedValueOnce(new Error('Test error'));

      const event = {
        type: 'user_joined',
        data: { user_id: testUser.id },
        timestamp: new Date().toISOString()
      };

      streamingAnalytics.once('processingError', (data) => {
        expect(data).toHaveProperty('error');
        expect(data).toHaveProperty('event');
        done();
      });

      streamingAnalytics.processEvent(event).catch(() => {
        // Expected to fail
      });
    });
  });
}); 