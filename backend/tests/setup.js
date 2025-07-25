const { sequelize } = require('../models');

// Set test environment
process.env.NODE_ENV = 'test';

// Use the existing development database for tests
// This connects to the running PostgreSQL container
process.env.TEST_DB_HOST = 'localhost';
process.env.TEST_DB_PORT = '5432';
process.env.TEST_DB_NAME = 'pfm_community';
process.env.TEST_DB_USER = 'pfm_user';
process.env.TEST_DB_PASSWORD = 'pfm_password';

// Set Redis configuration to use the running Redis container
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';

// Set JWT and session secrets for testing
process.env.JWT_SECRET = 'test_jwt_secret_key_for_testing_only';
process.env.SESSION_SECRET = 'test_session_secret_key_for_testing_only';

// Debug: Log the environment variables
console.log('Test Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('TEST_DB_HOST:', process.env.TEST_DB_HOST);
console.log('TEST_DB_PORT:', process.env.TEST_DB_PORT);
console.log('TEST_DB_NAME:', process.env.TEST_DB_NAME);
console.log('TEST_DB_USER:', process.env.TEST_DB_USER);
console.log('TEST_DB_PASSWORD:', process.env.TEST_DB_PASSWORD);

// Global test setup
beforeAll(async () => {
  // Ensure database is ready for testing
  try {
    await sequelize.authenticate();
    console.log('Database connection established for testing');
  } catch (error) {
    console.error('Unable to connect to the database for testing:', error);
    throw error;
  }
});

// Global test teardown
afterAll(async () => {
  await sequelize.close();
  console.log('Database connection closed after testing');
});

// Increase timeout for database operations
jest.setTimeout(30000);
