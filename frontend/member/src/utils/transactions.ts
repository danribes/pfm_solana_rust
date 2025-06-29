// Transaction Management Utilities
// Task 5.1.1 Sub-task 3: Transaction Management

import { PublicKey, Transaction, TransactionSignature } from "@solana/web3.js";
import {
  TransactionRequest,
  TransactionResponse,
  TransactionStatus,
  TransactionQueue,
  QueuedTransaction,
  QueueStatus,
  OptimisticUpdate,
  IntegrationError,
} from "../types/integration";

export class TransactionManager {
  private queues: Map<string, TransactionQueue> = new Map();
  private activeTransactions: Map<string, QueuedTransaction> = new Map();
  private optimisticUpdates: Map<string, OptimisticUpdate> = new Map();
  private listeners: Map<string, Set<(status: TransactionStatus) => void>> = new Map();
  private metrics = {
    totalTransactions: 0,
    successfulTransactions: 0,
    failedTransactions: 0,
    averageConfirmationTime: 0,
    queueLength: 0,
  };

  constructor() {
    this.startQueueProcessor();
  }

  /**
   * Create a new transaction queue
   */
  public createQueue(
    id: string,
    priority: "low" | "medium" | "high" = "medium",
    maxRetries: number = 3
  ): TransactionQueue {
    const queue: TransactionQueue = {
      id,
      transactions: [],
      priority,
      maxRetries,
      status: QueueStatus.IDLE,
    };

    this.queues.set(id, queue);
    return queue;
  }

  /**
   * Add transaction to queue
   */
  public addToQueue(
    queueId: string,
    transaction: TransactionRequest,
    priority?: "low" | "medium" | "high"
  ): string {
    let queue = this.queues.get(queueId);
    
    if (!queue) {
      queue = this.createQueue(queueId, priority);
    }

    const queuedTransaction: QueuedTransaction = {
      id: this.generateTransactionId(),
      transaction,
      status: TransactionStatus.PENDING,
      attempts: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Insert based on priority
    if (transaction.priority === "high") {
      queue.transactions.unshift(queuedTransaction);
    } else {
      queue.transactions.push(queuedTransaction);
    }

    this.queues.set(queueId, queue);
    this.updateMetrics();

    return queuedTransaction.id;
  }

  /**
   * Get transaction status
   */
  public getTransactionStatus(transactionId: string): TransactionStatus | null {
    // Check active transactions first
    const activeTransaction = this.activeTransactions.get(transactionId);
    if (activeTransaction) {
      return activeTransaction.status;
    }

    // Check all queues
    for (const queue of this.queues.values()) {
      const transaction = queue.transactions.find(tx => tx.id === transactionId);
      if (transaction) {
        return transaction.status;
      }
    }

    return null;
  }

  /**
   * Get transaction by ID
   */
  public getTransaction(transactionId: string): QueuedTransaction | null {
    // Check active transactions first
    const activeTransaction = this.activeTransactions.get(transactionId);
    if (activeTransaction) {
      return activeTransaction;
    }

    // Check all queues
    for (const queue of this.queues.values()) {
      const transaction = queue.transactions.find(tx => tx.id === transactionId);
      if (transaction) {
        return transaction;
      }
    }

    return null;
  }

  /**
   * Cancel transaction
   */
  public cancelTransaction(transactionId: string): boolean {
    // Remove from active transactions
    if (this.activeTransactions.has(transactionId)) {
      this.activeTransactions.delete(transactionId);
      this.notifyListeners(transactionId, TransactionStatus.FAILED);
      return true;
    }

    // Remove from queues
    for (const queue of this.queues.values()) {
      const index = queue.transactions.findIndex(tx => tx.id === transactionId);
      if (index !== -1) {
        queue.transactions.splice(index, 1);
        this.notifyListeners(transactionId, TransactionStatus.FAILED);
        return true;
      }
    }

    return false;
  }

  /**
   * Subscribe to transaction status updates
   */
  public subscribeToTransaction(
    transactionId: string,
    callback: (status: TransactionStatus) => void
  ): () => void {
    if (!this.listeners.has(transactionId)) {
      this.listeners.set(transactionId, new Set());
    }

    this.listeners.get(transactionId)!.add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(transactionId);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(transactionId);
        }
      }
    };
  }

  /**
   * Create optimistic update
   */
  public createOptimisticUpdate<T>(
    id: string,
    originalData: T,
    optimisticData: T,
    rollbackFn: () => void,
    commitFn: () => Promise<void>
  ): void {
    const update: OptimisticUpdate<T> = {
      id,
      originalData,
      optimisticData,
      rollbackFn,
      commitFn,
      timestamp: Date.now(),
    };

    this.optimisticUpdates.set(id, update);
  }

  /**
   * Commit optimistic update
   */
  public async commitOptimisticUpdate(id: string): Promise<void> {
    const update = this.optimisticUpdates.get(id);
    if (update) {
      try {
        await update.commitFn();
        this.optimisticUpdates.delete(id);
      } catch (error) {
        // Rollback on commit failure
        update.rollbackFn();
        this.optimisticUpdates.delete(id);
        throw error;
      }
    }
  }

  /**
   * Rollback optimistic update
   */
  public rollbackOptimisticUpdate(id: string): void {
    const update = this.optimisticUpdates.get(id);
    if (update) {
      update.rollbackFn();
      this.optimisticUpdates.delete(id);
    }
  }

  /**
   * Get queue status
   */
  public getQueueStatus(queueId: string): QueueStatus | null {
    const queue = this.queues.get(queueId);
    return queue ? queue.status : null;
  }

  /**
   * Pause queue processing
   */
  public pauseQueue(queueId: string): void {
    const queue = this.queues.get(queueId);
    if (queue) {
      queue.status = QueueStatus.PAUSED;
    }
  }

  /**
   * Resume queue processing
   */
  public resumeQueue(queueId: string): void {
    const queue = this.queues.get(queueId);
    if (queue) {
      queue.status = QueueStatus.IDLE;
    }
  }

  /**
   * Clear queue
   */
  public clearQueue(queueId: string): void {
    const queue = this.queues.get(queueId);
    if (queue) {
      queue.transactions = [];
      queue.status = QueueStatus.IDLE;
    }
  }

  /**
   * Get transaction metrics
   */
  public getMetrics() {
    this.updateMetrics();
    return { ...this.metrics };
  }

  /**
   * Process transaction queues
   */
  private startQueueProcessor(): void {
    setInterval(() => {
      this.processQueues();
    }, 1000); // Process every second
  }

  /**
   * Process all queues
   */
  private async processQueues(): Promise<void> {
    // Sort queues by priority
    const sortedQueues = Array.from(this.queues.values()).sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    for (const queue of sortedQueues) {
      if (queue.status === QueueStatus.PAUSED) {
        continue;
      }

      if (queue.transactions.length > 0) {
        await this.processQueue(queue);
      }
    }
  }

  /**
   * Process individual queue
   */
  private async processQueue(queue: TransactionQueue): Promise<void> {
    if (queue.status === QueueStatus.PROCESSING) {
      return; // Already processing
    }

    queue.status = QueueStatus.PROCESSING;

    const transaction = queue.transactions.shift();
    if (!transaction) {
      queue.status = QueueStatus.IDLE;
      return;
    }

    try {
      await this.processTransaction(transaction, queue);
      queue.status = QueueStatus.IDLE;
    } catch (error) {
      console.error("Queue processing error:", error);
      queue.status = QueueStatus.ERROR;
      
      // Re-queue transaction if retries available
      if (transaction.attempts < queue.maxRetries) {
        transaction.attempts++;
        transaction.updatedAt = Date.now();
        transaction.error = error.message;
        queue.transactions.unshift(transaction); // Add back to front
      } else {
        // Mark as failed
        transaction.status = TransactionStatus.FAILED;
        transaction.error = error.message;
        this.notifyListeners(transaction.id, TransactionStatus.FAILED);
      }
    }
  }

  /**
   * Process individual transaction
   */
  private async processTransaction(
    transaction: QueuedTransaction,
    queue: TransactionQueue
  ): Promise<void> {
    transaction.status = TransactionStatus.PROCESSING;
    transaction.updatedAt = Date.now();
    
    this.activeTransactions.set(transaction.id, transaction);
    this.notifyListeners(transaction.id, TransactionStatus.PROCESSING);

    // Simulate transaction processing
    // In real implementation, this would call blockchain service
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate success (90% success rate for demo)
    const success = Math.random() > 0.1;
    
    if (success) {
      transaction.status = TransactionStatus.CONFIRMED;
      this.metrics.successfulTransactions++;
      this.notifyListeners(transaction.id, TransactionStatus.CONFIRMED);
    } else {
      throw new Error("Transaction simulation failed");
    }

    this.activeTransactions.delete(transaction.id);
    this.metrics.totalTransactions++;
  }

  /**
   * Notify transaction listeners
   */
  private notifyListeners(transactionId: string, status: TransactionStatus): void {
    const listeners = this.listeners.get(transactionId);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(status);
        } catch (error) {
          console.error("Listener callback error:", error);
        }
      });
    }
  }

  /**
   * Generate unique transaction ID
   */
  private generateTransactionId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update metrics
   */
  private updateMetrics(): void {
    this.metrics.queueLength = Array.from(this.queues.values())
      .reduce((total, queue) => total + queue.transactions.length, 0);
    
    this.metrics.queueLength += this.activeTransactions.size;
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.queues.clear();
    this.activeTransactions.clear();
    this.optimisticUpdates.clear();
    this.listeners.clear();
  }
}

// Transaction utility functions
export const TransactionUtils = {
  /**
   * Validate transaction request
   */
  validateTransactionRequest(request: TransactionRequest): boolean {
    if (!request.id || !request.instructions || request.instructions.length === 0) {
      return false;
    }

    for (const instruction of request.instructions) {
      if (!instruction.programId || !instruction.keys || !instruction.data) {
        return false;
      }
    }

    return true;
  },

  /**
   * Calculate transaction priority
   */
  calculatePriority(transaction: TransactionRequest): "low" | "medium" | "high" {
    // Simple priority calculation based on metadata
    if (transaction.metadata?.urgent) {
      return "high";
    }
    
    if (transaction.metadata?.importance === "high") {
      return "high";
    }
    
    if (transaction.metadata?.importance === "low") {
      return "low";
    }
    
    return "medium";
  },

  /**
   * Format transaction for display
   */
  formatTransactionForDisplay(transaction: QueuedTransaction): {
    id: string;
    status: string;
    type: string;
    timestamp: string;
    attempts: number;
  } {
    return {
      id: transaction.id,
      status: transaction.status,
      type: transaction.transaction.metadata?.type || "Unknown",
      timestamp: new Date(transaction.createdAt).toISOString(),
      attempts: transaction.attempts,
    };
  },

  /**
   * Check if transaction is retryable
   */
  isRetryable(transaction: QueuedTransaction, maxRetries: number): boolean {
    return transaction.attempts < maxRetries && 
           transaction.status !== TransactionStatus.CONFIRMED &&
           transaction.status !== TransactionStatus.FINALIZED;
  },
};

// Create default transaction manager instance
export const transactionManager = new TransactionManager();

export default TransactionManager;
