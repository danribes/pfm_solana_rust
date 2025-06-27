const eventProcessor = require('../sync/events');
const stateSynchronizer = require('../sync/state');
const stateReconciler = require('../sync/reconciliation');
const syncWorker = require('../workers/sync-worker');
const blockchainService = require('./blockchain');
const auditService = require('./audit');
require('dotenv').config();

/**
 * Synchronization Service
 * Provides unified interface for all synchronization operations
 */
class SynchronizationService {
  constructor() {
    this.isInitialized = false;
    this.serviceStats = {
      startTime: null,
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      lastSyncTime: null
    };
  }

  /**
   * Initialize synchronization service
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('Synchronization service already initialized');
      return;
    }
    
    try {
      console.log('Initializing synchronization service...');
      
      // Start the sync worker
      await syncWorker.start();
      
      // Schedule periodic tasks
      syncWorker.schedulePeriodicTasks();
      
      this.isInitialized = true;
      this.serviceStats.startTime = new Date();
      
      console.log('Synchronization service initialized successfully');
      
      await auditService.logAuditEvent('sync_service_initialized', {
        level: 'INFO',
        category: 'SYNC',
        details: { serviceStats: this.serviceStats }
      });
      
    } catch (error) {
      console.error('Failed to initialize synchronization service:', error.message);
      throw error;
    }
  }

  /**
   * Shutdown synchronization service
   */
  async shutdown() {
    if (!this.isInitialized) {
      return;
    }
    
    try {
      console.log('Shutting down synchronization service...');
      
      // Stop the sync worker
      await syncWorker.stop();
      
      this.isInitialized = false;
      
      console.log('Synchronization service shut down successfully');
      
      await auditService.logAuditEvent('sync_service_shutdown', {
        level: 'INFO',
        category: 'SYNC',
        details: { serviceStats: this.serviceStats }
      });
      
    } catch (error) {
      console.error('Failed to shutdown synchronization service:', error.message);
      throw error;
    }
  }

  /**
   * Process blockchain event
   */
  async processBlockchainEvent(eventData) {
    try {
      await eventProcessor.processEvent(eventData);
      
      this.serviceStats.totalSyncs++;
      this.serviceStats.lastSyncTime = new Date();
      
    } catch (error) {
      console.error('Failed to process blockchain event:', error.message);
      this.serviceStats.failedSyncs++;
      throw error;
    }
  }

  /**
   * Perform full synchronization
   */
  async performFullSync() {
    try {
      console.log('Performing full synchronization...');
      
      this.serviceStats.totalSyncs++;
      this.serviceStats.lastSyncTime = new Date();
      
      // Perform state synchronization
      await stateSynchronizer.performFullSync();
      
      // Perform conflict reconciliation
      await stateReconciler.detectAndResolveConflicts();
      
      this.serviceStats.successfulSyncs++;
      
      console.log('Full synchronization completed successfully');
      
      await auditService.logAuditEvent('full_sync_completed', {
        level: 'INFO',
        category: 'SYNC',
        details: { serviceStats: this.serviceStats }
      });
      
    } catch (error) {
      console.error('Full synchronization failed:', error.message);
      
      this.serviceStats.failedSyncs++;
      
      await auditService.logAuditEvent('full_sync_failed', {
        level: 'ERROR',
        category: 'SYNC',
        details: { error: error.message }
      });
      
      throw error;
    }
  }

  /**
   * Force synchronization for specific data type
   */
  async forceSync(dataType) {
    try {
      console.log(`Forcing synchronization for: ${dataType}`);
      
      switch (dataType) {
        case 'communities':
          await stateSynchronizer.syncCommunities();
          break;
        case 'memberships':
          await stateSynchronizer.syncMemberships();
          break;
        case 'questions':
          await stateSynchronizer.syncQuestions();
          break;
        case 'votes':
          await stateSynchronizer.syncVotes();
          break;
        case 'users':
          await stateSynchronizer.syncUsers();
          break;
        case 'conflicts':
          await stateReconciler.detectAndResolveConflicts();
          break;
        default:
          throw new Error(`Unknown data type: ${dataType}`);
      }
      
      console.log(`Forced synchronization completed for: ${dataType}`);
      
    } catch (error) {
      console.error(`Forced synchronization failed for ${dataType}:`, error.message);
      throw error;
    }
  }

  /**
   * Get synchronization status
   */
  getSyncStatus() {
    return {
      isInitialized: this.isInitialized,
      serviceStats: this.serviceStats,
      workerStats: syncWorker.getWorkerStats(),
      eventProcessorStats: eventProcessor.getProcessingStatistics(),
      stateSyncStatus: stateSynchronizer.getSyncStatus(),
      reconciliationStats: stateReconciler.getReconciliationStats(),
      blockchainHealth: blockchainService.getBlockchainHealth(),
      eventListeningStatus: blockchainService.getEventListeningStatus()
    };
  }

  /**
   * Get data consistency report
   */
  async getConsistencyReport() {
    try {
      const report = await stateSynchronizer.getConsistencyReport();
      
      // Add conflict summary
      report.conflicts = await stateReconciler.getConflictSummary();
      
      // Add worker health
      report.workerHealth = syncWorker.getWorkerHealth();
      
      return report;
    } catch (error) {
      console.error('Failed to get consistency report:', error.message);
      throw error;
    }
  }

  /**
   * Get synchronization statistics
   */
  getSyncStatistics() {
    return {
      service: this.serviceStats,
      worker: syncWorker.getWorkerStats(),
      events: eventProcessor.getProcessingStatistics(),
      state: stateSynchronizer.getSyncStatus(),
      reconciliation: stateReconciler.getReconciliationStats()
    };
  }

  /**
   * Add synchronization task
   */
  addSyncTask(taskType, taskData = {}) {
    return syncWorker.addTask(taskType, taskData);
  }

  /**
   * Get task status
   */
  getTaskStatus(taskId) {
    return syncWorker.getTaskStatus(taskId);
  }

  /**
   * Force task execution
   */
  async forceTaskExecution(taskType, taskData = {}) {
    return await syncWorker.forceTaskExecution(taskType, taskData);
  }

  /**
   * Clear completed tasks
   */
  clearCompletedTasks() {
    syncWorker.clearCompletedTasks();
  }

  /**
   * Get event processing statistics
   */
  getEventProcessingStats() {
    return eventProcessor.getProcessingStatistics();
  }

  /**
   * Clear event processing queue
   */
  clearEventQueue() {
    eventProcessor.clearQueue();
  }

  /**
   * Get blockchain integration status
   */
  getBlockchainStatus() {
    return {
      health: blockchainService.getBlockchainHealth(),
      eventListening: blockchainService.getEventListeningStatus(),
      transactionStats: blockchainService.getTransactionStatistics()
    };
  }

  /**
   * Start blockchain event listeners
   */
  async startEventListeners() {
    await blockchainService.startEventListeners();
  }

  /**
   * Stop blockchain event listeners
   */
  async stopEventListeners() {
    await blockchainService.stopEventListeners();
  }

  /**
   * Queue blockchain transaction
   */
  async queueTransaction(transactionData) {
    return await blockchainService.queueTransaction(transactionData);
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(transactionId) {
    return await blockchainService.getTransactionStatus(transactionId);
  }

  /**
   * Perform health check
   */
  async performHealthCheck() {
    try {
      const healthStatus = {
        service: {
          status: this.isInitialized ? 'healthy' : 'stopped',
          uptime: this.serviceStats.startTime ? 
            Date.now() - this.serviceStats.startTime.getTime() : 0
        },
        worker: syncWorker.getWorkerHealth(),
        blockchain: await blockchainService.getBlockchainHealth(),
        eventListening: blockchainService.getEventListeningStatus(),
        timestamp: new Date()
      };
      
      // Log health status
      await auditService.logAuditEvent('sync_service_health_check', {
        level: 'INFO',
        category: 'SYNC',
        details: healthStatus
      });
      
      return healthStatus;
    } catch (error) {
      console.error('Health check failed:', error.message);
      throw error;
    }
  }

  /**
   * Get service information
   */
  getServiceInfo() {
    return {
      name: 'Synchronization Service',
      version: '1.0.0',
      description: 'Handles synchronization between backend and blockchain',
      isInitialized: this.isInitialized,
      startTime: this.serviceStats.startTime,
      uptime: this.serviceStats.startTime ? 
        Date.now() - this.serviceStats.startTime.getTime() : 0
    };
  }
}

// Create singleton instance
const synchronizationService = new SynchronizationService();

module.exports = synchronizationService; 