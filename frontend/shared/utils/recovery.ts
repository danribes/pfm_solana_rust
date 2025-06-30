/**
 * Recovery Utilities
 * Helper functions for blockchain error recovery and resilience
 */

import {
  BlockchainError,
  NetworkError,
  TransactionError,
  ErrorCategory,
  ErrorSeverity,
  NetworkErrorCode,
  TransactionErrorCode,
  RecoveryAction,
  RecoveryStrategy,
  OperationType,
  OperationPriority,
  NetworkInfo,
  NetworkStatus,
  ErrorContext
} from '../types/errors';

import {
  NETWORK_ENDPOINTS,
  NETWORK_FALLBACK_ORDER,
  getRecoveryStrategy,
  getErrorSeverity
} from '../config/errors';

import { errorHandlingService } from '../services/errorHandling';

// ============================================================================
// Network Recovery Utilities
// ============================================================================

/**
 * Attempt to recover from network errors
 */
export async function recoverFromNetworkError(
  error: NetworkError,
  maxRetries: number = 3
): Promise<boolean> {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      switch (error.code) {
        case NetworkErrorCode.CONNECTION_LOST:
        case NetworkErrorCode.CONNECTION_TIMEOUT:
          await attemptReconnection(error.networkInfo.network);
          break;
          
        case NetworkErrorCode.ENDPOINT_UNREACHABLE:
        case NetworkErrorCode.RPC_ENDPOINT_DOWN:
          await switchToFallbackNetwork(error.networkInfo.network);
          break;
          
        case NetworkErrorCode.NETWORK_CONGESTION:
          await waitForNetworkRecovery(error.networkInfo.network);
          break;
          
        case NetworkErrorCode.WEBSOCKET_DISCONNECTED:
          await reconnectWebSocket(error.networkInfo.network);
          break;
          
        default:
          throw new Error(`Unsupported recovery for error code: ${error.code}`);
      }
      
      // Recovery successful
      return true;
      
    } catch (recoveryError) {
      attempt++;
      
      if (attempt < maxRetries) {
        // Wait before next attempt with exponential backoff
        const delay = 1000 * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  return false; // Recovery failed
}

/**
 * Attempt to reconnect to the network
 */
export async function attemptReconnection(network: string): Promise<void> {
  const endpoints = NETWORK_ENDPOINTS[network as keyof typeof NETWORK_ENDPOINTS];
  if (!endpoints || endpoints.length === 0) {
    throw new Error(`No endpoints available for network: ${network}`);
  }

  // Simulate network check
  await new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.1) {
        reject(new Error('Connection failed'));
      } else {
        resolve(true);
      }
    }, 1000);
  });
}

/**
 * Switch to a fallback network
 */
export async function switchToFallbackNetwork(currentNetwork: string): Promise<string> {
  const currentIndex = NETWORK_FALLBACK_ORDER.indexOf(currentNetwork);
  
  if (currentIndex === -1) {
    throw new Error(`Network ${currentNetwork} not found in fallback order`);
  }
  
  // Try each fallback network in order
  for (let i = currentIndex + 1; i < NETWORK_FALLBACK_ORDER.length; i++) {
    const fallbackNetwork = NETWORK_FALLBACK_ORDER[i];
    
    try {
      await testNetworkHealth(fallbackNetwork);
      return fallbackNetwork; // Success
    } catch (error) {
      // Continue to next fallback
      continue;
    }
  }
  
  throw new Error('No healthy fallback networks available');
}

/**
 * Wait for network congestion to clear
 */
export async function waitForNetworkRecovery(
  network: string,
  maxWaitTime: number = 30000
): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitTime) {
    try {
      const health = await checkNetworkHealth(network);
      
      if (health.status === NetworkStatus.HEALTHY) {
        return; // Network recovered
      }
      
      // Wait before next check
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      // Continue waiting
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  throw new Error(`Network ${network} did not recover within ${maxWaitTime}ms`);
}

/**
 * Reconnect WebSocket connection
 */
export async function reconnectWebSocket(network: string): Promise<void> {
  // Simulate WebSocket reconnection
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test the connection
  await testNetworkHealth(network);
}

// ============================================================================
// Transaction Recovery Utilities
// ============================================================================

/**
 * Attempt to recover from transaction errors
 */
export async function recoverFromTransactionError(
  error: TransactionError,
  retryOptions?: {
    maxRetries?: number;
    baseDelay?: number;
    backoffMultiplier?: number;
  }
): Promise<boolean> {
  const {
    maxRetries = 3,
    baseDelay = 2000,
    backoffMultiplier = 1.5
  } = retryOptions || {};
  
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      switch (error.code) {
        case TransactionErrorCode.TRANSACTION_TIMEOUT:
          await waitForTransactionConfirmation(error.transactionInfo.hash);
          break;
          
        case TransactionErrorCode.NONCE_TOO_LOW:
        case TransactionErrorCode.NONCE_TOO_HIGH:
          await adjustTransactionNonce(error);
          break;
          
        case TransactionErrorCode.BLOCK_HASH_NOT_FOUND:
          await updateTransactionBlockhash(error);
          break;
          
        case TransactionErrorCode.SEND_TRANSACTION_FAILED:
          await retryTransactionSend(error);
          break;
          
        case TransactionErrorCode.SIMULATION_FAILED:
          await retryTransactionSimulation(error);
          break;
          
        default:
          return false; // Cannot recover from this error type
      }
      
      return true; // Recovery successful
      
    } catch (recoveryError) {
      attempt++;
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(backoffMultiplier, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  return false; // Recovery failed
}

/**
 * Wait for transaction confirmation
 */
export async function waitForTransactionConfirmation(
  transactionHash?: string,
  timeout: number = 60000
): Promise<void> {
  if (!transactionHash) {
    throw new Error('Transaction hash is required');
  }
  
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      // Simulate checking transaction status
      const confirmed = Math.random() > 0.7; // 30% chance of confirmation each check
      
      if (confirmed) {
        return; // Transaction confirmed
      }
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
    } catch (error) {
      // Continue waiting
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  throw new Error(`Transaction ${transactionHash} confirmation timeout`);
}

/**
 * Adjust transaction nonce
 */
export async function adjustTransactionNonce(error: TransactionError): Promise<void> {
  // Simulate nonce adjustment
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // This would typically involve getting the current nonce and updating the transaction
  console.log(`Adjusting nonce for transaction ${error.transactionInfo.hash}`);
}

/**
 * Update transaction blockhash
 */
export async function updateTransactionBlockhash(error: TransactionError): Promise<void> {
  // Simulate blockhash update
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log(`Updating blockhash for transaction ${error.transactionInfo.hash}`);
}

/**
 * Retry transaction send
 */
export async function retryTransactionSend(error: TransactionError): Promise<void> {
  // Simulate transaction retry
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log(`Retrying send for transaction ${error.transactionInfo.hash}`);
}

/**
 * Retry transaction simulation
 */
export async function retryTransactionSimulation(error: TransactionError): Promise<void> {
  // Simulate simulation retry
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log(`Retrying simulation for transaction ${error.transactionInfo.hash}`);
}

// ============================================================================
// Network Health Utilities
// ============================================================================

/**
 * Test endpoint connection
 */
export async function testEndpointConnection(endpoint: string): Promise<number> {
  const startTime = Date.now();
  
  try {
    // Simulate network request
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        // 10% chance of failure
        if (Math.random() < 0.1) {
          reject(new Error('Connection failed'));
        } else {
          resolve(true);
        }
      }, Math.random() * 2000); // Random latency 0-2s
    });
    
    return Date.now() - startTime;
    
  } catch (error) {
    throw new Error(`Failed to connect to ${endpoint}: ${error.message}`);
  }
}

/**
 * Test network health
 */
export async function testNetworkHealth(network: string): Promise<void> {
  const endpoints = NETWORK_ENDPOINTS[network as keyof typeof NETWORK_ENDPOINTS];
  if (!endpoints || endpoints.length === 0) {
    throw new Error(`No endpoints configured for network: ${network}`);
  }
  
  // Test primary endpoint
  await testEndpointConnection(endpoints[0]);
}

/**
 * Check comprehensive network health
 */
export async function checkNetworkHealth(network: string): Promise<NetworkInfo> {
  const endpoints = NETWORK_ENDPOINTS[network as keyof typeof NETWORK_ENDPOINTS];
  if (!endpoints || endpoints.length === 0) {
    throw new Error(`No endpoints configured for network: ${network}`);
  }
  
  try {
    const responseTime = await testEndpointConnection(endpoints[0]);
    
    return {
      endpoint: endpoints[0],
      network,
      responseTime,
      status: responseTime < 1000 ? NetworkStatus.HEALTHY : 
              responseTime < 3000 ? NetworkStatus.DEGRADED : NetworkStatus.DOWN,
      lastCheck: new Date(),
      errorCount: 0,
      successCount: 1
    };
    
  } catch (error) {
    return {
      endpoint: endpoints[0],
      network,
      status: NetworkStatus.DOWN,
      lastCheck: new Date(),
      errorCount: 1,
      successCount: 0
    };
  }
}

/**
 * Get all network health statuses
 */
export async function getAllNetworkHealth(): Promise<NetworkInfo[]> {
  const networks = Object.keys(NETWORK_ENDPOINTS);
  const healthChecks = networks.map(network => 
    checkNetworkHealth(network).catch(error => ({
      endpoint: '',
      network,
      status: NetworkStatus.DOWN,
      lastCheck: new Date(),
      errorCount: 1,
      successCount: 0,
      error: error.message
    } as NetworkInfo))
  );
  
  return Promise.all(healthChecks);
}

// ============================================================================
// Operation Queue Utilities
// ============================================================================

/**
 * Queue blockchain operation for offline processing
 */
export function queueBlockchainOperation(
  type: OperationType,
  operation: any,
  priority: OperationPriority = OperationPriority.MEDIUM
): string {
  return errorHandlingService.queueOperation(type, operation, priority);
}

/**
 * Queue transaction for retry
 */
export function queueTransactionRetry(
  transactionData: any,
  priority: OperationPriority = OperationPriority.HIGH
): string {
  return queueBlockchainOperation(OperationType.TRANSACTION, {
    type: 'retry',
    data: transactionData,
    timestamp: new Date().toISOString()
  }, priority);
}

/**
 * Queue network reconnection
 */
export function queueNetworkReconnection(
  network: string,
  priority: OperationPriority = OperationPriority.HIGH
): string {
  return queueBlockchainOperation(OperationType.QUERY, {
    type: 'reconnect',
    network,
    timestamp: new Date().toISOString()
  }, priority);
}

// ============================================================================
// Error Analysis Utilities
// ============================================================================

/**
 * Analyze error and suggest recovery actions
 */
export function analyzeErrorAndSuggestRecovery(error: BlockchainError): RecoveryAction[] {
  const suggestions: RecoveryAction[] = [];
  
  switch (error.category) {
    case ErrorCategory.NETWORK:
      suggestions.push(RecoveryAction.RECONNECT);
      if (error.severity >= ErrorSeverity.HIGH) {
        suggestions.push(RecoveryAction.SWITCH_NETWORK);
      }
      suggestions.push(RecoveryAction.RETRY);
      break;
      
    case ErrorCategory.TRANSACTION:
      if (error.retryable) {
        suggestions.push(RecoveryAction.RETRY);
        suggestions.push(RecoveryAction.WAIT);
      }
      if ((error as TransactionError).code === TransactionErrorCode.INSUFFICIENT_FUNDS) {
        suggestions.push(RecoveryAction.CHECK_WALLET);
      }
      break;
      
    case ErrorCategory.VALIDATION:
      suggestions.push(RecoveryAction.MANUAL_INTERVENTION);
      break;
      
    default:
      suggestions.push(RecoveryAction.RETRY);
      break;
  }
  
  // Add fallback actions
  if (error.severity === ErrorSeverity.CRITICAL) {
    suggestions.push(RecoveryAction.CONTACT_SUPPORT);
  }
  
  return suggestions;
}

/**
 * Calculate error recovery probability
 */
export function calculateRecoveryProbability(error: BlockchainError): number {
  let probability = 0;
  
  // Base probability based on category
  switch (error.category) {
    case ErrorCategory.NETWORK:
      probability = 0.8; // Network errors are usually recoverable
      break;
    case ErrorCategory.TRANSACTION:
      probability = error.retryable ? 0.6 : 0.1;
      break;
    case ErrorCategory.VALIDATION:
      probability = 0.2; // Usually require manual intervention
      break;
    default:
      probability = 0.5;
      break;
  }
  
  // Adjust based on severity
  switch (error.severity) {
    case ErrorSeverity.LOW:
      probability += 0.2;
      break;
    case ErrorSeverity.MEDIUM:
      // No adjustment
      break;
    case ErrorSeverity.HIGH:
      probability -= 0.2;
      break;
    case ErrorSeverity.CRITICAL:
      probability -= 0.4;
      break;
  }
  
  // Clamp between 0 and 1
  return Math.max(0, Math.min(1, probability));
}

/**
 * Get recommended retry strategy
 */
export function getRecommendedRetryStrategy(error: BlockchainError): RecoveryStrategy | null {
  if (!error.retryable) {
    return null;
  }
  
  const baseStrategy = getRecoveryStrategy(error.code, error.category);
  if (!baseStrategy) {
    // Default strategy
    return {
      actions: [RecoveryAction.RETRY],
      autoRetry: true,
      maxRetries: 3,
      retryDelay: 2000,
      backoffMultiplier: 1.5,
      maxDelay: 30000,
      timeout: 60000
    };
  }
  
  // Adjust strategy based on error severity
  const adjustedStrategy = { ...baseStrategy };
  
  if (error.severity === ErrorSeverity.HIGH || error.severity === ErrorSeverity.CRITICAL) {
    adjustedStrategy.maxRetries = Math.min(adjustedStrategy.maxRetries, 2);
    adjustedStrategy.retryDelay = Math.max(adjustedStrategy.retryDelay, 5000);
  }
  
  return adjustedStrategy;
}

// ============================================================================
// Resilience Utilities
// ============================================================================

/**
 * Create circuit breaker for operations
 */
export class CircuitBreaker {
  private failures: number = 0;
  private lastFailure?: Date;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(
    private maxFailures: number = 5,
    private resetTimeout: number = 60000
  ) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess(): void {
    this.failures = 0;
    this.state = 'CLOSED';
  }
  
  private onFailure(): void {
    this.failures++;
    this.lastFailure = new Date();
    
    if (this.failures >= this.maxFailures) {
      this.state = 'OPEN';
    }
  }
  
  private shouldAttemptReset(): boolean {
    return this.lastFailure && 
           Date.now() - this.lastFailure.getTime() > this.resetTimeout;
  }
  
  getState(): string {
    return this.state;
  }
  
  getFailures(): number {
    return this.failures;
  }
}

/**
 * Create retry helper with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    backoffMultiplier?: number;
    maxDelay?: number;
    retryCondition?: (error: any) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    backoffMultiplier = 2,
    maxDelay = 30000,
    retryCondition = () => true
  } = options;
  
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries || !retryCondition(error)) {
        throw error;
      }
      
      const delay = Math.min(
        baseDelay * Math.pow(backoffMultiplier, attempt),
        maxDelay
      );
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Create timeout wrapper for operations
 */
export async function withTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  errorMessage: string = 'Operation timed out'
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
  });
  
  return Promise.race([operation(), timeoutPromise]);
}

/**
 * Batch operations with error handling
 */
export async function batchOperationsWithErrorHandling<T>(
  operations: (() => Promise<T>)[],
  options: {
    concurrency?: number;
    continueOnError?: boolean;
    retryFailed?: boolean;
  } = {}
): Promise<{ results: T[]; errors: Error[] }> {
  const {
    concurrency = 5,
    continueOnError = true,
    retryFailed = false
  } = options;
  
  const results: T[] = [];
  const errors: Error[] = [];
  
  // Execute operations in batches
  for (let i = 0; i < operations.length; i += concurrency) {
    const batch = operations.slice(i, i + concurrency);
    
    const batchPromises = batch.map(async (operation, index) => {
      try {
        const result = await operation();
        results[i + index] = result;
      } catch (error) {
        errors.push(error as Error);
        
        if (!continueOnError) {
          throw error;
        }
        
        if (retryFailed) {
          try {
            const result = await retryWithBackoff(operation, { maxRetries: 2 });
            results[i + index] = result;
          } catch (retryError) {
            // Keep original error
          }
        }
      }
    });
    
    await Promise.all(batchPromises);
  }
  
  return { results, errors };
} 