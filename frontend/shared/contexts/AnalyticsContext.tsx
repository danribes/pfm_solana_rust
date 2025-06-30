/**
 * Analytics Context
 * 
 * React context provider for global analytics state management.
 * Provides analytics functionality to all child components.
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  AnalyticsConfig,
  UseAnalyticsReturn,
  EventCategory,
  EventAction,
  PerformanceMetrics,
  RealTimeMetrics,
  AnalyticsReport,
  AnalyticsEvents
} from '../types/analytics';

import { useAnalytics } from '../hooks/useAnalytics';

interface AnalyticsContextState extends UseAnalyticsReturn {
  error: Error | null;
  lastEvent: any | null;
  eventCount: number;
}

interface AnalyticsProviderProps {
  children: ReactNode;
  config?: Partial<AnalyticsConfig>;
  onError?: (error: Error) => void;
  onEvent?: (event: any) => void;
}

const AnalyticsContext = createContext<AnalyticsContextState | null>(null);

export function AnalyticsProvider({ 
  children, 
  config,
  onError,
  onEvent 
}: AnalyticsProviderProps) {
  const analytics = useAnalytics();
  const [error, setError] = useState<Error | null>(null);
  const [lastEvent, setLastEvent] = useState<any | null>(null);
  const [eventCount, setEventCount] = useState(0);

  // Initialize analytics with custom config
  useEffect(() => {
    if (config && analytics.setConfig) {
      analytics.setConfig(config);
    }
  }, [config, analytics]);

  // Set up event listening
  useEffect(() => {
    const handleEvent = (event: any) => {
      setLastEvent(event);
      setEventCount(prev => prev + 1);
      onEvent?.(event);
    };

    const handleError = (error: Error) => {
      setError(error);
      onError?.(error);
    };

    // Listen to analytics events
    analytics.addEventListener('analytics:event', handleEvent);
    analytics.addEventListener('analytics:pageview', handleEvent);
    analytics.addEventListener('analytics:error', handleError);
    analytics.addEventListener('analytics:performance', handleEvent);

    return () => {
      analytics.removeEventListener('analytics:event', handleEvent);
      analytics.removeEventListener('analytics:pageview', handleEvent);
      analytics.removeEventListener('analytics:error', handleError);
      analytics.removeEventListener('analytics:performance', handleEvent);
    };
  }, [analytics, onEvent, onError]);

  const contextValue: AnalyticsContextState = {
    ...analytics,
    error,
    lastEvent,
    eventCount
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalyticsContext(): AnalyticsContextState {
  const context = useContext(AnalyticsContext);
  
  if (!context) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  
  return context;
}

export default AnalyticsContext; 