// Notification Components Index
// Task 5.2.2: Real-Time Notification System

export { default as NotificationBell } from "./NotificationBell";
export { default as NotificationPanel } from "./NotificationPanel";
export { default as NotificationItem } from "./NotificationItem";

// Re-export types for convenience
export type {
  BaseNotification,
  NotificationPreferences,
  NotificationCategory,
  NotificationType,
  NotificationPriority,
  DeliveryChannel,
} from "../../types/notifications";

// Re-export context and hooks
export {
  NotificationProvider,
  useNotificationContext,
  useNotificationPanel,
  useNotificationActions,
  useNotificationPreferences,
} from "../../contexts/NotificationContext";

export {
  useNotifications,
  useNotificationSummary,
  useUnreadNotificationCount,
} from "../../hooks/useNotifications";

// Re-export service
export { getNotificationService } from "../../services/notifications";

// Re-export utilities
export {
  createNotification,
  formatNotificationTime,
  getNotificationIcon,
  getNotificationColor,
  sortNotifications,
  filterNotifications,
  groupNotificationsByCategory,
  groupNotificationsByDate,
  shouldSendNotification,
  getNotificationSummary,
  truncateMessage,
  createVotingNotification,
  createMemberJoinedNotification,
  createSystemAnnouncementNotification,
} from "../../utils/notifications"; 