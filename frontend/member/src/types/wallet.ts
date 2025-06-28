import { WalletAdapter } from '@solana/wallet-adapter-base';
import { PublicKey } from '@solana/web3.js';

export interface WalletConnectionState {
  connected: boolean;
  connecting: boolean;
  disconnecting: boolean;
  publicKey: PublicKey | null;
  wallet: WalletAdapter | null;
  error: WalletError | null;
}

export interface WalletError {
  code: WalletErrorCode;
  message: string;
  details?: any;
}

export enum WalletErrorCode {
  WALLET_NOT_FOUND = 'WALLET_NOT_FOUND',
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  DISCONNECTION_FAILED = 'DISCONNECTION_FAILED',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  UNSUPPORTED_OPERATION = 'UNSUPPORTED_OPERATION',
  USER_REJECTED = 'USER_REJECTED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface WalletPreferences {
  autoConnect: boolean;
  lastConnectedWallet: string | null;
  networkPreference: 'mainnet-beta' | 'devnet' | 'testnet';
}

export interface WalletConnectionOptions {
  onlyIfTrusted?: boolean;
  timeout?: number;
}

export interface SupportedWallet {
  name: string;
  icon: string;
  url: string;
  downloadUrl: string;
  installed?: boolean;
  adapter: WalletAdapter;
}

export interface WalletConnectionEvents {
  onConnect?: (publicKey: PublicKey) => void;
  onDisconnect?: () => void;
  onError?: (error: WalletError) => void;
  onWalletChange?: (wallet: WalletAdapter | null) => void;
}

export interface NetworkInfo {
  name: string;
  endpoint: string;
  chainId: string;
  displayName: string;
}

export interface WalletContextValue extends WalletConnectionState {
  connect: (walletName?: string, options?: WalletConnectionOptions) => Promise<void>;
  disconnect: () => Promise<void>;
  selectWallet: (walletName: string) => void;
  supportedWallets: SupportedWallet[];
  preferences: WalletPreferences;
  updatePreferences: (preferences: Partial<WalletPreferences>) => void;
  networkInfo: NetworkInfo;
  switchNetwork: (network: 'mainnet-beta' | 'devnet' | 'testnet') => Promise<void>;
} 