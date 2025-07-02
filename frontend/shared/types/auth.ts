/**
 * Authentication Types
 * Comprehensive type definitions for wallet-based authentication system
 */

import { PublicKey } from '@solana/web3.js';

// ============================================================================
// User Roles and Permissions
// ============================================================================

export enum UserRole {
  ADMIN = 'admin',
  MEMBER = 'member',
  GUEST = 'guest'
}

export interface Permission {
  resource: string;
  actions: string[];
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
}

// ============================================================================
// Authentication State
// ============================================================================

export interface AuthUser {
  id: string;
  publicKey: PublicKey;
  walletAddress: string;
  role: UserRole;
  displayName?: string;
  avatar?: string;
  communities: string[];
  permissions: Permission[];
  lastActivity: Date;
  createdAt: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  error: AuthError | null;
  sessionId: string | null;
  expiresAt: Date | null;
}

// ============================================================================
// Authentication Errors
// ============================================================================

export enum AuthErrorCode {
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
  SIGNATURE_FAILED = 'SIGNATURE_FAILED',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  NONCE_EXPIRED = 'NONCE_EXPIRED',
  INVALID_NONCE = 'INVALID_NONCE',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  RATE_LIMITED = 'RATE_LIMITED',
  NETWORK_ERROR = 'NETWORK_ERROR'
}

export interface AuthError {
  code: AuthErrorCode;
  message: string;
  details?: any;
  timestamp: Date;
}

// ============================================================================
// Authentication Messages and Signatures
// ============================================================================

export interface AuthMessage {
  nonce: string;
  timestamp: number;
  domain: string;
  statement: string;
  uri: string;
  version: string;
  chainId?: number;
}

export interface SignatureData {
  message: string;
  signature: Uint8Array;
  publicKey: PublicKey;
  timestamp: number;
}

export interface AuthNonce {
  nonce: string;
  publicKey: string;
  expiresAt: Date;
  used: boolean;
}

// ============================================================================
// Session Management
// ============================================================================

export interface AuthSession {
  sessionId: string;
  userId: string;
  publicKey: string;
  role: UserRole;
  createdAt: Date;
  expiresAt: Date;
  lastActivity: Date;
  ipAddress?: string;
  userAgent?: string;
  refreshToken?: string;
}

export interface SessionConfig {
  maxAge: number; // in milliseconds
  renewalThreshold: number; // in milliseconds
  maxConcurrentSessions: number;
  requireReauth: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
}

// ============================================================================
// Authentication Actions
// ============================================================================

export interface AuthenticateParams {
  publicKey: PublicKey;
  signature: Uint8Array;
  message: string;
  nonce: string;
}

export interface RefreshSessionParams {
  sessionId: string;
  refreshToken?: string;
}

export interface LogoutParams {
  sessionId: string;
  allSessions?: boolean;
}

// ============================================================================
// Authentication Context
// ============================================================================

export interface AuthContextValue {
  // State
  authState: AuthState;
  
  // Actions
  authenticate: (params: AuthenticateParams) => Promise<AuthUser>;
  logout: (params?: LogoutParams) => Promise<void>;
  refreshSession: () => Promise<void>;
  checkPermission: (resource: string, action: string) => boolean;
  hasRole: (role: UserRole) => boolean;
  
  // Utilities
  generateAuthMessage: () => Promise<AuthMessage>;
  validateSession: () => Promise<boolean>;
  clearError: () => void;
}

// ============================================================================
// Route Protection
// ============================================================================

export interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredPermissions?: Permission[];
  fallback?: React.ReactNode;
  redirectTo?: string;
  allowGuest?: boolean;
}

export interface ProtectedRouteConfig {
  path: string;
  requiredRole?: UserRole;
  requiredPermissions?: Permission[];
  redirectTo?: string;
}

// ============================================================================
// Authentication Events
// ============================================================================

export enum AuthEventType {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  SESSION_RENEWED = 'SESSION_RENEWED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  ROLE_CHANGED = 'ROLE_CHANGED'
}

export interface AuthEvent {
  type: AuthEventType;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  data?: any;
  error?: AuthError;
}

// ============================================================================
// Authentication Configuration
// ============================================================================

export interface AuthConfig {
  // Session configuration
  session: SessionConfig;
  
  // Message signing configuration
  messageTemplate: {
    domain: string;
    statement: string;
    uri: string;
    version: string;
  };
  
  // Nonce configuration
  nonceConfig: {
    length: number;
    expiryMinutes: number;
  };
  
  // Security configuration
  security: {
    requireHttps: boolean;
    rateLimiting: {
      maxAttempts: number;
      windowMinutes: number;
    };
  };
  
  // Container integration
  containerAware: boolean;
  serviceDiscovery: {
    authServiceUrl?: string;
    sessionServiceUrl?: string;
  };
}

// ============================================================================
// API Integration Types
// ============================================================================

export interface AuthAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: AuthError;
  timestamp: Date;
}

export interface LoginResponse {
  user: AuthUser;
  session: AuthSession;
  token: string;
  refreshToken?: string;
}

export interface SessionValidationResponse {
  valid: boolean;
  session?: AuthSession;
  user?: AuthUser;
  shouldRefresh?: boolean;
}

// ============================================================================
// Container Integration Types
// ============================================================================

export interface ContainerAuthConfig {
  backendUrl: string;
  authEndpoint: string;
  sessionEndpoint: string;
  healthEndpoint: string;
  timeout: number;
  retries: number;
}

export interface ServiceDiscoveryConfig {
  enabled: boolean;
  services: {
    auth: string;
    session: string;
    user: string;
  };
} 