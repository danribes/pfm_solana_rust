/**
 * Blockchain Error Handling Integration Tests
 * Tests for comprehensive blockchain error handling and recovery mechanisms
 */

const request = require('supertest');
const app = require('../../app');
const solanaClient = require('../../blockchain/solana');

describe('Blockchain Error Handling Integration Tests', () => {
  let authToken;

  beforeAll(async () => {
    // Get authentication token for tests
    const authResponse = await request(app)
      .post('/api/auth/login')
      .send({
        walletAddress: '11111111111111111111111111111112',
        signature: 'test_signature'
      });

    if (authResponse.body.token) {
      authToken = authResponse.body.token;
    }
  });

  describe('Network Error Handling', () => {
    test('should handle network connection failures gracefully', async () => {
      // Mock network failure
      jest.spyOn(solanaClient, 'getConnection').mockImplementation(() => {
        throw new Error('Network connection failed');
      });

      const response = await request(app)
        .get('/api/blockchain/health')
        .set('Authorization', `Bearer ${authToken}`);

      expect([503, 500]).toContain(response.status);
      
      // Restore mock
      solanaClient.getConnection.mockRestore();
    });

    test('should handle RPC endpoint timeouts', async () => {
      // Mock timeout
      jest.spyOn(solanaClient, 'getBalance').mockImplementation(() => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 100);
        });
      });

      const response = await request(app)
        .get('/api/blockchain/balance/11111111111111111111111111111112')
        .set('Authorization', `Bearer ${authToken}`);

      expect([408, 500]).toContain(response.status);

      solanaClient.getBalance.mockRestore();
    });

    test('should provide fallback network endpoints', async () => {
      const response = await request(app)
        .get('/api/blockchain/networks/fallback')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('fallbackNetworks');
      expect(Array.isArray(response.body.fallbackNetworks)).toBe(true);
      expect(response.body.fallbackNetworks.length).toBeGreaterThan(0);
    });

    test('should track network health status', async () => {
      const response = await request(app)
        .get('/api/blockchain/networks/health')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('networks');
      expect(Array.isArray(response.body.networks)).toBe(true);
      
      // Check network status structure
      if (response.body.networks.length > 0) {
        const network = response.body.networks[0];
        expect(network).toHaveProperty('name');
        expect(network).toHaveProperty('status');
        expect(network).toHaveProperty('responseTime');
        expect(network).toHaveProperty('lastCheck');
      }
    });
  });

  describe('Transaction Error Handling', () => {
    test('should handle insufficient funds error', async () => {
      // Mock insufficient funds
      jest.spyOn(solanaClient, 'getBalance').mockResolvedValue({
        lamports: 0,
        sol: 0,
        network: 'devnet'
      });

      const response = await request(app)
        .post('/api/blockchain/transaction/simulate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          to: '11111111111111111111111111111113',
          amount: 1.0,
          type: 'transfer'
        });

      expect([400, 500]).toContain(response.status);

      solanaClient.getBalance.mockRestore();
    });

    test('should handle transaction timeout with retry strategy', async () => {
      // Mock transaction timeout
      jest.spyOn(solanaClient, 'getTransactionStatus').mockImplementation(() => {
        throw new Error('Transaction confirmation timeout');
      });

      const response = await request(app)
        .get('/api/blockchain/transaction/status/test_signature')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(408);
      expect(response.body.error.code).toBe('TRANSACTION_TIMEOUT');
      expect(response.body.error.recovery).toHaveProperty('maxRetries');
      expect(response.body.error.recovery.autoRetry).toBe(true);

      solanaClient.getTransactionStatus.mockRestore();
    });

    test('should handle nonce errors with automatic adjustment', async () => {
      const response = await request(app)
        .post('/api/blockchain/transaction/retry')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          transactionId: 'test_tx_id',
          errorCode: 'NONCE_TOO_LOW'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('retryStrategy');
      expect(response.body.retryStrategy.actions).toContain('RETRY');
    });

    test('should handle blockhash expiration', async () => {
      const response = await request(app)
        .post('/api/blockchain/transaction/refresh-blockhash')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          transactionId: 'test_tx_id'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('newBlockhash');
      expect(response.body).toHaveProperty('updated');
      expect(response.body.updated).toBe(true);
    });
  });

  describe('Recovery Mechanisms', () => {
    test('should provide error recovery suggestions', async () => {
      const response = await request(app)
        .post('/api/blockchain/error/analyze')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          errorCode: 'CONNECTION_LOST',
          category: 'NETWORK',
          context: {
            network: 'devnet',
            operation: 'getBalance'
          }
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('suggestions');
      expect(Array.isArray(response.body.suggestions)).toBe(true);
      expect(response.body.suggestions).toContain('RECONNECT');
      expect(response.body).toHaveProperty('recoveryProbability');
    });

    test('should execute automatic recovery', async () => {
      const response = await request(app)
        .post('/api/blockchain/recovery/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          errorId: 'test_error_id',
          strategy: {
            actions: ['RECONNECT', 'RETRY'],
            maxRetries: 3,
            retryDelay: 1000
          }
        });

      expect(response.status).toBe(202);
      expect(response.body).toHaveProperty('recoveryId');
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('STARTED');
    });

    test('should track recovery progress', async () => {
      // Start recovery first
      const startResponse = await request(app)
        .post('/api/blockchain/recovery/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          errorId: 'test_error_id_2',
          strategy: {
            actions: ['WAIT', 'RETRY'],
            maxRetries: 2,
            retryDelay: 500
          }
        });

      const recoveryId = startResponse.body.recoveryId;

      // Check progress
      const progressResponse = await request(app)
        .get(`/api/blockchain/recovery/${recoveryId}/status`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(progressResponse.status).toBe(200);
      expect(progressResponse.body).toHaveProperty('status');
      expect(progressResponse.body).toHaveProperty('progress');
      expect(progressResponse.body).toHaveProperty('currentAction');
      expect(progressResponse.body).toHaveProperty('attempt');
    });

    test('should handle manual intervention scenarios', async () => {
      const response = await request(app)
        .post('/api/blockchain/error/manual-intervention')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          errorCode: 'INVALID_SIGNATURE',
          category: 'TRANSACTION',
          userAction: 'CHECK_WALLET'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('interventionRequired');
      expect(response.body.interventionRequired).toBe(true);
      expect(response.body).toHaveProperty('userInstructions');
      expect(Array.isArray(response.body.userInstructions)).toBe(true);
    });
  });

  describe('Offline Mode and Queue Management', () => {
    test('should queue operations when offline', async () => {
      const response = await request(app)
        .post('/api/blockchain/queue/operation')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'TRANSACTION',
          data: {
            to: '11111111111111111111111111111113',
            amount: 0.1
          },
          priority: 'HIGH'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('operationId');
      expect(response.body).toHaveProperty('queuePosition');
      expect(response.body).toHaveProperty('estimatedProcessTime');
    });

    test('should process queued operations when back online', async () => {
      // Set offline mode
      await request(app)
        .post('/api/blockchain/offline-mode')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ isOffline: true });

      // Queue an operation
      const queueResponse = await request(app)
        .post('/api/blockchain/queue/operation')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'QUERY',
          data: { operation: 'getBalance' },
          priority: 'MEDIUM'
        });

      const operationId = queueResponse.body.operationId;

      // Set back online
      await request(app)
        .post('/api/blockchain/offline-mode')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ isOffline: false });

      // Check if operation was processed
      const statusResponse = await request(app)
        .get(`/api/blockchain/queue/operation/${operationId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(statusResponse.status).toBe(200);
      expect(statusResponse.body).toHaveProperty('status');
      // Status should be either PROCESSING or COMPLETED
      expect(['PROCESSING', 'COMPLETED']).toContain(statusResponse.body.status);
    });

    test('should prioritize queued operations correctly', async () => {
      const response = await request(app)
        .get('/api/blockchain/queue/status')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('queue');
      expect(response.body).toHaveProperty('totalOperations');
      expect(response.body).toHaveProperty('priorityBreakdown');
      
      if (response.body.queue.length > 1) {
        // Check priority ordering (CRITICAL > HIGH > MEDIUM > LOW)
        const priorities = response.body.queue.map(op => op.priority);
        expect(priorities).toEqual(priorities.sort((a, b) => {
          const order = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
          return order[b] - order[a];
        }));
      }
    });
  });

  describe('User Feedback and Communication', () => {
    test('should provide user-friendly error messages', async () => {
      const response = await request(app)
        .post('/api/blockchain/error/user-message')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          errorCode: 'CONNECTION_LOST',
          category: 'NETWORK'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('userMessage');
      expect(response.body).toHaveProperty('severity');
      expect(response.body).toHaveProperty('actions');
      
      // Check that message is user-friendly (not technical)
      expect(response.body.userMessage).not.toContain('RPC');
      expect(response.body.userMessage).not.toContain('API');
      expect(response.body.userMessage.length).toBeGreaterThan(10);
    });

    test('should suggest appropriate user actions', async () => {
      const response = await request(app)
        .post('/api/blockchain/error/user-actions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          errorCode: 'INSUFFICIENT_FUNDS',
          category: 'TRANSACTION'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('actions');
      expect(Array.isArray(response.body.actions)).toBe(true);
      
      const actions = response.body.actions;
      expect(actions.some(action => action.label.includes('wallet'))).toBe(true);
      expect(actions.every(action => action.hasOwnProperty('label'))).toBe(true);
      expect(actions.every(action => action.hasOwnProperty('primary'))).toBe(true);
    });

    test('should track error metrics and analytics', async () => {
      const response = await request(app)
        .get('/api/blockchain/error/metrics')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('errorCount');
      expect(response.body).toHaveProperty('errorRate');
      expect(response.body).toHaveProperty('errorsByCategory');
      expect(response.body).toHaveProperty('errorsBySeverity');
      expect(response.body).toHaveProperty('recoverySuccessRate');
      expect(response.body).toHaveProperty('meanTimeToRecovery');
      expect(response.body).toHaveProperty('networkUptime');
      expect(response.body).toHaveProperty('lastUpdate');
      
      // Verify data types
      expect(typeof response.body.errorCount).toBe('number');
      expect(typeof response.body.errorRate).toBe('number');
      expect(typeof response.body.recoverySuccessRate).toBe('number');
      expect(typeof response.body.networkUptime).toBe('number');
    });
  });

  describe('System Resilience', () => {
    test('should gracefully degrade functionality during outages', async () => {
      // Simulate network outage
      jest.spyOn(solanaClient, 'getConnection').mockImplementation(() => {
        throw new Error('All networks down');
      });

      const response = await request(app)
        .get('/api/blockchain/status')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('systemStatus');
      expect(response.body.systemStatus).toBe('DEGRADED');
      expect(response.body).toHaveProperty('availableFeatures');
      expect(response.body).toHaveProperty('degradedFeatures');
      expect(Array.isArray(response.body.degradedFeatures)).toBe(true);

      solanaClient.getConnection.mockRestore();
    });

    test('should maintain data persistence during failures', async () => {
      const response = await request(app)
        .get('/api/blockchain/cache/status')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('cacheSize');
      expect(response.body).toHaveProperty('hitRate');
      expect(response.body).toHaveProperty('cachedDataTypes');
      expect(Array.isArray(response.body.cachedDataTypes)).toBe(true);
    });

    test('should handle circuit breaker patterns', async () => {
      // Trigger multiple failures to open circuit breaker
      for (let i = 0; i < 5; i++) {
        await request(app)
          .get('/api/blockchain/test-endpoint')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(503); // Service unavailable due to circuit breaker
      }

      // Check circuit breaker status
      const response = await request(app)
        .get('/api/blockchain/circuit-breaker/status')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('state');
      expect(['OPEN', 'HALF_OPEN', 'CLOSED']).toContain(response.body.state);
      expect(response.body).toHaveProperty('failures');
      expect(response.body).toHaveProperty('lastFailure');
    });
  });

  describe('Performance Under Error Conditions', () => {
    test('should maintain acceptable response times during recovery', async () => {
      const startTime = Date.now();

      const response = await request(app)
        .post('/api/blockchain/recovery/test')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          simulateError: true,
          errorType: 'CONNECTION_TIMEOUT'
        });

      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
      expect(response.body).toHaveProperty('recoveryTime');
      expect(response.body.recoveryTime).toBeLessThan(3000);
    });

    test('should limit memory usage during error states', async () => {
      const response = await request(app)
        .get('/api/blockchain/system/memory')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('errorMemoryUsage');
      expect(response.body).toHaveProperty('cacheMemoryUsage');
      expect(response.body).toHaveProperty('totalMemoryUsage');
      
      // Memory usage should be reasonable (less than 100MB for errors)
      expect(response.body.errorMemoryUsage).toBeLessThan(100 * 1024 * 1024);
    });

    test('should clean up resources after error resolution', async () => {
      // Trigger error and recovery
      await request(app)
        .post('/api/blockchain/error/trigger-and-recover')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          errorType: 'TEMPORARY_NETWORK_ERROR'
        });

      // Check resource cleanup
      const response = await request(app)
        .get('/api/blockchain/resources/cleanup-status')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('cleanupCompleted');
      expect(response.body.cleanupCompleted).toBe(true);
      expect(response.body).toHaveProperty('resourcesReleased');
      expect(response.body.resourcesReleased).toBeGreaterThan(0);
    });
  });

  afterAll(async () => {
    // Cleanup
    jest.restoreAllMocks();
  });
}); 