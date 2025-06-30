/**
 * useSession Hook
 * React hook for session security and management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  SessionState,
  SessionSecurityStatus,
  ActiveSession,
  SessionAnalytics,
  SecurityEvent,
  SessionError,
  SecurityRiskLevel
} from '../types/session';
import { AuthUser } from '../types/auth';
import { sessionService } from '../services/session';

// ============================================================================
// Hook Return Type
// ============================================================================

export interface UseSessionReturn {
  // State
  sessionState: SessionState;
  isLoading: boolean;
  error: SessionError | null;
  
  // Session management
  initializeSession: (user: AuthUser) => Promise<void>;
  refreshSession: () => Promise<boolean>;
  terminateSession: (sessionId?: string) => Promise<void>;
  terminateAllSessions: () => Promise<void>;
  
  // Session validation
  validateSession: () => Promise<boolean>;
  isSessionValid: boolean;
  timeRemaining: number;
  shouldRenewSession: boolean;
  
  // Security
  securityStatus: SessionSecurityStatus;
  checkSecurityStatus: () => Promise<SessionSecurityStatus>;
  reportSecurityEvent: (event: Partial<SecurityEvent>) => Promise<void>;
  
  // Device management
  activeSessions: ActiveSession[];
  loadActiveSessions: () => Promise<void>;
  trustDevice: (deviceId: string) => Promise<void>;
  removeDevice: (deviceId: string) => Promise<void>;
  
  // Analytics
  sessionAnalytics: SessionAnalytics | null;
  loadSessionAnalytics: () => Promise<void>;
  
  // Utilities
  clearError: () => void;
  forceRefresh: () => void;
}

// ============================================================================
// Hook Options
// ============================================================================

export interface UseSessionOptions {
  // Auto-refresh configuration
  autoRefresh?: boolean;
  refreshInterval?: number;
  refreshThreshold?: number;
  
  // Security monitoring
  enableSecurityMonitoring?: boolean;
  securityCheckInterval?: number;
  
  // Data loading
  autoLoadActiveSessions?: boolean;
  autoLoadAnalytics?: boolean;
  
  // Error handling
  onError?: (error: SessionError) => void;
  onSessionExpired?: () => void;
  onSecurityViolation?: (event: SecurityEvent) => void;
  
  // Session events
  onSessionCreated?: (sessionId: string) => void;
  onSessionTerminated?: (sessionId: string) => void;
  onSessionRefreshed?: () => void;
}

// ============================================================================
// Default Options
// ============================================================================

const DEFAULT_OPTIONS: UseSessionOptions = {
  autoRefresh: true,
  refreshInterval: 5 * 60 * 1000, // 5 minutes
  refreshThreshold: 30 * 60 * 1000, // 30 minutes
  enableSecurityMonitoring: true,
  securityCheckInterval: 60 * 1000, // 1 minute
  autoLoadActiveSessions: false,
  autoLoadAnalytics: false
};

// ============================================================================
// useSession Hook
// ============================================================================

export function useSession(options: UseSessionOptions = {}): UseSessionReturn {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // State
  const [sessionState, setSessionState] = useState<SessionState>(sessionService.getState());
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [sessionAnalytics, setSessionAnalytics] = useState<SessionAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs for timers and cleanup
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const securityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stateUpdateRef = useRef<number>(0);

  // Derived state
  const isSessionValid = sessionService.isSessionValid();
  const timeRemaining = sessionService.getTimeRemaining();
  const shouldRenewSession = sessionService.shouldRenewSession();
  const securityStatus = sessionState.securityStatus;
  const error = sessionState.error;

  // ============================================================================
  // Session Management Functions
  // ============================================================================

  const initializeSession = useCallback(async (user: AuthUser): Promise<void> => {
    try {
      setIsLoading(true);
      await sessionService.initializeSession(user);
      
      // Update local state
      setSessionState(sessionService.getState());
      
      // Load additional data if configured
      if (opts.autoLoadActiveSessions) {
        await loadActiveSessions();
      }
      
      if (opts.autoLoadAnalytics) {
        await loadSessionAnalytics();
      }
      
      // Trigger callback
      opts.onSessionCreated?.(sessionService.getState().sessionId || '');
      
    } catch (error) {
      const sessionError = error as SessionError;
      opts.onError?.(sessionError);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [opts]);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const success = await sessionService.refreshSession();
      
      // Update local state
      setSessionState(sessionService.getState());
      
      if (success) {
        opts.onSessionRefreshed?.();
      }
      
      return success;
    } catch (error) {
      const sessionError = error as SessionError;
      opts.onError?.(sessionError);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [opts]);

  const terminateSession = useCallback(async (sessionId?: string): Promise<void> => {
    try {
      setIsLoading(true);
      await sessionService.terminateSession(sessionId);
      
      // Update local state
      setSessionState(sessionService.getState());
      
      // Clear timers if terminating current session
      if (!sessionId || sessionId === sessionState.sessionId) {
        if (refreshTimerRef.current) {
          clearInterval(refreshTimerRef.current);
          refreshTimerRef.current = null;
        }
        if (securityTimerRef.current) {
          clearInterval(securityTimerRef.current);
          securityTimerRef.current = null;
        }
      }
      
      opts.onSessionTerminated?.(sessionId || sessionState.sessionId || '');
      
    } catch (error) {
      const sessionError = error as SessionError;
      opts.onError?.(sessionError);
    } finally {
      setIsLoading(false);
    }
  }, [opts, sessionState.sessionId]);

  const terminateAllSessions = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      await sessionService.terminateAllSessions();
      
      // Update local state
      setSessionState(sessionService.getState());
      setActiveSessions([]);
      
      // Clear timers
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      if (securityTimerRef.current) {
        clearInterval(securityTimerRef.current);
        securityTimerRef.current = null;
      }
      
    } catch (error) {
      const sessionError = error as SessionError;
      opts.onError?.(sessionError);
    } finally {
      setIsLoading(false);
    }
  }, [opts]);

  // ============================================================================
  // Session Validation Functions
  // ============================================================================

  const validateSession = useCallback(async (): Promise<boolean> => {
    try {
      const isValid = await sessionService.validateSession();
      
      // Update local state
      setSessionState(sessionService.getState());
      
      if (!isValid) {
        opts.onSessionExpired?.();
      }
      
      return isValid;
    } catch (error) {
      const sessionError = error as SessionError;
      opts.onError?.(sessionError);
      return false;
    }
  }, [opts]);

  // ============================================================================
  // Security Functions
  // ============================================================================

  const checkSecurityStatus = useCallback(async (): Promise<SessionSecurityStatus> => {
    try {
      const status = await sessionService.checkSecurityStatus();
      
      // Update local state
      setSessionState(sessionService.getState());
      
      // Check for critical security issues
      if (status.riskLevel === SecurityRiskLevel.CRITICAL) {
        const criticalEvent = status.recentSecurityEvents.find(
          event => event.severity === 'CRITICAL'
        );
        if (criticalEvent) {
          opts.onSecurityViolation?.(criticalEvent);
        }
      }
      
      return status;
    } catch (error) {
      const sessionError = error as SessionError;
      opts.onError?.(sessionError);
      return sessionState.securityStatus;
    }
  }, [opts, sessionState.securityStatus]);

  const reportSecurityEvent = useCallback(async (event: Partial<SecurityEvent>): Promise<void> => {
    try {
      await sessionService.reportSecurityEvent(event);
      
      // Update local state
      setSessionState(sessionService.getState());
      
      // Trigger callback if it's a security violation
      if (event.severity === 'CRITICAL') {
        opts.onSecurityViolation?.(event as SecurityEvent);
      }
      
    } catch (error) {
      const sessionError = error as SessionError;
      opts.onError?.(sessionError);
    }
  }, [opts]);

  // ============================================================================
  // Device Management Functions
  // ============================================================================

  const loadActiveSessions = useCallback(async (): Promise<void> => {
    try {
      const sessions = await sessionService.getActiveSessions();
      setActiveSessions(sessions);
    } catch (error) {
      const sessionError = error as SessionError;
      opts.onError?.(sessionError);
    }
  }, [opts]);

  const trustDevice = useCallback(async (deviceId: string): Promise<void> => {
    try {
      await sessionService.trustDevice(deviceId);
      
      // Reload active sessions to reflect changes
      await loadActiveSessions();
      
    } catch (error) {
      const sessionError = error as SessionError;
      opts.onError?.(sessionError);
    }
  }, [opts, loadActiveSessions]);

  const removeDevice = useCallback(async (deviceId: string): Promise<void> => {
    try {
      await sessionService.removeDevice(deviceId);
      
      // Reload active sessions to reflect changes
      await loadActiveSessions();
      
    } catch (error) {
      const sessionError = error as SessionError;
      opts.onError?.(sessionError);
    }
  }, [opts, loadActiveSessions]);

  // ============================================================================
  // Analytics Functions
  // ============================================================================

  const loadSessionAnalytics = useCallback(async (): Promise<void> => {
    try {
      const analytics = await sessionService.getSessionAnalytics();
      setSessionAnalytics(analytics);
    } catch (error) {
      const sessionError = error as SessionError;
      opts.onError?.(sessionError);
    }
  }, [opts]);

  // ============================================================================
  // Utility Functions
  // ============================================================================

  const clearError = useCallback((): void => {
    sessionService.clearError();
    setSessionState(sessionService.getState());
  }, []);

  const forceRefresh = useCallback((): void => {
    stateUpdateRef.current += 1;
    setSessionState(sessionService.getState());
  }, []);

  // ============================================================================
  // Effects
  // ============================================================================

  // Effect: Setup auto-refresh timer
  useEffect(() => {
    if (!opts.autoRefresh || !sessionState.isActive) {
      return;
    }

    const startAutoRefresh = () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }

      refreshTimerRef.current = setInterval(async () => {
        if (shouldRenewSession) {
          await refreshSession();
        }
      }, opts.refreshInterval);
    };

    startAutoRefresh();

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [opts.autoRefresh, opts.refreshInterval, sessionState.isActive, shouldRenewSession, refreshSession]);

  // Effect: Setup security monitoring
  useEffect(() => {
    if (!opts.enableSecurityMonitoring || !sessionState.isActive) {
      return;
    }

    const startSecurityMonitoring = () => {
      if (securityTimerRef.current) {
        clearInterval(securityTimerRef.current);
      }

      securityTimerRef.current = setInterval(async () => {
        await checkSecurityStatus();
      }, opts.securityCheckInterval);
    };

    startSecurityMonitoring();

    return () => {
      if (securityTimerRef.current) {
        clearInterval(securityTimerRef.current);
        securityTimerRef.current = null;
      }
    };
  }, [opts.enableSecurityMonitoring, opts.securityCheckInterval, sessionState.isActive, checkSecurityStatus]);

  // Effect: Listen for session state changes
  useEffect(() => {
    const handleStateChange = () => {
      setSessionState(sessionService.getState());
    };

    // Setup interval to check for state changes
    const stateCheckInterval = setInterval(handleStateChange, 1000);

    return () => {
      clearInterval(stateCheckInterval);
    };
  }, [stateUpdateRef.current]);

  // Effect: Load initial data
  useEffect(() => {
    if (sessionState.isActive) {
      if (opts.autoLoadActiveSessions) {
        loadActiveSessions();
      }
      
      if (opts.autoLoadAnalytics) {
        loadSessionAnalytics();
      }
    }
  }, [sessionState.isActive, opts.autoLoadActiveSessions, opts.autoLoadAnalytics, loadActiveSessions, loadSessionAnalytics]);

  // ============================================================================
  // Cleanup on unmount
  // ============================================================================

  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
      if (securityTimerRef.current) {
        clearInterval(securityTimerRef.current);
      }
    };
  }, []);

  // ============================================================================
  // Return Hook Interface
  // ============================================================================

  return {
    // State
    sessionState,
    isLoading,
    error,
    
    // Session management
    initializeSession,
    refreshSession,
    terminateSession,
    terminateAllSessions,
    
    // Session validation
    validateSession,
    isSessionValid,
    timeRemaining,
    shouldRenewSession,
    
    // Security
    securityStatus,
    checkSecurityStatus,
    reportSecurityEvent,
    
    // Device management
    activeSessions,
    loadActiveSessions,
    trustDevice,
    removeDevice,
    
    // Analytics
    sessionAnalytics,
    loadSessionAnalytics,
    
    // Utilities
    clearError,
    forceRefresh
  };
}

// ============================================================================
// Convenience Hooks
// ============================================================================

/**
 * Simple session hook with minimal configuration
 */
export function useSessionSimple() {
  return useSession({
    autoRefresh: true,
    enableSecurityMonitoring: false,
    autoLoadActiveSessions: false,
    autoLoadAnalytics: false
  });
}

/**
 * Security-focused session hook
 */
export function useSessionSecurity() {
  return useSession({
    autoRefresh: true,
    enableSecurityMonitoring: true,
    securityCheckInterval: 30 * 1000, // 30 seconds
    autoLoadActiveSessions: true,
    autoLoadAnalytics: false
  });
}

/**
 * Admin session hook with full monitoring
 */
export function useSessionAdmin() {
  return useSession({
    autoRefresh: true,
    enableSecurityMonitoring: true,
    securityCheckInterval: 30 * 1000, // 30 seconds
    autoLoadActiveSessions: true,
    autoLoadAnalytics: true,
    refreshInterval: 2 * 60 * 1000 // 2 minutes
  });
} 