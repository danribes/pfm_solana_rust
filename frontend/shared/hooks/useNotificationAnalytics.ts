/**
 * useNotificationAnalytics Hook
 * 
 * React hook for accessing notification analytics functionality in components.
 * Provides easy-to-use interface for tracking notification events, user segmentation, and optimization.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  UseNotificationAnalyticsReturn,
  NotificationAnalyticsConfig,
  UserSegment,
  NotificationChannel,
  NotificationAnalytics,
  AnalyticsFilters,
  NotificationInstance
} from '../types/notificationAnalytics';

import notificationAnalyticsService from '../services/notificationAnalytics';

export function useNotificationAnalytics(): UseNotificationAnalyticsReturn {
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [config, setConfigState] = useState<NotificationAnalyticsConfig>(notificationAnalyticsService.getConfig());
  
  const initializationAttempted = useRef(false);

  // Initialize notification analytics on mount
  useEffect(() => {
    if (initializationAttempted.current) return;
    initializationAttempted.current = true;

    const initializeService = async () => {
      try {
        await notificationAnalyticsService.initialize();
        setIsInitialized(true);
        setError(null);
        setConfigState(notificationAnalyticsService.getConfig());
      } catch (err) {
        console.error('Failed to initialize notification analytics:', err);
        setError(err instanceof Error ? err : new Error('Unknown initialization error'));
        setIsInitialized(false);
      }
    };

    initializeService();

    // Cleanup on unmount
    return () => {
      // Note: We don't shutdown the service here as it's a singleton
      // and might be used by other components
    };
  }, []);

  // Tracking Methods
  const trackNotificationSent = useCallback(async (notification: NotificationInstance): Promise<void> => {
    if (!isInitialized) return;

    try {
      await notificationAnalyticsService.trackEvent({
        id: `sent_${notification.id}`,
        type: 'sent',
        notificationId: notification.id,
        userId: notification.userId,
        timestamp: new Date(),
        data: {
          templateId: notification.templateId,
          channel: notification.channel,
          priority: notification.priority,
          segment: notification.segment,
          triggerId: notification.triggerId
        }
      });
    } catch (err) {
      console.error('Failed to track notification sent:', err);
      setError(err instanceof Error ? err : new Error('Tracking error'));
    }
  }, [isInitialized]);

  const trackNotificationDelivered = useCallback(async (
    notificationId: string, 
    deliveryTime: number
  ): Promise<void> => {
    if (!isInitialized) return;

    try {
      await notificationAnalyticsService.trackEvent({
        id: `delivered_${notificationId}`,
        type: 'delivered',
        notificationId,
        userId: 'system', // Will be updated by service
        timestamp: new Date(),
        data: {
          deliveryTime,
          deliveredAt: new Date().toISOString()
        }
      });
    } catch (err) {
      console.error('Failed to track notification delivered:', err);
      setError(err instanceof Error ? err : new Error('Tracking error'));
    }
  }, [isInitialized]);

  const trackNotificationOpened = useCallback(async (
    notificationId: string, 
    context?: Record<string, any>
  ): Promise<void> => {
    if (!isInitialized) return;

    try {
      await notificationAnalyticsService.trackEvent({
        id: `opened_${notificationId}`,
        type: 'opened',
        notificationId,
        userId: 'system', // Will be updated by service
        timestamp: new Date(),
        data: {
          openedAt: new Date().toISOString(),
          context: context || {},
          userAgent: navigator.userAgent,
          url: window.location.href
        }
      });
    } catch (err) {
      console.error('Failed to track notification opened:', err);
      setError(err instanceof Error ? err : new Error('Tracking error'));
    }
  }, [isInitialized]);

  const trackNotificationClicked = useCallback(async (
    notificationId: string, 
    element?: string, 
    context?: Record<string, any>
  ): Promise<void> => {
    if (!isInitialized) return;

    try {
      await notificationAnalyticsService.trackEvent({
        id: `clicked_${notificationId}`,
        type: 'clicked',
        notificationId,
        userId: 'system', // Will be updated by service
        timestamp: new Date(),
        data: {
          clickedAt: new Date().toISOString(),
          element: element || 'unknown',
          context: context || {},
          userAgent: navigator.userAgent,
          url: window.location.href,
          referrer: document.referrer
        }
      });
    } catch (err) {
      console.error('Failed to track notification clicked:', err);
      setError(err instanceof Error ? err : new Error('Tracking error'));
    }
  }, [isInitialized]);

  const trackNotificationDismissed = useCallback(async (
    notificationId: string, 
    reason?: string
  ): Promise<void> => {
    if (!isInitialized) return;

    try {
      await notificationAnalyticsService.trackEvent({
        id: `dismissed_${notificationId}`,
        type: 'dismissed',
        notificationId,
        userId: 'system', // Will be updated by service
        timestamp: new Date(),
        data: {
          dismissedAt: new Date().toISOString(),
          reason: reason || 'user_action',
          url: window.location.href
        }
      });
    } catch (err) {
      console.error('Failed to track notification dismissed:', err);
      setError(err instanceof Error ? err : new Error('Tracking error'));
    }
  }, [isInitialized]);

  const trackNotificationConversion = useCallback(async (
    notificationId: string, 
    goalId: string, 
    value?: number
  ): Promise<void> => {
    if (!isInitialized) return;

    try {
      await notificationAnalyticsService.trackEvent({
        id: `conversion_${notificationId}_${goalId}`,
        type: 'converted',
        notificationId,
        userId: 'system', // Will be updated by service
        timestamp: new Date(),
        data: {
          convertedAt: new Date().toISOString(),
          goalId,
          value: value || 0,
          currency: 'USD', // Default currency
          url: window.location.href
        }
      });
    } catch (err) {
      console.error('Failed to track notification conversion:', err);
      setError(err instanceof Error ? err : new Error('Tracking error'));
    }
  }, [isInitialized]);

  // User Segmentation
  const identifyUserSegment = useCallback(async (userId: string): Promise<UserSegment[]> => {
    if (!isInitialized) {
      console.warn('Notification analytics not initialized');
      return [];
    }

    try {
      const segments = await notificationAnalyticsService.getUserSegments(userId);
      return segments;
    } catch (err) {
      console.error('Failed to identify user segment:', err);
      setError(err instanceof Error ? err : new Error('Segmentation error'));
      return [];
    }
  }, [isInitialized]);

  const updateUserSegment = useCallback(async (userId: string, segment: UserSegment): Promise<void> => {
    if (!isInitialized) return;

    try {
      // Update user segments - in a real implementation, this might involve
      // updating user properties that affect segmentation
      await notificationAnalyticsService.identifyUser(userId, { 
        manualSegment: segment,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to update user segment:', err);
      setError(err instanceof Error ? err : new Error('Segmentation error'));
    }
  }, [isInitialized]);

  // Optimization
  const getOptimalSendTime = useCallback(async (
    userId: string, 
    templateId: string
  ): Promise<Date> => {
    if (!isInitialized) {
      return new Date(); // Fallback to immediate
    }

    try {
      const optimalTime = await notificationAnalyticsService.getOptimalSendTime(userId, templateId);
      return optimalTime;
    } catch (err) {
      console.error('Failed to get optimal send time:', err);
      setError(err instanceof Error ? err : new Error('Optimization error'));
      return new Date(); // Fallback to immediate
    }
  }, [isInitialized]);

  const getOptimalChannel = useCallback(async (
    userId: string, 
    templateId: string
  ): Promise<NotificationChannel> => {
    if (!isInitialized) {
      return 'in_app'; // Fallback to in-app
    }

    try {
      const optimalChannel = await notificationAnalyticsService.getOptimalChannel(userId, templateId);
      return optimalChannel;
    } catch (err) {
      console.error('Failed to get optimal channel:', err);
      setError(err instanceof Error ? err : new Error('Optimization error'));
      return 'in_app'; // Fallback to in-app
    }
  }, [isInitialized]);

  // Analytics
  const getNotificationAnalytics = useCallback(async (
    filters: AnalyticsFilters
  ): Promise<NotificationAnalytics> => {
    if (!isInitialized) {
      throw new Error('Notification analytics not initialized');
    }

    try {
      const analytics = await notificationAnalyticsService.generateAnalytics(filters);
      return analytics;
    } catch (err) {
      console.error('Failed to get notification analytics:', err);
      const error = err instanceof Error ? err : new Error('Analytics error');
      setError(error);
      throw error;
    }
  }, [isInitialized]);

  return {
    // Tracking Methods
    trackNotificationSent,
    trackNotificationDelivered,
    trackNotificationOpened,
    trackNotificationClicked,
    trackNotificationDismissed,
    trackNotificationConversion,
    
    // User Segmentation
    identifyUserSegment,
    updateUserSegment,
    
    // Optimization
    getOptimalSendTime,
    getOptimalChannel,
    
    // Analytics
    getNotificationAnalytics,
    
    // State
    isInitialized,
    error
  };
}

// Helper hooks for specific notification analytics scenarios

/**
 * Hook for tracking notification interactions automatically
 */
export function useNotificationTracking(notificationId: string) {
  const analytics = useNotificationAnalytics();
  
  // Track notification display
  useEffect(() => {
    if (analytics.isInitialized && notificationId) {
      analytics.trackNotificationOpened(notificationId, {
        autoTracked: true,
        displayTime: new Date().toISOString()
      });
    }
  }, [analytics, notificationId]);

  // Return click handler
  const handleClick = useCallback((element?: string, context?: Record<string, any>) => {
    if (analytics.isInitialized && notificationId) {
      analytics.trackNotificationClicked(notificationId, element, {
        ...context,
        interactionType: 'user_click'
      });
    }
  }, [analytics, notificationId]);

  // Return dismiss handler
  const handleDismiss = useCallback((reason?: string) => {
    if (analytics.isInitialized && notificationId) {
      analytics.trackNotificationDismissed(notificationId, reason);
    }
  }, [analytics, notificationId]);

  return {
    handleClick,
    handleDismiss,
    isTracking: analytics.isInitialized
  };
}

/**
 * Hook for user segmentation with caching
 */
export function useUserSegmentation(userId?: string) {
  const analytics = useNotificationAnalytics();
  const [segments, setSegments] = useState<UserSegment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!analytics.isInitialized || !userId) return;

    const loadSegments = async () => {
      setLoading(true);
      try {
        const userSegments = await analytics.identifyUserSegment(userId);
        setSegments(userSegments);
      } catch (error) {
        console.error('Failed to load user segments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSegments();
  }, [analytics, userId]);

  const refreshSegments = useCallback(async () => {
    if (!analytics.isInitialized || !userId) return;

    setLoading(true);
    try {
      const userSegments = await analytics.identifyUserSegment(userId);
      setSegments(userSegments);
    } catch (error) {
      console.error('Failed to refresh user segments:', error);
    } finally {
      setLoading(false);
    }
  }, [analytics, userId]);

  return {
    segments,
    loading,
    refreshSegments,
    isInitialized: analytics.isInitialized
  };
}

/**
 * Hook for notification optimization
 */
export function useNotificationOptimization(userId?: string) {
  const analytics = useNotificationAnalytics();

  const getOptimizedDelivery = useCallback(async (templateId: string) => {
    if (!analytics.isInitialized || !userId) {
      return {
        sendTime: new Date(),
        channel: 'in_app' as NotificationChannel
      };
    }

    try {
      const [optimalTime, optimalChannel] = await Promise.all([
        analytics.getOptimalSendTime(userId, templateId),
        analytics.getOptimalChannel(userId, templateId)
      ]);

      return {
        sendTime: optimalTime,
        channel: optimalChannel
      };
    } catch (error) {
      console.error('Failed to get optimized delivery:', error);
      return {
        sendTime: new Date(),
        channel: 'in_app' as NotificationChannel
      };
    }
  }, [analytics, userId]);

  return {
    getOptimizedDelivery,
    isInitialized: analytics.isInitialized
  };
}

export default useNotificationAnalytics; 