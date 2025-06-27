require('dotenv').config();

function getEnv(name, fallback, required = false) {
  const value = process.env[name] || fallback;
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// Test environment configuration
if (process.env.NODE_ENV === 'test') {
  const config = {
    host: getEnv('TEST_DB_HOST', 'localhost'),
    port: parseInt(getEnv('TEST_DB_PORT', '5432'), 10),
    database: getEnv('TEST_DB_NAME', 'community_test_db'),
    username: getEnv('TEST_DB_USER', 'community_test_user'),
    password: getEnv('TEST_DB_PASSWORD', 'test_password'),
    dialect: 'postgres',
    ssl: false,
    max: 5,
    min: 0,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 2000,
    application_name: 'community-app-test',
    logging: false,
  };
  
  // Debug logging for test environment
  console.log('Test Database Config:', {
    host: config.host,
    port: config.port,
    database: config.database,
    username: config.username,
    password: config.password ? '[SET]' : '[NOT SET]'
  });
  
  module.exports = config;
} else {
  // Production/development configuration
  const config = {
    host: getEnv('DB_HOST', 'localhost', true),
    port: parseInt(getEnv('DB_PORT', '5432'), 10),
    database: getEnv('DB_NAME', 'community_db', true),
    username: getEnv('DB_USER', 'community_user', true),
    password: getEnv('DB_PASSWORD', '', true),
    dialect: 'postgres',
    ssl: getEnv('DB_SSL', 'false') === 'true',
    max: parseInt(getEnv('DB_POOL_MAX', '10'), 10),
    min: parseInt(getEnv('DB_POOL_MIN', '0'), 10),
    idleTimeoutMillis: parseInt(getEnv('DB_POOL_IDLE', '10000'), 10),
    connectionTimeoutMillis: parseInt(getEnv('DB_POOL_CONN_TIMEOUT', '2000'), 10),
    application_name: getEnv('DB_APP_NAME', 'community-app'),
  };
  
  module.exports = config;
} 