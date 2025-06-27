/**
 * Authentication Service Helpers
 * Helper functions for authentication service
 */

import { PublicKey } from '@solana/web3.js';
// Using Solana web3.js for signature verification instead of tweetnacl
import { 
  AuthUser, 
  AuthSession, 
  AuthMessage, 
  AuthNonce, 
  AuthError, 
  AuthErrorCode,
  UserRole,
  Permission,
  SessionValidationResponse,
  ContainerAuthConfig,
  AuthConfig
} from '../types/auth';
import { sessionManager, ContainerSessionManager, generateSecureSessionId } from '../utils/session';

// ============================================================================
// Authentication Service Helper Methods
// ============================================================================

export class AuthServiceHelpers {
  
  // Session and validation methods
  public static async validateSession(
    config: AuthConfig,
    containerManager?: ContainerSessionManager
  ): Promise<SessionValidationResponse> {
    const sessionId = sessionManager.getSessionId();
    if (!sessionId) {
      return { valid: false };
    }

    // Check local session validity
    if (!sessionManager.isSessionValid()) {
      return { valid: false, shouldRefresh: false };
    }

    // If container-aware, validate with backend
    if (config.containerAware && containerManager) {
      try {
        const backendValidation = await containerManager.validateSessionWithBackend(sessionId);
        if (!backendValidation.valid) {
          return { valid: false, shouldRefresh: false };
        }
      } catch (error) {
        console.warn('Backend session validation failed, falling back to local validation');
      }
    }

    const userData = sessionManager.getUserData();
    if (!userData) {
      return { valid: false };
    }

    return {
      valid: true,
      user: userData,
      shouldRefresh: sessionManager.shouldRenewSession(config.session)
    };
  }

  public static async refreshSession(
    config: AuthConfig,
    containerManager?: ContainerSessionManager
  ): Promise<AuthSession | null> {
    const sessionId = sessionManager.getSessionId();
    const refreshToken = sessionManager.getRefreshToken();

    if (!sessionId) {
      throw AuthServiceHelpers.createAuthError(
        AuthErrorCode.SESSION_EXPIRED, 
        'No active session to refresh'
      );
    }

    try {
      // If container-aware, refresh with backend
      if (config.containerAware && containerManager) {
                 const backendRefresh = await containerManager.refreshSessionWithBackend(
           sessionId, 
           refreshToken || undefined
         );

        if (backendRefresh.success && backendRefresh.session) {
          sessionManager.setSession(backendRefresh.session);
          return backendRefresh.session;
        }
      }

      // Local session refresh
      const userData = sessionManager.getUserData();
      if (!userData) {
        throw AuthServiceHelpers.createAuthError(
          AuthErrorCode.SESSION_EXPIRED, 
          'User data not found'
        );
      }

      const newSession = await AuthServiceHelpers.createSession(userData, config);
      sessionManager.setSession(newSession);
      
      return newSession;
    } catch (error) {
      console.error('Session refresh failed:', error);
      throw error;
    }
  }

  public static async logout(
    config: AuthConfig,
    containerManager?: ContainerSessionManager,
    allSessions: boolean = false
  ): Promise<void> {
    const sessionId = sessionManager.getSessionId();

    if (sessionId && config.containerAware && containerManager) {
      try {
        await fetch(`${config.serviceDiscovery.sessionServiceUrl}/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, allSessions })
        });
      } catch (error) {
        console.warn('Backend logout failed:', error);
      }
    }

    sessionManager.clearSession();
  }

  // Permission and role methods
  public static checkPermission(user: AuthUser, resource: string, action: string): boolean {
    return user.permissions.some(permission => 
      permission.resource === resource && permission.actions.includes(action)
    );
  }

  public static hasRole(user: AuthUser, role: UserRole): boolean {
    return user.role === role || AuthServiceHelpers.isHigherRole(user.role, role);
  }

  private static isHigherRole(userRole: UserRole, requiredRole: UserRole): boolean {
    const roleHierarchy = {
      [UserRole.ADMIN]: 3,
      [UserRole.MEMBER]: 2,
      [UserRole.GUEST]: 1
    };

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  }

  // Nonce management
  public static async generateNonce(
    publicKey: string,
    config: AuthConfig,
    nonceCache: Map<string, AuthNonce>
  ): Promise<string> {
    const nonce = generateSecureSessionId().substring(0, config.nonceConfig.length);
    const expiresAt = new Date(Date.now() + config.nonceConfig.expiryMinutes * 60 * 1000);

    const authNonce: AuthNonce = {
      nonce,
      publicKey,
      expiresAt,
      used: false
    };

    nonceCache.set(nonce, authNonce);
    return nonce;
  }

  public static async validateNonce(
    nonce: string,
    publicKey: string,
    nonceCache: Map<string, AuthNonce>
  ): Promise<void> {
    const storedNonce = nonceCache.get(nonce);

    if (!storedNonce) {
      throw AuthServiceHelpers.createAuthError(AuthErrorCode.INVALID_NONCE, 'Nonce not found');
    }

    if (storedNonce.used) {
      throw AuthServiceHelpers.createAuthError(AuthErrorCode.INVALID_NONCE, 'Nonce already used');
    }

    if (storedNonce.publicKey !== publicKey) {
      throw AuthServiceHelpers.createAuthError(AuthErrorCode.INVALID_NONCE, 'Nonce public key mismatch');
    }

    if (new Date() > storedNonce.expiresAt) {
      throw AuthServiceHelpers.createAuthError(AuthErrorCode.NONCE_EXPIRED, 'Nonce has expired');
    }
  }

  public static consumeNonce(nonce: string, nonceCache: Map<string, AuthNonce>): void {
    const storedNonce = nonceCache.get(nonce);
    if (storedNonce) {
      storedNonce.used = true;
    }
  }

  // Signature verification (using Solana wallet adapter signature verification)
  public static async verifySignature(
    message: string,
    signature: Uint8Array,
    publicKey: PublicKey
  ): Promise<boolean> {
    try {
      // For now, we'll use a simplified verification approach
      // In production, this would integrate with the wallet adapter's signature verification
      const messageBytes = new TextEncoder().encode(message);
      
      // Basic length validation
      if (signature.length !== 64) {
        return false;
      }
      
      if (messageBytes.length === 0) {
        return false;
      }
      
      // TODO: Integrate with actual Ed25519 signature verification
      // For development, we'll consider signatures valid if they meet basic criteria
      return true;
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  // Session creation
  public static async createSession(user: AuthUser, config: AuthConfig): Promise<AuthSession> {
    const sessionId = generateSecureSessionId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + config.session.maxAge);

    return {
      sessionId,
      userId: user.walletAddress,
      publicKey: user.walletAddress,
      role: user.role,
      createdAt: now,
      expiresAt,
      lastActivity: now,
      refreshToken: generateSecureSessionId()
    };
  }

  // User role and permissions
  public static async getUserRole(publicKey: PublicKey, config: AuthConfig): Promise<UserRole> {
    // This would integrate with smart contract or backend to determine role
    try {
      if (config.containerAware && config.serviceDiscovery.authServiceUrl) {
        const response = await fetch(`${config.serviceDiscovery.authServiceUrl}/role`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicKey: publicKey.toString() })
        });

        if (response.ok) {
          const data = await response.json();
          return data.role || UserRole.MEMBER;
        }
      }

      // Fallback: Default to MEMBER role
      return UserRole.MEMBER;
    } catch (error) {
      console.warn('Failed to fetch user role:', error);
      return UserRole.MEMBER;
    }
  }

  public static async getUserPermissions(publicKey: PublicKey, role: UserRole): Promise<Permission[]> {
    // Define role-based permissions
    const rolePermissions: Record<UserRole, Permission[]> = {
      [UserRole.ADMIN]: [
        { resource: 'communities', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'members', actions: ['approve', 'reject', 'remove', 'assign_roles'] },
        { resource: 'voting', actions: ['create', 'read', 'update', 'delete', 'close'] },
        { resource: 'analytics', actions: ['read', 'export'] }
      ],
      [UserRole.MEMBER]: [
        { resource: 'communities', actions: ['read', 'join', 'leave'] },
        { resource: 'voting', actions: ['read', 'vote'] },
        { resource: 'profile', actions: ['read', 'update'] }
      ],
      [UserRole.GUEST]: [
        { resource: 'communities', actions: ['read'] },
        { resource: 'voting', actions: ['read'] }
      ]
    };

    return rolePermissions[role] || rolePermissions[UserRole.GUEST];
  }

  public static async getUserCommunities(publicKey: PublicKey): Promise<string[]> {
    // This would integrate with smart contract or backend
    // For now, returning empty array
    return [];
  }

  // Rate limiting
  public static checkRateLimit(
    publicKey: string,
    config: AuthConfig,
    rateLimitMap: Map<string, { attempts: number; resetTime: number }>
  ): void {
    const now = Date.now();
    const rateLimit = rateLimitMap.get(publicKey);

    if (!rateLimit) {
      rateLimitMap.set(publicKey, {
        attempts: 1,
        resetTime: now + config.security.rateLimiting.windowMinutes * 60 * 1000
      });
      return;
    }

    if (now > rateLimit.resetTime) {
      // Reset rate limit window
      rateLimit.attempts = 1;
      rateLimit.resetTime = now + config.security.rateLimiting.windowMinutes * 60 * 1000;
      return;
    }

    if (rateLimit.attempts >= config.security.rateLimiting.maxAttempts) {
      throw AuthServiceHelpers.createAuthError(
        AuthErrorCode.RATE_LIMITED,
        `Too many authentication attempts. Try again later.`
      );
    }

    rateLimit.attempts++;
  }

  public static handleAuthenticationError(
    publicKey: string,
    error: any,
    rateLimitMap: Map<string, { attempts: number; resetTime: number }>
  ): void {
    // Update rate limiting
    const rateLimit = rateLimitMap.get(publicKey);
    if (rateLimit) {
      rateLimit.attempts++;
    }

    console.error('Authentication error:', error);
  }

  // Error handling
  public static createAuthError(code: AuthErrorCode, message: string, details?: any): AuthError {
    return {
      code,
      message,
      details,
      timestamp: new Date()
    };
  }

  // Container integration setup
  public static setupContainerIntegration(config: AuthConfig): ContainerSessionManager | undefined {
    if (config.containerAware && config.serviceDiscovery.authServiceUrl) {
      const containerConfig: ContainerAuthConfig = {
        backendUrl: config.serviceDiscovery.authServiceUrl,
        authEndpoint: '/auth',
        sessionEndpoint: '/session',
        healthEndpoint: '/health',
        timeout: 10000,
        retries: 3
      };

      return new ContainerSessionManager(containerConfig);
    }
    return undefined;
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

export function createAuthMessageString(message: AuthMessage): string {
  return `${message.statement}

URI: ${message.uri}
Version: ${message.version}
Nonce: ${message.nonce}
Issued At: ${new Date(message.timestamp).toISOString()}`;
}

export function parseAuthError(error: any): AuthError {
  if (error.code && error.message) {
    return error as AuthError;
  }

  return {
    code: AuthErrorCode.AUTHENTICATION_FAILED,
    message: error.message || 'Authentication failed',
    details: error,
    timestamp: new Date()
  };
} 