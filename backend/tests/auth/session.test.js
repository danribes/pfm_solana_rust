// Unit tests for wallet session management service
const walletSessionManager = require('../../auth/session');
const sessionStore = require('../../session/store');

// Mock session store
jest.mock('../../session/store');

describe('Wallet Session Manager', () => {
  let mockReq;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock request object
    mockReq = {
      headers: {
        'user-agent': 'Mozilla/5.0 (Test Browser)',
        'x-forwarded-for': '192.168.1.1'
      },
      ip: '192.168.1.1',
      connection: {
        remoteAddress: '192.168.1.1'
      }
    };

    // Setup default mock implementations
    sessionStore.createSession.mockResolvedValue({
      sessionId: 'test-session-id-123',
      walletAddress: 'test-wallet-address',
      isActive: true,
      lastAccessed: Date.now()
    });
    sessionStore.getSession.mockResolvedValue({
      sessionId: 'test-session-id-123',
      walletAddress: 'test-wallet-address',
      isActive: true,
      lastAccessed: Date.now()
    });
    sessionStore.updateSession.mockResolvedValue({
      sessionId: 'test-session-id-123',
      walletAddress: 'test-wallet-address',
      isActive: true,
      lastAccessed: Date.now()
    });
    sessionStore.deleteSession.mockResolvedValue(true);
    sessionStore.getUserSessions.mockResolvedValue([
      { sessionId: '1', walletAddress: 'test-wallet', isActive: true },
      { sessionId: '2', walletAddress: 'test-wallet', isActive: true }
    ]);
  });

  describe('createWalletSession', () => {
    test('should create wallet session successfully', async () => {
      const walletAddress = '11111111111111111111111111111111';
      const authResult = {
        walletAddress,
        sessionToken: 'test-token',
        walletType: 'phantom'
      };

      const result = await walletSessionManager.createWalletSession(walletAddress, authResult, mockReq);

      expect(result).toBeDefined();
      expect(result.sessionId).toBeDefined();
      expect(result.walletAddress).toBe(walletAddress);
      expect(sessionStore.createSession).toHaveBeenCalled();
    });

    test('should call session store with correct parameters', async () => {
      const walletAddress = '22222222222222222222222222222222';
      const authResult = {
        walletAddress,
        sessionToken: 'test-token',
        walletType: 'solflare'
      };

      await walletSessionManager.createWalletSession(walletAddress, authResult, mockReq);

      expect(sessionStore.createSession).toHaveBeenCalledWith(
        expect.any(String), // sessionId
        expect.objectContaining({
          walletAddress,
          sessionToken: expect.any(String), // Generated token
          walletType: 'solflare',
          userAgent: 'Mozilla/5.0 (Test Browser)',
          ipAddress: '192.168.1.1',
          isActive: true
        }),
        walletAddress // userId
      );
    });

    test('should handle missing user agent and IP', async () => {
      const walletAddress = '33333333333333333333333333333333';
      const authResult = {
        walletAddress,
        sessionToken: 'test-token',
        walletType: 'phantom'
      };

      const reqWithoutHeaders = {
        headers: {},
        ip: null,
        connection: { remoteAddress: null }
      };

      const result = await walletSessionManager.createWalletSession(walletAddress, authResult, reqWithoutHeaders);

      expect(result).toBeDefined();
      expect(sessionStore.createSession).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          walletAddress,
          userAgent: '',
          ipAddress: ''
        }),
        walletAddress
      );
    });

    test('should handle session store errors', async () => {
      const walletAddress = '44444444444444444444444444444444';
      const authResult = {
        walletAddress,
        sessionToken: 'test-token',
        walletType: 'phantom'
      };

      sessionStore.createSession.mockRejectedValue(new Error('Session store error'));

      await expect(
        walletSessionManager.createWalletSession(walletAddress, authResult, mockReq)
      ).rejects.toThrow('Session store error');
    });
  });

  describe('validateWalletSession', () => {
    test('should validate active session', async () => {
      const sessionId = 'test-session-id-123';
      const sessionToken = 'test-session-token';
      const walletAddress = 'test-wallet-address';
      
      // Mock session data that matches the actual implementation
      const mockSessionData = {
        sessionId,
        walletAddress,
        isActive: true,
        sessionToken: walletSessionManager.generateWalletSessionToken(walletAddress, sessionId)
      };
      
      sessionStore.getSession.mockResolvedValue(mockSessionData);

      const result = await walletSessionManager.validateWalletSession(sessionId, mockSessionData.sessionToken);

      expect(result).toBeDefined();
      expect(result.sessionId).toBe(sessionId);
      expect(result.walletAddress).toBe(walletAddress);
      expect(result.isActive).toBe(true);
    });

    test('should return null for non-existent session', async () => {
      sessionStore.getSession.mockResolvedValue(null);

      const result = await walletSessionManager.validateWalletSession('non-existent', 'token');

      expect(result).toBeNull();
    });

    test('should return null for inactive session', async () => {
      sessionStore.getSession.mockResolvedValue({
        sessionId: 'test-session-id-123',
        walletAddress: 'test-wallet-address',
        isActive: false
      });

      const result = await walletSessionManager.validateWalletSession('test-session-id-123', 'token');

      expect(result).toBeNull();
    });

    test('should return null for invalid session token', async () => {
      const result = await walletSessionManager.validateWalletSession('test-session-id-123', 'invalid-token');

      expect(result).toBeNull();
    });

    test('should update last accessed time on validation', async () => {
      const sessionId = 'test-session-id-123';
      const walletAddress = 'test-wallet-address';
      const sessionToken = walletSessionManager.generateWalletSessionToken(walletAddress, sessionId);
      
      // Mock session data
      const mockSessionData = {
        sessionId,
        walletAddress,
        isActive: true,
        sessionToken
      };
      
      sessionStore.getSession.mockResolvedValue(mockSessionData);

      await walletSessionManager.validateWalletSession(sessionId, sessionToken);

      expect(sessionStore.updateSession).toHaveBeenCalledWith(
        sessionId,
        expect.objectContaining({
          lastAccessed: expect.any(Number)
        })
      );
    });
  });

  describe('refreshWalletSession', () => {
    test('should refresh session when needed', async () => {
      const sessionId = 'test-session-id-123';
      const walletAddress = 'test-wallet-address';
      const sessionToken = walletSessionManager.generateWalletSessionToken(walletAddress, sessionId);

      // Mock session that needs refresh (older than 30 minutes)
      sessionStore.getSession.mockResolvedValue({
        sessionId,
        walletAddress,
        isActive: true,
        lastAccessed: Date.now() - 31 * 60 * 1000 // 31 minutes ago
      });

      const result = await walletSessionManager.refreshWalletSession(sessionId, mockReq);

      expect(result).toBeDefined();
      expect(result.sessionToken).toBeDefined();
      expect(sessionStore.updateSession).toHaveBeenCalled();
    });

    test('should not refresh session when not needed', async () => {
      const sessionId = 'test-session-id-123';
      const walletAddress = 'test-wallet-address';
      const sessionToken = walletSessionManager.generateWalletSessionToken(walletAddress, sessionId);

      // Mock session that doesn't need refresh (recently accessed)
      sessionStore.getSession.mockResolvedValue({
        sessionId,
        walletAddress,
        isActive: true,
        sessionToken,
        lastAccessed: Date.now() - 10 * 60 * 1000 // 10 minutes ago
      });

      const result = await walletSessionManager.refreshWalletSession(sessionId, mockReq);

      expect(result).toBeDefined();
      expect(result.sessionToken).toBe(sessionToken);
      expect(sessionStore.updateSession).not.toHaveBeenCalled();
    });

    test('should return null for non-existent session', async () => {
      sessionStore.getSession.mockResolvedValue(null);

      const result = await walletSessionManager.refreshWalletSession('non-existent', 'token');

      expect(result).toBeNull();
    });

    test('should return null for inactive session', async () => {
      sessionStore.getSession.mockResolvedValue({
        sessionId: 'test-session-id-123',
        walletAddress: 'test-wallet-address',
        isActive: false
      });

      const result = await walletSessionManager.refreshWalletSession('test-session-id-123', 'token');

      expect(result).toBeNull();
    });
  });

  describe('invalidateWalletSession', () => {
    test('should invalidate session successfully', async () => {
      const sessionId = 'test-session-id-123';

      const result = await walletSessionManager.invalidateWalletSession(sessionId);

      expect(result).toBe(true);
      expect(sessionStore.updateSession).toHaveBeenCalledWith(
        sessionId,
        expect.objectContaining({
          isActive: false
        })
      );
    });

    test('should handle non-existent session', async () => {
      sessionStore.updateSession.mockResolvedValue(false);

      const result = await walletSessionManager.invalidateWalletSession('non-existent');

      expect(result).toBe(true); // Implementation returns true even for non-existent sessions
    });

    test('should handle session store errors', async () => {
      sessionStore.updateSession.mockRejectedValue(new Error('Update error'));

      const result = await walletSessionManager.invalidateWalletSession('test-session-id-123');

      expect(result).toBe(false);
    });
  });

  describe('getWalletSessions', () => {
    test('should return active sessions for wallet', async () => {
      const walletAddress = '11111111111111111111111111111111';

      const result = await walletSessionManager.getWalletSessions(walletAddress);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(sessionStore.getUserSessions).toHaveBeenCalledWith(walletAddress);
    });

    test('should return empty array for wallet with no sessions', async () => {
      sessionStore.getUserSessions.mockResolvedValue([]);

      const result = await walletSessionManager.getWalletSessions('test-wallet');

      expect(result).toEqual([]);
    });
  });

  describe('invalidateAllWalletSessions', () => {
    test('should invalidate all sessions for wallet', async () => {
      const walletAddress = '11111111111111111111111111111111';

      const result = await walletSessionManager.invalidateAllWalletSessions(walletAddress);

      expect(result).toBe(true);
      expect(sessionStore.updateSession).toHaveBeenCalledTimes(2);
    });

    test('should handle wallet with no sessions', async () => {
      sessionStore.getUserSessions.mockResolvedValue([]);

      const result = await walletSessionManager.invalidateAllWalletSessions('test-wallet');

      expect(result).toBe(true);
      expect(sessionStore.updateSession).not.toHaveBeenCalled();
    });
  });

  describe('Utility Functions', () => {
    test('should generate session token correctly', () => {
      const walletAddress = 'test-wallet-address';
      const sessionId = 'test-session-id';

      const token = walletSessionManager.generateWalletSessionToken(walletAddress, sessionId);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    test('should verify session token correctly', () => {
      const walletAddress = 'test-wallet-address';
      const sessionId = 'test-session-id-123';
      const token = walletSessionManager.generateWalletSessionToken(walletAddress, sessionId);

      expect(walletSessionManager.verifyWalletSessionToken(token, walletAddress, sessionId)).toBe(true);
      expect(walletSessionManager.verifyWalletSessionToken(token, 'wrong-wallet', sessionId)).toBe(false);
      expect(walletSessionManager.verifyWalletSessionToken(token, walletAddress, 'wrong-session')).toBe(false);
    });

    test('should check if session needs refresh', () => {
      const recentTime = Date.now() - 10 * 60 * 1000; // 10 minutes ago
      const oldTime = Date.now() - 31 * 60 * 1000; // 31 minutes ago

      expect(walletSessionManager.shouldRefreshSession({ lastAccessed: recentTime })).toBe(false);
      expect(walletSessionManager.shouldRefreshSession({ lastAccessed: oldTime })).toBe(true);
    });

    test('should check if session is expired', () => {
      const recentTime = Date.now() - 10 * 60 * 1000; // 10 minutes ago
      const expiredTime = Date.now() - 25 * 60 * 60 * 1000; // 25 hours ago

      expect(walletSessionManager.isSessionExpired({ authenticatedAt: recentTime })).toBe(false);
      expect(walletSessionManager.isSessionExpired({ authenticatedAt: expiredTime })).toBe(true);
    });
  });
}); 