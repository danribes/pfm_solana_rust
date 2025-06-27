const { sequelize, User, Community, Member, VotingQuestion, Vote, Session, Analytics } = require('../../models');

describe('Database Schema Tests', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Table Creation', () => {
    test('should create all required tables', async () => {
      const tables = await sequelize.getQueryInterface().showAllTables();
      expect(tables).toContain('users');
      expect(tables).toContain('communities');
      expect(tables).toContain('members');
      expect(tables).toContain('voting_questions');
      expect(tables).toContain('votes');
      expect(tables).toContain('sessions');
      expect(tables).toContain('analytics');
    });
  });

  describe('User Table Constraints', () => {
    test('should enforce unique wallet_address constraint', async () => {
      const user1 = await User.create({
        wallet_address: 'TestWalletAddr00000000000000000000000000000001',
        username: 'testuser1',
      });
      
      await expect(User.create({
        wallet_address: 'TestWalletAddr00000000000000000000000000000001',
        username: 'testuser2',
      })).rejects.toThrow();
      
      await user1.destroy();
    });

    test('should enforce unique username constraint', async () => {
      const user1 = await User.create({
        wallet_address: 'TestWalletAddr00000000000000000000000000000002',
        username: 'testuser1',
      });
      
      await expect(User.create({
        wallet_address: 'TestWalletAddr00000000000000000000000000000003',
        username: 'testuser1',
      })).rejects.toThrow();
      
      await user1.destroy();
    });
  });

  describe('Foreign Key Relationships', () => {
    let testUser, testCommunity;

    beforeEach(async () => {
      testUser = await User.create({
        wallet_address: 'TestWalletAddr00000000000000000000000000000004',
        username: 'testuser3',
      });
      
      testCommunity = await Community.create({
        on_chain_id: 'TestCommunityChainAddr00000000000000000000000000000001',
        name: 'Test Community',
        created_by: testUser.id,
      });
    });

    afterEach(async () => {
      await testCommunity.destroy();
      await testUser.destroy();
    });

    test('should enforce community created_by foreign key', async () => {
      await expect(Community.create({
        on_chain_id: 'TestCommunityChainAddr00000000000000000000000000000002',
        name: 'Test Community 2',
        created_by: 'invalid-uuid',
      })).rejects.toThrow();
    });

    test('should enforce member user_id foreign key', async () => {
      await expect(Member.create({
        user_id: 'invalid-uuid',
        community_id: testCommunity.id,
        role: 'member',
        status: 'approved',
      })).rejects.toThrow();
    });

    test('should enforce member community_id foreign key', async () => {
      await expect(Member.create({
        user_id: testUser.id,
        community_id: 'invalid-uuid',
        role: 'member',
        status: 'approved',
      })).rejects.toThrow();
    });
  });

  describe('Data Type Validation', () => {
    test('should validate email format', async () => {
      await expect(User.create({
        wallet_address: 'TestWalletAddr00000000000000000000000000000005',
        username: 'testuser4',
        email: 'invalid-email',
      })).rejects.toThrow();
    });

    test('should validate member role enum', async () => {
      const testUser = await User.create({
        wallet_address: 'TestWalletAddr00000000000000000000000000000006',
        username: 'testuser5',
      });
      
      const testCommunity = await Community.create({
        on_chain_id: 'TestCommunityChainAddr00000000000000000000000000000003',
        name: 'Test Community 3',
        created_by: testUser.id,
      });

      await expect(Member.create({
        user_id: testUser.id,
        community_id: testCommunity.id,
        role: 'invalid_role',
        status: 'approved',
      })).rejects.toThrow();

      await testCommunity.destroy();
      await testUser.destroy();
    });

    test('should validate member status enum', async () => {
      const testUser = await User.create({
        wallet_address: 'TestWalletAddr00000000000000000000000000000007',
        username: 'testuser6',
      });
      
      const testCommunity = await Community.create({
        on_chain_id: 'TestCommunityChainAddr00000000000000000000000000000004',
        name: 'Test Community 4',
        created_by: testUser.id,
      });

      await expect(Member.create({
        user_id: testUser.id,
        community_id: testCommunity.id,
        role: 'member',
        status: 'invalid_status',
      })).rejects.toThrow();

      await testCommunity.destroy();
      await testUser.destroy();
    });
  });
}); 