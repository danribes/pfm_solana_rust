/**
 * Session Types
 * Comprehensive type definitions for session security and management
 */

import { AuthUser, AuthError } from './auth';

// ============================================================================
// Session State Types
// ============================================================================

export interface SessionState {
  isActive: boolean;
  isLoading: boolean;
  sessionId: string | null;
  user: AuthUser | null;
  error: SessionError | null;
  lastActivity: Date | null;
  expiresAt: Date | null;
  deviceInfo: DeviceInfo | null;
  securityStatus: SessionSecurityStatus;
}

export interface SessionSecurityStatus {
  isSecure: boolean;
  hasValidFingerprint: boolean;
  recentSecurityEvents: SecurityEvent[];
  lastSecurityCheck: Date | null;
  riskLevel: SecurityRiskLevel;
}

export enum SecurityRiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// ============================================================================
// Session Error Types
// ============================================================================

export enum SessionErrorCode {
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  SESSION_INVALID = 'SESSION_INVALID',
  SESSION_HIJACKED = 'SESSION_HIJACKED',
  SESSION_TIMEOUT = 'SESSION_TIMEOUT',
  SESSION_LIMIT_EXCEEDED = 'SESSION_LIMIT_EXCEEDED',
  CSRF_TOKEN_INVALID = 'CSRF_TOKEN_INVALID',
  DEVICE_NOT_RECOGNIZED = 'DEVICE_NOT_RECOGNIZED',
  SECURITY_VIOLATION = 'SECURITY_VIOLATION',
  SESSION_FIXATION = 'SESSION_FIXATION'
}

export interface SessionError extends AuthError {
  code: SessionErrorCode;
  sessionId?: string;
  deviceId?: string;
  securityEvent?: SecurityEvent;
}

// ============================================================================
// Device and Security Types
// ============================================================================

export interface DeviceInfo {
  deviceId: string;
  fingerprint: string;
  userAgent: string;
  platform: string;
  browser: string;
  ipAddress?: string;
  location?: GeoLocation;
  lastSeen: Date;
  trusted: boolean;
}

export interface GeoLocation {
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
}

export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  severity: SecurityEventSeverity;
  timestamp: Date;
  sessionId: string;
  deviceId: string;
  description: string;
  metadata: Record<string, any>;
  resolved: boolean;
}

export enum SecurityEventType {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  SESSION_HIJACKING = 'SESSION_HIJACKING',
  DEVICE_CHANGE = 'DEVICE_CHANGE',
  LOCATION_CHANGE = 'LOCATION_CHANGE',
  UNUSUAL_ACTIVITY = 'UNUSUAL_ACTIVITY',
  CSRF_ATTACK = 'CSRF_ATTACK',
  SESSION_FIXATION = 'SESSION_FIXATION',
  CONCURRENT_SESSION = 'CONCURRENT_SESSION',
  FORCED_LOGOUT = 'FORCED_LOGOUT'
}

export enum SecurityEventSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

// ============================================================================
// Session Management Types
// ============================================================================

export interface SessionMetadata {
  sessionId: string;
  userId: string;
  deviceInfo: DeviceInfo;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  renewedAt?: Date;
  terminatedAt?: Date;
  terminationReason?: SessionTerminationReason;
  isActive: boolean;
  securityScore: number;
}

export enum SessionTerminationReason {
  USER_LOGOUT = 'USER_LOGOUT',
  TIMEOUT = 'TIMEOUT',
  EXPIRED = 'EXPIRED',
  SECURITY_VIOLATION = 'SECURITY_VIOLATION',
  ADMIN_TERMINATION = 'ADMIN_TERMINATION',
  DEVICE_LIMIT = 'DEVICE_LIMIT',
  CONCURRENT_LOGIN = 'CONCURRENT_LOGIN'
}

export interface ActiveSession {
  sessionId: string;
  deviceInfo: DeviceInfo;
  lastActivity: Date;
  location?: GeoLocation;
  isCurrent: boolean;
  securityStatus: SessionSecurityStatus;
}

// ============================================================================
// Session Configuration Types
// ============================================================================

export interface SessionSecurityConfig {
  enableFingerprinting: boolean;
  enableDeviceTracking: boolean;
  enableLocationTracking: boolean;
  maxConcurrentSessions: number;
  sessionTimeout: number; // in milliseconds
  renewalThreshold: number; // in milliseconds
  securityCheckInterval: number; // in milliseconds
  csrfProtection: CSRFConfig;
  hijackingDetection: HijackingDetectionConfig;
}

export interface CSRFConfig {
  enabled: boolean;
  tokenLength: number;
  tokenExpiry: number; // in milliseconds
  headerName: string;
  cookieName: string;
  sameSite: 'strict' | 'lax' | 'none';
  secure: boolean;
}

export interface HijackingDetectionConfig {
  enabled: boolean;
  checkUserAgent: boolean;
  checkIpAddress: boolean;
  checkFingerprint: boolean;
  maxToleranceLevel: number; // 0-1, how much change to tolerate
}

// ============================================================================
// Session Context Types
// ============================================================================

export interface SessionContextValue {
  // State
  sessionState: SessionState;
  
  // Session Management
  initializeSession: (user: AuthUser) => Promise<void>;
  refreshSession: () => Promise<boolean>;
  terminateSession: (sessionId?: string) => Promise<void>;
  terminateAllSessions: () => Promise<void>;
  
  // Security
  validateSession: () => Promise<boolean>;
  checkSecurityStatus: () => Promise<SessionSecurityStatus>;
  reportSecurityEvent: (event: Partial<SecurityEvent>) => Promise<void>;
  
  // Device Management
  getActiveSessions: () => Promise<ActiveSession[]>;
  trustDevice: (deviceId: string) => Promise<void>;
  removeDevice: (deviceId: string) => Promise<void>;
  
  // Analytics
  getSessionAnalytics: () => Promise<SessionAnalytics>;
  
  // Utilities
  isSessionValid: () => boolean;
  getTimeRemaining: () => number;
  shouldRenewSession: () => boolean;
  clearError: () => void;
}

// ============================================================================
// Session Analytics Types
// ============================================================================

export interface SessionAnalytics {
  totalSessions: number;
  activeSessions: number;
  averageSessionDuration: number;
  securityEvents: SecurityEventSummary;
  deviceStats: DeviceStats;
  locationStats: LocationStats;
  timeRange: {
    start: Date;
    end: Date;
  };
}

export interface SecurityEventSummary {
  total: number;
  byType: Record<SecurityEventType, number>;
  bySeverity: Record<SecurityEventSeverity, number>;
  resolved: number;
  pending: number;
}

export interface DeviceStats {
  totalDevices: number;
  trustedDevices: number;
  activeDevices: number;
  deviceTypes: Record<string, number>;
  browsers: Record<string, number>;
  platforms: Record<string, number>;
}

export interface LocationStats {
  countries: Record<string, number>;
  regions: Record<string, number>;
  cities: Record<string, number>;
  suspiciousLocations: number;
}

// ============================================================================
// Session Synchronization Types
// ============================================================================

export interface SessionSyncEvent {
  type: SessionSyncEventType;
  sessionId: string;
  timestamp: Date;
  data?: any;
  source: string; // tab identifier
}

export enum SessionSyncEventType {
  SESSION_CREATED = 'SESSION_CREATED',
  SESSION_UPDATED = 'SESSION_UPDATED',
  SESSION_TERMINATED = 'SESSION_TERMINATED',
  ACTIVITY_UPDATE = 'ACTIVITY_UPDATE',
  SECURITY_ALERT = 'SECURITY_ALERT',
  LOGOUT_ALL = 'LOGOUT_ALL'
}

// ============================================================================
// Session Recovery Types
// ============================================================================

export interface SessionRecoveryData {
  sessionId: string;
  encryptedData: string;
  timestamp: Date;
  deviceFingerprint: string;
  csrfToken?: string;
}

export interface SessionRecoveryConfig {
  enabled: boolean;
  encryptionKey: string;
  maxRecoveryTime: number; // in milliseconds
  requireReauth: boolean;
} 