import React, { useState } from 'react';
import Head from 'next/head';
import { 
  WalletConnectionProvider, 
  WalletButton, 
  WalletModal, 
  WalletStatus, 
  useWallet 
} from '../../shared/components/WalletConnection';

// Test component that shows wallet functionality
const WalletTestComponent: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    connected,
    connecting,
    publicKey,
    walletName,
    connect,
    disconnect,
    supportedWallets,
    installedWallets,
    networkName,
    error
  } = useWallet();

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Disconnection failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Wallet Connection Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Wallet Connection Test</h2>
        <WalletStatus variant="full" showNetwork={true} showAddress={true} />
      </div>

      {/* Connection Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Connection Controls</h3>
        <div className="flex space-x-4 mb-4">
          <WalletButton 
            variant="primary" 
            size="md" 
            onClick={() => setIsModalOpen(true)}
          />
          {connected && (
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Disconnect
            </button>
          )}
        </div>
        
        <WalletModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Connect Your Wallet"
          description="Choose a wallet to connect to the admin portal."
        />
      </div>

      {/* Wallet Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Connection Status</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Connected:</strong> {connected ? 'Yes' : 'No'}</p>
            <p><strong>Connecting:</strong> {connecting ? 'Yes' : 'No'}</p>
            <p><strong>Wallet:</strong> {walletName || 'None'}</p>
            <p><strong>Network:</strong> {networkName}</p>
            <p><strong>Address:</strong> {publicKey?.toString().slice(0, 20)}...{publicKey?.toString().slice(-20) || 'None'}</p>
            {error && <p className="text-red-600"><strong>Error:</strong> {error.message}</p>}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Available Wallets</h3>
          <div className="space-y-2">
            <p className="text-sm"><strong>Installed ({installedWallets.length}):</strong></p>
            {installedWallets.map(wallet => (
              <div key={wallet.name} className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{wallet.name}</span>
              </div>
            ))}
            
            <p className="text-sm mt-4"><strong>Supported ({supportedWallets.length}):</strong></p>
            {supportedWallets.map(wallet => (
              <div key={wallet.name} className="flex items-center space-x-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${wallet.installed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span>{wallet.name}</span>
                {!wallet.installed && (
                  <a 
                    href={wallet.downloadUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-xs"
                  >
                    (Install)
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Container Environment Info */}
      <div className="bg-blue-50 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Container Environment</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p><strong>Container Mode:</strong> {process.env.NEXT_PUBLIC_CONTAINER_MODE || 'false'}</p>
            <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
          </div>
          <div>
            <p><strong>Backend API:</strong> {process.env.NEXT_PUBLIC_API_URL}</p>
            <p><strong>Solana RPC:</strong> {process.env.NEXT_PUBLIC_SOLANA_RPC}</p>
          </div>
          <div>
            <p><strong>Network:</strong> {process.env.NEXT_PUBLIC_NETWORK}</p>
            <p><strong>WebSocket:</strong> {process.env.NEXT_PUBLIC_SOLANA_WS}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main page component
export default function AdminPortalTest() {
  return (
    <WalletConnectionProvider
      network="devnet"
      autoConnect={true}
      onConnect={(publicKey) => {
        console.log('Wallet connected:', publicKey);
      }}
      onDisconnect={() => {
        console.log('Wallet disconnected');
      }}
      onError={(error) => {
        console.error('Wallet error:', error);
      }}
    >
      <div className="min-h-screen bg-gray-100">
        <Head>
          <title>PFM Admin Portal - Wallet Test</title>
          <meta name="description" content="Testing wallet connection infrastructure" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">PFM Admin Portal</h1>
                <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                  Wallet Test
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <WalletStatus variant="minimal" showNetwork={true} />
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Wallet Infrastructure Test</h2>
            <p className="text-gray-600 mt-2">
              Test the wallet connection infrastructure with containerized services.
              Make sure you have a Solana wallet installed (Phantom, Solflare, etc.).
            </p>
          </div>

          <WalletTestComponent />
        </main>
      </div>
    </WalletConnectionProvider>
  );
} 