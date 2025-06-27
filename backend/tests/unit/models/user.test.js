/**
 * Unit tests for User model
 */

const { User, Community, Member, VotingQuestion, Vote } = require('../../../models');
const { sequelize } = require('../../../models');

describe('User Model', () => {
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
  });

  describe('Validation', () => {
    it('should create a valid user', async () => {
      const userData = {
        wallet_address: 'test-wallet-123',
        username: 'testuser',
        email: 'test@example.com',
        is_active: true
      };

      const user = await User.create(userData);
      
      expect(user.id).toBeDefined();
      expect(user.wallet_address).toBe(userData.wallet_address);
      expect(user.username).toBe(userData.username);
      expect(user.email).toBe(userData.email);
      expect(user.is_active).toBe(userData.is_active);
      expect(user.created_at).toBeDefined();
      expect(user.updated_at).toBeDefined();
    });

    it('should require wallet_address', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        is_active: true
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should require unique wallet_address', async () => {
      const userData = {
        wallet_address: 'test-wallet-123',
        username: 'testuser',
        email: 'test@example.com',
        is_active: true
      };

      await User.create(userData);
      
      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should require unique username', async () => {
      const userData1 = {
        wallet_address: 'test-wallet-1',
        username: 'testuser',
        email: 'test1@example.com',
        is_active: true
      };

      const userData2 = {
        wallet_address: 'test-wallet-2',
        username: 'testuser',
        email: 'test2@example.com',
        is_active: true
      };

      await User.create(userData1);
      
      await expect(User.create(userData2)).rejects.toThrow();
    });

    it('should require unique email', async () => {
      const userData1 = {
        wallet_address: 'test-wallet-1',
        username: 'testuser1',
        email: 'test@example.com',
        is_active: true
      };

      const userData2 = {
        wallet_address: 'test-wallet-2',
        username: 'testuser2',
        email: 'test@example.com',
        is_active: true
      };

      await User.create(userData1);
      
      await expect(User.create(userData2)).rejects.toThrow();
    });

    it('should validate email format', async () => {
      const userData = {
        wallet_address: 'test-wallet-123',
        username: 'testuser',
        email: 'invalid-email',
        is_active: true
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should set default values', async () => {
      const userData = {
        wallet_address: 'test-wallet-123',
        username: 'testuser',
        email: 'test@example.com'
      };

      const user = await User.create(userData);
      
      expect(user.is_active).toBe(true);
      expect(user.last_login_at).toBeNull();
    });
  });

  describe('Instance Methods', () => {
    let user;

    beforeEach(async () => {
      user = await User.create({
        wallet_address: 'test-wallet-123',
        username: 'testuser',
        email: 'test@example.com',
        is_active: true
      });
    });

    it('should update last login', async () => {
      const loginTime = new Date();
      await user.updateLastLogin(loginTime);
      
      expect(user.last_login_at).toEqual(loginTime);
    });

    it('should check if user is active', () => {
      expect(user.isActive()).toBe(true);
      
      user.is_active = false;
      expect(user.isActive()).toBe(false);
    });

    it('should get user profile data', () => {
      const profile = user.getProfile();
      
      expect(profile).toHaveProperty('id');
      expect(profile).toHaveProperty('username');
      expect(profile).toHaveProperty('email');
      expect(profile).toHaveProperty('is_active');
      expect(profile).toHaveProperty('created_at');
      expect(profile).not.toHaveProperty('wallet_address'); // Should be private
    });
  });

  describe('Class Methods', () => {
    beforeEach(async () => {
      await User.create({
        wallet_address: 'test-wallet-1',
        username: 'user1',
        email: 'user1@example.com',
        is_active: true
      });

      await User.create({
        wallet_address: 'test-wallet-2',
        username: 'user2',
        email: 'user2@example.com',
        is_active: false
      });
    });

    it('should find active users', async () => {
      const activeUsers = await User.findActive();
      
      expect(activeUsers).toHaveLength(1);
      expect(activeUsers[0].username).toBe('user1');
    });

    it('should find user by wallet address', async () => {
      const user = await User.findByWalletAddress('test-wallet-1');
      
      expect(user).toBeDefined();
      expect(user.username).toBe('user1');
    });

    it('should return null for non-existent wallet address', async () => {
      const user = await User.findByWalletAddress('non-existent');
      
      expect(user).toBeNull();
    });

    it('should find user by username', async () => {
      const user = await User.findByUsername('user1');
      
      expect(user).toBeDefined();
      expect(user.wallet_address).toBe('test-wallet-1');
    });

    it('should return null for non-existent username', async () => {
      const user = await User.findByUsername('non-existent');
      
      expect(user).toBeNull();
    });

    it('should get user statistics', async () => {
      const stats = await User.getStats();
      
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('active');
      expect(stats).toHaveProperty('inactive');
      expect(stats.total).toBe(2);
      expect(stats.active).toBe(1);
      expect(stats.inactive).toBe(1);
    });
  });

  describe('Associations', () => {
    let user, community, question;

    beforeEach(async () => {
      user = await User.create({
        wallet_address: 'test-wallet-123',
        username: 'testuser',
        email: 'test@example.com',
        is_active: true
      });

      community = await Community.create({
        on_chain_id: 'test-community-123',
        name: 'Test Community',
        description: 'Test community description',
        created_by: user.id,
        is_active: true
      });

      question = await VotingQuestion.create({
        on_chain_id: 'test-question-123',
        community_id: community.id,
        title: 'Test question?',
        options: JSON.stringify(['Option 1', 'Option 2']),
        created_by: user.id,
        voting_end_at: new Date(Date.now() + 86400000),
        is_active: true
      });
    });

    it('should have communities through memberships', async () => {
      await Member.create({
        community_id: community.id,
        user_id: user.id,
        status: 'approved',
        joined_at: new Date()
      });

      const userWithCommunities = await User.findByPk(user.id, {
        include: [{
          model: Community,
          as: 'CreatedCommunities',
          through: { attributes: [] }
        }]
      });

      expect(userWithCommunities.CreatedCommunities).toHaveLength(1);
      expect(userWithCommunities.CreatedCommunities[0].id).toBe(community.id);
    });

    it('should have voting questions', async () => {
      const userWithQuestions = await User.findByPk(user.id, {
        include: [{
          model: VotingQuestion,
          as: 'CreatedQuestions'
        }]
      });

      expect(userWithQuestions.CreatedQuestions).toHaveLength(1);
      expect(userWithQuestions.CreatedQuestions[0].id).toBe(question.id);
    });

    it('should have votes', async () => {
      await Vote.create({
        question_id: question.id,
        user_id: user.id,
        selected_options: JSON.stringify(['Option 1']),
        voted_at: new Date()
      });

      const userWithVotes = await User.findByPk(user.id, {
        include: [{
          model: Vote,
          as: 'Votes'
        }]
      });

      expect(userWithVotes.Votes).toHaveLength(1);
      expect(userWithVotes.Votes[0].question_id).toBe(question.id);
    });

    it('should have memberships', async () => {
      await Member.create({
        community_id: community.id,
        user_id: user.id,
        status: 'approved',
        joined_at: new Date()
      });

      const userWithMemberships = await User.findByPk(user.id, {
        include: [{
          model: Member,
          as: 'Memberships'
        }]
      });

      expect(userWithMemberships.Memberships).toHaveLength(1);
      expect(userWithMemberships.Memberships[0].community_id).toBe(community.id);
    });
  });

  describe('Hooks', () => {
    it('should hash password before save if provided', async () => {
      const userData = {
        wallet_address: 'test-wallet-123',
        username: 'testuser',
        email: 'test@example.com',
        password: 'plaintext-password'
      };

      const user = await User.create(userData);
      
      expect(user.password).not.toBe('plaintext-password');
      expect(user.password).toMatch(/^\$2[aby]\$\d{1,2}\$[./A-Za-z0-9]{53}$/); // bcrypt hash pattern
    });

    it('should not hash password if not provided', async () => {
      const userData = {
        wallet_address: 'test-wallet-123',
        username: 'testuser',
        email: 'test@example.com'
      };

      const user = await User.create(userData);
      
      expect(user.password).toBeNull();
    });
  });

  describe('Scopes', () => {
    beforeEach(async () => {
      await User.create({
        wallet_address: 'test-wallet-1',
        username: 'user1',
        email: 'user1@example.com',
        is_active: true
      });

      await User.create({
        wallet_address: 'test-wallet-2',
        username: 'user2',
        email: 'user2@example.com',
        is_active: false
      });
    });

    it('should use active scope', async () => {
      const activeUsers = await User.scope('active').findAll();
      
      expect(activeUsers).toHaveLength(1);
      expect(activeUsers[0].username).toBe('user1');
    });

    it('should use inactive scope', async () => {
      const inactiveUsers = await User.scope('inactive').findAll();
      
      expect(inactiveUsers).toHaveLength(1);
      expect(inactiveUsers[0].username).toBe('user2');
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // Mock a database error
      const originalFindAll = User.findAll;
      User.findAll = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      await expect(User.findActive()).rejects.toThrow('Database connection failed');

      User.findAll = originalFindAll;
    });

    it('should handle validation errors with proper messages', async () => {
      const userData = {
        wallet_address: 'test-wallet-123',
        username: 'testuser',
        email: 'invalid-email'
      };

      try {
        await User.create(userData);
      } catch (error) {
        expect(error.name).toBe('SequelizeValidationError');
        expect(error.errors).toBeDefined();
      }
    });
  });
}); 