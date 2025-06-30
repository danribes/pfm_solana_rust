// Notification Utilities
// Task 5.2.2: Real-Time Notification System

import {
  BaseNotification,
  NotificationCategory,
  NotificationType,
  NotificationPriority,
  DeliveryChannel,
  NotificationPreferences,
  QuietHours,
} from "../types/notifications";

/**
 * Generate unique notification ID
 */
export const generateNotificationId = (): string => {
  return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create a base notification object
 */
export const createNotification = (
  userId: string,
  type: NotificationType,
  category: NotificationCategory,
  title: string,
  message: string,
  options: Partial<BaseNotification> = {}
): BaseNotification => {
  return {
    id: generateNotificationId(),
    userId,
    type,
    category,
    title,
    message,
    read: false,
    createdAt: Date.now(),
    priority: "medium",
    ...options,
  };
};

/**
 * Format notification timestamp
 */
export const formatNotificationTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  
  // Less than 1 minute
  if (diff < 60000) {
    return "Just now";
  }
  
  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  }
  
  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }
  
  // Less than 7 days
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days}d ago`;
  }
  
  // Show actual date
  return new Date(timestamp).toLocaleDateString();
};

/**
 * Get notification icon based on type and category
 */
export const getNotificationIcon = (type: NotificationType, category: NotificationCategory): string => {
  // Priority icons by type
  const typeIcons: { [key in NotificationType]: string } = {
    mention: "👤",
    reply: "💬",
    vote: "🗳️",
    proposal: "📋",
    system: "⚙️",
    announcement: "📢",
    update: "🔄",
    event: "📅",
    security: "🔒",
    emergency: "🚨",
    member_joined: "👋",
    member_left: "👋",
    treasury_update: "💰",
    voting_started: "🗳️",
    voting_ended: "✅",
    maintenance: "🔧",
  };

  // Category fallback icons
  const categoryIcons: { [key in NotificationCategory]: string } = {
    voting: "🗳️",
    community: "👥",
    system: "⚙️",
    security: "🔒",
    personal: "👤",
    admin: "🛡️",
  };

  return typeIcons[type] || categoryIcons[category] || "📄";
};

/**
 * Get notification color based on priority and category
 */
export const getNotificationColor = (priority: NotificationPriority, category: NotificationCategory): string => {
  // Priority colors (highest priority)
  if (priority === "critical") return "#ef4444"; // red
  if (priority === "high") return "#f97316"; // orange
  
  // Category colors
  const categoryColors: { [key in NotificationCategory]: string } = {
    voting: "#3b82f6", // blue
    community: "#10b981", // green
    system: "#6b7280", // gray
    security: "#ef4444", // red
    personal: "#8b5cf6", // purple
    admin: "#f59e0b", // amber
  };

  return categoryColors[category] || "#6b7280";
};

/**
 * Get notification priority weight for sorting
 */
export const getPriorityWeight = (priority: NotificationPriority): number => {
  const weights = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };
  return weights[priority];
};

/**
 * Sort notifications by priority and date
 */
export const sortNotifications = (notifications: BaseNotification[]): BaseNotification[] => {
  return [...notifications].sort((a, b) => {
    // First sort by priority
    const priorityDiff = getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
    if (priorityDiff !== 0) return priorityDiff;
    
    // Then by date (newest first)
    return b.createdAt - a.createdAt;
  });
};

/**
 * Group notifications by category
 */
export const groupNotificationsByCategory = (notifications: BaseNotification[]): Record<NotificationCategory, BaseNotification[]> => {
  const grouped: Record<NotificationCategory, BaseNotification[]> = {
    voting: [],
    community: [],
    system: [],
    security: [],
    personal: [],
    admin: [],
  };

  notifications.forEach(notification => {
    grouped[notification.category].push(notification);
  });

  return grouped;
};

/**
 * Group notifications by date
 */
export const groupNotificationsByDate = (notifications: BaseNotification[]): Record<string, BaseNotification[]> => {
  const grouped: Record<string, BaseNotification[]> = {};
  
  notifications.forEach(notification => {
    const date = new Date(notification.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let key: string;
    if (date.toDateString() === today.toDateString()) {
      key = "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      key = "Yesterday";
    } else {
      key = date.toLocaleDateString();
    }
    
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(notification);
  });

  return grouped;
};

/**
 * Filter notifications based on criteria
 */
export const filterNotifications = (
  notifications: BaseNotification[],
  filters: {
    category?: NotificationCategory | "all";
    type?: NotificationType;
    priority?: NotificationPriority;
    unreadOnly?: boolean;
    search?: string;
  }
): BaseNotification[] => {
  return notifications.filter(notification => {
    // Category filter
    if (filters.category && filters.category !== "all" && notification.category !== filters.category) {
      return false;
    }
    
    // Type filter
    if (filters.type && notification.type !== filters.type) {
      return false;
    }
    
    // Priority filter
    if (filters.priority && notification.priority !== filters.priority) {
      return false;
    }
    
    // Unread filter
    if (filters.unreadOnly && notification.read) {
      return false;
    }
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const titleMatch = notification.title.toLowerCase().includes(searchLower);
      const messageMatch = notification.message.toLowerCase().includes(searchLower);
      if (!titleMatch && !messageMatch) {
        return false;
      }
    }
    
    return true;
  });
};

/**
 * Check if user is in quiet hours
 */
export const isInQuietHours = (quietHours?: QuietHours): boolean => {
  if (!quietHours || !quietHours.enabled) return false;
  
  const now = new Date();
  const currentTime = now.toLocaleTimeString("en-US", { 
    hour12: false, 
    hour: "2-digit", 
    minute: "2-digit",
    timeZone: quietHours.timezone 
  });
  
  const startTime = quietHours.startTime;
  const endTime = quietHours.endTime;
  
  // Handle overnight quiet hours (e.g., 22:00 to 08:00)
  if (startTime > endTime) {
    return currentTime >= startTime || currentTime <= endTime;
  }
  
  // Handle same-day quiet hours (e.g., 12:00 to 18:00)
  return currentTime >= startTime && currentTime <= endTime;
};

/**
 * Check if notification should be sent based on preferences
 */
export const shouldSendNotification = (
  notification: BaseNotification,
  preferences: NotificationPreferences,
  channel: DeliveryChannel
): boolean => {
  // Check if globally disabled
  if (preferences.doNotDisturb && !["critical"].includes(notification.priority)) {
    return false;
  }
  
  // Check quiet hours
  if (isInQuietHours(preferences.quietHours)) {
    if (!preferences.quietHours?.allowUrgent || !["high", "critical"].includes(notification.priority)) {
      return false;
    }
  }
  
  // Check channel preferences
  const channelPrefs = preferences.channels[channel];
  if (!channelPrefs?.enabled) {
    return false;
  }
  
  // Check category preferences
  const categoryPrefs = preferences.categories[notification.category];
  if (!categoryPrefs?.enabled) {
    return false;
  }
  
  // Check if channel is enabled for this category
  if (!categoryPrefs.channels.includes(channel)) {
    return false;
  }
  
  return true;
};

/**
 * Get notification summary for display
 */
export const getNotificationSummary = (notifications: BaseNotification[]): {
  total: number;
  unread: number;
  byCategory: Record<NotificationCategory, number>;
  byPriority: Record<NotificationPriority, number>;
  latest: BaseNotification | null;
} => {
  const summary = {
    total: notifications.length,
    unread: 0,
    byCategory: {
      voting: 0,
      community: 0,
      system: 0,
      security: 0,
      personal: 0,
      admin: 0,
    } as Record<NotificationCategory, number>,
    byPriority: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    } as Record<NotificationPriority, number>,
    latest: null as BaseNotification | null,
  };

  notifications.forEach(notification => {
    if (!notification.read) {
      summary.unread++;
    }
    
    summary.byCategory[notification.category]++;
    summary.byPriority[notification.priority]++;
    
    if (!summary.latest || notification.createdAt > summary.latest.createdAt) {
      summary.latest = notification;
    }
  });

  return summary;
};

/**
 * Truncate notification message for display
 */
export const truncateMessage = (message: string, maxLength: number = 100): string => {
  if (message.length <= maxLength) return message;
  return message.substring(0, maxLength - 3) + "...";
};

/**
 * Get readable notification type label
 */
export const getNotificationTypeLabel = (type: NotificationType): string => {
  const labels: { [key in NotificationType]: string } = {
    mention: "Mention",
    reply: "Reply",
    vote: "Vote",
    proposal: "Proposal",
    system: "System",
    announcement: "Announcement",
    update: "Update",
    event: "Event",
    security: "Security",
    emergency: "Emergency",
    member_joined: "Member Joined",
    member_left: "Member Left",
    treasury_update: "Treasury Update",
    voting_started: "Voting Started",
    voting_ended: "Voting Ended",
    maintenance: "Maintenance",
  };
  
  return labels[type] || type;
};

/**
 * Get readable notification category label
 */
export const getNotificationCategoryLabel = (category: NotificationCategory): string => {
  const labels: { [key in NotificationCategory]: string } = {
    voting: "Voting",
    community: "Community",
    system: "System",
    security: "Security",
    personal: "Personal",
    admin: "Admin",
  };
  
  return labels[category] || category;
};

/**
 * Create notification for common actions
 */
export const createVotingNotification = (
  userId: string,
  title: string,
  proposalId: string,
  endDate?: number
): BaseNotification => {
  return createNotification(
    userId,
    "voting_started",
    "voting",
    title,
    `New voting proposal: ${title}${endDate ? ` (ends ${new Date(endDate).toLocaleDateString()})` : ""}`,
    {
      priority: "high",
      actionUrl: `/proposals/${proposalId}`,
      data: { proposalId, endDate },
    }
  );
};

export const createMemberJoinedNotification = (
  userId: string,
  memberName: string,
  memberId: string
): BaseNotification => {
  return createNotification(
    userId,
    "member_joined",
    "community",
    "New Member Joined",
    `${memberName} has joined the community`,
    {
      priority: "low",
      actionUrl: `/members/${memberId}`,
      data: { memberId, memberName },
    }
  );
};

export const createSystemAnnouncementNotification = (
  userId: string,
  title: string,
  message: string,
  priority: NotificationPriority = "medium"
): BaseNotification => {
  return createNotification(
    userId,
    "announcement",
    "system",
    title,
    message,
    {
      priority,
    }
  );
};

/**
 * Validate notification preferences
 */
export const validateNotificationPreferences = (preferences: Partial<NotificationPreferences>): string[] => {
  const errors: string[] = [];
  
  if (preferences.quietHours) {
    const { startTime, endTime, timezone } = preferences.quietHours;
    
    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (startTime && !timeRegex.test(startTime)) {
      errors.push("Start time must be in HH:MM format");
    }
    if (endTime && !timeRegex.test(endTime)) {
      errors.push("End time must be in HH:MM format");
    }
    
    // Validate timezone
    if (timezone) {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: timezone });
      } catch {
        errors.push("Invalid timezone");
      }
    }
  }
  
  return errors;
};

/**
 * Get default notification preferences for user
 */
export const getDefaultNotificationPreferences = (userId: string): NotificationPreferences => {
  return {
    userId,
    channels: {
      "in-app": { enabled: true, frequency: "instant" },
      "email": { enabled: true, frequency: "batched" },
      "push": { enabled: false, frequency: "instant" },
      "sms": { enabled: false, frequency: "instant" },
    },
    categories: {
      "voting": { enabled: true, channels: ["in-app", "email"], priority: "high" },
      "community": { enabled: true, channels: ["in-app"], priority: "medium" },
      "system": { enabled: true, channels: ["in-app", "email"], priority: "high" },
      "security": { enabled: true, channels: ["in-app", "email", "push"], priority: "critical" },
      "personal": { enabled: true, channels: ["in-app"], priority: "medium" },
      "admin": { enabled: true, channels: ["in-app", "email"], priority: "high" },
    },
    doNotDisturb: false,
    lastUpdated: Date.now(),
  };
};

/**
 * Calculate notification digest for batched delivery
 */
export const createNotificationDigest = (notifications: BaseNotification[]): {
  summary: string;
  categories: Record<NotificationCategory, BaseNotification[]>;
  totalCount: number;
  unreadCount: number;
} => {
  const categories = groupNotificationsByCategory(notifications);
  const summary = getNotificationSummary(notifications);
  
  const categoryStrings: string[] = [];
  Object.entries(categories).forEach(([category, notifs]) => {
    if (notifs.length > 0) {
      categoryStrings.push(`${notifs.length} ${getNotificationCategoryLabel(category as NotificationCategory).toLowerCase()}`);
    }
  });
  
  const summaryText = categoryStrings.length > 0 
    ? `You have ${summary.total} notifications: ${categoryStrings.join(", ")}`
    : "No new notifications";
  
  return {
    summary: summaryText,
    categories,
    totalCount: summary.total,
    unreadCount: summary.unread,
  };
}; 