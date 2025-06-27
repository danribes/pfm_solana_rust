const express = require('express');
const router = express.Router();

// Import controllers
const communityController = require('../controllers/communities');

// Import middleware
const {
  requireAuth,
  requireCommunityOwner,
  requireCommunityMember,
  requireCommunityAccess,
  communityCreationLimit,
  communityUpdateLimit,
  analyticsLimit
} = require('../middleware/auth');

const {
  validateCommunityCreation,
  validateCommunityUpdate,
  validateCommunityId,
  validateCommunityListing,
  validateConfiguration,
  validateAnalyticsDateRange
} = require('../middleware/validation');

/**
 * Community CRUD Endpoints
 */

// Create new community
// POST /api/communities
router.post('/',
  requireAuth,
  communityCreationLimit,
  validateCommunityCreation,
  communityController.createCommunity
);

// Get communities with filtering and pagination
// GET /api/communities
router.get('/',
  validateCommunityListing,
  communityController.getCommunities
);

// Get community by ID
// GET /api/communities/:id
router.get('/:id',
  validateCommunityId,
  requireCommunityAccess,
  communityController.getCommunityById
);

// Update community
// PUT /api/communities/:id
router.put('/:id',
  requireAuth,
  requireCommunityOwner,
  communityUpdateLimit,
  validateCommunityUpdate,
  communityController.updateCommunity
);

// Delete community
// DELETE /api/communities/:id
router.delete('/:id',
  requireAuth,
  requireCommunityOwner,
  communityController.deleteCommunity
);

/**
 * Community Configuration Endpoints
 */

// Get community configuration
// GET /api/communities/:id/config
router.get('/:id/config',
  validateCommunityId,
  requireCommunityAccess,
  communityController.getConfiguration
);

// Update community configuration
// PUT /api/communities/:id/config
router.put('/:id/config',
  requireAuth,
  requireCommunityOwner,
  communityUpdateLimit,
  validateConfiguration,
  communityController.updateConfiguration
);

// Validate community configuration
// POST /api/communities/:id/config/validate
router.post('/:id/config/validate',
  validateCommunityId,
  validateConfiguration,
  communityController.validateConfiguration
);

/**
 * Community Analytics Endpoints
 */

// Get community analytics
// GET /api/communities/:id/analytics
router.get('/:id/analytics',
  validateCommunityId,
  requireCommunityAccess,
  analyticsLimit,
  validateAnalyticsDateRange,
  communityController.getAnalytics
);

// Get member statistics
// GET /api/communities/:id/members/stats
router.get('/:id/members/stats',
  validateCommunityId,
  requireCommunityAccess,
  analyticsLimit,
  communityController.getMemberStats
);

// Get voting statistics
// GET /api/communities/:id/voting/stats
router.get('/:id/voting/stats',
  validateCommunityId,
  requireCommunityAccess,
  analyticsLimit,
  communityController.getVotingStats
);

module.exports = router; 