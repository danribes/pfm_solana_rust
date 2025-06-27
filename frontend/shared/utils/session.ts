/**
 * Session Management Utilities
 * Comprehensive utilities for managing authentication sessions
 */

import { 
  AuthSession, 
  SessionConfig, 
  AuthUser, 
  AuthError, 
  AuthErrorCode,
  ContainerAuthConfig 
} from '../types/auth';

// ============================================================================
// Session Storage Keys
// ============================================================================

const SESSION_KEYS = {
  SESSION_ID: 'pfm_session_id',
  USER_DATA: 'pfm_user_data',
  REFRESH_TOKEN: 'pfm_refresh_token',
  EXPIRES_AT: 'pfm_expires_at',
  LAST_ACTIVITY: 'pfm_last_activity'
} as const;

// ============================================================================
// Session Configuration
// ============================================================================

export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  renewalThreshold: 60 * 60 * 1000, // 1 hour
  maxConcurrentSessions: 3,
  requireReauth: false,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict'
};

// ============================================================================
// Session Storage Manager
// ============================================================================

export class SessionStorageManager {
  private static instance: SessionStorageManager;
  private storage: Storage;
  private syncChannels: Map<string, BroadcastChannel>;

  private constructor() {
    this.storage = typeof window !== 'undefined' ? window.localStorage : ({} as Storage);
    this.syncChannels = new Map();
    this.setupSessionSync();
  }

  public static getInstance(): SessionStorageManager {
    if (!SessionStorageManager.instance) {
      SessionStorageManager.instance = new SessionStorageManager();
    }
    return SessionStorageManager.instance;
  }

  // Session Management
  public setSession(session: AuthSession): void {
    try {
      this.storage.setItem(SESSION_KEYS.SESSION_ID, session.sessionId);
      this.storage.setItem(SESSION_KEYS.EXPIRES_AT, session.expiresAt.toISOString());
      this.storage.setItem(SESSION_KEYS.LAST_ACTIVITY, new Date().toISOString());
      
      if (session.refreshToken) {
        this.storage.setItem(SESSION_KEYS.REFRESH_TOKEN, session.refreshToken);
      }

      this.broadcastSessionUpdate('session_set', session);
    } catch (error) {
      console.error('Failed to store session:', error);
      throw new Error('Session storage failed');
    }
  }

  public getSessionId(): string | null {
    return this.storage.getItem(SESSION_KEYS.SESSION_ID);
  }

  public getSessionExpiry(): Date | null {
    const expiryStr = this.storage.getItem(SESSION_KEYS.EXPIRES_AT);
    return expiryStr ? new Date(expiryStr) : null;
  }

  public getRefreshToken(): string | null {
    return this.storage.getItem(SESSION_KEYS.REFRESH_TOKEN);
  }

  public updateLastActivity(): void {
    this.storage.setItem(SESSION_KEYS.LAST_ACTIVITY, new Date().toISOString());
    this.broadcastSessionUpdate('activity_update', { timestamp: new Date() });
  }

  public clearSession(): void {
    Object.values(SESSION_KEYS).forEach(key => {
      this.storage.removeItem(key);
    });
    this.broadcastSessionUpdate('session_cleared', null);
  }

  // User Data Management
  public setUserData(user: AuthUser): void {
    try {
      this.storage.setItem(SESSION_KEYS.USER_DATA, JSON.stringify({
        ...user,
        publicKey: user.publicKey.toString(),
        lastActivity: user.lastActivity.toISOString(),
        createdAt: user.createdAt.toISOString()
      }));
    } catch (error) {
      console.error('Failed to store user data:', error);
    }
  }

  public getUserData(): AuthUser | null {
    try {
      const userData = this.storage.getItem(SESSION_KEYS.USER_DATA);
      if (!userData) return null;

      const parsed = JSON.parse(userData);
      return {
        ...parsed,
        lastActivity: new Date(parsed.lastActivity),
        createdAt: new Date(parsed.createdAt)
      };
    } catch (error) {
      console.error('Failed to retrieve user data:', error);
      return null;
    }
  }

  // Session Validation
  public isSessionValid(): boolean {
    const sessionId = this.getSessionId();
    const expiry = this.getSessionExpiry();
    
    if (!sessionId || !expiry) return false;
    
    return new Date() < expiry;
  }

  public shouldRenewSession(config: SessionConfig = DEFAULT_SESSION_CONFIG): boolean {
    const expiry = this.getSessionExpiry();
    if (!expiry) return false;

    const renewalTime = new Date(expiry.getTime() - config.renewalThreshold);
    return new Date() >= renewalTime;
  }

  // Multi-tab Synchronization
  private setupSessionSync(): void {
    if (typeof window === 'undefined') return;

    const channel = new BroadcastChannel('pfm_session_sync');
    this.syncChannels.set('main', channel);

    channel.addEventListener('message', (event) => {
      const { type, data } = event.data;
      
      switch (type) {
        case 'session_cleared':
          this.handleSessionCleared();
          break;
        case 'session_set':
          this.handleSessionSet(data);
          break;
        case 'activity_update':
          this.handleActivityUpdate();
          break;
      }
    });
  }

  private broadcastSessionUpdate(type: string, data: any): void {
    const channel = this.syncChannels.get('main');
    if (channel) {
      channel.postMessage({ type, data, timestamp: new Date() });
    }
  }

  private handleSessionCleared(): void {
    // Emit event for other components to handle
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pfm:session:cleared'));
    }
  }

  private handleSessionSet(session: AuthSession): void {
    // Emit event for other components to handle
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pfm:session:set', { detail: session }));
    }
  }

  private handleActivityUpdate(): void {
    // Emit event for other components to handle
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pfm:session:activity', { detail: new Date() }));
    }
  }

  // Cleanup
  public cleanup(): void {
    this.syncChannels.forEach(channel => channel.close());
    this.syncChannels.clear();
  }
}

// ============================================================================
// Session Validation Utilities
// ============================================================================

export function validateSessionData(session: any): session is AuthSession {
  if (!session || typeof session !== 'object') return false;

  const required = ['sessionId', 'userId', 'publicKey', 'role', 'createdAt', 'expiresAt'];
  return required.every(field => field in session);
}

export function isSessionExpired(session: AuthSession): boolean {
  return new Date() >= session.expiresAt;
}

export function getSessionTimeRemaining(session: AuthSession): number {
  return Math.max(0, session.expiresAt.getTime() - Date.now());
}

export function shouldRefreshSession(
  session: AuthSession, 
  config: SessionConfig = DEFAULT_SESSION_CONFIG
): boolean {
  const timeRemaining = getSessionTimeRemaining(session);
  return timeRemaining <= config.renewalThreshold && timeRemaining > 0;
}

// ============================================================================
// Container Integration Utilities
// ============================================================================

export class ContainerSessionManager {
  private config: ContainerAuthConfig;
  private healthCheckInterval?: NodeJS.Timeout;

  constructor(config: ContainerAuthConfig) {
    this.config = config;
    this.startHealthCheck();
  }

  public async validateSessionWithBackend(sessionId: string): Promise<{
    valid: boolean;
    session?: AuthSession;
    error?: AuthError;
  }> {
    try {
      const response = await fetch(`${this.config.backendUrl}${this.config.sessionEndpoint}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        throw new Error(`Session validation failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        valid: data.valid,
        session: data.session,
        error: data.error
      };
    } catch (error) {
      console.error('Backend session validation failed:', error);
      return {
        valid: false,
        error: {
          code: AuthErrorCode.NETWORK_ERROR,
          message: 'Failed to validate session with backend',
          details: error,
          timestamp: new Date()
        }
      };
    }
  }

  public async refreshSessionWithBackend(sessionId: string, refreshToken?: string): Promise<{
    success: boolean;
    session?: AuthSession;
    error?: AuthError;
  }> {
    try {
      const response = await fetch(`${this.config.backendUrl}${this.config.sessionEndpoint}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, refreshToken }),
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        throw new Error(`Session refresh failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: data.success,
        session: data.session,
        error: data.error
      };
    } catch (error) {
      console.error('Backend session refresh failed:', error);
      return {
        success: false,
        error: {
          code: AuthErrorCode.NETWORK_ERROR,
          message: 'Failed to refresh session with backend',
          details: error,
          timestamp: new Date()
        }
      };
    }
  }

  private startHealthCheck(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        await fetch(`${this.config.backendUrl}${this.config.healthEndpoint}`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });
      } catch (error) {
        console.warn('Backend health check failed:', error);
      }
    }, 30000); // Check every 30 seconds
  }

  public cleanup(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }
}

// ============================================================================
// Security Utilities
// ============================================================================

export function generateSecureSessionId(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function createSessionFingerprint(): string {
  if (typeof window === 'undefined') return '';
  
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset().toString()
  ];
  
  return btoa(components.join('|'));
}

export function detectSessionAnomalies(
  currentSession: AuthSession,
  previousFingerprint: string
): boolean {
  const currentFingerprint = createSessionFingerprint();
  return currentFingerprint !== previousFingerprint;
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

export const sessionManager = SessionStorageManager.getInstance();

// ============================================================================
// React Hook Utilities
// ============================================================================

export function useSessionSync(callback: (event: CustomEvent) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleSessionEvent = (event: CustomEvent) => {
    callback(event);
  };

  window.addEventListener('pfm:session:cleared', handleSessionEvent as EventListener);
  window.addEventListener('pfm:session:set', handleSessionEvent as EventListener);
  window.addEventListener('pfm:session:activity', handleSessionEvent as EventListener);

  return () => {
    window.removeEventListener('pfm:session:cleared', handleSessionEvent as EventListener);
    window.removeEventListener('pfm:session:set', handleSessionEvent as EventListener);
    window.removeEventListener('pfm:session:activity', handleSessionEvent as EventListener);
  };
} 