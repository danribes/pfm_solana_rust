const solanaClient = require('../blockchain/solana');
const contractManager = require('../blockchain/contracts');
const eventListener = require('../blockchain/events');
const transactionManager = require('../blockchain/transactions');

/**
 * Blockchain Service Layer
 * Provides a unified interface for Solana client, contract, event, and transaction management
 */
class BlockchainService {
  // Solana client
  getSolanaClient() {
    return solanaClient;
  }

  // Contract manager
  getContractManager() {
    return contractManager;
  }

  // Event listener
  getEventListener() {
    return eventListener;
  }

  // Transaction manager
  getTransactionManager() {
    return transactionManager;
  }

  // Utility: Start all event listeners
  async startEventListeners() {
    await eventListener.startEventListening();
  }

  // Utility: Stop all event listeners
  async stopEventListeners() {
    await eventListener.stopEventListening();
  }

  // Utility: Add transaction to queue
  async queueTransaction(transactionData) {
    return await transactionManager.addToQueue(transactionData);
  }

  // Utility: Get transaction status
  async getTransactionStatus(transactionId) {
    return await transactionManager.getTransactionStatus(transactionId);
  }

  // Utility: Get blockchain health
  async getBlockchainHealth() {
    return await solanaClient.getAllConnectionHealth();
  }

  // Utility: Get event listening status
  getEventListeningStatus() {
    return eventListener.getEventListeningStatus();
  }

  // Utility: Get transaction statistics
  getTransactionStatistics() {
    return transactionManager.getTransactionStatistics();
  }
}

// Create singleton instance
const blockchainService = new BlockchainService();

module.exports = blockchainService; 