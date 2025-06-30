/**
 * Blockchain Error Handling Types
 * Comprehensive error types for blockchain operations, network failures, and recovery
 */

// ============================================================================
// Base Error Types
// ============================================================================

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum ErrorCategory {
  NETWORK = 'NETWORK',
  TRANSACTION = 'TRANSACTION',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  RATE_LIMIT = 'RATE_LIMIT',
  TIMEOUT = 'TIMEOUT',
  BLOCKCHAIN = 'BLOCKCHAIN',
  USER = 'USER',
  SYSTEM = 'SYSTEM'
}

export enum RecoveryAction {
  RETRY = 'RETRY',
  RECONNECT = 'RECONNECT',
  SWITCH_NETWORK = 'SWITCH_NETWORK',
  REFRESH_PAGE = 'REFRESH_PAGE',
  CHECK_WALLET = 'CHECK_WALLET',
  CONTACT_SUPPORT = 'CONTACT_SUPPORT',
  WAIT = 'WAIT',
  MANUAL_INTERVENTION = 'MANUAL_INTERVENTION'
}

// ============================================================================
// Blockchain Error Interface
// ============================================================================

export interface BlockchainError {
  id: string;
  code: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  timestamp: Date;
  recoverable: boolean;
  retryable: boolean;
  userMessage: string;
  technicalDetails?: Record<string, any>;
  stack?: string;
  context?: ErrorContext;
  recovery?: RecoveryStrategy;
}

export interface ErrorContext {
  operation: string;
  network: string;
  walletAddress?: string;
  transactionId?: string;
  blockNumber?: number;
  endpoint?: string;
  userAgent?: string;
  sessionId?: string;
}

export interface RecoveryStrategy {
  actions: RecoveryAction[];
  autoRetry: boolean;
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
  maxDelay: number;
  timeout: number;
  fallbackStrategy?: RecoveryAction[];
}

// ============================================================================
// Network Error Types
// ============================================================================

export enum NetworkErrorCode {
  CONNECTION_LOST = 'CONNECTION_LOST',
  CONNECTION_TIMEOUT = 'CONNECTION_TIMEOUT',
  DNS_RESOLUTION_FAILED = 'DNS_RESOLUTION_FAILED',
  ENDPOINT_UNREACHABLE = 'ENDPOINT_UNREACHABLE',
  SSL_CERTIFICATE_ERROR = 'SSL_CERTIFICATE_ERROR',
  NETWORK_CONGESTION = 'NETWORK_CONGESTION',
  WEBSOCKET_DISCONNECTED = 'WEBSOCKET_DISCONNECTED',
  RPC_ENDPOINT_DOWN = 'RPC_ENDPOINT_DOWN',
  SLOW_NETWORK = 'SLOW_NETWORK',
  PROXY_ERROR = 'PROXY_ERROR'
}

export interface NetworkError extends BlockchainError {
  code: NetworkErrorCode;
  networkInfo: NetworkInfo;
  connectionAttempts: number;
  lastSuccessfulConnection?: Date;
}

export interface NetworkInfo {
  endpoint: string;
  network: string;
  responseTime?: number;
  status: NetworkStatus;
  lastCheck: Date;
  errorCount: number;
  successCount: number;
}

export enum NetworkStatus {
  HEALTHY = 'HEALTHY',
  DEGRADED = 'DEGRADED',
  DOWN = 'DOWN',
  UNKNOWN = 'UNKNOWN'
}

// ============================================================================
// Transaction Error Types
// ============================================================================

export enum TransactionErrorCode {
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  TRANSACTION_TIMEOUT = 'TRANSACTION_TIMEOUT',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  NONCE_TOO_LOW = 'NONCE_TOO_LOW',
  NONCE_TOO_HIGH = 'NONCE_TOO_HIGH',
  GAS_LIMIT_EXCEEDED = 'GAS_LIMIT_EXCEEDED',
  BLOCK_HASH_NOT_FOUND = 'BLOCK_HASH_NOT_FOUND',
  ACCOUNT_NOT_FOUND = 'ACCOUNT_NOT_FOUND',
  PROGRAM_ERROR = 'PROGRAM_ERROR',
  INSTRUCTION_ERROR = 'INSTRUCTION_ERROR',
  SIMULATION_FAILED = 'SIMULATION_FAILED',
  SEND_TRANSACTION_FAILED = 'SEND_TRANSACTION_FAILED',
  CONFIRMATION_TIMEOUT = 'CONFIRMATION_TIMEOUT',
  TRANSACTION_REJECTED = 'TRANSACTION_REJECTED'
}

export interface TransactionError extends BlockchainError {
  code: TransactionErrorCode;
  transactionInfo: TransactionInfo;
  gasUsed?: number;
  gasLimit?: number;
  blockNumber?: number;
  transactionIndex?: number;
}

export interface TransactionInfo {
  hash?: string;
  from?: string;
  to?: string;
  value?: string;
  gasPrice?: string;
  gasLimit?: string;
  nonce?: number;
  data?: string;
  status: TransactionStatus;
  attempts: number;
  lastAttempt: Date;
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
  TIMEOUT = 'TIMEOUT',
  CANCELLED = 'CANCELLED',
  REPLACED = 'REPLACED'
}

// ============================================================================
// Validation Error Types
// ============================================================================

export enum ValidationErrorCode {
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  INVALID_PRIVATE_KEY = 'INVALID_PRIVATE_KEY',
  INVALID_PUBLIC_KEY = 'INVALID_PUBLIC_KEY',
  INVALID_TRANSACTION_DATA = 'INVALID_TRANSACTION_DATA',
  INVALID_CONTRACT_ADDRESS = 'INVALID_CONTRACT_ADDRESS',
  INVALID_TOKEN_ADDRESS = 'INVALID_TOKEN_ADDRESS',
  INVALID_NETWORK = 'INVALID_NETWORK',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  VALUE_OUT_OF_RANGE = 'VALUE_OUT_OF_RANGE'
}

export interface ValidationError extends BlockchainError {
  code: ValidationErrorCode;
  field: string;
  value: any;
  expectedFormat?: string;
  constraints?: ValidationConstraints;
}

export interface ValidationConstraints {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
  type?: string;
}

// ============================================================================
// Rate Limit Error Types
// ============================================================================

export enum RateLimitErrorCode {
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  BURST_LIMIT_EXCEEDED = 'BURST_LIMIT_EXCEEDED',
  DAILY_LIMIT_EXCEEDED = 'DAILY_LIMIT_EXCEEDED',
  API_KEY_RATE_LIMITED = 'API_KEY_RATE_LIMITED',
  IP_RATE_LIMITED = 'IP_RATE_LIMITED'
}

export interface RateLimitError extends BlockchainError {
  code: RateLimitErrorCode;
  rateLimitInfo: RateLimitInfo;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: Date;
  retryAfter: number;
  limitType: 'requests' | 'tokens' | 'bandwidth';
  window: number; // time window in seconds
}

// ============================================================================
// Error Recovery and State Management
// ============================================================================

export interface ErrorState {
  errors: BlockchainError[];
  isRecovering: boolean;
  lastError?: BlockchainError;
  recoveryAttempts: number;
  maxRecoveryAttempts: number;
  systemStatus: SystemStatus;
  degradedFeatures: string[];
}

export enum SystemStatus {
  OPERATIONAL = 'OPERATIONAL',
  DEGRADED = 'DEGRADED',
  MAINTENANCE = 'MAINTENANCE',
  OFFLINE = 'OFFLINE'
}

export interface RecoveryState {
  isActive: boolean;
  strategy: RecoveryStrategy;
  currentAction: RecoveryAction;
  attempt: number;
  startTime: Date;
  lastAttempt: Date;
  nextAttempt?: Date;
  progress: number; // 0-100
  status: RecoveryStatus;
  logs: RecoveryLog[];
}

export enum RecoveryStatus {
  IDLE = 'IDLE',
  IN_PROGRESS = 'IN_PROGRESS',
  PAUSED = 'PAUSED',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  TIMEOUT = 'TIMEOUT'
}

export interface RecoveryLog {
  timestamp: Date;
  action: RecoveryAction;
  status: 'started' | 'completed' | 'failed';
  message: string;
  details?: Record<string, any>;
}

// ============================================================================
// User Feedback Types
// ============================================================================

export interface UserFeedback {
  type: FeedbackType;
  title: string;
  message: string;
  actions: UserAction[];
  severity: ErrorSeverity;
  persistent: boolean;
  autoClose: boolean;
  closeDelay?: number;
  icon?: string;
  color?: string;
}

export enum FeedbackType {
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  LOADING = 'LOADING'
}

export interface UserAction {
  label: string;
  action: () => void | Promise<void>;
  primary?: boolean;
  dangerous?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

// ============================================================================
// Offline Mode and Degraded Service Types
// ============================================================================

export interface OfflineState {
  isOffline: boolean;
  lastOnline: Date;
  offlineDuration: number;
  queuedOperations: QueuedOperation[];
  cachedData: CachedData[];
  degradedServices: string[];
}

export interface QueuedOperation {
  id: string;
  type: OperationType;
  data: any;
  timestamp: Date;
  priority: OperationPriority;
  retries: number;
  maxRetries: number;
}

export enum OperationType {
  TRANSACTION = 'TRANSACTION',
  QUERY = 'QUERY',
  SUBSCRIPTION = 'SUBSCRIPTION',
  STATE_UPDATE = 'STATE_UPDATE'
}

export enum OperationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface CachedData {
  key: string;
  data: any;
  timestamp: Date;
  ttl: number;
  type: CacheType;
}

export enum CacheType {
  BALANCE = 'BALANCE',
  TRANSACTION = 'TRANSACTION',
  ACCOUNT_INFO = 'ACCOUNT_INFO',
  NETWORK_INFO = 'NETWORK_INFO',
  CONTRACT_DATA = 'CONTRACT_DATA'
}

// ============================================================================
// Monitoring and Analytics Types
// ============================================================================

export interface ErrorMetrics {
  errorCount: number;
  errorRate: number;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  recoverySuccessRate: number;
  meanTimeToRecovery: number;
  networkUptime: number;
  lastUpdate: Date;
}

export interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  successRate: number;
  availability: number;
  latency: LatencyMetrics;
}

export interface LatencyMetrics {
  mean: number;
  median: number;
  p95: number;
  p99: number;
  max: number;
  min: number;
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface ErrorHandlingConfig {
  enableAutoRecovery: boolean;
  enableOfflineMode: boolean;
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
  maxDelay: number;
  timeout: number;
  enableMetrics: boolean;
  logLevel: LogLevel;
  notifications: NotificationConfig;
}

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL'
}

export interface NotificationConfig {
  enableUserNotifications: boolean;
  enableSystemNotifications: boolean;
  criticalErrorAlerts: boolean;
  emailNotifications: boolean;
  slackNotifications: boolean;
}

// ============================================================================
// Factory Functions for Creating Errors
// ============================================================================

export interface ErrorFactory {
  createNetworkError: (code: NetworkErrorCode, context: ErrorContext, details?: any) => NetworkError;
  createTransactionError: (code: TransactionErrorCode, context: ErrorContext, details?: any) => TransactionError;
  createValidationError: (code: ValidationErrorCode, field: string, value: any, context: ErrorContext) => ValidationError;
  createRateLimitError: (code: RateLimitErrorCode, rateLimitInfo: RateLimitInfo, context: ErrorContext) => RateLimitError;
  createGenericError: (code: string, message: string, category: ErrorCategory, context: ErrorContext) => BlockchainError;
} 