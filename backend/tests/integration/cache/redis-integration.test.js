/**
 * Redis Cache Integration Tests
 * Tests Redis caching operations and session management integration
 */

const redis = require('../../../redis');
const sessionStore = require('../../../session/store');
const IntegrationTestHelper = require('../../helpers/integration-setup');

describe('Redis Cache Integration Tests', () => {
  let helper;
  let redisClient;

  beforeAll(async () => {
    helper = new IntegrationTestHelper();
    await helper.setup();
    redisClient = redis.getRedisClient();
  });

  afterAll(async () => {
    await helper.teardown();
  });

  beforeEach(async () => {
    // Clear Redis cache before each test
    await redisClient.flushall();
  });

  describe('Basic Cache Operations', () => {
    it('should store and retrieve data from cache', async () => {
      const key = 'test:key';
      const value = { message: 'Hello Redis', timestamp: Date.now() };

      // Store data
      await redisClient.setex(key, 300, JSON.stringify(value));

      // Retrieve data
      const retrieved = await redisClient.get(key);
      const parsedValue = JSON.parse(retrieved);

      expect(parsedValue).toEqual(value);
    });

    it('should handle cache expiration', async () => {
      const key = 'test:expiring';
      const value = 'This will expire';

      // Store with 1 second TTL
      await redisClient.setex(key, 1, value);

      // Verify data exists
      const immediate = await redisClient.get(key);
      expect(immediate).toBe(value);

      // Wait for expiration
      await helper.wait(1100);

      // Verify data expired
      const expired = await redisClient.get(key);
      expect(expired).toBeNull();
    });

    it('should handle key deletion', async () => {
      const key = 'test:delete';
      const value = 'Will be deleted';

      await redisClient.setex(key, 300, value);
      
      // Verify exists
      const exists = await redisClient.exists(key);
      expect(exists).toBe(1);

      // Delete key
      await redisClient.del(key);

      // Verify deleted
      const deletedExists = await redisClient.exists(key);
      expect(deletedExists).toBe(0);
    });
  });

  describe('Session Management Integration', () => {
    it('should store and retrieve session data', async () => {
      const sessionId = 'test-session-123';
      const sessionData = {
        userId: 'user-123',
        walletAddress: 'TestWallet1111111111111111111111111111111111',
        createdAt: Date.now()
      };

      // Store session
      await sessionStore.set(sessionId, sessionData);

      // Retrieve session
      const retrieved = await sessionStore.get(sessionId);

      expect(retrieved).toEqual(sessionData);
    });

    it('should handle session expiration', async () => {
      const sessionId = 'expiring-session';
      const sessionData = { userId: 'user-456' };

      // Store session with short TTL
      await sessionStore.set(sessionId, sessionData, 1); // 1 second

      // Verify exists
      const immediate = await sessionStore.get(sessionId);
      expect(immediate).toEqual(sessionData);

      // Wait for expiration
      await helper.wait(1100);

      // Verify expired
      const expired = await sessionStore.get(sessionId);
      expect(expired).toBeNull();
    });

    it('should destroy session properly', async () => {
      const sessionId = 'destroy-session';
      const sessionData = { userId: 'user-789' };

      await sessionStore.set(sessionId, sessionData);
      
      // Verify exists
      const exists = await sessionStore.get(sessionId);
      expect(exists).toEqual(sessionData);

      // Destroy session
      await sessionStore.destroy(sessionId);

      // Verify destroyed
      const destroyed = await sessionStore.get(sessionId);
      expect(destroyed).toBeNull();
    });
  });

  describe('Cache Patterns', () => {
    it('should implement cache-aside pattern', async () => {
      const userId = 'cache-aside-user';
      const cacheKey = `user:${userId}`;
      const userData = { id: userId, name: 'Cache User' };

      // Simulate cache miss - check cache first
      let cachedData = await redisClient.get(cacheKey);
      expect(cachedData).toBeNull();

      // Simulate database fetch and cache store
      await redisClient.setex(cacheKey, 300, JSON.stringify(userData));

      // Verify cache hit on subsequent request
      cachedData = await redisClient.get(cacheKey);
      expect(JSON.parse(cachedData)).toEqual(userData);
    });

    it('should handle cache invalidation', async () => {
      const entityId = 'entity-123';
      const cacheKeys = [
        `entity:${entityId}`,
        `entity:${entityId}:stats`,
        `entity:${entityId}:relations`
      ];

      // Store related cache entries
      for (const key of cacheKeys) {
        await redisClient.setex(key, 300, JSON.stringify({ data: key }));
      }

      // Verify all exist
      for (const key of cacheKeys) {
        const exists = await redisClient.exists(key);
        expect(exists).toBe(1);
      }

      // Invalidate all related cache
      const pattern = `entity:${entityId}*`;
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }

      // Verify all invalidated
      for (const key of cacheKeys) {
        const exists = await redisClient.exists(key);
        expect(exists).toBe(0);
      }
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent cache operations', async () => {
      const promises = Array.from({ length: 10 }, async (_, i) => {
        const key = `concurrent:${i}`;
        const value = `value-${i}`;
        
        await redisClient.setex(key, 300, value);
        return redisClient.get(key);
      });

      const results = await Promise.all(promises);

      results.forEach((result, i) => {
        expect(result).toBe(`value-${i}`);
      });
    });

    it('should handle concurrent session operations', async () => {
      const sessionPromises = Array.from({ length: 5 }, async (_, i) => {
        const sessionId = `concurrent-session-${i}`;
        const sessionData = { userId: `user-${i}` };
        
        await sessionStore.set(sessionId, sessionData);
        return sessionStore.get(sessionId);
      });

      const sessions = await Promise.all(sessionPromises);

      sessions.forEach((session, i) => {
        expect(session).toEqual({ userId: `user-${i}` });
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle Redis connection errors gracefully', async () => {
      // Simulate connection error by disconnecting
      await redis.shutdownRedis();

      // Operations should handle the error gracefully
      try {
        await redisClient.get('test:key');
      } catch (error) {
        expect(error).toBeDefined();
      }

      // Reconnect for other tests
      await redis.initializeRedis();
    });

    it('should handle malformed data gracefully', async () => {
      const key = 'malformed:data';
      
      // Store malformed JSON
      await redisClient.setex(key, 300, 'invalid-json{');

      // Retrieving should not crash
      const data = await redisClient.get(key);
      expect(data).toBe('invalid-json{');

      // Parsing should be handled by application layer
      expect(() => JSON.parse(data)).toThrow();
    });
  });

  describe('Performance', () => {
    it('should perform cache operations within acceptable time', async () => {
      const startTime = Date.now();
      
      // Perform multiple operations
      await redisClient.setex('perf:test1', 300, 'value1');
      await redisClient.setex('perf:test2', 300, 'value2');
      await redisClient.get('perf:test1');
      await redisClient.get('perf:test2');
      await redisClient.del('perf:test1', 'perf:test2');
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100); // Should complete within 100ms
    });

    it('should handle bulk operations efficiently', async () => {
      const operations = Array.from({ length: 100 }, (_, i) => [
        'setex', `bulk:${i}`, '300', `value-${i}`
      ]);

      const startTime = Date.now();
      
      // Use pipeline for bulk operations
      const pipeline = redisClient.pipeline();
      operations.forEach(([command, ...args]) => {
        pipeline[command](...args);
      });
      await pipeline.exec();
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(200); // Should complete within 200ms

      // Verify some random operations succeeded
      const sample1 = await redisClient.get('bulk:0');
      const sample2 = await redisClient.get('bulk:50');
      const sample3 = await redisClient.get('bulk:99');
      
      expect(sample1).toBe('value-0');
      expect(sample2).toBe('value-50');
      expect(sample3).toBe('value-99');
    });
  });
}); 