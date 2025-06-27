const express = require('express');
const router = express.Router();
const userController = require('../controllers/users');
const { requireAuth } = require('../middleware/auth');
const {
  validateUserProfileUpdate,
  validateUserPreferences,
  validateNotificationSettings,
  validateUserSearch,
  validateUserId
} = require('../middleware/validation');

// User Profile Endpoints

// Get current user profile
router.get('/profile',
  requireAuth,
  userController.getCurrentUserProfile
);

// Update current user profile
router.put('/profile',
  requireAuth,
  validateUserProfileUpdate,
  userController.updateCurrentUserProfile
);

// Get public user profile
router.get('/:id/profile',
  validateUserId,
  userController.getPublicUserProfile
);

// Upload profile avatar
router.post('/profile/avatar',
  requireAuth,
  userController.uploadProfileAvatar
);

// Remove profile avatar
router.delete('/profile/avatar',
  requireAuth,
  userController.removeProfileAvatar
);

// User Preferences Endpoints

// Get user preferences
router.get('/preferences',
  requireAuth,
  userController.getUserPreferences
);

// Update user preferences
router.put('/preferences',
  requireAuth,
  validateUserPreferences,
  userController.updateUserPreferences
);

// Get notification settings
router.get('/notifications',
  requireAuth,
  userController.getNotificationSettings
);

// Update notification settings
router.put('/notifications',
  requireAuth,
  validateNotificationSettings,
  userController.updateNotificationSettings
);

// User Management Endpoints

// Search users
router.get('/search',
  validateUserSearch,
  userController.searchUsers
);

// Deactivate user account
router.post('/deactivate',
  requireAuth,
  userController.deactivateUser
);

// Reactivate user account (admin only)
router.post('/:id/reactivate',
  requireAuth,
  validateUserId,
  userController.reactivateUser
);

module.exports = router; 