import { WalletAdapter } from '@solana/wallet-adapter-base';
import { PublicKey } from '@solana/web3.js';
import { 
  WalletError, 
  WalletErrorCode, 
  WalletPreferences, 
  WalletConnectionOptions,
  SupportedWallet 
} from '../types/wallet';
import { 
  STORAGE_KEYS, 
  ERROR_MESSAGES, 
  WALLET_CONNECTION_CONFIG,
  SUPPORTED_WALLETS 
} from '../config/wallet';

// Local storage utilities
export const storage = {
  get: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return null;
    }
  },

  set: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('Failed to write to localStorage:', error);
    }
  },

  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  },

  clear: (): void => {
    if (typeof window === 'undefined') return;
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }
};

// Wallet preferences management
export const walletPreferences = {
  get: (): WalletPreferences => {
    const stored = storage.get(STORAGE_KEYS.WALLET_PREFERENCES);
    const defaults: WalletPreferences = {
      autoConnect: WALLET_CONNECTION_CONFIG.autoConnect,
      lastConnectedWallet: null,
      networkPreference: 'devnet'
    };

    if (!stored) return defaults;

    try {
      return { ...defaults, ...JSON.parse(stored) };
    } catch (error) {
      console.warn('Failed to parse wallet preferences:', error);
      return defaults;
    }
  },

  set: (preferences: Partial<WalletPreferences>): void => {
    const current = walletPreferences.get();
    const updated = { ...current, ...preferences };
    storage.set(STORAGE_KEYS.WALLET_PREFERENCES, JSON.stringify(updated));
  },

  clear: (): void => {
    storage.remove(STORAGE_KEYS.WALLET_PREFERENCES);
  }
};

// Wallet detection utilities
export const detectWallets = (): SupportedWallet[] => {
  if (typeof window === 'undefined') {
    return SUPPORTED_WALLETS.map(wallet => ({
      ...wallet,
      installed: false,
      adapter: null as any
    }));
  }

  return SUPPORTED_WALLETS.map(wallet => {
    const installed = checkWalletInstalled(wallet.name);
    return {
      ...wallet,
      installed,
      adapter: null as any // Will be populated by the context
    };
  });
};

export const checkWalletInstalled = (walletName: string): boolean => {
  if (typeof window === 'undefined') return false;

  const walletChecks: Record<string, () => boolean> = {
    'Phantom': () => !!(window as any).phantom?.solana,
    'Solflare': () => !!(window as any).solflare,
    'Backpack': () => !!(window as any).backpack,
    'Glow': () => !!(window as any).glow,
    'Slope': () => !!(window as any).slope
  };

  return walletChecks[walletName]?.() ?? false;
};

// Error handling utilities
export const createWalletError = (
  code: WalletErrorCode,
  originalError?: Error | any,
  customMessage?: string
): WalletError => {
  const message = customMessage || ERROR_MESSAGES[code] || 'An unknown error occurred';
  
  return {
    code,
    message,
    details: originalError ? {
      name: originalError.name,
      message: originalError.message,
      stack: originalError.stack
    } : undefined
  };
};

export const handleWalletError = (error: any): WalletError => {
  if (error?.code && Object.values(WalletErrorCode).includes(error.code)) {
    return error as WalletError;
  }

  // Map common wallet errors
  const errorMessage = error?.message || error?.toString() || '';
  
  if (errorMessage.includes('User rejected')) {
    return createWalletError(WalletErrorCode.USER_REJECTED, error);
  }
  
  if (errorMessage.includes('not found') || errorMessage.includes('not installed')) {
    return createWalletError(WalletErrorCode.WALLET_NOT_FOUND, error);
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
    return createWalletError(WalletErrorCode.NETWORK_ERROR, error);
  }
  
  if (errorMessage.includes('transaction')) {
    return createWalletError(WalletErrorCode.TRANSACTION_FAILED, error);
  }

  return createWalletError(WalletErrorCode.UNKNOWN_ERROR, error);
};

// Connection utilities
export const connectWithTimeout = async <T>(
  promise: Promise<T>,
  timeout: number = WALLET_CONNECTION_CONFIG.timeout
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), timeout)
    )
  ]);
};

export const retryConnection = async <T>(
  operation: () => Promise<T>,
  maxAttempts: number = WALLET_CONNECTION_CONFIG.retryAttempts,
  delay: number = WALLET_CONNECTION_CONFIG.retryDelay
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxAttempts) {
        throw error;
      }
      
      // Don't retry user rejections
      if (error?.message?.includes('User rejected')) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
};

// Validation utilities
export const validatePublicKey = (publicKey: string | PublicKey | null): PublicKey | null => {
  if (!publicKey) return null;
  
  try {
    if (typeof publicKey === 'string') {
      return new PublicKey(publicKey);
    }
    return publicKey;
  } catch (error) {
    console.warn('Invalid public key:', error);
    return null;
  }
};

export const validateWalletConnection = (
  wallet: WalletAdapter | null,
  publicKey: PublicKey | null
): boolean => {
  return !!(wallet && publicKey && wallet.connected);
};

// Formatting utilities
export const formatWalletAddress = (
  publicKey: PublicKey | string | null,
  length: number = 8
): string => {
  if (!publicKey) return '';
  
  const address = publicKey.toString();
  if (address.length <= length * 2) return address;
  
  return `${address.slice(0, length)}...${address.slice(-length)}`;
};

export const formatWalletName = (walletName: string): string => {
  return walletName.charAt(0).toUpperCase() + walletName.slice(1).toLowerCase();
};

// Debug utilities
export const debugWalletState = (
  wallet: WalletAdapter | null,
  publicKey: PublicKey | null,
  connected: boolean
): void => {
  if (process.env.NODE_ENV !== 'development') return;
  
  console.group('🔍 Wallet Debug State');
  console.log('Wallet:', wallet?.name || 'None');
  console.log('Public Key:', publicKey?.toString() || 'None');
  console.log('Connected:', connected);
  console.log('Wallet Connected:', wallet?.connected);
  console.log('Wallet Connecting:', wallet?.connecting);
  console.log('Wallet Disconnecting:', wallet?.connecting);
  console.groupEnd();
}; 