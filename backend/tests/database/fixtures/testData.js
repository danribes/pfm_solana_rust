// backend/tests/database/fixtures/testData.js
const testUsers = [
  {
    wallet_address: 'TestWalletAddr00000000000000000000000000000001',
    username: 'testuser1',
    email: 'test1@example.com',
    bio: 'Test user 1 bio',
  },
  {
    wallet_address: 'TestWalletAddr00000000000000000000000000000002',
    username: 'testuser2',
    email: 'test2@example.com',
    bio: 'Test user 2 bio',
  },
  {
    wallet_address: 'TestWalletAddr00000000000000000000000000000003',
    username: 'testuser3',
    email: 'test3@example.com',
    bio: 'Test user 3 bio',
  },
];

const testCommunities = [
  {
    on_chain_id: 'TestCommunityChainAddr00000000000000000000000000000001',
    name: 'Test Community 1',
    description: 'First test community',
    is_public: true,
  },
  {
    on_chain_id: 'TestCommunityChainAddr00000000000000000000000000000002',
    name: 'Test Community 2',
    description: 'Second test community',
    is_public: false,
  },
  {
    on_chain_id: 'TestCommunityChainAddr00000000000000000000000000000003',
    name: 'Test Community 3',
    description: 'Third test community',
    is_public: true,
  },
];

const testVotingQuestions = [
  {
    on_chain_id: 'TestVotingQChainAddr00000000000000000000000000000001',
    title: 'Test Question 1',
    description: 'First test voting question',
    question_type: 'single_choice',
    options: ['Option A', 'Option B', 'Option C'],
    is_active: true,
  },
  {
    on_chain_id: 'TestVotingQChainAddr00000000000000000000000000000002',
    title: 'Test Question 2',
    description: 'Second test voting question',
    question_type: 'multiple_choice',
    options: ['Choice 1', 'Choice 2', 'Choice 3', 'Choice 4'],
    is_active: true,
  },
  {
    on_chain_id: 'TestVotingQChainAddr00000000000000000000000000000003',
    title: 'Test Question 3',
    description: 'Third test voting question',
    question_type: 'single_choice',
    options: ['Yes', 'No'],
    is_active: false,
  },
];

const testVotes = [
  {
    selected_options: [0],
    is_anonymous: false,
  },
  {
    selected_options: [1, 2],
    is_anonymous: true,
  },
  {
    selected_options: [1],
    is_anonymous: false,
  },
];

const testMembers = [
  {
    role: 'admin',
    status: 'approved',
  },
  {
    role: 'moderator',
    status: 'approved',
  },
  {
    role: 'member',
    status: 'pending',
  },
  {
    role: 'member',
    status: 'approved',
  },
];

module.exports = {
  testUsers,
  testCommunities,
  testVotingQuestions,
  testVotes,
  testMembers,
}; 