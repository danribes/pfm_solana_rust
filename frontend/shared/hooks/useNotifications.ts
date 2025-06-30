// Notification Hook
// Task 5.2.2: Real-Time Notification System

import { useState, useEffect, useCallback, useRef } from "react";
import {
  BaseNotification,
  NotificationPreferences,
  GetNotificationsOptions,
  NotificationResponse,
  NotificationCategory,
  DeliveryChannel,
} from "../types/notifications";
import { getNotificationService } from "../services/notifications";
import {
  sortNotifications,
  filterNotifications,
  getNotificationSummary,
  groupNotificationsByCategory,
  groupNotificationsByDate,
} from "../utils/notifications";

interface UseNotificationsOptions {
  userId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  initialFilters?: {
    category?: NotificationCategory | "all";
    unreadOnly?: boolean;
  };
}

export interface NotificationHookState {
  notifications: BaseNotification[];
  filteredNotifications: BaseNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  preferences: NotificationPreferences | null;
  hasMore: boolean;
  currentFilter: NotificationCategory | "all";
  searchTerm: string;
}

export interface NotificationHookActions {
  // Notification operations
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  loadMoreNotifications: () => Promise<void>;
  
  // Filtering and search
  setFilter: (category: NotificationCategory | "all") => void;
  setSearchTerm: (term: string) => void;
  clearFilters: () => void;
  
  // Preferences
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;
  refreshPreferences: () => Promise<void>;
  
  // Real-time
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
}

export const useNotifications = (
  options: UseNotificationsOptions = {}
): NotificationHookState & NotificationHookActions => {
  const {
    userId,
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    initialFilters = {},
  } = options;

  // State
  const [notifications, setNotifications] = useState<BaseNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<NotificationCategory | "all">(
    initialFilters.category || "all"
  );
  const [searchTerm, setSearchTerm] = useState("");

  // Refs
  const serviceRef = useRef(getNotificationService());
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentPageRef = useRef(1);

  // Computed state
  const filteredNotifications = filterNotifications(notifications, {
    category: currentFilter,
    unreadOnly: initialFilters.unreadOnly,
    search: searchTerm,
  });

  // Notification operations
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!userId) return;

    try {
      await serviceRef.current.markAsRead(notificationId, userId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true, updatedAt: Date.now() }
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark notification as read");
    }
  }, [userId]);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    try {
      await serviceRef.current.markAllAsRead(userId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ 
          ...notification, 
          read: true, 
          updatedAt: Date.now() 
        }))
      );
      
      setUnreadCount(0);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark all notifications as read");
    }
  }, [userId]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!userId) return;

    try {
      await serviceRef.current.delete(notificationId, userId);
      
      // Update local state
      const wasUnread = notifications.find(n => n.id === notificationId)?.read === false;
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete notification");
    }
  }, [userId, notifications]);

  const refreshNotifications = useCallback(async (reset = false) => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const page = reset ? 1 : currentPageRef.current;
      const options: GetNotificationsOptions = {
        page,
        limit: 20,
        category: currentFilter !== "all" ? currentFilter : undefined,
      };

      const response: NotificationResponse = await serviceRef.current.getNotifications(userId, options);
      
      if (reset || page === 1) {
        setNotifications(sortNotifications(response.notifications));
      } else {
        setNotifications(prev => [
          ...prev,
          ...response.notifications.filter(newNotif => 
            !prev.some(existingNotif => existingNotif.id === newNotif.id)
          )
        ]);
      }
      
      setUnreadCount(response.unreadCount);
      setHasMore(response.hasMore);
      
      if (reset) {
        currentPageRef.current = 1;
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [userId, currentFilter]);

  const loadMoreNotifications = useCallback(async () => {
    if (!hasMore || loading) return;

    currentPageRef.current += 1;
    await refreshNotifications(false);
  }, [hasMore, loading, refreshNotifications]);

  // Filtering and search
  const setFilter = useCallback((category: NotificationCategory | "all") => {
    setCurrentFilter(category);
    currentPageRef.current = 1;
    // Will trigger useEffect to reload notifications
  }, []);

  const setSearchTermValue = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const clearFilters = useCallback(() => {
    setCurrentFilter("all");
    setSearchTerm("");
    currentPageRef.current = 1;
  }, []);

  // Preferences
  const updatePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>) => {
    if (!userId) return;

    try {
      await serviceRef.current.updatePreferences(userId, newPreferences);
      await refreshPreferences();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update preferences");
    }
  }, [userId]);

  const refreshPreferences = useCallback(async () => {
    if (!userId) return;

    try {
      const prefs = await serviceRef.current.getPreferences(userId);
      setPreferences(prefs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load preferences");
    }
  }, [userId]);

  // Real-time WebSocket management
  const connectWebSocket = useCallback(() => {
    if (!serviceRef.current) return;

    // Listen for new notifications
    serviceRef.current.on("notification_received", (notification: BaseNotification) => {
      if (notification.userId === userId) {
        setNotifications(prev => {
          const exists = prev.some(n => n.id === notification.id);
          if (exists) return prev;
          
          const updated = [notification, ...prev];
          return sortNotifications(updated);
        });
        
        if (!notification.read) {
          setUnreadCount(prev => prev + 1);
        }
      }
    });

    // Listen for read status changes
    serviceRef.current.on("notification_read", ({ notificationId, userId: readUserId }: any) => {
      if (readUserId === userId) {
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === notificationId
              ? { ...notification, read: true, updatedAt: Date.now() }
              : notification
          )
        );
      }
    });

    // Listen for deleted notifications
    serviceRef.current.on("notification_deleted", ({ notificationId, userId: deleteUserId }: any) => {
      if (deleteUserId === userId) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      }
    });

    // Listen for preference updates
    serviceRef.current.on("preferences_updated", ({ userId: prefUserId, preferences: newPreferences }: any) => {
      if (prefUserId === userId) {
        setPreferences(newPreferences);
      }
    });

  }, [userId]);

  const disconnectWebSocket = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.destroy();
    }
  }, []);

  // Effects
  useEffect(() => {
    if (userId) {
      // Initial load
      refreshNotifications(true);
      refreshPreferences();
      
      // Connect WebSocket
      connectWebSocket();
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [userId, refreshNotifications, refreshPreferences, connectWebSocket]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && userId) {
      refreshIntervalRef.current = setInterval(() => {
        refreshNotifications(true);
      }, refreshInterval);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, userId, refreshNotifications]);

  // Filter change effect
  useEffect(() => {
    if (userId) {
      refreshNotifications(true);
    }
  }, [currentFilter, userId]);

  // Return hook interface
  return {
    // State
    notifications,
    filteredNotifications,
    unreadCount,
    loading,
    error,
    preferences,
    hasMore,
    currentFilter,
    searchTerm,
    
    // Actions
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications: () => refreshNotifications(true),
    loadMoreNotifications,
    setFilter,
    setSearchTerm: setSearchTermValue,
    clearFilters,
    updatePreferences,
    refreshPreferences,
    connectWebSocket,
    disconnectWebSocket,
  };
};

/**
 * Hook for notification summary/stats
 */
export const useNotificationSummary = (notifications: BaseNotification[]) => {
  const summary = getNotificationSummary(notifications);
  const groupedByCategory = groupNotificationsByCategory(notifications);
  const groupedByDate = groupNotificationsByDate(notifications);
  
  return {
    ...summary,
    groupedByCategory,
    groupedByDate,
  };
};

/**
 * Hook for real-time notification count
 */
export const useUnreadNotificationCount = (userId?: string) => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const serviceRef = useRef(getNotificationService());

  const refreshCount = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const newCount = await serviceRef.current.getUnreadCount(userId);
      setCount(newCount);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      refreshCount();

      // Listen for real-time updates
      const service = serviceRef.current;
      
      const handleNewNotification = (notification: BaseNotification) => {
        if (notification.userId === userId && !notification.read) {
          setCount(prev => prev + 1);
        }
      };

      const handleNotificationRead = ({ userId: readUserId }: any) => {
        if (readUserId === userId) {
          setCount(prev => Math.max(0, prev - 1));
        }
      };

      const handleAllRead = ({ userId: readUserId }: any) => {
        if (readUserId === userId) {
          setCount(0);
        }
      };

      service.on("notification_received", handleNewNotification);
      service.on("notification_read", handleNotificationRead);
      service.on("all_notifications_read", handleAllRead);

      return () => {
        service.off("notification_received", handleNewNotification);
        service.off("notification_read", handleNotificationRead);
        service.off("all_notifications_read", handleAllRead);
      };
    }
  }, [userId, refreshCount]);

  return { count, loading, refreshCount };
};

export default useNotifications; 