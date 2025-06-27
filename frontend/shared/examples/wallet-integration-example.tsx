/**
 * Wallet Integration Example
 * 
 * This file demonstrates how to integrate the wallet connection infrastructure
 * into both admin and member portals. Copy and adapt these patterns for your
 * specific use cases.
 */

'use client';

import React, { useState } from 'react';
import {
  WalletConnectionProvider,
  WalletButton,
  WalletModal,
  WalletStatus,
  useWallet
} from '../components/WalletConnection';

// Example 1: Basic Wallet Integration
export const BasicWalletExample: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      <div className="p-6 space-y-4">
        <h2 className="text-2xl font-bold">Basic Wallet Integration</h2>
        
        {/* Simple wallet button */}
        <WalletButton onClick={() => setIsModalOpen(true)} />
        
        {/* Wallet status display */}
        <WalletStatus variant="full" />
        
        {/* Wallet modal */}
        <WalletModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </WalletConnectionProvider>
  );
};

// Example 2: Advanced Wallet Integration with Hooks
export const AdvancedWalletExample: React.FC = () => {
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
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Advanced Wallet Integration</h2>
      
      {/* Connection Status */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Connection Status</h3>
        <p>Connected: {connected ? 'Yes' : 'No'}</p>
        <p>Connecting: {connecting ? 'Yes' : 'No'}</p>
        <p>Wallet: {walletName || 'None'}</p>
        <p>Network: {networkName}</p>
        <p>Address: {publicKey?.toString() || 'None'}</p>
        {error && <p className="text-red-600">Error: {error.message}</p>}
      </div>

      {/* Connection Controls */}
      <div className="space-x-4">
        {!connected ? (
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {connecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        ) : (
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Disconnect
          </button>
        )}
      </div>

      {/* Wallet Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Installed Wallets ({installedWallets.length})</h3>
          {installedWallets.map(wallet => (
            <div key={wallet.name} className="flex items-center space-x-2 mb-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{wallet.name}</span>
            </div>
          ))}
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">All Supported Wallets ({supportedWallets.length})</h3>
          {supportedWallets.map(wallet => (
            <div key={wallet.name} className="flex items-center space-x-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${wallet.installed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span>{wallet.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Example 3: Admin Portal Integration
export const AdminPortalWalletExample: React.FC = () => {
  const { connected, publicKey, walletName } = useWallet();
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header with Wallet */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <WalletStatus variant="minimal" showNetwork={true} />
              <WalletButton variant="outline" size="sm" />
            </div>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {connected ? (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Welcome, Administrator</h2>
            <p className="text-gray-600 mb-4">
              Connected with {walletName} wallet: {publicKey?.toString().slice(0, 8)}...
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900">Community Management</h3>
                <p className="text-blue-700">Manage communities and members</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900">Voting Oversight</h3>
                <p className="text-green-700">Monitor voting activities</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-900">Analytics</h3>
                <p className="text-purple-700">View detailed reports</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">
              Please connect your wallet to access the admin portal.
            </p>
            <WalletButton variant="primary" size="lg" />
          </div>
        )}
      </main>
    </div>
  );
};

// Example 4: Member Portal Integration  
export const MemberPortalWalletExample: React.FC = () => {
  const { connected, publicKey, shortAddress } = useWallet();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Member Header with Wallet */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Community Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              {connected && (
                <div className="text-sm text-gray-600">
                  Welcome, {shortAddress}
                </div>
              )}
              <WalletButton variant="secondary" size="sm" />
            </div>
          </div>
        </div>
      </header>

      {/* Member Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {connected ? (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Your Communities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium">Community Alpha</h3>
                  <p className="text-sm text-gray-600">Active member</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium">Community Beta</h3>
                  <p className="text-sm text-gray-600">Pending approval</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Active Votes</h2>
              <div className="space-y-3">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-medium">Proposal: Budget Allocation</h3>
                  <p className="text-sm text-gray-600">Ends in 2 days</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-medium">Proposal: New Features</h3>
                  <p className="text-sm text-gray-600">Ends in 5 days</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Join the Community</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Connect your wallet to participate in community governance and voting.
            </p>
            <WalletButton variant="primary" size="lg" />
          </div>
        )}
      </main>
    </div>
  );
};

// Example 5: App Root with Wallet Provider
export const AppWithWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <WalletConnectionProvider
      network={process.env.NODE_ENV === 'production' ? 'mainnet-beta' : 'devnet'}
      autoConnect={true}
      onConnect={(publicKey) => {
        // Track wallet connection in analytics
        console.log('User connected wallet:', publicKey);
      }}
      onDisconnect={() => {
        // Track wallet disconnection
        console.log('User disconnected wallet');
      }}
      onError={(error) => {
        // Handle and report errors
        console.error('Wallet error:', error);
      }}
    >
      {children}
    </WalletConnectionProvider>
  );
};

export default {
  BasicWalletExample,
  AdvancedWalletExample,
  AdminPortalWalletExample,
  MemberPortalWalletExample,
  AppWithWalletProvider
}; 