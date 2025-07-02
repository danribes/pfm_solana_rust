import React, { useState, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useAuth } from '../../contexts/AuthContext';
import { useWallet } from '../../hooks/useWallet';
import { WalletButton } from '../WalletConnection/WalletButton';

interface LoginFormProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
  redirectTo?: string;
  className?: string;
  showRememberMe?: boolean;
  autoConnect?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onError,
  redirectTo = '/dashboard',
  className = '',
  showRememberMe = true,
  autoConnect = false
}) => {
  const { authenticate, authState, clearError } = useAuth();
  const wallet = useWallet();
  
  const [rememberMe, setRememberMe] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleAuthentication = useCallback(async () => {
    if (!wallet.connected || !wallet.publicKey) {
      setLocalError('Please connect your wallet first');
      onError?.('Please connect your wallet first');
      return;
    }

    setIsAuthenticating(true);
    setLocalError(null);
    clearError();

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
    } catch (error: any) {
      const errorMessage = error.message || 'Authentication failed. Please try again.';
      setLocalError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsAuthenticating(false);
    }
  }, [wallet, authenticate, rememberMe, onSuccess, onError, clearError]);

  const handleWalletConnect = useCallback(async () => {
    try {
      setLocalError(null);
      if (!wallet.connected) {
        await wallet.connect();
      }
      
      if (autoConnect && wallet.connected) {
        await handleAuthentication();
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to connect wallet';
      setLocalError(errorMessage);
      onError?.(errorMessage);
    }
  }, [wallet, autoConnect, handleAuthentication, onError]);

  const currentError = localError || authState.error?.message;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Error Display */}
      {currentError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{currentError}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => {
                  setLocalError(null);
                  clearError();
                }}
                className="text-red-400 hover:text-red-600"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {(authState.isLoading || isAuthenticating || wallet.connecting) && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-center">
            <div className="animate-spin h-5 w-5 text-blue-600 mr-3">
              <div className="h-full w-full border-2 border-current border-t-transparent rounded-full" />
            </div>
            <p className="text-sm text-blue-800">
              {wallet.connecting ? 'Connecting to wallet...' : 
               isAuthenticating ? 'Authenticating...' : 'Loading...'}
            </p>
          </div>
        </div>
      )}

      {/* Wallet Connection */}
      <div className="space-y-4">
        {!wallet.connected ? (
          <div className="text-center">
            <WalletButton
              onClick={handleWalletConnect}
              variant="primary"
              size="lg"
              className="w-full justify-center"
              showDropdown={false}
            />
            <p className="mt-2 text-xs text-gray-500">
              Connect your Web3 wallet to sign in
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Connected Wallet Display */}
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      {wallet.walletName || 'Wallet'} Connected
                    </p>
                    <p className="text-xs text-green-600 font-mono">
                      {wallet.shortAddress}
                    </p>
                  </div>
                </div>
                <button
                  onClick={wallet.disconnect}
                  className="text-green-600 hover:text-green-800 text-sm"
                >
                  Disconnect
                </button>
              </div>
            </div>

            {/* Authentication Button */}
            {!authState.isAuthenticated && (
              <button
                onClick={handleAuthentication}
                disabled={isAuthenticating || authState.isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isAuthenticating ? 'Authenticating...' : 'Sign Message to Login'}
              </button>
            )}
          </div>
        )}

        {/* Remember Me Option */}
        {showRememberMe && wallet.connected && (
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Keep me signed in
            </label>
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          🔒 Secure authentication using wallet signature verification
        </p>
      </div>
    </div>
  );
};

export default LoginForm;