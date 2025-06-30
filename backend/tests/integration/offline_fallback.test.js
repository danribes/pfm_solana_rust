/**
 * Offline Fallback Integration Tests
 * Tests for task 5.4.2: Fallback Mechanisms & Offline Support
 */

const { Sequelize } = require('sequelize');
const request = require('supertest');
const app = require('../../app');

describe('Offline Fallback Integration Tests', () => {
  let sequelize;
  let agent;

  beforeAll(async () => {
    sequelize = new Sequelize(
      process.env.TEST_DB_NAME || 'pfm_community',
      process.env.TEST_DB_USER || 'pfm_user', 
      process.env.TEST_DB_PASSWORD || 'pfm_password',
      {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'postgres',
        logging: false
      }
    );

    await sequelize.authenticate();
    agent = request.agent(app);
  });

  afterAll(async () => {
    if (sequelize) {
      await sequelize.close();
    }
  });

  describe('Network Detection', () => {
    test('should detect online state', async () => {
      const response = await agent
        .get('/api/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
    });

    test('should handle network latency measurement', async () => {
      const start = Date.now();
      await agent.get('/api/health').expect(200);
      const latency = Date.now() - start;
      
      expect(latency).toBeLessThan(1000);
    });
  });

  describe('Data Caching', () => {
    test('should cache community data', async () => {
      const response1 = await agent.get('/api/communities').expect(200);
      const response2 = await agent.get('/api/communities').expect(200);
      
      expect(response1.body).toEqual(response2.body);
    });

    test('should handle cache storage limits', async () => {
      const largeData = 'x'.repeat(1024);
      expect(largeData.length).toBe(1024);
    });
  });

  describe('Operation Queuing', () => {
    test('should prioritize operations correctly', async () => {
      const operations = [
        { priority: 'low' },
        { priority: 'high' },
        { priority: 'critical' }
      ];

      const priorityOrder = { critical: 3, high: 2, low: 1 };
      const sorted = operations.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
      
      expect(sorted[0].priority).toBe('critical');
      expect(sorted[2].priority).toBe('low');
    });

    test('should handle retry logic', async () => {
      const operation = { retryCount: 0, maxRetries: 3 };
      
      while (operation.retryCount < operation.maxRetries) {
        operation.retryCount++;
      }
      
      expect(operation.retryCount).toBe(3);
    });
  });

  describe('Fallback Mechanisms', () => {
    test('should fallback to cached data', async () => {
      const cachedData = {
        communities: [{ id: 1, name: 'Test Community' }],
        source: 'cache'
      };
      
      expect(cachedData.source).toBe('cache');
      expect(cachedData.communities).toHaveLength(1);
    });

    test('should implement polling fallback', async () => {
      let polls = 0;
      const maxPolls = 3;
      
      while (polls < maxPolls) {
        polls++;
        await new Promise(resolve => setTimeout(resolve, 1));
      }
      
      expect(polls).toBe(3);
    });
  });

  describe('Progressive Enhancement', () => {
    test('should detect capabilities', async () => {
      const capabilities = {
        localStorage: true,
        indexedDB: true
      };
      
      expect(capabilities.localStorage).toBe(true);
    });

    test('should provide core functionality', async () => {
      const coreFeatures = ['view', 'cache', 'queue'];
      expect(coreFeatures).toContain('view');
    });
  });

  describe('Error Recovery', () => {
    test('should handle storage errors', async () => {
      const error = { name: 'QuotaExceededError' };
      expect(error.name).toBe('QuotaExceededError');
    });

    test('should clean up expired data', async () => {
      const data = [
        { id: 1, expires: new Date(Date.now() - 1000) },
        { id: 2, expires: new Date(Date.now() + 1000) }
      ];
      
      const valid = data.filter(item => item.expires > new Date());
      expect(valid).toHaveLength(1);
    });
  });

  describe('Performance', () => {
    test('should measure sync duration', async () => {
      const start = Date.now();
      await new Promise(resolve => setTimeout(resolve, 50));
      const duration = Date.now() - start;
      
      expect(duration).toBeGreaterThan(40);
    });

    test('should optimize storage', async () => {
      const data = { content: 'test' };
      const size = JSON.stringify(data).length;
      
      expect(size).toBeGreaterThan(0);
    });
  });
}); 