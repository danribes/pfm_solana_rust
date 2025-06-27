// Wallet authentication middleware
// Provides middleware for wallet-based authentication and authorization

const { requireWalletAuthentication, optionalWalletAuthentication } = require('../session/auth');
const walletSessionManager = require('../auth/session');

/**
 * Middleware to require wallet authentication
 * Verifies wallet session and injects wallet context into request
 */
const requireWalletAuth = async (req, res, next) => {
  try {
    // Use the session auth middleware for basic validation
    await requireWalletAuthentication(req, res, (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: 'Authentication error'
        });
      }
      
      // Additional wallet-specific validation
      if (!req.walletSession || !req.walletSession.walletAddress) {
        return res.status(401).json({
          success: false,
          error: 'Wallet authentication required'
        });
      }

      // Inject wallet context
      req.walletAddress = req.walletSession.walletAddress;
      req.walletType = req.walletSession.walletType;
      req.authenticatedAt = req.walletSession.authenticatedAt;
      
      next();
    });
  } catch (error) {
    console.error('Wallet authentication middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Middleware for optional wallet authentication
 * Doesn't fail if not authenticated, but provides wallet context if available
 */
const optionalWalletAuth = async (req, res, next) => {
  try {
    await optionalWalletAuthentication(req, res, () => {
      // Inject wallet context if available
      if (req.walletSession) {
        req.walletAddress = req.walletSession.walletAddress;
        req.walletType = req.walletSession.walletType;
        req.authenticatedAt = req.walletSession.authenticatedAt;
        req.isWalletAuthenticated = true;
      } else {
        req.isWalletAuthenticated = false;
      }
      
      next();
    });
  } catch (error) {
    console.error('Optional wallet authentication middleware error:', error);
    req.isWalletAuthenticated = false;
    next();
  }
};

/**
 * Middleware to check if wallet is community owner/admin
 */
const requireWalletCommunityOwner = async (req, res, next) => {
  try {
    const { id: communityId } = req.params;
    const walletAddress = req.walletAddress;
    
    if (!walletAddress) {
      return res.status(401).json({
        success: false,
        error: 'Wallet authentication required'
      });
    }

    // Import models
    const { Community, Member } = require('../models');
    
    // Check if community exists
    const community = await Community.findByPk(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        error: 'Community not found'
      });
    }

    // Check if wallet is the community owner
    if (community.created_by_wallet === walletAddress) {
      req.community = community;
      req.memberRole = 'owner';
      return next();
    }

    // Check if wallet is an admin member
    const member = await Member.findOne({
      where: {
        community_id: communityId,
        wallet_address: walletAddress,
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
    console.error('Wallet community owner check error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Middleware to check if wallet is community member
 */
const requireWalletCommunityMember = async (req, res, next) => {
  try {
    const { id: communityId } = req.params;
    const walletAddress = req.walletAddress;
    
    if (!walletAddress) {
      return res.status(401).json({
        success: false,
        error: 'Wallet authentication required'
      });
    }

    // Import models
    const { Community, Member } = require('../models');
    
    // Check if community exists
    const community = await Community.findByPk(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        error: 'Community not found'
      });
    }

    // Check if wallet is the community owner
    if (community.created_by_wallet === walletAddress) {
      req.community = community;
      req.memberRole = 'owner';
      return next();
    }

    // Check if wallet is a member
    const member = await Member.findOne({
      where: {
        community_id: communityId,
        wallet_address: walletAddress,
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
    console.error('Wallet community member check error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Middleware to check if wallet can access community (public or member)
 */
const requireWalletCommunityAccess = async (req, res, next) => {
  try {
    const { id: communityId } = req.params;
    const walletAddress = req.walletAddress;
    
    // Import models
    const { Community, Member } = require('../models');
    
    // Check if community exists
    const community = await Community.findByPk(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        error: 'Community not found'
      });
    }

    // If community allows public access and no wallet is authenticated, allow viewing
    if (community.allow_public_voting && !walletAddress) {
      req.community = community;
      req.accessLevel = 'public';
      return next();
    }

    // If wallet is authenticated, check membership
    if (walletAddress) {
      // Check if wallet is the community owner
      if (community.created_by_wallet === walletAddress) {
        req.community = community;
        req.memberRole = 'owner';
        req.accessLevel = 'member';
        return next();
      }

      // Check if wallet is a member
      const member = await Member.findOne({
        where: {
          community_id: communityId,
          wallet_address: walletAddress,
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
    console.error('Wallet community access check error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Middleware to check if wallet can vote on a question
 */
const requireWalletVotingPermission = async (req, res, next) => {
  try {
    const { id: communityId, questionId } = req.params;
    const walletAddress = req.walletAddress;
    
    if (!walletAddress) {
      return res.status(401).json({
        success: false,
        error: 'Wallet authentication required'
      });
    }

    // Import models
    const { Community, Member, VotingQuestion, Vote } = require('../models');
    
    // Check if community and question exist
    const community = await Community.findByPk(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        error: 'Community not found'
      });
    }

    const question = await VotingQuestion.findByPk(questionId);
    if (!question || question.community_id !== communityId) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    // Check if voting is still open
    if (question.deadline && new Date() > new Date(question.deadline)) {
      return res.status(400).json({
        success: false,
        error: 'Voting period has ended'
      });
    }

    // Check if wallet has already voted
    const existingVote = await Vote.findOne({
      where: {
        question_id: questionId,
        wallet_address: walletAddress
      }
    });

    if (existingVote) {
      return res.status(400).json({
        success: false,
        error: 'You have already voted on this question'
      });
    }

    // Check membership requirements
    if (!community.allow_public_voting) {
      // Check if wallet is the community owner
      if (community.created_by_wallet === walletAddress) {
        req.community = community;
        req.question = question;
        req.memberRole = 'owner';
        return next();
      }

      // Check if wallet is an approved member
      const member = await Member.findOne({
        where: {
          community_id: communityId,
          wallet_address: walletAddress,
          status: 'approved'
        }
      });

      if (!member) {
        return res.status(403).json({
          success: false,
          error: 'You must be a member of this community to vote'
        });
      }

      req.community = community;
      req.question = question;
      req.memberRole = member.role;
    } else {
      // Public voting allowed
      req.community = community;
      req.question = question;
      req.accessLevel = 'public';
    }

    return next();

  } catch (error) {
    console.error('Wallet voting permission check error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Rate limiting middleware for wallet authentication
 */
const rateLimit = require('express-rate-limit');

const walletAuthLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 wallet authentication attempts per windowMs
  message: {
    success: false,
    error: 'Too many wallet authentication attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const walletVotingLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // limit each IP to 50 voting attempts per windowMs
  message: {
    success: false,
    error: 'Too many voting attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  requireWalletAuth,
  optionalWalletAuth,
  requireWalletCommunityOwner,
  requireWalletCommunityMember,
  requireWalletCommunityAccess,
  requireWalletVotingPermission,
  walletAuthLimit,
  walletVotingLimit
}; 