const { User } = require('../models');

// Simple mock cache service for testing
const cache = {
  async get(key) {
    return null; // Always return null to force database lookup
  },
  async set(key, value, ttl) {
    return true; // Mock successful set
  },
  async del(key) {
    return true; // Mock successful delete
  }
};

const walletService = require('./wallet');

class UserService {
  // Get current user profile
  async getCurrentUserProfile(userId) {
    try {
      const cacheKey = `user:${userId}:profile`;
      const cachedProfile = await cache.get(cacheKey);
      
      if (cachedProfile) {
        return cachedProfile;
      }

      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const profile = {
        id: user.id,
        walletAddress: user.wallet_address,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatar_url,
        bio: user.bio,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        lastLoginAt: user.last_login_at,
        isActive: user.is_active
      };

      // Cache profile for 10 minutes
      await cache.set(cacheKey, profile, 600);

      return profile;
    } catch (error) {
      console.error('Error getting current user profile:', error);
      throw error;
    }
  }

  // Update current user profile
  async updateCurrentUserProfile(userId, profileData) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Validate and update allowed fields
      const allowedFields = ['username', 'email', 'bio', 'avatar_url'];
      const updateData = {};

      for (const field of allowedFields) {
        if (profileData[field] !== undefined) {
          // Validate email format
          if (field === 'email' && profileData[field]) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(profileData[field])) {
              throw new Error('Invalid email format');
            }
          }

          // Validate username format
          if (field === 'username' && profileData[field]) {
            const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
            if (!usernameRegex.test(profileData[field])) {
              throw new Error('Username must be 3-20 characters and contain only letters, numbers, underscores, and hyphens');
            }

            // Check if username is already taken
            const existingUser = await User.findOne({
              where: {
                username: profileData[field],
                id: { [require('sequelize').Op.ne]: userId }
              }
            });

            if (existingUser) {
              throw new Error('Username is already taken');
            }
          }

          updateData[field] = profileData[field];
        }
      }

      updateData.updated_at = new Date();

      await user.update(updateData);

      // Clear cached profile data
      await cache.del(`user:${userId}:profile`);
      await cache.del(`user:${user.wallet_address}:profile`);

      return user;
    } catch (error) {
      console.error('Error updating current user profile:', error);
      throw error;
    }
  }

  // Get public user profile
  async getPublicUserProfile(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.is_active) {
        throw new Error('User profile is not available');
      }

      return {
        id: user.id,
        username: user.username,
        avatarUrl: user.avatar_url,
        bio: user.bio,
        createdAt: user.created_at,
        // Don't include sensitive information like email, wallet address, etc.
      };
    } catch (error) {
      console.error('Error getting public user profile:', error);
      throw error;
    }
  }

  // Upload profile avatar
  async uploadProfileAvatar(userId, avatarData) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // In a real implementation, you would:
      // 1. Upload the file to a cloud storage service (AWS S3, Cloudinary, etc.)
      // 2. Get the URL of the uploaded file
      // 3. Update the user's avatar_url field

      // For now, we'll simulate this process
      const avatarUrl = avatarData.url || `https://example.com/avatars/${userId}.jpg`;

      await user.update({
        avatar_url: avatarUrl,
        updated_at: new Date()
      });

      // Clear cached profile data
      await cache.del(`user:${userId}:profile`);
      await cache.del(`user:${user.wallet_address}:profile`);

      return {
        avatarUrl,
        message: 'Avatar uploaded successfully'
      };
    } catch (error) {
      console.error('Error uploading profile avatar:', error);
      throw error;
    }
  }

  // Remove profile avatar
  async removeProfileAvatar(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // In a real implementation, you would also delete the file from cloud storage
      await user.update({
        avatar_url: null,
        updated_at: new Date()
      });

      // Clear cached profile data
      await cache.del(`user:${userId}:profile`);
      await cache.del(`user:${user.wallet_address}:profile`);

      return {
        message: 'Avatar removed successfully'
      };
    } catch (error) {
      console.error('Error removing profile avatar:', error);
      throw error;
    }
  }

  // Get user preferences
  async getUserPreferences(userId) {
    try {
      const cacheKey = `user:${userId}:preferences`;
      const cachedPreferences = await cache.get(cacheKey);
      
      if (cachedPreferences) {
        return cachedPreferences;
      }

      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // In a real implementation, you might have a separate UserPreferences table
      // For now, we'll return default preferences
      const preferences = {
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
        emailNotifications: true,
        pushNotifications: true,
        communityNotifications: true,
        votingNotifications: true,
        privacyLevel: 'public', // public, friends, private
        showWalletAddress: false,
        allowDirectMessages: true
      };

      // Cache preferences for 30 minutes
      await cache.set(cacheKey, preferences, 1800);

      return preferences;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      throw error;
    }
  }

  // Update user preferences
  async updateUserPreferences(userId, preferencesData) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Validate preferences
      const validThemes = ['light', 'dark', 'auto'];
      const validLanguages = ['en', 'es', 'fr', 'de', 'zh'];
      const validPrivacyLevels = ['public', 'friends', 'private'];

      if (preferencesData.theme && !validThemes.includes(preferencesData.theme)) {
        throw new Error('Invalid theme');
      }

      if (preferencesData.language && !validLanguages.includes(preferencesData.language)) {
        throw new Error('Invalid language');
      }

      if (preferencesData.privacyLevel && !validPrivacyLevels.includes(preferencesData.privacyLevel)) {
        throw new Error('Invalid privacy level');
      }

      // In a real implementation, you would save these to a UserPreferences table
      // For now, we'll just clear the cache to simulate an update
      await cache.del(`user:${userId}:preferences`);

      return {
        message: 'Preferences updated successfully',
        preferences: preferencesData
      };
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  // Get notification settings
  async getNotificationSettings(userId) {
    try {
      const cacheKey = `user:${userId}:notifications`;
      const cachedSettings = await cache.get(cacheKey);
      
      if (cachedSettings) {
        return cachedSettings;
      }

      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // In a real implementation, you might have a separate UserNotifications table
      const notificationSettings = {
        emailNotifications: {
          enabled: true,
          communityUpdates: true,
          votingReminders: true,
          newMembers: true,
          directMessages: true
        },
        pushNotifications: {
          enabled: true,
          communityUpdates: true,
          votingReminders: true,
          newMembers: false,
          directMessages: true
        },
        inAppNotifications: {
          enabled: true,
          communityUpdates: true,
          votingReminders: true,
          newMembers: true,
          directMessages: true
        },
        frequency: 'immediate', // immediate, daily, weekly
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00',
          timezone: 'UTC'
        }
      };

      // Cache settings for 30 minutes
      await cache.set(cacheKey, notificationSettings, 1800);

      return notificationSettings;
    } catch (error) {
      console.error('Error getting notification settings:', error);
      throw error;
    }
  }

  // Update notification settings
  async updateNotificationSettings(userId, settingsData) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Validate frequency
      const validFrequencies = ['immediate', 'daily', 'weekly'];
      if (settingsData.frequency && !validFrequencies.includes(settingsData.frequency)) {
        throw new Error('Invalid notification frequency');
      }

      // Validate quiet hours time format
      if (settingsData.quietHours) {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (settingsData.quietHours.start && !timeRegex.test(settingsData.quietHours.start)) {
          throw new Error('Invalid quiet hours start time');
        }
        if (settingsData.quietHours.end && !timeRegex.test(settingsData.quietHours.end)) {
          throw new Error('Invalid quiet hours end time');
        }
      }

      // In a real implementation, you would save these to a UserNotifications table
      // For now, we'll just clear the cache to simulate an update
      await cache.del(`user:${userId}:notifications`);

      return {
        message: 'Notification settings updated successfully',
        settings: settingsData
      };
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  }

  // Search users
  async searchUsers(query, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        includeInactive = false
      } = options;

      const offset = (page - 1) * limit;
      const whereClause = {};

      if (!includeInactive) {
        whereClause.is_active = true;
      }

      if (query) {
        whereClause[require('sequelize').Op.or] = [
          { username: { [require('sequelize').Op.iLike]: `%${query}%` } },
          { bio: { [require('sequelize').Op.iLike]: `%${query}%` } }
        ];
      }

      const { count, rows: users } = await User.findAndCountAll({
        where: whereClause,
        attributes: ['id', 'username', 'avatar_url', 'bio', 'created_at'],
        order: [['username', 'ASC']],
        limit,
        offset
      });

      return {
        users,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  // Deactivate user account
  async deactivateUser(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      await user.update({
        is_active: false,
        updated_at: new Date()
      });

      // Clear all cached data for this user
      const cacheKeys = [
        `user:${userId}:profile`,
        `user:${userId}:preferences`,
        `user:${userId}:notifications`,
        `user:${user.wallet_address}:profile`
      ];

      for (const key of cacheKeys) {
        await cache.del(key);
      }

      return {
        message: 'Account deactivated successfully'
      };
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  }

  // Reactivate user account
  async reactivateUser(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      await user.update({
        is_active: true,
        updated_at: new Date()
      });

      return {
        message: 'Account reactivated successfully'
      };
    } catch (error) {
      console.error('Error reactivating user:', error);
      throw error;
    }
  }
}

module.exports = new UserService(); 