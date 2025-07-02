// Task 7.1.3: Public User Registration & Wallet Connection
// Wallet selector component for choosing and connecting wallets

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  WalletProvider, 
  WalletInfo, 
  WalletConnectionResult, 
  WalletSelectorProps 
} from '@/types/registration';
import { 
  getAvailableWallets, 
  getInstalledWallets, 
  isWalletInstalled, 
  getWalletInstallUrl, 
  isMobileDevice, 
  getMobileWalletUrl 
} from '@/services/walletConnection';

// Icons (using simple SVG icons for now)
const WalletIcon: React.FC<{ provider: WalletProvider; className?: string }> = ({ provider, className = "w-8 h-8" }) => {
  const icons: Record<WalletProvider, React.ReactNode> = {
    phantom: (
      <div className={`${className} bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold`}>
        P
      </div>
    ),
    solflare: (
      <div className={`${className} bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold`}>
        S
      </div>
    ),
    metamask: (
      <div className={`${className} bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold`}>
        M
      </div>
    ),
    walletconnect: (
      <div className={`${className} bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold`}>
        WC
      </div>
    ),
    coinbase: (
      <div className={`${className} bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold`}>
        CB
      </div>
    ),
    ledger: (
      <div className={`${className} bg-black rounded-lg flex items-center justify-center text-white font-bold`}>
        L
      </div>
    ),
    trezor: (
      <div className={`${className} bg-green-600 rounded-lg flex items-center justify-center text-white font-bold`}>
        T
      </div>
    )
  };

  return icons[provider] || (
    <div className={`${className} bg-gray-400 rounded-lg flex items-center justify-center text-white font-bold`}>
      ?
    </div>
  );
};

// Individual wallet option component
const WalletOption: React.FC<{
  wallet: WalletInfo;
  isSelected: boolean;
  isConnecting: boolean;
  onSelect: () => void;
  onConnect: () => void;
  onInstall: () => void;
}> = ({ wallet, isSelected, isConnecting, onSelect, onConnect, onInstall }) => {
  const isMobile = isMobileDevice();
  const canConnect = wallet.isInstalled || wallet.provider === 'walletconnect';
  
  return (
    <div
      className={`
        relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-200
        ${isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-lg' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
        }
        ${!canConnect ? 'opacity-75' : ''}
      `}
      onClick={onSelect}
    >
      {/* Wallet header */}
      <div className="flex items-center space-x-3 mb-3">
        <WalletIcon provider={wallet.provider} className="w-10 h-10" />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{wallet.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{wallet.description}</p>
        </div>
        
        {/* Status indicator */}
        <div className="flex flex-col items-end space-y-1">
          {wallet.isInstalled ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Installed
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              Not Installed
            </span>
          )}
          
          {isSelected && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Selected
            </span>
          )}
        </div>
      </div>

      {/* Platform support */}
      <div className="flex flex-wrap gap-1 mb-3">
        {wallet.platforms.map((platform) => (
          <span 
            key={platform}
            className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
          >
            {platform === 'web' && '🌐'}
            {platform === 'mobile' && '📱'}
            {platform === 'extension' && '🧩'}
            {platform}
          </span>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex space-x-2">
        {canConnect ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onConnect();
            }}
            disabled={isConnecting}
            className={`
              flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors
              ${isConnecting
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
              }
            `}
          >
            {isConnecting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting...
              </span>
            ) : (
              'Connect'
            )}
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onInstall();
            }}
            className="flex-1 px-4 py-2 rounded-lg font-medium text-sm bg-gray-600 text-white hover:bg-gray-700 transition-colors"
          >
            Install
          </button>
        )}
        
        <a
          href={wallet.website}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
};

// Main wallet selector component
const WalletSelector: React.FC<WalletSelectorProps> = ({
  selectedProvider,
  onProviderSelect,
  onConnect,
  showInstallGuide = true,
  enableMobile = true
}) => {
  const [availableWallets, setAvailableWallets] = useState<WalletInfo[]>([]);
  const [connectingWallet, setConnectingWallet] = useState<WalletProvider | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [showAllWallets, setShowAllWallets] = useState(false);

  const isMobile = isMobileDevice();

  // Load available wallets
  useEffect(() => {
    const wallets = getAvailableWallets();
    setAvailableWallets(wallets);
  }, []);

  // Filter wallets based on platform and installation
  const { installedWallets, notInstalledWallets, recommendedWallets } = useMemo(() => {
    const installed = availableWallets.filter(wallet => wallet.isInstalled);
    const notInstalled = availableWallets.filter(wallet => !wallet.isInstalled);
    
    // Recommend popular wallets based on platform
    const recommended = isMobile
      ? availableWallets.filter(wallet => 
          wallet.platforms.includes('mobile') && 
          ['phantom', 'metamask', 'walletconnect'].includes(wallet.provider)
        )
      : availableWallets.filter(wallet => 
          wallet.platforms.includes('web') && 
          ['phantom', 'metamask', 'solflare'].includes(wallet.provider)
        );

    return { installedWallets: installed, notInstalledWallets: notInstalled, recommendedWallets: recommended };
  }, [availableWallets, isMobile]);

  // Handle wallet selection
  const handleWalletSelect = (provider: WalletProvider) => {
    setError(undefined);
    onProviderSelect(provider);
  };

  // Handle wallet connection
  const handleWalletConnect = async (provider: WalletProvider) => {
    setConnectingWallet(provider);
    setError(undefined);

    try {
      const result = await onConnect(provider);
      
      if (!result.success) {
        setError(result.error || 'Failed to connect wallet');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setConnectingWallet(null);
    }
  };

  // Handle wallet installation
  const handleWalletInstall = (wallet: WalletInfo) => {
    const installUrl = isMobile 
      ? getMobileWalletUrl(wallet.provider)
      : getWalletInstallUrl(wallet.provider);
    
    if (installUrl) {
      window.open(installUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.open(wallet.website, '_blank', 'noopener,noreferrer');
    }
  };

  // Render wallet section
  const renderWalletSection = (
    title: string,
    wallets: WalletInfo[],
    description?: string
  ) => {
    if (wallets.length === 0) return null;

    return (
      <div className="mb-8">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          {wallets.map((wallet) => (
            <WalletOption
              key={wallet.provider}
              wallet={wallet}
              isSelected={selectedProvider === wallet.provider}
              isConnecting={connectingWallet === wallet.provider}
              onSelect={() => handleWalletSelect(wallet.provider)}
              onConnect={() => handleWalletConnect(wallet.provider)}
              onInstall={() => handleWalletInstall(wallet)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choose Your Wallet
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Connect your wallet to verify your identity and secure your account. 
          Choose from popular wallet providers below.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Mobile notice */}
      {isMobile && enableMobile && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-blue-800 font-medium mb-1">Mobile Device Detected</p>
              <p className="text-blue-700 text-sm">
                For the best experience, use a wallet app installed on your device or scan QR codes with WalletConnect.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Installed wallets (priority) */}
      {renderWalletSection(
        'Ready to Connect',
        installedWallets,
        'These wallets are already installed and ready to use.'
      )}

      {/* Recommended wallets */}
      {!showAllWallets && installedWallets.length === 0 && (
        <>
          {renderWalletSection(
            'Recommended Wallets',
            recommendedWallets,
            'Popular wallet choices for your platform.'
          )}
          
          {notInstalledWallets.length > recommendedWallets.length && (
            <div className="text-center mb-8">
              <button
                onClick={() => setShowAllWallets(true)}
                className="px-6 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Show All Wallets ({availableWallets.length} total)
              </button>
            </div>
          )}
        </>
      )}

      {/* All wallets */}
      {(showAllWallets || installedWallets.length === 0) && (
        renderWalletSection(
          showAllWallets ? 'All Available Wallets' : 'Install a Wallet',
          showAllWallets ? availableWallets : notInstalledWallets,
          showAllWallets 
            ? 'Choose from all supported wallet providers.'
            : 'Install one of these wallets to get started.'
        )
      )}

      {/* Installation guide */}
      {showInstallGuide && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            New to Crypto Wallets?
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <h4 className="font-medium mb-2">🔐 What is a Wallet?</h4>
              <p>A crypto wallet stores your digital assets and allows you to interact with blockchain applications securely.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">🛡️ Safety First</h4>
              <p>Always download wallets from official sources and never share your private keys or seed phrases.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">📱 Mobile vs Desktop</h4>
              <p>Mobile wallets are convenient for everyday use, while desktop extensions offer more features for advanced users.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">🔗 How to Connect</h4>
              <p>Click "Connect" next to your preferred wallet and follow the prompts to authorize the connection.</p>
            </div>
          </div>
        </div>
      )}

      {/* Skip option */}
      <div className="mt-8 text-center">
        <button
          onClick={() => onProviderSelect('' as WalletProvider)}
          className="text-gray-500 hover:text-gray-700 text-sm underline"
        >
          Skip wallet connection for now
        </button>
      </div>
    </div>
  );
};

export default WalletSelector; 