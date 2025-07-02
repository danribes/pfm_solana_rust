import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../shared/contexts/AuthContext';
import { useWallet } from '../../shared/hooks/useWallet';
import { useWalletContext } from '../../shared/contexts/WalletContext';
import { WalletButton } from '../../shared/components/WalletConnection/WalletButton';
import { WalletModal } from '../../shared/components/WalletConnection/WalletModal';

interface LoginPageProps {}

const LoginPage: React.FC<LoginPageProps> = () => {
  const router = useRouter();
  const { authState, authenticate, generateAuthMessage, clearError } = useAuth();
  const wallet = useWallet();
  const { wallet: walletContext } = useWalletContext();
  
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get redirect URL from query params
  const redirectTo = router.query.redirect as string || '/dashboard';

  // Redirect if already authenticated
  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      router.push(redirectTo);
    }
  }, [authState.isAuthenticated, authState.user, router, redirectTo]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      clearError();
      setError(null);
    };
  }, [clearError]);

  // Handle wallet connection and authentication
  useEffect(() => {
    const handleWalletAuthentication = async () => {
      if (wallet.connected && wallet.publicKey && !authState.isAuthenticated && !isAuthenticating) {
        setIsAuthenticating(true);
        setError(null);
        
        try {
          // Generate authentication message and nonce
          const authMessage = await generateAuthMessage();
          const messageString = `${authMessage.statement}

URI: ${authMessage.uri}
Version: ${authMessage.version}
Nonce: ${authMessage.nonce}
Issued At: ${new Date(authMessage.timestamp).toISOString()}`;

          // Sign the message
          if (!walletContext?.adapter?.signMessage) {
            throw new Error('Wallet does not support message signing');
          }
          
          const messageBytes = new TextEncoder().encode(messageString);
          const signature = await walletContext.adapter.signMessage(messageBytes);

          await authenticate({
            publicKey: wallet.publicKey,
            signature,
            message: messageString,
            nonce: authMessage.nonce
          });
        } catch (err: any) {
          console.error('Authentication failed:', err);
          setError(err.message || 'Authentication failed. Please try again.');
        } finally {
          setIsAuthenticating(false);
        }
      }
    };

    handleWalletAuthentication();
  }, [wallet.connected, wallet.publicKey, authState.isAuthenticated, authenticate, rememberMe, isAuthenticating]);

  const handleConnectWallet = async () => {
    try {
      setError(null);
      if (!wallet.connected) {
        setShowWalletModal(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    }
  };

  const handleDisconnect = async () => {
    try {
      await wallet.disconnect();
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to disconnect wallet');
    }
  };

  const currentError = error || authState.error?.message;

  return (
    <>
      <Head>
        <title>Login - PFM Community</title>
        <meta name="description" content="Sign in to your PFM Community account using your Web3 wallet" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to your account using your Web3 wallet
            </p>
          </div>

          {/* Main Login Card */}
          <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
            <div className="space-y-6">
              
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
                          setError(null);
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
              {(authState.isLoading || isAuthenticating) && (
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

              {/* Wallet Connection Section */}
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Connect Your Wallet
                  </h3>
                  
                  {!wallet.connected ? (
                    <WalletButton
                      onClick={handleConnectWallet}
                      variant="primary"
                      size="lg"
                      className="w-full justify-center"
                      showDropdown={false}
                    />
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-md p-4">
                        <div className="flex items-center">
                          <svg className="h-5 w-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <div className="text-left">
                            <p className="text-sm font-medium text-green-800">
                              Wallet Connected
                            </p>
                            <p className="text-xs text-green-600">
                              {wallet.walletName} • {wallet.shortAddress}
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleDisconnect}
                        className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors text-sm"
                      >
                        Disconnect Wallet
                      </button>
                    </div>
                  )}
                </div>

                {/* Remember Me Option */}
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
              </div>

              {/* Alternative Options */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">New to PFM?</span>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <Link 
                    href="/register" 
                    className="text-blue-600 hover:text-blue-500 font-medium text-sm"
                  >
                    Create a new account
                  </Link>
                </div>
              </div>

              {/* Help Section */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  Need help?{' '}
                  <Link href="/help" className="text-blue-600 hover:text-blue-500">
                    Contact Support
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              🔒 Your wallet signature is used for secure authentication
            </p>
          </div>
        </div>
      </div>

      {/* Wallet Selection Modal */}
      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
      />
    </>
  );
};

export default LoginPage;