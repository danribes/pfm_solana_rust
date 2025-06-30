/**
 * Offline Service
 * 
 * Core service for managing offline functionality, data persistence,
 * synchronization, and fallback mechanisms.
 */

import {
  OfflineService,
  OfflineState,
  OfflineConfig,
  NetworkStatus,
  OfflineOperation,
  SyncStatus,
  DataConflict,
  CacheEntry,
  CacheStats,
  OfflineEvents,
  OfflineError,
  SyncError,
  StorageError,
  ConnectionState,
  NetworkQuality,
  OperationStatus,
  ConflictResolution
} from '../types/offline';

import { createOfflineConfig, getCurrentConfig } from '../config/offline';

/**
 * Offline Service Implementation
 * Singleton pattern for centralized offline management
 */
class OfflineServiceImpl implements OfflineService {
  private static instance: OfflineServiceImpl;
  private state: OfflineState;
  private config: OfflineConfig;
  private eventListeners: Map<keyof OfflineEvents, Set<Function>> = new Map();
  private networkMonitorInterval?: NodeJS.Timeout;
  private syncInterval?: NodeJS.Timeout;
  private isInitialized = false;

  constructor() {
    this.config = createOfflineConfig();
    this.state = this.createInitialState();
  }

  public static getInstance(): OfflineServiceImpl {
    if (!OfflineServiceImpl.instance) {
      OfflineServiceImpl.instance = new OfflineServiceImpl();
    }
    return OfflineServiceImpl.instance;
  }

  // Initialization
  public async initialize(config?: Partial<OfflineConfig>): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Merge configuration
      if (config) {
        this.config = { ...this.config, ...config };
      }

      // Initialize storage
      await this.initializeStorage();

      // Load persisted state
      await this.loadPersistedState();

      // Start network monitoring
      this.startNetworkMonitoring();

      // Start synchronization
      if (this.config.enabled) {
        await this.startSync();
      }

      this.isInitialized = true;
      this.emit('connection:online', this.state.networkStatus);
    } catch (error) {
      const offlineError = new OfflineError(
        `Failed to initialize offline service: ${error.message}`,
        'INIT_FAILED',
        'initialize',
        true
      );
      this.state.error = offlineError.message;
      throw offlineError;
    }
  }

  public async shutdown(): Promise<void> {
    this.stopNetworkMonitoring();
    this.stopSync();
    
    // Persist state
    await this.persistState();
    
    // Clear event listeners
    this.eventListeners.clear();
    
    this.isInitialized = false;
  }

  // Network Monitoring
  public startNetworkMonitoring(): void {
    // Monitor navigator.onLine
    const updateNetworkStatus = () => {
      const wasOnline = this.state.networkStatus.isOnline;
      const isOnline = navigator.onLine;
      
      this.updateNetworkStatus({
        ...this.state.networkStatus,
        isOnline,
        connectionState: isOnline ? 'online' : 'offline',
        lastOnline: isOnline ? new Date() : this.state.networkStatus.lastOnline,
        lastOffline: !isOnline ? new Date() : this.state.networkStatus.lastOffline,
        downtime: isOnline ? 0 : this.state.networkStatus.downtime + (Date.now() - this.state.networkStatus.lastOffline)
      });

      // Emit events on state changes
      if (wasOnline !== isOnline) {
        this.emit(isOnline ? 'connection:online' : 'connection:offline', this.state.networkStatus);
      }
    };

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    // Periodic network quality check
    this.networkMonitorInterval = setInterval(async () => {
      await this.checkNetworkQuality();
    }, 10000); // Check every 10 seconds

    // Initial check
    updateNetworkStatus();
  }

  public stopNetworkMonitoring(): void {
    if (this.networkMonitorInterval) {
      clearInterval(this.networkMonitorInterval);
      this.networkMonitorInterval = undefined;
    }
  }

  public getNetworkStatus(): NetworkStatus {
    return { ...this.state.networkStatus };
  }

  // Operation Management
  public async queueOperation(
    operation: Omit<OfflineOperation, 'id' | 'timestamp' | 'status' | 'retryCount'>
  ): Promise<string> {
    const id = this.generateId();
    const queuedOperation: OfflineOperation = {
      ...operation,
      id,
      timestamp: new Date(),
      status: 'pending',
      retryCount: 0
    };

    this.state.operationQueue.operations.push(queuedOperation);
    this.state.operationQueue.totalSize += this.calculateOperationSize(queuedOperation);

    this.emit('operation:queued', queuedOperation);

    // Try immediate execution if online
    if (this.state.networkStatus.isOnline) {
      this.processQueue();
    }

    await this.persistState();
    return id;
  }

  public async processQueue(): Promise<void> {
    if (!this.state.networkStatus.isOnline || this.state.operationQueue.processingCount > 0) {
      return;
    }

    const pendingOperations = this.state.operationQueue.operations.filter(
      op => op.status === 'pending' || op.status === 'failed'
    );

    for (const operation of pendingOperations) {
      if (operation.retryCount >= operation.maxRetries) {
        operation.status = 'failed';
        this.emit('operation:failed', { ...operation, error: 'Max retries exceeded' });
        continue;
      }

      try {
        this.state.operationQueue.processingCount++;
        operation.status = 'syncing';

        await this.executeOperation(operation);
        
        operation.status = 'synced';
        this.state.operationQueue.completedCount++;
        this.emit('operation:synced', operation);

        // Remove completed operation
        this.removeOperation(operation.id);
      } catch (error) {
        operation.status = 'failed';
        operation.retryCount++;
        operation.error = error.message;
        this.state.operationQueue.failedCount++;
        
        this.emit('operation:failed', { ...operation, error: error.message });
      } finally {
        this.state.operationQueue.processingCount--;
      }
    }

    await this.persistState();
  }

  public async clearQueue(): Promise<void> {
    this.state.operationQueue.operations = [];
    this.state.operationQueue.totalSize = 0;
    this.state.operationQueue.processingCount = 0;
    this.state.operationQueue.failedCount = 0;
    this.state.operationQueue.completedCount = 0;
    await this.persistState();
  }

  public getQueuedOperations(): OfflineOperation[] {
    return [...this.state.operationQueue.operations];
  }

  // Synchronization
  public async startSync(): Promise<void> {
    if (this.syncInterval) return;

    this.state.syncStatus.isActive = true;
    this.emit('sync:started', this.state.syncStatus);

    this.syncInterval = setInterval(async () => {
      if (this.state.networkStatus.isOnline) {
        await this.syncNow();
      }
    }, this.config.syncInterval);
  }

  public stopSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = undefined;
    }
    this.state.syncStatus.isActive = false;
  }

  public async syncNow(): Promise<void> {
    if (!this.state.networkStatus.isOnline) {
      throw new SyncError('Cannot sync while offline', []);
    }

    try {
      this.state.syncStatus.lastSync = new Date();
      this.state.syncStatus.syncProgress = 0;

      // Process queued operations
      await this.processQueue();

      // Sync cache data
      await this.syncCacheData();

      this.state.syncStatus.nextSync = new Date(Date.now() + this.config.syncInterval);
      this.state.syncStatus.syncProgress = 100;
      
      this.emit('sync:completed', this.state.syncStatus);
    } catch (error) {
      this.emit('sync:failed', { ...this.state.syncStatus, error: error.message });
      throw new SyncError(`Sync failed: ${error.message}`, this.state.operationQueue.operations);
    }
  }

  public getSyncStatus(): SyncStatus {
    return { ...this.state.syncStatus };
  }

  // Data Management
  public async getCachedData<T>(key: string): Promise<T | null> {
    try {
      const entry = await this.getStorageEntry<T>(key);
      if (!entry) return null;

      // Check expiration
      if (entry.expires && entry.expires < new Date()) {
        await this.removeCachedData(key);
        return null;
      }

      // Update cache stats
      this.state.cacheStats.hitRate = this.calculateHitRate(true);
      return entry.data;
    } catch (error) {
      this.state.cacheStats.missRate = this.calculateHitRate(false);
      return null;
    }
  }

  public async setCachedData<T>(key: string, data: T, ttl?: number): Promise<void> {
    const entry: CacheEntry<T> = {
      key,
      data,
      timestamp: new Date(),
      expires: ttl ? new Date(Date.now() + ttl) : null,
      version: 1,
      checksum: this.calculateChecksum(data),
      size: this.calculateDataSize(data)
    };

    await this.setStorageEntry(key, entry);
    this.updateCacheStats();
  }

  public async removeCachedData(key: string): Promise<void> {
    await this.removeStorageEntry(key);
    this.updateCacheStats();
  }

  public async clearCache(): Promise<void> {
    await this.clearStorage();
    this.state.cacheStats = this.createInitialCacheStats();
  }

  public async getCacheStats(): Promise<CacheStats> {
    await this.updateCacheStats();
    return { ...this.state.cacheStats };
  }

  // Conflict Resolution
  public getConflicts(): DataConflict[] {
    return [...this.state.conflicts];
  }

  public async resolveConflict(
    conflictId: string, 
    resolution: ConflictResolution, 
    data?: any
  ): Promise<void> {
    const conflict = this.state.conflicts.find(c => c.id === conflictId);
    if (!conflict) {
      throw new OfflineError(`Conflict ${conflictId} not found`, 'CONFLICT_NOT_FOUND');
    }

    conflict.resolution = resolution;
    conflict.resolved = true;

    // Apply resolution
    switch (resolution) {
      case 'local':
        // Keep local data
        break;
      case 'remote':
        // Use remote data
        await this.setCachedData(conflict.id, conflict.remoteData);
        break;
      case 'manual':
        // Use provided data
        if (data) {
          await this.setCachedData(conflict.id, data);
        }
        break;
      case 'timestamp':
        // Use newer data
        const useLocal = conflict.localTimestamp > conflict.remoteTimestamp;
        await this.setCachedData(conflict.id, useLocal ? conflict.localData : conflict.remoteData);
        break;
    }

    // Remove resolved conflict
    this.state.conflicts = this.state.conflicts.filter(c => c.id !== conflictId);
    this.emit('conflict:resolved', conflict);
  }

  // Storage Management
  public async getStorageUsage(): Promise<number> {
    // Implementation depends on storage type
    return this.state.cacheStats.totalSize;
  }

  public async cleanupStorage(): Promise<void> {
    const now = new Date();
    const retentionPeriod = this.config.dataRetentionPeriod * 24 * 60 * 60 * 1000;
    
    // Remove expired entries
    // Implementation depends on storage type
    await this.updateCacheStats();
  }

  // Events
  public on<K extends keyof OfflineEvents>(
    event: K, 
    handler: (data: OfflineEvents[K]) => void
  ): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(handler);
  }

  public off<K extends keyof OfflineEvents>(
    event: K, 
    handler: (data: OfflineEvents[K]) => void
  ): void {
    const handlers = this.eventListeners.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  public emit<K extends keyof OfflineEvents>(event: K, data: OfflineEvents[K]): void {
    const handlers = this.eventListeners.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  // Private Methods
  private createInitialState(): OfflineState {
    return {
      networkStatus: {
        isOnline: navigator.onLine,
        connectionState: navigator.onLine ? 'online' : 'offline',
        quality: 'good',
        speed: 0,
        latency: 0,
        lastOnline: navigator.onLine ? new Date() : null,
        lastOffline: !navigator.onLine ? new Date() : null,
        downtime: 0
      },
      config: this.config,
      syncStatus: {
        isActive: false,
        lastSync: null,
        nextSync: null,
        pendingOperations: 0,
        failedOperations: 0,
        conflictCount: 0,
        syncProgress: 0
      },
      operationQueue: {
        operations: [],
        totalSize: 0,
        maxSize: this.config.storageQuota * 1024 * 1024, // Convert MB to bytes
        processingCount: 0,
        failedCount: 0,
        completedCount: 0
      },
      cacheStats: this.createInitialCacheStats(),
      metrics: {
        offlineTime: 0,
        operationsQueued: 0,
        operationsSynced: 0,
        operationsFailed: 0,
        syncAttempts: 0,
        syncSuccesses: 0,
        syncFailures: 0,
        cacheHits: 0,
        cacheMisses: 0,
        dataTransferred: 0,
        conflictsResolved: 0,
        userInterventions: 0
      },
      featureFlags: getCurrentConfig().progressive.featureFlags,
      conflicts: [],
      isInitialized: false,
      error: null
    };
  }

  private createInitialCacheStats(): CacheStats {
    return {
      totalEntries: 0,
      totalSize: 0,
      hitRate: 0,
      missRate: 0,
      oldestEntry: null,
      newestEntry: null
    };
  }

  private async initializeStorage(): Promise<void> {
    // Storage initialization logic would go here
    // This would differ based on storage type (IndexedDB, localStorage, etc.)
  }

  private async loadPersistedState(): Promise<void> {
    // Load state from storage
  }

  private async persistState(): Promise<void> {
    // Save state to storage
  }

  private async checkNetworkQuality(): Promise<void> {
    if (!this.state.networkStatus.isOnline) return;

    try {
      const start = Date.now();
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      const latency = Date.now() - start;

      this.updateNetworkStatus({
        ...this.state.networkStatus,
        latency,
        quality: this.determineNetworkQuality(latency, response.ok),
        connectionState: response.ok ? 'online' : 'unstable'
      });
    } catch (error) {
      this.updateNetworkStatus({
        ...this.state.networkStatus,
        connectionState: 'unstable',
        quality: 'poor'
      });
    }
  }

  private determineNetworkQuality(latency: number, success: boolean): NetworkQuality {
    if (!success) return 'unavailable';
    if (latency < 100) return 'excellent';
    if (latency < 300) return 'good';
    return 'poor';
  }

  private updateNetworkStatus(status: NetworkStatus): void {
    this.state.networkStatus = status;
  }

  private async executeOperation(operation: OfflineOperation): Promise<any> {
    const response = await fetch(operation.endpoint, {
      method: operation.method,
      headers: operation.headers,
      body: operation.data ? JSON.stringify(operation.data) : undefined
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  private removeOperation(id: string): void {
    this.state.operationQueue.operations = this.state.operationQueue.operations.filter(
      op => op.id !== id
    );
  }

  private async syncCacheData(): Promise<void> {
    // Implementation for syncing cached data with server
  }

  private calculateOperationSize(operation: OfflineOperation): number {
    return JSON.stringify(operation).length;
  }

  private calculateDataSize(data: any): number {
    return JSON.stringify(data).length;
  }

  private calculateChecksum(data: any): string {
    // Simple checksum implementation
    return btoa(JSON.stringify(data)).slice(0, 16);
  }

  private calculateHitRate(isHit: boolean): number {
    // Update and return cache hit/miss rate
    if (isHit) {
      this.state.metrics.cacheHits++;
    } else {
      this.state.metrics.cacheMisses++;
    }

    const total = this.state.metrics.cacheHits + this.state.metrics.cacheMisses;
    return total > 0 ? (this.state.metrics.cacheHits / total) * 100 : 0;
  }

  private async updateCacheStats(): Promise<void> {
    // Update cache statistics
    // Implementation would depend on storage type
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Storage abstraction methods
  private async getStorageEntry<T>(key: string): Promise<CacheEntry<T> | null> {
    // Implementation depends on storage type
    return null;
  }

  private async setStorageEntry<T>(key: string, entry: CacheEntry<T>): Promise<void> {
    // Implementation depends on storage type
  }

  private async removeStorageEntry(key: string): Promise<void> {
    // Implementation depends on storage type
  }

  private async clearStorage(): Promise<void> {
    // Implementation depends on storage type
  }
}

// Export singleton instance
export const offlineService = OfflineServiceImpl.getInstance();
export default offlineService; 