/**
 * useAnalytics Hook
 * 
 * React hook for accessing analytics functionality in components.
 * Provides easy-to-use interface for tracking events, user behavior, and performance.
 */

import * as React from 'react';
import {
  UseAnalyticsReturn,
  AnalyticsConfig,
  AnalyticsEvents,
  EventCategory,
  EventAction,
  PerformanceMetrics,
  RealTimeMetrics,
  AnalyticsReport
} from '../types/analytics';

import analyticsService from '../services/analytics';
import { EventTracker, PerformanceTracker, ConversionTracker } from '../utils/tracking';

export function useAnalytics(): UseAnalyticsReturn {
  // Debug React import and add error handling
  console.log('React in useAnalytics:', React);
  console.log('useState in useAnalytics:', React.useState);
  
  // Check if React and useState are available
  if (!React || !React.useState) {
    console.error('React or React.useState is not available in useAnalytics');
    throw new Error('React hooks are not available. This may be due to a module resolution issue.');
  }
  
  const [isEnabled, setIsEnabled] = React.useState<boolean>(false);
  const [isInitialized, setIsInitialized] = React.useState<boolean>(false);
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [userId, setUserId] = React.useState<string | null>(null);
  const [config, setConfigState] = React.useState<AnalyticsConfig>(analyticsService.getConfig());
  
  const eventHandlersRef = React.useRef<Map<keyof AnalyticsEvents, Function>>(new Map());

  // Initialize analytics on mount
  React.useEffect(() => {
    const initializeAnalytics = async () => {
      try {
        await analyticsService.initialize();
        
        setIsEnabled(true);
        setIsInitialized(true);
        
        const session = analyticsService.getCurrentSession();
        setSessionId(session?.sessionId || null);
        setUserId(session?.userId || null);
        setConfigState(analyticsService.getConfig());

        const handlers = {
          'analytics:event': () => {},
          'analytics:session_start': (session) => {
            setSessionId(session.sessionId);
            setUserId(session.userId || null);
          },
          'analytics:session_end': () => {
            setSessionId(null);
          }
        };

        Object.entries(handlers).forEach(([event, handler]) => {
          analyticsService.on(event as keyof AnalyticsEvents, handler);
          eventHandlersRef.current.set(event as keyof AnalyticsEvents, handler);
        });

      } catch (error) {
        console.error('Failed to initialize analytics:', error);
        setIsEnabled(false);
        setIsInitialized(false);
      }
    };

    initializeAnalytics();

    return () => {
      eventHandlersRef.current.forEach((handler, event) => {
        analyticsService.off(event, handler);
      });
      eventHandlersRef.current.clear();
    };
  }, []);

  // Track custom events
  const track = React.useCallback(async (
    category: EventCategory,
    action: EventAction,
    label?: string,
    value?: number,
    properties?: Record<string, any>
  ): Promise<void> => {
    if (!isEnabled || !isInitialized) return;

    try {
      await analyticsService.track({
        category,
        action,
        label,
        value,
        properties
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }, [isEnabled, isInitialized]);

  // Track page views
  const trackPageView = React.useCallback(async (
    url?: string,
    title?: string,
    properties?: Record<string, any>
  ): Promise<void> => {
    if (!isEnabled || !isInitialized) return;

    try {
      await analyticsService.trackPageView({
        url: url || window.location.href,
        title: title || document.title,
        properties
      });
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  }, [isEnabled, isInitialized]);

  // Track errors
  const trackError = React.useCallback(async (
    error: Error,
    metadata?: Record<string, any>
  ): Promise<void> => {
    if (!isEnabled || !isInitialized) return;

    try {
      await analyticsService.trackError({
        message: error.message,
        stack: error.stack,
        metadata,
        severity: 'medium',
        category: 'javascript'
      });
    } catch (err) {
      console.error('Failed to track error:', err);
    }
  }, [isEnabled, isInitialized]);

  // Track performance metrics
  const trackPerformance = React.useCallback(async (
    metrics: Partial<PerformanceMetrics>
  ): Promise<void> => {
    if (!isEnabled || !isInitialized) return;

    try {
      await analyticsService.trackPerformance(metrics);
    } catch (error) {
      console.error('Failed to track performance:', error);
    }
  }, [isEnabled, isInitialized]);

  // Track conversions
  const trackConversion = React.useCallback(async (
    type: string,
    value?: number,
    properties?: Record<string, any>
  ): Promise<void> => {
    if (!isEnabled || !isInitialized) return;

    try {
      const conversion = ConversionTracker.trackConversion(type, value, 'USD', properties);
      await analyticsService.track({
        category: 'conversion',
        action: 'convert',
        label: type,
        value,
        properties: {
          conversionType: type,
          conversionValue: value,
          ...properties
        }
      });
    } catch (error) {
      console.error('Failed to track conversion:', error);
    }
  }, [isEnabled, isInitialized]);

  // User identification
  const identify = React.useCallback(async (
    userId: string,
    properties?: Record<string, any>
  ): Promise<void> => {
    if (!isEnabled || !isInitialized) return;

    try {
      await analyticsService.identify(userId, properties);
      setUserId(userId);
    } catch (error) {
      console.error('Failed to identify user:', error);
    }
  }, [isEnabled, isInitialized]);

  // Set user properties
  const setUserProperties = React.useCallback(async (
    properties: Record<string, any>
  ): Promise<void> => {
    if (!isEnabled || !isInitialized) return;

    try {
      await analyticsService.setUserProperties(properties);
    } catch (error) {
      console.error('Failed to set user properties:', error);
    }
  }, [isEnabled, isInitialized]);

  // Session management
  const startSession = React.useCallback(async (): Promise<void> => {
    if (!isEnabled || !isInitialized) return;

    try {
      await analyticsService.startSession();
      const session = analyticsService.getCurrentSession();
      setSessionId(session?.sessionId || null);
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  }, [isEnabled, isInitialized]);

  const endSession = React.useCallback(async (): Promise<void> => {
    if (!isEnabled || !isInitialized) return;

    try {
      await analyticsService.endSession();
      setSessionId(null);
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  }, [isEnabled, isInitialized]);

  // Configuration management
  const setConfig = React.useCallback((newConfig: Partial<AnalyticsConfig>): void => {
    try {
      analyticsService.updateConfig(newConfig);
      setConfigState(analyticsService.getConfig());
    } catch (error) {
      console.error('Failed to update config:', error);
    }
  }, []);

  const getConfig = React.useCallback((): AnalyticsConfig => {
    return analyticsService.getConfig();
  }, []);

  // Data access
  const getRealtimeMetrics = React.useCallback(async (): Promise<RealTimeMetrics> => {
    if (!isEnabled || !isInitialized) {
      throw new Error('Analytics not enabled or initialized');
    }

    try {
      return await analyticsService.getRealtimeMetrics();
    } catch (error) {
      console.error('Failed to get realtime metrics:', error);
      throw error;
    }
  }, [isEnabled, isInitialized]);

  const generateReport = React.useCallback(async (
    reportConfig: Partial<AnalyticsReport>
  ): Promise<AnalyticsReport> => {
    if (!isEnabled || !isInitialized) {
      throw new Error('Analytics not enabled or initialized');
    }

    try {
      return await analyticsService.generateReport(reportConfig);
    } catch (error) {
      console.error('Failed to generate report:', error);
      throw error;
    }
  }, [isEnabled, isInitialized]);

  // Event listener management
  const addEventListener = React.useCallback(<K extends keyof AnalyticsEvents>(
    event: K,
    handler: (data: AnalyticsEvents[K]) => void
  ): void => {
    analyticsService.on(event, handler);
  }, []);

  const removeEventListener = React.useCallback(<K extends keyof AnalyticsEvents>(
    event: K,
    handler: (data: AnalyticsEvents[K]) => void
  ): void => {
    analyticsService.off(event, handler);
  }, []);

  return {
    track,
    trackPageView,
    trackError,
    trackPerformance,
    trackConversion,
    identify,
    setUserProperties,
    startSession,
    endSession,
    setConfig,
    getConfig,
    isEnabled,
    isInitialized,
    sessionId,
    userId,
    getRealtimeMetrics,
    generateReport,
    addEventListener,
    removeEventListener
  };
}

// Helper hooks for specific tracking scenarios
export function usePageTracking() {
  const analytics = useAnalytics();
  
  React.useEffect(() => {
    // Track page view on mount
    analytics.trackPageView();
    
    // Track performance metrics
    const trackPerformance = async () => {
      try {
        const metrics = await PerformanceTracker.trackPageLoad();
        analytics.trackPerformance(metrics);
      } catch (error) {
        console.error('Failed to track page performance:', error);
      }
    };
    
    if (document.readyState === 'complete') {
      trackPerformance();
    } else {
      window.addEventListener('load', trackPerformance);
    }

    return () => {
      window.removeEventListener('load', trackPerformance);
    };
  }, [analytics]);
}

export function useClickTracking(elementRef: React.RefObject<HTMLElement>) {
  const analytics = useAnalytics();

  React.useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const trackingEvent = EventTracker.trackClick(target);
      
      analytics.track(
        trackingEvent.category,
        trackingEvent.action,
        trackingEvent.label,
        trackingEvent.value,
        trackingEvent.properties
      );
    };

    element.addEventListener('click', handleClick);

    return () => {
      element.removeEventListener('click', handleClick);
    };
  }, [analytics, elementRef]);
}

export function useErrorTracking() {
  const analytics = useAnalytics();

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      analytics.trackError(new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      analytics.trackError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason))
      );
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [analytics]);
}

export default useAnalytics; 