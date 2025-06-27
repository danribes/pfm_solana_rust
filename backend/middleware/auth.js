const { requireAuthenticatedSession } = require('../session/auth');
const walletAuth = require('./walletAuth');
const rateLimit = require('express-rate-limit');

// User authentication middleware
const authenticateUser = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { User } = require('../models');
    const user = await User.findByPk(req.session.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        error: 'User account is inactive'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Wallet authentication middleware
const authenticateWallet = async (req, res, next) => {
  try {
    if (!req.session || !req.session.walletAddress) {
      return res.status(401).json({
        success: false,
        error: 'Wallet authentication required'
      });
    }

    const { User } = require('../models');
    const user = await User.findOne({
      where: { wallet_address: req.session.walletAddress }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found for wallet'
      });
    }

    req.userId = user.id;
    req.walletAddress = req.session.walletAddress;
    next();
  } catch (error) {
    console.error('Wallet authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Role-based access control middleware
const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Community admin middleware
const requireCommunityAdmin = async (req, res, next) => {
  try {
    const { id: communityId } = req.params;
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { Member } = require('../models');
    const member = await Member.findOne({
      where: {
        community_id: communityId,
        user_id: userId,
        role: ['admin', 'owner'],
        status: 'approved'
      }
    });

    if (!member) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    next();
  } catch (error) {
    console.error('Community admin check error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Generic rate limiting middleware
const createRateLimit = (maxRequests, windowMs) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    message: {
      success: false,
      error: 'Too many requests. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Request validation middleware
const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const { error } = schema.validate({
        body: req.body,
        query: req.query,
        params: req.params
      });

      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message
        });
      }

      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error'
      });
    }
  };
};

// Error handling middleware
const errorHandler = (error, req, res, next) => {
  console.error('Error:', error);

  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.errors.map(e => e.message)
    });
  }

  if (error.name === 'SequelizeEmptyResultError') {
    return res.status(404).json({
      success: false,
      error: 'Resource not found'
    });
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      error: 'Resource already exists'
    });
  }

  return res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
};

// Middleware to require authentication
const requireAuth = requireAuthenticatedSession;

// Middleware to check if user is community owner/admin
const requireCommunityOwner = async (req, res, next) => {
  try {
    const { id: communityId } = req.params;
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { Community, Member } = require('../models');
    
    // Check if user is the community owner
    const community = await Community.findByPk(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        error: 'Community not found'
      });
    }

    if (community.created_by === userId) {
      req.community = community;
      return next();
    }

    // Check if user is an admin member
    const member = await Member.findOne({
      where: {
        community_id: communityId,
        user_id: userId,
        role: ['admin', 'owner']
      }
    });

    if (member) {
      req.community = community;
      req.memberRole = member.role;
      return next();
    }

    return res.status(403).json({
      success: false,
      error: 'Insufficient permissions. Owner or admin access required.'
    });

  } catch (error) {
    console.error('Community owner check error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Middleware to check if user is community member
const requireCommunityMember = async (req, res, next) => {
  try {
    const { id: communityId } = req.params;
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { Community, Member } = require('../models');
    
    // Check if community exists
    const community = await Community.findByPk(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        error: 'Community not found'
      });
    }

    // Check if user is the community owner
    if (community.created_by === userId) {
      req.community = community;
      req.memberRole = 'owner';
      return next();
    }

    // Check if user is a member
    const member = await Member.findOne({
      where: {
        community_id: communityId,
        user_id: userId,
        status: 'approved'
      }
    });

    if (member) {
      req.community = community;
      req.memberRole = member.role;
      return next();
    }

    return res.status(403).json({
      success: false,
      error: 'Access denied. You must be a member of this community.'
    });

  } catch (error) {
    console.error('Community member check error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Middleware to check if user can view community (public or member)
const requireCommunityAccess = async (req, res, next) => {
  try {
    const { id: communityId } = req.params;
    const userId = req.session.userId;
    
    const { Community, Member } = require('../models');
    
    // Check if community exists
    const community = await Community.findByPk(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        error: 'Community not found'
      });
    }

    // If community allows public access, allow viewing
    if (community.allow_public_voting && !userId) {
      req.community = community;
      req.accessLevel = 'public';
      return next();
    }

    // If user is authenticated, check membership
    if (userId) {
      // Check if user is the community owner
      if (community.created_by === userId) {
        req.community = community;
        req.memberRole = 'owner';
        req.accessLevel = 'member';
        return next();
      }

      // Check if user is a member
      const member = await Member.findOne({
        where: {
          community_id: communityId,
          user_id: userId,
          status: 'approved'
        }
      });

      if (member) {
        req.community = community;
        req.memberRole = member.role;
        req.accessLevel = 'member';
        return next();
      }
    }

    return res.status(403).json({
      success: false,
      error: 'Access denied. This community requires membership.'
    });

  } catch (error) {
    console.error('Community access check error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Rate limiting middleware for community operations
const communityCreationLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 community creations per windowMs
  message: {
    success: false,
    error: 'Too many community creation attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const communityUpdateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // limit each IP to 20 community updates per windowMs
  message: {
    success: false,
    error: 'Too many community update attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const analyticsLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 analytics requests per windowMs
  message: {
    success: false,
    error: 'Too many analytics requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Export both user-based and wallet-based authentication middleware
module.exports = {
  // User-based authentication (existing)
  requireAuth,
  requireCommunityOwner,
  requireCommunityMember,
  requireCommunityAccess,
  communityCreationLimit,
  communityUpdateLimit,
  analyticsLimit,
  
  // Wallet-based authentication (new)
  requireWalletAuth: walletAuth.requireWalletAuth,
  optionalWalletAuth: walletAuth.optionalWalletAuth,
  requireWalletCommunityOwner: walletAuth.requireWalletCommunityOwner,
  requireWalletCommunityMember: walletAuth.requireWalletCommunityMember,
  requireWalletCommunityAccess: walletAuth.requireWalletCommunityAccess,
  requireWalletVotingPermission: walletAuth.requireWalletVotingPermission,
  walletAuthLimit: walletAuth.walletAuthLimit,
  walletVotingLimit: walletAuth.walletVotingLimit,

  // Additional middleware functions for tests
  authenticateUser,
  authenticateWallet,
  requireRole,
  requireCommunityAdmin,
  rateLimit: createRateLimit,
  validateRequest,
  errorHandler
}; 