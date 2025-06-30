const session = require('express-session');
const { RedisStore } = require('connect-redis');
const redis = require('../redis');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Session configuration constants
const SESSION_SECRET = process.env.SESSION_SECRET || 'default-session-secret-change-in-production';
const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'sid';
const SESSION_TIMEOUT = parseInt(process.env.SESSION_TIMEOUT || '3600000', 10); // 1 hour
const IS_PROD = process.env.NODE_ENV === 'production';

let sessionMiddleware = null;

/**
 * Create and configure session middleware
 */
async function createSessionMiddleware() {
  try {
    console.log('Creating session middleware...');
    
    // Ensure Redis is connected
    if (!redis.isRedisConnected()) {
      console.log('Waiting for Redis connection...');
      let attempts = 0;
      while (!redis.isRedisConnected() && attempts < 30) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }
      
      if (!redis.isRedisConnected()) {
        throw new Error('Redis connection timeout after 30 seconds');
      }
    }

    // Get Redis client
    const redisClient = redis.getRedisClient();
    console.log('Redis client ready for session store');

    // Configure Redis store for connect-redis v9
    const store = new RedisStore({
      client: redisClient,
      prefix: 'session:',
      ttl: Math.floor(SESSION_TIMEOUT / 1000), // TTL in seconds
    });

    // Test store connection
    try {
      await store.client.ping();
      console.log('Session store Redis connection verified');
    } catch (error) {
      console.error('Session store Redis connection test failed:', error);
      throw error;
    }

    // Create session middleware
    const middleware = session({
      store: store,
      name: SESSION_COOKIE_NAME,
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      rolling: true, // Reset expiration on each request
      genid: () => uuidv4(),
      cookie: {
        httpOnly: true,
        secure: IS_PROD,
        sameSite: IS_PROD ? 'strict' : 'lax',
        maxAge: SESSION_TIMEOUT,
        path: '/',
      },
      unset: 'destroy'
    });

    console.log('Session middleware created successfully');
    return middleware;

  } catch (error) {
    console.error('Failed to create session middleware:', error);
    throw error;
  }
}

/**
 * Get session middleware (singleton pattern)
 */
async function getSessionMiddleware() {
  if (!sessionMiddleware) {
    sessionMiddleware = await createSessionMiddleware();
  }
  return sessionMiddleware;
}

/**
 * Reset session middleware (for testing)
 */
function resetSessionMiddleware() {
  sessionMiddleware = null;
}

module.exports = {
  getSessionMiddleware,
  resetSessionMiddleware,
  createSessionMiddleware
}; 