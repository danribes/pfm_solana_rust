import React, { useState } from 'react';
import Head from 'next/head';
import { 
  WalletConnectionProvider, 
  WalletButton, 
  WalletModal, 
  WalletStatus, 
  useWallet 
} from '../../shared/components/WalletConnection';

// Member-specific test component
const MemberWalletTestComponent: React.FC = () => {
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

  // Simulated community data for testing
  const mockCommunities = [
    { id: '1', name: 'DeFi Governance', members: 1234, status: 'Active' },
    { id: '2', name: 'NFT Collectors', members: 567, status: 'Active' },
    { id: '3', name: 'Gaming Community', members: 890, status: 'Pending Approval' },
  ];

  const mockVotes = [
    { id: '1', question: 'Should we implement staking rewards?', deadline: '2024-01-15', status: 'Active' },
    { id: '2', question: 'New fee structure proposal', deadline: '2024-01-20', status: 'Completed' },
    { id: '3', question: 'Community treasury allocation', deadline: '2024-01-25', status: 'Draft' },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">My Communities</h3>
          <div className="space-y-2">
            {mockCommunities.map(community => (
              <div key={community.id} className="flex justify-between items-center p-2 border rounded">
                <div>
                  <p className="font-medium">{community.name}</p>
                  <p className="text-sm text-gray-600">{community.members} members</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded ${
                  community.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {community.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Active Votes</h3>
          <div className="space-y-2">
            {mockVotes.map(vote => (
              <div key={vote.id} className="p-2 border rounded">
                <p className="font-medium text-sm">{vote.question}</p>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-600">{vote.deadline}</p>
                  <span className={`px-2 py-1 text-xs rounded ${
                    vote.status === 'Active' ? 'bg-blue-100 text-blue-800' :
                    vote.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {vote.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Wallet Connection</h3>
          <WalletStatus variant="full" showNetwork={true} showAddress={true} />
          <div className="mt-4">
            <WalletButton 
              variant="primary" 
              size="sm" 
              onClick={() => setIsModalOpen(true)}
              disabled={connecting}
            />
          </div>
        </div>
      </div>

      {/* Wallet Connection Modal */}
      <WalletModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Connect Your Wallet"
        description="Connect your wallet to participate in community voting and management."
      />

      {/* Detailed Connection Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Connection Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${connected ? 'text-green-600' : 'text-red-600'}`}>
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            {connected && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Wallet:</span>
                  <span className="font-medium">{walletName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Network:</span>
                  <span className="font-medium">{networkName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Address:</span>
                  <span className="font-mono text-sm">
                    {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}
                  </span>
                </div>
              </>
            )}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-red-800 text-sm">{error.message}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Available Wallets</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Installed Wallets:</p>
              {installedWallets.length > 0 ? (
                installedWallets.map(wallet => (
                  <div key={wallet.name} className="flex items-center space-x-2 p-2 bg-green-50 rounded">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">{wallet.name}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No wallets detected</p>
              )}
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Supported Wallets:</p>
              <div className="space-y-1">
                {supportedWallets.filter(w => !w.installed).map(wallet => (
                  <div key={wallet.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      <span className="text-sm">{wallet.name}</span>
                    </div>
                    <a 
                      href={wallet.downloadUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Install
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Member Actions (disabled if not connected) */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Member Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            disabled={!connected}
            className={`p-4 rounded-lg border text-center ${
              connected 
                ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' 
                : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <h4 className="font-medium">Join Community</h4>
            <p className="text-sm mt-1">Request membership in new communities</p>
          </button>
          
          <button
            disabled={!connected}
            className={`p-4 rounded-lg border text-center ${
              connected 
                ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' 
                : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <h4 className="font-medium">Cast Vote</h4>
            <p className="text-sm mt-1">Participate in active community votes</p>
          </button>
          
          <button
            disabled={!connected}
            className={`p-4 rounded-lg border text-center ${
              connected 
                ? 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100' 
                : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <h4 className="font-medium">View Results</h4>
            <p className="text-sm mt-1">See voting results and analytics</p>
          </button>
        </div>
        
        {!connected && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-800 text-sm">
              ⚠️ Connect your wallet to access member features
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Main member portal test page
export default function MemberPortalTest() {
  return (
    <WalletConnectionProvider
      network="devnet"
      autoConnect={true}
      onConnect={(publicKey) => {
        console.log('Member wallet connected:', publicKey);
      }}
      onDisconnect={() => {
        console.log('Member wallet disconnected');
      }}
      onError={(error) => {
        console.error('Member wallet error:', error);
      }}
    >
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>PFM Member Portal - Wallet Test</title>
          <meta name="description" content="Testing member portal wallet connection" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">PFM Member Portal</h1>
                <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                  Wallet Test
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <WalletStatus variant="minimal" showNetwork={false} showAddress={true} />
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Member Dashboard</h2>
            <p className="text-gray-600 mt-2">
              Test member portal functionality with wallet connection.
              Connect your wallet to access community features.
            </p>
          </div>

          <MemberWalletTestComponent />
        </main>
      </div>
    </WalletConnectionProvider>
  );
} 