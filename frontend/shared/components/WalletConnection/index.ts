// Wallet connection components
export { WalletButton } from './WalletButton';
export { WalletModal } from './WalletModal';
export { WalletStatus } from './WalletStatus';
export { WalletConnectionProvider } from './WalletConnectionProvider';

// Context and providers
export { WalletProvider, useWalletContext } from '../../contexts/WalletContext';

// Hooks
export { useWallet } from '../../hooks/useWallet';

// Types
export type {
  WalletConnectionState,
  WalletError,
  WalletErrorCode,
  WalletPreferences,
  WalletConnectionOptions,
  SupportedWallet,
  WalletConnectionEvents,
  NetworkInfo,
  WalletContextValue
} from '../../types/wallet';

// Utilities
export {
  storage,
  walletPreferences,
  detectWallets,
  checkWalletInstalled,
  createWalletError,
  handleWalletError,
  connectWithTimeout,
  retryConnection,
  validatePublicKey,
  validateWalletConnection,
  formatWalletAddress,
  formatWalletName,
  debugWalletState
} from '../../utils/wallet';

// Configuration
export {
  SUPPORTED_WALLETS,
  NETWORKS,
  DEFAULT_NETWORK,
  WALLET_CONNECTION_CONFIG,
  STORAGE_KEYS,
  RPC_ENDPOINTS,
  WALLET_FEATURES,
  ERROR_MESSAGES,
  TIMEOUTS,
  getWalletAdapters
} from '../../config/wallet';

// Re-export for convenience
export default WalletButton; 