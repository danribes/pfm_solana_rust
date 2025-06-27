const eventProcessor = require('../sync/events');
const stateSynchronizer = require('../sync/state');
const stateReconciler = require('../sync/reconciliation');
const blockchainService = require('../services/blockchain');
const auditService = require('../services/audit');
require('dotenv').config();

/**
 * Synchronization Worker
 * Handles background synchronization tasks
 */
class SyncWorker {
  constructor() {
    this.isRunning = false;
    this.workerStats = {
      startTime: null,
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      lastTaskTime: null
    };
    
    this.taskQueue = [];
    this.processingInterval = null;
    this.healthCheckInterval = null;
    
    this.taskHandlers = new Map();
    this.initializeTaskHandlers();
  }

  /**
   * Initialize task handlers
   */
  initializeTaskHandlers() {
    this.taskHandlers.set('sync_communities', this.syncCommunitiesTask.bind(this));
    this.taskHandlers.set('sync_memberships', this.syncMembershipsTask.bind(this));
    this.taskHandlers.set('sync_questions', this.syncQuestionsTask.bind(this));
    this.taskHandlers.set('sync_votes', this.syncVotesTask.bind(this));
    this.taskHandlers.set('reconcile_conflicts', this.reconcileConflictsTask.bind(this));
    this.taskHandlers.set('process_events', this.processEventsTask.bind(this));
    this.taskHandlers.set('health_check', this.healthCheckTask.bind(this));
  }

  /**
   * Start the synchronization worker
   */
  async start() {
    if (this.isRunning) {
      console.log('Sync worker is already running');
      return;
    }
    
    try {
      console.log('Starting synchronization worker...');
      
      this.isRunning = true;
      this.workerStats.startTime = new Date();
      
      // Start blockchain event listeners
      await blockchainService.startEventListeners();
      
      // Start periodic state synchronization
      await stateSynchronizer.startPeriodicSync();
      
      // Start task processing
      this.startTaskProcessing();
      
      // Start health checks
      this.startHealthChecks();
      
      console.log('Synchronization worker started successfully');
      
      await auditService.logAuditEvent('sync_worker_started', {
        level: 'INFO',
        category: 'WORKER',
        details: { workerStats: this.workerStats }
      });
      
    } catch (error) {
      console.error('Failed to start sync worker:', error.message);
      this.isRunning = false;
      throw error;
    }
  }

  /**
   * Stop the synchronization worker
   */
  async stop() {
    if (!this.isRunning) {
      return;
    }
    
    try {
      console.log('Stopping synchronization worker...');
      
      this.isRunning = false;
      
      // Stop blockchain event listeners
      await blockchainService.stopEventListeners();
      
      // Stop periodic state synchronization
      await stateSynchronizer.stopPeriodicSync();
      
      // Stop task processing
      this.stopTaskProcessing();
      
      // Stop health checks
      this.stopHealthChecks();
      
      console.log('Synchronization worker stopped');
      
      await auditService.logAuditEvent('sync_worker_stopped', {
        level: 'INFO',
        category: 'WORKER',
        details: { workerStats: this.workerStats }
      });
      
    } catch (error) {
      console.error('Failed to stop sync worker:', error.message);
      throw error;
    }
  }

  /**
   * Start task processing
   */
  startTaskProcessing() {
    this.processingInterval = setInterval(() => {
      this.processTaskQueue();
    }, parseInt(process.env.WORKER_PROCESSING_INTERVAL || '1000', 10));
  }

  /**
   * Stop task processing
   */
  stopTaskProcessing() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }

  /**
   * Start health checks
   */
  startHealthChecks() {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, parseInt(process.env.WORKER_HEALTH_CHECK_INTERVAL || '30000', 10)); // 30 seconds
  }

  /**
   * Stop health checks
   */
  stopHealthChecks() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Add task to queue
   */
  addTask(taskType, taskData = {}) {
    const task = {
      id: this.generateTaskId(),
      type: taskType,
      data: taskData,
      timestamp: new Date(),
      status: 'pending',
      retryCount: 0,
      maxRetries: parseInt(process.env.MAX_TASK_RETRIES || '3', 10)
    };
    
    this.taskQueue.push(task);
    this.workerStats.totalTasks++;
    
    console.log(`Task added to queue: ${taskType} (ID: ${task.id})`);
    
    return task.id;
  }

  /**
   * Process task queue
   */
  async processTaskQueue() {
    if (this.taskQueue.length === 0 || !this.isRunning) {
      return;
    }
    
    const task = this.taskQueue.shift();
    
    try {
      console.log(`Processing task: ${task.type} (ID: ${task.id})`);
      
      task.status = 'processing';
      this.workerStats.lastTaskTime = new Date();
      
      const handler = this.taskHandlers.get(task.type);
      if (!handler) {
        throw new Error(`No handler found for task type: ${task.type}`);
      }
      
      await handler(task.data);
      
      task.status = 'completed';
      this.workerStats.completedTasks++;
      
      console.log(`Task completed: ${task.type} (ID: ${task.id})`);
      
    } catch (error) {
      console.error(`Task failed: ${task.type} (ID: ${task.id}):`, error.message);
      
      task.status = 'failed';
      task.error = error.message;
      this.workerStats.failedTasks++;
      
      // Handle retry logic
      if (task.retryCount < task.maxRetries) {
        task.retryCount++;
        task.status = 'pending';
        task.timestamp = new Date();
        
        // Add back to queue with delay
        setTimeout(() => {
          this.taskQueue.unshift(task);
        }, parseInt(process.env.TASK_RETRY_DELAY || '5000', 10) * task.retryCount);
        
        console.log(`Task scheduled for retry: ${task.type} (ID: ${task.id}, attempt ${task.retryCount})`);
      }
    }
  }

  /**
   * Sync communities task
   */
  async syncCommunitiesTask(data) {
    console.log('Executing sync communities task...');
    await stateSynchronizer.syncCommunities();
  }

  /**
   * Sync memberships task
   */
  async syncMembershipsTask(data) {
    console.log('Executing sync memberships task...');
    await stateSynchronizer.syncMemberships();
  }

  /**
   * Sync questions task
   */
  async syncQuestionsTask(data) {
    console.log('Executing sync questions task...');
    await stateSynchronizer.syncQuestions();
  }

  /**
   * Sync votes task
   */
  async syncVotesTask(data) {
    console.log('Executing sync votes task...');
    await stateSynchronizer.syncVotes();
  }

  /**
   * Reconcile conflicts task
   */
  async reconcileConflictsTask(data) {
    console.log('Executing reconcile conflicts task...');
    await stateReconciler.detectAndResolveConflicts();
  }

  /**
   * Process events task
   */
  async processEventsTask(data) {
    console.log('Executing process events task...');
    // This would process any pending events in the queue
    // For now, we'll just log that it was executed
  }

  /**
   * Health check task
   */
  async healthCheckTask(data) {
    console.log('Executing health check task...');
    await this.performHealthCheck();
  }

  /**
   * Perform health check
   */
  async performHealthCheck() {
    try {
      const healthStatus = {
        worker: this.getWorkerHealth(),
        blockchain: await blockchainService.getBlockchainHealth(),
        eventListening: blockchainService.getEventListeningStatus(),
        sync: stateSynchronizer.getSyncStatus(),
        reconciliation: stateReconciler.getReconciliationStats(),
        timestamp: new Date()
      };
      
      // Log health status
      await auditService.logAuditEvent('worker_health_check', {
        level: 'INFO',
        category: 'WORKER',
        details: healthStatus
      });
      
      // Check for critical issues
      if (healthStatus.blockchain.status === 'unhealthy') {
        console.warn('Blockchain connection is unhealthy');
      }
      
      if (healthStatus.eventListening.status === 'disconnected') {
        console.warn('Event listening is disconnected');
      }
      
    } catch (error) {
      console.error('Health check failed:', error.message);
      
      await auditService.logAuditEvent('worker_health_check_failed', {
        level: 'ERROR',
        category: 'WORKER',
        details: { error: error.message }
      });
    }
  }

  /**
   * Get worker health status
   */
  getWorkerHealth() {
    const uptime = this.workerStats.startTime ? 
      Date.now() - this.workerStats.startTime.getTime() : 0;
    
    return {
      status: this.isRunning ? 'healthy' : 'stopped',
      uptime,
      totalTasks: this.workerStats.totalTasks,
      completedTasks: this.workerStats.completedTasks,
      failedTasks: this.workerStats.failedTasks,
      successRate: this.workerStats.totalTasks > 0 ? 
        (this.workerStats.completedTasks / this.workerStats.totalTasks) * 100 : 100,
      queueLength: this.taskQueue.length,
      lastTaskTime: this.workerStats.lastTaskTime
    };
  }

  /**
   * Get worker statistics
   */
  getWorkerStats() {
    return {
      ...this.workerStats,
      health: this.getWorkerHealth(),
      queueLength: this.taskQueue.length
    };
  }

  /**
   * Generate unique task ID
   */
  generateTaskId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get task status
   */
  getTaskStatus(taskId) {
    const task = this.taskQueue.find(t => t.id === taskId);
    return task ? { ...task } : null;
  }

  /**
   * Clear completed tasks
   */
  clearCompletedTasks() {
    this.taskQueue = this.taskQueue.filter(task => task.status === 'pending');
    console.log('Completed tasks cleared from queue');
  }

  /**
   * Force task execution
   */
  async forceTaskExecution(taskType, taskData = {}) {
    console.log(`Forcing task execution: ${taskType}`);
    
    const handler = this.taskHandlers.get(taskType);
    if (!handler) {
      throw new Error(`No handler found for task type: ${taskType}`);
    }
    
    await handler(taskData);
  }

  /**
   * Schedule periodic tasks
   */
  schedulePeriodicTasks() {
    // Schedule community sync every 10 minutes
    setInterval(() => {
      this.addTask('sync_communities');
    }, 10 * 60 * 1000);
    
    // Schedule membership sync every 5 minutes
    setInterval(() => {
      this.addTask('sync_memberships');
    }, 5 * 60 * 1000);
    
    // Schedule question sync every 5 minutes
    setInterval(() => {
      this.addTask('sync_questions');
    }, 5 * 60 * 1000);
    
    // Schedule vote sync every 2 minutes
    setInterval(() => {
      this.addTask('sync_votes');
    }, 2 * 60 * 1000);
    
    // Schedule conflict reconciliation every 15 minutes
    setInterval(() => {
      this.addTask('reconcile_conflicts');
    }, 15 * 60 * 1000);
    
    console.log('Periodic tasks scheduled');
  }
}

// Create singleton instance
const syncWorker = new SyncWorker();

module.exports = syncWorker; 