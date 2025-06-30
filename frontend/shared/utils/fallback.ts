/**
 * Fallback Utilities
 * 
 * Comprehensive utilities for fallback mechanisms, offline support,
 * and data recovery strategies.
 */

import {
  FallbackStrategy,
  FallbackResult,
  NetworkStatus,
  OfflineOperation,
  CacheEntry,
  StorageType
} from '../types/offline';

/**
 * Fallback Manager
 * Handles various fallback strategies when primary systems fail
 */
export class FallbackManager {
  private pollIntervals: Map<string, NodeJS.Timeout> = new Map();
  private cacheHitCount = 0;
  private cacheMissCount = 0;

  /**
   * Execute request with fallback strategies
   */
  async executeWithFallback<T>(
    primaryFn: () => Promise<T>,
    options: {
      strategy: FallbackStrategy;
      cacheKey?: string;
      pollInterval?: number;
      maxRetries?: number;
      mockData?: T;
    }
  ): Promise<FallbackResult<T>> {
    const { strategy, cacheKey, pollInterval = 5000, maxRetries = 3, mockData } = options;

    try {
      // Try primary function first
      const data = await primaryFn();
      
      // Cache successful result
      if (cacheKey) {
        await this.setCache(cacheKey, data);
      }

      return {
        data,
        source: 'live',
        timestamp: new Date(),
        stale: false,
        fallback: false
      };
    } catch (error) {
      console.warn('Primary function failed, using fallback strategy:', strategy);
      return this.executeFallbackStrategy(strategy, { cacheKey, pollInterval, mockData });
    }
  }

  /**
   * Execute specific fallback strategy
   */
  private async executeFallbackStrategy<T>(
    strategy: FallbackStrategy,
    options: {
      cacheKey?: string;
      pollInterval?: number;
      mockData?: T;
    }
  ): Promise<FallbackResult<T>> {
    const { cacheKey, pollInterval = 5000, mockData } = options;

    switch (strategy) {
      case 'cache':
        return this.fallbackToCache<T>(cacheKey);
        
      case 'polling':
        return this.fallbackToPolling<T>(cacheKey, pollInterval);
        
      case 'mock':
        return this.fallbackToMock<T>(mockData);
        
      case 'local':
        return this.fallbackToLocal<T>(cacheKey);
        
      default:
        throw new Error(`Unsupported fallback strategy: ${strategy}`);
    }
  }

  /**
   * Cache fallback strategy
   */
  private async fallbackToCache<T>(cacheKey?: string): Promise<FallbackResult<T>> {
    if (!cacheKey) {
      throw new Error('Cache key required for cache fallback');
    }

    const cachedData = await this.getCache<T>(cacheKey);
    
    if (cachedData) {
      this.cacheHitCount++;
      return {
        data: cachedData.data,
        source: 'cache',
        timestamp: cachedData.timestamp,
        stale: this.isStale(cachedData),
        fallback: true
      };
    }

    this.cacheMissCount++;
    throw new Error('No cached data available');
  }

  /**
   * Polling fallback strategy
   */
  private async fallbackToPolling<T>(
    cacheKey?: string,
    interval: number = 5000
  ): Promise<FallbackResult<T>> {
    // First try cache
    try {
      return await this.fallbackToCache<T>(cacheKey);
    } catch {
      // If no cache, start polling and return empty result
      if (cacheKey) {
        this.startPolling(cacheKey, interval);
      }
      
      throw new Error('No data available, polling started');
    }
  }

  /**
   * Mock data fallback strategy
   */
  private async fallbackToMock<T>(mockData?: T): Promise<FallbackResult<T>> {
    if (!mockData) {
      throw new Error('Mock data required for mock fallback');
    }

    return {
      data: mockData,
      source: 'mock',
      timestamp: new Date(),
      stale: false,
      fallback: true
    };
  }

  /**
   * Local storage fallback strategy
   */
  private async fallbackToLocal<T>(cacheKey?: string): Promise<FallbackResult<T>> {
    if (!cacheKey) {
      throw new Error('Cache key required for local fallback');
    }

    // Try different storage types in order of preference
    const storageTypes: StorageType[] = ['localStorage', 'sessionStorage', 'memory'];
    
    for (const storageType of storageTypes) {
      try {
        const data = await this.getLocalStorage<T>(cacheKey, storageType);
        if (data) {
          return {
            data: data.data,
            source: 'local',
            timestamp: data.timestamp,
            stale: this.isStale(data),
            fallback: true
          };
        }
      } catch (error) {
        console.warn(`Failed to get data from ${storageType}:`, error);
      }
    }

    throw new Error('No local data available');
  }

  /**
   * Start polling for data updates
   */
  private startPolling(cacheKey: string, interval: number): void {
    // Clear existing polling
    this.stopPolling(cacheKey);

    const pollInterval = setInterval(async () => {
      try {
        // This would normally make an API call
        console.log(`Polling for updates: ${cacheKey}`);
        
        // In a real implementation, this would:
        // 1. Make API call
        // 2. Update cache on success
        // 3. Emit events for UI updates
        
      } catch (error) {
        console.warn(`Polling failed for ${cacheKey}:`, error);
      }
    }, interval);

    this.pollIntervals.set(cacheKey, pollInterval);
  }

  /**
   * Stop polling for specific key
   */
  stopPolling(cacheKey: string): void {
    const interval = this.pollIntervals.get(cacheKey);
    if (interval) {
      clearInterval(interval);
      this.pollIntervals.delete(cacheKey);
    }
  }

  /**
   * Stop all polling
   */
  stopAllPolling(): void {
    this.pollIntervals.forEach((interval) => clearInterval(interval));
    this.pollIntervals.clear();
  }

  /**
   * Get cache hit rate
   */
  getCacheHitRate(): number {
    const total = this.cacheHitCount + this.cacheMissCount;
    return total > 0 ? (this.cacheHitCount / total) * 100 : 0;
  }

  // Cache management methods (simplified - would use actual storage)
  private async getCache<T>(key: string): Promise<CacheEntry<T> | null> {
    try {
      const item = localStorage.getItem(`fallback_cache_${key}`);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  private async setCache<T>(key: string, data: T): Promise<void> {
    try {
      const entry: CacheEntry<T> = {
        key,
        data,
        timestamp: new Date(),
        expires: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        version: 1,
        checksum: '',
        size: JSON.stringify(data).length
      };
      localStorage.setItem(`fallback_cache_${key}`, JSON.stringify(entry));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }

  private async getLocalStorage<T>(key: string, storageType: StorageType): Promise<CacheEntry<T> | null> {
    try {
      let storage: Storage;
      
      switch (storageType) {
        case 'localStorage':
          storage = localStorage;
          break;
        case 'sessionStorage':
          storage = sessionStorage;
          break;
        default:
          return null;
      }

      const item = storage.getItem(`local_${key}`);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  private isStale(entry: CacheEntry): boolean {
    if (!entry.expires) return false;
    return entry.expires < new Date();
  }
}

/**
 * Retry mechanisms with exponential backoff
 */
export class RetryManager {
  async executeWithRetry<T>(
    fn: () => Promise<T>,
    options: {
      maxRetries?: number;
      baseDelay?: number;
      maxDelay?: number;
      backoffMultiplier?: number;
    } = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      baseDelay = 1000,
      maxDelay = 30000,
      backoffMultiplier = 2
    } = options;

    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === maxRetries) {
          throw lastError;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          baseDelay * Math.pow(backoffMultiplier, attempt),
          maxDelay
        );

        console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms:`, error);
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Circuit Breaker pattern implementation
 */
export class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime?: Date;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private failureThreshold: number = 5,
    private recoveryTimeout: number = 60000 // 1 minute
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (this.shouldAttemptReset()) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private shouldAttemptReset(): boolean {
    return this.lastFailureTime &&
           Date.now() - this.lastFailureTime.getTime() >= this.recoveryTimeout;
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = 'closed';
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = new Date();

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'open';
    }
  }

  getState(): string {
    return this.state;
  }

  reset(): void {
    this.failureCount = 0;
    this.state = 'closed';
    this.lastFailureTime = undefined;
  }
}

/**
 * Progressive Enhancement utilities
 */
export class ProgressiveEnhancement {
  static isFeatureSupported(feature: string): boolean {
    const supportMap: Record<string, () => boolean> = {
      localStorage: () => typeof Storage !== 'undefined' && window.localStorage !== undefined,
      sessionStorage: () => typeof Storage !== 'undefined' && window.sessionStorage !== undefined,
      indexedDB: () => 'indexedDB' in window,
      serviceWorker: () => 'serviceWorker' in navigator,
      webSocket: () => 'WebSocket' in window,
      fetch: () => 'fetch' in window,
      notification: () => 'Notification' in window,
      onLine: () => 'onLine' in navigator
    };

    const checkFn = supportMap[feature];
    return checkFn ? checkFn() : false;
  }

  static getAvailableFeatures(): string[] {
    const features = [
      'localStorage',
      'sessionStorage', 
      'indexedDB',
      'serviceWorker',
      'webSocket',
      'fetch',
      'notification',
      'onLine'
    ];

    return features.filter(feature => this.isFeatureSupported(feature));
  }

  static gracefullyDegrade<T>(
    enhancedFn: () => Promise<T>,
    degradedFn: () => Promise<T>,
    feature: string
  ): () => Promise<T> {
    return () => {
      if (this.isFeatureSupported(feature)) {
        return enhancedFn();
      } else {
        return degradedFn();
      }
    };
  }
}

// Export utility instances
export const fallbackManager = new FallbackManager();
export const retryManager = new RetryManager();
export const circuitBreaker = new CircuitBreaker();

// Export default as main fallback manager
export default fallbackManager; 