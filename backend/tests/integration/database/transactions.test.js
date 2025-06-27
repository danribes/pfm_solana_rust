/**
 * Database Transaction Integration Tests
 * Tests database operations, transactions, and data consistency
 */

const { User, Community, Member, VotingQuestion, Vote, sequelize } = require('../../../models');
const IntegrationTestHelper = require('../../helpers/integration-setup');
const userFixtures = require('../../fixtures/users');

describe('Database Transaction Integration Tests', () => {
  let helper;
  let testUser;
  let testCommunity;

  beforeAll(async () => {
    helper = new IntegrationTestHelper();
    await helper.setup();
  });

  afterAll(async () => {
    await helper.teardown();
  });

  beforeEach(async () => {
    await helper.clearDatabase();
    testUser = await helper.createTestUser(userFixtures.validUser);
    testCommunity = await helper.createTestCommunity(testUser.id);
  });

  describe('Transaction Rollback', () => {
    it('should rollback transaction on error', async () => {
      const transaction = await sequelize.transaction();
      
      try {
        // Create a user within transaction
        const newUser = await User.create({
          wallet_address: 'TransactionTest1111111111111111111111111',
          username: 'transactiontest',
          email: 'transaction@test.com'
        }, { transaction });

        // Verify user exists within transaction
        const userInTransaction = await User.findByPk(newUser.id, { transaction });
        expect(userInTransaction).toBeTruthy();

        // Force an error to trigger rollback
        throw new Error('Intentional error for rollback test');
        
      } catch (error) {
        await transaction.rollback();
        
        // Verify user was not persisted after rollback
        const userAfterRollback = await User.findOne({
          where: { username: 'transactiontest' }
        });
        expect(userAfterRollback).toBeNull();
      }
    });

    it('should commit transaction on success', async () => {
      const transaction = await sequelize.transaction();
      
      try {
        const newUser = await User.create({
          wallet_address: 'CommitTest111111111111111111111111111111',
          username: 'committestuser',
          email: 'commit@test.com'
        }, { transaction });

        await transaction.commit();
        
        // Verify user was persisted after commit
        const userAfterCommit = await User.findByPk(newUser.id);
        expect(userAfterCommit).toBeTruthy();
        expect(userAfterCommit.username).toBe('committestuser');
        
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    });
  });

  describe('Foreign Key Constraints', () => {
    it('should enforce foreign key constraint on community creation', async () => {
      await expect(
        Community.create({
          on_chain_id: 'constraint-test',
          name: 'Constraint Test Community',
          description: 'Testing foreign key constraints',
          created_by: 'non-existent-user-id',
          status: 'active'
        })
      ).rejects.toThrow();
    });

    it('should enforce foreign key constraint on member creation', async () => {
      await expect(
        Member.create({
          user_id: 'non-existent-user-id',
          community_id: testCommunity.id,
          role: 'member',
          status: 'approved'
        })
      ).rejects.toThrow();
    });

    it('should cascade delete members when community is deleted', async () => {
      // Create member
      const member = await helper.createTestMember(testUser.id, testCommunity.id);
      
      // Verify member exists
      const memberBefore = await Member.findByPk(member.id);
      expect(memberBefore).toBeTruthy();
      
      // Delete community
      await Community.destroy({ where: { id: testCommunity.id } });
      
      // Verify member is also deleted (cascade)
      const memberAfter = await Member.findByPk(member.id);
      expect(memberAfter).toBeNull();
    });
  });

  describe('Data Consistency', () => {
    it('should maintain referential integrity across related models', async () => {
      // Create complete data set
      const member = await helper.createTestMember(testUser.id, testCommunity.id);
      const question = await helper.createTestQuestion(testCommunity.id, testUser.id);
      const vote = await helper.createTestVote(question.id, testUser.id);

      // Verify all relationships exist
      const userWithRelations = await User.findByPk(testUser.id, {
        include: [
          { model: Community, as: 'CreatedCommunities' },
          { model: Member, as: 'Memberships' },
          { model: Vote, as: 'Votes' }
        ]
      });

      expect(userWithRelations.CreatedCommunities).toHaveLength(1);
      expect(userWithRelations.Memberships).toHaveLength(1);
      expect(userWithRelations.Votes).toHaveLength(1);

      const communityWithRelations = await Community.findByPk(testCommunity.id, {
        include: [
          { model: Member, as: 'Members' },
          { model: VotingQuestion, as: 'Questions' }
        ]
      });

      expect(communityWithRelations.Members).toHaveLength(1);
      expect(communityWithRelations.Questions).toHaveLength(1);
    });

    it('should handle concurrent updates correctly', async () => {
      // Create two concurrent updates to the same user
      const updatePromises = [
        User.update(
          { username: 'concurrent1' },
          { where: { id: testUser.id } }
        ),
        User.update(
          { bio: 'Updated bio' },
          { where: { id: testUser.id } }
        )
      ];

      await Promise.all(updatePromises);

      // Verify final state
      const updatedUser = await User.findByPk(testUser.id);
      expect(updatedUser.bio).toBe('Updated bio');
      // Username should be one of the concurrent updates
      expect(['concurrent1', testUser.username]).toContain(updatedUser.username);
    });
  });

  describe('Unique Constraints', () => {
    it('should enforce unique wallet address constraint', async () => {
      await expect(
        User.create({
          wallet_address: testUser.wallet_address, // Duplicate
          username: 'uniquetest',
          email: 'unique@test.com'
        })
      ).rejects.toThrow();
    });

    it('should enforce unique username constraint', async () => {
      await expect(
        User.create({
          wallet_address: 'UniqueTest1111111111111111111111111111111',
          username: testUser.username, // Duplicate
          email: 'unique@test.com'
        })
      ).rejects.toThrow();
    });

    it('should enforce unique vote constraint per user per question', async () => {
      const question = await helper.createTestQuestion(testCommunity.id, testUser.id);
      
      // First vote should succeed
      await helper.createTestVote(question.id, testUser.id, [0]);
      
      // Second vote by same user should fail
      await expect(
        Vote.create({
          on_chain_id: 'duplicate-vote-test',
          question_id: question.id,
          user_id: testUser.id,
          selected_options: [1]
        })
      ).rejects.toThrow();
    });
  });

  describe('Query Performance', () => {
    it('should efficiently query related data', async () => {
      // Create test data
      const member = await helper.createTestMember(testUser.id, testCommunity.id);
      const question = await helper.createTestQuestion(testCommunity.id, testUser.id);
      await helper.createTestVote(question.id, testUser.id);

      const startTime = Date.now();
      
      // Complex query with multiple joins
      const result = await User.findByPk(testUser.id, {
        include: [
          {
            model: Member,
            as: 'Memberships',
            include: [{ model: Community, as: 'Community' }]
          },
          {
            model: Vote,
            as: 'Votes',
            include: [{ model: VotingQuestion, as: 'Question' }]
          }
        ]
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(result).toBeTruthy();
      expect(result.Memberships).toHaveLength(1);
      expect(result.Votes).toHaveLength(1);
      expect(duration).toBeLessThan(500); // Should complete within 500ms
    });

    it('should handle bulk operations efficiently', async () => {
      const bulkUsers = userFixtures.bulkUsers.map((user, index) => ({
        ...user,
        wallet_address: `BulkWallet${index.toString().padStart(35, '0')}`
      }));

      const startTime = Date.now();
      
      const createdUsers = await User.bulkCreate(bulkUsers);
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(createdUsers).toHaveLength(bulkUsers.length);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe('Data Validation', () => {
    it('should validate email format at database level', async () => {
      await expect(
        User.create({
          wallet_address: 'EmailTest111111111111111111111111111111111',
          username: 'emailtest',
          email: 'invalid-email-format'
        })
      ).rejects.toThrow();
    });

    it('should validate required fields', async () => {
      await expect(
        Community.create({
          description: 'Missing required name field'
        })
      ).rejects.toThrow();
    });

    it('should enforce field length constraints', async () => {
      await expect(
        User.create({
          wallet_address: 'a'.repeat(100), // Too long
          username: 'lengthtest'
        })
      ).rejects.toThrow();
    });
  });
}); 