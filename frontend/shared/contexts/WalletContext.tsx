'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import {
  WalletContextValue,
  WalletError,
  WalletErrorCode,
  WalletConnectionOptions,
  SupportedWallet,
  WalletPreferences,
  NetworkInfo
} from '../types/wallet';

// ============================================================================
// Wallet Context
// ============================================================================

const WalletContext = createContext<WalletContextValue | null>(null);

export const useWalletContext = (): WalletContextValue => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
};

// ============================================================================
// Wallet Provider Props
// ============================================================================

interface WalletProviderProps {
  children: React.ReactNode;
  autoConnect?: boolean;
  onConnect?: (publicKey: PublicKey) => void;
  onDisconnect?: () => void;
  onError?: (error: WalletError) => void;
}

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_PREFERENCES: WalletPreferences = {
  autoConnect: true,
  lastConnectedWallet: null,
  networkPreference: 'devnet'
};

const DEFAULT_NETWORK_INFO: NetworkInfo = {
  name: 'devnet',
  endpoint: 'https://api.devnet.solana.com',
  chainId: 'devnet',
  displayName: 'Devnet'
};

// Simplified supported wallet interface for this implementation
interface SimplifiedWallet {
  name: string;
  url: string;
  downloadUrl: string;
  icon: string;
  installed: boolean;
}

const SUPPORTED_WALLETS: SimplifiedWallet[] = [
  {
    name: 'Phantom',
    url: 'https://phantom.app/',
    downloadUrl: 'https://phantom.app/download',
    icon: '/icons/phantom.svg',
    installed: false
  },
  {
    name: 'Solflare',
    url: 'https://solflare.com/',
    downloadUrl: 'https://solflare.com/download',
    icon: '/icons/solflare.svg',
    installed: false
  },
  {
    name: 'Backpack',
    url: 'https://backpack.app/',
    downloadUrl: 'https://backpack.app/download',
    icon: '/icons/backpack.svg',
    installed: false
  }
];

// ============================================================================
// Wallet Provider Implementation
// ============================================================================

export const WalletProvider: React.FC<WalletProviderProps> = ({
  children,
  autoConnect = true,
  onConnect,
  onDisconnect,
  onError
}) => {
  // State
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [error, setError] = useState<WalletError | null>(null);
  const [preferences, setPreferences] = useState<WalletPreferences>(DEFAULT_PREFERENCES);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>(DEFAULT_NETWORK_INFO);
  const [supportedWallets, setSupportedWallets] = useState<SimplifiedWallet[]>(SUPPORTED_WALLETS);

  // Check wallet installation on mount
  useEffect(() => {
    const checkWalletInstallation = () => {
      const updatedWallets = SUPPORTED_WALLETS.map(wallet => ({
        ...wallet,
        installed: !!(window as any).solana || !!(window as any)[wallet.name.toLowerCase()]
      }));
      setSupportedWallets(updatedWallets);
    };

    checkWalletInstallation();
    
    // Check every 1 second for wallet installation
    const interval = setInterval(checkWalletInstallation, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load preferences from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pfm-wallet-preferences');
      if (saved) {
        setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(saved) });
      }
    } catch (error) {
      console.warn('Failed to load wallet preferences:', error);
    }
  }, []);

  // Save preferences to localStorage
  const updatePreferences = useCallback((newPrefs: Partial<WalletPreferences>) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    
    try {
      localStorage.setItem('pfm-wallet-preferences', JSON.stringify(updated));
    } catch (error) {
      console.warn('Failed to save wallet preferences:', error);
    }
  }, [preferences]);

  // Connect to wallet
  const connect = useCallback(async (
    walletName?: string,
    options: WalletConnectionOptions = {}
  ): Promise<void> => {
    setConnecting(true);
    setError(null);

    try {
      // For now, use a mock implementation
      // In production, this would integrate with actual wallet adapters
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock wallet connection
      const mockPublicKey = new PublicKey('11111111111111111111111111111112');
      const mockWallet = {
        adapter: {
          name: walletName || 'Phantom',
          publicKey: mockPublicKey,
          connected: true,
          signMessage: async (message: Uint8Array) => {
            // Mock signature
            return new Uint8Array(64);
          }
        }
      };

      setWallet(mockWallet);
      setPublicKey(mockPublicKey);
      setConnected(true);
      
      if (walletName) {
        updatePreferences({ lastConnectedWallet: walletName });
      }
      
      onConnect?.(mockPublicKey);
      
    } catch (err: any) {
      const walletError: WalletError = {
        code: WalletErrorCode.CONNECTION_FAILED,
        message: err.message || 'Failed to connect wallet',
        details: err,
        timestamp: new Date()
      };
      setError(walletError);
      onError?.(walletError);
      throw walletError;
    } finally {
      setConnecting(false);
    }
  }, [onConnect, onError, updatePreferences]);

  // Disconnect from wallet
  const disconnect = useCallback(async (): Promise<void> => {
    setDisconnecting(true);
    
    try {
      // Simulate disconnection delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setConnected(false);
      setPublicKey(null);
      setWallet(null);
      setError(null);
      
      onDisconnect?.();
      
    } catch (err: any) {
      console.warn('Disconnect error:', err);
    } finally {
      setDisconnecting(false);
    }
  }, [onDisconnect]);

  // Select wallet
  const selectWallet = useCallback((walletName: string): void => {
    const selectedWallet = supportedWallets.find(w => w.name === walletName);
    if (!selectedWallet) {
      console.warn(`Wallet ${walletName} not found in supported wallets`);
      return;
    }
    
    if (!selectedWallet.installed) {
      console.warn(`Wallet ${walletName} is not installed`);
      return;
    }

    // Store selected wallet for connection
    updatePreferences({ lastConnectedWallet: walletName });
  }, [supportedWallets, updatePreferences]);

  // Switch network
  const switchNetwork = useCallback(async (
    network: 'mainnet-beta' | 'devnet' | 'testnet'
  ): Promise<void> => {
    const endpoints = {
      'mainnet-beta': 'https://api.mainnet-beta.solana.com',
      'devnet': 'https://api.devnet.solana.com',
      'testnet': 'https://api.testnet.solana.com'
    };

    const newNetworkInfo: NetworkInfo = {
      name: network,
      endpoint: endpoints[network],
      chainId: network,
      displayName: network === 'mainnet-beta' ? 'Mainnet' : 
                   network === 'devnet' ? 'Devnet' : 'Testnet'
    };

    setNetworkInfo(newNetworkInfo);
    updatePreferences({ networkPreference: network });
  }, [updatePreferences]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && preferences.lastConnectedWallet && !connected && !connecting) {
      const lastWallet = supportedWallets.find(w => 
        w.name === preferences.lastConnectedWallet && w.installed
      );
      
      if (lastWallet) {
        connect(lastWallet.name).catch(err => {
          console.warn('Auto-connect failed:', err);
        });
      }
    }
  }, [autoConnect, preferences.lastConnectedWallet, connected, connecting, supportedWallets, connect]);

  // Context value
  const contextValue: WalletContextValue = {
    // Connection state
    connected,
    connecting,
    disconnecting,
    publicKey,
    wallet,
    error,

    // Connection functions
    connect,
    disconnect,
    selectWallet,

    // Wallet management
    supportedWallets: supportedWallets as any,
    preferences,
    updatePreferences,

    // Network management
    networkInfo,
    switchNetwork
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

export default WalletProvider;