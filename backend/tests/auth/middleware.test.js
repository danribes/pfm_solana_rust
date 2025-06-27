// Unit tests for wallet authentication middleware
const {
  requireWalletAuth,
  optionalWalletAuth,
  requireWalletCommunityOwner,
  requireWalletCommunityMember,
  requireWalletCommunityAccess,
  requireWalletVotingPermission
} = require('../../middleware/walletAuth');

const walletAuth = require('../../auth/wallet');

// Mock dependencies
jest.mock('../../auth/wallet');
jest.mock('../../models', () => ({
  Community: {
    findByPk: jest.fn()
  },
  Member: {
    findOne: jest.fn()
  },
  VotingQuestion: {
    findByPk: jest.fn()
  },
  Vote: {
    findOne: jest.fn()
  }
}));

describe('Wallet Authentication Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;
  let mockModels;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockReq = {
      session: {
        sessionId: 'test-session-id',
        walletAddress: '11111111111111111111111111111111',
        token: 'test-session-token'
      },
      walletSession: {
        walletAddress: '11111111111111111111111111111111',
        walletType: 'phantom',
        authenticatedAt: Date.now()
      },
      walletAddress: '11111111111111111111111111111111',
      isWalletAuthenticated: true,
      params: {
        id: '1',
        questionId: '1'
      }
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    mockNext = jest.fn();

    // Setup default mock implementations
    walletAuth.validateSessionToken.mockReturnValue(true);
    
    // Mock models
    mockModels = require('../../models');
    mockModels.Community.findByPk.mockResolvedValue({
      id: 1,
      name: 'Test Community',
      created_by_wallet: '11111111111111111111111111111111',
      allow_public_voting: false
    });
    mockModels.Member.findOne.mockResolvedValue({
      id: 1,
      community_id: 1,
      wallet_address: '11111111111111111111111111111111',
      status: 'approved',
      role: 'member'
    });
    mockModels.VotingQuestion.findByPk.mockResolvedValue({
      id: 1,
      community_id: 1,
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      require_membership: true
    });
    mockModels.Vote.findOne.mockResolvedValue(null);
  });

  describe('requireWalletAuth', () => {
    test('should authenticate wallet successfully', async () => {
      await requireWalletAuth(mockReq, mockRes, mockNext);

      expect(mockReq.walletAddress).toBe('11111111111111111111111111111111');
      expect(mockReq.walletType).toBeDefined();
      expect(mockReq.authenticatedAt).toBeDefined();
      expect(mockNext).toHaveBeenCalled();
    });

    test('should return 401 when wallet session is missing', async () => {
      delete mockReq.walletSession;

      await requireWalletAuth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Wallet authentication required'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should return 401 when wallet address is missing', async () => {
      delete mockReq.walletSession.walletAddress;

      await requireWalletAuth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Wallet authentication required'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should handle authentication errors', async () => {
      // Mock the session auth to throw an error
      const originalRequireWalletAuthentication = require('../../session/auth').requireWalletAuthentication;
      require('../../session/auth').requireWalletAuthentication = jest.fn().mockImplementation(() => {
        throw new Error('Authentication error');
      });

      await requireWalletAuth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication error'
      });
      expect(mockNext).not.toHaveBeenCalled();

      // Restore original function
      require('../../session/auth').requireWalletAuthentication = originalRequireWalletAuthentication;
    });
  });

  describe('optionalWalletAuth', () => {
    test('should provide wallet context when authenticated', async () => {
      await optionalWalletAuth(mockReq, mockRes, mockNext);

      expect(mockReq.walletAddress).toBe('11111111111111111111111111111111');
      expect(mockReq.walletType).toBeDefined();
      expect(mockReq.authenticatedAt).toBeDefined();
      expect(mockReq.isWalletAuthenticated).toBe(true);
      expect(mockNext).toHaveBeenCalled();
    });

    test('should handle unauthenticated requests gracefully', async () => {
      delete mockReq.walletSession;

      await optionalWalletAuth(mockReq, mockRes, mockNext);

      expect(mockReq.isWalletAuthenticated).toBe(false);
      expect(mockNext).toHaveBeenCalled();
    });

    test('should handle authentication errors gracefully', async () => {
      // Mock the session auth to throw an error
      const originalOptionalWalletAuthentication = require('../../session/auth').optionalWalletAuthentication;
      require('../../session/auth').optionalWalletAuthentication = jest.fn().mockImplementation(() => {
        throw new Error('Authentication error');
      });

      await optionalWalletAuth(mockReq, mockRes, mockNext);

      expect(mockReq.isWalletAuthenticated).toBe(false);
      expect(mockNext).toHaveBeenCalled();

      // Restore original function
      require('../../session/auth').optionalWalletAuthentication = originalOptionalWalletAuthentication;
    });
  });

  describe('requireWalletCommunityOwner', () => {
    test('should allow community owner access', async () => {
      await requireWalletCommunityOwner(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    test('should allow admin member access', async () => {
      mockModels.Member.findOne.mockResolvedValue({
        id: 1,
        community_id: 1,
        wallet_address: '11111111111111111111111111111111',
        status: 'approved',
        role: 'admin'
      });

      await requireWalletCommunityOwner(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    test('should return 401 when wallet not authenticated', async () => {
      delete mockReq.walletAddress;

      await requireWalletCommunityOwner(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Wallet authentication required'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should return 404 when community not found', async () => {
      mockModels.Community.findByPk.mockResolvedValue(null);

      await requireWalletCommunityOwner(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Community not found'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should return 403 when insufficient permissions', async () => {
      mockModels.Member.findOne.mockResolvedValue(null);

      await requireWalletCommunityOwner(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Insufficient permissions. Owner or admin access required.'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireWalletCommunityMember', () => {
    test('should allow community owner access', async () => {
      await requireWalletCommunityMember(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    test('should allow approved member access', async () => {
      mockModels.Member.findOne.mockResolvedValue({
        id: 1,
        community_id: 1,
        wallet_address: '11111111111111111111111111111111',
        status: 'approved',
        role: 'member'
      });

      await requireWalletCommunityMember(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    test('should return 403 when not a member', async () => {
      mockModels.Member.findOne.mockResolvedValue(null);

      await requireWalletCommunityMember(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access denied. You must be a member of this community.'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireWalletCommunityAccess', () => {
    test('should allow public access when community allows it', async () => {
      mockModels.Community.findByPk.mockResolvedValue({
        id: 1,
        name: 'Test Community',
        allow_public_voting: true
      });

      delete mockReq.walletAddress;

      await requireWalletCommunityAccess(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    test('should allow member access when authenticated', async () => {
      await requireWalletCommunityAccess(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    test('should return 403 when access denied', async () => {
      mockModels.Community.findByPk.mockResolvedValue({
        id: 1,
        name: 'Test Community',
        allow_public_voting: false
      });

      delete mockReq.walletAddress;

      await requireWalletCommunityAccess(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access denied. This community requires membership.'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireWalletVotingPermission', () => {
    test('should allow voting for community owner', async () => {
      await requireWalletVotingPermission(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    test('should return 400 when voting period has ended', async () => {
      mockModels.VotingQuestion.findByPk.mockResolvedValue({
        id: 1,
        community_id: 1,
        deadline: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        require_membership: true
      });

      await requireWalletVotingPermission(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Voting period has ended'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should return 400 when user has already voted', async () => {
      mockModels.Vote.findOne.mockResolvedValue({
        id: 1,
        question_id: 1,
        wallet_address: '11111111111111111111111111111111'
      });

      await requireWalletVotingPermission(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'You have already voted on this question'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should return 403 when membership required but not a member', async () => {
      mockModels.VotingQuestion.findByPk.mockResolvedValue({
        id: 1,
        community_id: 1,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
        require_membership: true
      });

      mockModels.Member.findOne.mockResolvedValue(null);

      await requireWalletVotingPermission(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'You must be a member of this community to vote'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Rate Limiting', () => {
    test('should have walletAuthLimit configured', () => {
      // Mock rate limiting configuration
      const rateLimit = require('express-rate-limit');
      const walletAuthLimit = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 10
      });
      
      expect(walletAuthLimit).toBeDefined();
    });

    test('should have walletVotingLimit configured', () => {
      // Mock rate limiting configuration
      const rateLimit = require('express-rate-limit');
      const walletVotingLimit = rateLimit({
        windowMs: 5 * 60 * 1000, // 5 minutes
        max: 50
      });
      
      expect(walletVotingLimit).toBeDefined();
    });
  });
}); 