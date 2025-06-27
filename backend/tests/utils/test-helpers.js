/**
 * Test Utilities and Helpers
 */

const { User, Community, Member, VotingQuestion, Vote } = require('../../models');
const { v4: uuidv4 } = require('uuid');

/**
 * Create a test user
 */
async function createTestUser(overrides = {}) {
  const defaultUser = {
    wallet_address: `test-wallet-${uuidv4()}`,
    username: `testuser-${uuidv4().substring(0, 8)}`,
    email: `test-${uuidv4().substring(0, 8)}@example.com`,
    is_active: true
  };

  return await User.create({ ...defaultUser, ...overrides });
}

/**
 * Create a test community
 */
async function createTestCommunity(creatorId, overrides = {}) {
  const defaultCommunity = {
    name: `Test Community ${uuidv4().substring(0, 8)}`,
    description: 'Test community description',
    created_by: creatorId,
    is_active: true
  };

  return await Community.create({ ...defaultCommunity, ...overrides });
}

/**
 * Create a test voting question
 */
async function createTestQuestion(communityId, creatorId, overrides = {}) {
  const defaultQuestion = {
    community_id: communityId,
    question: `Test question ${uuidv4().substring(0, 8)}?`,
    options: JSON.stringify(['Option 1', 'Option 2', 'Option 3']),
    created_by: creatorId,
    deadline: new Date(Date.now() + 86400000), // 24 hours from now
    is_active: true
  };

  return await VotingQuestion.create({ ...defaultQuestion, ...overrides });
}

/**
 * Create a test vote
 */
async function createTestVote(questionId, userId, overrides = {}) {
  const defaultVote = {
    question_id: questionId,
    user_id: userId,
    selected_options: JSON.stringify(['Option 1']),
    voted_at: new Date()
  };

  return await Vote.create({ ...defaultVote, ...overrides });
}

/**
 * Create a test membership
 */
async function createTestMembership(communityId, userId, overrides = {}) {
  const defaultMembership = {
    community_id: communityId,
    user_id: userId,
    status: 'approved',
    role: 'member',
    joined_at: new Date()
  };

  return await Member.create({ ...defaultMembership, ...overrides });
}

/**
 * Clean up test data
 */
async function cleanupTestData() {
  await Vote.destroy({ where: {} });
  await VotingQuestion.destroy({ where: {} });
  await Member.destroy({ where: {} });
  await Community.destroy({ where: {} });
  await User.destroy({ where: {} });
}

/**
 * Create a complete test scenario
 */
async function createTestScenario() {
  const user = await createTestUser();
  const community = await createTestCommunity(user.id);
  const membership = await createTestMembership(community.id, user.id);
  const question = await createTestQuestion(community.id, user.id);
  const vote = await createTestVote(question.id, user.id);

  return {
    user,
    community,
    membership,
    question,
    vote
  };
}

/**
 * Mock request object
 */
function createMockRequest(overrides = {}) {
  return {
    session: {},
    headers: {},
    cookies: {},
    body: {},
    params: {},
    query: {},
    user: null,
    ...overrides
  };
}

/**
 * Mock response object
 */
function createMockResponse() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis()
  };

  return res;
}

/**
 * Mock next function
 */
function createMockNext() {
  return jest.fn();
}

/**
 * Wait for a specified time
 */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate random test data
 */
function generateRandomData() {
  return {
    wallet_address: `test-wallet-${uuidv4()}`,
    username: `user-${uuidv4().substring(0, 8)}`,
    email: `test-${uuidv4().substring(0, 8)}@example.com`,
    community_name: `Community ${uuidv4().substring(0, 8)}`,
    question_text: `Question ${uuidv4().substring(0, 8)}?`
  };
}

module.exports = {
  createTestUser,
  createTestCommunity,
  createTestQuestion,
  createTestVote,
  createTestMembership,
  cleanupTestData,
  createTestScenario,
  createMockRequest,
  createMockResponse,
  createMockNext,
  wait,
  generateRandomData
}; 