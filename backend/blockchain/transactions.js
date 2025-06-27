const { Transaction, PublicKey } = require('@solana/web3.js');
const solanaClient = require('./solana');
const contractManager = require('./contracts');
const auditService = require('../services/audit');
const redis = require('../redis');
require('dotenv').config();

/**
 * Transaction Management
 * Handles transaction queuing, retry logic, status tracking, and fee estimation
 */
class TransactionManager {
  constructor() {
    this.transactionQueue = [];
    this.pendingTransactions = new Map();
    this.completedTransactions = new Map();
    this.failedTransactions = new Map();
    this.maxRetries = parseInt(process.env.TRANSACTION_MAX_RETRIES || '3', 10);
    this.retryDelay = parseInt(process.env.TRANSACTION_RETRY_DELAY || '2000', 10);
    this.maxQueueSize = parseInt(process.env.TRANSACTION_MAX_QUEUE_SIZE || '1000', 10);
    this.isProcessing = false;
    this.processingInterval = null;
    
    this.startTransactionProcessor();
  }

  /**
   * Start transaction processor
   */
  startTransactionProcessor() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
    
    this.processingInterval = setInterval(() => {
      this.processTransactionQueue();
    }, 1000); // Process every second
    
    console.log('Transaction processor started');
  }

  /**
   * Stop transaction processor
   */
  stopTransactionProcessor() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    
    console.log('Transaction processor stopped');
  }

  /**
   * Add transaction to queue
   */
  async addToQueue(transactionData) {
    try {
      const transactionId = this.generateTransactionId();
      
      const queuedTransaction = {
        id: transactionId,
        data: transactionData,
        status: 'queued',
        createdAt: new Date().toISOString(),
        retries: 0,
        priority: transactionData.priority || 'normal'
      };
      
      // Add to queue
      this.transactionQueue.push(queuedTransaction);
      
      // Limit queue size
      if (this.transactionQueue.length > this.maxQueueSize) {
        const removed = this.transactionQueue.shift();
        console.warn(`Transaction queue full, removed oldest transaction: ${removed.id}`);
      }
      
      // Store in Redis for persistence
      await this.storeTransactionInRedis(queuedTransaction);
      
      // Log transaction queued
      await auditService.logAuditEvent('transaction_queued', {
        level: 'INFO',
        category: 'BLOCKCHAIN',
        details: {
          transactionId,
          type: transactionData.type,
          priority: queuedTransaction.priority
        }
      });
      
      return transactionId;
    } catch (error) {
      console.error('Failed to add transaction to queue:', error.message);
      throw error;
    }
  }

  /**
   * Process transaction queue
   */
  async processTransactionQueue() {
    if (this.isProcessing || this.transactionQueue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    try {
      // Sort by priority and creation time
      this.transactionQueue.sort((a, b) => {
        const priorityOrder = { high: 3, normal: 2, low: 1 };
        const aPriority = priorityOrder[a.priority] || 2;
        const bPriority = priorityOrder[b.priority] || 2;
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
      
      // Process transactions
      const transaction = this.transactionQueue.shift();
      await this.processTransaction(transaction);
      
    } catch (error) {
      console.error('Error processing transaction queue:', error.message);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process individual transaction
   */
  async processTransaction(transaction) {
    try {
      console.log(`Processing transaction: ${transaction.id}`);
      
      // Update status
      transaction.status = 'processing';
      transaction.processingAt = new Date().toISOString();
      
      // Execute transaction based on type
      const result = await this.executeTransaction(transaction);
      
      // Handle result
      if (result.success) {
        await this.handleSuccessfulTransaction(transaction, result);
      } else {
        await this.handleFailedTransaction(transaction, result);
      }
      
    } catch (error) {
      console.error(`Error processing transaction ${transaction.id}:`, error.message);
      await this.handleFailedTransaction(transaction, { error: error.message });
    }
  }

  /**
   * Execute transaction based on type
   */
  async executeTransaction(transaction) {
    const { type, data } = transaction.data;
    
    try {
      switch (type) {
        case 'create_community':
          return await this.executeCreateCommunity(data);
        case 'join_community':
          return await this.executeJoinCommunity(data);
        case 'create_question':
          return await this.executeCreateQuestion(data);
        case 'cast_vote':
          return await this.executeCastVote(data);
        case 'custom':
          return await this.executeCustomTransaction(data);
        default:
          throw new Error(`Unknown transaction type: ${type}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        retryable: this.isRetryableError(error)
      };
    }
  }

  /**
   * Execute create community transaction
   */
  async executeCreateCommunity(data) {
    const { adminWallet, communityData } = data;
    const result = await contractManager.createCommunity(adminWallet, communityData);
    
    return {
      success: true,
      signature: result.signature,
      communityAccount: result.communityAccount
    };
  }

  /**
   * Execute join community transaction
   */
  async executeJoinCommunity(data) {
    const { userWallet, communityAddress } = data;
    const result = await contractManager.joinCommunity(userWallet, communityAddress);
    
    return {
      success: true,
      signature: result.signature,
      membershipAccount: result.membershipAccount
    };
  }

  /**
   * Execute create question transaction
   */
  async executeCreateQuestion(data) {
    const { adminWallet, communityAddress, questionData } = data;
    const result = await contractManager.createVotingQuestion(adminWallet, communityAddress, questionData);
    
    return {
      success: true,
      signature: result.signature,
      questionAccount: result.questionAccount
    };
  }

  /**
   * Execute cast vote transaction
   */
  async executeCastVote(data) {
    const { userWallet, questionAddress, voteData } = data;
    const result = await contractManager.castVote(userWallet, questionAddress, voteData);
    
    return {
      success: true,
      signature: result.signature,
      voteAccount: result.voteAccount
    };
  }

  /**
   * Execute custom transaction
   */
  async executeCustomTransaction(data) {
    const { transaction, wallet } = data;
    const connection = solanaClient.getConnection();
    
    // Send the transaction
    const signature = await connection.sendTransaction(transaction, [wallet]);
    
    return {
      success: true,
      signature
    };
  }

  /**
   * Handle successful transaction
   */
  async handleSuccessfulTransaction(transaction, result) {
    transaction.status = 'completed';
    transaction.completedAt = new Date().toISOString();
    transaction.result = result;
    
    // Add to completed transactions
    this.completedTransactions.set(transaction.id, transaction);
    
    // Remove from pending
    this.pendingTransactions.delete(transaction.id);
    
    // Store in Redis
    await this.storeTransactionInRedis(transaction);
    
    // Log success
    await auditService.logAuditEvent('transaction_completed', {
      level: 'INFO',
      category: 'BLOCKCHAIN',
      details: {
        transactionId: transaction.id,
        type: transaction.data.type,
        signature: result.signature
      }
    });
    
    console.log(`Transaction completed: ${transaction.id}`);
  }

  /**
   * Handle failed transaction
   */
  async handleFailedTransaction(transaction, result) {
    transaction.retries++;
    transaction.lastError = result.error;
    transaction.lastAttemptAt = new Date().toISOString();
    
    // Check if should retry
    if (transaction.retries < this.maxRetries && result.retryable !== false) {
      transaction.status = 'retrying';
      
      // Add back to queue with delay
      setTimeout(() => {
        this.transactionQueue.push(transaction);
      }, this.retryDelay * transaction.retries);
      
      console.log(`Transaction ${transaction.id} will be retried (attempt ${transaction.retries + 1})`);
      
    } else {
      transaction.status = 'failed';
      transaction.failedAt = new Date().toISOString();
      
      // Add to failed transactions
      this.failedTransactions.set(transaction.id, transaction);
      
      // Remove from pending
      this.pendingTransactions.delete(transaction.id);
      
      // Store in Redis
      await this.storeTransactionInRedis(transaction);
      
      // Log failure
      await auditService.logAuditEvent('transaction_failed', {
        level: 'ERROR',
        category: 'BLOCKCHAIN',
        details: {
          transactionId: transaction.id,
          type: transaction.data.type,
          error: result.error,
          retries: transaction.retries
        }
      });
      
      console.log(`Transaction failed: ${transaction.id}`);
    }
  }

  /**
   * Check if error is retryable
   */
  isRetryableError(error) {
    const retryableErrors = [
      'BlockhashNotFound',
      'TransactionExpired',
      'InsufficientFunds',
      'NetworkError',
      'TimeoutError'
    ];
    
    return retryableErrors.some(retryableError => 
      error.message.includes(retryableError)
    );
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(transactionId) {
    // Check in memory first
    if (this.completedTransactions.has(transactionId)) {
      return this.completedTransactions.get(transactionId);
    }
    
    if (this.failedTransactions.has(transactionId)) {
      return this.failedTransactions.get(transactionId);
    }
    
    if (this.pendingTransactions.has(transactionId)) {
      return this.pendingTransactions.get(transactionId);
    }
    
    // Check in queue
    const queuedTransaction = this.transactionQueue.find(t => t.id === transactionId);
    if (queuedTransaction) {
      return queuedTransaction;
    }
    
    // Check Redis
    return await this.getTransactionFromRedis(transactionId);
  }

  /**
   * Get all transaction statuses
   */
  getAllTransactionStatuses() {
    return {
      queued: this.transactionQueue.length,
      pending: this.pendingTransactions.size,
      completed: this.completedTransactions.size,
      failed: this.failedTransactions.size,
      total: this.transactionQueue.length + 
             this.pendingTransactions.size + 
             this.completedTransactions.size + 
             this.failedTransactions.size
    };
  }

  /**
   * Estimate transaction fee
   */
  async estimateTransactionFee(transactionData) {
    try {
      const connection = solanaClient.getConnection();
      
      // Create a sample transaction for fee estimation
      const sampleTransaction = new Transaction();
      
      // Add sample instruction based on transaction type
      switch (transactionData.type) {
        case 'create_community':
          // Add sample community creation instruction
          break;
        case 'join_community':
          // Add sample join community instruction
          break;
        case 'create_question':
          // Add sample question creation instruction
          break;
        case 'cast_vote':
          // Add sample vote casting instruction
          break;
        default:
          // Generic instruction
          break;
      }
      
      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      sampleTransaction.recentBlockhash = blockhash;
      
      // Estimate fee
      const fee = await connection.getFeeForMessage(sampleTransaction.compileMessage());
      
      return {
        estimatedFee: fee.value || 5000, // Default to 5000 lamports
        network: solanaClient.getCurrentNetwork(),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to estimate transaction fee:', error.message);
      throw error;
    }
  }

  /**
   * Generate unique transaction ID
   */
  generateTransactionId() {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Store transaction in Redis
   */
  async storeTransactionInRedis(transaction) {
    try {
      const redisClient = redis.getRedisClient();
      const key = `transaction:${transaction.id}`;
      
      await redisClient.hset(key, 'data', JSON.stringify(transaction));
      await redisClient.expire(key, 86400); // 24 hours
      
    } catch (error) {
      console.error('Failed to store transaction in Redis:', error.message);
    }
  }

  /**
   * Get transaction from Redis
   */
  async getTransactionFromRedis(transactionId) {
    try {
      const redisClient = redis.getRedisClient();
      const key = `transaction:${transactionId}`;
      
      const data = await redisClient.hget(key, 'data');
      return data ? JSON.parse(data) : null;
      
    } catch (error) {
      console.error('Failed to get transaction from Redis:', error.message);
      return null;
    }
  }

  /**
   * Clear old transactions
   */
  clearOldTransactions() {
    const now = new Date();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    // Clear old completed transactions
    for (const [id, transaction] of this.completedTransactions) {
      if (now - new Date(transaction.completedAt) > maxAge) {
        this.completedTransactions.delete(id);
      }
    }
    
    // Clear old failed transactions
    for (const [id, transaction] of this.failedTransactions) {
      if (now - new Date(transaction.failedAt) > maxAge) {
        this.failedTransactions.delete(id);
      }
    }
    
    console.log('Cleared old transactions');
  }

  /**
   * Get transaction statistics
   */
  getTransactionStatistics() {
    const stats = {
      total: this.getAllTransactionStatuses(),
      types: {},
      networks: {},
      timestamp: new Date().toISOString()
    };
    
    // Count by type
    const allTransactions = [
      ...this.transactionQueue,
      ...Array.from(this.pendingTransactions.values()),
      ...Array.from(this.completedTransactions.values()),
      ...Array.from(this.failedTransactions.values())
    ];
    
    for (const transaction of allTransactions) {
      const type = transaction.data.type;
      stats.types[type] = (stats.types[type] || 0) + 1;
    }
    
    return stats;
  }
}

// Create singleton instance
const transactionManager = new TransactionManager();

module.exports = transactionManager; 