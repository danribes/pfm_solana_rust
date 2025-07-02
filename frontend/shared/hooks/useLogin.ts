import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from './useWallet';
import { AuthUser } from '../types/auth';

interface UseLoginOptions {
  redirectTo?: string;
  autoConnect?: boolean;
  rememberMe?: boolean;
  onSuccess?: (user: AuthUser) => void;
  onError?: (error: string) => void;
}

interface UseLoginReturn {
  // State
  isLoading: boolean;
  isAuthenticating: boolean;
  error: string | null;
  isAuthenticated: boolean;
  user: AuthUser | null;
  
  // Actions
  login: () => Promise<void>;
  logout: () => Promise<void>;
  connectWallet: () => Promise<void>;
  clearError: () => void;
  
  // Wallet state
  walletConnected: boolean;
  walletConnecting: boolean;
  walletAddress: string;
  walletName: string | null;
  
  // Preferences
  rememberMe: boolean;
  setRememberMe: (value: boolean) => void;
}

export const useLogin = (options: UseLoginOptions = {}): UseLoginReturn => {
  const {
    redirectTo = '/dashboard',
    autoConnect = false,
    onSuccess,
    onError
  } = options;

  const router = useRouter();
  const { authenticate, logout: authLogout, authState, clearError: authClearError } = useAuth();
  const wallet = useWallet();

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(options.rememberMe || false);

  // Auto-redirect if authenticated
  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      const redirect = (router.query.redirect as string) || redirectTo;
      router.push(redirect);
    }
  }, [authState.isAuthenticated, authState.user, router, redirectTo]);

  // Auto-connect and authenticate if wallet is connected
  useEffect(() => {
    if (autoConnect && wallet.connected && !authState.isAuthenticated && !isAuthenticating) {
      login();
    }
  }, [autoConnect, wallet.connected, authState.isAuthenticated, isAuthenticating]);

  const connectWallet = useCallback(async (): Promise<void> => {
    try {
      setLocalError(null);
      authClearError();
      
      if (!wallet.connected) {
        await wallet.connect();
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to connect wallet';
      setLocalError(errorMessage);
      onError?.(errorMessage);
      throw error;
    }
  }, [wallet, authClearError, onError]);

  const login = useCallback(async (): Promise<void> => {
    if (!wallet.connected || !wallet.publicKey) {
      const errorMessage = 'Please connect your wallet first';
      setLocalError(errorMessage);
      onError?.(errorMessage);
      throw new Error(errorMessage);
    }

    setIsAuthenticating(true);
    setLocalError(null);
    authClearError();

    try {
      const user = await authenticate({
        publicKey: wallet.publicKey,
        signMessage: async (message: Uint8Array) => {
          if (!wallet.wallet?.adapter?.signMessage) {
            throw new Error('Wallet does not support message signing');
          }
          return await wallet.wallet.adapter.signMessage(message);
        },
        rememberMe
      });

      onSuccess?.(user);
      
      // Redirect to intended page
      const redirect = (router.query.redirect as string) || redirectTo;
      router.push(redirect);
      
    } catch (error: any) {
      const errorMessage = error.message || 'Authentication failed. Please try again.';
      setLocalError(errorMessage);
      onError?.(errorMessage);
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  }, [
    wallet,
    authenticate,
    rememberMe,
    onSuccess,
    onError,
    authClearError,
    router,
    redirectTo
  ]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authLogout();
      router.push('/login');
    } catch (error: any) {
      console.error('Logout failed:', error);
      // Force logout even if backend call fails
      router.push('/login');
    }
  }, [authLogout, router]);

  const clearError = useCallback(() => {
    setLocalError(null);
    authClearError();
  }, [authClearError]);

  const currentError = localError || authState.error?.message || null;

  return {
    // State
    isLoading: authState.isLoading,
    isAuthenticating,
    error: currentError,
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    
    // Actions
    login,
    logout,
    connectWallet,
    clearError,
    
    // Wallet state
    walletConnected: wallet.connected,
    walletConnecting: wallet.connecting,
    walletAddress: wallet.address,
    walletName: wallet.walletName,
    
    // Preferences
    rememberMe,
    setRememberMe
  };
};

export default useLogin;