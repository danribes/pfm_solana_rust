/**
 * Unit tests for Authentication Middleware
 */

const authMiddleware = require('../../../middleware/auth');
const { User } = require('../../../models');
const redis = require('../../../redis');

// Mock dependencies
jest.mock('../../../models');
jest.mock('../../../redis');

describe('Authentication Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      session: {},
      headers: {},
      cookies: {},
      params: {},
      body: {},
      query: {},
      ip: '127.0.0.1',
      app: {
        get: jest.fn().mockReturnValue(false)
      }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('authenticateUser', () => {
    it('should authenticate user with valid session', async () => {
      const mockUser = {
        id: 'user-123',
        wallet_address: 'test-wallet',
        username: 'testuser',
        is_active: true
      };

      mockReq.session.userId = 'user-123';
      mockReq.session.walletAddress = 'test-wallet';

      User.findByPk = jest.fn().mockResolvedValue(mockUser);

      await authMiddleware.authenticateUser(mockReq, mockRes, mockNext);

      expect(mockReq.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject request without session', async () => {
      await authMiddleware.authenticateUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication required'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request with invalid session data', async () => {
      mockReq.session.userId = 'user-123';
      // Missing walletAddress

      await authMiddleware.authenticateUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication required'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request with non-existent user', async () => {
      mockReq.session.userId = 'user-123';
      mockReq.session.walletAddress = 'test-wallet';

      User.findByPk = jest.fn().mockResolvedValue(null);

      await authMiddleware.authenticateUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'User not found'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request with inactive user', async () => {
      const mockUser = {
        id: 'user-123',
        wallet_address: 'test-wallet',
        username: 'testuser',
        is_active: false
      };

      mockReq.session.userId = 'user-123';
      mockReq.session.walletAddress = 'test-wallet';

      User.findByPk = jest.fn().mockResolvedValue(mockUser);

      await authMiddleware.authenticateUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'User account is inactive'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      mockReq.session.userId = 'user-123';
      mockReq.session.walletAddress = 'test-wallet';

      User.findByPk = jest.fn().mockRejectedValue(new Error('Database error'));

      await authMiddleware.authenticateUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication error'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('authenticateWallet', () => {
    it('should authenticate wallet with valid session', async () => {
      mockReq.session.userId = 'user-123';
      mockReq.session.walletAddress = 'test-wallet';

      await authMiddleware.authenticateWallet(mockReq, mockRes, mockNext);

      expect(mockReq.userId).toBe('user-123');
      expect(mockReq.walletAddress).toBe('test-wallet');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject request without session', async () => {
      await authMiddleware.authenticateWallet(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication required'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request with invalid session data', async () => {
      mockReq.session.userId = 'user-123';
      // Missing walletAddress

      await authMiddleware.authenticateWallet(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication required'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    beforeEach(async () => {
      const mockUser = {
        id: 'user-123',
        wallet_address: 'test-wallet',
        username: 'testuser',
        is_active: true
      };

      mockReq.session.userId = 'user-123';
      mockReq.session.walletAddress = 'test-wallet';
      mockReq.user = mockUser;

      User.findByPk = jest.fn().mockResolvedValue(mockUser);
    });

    it('should allow access for user with required role', async () => {
      // Mock user has admin role
      mockReq.user.role = 'admin';

      const requireAdmin = authMiddleware.requireRole('admin');
      await requireAdmin(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject access for user without required role', async () => {
      // Mock user has member role
      mockReq.user.role = 'member';

      const requireAdmin = authMiddleware.requireRole('admin');
      await requireAdmin(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Insufficient permissions'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject access for user without role', async () => {
      // Mock user has no role
      mockReq.user.role = null;

      const requireAdmin = authMiddleware.requireRole('admin');
      await requireAdmin(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Insufficient permissions'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireCommunityMember', () => {
    beforeEach(async () => {
      const mockUser = {
        id: 'user-123',
        wallet_address: 'test-wallet',
        username: 'testuser',
        is_active: true
      };

      mockReq.session.userId = 'user-123';
      mockReq.session.walletAddress = 'test-wallet';
      mockReq.user = mockUser;
      mockReq.params = { communityId: 'community-123' };

      User.findByPk = jest.fn().mockResolvedValue(mockUser);
    });

    it('should allow access for community member', async () => {
      // Mock user is member of community
      const mockMember = {
        id: 'member-123',
        community_id: 'community-123',
        user_id: 'user-123',
        status: 'approved'
      };

      // Mock the Member model
      const { Member } = require('../../../models');
      Member.findOne = jest.fn().mockResolvedValue(mockMember);

      const requireMember = authMiddleware.requireCommunityMember();
      await requireMember(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject access for non-member', async () => {
      // Mock user is not member of community
      const { Member } = require('../../../models');
      Member.findOne = jest.fn().mockResolvedValue(null);

      const requireMember = authMiddleware.requireCommunityMember();
      await requireMember(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not a member of this community'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject access for pending member', async () => {
      // Mock user is pending member
      const mockMember = {
        id: 'member-123',
        community_id: 'community-123',
        user_id: 'user-123',
        status: 'pending'
      };

      const { Member } = require('../../../models');
      Member.findOne = jest.fn().mockResolvedValue(mockMember);

      const requireMember = authMiddleware.requireCommunityMember();
      await requireMember(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Membership not approved'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      const { Member } = require('../../../models');
      Member.findOne = jest.fn().mockRejectedValue(new Error('Database error'));

      const requireMember = authMiddleware.requireCommunityMember();
      await requireMember(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication error'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireCommunityAdmin', () => {
    beforeEach(async () => {
      const mockUser = {
        id: 'user-123',
        wallet_address: 'test-wallet',
        username: 'testuser',
        is_active: true
      };

      mockReq.session.userId = 'user-123';
      mockReq.session.walletAddress = 'test-wallet';
      mockReq.user = mockUser;
      mockReq.params = { communityId: 'community-123' };

      User.findByPk = jest.fn().mockResolvedValue(mockUser);
    });

    it('should allow access for community admin', async () => {
      // Mock user is admin of community
      const mockMember = {
        id: 'member-123',
        community_id: 'community-123',
        user_id: 'user-123',
        status: 'approved',
        role: 'admin'
      };

      const { Member } = require('../../../models');
      Member.findOne = jest.fn().mockResolvedValue(mockMember);

      const requireAdmin = authMiddleware.requireCommunityAdmin();
      await requireAdmin(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject access for non-admin member', async () => {
      // Mock user is member but not admin
      const mockMember = {
        id: 'member-123',
        community_id: 'community-123',
        user_id: 'user-123',
        status: 'approved',
        role: 'member'
      };

      const { Member } = require('../../../models');
      Member.findOne = jest.fn().mockResolvedValue(mockMember);

      const requireAdmin = authMiddleware.requireCommunityAdmin();
      await requireAdmin(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Admin access required'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject access for non-member', async () => {
      // Mock user is not member of community
      const { Member } = require('../../../models');
      Member.findOne = jest.fn().mockResolvedValue(null);

      const requireAdmin = authMiddleware.requireCommunityAdmin();
      await requireAdmin(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not a member of this community'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('rateLimit', () => {
    beforeEach(() => {
      redis.getRedisClient.mockReturnValue({
        incr: jest.fn().mockResolvedValue(1),
        expire: jest.fn().mockResolvedValue(1)
      });
    });

    it('should allow request within rate limit', async () => {
      const rateLimiter = authMiddleware.rateLimit(10, 60); // 10 requests per minute
      
      await rateLimiter(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject request exceeding rate limit', async () => {
      redis.getRedisClient.mockReturnValue({
        incr: jest.fn().mockResolvedValue(11), // Exceeds limit
        expire: jest.fn().mockResolvedValue(1)
      });

      const rateLimiter = authMiddleware.rateLimit(10, 60);
      
      await rateLimiter(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Rate limit exceeded'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle Redis errors gracefully', async () => {
      redis.getRedisClient.mockReturnValue({
        incr: jest.fn().mockRejectedValue(new Error('Redis error')),
        expire: jest.fn().mockResolvedValue(1)
      });

      const rateLimiter = authMiddleware.rateLimit(10, 60);
      
      await rateLimiter(mockReq, mockRes, mockNext);

      // Should allow request when Redis fails
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('validateRequest', () => {
    it('should validate required fields', async () => {
      const schema = {
        body: ['name', 'email'],
        params: ['id'],
        query: ['page']
      };

      mockReq.body = { name: 'test', email: 'test@example.com' };
      mockReq.params = { id: '123' };
      mockReq.query = { page: '1' };

      const validator = authMiddleware.validateRequest(schema);
      await validator(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject request with missing required fields', async () => {
      const schema = {
        body: ['name', 'email'],
        params: ['id']
      };

      mockReq.body = { name: 'test' }; // Missing email
      mockReq.params = { id: '123' };

      const validator = authMiddleware.validateRequest(schema);
      await validator(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Missing required fields: email'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle empty request objects', async () => {
      const schema = {
        body: ['name']
      };

      mockReq.body = {};

      const validator = authMiddleware.validateRequest(schema);
      await validator(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Missing required fields: name'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('errorHandler', () => {
    it('should handle validation errors', () => {
      const error = new Error('Validation error');
      error.name = 'SequelizeValidationError';
      error.errors = [{ message: 'Invalid email' }];

      authMiddleware.errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation error',
        details: ['Invalid email']
      });
    });

    it('should handle not found errors', () => {
      const error = new Error('User not found');
      error.name = 'SequelizeEmptyResultError';

      authMiddleware.errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'User not found'
      });
    });

    it('should handle constraint errors', () => {
      const error = new Error('Duplicate entry');
      error.name = 'SequelizeUniqueConstraintError';

      authMiddleware.errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Duplicate entry'
      });
    });

    it('should handle generic errors', () => {
      const error = new Error('Internal server error');

      authMiddleware.errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });
}); 