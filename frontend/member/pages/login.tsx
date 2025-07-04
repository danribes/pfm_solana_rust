import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
// Temporarily comment out shared imports
// import { useAuth } from '../../shared/contexts/AuthContext';
// import { useWallet } from '../../shared/hooks/useWallet';
// import { useWalletContext } from '../../shared/contexts/WalletContext';
// import { WalletButton } from '../../shared/components/WalletConnection/WalletButton';
// import { WalletModal } from '../../shared/components/WalletConnection/WalletModal';

interface LoginPageProps {}

const LoginPage: React.FC<LoginPageProps> = () => {
  const router = useRouter();
  // Temporarily comment out shared hooks
  // const { authState, authenticate, generateAuthMessage, clearError } = useAuth();
  // const wallet = useWallet();
  // const { wallet: walletContext } = useWalletContext();
  
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get redirect URL from query params
  const redirectTo = router.query.redirect as string || '/dashboard';

  // Temporarily comment out all shared functionality
  /*
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
  */

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
              
              {/* Temporary Message */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800">
                      Wallet connection temporarily disabled for maintenance.
                    </p>
                  </div>
                </div>
              </div>

              {/* Wallet Connection Section */}
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Connect Your Wallet
                  </h3>
                  
                  <button
                    disabled
                    className="w-full bg-gray-300 text-gray-500 py-3 px-4 rounded-md cursor-not-allowed text-sm font-medium"
                  >
                    Wallet Connection Unavailable
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Temporarily comment out wallet modal */}
      {/* {showWalletModal && (
        <WalletModal
          isOpen={showWalletModal}
          onClose={() => setShowWalletModal(false)}
        />
      )} */}
    </>
  );
};

export default LoginPage;