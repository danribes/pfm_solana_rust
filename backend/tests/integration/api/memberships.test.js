const request = require('supertest');
const app = require('../../app');
const { Member, Community, User } = require('../../models');
const { v4: uuidv4 } = require('uuid');

describe('Membership Management API', () => {
  let testUser, testCommunity, testMembership;
  let adminUser, adminMembership;
  let sessionCookie;

  beforeAll(async () => {
    // Create test user
    testUser = await User.create({
      id: uuidv4(),
      username: 'testuser',
      email: 'test@example.com',
      wallet_address: 'test_wallet_123'
    });

    // Create admin user
    adminUser = await User.create({
      id: uuidv4(),
      username: 'adminuser',
      email: 'admin@example.com',
      wallet_address: 'admin_wallet_456'
    });

    // Create test community
    testCommunity = await Community.create({
      id: uuidv4(),
      name: 'Test Community',
      description: 'A test community',
      created_by: adminUser.id,
      is_active: true,
      require_approval: true,
      max_members: 100
    });

    // Create admin membership
    adminMembership = await Member.create({
      id: uuidv4(),
      user_id: adminUser.id,
      community_id: testCommunity.id,
      role: 'admin',
      status: 'approved',
      joined_at: new Date(),
      approved_at: new Date(),
      approved_by: adminUser.id
    });
  });

  afterAll(async () => {
    // Clean up test data
    await Member.destroy({ where: {} });
    await Community.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  beforeEach(async () => {
    // Login as test user to get session
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        walletAddress: testUser.wallet_address
      });

    sessionCookie = loginResponse.headers['set-cookie'];
  });

  describe('POST /api/communities/:id/members', () => {
    it('should allow user to apply to join a community', async () => {
      const response = await request(app)
        .post(`/api/communities/${testCommunity.id}/members`)
        .set('Cookie', sessionCookie)
        .send({});

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.membership).toBeDefined();
      expect(response.body.data.membership.status).toBe('pending');
      expect(response.body.data.membership.user_id).toBe(testUser.id);
      expect(response.body.data.membership.community_id).toBe(testCommunity.id);
    });

    it('should return 409 if user already has membership', async () => {
      // Create existing membership
      await Member.create({
        id: uuidv4(),
        user_id: testUser.id,
        community_id: testCommunity.id,
        role: 'member',
        status: 'pending',
        joined_at: new Date()
      });

      const response = await request(app)
        .post(`/api/communities/${testCommunity.id}/members`)
        .set('Cookie', sessionCookie)
        .send({});

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('already has a membership');
    });

    it('should return 404 for non-existent community', async () => {
      const fakeId = uuidv4();
      const response = await request(app)
        .post(`/api/communities/${fakeId}/members`)
        .set('Cookie', sessionCookie)
        .send({});

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post(`/api/communities/${testCommunity.id}/members`)
        .send({});

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/communities/:id/members', () => {
    beforeEach(async () => {
      // Create some test memberships
      await Member.bulkCreate([
        {
          id: uuidv4(),
          user_id: testUser.id,
          community_id: testCommunity.id,
          role: 'member',
          status: 'approved',
          joined_at: new Date(),
          approved_at: new Date(),
          approved_by: adminUser.id
        },
        {
          id: uuidv4(),
          user_id: uuidv4(),
          community_id: testCommunity.id,
          role: 'moderator',
          status: 'approved',
          joined_at: new Date(),
          approved_at: new Date(),
          approved_by: adminUser.id
        }
      ]);
    });

    it('should return community members with pagination', async () => {
      const response = await request(app)
        .get(`/api/communities/${testCommunity.id}/members`)
        .set('Cookie', sessionCookie)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.members).toBeDefined();
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.pagination.page).toBe(1);
    });

    it('should filter members by status', async () => {
      const response = await request(app)
        .get(`/api/communities/${testCommunity.id}/members`)
        .set('Cookie', sessionCookie)
        .query({ status: 'approved' });

      expect(response.status).toBe(200);
      expect(response.body.data.members.every(m => m.status === 'approved')).toBe(true);
    });

    it('should filter members by role', async () => {
      const response = await request(app)
        .get(`/api/communities/${testCommunity.id}/members`)
        .set('Cookie', sessionCookie)
        .query({ role: 'moderator' });

      expect(response.status).toBe(200);
      expect(response.body.data.members.every(m => m.role === 'moderator')).toBe(true);
    });
  });

  describe('GET /api/communities/:id/members/pending', () => {
    beforeEach(async () => {
      // Create pending membership
      await Member.create({
        id: uuidv4(),
        user_id: testUser.id,
        community_id: testCommunity.id,
        role: 'member',
        status: 'pending',
        joined_at: new Date()
      });
    });

    it('should return pending applications for admin/owner', async () => {
      // Login as admin
      const adminLoginResponse = await request(app)
        .post('/auth/login')
        .send({
          walletAddress: adminUser.wallet_address
        });

      const adminSessionCookie = adminLoginResponse.headers['set-cookie'];

      const response = await request(app)
        .get(`/api/communities/${testCommunity.id}/members/pending`)
        .set('Cookie', adminSessionCookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.applications).toBeDefined();
      expect(response.body.data.applications.every(a => a.status === 'pending')).toBe(true);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get(`/api/communities/${testCommunity.id}/members/pending`)
        .set('Cookie', sessionCookie);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/memberships', () => {
    beforeEach(async () => {
      // Create test memberships for the user
      await Member.bulkCreate([
        {
          id: uuidv4(),
          user_id: testUser.id,
          community_id: testCommunity.id,
          role: 'member',
          status: 'approved',
          joined_at: new Date(),
          approved_at: new Date(),
          approved_by: adminUser.id
        },
        {
          id: uuidv4(),
          user_id: testUser.id,
          community_id: uuidv4(),
          role: 'admin',
          status: 'pending',
          joined_at: new Date()
        }
      ]);
    });

    it('should return user memberships across communities', async () => {
      const response = await request(app)
        .get('/api/memberships')
        .set('Cookie', sessionCookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.memberships).toBeDefined();
      expect(response.body.data.memberships.every(m => m.user_id === testUser.id)).toBe(true);
    });

    it('should filter memberships by status', async () => {
      const response = await request(app)
        .get('/api/memberships')
        .set('Cookie', sessionCookie)
        .query({ status: 'pending' });

      expect(response.status).toBe(200);
      expect(response.body.data.memberships.every(m => m.status === 'pending')).toBe(true);
    });
  });

  describe('PUT /api/communities/:id/members/:memberId/approve', () => {
    let pendingMembership;

    beforeEach(async () => {
      // Create pending membership
      pendingMembership = await Member.create({
        id: uuidv4(),
        user_id: testUser.id,
        community_id: testCommunity.id,
        role: 'member',
        status: 'pending',
        joined_at: new Date()
      });
    });

    it('should allow admin to approve member', async () => {
      // Login as admin
      const adminLoginResponse = await request(app)
        .post('/auth/login')
        .send({
          walletAddress: adminUser.wallet_address
        });

      const adminSessionCookie = adminLoginResponse.headers['set-cookie'];

      const response = await request(app)
        .put(`/api/communities/${testCommunity.id}/members/${pendingMembership.id}/approve`)
        .set('Cookie', adminSessionCookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.membership.status).toBe('approved');
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .put(`/api/communities/${testCommunity.id}/members/${pendingMembership.id}/approve`)
        .set('Cookie', sessionCookie);

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent membership', async () => {
      // Login as admin
      const adminLoginResponse = await request(app)
        .post('/auth/login')
        .send({
          walletAddress: adminUser.wallet_address
        });

      const adminSessionCookie = adminLoginResponse.headers['set-cookie'];

      const fakeId = uuidv4();
      const response = await request(app)
        .put(`/api/communities/${testCommunity.id}/members/${fakeId}/approve`)
        .set('Cookie', adminSessionCookie);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/communities/:id/members/:memberId/reject', () => {
    let pendingMembership;

    beforeEach(async () => {
      // Create pending membership
      pendingMembership = await Member.create({
        id: uuidv4(),
        user_id: testUser.id,
        community_id: testCommunity.id,
        role: 'member',
        status: 'pending',
        joined_at: new Date()
      });
    });

    it('should allow admin to reject member', async () => {
      // Login as admin
      const adminLoginResponse = await request(app)
        .post('/auth/login')
        .send({
          walletAddress: adminUser.wallet_address
        });

      const adminSessionCookie = adminLoginResponse.headers['set-cookie'];

      const response = await request(app)
        .put(`/api/communities/${testCommunity.id}/members/${pendingMembership.id}/reject`)
        .set('Cookie', adminSessionCookie)
        .send({ reason: 'Not a good fit' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.membership.status).toBe('rejected');
    });
  });

  describe('PUT /api/communities/:id/members/:memberId/remove', () => {
    let approvedMembership;

    beforeEach(async () => {
      // Create approved membership
      approvedMembership = await Member.create({
        id: uuidv4(),
        user_id: testUser.id,
        community_id: testCommunity.id,
        role: 'member',
        status: 'approved',
        joined_at: new Date(),
        approved_at: new Date(),
        approved_by: adminUser.id
      });
    });

    it('should allow admin to remove member', async () => {
      // Login as admin
      const adminLoginResponse = await request(app)
        .post('/auth/login')
        .send({
          walletAddress: adminUser.wallet_address
        });

      const adminSessionCookie = adminLoginResponse.headers['set-cookie'];

      const response = await request(app)
        .put(`/api/communities/${testCommunity.id}/members/${approvedMembership.id}/remove`)
        .set('Cookie', adminSessionCookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.membership.status).toBe('banned');
    });
  });

  describe('PUT /api/communities/:id/members/:memberId/role', () => {
    let approvedMembership;

    beforeEach(async () => {
      // Create approved membership
      approvedMembership = await Member.create({
        id: uuidv4(),
        user_id: testUser.id,
        community_id: testCommunity.id,
        role: 'member',
        status: 'approved',
        joined_at: new Date(),
        approved_at: new Date(),
        approved_by: adminUser.id
      });
    });

    it('should allow admin to change member role', async () => {
      // Login as admin
      const adminLoginResponse = await request(app)
        .post('/auth/login')
        .send({
          walletAddress: adminUser.wallet_address
        });

      const adminSessionCookie = adminLoginResponse.headers['set-cookie'];

      const response = await request(app)
        .put(`/api/communities/${testCommunity.id}/members/${approvedMembership.id}/role`)
        .set('Cookie', adminSessionCookie)
        .send({ role: 'moderator' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.membership.role).toBe('moderator');
    });

    it('should return 400 for invalid role', async () => {
      // Login as admin
      const adminLoginResponse = await request(app)
        .post('/auth/login')
        .send({
          walletAddress: adminUser.wallet_address
        });

      const adminSessionCookie = adminLoginResponse.headers['set-cookie'];

      const response = await request(app)
        .put(`/api/communities/${testCommunity.id}/members/${approvedMembership.id}/role`)
        .set('Cookie', adminSessionCookie)
        .send({ role: 'invalid_role' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/communities/:id/members/:memberId/status', () => {
    let testMembership;

    beforeEach(async () => {
      // Create test membership
      testMembership = await Member.create({
        id: uuidv4(),
        user_id: testUser.id,
        community_id: testCommunity.id,
        role: 'member',
        status: 'approved',
        joined_at: new Date(),
        approved_at: new Date(),
        approved_by: adminUser.id
      });
    });

    it('should return member status for community members', async () => {
      const response = await request(app)
        .get(`/api/communities/${testCommunity.id}/members/${testMembership.id}/status`)
        .set('Cookie', sessionCookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.membership).toBeDefined();
      expect(response.body.data.membership.id).toBe(testMembership.id);
    });
  });

  describe('PUT /api/communities/:id/members/:memberId/status', () => {
    let testMembership;

    beforeEach(async () => {
      // Create test membership
      testMembership = await Member.create({
        id: uuidv4(),
        user_id: testUser.id,
        community_id: testCommunity.id,
        role: 'member',
        status: 'approved',
        joined_at: new Date(),
        approved_at: new Date(),
        approved_by: adminUser.id
      });
    });

    it('should allow admin to update member status', async () => {
      // Login as admin
      const adminLoginResponse = await request(app)
        .post('/auth/login')
        .send({
          walletAddress: adminUser.wallet_address
        });

      const adminSessionCookie = adminLoginResponse.headers['set-cookie'];

      const response = await request(app)
        .put(`/api/communities/${testCommunity.id}/members/${testMembership.id}/status`)
        .set('Cookie', adminSessionCookie)
        .send({ status: 'banned' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.membership.status).toBe('banned');
    });
  });

  describe('GET /api/memberships/:id/history', () => {
    let testMembership;

    beforeEach(async () => {
      // Create test membership
      testMembership = await Member.create({
        id: uuidv4(),
        user_id: testUser.id,
        community_id: testCommunity.id,
        role: 'member',
        status: 'approved',
        joined_at: new Date(),
        approved_at: new Date(),
        approved_by: adminUser.id
      });
    });

    it('should return membership history', async () => {
      const response = await request(app)
        .get(`/api/memberships/${testMembership.id}/history`)
        .set('Cookie', sessionCookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.membership).toBeDefined();
      expect(response.body.data.history).toBeDefined();
      expect(Array.isArray(response.body.data.history)).toBe(true);
    });
  });

  describe('GET /api/communities/:id/members/count', () => {
    beforeEach(async () => {
      // Create some test memberships
      await Member.bulkCreate([
        {
          id: uuidv4(),
          user_id: testUser.id,
          community_id: testCommunity.id,
          role: 'member',
          status: 'approved',
          joined_at: new Date(),
          approved_at: new Date(),
          approved_by: adminUser.id
        },
        {
          id: uuidv4(),
          user_id: uuidv4(),
          community_id: testCommunity.id,
          role: 'member',
          status: 'pending',
          joined_at: new Date()
        }
      ]);
    });

    it('should return member count', async () => {
      const response = await request(app)
        .get(`/api/communities/${testCommunity.id}/members/count`)
        .set('Cookie', sessionCookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.count).toBeDefined();
      expect(typeof response.body.data.count).toBe('number');
    });

    it('should filter count by status', async () => {
      const response = await request(app)
        .get(`/api/communities/${testCommunity.id}/members/count`)
        .set('Cookie', sessionCookie)
        .query({ status: 'approved' });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('approved');
    });
  });
}); 