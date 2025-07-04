const { User, Community, Member } = require('../models');
const redis = require('../redis');

/**
 * Notification Service
 * Handles sending notifications to users for various events
 */
class NotificationService {
  constructor() {
    this.redisClient = redis.getRedisClient();
    this.notificationQueue = 'notifications:queue';
    this.notificationHistory = 'notifications:history';
  }

  /**
   * Send notification to a specific user
   */
  async sendNotification(userId, notification) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const notificationData = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        category: notification.category || 'general',
        priority: notification.priority || 'normal',
        data: notification.data || {},
        createdAt: new Date().toISOString(),
        read: false,
        delivered: false
      };

      // Store notification in Redis for real-time delivery
      await this.storeNotification(notificationData);

      // Send via different channels based on user preferences
      await this.deliverNotification(notificationData, user);

      return notificationData;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Send notification to multiple users
   */
  async sendBulkNotifications(userIds, notification) {
    const promises = userIds.map(userId => 
      this.sendNotification(userId, notification).catch(error => {
        console.error(`Failed to send notification to user ${userId}:`, error);
        return null;
      })
    );

    const results = await Promise.allSettled(promises);
    return results.filter(result => result.status === 'fulfilled' && result.value !== null);
  }

  /**
   * Send notification to community admins
   */
  async notifyCommunityAdmins(communityId, notification) {
    try {
      const community = await Community.findByPk(communityId);
      if (!community) {
        throw new Error('Community not found');
      }

      // Get all admins and owners of the community
      const admins = await Member.findAll({
        where: {
          community_id: communityId,
          role: ['admin', 'owner'],
          status: 'approved'
        },
        include: [{
          model: User,
          as: 'User',
          attributes: ['id', 'username', 'email']
        }]
      });

      const adminUserIds = admins.map(admin => admin.User.id);
      
      if (adminUserIds.length === 0) {
        console.warn(`No admins found for community ${communityId}`);
        return [];
      }

      return await this.sendBulkNotifications(adminUserIds, notification);
    } catch (error) {
      console.error('Error notifying community admins:', error);
      throw error;
    }
  }

  /**
   * Send join request notification to admins
   */
  async notifyJoinRequest(communityId, userId, applicationData = {}) {
    try {
      const [community, user] = await Promise.all([
        Community.findByPk(communityId),
        User.findByPk(userId)
      ]);

      if (!community) {
        throw new Error('Community not found');
      }

      if (!user) {
        throw new Error('User not found');
      }

      const notification = {
        type: 'join_request',
        title: 'New Community Join Request',
        message: `${user.username || user.wallet_address} has requested to join ${community.name}`,
        category: 'membership',
        priority: 'high',
        data: {
          communityId,
          communityName: community.name,
          userId,
          username: user.username,
          walletAddress: user.wallet_address,
          applicationData,
          actionUrl: `/admin/communities/${communityId}/members/pending`
        }
      };

      return await this.notifyCommunityAdmins(communityId, notification);
    } catch (error) {
      console.error('Error notifying join request:', error);
      throw error;
    }
  }

  /**
   * Send membership approval notification to user
   */
  async notifyMembershipApproved(communityId, userId, approvedBy) {
    try {
      const [community, user, approver] = await Promise.all([
        Community.findByPk(communityId),
        User.findByPk(userId),
        User.findByPk(approvedBy)
      ]);

      if (!community || !user) {
        throw new Error('Community or user not found');
      }

      const notification = {
        type: 'membership_approved',
        title: 'Community Membership Approved',
        message: `Your request to join ${community.name} has been approved!`,
        category: 'membership',
        priority: 'normal',
        data: {
          communityId,
          communityName: community.name,
          approvedBy: approver?.username || 'Admin',
          actionUrl: `/communities/${communityId}`
        }
      };

      return await this.sendNotification(userId, notification);
    } catch (error) {
      console.error('Error notifying membership approval:', error);
      throw error;
    }
  }

  /**
   * Send membership rejection notification to user
   */
  async notifyMembershipRejected(communityId, userId, rejectedBy, reason = '') {
    try {
      const [community, user, rejecter] = await Promise.all([
        Community.findByPk(communityId),
        User.findByPk(userId),
        User.findByPk(rejectedBy)
      ]);

      if (!community || !user) {
        throw new Error('Community or user not found');
      }

      const notification = {
        type: 'membership_rejected',
        title: 'Community Membership Application',
        message: `Your request to join ${community.name} was not approved at this time.`,
        category: 'membership',
        priority: 'normal',
        data: {
          communityId,
          communityName: community.name,
          rejectedBy: rejecter?.username || 'Admin',
          reason,
          actionUrl: `/communities/${communityId}`
        }
      };

      return await this.sendNotification(userId, notification);
    } catch (error) {
      console.error('Error notifying membership rejection:', error);
      throw error;
    }
  }

  /**
   * Store notification in Redis
   */
  async storeNotification(notification) {
    try {
      if (!this.redisClient) {
        console.warn('Redis client not available, skipping notification storage');
        return;
      }

      // Add to queue for processing
      await this.redisClient.lpush(this.notificationQueue, JSON.stringify(notification));
      
      // Store in user's notification history
      const userKey = `notifications:user:${notification.userId}`;
      await this.redisClient.lpush(userKey, JSON.stringify(notification));
      await this.redisClient.ltrim(userKey, 0, 999); // Keep last 1000 notifications
      
      // Set expiration for user notifications (30 days)
      await this.redisClient.expire(userKey, 30 * 24 * 60 * 60);
      
    } catch (error) {
      console.error('Error storing notification:', error);
    }
  }

  /**
   * Deliver notification through different channels
   */
  async deliverNotification(notification, user) {
    try {
      // Get user notification preferences
      const preferences = await this.getUserNotificationPreferences(user.id);
      
      // In-app notification (always available)
      if (preferences.inAppNotifications?.enabled !== false) {
        await this.deliverInAppNotification(notification);
      }

      // Email notification
      if (preferences.emailNotifications?.enabled && user.email) {
        await this.deliverEmailNotification(notification, user);
      }

      // Push notification (if configured)
      if (preferences.pushNotifications?.enabled) {
        await this.deliverPushNotification(notification, user);
      }

      // Mark as delivered
      notification.delivered = true;
      await this.updateNotificationStatus(notification.id, 'delivered');

    } catch (error) {
      console.error('Error delivering notification:', error);
    }
  }

  /**
   * Deliver in-app notification
   */
  async deliverInAppNotification(notification) {
    try {
      // In a real implementation, this would send via WebSocket
      // For now, we'll just log it
      console.log(`In-app notification delivered: ${notification.title} to user ${notification.userId}`);
      
      // Emit WebSocket event if available
      if (global.io) {
        global.io.to(`user:${notification.userId}`).emit('notification', notification);
      }
    } catch (error) {
      console.error('Error delivering in-app notification:', error);
    }
  }

  /**
   * Deliver email notification
   */
  async deliverEmailNotification(notification, user) {
    try {
      // In a real implementation, this would use a proper email service
      // For now, we'll just log it
      console.log(`Email notification would be sent to ${user.email}: ${notification.title}`);
      
      // Example email service integration:
      // await emailService.send({
      //   to: user.email,
      //   subject: notification.title,
      //   html: this.renderEmailTemplate(notification)
      // });
    } catch (error) {
      console.error('Error delivering email notification:', error);
    }
  }

  /**
   * Deliver push notification
   */
  async deliverPushNotification(notification, user) {
    try {
      // In a real implementation, this would use a push notification service
      // For now, we'll just log it
      console.log(`Push notification would be sent to user ${notification.userId}: ${notification.title}`);
      
      // Example push notification service integration:
      // await pushService.send({
      //   userId: user.id,
      //   title: notification.title,
      //   body: notification.message,
      //   data: notification.data
      // });
    } catch (error) {
      console.error('Error delivering push notification:', error);
    }
  }

  /**
   * Get user notification preferences
   */
  async getUserNotificationPreferences(userId) {
    try {
      const cacheKey = `user:${userId}:notification_preferences`;
      
      if (this.redisClient) {
        const cached = await this.redisClient.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      // Default preferences
      const preferences = {
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
        frequency: 'immediate',
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00',
          timezone: 'UTC'
        }
      };

      // Cache preferences
      if (this.redisClient) {
        await this.redisClient.setex(cacheKey, 1800, JSON.stringify(preferences)); // 30 minutes
      }

      return preferences;
    } catch (error) {
      console.error('Error getting user notification preferences:', error);
      return this.getDefaultPreferences();
    }
  }

  /**
   * Get default notification preferences
   */
  getDefaultPreferences() {
    return {
      emailNotifications: { enabled: true },
      pushNotifications: { enabled: true },
      inAppNotifications: { enabled: true }
    };
  }

  /**
   * Update notification status
   */
  async updateNotificationStatus(notificationId, status) {
    try {
      if (!this.redisClient) return;

      const userKey = `notifications:user:*`;
      const keys = await this.redisClient.keys(userKey);
      
      for (const key of keys) {
        const notifications = await this.redisClient.lrange(key, 0, -1);
        for (let i = 0; i < notifications.length; i++) {
          const notification = JSON.parse(notifications[i]);
          if (notification.id === notificationId) {
            notification[status] = true;
            await this.redisClient.lset(key, i, JSON.stringify(notification));
            return;
          }
        }
      }
    } catch (error) {
      console.error('Error updating notification status:', error);
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId, options = {}) {
    try {
      if (!this.redisClient) {
        return { notifications: [], total: 0 };
      }

      const userKey = `notifications:user:${userId}`;
      const notifications = await this.redisClient.lrange(userKey, 0, -1);
      
      let parsedNotifications = notifications.map(n => JSON.parse(n));
      
      // Apply filters
      if (options.unreadOnly) {
        parsedNotifications = parsedNotifications.filter(n => !n.read);
      }
      
      if (options.type) {
        parsedNotifications = parsedNotifications.filter(n => n.type === options.type);
      }
      
      if (options.category) {
        parsedNotifications = parsedNotifications.filter(n => n.category === options.category);
      }
      
      // Apply pagination
      const page = options.page || 1;
      const limit = options.limit || 20;
      const offset = (page - 1) * limit;
      
      const total = parsedNotifications.length;
      const paginatedNotifications = parsedNotifications.slice(offset, offset + limit);
      
      return {
        notifications: paginatedNotifications,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return { notifications: [], total: 0 };
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId, userId) {
    try {
      if (!this.redisClient) return false;

      const userKey = `notifications:user:${userId}`;
      const notifications = await this.redisClient.lrange(userKey, 0, -1);
      
      for (let i = 0; i < notifications.length; i++) {
        const notification = JSON.parse(notifications[i]);
        if (notification.id === notificationId) {
          notification.read = true;
          await this.redisClient.lset(userKey, i, JSON.stringify(notification));
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read for user
   */
  async markAllNotificationsAsRead(userId) {
    try {
      if (!this.redisClient) return false;

      const userKey = `notifications:user:${userId}`;
      const notifications = await this.redisClient.lrange(userKey, 0, -1);
      
      const updatedNotifications = notifications.map(n => {
        const notification = JSON.parse(n);
        notification.read = true;
        return JSON.stringify(notification);
      });
      
      if (updatedNotifications.length > 0) {
        await this.redisClient.del(userKey);
        await this.redisClient.lpush(userKey, ...updatedNotifications);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId) {
    try {
      const result = await this.getUserNotifications(userId, { unreadOnly: true });
      return result.total;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }
}

module.exports = new NotificationService(); 