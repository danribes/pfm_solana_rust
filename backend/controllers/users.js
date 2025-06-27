const userService = require('../services/users');

class UserController {
  // Get current user profile
  async getCurrentUserProfile(req, res) {
    try {
      const userId = req.session.userId;
      const profile = await userService.getCurrentUserProfile(userId);

      res.json({
        success: true,
        data: {
          profile
        }
      });
    } catch (error) {
      console.error('Get current user profile error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to get user profile'
      });
    }
  }

  // Update current user profile
  async updateCurrentUserProfile(req, res) {
    try {
      const userId = req.session.userId;
      const profileData = req.body;

      const user = await userService.updateCurrentUserProfile(userId, profileData);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: {
            id: user.id,
            walletAddress: user.wallet_address,
            username: user.username,
            email: user.email,
            avatarUrl: user.avatar_url,
            bio: user.bio,
            updatedAt: user.updated_at
          }
        }
      });
    } catch (error) {
      console.error('Update current user profile error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      
      if (error.message.includes('Invalid') || error.message.includes('already taken')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to update user profile'
      });
    }
  }

  // Get public user profile
  async getPublicUserProfile(req, res) {
    try {
      const { id: userId } = req.params;
      const profile = await userService.getPublicUserProfile(userId);

      res.json({
        success: true,
        data: {
          profile
        }
      });
    } catch (error) {
      console.error('Get public user profile error:', error);
      
      if (error.message.includes('not found') || error.message.includes('not available')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to get public user profile'
      });
    }
  }

  // Upload profile avatar
  async uploadProfileAvatar(req, res) {
    try {
      const userId = req.session.userId;
      const avatarData = req.body;

      if (!avatarData.url) {
        return res.status(400).json({
          success: false,
          error: 'Avatar URL is required'
        });
      }

      const result = await userService.uploadProfileAvatar(userId, avatarData);

      res.json({
        success: true,
        message: result.message,
        data: {
          avatarUrl: result.avatarUrl
        }
      });
    } catch (error) {
      console.error('Upload profile avatar error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to upload avatar'
      });
    }
  }

  // Remove profile avatar
  async removeProfileAvatar(req, res) {
    try {
      const userId = req.session.userId;
      const result = await userService.removeProfileAvatar(userId);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Remove profile avatar error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to remove avatar'
      });
    }
  }

  // Get user preferences
  async getUserPreferences(req, res) {
    try {
      const userId = req.session.userId;
      const preferences = await userService.getUserPreferences(userId);

      res.json({
        success: true,
        data: {
          preferences
        }
      });
    } catch (error) {
      console.error('Get user preferences error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to get user preferences'
      });
    }
  }

  // Update user preferences
  async updateUserPreferences(req, res) {
    try {
      const userId = req.session.userId;
      const preferencesData = req.body;

      const result = await userService.updateUserPreferences(userId, preferencesData);

      res.json({
        success: true,
        message: result.message,
        data: {
          preferences: result.preferences
        }
      });
    } catch (error) {
      console.error('Update user preferences error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      
      if (error.message.includes('Invalid')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to update user preferences'
      });
    }
  }

  // Get notification settings
  async getNotificationSettings(req, res) {
    try {
      const userId = req.session.userId;
      const settings = await userService.getNotificationSettings(userId);

      res.json({
        success: true,
        data: {
          settings
        }
      });
    } catch (error) {
      console.error('Get notification settings error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to get notification settings'
      });
    }
  }

  // Update notification settings
  async updateNotificationSettings(req, res) {
    try {
      const userId = req.session.userId;
      const settingsData = req.body;

      const result = await userService.updateNotificationSettings(userId, settingsData);

      res.json({
        success: true,
        message: result.message,
        data: {
          settings: result.settings
        }
      });
    } catch (error) {
      console.error('Update notification settings error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      
      if (error.message.includes('Invalid')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to update notification settings'
      });
    }
  }

  // Search users
  async searchUsers(req, res) {
    try {
      const { q: query, page, limit, includeInactive } = req.query;

      const options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        includeInactive: includeInactive === 'true'
      };

      const result = await userService.searchUsers(query, options);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Search users error:', error);

      res.status(500).json({
        success: false,
        error: 'Failed to search users'
      });
    }
  }

  // Deactivate user account
  async deactivateUser(req, res) {
    try {
      const userId = req.session.userId;
      const result = await userService.deactivateUser(userId);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Deactivate user error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to deactivate user account'
      });
    }
  }

  // Reactivate user account (admin only)
  async reactivateUser(req, res) {
    try {
      const { id: userId } = req.params;
      const result = await userService.reactivateUser(userId);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Reactivate user error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to reactivate user account'
      });
    }
  }
}

module.exports = new UserController(); 