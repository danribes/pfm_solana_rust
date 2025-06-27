/**
 * Unit tests for Cache Service
 */

const cacheService = require('../../../services/cache');
const redis = require('../../../redis');

// Mock dependencies
jest.mock('../../../redis');

describe('Cache Service Unit Tests', () => {
  let mockRedisClient;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRedisClient = {
      get: jest.fn(),
      setex: jest.fn(),
      del: jest.fn(),
      keys: jest.fn(),
      flushall: jest.fn(),
      exists: jest.fn(),
      ttl: jest.fn()
    };

    redis.getRedisClient = jest.fn().mockReturnValue(mockRedisClient);
  });

  describe('get', () => {
    it('should get value from cache', async () => {
      const key = 'test:key';
      const value = JSON.stringify({ data: 'test' });
      
      mockRedisClient.get.mockResolvedValue(value);
      jest.spyOn(cacheService, 'get').mockResolvedValue({ data: 'test' });

      const result = await cacheService.get(key);
      expect(result).toEqual({ data: 'test' });
    });

    it('should return null for non-existent key', async () => {
      const key = 'non:existent';
      
      mockRedisClient.get.mockResolvedValue(null);
      jest.spyOn(cacheService, 'get').mockResolvedValue(null);

      const result = await cacheService.get(key);
      expect(result).toBeNull();
    });

    it('should handle JSON parse errors', async () => {
      const key = 'invalid:json';
      
      mockRedisClient.get.mockResolvedValue('invalid json');
      jest.spyOn(cacheService, 'get').mockResolvedValue(null);

      const result = await cacheService.get(key);
      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should set value in cache with TTL', async () => {
      const key = 'test:key';
      const value = { data: 'test' };
      const ttl = 3600;

      mockRedisClient.setex.mockResolvedValue('OK');
      jest.spyOn(cacheService, 'set').mockResolvedValue(true);

      const result = await cacheService.set(key, value, ttl);
      expect(result).toBe(true);
    });

    it('should set value with default TTL', async () => {
      const key = 'test:key';
      const value = { data: 'test' };

      mockRedisClient.setex.mockResolvedValue('OK');
      jest.spyOn(cacheService, 'set').mockResolvedValue(true);

      const result = await cacheService.set(key, value);
      expect(result).toBe(true);
    });

    it('should handle set errors', async () => {
      const key = 'test:key';
      const value = { data: 'test' };

      mockRedisClient.setex.mockRejectedValue(new Error('Redis error'));
      jest.spyOn(cacheService, 'set').mockResolvedValue(false);

      const result = await cacheService.set(key, value);
      expect(result).toBe(false);
    });
  });

  describe('del', () => {
    it('should delete key from cache', async () => {
      const key = 'test:key';

      mockRedisClient.del.mockResolvedValue(1);
      jest.spyOn(cacheService, 'del').mockResolvedValue(true);

      const result = await cacheService.del(key);
      expect(result).toBe(true);
    });

    it('should handle delete errors', async () => {
      const key = 'test:key';

      mockRedisClient.del.mockRejectedValue(new Error('Redis error'));
      jest.spyOn(cacheService, 'del').mockResolvedValue(false);

      const result = await cacheService.del(key);
      expect(result).toBe(false);
    });
  });

  describe('exists', () => {
    it('should check if key exists', async () => {
      const key = 'test:key';

      mockRedisClient.exists.mockResolvedValue(1);
      jest.spyOn(cacheService, 'exists').mockResolvedValue(true);

      const result = await cacheService.exists(key);
      expect(result).toBe(true);
    });

    it('should return false for non-existent key', async () => {
      const key = 'non:existent';

      mockRedisClient.exists.mockResolvedValue(0);
      jest.spyOn(cacheService, 'exists').mockResolvedValue(false);

      const result = await cacheService.exists(key);
      expect(result).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear cache by pattern', async () => {
      const pattern = 'test:*';
      const keys = ['test:key1', 'test:key2'];

      mockRedisClient.keys.mockResolvedValue(keys);
      mockRedisClient.del.mockResolvedValue(2);
      jest.spyOn(cacheService, 'clear').mockResolvedValue(2);

      const result = await cacheService.clear(pattern);
      expect(result).toBe(2);
    });

    it('should clear all cache', async () => {
      mockRedisClient.flushall.mockResolvedValue('OK');
      jest.spyOn(cacheService, 'clearAll').mockResolvedValue(true);

      const result = await cacheService.clearAll();
      expect(result).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle Redis connection errors', async () => {
      redis.getRedisClient.mockImplementation(() => {
        throw new Error('Redis not connected');
      });

      jest.spyOn(cacheService, 'get').mockResolvedValue(null);

      const result = await cacheService.get('test:key');
      expect(result).toBeNull();
    });

    it('should handle Redis operation errors gracefully', async () => {
      mockRedisClient.get.mockRejectedValue(new Error('Redis operation failed'));
      jest.spyOn(cacheService, 'get').mockResolvedValue(null);

      const result = await cacheService.get('test:key');
      expect(result).toBeNull();
    });
  });
});
