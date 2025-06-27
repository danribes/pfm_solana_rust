/**
 * Unit tests for Community model
 */

const { User, Community, Member, VotingQuestion, Vote } = require('../../../models');
const { sequelize } = require('../../../models');

describe('Community Model', () => {
  let testUser;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await User.destroy({ where: {} });
    await Community.destroy({ where: {} });
    await Member.destroy({ where: {} });
    await VotingQuestion.destroy({ where: {} });
    await Vote.destroy({ where: {} });

    testUser = await User.create({
      wallet_address: 'test-wallet-123',
      username: 'testuser',
      email: 'test@example.com',
      is_active: true
    });
  });

  describe('Validation', () => {
    it('should create a valid community', async () => {
      const communityData = {
        on_chain_id: 'test-community-123',
        on_chain_id: 'test-community-123',
        name: 'Test Community',
        description: 'Test community description',
        created_by: testUser.id,
        is_active: true
      };

      const community = await Community.create(communityData);
      
      expect(community.id).toBeDefined();
      expect(community.name).toBe(communityData.name);
      expect(community.description).toBe(communityData.description);
      expect(community.created_by).toBe(communityData.created_by);
      expect(community.is_active).toBe(communityData.is_active);
      expect(community.created_at).toBeDefined();
      expect(community.updated_at).toBeDefined();
    });

    it('should require name', async () => {
      const communityData = {
        description: 'Test community description',
        created_by: testUser.id,
        is_active: true
      };

      await expect(Community.create(communityData)).rejects.toThrow();
    });

    it('should require created_by', async () => {
      const communityData = {
        on_chain_id: 'test-community-123',
        name: 'Test Community',
        description: 'Test community description',
        is_active: true
      };

      await expect(Community.create(communityData)).rejects.toThrow();
    });

    it('should require unique name', async () => {
      const communityData = {
        on_chain_id: 'test-community-123',
        on_chain_id: 'test-community-123',
        name: 'Test Community',
        description: 'Test community description',
        created_by: testUser.id,
        is_active: true
      };

      await Community.create(communityData);
      
      await expect(Community.create(communityData)).rejects.toThrow();
    });

    it('should validate name length', async () => {
      const communityData = {
        on_chain_id: 'test-community-123',
        name: 'A'.repeat(256), // Too long
        description: 'Test community description',
        created_by: testUser.id,
        is_active: true
      };

      await expect(Community.create(communityData)).rejects.toThrow();
    });

    it('should validate description length', async () => {
      const communityData = {
        on_chain_id: 'test-community-123',
        on_chain_id: 'test-community-123',
        name: 'Test Community',
        description: 'A'.repeat(1001), // Too long
        created_by: testUser.id,
        is_active: true
      };

      await expect(Community.create(communityData)).rejects.toThrow();
    });

    it('should set default values', async () => {
      const communityData = {
        on_chain_id: 'test-community-123',
        on_chain_id: 'test-community-123',
        name: 'Test Community',
        description: 'Test community description',
        created_by: testUser.id
      };

      const community = await Community.create(communityData);
      
      expect(community.is_active).toBe(true);
      expect(community.member_count).toBe(0);
    });
  });

  describe('Instance Methods', () => {
    let community;

    beforeEach(async () => {
      community = await Community.create({
        on_chain_id: 'test-community-123',
        name: 'Test Community',
        description: 'Test community description',
        created_by: testUser.id,
        is_active: true
      });
    });

    it('should check if community is active', () => {
      expect(community.isActive()).toBe(true);
      
      community.is_active = false;
      expect(community.isActive()).toBe(false);
    });

    it('should increment member count', async () => {
      const initialCount = community.member_count;
      await community.incrementMemberCount();
      
      await community.reload();
      expect(community.member_count).toBe(initialCount + 1);
    });

    it('should decrement member count', async () => {
      community.member_count = 5;
      await community.save();
      
      await community.decrementMemberCount();
      
      await community.reload();
      expect(community.member_count).toBe(4);
    });

    it('should not decrement below zero', async () => {
      community.member_count = 0;
      await community.save();
      
      await community.decrementMemberCount();
      
      await community.reload();
      expect(community.member_count).toBe(0);
    });

    it('should get community summary', () => {
      const summary = community.getSummary();
      
      expect(summary).toHaveProperty('id');
      expect(summary).toHaveProperty('name');
      expect(summary).toHaveProperty('description');
      expect(summary).toHaveProperty('member_count');
      expect(summary).toHaveProperty('is_active');
      expect(summary).toHaveProperty('created_at');
      expect(summary).not.toHaveProperty('created_by'); // Should be private
    });

    it('should check if user is member', async () => {
      await Member.create({
        community_id: community.id,
        user_id: testUser.id,
        status: 'approved',
        joined_at: new Date()
      });

      const isMember = await community.isUserMember(testUser.id);
      expect(isMember).toBe(true);
    });

    it('should return false for non-member', async () => {
      const isMember = await community.isUserMember('non-existent-user');
      expect(isMember).toBe(false);
    });
  });

  describe('Class Methods', () => {
    beforeEach(async () => {
      await Community.create({
        name: 'Community 1',
        description: 'First community',
        created_by: testUser.id,
        is_active: true
      });

      await Community.create({
        name: 'Community 2',
        description: 'Second community',
        created_by: testUser.id,
        is_active: false
      });
    });

    it('should find active communities', async () => {
      const activeCommunities = await Community.findActive();
      
      expect(activeCommunities).toHaveLength(1);
      expect(activeCommunities[0].name).toBe('Community 1');
    });

    it('should find community by name', async () => {
      const community = await Community.findByName('Community 1');
      
      expect(community).toBeDefined();
      expect(community.is_active).toBe(true);
    });

    it('should return null for non-existent community name', async () => {
      const community = await Community.findByName('Non-existent Community');
      
      expect(community).toBeNull();
    });

    it('should search communities', async () => {
      const searchResults = await Community.search('Community');
      
      expect(searchResults).toHaveLength(2);
    });

    it('should get community statistics', async () => {
      const stats = await Community.getStats();
      
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('active');
      expect(stats).toHaveProperty('inactive');
      expect(stats.total).toBe(2);
      expect(stats.active).toBe(1);
      expect(stats.inactive).toBe(1);
    });

    it('should get communities by creator', async () => {
      const userCommunities = await Community.findByCreator(testUser.id);
      
      expect(userCommunities).toHaveLength(2);
      expect(userCommunities.every(c => c.created_by === testUser.id)).toBe(true);
    });
  });

  describe('Associations', () => {
    let community, question;

    beforeEach(async () => {
      community = await Community.create({
        on_chain_id: 'test-community-123',
        name: 'Test Community',
        description: 'Test community description',
        created_by: testUser.id,
        is_active: true
      });

      question = await VotingQuestion.create({
        community_id: community.id,
        question: 'Test question?',
        options: JSON.stringify(['Option 1', 'Option 2']),
        created_by: testUser.id,
        deadline: new Date(Date.now() + 86400000),
        is_active: true
      });
    });

    it('should have creator', async () => {
      const communityWithCreator = await Community.findByPk(community.id, {
        include: [{
          model: User,
          as: 'Creator'
        }]
      });

      expect(communityWithCreator.Creator).toBeDefined();
      expect(communityWithCreator.Creator.id).toBe(testUser.id);
    });

    it('should have members', async () => {
      await Member.create({
        community_id: community.id,
        user_id: testUser.id,
        status: 'approved',
        joined_at: new Date()
      });

      const communityWithMembers = await Community.findByPk(community.id, {
        include: [{
          model: Member,
          as: 'Members'
        }]
      });

      expect(communityWithMembers.Members).toHaveLength(1);
      expect(communityWithMembers.Members[0].user_id).toBe(testUser.id);
    });

    it('should have users through memberships', async () => {
      await Member.create({
        community_id: community.id,
        user_id: testUser.id,
        status: 'approved',
        joined_at: new Date()
      });

      const communityWithUsers = await Community.findByPk(community.id, {
        include: [{
          model: User,
          as: 'Users',
          through: { attributes: [] }
        }]
      });

      expect(communityWithUsers.Users).toHaveLength(1);
      expect(communityWithUsers.Users[0].id).toBe(testUser.id);
    });

    it('should have voting questions', async () => {
      const communityWithQuestions = await Community.findByPk(community.id, {
        include: [{
          model: VotingQuestion,
          as: 'Questions'
        }]
      });

      expect(communityWithQuestions.Questions).toHaveLength(1);
      expect(communityWithQuestions.Questions[0].id).toBe(question.id);
    });

    it('should have active voting questions', async () => {
      const activeQuestions = await community.getActiveQuestions();
      
      expect(activeQuestions).toHaveLength(1);
      expect(activeQuestions[0].id).toBe(question.id);
    });
  });

  describe('Scopes', () => {
    beforeEach(async () => {
      await Community.create({
        name: 'Community 1',
        description: 'First community',
        created_by: testUser.id,
        is_active: true
      });

      await Community.create({
        name: 'Community 2',
        description: 'Second community',
        created_by: testUser.id,
        is_active: false
      });
    });

    it('should use active scope', async () => {
      const activeCommunities = await Community.scope('active').findAll();
      
      expect(activeCommunities).toHaveLength(1);
      expect(activeCommunities[0].name).toBe('Community 1');
    });

    it('should use inactive scope', async () => {
      const inactiveCommunities = await Community.scope('inactive').findAll();
      
      expect(inactiveCommunities).toHaveLength(1);
      expect(inactiveCommunities[0].name).toBe('Community 2');
    });

    it('should use withCreator scope', async () => {
      const communitiesWithCreator = await Community.scope('withCreator').findAll();
      
      expect(communitiesWithCreator).toHaveLength(2);
      expect(communitiesWithCreator[0].Creator).toBeDefined();
    });
  });

  describe('Hooks', () => {
    it('should update member count when member is added', async () => {
      const community = await Community.create({
        on_chain_id: 'test-community-123',
        name: 'Test Community',
        description: 'Test community description',
        created_by: testUser.id,
        is_active: true
      });

      await Member.create({
        community_id: community.id,
        user_id: testUser.id,
        status: 'approved',
        joined_at: new Date()
      });

      await community.reload();
      expect(community.member_count).toBe(1);
    });

    it('should update member count when member is removed', async () => {
      const community = await Community.create({
        on_chain_id: 'test-community-123',
        name: 'Test Community',
        description: 'Test community description',
        created_by: testUser.id,
        is_active: true,
        member_count: 1
      });

      await Member.destroy({
        where: {
          community_id: community.id,
          user_id: testUser.id
        }
      });

      await community.reload();
      expect(community.member_count).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // Mock a database error
      const originalFindAll = Community.findAll;
      Community.findAll = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      await expect(Community.findActive()).rejects.toThrow('Database connection failed');

      Community.findAll = originalFindAll;
    });

    it('should handle validation errors with proper messages', async () => {
      const communityData = {
        name: '',
        description: 'Test community description',
        created_by: testUser.id
      };

      try {
        await Community.create(communityData);
      } catch (error) {
        expect(error.name).toBe('SequelizeValidationError');
        expect(error.errors).toBeDefined();
      }
    });
  });
}); 