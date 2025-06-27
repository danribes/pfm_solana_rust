const { sequelize, User, Community, Member, VotingQuestion, Vote } = require('../../models');

describe('Database Performance Tests', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  afterEach(async () => {
    await Vote.destroy({ where: {} });
    await VotingQuestion.destroy({ where: {} });
    await Member.destroy({ where: {} });
    await Community.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  describe('Bulk Operations', () => {
    test('should handle bulk user creation efficiently', async () => {
      const startTime = Date.now();
      
      const users = Array.from({ length: 100 }, (_, i) => ({
        wallet_address: `TestWallet${i.toString().padStart(33, '0')}`,
        username: `testuser${i}`,
        email: `test${i}@example.com`,
      }));

      await User.bulkCreate(users);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(5000);
      
      const count = await User.count();
      expect(count).toBe(100);
    });

    test('should handle bulk vote creation efficiently', async () => {
      // Create multiple users for voting
      const users = await User.bulkCreate(
        Array.from({ length: 100 }, (_, i) => ({
          wallet_address: `TestWallet${i.toString().padStart(33, '0')}`,
          username: `testuser${i}`,
        }))
      );

      const community = await Community.create({
        on_chain_id: 'TestCommunity0000000000000000000000000000001',
        name: 'Test Community',
        created_by: users[0].id,
      });

      const question = await VotingQuestion.create({
        on_chain_id: 'TestVotingQ0000000000000000000000000000001',
        community_id: community.id,
        title: 'Test Question',
        question_type: 'single_choice',
        options: ['Option 1', 'Option 2'],
        created_by: users[0].id,
      });

      const startTime = Date.now();
      
      const votes = Array.from({ length: 100 }, (_, i) => ({
        question_id: question.id,
        user_id: users[i].id,
        selected_options: [i % 2],
        is_anonymous: i % 3 === 0,
      }));

      await Vote.bulkCreate(votes);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(10000);
      
      const count = await Vote.count();
      expect(count).toBe(100);
    });
  });

  describe('Index Performance', () => {
    test('should use indexes for wallet address lookups', async () => {
      await User.bulkCreate(
        Array.from({ length: 100 }, (_, i) => ({
          wallet_address: `TestWallet${i.toString().padStart(33, '0')}`,
          username: `testuser${i}`,
        }))
      );

      const startTime = Date.now();
      
      const user = await User.findOne({
        where: { wallet_address: 'TestWallet0000000000000000000000000000050' },
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100);
      expect(user).toBeDefined();
    });
  });
});
