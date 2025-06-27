// Mock Redis before importing analytics service
jest.mock('../../redis', () => ({
  getRedisClient: jest.fn(() => ({
    get: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    keys: jest.fn()
  }))
}));

const analyticsService = require('../../services/analytics');
const { User, Community, Member, VotingQuestion, Vote, Analytics } = require('../../models');
const redis = require('../../redis');

describe('Analytics Service', () => {
  let testUser, testCommunity, testQuestion, mockRedisClient;

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
      wallet_address: 'test-wallet-address',
      username: 'testuser',
      is_active: true
    });

    testCommunity = await Community.create({
      on_chain_id: 'test-community-123',
      name: 'Test Community',
      description: 'A test community',
      created_by: testUser.id,
      is_active: true
    });

    testQuestion = await VotingQuestion.create({
      on_chain_id: 'test-question-123',
      community_id: testCommunity.id,
      title: 'Test Question',
      description: 'A test question',
      options: JSON.stringify(['Option 1', 'Option 2']),
      voting_start_at: new Date(),
      voting_end_at: new Date(Date.now() + 86400000),
      created_by: testUser.id,
      is_active: true
    });

    // Mock Redis client
    mockRedisClient = {
      get: jest.fn(),
      setex: jest.fn(),
      del: jest.fn(),
      keys: jest.fn()
    };
    redis.getRedisClient.mockReturnValue(mockRedisClient);
    
    // Inject mocked Redis client into analytics service
    analyticsService.redisClient = mockRedisClient;
  });

  describe('getCommunityAnalytics', () => {
    it('should return community analytics data', async () => {
      // Mock cache miss
      mockRedisClient.get.mockResolvedValue(null);

      const result = await analyticsService.getCommunityAnalytics({
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z',
        limit: 10
      });

      expect(result).toHaveProperty('community_growth');
      expect(result).toHaveProperty('member_engagement');
      expect(result).toHaveProperty('activity_metrics');
      expect(result).toHaveProperty('generated_at');
      expect(mockRedisClient.setex).toHaveBeenCalled();
    });

    it('should return cached data when available', async () => {
      const cachedData = {
        community_growth: [],
        member_engagement: {},
        activity_metrics: [],
        generated_at: new Date().toISOString()
      };

      mockRedisClient.get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await analyticsService.getCommunityAnalytics();

      expect(result).toEqual(cachedData);
      expect(mockRedisClient.setex).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      mockRedisClient.get.mockRejectedValue(new Error('Redis error'));

      await expect(analyticsService.getCommunityAnalytics()).rejects.toThrow('Redis error');
    });
  });

  describe('getCommunityOverview', () => {
    it('should return community overview data', async () => {
      // Create a member for the community
      await Member.create({
        community_id: testCommunity.id,
        user_id: testUser.id,
        role: 'member',
        status: 'approved'
      });

      // Mock cache miss
      mockRedisClient.get.mockResolvedValue(null);

      const result = await analyticsService.getCommunityOverview(testCommunity.id, {
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z'
      });

      expect(result).toHaveProperty('community');
      expect(result).toHaveProperty('member_statistics');
      expect(result).toHaveProperty('voting_statistics');
      expect(result).toHaveProperty('recent_activity');
      expect(result).toHaveProperty('generated_at');
      expect(result.community.id).toBe(testCommunity.id);
      expect(mockRedisClient.setex).toHaveBeenCalled();
    });

    it('should throw error for non-existent community', async () => {
      await expect(
        analyticsService.getCommunityOverview('00000000-0000-0000-0000-000000000000')
      ).rejects.toThrow('Community not found');
    });

    it('should return cached data when available', async () => {
      const cachedData = {
        community: { id: testCommunity.id, name: 'Test Community' },
        member_statistics: [],
        voting_statistics: {},
        recent_activity: [],
        generated_at: new Date().toISOString()
      };

      mockRedisClient.get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await analyticsService.getCommunityOverview(testCommunity.id);

      expect(result).toEqual(cachedData);
      expect(mockRedisClient.setex).not.toHaveBeenCalled();
    });
  });

  describe('getMemberEngagement', () => {
    it('should return member engagement data', async () => {
      // Create members for the community
      await Member.create({
        community_id: testCommunity.id,
        user_id: testUser.id,
        role: 'member',
        status: 'approved'
      });

      // Mock cache miss
      mockRedisClient.get.mockResolvedValue(null);

      const result = await analyticsService.getMemberEngagement(testCommunity.id, {
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z'
      });

      expect(result).toHaveProperty('member_growth');
      expect(result).toHaveProperty('member_activity');
      expect(result).toHaveProperty('member_retention');
      expect(result).toHaveProperty('generated_at');
      expect(mockRedisClient.setex).toHaveBeenCalled();
    });

    it('should return cached data when available', async () => {
      const cachedData = {
        member_growth: [],
        member_activity: [],
        member_retention: [],
        generated_at: new Date().toISOString()
      };

      mockRedisClient.get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await analyticsService.getMemberEngagement(testCommunity.id);

      expect(result).toEqual(cachedData);
      expect(mockRedisClient.setex).not.toHaveBeenCalled();
    });
  });

  describe('getVotingAnalytics', () => {
    it('should return voting analytics data', async () => {
      // Create a vote
      await Vote.create({
        question_id: testQuestion.id,
        user_id: testUser.id,
        selected_options: JSON.stringify({ option: 'Option 1' }),
        transaction_signature: 'test-signature'
      });

      // Mock cache miss
      mockRedisClient.get.mockResolvedValue(null);

      const result = await analyticsService.getVotingAnalytics({
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z',
        communityId: testCommunity.id
      });

      expect(result).toHaveProperty('participation_rates');
      expect(result).toHaveProperty('voting_trends');
      expect(result).toHaveProperty('question_analytics');
      expect(result).toHaveProperty('generated_at');
      expect(mockRedisClient.setex).toHaveBeenCalled();
    });

    it('should return cached data when available', async () => {
      const cachedData = {
        participation_rates: {},
        voting_trends: [],
        question_analytics: [],
        generated_at: new Date().toISOString()
      };

      mockRedisClient.get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await analyticsService.getVotingAnalytics();

      expect(result).toEqual(cachedData);
      expect(mockRedisClient.setex).not.toHaveBeenCalled();
    });
  });

  describe('getUserAnalytics', () => {
    it('should return user analytics data', async () => {
      // Create analytics events
      await Analytics.create({
        event_type: 'vote_cast',
        event_data: { question_id: testQuestion.id },
        user_id: testUser.id,
        community_id: testCommunity.id
      });

      // Mock cache miss
      mockRedisClient.get.mockResolvedValue(null);

      const result = await analyticsService.getUserAnalytics({
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z'
      });

      expect(result).toHaveProperty('user_activity');
      expect(result).toHaveProperty('user_engagement');
      expect(result).toHaveProperty('user_retention');
      expect(result).toHaveProperty('generated_at');
      expect(mockRedisClient.setex).toHaveBeenCalled();
    });

    it('should return cached data when available', async () => {
      const cachedData = {
        user_activity: [],
        user_engagement: [],
        user_retention: [],
        generated_at: new Date().toISOString()
      };

      mockRedisClient.get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await analyticsService.getUserAnalytics();

      expect(result).toEqual(cachedData);
      expect(mockRedisClient.setex).not.toHaveBeenCalled();
    });
  });

  describe('getQuestionAnalytics', () => {
    it('should return question analytics data', async () => {
      // Create votes for the question
      await Vote.create({
        question_id: testQuestion.id,
        user_id: testUser.id,
        selected_options: JSON.stringify({ option: 'Option 1' }),
        transaction_signature: 'test-signature'
      });

      // Create a member for participation calculation
      await Member.create({
        community_id: testCommunity.id,
        user_id: testUser.id,
        role: 'member',
        status: 'approved'
      });

      // Mock cache miss
      mockRedisClient.get.mockResolvedValue(null);

      const result = await analyticsService.getQuestionAnalytics(testQuestion.id);

      expect(result).toHaveProperty('question');
      expect(result).toHaveProperty('community');
      expect(result).toHaveProperty('creator');
      expect(result).toHaveProperty('vote_distribution');
      expect(result).toHaveProperty('voting_timeline');
      expect(result).toHaveProperty('participation_rate');
      expect(result).toHaveProperty('total_votes');
      expect(result).toHaveProperty('total_members');
      expect(result).toHaveProperty('generated_at');
      expect(result.question.id).toBe(testQuestion.id);
      expect(mockRedisClient.setex).toHaveBeenCalled();
    });

    it('should throw error for non-existent question', async () => {
      await expect(
        analyticsService.getQuestionAnalytics('00000000-0000-0000-0000-000000000000')
      ).rejects.toThrow('Question not found');
    });

    it('should return cached data when available', async () => {
      const cachedData = {
        question: { id: testQuestion.id, title: 'Test Question' },
        community: { id: testCommunity.id, name: 'Test Community' },
        creator: { id: testUser.id, username: 'testuser' },
        vote_distribution: [],
        voting_timeline: [],
        participation_rate: 0,
        total_votes: 0,
        total_members: 0,
        generated_at: new Date().toISOString()
      };

      mockRedisClient.get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await analyticsService.getQuestionAnalytics(testQuestion.id);

      expect(result).toEqual(cachedData);
      expect(mockRedisClient.setex).not.toHaveBeenCalled();
    });
  });

  describe('calculateMemberRetention', () => {
    it('should calculate member retention data', async () => {
      // Create members with different join dates
      const pastDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      
      await Member.create({
        community_id: testCommunity.id,
        user_id: testUser.id,
        role: 'member',
        status: 'approved',
        joined_at: pastDate
      });

      const result = await analyticsService.calculateMemberRetention(testCommunity.id, {
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z'
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(30);
      expect(result[0]).toHaveProperty('day');
      expect(result[0]).toHaveProperty('retained_members');
      expect(result[0]).toHaveProperty('retention_rate');
    });

    it('should handle empty member list', async () => {
      const result = await analyticsService.calculateMemberRetention(testCommunity.id);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(30);
      expect(result.every(item => item.retention_rate === 0)).toBe(true);
    });
  });

  describe('calculateUserRetention', () => {
    it('should calculate user retention data', async () => {
      // Create users with different creation dates
      const pastDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      
      await User.create({
        wallet_address: 'test-wallet-2',
        username: 'testuser2',
        is_active: true,
        created_at: pastDate
      });

      const result = await analyticsService.calculateUserRetention({
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z'
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(30);
      expect(result[0]).toHaveProperty('day');
      expect(result[0]).toHaveProperty('retained_users');
      expect(result[0]).toHaveProperty('retention_rate');
    });

    it('should handle empty user list', async () => {
      const result = await analyticsService.calculateUserRetention();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(30);
      expect(result.every(item => item.retention_rate === 0)).toBe(true);
    });
  });

  describe('clearCache', () => {
    it('should clear analytics cache', async () => {
      mockRedisClient.keys.mockResolvedValue(['analytics:test1', 'analytics:test2']);
      mockRedisClient.del.mockResolvedValue(2);

      await analyticsService.clearCache('analytics:*');

      expect(mockRedisClient.keys).toHaveBeenCalledWith('analytics:*');
      expect(mockRedisClient.del).toHaveBeenCalledWith(['analytics:test1', 'analytics:test2']);
    });

    it('should handle empty cache', async () => {
      mockRedisClient.keys.mockResolvedValue([]);

      await analyticsService.clearCache();

      expect(mockRedisClient.keys).toHaveBeenCalledWith('analytics:*');
      expect(mockRedisClient.del).not.toHaveBeenCalled();
    });

    it('should handle Redis errors gracefully', async () => {
      mockRedisClient.keys.mockRejectedValue(new Error('Redis error'));

      await analyticsService.clearCache();
      // Should not throw error
    });
  });

  describe('getCacheStats', () => {
    it('should return cache statistics', async () => {
      mockRedisClient.keys.mockResolvedValue([
        'analytics:communities:test1',
        'analytics:communities:test2',
        'analytics:voting:test3'
      ]);

      const result = await analyticsService.getCacheStats();

      expect(result).toHaveProperty('total_keys', 3);
      expect(result).toHaveProperty('memory_usage', 0);
      expect(result).toHaveProperty('key_patterns');
      expect(result.key_patterns).toHaveProperty('communities', 2);
      expect(result.key_patterns).toHaveProperty('voting', 1);
    });

    it('should handle Redis errors gracefully', async () => {
      mockRedisClient.keys.mockRejectedValue(new Error('Redis error'));

      const result = await analyticsService.getCacheStats();

      expect(result).toEqual({
        total_keys: 0,
        memory_usage: 0,
        key_patterns: {}
      });
    });
  });
}); 