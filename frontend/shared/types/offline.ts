/**
 * Offline Support Type Definitions
 * 
 * Comprehensive types for offline mode, data persistence, synchronization,
 * and fallback mechanisms in the PFM application.
 */

// Connection States
export type ConnectionState = 'online' | 'offline' | 'reconnecting' | 'unstable';

export type NetworkQuality = 'excellent' | 'good' | 'poor' | 'unavailable';

export interface NetworkStatus {
  isOnline: boolean;
  connectionState: ConnectionState;
  quality: NetworkQuality;
  speed: number; // In Mbps
  latency: number; // In milliseconds
  lastOnline: Date | null;
  lastOffline: Date | null;
  downtime: number; // Total offline time in seconds
}

// Offline Mode Configuration
export interface OfflineConfig {
  enabled: boolean;
  storageQuota: number; // In MB
  syncInterval: number; // In milliseconds
  maxRetries: number;
  retryDelay: number; // Base delay in milliseconds
  fallbackPollInterval: number; // Polling interval when WebSocket fails
  dataRetentionPeriod: number; // In days
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
}

// Data Persistence
export type StorageType = 'localStorage' | 'sessionStorage' | 'indexedDB' | 'memory';

export interface StorageConfig {
  type: StorageType;
  prefix: string;
  version: number;
  encryption: boolean;
  compression: boolean;
  maxSize: number; // In MB
}

export interface CacheEntry<T = any> {
  key: string;
  data: T;
  timestamp: Date;
  expires: Date | null;
  version: number;
  checksum: string;
  size: number; // In bytes
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number; // In bytes
  hitRate: number; // Percentage
  missRate: number; // Percentage
  oldestEntry: Date | null;
  newestEntry: Date | null;
}

// Offline Operations
export type OperationType = 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'vote' 
  | 'join_community' 
  | 'leave_community'
  | 'custom';

export type OperationStatus = 'pending' | 'syncing' | 'synced' | 'failed' | 'cancelled';

export type OperationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface OfflineOperation {
  id: string;
  type: OperationType;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data: any;
  headers: Record<string, string>;
  timestamp: Date;
  status: OperationStatus;
  priority: OperationPriority;
  retryCount: number;
  maxRetries: number;
  error?: string;
  metadata?: Record<string, any>;
}

export interface OperationQueue {
  operations: OfflineOperation[];
  totalSize: number; // In bytes
  maxSize: number; // In bytes
  processingCount: number;
  failedCount: number;
  completedCount: number;
}

// Synchronization
export type SyncStrategy = 'immediate' | 'batch' | 'scheduled' | 'manual';

export type ConflictResolution = 'local' | 'remote' | 'manual' | 'timestamp' | 'version';

export interface SyncConfig {
  strategy: SyncStrategy;
  batchSize: number;
  interval: number; // In milliseconds
  conflictResolution: ConflictResolution;
  retryOnFailure: boolean;
  optimisticUpdates: boolean;
}

export interface SyncStatus {
  isActive: boolean;
  lastSync: Date | null;
  nextSync: Date | null;
  pendingOperations: number;
  failedOperations: number;
  conflictCount: number;
  syncProgress: number; // Percentage
}

export interface DataConflict {
  id: string;
  type: OperationType;
  localData: any;
  remoteData: any;
  localTimestamp: Date;
  remoteTimestamp: Date;
  resolution: ConflictResolution;
  resolved: boolean;
}

// Fallback Mechanisms
export type FallbackStrategy = 'cache' | 'polling' | 'mock' | 'local' | 'none';

export interface FallbackConfig {
  enabled: boolean;
  strategy: FallbackStrategy;
  pollingInterval: number; // In milliseconds
  cacheFirst: boolean;
  mockDataEnabled: boolean;
  gracefulDegradation: boolean;
}

export interface FallbackResult<T = any> {
  data: T;
  source: 'cache' | 'polling' | 'mock' | 'local' | 'live';
  timestamp: Date;
  stale: boolean;
  fallback: boolean;
}

// Progressive Enhancement
export interface FeatureFlags {
  realTimeUpdates: boolean;
  offlineMode: boolean;
  dataSync: boolean;
  backgroundSync: boolean;
  pushNotifications: boolean;
  analytics: boolean;
}

export interface ProgressiveConfig {
  featureFlags: FeatureFlags;
  minimumFeatures: string[]; // Essential features that must work offline
  enhancedFeatures: string[]; // Features that enhance experience when online
  degradedFeatures: string[]; // Features that work with reduced functionality
}

// User Experience
export type OfflineIndicator = 'banner' | 'toast' | 'icon' | 'modal' | 'none';

export interface UXConfig {
  showOfflineIndicator: OfflineIndicator;
  notifyOnReconnect: boolean;
  showSyncProgress: boolean;
  allowManualSync: boolean;
  showDataAge: boolean;
  offlineMessage: string;
  reconnectMessage: string;
}

export interface OfflineMetrics {
  offlineTime: number; // Total offline time
  operationsQueued: number;
  operationsSynced: number;
  operationsFailed: number;
  syncAttempts: number;
  syncSuccesses: number;
  syncFailures: number;
  cacheHits: number;
  cacheMisses: number;
  dataTransferred: number; // In bytes
  conflictsResolved: number;
  userInterventions: number;
}

// Event Types
export interface OfflineEvents {
  'connection:online': NetworkStatus;
  'connection:offline': NetworkStatus;
  'connection:unstable': NetworkStatus;
  'operation:queued': OfflineOperation;
  'operation:synced': OfflineOperation;
  'operation:failed': OfflineOperation & { error: string };
  'sync:started': SyncStatus;
  'sync:completed': SyncStatus;
  'sync:failed': SyncStatus & { error: string };
  'conflict:detected': DataConflict;
  'conflict:resolved': DataConflict;
  'storage:quota:exceeded': { currentSize: number; maxSize: number };
  'storage:error': { error: string; operation: string };
  'fallback:activated': { strategy: FallbackStrategy; reason: string };
  'fallback:deactivated': { strategy: FallbackStrategy };
}

// Main Offline State
export interface OfflineState {
  networkStatus: NetworkStatus;
  config: OfflineConfig;
  syncStatus: SyncStatus;
  operationQueue: OperationQueue;
  cacheStats: CacheStats;
  metrics: OfflineMetrics;
  featureFlags: FeatureFlags;
  conflicts: DataConflict[];
  isInitialized: boolean;
  error: string | null;
}

// Hook Return Types
export interface UseOfflineReturn {
  // State
  isOnline: boolean;
  isOffline: boolean;
  networkStatus: NetworkStatus;
  syncStatus: SyncStatus;
  operationQueue: OfflineOperation[];
  conflicts: DataConflict[];
  
  // Actions
  queueOperation: (operation: Omit<OfflineOperation, 'id' | 'timestamp' | 'status' | 'retryCount'>) => Promise<string>;
  syncNow: () => Promise<void>;
  clearQueue: () => Promise<void>;
  resolveConflict: (conflictId: string, resolution: ConflictResolution, data?: any) => Promise<void>;
  
  // Cache Management
  getCachedData: <T>(key: string) => Promise<T | null>;
  setCachedData: <T>(key: string, data: T, ttl?: number) => Promise<void>;
  clearCache: () => Promise<void>;
  
  // Utilities
  isFeatureAvailable: (feature: string) => boolean;
  getDataAge: (key: string) => Promise<number | null>; // Age in milliseconds
  getStorageUsage: () => Promise<number>; // In bytes
  
  // Event Handlers
  addEventListener: <K extends keyof OfflineEvents>(event: K, handler: (data: OfflineEvents[K]) => void) => void;
  removeEventListener: <K extends keyof OfflineEvents>(event: K, handler: (data: OfflineEvents[K]) => void) => void;
}

// Service Interface
export interface OfflineService {
  // Initialization
  initialize: (config?: Partial<OfflineConfig>) => Promise<void>;
  shutdown: () => Promise<void>;
  
  // Network Monitoring
  startNetworkMonitoring: () => void;
  stopNetworkMonitoring: () => void;
  getNetworkStatus: () => NetworkStatus;
  
  // Operation Management
  queueOperation: (operation: Omit<OfflineOperation, 'id' | 'timestamp' | 'status' | 'retryCount'>) => Promise<string>;
  processQueue: () => Promise<void>;
  clearQueue: () => Promise<void>;
  getQueuedOperations: () => OfflineOperation[];
  
  // Synchronization
  startSync: () => Promise<void>;
  stopSync: () => void;
  syncNow: () => Promise<void>;
  getSyncStatus: () => SyncStatus;
  
  // Data Management
  getCachedData: <T>(key: string) => Promise<T | null>;
  setCachedData: <T>(key: string, data: T, ttl?: number) => Promise<void>;
  removeCachedData: (key: string) => Promise<void>;
  clearCache: () => Promise<void>;
  getCacheStats: () => Promise<CacheStats>;
  
  // Conflict Resolution
  getConflicts: () => DataConflict[];
  resolveConflict: (conflictId: string, resolution: ConflictResolution, data?: any) => Promise<void>;
  
  // Storage Management
  getStorageUsage: () => Promise<number>;
  cleanupStorage: () => Promise<void>;
  
  // Events
  on: <K extends keyof OfflineEvents>(event: K, handler: (data: OfflineEvents[K]) => void) => void;
  off: <K extends keyof OfflineEvents>(event: K, handler: (data: OfflineEvents[K]) => void) => void;
  emit: <K extends keyof OfflineEvents>(event: K, data: OfflineEvents[K]) => void;
}

// Configuration Presets
export interface OfflinePresets {
  development: OfflineConfig;
  production: OfflineConfig;
  testing: OfflineConfig;
  minimal: OfflineConfig;
}

// API Response Types
export interface OfflineApiResponse<T = any> {
  data: T;
  cached: boolean;
  timestamp: Date;
  source: 'network' | 'cache' | 'fallback';
  stale: boolean;
}

// Error Types
export class OfflineError extends Error {
  constructor(
    message: string,
    public code: string,
    public operation?: string,
    public recoverable?: boolean
  ) {
    super(message);
    this.name = 'OfflineError';
  }
}

export class SyncError extends Error {
  constructor(
    message: string,
    public operations: OfflineOperation[],
    public conflicts: DataConflict[] = []
  ) {
    super(message);
    this.name = 'SyncError';
  }
}

export class StorageError extends Error {
  constructor(
    message: string,
    public storageType: StorageType,
    public operation: string
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

// Utility Types
export type OfflineActionType = 
  | 'INITIALIZE'
  | 'SET_NETWORK_STATUS'
  | 'QUEUE_OPERATION'
  | 'UPDATE_OPERATION'
  | 'REMOVE_OPERATION'
  | 'SET_SYNC_STATUS'
  | 'ADD_CONFLICT'
  | 'RESOLVE_CONFLICT'
  | 'UPDATE_CACHE_STATS'
  | 'UPDATE_METRICS'
  | 'SET_ERROR'
  | 'CLEAR_ERROR';

export interface OfflineAction {
  type: OfflineActionType;
  payload?: any;
}

// Migration Support
export interface DataMigration {
  version: number;
  migrate: (data: any) => any;
  description: string;
}

export interface MigrationResult {
  success: boolean;
  fromVersion: number;
  toVersion: number;
  migratedEntries: number;
  errors: string[];
} 