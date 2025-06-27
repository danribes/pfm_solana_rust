require('dotenv').config();

function getEnv(name, fallback, required = false) {
  const value = process.env[name] || fallback;
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const config = {
  // Connection settings
  host: getEnv('REDIS_HOST', 'localhost'),
  port: parseInt(getEnv('REDIS_PORT', '6379'), 10),
  password: getEnv('REDIS_PASSWORD', ''),
  db: parseInt(getEnv('REDIS_DB', '0'), 10),
  
  // Connection pool settings
  maxRetriesPerRequest: parseInt(getEnv('REDIS_MAX_RETRIES', '3'), 10),
  retryDelayOnFailover: parseInt(getEnv('REDIS_RETRY_DELAY', '100'), 10),
  enableReadyCheck: getEnv('REDIS_ENABLE_READY_CHECK', 'true') === 'true',
  maxLoadingTimeout: parseInt(getEnv('REDIS_MAX_LOADING_TIMEOUT', '10000'), 10),
  
  // Pool settings
  poolSize: parseInt(getEnv('REDIS_POOL_SIZE', '10'), 10),
  minPoolSize: parseInt(getEnv('REDIS_MIN_POOL_SIZE', '2'), 10),
  acquireTimeoutMillis: parseInt(getEnv('REDIS_ACQUIRE_TIMEOUT', '30000'), 10),
  createTimeoutMillis: parseInt(getEnv('REDIS_CREATE_TIMEOUT', '30000'), 10),
  destroyTimeoutMillis: parseInt(getEnv('REDIS_DESTROY_TIMEOUT', '5000'), 10),
  idleTimeoutMillis: parseInt(getEnv('REDIS_IDLE_TIMEOUT', '30000'), 10),
  reapIntervalMillis: parseInt(getEnv('REDIS_REAP_INTERVAL', '1000'), 10),
  
  // Security settings
  tls: getEnv('REDIS_TLS', 'false') === 'true',
  tlsInsecure: getEnv('REDIS_TLS_INSECURE', 'false') === 'true',
  
  // Performance settings
  lazyConnect: getEnv('REDIS_LAZY_CONNECT', 'true') === 'true',
  keepAlive: parseInt(getEnv('REDIS_KEEP_ALIVE', '30000'), 10),
  family: parseInt(getEnv('REDIS_FAMILY', '4'), 10), // 4 for IPv4, 6 for IPv6
  
  // Logging
  showFriendlyErrorStack: getEnv('REDIS_SHOW_ERROR_STACK', 'false') === 'true',
  enableOfflineQueue: getEnv('REDIS_ENABLE_OFFLINE_QUEUE', 'true') === 'true',
  
  // Cluster settings (for future use)
  enableAutoPipelining: getEnv('REDIS_ENABLE_AUTO_PIPELINING', 'false') === 'true',
  maxAutoPipelining: parseInt(getEnv('REDIS_MAX_AUTO_PIPELINING', '32'), 10),
};

// Test environment configuration
if (process.env.NODE_ENV === 'test') {
  config.db = parseInt(getEnv('TEST_REDIS_DB', '1'), 10);
  config.poolSize = parseInt(getEnv('TEST_REDIS_POOL_SIZE', '5'), 10);
  config.minPoolSize = parseInt(getEnv('TEST_REDIS_MIN_POOL_SIZE', '1'), 10);
  config.lazyConnect = true;
}

// Production environment configuration
if (process.env.NODE_ENV === 'production') {
  config.maxRetriesPerRequest = parseInt(getEnv('REDIS_MAX_RETRIES', '5'), 10);
  config.poolSize = parseInt(getEnv('REDIS_POOL_SIZE', '20'), 10);
  config.minPoolSize = parseInt(getEnv('REDIS_MIN_POOL_SIZE', '5'), 10);
  config.keepAlive = parseInt(getEnv('REDIS_KEEP_ALIVE', '60000'), 10);
}

module.exports = config; 