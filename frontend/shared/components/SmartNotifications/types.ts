/**
 * Smart Notification Component Types
 * 
 * Type definitions for smart notification components and their props.
 */

import { ReactNode } from 'react';
import {
  NotificationChannel,
  NotificationPriority,
  UserSegment,
  NotificationInstance,
  NotificationAnalytics
} from '../../types/notificationAnalytics';

// Base component props
export interface SmartNotificationProps {
  id: string;
  title: string;
  message: string;
  priority?: NotificationPriority;
  channel?: NotificationChannel;
  autoHide?: boolean;
  hideAfter?: number;
  actions?: NotificationAction[];
  onOpen?: () => void;
  onClick?: () => void;
  onDismiss?: () => void;
  onAction?: (actionId: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface NotificationAction {
  id: string;
  label: string;
  type?: 'primary' | 'secondary' | 'danger';
  onClick?: () => void;
}

// Notification Center props
export interface NotificationCenterProps {
  userId?: string;
  maxVisible?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
  theme?: 'light' | 'dark' | 'auto';
  enableSound?: boolean;
  enableAnimations?: boolean;
  groupByCategory?: boolean;
  showUnreadCount?: boolean;
  onNotificationClick?: (notification: NotificationInstance) => void;
  onNotificationDismiss?: (notificationId: string) => void;
  customRenderer?: (notification: NotificationInstance) => ReactNode;
}

// Segment Viewer props
export interface SegmentViewerProps {
  userId: string;
  segments?: UserSegment[];
  showDetails?: boolean;
  allowEdit?: boolean;
  onSegmentChange?: (segments: UserSegment[]) => void;
  onRefresh?: () => void;
  className?: string;
}

// Optimization Panel props
export interface OptimizationPanelProps {
  userId: string;
  templateId?: string;
  showRecommendations?: boolean;
  showPredictions?: boolean;
  onOptimizationApply?: (optimization: any) => void;
  className?: string;
}

// Analytics Dashboard props
export interface AnalyticsDashboardProps {
  timeframe?: {
    start: Date;
    end: Date;
  };
  filters?: {
    segments?: UserSegment[];
    channels?: NotificationChannel[];
    templates?: string[];
  };
  widgets?: DashboardWidget[];
  onDataRefresh?: () => void;
  onExport?: (format: 'csv' | 'json' | 'pdf') => void;
  className?: string;
}

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'heatmap';
  title: string;
  size: 'small' | 'medium' | 'large';
  data?: any;
  config?: Record<string, any>;
}

// Provider props
export interface SmartNotificationProviderProps {
  children: ReactNode;
  userId?: string;
  config?: {
    enableOptimization?: boolean;
    enableAnalytics?: boolean;
    enableABTesting?: boolean;
    theme?: 'light' | 'dark' | 'auto';
  };
  onError?: (error: Error) => void;
}

// Hook return types
export interface UseSmartNotificationsReturn {
  notifications: NotificationInstance[];
  unreadCount: number;
  sendNotification: (notification: Partial<NotificationInstance>) => Promise<void>;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (notificationId: string) => void;
  clearAll: () => void;
  isLoading: boolean;
  error: Error | null;
}

export interface UseNotificationCenterReturn {
  notifications: NotificationInstance[];
  unreadCount: number;
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  markAsRead: (notificationId: string) => void;
  dismissNotification: (notificationId: string) => void;
  analytics: NotificationAnalytics | null;
  isLoading: boolean;
} 