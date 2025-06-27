const Redis = require('ioredis');
const config = require('../config/redis');

class RedisConnection {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxConnectionAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
  }

  /**
   * Initialize Redis connection with retry logic
   */
  async connect() {
    try {
      if (process.env.NODE_ENV !== 'test') console.log('Connecting to Redis...');
      
      this.client = new Redis({
        host: config.host,
        port: config.port,
        password: config.password,
        db: config.db,
        maxRetriesPerRequest: config.maxRetriesPerRequest,
        retryDelayOnFailover: config.retryDelayOnFailover,
        enableReadyCheck: config.enableReadyCheck,
        maxLoadingTimeout: config.maxLoadingTimeout,
        lazyConnect: config.lazyConnect,
        keepAlive: config.keepAlive,
        family: config.family,
        showFriendlyErrorStack: config.showFriendlyErrorStack,
        enableOfflineQueue: config.enableOfflineQueue,
        enableAutoPipelining: config.enableAutoPipelining,
        maxAutoPipelining: config.maxAutoPipelining,
        tls: config.tls ? {} : undefined,
        tlsInsecure: config.tlsInsecure,
      });

      // Set up event listeners
      this.setupEventListeners();

      // Connect to Redis
      await this.client.connect();
      
      this.isConnected = true;
      this.connectionAttempts = 0;
      this.reconnectDelay = 1000;
      
      if (process.env.NODE_ENV !== 'test') console.log('Successfully connected to Redis');
      return this.client;
      
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') console.error('Failed to connect to Redis:', error.message);
      await this.handleConnectionError(error);
      throw error;
    }
  }

  /**
   * Set up Redis event listeners
   */
  setupEventListeners() {
    this.client.on('connect', () => {
      if (process.env.NODE_ENV !== 'test') console.log('Redis client connected');
      this.isConnected = true;
    });

    this.client.on('ready', () => {
      if (process.env.NODE_ENV !== 'test') console.log('Redis client ready');
      this.isConnected = true;
    });

    this.client.on('error', (error) => {
      if (process.env.NODE_ENV !== 'test') console.error('Redis connection error:', error.message);
      this.isConnected = false;
      this.handleConnectionError(error);
    });

    this.client.on('close', () => {
      if (process.env.NODE_ENV !== 'test') console.log('Redis connection closed');
      this.isConnected = false;
    });

    this.client.on('reconnecting', (delay) => {
      if (process.env.NODE_ENV !== 'test') console.log(`Redis reconnecting in ${delay}ms`);
    });

    this.client.on('end', () => {
      if (process.env.NODE_ENV !== 'test') console.log('Redis connection ended');
      this.isConnected = false;
    });
  }

  /**
   * Handle connection errors with exponential backoff
   */
  async handleConnectionError(error) {
    this.connectionAttempts++;
    
    if (this.connectionAttempts <= this.maxConnectionAttempts) {
      if (process.env.NODE_ENV !== 'test') console.log(`Connection attempt ${this.connectionAttempts}/${this.maxConnectionAttempts}`);
      
      // Exponential backoff
      const delay = this.reconnectDelay * Math.pow(2, this.connectionAttempts - 1);
      if (process.env.NODE_ENV !== 'test') console.log(`Retrying connection in ${delay}ms...`);
      
      setTimeout(async () => {
        try {
          await this.connect();
        } catch (retryError) {
          if (process.env.NODE_ENV !== 'test') console.error('Retry connection failed:', retryError.message);
        }
      }, delay);
    } else {
      if (process.env.NODE_ENV !== 'test') console.error('Max connection attempts reached. Redis connection failed.');
      throw new Error('Redis connection failed after maximum retry attempts');
    }
  }

  /**
   * Get Redis client instance
   */
  getClient() {
    if (!this.client) {
      throw new Error('Redis client not initialized. Call connect() first.');
    }
    return this.client;
  }

  /**
   * Check if Redis is connected
   */
  isRedisConnected() {
    return this.isConnected && this.client && this.client.status === 'ready';
  }

  /**
   * Execute Redis command with error handling
   */
  async executeCommand(command, ...args) {
    try {
      if (!this.isRedisConnected()) {
        throw new Error('Redis not connected');
      }
      
      return await this.client[command](...args);
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') console.error(`Redis command '${command}' failed:`, error.message);
      throw error;
    }
  }

  /**
   * Close Redis connection
   */
  async disconnect() {
    try {
      if (this.client) {
        await this.client.quit();
        this.isConnected = false;
        if (process.env.NODE_ENV !== 'test') console.log('Redis connection closed gracefully');
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') console.error('Error closing Redis connection:', error.message);
      throw error;
    }
  }

  /**
   * Ping Redis to check connectivity
   */
  async ping() {
    try {
      const result = await this.executeCommand('ping');
      return result === 'PONG';
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') console.error('Redis ping failed:', error.message);
      return false;
    }
  }

  /**
   * Get Redis info
   */
  async getInfo() {
    try {
      return await this.executeCommand('info');
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') console.error('Failed to get Redis info:', error.message);
      throw error;
    }
  }
}

// Create singleton instance
const redisConnection = new RedisConnection();

module.exports = redisConnection; 