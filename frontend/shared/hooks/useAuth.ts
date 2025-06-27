/**
 * useAuth Hook
 * Custom React hook providing simplified authentication functionality
 */

import { useCallback, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useAuth as useAuthContext } from '../contexts/AuthContext';
import { useWallet } from './useWallet';
import { 
  AuthUser, 
  AuthError, 
  AuthErrorCode, 
  UserRole,
  AuthMessage,
  AuthenticateParams 
} from '../types/auth';
import { createAuthMessageString } from '../services/auth';

// ============================================================================
// Enhanced Auth Hook
// ============================================================================

export interface UseAuthReturn {
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  error: AuthError | null;
  
  // Authentication actions
  signInWithWallet: () => Promise<AuthUser>;
  signOut: (allSessions?: boolean) => Promise<void>;
  refreshAuth: () => Promise<void>;
  
  // Permission checking
  hasPermission: (resource: string, action: string) => boolean;
  hasRole: (role: UserRole) => boolean;
  isAdmin: boolean;
  isMember: boolean;
  
  // Utilities
  clearError: () => void;
  validateCurrentSession: () => Promise<boolean>;
  
  // Wallet integration
  connectAndAuthenticate: () => Promise<AuthUser>;
  isWalletConnected: boolean;
}

export function useAuth(): UseAuthReturn {
  const authContext = useAuthContext();
  const wallet = useWallet();
  const [isSigningIn, setIsSigningIn] = useState(false);

  // ============================================================================
  // Authentication Actions
  // ============================================================================

  const signInWithWallet = useCallback(async (): Promise<AuthUser> => {
    if (!wallet.connected || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    if (!wallet.wallet?.adapter?.signMessage) {
      throw new Error('Wallet does not support message signing');
    }

    setIsSigningIn(true);

    try {
      // Generate authentication message
      const authMessage = await authContext.generateAuthMessage();
      const messageString = createAuthMessageString(authMessage);
      
      // Request signature from wallet
      const messageBytes = new TextEncoder().encode(messageString);
      const signature = await wallet.wallet!.adapter.signMessage!(messageBytes);

      // Authenticate with the service
      const authenticateParams: AuthenticateParams = {
        publicKey: wallet.publicKey,
        signature,
        message: messageString,
        nonce: authMessage.nonce
      };

      const user = await authContext.authenticate(authenticateParams);
      return user;
    } catch (error: any) {
      console.error('Sign in failed:', error);
      throw error;
    } finally {
      setIsSigningIn(false);
    }
  }, [wallet, authContext]);

  const signOut = useCallback(async (allSessions: boolean = false): Promise<void> => {
    try {
      await authContext.logout();
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
  }, [authContext]);

  const refreshAuth = useCallback(async (): Promise<void> => {
    try {
      await authContext.refreshSession();
    } catch (error) {
      console.error('Auth refresh failed:', error);
      throw error;
    }
  }, [authContext]);

  const connectAndAuthenticate = useCallback(async (): Promise<AuthUser> => {
    try {
      // First connect wallet if not connected
      if (!wallet.connected) {
        await wallet.connect();
      }

      // Wait a moment for wallet connection to settle
      await new Promise(resolve => setTimeout(resolve, 500));

      // Then authenticate
      return await signInWithWallet();
    } catch (error: any) {
      console.error('Connect and authenticate failed:', error);
      throw error;
    }
  }, [wallet, signInWithWallet]);

  // ============================================================================
  // Permission and Role Checking
  // ============================================================================

  const hasPermission = useCallback((resource: string, action: string): boolean => {
    return authContext.checkPermission(resource, action);
  }, [authContext]);

  const hasRole = useCallback((role: UserRole): boolean => {
    return authContext.hasRole(role);
  }, [authContext]);

  const isAdmin = hasRole(UserRole.ADMIN);
  const isMember = hasRole(UserRole.MEMBER) || isAdmin;

  // ============================================================================
  // Utilities
  // ============================================================================

  const clearError = useCallback(() => {
    authContext.clearError();
  }, [authContext]);

  const validateCurrentSession = useCallback(async (): Promise<boolean> => {
    try {
      return await authContext.validateSession();
    } catch (error) {
      console.error('Session validation failed:', error);
      return false;
    }
  }, [authContext]);

  // ============================================================================
  // Return Hook Interface
  // ============================================================================

  return {
    // State
    isAuthenticated: authContext.authState.isAuthenticated,
    isLoading: authContext.authState.isLoading || isSigningIn,
    user: authContext.authState.user,
    error: authContext.authState.error,
    
    // Authentication actions
    signInWithWallet,
    signOut,
    refreshAuth,
    
    // Permission checking
    hasPermission,
    hasRole,
    isAdmin,
    isMember,
    
    // Utilities
    clearError,
    validateCurrentSession,
    
    // Wallet integration
    connectAndAuthenticate,
    isWalletConnected: wallet.connected
  };
}

// ============================================================================
// Specialized Hooks
// ============================================================================

/**
 * Hook for components that require authentication
 */
export function useRequireAuth(): UseAuthReturn {
  const auth = useAuth();
  
  if (!auth.isAuthenticated && !auth.isLoading) {
    throw new Error('Authentication required. Please sign in with your wallet.');
  }
  
  return auth;
}

/**
 * Hook for admin-only components
 */
export function useRequireAdmin(): UseAuthReturn {
  const auth = useRequireAuth();
  
  if (!auth.isAdmin) {
    throw new Error('Admin access required.');
  }
  
  return auth;
}

/**
 * Hook for checking specific permissions
 */
export function usePermission(resource: string, action: string): {
  hasPermission: boolean;
  checkPermission: () => boolean;
  user: AuthUser | null;
} {
  const auth = useAuth();
  
  const hasPermission = auth.hasPermission(resource, action);
  const checkPermission = useCallback(() => auth.hasPermission(resource, action), [auth, resource, action]);
  
  return {
    hasPermission,
    checkPermission,
    user: auth.user
  };
}

/**
 * Hook for role-based access control
 */
export function useRole(requiredRole: UserRole): {
  hasRole: boolean;
  checkRole: () => boolean;
  currentRole: UserRole | null;
} {
  const auth = useAuth();
  
  const hasRole = auth.hasRole(requiredRole);
  const checkRole = useCallback(() => auth.hasRole(requiredRole), [auth, requiredRole]);
  const currentRole = auth.user?.role || null;
  
  return {
    hasRole,
    checkRole,
    currentRole
  };
}

/**
 * Hook for authentication state monitoring
 */
export function useAuthState(): {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
  user: AuthUser | null;
  sessionId: string | null;
  expiresAt: Date | null;
} {
  const { authState } = useAuthContext();
  
  return {
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,
    user: authState.user,
    sessionId: authState.sessionId,
    expiresAt: authState.expiresAt
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create authentication error
 */
export function createAuthError(
  code: AuthErrorCode = AuthErrorCode.AUTHENTICATION_FAILED,
  message: string = 'Authentication failed',
  details?: any
): AuthError {
  return {
    code,
    message,
    details,
    timestamp: new Date()
  };
}

/**
 * Check if error is authentication related
 */
export function isAuthError(error: any): error is AuthError {
  return error && typeof error === 'object' && 'code' in error && 'timestamp' in error;
}

/**
 * Get user display name or fallback
 */
export function getUserDisplayName(user: AuthUser | null): string {
  if (!user) return 'Anonymous';
  if (user.displayName) return user.displayName;
  return `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`;
}

/**
 * Format role name for display
 */
export function formatRole(role: UserRole): string {
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
} 