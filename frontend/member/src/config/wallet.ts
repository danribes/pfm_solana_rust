import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  BackpackWalletAdapter,
  GlowWalletAdapter,
  SlopeWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { NetworkInfo } from '../types/wallet';

// Wallet adapter instances
export const getWalletAdapters = () => [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
  new BackpackWalletAdapter(),
  new GlowWalletAdapter(),
  new SlopeWalletAdapter(),
];

// Supported wallet configurations
export const SUPPORTED_WALLETS = [
  {
    name: 'Phantom',
    icon: '/wallets/phantom.svg',
    url: 'https://phantom.app/',
    downloadUrl: 'https://phantom.app/download'
  },
  {
    name: 'Solflare',
    icon: '/wallets/solflare.svg',
    url: 'https://solflare.com/',
    downloadUrl: 'https://solflare.com/download'
  },
  {
    name: 'Backpack',
    icon: '/wallets/backpack.svg',
    url: 'https://backpack.app/',
    downloadUrl: 'https://backpack.app/download'
  },
  {
    name: 'Glow',
    icon: '/wallets/glow.svg',
    url: 'https://glow.app/',
    downloadUrl: 'https://glow.app/download'
  },
  {
    name: 'Slope',
    icon: '/wallets/slope.svg',
    url: 'https://slope.finance/',
    downloadUrl: 'https://slope.finance/download'
  }
];

// Network configurations
export const NETWORKS: Record<string, NetworkInfo> = {
  'mainnet-beta': {
    name: 'mainnet-beta',
    endpoint: clusterApiUrl('mainnet-beta'),
    chainId: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
    displayName: 'Mainnet Beta'
  },
  'devnet': {
    name: 'devnet',
    endpoint: clusterApiUrl('devnet'),
    chainId: 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
    displayName: 'Devnet'
  },
  'testnet': {
    name: 'testnet',
    endpoint: clusterApiUrl('testnet'),
    chainId: '4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z',
    displayName: 'Testnet'
  }
};

// Default network based on environment
export const DEFAULT_NETWORK = process.env.NODE_ENV === 'production' 
  ? 'mainnet-beta' 
  : 'devnet';

// Connection configuration
export const WALLET_CONNECTION_CONFIG = {
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
  autoConnect: true,
  onlyIfTrusted: true
};

// Local storage keys
export const STORAGE_KEYS = {
  WALLET_PREFERENCES: 'pfm_wallet_preferences',
  LAST_CONNECTED_WALLET: 'pfm_last_connected_wallet',
  AUTO_CONNECT: 'pfm_auto_connect',
  NETWORK_PREFERENCE: 'pfm_network_preference'
};

// Wallet connection endpoints for different environments
export const RPC_ENDPOINTS = {
  'mainnet-beta': process.env.NEXT_PUBLIC_MAINNET_RPC_URL || clusterApiUrl('mainnet-beta'),
  'devnet': process.env.NEXT_PUBLIC_DEVNET_RPC_URL || clusterApiUrl('devnet'),
  'testnet': process.env.NEXT_PUBLIC_TESTNET_RPC_URL || clusterApiUrl('testnet'),
  'localhost': process.env.NEXT_PUBLIC_LOCALHOST_RPC_URL || 'http://localhost:8899'
};

// Feature flags
export const WALLET_FEATURES = {
  MULTI_WALLET_SUPPORT: true,
  NETWORK_SWITCHING: true,
  AUTO_CONNECT: true,
  REMEMBER_WALLET: true,
  CONNECTION_PERSISTENCE: true,
  TRANSACTION_SIMULATION: process.env.NODE_ENV !== 'production'
};

// Error messages
export const ERROR_MESSAGES = {
  WALLET_NOT_FOUND: 'Wallet not found. Please install the wallet extension.',
  CONNECTION_FAILED: 'Failed to connect to wallet. Please try again.',
  DISCONNECTION_FAILED: 'Failed to disconnect from wallet.',
  TRANSACTION_FAILED: 'Transaction failed. Please try again.',
  UNSUPPORTED_OPERATION: 'This operation is not supported by the selected wallet.',
  USER_REJECTED: 'Connection was rejected by user.',
  NETWORK_ERROR: 'Network error occurred. Please check your connection.',
  UNKNOWN_ERROR: 'An unknown error occurred. Please try again.'
};

// Connection timeouts
export const TIMEOUTS = {
  CONNECTION: 30000,
  TRANSACTION: 60000,
  NETWORK_SWITCH: 10000
}; 