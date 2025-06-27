const request = require('supertest');
const { app, initializeTestApp } = require('../../test-app');
const { User } = require('../../models');
const { v4: uuidv4 } = require('uuid');

describe('User Profile Management API', () => {
  let testUser, sessionCookie;

  beforeAll(async () => {
    // Initialize the test app
    await initializeTestApp();
    
    // Create test user
    testUser = await User.create({
      id: uuidv4(),
      username: 'testuser',
      email: 'test@example.com',
      wallet_address: '0x1234567890123456789012345678901234567890',
      bio: 'Test user bio',
      avatar_url: 'https://example.com/avatar.jpg',
      is_active: true
    });
  });

  afterAll(async () => {
    // Clean up test data
    await User.destroy({ where: {} });
  });

  beforeEach(async () => {
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
    
    // Debug log
    console.log('Login response status:', loginResponse.status);
    console.log('Login response body:', loginResponse.body);
    console.log('Set-Cookie headers:', setCookieHeader);
    console.log('Extracted sessionCookie:', sessionCookie);
    
    // Ensure we have a valid session cookie before proceeding
    if (!sessionCookie) {
      throw new Error('Failed to extract session cookie from login response');
    }
  });

  describe('GET /api/users/profile', () => {
    it('should return current user profile', async () => {
      const request_obj = request(app).get('/api/users/profile');
      
      if (sessionCookie) {
        request_obj.set('Cookie', sessionCookie);
      }

      const response = await request_obj;

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.profile).toBeDefined();
      expect(response.body.data.profile.id).toBe(testUser.id);
      expect(response.body.data.profile.username).toBe(testUser.username);
      expect(response.body.data.profile.email).toBe(testUser.email);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/users/profile');

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update current user profile', async () => {
      const updateData = {
        username: 'updateduser',
        email: 'updated@example.com',
        bio: 'Updated bio'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Cookie', sessionCookie)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Profile updated successfully');
      expect(response.body.data.user.username).toBe(updateData.username);
      expect(response.body.data.user.email).toBe(updateData.email);
    });

    it('should return 400 for invalid email format', async () => {
      const updateData = {
        email: 'invalid-email'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Cookie', sessionCookie)
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid email format');
    });

    it('should return 400 for invalid username format', async () => {
      const updateData = {
        username: 'a' // Too short
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Cookie', sessionCookie)
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Username must be between 3 and 20 characters');
    });

    it('should return 400 for username with invalid characters', async () => {
      const updateData = {
        username: 'user@name' // Invalid character
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Cookie', sessionCookie)
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Username can only contain letters, numbers, underscores, and hyphens');
    });
  });

  describe('GET /api/users/:id/profile', () => {
    it('should return public user profile', async () => {
      const response = await request(app)
        .get(`/api/users/${testUser.id}/profile`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.profile).toBeDefined();
      expect(response.body.data.profile.id).toBe(testUser.id);
      expect(response.body.data.profile.username).toBe(testUser.username);
      expect(response.body.data.profile.bio).toBe(testUser.bio);
      // Should not include sensitive information
      expect(response.body.data.profile.email).toBeUndefined();
      expect(response.body.data.profile.walletAddress).toBeUndefined();
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = uuidv4();
      const response = await request(app)
        .get(`/api/users/${fakeId}/profile`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 for inactive user', async () => {
      // Create inactive user
      const inactiveUser = await User.create({
        id: uuidv4(),
        username: 'inactiveuser',
        email: 'inactive@example.com',
        wallet_address: '0xabcdef1234567890abcdef1234567890abcdef12',
        is_active: false
      });

      const response = await request(app)
        .get(`/api/users/${inactiveUser.id}/profile`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not available');

      // Clean up
      await inactiveUser.destroy();
    });
  });

  describe('POST /api/users/profile/avatar', () => {
    it('should upload profile avatar', async () => {
      const avatarData = {
        url: 'https://example.com/new-avatar.jpg'
      };

      const response = await request(app)
        .post('/api/users/profile/avatar')
        .set('Cookie', sessionCookie)
        .send(avatarData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Avatar uploaded successfully');
      expect(response.body.data.avatarUrl).toBe(avatarData.url);
    });

    it('should return 400 for missing avatar URL', async () => {
      const response = await request(app)
        .post('/api/users/profile/avatar')
        .set('Cookie', sessionCookie)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Avatar URL is required');
    });
  });

  describe('DELETE /api/users/profile/avatar', () => {
    it('should remove profile avatar', async () => {
      const response = await request(app)
        .delete('/api/users/profile/avatar')
        .set('Cookie', sessionCookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Avatar removed successfully');
    });
  });

  describe('GET /api/users/preferences', () => {
    it('should return user preferences', async () => {
      const response = await request(app)
        .get('/api/users/preferences')
        .set('Cookie', sessionCookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.preferences).toBeDefined();
      expect(response.body.data.preferences.theme).toBeDefined();
      expect(response.body.data.preferences.language).toBeDefined();
    });
  });

  describe('PUT /api/users/preferences', () => {
    it('should update user preferences', async () => {
      const preferencesData = {
        theme: 'dark',
        language: 'en',
        emailNotifications: false,
        pushNotifications: true
      };

      const response = await request(app)
        .put('/api/users/preferences')
        .set('Cookie', sessionCookie)
        .send(preferencesData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Preferences updated successfully');
      expect(response.body.data.preferences).toEqual(preferencesData);
    });

    it('should return 400 for invalid theme', async () => {
      const preferencesData = {
        theme: 'invalid-theme'
      };

      const response = await request(app)
        .put('/api/users/preferences')
        .set('Cookie', sessionCookie)
        .send(preferencesData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid theme');
    });
  });

  describe('GET /api/users/notifications', () => {
    it('should return notification settings', async () => {
      const response = await request(app)
        .get('/api/users/notifications')
        .set('Cookie', sessionCookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.settings).toBeDefined();
      expect(response.body.data.settings.emailNotifications).toBeDefined();
      expect(response.body.data.settings.pushNotifications).toBeDefined();
    });
  });

  describe('PUT /api/users/notifications', () => {
    it('should update notification settings', async () => {
      const settingsData = {
        emailNotifications: {
          enabled: true,
          communityUpdates: true,
          votingReminders: false
        },
        frequency: 'daily'
      };

      const response = await request(app)
        .put('/api/users/notifications')
        .set('Cookie', sessionCookie)
        .send(settingsData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Notification settings updated successfully');
    });

    it('should return 400 for invalid frequency', async () => {
      const settingsData = {
        frequency: 'invalid-frequency'
      };

      const response = await request(app)
        .put('/api/users/notifications')
        .set('Cookie', sessionCookie)
        .send(settingsData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid notification frequency');
    });

    it('should return 400 for invalid quiet hours time format', async () => {
      const settingsData = {
        quietHours: {
          enabled: true,
          start: '25:00', // Invalid time
          end: '08:00'
        }
      };

      const response = await request(app)
        .put('/api/users/notifications')
        .set('Cookie', sessionCookie)
        .send(settingsData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid quiet hours start time');
    });
  });

  describe('GET /api/users/search', () => {
    beforeEach(async () => {
      // Create additional test users
      await User.bulkCreate([
        {
          id: uuidv4(),
          username: 'searchuser1',
          email: 'search1@example.com',
          wallet_address: '0x1111111111111111111111111111111111111111',
          bio: 'First search user',
          is_active: true
        },
        {
          id: uuidv4(),
          username: 'searchuser2',
          email: 'search2@example.com',
          wallet_address: '0x2222222222222222222222222222222222222222',
          bio: 'Second search user',
          is_active: true
        }
      ]);
    });

    it('should search users by query', async () => {
      const response = await request(app)
        .get('/api/users/search')
        .query({ q: 'searchuser' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toBeDefined();
      expect(response.body.data.users.length).toBeGreaterThan(0);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should return paginated results', async () => {
      const response = await request(app)
        .get('/api/users/search')
        .query({ page: 1, limit: 2 });

      expect(response.status).toBe(200);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(2);
    });

    it('should filter by includeInactive', async () => {
      // Create inactive user
      await User.create({
        id: uuidv4(),
        username: 'inactivesearch',
        email: 'inactive@example.com',
        wallet_address: '0x3333333333333333333333333333333333333333',
        is_active: false
      });

      const response = await request(app)
        .get('/api/users/search')
        .query({ includeInactive: 'true' });

      expect(response.status).toBe(200);
      expect(response.body.data.users.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/users/deactivate', () => {
    it('should deactivate user account', async () => {
      const response = await request(app)
        .post('/api/users/deactivate')
        .set('Cookie', sessionCookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Account deactivated successfully');

      // Verify user is deactivated
      const updatedUser = await User.findByPk(testUser.id);
      expect(updatedUser.is_active).toBe(false);
    });
  });

  describe('POST /api/users/:id/reactivate', () => {
    it('should reactivate user account', async () => {
      // First deactivate the user
      await testUser.update({ is_active: false });

      const response = await request(app)
        .post(`/api/users/${testUser.id}/reactivate`)
        .set('Cookie', sessionCookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Account reactivated successfully');

      // Verify user is reactivated
      const updatedUser = await User.findByPk(testUser.id);
      expect(updatedUser.is_active).toBe(true);
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = uuidv4();
      const response = await request(app)
        .post(`/api/users/${fakeId}/reactivate`)
        .set('Cookie', sessionCookie);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
}); 