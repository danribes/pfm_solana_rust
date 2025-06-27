/**
 * Authentication Context
 * React context for managing authentication state and providing auth functionality
 */

import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import {
  AuthContextValue,
  AuthState,
  AuthUser,
  AuthMessage,
  AuthError,
  AuthErrorCode,
  UserRole,
  AuthenticateParams
} from '../types/auth';
import { useWallet } from '../hooks/useWallet';
import { authService, createAuthMessageString } from '../services/auth';
import { sessionManager } from '../utils/session';

// ============================================================================
// Auth State Management
// ============================================================================

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: AuthUser }
  | { type: 'AUTH_ERROR'; payload: AuthError }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'SESSION_REFRESH'; payload: AuthUser }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  error: null,
  sessionId: null,
  expiresAt: null
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.payload,
        error: null,
        sessionId: sessionManager.getSessionId(),
        expiresAt: sessionManager.getSessionExpiry()
      };

    case 'AUTH_ERROR':
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: action.payload,
        sessionId: null,
        expiresAt: null
      };

    case 'AUTH_LOGOUT':
      return {
        ...initialState
      };

    case 'SESSION_REFRESH':
      return {
        ...state,
        user: action.payload,
        sessionId: sessionManager.getSessionId(),
        expiresAt: sessionManager.getSessionExpiry()
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
}

// ============================================================================
// Authentication Context
// ============================================================================

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const wallet = useWallet();

  // ============================================================================
  // Authentication Methods
  // ============================================================================

  const authenticate = useCallback(async (params: AuthenticateParams): Promise<AuthUser> => {
    dispatch({ type: 'AUTH_START' });

    try {
      // Convert wallet hook return to context value format
      const walletContextValue = {
        ...wallet,
        preferences: { autoConnect: true, lastConnectedWallet: null, networkPreference: 'devnet' as const },
        updatePreferences: () => {},
        networkInfo: { name: 'devnet', endpoint: 'https://api.devnet.solana.com', chainId: 'devnet', displayName: 'Devnet' },
        switchNetwork: async () => {},
        wallet: wallet.wallet,
        supportedWallets: []
      };
      const user = await authService.authenticate(walletContextValue, params);
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
      return user;
    } catch (error: any) {
      const authError: AuthError = {
        code: error.code || AuthErrorCode.AUTHENTICATION_FAILED,
        message: error.message || 'Authentication failed',
        details: error,
        timestamp: new Date()
      };
      dispatch({ type: 'AUTH_ERROR', payload: authError });
      throw error;
    }
  }, [wallet]);

  const logout = useCallback(async (params?: { allSessions?: boolean }): Promise<void> => {
    try {
      await authService.logout(params?.allSessions);
      dispatch({ type: 'AUTH_LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if backend call fails
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  }, []);

  const refreshSession = useCallback(async (): Promise<void> => {
    try {
      const session = await authService.refreshSession();
      if (session) {
        const userData = sessionManager.getUserData();
        if (userData) {
          dispatch({ type: 'SESSION_REFRESH', payload: userData });
        }
      }
    } catch (error) {
      console.error('Session refresh failed:', error);
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  }, []);

  const generateAuthMessage = useCallback(async (): Promise<AuthMessage> => {
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }
    return authService.generateAuthMessage(wallet.publicKey);
  }, [wallet.publicKey]);

  const validateSession = useCallback(async (): Promise<boolean> => {
    try {
      const validation = await authService.validateSession();
      if (validation.valid && validation.user) {
        dispatch({ type: 'SESSION_REFRESH', payload: validation.user });
        
        if (validation.shouldRefresh) {
          await refreshSession();
        }
        
        return true;
      } else {
        dispatch({ type: 'AUTH_LOGOUT' });
        return false;
      }
    } catch (error) {
      console.error('Session validation failed:', error);
      dispatch({ type: 'AUTH_LOGOUT' });
      return false;
    }
  }, [refreshSession]);

  // ============================================================================
  // Permission and Role Checking
  // ============================================================================

  const checkPermission = useCallback((resource: string, action: string): boolean => {
    if (!state.user) return false;
    return authService.checkPermission(state.user, resource, action);
  }, [state.user]);

  const hasRole = useCallback((role: UserRole): boolean => {
    if (!state.user) return false;
    return authService.hasRole(state.user, role);
  }, [state.user]);

  // ============================================================================
  // Utility Methods
  // ============================================================================

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Auto-connect and session validation on mount
  useEffect(() => {
    const initializeAuth = async () => {
      // Check if there's an existing valid session
      const isValid = await validateSession();
      
      if (!isValid && wallet.connected && wallet.publicKey) {
        // Wallet is connected but no valid session - user needs to authenticate
        console.log('Wallet connected but no valid session found');
      }
    };

    initializeAuth();
  }, [wallet.connected, validateSession]);

  // Session activity tracking
  useEffect(() => {
    if (state.isAuthenticated) {
      const updateActivity = () => {
        sessionManager.updateLastActivity();
      };

      // Track user activity
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      events.forEach(event => {
        document.addEventListener(event, updateActivity, { passive: true });
      });

      return () => {
        events.forEach(event => {
          document.removeEventListener(event, updateActivity);
        });
      };
    }
  }, [state.isAuthenticated]);

  // Session expiry monitoring
  useEffect(() => {
    if (state.isAuthenticated && state.expiresAt) {
      const checkExpiry = () => {
        const now = new Date();
        const expiresAt = state.expiresAt!;
        
        // Check if session is about to expire (5 minutes before)
        const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
        
        if (fiveMinutesFromNow >= expiresAt) {
          refreshSession();
        }
        
        // Check if session has expired
        if (now >= expiresAt) {
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      };

      const interval = setInterval(checkExpiry, 60 * 1000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [state.isAuthenticated, state.expiresAt, refreshSession]);

  // Listen for session events from other tabs
  useEffect(() => {
    const handleSessionEvent = (event: CustomEvent) => {
      switch (event.type) {
        case 'pfm:session:cleared':
          dispatch({ type: 'AUTH_LOGOUT' });
          break;
        case 'pfm:session:set':
          validateSession();
          break;
      }
    };

    window.addEventListener('pfm:session:cleared', handleSessionEvent as EventListener);
    window.addEventListener('pfm:session:set', handleSessionEvent as EventListener);

    return () => {
      window.removeEventListener('pfm:session:cleared', handleSessionEvent as EventListener);
      window.removeEventListener('pfm:session:set', handleSessionEvent as EventListener);
    };
  }, [validateSession]);

  // ============================================================================
  // Context Value
  // ============================================================================

  const contextValue: AuthContextValue = {
    authState: state,
    authenticate,
    logout,
    refreshSession,
    checkPermission,
    hasRole,
    generateAuthMessage,
    validateSession,
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================================
// Context Hook
// ============================================================================

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ============================================================================
// Higher-Order Components
// ============================================================================

export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function WithAuthComponent(props: P) {
    return (
      <AuthProvider>
        <Component {...props} />
      </AuthProvider>
    );
  };
}

// ============================================================================
// Auth Status Helper Component
// ============================================================================

export function AuthStatus(): JSX.Element {
  const { authState } = useAuth();
  const wallet = useWallet();

  if (authState.isLoading) {
    return <div>Authenticating...</div>;
  }

  if (authState.error) {
    return (
      <div style={{ color: 'red' }}>
        Authentication Error: {authState.error.message}
      </div>
    );
  }

  if (authState.isAuthenticated && authState.user) {
    return (
      <div style={{ color: 'green' }}>
        Authenticated as {authState.user.role}: {authState.user.walletAddress.slice(0, 8)}...
      </div>
    );
  }

  if (wallet.connected) {
    return <div style={{ color: 'orange' }}>Wallet connected, authentication required</div>;
  }

  return <div>Not authenticated</div>;
} 