// backend/run-tests.js
// Set test environment
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.TEST_DB_NAME = 'community_test_db';
process.env.TEST_DB_USER = 'community_test_user';
process.env.TEST_DB_PASSWORD = 'test_password';
process.env.TEST_DB_HOST = 'localhost';
process.env.TEST_DB_PORT = '5432';
process.env.DB_SSL = 'false';
process.env.DB_POOL_MAX = '5';
process.env.DB_POOL_MIN = '0';
process.env.DB_POOL_IDLE = '10000';
process.env.DB_POOL_CONN_TIMEOUT = '2000';
process.env.DB_APP_NAME = 'community-test-app';

// Run Jest
const { execSync } = require('child_process');

try {
  console.log('Running database tests...');
  execSync('npx jest tests/database/ --verbose', { 
    stdio: 'inherit',
    cwd: __dirname 
  });
  console.log('All tests passed!');
} catch (error) {
  console.error('Tests failed:', error.message);
  process.exit(1);
} 