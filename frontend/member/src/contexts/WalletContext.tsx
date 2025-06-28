'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useWallet as useSolanaWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import {
  WalletContextValue,
  WalletConnectionState,
  WalletError,
  WalletErrorCode,
  WalletPreferences,
  WalletConnectionOptions,
  SupportedWallet,
  NetworkInfo
} from '../types/wallet';
import {
  walletPreferences,
  detectWallets,
  handleWalletError,
  connectWithTimeout,
  retryConnection,
  validateWalletConnection,
  debugWalletState
} from '../utils/wallet';
import { NETWORKS, DEFAULT_NETWORK, RPC_ENDPOINTS } from '../config/wallet';

// Create the context
const WalletContext = createContext<WalletContextValue | null>(null);

// Custom hook to use the wallet context
export const useWalletContext = (): WalletContextValue => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: React.ReactNode;
  autoConnect?: boolean;
  onConnect?: (publicKey: PublicKey) => void;
  onDisconnect?: () => void;
  onError?: (error: WalletError) => void;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({
  children,
  autoConnect = true,
  onConnect,
  onDisconnect,
  onError
}) => {
  // Solana wallet adapter hooks
  const { 
    wallet: solanaWallet, 
    publicKey: solanaPublicKey, 
    connected: solanaConnected,
    connecting: solanaConnecting,
    disconnecting: solanaDisconnecting,
    select,
    connect: solanaConnect,
    disconnect: solanaDisconnect,
    wallets
  } = useSolanaWallet();
  
  const { connection } = useConnection();

  // Local state
  const [error, setError] = useState<WalletError | null>(null);
  const [preferences, setPreferences] = useState<WalletPreferences>(() => 
    walletPreferences.get()
  );
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>(() => 
    NETWORKS[preferences.networkPreference] || NETWORKS[DEFAULT_NETWORK]
  );
  const [supportedWallets, setSupportedWallets] = useState<SupportedWallet[]>([]);

  // Memoized connection state
  const connectionState: WalletConnectionState = useMemo(() => ({
    connected: solanaConnected,
    connecting: solanaConnecting,
    disconnecting: solanaDisconnecting,
    publicKey: solanaPublicKey,
    wallet: solanaWallet,
    error
  }), [solanaConnected, solanaConnecting, solanaDisconnecting, solanaPublicKey, solanaWallet, error]);

  // Initialize supported wallets
  useEffect(() => {
    const detected = detectWallets();
    const walletsWithAdapters = detected.map(wallet => ({
      ...wallet,
      adapter: wallets.find(w => w.adapter.name === wallet.name)?.adapter || null,
      installed: wallets.some(w => w.adapter.name === wallet.name && w.readyState === 'Installed')
    }));
    setSupportedWallets(walletsWithAdapters);
  }, [wallets]);

  // Handle wallet connection events
  useEffect(() => {
    if (solanaConnected && solanaPublicKey) {
      setError(null);
      debugWalletState(solanaWallet, solanaPublicKey, solanaConnected);
      onConnect?.(solanaPublicKey);
      
      // Update preferences
      if (solanaWallet) {
        updatePreferences({ lastConnectedWallet: solanaWallet.adapter.name });
      }
    }
  }, [solanaConnected, solanaPublicKey, solanaWallet, onConnect]);

  // Handle wallet disconnection events
  useEffect(() => {
    if (!solanaConnected && !solanaConnecting) {
      debugWalletState(solanaWallet, solanaPublicKey, solanaConnected);
      onDisconnect?.();
    }
  }, [solanaConnected, solanaConnecting, solanaWallet, solanaPublicKey, onDisconnect]);

  // Auto-connect functionality
  useEffect(() => {
    const shouldAutoConnect = autoConnect && 
      preferences.autoConnect && 
      preferences.lastConnectedWallet &&
      !solanaConnected &&
      !solanaConnecting;

    if (shouldAutoConnect) {
      const lastWallet = supportedWallets.find(
        w => w.name === preferences.lastConnectedWallet && w.installed
      );
      
      if (lastWallet) {
        connect(lastWallet.name, { onlyIfTrusted: true }).catch(error => {
          console.warn('Auto-connect failed:', error);
          // Don't show errors for auto-connect failures
        });
      }
    }
  }, [autoConnect, preferences, supportedWallets, solanaConnected, solanaConnecting]);

  // Connect function
  const connect = useCallback(async (
    walletName?: string,
    options: WalletConnectionOptions = {}
  ): Promise<void> => {
    try {
      setError(null);
      
      // Select wallet if specified
      if (walletName) {
        const targetWallet = supportedWallets.find(w => w.name === walletName);
        if (!targetWallet) {
          throw new Error(`Wallet ${walletName} not found`);
        }
        if (!targetWallet.installed) {
          throw new Error(`Wallet ${walletName} is not installed`);
        }
        
        const walletAdapter = wallets.find(w => w.adapter.name === walletName);
        if (walletAdapter) {
          select(walletAdapter.adapter.name);
        }
      }

      // Connect with timeout and retry logic
      const connectOperation = () => solanaConnect();
      
      if (options.timeout) {
        await connectWithTimeout(
          retryConnection(connectOperation),
          options.timeout
        );
      } else {
        await retryConnection(connectOperation);
      }

    } catch (error: any) {
      const walletError = handleWalletError(error);
      setError(walletError);
      onError?.(walletError);
      throw walletError;
    }
  }, [supportedWallets, wallets, select, solanaConnect, onError]);

  // Disconnect function
  const disconnect = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      await solanaDisconnect();
      updatePreferences({ lastConnectedWallet: null });
    } catch (error: any) {
      const walletError = handleWalletError(error);
      setError(walletError);
      onError?.(walletError);
      throw walletError;
    }
  }, [solanaDisconnect, onError]);

  // Select wallet function
  const selectWallet = useCallback((walletName: string): void => {
    const walletAdapter = wallets.find(w => w.adapter.name === walletName);
    if (walletAdapter) {
      select(walletAdapter.adapter.name);
    }
  }, [wallets, select]);

  // Update preferences function
  const updatePreferences = useCallback((newPreferences: Partial<WalletPreferences>): void => {
    setPreferences(prev => {
      const updated = { ...prev, ...newPreferences };
      walletPreferences.set(updated);
      return updated;
    });
  }, []);

  // Switch network function
  const switchNetwork = useCallback(async (
    network: 'mainnet-beta' | 'devnet' | 'testnet'
  ): Promise<void> => {
    try {
      const newNetworkInfo = NETWORKS[network];
      if (!newNetworkInfo) {
        throw new Error(`Unsupported network: ${network}`);
      }

      setNetworkInfo(newNetworkInfo);
      updatePreferences({ networkPreference: network });
      
      // Note: Actual network switching would require connection reconfiguration
      // This would typically be handled at the ConnectionProvider level
      
    } catch (error: any) {
      const walletError = handleWalletError(error);
      setError(walletError);
      onError?.(walletError);
      throw walletError;
    }
  }, [onError, updatePreferences]);

  // Context value
  const contextValue: WalletContextValue = useMemo(() => ({
    ...connectionState,
    connect,
    disconnect,
    selectWallet,
    supportedWallets,
    preferences,
    updatePreferences,
    networkInfo,
    switchNetwork
  }), [
    connectionState,
    connect,
    disconnect,
    selectWallet,
    supportedWallets,
    preferences,
    updatePreferences,
    networkInfo,
    switchNetwork
  ]);

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

export default WalletProvider; 