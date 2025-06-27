const { sequelize, User, Community, Member, VotingQuestion, Vote } = require('../../models');

describe('Database Integration Tests', () => {
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

  describe('User-Community Relationships', () => {
    test('should create user and community with relationship', async () => {
      const user = await User.create({
        wallet_address: 'TestWalletAddr00000000000000000000000000000001',
        username: 'testuser1',
      });

      const community = await Community.create({
        on_chain_id: 'TestCommunityChainAddr00000000000000000000000000000001',
        name: 'Test Community',
        created_by: user.id,
      });

      const foundCommunity = await Community.findOne({
        where: { id: community.id },
        include: [{ model: User, as: 'User' }],
      });

      expect(foundCommunity.User.id).toBe(user.id);
    });

    test('should handle user-community membership', async () => {
      const user = await User.create({
        wallet_address: 'TestWalletAddr00000000000000000000000000000002',
        username: 'testuser2',
      });

      const community = await Community.create({
        on_chain_id: 'TestCommunityChainAddr00000000000000000000000000000002',
        name: 'Test Community 2',
        created_by: user.id,
      });

      const member = await Member.create({
        user_id: user.id,
        community_id: community.id,
        role: 'admin',
        status: 'approved',
      });

      const foundMember = await Member.findOne({
        where: { id: member.id },
        include: [
          { model: User, as: 'User' },
          { model: Community, as: 'Community' },
        ],
      });

      expect(foundMember.User.id).toBe(user.id);
      expect(foundMember.Community.id).toBe(community.id);
      expect(foundMember.role).toBe('admin');
    });
  });

  describe('Voting Workflow', () => {
    test('should handle complete voting workflow', async () => {
      // Create user
      const user = await User.create({
        wallet_address: 'TestWalletAddr00000000000000000000000000000003',
        username: 'testuser3',
      });

      // Create community
      const community = await Community.create({
        on_chain_id: 'TestCommunityChainAddr00000000000000000000000000000003',
        name: 'Test Community 3',
        created_by: user.id,
      });

      // Create member
      await Member.create({
        user_id: user.id,
        community_id: community.id,
        role: 'member',
        status: 'approved',
      });

      // Create voting question
      const question = await VotingQuestion.create({
        on_chain_id: 'TestVotingQChainAddr00000000000000000000001',
        community_id: community.id,
        title: 'Test Question',
        description: 'Test Description',
        question_type: 'single_choice',
        options: ['Option 1', 'Option 2', 'Option 3'],
        created_by: user.id,
      });

      // Create vote
      const vote = await Vote.create({
        question_id: question.id,
        user_id: user.id,
        selected_options: [0],
        is_anonymous: false,
      });

      // Verify relationships
      const foundVote = await Vote.findOne({
        where: { id: vote.id },
        include: [
          { model: User, as: 'User' },
          { model: VotingQuestion, as: 'VotingQuestion' },
        ],
      });

      expect(foundVote.User.id).toBe(user.id);
      expect(foundVote.VotingQuestion.id).toBe(question.id);
      expect(foundVote.selected_options).toEqual([0]);
    });
  });

  describe('Complex Queries', () => {
    test('should find communities with member count', async () => {
      const user1 = await User.create({
        wallet_address: 'TestWalletAddr00000000000000000000000000000004',
        username: 'testuser4',
      });

      const user2 = await User.create({
        wallet_address: 'TestWalletAddr00000000000000000000000000000005',
        username: 'testuser5',
      });

      const community = await Community.create({
        on_chain_id: 'TestCommunityChainAddr00000000000000000000000000000004',
        name: 'Test Community 4',
        created_by: user1.id,
      });

      await Member.create({
        user_id: user1.id,
        community_id: community.id,
        role: 'admin',
        status: 'approved',
      });

      await Member.create({
        user_id: user2.id,
        community_id: community.id,
        role: 'member',
        status: 'approved',
      });

      const communitiesWithMembers = await Community.findAll({
        include: [
          {
            model: Member,
            as: 'Members',
            include: [{ model: User, as: 'User' }],
          },
        ],
      });

      expect(communitiesWithMembers).toHaveLength(1);
      expect(communitiesWithMembers[0].Members).toHaveLength(2);
    });

    test('should find active voting questions', async () => {
      const user = await User.create({
        wallet_address: 'TestWalletAddr00000000000000000000000000000006',
        username: 'testuser6',
      });

      const community = await Community.create({
        on_chain_id: 'TestCommunityChainAddr00000000000000000000000000000005',
        name: 'Test Community 5',
        created_by: user.id,
      });

      await VotingQuestion.create({
        on_chain_id: 'TestVotingQChainAddr00000000000000000000002',
        community_id: community.id,
        title: 'Active Question',
        question_type: 'single_choice',
        options: ['Yes', 'No'],
        created_by: user.id,
        is_active: true,
      });

      await VotingQuestion.create({
        on_chain_id: 'TestVotingQChainAddr00000000000000000000003',
        community_id: community.id,
        title: 'Inactive Question',
        question_type: 'single_choice',
        options: ['Yes', 'No'],
        created_by: user.id,
        is_active: false,
      });

      const activeQuestions = await VotingQuestion.findAll({
        where: { is_active: true },
        include: [{ model: Community, as: 'Community' }],
      });

      expect(activeQuestions).toHaveLength(1);
      expect(activeQuestions[0].title).toBe('Active Question');
    });
  });

  describe('Transaction Handling', () => {
    test('should handle transaction rollback on error', async () => {
      const user = await User.create({
        wallet_address: 'TestWalletAddr00000000000000000000000000000007',
        username: 'testuser7',
      });

      const transaction = await sequelize.transaction();

      try {
        await Community.create({
          on_chain_id: 'TestCommunityChainAddr00000000000000000000000000000006',
          name: 'Test Community 6',
          created_by: user.id,
        }, { transaction });

        // This should fail and rollback the transaction
        await Community.create({
          on_chain_id: 'TestCommunityChainAddr00000000000000000000000000000006', // Duplicate
          name: 'Test Community 7',
          created_by: user.id,
        }, { transaction });

        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
      }

      const communities = await Community.findAll({
        where: { created_by: user.id },
      });

      expect(communities).toHaveLength(0);
    });
  });
}); 