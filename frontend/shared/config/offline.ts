/**
 * Offline Configuration
 * 
 * Environment-specific configuration for offline functionality,
 * data persistence, synchronization, and fallback mechanisms.
 */

import { 
  OfflineConfig, 
  OfflinePresets, 
  StorageConfig, 
  SyncConfig, 
  FallbackConfig,
  ProgressiveConfig,
  UXConfig,
  FeatureFlags,
  DataMigration
} from '../types/offline';

// Environment Detection
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';
const isTesting = process.env.NODE_ENV === 'test';

// Storage Configurations
export const STORAGE_CONFIGS: Record<string, StorageConfig> = {
  default: {
    type: 'indexedDB',
    prefix: 'pfm_offline',
    version: 1,
    encryption: isProduction,
    compression: true,
    maxSize: 50 // 50MB
  },
  
  fallback: {
    type: 'localStorage',
    prefix: 'pfm_offline_fb',
    version: 1,
    encryption: false,
    compression: true,
    maxSize: 5 // 5MB for localStorage fallback
  },
  
  memory: {
    type: 'memory',
    prefix: 'pfm_offline_mem',
    version: 1,
    encryption: false,
    compression: false,
    maxSize: 10 // 10MB for memory storage
  }
};

// Synchronization Configurations
export const SYNC_CONFIGS: Record<string, SyncConfig> = {
  realtime: {
    strategy: 'immediate',
    batchSize: 1,
    interval: 0,
    conflictResolution: 'timestamp',
    retryOnFailure: true,
    optimisticUpdates: true
  },
  
  batch: {
    strategy: 'batch',
    batchSize: 10,
    interval: 30000, // 30 seconds
    conflictResolution: 'version',
    retryOnFailure: true,
    optimisticUpdates: false
  },
  
  scheduled: {
    strategy: 'scheduled',
    batchSize: 50,
    interval: 300000, // 5 minutes
    conflictResolution: 'manual',
    retryOnFailure: true,
    optimisticUpdates: false
  },
  
  manual: {
    strategy: 'manual',
    batchSize: 100,
    interval: 0,
    conflictResolution: 'manual',
    retryOnFailure: false,
    optimisticUpdates: false
  }
};

// Fallback Configurations
export const FALLBACK_CONFIGS: Record<string, FallbackConfig> = {
  aggressive: {
    enabled: true,
    strategy: 'cache',
    pollingInterval: 5000, // 5 seconds
    cacheFirst: true,
    mockDataEnabled: isDevelopment,
    gracefulDegradation: true
  },
  
  moderate: {
    enabled: true,
    strategy: 'polling',
    pollingInterval: 15000, // 15 seconds
    cacheFirst: true,
    mockDataEnabled: false,
    gracefulDegradation: true
  },
  
  minimal: {
    enabled: true,
    strategy: 'local',
    pollingInterval: 60000, // 1 minute
    cacheFirst: false,
    mockDataEnabled: false,
    gracefulDegradation: false
  },
  
  disabled: {
    enabled: false,
    strategy: 'none',
    pollingInterval: 0,
    cacheFirst: false,
    mockDataEnabled: false,
    gracefulDegradation: false
  }
};

// Feature Flags by Environment
export const FEATURE_FLAGS: Record<string, FeatureFlags> = {
  development: {
    realTimeUpdates: true,
    offlineMode: true,
    dataSync: true,
    backgroundSync: true,
    pushNotifications: false,
    analytics: true
  },
  
  production: {
    realTimeUpdates: true,
    offlineMode: true,
    dataSync: true,
    backgroundSync: true,
    pushNotifications: true,
    analytics: true
  },
  
  testing: {
    realTimeUpdates: false,
    offlineMode: true,
    dataSync: false,
    backgroundSync: false,
    pushNotifications: false,
    analytics: false
  }
};

// Progressive Enhancement Configuration
export const PROGRESSIVE_CONFIG: ProgressiveConfig = {
  featureFlags: FEATURE_FLAGS[process.env.NODE_ENV || 'development'],
  
  minimumFeatures: [
    'basic_navigation',
    'view_communities',
    'view_votes',
    'cache_data',
    'queue_operations'
  ],
  
  enhancedFeatures: [
    'real_time_updates',
    'instant_sync',
    'push_notifications',
    'advanced_analytics',
    'auto_sync'
  ],
  
  degradedFeatures: [
    'poll_for_updates',
    'manual_sync',
    'basic_notifications',
    'limited_analytics',
    'batch_operations'
  ]
};

// User Experience Configuration
export const UX_CONFIG: UXConfig = {
  showOfflineIndicator: isProduction ? 'banner' : 'toast',
  notifyOnReconnect: true,
  showSyncProgress: true,
  allowManualSync: true,
  showDataAge: isDevelopment,
  offlineMessage: 'You are currently offline. Your actions will be synced when you reconnect.',
  reconnectMessage: 'Connection restored! Syncing your data...'
};

// Environment-Specific Presets
export const OFFLINE_PRESETS: OfflinePresets = {
  development: {
    enabled: true,
    storageQuota: 100, // 100MB
    syncInterval: 10000, // 10 seconds
    maxRetries: 3,
    retryDelay: 1000, // 1 second
    fallbackPollInterval: 5000, // 5 seconds
    dataRetentionPeriod: 7, // 7 days
    compressionEnabled: false, // Easier debugging
    encryptionEnabled: false // Easier debugging
  },
  
  production: {
    enabled: true,
    storageQuota: 50, // 50MB
    syncInterval: 30000, // 30 seconds
    maxRetries: 5,
    retryDelay: 2000, // 2 seconds
    fallbackPollInterval: 15000, // 15 seconds
    dataRetentionPeriod: 30, // 30 days
    compressionEnabled: true,
    encryptionEnabled: true
  },
  
  testing: {
    enabled: true,
    storageQuota: 10, // 10MB
    syncInterval: 1000, // 1 second for fast tests
    maxRetries: 1,
    retryDelay: 100, // 100ms
    fallbackPollInterval: 1000, // 1 second
    dataRetentionPeriod: 1, // 1 day
    compressionEnabled: false,
    encryptionEnabled: false
  },
  
  minimal: {
    enabled: true,
    storageQuota: 5, // 5MB
    syncInterval: 60000, // 1 minute
    maxRetries: 2,
    retryDelay: 5000, // 5 seconds
    fallbackPollInterval: 30000, // 30 seconds
    dataRetentionPeriod: 3, // 3 days
    compressionEnabled: true,
    encryptionEnabled: false
  }
};

// Data Migration Definitions
export const DATA_MIGRATIONS: DataMigration[] = [
  {
    version: 1,
    description: 'Initial migration - no changes needed',
    migrate: (data) => data
  },
  {
    version: 2,
    description: 'Add operation priorities and metadata',
    migrate: (data) => ({
      ...data,
      operations: data.operations?.map((op: any) => ({
        ...op,
        priority: op.priority || 'medium',
        metadata: op.metadata || {}
      })) || []
    })
  }
];

// API Endpoints Configuration
export const API_ENDPOINTS = {
  base: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  
  sync: '/api/sync',
  health: '/api/health',
  
  // Fallback endpoints (ordered by priority)
  fallbacks: [
    process.env.REACT_APP_FALLBACK_API_1 || 'http://localhost:3000',
    process.env.REACT_APP_FALLBACK_API_2 || 'http://localhost:3001'
  ]
};

// Cache Strategies
export const CACHE_STRATEGIES = {
  // Cache everything aggressively
  aggressive: {
    ttl: 3600000, // 1 hour
    maxEntries: 1000,
    evictionPolicy: 'lru',
    validateOnHit: false
  },
  
  // Balanced caching
  balanced: {
    ttl: 1800000, // 30 minutes
    maxEntries: 500,
    evictionPolicy: 'lru',
    validateOnHit: true
  },
  
  // Conservative caching
  conservative: {
    ttl: 600000, // 10 minutes
    maxEntries: 100,
    evictionPolicy: 'fifo',
    validateOnHit: true
  }
};

// Error Handling Configuration
export const ERROR_CONFIG = {
  maxErrorsPerHour: 50,
  errorReportingEnabled: isProduction,
  
  retryStrategies: {
    exponential: {
      baseDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
      maxRetries: 5
    },
    
    linear: {
      baseDelay: 2000,
      maxDelay: 10000,
      backoffMultiplier: 1,
      maxRetries: 3
    },
    
    fixed: {
      baseDelay: 5000,
      maxDelay: 5000,
      backoffMultiplier: 1,
      maxRetries: 2
    }
  }
};

// Performance Monitoring
export const PERFORMANCE_CONFIG = {
  metricsEnabled: true,
  samplingRate: isProduction ? 0.1 : 1.0, // 10% in production, 100% in development
  
  thresholds: {
    syncDuration: 5000, // 5 seconds
    operationQueueSize: 100,
    cacheHitRate: 0.8, // 80%
    storageUsage: 0.9 // 90% of quota
  }
};

// Security Configuration
export const SECURITY_CONFIG = {
  encryptionKey: process.env.REACT_APP_ENCRYPTION_KEY || 'development-key-change-me',
  checksumAlgorithm: 'sha256',
  validateIntegrity: true,
  sanitizeData: true,
  maxDataSize: 1048576, // 1MB per entry
};

// Default Configuration Factory
export function createOfflineConfig(
  preset: keyof OfflinePresets = isProduction ? 'production' : 'development',
  overrides: Partial<OfflineConfig> = {}
): OfflineConfig {
  const baseConfig = OFFLINE_PRESETS[preset];
  
  return {
    ...baseConfig,
    ...overrides
  };
}

// Get Current Environment Configuration
export function getCurrentConfig(): {
  offline: OfflineConfig;
  storage: StorageConfig;
  sync: SyncConfig;
  fallback: FallbackConfig;
  progressive: ProgressiveConfig;
  ux: UXConfig;
} {
  const environment = process.env.NODE_ENV || 'development';
  
  return {
    offline: createOfflineConfig(isProduction ? 'production' : 'development'),
    storage: STORAGE_CONFIGS.default,
    sync: SYNC_CONFIGS.batch,
    fallback: FALLBACK_CONFIGS.moderate,
    progressive: PROGRESSIVE_CONFIG,
    ux: UX_CONFIG
  };
}

// Configuration Validator
export function validateConfig(config: OfflineConfig): string[] {
  const errors: string[] = [];
  
  if (config.storageQuota <= 0) {
    errors.push('Storage quota must be greater than 0');
  }
  
  if (config.syncInterval < 0) {
    errors.push('Sync interval cannot be negative');
  }
  
  if (config.maxRetries < 0) {
    errors.push('Max retries cannot be negative');
  }
  
  if (config.retryDelay < 0) {
    errors.push('Retry delay cannot be negative');
  }
  
  if (config.dataRetentionPeriod <= 0) {
    errors.push('Data retention period must be greater than 0');
  }
  
  return errors;
}

// Export default configuration
export default getCurrentConfig(); 