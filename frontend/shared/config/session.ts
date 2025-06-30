/**
 * Session Configuration
 * Comprehensive session security and management configuration
 */

import { 
  SessionSecurityConfig, 
  CSRFConfig, 
  HijackingDetectionConfig,
  SessionRecoveryConfig
} from '../types/session';

// ============================================================================
// Environment-based Configuration
// ============================================================================

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

// ============================================================================
// Default CSRF Configuration
// ============================================================================

export const DEFAULT_CSRF_CONFIG: CSRFConfig = {
  enabled: true,
  tokenLength: 32,
  tokenExpiry: 30 * 60 * 1000, // 30 minutes
  headerName: 'X-CSRF-Token',
  cookieName: 'pfm_csrf_token',
  sameSite: IS_PRODUCTION ? 'strict' : 'lax',
  secure: IS_PRODUCTION
};

// ============================================================================
// Default Hijacking Detection Configuration
// ============================================================================

export const DEFAULT_HIJACKING_DETECTION_CONFIG: HijackingDetectionConfig = {
  enabled: true,
  checkUserAgent: true,
  checkIpAddress: IS_PRODUCTION, // Only check IP in production
  checkFingerprint: true,
  maxToleranceLevel: 0.1 // 10% tolerance for minor changes
};

// ============================================================================
// Default Session Recovery Configuration
// ============================================================================

export const DEFAULT_SESSION_RECOVERY_CONFIG: SessionRecoveryConfig = {
  enabled: IS_DEVELOPMENT, // Only enable in development for testing
  encryptionKey: process.env.NEXT_PUBLIC_SESSION_ENCRYPTION_KEY || 'dev-key-change-in-production',
  maxRecoveryTime: 5 * 60 * 1000, // 5 minutes
  requireReauth: IS_PRODUCTION
};

// ============================================================================
// Default Session Security Configuration
// ============================================================================

export const DEFAULT_SESSION_SECURITY_CONFIG: SessionSecurityConfig = {
  enableFingerprinting: true,
  enableDeviceTracking: true,
  enableLocationTracking: IS_PRODUCTION,
  maxConcurrentSessions: IS_PRODUCTION ? 3 : 5, // More lenient in development
  sessionTimeout: IS_PRODUCTION ? 4 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000, // 4h prod, 8h dev
  renewalThreshold: 30 * 60 * 1000, // 30 minutes
  securityCheckInterval: 60 * 1000, // 1 minute
  csrfProtection: DEFAULT_CSRF_CONFIG,
  hijackingDetection: DEFAULT_HIJACKING_DETECTION_CONFIG
};

// ============================================================================
// Container Integration Configuration
// ============================================================================

export const CONTAINER_SESSION_CONFIG = {
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000',
  endpoints: {
    session: '/api/sessions',
    csrf: '/api/auth/csrf',
    security: '/api/auth/security',
    devices: '/api/auth/devices'
  },
  timeout: 10000, // 10 seconds
  retries: 3,
  healthCheck: {
    enabled: true,
    interval: 30000, // 30 seconds
    endpoint: '/health'
  }
};

// ============================================================================
// Browser Storage Configuration
// ============================================================================

export const STORAGE_CONFIG = {
  // Session data keys
  keys: {
    sessionId: 'pfm_session_id',
    deviceId: 'pfm_device_id',
    fingerprint: 'pfm_fingerprint',
    csrfToken: 'pfm_csrf_token',
    securityEvents: 'pfm_security_events',
    lastActivity: 'pfm_last_activity'
  },
  
  // Storage options
  storage: {
    type: 'localStorage' as 'localStorage' | 'sessionStorage',
    encrypt: IS_PRODUCTION,
    compression: false
  },
  
  // Cleanup configuration
  cleanup: {
    enabled: true,
    interval: 60 * 60 * 1000, // 1 hour
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
};

// ============================================================================
// Multi-tab Synchronization Configuration
// ============================================================================

export const SYNC_CONFIG = {
  enabled: true,
  channels: {
    session: 'pfm_session_sync',
    security: 'pfm_security_sync',
    activity: 'pfm_activity_sync'
  },
  debounceDelay: 100, // milliseconds
  maxEventHistory: 50
};

// ============================================================================
// Security Event Configuration
// ============================================================================

export const SECURITY_EVENT_CONFIG = {
  // Event collection
  collection: {
    enabled: true,
    maxEvents: 100,
    retention: 24 * 60 * 60 * 1000 // 24 hours
  },
  
  // Event reporting
  reporting: {
    enabled: IS_PRODUCTION,
    endpoint: '/api/security/events',
    batchSize: 10,
    flushInterval: 5 * 60 * 1000 // 5 minutes
  },
  
  // Alert thresholds
  alerts: {
    maxFailedAttempts: 5,
    suspiciousActivityThreshold: 3,
    locationChangeThreshold: 1000 // km
  }
};

// ============================================================================
// Device Management Configuration
// ============================================================================

export const DEVICE_CONFIG = {
  // Device fingerprinting
  fingerprinting: {
    enabled: true,
    includeScreenResolution: true,
    includeTimezone: true,
    includeLanguage: true,
    includePlugins: !IS_PRODUCTION, // More privacy-conscious in production
    includeCanvas: IS_PRODUCTION
  },
  
  // Device trust
  trust: {
    autoTrustDuration: 30 * 24 * 60 * 60 * 1000, // 30 days
    requireManualTrust: IS_PRODUCTION,
    maxTrustedDevices: 10
  },
  
  // Device tracking
  tracking: {
    trackLocation: IS_PRODUCTION,
    trackUsagePatterns: true,
    trackPerformance: !IS_PRODUCTION
  }
};

// ============================================================================
// Analytics Configuration
// ============================================================================

export const ANALYTICS_CONFIG = {
  enabled: true,
  collection: {
    sessionDuration: true,
    userActivity: true,
    securityEvents: true,
    deviceStats: true,
    locationStats: IS_PRODUCTION
  },
  reporting: {
    interval: 15 * 60 * 1000, // 15 minutes
    batchSize: 50,
    endpoint: '/api/analytics/sessions'
  },
  privacy: {
    anonymizeData: IS_PRODUCTION,
    hashPersonalData: IS_PRODUCTION,
    retentionDays: IS_PRODUCTION ? 90 : 30
  }
};

// ============================================================================
// Performance Configuration
// ============================================================================

export const PERFORMANCE_CONFIG = {
  // Session validation
  validation: {
    cacheValidation: true,
    cacheDuration: 5 * 60 * 1000, // 5 minutes
    backgroundValidation: true
  },
  
  // Security checks
  security: {
    throttleChecks: true,
    checkInterval: 60 * 1000, // 1 minute
    batchSecurityEvents: true
  },
  
  // Network optimization
  network: {
    enableCompression: true,
    enableCaching: true,
    requestTimeout: 30000, // 30 seconds
    retryAttempts: 3
  }
};

// ============================================================================
// Debugging Configuration
// ============================================================================

export const DEBUG_CONFIG = {
  enabled: IS_DEVELOPMENT,
  logLevel: IS_DEVELOPMENT ? 'debug' : 'error',
  logSensitiveData: false, // Never log sensitive data even in dev
  enableSessionInspector: IS_DEVELOPMENT,
  mockSecurityEvents: IS_DEVELOPMENT
};

// ============================================================================
// Complete Session Configuration
// ============================================================================

export const SESSION_CONFIG = {
  security: DEFAULT_SESSION_SECURITY_CONFIG,
  recovery: DEFAULT_SESSION_RECOVERY_CONFIG,
  container: CONTAINER_SESSION_CONFIG,
  storage: STORAGE_CONFIG,
  sync: SYNC_CONFIG,
  events: SECURITY_EVENT_CONFIG,
  device: DEVICE_CONFIG,
  analytics: ANALYTICS_CONFIG,
  performance: PERFORMANCE_CONFIG,
  debug: DEBUG_CONFIG
} as const;

// ============================================================================
// Configuration Validation
// ============================================================================

export function validateSessionConfig(config: typeof SESSION_CONFIG): boolean {
  try {
    // Basic validation
    if (!config.security || !config.container) {
      return false;
    }
    
    // Validate timeouts are reasonable
    if (config.security.sessionTimeout < 60000) { // Minimum 1 minute
      console.warn('Session timeout is too short');
      return false;
    }
    
    // Validate CSRF configuration
    if (config.security.csrfProtection.enabled && !config.security.csrfProtection.tokenLength) {
      console.warn('CSRF protection enabled but no token length specified');
      return false;
    }
    
    // Validate container URLs
    if (!config.container.backendUrl) {
      console.warn('Backend URL not configured');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Session configuration validation failed:', error);
    return false;
  }
}

// ============================================================================
// Environment-specific Overrides
// ============================================================================

export function getEnvironmentConfig(): Partial<typeof SESSION_CONFIG> {
  if (IS_PRODUCTION) {
    return {
      security: {
        ...DEFAULT_SESSION_SECURITY_CONFIG,
        enableLocationTracking: true,
        maxConcurrentSessions: 3,
        sessionTimeout: 4 * 60 * 60 * 1000 // 4 hours
      },
      debug: {
        ...DEBUG_CONFIG,
        enabled: false,
        logLevel: 'error'
      }
    };
  }
  
  if (IS_DEVELOPMENT) {
    return {
      security: {
        ...DEFAULT_SESSION_SECURITY_CONFIG,
        enableLocationTracking: false,
        maxConcurrentSessions: 5,
        sessionTimeout: 8 * 60 * 60 * 1000 // 8 hours
      },
      debug: {
        ...DEBUG_CONFIG,
        enabled: true,
        logLevel: 'debug'
      }
    };
  }
  
  return {};
}

// ============================================================================
// Configuration Helper Functions
// ============================================================================

export function createSessionConfig(overrides?: Partial<typeof SESSION_CONFIG>): typeof SESSION_CONFIG {
  const baseConfig = SESSION_CONFIG;
  const envConfig = getEnvironmentConfig();
  
  return {
    ...baseConfig,
    ...envConfig,
    ...overrides
  };
}

export function isSecureContext(): boolean {
  return typeof window !== 'undefined' && 
         (window.location.protocol === 'https:' || 
          window.location.hostname === 'localhost');
} 