// Notification Context
// Task 5.2.2: Real-Time Notification System

import React, { createContext, useContext, useCallback, useEffect, useState } from "react";
import {
  BaseNotification,
  NotificationPreferences,
  NotificationCategory,
  DeliveryChannel,
} from "../types/notifications";
import { useNotifications, useUnreadNotificationCount } from "../hooks/useNotifications";
import { createNotification } from "../utils/notifications";

interface NotificationContextValue {
  // Core notification data
  notifications: BaseNotification[];
  filteredNotifications: BaseNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  preferences: NotificationPreferences | null;
  hasMore: boolean;
  
  // UI state
  isNotificationPanelOpen: boolean;
  currentFilter: NotificationCategory | "all";
  searchTerm: string;
  
  // Notification actions
  showNotification: (
    type: BaseNotification["type"],
    category: NotificationCategory,
    title: string,
    message: string,
    options?: Partial<BaseNotification>
  ) => void;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  loadMoreNotifications: () => Promise<void>;
  
  // UI actions
  toggleNotificationPanel: () => void;
  setNotificationPanelOpen: (open: boolean) => void;
  setFilter: (category: NotificationCategory | "all") => void;
  setSearchTerm: (term: string) => void;
  clearFilters: () => void;
  
  // Preferences
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;
  refreshPreferences: () => Promise<void>;
  
  // WebSocket management
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

interface NotificationProviderProps {
  children: React.ReactNode;
  userId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableToasts?: boolean;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  userId,
  autoRefresh = true,
  refreshInterval = 30000,
  enableToasts = true,
}) => {
  // UI state
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [toastNotifications, setToastNotifications] = useState<BaseNotification[]>([]);

  // Use notification hook
  const notificationHook = useNotifications({
    userId,
    autoRefresh,
    refreshInterval,
  });

  // Show notification function
  const showNotification = useCallback((
    type: BaseNotification["type"],
    category: NotificationCategory,
    title: string,
    message: string,
    options: Partial<BaseNotification> = {}
  ) => {
    if (!userId) return;

    const notification = createNotification(
      userId,
      type,
      category,
      title,
      message,
      options
    );

    // Add to toast notifications if enabled
    if (enableToasts && options.priority !== "low") {
      setToastNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep max 5 toasts
      
      // Auto-remove toast after delay
      const delay = options.priority === "critical" ? 10000 : 5000;
      setTimeout(() => {
        setToastNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, delay);
    }

    // Trigger browser notification if supported
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(title, {
          body: message,
          icon: "/favicon.ico",
          tag: notification.id,
          requireInteraction: options.priority === "critical",
        });
      }
    }
  }, [userId, enableToasts]);

  // UI actions
  const toggleNotificationPanel = useCallback(() => {
    setIsNotificationPanelOpen(prev => !prev);
  }, []);

  const setNotificationPanelOpen = useCallback((open: boolean) => {
    setIsNotificationPanelOpen(open);
  }, []);

  // Toast management
  const removeToast = useCallback((notificationId: string) => {
    setToastNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  // Listen for new notifications to show toasts
  useEffect(() => {
    if (enableToasts && notificationHook.notifications.length > 0) {
      const latestNotification = notificationHook.notifications[0];
      const isNew = Date.now() - latestNotification.createdAt < 5000; // Within last 5 seconds
      
      if (isNew && !latestNotification.read && latestNotification.priority !== "low") {
        // Check if already in toast list
        const alreadyInToasts = toastNotifications.some(n => n.id === latestNotification.id);
        if (!alreadyInToasts) {
          setToastNotifications(prev => [latestNotification, ...prev.slice(0, 4)]);
          
          // Auto-remove toast
          const delay = latestNotification.priority === "critical" ? 10000 : 5000;
          setTimeout(() => {
            setToastNotifications(prev => prev.filter(n => n.id !== latestNotification.id));
          }, delay);
        }
      }
    }
  }, [notificationHook.notifications, enableToasts, toastNotifications]);

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  // Context value
  const contextValue: NotificationContextValue = {
    // Core data from hook
    notifications: notificationHook.notifications,
    filteredNotifications: notificationHook.filteredNotifications,
    unreadCount: notificationHook.unreadCount,
    loading: notificationHook.loading,
    error: notificationHook.error,
    preferences: notificationHook.preferences,
    hasMore: notificationHook.hasMore,
    
    // UI state
    isNotificationPanelOpen,
    currentFilter: notificationHook.currentFilter,
    searchTerm: notificationHook.searchTerm,
    
    // Actions from hook
    markAsRead: notificationHook.markAsRead,
    markAllAsRead: notificationHook.markAllAsRead,
    deleteNotification: notificationHook.deleteNotification,
    refreshNotifications: notificationHook.refreshNotifications,
    loadMoreNotifications: notificationHook.loadMoreNotifications,
    setFilter: notificationHook.setFilter,
    setSearchTerm: notificationHook.setSearchTerm,
    clearFilters: notificationHook.clearFilters,
    updatePreferences: notificationHook.updatePreferences,
    refreshPreferences: notificationHook.refreshPreferences,
    connectWebSocket: notificationHook.connectWebSocket,
    disconnectWebSocket: notificationHook.disconnectWebSocket,
    
    // Custom actions
    showNotification,
    toggleNotificationPanel,
    setNotificationPanelOpen,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      {/* Toast notifications overlay */}
      {enableToasts && toastNotifications.length > 0 && (
        <NotificationToasts
          notifications={toastNotifications}
          onRemove={removeToast}
          onMarkAsRead={notificationHook.markAsRead}
        />
      )}
    </NotificationContext.Provider>
  );
};

// Toast component
interface NotificationToastsProps {
  notifications: BaseNotification[];
  onRemove: (id: string) => void;
  onMarkAsRead: (id: string) => Promise<void>;
}

const NotificationToasts: React.FC<NotificationToastsProps> = ({
  notifications,
  onRemove,
  onMarkAsRead,
}) => {
  const handleToastClick = async (notification: BaseNotification) => {
    if (!notification.read) {
      await onMarkAsRead(notification.id);
    }
    onRemove(notification.id);
    
    // Navigate to action URL if provided
    if (notification.actionUrl && typeof window !== "undefined") {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        maxWidth: "400px",
      }}
    >
      {notifications.map((notification) => (
        <div
          key={notification.id}
          onClick={() => handleToastClick(notification)}
          style={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "16px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            cursor: "pointer",
            transition: "all 0.2s ease",
            borderLeft: `4px solid ${getPriorityColor(notification.priority)}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
            <div style={{ fontSize: "20px", marginTop: "2px" }}>
              {getNotificationIcon(notification.type, notification.category)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4
                style={{
                  margin: 0,
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#1f2937",
                  marginBottom: "4px",
                }}
              >
                {notification.title}
              </h4>
              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  color: "#6b7280",
                  lineHeight: "1.4",
                }}
              >
                {notification.message.length > 100
                  ? `${notification.message.substring(0, 100)}...`
                  : notification.message}
              </p>
              <div
                style={{
                  marginTop: "8px",
                  fontSize: "11px",
                  color: "#9ca3af",
                }}
              >
                {formatTimeAgo(notification.createdAt)}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(notification.id);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#9ca3af",
                fontSize: "18px",
                padding: "0",
                width: "20px",
                height: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Utility functions
const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case "critical": return "#ef4444";
    case "high": return "#f97316";
    case "medium": return "#3b82f6";
    case "low": return "#10b981";
    default: return "#6b7280";
  }
};

const getNotificationIcon = (type: string, category: string): string => {
  const typeIcons: Record<string, string> = {
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

  const categoryIcons: Record<string, string> = {
    voting: "🗳️",
    community: "👥",
    system: "⚙️",
    security: "🔒",
    personal: "👤",
    admin: "🛡️",
  };

  return typeIcons[type] || categoryIcons[category] || "📄";
};

const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
};

// Hook to use notification context
export const useNotificationContext = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotificationContext must be used within a NotificationProvider");
  }
  return context;
};

// Convenience hooks
export const useNotificationPanel = () => {
  const context = useNotificationContext();
  return {
    isOpen: context.isNotificationPanelOpen,
    toggle: context.toggleNotificationPanel,
    setOpen: context.setNotificationPanelOpen,
  };
};

export const useNotificationActions = () => {
  const context = useNotificationContext();
  return {
    showNotification: context.showNotification,
    markAsRead: context.markAsRead,
    markAllAsRead: context.markAllAsRead,
    deleteNotification: context.deleteNotification,
    refreshNotifications: context.refreshNotifications,
  };
};

export const useNotificationPreferences = () => {
  const context = useNotificationContext();
  return {
    preferences: context.preferences,
    updatePreferences: context.updatePreferences,
    refreshPreferences: context.refreshPreferences,
  };
};

export default NotificationContext; 