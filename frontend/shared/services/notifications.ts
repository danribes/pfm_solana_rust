// Notification Service
// Task 5.2.2: Real-Time Notification System

import {
  BaseNotification,
  PersonalNotification,
  BroadcastNotification,
  UrgentNotification,
  NotificationPreferences,
  NotificationTemplate,
  NotificationQueueItem,
  DeliveryResult,
  DeliveryChannel,
  NotificationCategory,
  NotificationType,
  NotificationPriority,
  GetNotificationsOptions,
  NotificationResponse,
  NotificationStats,
  NotificationError,
  NotificationFrequency,
} from "../types/notifications";

export class NotificationService {
  private queue: NotificationQueueItem[] = [];
  private templates: Map<string, NotificationTemplate> = new Map();
  private preferences: Map<string, NotificationPreferences> = new Map();
  private wsConnection: WebSocket | null = null;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor(private apiUrl: string, private wsUrl: string) {
    this.initializeTemplates();
    this.initializeWebSocket();
  }

  /**
   * Initialize WebSocket connection for real-time notifications
   */
  private initializeWebSocket(): void {
    try {
      this.wsConnection = new WebSocket(this.wsUrl);
      
      this.wsConnection.onopen = () => {
        console.log("Notification WebSocket connected");
      };

      this.wsConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      this.wsConnection.onclose = () => {
        console.log("Notification WebSocket disconnected");
        // Attempt to reconnect after 5 seconds
        setTimeout(() => this.initializeWebSocket(), 5000);
      };

      this.wsConnection.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    } catch (error) {
      console.error("Failed to initialize WebSocket:", error);
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleWebSocketMessage(data: any): void {
    switch (data.type) {
      case "notification":
        this.handleIncomingNotification(data.payload);
        break;
      case "preferences_updated":
        this.handlePreferencesUpdate(data.payload);
        break;
      case "template_updated":
        this.handleTemplateUpdate(data.payload);
        break;
    }
  }

  /**
   * Handle incoming real-time notification
   */
  private handleIncomingNotification(notification: BaseNotification): void {
    // Emit event for UI components to listen
    this.emit("notification_received", notification);
    
    // Store notification locally (in a real app, this would be in a database)
    this.storeNotification(notification);
    
    // Show browser notification if enabled
    this.showBrowserNotification(notification);
  }

  /**
   * Store notification locally
   */
  private storeNotification(notification: BaseNotification): void {
    // In a real implementation, this would store to IndexedDB or similar
    const stored = localStorage.getItem(`notifications_${notification.userId}`) || "[]";
    const notifications = JSON.parse(stored);
    notifications.unshift(notification);
    
    // Keep only the latest 1000 notifications
    if (notifications.length > 1000) {
      notifications.splice(1000);
    }
    
    localStorage.setItem(`notifications_${notification.userId}`, JSON.stringify(notifications));
  }

  /**
   * Show browser notification
   */
  private async showBrowserNotification(notification: BaseNotification): Promise<void> {
    if (!("Notification" in window)) return;
    
    const preferences = await this.getPreferences(notification.userId);
    if (!preferences.channels["push"]?.enabled) return;

    if (Notification.permission === "granted") {
      new Notification(notification.title, {
        body: notification.message,
        icon: "/favicon.ico",
        tag: notification.id,
        requireInteraction: notification.priority === "critical",
      });
    } else if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        new Notification(notification.title, {
          body: notification.message,
          icon: "/favicon.ico",
          tag: notification.id,
        });
      }
    }
  }

  /**
   * Send a notification
   */
  async send(notification: BaseNotification, channels: DeliveryChannel[] = ["in-app"]): Promise<void> {
    try {
      // Validate notification
      this.validateNotification(notification);

      // Get user preferences
      const preferences = await this.getPreferences(notification.userId);
      
      // Filter channels based on preferences
      const enabledChannels = channels.filter(channel => 
        preferences.channels[channel]?.enabled && 
        this.shouldSendForCategory(preferences, notification.category, channel)
      );

      if (enabledChannels.length === 0) {
        console.log("No enabled channels for notification", notification.id);
        return;
      }

      // Add to queue
      const queueItem: NotificationQueueItem = {
        id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        notification,
        channels: enabledChannels,
        scheduledFor: Date.now(),
        attempts: 0,
        maxAttempts: 3,
        status: "pending",
      };

      this.queue.push(queueItem);
      
      // Process queue
      await this.processQueue();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      throw new NotificationError(`Failed to send notification: ${errorMessage}`, {
        code: "SEND_FAILED",
        context: { notification, channels },
      });
    }
  }

  /**
   * Send bulk notifications
   */
  async sendBulk(notifications: BaseNotification[]): Promise<void> {
    const promises = notifications.map(notification => this.send(notification));
    await Promise.allSettled(promises);
  }

  /**
   * Process notification queue
   */
  private async processQueue(): Promise<void> {
    const pendingItems = this.queue.filter(item => item.status === "pending");
    
    for (const item of pendingItems) {
      item.status = "processing";
      
      try {
        const results = await this.deliverNotification(item);
        const hasSuccess = results.some(result => result.status === "success");
        
        if (hasSuccess) {
          item.status = "delivered";
        } else {
          item.attempts++;
          if (item.attempts >= item.maxAttempts) {
            item.status = "failed";
          } else {
            item.status = "pending";
            item.scheduledFor = Date.now() + (item.attempts * 30000); // Exponential backoff
          }
        }
      } catch (error) {
        item.attempts++;
        item.error = error instanceof Error ? error.message : "Unknown error";
        item.lastAttempt = Date.now();
        
        if (item.attempts >= item.maxAttempts) {
          item.status = "failed";
        } else {
          item.status = "pending";
          item.scheduledFor = Date.now() + (item.attempts * 30000);
        }
      }
    }

    // Clean up old completed items
    this.queue = this.queue.filter(item => 
      item.status === "pending" || 
      (Date.now() - (item.lastAttempt || item.scheduledFor)) < 3600000 // Keep for 1 hour
    );
  }

  /**
   * Deliver notification through specified channels
   */
  private async deliverNotification(item: NotificationQueueItem): Promise<DeliveryResult[]> {
    const results: DeliveryResult[] = [];

    for (const channel of item.channels) {
      try {
        const result = await this.deliverToChannel(item.notification, channel);
        results.push(result);
      } catch (error) {
        results.push({
          channel,
          status: "failed",
          timestamp: Date.now(),
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return results;
  }

  /**
   * Deliver notification to specific channel
   */
  private async deliverToChannel(notification: BaseNotification, channel: DeliveryChannel): Promise<DeliveryResult> {
    const timestamp = Date.now();

    switch (channel) {
      case "in-app":
        // Send through WebSocket
        if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
          this.wsConnection.send(JSON.stringify({
            type: "notification",
            payload: notification,
          }));
          return { channel, status: "success", timestamp };
        }
        throw new Error("WebSocket not connected");

      case "email":
        // Send email via API
        const emailResponse = await fetch(`${this.apiUrl}/notifications/email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notification }),
        });
        
        if (!emailResponse.ok) {
          throw new Error(`Email delivery failed: ${emailResponse.statusText}`);
        }
        
        return { 
          channel, 
          status: "success", 
          timestamp,
          messageId: (await emailResponse.json()).messageId,
        };

      case "push":
        // Browser push notification (already handled in handleIncomingNotification)
        return { channel, status: "success", timestamp };

      case "sms":
        // Send SMS via API
        const smsResponse = await fetch(`${this.apiUrl}/notifications/sms`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notification }),
        });
        
        if (!smsResponse.ok) {
          throw new Error(`SMS delivery failed: ${smsResponse.statusText}`);
        }
        
        return { 
          channel, 
          status: "success", 
          timestamp,
          messageId: (await smsResponse.json()).messageId,
        };

      default:
        throw new Error(`Unsupported delivery channel: ${channel}`);
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/notifications/${notificationId}/read`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to mark as read: ${response.statusText}`);
      }

      // Update local storage
      const stored = localStorage.getItem(`notifications_${userId}`) || "[]";
      const notifications = JSON.parse(stored);
      const notification = notifications.find((n: BaseNotification) => n.id === notificationId);
      if (notification) {
        notification.read = true;
        notification.updatedAt = Date.now();
        localStorage.setItem(`notifications_${userId}`, JSON.stringify(notifications));
      }

      this.emit("notification_read", { notificationId, userId });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      throw new NotificationError(`Failed to mark notification as read: ${errorMessage}`, {
        code: "MARK_READ_FAILED",
        context: { notificationId, userId },
      });
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/notifications/read-all`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to mark all as read: ${response.statusText}`);
      }

      // Update local storage
      const stored = localStorage.getItem(`notifications_${userId}`) || "[]";
      const notifications = JSON.parse(stored);
      notifications.forEach((notification: BaseNotification) => {
        notification.read = true;
        notification.updatedAt = Date.now();
      });
      localStorage.setItem(`notifications_${userId}`, JSON.stringify(notifications));

      this.emit("all_notifications_read", { userId });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      throw new NotificationError(`Failed to mark all notifications as read: ${errorMessage}`, {
        code: "MARK_ALL_READ_FAILED",
        context: { userId },
      });
    }
  }

  /**
   * Delete a notification
   */
  async delete(notificationId: string, userId: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/notifications/${notificationId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete notification: ${response.statusText}`);
      }

      // Update local storage
      const stored = localStorage.getItem(`notifications_${userId}`) || "[]";
      const notifications = JSON.parse(stored);
      const filteredNotifications = notifications.filter((n: BaseNotification) => n.id !== notificationId);
      localStorage.setItem(`notifications_${userId}`, JSON.stringify(filteredNotifications));

      this.emit("notification_deleted", { notificationId, userId });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      throw new NotificationError(`Failed to delete notification: ${errorMessage}`, {
        code: "DELETE_FAILED",
        context: { notificationId, userId },
      });
    }
  }

  /**
   * Get notifications for a user
   */
  async getNotifications(userId: string, options: GetNotificationsOptions = {}): Promise<NotificationResponse> {
    try {
      const params = new URLSearchParams();
      if (options.page) params.append("page", options.page.toString());
      if (options.limit) params.append("limit", options.limit.toString());
      if (options.category) params.append("category", options.category);
      if (options.type) params.append("type", options.type);
      if (options.unreadOnly) params.append("unreadOnly", "true");
      if (options.startDate) params.append("startDate", options.startDate.toString());
      if (options.endDate) params.append("endDate", options.endDate.toString());

      const response = await fetch(`${this.apiUrl}/notifications/${userId}?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.statusText}`);
      }

      return await response.json();

    } catch (error) {
      // Fallback to local storage
      const stored = localStorage.getItem(`notifications_${userId}`) || "[]";
      let notifications: BaseNotification[] = JSON.parse(stored);

      // Apply filters
      if (options.category && options.category !== "all") {
        notifications = notifications.filter(n => n.category === options.category);
      }
      if (options.type) {
        notifications = notifications.filter(n => n.type === options.type);
      }
      if (options.unreadOnly) {
        notifications = notifications.filter(n => !n.read);
      }
      if (options.startDate) {
        notifications = notifications.filter(n => n.createdAt >= options.startDate!);
      }
      if (options.endDate) {
        notifications = notifications.filter(n => n.createdAt <= options.endDate!);
      }

      // Sort by date (newest first)
      notifications.sort((a, b) => b.createdAt - a.createdAt);

      // Pagination
      const page = options.page || 1;
      const limit = options.limit || 20;
      const startIndex = (page - 1) * limit;
      const paginatedNotifications = notifications.slice(startIndex, startIndex + limit);

      return {
        notifications: paginatedNotifications,
        total: notifications.length,
        unreadCount: notifications.filter(n => !n.read).length,
        hasMore: startIndex + limit < notifications.length,
      };
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const response = await fetch(`${this.apiUrl}/notifications/${userId}/unread-count`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch unread count: ${response.statusText}`);
      }

      return (await response.json()).count;

    } catch (error) {
      // Fallback to local storage
      const stored = localStorage.getItem(`notifications_${userId}`) || "[]";
      const notifications: BaseNotification[] = JSON.parse(stored);
      return notifications.filter(n => !n.read).length;
    }
  }

  /**
   * Get user notification preferences
   */
  async getPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const response = await fetch(`${this.apiUrl}/notifications/${userId}/preferences`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch preferences: ${response.statusText}`);
      }

      const preferences = await response.json();
      this.preferences.set(userId, preferences);
      return preferences;

    } catch (error) {
      // Return cached preferences or defaults
      if (this.preferences.has(userId)) {
        return this.preferences.get(userId)!;
      }

      // Default preferences
      const defaultPreferences: NotificationPreferences = {
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

      this.preferences.set(userId, defaultPreferences);
      return defaultPreferences;
    }
  }

  /**
   * Update user notification preferences
   */
  async updatePreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/notifications/${userId}/preferences`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error(`Failed to update preferences: ${response.statusText}`);
      }

      // Update cache
      const currentPreferences = await this.getPreferences(userId);
      const updatedPreferences = { ...currentPreferences, ...preferences, lastUpdated: Date.now() };
      this.preferences.set(userId, updatedPreferences);

      this.emit("preferences_updated", { userId, preferences: updatedPreferences });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      throw new NotificationError(`Failed to update preferences: ${errorMessage}`, {
        code: "PREFERENCES_UPDATE_FAILED",
        context: { userId, preferences },
      });
    }
  }

  /**
   * Get notification templates
   */
  async getTemplates(): Promise<NotificationTemplate[]> {
    try {
      const response = await fetch(`${this.apiUrl}/notifications/templates`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch templates: ${response.statusText}`);
      }

      const templates = await response.json();
      templates.forEach((template: NotificationTemplate) => {
        this.templates.set(template.id, template);
      });

      return templates;

    } catch (error) {
      return Array.from(this.templates.values());
    }
  }

  /**
   * Render notification template with variables
   */
  async renderTemplate(templateId: string, variables: Record<string, any>): Promise<string> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new NotificationError(`Template not found: ${templateId}`, {
        code: "TEMPLATE_NOT_FOUND",
        context: { templateId },
      });
    }

    let renderedBody = template.body;
    
    // Simple template variable replacement
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      renderedBody = renderedBody.replace(new RegExp(placeholder, "g"), String(value));
    }

    return renderedBody;
  }

  // Helper methods

  /**
   * Validate notification data
   */
  private validateNotification(notification: BaseNotification): void {
    if (!notification.id) throw new Error("Notification ID is required");
    if (!notification.userId) throw new Error("User ID is required");
    if (!notification.title) throw new Error("Notification title is required");
    if (!notification.message) throw new Error("Notification message is required");
    if (!notification.type) throw new Error("Notification type is required");
    if (!notification.category) throw new Error("Notification category is required");
    if (!notification.priority) throw new Error("Notification priority is required");
  }

  /**
   * Check if notification should be sent for category and channel
   */
  private shouldSendForCategory(
    preferences: NotificationPreferences,
    category: NotificationCategory,
    channel: DeliveryChannel
  ): boolean {
    const categoryPrefs = preferences.categories[category];
    return categoryPrefs?.enabled && categoryPrefs.channels.includes(channel);
  }

  /**
   * Handle preferences update from WebSocket
   */
  private handlePreferencesUpdate(data: any): void {
    this.preferences.set(data.userId, data.preferences);
    this.emit("preferences_updated", data);
  }

  /**
   * Handle template update from WebSocket
   */
  private handleTemplateUpdate(template: NotificationTemplate): void {
    this.templates.set(template.id, template);
    this.emit("template_updated", template);
  }

  /**
   * Initialize default notification templates
   */
  private initializeTemplates(): void {
    const defaultTemplates: NotificationTemplate[] = [
      {
        id: "voting_started",
        name: "Voting Started",
        category: "voting",
        type: "voting_started",
        subject: "New vote: {{title}}",
        body: "A new vote has started: {{title}}. You can cast your vote until {{endDate}}.",
        variables: ["title", "endDate"],
        channels: ["in-app", "email"],
        active: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: "member_joined",
        name: "Member Joined",
        category: "community",
        type: "member_joined",
        subject: "{{memberName}} joined the community",
        body: "Welcome {{memberName}} to our community! They joined on {{joinDate}}.",
        variables: ["memberName", "joinDate"],
        channels: ["in-app"],
        active: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: "system_announcement",
        name: "System Announcement",
        category: "system",
        type: "announcement",
        subject: "System Announcement: {{title}}",
        body: "{{message}}",
        variables: ["title", "message"],
        channels: ["in-app", "email"],
        active: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  // Event emitter methods

  /**
   * Add event listener
   */
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  /**
   * Remove event listener
   */
  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event
   */
  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
    this.eventListeners.clear();
    this.preferences.clear();
    this.templates.clear();
    this.queue.length = 0;
  }
}

// Export singleton instance
let notificationServiceInstance: NotificationService | null = null;

export const getNotificationService = (): NotificationService => {
  if (!notificationServiceInstance) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001";
    notificationServiceInstance = new NotificationService(apiUrl, wsUrl);
  }
  return notificationServiceInstance;
};

export default NotificationService; 