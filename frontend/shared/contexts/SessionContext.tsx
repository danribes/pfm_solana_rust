/**
 * Session Context
 * React context for session security and management
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { 
  SessionContextValue,
  SessionState,
  SecurityEvent,
  SessionSecurityStatus,
  ActiveSession,
  SessionAnalytics,
  SecurityRiskLevel
} from '../types/session';
import { AuthUser } from '../types/auth';
import { useSession, UseSessionOptions } from '../hooks/useSession';

// ============================================================================
// Context Creation
// ============================================================================

const SessionContext = createContext<SessionContextValue | null>(null);

// ============================================================================
// Provider Props
// ============================================================================

export interface SessionProviderProps {
  children: ReactNode;
  options?: UseSessionOptions;
  enableDevMode?: boolean;
  onSessionExpired?: () => void;
  onSecurityViolation?: (event: SecurityEvent) => void;
  onCriticalError?: (error: Error) => void;
}

// ============================================================================
// Session Provider Component
// ============================================================================

export function SessionProvider({ 
  children, 
  options = {},
  enableDevMode = false,
  onSessionExpired,
  onSecurityViolation,
  onCriticalError
}: SessionProviderProps) {
  // Enhanced options with context-level handlers
  const enhancedOptions: UseSessionOptions = {
    ...options,
    onSessionExpired: useCallback(() => {
      if (enableDevMode) {
        console.warn('[SessionContext] Session expired');
      }
      onSessionExpired?.();
    }, [onSessionExpired, enableDevMode]),
    
    onSecurityViolation: useCallback((event: SecurityEvent) => {
      if (enableDevMode) {
        console.warn('[SessionContext] Security violation:', event);
      }
      onSecurityViolation?.(event);
    }, [onSecurityViolation, enableDevMode]),
    
    onError: useCallback((error) => {
      if (enableDevMode) {
        console.error('[SessionContext] Session error:', error);
      }
      onCriticalError?.(new Error(error.message));
    }, [onCriticalError, enableDevMode])
  };

  // Use the session hook with enhanced options
  const sessionHook = useSession(enhancedOptions);

  // ============================================================================
  // Context Value Implementation
  // ============================================================================

  const contextValue: SessionContextValue = {
    // State
    sessionState: sessionHook.sessionState,
    
    // Session Management
    initializeSession: useCallback(async (user: AuthUser) => {
      try {
        await sessionHook.initializeSession(user);
        
        if (enableDevMode) {
          console.log('[SessionContext] Session initialized for:', user.walletAddress);
        }
      } catch (error) {
        if (enableDevMode) {
          console.error('[SessionContext] Failed to initialize session:', error);
        }
        throw error;
      }
    }, [sessionHook.initializeSession, enableDevMode]),
    
    refreshSession: useCallback(async () => {
      try {
        const success = await sessionHook.refreshSession();
        
        if (enableDevMode) {
          console.log('[SessionContext] Session refresh:', success ? 'successful' : 'failed');
        }
        
        return success;
      } catch (error) {
        if (enableDevMode) {
          console.error('[SessionContext] Session refresh error:', error);
        }
        return false;
      }
    }, [sessionHook.refreshSession, enableDevMode]),
    
    terminateSession: useCallback(async (sessionId?: string) => {
      try {
        await sessionHook.terminateSession(sessionId);
        
        if (enableDevMode) {
          console.log('[SessionContext] Session terminated:', sessionId || 'current');
        }
      } catch (error) {
        if (enableDevMode) {
          console.error('[SessionContext] Failed to terminate session:', error);
        }
        throw error;
      }
    }, [sessionHook.terminateSession, enableDevMode]),
    
    terminateAllSessions: useCallback(async () => {
      try {
        await sessionHook.terminateAllSessions();
        
        if (enableDevMode) {
          console.log('[SessionContext] All sessions terminated');
        }
      } catch (error) {
        if (enableDevMode) {
          console.error('[SessionContext] Failed to terminate all sessions:', error);
        }
        throw error;
      }
    }, [sessionHook.terminateAllSessions, enableDevMode]),
    
    // Security
    validateSession: useCallback(async () => {
      try {
        const isValid = await sessionHook.validateSession();
        
        if (enableDevMode) {
          console.log('[SessionContext] Session validation:', isValid ? 'valid' : 'invalid');
        }
        
        return isValid;
      } catch (error) {
        if (enableDevMode) {
          console.error('[SessionContext] Session validation error:', error);
        }
        return false;
      }
    }, [sessionHook.validateSession, enableDevMode]),
    
    checkSecurityStatus: useCallback(async () => {
      try {
        const status = await sessionHook.checkSecurityStatus();
        
        if (enableDevMode && status.riskLevel !== SecurityRiskLevel.LOW) {
          console.warn('[SessionContext] Security risk level:', status.riskLevel);
        }
        
        return status;
      } catch (error) {
        if (enableDevMode) {
          console.error('[SessionContext] Security status check error:', error);
        }
        throw error;
      }
    }, [sessionHook.checkSecurityStatus, enableDevMode]),
    
    reportSecurityEvent: useCallback(async (event: Partial<SecurityEvent>) => {
      try {
        await sessionHook.reportSecurityEvent(event);
        
        if (enableDevMode) {
          console.log('[SessionContext] Security event reported:', event.type);
        }
      } catch (error) {
        if (enableDevMode) {
          console.error('[SessionContext] Failed to report security event:', error);
        }
        throw error;
      }
    }, [sessionHook.reportSecurityEvent, enableDevMode]),
    
    // Device Management
    getActiveSessions: useCallback(async () => {
      try {
        await sessionHook.loadActiveSessions();
        return sessionHook.activeSessions;
      } catch (error) {
        if (enableDevMode) {
          console.error('[SessionContext] Failed to get active sessions:', error);
        }
        return [];
      }
    }, [sessionHook.loadActiveSessions, sessionHook.activeSessions, enableDevMode]),
    
    trustDevice: useCallback(async (deviceId: string) => {
      try {
        await sessionHook.trustDevice(deviceId);
        
        if (enableDevMode) {
          console.log('[SessionContext] Device trusted:', deviceId);
        }
      } catch (error) {
        if (enableDevMode) {
          console.error('[SessionContext] Failed to trust device:', error);
        }
        throw error;
      }
    }, [sessionHook.trustDevice, enableDevMode]),
    
    removeDevice: useCallback(async (deviceId: string) => {
      try {
        await sessionHook.removeDevice(deviceId);
        
        if (enableDevMode) {
          console.log('[SessionContext] Device removed:', deviceId);
        }
      } catch (error) {
        if (enableDevMode) {
          console.error('[SessionContext] Failed to remove device:', error);
        }
        throw error;
      }
    }, [sessionHook.removeDevice, enableDevMode]),
    
    // Analytics
    getSessionAnalytics: useCallback(async () => {
      try {
        await sessionHook.loadSessionAnalytics();
        
        if (enableDevMode) {
          console.log('[SessionContext] Session analytics loaded');
        }
        
        return sessionHook.sessionAnalytics;
      } catch (error) {
        if (enableDevMode) {
          console.error('[SessionContext] Failed to get session analytics:', error);
        }
        throw error;
      }
    }, [sessionHook.loadSessionAnalytics, sessionHook.sessionAnalytics, enableDevMode]),
    
    // Utilities
    isSessionValid: useCallback(() => {
      return sessionHook.isSessionValid;
    }, [sessionHook.isSessionValid]),
    
    getTimeRemaining: useCallback(() => {
      return sessionHook.timeRemaining;
    }, [sessionHook.timeRemaining]),
    
    shouldRenewSession: useCallback(() => {
      return sessionHook.shouldRenewSession;
    }, [sessionHook.shouldRenewSession]),
    
    clearError: useCallback(() => {
      sessionHook.clearError();
      
      if (enableDevMode) {
        console.log('[SessionContext] Error cleared');
      }
    }, [sessionHook.clearError, enableDevMode])
  };

  // ============================================================================
  // Dev Mode Effects
  // ============================================================================

  useEffect(() => {
    if (enableDevMode) {
      console.log('[SessionContext] Session state changed:', {
        isActive: sessionHook.sessionState.isActive,
        sessionId: sessionHook.sessionState.sessionId,
        riskLevel: sessionHook.sessionState.securityStatus.riskLevel,
        timeRemaining: sessionHook.timeRemaining
      });
    }
  }, [sessionHook.sessionState, sessionHook.timeRemaining, enableDevMode]);

  // ============================================================================
  // Render Provider
  // ============================================================================

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
}

// ============================================================================
// Context Hook
// ============================================================================

export function useSessionContext(): SessionContextValue {
  const context = useContext(SessionContext);
  
  if (!context) {
    throw new Error('useSessionContext must be used within a SessionProvider');
  }
  
  return context;
}

// ============================================================================
// High-Order Component
// ============================================================================

export interface WithSessionProps {
  session: SessionContextValue;
}

export function withSession<P extends WithSessionProps>(
  Component: React.ComponentType<P>
): React.ComponentType<Omit<P, 'session'>> {
  return function WithSessionComponent(props: Omit<P, 'session'>) {
    const session = useSessionContext();
    
    return <Component {...(props as P)} session={session} />;
  };
}

// ============================================================================
// Session Guard Component
// ============================================================================

export interface SessionGuardProps {
  children: ReactNode;
  requireActive?: boolean;
  requireSecure?: boolean;
  maxRiskLevel?: SecurityRiskLevel;
  fallback?: ReactNode;
  onUnauthorized?: () => void;
}

export function SessionGuard({
  children,
  requireActive = true,
  requireSecure = false,
  maxRiskLevel = SecurityRiskLevel.HIGH,
  fallback = <div>Session validation required</div>,
  onUnauthorized
}: SessionGuardProps) {
  const { sessionState, isSessionValid } = useSessionContext();

  // Check session requirements
  const meetsRequirements = React.useMemo(() => {
    if (requireActive && !sessionState.isActive) {
      return false;
    }
    
    if (requireActive && !isSessionValid()) {
      return false;
    }
    
    if (requireSecure && !sessionState.securityStatus.isSecure) {
      return false;
    }
    
    if (sessionState.securityStatus.riskLevel === SecurityRiskLevel.CRITICAL) {
      return false;
    }
    
    // Convert enum to numeric for comparison
    const riskLevels = {
      [SecurityRiskLevel.LOW]: 0,
      [SecurityRiskLevel.MEDIUM]: 1,
      [SecurityRiskLevel.HIGH]: 2,
      [SecurityRiskLevel.CRITICAL]: 3
    };
    
    if (riskLevels[sessionState.securityStatus.riskLevel] > riskLevels[maxRiskLevel]) {
      return false;
    }
    
    return true;
  }, [sessionState, isSessionValid, requireActive, requireSecure, maxRiskLevel]);

  // Handle unauthorized access
  useEffect(() => {
    if (!meetsRequirements) {
      onUnauthorized?.();
    }
  }, [meetsRequirements, onUnauthorized]);

  if (!meetsRequirements) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// ============================================================================
// Utility Components
// ============================================================================

/**
 * Display session status information
 */
export function SessionStatusDisplay() {
  const { sessionState, getTimeRemaining } = useSessionContext();
  const timeRemaining = getTimeRemaining();

  if (!sessionState.isActive) {
    return <div>No active session</div>;
  }

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  const getRiskLevelColor = (level: SecurityRiskLevel) => {
    switch (level) {
      case SecurityRiskLevel.LOW: return 'green';
      case SecurityRiskLevel.MEDIUM: return 'yellow';
      case SecurityRiskLevel.HIGH: return 'orange';
      case SecurityRiskLevel.CRITICAL: return 'red';
      default: return 'gray';
    }
  };

  return (
    <div style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
      <div><strong>Session ID:</strong> {sessionState.sessionId?.substring(0, 8)}...</div>
      <div><strong>Time Remaining:</strong> {formatTime(timeRemaining)}</div>
      <div>
        <strong>Security Level:</strong> 
        <span style={{ color: getRiskLevelColor(sessionState.securityStatus.riskLevel) }}>
          {sessionState.securityStatus.riskLevel}
        </span>
      </div>
      <div><strong>Device Trusted:</strong> {sessionState.deviceInfo?.trusted ? 'Yes' : 'No'}</div>
    </div>
  );
}

/**
 * Session error display component
 */
export function SessionErrorDisplay() {
  const { sessionState, clearError } = useSessionContext();

  if (!sessionState.error) {
    return null;
  }

  return (
    <div style={{ 
      padding: '12px', 
      backgroundColor: '#fee', 
      border: '1px solid #fcc', 
      borderRadius: '4px',
      margin: '8px 0'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <strong>Session Error:</strong> {sessionState.error.message}
        </div>
        <button onClick={clearError} style={{ marginLeft: '8px' }}>
          Clear
        </button>
      </div>
      {sessionState.error.code && (
        <div style={{ fontSize: '0.9em', color: '#666', marginTop: '4px' }}>
          Code: {sessionState.error.code}
        </div>
      )}
    </div>
  );
} 