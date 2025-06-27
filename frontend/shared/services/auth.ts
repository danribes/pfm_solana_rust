/**
 * Authentication Service
 * Comprehensive wallet-based authentication service
 */

import { PublicKey } from '@solana/web3.js';
import { 
  AuthUser, 
  AuthSession, 
  AuthMessage, 
  AuthNonce, 
  AuthError, 
  AuthErrorCode,
  UserRole,
  Permission,
  AuthenticateParams,
  SessionValidationResponse,
  ContainerAuthConfig,
  AuthConfig
} from '../types/auth';
import { WalletContextValue } from '../types/wallet';
import { sessionManager, ContainerSessionManager, generateSecureSessionId } from '../utils/session';
import { AuthServiceHelpers } from './auth-helpers';

// ============================================================================
// Authentication Configuration
// ============================================================================

const DEFAULT_AUTH_CONFIG: AuthConfig = {
  session: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    renewalThreshold: 60 * 60 * 1000, // 1 hour
    maxConcurrentSessions: 3,
    requireReauth: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  },
  messageTemplate: {
    domain: process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost:3000',
    statement: 'Sign in to PFM Community Management',
    uri: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    version: '1'
  },
  nonceConfig: {
    length: 32,
    expiryMinutes: 10
  },
  security: {
    requireHttps: process.env.NODE_ENV === 'production',
    rateLimiting: {
      maxAttempts: 5,
      windowMinutes: 15
    }
  },
  containerAware: process.env.NODE_ENV === 'development',
  serviceDiscovery: {
    authServiceUrl: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL,
    sessionServiceUrl: process.env.NEXT_PUBLIC_SESSION_SERVICE_URL
  }
};

// ============================================================================
// Authentication Service Class
// ============================================================================

export class AuthenticationService {
  private static instance: AuthenticationService;
  private config: AuthConfig;
  private containerManager?: ContainerSessionManager;
  private nonceCache: Map<string, AuthNonce>;
  private rateLimitMap: Map<string, { attempts: number; resetTime: number }>;

  private constructor(config: AuthConfig = DEFAULT_AUTH_CONFIG) {
    this.config = config;
    this.nonceCache = new Map();
    this.rateLimitMap = new Map();
    this.setupContainerIntegration();
    this.startCleanupTimer();
  }

  public static getInstance(config?: AuthConfig): AuthenticationService {
    if (!AuthenticationService.instance) {
      AuthenticationService.instance = new AuthenticationService(config);
    }
    return AuthenticationService.instance;
  }

  // ============================================================================
  // Authentication Methods
  // ============================================================================

  public async generateAuthMessage(publicKey: PublicKey): Promise<AuthMessage> {
    const nonce = await this.generateNonce(publicKey.toString());
    const timestamp = Date.now();

    const message: AuthMessage = {
      nonce,
      timestamp,
      domain: this.config.messageTemplate.domain,
      statement: this.config.messageTemplate.statement,
      uri: this.config.messageTemplate.uri,
      version: this.config.messageTemplate.version
    };

    return message;
  }

  public async authenticate(
    wallet: WalletContextValue,
    params: AuthenticateParams
  ): Promise<AuthUser> {
    try {
      // Rate limiting check
      this.checkRateLimit(params.publicKey.toString());

      // Validate nonce
      await this.validateNonce(params.nonce, params.publicKey.toString());

      // Verify signature
      const isValidSignature = await this.verifySignature(
        params.message,
        params.signature,
        params.publicKey
      );

      if (!isValidSignature) {
        throw AuthServiceHelpers.createAuthError(AuthErrorCode.INVALID_SIGNATURE, 'Signature verification failed');
      }

      // Get user role and permissions from blockchain/backend
      const userRole = await AuthServiceHelpers.getUserRole(params.publicKey, this.config);
      const permissions = await AuthServiceHelpers.getUserPermissions(params.publicKey, userRole);

      // Create authenticated user
      const user: AuthUser = {
        publicKey: params.publicKey,
        walletAddress: params.publicKey.toString(),
        role: userRole,
        communities: await AuthServiceHelpers.getUserCommunities(params.publicKey),
        permissions,
        lastActivity: new Date(),
        createdAt: new Date() // This would come from backend in real implementation
      };

      // Create session
      const session = await AuthServiceHelpers.createSession(user, this.config);

      // Store session data
      sessionManager.setSession(session);
      sessionManager.setUserData(user);

      // Consume nonce
      AuthServiceHelpers.consumeNonce(params.nonce, this.nonceCache);

      return user;
    } catch (error) {
      AuthServiceHelpers.handleAuthenticationError(
        params.publicKey.toString(), 
        error, 
        this.rateLimitMap
      );
      throw error;
    }
  }

  public async validateSession(): Promise<SessionValidationResponse> {
    return AuthServiceHelpers.validateSession(this.config, this.containerManager);
  }

  public async refreshSession(): Promise<AuthSession | null> {
    return AuthServiceHelpers.refreshSession(this.config, this.containerManager);
  }

  public async logout(allSessions: boolean = false): Promise<void> {
    return AuthServiceHelpers.logout(this.config, this.containerManager, allSessions);
  }

  public checkPermission(user: AuthUser, resource: string, action: string): boolean {
    return AuthServiceHelpers.checkPermission(user, resource, action);
  }

  public hasRole(user: AuthUser, role: UserRole): boolean {
    return AuthServiceHelpers.hasRole(user, role);
  }

  // Private helper methods that delegate to AuthServiceHelpers
  private async generateNonce(publicKey: string): Promise<string> {
    return AuthServiceHelpers.generateNonce(publicKey, this.config, this.nonceCache);
  }

  private async validateNonce(nonce: string, publicKey: string): Promise<void> {
    return AuthServiceHelpers.validateNonce(nonce, publicKey, this.nonceCache);
  }

  private consumeNonce(nonce: string): void {
    AuthServiceHelpers.consumeNonce(nonce, this.nonceCache);
  }

  private async verifySignature(
    message: string,
    signature: Uint8Array,
    publicKey: PublicKey
  ): Promise<boolean> {
    return AuthServiceHelpers.verifySignature(message, signature, publicKey);
  }

  private async createSession(user: AuthUser): Promise<AuthSession> {
    return AuthServiceHelpers.createSession(user, this.config);
  }

  private checkRateLimit(publicKey: string): void {
    AuthServiceHelpers.checkRateLimit(publicKey, this.config, this.rateLimitMap);
  }

  private setupContainerIntegration(): void {
    this.containerManager = AuthServiceHelpers.setupContainerIntegration(this.config);
  }

  private startCleanupTimer(): void {
    // Clean up expired nonces every 5 minutes
    setInterval(() => {
      const now = new Date();
      for (const [nonce, authNonce] of this.nonceCache.entries()) {
        if (now > authNonce.expiresAt) {
          this.nonceCache.delete(nonce);
        }
      }

      // Clean up expired rate limits
      for (const [publicKey, rateLimit] of this.rateLimitMap.entries()) {
        if (Date.now() > rateLimit.resetTime) {
          this.rateLimitMap.delete(publicKey);
        }
      }
    }, 5 * 60 * 1000);
  }

  public cleanup(): void {
    this.nonceCache.clear();
    this.rateLimitMap.clear();
    if (this.containerManager) {
      this.containerManager.cleanup();
    }
  }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

export const authService = AuthenticationService.getInstance();

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