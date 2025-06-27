// backend/redis/index.js
const redisConnection = require('./connection');
const redisHealthCheck = require('./health');
const config = require('../config/redis');

/**
 * Initialize Redis connection and health checks
 */
async function initializeRedis() {
  try {
    console.log('Initializing Redis...');
    
    // Connect to Redis
    await redisConnection.connect();
    
    // Start health checks
    redisHealthCheck.startHealthChecks();
    
    console.log('Redis initialization completed');
    return true;
  } catch (error) {
    console.error('Redis initialization failed:', error.message);
    throw error;
  }
}

/**
 * Gracefully shutdown Redis
 */
async function shutdownRedis() {
  try {
    console.log('Shutting down Redis...');
    
    // Stop health checks
    redisHealthCheck.stopHealthChecks();
    
    // Disconnect from Redis
    await redisConnection.disconnect();
    
    console.log('Redis shutdown completed');
  } catch (error) {
    console.error('Redis shutdown error:', error.message);
    throw error;
  }
}

/**
 * Get Redis client instance
 */
function getRedisClient() {
  return redisConnection.getClient();
}

/**
 * Check if Redis is connected
 */
function isRedisConnected() {
  return redisConnection.isRedisConnected();
}

/**
 * Get Redis health status
 */
function getRedisHealth() {
  return redisHealthCheck.getHealthStatus();
}

/**
 * Perform Redis health check
 */
async function performHealthCheck() {
  return await redisHealthCheck.performHealthCheck();
}

module.exports = {
  // Connection management
  initializeRedis,
  shutdownRedis,
  getRedisClient,
  isRedisConnected,
  
  // Health monitoring
  getRedisHealth,
  performHealthCheck,
  
  // Direct access to modules
  connection: redisConnection,
  health: redisHealthCheck,
  config,
}; 