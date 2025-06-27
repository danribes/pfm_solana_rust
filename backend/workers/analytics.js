/**
 * Analytics Workers
 * Background processing for analytics tasks and data aggregation
 */

const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const streamingAnalytics = require('../analytics/streaming');
const batchAnalytics = require('../analytics/batch');
const dataWarehouse = require('../analytics/warehouse');
const redis = require('../redis');

class AnalyticsWorker {
  constructor() {
    this.workers = new Map();
    this.isRunning = false;
    this.workerStats = {
      activeWorkers: 0,
      tasksCompleted: 0,
      errors: 0
    };
  }

  /**
   * Initialize analytics workers
   */
  async initialize() {
    try {
      // Initialize streaming analytics
      await this.initializeStreamingWorker();
      
      // Initialize batch processing worker
      await this.initializeBatchWorker();
      
      // Initialize warehouse worker
      await this.initializeWarehouseWorker();
      
      this.isRunning = true;
      console.log('Analytics workers initialized successfully');
    } catch (error) {
      console.error('Failed to initialize analytics workers:', error);
      throw error;
    }
  }

  /**
   * Initialize streaming analytics worker
   */
  async initializeStreamingWorker() {
    const streamingWorker = new Worker(__filename, {
      workerData: { type: 'streaming' }
    });

    streamingWorker.on('message', (message) => {
      this.handleWorkerMessage('streaming', message);
    });

    streamingWorker.on('error', (error) => {
      this.handleWorkerError('streaming', error);
    });

    streamingWorker.on('exit', (code) => {
      this.handleWorkerExit('streaming', code);
    });

    this.workers.set('streaming', streamingWorker);
    this.workerStats.activeWorkers++;
  }

  /**
   * Initialize batch processing worker
   */
  async initializeBatchWorker() {
    const batchWorker = new Worker(__filename, {
      workerData: { type: 'batch' }
    });

    batchWorker.on('message', (message) => {
      this.handleWorkerMessage('batch', message);
    });

    batchWorker.on('error', (error) => {
      this.handleWorkerError('batch', error);
    });

    batchWorker.on('exit', (code) => {
      this.handleWorkerExit('batch', code);
    });

    this.workers.set('batch', batchWorker);
    this.workerStats.activeWorkers++;
  }

  /**
   * Initialize warehouse worker
   */
  async initializeWarehouseWorker() {
    const warehouseWorker = new Worker(__filename, {
      workerData: { type: 'warehouse' }
    });

    warehouseWorker.on('message', (message) => {
      this.handleWorkerMessage('warehouse', message);
    });

    warehouseWorker.on('error', (error) => {
      this.handleWorkerError('warehouse', error);
    });

    warehouseWorker.on('exit', (code) => {
      this.handleWorkerExit('warehouse', code);
    });

    this.workers.set('warehouse', warehouseWorker);
    this.workerStats.activeWorkers++;
  }

  /**
   * Handle worker messages
   */
  handleWorkerMessage(workerType, message) {
    console.log(`Worker ${workerType} message:`, message);
    
    switch (message.type) {
      case 'taskCompleted':
        this.workerStats.tasksCompleted++;
        break;
      case 'error':
        this.workerStats.errors++;
        break;
      case 'stats':
        // Update worker-specific stats
        break;
    }
  }

  /**
   * Handle worker errors
   */
  handleWorkerError(workerType, error) {
    console.error(`Worker ${workerType} error:`, error);
    this.workerStats.errors++;
    
    // Restart worker if needed
    this.restartWorker(workerType);
  }

  /**
   * Handle worker exit
   */
  handleWorkerExit(workerType, code) {
    console.log(`Worker ${workerType} exited with code ${code}`);
    this.workerStats.activeWorkers--;
    
    // Restart worker if it was unexpected
    if (code !== 0) {
      this.restartWorker(workerType);
    }
  }

  /**
   * Restart a worker
   */
  async restartWorker(workerType) {
    try {
      const worker = this.workers.get(workerType);
      if (worker) {
        worker.terminate();
        this.workers.delete(workerType);
      }

      // Reinitialize the specific worker
      switch (workerType) {
        case 'streaming':
          await this.initializeStreamingWorker();
          break;
        case 'batch':
          await this.initializeBatchWorker();
          break;
        case 'warehouse':
          await this.initializeWarehouseWorker();
          break;
      }
      
      console.log(`Worker ${workerType} restarted successfully`);
    } catch (error) {
      console.error(`Failed to restart worker ${workerType}:`, error);
    }
  }

  /**
   * Send task to worker
   */
  sendTask(workerType, task) {
    const worker = this.workers.get(workerType);
    if (!worker) {
      throw new Error(`Worker ${workerType} not found`);
    }

    worker.postMessage({
      type: 'task',
      data: task
    });
  }

  /**
   * Get worker statistics
   */
  getWorkerStats() {
    return {
      ...this.workerStats,
      isRunning: this.isRunning,
      activeWorkers: this.workers.size
    };
  }

  /**
   * Stop all workers
   */
  async stop() {
    this.isRunning = false;
    
    for (const [workerType, worker] of this.workers) {
      console.log(`Stopping worker: ${workerType}`);
      worker.terminate();
    }
    
    this.workers.clear();
    this.workerStats.activeWorkers = 0;
    
    console.log('All analytics workers stopped');
  }
}

// Worker thread code
if (!isMainThread) {
  const { type } = workerData;
  
  // Initialize worker-specific modules
  let analyticsModule;
  
  switch (type) {
    case 'streaming':
      analyticsModule = require('../analytics/streaming');
      break;
    case 'batch':
      analyticsModule = require('../analytics/batch');
      break;
    case 'warehouse':
      analyticsModule = require('../analytics/warehouse');
      break;
  }

  // Handle messages from main thread
  parentPort.on('message', async (message) => {
    try {
      switch (message.type) {
        case 'task':
          await processTask(type, message.data);
          break;
        case 'initialize':
          await initializeWorker(type);
          break;
        case 'shutdown':
          process.exit(0);
          break;
      }
    } catch (error) {
      parentPort.postMessage({
        type: 'error',
        error: error.message
      });
    }
  });

  // Initialize worker
  initializeWorker(type);
}

/**
 * Initialize worker based on type
 */
async function initializeWorker(type) {
  try {
    switch (type) {
      case 'streaming':
        // Set up event listeners for streaming analytics
        const streamingAnalytics = require('../analytics/streaming');
        streamingAnalytics.on('eventProcessed', (data) => {
          parentPort.postMessage({
            type: 'taskCompleted',
            data: { type: 'eventProcessed', ...data }
          });
        });
        break;
        
      case 'batch':
        // Initialize batch analytics
        const batchAnalytics = require('../analytics/batch');
        await batchAnalytics.initialize();
        break;
        
      case 'warehouse':
        // Initialize data warehouse
        const dataWarehouse = require('../analytics/warehouse');
        await dataWarehouse.initialize();
        break;
    }
    
    parentPort.postMessage({
      type: 'initialized',
      workerType: type
    });
  } catch (error) {
    parentPort.postMessage({
      type: 'error',
      error: error.message
    });
  }
}

/**
 * Process task based on worker type
 */
async function processTask(type, task) {
  try {
    switch (type) {
      case 'streaming':
        await processStreamingTask(task);
        break;
      case 'batch':
        await processBatchTask(task);
        break;
      case 'warehouse':
        await processWarehouseTask(task);
        break;
    }
    
    parentPort.postMessage({
      type: 'taskCompleted',
      data: { taskType: type, task }
    });
  } catch (error) {
    parentPort.postMessage({
      type: 'error',
      error: error.message,
      task
    });
  }
}

/**
 * Process streaming task
 */
async function processStreamingTask(task) {
  const streamingAnalytics = require('../analytics/streaming');
  
  switch (task.action) {
    case 'processEvent':
      await streamingAnalytics.processEvent(task.event);
      break;
    case 'getMetrics':
      const metrics = await streamingAnalytics.getRealTimeMetrics();
      parentPort.postMessage({
        type: 'metrics',
        data: metrics
      });
      break;
    default:
      throw new Error(`Unknown streaming task action: ${task.action}`);
  }
}

/**
 * Process batch task
 */
async function processBatchTask(task) {
  const batchAnalytics = require('../analytics/batch');
  
  switch (task.action) {
    case 'runDailyAnalytics':
      await batchAnalytics.processDailyAnalytics();
      break;
    case 'runWeeklyAnalytics':
      await batchAnalytics.processWeeklyAnalytics();
      break;
    case 'runMonthlyAnalytics':
      await batchAnalytics.processMonthlyAnalytics();
      break;
    case 'cleanupData':
      await batchAnalytics.cleanupOldData();
      break;
    default:
      throw new Error(`Unknown batch task action: ${task.action}`);
  }
}

/**
 * Process warehouse task
 */
async function processWarehouseTask(task) {
  const dataWarehouse = require('../analytics/warehouse');
  
  switch (task.action) {
    case 'runETL':
      await dataWarehouse.runETL(task.date);
      break;
    case 'query':
      const result = await dataWarehouse.queryWarehouse(task.query, task.params);
      parentPort.postMessage({
        type: 'queryResult',
        data: result
      });
      break;
    default:
      throw new Error(`Unknown warehouse task action: ${task.action}`);
  }
}

// Export for main thread
if (isMainThread) {
  module.exports = AnalyticsWorker;
} 