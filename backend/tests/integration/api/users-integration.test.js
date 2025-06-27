/**
 * User API Integration Tests
 * Tests complete user API workflows including authentication and database operations
 */

const request = require('supertest');
const app = require('../../../app');
const { User } = require('../../../models');
const IntegrationTestHelper = require('../../helpers/integration-setup');
const userFixtures = require('../../fixtures/users');

describe('User API Integration Tests', () => {
  let helper;
  let testUser;
  let sessionCookie;

  beforeAll(async () => {
    helper = new IntegrationTestHelper();
    await helper.setup();
  });

  afterAll(async () => {
    await helper.teardown();
  });

  beforeEach(async () => {
    await helper.clearDatabase();
    
    // Create test user and establish session
    testUser = await helper.createTestUser(userFixtures.validUser);
    
    // Simulate login to get session cookie
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        wallet_address: testUser.wallet_address,
        signature: 'mock-signature',
        message: 'mock-message'
      });

    if (loginResponse.headers['set-cookie']) {
      const setCookieHeader = loginResponse.headers['set-cookie'];
      const sessionCookieHeader = setCookieHeader.find(cookie => 
        cookie.includes('sid=')
      );
      if (sessionCookieHeader) {
        sessionCookie = sessionCookieHeader.split(';')[0];
      }
    }
  });

  describe('GET /api/users/profile', () => {
    it('should get user profile with valid session', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Cookie', sessionCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', testUser.id);
      expect(response.body.data).toHaveProperty('username', testUser.username);
      expect(response.body.data).toHaveProperty('wallet_address', testUser.wallet_address);
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should reject request without session', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Authentication');
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile with valid data', async () => {
      const updateData = {
        username: 'updateduser',
        bio: 'Updated bio',
        email: 'updated@example.com'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Cookie', sessionCookie)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.username).toBe(updateData.username);
      expect(response.body.data.bio).toBe(updateData.bio);
      expect(response.body.data.email).toBe(updateData.email);

      // Verify database was updated
      const updatedUser = await User.findByPk(testUser.id);
      expect(updatedUser.username).toBe(updateData.username);
      expect(updatedUser.bio).toBe(updateData.bio);
      expect(updatedUser.email).toBe(updateData.email);
    });

    it('should reject invalid email format', async () => {
      const invalidData = {
        email: 'invalid-email-format'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Cookie', sessionCookie)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject attempt to update wallet address', async () => {
      const invalidData = {
        wallet_address: 'NewWalletAddress1111111111111111111111111'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Cookie', sessionCookie)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('wallet address');
    });
  });

  describe('GET /api/users/communities', () => {
    it('should get user communities', async () => {
      // Create a community and add user as member
      const community = await helper.createTestCommunity(testUser.id);
      await helper.createTestMember(testUser.id, community.id, 'admin');

      const response = await request(app)
        .get('/api/users/communities')
        .set('Cookie', sessionCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.communities).toHaveLength(1);
      expect(response.body.data.communities[0]).toHaveProperty('id', community.id);
      expect(response.body.data.communities[0]).toHaveProperty('name', community.name);
    });

    it('should return empty array when user has no communities', async () => {
      const response = await request(app)
        .get('/api/users/communities')
        .set('Cookie', sessionCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.communities).toHaveLength(0);
    });
  });

  describe('GET /api/users/stats', () => {
    it('should get user statistics', async () => {
      // Create test data
      const community = await helper.createTestCommunity(testUser.id);
      await helper.createTestMember(testUser.id, community.id);
      const question = await helper.createTestQuestion(community.id, testUser.id);
      await helper.createTestVote(question.id, testUser.id);

      const response = await request(app)
        .get('/api/users/stats')
        .set('Cookie', sessionCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('communities_count');
      expect(response.body.data).toHaveProperty('votes_count');
      expect(response.body.data).toHaveProperty('questions_created');
      expect(response.body.data.communities_count).toBeGreaterThanOrEqual(1);
      expect(response.body.data.votes_count).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Mock database error
      const originalFindByPk = User.findByPk;
      User.findByPk = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/users/profile')
        .set('Cookie', sessionCookie)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Internal server error');

      // Restore original method
      User.findByPk = originalFindByPk;
    });

    it('should handle invalid session gracefully', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Cookie', 'sid=invalid-session-id')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Pagination', () => {
    it('should handle pagination for user communities', async () => {
      // Create multiple communities
      for (let i = 0; i < 5; i++) {
        const community = await helper.createTestCommunity(testUser.id, {
          name: `Test Community ${i + 1}`
        });
        await helper.createTestMember(testUser.id, community.id);
      }

      const response = await request(app)
        .get('/api/users/communities?page=1&limit=3')
        .set('Cookie', sessionCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.communities).toHaveLength(3);
      expect(response.body.data.pagination).toHaveProperty('page', 1);
      expect(response.body.data.pagination).toHaveProperty('limit', 3);
      expect(response.body.data.pagination).toHaveProperty('total', 5);
      expect(response.body.data.pagination).toHaveProperty('totalPages', 2);
    });
  });

  describe('Performance', () => {
    it('should handle concurrent requests', async () => {
      const promises = Array.from({ length: 5 }, () =>
        request(app)
          .get('/api/users/profile')
          .set('Cookie', sessionCookie)
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });

    it('should complete profile update within reasonable time', async () => {
      const startTime = Date.now();
      
      await request(app)
        .put('/api/users/profile')
        .set('Cookie', sessionCookie)
        .send({ username: 'performancetest' })
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });
  });
}); 