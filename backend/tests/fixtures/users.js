/**
 * User Test Fixtures
 * Provides standard test data for user-related integration tests
 */

module.exports = {
  validUser: {
    wallet_address: 'TestWallet1111111111111111111111111111111111',
    username: 'testuser1',
    email: 'test1@example.com',
    bio: 'Test user bio',
    status: 'active'
  },

  validUser2: {
    wallet_address: 'TestWallet2222222222222222222222222222222222',
    username: 'testuser2', 
    email: 'test2@example.com',
    bio: 'Second test user',
    status: 'active'
  },

  adminUser: {
    wallet_address: 'AdminWallet111111111111111111111111111111111',
    username: 'adminuser',
    email: 'admin@example.com',
    bio: 'Admin test user',
    status: 'active'
  },

  newUserData: {
    wallet_address: 'NewWallet111111111111111111111111111111111111',
    username: 'newuser',
    email: 'new@example.com',
    bio: 'New user for testing'
  },

  invalidUser: {
    username: 'invaliduser', // Missing required wallet_address
    email: 'invalid-email', // Invalid email format
    bio: 'Invalid user data'
  },

  bulkUsers: Array.from({ length: 5 }, (_, i) => ({
    wallet_address: `BulkWallet${(i + 1).toString().padStart(33, '0')}`,
    username: `bulkuser${i + 1}`,
    email: `bulk${i + 1}@example.com`,
    status: 'active'
  }))
};
