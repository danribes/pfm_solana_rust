/**
 * Error Handling Configuration
 * Comprehensive configuration for blockchain error handling and recovery
 */

import {
  ErrorHandlingConfig,
  RecoveryStrategy,
  RecoveryAction,
  ErrorCategory,
  ErrorSeverity,
  LogLevel,
  NetworkErrorCode,
  TransactionErrorCode,
  ValidationErrorCode,
  RateLimitErrorCode
} from '../types/errors';

// ============================================================================
// Environment Configuration
// ============================================================================

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
const IS_TEST = process.env.NODE_ENV === 'test';

// ============================================================================
// Default Error Handling Configuration
// ============================================================================

export const DEFAULT_ERROR_CONFIG: ErrorHandlingConfig = {
  enableAutoRecovery: true,
  enableOfflineMode: !IS_PRODUCTION,
  maxRetries: IS_PRODUCTION ? 3 : 5,
  retryDelay: 1000,
  backoffMultiplier: 2,
  maxDelay: IS_PRODUCTION ? 30000 : 60000,
  timeout: IS_PRODUCTION ? 30000 : 60000,
  enableMetrics: true,
  logLevel: IS_PRODUCTION ? LogLevel.ERROR : LogLevel.DEBUG,
  notifications: {
    enableUserNotifications: true,
    enableSystemNotifications: IS_DEVELOPMENT,
    criticalErrorAlerts: IS_PRODUCTION,
    emailNotifications: false,
    slackNotifications: false
  }
};

// ============================================================================
// Recovery Strategies by Error Type
// ============================================================================

export const NETWORK_RECOVERY_STRATEGIES: Record<NetworkErrorCode, RecoveryStrategy> = {
  [NetworkErrorCode.CONNECTION_LOST]: {
    actions: [RecoveryAction.RECONNECT, RecoveryAction.RETRY],
    autoRetry: true,
    maxRetries: 5,
    retryDelay: 2000,
    backoffMultiplier: 1.5,
    maxDelay: 30000,
    timeout: 60000,
    fallbackStrategy: [RecoveryAction.SWITCH_NETWORK, RecoveryAction.REFRESH_PAGE]
  },
  [NetworkErrorCode.CONNECTION_TIMEOUT]: {
    actions: [RecoveryAction.RETRY, RecoveryAction.RECONNECT],
    autoRetry: true,
    maxRetries: 3,
    retryDelay: 5000,
    backoffMultiplier: 2,
    maxDelay: 30000,
    timeout: 30000,
    fallbackStrategy: [RecoveryAction.SWITCH_NETWORK]
  },
  [NetworkErrorCode.DNS_RESOLUTION_FAILED]: {
    actions: [RecoveryAction.SWITCH_NETWORK, RecoveryAction.REFRESH_PAGE],
    autoRetry: false,
    maxRetries: 1,
    retryDelay: 10000,
    backoffMultiplier: 1,
    maxDelay: 10000,
    timeout: 15000,
    fallbackStrategy: [RecoveryAction.CONTACT_SUPPORT]
  },
  [NetworkErrorCode.ENDPOINT_UNREACHABLE]: {
    actions: [RecoveryAction.SWITCH_NETWORK, RecoveryAction.WAIT],
    autoRetry: true,
    maxRetries: 2,
    retryDelay: 10000,
    backoffMultiplier: 2,
    maxDelay: 60000,
    timeout: 30000,
    fallbackStrategy: [RecoveryAction.REFRESH_PAGE]
  },
  [NetworkErrorCode.SSL_CERTIFICATE_ERROR]: {
    actions: [RecoveryAction.REFRESH_PAGE, RecoveryAction.CONTACT_SUPPORT],
    autoRetry: false,
    maxRetries: 1,
    retryDelay: 0,
    backoffMultiplier: 1,
    maxDelay: 0,
    timeout: 5000
  },
  [NetworkErrorCode.NETWORK_CONGESTION]: {
    actions: [RecoveryAction.WAIT, RecoveryAction.RETRY],
    autoRetry: true,
    maxRetries: 10,
    retryDelay: 5000,
    backoffMultiplier: 1.2,
    maxDelay: 60000,
    timeout: 120000,
    fallbackStrategy: [RecoveryAction.SWITCH_NETWORK]
  },
  [NetworkErrorCode.WEBSOCKET_DISCONNECTED]: {
    actions: [RecoveryAction.RECONNECT, RecoveryAction.RETRY],
    autoRetry: true,
    maxRetries: 5,
    retryDelay: 1000,
    backoffMultiplier: 1.5,
    maxDelay: 15000,
    timeout: 30000
  },
  [NetworkErrorCode.RPC_ENDPOINT_DOWN]: {
    actions: [RecoveryAction.SWITCH_NETWORK, RecoveryAction.WAIT],
    autoRetry: true,
    maxRetries: 3,
    retryDelay: 15000,
    backoffMultiplier: 2,
    maxDelay: 120000,
    timeout: 60000,
    fallbackStrategy: [RecoveryAction.CONTACT_SUPPORT]
  },
  [NetworkErrorCode.SLOW_NETWORK]: {
    actions: [RecoveryAction.WAIT, RecoveryAction.RETRY],
    autoRetry: true,
    maxRetries: 3,
    retryDelay: 3000,
    backoffMultiplier: 1.5,
    maxDelay: 30000,
    timeout: 60000
  },
  [NetworkErrorCode.PROXY_ERROR]: {
    actions: [RecoveryAction.REFRESH_PAGE, RecoveryAction.SWITCH_NETWORK],
    autoRetry: false,
    maxRetries: 1,
    retryDelay: 5000,
    backoffMultiplier: 1,
    maxDelay: 5000,
    timeout: 10000
  }
};

export const TRANSACTION_RECOVERY_STRATEGIES: Record<TransactionErrorCode, RecoveryStrategy> = {
  [TransactionErrorCode.INSUFFICIENT_FUNDS]: {
    actions: [RecoveryAction.CHECK_WALLET, RecoveryAction.MANUAL_INTERVENTION],
    autoRetry: false,
    maxRetries: 0,
    retryDelay: 0,
    backoffMultiplier: 1,
    maxDelay: 0,
    timeout: 0
  },
  [TransactionErrorCode.TRANSACTION_FAILED]: {
    actions: [RecoveryAction.RETRY],
    autoRetry: true,
    maxRetries: 2,
    retryDelay: 5000,
    backoffMultiplier: 2,
    maxDelay: 20000,
    timeout: 30000,
    fallbackStrategy: [RecoveryAction.MANUAL_INTERVENTION]
  },
  [TransactionErrorCode.TRANSACTION_TIMEOUT]: {
    actions: [RecoveryAction.RETRY, RecoveryAction.WAIT],
    autoRetry: true,
    maxRetries: 3,
    retryDelay: 10000,
    backoffMultiplier: 2,
    maxDelay: 60000,
    timeout: 120000
  },
  [TransactionErrorCode.INVALID_SIGNATURE]: {
    actions: [RecoveryAction.CHECK_WALLET, RecoveryAction.MANUAL_INTERVENTION],
    autoRetry: false,
    maxRetries: 0,
    retryDelay: 0,
    backoffMultiplier: 1,
    maxDelay: 0,
    timeout: 0
  },
  [TransactionErrorCode.NONCE_TOO_LOW]: {
    actions: [RecoveryAction.RETRY],
    autoRetry: true,
    maxRetries: 3,
    retryDelay: 2000,
    backoffMultiplier: 1.5,
    maxDelay: 10000,
    timeout: 30000
  },
  [TransactionErrorCode.NONCE_TOO_HIGH]: {
    actions: [RecoveryAction.WAIT, RecoveryAction.RETRY],
    autoRetry: true,
    maxRetries: 5,
    retryDelay: 5000,
    backoffMultiplier: 1.2,
    maxDelay: 30000,
    timeout: 60000
  },
  [TransactionErrorCode.GAS_LIMIT_EXCEEDED]: {
    actions: [RecoveryAction.MANUAL_INTERVENTION],
    autoRetry: false,
    maxRetries: 0,
    retryDelay: 0,
    backoffMultiplier: 1,
    maxDelay: 0,
    timeout: 0
  },
  [TransactionErrorCode.BLOCK_HASH_NOT_FOUND]: {
    actions: [RecoveryAction.RETRY],
    autoRetry: true,
    maxRetries: 3,
    retryDelay: 3000,
    backoffMultiplier: 2,
    maxDelay: 15000,
    timeout: 45000
  },
  [TransactionErrorCode.ACCOUNT_NOT_FOUND]: {
    actions: [RecoveryAction.CHECK_WALLET, RecoveryAction.MANUAL_INTERVENTION],
    autoRetry: false,
    maxRetries: 0,
    retryDelay: 0,
    backoffMultiplier: 1,
    maxDelay: 0,
    timeout: 0
  },
  [TransactionErrorCode.PROGRAM_ERROR]: {
    actions: [RecoveryAction.MANUAL_INTERVENTION],
    autoRetry: false,
    maxRetries: 0,
    retryDelay: 0,
    backoffMultiplier: 1,
    maxDelay: 0,
    timeout: 0
  },
  [TransactionErrorCode.INSTRUCTION_ERROR]: {
    actions: [RecoveryAction.MANUAL_INTERVENTION],
    autoRetry: false,
    maxRetries: 0,
    retryDelay: 0,
    backoffMultiplier: 1,
    maxDelay: 0,
    timeout: 0
  },
  [TransactionErrorCode.SIMULATION_FAILED]: {
    actions: [RecoveryAction.RETRY],
    autoRetry: true,
    maxRetries: 2,
    retryDelay: 3000,
    backoffMultiplier: 2,
    maxDelay: 12000,
    timeout: 30000,
    fallbackStrategy: [RecoveryAction.MANUAL_INTERVENTION]
  },
  [TransactionErrorCode.SEND_TRANSACTION_FAILED]: {
    actions: [RecoveryAction.RETRY, RecoveryAction.RECONNECT],
    autoRetry: true,
    maxRetries: 3,
    retryDelay: 2000,
    backoffMultiplier: 2,
    maxDelay: 15000,
    timeout: 45000
  },
  [TransactionErrorCode.CONFIRMATION_TIMEOUT]: {
    actions: [RecoveryAction.WAIT, RecoveryAction.RETRY],
    autoRetry: true,
    maxRetries: 5,
    retryDelay: 10000,
    backoffMultiplier: 1.5,
    maxDelay: 60000,
    timeout: 300000 // 5 minutes
  },
  [TransactionErrorCode.TRANSACTION_REJECTED]: {
    actions: [RecoveryAction.MANUAL_INTERVENTION],
    autoRetry: false,
    maxRetries: 0,
    retryDelay: 0,
    backoffMultiplier: 1,
    maxDelay: 0,
    timeout: 0
  }
};

export const RATE_LIMIT_RECOVERY_STRATEGIES: Record<RateLimitErrorCode, RecoveryStrategy> = {
  [RateLimitErrorCode.TOO_MANY_REQUESTS]: {
    actions: [RecoveryAction.WAIT, RecoveryAction.RETRY],
    autoRetry: true,
    maxRetries: 10,
    retryDelay: 5000,
    backoffMultiplier: 1.2,
    maxDelay: 120000,
    timeout: 300000
  },
  [RateLimitErrorCode.QUOTA_EXCEEDED]: {
    actions: [RecoveryAction.WAIT, RecoveryAction.SWITCH_NETWORK],
    autoRetry: true,
    maxRetries: 3,
    retryDelay: 60000,
    backoffMultiplier: 2,
    maxDelay: 300000,
    timeout: 600000,
    fallbackStrategy: [RecoveryAction.CONTACT_SUPPORT]
  },
  [RateLimitErrorCode.BURST_LIMIT_EXCEEDED]: {
    actions: [RecoveryAction.WAIT, RecoveryAction.RETRY],
    autoRetry: true,
    maxRetries: 5,
    retryDelay: 2000,
    backoffMultiplier: 1.5,
    maxDelay: 30000,
    timeout: 120000
  },
  [RateLimitErrorCode.DAILY_LIMIT_EXCEEDED]: {
    actions: [RecoveryAction.WAIT, RecoveryAction.SWITCH_NETWORK],
    autoRetry: false,
    maxRetries: 1,
    retryDelay: 3600000, // 1 hour
    backoffMultiplier: 1,
    maxDelay: 3600000,
    timeout: 86400000, // 24 hours
    fallbackStrategy: [RecoveryAction.CONTACT_SUPPORT]
  },
  [RateLimitErrorCode.API_KEY_RATE_LIMITED]: {
    actions: [RecoveryAction.WAIT, RecoveryAction.SWITCH_NETWORK],
    autoRetry: true,
    maxRetries: 3,
    retryDelay: 30000,
    backoffMultiplier: 2,
    maxDelay: 300000,
    timeout: 600000
  },
  [RateLimitErrorCode.IP_RATE_LIMITED]: {
    actions: [RecoveryAction.WAIT, RecoveryAction.SWITCH_NETWORK],
    autoRetry: true,
    maxRetries: 5,
    retryDelay: 10000,
    backoffMultiplier: 1.5,
    maxDelay: 60000,
    timeout: 300000
  }
};

// ============================================================================
// User Message Templates
// ============================================================================

export const ERROR_MESSAGES: Record<string, { title: string; message: string; userMessage: string }> = {
  [NetworkErrorCode.CONNECTION_LOST]: {
    title: 'Connection Lost',
    message: 'Lost connection to the blockchain network. Attempting to reconnect...',
    userMessage: 'We\'re having trouble connecting to the blockchain. Please wait while we try to reconnect.'
  },
  [NetworkErrorCode.CONNECTION_TIMEOUT]: {
    title: 'Connection Timeout',
    message: 'Connection to the blockchain network timed out',
    userMessage: 'The blockchain network is taking too long to respond. We\'ll keep trying.'
  },
  [NetworkErrorCode.ENDPOINT_UNREACHABLE]: {
    title: 'Network Unreachable',
    message: 'Cannot reach the blockchain endpoint',
    userMessage: 'We can\'t reach the blockchain network right now. Trying alternative networks...'
  },
  [TransactionErrorCode.INSUFFICIENT_FUNDS]: {
    title: 'Insufficient Funds',
    message: 'Account does not have enough funds for this transaction',
    userMessage: 'You don\'t have enough funds in your wallet for this transaction. Please add funds and try again.'
  },
  [TransactionErrorCode.TRANSACTION_FAILED]: {
    title: 'Transaction Failed',
    message: 'The transaction failed to execute',
    userMessage: 'Your transaction failed. We\'ll try again automatically.'
  },
  [TransactionErrorCode.TRANSACTION_TIMEOUT]: {
    title: 'Transaction Timeout',
    message: 'Transaction confirmation timed out',
    userMessage: 'Your transaction is taking longer than expected. Please wait while we check the status.'
  },
  [RateLimitErrorCode.TOO_MANY_REQUESTS]: {
    title: 'Too Many Requests',
    message: 'Rate limit exceeded for API requests',
    userMessage: 'We\'re making too many requests right now. Please wait a moment while we slow down.'
  }
};

// ============================================================================
// Network Configuration
// ============================================================================

export const NETWORK_ENDPOINTS = {
  mainnet: ['https://api.mainnet-beta.solana.com'],
  devnet: ['https://api.devnet.solana.com'],
  testnet: ['https://api.testnet.solana.com'],
  localhost: ['http://localhost:8899']
};

export const NETWORK_FALLBACK_ORDER = ['devnet', 'testnet', 'mainnet'];

// ============================================================================
// Error Severity Configuration
// ============================================================================

export const ERROR_SEVERITY_CONFIG: Partial<Record<ErrorCategory, { default: ErrorSeverity; [key: string]: ErrorSeverity }>> = {
  [ErrorCategory.NETWORK]: {
    default: ErrorSeverity.MEDIUM,
    [NetworkErrorCode.CONNECTION_LOST]: ErrorSeverity.HIGH,
    [NetworkErrorCode.SSL_CERTIFICATE_ERROR]: ErrorSeverity.CRITICAL,
    [NetworkErrorCode.DNS_RESOLUTION_FAILED]: ErrorSeverity.HIGH
  },
  [ErrorCategory.TRANSACTION]: {
    default: ErrorSeverity.HIGH,
    [TransactionErrorCode.INSUFFICIENT_FUNDS]: ErrorSeverity.MEDIUM,
    [TransactionErrorCode.PROGRAM_ERROR]: ErrorSeverity.CRITICAL,
    [TransactionErrorCode.INVALID_SIGNATURE]: ErrorSeverity.CRITICAL
  },
  [ErrorCategory.VALIDATION]: {
    default: ErrorSeverity.MEDIUM
  },
  [ErrorCategory.RATE_LIMIT]: {
    default: ErrorSeverity.LOW,
    [RateLimitErrorCode.DAILY_LIMIT_EXCEEDED]: ErrorSeverity.HIGH
  }
};

// ============================================================================
// Cache Configuration
// ============================================================================

export const CACHE_CONFIG = {
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxSize: 1000,
  errorCacheTTL: 30 * 1000, // 30 seconds
  networkStatusTTL: 10 * 1000, // 10 seconds
  transactionStatusTTL: 30 * 1000, // 30 seconds
  accountInfoTTL: 60 * 1000, // 1 minute
  balanceTTL: 30 * 1000 // 30 seconds
};

// ============================================================================
// Monitoring Configuration
// ============================================================================

export const MONITORING_CONFIG = {
  enableHeartbeat: true,
  heartbeatInterval: 30000, // 30 seconds
  healthCheckTimeout: 10000, // 10 seconds
  metricsCollectionInterval: 60000, // 1 minute
  errorReportingThreshold: 0.1, // 10% error rate
  alertCooldown: 300000, // 5 minutes
  maxErrorHistory: 100
};

// ============================================================================
// Offline Mode Configuration
// ============================================================================

export const OFFLINE_CONFIG = {
  enableOfflineMode: !IS_PRODUCTION,
  maxQueueSize: 50,
  queuePersistence: true,
  offlineTimeoutDetection: 5000, // 5 seconds
  retryOfflineOperations: true,
  offlineDataRetention: 24 * 60 * 60 * 1000 // 24 hours
};

// ============================================================================
// Helper Functions
// ============================================================================

export function getRecoveryStrategy(errorCode: string, category: ErrorCategory): RecoveryStrategy | undefined {
  switch (category) {
    case ErrorCategory.NETWORK:
      return NETWORK_RECOVERY_STRATEGIES[errorCode as NetworkErrorCode];
    case ErrorCategory.TRANSACTION:
      return TRANSACTION_RECOVERY_STRATEGIES[errorCode as TransactionErrorCode];
    case ErrorCategory.RATE_LIMIT:
      return RATE_LIMIT_RECOVERY_STRATEGIES[errorCode as RateLimitErrorCode];
    default:
      return undefined;
  }
}

export function getErrorSeverity(category: ErrorCategory, errorCode?: string): ErrorSeverity {
  const categoryConfig = ERROR_SEVERITY_CONFIG[category];
  if (!categoryConfig) return ErrorSeverity.MEDIUM;
  
  if (errorCode && categoryConfig[errorCode]) {
    return categoryConfig[errorCode];
  }
  
  return categoryConfig.default || ErrorSeverity.MEDIUM;
}

export function getErrorMessage(errorCode: string) {
  return ERROR_MESSAGES[errorCode] || {
    title: 'Unknown Error',
    message: 'An unknown error occurred',
    userMessage: 'Something went wrong. Please try again.'
  };
}

export function createErrorHandlingConfig(overrides?: Partial<ErrorHandlingConfig>): ErrorHandlingConfig {
  return {
    ...DEFAULT_ERROR_CONFIG,
    ...overrides
  };
} 