import { useCallback, useMemo } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useWalletContext } from '../contexts/WalletContext';
import {
  WalletError,
  WalletErrorCode,
  WalletConnectionOptions,
  SupportedWallet
} from '../types/wallet';
import {
  formatWalletAddress,
  validateWalletConnection,
  createWalletError
} from '../utils/wallet';

export interface UseWalletReturn {
  // Connection state
  connected: boolean;
  connecting: boolean;
  disconnecting: boolean;
  publicKey: PublicKey | null;
  wallet: any;
  error: WalletError | null;

  // Formatted values
  address: string;
  shortAddress: string;

  // Connection functions
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  selectWallet: (walletName: string) => void;

  // Wallet management
  supportedWallets: SupportedWallet[];
  installedWallets: SupportedWallet[];
  availableWallets: SupportedWallet[];

  // Network management
  networkName: string;
  networkDisplayName: string;
  switchNetwork: (network: 'mainnet-beta' | 'devnet' | 'testnet') => Promise<void>;

  // Preferences
  autoConnect: boolean;
  lastConnectedWallet: string | null;
  setAutoConnect: (enabled: boolean) => void;

  // Utility functions
  isValidConnection: boolean;
  canConnect: boolean;
  requiresInstallation: (walletName: string) => boolean;
  getWalletDownloadUrl: (walletName: string) => string | null;
}

/**
 * Custom hook for wallet functionality
 * Provides a simplified interface for wallet operations
 */
export const useWallet = (): UseWalletReturn => {
  const context = useWalletContext();

  return {
    connected: context.connected,
    connecting: context.connecting,
    disconnecting: context.disconnecting,
    publicKey: context.publicKey,
    wallet: context.wallet,
    error: context.error,
    connect: context.connect,
    disconnect: context.disconnect,
    walletName: context.wallet?.name || 'Not connected',
    networkName: context.networkInfo?.name || 'devnet',
    supportedWallets: context.supportedWallets,
    installedWallets: context.supportedWallets.filter((w: any) => w.installed),
    availableWallets: context.supportedWallets.filter((w: any) => !w.installed),
    networkDisplayName: context.networkInfo?.displayName || 'Unknown Network',
    switchNetwork: context.switchNetwork,
    autoConnect: context.preferences.autoConnect,
    lastConnectedWallet: context.preferences.lastConnectedWallet,
    setAutoConnect: context.updatePreferences,
    isValidConnection: useMemo(() => {
      return validateWalletConnection(context.wallet, context.publicKey);
    }, [context.wallet, context.publicKey]),
    canConnect: useMemo(() => {
      return !context.connecting && !context.connected && context.supportedWallets.length > 0;
    }, [context.connecting, context.connected, context.supportedWallets]),
    requiresInstallation: useCallback((walletName: string): boolean => {
      const wallet = context.supportedWallets.find(w => w.name === walletName);
      return wallet ? !wallet.installed : true;
    }, [context.supportedWallets]),
    getWalletDownloadUrl: useCallback((walletName: string): string | null => {
      const wallet = context.supportedWallets.find(w => w.name === walletName);
      return wallet?.downloadUrl || wallet?.url || null;
    }, [context.supportedWallets]),
    selectWallet: context.selectWallet
  };
};

export default useWallet; 