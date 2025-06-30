// Notification System Types
// Task 5.2.2: Real-Time Notification System

export interface BaseNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: number;
  updatedAt?: number;
  expiresAt?: number;
  actionUrl?: string;
  category: NotificationCategory;
  priority: NotificationPriority;
}

export type NotificationType = 
  | "mention" 
  | "reply" 
  | "vote" 
  | "proposal" 
  | "system" 
  | "announcement" 
  | "update" 
  | "event"
  | "security" 
  | "emergency"
  | "member_joined"
  | "member_left"
  | "treasury_update"
  | "voting_started"
  | "voting_ended"
  | "maintenance";

export type NotificationCategory = 
  | "voting"
  | "community" 
  | "system"
  | "security"
  | "personal"
  | "admin";

export type NotificationPriority = "low" | "medium" | "high" | "critical";

export type DeliveryChannel = "in-app" | "email" | "push" | "sms";

// Extended notification interfaces
export interface PersonalNotification extends BaseNotification {
  deliveryChannels: DeliveryChannel[];
  requiresAction: boolean;
  actionData?: any;
}

export interface BroadcastNotification extends BaseNotification {
  communityId?: string;
  targetRoles: string[];
  deliveredTo: string[];
  deliveryStats: {
    sent: number;
    delivered: number;
    read: number;
    failed: number;
  };
}

export interface UrgentNotification extends BaseNotification {
  severity: "high" | "critical";
  requiresAcknowledgment: boolean;
  acknowledgedBy: string[];
  escalationLevel: number;
  escalationRules?: EscalationRule[];
}

export interface EscalationRule {
  level: number;
  delayMinutes: number;
  targetRoles: string[];
  channels: DeliveryChannel[];
}

// Notification preferences
export interface NotificationPreferences {
  userId: string;
  channels: {
    [key in DeliveryChannel]: {
      enabled: boolean;
      quietHours?: QuietHours;
      frequency: NotificationFrequency;
    };
  };
  categories: {
    [key in NotificationCategory]: {
      enabled: boolean;
      channels: DeliveryChannel[];
      priority: NotificationPriority;
    };
  };
  doNotDisturb: boolean;
  quietHours?: QuietHours;
  lastUpdated: number;
}

export interface QuietHours {
  enabled: boolean;
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
  timezone: string;
  allowUrgent: boolean;
}

export type NotificationFrequency = "instant" | "batched" | "daily" | "weekly" | "disabled";

// Notification templates
export interface NotificationTemplate {
  id: string;
  name: string;
  category: NotificationCategory;
  type: NotificationType;
  subject: string;
  body: string;
  variables: string[];
  channels: DeliveryChannel[];
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

// Notification queue and delivery
export interface NotificationQueueItem {
  id: string;
  notification: BaseNotification;
  channels: DeliveryChannel[];
  scheduledFor: number;
  attempts: number;
  maxAttempts: number;
  status: "pending" | "processing" | "delivered" | "failed" | "cancelled";
  lastAttempt?: number;
  error?: string;
}

export interface DeliveryResult {
  channel: DeliveryChannel;
  status: "success" | "failed" | "skipped";
  timestamp: number;
  error?: string;
  messageId?: string;
}

// Notification service interfaces
export interface NotificationService {
  // Basic operations
  send(notification: BaseNotification, channels?: DeliveryChannel[]): Promise<void>;
  sendBulk(notifications: BaseNotification[]): Promise<void>;
  markAsRead(notificationId: string, userId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
  delete(notificationId: string, userId: string): Promise<void>;
  
  // Fetching
  getNotifications(userId: string, options?: GetNotificationsOptions): Promise<NotificationResponse>;
  getUnreadCount(userId: string): Promise<number>;
  
  // Preferences
  getPreferences(userId: string): Promise<NotificationPreferences>;
  updatePreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<void>;
  
  // Templates
  getTemplates(): Promise<NotificationTemplate[]>;
  renderTemplate(templateId: string, variables: Record<string, any>): Promise<string>;
}

export interface GetNotificationsOptions {
  page?: number;
  limit?: number;
  category?: NotificationCategory | "all";
  type?: NotificationType;
  unreadOnly?: boolean;
  startDate?: number;
  endDate?: number;
}

export interface NotificationResponse {
  notifications: BaseNotification[];
  total: number;
  unreadCount: number;
  hasMore: boolean;
}

// UI-related interfaces
export interface NotificationUIState {
  isOpen: boolean;
  filter: NotificationCategory | "all";
  sortBy: "date" | "priority" | "category";
  sortOrder: "asc" | "desc";
  viewMode: "list" | "grouped";
}

export interface NotificationAction {
  id: string;
  label: string;
  type: "primary" | "secondary" | "danger";
  action: () => void | Promise<void>;
  icon?: string;
}

// Event interfaces
export interface NotificationEvent {
  type: "notification_received" | "notification_read" | "notification_deleted" | "preferences_updated";
  payload: any;
  timestamp: number;
}

// Stats and analytics
export interface NotificationStats {
  totalSent: number;
  totalRead: number;
  readRate: number;
  deliveryRate: number;
  channelStats: {
    [key in DeliveryChannel]: {
      sent: number;
      delivered: number;
      failed: number;
    };
  };
  categoryStats: {
    [key in NotificationCategory]: {
      sent: number;
      read: number;
    };
  };
}

// Error types
export interface NotificationError extends Error {
  code: string;
  context?: any;
}

export class NotificationError extends Error {
  constructor(message: string, public options: { code: string; context?: any }) {
    super(message);
    this.name = "NotificationError";
    this.code = options.code;
    this.context = options.context;
  }
  
  code: string;
  context?: any;
} 