'use client';

import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { WalletProvider } from '../contexts/WalletContext';
import { getWalletAdapters, NETWORKS, DEFAULT_NETWORK, RPC_ENDPOINTS } from '../config/wallet';
import type { WalletError } from '../types/wallet';

// Import wallet adapter CSS
require('@solana/wallet-adapter-react-ui/styles.css');

interface WalletConnectionProviderProps {
  children: React.ReactNode;
  network?: 'mainnet-beta' | 'devnet' | 'testnet' | 'localhost';
  autoConnect?: boolean;
  onConnect?: (publicKey: string) => void;
  onDisconnect?: () => void;
  onError?: (error: WalletError) => void;
}

export const WalletConnectionProvider: React.FC<WalletConnectionProviderProps> = ({
  children,
  network = DEFAULT_NETWORK as 'mainnet-beta' | 'devnet' | 'testnet',
  autoConnect = true,
  onConnect,
  onDisconnect,
  onError
}) => {
  // Get the RPC endpoint for the selected network
  const endpoint = useMemo(() => {
    return RPC_ENDPOINTS[network] || RPC_ENDPOINTS[DEFAULT_NETWORK];
  }, [network]);

  // Get wallet adapters
  const wallets = useMemo(() => getWalletAdapters(), []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect={autoConnect}>
        <WalletModalProvider>
          <WalletProvider
            autoConnect={autoConnect}
            onConnect={onConnect ? (publicKey) => onConnect(publicKey.toString()) : undefined}
            onDisconnect={onDisconnect}
            onError={onError}
          >
            {children}
          </WalletProvider>
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};

export default WalletConnectionProvider; 