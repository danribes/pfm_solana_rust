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
  walletName: string | null;
  error: WalletError | null;

  // Formatted values
  address: string;
  shortAddress: string;

  // Connection functions
  connect: (walletName?: string, options?: WalletConnectionOptions) => Promise<void>;
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
  const {
    connected,
    connecting,
    disconnecting,
    publicKey,
    wallet,
    error,
    connect: contextConnect,
    disconnect: contextDisconnect,
    selectWallet: contextSelectWallet,
    supportedWallets,
    preferences,
    updatePreferences,
    networkInfo,
    switchNetwork: contextSwitchNetwork
  } = useWalletContext();

  // Wallet name
  const walletName = wallet?.adapter?.name || null;

  // Formatted addresses
  const address = useMemo(() => {
    return publicKey ? publicKey.toString() : '';
  }, [publicKey]);

  const shortAddress = useMemo(() => {
    return formatWalletAddress(publicKey, 4);
  }, [publicKey]);

  // Wallet categorization
  const installedWallets = useMemo(() => {
    return supportedWallets.filter(wallet => wallet.installed);
  }, [supportedWallets]);

  const availableWallets = useMemo(() => {
    return supportedWallets.filter(wallet => !wallet.installed);
  }, [supportedWallets]);

  // Network info
  const networkName = networkInfo?.name || 'unknown';
  const networkDisplayName = networkInfo?.displayName || 'Unknown Network';

  // Connection validation
  const isValidConnection = useMemo(() => {
    return validateWalletConnection(wallet, publicKey);
  }, [wallet, publicKey]);

  const canConnect = useMemo(() => {
    return !connecting && !connected && installedWallets.length > 0;
  }, [connecting, connected, installedWallets]);

  // Enhanced connect function with better error handling
  const connect = useCallback(async (
    walletName?: string,
    options: WalletConnectionOptions = {}
  ): Promise<void> => {
    try {
      // If no wallet specified, try to use the last connected wallet
      if (!walletName && preferences.lastConnectedWallet) {
        const lastWallet = installedWallets.find(
          w => w.name === preferences.lastConnectedWallet
        );
        if (lastWallet) {
          walletName = lastWallet.name;
        }
      }

      // If still no wallet, use the first installed wallet
      if (!walletName && installedWallets.length > 0) {
        walletName = installedWallets[0].name;
      }

      // Check if wallet is installed
      if (walletName && !installedWallets.some(w => w.name === walletName)) {
        throw createWalletError(
          WalletErrorCode.WALLET_NOT_FOUND,
          undefined,
          `${walletName} wallet is not installed. Please install it first.`
        );
      }

      await contextConnect(walletName, options);
    } catch (error: any) {
      throw error;
    }
  }, [contextConnect, preferences.lastConnectedWallet, installedWallets]);

  // Enhanced disconnect function
  const disconnect = useCallback(async (): Promise<void> => {
    try {
      await contextDisconnect();
    } catch (error: any) {
      throw error;
    }
  }, [contextDisconnect]);

  // Select wallet with validation
  const selectWallet = useCallback((walletName: string): void => {
    const wallet = supportedWallets.find(w => w.name === walletName);
    if (!wallet) {
      console.warn(`Wallet ${walletName} not found in supported wallets`);
      return;
    }
    
    if (!wallet.installed) {
      console.warn(`Wallet ${walletName} is not installed`);
      return;
    }

    contextSelectWallet(walletName);
  }, [supportedWallets, contextSelectWallet]);

  // Network switching with validation
  const switchNetwork = useCallback(async (
    network: 'mainnet-beta' | 'devnet' | 'testnet'
  ): Promise<void> => {
    try {
      await contextSwitchNetwork(network);
    } catch (error: any) {
      throw error;
    }
  }, [contextSwitchNetwork]);

  // Auto-connect preference management
  const setAutoConnect = useCallback((enabled: boolean): void => {
    updatePreferences({ autoConnect: enabled });
  }, [updatePreferences]);

  // Utility functions
  const requiresInstallation = useCallback((walletName: string): boolean => {
    const wallet = supportedWallets.find(w => w.name === walletName);
    return wallet ? !wallet.installed : true;
  }, [supportedWallets]);

  const getWalletDownloadUrl = useCallback((walletName: string): string | null => {
    const wallet = supportedWallets.find(w => w.name === walletName);
    return wallet?.downloadUrl || wallet?.url || null;
  }, [supportedWallets]);

  return {
    // Connection state
    connected,
    connecting,
    disconnecting,
    publicKey,
    walletName,
    error,

    // Formatted values
    address,
    shortAddress,

    // Connection functions
    connect,
    disconnect,
    selectWallet,

    // Wallet management
    supportedWallets,
    installedWallets,
    availableWallets,

    // Network management
    networkName,
    networkDisplayName,
    switchNetwork,

    // Preferences
    autoConnect: preferences.autoConnect,
    lastConnectedWallet: preferences.lastConnectedWallet,
    setAutoConnect,

    // Utility functions
    isValidConnection,
    canConnect,
    requiresInstallation,
    getWalletDownloadUrl
  };
};

export default useWallet; 