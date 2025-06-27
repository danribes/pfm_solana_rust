const request = require('supertest');
const { app, initializeTestApp } = require('../../test-app');
const { User, Community, Member, VotingQuestion, Vote, Analytics } = require('../../models');
const { v4: uuidv4 } = require('uuid');

// Mock dependencies
jest.mock('../../controllers/analytics');

// Import mocked controller
const analyticsController = require('../../controllers/analytics');

describe('Analytics API Endpoints', () => {
  let testUser, testCommunity, testQuestion, sessionCookie;

  beforeAll(async () => {
    // Initialize the test app
    await initializeTestApp();
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
      id: uuidv4(),
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

    // Create a vote
    await Vote.create({
      question_id: testQuestion.id,
      user_id: testUser.id,
      selected_options: JSON.stringify({ option: 'Option 1' }),
      transaction_signature: 'test-signature'
    });

    // Login as test user to get session
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        walletAddress: testUser.wallet_address
      });

    // Extract session cookie from set-cookie header
    const setCookieHeader = loginResponse.headers['set-cookie'];
    sessionCookie = null; // Reset to null first
    
    if (setCookieHeader && setCookieHeader.length > 0) {
      // Find the session cookie (usually starts with 'sid=' or similar)
      const sessionCookieHeader = setCookieHeader.find(cookie => 
        cookie.includes('sid=') || cookie.includes('session')
      );
      if (sessionCookieHeader) {
        sessionCookie = sessionCookieHeader.split(';')[0]; // Get just the cookie part
      }
    }

    // Setup mock implementations for controller methods
    analyticsController.getCommunityAnalytics = jest.fn().mockImplementation((req, res) => {
      res.json({
        success: true,
        data: {
          community_growth: [],
          member_engagement: {},
          activity_metrics: [],
          generated_at: new Date().toISOString()
        },
        message: 'Community analytics retrieved successfully'
      });
    });

    analyticsController.getCommunityOverview = jest.fn().mockImplementation((req, res) => {
      res.json({
        success: true,
        data: {
          community: { id: testCommunity.id, name: 'Test Community' },
          member_statistics: [],
          voting_statistics: {},
          recent_activity: [],
          generated_at: new Date().toISOString()
        },
        message: 'Community overview retrieved successfully'
      });
    });

    analyticsController.getMemberEngagement = jest.fn().mockImplementation((req, res) => {
      res.json({
        success: true,
        data: {
          member_growth: [],
          member_activity: [],
          member_retention: [],
          generated_at: new Date().toISOString()
        },
        message: 'Member engagement analytics retrieved successfully'
      });
    });

    analyticsController.getVotingAnalytics = jest.fn().mockImplementation((req, res) => {
      res.json({
        success: true,
        data: {
          participation_rates: {},
          voting_trends: [],
          question_analytics: [],
          generated_at: new Date().toISOString()
        },
        message: 'Voting analytics retrieved successfully'
      });
    });

    analyticsController.getQuestionAnalytics = jest.fn().mockImplementation((req, res) => {
      res.json({
        success: true,
        data: {
          question: { id: testQuestion.id, title: 'Test Question' },
          vote_distribution: [],
          voting_timeline: [],
          participation_rate: 0,
          generated_at: new Date().toISOString()
        },
        message: 'Question analytics retrieved successfully'
      });
    });

    analyticsController.getUserAnalytics = jest.fn().mockImplementation((req, res) => {
      res.json({
        success: true,
        data: {
          user_activity: [],
          user_engagement: [],
          user_retention: [],
          generated_at: new Date().toISOString()
        },
        message: 'User analytics retrieved successfully'
      });
    });

    analyticsController.getCacheStats = jest.fn().mockImplementation((req, res) => {
      res.json({
        success: true,
        data: {
          total_keys: 0,
          memory_usage: 0,
          key_patterns: {}
        },
        message: 'Cache statistics retrieved successfully'
      });
    });

    analyticsController.clearCache = jest.fn().mockImplementation((req, res) => {
      res.json({
        success: true,
        message: 'Analytics cache cleared successfully'
      });
    });

    analyticsController.generateCommunityReport = jest.fn().mockImplementation((req, res) => {
      res.json({
        success: true,
        data: {
          filename: 'test-report.json',
          url: '/reports/test-report.json'
        },
        message: 'Community report generated successfully'
      });
    });

    analyticsController.generateVotingReport = jest.fn().mockImplementation((req, res) => {
      res.json({
        success: true,
        data: {
          filename: 'test-voting-report.csv',
          url: '/reports/test-voting-report.csv'
        },
        message: 'Voting report generated successfully'
      });
    });

    analyticsController.generateCustomReport = jest.fn().mockImplementation((req, res) => {
      res.json({
        success: true,
        data: {
          filename: 'test-custom-report.json',
          url: '/reports/test-custom-report.json'
        },
        message: 'Custom report generated successfully'
      });
    });

    analyticsController.listReports = jest.fn().mockImplementation((req, res) => {
      res.json({
        success: true,
        data: [
          'test-report.json',
          'test-voting-report.csv'
        ],
        message: 'Reports listed successfully'
      });
    });

    analyticsController.downloadReport = jest.fn().mockImplementation((req, res) => {
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', 'attachment; filename="test-report.json"');
      res.send('{"test": "data"}');
    });

    analyticsController.deleteReport = jest.fn().mockImplementation((req, res) => {
      res.json({
        success: true,
        data: true,
        message: 'Report deleted successfully'
      });
    });

    analyticsController.getReportTypes = jest.fn().mockImplementation((req, res) => {
      res.json({
        success: true,
        data: {
          report_types: ['community_overview', 'voting_summary', 'user_activity'],
          export_formats: ['json', 'csv', 'pdf']
        },
        message: 'Available report types and formats retrieved successfully'
      });
    });
  });

  describe('GET /api/analytics/communities', () => {
    it('should return community analytics', async () => {
      const response = await request(app)
        .get('/api/analytics/communities')
        .set('Cookie', sessionCookie)
        .query({
          start_date: '2024-01-01T00:00:00Z',
          end_date: '2024-12-31T23:59:59Z',
          limit: 10
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message');
    });

    it('should handle invalid date parameters', async () => {
      const response = await request(app)
        .get('/api/analytics/communities')
        .query({
          start_date: 'invalid-date',
          end_date: 'invalid-date'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
    });

    it('should handle invalid limit parameter', async () => {
      const response = await request(app)
        .get('/api/analytics/communities')
        .query({
          limit: 1000 // Exceeds maximum
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/analytics/communities/:id/overview', () => {
    it('should return community overview', async () => {
      const response = await request(app)
        .get(`/api/analytics/communities/${testCommunity.id}/overview`)
        .query({
          start_date: '2024-01-01T00:00:00Z',
          end_date: '2024-12-31T23:59:59Z'
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message');
    });

    it('should handle invalid community ID', async () => {
      const response = await request(app)
        .get('/api/analytics/communities/invalid-uuid/overview')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
    });

    it('should handle non-existent community', async () => {
      const response = await request(app)
        .get('/api/analytics/communities/00000000-0000-0000-0000-000000000000/overview')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Community not found');
    });
  });

  describe('GET /api/analytics/communities/:id/members', () => {
    it('should return member engagement analytics', async () => {
      const response = await request(app)
        .get(`/api/analytics/communities/${testCommunity.id}/members`)
        .query({
          start_date: '2024-01-01T00:00:00Z',
          end_date: '2024-12-31T23:59:59Z'
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message');
    });

    it('should handle invalid community ID', async () => {
      const response = await request(app)
        .get('/api/analytics/communities/invalid-uuid/members')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/analytics/voting/participation', () => {
    it('should return voting analytics', async () => {
      const response = await request(app)
        .get('/api/analytics/voting/participation')
        .query({
          start_date: '2024-01-01T00:00:00Z',
          end_date: '2024-12-31T23:59:59Z',
          community_id: testCommunity.id
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message');
    });

    it('should handle invalid date parameters', async () => {
      const response = await request(app)
        .get('/api/analytics/voting/participation')
        .query({
          start_date: 'invalid-date',
          end_date: 'invalid-date'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/analytics/voting/questions/:id', () => {
    it('should return question-specific analytics', async () => {
      const response = await request(app)
        .get(`/api/analytics/voting/questions/${testQuestion.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message');
    });

    it('should handle invalid question ID', async () => {
      const response = await request(app)
        .get('/api/analytics/voting/questions/invalid-uuid')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
    });

    it('should handle non-existent question', async () => {
      const response = await request(app)
        .get('/api/analytics/voting/questions/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Question not found');
    });
  });

  describe('GET /api/analytics/users/activity', () => {
    it('should return user analytics', async () => {
      const response = await request(app)
        .get('/api/analytics/users/activity')
        .query({
          start_date: '2024-01-01T00:00:00Z',
          end_date: '2024-12-31T23:59:59Z'
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message');
    });

    it('should handle invalid date parameters', async () => {
      const response = await request(app)
        .get('/api/analytics/users/activity')
        .query({
          start_date: 'invalid-date',
          end_date: 'invalid-date'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('POST /api/analytics/reports/communities/:id', () => {
    it('should generate community report', async () => {
      const response = await request(app)
        .post(`/api/analytics/reports/communities/${testCommunity.id}`)
        .send({
          format: 'json',
          start_date: '2024-01-01T00:00:00Z',
          end_date: '2024-12-31T23:59:59Z',
          filename: 'test-community-report.json'
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message');
    });

    it('should handle invalid format', async () => {
      const response = await request(app)
        .post(`/api/analytics/reports/communities/${testCommunity.id}`)
        .send({
          format: 'invalid-format'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
    });

    it('should handle invalid community ID', async () => {
      const response = await request(app)
        .post('/api/analytics/reports/communities/invalid-uuid')
        .send({
          format: 'json'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('POST /api/analytics/reports/voting', () => {
    it('should generate voting report', async () => {
      const response = await request(app)
        .post('/api/analytics/reports/voting')
        .send({
          format: 'csv',
          start_date: '2024-01-01T00:00:00Z',
          end_date: '2024-12-31T23:59:59Z',
          community_id: testCommunity.id,
          filename: 'test-voting-report.csv'
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message');
    });

    it('should handle invalid format', async () => {
      const response = await request(app)
        .post('/api/analytics/reports/voting')
        .send({
          format: 'invalid-format'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('POST /api/analytics/reports/generate', () => {
    it('should generate custom report', async () => {
      const response = await request(app)
        .post('/api/analytics/reports/generate')
        .send({
          reportType: 'community_overview',
          filters: {
            communityId: testCommunity.id,
            start_date: '2024-01-01T00:00:00Z',
            end_date: '2024-12-31T23:59:59Z'
          },
          customMetrics: [
            { name: 'total_users', type: 'user_count' },
            { name: 'total_votes', type: 'vote_count' }
          ],
          format: 'json',
          filename: 'test-custom-report.json'
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message');
    });

    it('should handle invalid report type', async () => {
      const response = await request(app)
        .post('/api/analytics/reports/generate')
        .send({
          reportType: 'invalid_type'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
    });

    it('should handle invalid format', async () => {
      const response = await request(app)
        .post('/api/analytics/reports/generate')
        .send({
          reportType: 'community_overview',
          format: 'invalid-format'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/analytics/reports', () => {
    it('should list available reports', async () => {
      const response = await request(app)
        .get('/api/analytics/reports')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/analytics/reports/:filename', () => {
    it('should download report', async () => {
      const response = await request(app)
        .get('/api/analytics/reports/test-report.json')
        .expect(200);

      expect(response.headers['content-type']).toContain('application/octet-stream');
      expect(response.headers['content-disposition']).toContain('attachment');
    });

    it('should handle invalid filename', async () => {
      const response = await request(app)
        .get('/api/analytics/reports/')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('DELETE /api/analytics/reports/:filename', () => {
    it('should delete report', async () => {
      const response = await request(app)
        .delete('/api/analytics/reports/test-report.json')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message');
    });

    it('should handle invalid filename', async () => {
      const response = await request(app)
        .delete('/api/analytics/reports/')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/analytics/cache/stats', () => {
    it('should return cache statistics', async () => {
      const response = await request(app)
        .get('/api/analytics/cache/stats')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/analytics/cache/clear', () => {
    it('should clear analytics cache', async () => {
      const response = await request(app)
        .post('/api/analytics/cache/clear')
        .send({
          pattern: 'analytics:*'
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
    });

    it('should handle invalid pattern', async () => {
      const response = await request(app)
        .post('/api/analytics/cache/clear')
        .send({
          pattern: 123 // Invalid type
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/analytics/report-types', () => {
    it('should return available report types and formats', async () => {
      const response = await request(app)
        .get('/api/analytics/report-types')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('report_types');
      expect(response.body.data).toHaveProperty('export_formats');
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication errors', async () => {
      // Mock authentication failure
      const authMiddleware = require('../../middleware/auth');
      authMiddleware.authenticateUser = jest.fn((req, res, next) => {
        res.status(401).json({ error: 'Unauthorized' });
      });

      const response = await request(app)
        .get('/api/analytics/communities')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });

    it('should handle service errors gracefully', async () => {
      // Mock service error
      const analyticsController = require('../../controllers/analytics');
      analyticsController.getCommunityAnalytics = jest.fn().mockRejectedValue(
        new Error('Service error')
      );

      const response = await request(app)
        .get('/api/analytics/communities')
        .set('Cookie', sessionCookie)
        .expect(500);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('error');
    });
  });
}); 