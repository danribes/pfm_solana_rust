/**
 * Integration Test Setup Helpers
 * Provides utilities for setting up and tearing down integration tests
 */

const { User, Community, Member, VotingQuestion, Vote, Analytics } = require('../../models');
const redis = require('../../redis');
const userFixtures = require('../fixtures/users');

class IntegrationTestHelper {
  constructor() {
    this.createdUsers = [];
    this.createdCommunities = [];
    this.createdMembers = [];
    this.createdQuestions = [];
    this.createdVotes = [];
  }

  /**
   * Set up test environment
   */
  async setup() {
    await this.clearDatabase();
    await this.initializeRedis();
    console.log('Integration test environment setup complete');
  }

  /**
   * Clean up test environment
   */
  async teardown() {
    await this.clearDatabase();
    await this.shutdownRedis();
    console.log('Integration test environment cleaned up');
  }

  /**
   * Clear all test data from database
   */
  async clearDatabase() {
    try {
      await Analytics.destroy({ where: {} });
      await Vote.destroy({ where: {} });
      await VotingQuestion.destroy({ where: {} });
      await Member.destroy({ where: {} });
      await Community.destroy({ where: {} });
      await User.destroy({ where: {} });
      
      // Reset tracking arrays
      this.createdUsers = [];
      this.createdCommunities = [];
      this.createdMembers = [];
      this.createdQuestions = [];
      this.createdVotes = [];
    } catch (error) {
      console.error('Error clearing test database:', error);
      throw error;
    }
  }

  /**
   * Initialize Redis connection
   */
  async initializeRedis() {
    try {
      if (!redis.isInitialized()) {
        await redis.initializeRedis();
      }
    } catch (error) {
      console.error('Error initializing Redis for tests:', error);
      throw error;
    }
  }

  /**
   * Shutdown Redis connection
   */
  async shutdownRedis() {
    try {
      if (redis.isInitialized()) {
        await redis.shutdownRedis();
      }
    } catch (error) {
      console.error('Error shutting down Redis:', error);
    }
  }

  /**
   * Create test user
   */
  async createTestUser(userData = userFixtures.validUser) {
    try {
      const user = await User.create(userData);
      this.createdUsers.push(user);
      return user;
    } catch (error) {
      console.error('Error creating test user:', error);
      throw error;
    }
  }

  /**
   * Create test community
   */
  async createTestCommunity(createdBy, communityData = {}) {
    try {
      const defaultData = {
        on_chain_id: `test-community-${Date.now()}`,
        name: 'Test Community',
        description: 'A test community',
        created_by: createdBy,
        is_private: false,
        approval_required: true,
        status: 'active'
      };

      const community = await Community.create({ ...defaultData, ...communityData });
      this.createdCommunities.push(community);
      return community;
    } catch (error) {
      console.error('Error creating test community:', error);
      throw error;
    }
  }

  /**
   * Create test membership
   */
  async createTestMember(userId, communityId, role = 'member', status = 'approved') {
    try {
      const member = await Member.create({
        user_id: userId,
        community_id: communityId,
        role,
        status,
        joined_at: new Date()
      });
      this.createdMembers.push(member);
      return member;
    } catch (error) {
      console.error('Error creating test member:', error);
      throw error;
    }
  }

  /**
   * Create test voting question
   */
  async createTestQuestion(communityId, createdBy, questionData = {}) {
    try {
      const defaultData = {
        on_chain_id: `test-question-${Date.now()}`,
        community_id: communityId,
        title: 'Test Question',
        description: 'A test voting question',
        options: JSON.stringify(['Option 1', 'Option 2']),
        deadline: new Date(Date.now() + 86400000), // 24 hours from now
        created_by: createdBy,
        status: 'active'
      };

      const question = await VotingQuestion.create({ ...defaultData, ...questionData });
      this.createdQuestions.push(question);
      return question;
    } catch (error) {
      console.error('Error creating test question:', error);
      throw error;
    }
  }

  /**
   * Create test vote
   */
  async createTestVote(questionId, userId, selectedOptions = [0]) {
    try {
      const vote = await Vote.create({
        on_chain_id: `test-vote-${Date.now()}`,
        question_id: questionId,
        user_id: userId,
        selected_options: selectedOptions
      });
      this.createdVotes.push(vote);
      return vote;
    } catch (error) {
      console.error('Error creating test vote:', error);
      throw error;
    }
  }

  /**
   * Wait for a specified amount of time
   */
  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get created entities count
   */
  getCreatedCount() {
    return {
      users: this.createdUsers.length,
      communities: this.createdCommunities.length,
      members: this.createdMembers.length,
      questions: this.createdQuestions.length,
      votes: this.createdVotes.length
    };
  }
}

module.exports = IntegrationTestHelper; 