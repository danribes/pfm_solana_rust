const request = require('supertest');
const app = require('../../app');
const { User } = require('../../models');
const { v4: uuidv4 } = require('uuid');

describe('Wallet Authentication API', () => {
  let testUser, sessionCookie;
  const testWalletAddress = '0x1234567890123456789012345678901234567890';

  beforeAll(async () => {
    // Create test user
    testUser = await User.create({
      id: uuidv4(),
      username: 'testuser',
      email: 'test@example.com',
      wallet_address: testWalletAddress,
      is_active: true
    });
  });

  afterAll(async () => {
    await User.destroy({ where: {} });
  });

  beforeEach(async () => {
    // Login to get session
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({ walletAddress: testWalletAddress });
    sessionCookie = loginResponse.headers['set-cookie'];
  });

  describe('POST /api/auth/wallet/nonce', () => {
    it('should generate nonce for wallet authentication', async () => {
      const response = await request(app)
        .post('/api/auth/wallet/nonce')
        .send({ walletAddress: testWalletAddress });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.nonce).toBeDefined();
      expect(response.body.data.timestamp).toBeDefined();
      expect(response.body.data.message).toBeDefined();
    });

    it('should return 400 for invalid wallet address', async () => {
      const response = await request(app)
        .post('/api/auth/wallet/nonce')
        .send({ walletAddress: 'invalid-address' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid wallet address format');
    });
  });

  describe('POST /api/auth/wallet/verify', () => {
    it('should verify wallet signature', async () => {
      const signatureData = {
        walletAddress: testWalletAddress,
        signature: '0x' + 'a'.repeat(130),
        nonce: 'test-nonce-123',
        timestamp: Date.now()
      };

      const response = await request(app)
        .post('/api/auth/wallet/verify')
        .send(signatureData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Signature verified successfully');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/wallet/verify')
        .send({ walletAddress: testWalletAddress });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid signature format', async () => {
      const response = await request(app)
        .post('/api/auth/wallet/verify')
        .send({
          walletAddress: testWalletAddress,
          signature: 'invalid-signature',
          nonce: 'test-nonce',
          timestamp: Date.now()
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/wallet/connect', () => {
    it('should connect wallet and create session', async () => {
      const newWalletAddress = '0xabcdef1234567890abcdef1234567890abcdef12';
      const userData = {
        username: 'newuser',
        email: 'new@example.com'
      };

      const response = await request(app)
        .post('/api/auth/wallet/connect')
        .send({
          walletAddress: newWalletAddress,
          userData
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Wallet connected successfully');
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.walletAddress).toBe(newWalletAddress);
    });

    it('should connect existing wallet', async () => {
      const response = await request(app)
        .post('/api/auth/wallet/connect')
        .send({
          walletAddress: testWalletAddress
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.walletAddress).toBe(testWalletAddress);
    });

    it('should return 400 for invalid wallet address', async () => {
      const response = await request(app)
        .post('/api/auth/wallet/connect')
        .send({
          walletAddress: 'invalid-address'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/wallet/:walletAddress/status', () => {
    it('should return wallet connection status', async () => {
      const response = await request(app)
        .get(`/api/auth/wallet/${testWalletAddress}/status`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.connected).toBe(true);
      expect(response.body.data.isActive).toBe(true);
      expect(response.body.data.hasProfile).toBe(true);
    });

    it('should return status for non-existent wallet', async () => {
      const nonExistentWallet = '0x9999999999999999999999999999999999999999';
      const response = await request(app)
        .get(`/api/auth/wallet/${nonExistentWallet}/status`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.connected).toBe(false);
    });

    it('should return 400 for invalid wallet address', async () => {
      const response = await request(app)
        .get('/api/auth/wallet/invalid-address/status');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/wallet/disconnect', () => {
    it('should disconnect wallet and logout', async () => {
      const response = await request(app)
        .post('/api/auth/wallet/disconnect')
        .set('Cookie', sessionCookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Wallet disconnected successfully');
    });

    it('should return 400 when no wallet connected', async () => {
      const response = await request(app)
        .post('/api/auth/wallet/disconnect');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('No wallet connected');
    });
  });

  describe('POST /api/auth/wallet/refresh', () => {
    it('should refresh authentication token', async () => {
      const response = await request(app)
        .post('/api/auth/wallet/refresh')
        .set('Cookie', sessionCookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Token refreshed successfully');
      expect(response.body.data.token).toBeDefined();
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/auth/wallet/refresh');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Legacy Authentication Endpoints', () => {
    describe('POST /api/auth/login', () => {
      it('should login with wallet address', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({ walletAddress: testWalletAddress });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Login successful');
        expect(response.body.data.token).toBeDefined();
      });

      it('should return 400 for missing wallet address', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({});

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Wallet address required');
      });
    });

    describe('POST /api/auth/logout', () => {
      it('should logout successfully', async () => {
        const response = await request(app)
          .post('/api/auth/logout')
          .set('Cookie', sessionCookie);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Logout successful');
      });
    });

    describe('POST /api/auth/refresh', () => {
      it('should refresh session', async () => {
        const response = await request(app)
          .post('/api/auth/refresh')
          .set('Cookie', sessionCookie);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Session refreshed');
        expect(response.body.data.token).toBeDefined();
      });
    });
  });
}); 