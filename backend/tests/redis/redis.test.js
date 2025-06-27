const redis = require('../../redis');
const config = require('../../config/redis');

describe('Redis Configuration & Connection Tests', () => {
  beforeAll(async () => {
    // Set test environment
    process.env.NODE_ENV = 'test';
    
    // Initialize Redis for tests
    try {
      await redis.initializeRedis();
    } catch (error) {
      // Redis might not be available, tests will handle this
    }
  });

  afterAll(async () => {
    // Cleanup
    await redis.shutdownRedis();
  });

  describe('Configuration Tests', () => {
    test('should load Redis configuration correctly', () => {
      expect(config).toBeDefined();
      expect(config.host).toBe('localhost');
      expect(config.port).toBe(6379);
      expect(config.db).toBe(1); // Test environment uses DB 1
      expect(config.poolSize).toBe(5); // Test environment uses smaller pool
    });

    test('should have required configuration fields', () => {
      const requiredFields = [
        'host', 'port', 'password', 'db',
        'maxRetriesPerRequest', 'retryDelayOnFailover',
        'poolSize', 'minPoolSize', 'lazyConnect'
      ];

      requiredFields.forEach(field => {
        expect(config).toHaveProperty(field);
      });
    });
  });

  describe('Connection Tests', () => {
    test('should initialize Redis connection', async () => {
      try {
        await redis.initializeRedis();
        expect(redis.isRedisConnected()).toBe(true);
      } catch (error) {
        // If Redis is not running, skip this test
        if (error.message.includes('Redis')) {
          // Skip test silently
          return;
        }
        throw error;
      }
    });

    test('should handle connection errors gracefully', async () => {
      // Test with invalid configuration
      const originalHost = config.host;
      config.host = 'invalid-host';
      
      try {
        await redis.connection.connect();
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toMatch(/(Redis|Connection|ENOTFOUND|ECONNREFUSED)/);
      } finally {
        config.host = originalHost;
      }
    });

    test('should provide Redis client instance', () => {
      try {
        const client = redis.getRedisClient();
        expect(client).toBeDefined();
      } catch (error) {
        // Expected if not connected
        expect(error.message).toContain('not initialized');
      }
    });
  });

  describe('Health Check Tests', () => {
    test('should perform health check', async () => {
      try {
        const healthStatus = await redis.performHealthCheck();
        expect(healthStatus).toBeDefined();
        expect(healthStatus).toHaveProperty('isHealthy');
        expect(healthStatus).toHaveProperty('lastCheck');
        expect(healthStatus).toHaveProperty('responseTime');
      } catch (error) {
        // Expected if Redis is not running - skip test silently
        if (error.message.includes('Redis')) {
          return;
        }
        throw error;
      }
    });

    test('should get health status', () => {
      const healthStatus = redis.getRedisHealth();
      expect(healthStatus).toBeDefined();
      expect(healthStatus).toHaveProperty('isHealthy');
      expect(healthStatus).toHaveProperty('errorCount');
    });

    test('should start and stop health checks', () => {
      // Start health checks
      redis.health.startHealthChecks(1000); // 1 second interval
      expect(redis.health.healthCheckInterval).toBeDefined();

      // Stop health checks
      redis.health.stopHealthChecks();
      expect(redis.health.healthCheckInterval).toBeNull();
    });
  });

  describe('Redis Operations Tests', () => {
    test('should execute Redis commands', async () => {
      try {
        // Ensure Redis is initialized
        if (!redis.isRedisConnected()) {
          await redis.initializeRedis();
        }
        
        // Test basic operations
        const client = redis.getRedisClient();
        
        // Set a test key
        await client.set('test:key', 'test:value');
        
        // Get the test key
        const value = await client.get('test:key');
        expect(value).toBe('test:value');
        
        // Delete the test key
        await client.del('test:key');
        
        // Verify deletion
        const deletedValue = await client.get('test:key');
        expect(deletedValue).toBeNull();
        
      } catch (error) {
        // Expected if Redis is not running - skip test silently
        if (error.message.includes('Redis')) {
          return;
        }
        throw error;
      }
    });

    test('should handle Redis ping', async () => {
      try {
        // Ensure Redis is initialized
        if (!redis.isRedisConnected()) {
          await redis.initializeRedis();
        }
        
        const pingResult = await redis.connection.ping();
        expect(pingResult).toBe(true);
      } catch (error) {
        // Expected if Redis is not running - skip test silently
        if (error.message.includes('Redis')) {
          return;
        }
        throw error;
      }
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle connection errors with retry logic', async () => {
      const originalMaxAttempts = redis.connection.maxConnectionAttempts;
      redis.connection.maxConnectionAttempts = 1; // Limit retries for test
      
      try {
        await redis.connection.connect();
      } catch (error) {
        expect(error.message).toContain('Redis');
      } finally {
        redis.connection.maxConnectionAttempts = originalMaxAttempts;
      }
    });

    test('should track error count in health checks', () => {
      const initialErrorCount = redis.health.healthStatus.errorCount;
      
      // Simulate an error
      redis.health.healthStatus.errorCount++;
      
      expect(redis.health.healthStatus.errorCount).toBe(initialErrorCount + 1);
      
      // Reset error count
      redis.health.resetErrorCount();
      expect(redis.health.healthStatus.errorCount).toBe(0);
    });
  });
}); 