/**
 * Smart Notifications Components
 * 
 * Export file for smart notification components used throughout the application.
 */

// Core notification components (these would be implemented as full React components)
export { default as SmartNotificationProvider } from './SmartNotificationProvider';
export { default as NotificationCenter } from './NotificationCenter';
export { default as InAppNotification } from './InAppNotification';
export { default as NotificationToast } from './NotificationToast';
export { default as NotificationBadge } from './NotificationBadge';

// Smart targeting components
export { default as SegmentViewer } from './SegmentViewer';
export { default as OptimizationPanel } from './OptimizationPanel';
export { default as AnalyticsDashboard } from './AnalyticsDashboard';

// Utility components
export { default as NotificationPreferences } from './NotificationPreferences';
export { default as ABTestViewer } from './ABTestViewer';

// Types and interfaces
export type {
  SmartNotificationProps,
  NotificationCenterProps,
  SegmentViewerProps,
  OptimizationPanelProps
} from './types';

// Hooks
export { useSmartNotifications } from './hooks/useSmartNotifications';
export { useNotificationCenter } from './hooks/useNotificationCenter'; 