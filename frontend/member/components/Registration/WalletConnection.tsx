'use client';

import React, { useState } from 'react';
import { WalletIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { WalletType, RegistrationData, WalletConnectionData } from '../../types/profile';

interface WalletConnectionProps {
  registrationData: RegistrationData;
  updateRegistrationData: (data: Partial<RegistrationData>) => void;
  connectWallet: (walletType: WalletType) => Promise<WalletConnectionData>;
  loading: boolean;
}

const WalletConnection: React.FC<WalletConnectionProps> = ({
  registrationData,
  updateRegistrationData,
  connectWallet,
  loading
}) => {
  const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null);
  const [connecting, setConnecting] = useState(false);

  const walletOptions = [
    {
      type: WalletType.PHANTOM,
      name: 'Phantom',
      description: 'Popular Solana wallet with great mobile support',
      icon: '👻',
      supported: true,
      downloadUrl: 'https://phantom.app/'
    },
    {
      type: WalletType.SOLFLARE,
      name: 'Solflare',
      description: 'Comprehensive Solana wallet with advanced features',
      icon: '☀️',
      supported: true,
      downloadUrl: 'https://solflare.com/'
    },
    {
      type: WalletType.METAMASK,
      name: 'MetaMask',
      description: 'Most popular Ethereum wallet',
      icon: '🦊',
      supported: true,
      downloadUrl: 'https://metamask.io/'
    },
    {
      type: WalletType.WALLET_CONNECT,
      name: 'WalletConnect',
      description: 'Connect using mobile wallets via QR code',
      icon: '📱',
      supported: true,
      downloadUrl: 'https://walletconnect.com/'
    },
    {
      type: WalletType.LEDGER,
      name: 'Ledger',
      description: 'Hardware wallet for maximum security',
      icon: '🔐',
      supported: false,
      downloadUrl: 'https://www.ledger.com/'
    }
  ];

  const handleConnect = async (walletType: WalletType) => {
    try {
      setConnecting(true);
      setSelectedWallet(walletType);
      
      const walletData = await connectWallet(walletType);
      
      // Update registration data with wallet info
      updateRegistrationData({
        walletAddress: walletData.address,
        walletType: walletType
      });
      
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setSelectedWallet(null);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    updateRegistrationData({
      walletAddress: '',
      walletType: WalletType.PHANTOM
    });
    setSelectedWallet(null);
  };

  const isConnected = !!registrationData.walletAddress;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <WalletIcon className="mx-auto h-12 w-12 text-blue-600" />
        <h2 className="mt-4 text-2xl font-bold text-gray-900">Connect Your Wallet</h2>
        <p className="mt-2 text-gray-600">
          Choose a wallet to connect and verify your identity on the blockchain
        </p>
      </div>

      {isConnected ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            <CheckCircleIcon className="h-6 w-6 text-green-600" />
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-medium text-green-900">Wallet Connected</h3>
              <p className="text-sm text-green-700">
                Successfully connected to {registrationData.walletType}
              </p>
              <p className="text-xs text-green-600 mt-1 font-mono">
                {registrationData.walletAddress}
              </p>
            </div>
            <button
              type="button"
              onClick={handleDisconnect}
              className="ml-3 text-sm text-green-700 hover:text-green-900 font-medium"
            >
              Disconnect
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {walletOptions.map((wallet) => (
              <button
                key={wallet.type}
                type="button"
                onClick={() => handleConnect(wallet.type)}
                disabled={!wallet.supported || connecting}
                className={`
                  relative p-4 border rounded-lg text-left transition-all duration-200
                  ${wallet.supported 
                    ? 'border-gray-300 hover:border-blue-500 hover:shadow-md cursor-pointer' 
                    : 'border-gray-200 opacity-50 cursor-not-allowed'
                  }
                  ${selectedWallet === wallet.type && connecting 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'bg-white'
                  }
                `}
              >
                <div className="flex items-start">
                  <span className="text-2xl mr-3">{wallet.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{wallet.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{wallet.description}</p>
                    
                    {!wallet.supported && (
                      <span className="inline-block mt-2 px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  
                  {selectedWallet === wallet.type && connecting && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
                      <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-900">Why do I need to connect a wallet?</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Your wallet serves as your digital identity and allows you to:
                  </p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Participate in governance and voting</li>
                    <li>Verify your ownership of tokens and NFTs</li>
                    <li>Interact with decentralized applications</li>
                    <li>Maintain your digital reputation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Don't have a wallet?{' '}
              <a 
                href="https://phantom.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Download Phantom
              </a>{' '}
              or{' '}
              <a 
                href="https://metamask.io/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Get MetaMask
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnection;
