// Data Synchronization Service
// Task 5.1.1 Sub-task 4: Data Synchronization

import { 
  SyncState, 
  CacheConfig, 
  IntegrationError,
  OptimisticUpdate 
} from "../types/integration";

export class DataSyncService {
  private cache: Map<string, SyncState> = new Map();
  private config: CacheConfig;
  private syncIntervals: Map<string, NodeJS.Timeout> = new Map();
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private conflictResolvers: Map<string, (local: any, remote: any) => any> = new Map();

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      ttl: 5 * 60 * 1000, // 5 minutes default TTL
      maxSize: 1000,
      evictionPolicy: "lru",
      ...config,
    };

    this.startCleanupProcess();
  }

  /**
   * Get data with automatic sync
   */
  public async getData<T>(
    key: string,
    fetchFn: () => Promise<T>,
    forceRefresh: boolean = false
  ): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();

    // Return cached data if valid and not forcing refresh
    if (!forceRefresh && cached && !this.isStale(cached, now)) {
      return cached.data;
    }

    // Start sync process
    return this.syncData(key, fetchFn);
  }

  /**
   * Set data in cache
   */
  public setData<T>(key: string, data: T, version?: number): void {
    const now = Date.now();
    const syncState: SyncState<T> = {
      data,
      lastSync: now,
      version: version || now,
      isStale: false,
      isSyncing: false,
    };

    this.cache.set(key, syncState);
    this.enforceMaxSize();
    this.notifyListeners(key, data);
  }

  /**
   * Sync data from remote source
   */
  public async syncData<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    
    // Prevent concurrent sync operations
    if (cached?.isSyncing) {
      return cached.data;
    }

    // Mark as syncing
    if (cached) {
      cached.isSyncing = true;
    }

    try {
      const data = await fetchFn();
      const now = Date.now();
      
      const syncState: SyncState<T> = {
        data,
        lastSync: now,
        version: now,
        isStale: false,
        isSyncing: false,
      };

      this.cache.set(key, syncState);
      this.enforceMaxSize();
      this.notifyListeners(key, data);

      return data;
    } catch (error) {
      // Reset syncing state on error
      if (cached) {
        cached.isSyncing = false;
      }
      
      throw new IntegrationError({
        type: "api",
        code: "SYNC_FAILED",
        message: `Failed to sync data for key: ${key}`,
        details: { key, error: error.message },
        recoverable: true,
        retryAfter: 5000,
      });
    }
  }

  /**
   * Invalidate cached data
   */
  public invalidate(key: string): void {
    const cached = this.cache.get(key);
    if (cached) {
      cached.isStale = true;
    }
  }

  /**
   * Invalidate multiple keys by pattern
   */
  public invalidatePattern(pattern: RegExp): void {
    for (const [key, cached] of this.cache.entries()) {
      if (pattern.test(key)) {
        cached.isStale = true;
      }
    }
  }

  /**
   * Clear all cached data
   */
  public clearCache(): void {
    this.cache.clear();
    this.stopAllSyncIntervals();
  }

  /**
   * Remove specific key from cache
   */
  public removeKey(key: string): boolean {
    this.stopSyncInterval(key);
    return this.cache.delete(key);
  }

  /**
   * Setup automatic sync for a key
   */
  public setupAutoSync<T>(
    key: string,
    fetchFn: () => Promise<T>,
    intervalMs: number = 30000
  ): void {
    this.stopSyncInterval(key);

    const interval = setInterval(async () => {
      try {
        await this.syncData(key, fetchFn);
      } catch (error) {
        console.error(`Auto-sync failed for key ${key}:`, error);
      }
    }, intervalMs);

    this.syncIntervals.set(key, interval);
  }

  /**
   * Stop automatic sync for a key
   */
  public stopAutoSync(key: string): void {
    this.stopSyncInterval(key);
  }

  /**
   * Subscribe to data changes
   */
  public subscribe<T>(key: string, callback: (data: T) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }

    this.listeners.get(key)!.add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(key);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }

  /**
   * Handle optimistic updates
   */
  public async optimisticUpdate<T>(
    key: string,
    updateFn: (current: T) => T,
    commitFn: (data: T) => Promise<T>
  ): Promise<T> {
    const cached = this.cache.get(key);
    if (!cached) {
      throw new Error(`No cached data found for key: ${key}`);
    }

    const originalData = cached.data;
    const optimisticData = updateFn(originalData);

    // Apply optimistic update
    this.setData(key, optimisticData);

    try {
      // Commit the update
      const confirmedData = await commitFn(optimisticData);
      this.setData(key, confirmedData);
      return confirmedData;
    } catch (error) {
      // Rollback on failure
      this.setData(key, originalData);
      throw error;
    }
  }

  /**
   * Register conflict resolver for a key pattern
   */
  public registerConflictResolver(
    keyPattern: string,
    resolver: (local: any, remote: any) => any
  ): void {
    this.conflictResolvers.set(keyPattern, resolver);
  }

  /**
   * Resolve conflicts between local and remote data
   */
  public resolveConflict<T>(key: string, localData: T, remoteData: T): T {
    // Find matching resolver
    for (const [pattern, resolver] of this.conflictResolvers.entries()) {
      if (key.includes(pattern) || new RegExp(pattern).test(key)) {
        return resolver(localData, remoteData);
      }
    }

    // Default resolution: prefer remote data if newer
    const localState = this.cache.get(key);
    if (localState && this.isDataNewer(remoteData, localState.version)) {
      return remoteData;
    }

    return localData;
  }

  /**
   * Get cache statistics
   */
  public getStats() {
    const stats = {
      totalKeys: this.cache.size,
      staleKeys: 0,
      syncingKeys: 0,
      autoSyncKeys: this.syncIntervals.size,
      averageAge: 0,
      hitRate: 0, // Would need hit/miss tracking
    };

    const now = Date.now();
    let totalAge = 0;

    for (const [key, state] of this.cache.entries()) {
      if (this.isStale(state, now)) {
        stats.staleKeys++;
      }
      if (state.isSyncing) {
        stats.syncingKeys++;
      }
      totalAge += now - state.lastSync;
    }

    if (stats.totalKeys > 0) {
      stats.averageAge = totalAge / stats.totalKeys;
    }

    return stats;
  }

  /**
   * Check if data is stale
   */
  private isStale(state: SyncState, now: number): boolean {
    return state.isStale || (now - state.lastSync) > this.config.ttl;
  }

  /**
   * Check if remote data is newer
   */
  private isDataNewer(data: any, localVersion: number): boolean {
    // Simple timestamp comparison
    const dataTimestamp = data.updatedAt || data.timestamp || Date.now();
    return dataTimestamp > localVersion;
  }

  /**
   * Notify data change listeners
   */
  private notifyListeners(key: string, data: any): void {
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error("Listener callback error:", error);
        }
      });
    }
  }

  /**
   * Enforce maximum cache size
   */
  private enforceMaxSize(): void {
    if (this.cache.size <= this.config.maxSize) {
      return;
    }

    const entriesToRemove = this.cache.size - this.config.maxSize;
    const entries = Array.from(this.cache.entries());

    if (this.config.evictionPolicy === "lru") {
      // Remove least recently used
      entries.sort((a, b) => a[1].lastSync - b[1].lastSync);
    } else if (this.config.evictionPolicy === "fifo") {
      // Remove first in, first out (already in insertion order)
    } else if (this.config.evictionPolicy === "ttl") {
      // Remove entries closest to expiration
      const now = Date.now();
      entries.sort((a, b) => 
        (a[1].lastSync + this.config.ttl) - (b[1].lastSync + this.config.ttl)
      );
    }

    for (let i = 0; i < entriesToRemove; i++) {
      const [key] = entries[i];
      this.removeKey(key);
    }
  }

  /**
   * Stop sync interval for a key
   */
  private stopSyncInterval(key: string): void {
    const interval = this.syncIntervals.get(key);
    if (interval) {
      clearInterval(interval);
      this.syncIntervals.delete(key);
    }
  }

  /**
   * Stop all sync intervals
   */
  private stopAllSyncIntervals(): void {
    for (const [key] of this.syncIntervals) {
      this.stopSyncInterval(key);
    }
  }

  /**
   * Start periodic cleanup process
   */
  private startCleanupProcess(): void {
    setInterval(() => {
      this.cleanup();
    }, 60000); // Run every minute
  }

  /**
   * Cleanup expired data and resources
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToRemove: string[] = [];

    for (const [key, state] of this.cache.entries()) {
      if (this.isStale(state, now)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => this.removeKey(key));
  }

  /**
   * Cleanup all resources
   */
  public destroy(): void {
    this.clearCache();
    this.listeners.clear();
    this.conflictResolvers.clear();
  }
}

// Create default data sync service instance
export const dataSyncService = new DataSyncService();

export default DataSyncService;
