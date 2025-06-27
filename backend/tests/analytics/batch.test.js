/**
 * Tests for Batch Analytics
 */

const batchAnalytics = require('../../analytics/batch');
const { User, Community, Member, VotingQuestion, Vote, Analytics } = require('../../models');
const redis = require('../../redis');

// Mock node-cron
jest.mock('node-cron', () => ({
  schedule: jest.fn().mockReturnValue({
    stop: jest.fn()
  })
}));

describe('Batch Analytics', () => {
  let testUser, testCommunity, testQuestion;

  beforeAll(async () => {
    // Mock Redis client
    jest.spyOn(redis, 'getRedisClient').mockReturnValue({
      setex: jest.fn().mockResolvedValue('OK'),
      get: jest.fn().mockResolvedValue('10'),
      incr: jest.fn().mockResolvedValue(1),
      expire: jest.fn().mockResolvedValue(1)
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

    // Create some test votes
    await Vote.create({
      id: 'test-vote-1',
      question_id: testQuestion.id,
      user_id: testUser.id,
      selected_options: JSON.stringify(['Option 1']),
      voted_at: new Date()
    });

    // Create some test members
    await Member.create({
      id: 'test-member-1',
      community_id: testCommunity.id,
      user_id: testUser.id,
      status: 'approved',
      joined_at: new Date()
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize batch processing jobs', async () => {
      await batchAnalytics.initialize();
      
      expect(batchAnalytics.jobs.size).toBe(4); // daily, weekly, monthly, cleanup
      expect(batchAnalytics.jobs.has('daily-analytics')).toBe(true);
      expect(batchAnalytics.jobs.has('weekly-analytics')).toBe(true);
      expect(batchAnalytics.jobs.has('monthly-analytics')).toBe(true);
      expect(batchAnalytics.jobs.has('data-cleanup')).toBe(true);
    });

    it('should handle initialization errors', async () => {
      // Mock a failure
      jest.spyOn(batchAnalytics, 'scheduleJob').mockImplementationOnce(() => {
        throw new Error('Schedule error');
      });

      await expect(batchAnalytics.initialize()).rejects.toThrow('Schedule error');
    });
  });

  describe('Daily Analytics Processing', () => {
    it('should process daily analytics', async () => {
      await batchAnalytics.processDailyAnalytics();
      
      // Check if analytics records were created
      const analytics = await Analytics.findAll({
        where: { period_type: 'daily' }
      });
      
      expect(analytics.length).toBeGreaterThan(0);
    });

    it('should aggregate user activity correctly', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const startOfDay = new Date(yesterday.setHours(0, 0, 0, 0));
      const endOfDay = new Date(yesterday.setHours(23, 59, 59, 999));

      const userActivity = await batchAnalytics.aggregateUserActivity(startOfDay, endOfDay);
      
      expect(userActivity).toHaveProperty('total_users');
      expect(userActivity).toHaveProperty('new_users');
      expect(userActivity).toHaveProperty('active_users');
    });

    it('should aggregate community activity correctly', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const startOfDay = new Date(yesterday.setHours(0, 0, 0, 0));
      const endOfDay = new Date(yesterday.setHours(23, 59, 59, 999));

      const communityActivity = await batchAnalytics.aggregateCommunityActivity(startOfDay, endOfDay);
      
      expect(communityActivity).toHaveProperty('total_communities');
      expect(communityActivity).toHaveProperty('new_communities');
      expect(communityActivity).toHaveProperty('active_communities');
    });

    it('should aggregate voting activity correctly', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const startOfDay = new Date(yesterday.setHours(0, 0, 0, 0));
      const endOfDay = new Date(yesterday.setHours(23, 59, 59, 999));

      const votingActivity = await batchAnalytics.aggregateVotingActivity(startOfDay, endOfDay);
      
      expect(votingActivity).toHaveProperty('total_votes');
      expect(votingActivity).toHaveProperty('new_votes');
    });
  });

  describe('Weekly Analytics Processing', () => {
    it('should process weekly analytics', async () => {
      await batchAnalytics.processWeeklyAnalytics();
      
      // Check if analytics records were created
      const analytics = await Analytics.findAll({
        where: { period_type: 'weekly' }
      });
      
      expect(analytics.length).toBeGreaterThan(0);
    });

    it('should aggregate weekly metrics correctly', async () => {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      const startOfWeek = new Date(lastWeek.setHours(0, 0, 0, 0));
      const endOfWeek = new Date(lastWeek.setHours(23, 59, 59, 999));

      const weeklyMetrics = await batchAnalytics.aggregateWeeklyMetrics(startOfWeek, endOfWeek);
      
      expect(Array.isArray(weeklyMetrics)).toBe(true);
      expect(weeklyMetrics.length).toBe(7); // 7 days
      
      if (weeklyMetrics.length > 0) {
        expect(weeklyMetrics[0]).toHaveProperty('date');
        expect(weeklyMetrics[0]).toHaveProperty('userActivity');
        expect(weeklyMetrics[0]).toHaveProperty('communityActivity');
        expect(weeklyMetrics[0]).toHaveProperty('votingActivity');
      }
    });
  });

  describe('Monthly Analytics Processing', () => {
    it('should process monthly analytics', async () => {
      await batchAnalytics.processMonthlyAnalytics();
      
      // Check if analytics records were created
      const analytics = await Analytics.findAll({
        where: { period_type: 'monthly' }
      });
      
      expect(analytics.length).toBeGreaterThan(0);
    });

    it('should aggregate monthly metrics correctly', async () => {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const startOfMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
      const endOfMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0, 23, 59, 59, 999);

      const monthlyMetrics = await batchAnalytics.aggregateMonthlyMetrics(startOfMonth, endOfMonth);
      
      expect(Array.isArray(monthlyMetrics)).toBe(true);
      
      if (monthlyMetrics.length > 0) {
        expect(monthlyMetrics[0]).toHaveProperty('week');
        expect(monthlyMetrics[0]).toHaveProperty('metrics');
      }
    });
  });

  describe('Data Storage', () => {
    it('should store aggregated data in Redis and database', async () => {
      const testData = {
        date: '2024-01-01',
        userActivity: { total_users: 10, new_users: 2, active_users: 8 },
        communityActivity: { total_communities: 5, new_communities: 1, active_communities: 4 },
        votingActivity: { total_votes: 20, new_votes: 5 }
      };

      await batchAnalytics.storeAggregatedData('daily', testData);
      
      // Check if data was stored in database
      const analytics = await Analytics.findOne({
        where: { 
          period_type: 'daily',
          period_value: '2024-01-01'
        }
      });
      
      expect(analytics).toBeTruthy();
      expect(JSON.parse(analytics.data)).toEqual(testData);
    });

    it('should handle storage errors gracefully', async () => {
      // Mock Redis error
      jest.spyOn(redis, 'getRedisClient').mockReturnValue({
        setex: jest.fn().mockRejectedValue(new Error('Redis error'))
      });

      const testData = { date: '2024-01-01', test: 'data' };
      
      // Should not throw error, should still store in database
      await expect(batchAnalytics.storeAggregatedData('daily', testData))
        .resolves.not.toThrow();
    });
  });

  describe('Data Cleanup', () => {
    it('should cleanup old data', async () => {
      // Create old analytics record
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 35); // 35 days ago
      
      await Analytics.create({
        period_type: 'daily',
        period_value: oldDate.toISOString().split('T')[0],
        data: JSON.stringify({ test: 'old data' }),
        created_at: oldDate
      });

      const beforeCount = await Analytics.count();
      
      await batchAnalytics.cleanupOldData();
      
      const afterCount = await Analytics.count();
      expect(afterCount).toBeLessThan(beforeCount);
    });

    it('should handle cleanup errors gracefully', async () => {
      // Mock database error
      jest.spyOn(Analytics, 'destroy').mockRejectedValueOnce(new Error('Database error'));
      
      // Should not throw error
      await expect(batchAnalytics.cleanupOldData()).resolves.not.toThrow();
    });
  });

  describe('Processing Statistics', () => {
    it('should return processing statistics', () => {
      const stats = batchAnalytics.getProcessingStats();
      
      expect(stats).toHaveProperty('jobsCompleted');
      expect(stats).toHaveProperty('totalProcessingTime');
      expect(stats).toHaveProperty('errors');
      expect(stats).toHaveProperty('lastRun');
      expect(stats).toHaveProperty('activeJobs');
      expect(stats).toHaveProperty('averageProcessingTime');
    });

    it('should calculate average processing time correctly', async () => {
      // Simulate some processing
      batchAnalytics.processingStats.jobsCompleted = 2;
      batchAnalytics.processingStats.totalProcessingTime = 1000;
      
      const stats = batchAnalytics.getProcessingStats();
      expect(stats.averageProcessingTime).toBe(500);
    });
  });

  describe('Job Management', () => {
    it('should stop all jobs', () => {
      const stopSpy = jest.spyOn(batchAnalytics.jobs.get('daily-analytics'), 'stop');
      
      batchAnalytics.stopAllJobs();
      
      expect(stopSpy).toHaveBeenCalled();
      expect(batchAnalytics.jobs.size).toBe(0);
    });

    it('should run job manually', async () => {
      // Mock the job function
      const mockJob = {
        fireOnTick: jest.fn().mockResolvedValue(undefined)
      };
      
      batchAnalytics.jobs.set('test-job', mockJob);
      
      await batchAnalytics.runJobManually('test-job');
      
      expect(mockJob.fireOnTick).toHaveBeenCalled();
    });

    it('should handle manual job execution errors', async () => {
      // Mock a job that doesn't exist
      await expect(batchAnalytics.runJobManually('non-existent-job'))
        .rejects.toThrow('Job non-existent-job not found');
    });
  });

  describe('Error Handling', () => {
    it('should handle aggregation errors gracefully', async () => {
      // Mock a database error
      jest.spyOn(User, 'findAll').mockRejectedValueOnce(new Error('Database error'));
      
      await expect(batchAnalytics.processDailyAnalytics())
        .rejects.toThrow('Daily analytics processing failed');
    });

    it('should handle storage errors gracefully', async () => {
      // Mock a database error
      jest.spyOn(Analytics, 'create').mockRejectedValueOnce(new Error('Database error'));
      
      await expect(batchAnalytics.processDailyAnalytics())
        .rejects.toThrow('Daily analytics processing failed');
    });
  });
}); 