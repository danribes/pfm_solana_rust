/**
 * Blockchain Error Handling Service
 * Comprehensive error handling and recovery for blockchain operations
 */

import {
  BlockchainError,
  NetworkError,
  TransactionError,
  ValidationError,
  RateLimitError,
  ErrorState,
  RecoveryState,
  OfflineState,
  ErrorCategory,
  ErrorSeverity,
  NetworkErrorCode,
  TransactionErrorCode,
  RecoveryAction,
  RecoveryStatus,
  SystemStatus,
  UserFeedback,
  FeedbackType,
  ErrorMetrics,
  NetworkInfo,
  NetworkStatus,
  QueuedOperation,
  OperationType,
  OperationPriority,
  CachedData,
  CacheType,
  ErrorContext
} from '../types/errors';

import {
  DEFAULT_ERROR_CONFIG,
  NETWORK_RECOVERY_STRATEGIES,
  TRANSACTION_RECOVERY_STRATEGIES,
  RATE_LIMIT_RECOVERY_STRATEGIES,
  ERROR_MESSAGES,
  NETWORK_ENDPOINTS,
  NETWORK_FALLBACK_ORDER,
  getRecoveryStrategy,
  getErrorSeverity,
  getErrorMessage,
  CACHE_CONFIG,
  MONITORING_CONFIG,
  OFFLINE_CONFIG
} from '../config/errors';

/**
 * Blockchain Error Handling Service
 * Manages error detection, recovery, and user feedback for blockchain operations
 */
export class ErrorHandlingService {
  private static instance: ErrorHandlingService;
  private errorState: ErrorState;
  private recoveryState: RecoveryState;
  private offlineState: OfflineState;
  private metrics: ErrorMetrics;
  private cache: Map<string, CachedData>;
  private networkStatus: Map<string, NetworkInfo>;
  private heartbeatInterval?: NodeJS.Timeout;
  private metricsInterval?: NodeJS.Timeout;
  private recoveryTimeout?: NodeJS.Timeout;
  private eventListeners: Map<string, ((event: any) => void)[]>;

  private constructor() {
    this.errorState = {
      errors: [],
      isRecovering: false,
      recoveryAttempts: 0,
      maxRecoveryAttempts: DEFAULT_ERROR_CONFIG.maxRetries,
      systemStatus: SystemStatus.OPERATIONAL,
      degradedFeatures: []
    };

    this.recoveryState = {
      isActive: false,
      strategy: {
        actions: [],
        autoRetry: false,
        maxRetries: 0,
        retryDelay: 0,
        backoffMultiplier: 1,
        maxDelay: 0,
        timeout: 0
      },
      currentAction: RecoveryAction.RETRY,
      attempt: 0,
      startTime: new Date(),
      lastAttempt: new Date(),
      progress: 0,
      status: RecoveryStatus.IDLE,
      logs: []
    };

    this.offlineState = {
      isOffline: false,
      lastOnline: new Date(),
      offlineDuration: 0,
      queuedOperations: [],
      cachedData: [],
      degradedServices: []
    };

    this.metrics = {
      errorCount: 0,
      errorRate: 0,
      errorsByCategory: {} as Record<ErrorCategory, number>,
      errorsBySeverity: {} as Record<ErrorSeverity, number>,
      recoverySuccessRate: 0,
      meanTimeToRecovery: 0,
      networkUptime: 100,
      lastUpdate: new Date()
    };

    this.cache = new Map();
    this.networkStatus = new Map();
    this.eventListeners = new Map();

    this.initializeNetworkMonitoring();
    this.startHeartbeat();
    this.startMetricsCollection();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService();
    }
    return ErrorHandlingService.instance;
  }

  // ============================================================================
  // Error Creation and Handling
  // ============================================================================

  /**
   * Create and handle a network error
   */
  public async handleNetworkError(
    code: NetworkErrorCode,
    context: ErrorContext,
    originalError?: any
  ): Promise<NetworkError> {
    const error: NetworkError = {
      id: this.generateErrorId(),
      code,
      category: ErrorCategory.NETWORK,
      severity: getErrorSeverity(ErrorCategory.NETWORK, code),
      timestamp: new Date(),
      recoverable: true,
      retryable: true,
      message: originalError?.message || 'Network error occurred',
      userMessage: getErrorMessage(code).userMessage,
      context,
      technicalDetails: { originalError },
      networkInfo: {
        endpoint: context.endpoint || '',
        network: context.network,
        status: NetworkStatus.DOWN,
        lastCheck: new Date(),
        errorCount: 1,
        successCount: 0
      },
      connectionAttempts: 0,
      recovery: getRecoveryStrategy(code, ErrorCategory.NETWORK)
    };

    await this.processError(error);
    return error;
  }

  /**
   * Create and handle a transaction error
   */
  public async handleTransactionError(
    code: TransactionErrorCode,
    context: ErrorContext,
    originalError?: any
  ): Promise<TransactionError> {
    const error: TransactionError = {
      id: this.generateErrorId(),
      code,
      category: ErrorCategory.TRANSACTION,
      severity: getErrorSeverity(ErrorCategory.TRANSACTION, code),
      timestamp: new Date(),
      recoverable: this.isTransactionRecoverable(code),
      retryable: this.isTransactionRetryable(code),
      message: originalError?.message || 'Transaction error occurred',
      userMessage: getErrorMessage(code).userMessage,
      context,
      technicalDetails: { originalError },
      transactionInfo: {
        hash: context.transactionId,
        status: this.mapTransactionStatus(originalError),
        attempts: 1,
        lastAttempt: new Date()
      },
      recovery: getRecoveryStrategy(code, ErrorCategory.TRANSACTION)
    };

    await this.processError(error);
    return error;
  }

  /**
   * Process any error and trigger recovery if needed
   */
  private async processError(error: BlockchainError): Promise<void> {
    // Add to error state
    this.errorState.errors.push(error);
    this.errorState.lastError = error;

    // Update metrics
    this.updateErrorMetrics(error);

    // Update system status
    this.updateSystemStatus(error);

    // Emit error event
    this.emitEvent('error', error);

    // Start recovery if applicable
    if (error.recoverable && error.recovery && !this.recoveryState.isActive) {
      await this.startRecovery(error);
    }

    // Show user feedback
    await this.showUserFeedback(error);

    // Cleanup old errors
    this.cleanupOldErrors();
  }

  // ============================================================================
  // Recovery Management
  // ============================================================================

  /**
   * Start recovery process for an error
   */
  private async startRecovery(error: BlockchainError): Promise<void> {
    if (!error.recovery) return;

    this.recoveryState = {
      isActive: true,
      strategy: error.recovery,
      currentAction: error.recovery.actions[0],
      attempt: 1,
      startTime: new Date(),
      lastAttempt: new Date(),
      progress: 0,
      status: RecoveryStatus.IN_PROGRESS,
      logs: [{
        timestamp: new Date(),
        action: error.recovery.actions[0],
        status: 'started',
        message: `Starting recovery for ${error.code}`,
        details: { errorId: error.id }
      }]
    };

    this.errorState.isRecovering = true;
    this.emitEvent('recoveryStarted', this.recoveryState);

    await this.executeRecoveryAction(error);
  }

  /**
   * Execute a recovery action
   */
  private async executeRecoveryAction(error: BlockchainError): Promise<void> {
    const { strategy, currentAction, attempt } = this.recoveryState;

    try {
      switch (currentAction) {
        case RecoveryAction.RETRY:
          await this.executeRetry(error);
          break;
        case RecoveryAction.RECONNECT:
          await this.executeReconnect(error);
          break;
        case RecoveryAction.SWITCH_NETWORK:
          await this.executeSwitchNetwork(error);
          break;
        case RecoveryAction.WAIT:
          await this.executeWait(error);
          break;
        case RecoveryAction.REFRESH_PAGE:
          this.executeRefreshPage();
          break;
        case RecoveryAction.CHECK_WALLET:
          await this.executeCheckWallet(error);
          break;
        case RecoveryAction.CONTACT_SUPPORT:
          this.executeContactSupport(error);
          break;
        case RecoveryAction.MANUAL_INTERVENTION:
          this.executeManualIntervention(error);
          break;
      }

      // Mark recovery as successful
      this.completeRecovery(true);

    } catch (recoveryError) {
      // Recovery action failed
      const errorMessage = recoveryError instanceof Error ? recoveryError.message : String(recoveryError);
      this.logRecoveryAction(currentAction, 'failed', `Recovery action failed: ${errorMessage}`);

      if (attempt < strategy.maxRetries) {
        // Try again with backoff
        await this.scheduleRetry(error);
      } else if (strategy.fallbackStrategy && strategy.fallbackStrategy.length > 0) {
        // Use fallback strategy
        await this.useFallbackStrategy(error);
      } else {
        // Recovery failed completely
        this.completeRecovery(false);
      }
    }
  }

  /**
   * Execute retry recovery action
   */
  private async executeRetry(error: BlockchainError): Promise<void> {
    this.logRecoveryAction(RecoveryAction.RETRY, 'started', 'Retrying operation');

    // Simulate retry operation
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For demo purposes, assume retry succeeds after 2 attempts
    if (this.recoveryState.attempt >= 2) {
      this.logRecoveryAction(RecoveryAction.RETRY, 'completed', 'Retry successful');
    } else {
      throw new Error('Retry failed');
    }
  }

  /**
   * Execute reconnect recovery action
   */
  private async executeReconnect(error: BlockchainError): Promise<void> {
    this.logRecoveryAction(RecoveryAction.RECONNECT, 'started', 'Reconnecting to network');

    const network = error.context?.network || 'devnet';
    await this.checkNetworkConnection(network);

    this.logRecoveryAction(RecoveryAction.RECONNECT, 'completed', 'Reconnection successful');
  }

  /**
   * Execute switch network recovery action
   */
  private async executeSwitchNetwork(error: BlockchainError): Promise<void> {
    this.logRecoveryAction(RecoveryAction.SWITCH_NETWORK, 'started', 'Switching to alternative network');

    const currentNetwork = error.context?.network || 'devnet';
    const fallbackNetwork = this.getFallbackNetwork(currentNetwork);

    if (fallbackNetwork) {
      await this.switchToNetwork(fallbackNetwork);
      this.logRecoveryAction(RecoveryAction.SWITCH_NETWORK, 'completed', `Switched to ${fallbackNetwork}`);
    } else {
      throw new Error('No fallback network available');
    }
  }

  /**
   * Execute wait recovery action
   */
  private async executeWait(error: BlockchainError): Promise<void> {
    const delay = this.recoveryState.strategy.retryDelay * 
                  Math.pow(this.recoveryState.strategy.backoffMultiplier, this.recoveryState.attempt - 1);
    
    this.logRecoveryAction(RecoveryAction.WAIT, 'started', `Waiting ${delay}ms before retry`);

    await new Promise(resolve => setTimeout(resolve, delay));

    this.logRecoveryAction(RecoveryAction.WAIT, 'completed', 'Wait completed');
  }

  /**
   * Execute refresh page recovery action
   */
  private executeRefreshPage(): void {
    this.logRecoveryAction(RecoveryAction.REFRESH_PAGE, 'completed', 'Refreshing page');
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }

  /**
   * Execute check wallet recovery action
   */
  private async executeCheckWallet(error: BlockchainError): Promise<void> {
    this.logRecoveryAction(RecoveryAction.CHECK_WALLET, 'started', 'Checking wallet connection');

    // Emit event for wallet check
    this.emitEvent('checkWallet', { error });

    this.logRecoveryAction(RecoveryAction.CHECK_WALLET, 'completed', 'Wallet check initiated');
  }

  /**
   * Execute contact support recovery action
   */
  private executeContactSupport(error: BlockchainError): void {
    this.logRecoveryAction(RecoveryAction.CONTACT_SUPPORT, 'completed', 'Support contact initiated');
    this.emitEvent('contactSupport', { error });
  }

  /**
   * Execute manual intervention recovery action
   */
  private executeManualIntervention(error: BlockchainError): void {
    this.logRecoveryAction(RecoveryAction.MANUAL_INTERVENTION, 'completed', 'Manual intervention required');
    this.emitEvent('manualIntervention', { error });
  }

  // ============================================================================
  // Network Monitoring
  // ============================================================================

  /**
   * Initialize network monitoring for all endpoints
   */
  private initializeNetworkMonitoring(): void {
    Object.entries(NETWORK_ENDPOINTS).forEach(([network, endpoints]) => {
      this.networkStatus.set(network, {
        endpoint: endpoints[0],
        network,
        status: NetworkStatus.UNKNOWN,
        lastCheck: new Date(),
        errorCount: 0,
        successCount: 0
      });
    });
  }

  /**
   * Check network connection status
   */
  private async checkNetworkConnection(network: string): Promise<NetworkInfo> {
    const networkInfo = this.networkStatus.get(network);
    if (!networkInfo) {
      throw new Error(`Network ${network} not found`);
    }

    const startTime = Date.now();

    try {
      // Simulate network check
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate occasional failures
          if (Math.random() < 0.1) {
            reject(new Error('Network check failed'));
          } else {
            resolve(true);
          }
        }, Math.random() * 1000);
      });

      const responseTime = Date.now() - startTime;

      networkInfo.responseTime = responseTime;
      networkInfo.status = responseTime < 1000 ? NetworkStatus.HEALTHY : NetworkStatus.DEGRADED;
      networkInfo.lastCheck = new Date();
      networkInfo.successCount++;

      this.networkStatus.set(network, networkInfo);
      return networkInfo;

    } catch (error) {
      networkInfo.status = NetworkStatus.DOWN;
      networkInfo.lastCheck = new Date();
      networkInfo.errorCount++;

      this.networkStatus.set(network, networkInfo);
      throw error;
    }
  }

  /**
   * Get network information
   */
  private getNetworkInfo(network: string): NetworkInfo {
    return this.networkStatus.get(network) || {
      endpoint: '',
      network,
      status: NetworkStatus.UNKNOWN,
      lastCheck: new Date(),
      errorCount: 0,
      successCount: 0
    };
  }

  /**
   * Get fallback network
   */
  private getFallbackNetwork(currentNetwork: string): string | null {
    const currentIndex = NETWORK_FALLBACK_ORDER.indexOf(currentNetwork);
    return currentIndex < NETWORK_FALLBACK_ORDER.length - 1 
      ? NETWORK_FALLBACK_ORDER[currentIndex + 1] 
      : null;
  }

  /**
   * Switch to a different network
   */
  private async switchToNetwork(network: string): Promise<void> {
    await this.checkNetworkConnection(network);
    this.emitEvent('networkSwitched', { network });
  }

  // ============================================================================
  // Offline Mode and Queue Management
  // ============================================================================

  /**
   * Handle offline mode
   */
  public setOfflineMode(isOffline: boolean): void {
    if (isOffline !== this.offlineState.isOffline) {
      this.offlineState.isOffline = isOffline;
      
      if (isOffline) {
        this.offlineState.lastOnline = new Date();
        this.errorState.systemStatus = SystemStatus.OFFLINE;
      } else {
        this.offlineState.offlineDuration = Date.now() - this.offlineState.lastOnline.getTime();
        this.errorState.systemStatus = SystemStatus.OPERATIONAL;
        this.processQueuedOperations();
      }

      this.emitEvent('offlineStatusChanged', { isOffline });
    }
  }

  /**
   * Queue operation for offline processing
   */
  public queueOperation(
    type: OperationType,
    data: any,
    priority: OperationPriority = OperationPriority.MEDIUM
  ): string {
    const operation: QueuedOperation = {
      id: this.generateErrorId(),
      type,
      data,
      timestamp: new Date(),
      priority,
      retries: 0,
      maxRetries: 3
    };

    this.offlineState.queuedOperations.push(operation);
    this.offlineState.queuedOperations.sort((a, b) => 
      this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority)
    );

    return operation.id;
  }

  /**
   * Process queued operations when back online
   */
  private async processQueuedOperations(): Promise<void> {
    const operations = [...this.offlineState.queuedOperations];
    this.offlineState.queuedOperations = [];

    for (const operation of operations) {
      try {
        await this.processQueuedOperation(operation);
      } catch (error) {
        if (operation.retries < operation.maxRetries) {
          operation.retries++;
          this.offlineState.queuedOperations.push(operation);
        }
      }
    }
  }

  /**
   * Process a single queued operation
   */
  private async processQueuedOperation(operation: QueuedOperation): Promise<void> {
    this.emitEvent('processingQueuedOperation', { operation });
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 100));
    
    this.emitEvent('queuedOperationCompleted', { operation });
  }

  // ============================================================================
  // User Feedback
  // ============================================================================

  /**
   * Show user feedback for error
   */
  private async showUserFeedback(error: BlockchainError): Promise<void> {
    const feedback: UserFeedback = {
      type: this.mapSeverityToFeedbackType(error.severity),
      title: getErrorMessage(error.code).title,
      message: error.userMessage,
      actions: this.createUserActions(error),
      severity: error.severity,
      persistent: error.severity === ErrorSeverity.CRITICAL,
      autoClose: error.severity === ErrorSeverity.LOW,
      closeDelay: error.severity === ErrorSeverity.LOW ? 5000 : undefined
    };

    this.emitEvent('userFeedback', feedback);
  }

  /**
   * Create user actions for error
   */
  private createUserActions(error: BlockchainError): any[] {
    const actions = [];

    if (error.retryable) {
      actions.push({
        label: 'Retry',
        action: () => this.retryError(error),
        primary: true
      });
    }

    if (error.category === ErrorCategory.NETWORK) {
      actions.push({
        label: 'Switch Network',
        action: () => this.switchNetworkManually(error)
      });
    }

    actions.push({
      label: 'Dismiss',
      action: () => this.dismissError(error.id)
    });

    return actions;
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if transaction is recoverable
   */
  private isTransactionRecoverable(code: TransactionErrorCode): boolean {
    const nonRecoverableCodes = [
      TransactionErrorCode.INSUFFICIENT_FUNDS,
      TransactionErrorCode.INVALID_SIGNATURE,
      TransactionErrorCode.PROGRAM_ERROR,
      TransactionErrorCode.INSTRUCTION_ERROR
    ];
    return !nonRecoverableCodes.includes(code);
  }

  /**
   * Check if transaction is retryable
   */
  private isTransactionRetryable(code: TransactionErrorCode): boolean {
    const nonRetryableCodes = [
      TransactionErrorCode.INSUFFICIENT_FUNDS,
      TransactionErrorCode.INVALID_SIGNATURE,
      TransactionErrorCode.TRANSACTION_REJECTED
    ];
    return !nonRetryableCodes.includes(code);
  }

  /**
   * Map transaction status from error
   */
  private mapTransactionStatus(error: any): any {
    // Implementation depends on actual error structure
    return 'FAILED';
  }

  /**
   * Update error metrics
   */
  private updateErrorMetrics(error: BlockchainError): void {
    this.metrics.errorCount++;
    this.metrics.errorsByCategory[error.category] = (this.metrics.errorsByCategory[error.category] || 0) + 1;
    this.metrics.errorsBySeverity[error.severity] = (this.metrics.errorsBySeverity[error.severity] || 0) + 1;
    this.metrics.lastUpdate = new Date();
  }

  /**
   * Update system status based on error
   */
  private updateSystemStatus(error: BlockchainError): void {
    if (error.severity === ErrorSeverity.CRITICAL) {
      this.errorState.systemStatus = SystemStatus.DEGRADED;
    }
  }

  /**
   * Map error severity to feedback type
   */
  private mapSeverityToFeedbackType(severity: ErrorSeverity): FeedbackType {
    switch (severity) {
      case ErrorSeverity.LOW:
        return FeedbackType.INFO;
      case ErrorSeverity.MEDIUM:
        return FeedbackType.WARNING;
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        return FeedbackType.ERROR;
      default:
        return FeedbackType.ERROR;
    }
  }

  /**
   * Get priority weight for sorting
   */
  private getPriorityWeight(priority: OperationPriority): number {
    switch (priority) {
      case OperationPriority.LOW: return 1;
      case OperationPriority.MEDIUM: return 2;
      case OperationPriority.HIGH: return 3;
      case OperationPriority.CRITICAL: return 4;
      default: return 2;
    }
  }

  // ============================================================================
  // Recovery Utility Methods
  // ============================================================================

  /**
   * Schedule retry with backoff
   */
  private async scheduleRetry(error: BlockchainError): Promise<void> {
    const delay = this.recoveryState.strategy.retryDelay * 
                  Math.pow(this.recoveryState.strategy.backoffMultiplier, this.recoveryState.attempt);
    
    this.recoveryState.attempt++;
    this.recoveryState.lastAttempt = new Date();
    this.recoveryState.nextAttempt = new Date(Date.now() + delay);

    this.recoveryTimeout = setTimeout(() => {
      this.executeRecoveryAction(error);
    }, delay);
  }

  /**
   * Use fallback strategy
   */
  private async useFallbackStrategy(error: BlockchainError): Promise<void> {
    if (!this.recoveryState.strategy.fallbackStrategy) return;

    this.recoveryState.currentAction = this.recoveryState.strategy.fallbackStrategy[0];
    this.recoveryState.attempt = 1;

    await this.executeRecoveryAction(error);
  }

  /**
   * Complete recovery process
   */
  private completeRecovery(success: boolean): void {
    this.recoveryState.isActive = false;
    this.recoveryState.status = success ? RecoveryStatus.SUCCESS : RecoveryStatus.FAILED;
    this.recoveryState.progress = 100;
    this.errorState.isRecovering = false;

    if (this.recoveryTimeout) {
      clearTimeout(this.recoveryTimeout);
      this.recoveryTimeout = undefined;
    }

    this.emitEvent('recoveryCompleted', { success, state: this.recoveryState });

    // Update metrics
    if (success) {
      const recoveryTime = Date.now() - this.recoveryState.startTime.getTime();
      this.updateRecoveryMetrics(recoveryTime);
    }
  }

  /**
   * Log recovery action
   */
  private logRecoveryAction(
    action: RecoveryAction,
    status: 'started' | 'completed' | 'failed',
    message: string,
    details?: any
  ): void {
    this.recoveryState.logs.push({
      timestamp: new Date(),
      action,
      status,
      message,
      details
    });

    // Keep only last 50 logs
    if (this.recoveryState.logs.length > 50) {
      this.recoveryState.logs = this.recoveryState.logs.slice(-50);
    }
  }

  /**
   * Update recovery metrics
   */
  private updateRecoveryMetrics(recoveryTime: number): void {
    // Simple moving average
    this.metrics.meanTimeToRecovery = 
      (this.metrics.meanTimeToRecovery + recoveryTime) / 2;
  }

  // ============================================================================
  // Public Action Methods
  // ============================================================================

  /**
   * Retry an error manually
   */
  public async retryError(error: BlockchainError): Promise<void> {
    if (!error.retryable) return;
    await this.startRecovery(error);
  }

  /**
   * Switch network manually
   */
  public async switchNetworkManually(error: BlockchainError): Promise<void> {
    const currentNetwork = error.context?.network || 'devnet';
    const fallbackNetwork = this.getFallbackNetwork(currentNetwork);
    
    if (fallbackNetwork) {
      await this.switchToNetwork(fallbackNetwork);
    }
  }

  /**
   * Dismiss an error
   */
  public dismissError(errorId: string): void {
    this.errorState.errors = this.errorState.errors.filter(e => e.id !== errorId);
    this.emitEvent('errorDismissed', { errorId });
  }

  /**
   * Clear all errors
   */
  public clearAllErrors(): void {
    this.errorState.errors = [];
    this.errorState.lastError = undefined;
    this.emitEvent('allErrorsCleared', {});
  }

  // ============================================================================
  // Event Management
  // ============================================================================

  /**
   * Add event listener
   */
  public addEventListener(event: string, callback: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  /**
   * Remove event listener
   */
  public removeEventListener(event: string, callback: (data: any) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event
   */
  private emitEvent(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // ============================================================================
  // Monitoring and Lifecycle
  // ============================================================================

  /**
   * Start heartbeat monitoring
   */
  private startHeartbeat(): void {
    if (MONITORING_CONFIG.enableHeartbeat) {
      this.heartbeatInterval = setInterval(() => {
        this.performHealthCheck();
      }, MONITORING_CONFIG.heartbeatInterval);
    }
  }

  /**
   * Start metrics collection
   */
  private startMetricsCollection(): void {
    if (DEFAULT_ERROR_CONFIG.enableMetrics) {
      this.metricsInterval = setInterval(() => {
        this.collectMetrics();
      }, MONITORING_CONFIG.metricsCollectionInterval);
    }
  }

  /**
   * Perform health check
   */
  private async performHealthCheck(): Promise<void> {
    try {
      // Check all networks
      const networkChecks = Array.from(this.networkStatus.keys()).map(network =>
        this.checkNetworkConnection(network).catch(() => null)
      );

      await Promise.all(networkChecks);

      // Update overall system status
      this.updateOverallSystemStatus();

      this.emitEvent('healthCheck', { status: this.errorState.systemStatus });

    } catch (error) {
      console.error('Health check failed:', error);
    }
  }

  /**
   * Update overall system status
   */
  private updateOverallSystemStatus(): void {
    const networkStatuses = Array.from(this.networkStatus.values());
    const healthyCount = networkStatuses.filter(n => n.status === NetworkStatus.HEALTHY).length;
    const totalCount = networkStatuses.length;

    const uptime = (healthyCount / totalCount) * 100;
    this.metrics.networkUptime = uptime;

    if (uptime >= 80) {
      this.errorState.systemStatus = SystemStatus.OPERATIONAL;
    } else if (uptime >= 50) {
      this.errorState.systemStatus = SystemStatus.DEGRADED;
    } else {
      this.errorState.systemStatus = SystemStatus.MAINTENANCE;
    }
  }

  /**
   * Collect metrics
   */
  private collectMetrics(): void {
    // Calculate error rate
    const recentErrors = this.errorState.errors.filter(
      e => Date.now() - e.timestamp.getTime() < 60000 // Last minute
    );

    this.metrics.errorRate = recentErrors.length;
    this.metrics.lastUpdate = new Date();

    this.emitEvent('metricsUpdated', this.metrics);
  }

  /**
   * Clean up old errors
   */
  private cleanupOldErrors(): void {
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    const cutoff = Date.now() - maxAge;

    this.errorState.errors = this.errorState.errors.filter(
      error => error.timestamp.getTime() > cutoff
    );

    // Keep only last 100 errors
    if (this.errorState.errors.length > MONITORING_CONFIG.maxErrorHistory) {
      this.errorState.errors = this.errorState.errors.slice(-MONITORING_CONFIG.maxErrorHistory);
    }
  }

  // ============================================================================
  // Public Getters
  // ============================================================================

  /**
   * Get current error state
   */
  public getErrorState(): ErrorState {
    return { ...this.errorState };
  }

  /**
   * Get current recovery state
   */
  public getRecoveryState(): RecoveryState {
    return { ...this.recoveryState };
  }

  /**
   * Get offline state
   */
  public getOfflineState(): OfflineState {
    return { ...this.offlineState };
  }

  /**
   * Get error metrics
   */
  public getMetrics(): ErrorMetrics {
    return { ...this.metrics };
  }

  /**
   * Get network status
   */
  public getNetworkStatus(): Map<string, NetworkInfo> {
    return new Map(this.networkStatus);
  }

  /**
   * Cleanup service
   */
  public cleanup(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
    if (this.recoveryTimeout) {
      clearTimeout(this.recoveryTimeout);
    }
    
    this.eventListeners.clear();
    this.cache.clear();
    this.networkStatus.clear();
  }
}

// Export singleton instance
export const errorHandlingService = ErrorHandlingService.getInstance(); 