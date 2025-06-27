const express = require('express');
const router = express.Router();
const membershipController = require('../controllers/memberships');
const {
  requireAuth,
  requireCommunityOwner,
  requireCommunityMember,
  requireCommunityAccess
} = require('../middleware/auth');
const {
  validateMembershipApplication,
  validateMembershipListing,
  validateMembershipId,
  validateRoleChange,
  validateStatusUpdate,
  validateUserMemberships,
  validateMembershipHistory
} = require('../middleware/validation');

// Membership Application Endpoints

// Apply to join a community
router.post('/communities/:id/members',
  requireAuth,
  validateMembershipApplication,
  membershipController.applyToCommunity
);

// Get community members
router.get('/communities/:id/members',
  requireCommunityAccess,
  validateMembershipListing,
  membershipController.getCommunityMembers
);

// Get pending applications (admin/owner only)
router.get('/communities/:id/members/pending',
  requireCommunityOwner,
  validateMembershipListing,
  membershipController.getPendingApplications
);

// Get user's memberships across communities
router.get('/memberships',
  requireAuth,
  validateUserMemberships,
  membershipController.getUserMemberships
);

// Membership Management Endpoints

// Approve member (admin/owner only)
router.put('/communities/:id/members/:memberId/approve',
  requireCommunityOwner,
  validateMembershipId,
  membershipController.approveMember
);

// Reject member (admin/owner only)
router.put('/communities/:id/members/:memberId/reject',
  requireCommunityOwner,
  validateMembershipId,
  membershipController.rejectMember
);

// Remove member (admin/owner only)
router.put('/communities/:id/members/:memberId/remove',
  requireCommunityOwner,
  validateMembershipId,
  membershipController.removeMember
);

// Change member role (admin/owner only)
router.put('/communities/:id/members/:memberId/role',
  requireCommunityOwner,
  validateRoleChange,
  membershipController.changeMemberRole
);

// Membership Status Endpoints

// Get member status
router.get('/communities/:id/members/:memberId/status',
  requireCommunityMember,
  validateMembershipId,
  membershipController.getMemberStatus
);

// Update member status (admin/owner only)
router.put('/communities/:id/members/:memberId/status',
  requireCommunityOwner,
  validateStatusUpdate,
  membershipController.updateMemberStatus
);

// Get membership history
router.get('/memberships/:id/history',
  requireAuth,
  validateMembershipHistory,
  membershipController.getMembershipHistory
);

// Additional Utility Endpoints

// Get community member count
router.get('/communities/:id/members/count',
  requireCommunityAccess,
  membershipController.getMemberCount
);

module.exports = router; 