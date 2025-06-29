'use client';

import React, { createContext, useContext, useState } from 'react';
import { PublicKey } from '@solana/web3.js';

interface WalletContextValue {
  connected: boolean;
  connecting: boolean;
  disconnecting: boolean;
  publicKey: PublicKey | null;
  wallet: any;
  error: any;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  selectWallet: (walletName: string) => void;
  supportedWallets: any[];
  preferences: any;
  updatePreferences: (prefs: any) => void;
  networkInfo: any;
  switchNetwork: (network: string) => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export const useWalletContext = (): WalletContextValue => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: React.ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [error, setError] = useState<any>(null);

  const connect = async (): Promise<void> => {
    setConnecting(true);
    try {
      // Stub implementation
      setTimeout(() => {
        setConnected(true);
        setConnecting(false);
      }, 1000);
    } catch (err) {
      setError(err);
      setConnecting(false);
    }
  };

  const disconnect = async (): Promise<void> => {
    setDisconnecting(true);
    setConnected(false);
    setPublicKey(null);
    setDisconnecting(false);
  };

  const selectWallet = (walletName: string): void => {
    console.log('Selected wallet:', walletName);
  };

  const updatePreferences = (prefs: any): void => {
    console.log('Updated preferences:', prefs);
  };

  const switchNetwork = async (network: string): Promise<void> => {
    console.log('Switched network:', network);
  };

  const contextValue: WalletContextValue = {
    connected,
    connecting,
    disconnecting,
    publicKey,
    wallet: null,
    error,
    connect,
    disconnect,
    selectWallet,
    supportedWallets: [],
    preferences: {},
    updatePreferences,
    networkInfo: { name: 'devnet' },
    switchNetwork
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

export default WalletProvider; 