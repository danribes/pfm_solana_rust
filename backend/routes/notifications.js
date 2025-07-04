const express = require('express');
const router = express.Router();
const notificationService = require('../services/notifications');
const { requireAuth } = require('../middleware/auth');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

// Get user notifications
router.get('/',
  requireAuth,
  async (req, res) => {
    try {
      const userId = req.session.userId;
      const { page, limit, unreadOnly, type, category } = req.query;

      const options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        unreadOnly: unreadOnly === 'true',
        type,
        category
      };

      const result = await notificationService.getUserNotifications(userId, options);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get notifications'
      });
    }
  }
);

// Get unread notification count
router.get('/unread-count',
  requireAuth,
  async (req, res) => {
    try {
      const userId = req.session.userId;
      const count = await notificationService.getUnreadCount(userId);

      res.json({
        success: true,
        data: { count }
      });
    } catch (error) {
      console.error('Get unread count error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get unread count'
      });
    }
  }
);

// Mark notification as read
router.put('/:notificationId/read',
  requireAuth,
  async (req, res) => {
    try {
      const userId = req.session.userId;
      const { notificationId } = req.params;

      const success = await notificationService.markNotificationAsRead(notificationId, userId);

      if (success) {
        res.json({
          success: true,
          message: 'Notification marked as read'
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Notification not found'
        });
      }
    } catch (error) {
      console.error('Mark notification as read error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to mark notification as read'
      });
    }
  }
);

// Mark all notifications as read
router.put('/mark-all-read',
  requireAuth,
  async (req, res) => {
    try {
      const userId = req.session.userId;
      const success = await notificationService.markAllNotificationsAsRead(userId);

      res.json({
        success: true,
        message: success ? 'All notifications marked as read' : 'No notifications to mark as read'
      });
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to mark notifications as read'
      });
    }
  }
);

// Get notification preferences
router.get('/preferences',
  requireAuth,
  async (req, res) => {
    try {
      const userId = req.session.userId;
      const preferences = await notificationService.getUserNotificationPreferences(userId);

      res.json({
        success: true,
        data: { preferences }
      });
    } catch (error) {
      console.error('Get notification preferences error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get notification preferences'
      });
    }
  }
);

// Update notification preferences
router.put('/preferences',
  requireAuth,
  [
    body('emailNotifications.enabled').optional().isBoolean(),
    body('pushNotifications.enabled').optional().isBoolean(),
    body('inAppNotifications.enabled').optional().isBoolean(),
    body('frequency').optional().isIn(['immediate', 'daily', 'weekly']),
    handleValidationErrors
  ],
  async (req, res) => {
    try {
      const userId = req.session.userId;
      const preferences = req.body;

      // In a real implementation, you would save these to a database
      // For now, we'll just return success
      res.json({
        success: true,
        message: 'Notification preferences updated successfully',
        data: { preferences }
      });
    } catch (error) {
      console.error('Update notification preferences error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update notification preferences'
      });
    }
  }
);

// Delete notification
router.delete('/:notificationId',
  requireAuth,
  async (req, res) => {
    try {
      const userId = req.session.userId;
      const { notificationId } = req.params;

      // In a real implementation, you would delete the notification
      // For now, we'll just return success
      res.json({
        success: true,
        message: 'Notification deleted successfully'
      });
    } catch (error) {
      console.error('Delete notification error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete notification'
      });
    }
  }
);

module.exports = router; 