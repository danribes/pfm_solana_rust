/**
 * AuthGuard Component
 * Route protection and access control based on authentication and permissions
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useWallet } from '../hooks/useWallet';
import { 
  AuthGuardProps, 
  UserRole, 
  Permission,
  AuthError,
  AuthErrorCode 
} from '../types/auth';

// ============================================================================
// AuthGuard Component
// ============================================================================

export function AuthGuard({
  children,
  requiredRole,
  requiredPermissions = [],
  fallback,
  redirectTo,
  allowGuest = false
}: AuthGuardProps): JSX.Element {
  const auth = useAuth();
  const wallet = useWallet();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [authError, setAuthError] = useState<AuthError | null>(null);

  // Check access permissions
  useEffect(() => {
    const checkAccess = async () => {
      try {
        // If guest access is allowed and no specific requirements
        if (allowGuest && !requiredRole && requiredPermissions.length === 0) {
          setHasAccess(true);
          return;
        }

        // Check if user is authenticated
        if (!auth.isAuthenticated) {
          if (wallet.connected) {
            // Wallet connected but not authenticated - could auto-authenticate
            setHasAccess(false);
            setAuthError({
              code: AuthErrorCode.AUTHENTICATION_FAILED,
              message: 'Authentication required',
              timestamp: new Date()
            });
          } else {
            // No wallet connection
            setHasAccess(false);
            setAuthError({
              code: AuthErrorCode.WALLET_NOT_CONNECTED,
              message: 'Wallet connection required',
              timestamp: new Date()
            });
          }
          return;
        }

        // Check role requirements
        if (requiredRole && !auth.hasRole(requiredRole)) {
          setHasAccess(false);
          setAuthError({
            code: AuthErrorCode.INSUFFICIENT_PERMISSIONS,
            message: `${requiredRole} role required`,
            timestamp: new Date()
          });
          return;
        }

        // Check permission requirements
        const hasAllPermissions = requiredPermissions.every(permission =>
          auth.hasPermission(permission.resource, permission.actions[0])
        );

        if (requiredPermissions.length > 0 && !hasAllPermissions) {
          setHasAccess(false);
          setAuthError({
            code: AuthErrorCode.INSUFFICIENT_PERMISSIONS,
            message: 'Insufficient permissions',
            timestamp: new Date()
          });
          return;
        }

        // All checks passed
        setHasAccess(true);
        setAuthError(null);
      } catch (error) {
        console.error('Access check failed:', error);
        setHasAccess(false);
        setAuthError({
          code: AuthErrorCode.AUTHENTICATION_FAILED,
          message: 'Access check failed',
          details: error,
          timestamp: new Date()
        });
      }
    };

    checkAccess();
  }, [
    auth.isAuthenticated,
    auth.user,
    wallet.connected,
    requiredRole,
    requiredPermissions,
    allowGuest
  ]);

  // Show loading state while checking access
  if (auth.isLoading || hasAccess === null) {
    return (
      <div className="auth-guard-loading">
        <div>Checking permissions...</div>
      </div>
    );
  }

  // Access granted - render children
  if (hasAccess) {
    return <>{children}</>;
  }

  // Access denied - render fallback or default message
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default access denied UI
  return (
    <AccessDenied 
      error={authError}
      onRetry={() => setHasAccess(null)}
      redirectTo={redirectTo}
    />
  );
}

// ============================================================================
// Access Denied Component
// ============================================================================

interface AccessDeniedProps {
  error: AuthError | null;
  onRetry: () => void;
  redirectTo?: string;
}

function AccessDenied({ error, onRetry, redirectTo }: AccessDeniedProps): JSX.Element {
  const auth = useAuth();
  const wallet = useWallet();

  const handleConnectWallet = async () => {
    try {
      await wallet.connect();
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  const handleAuthenticate = async () => {
    try {
      await auth.connectAndAuthenticate();
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  };

  const handleRedirect = () => {
    if (redirectTo) {
      window.location.href = redirectTo;
    }
  };

  return (
    <div className="auth-guard-access-denied">
      <div className="access-denied-content">
        <h2>Access Denied</h2>
        
        {error && (
          <div className="error-message">
            <p>{error.message}</p>
          </div>
        )}

        <div className="access-denied-actions">
          {!wallet.connected && (
            <button 
              onClick={handleConnectWallet}
              className="connect-wallet-btn"
            >
              Connect Wallet
            </button>
          )}

          {wallet.connected && !auth.isAuthenticated && (
            <button 
              onClick={handleAuthenticate}
              className="authenticate-btn"
            >
              Sign In
            </button>
          )}

          {auth.isAuthenticated && error?.code === AuthErrorCode.INSUFFICIENT_PERMISSIONS && (
            <div className="permission-denied">
              <p>You don't have permission to access this resource.</p>
              {redirectTo && (
                <button onClick={handleRedirect} className="redirect-btn">
                  Go Back
                </button>
              )}
            </div>
          )}

          <button onClick={onRetry} className="retry-btn">
            Retry
          </button>
        </div>
      </div>

      <style>{`
        .auth-guard-access-denied {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 200px;
          padding: 2rem;
        }

        .access-denied-content {
          text-align: center;
          max-width: 400px;
        }

        .access-denied-content h2 {
          color: #dc3545;
          margin-bottom: 1rem;
        }

        .error-message {
          background-color: #f8d7da;
          color: #721c24;
          padding: 0.75rem;
          border-radius: 0.375rem;
          margin-bottom: 1rem;
        }

        .access-denied-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .access-denied-actions button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-weight: 500;
        }

        .connect-wallet-btn, .authenticate-btn {
          background-color: #007bff;
          color: white;
        }

        .connect-wallet-btn:hover, .authenticate-btn:hover {
          background-color: #0056b3;
        }

        .retry-btn {
          background-color: #6c757d;
          color: white;
        }

        .retry-btn:hover {
          background-color: #545b62;
        }

        .redirect-btn {
          background-color: #28a745;
          color: white;
        }

        .redirect-btn:hover {
          background-color: #1e7e34;
        }

        .permission-denied {
          margin: 1rem 0;
        }

        .auth-guard-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100px;
          font-style: italic;
          color: #6c757d;
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// Higher-Order Component
// ============================================================================

export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  guardProps: Omit<AuthGuardProps, 'children'>
) {
  return function AuthGuardedComponent(props: P) {
    return (
      <AuthGuard {...guardProps}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}

// ============================================================================
// Role-Based Guards
// ============================================================================

export function AdminGuard({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <AuthGuard
      requiredRole={UserRole.ADMIN}
      fallback={fallback}
    >
      {children}
    </AuthGuard>
  );
}

export function MemberGuard({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <AuthGuard
      requiredRole={UserRole.MEMBER}
      fallback={fallback}
    >
      {children}
    </AuthGuard>
  );
}

// ============================================================================
// Permission-Based Guards
// ============================================================================

interface PermissionGuardProps {
  children: React.ReactNode;
  resource: string;
  action: string;
  fallback?: React.ReactNode;
}

export function PermissionGuard({ 
  children, 
  resource, 
  action, 
  fallback 
}: PermissionGuardProps) {
  const permission: Permission = {
    resource,
    actions: [action]
  };

  return (
    <AuthGuard
      requiredPermissions={[permission]}
      fallback={fallback}
    >
      {children}
    </AuthGuard>
  );
}

// ============================================================================
// Utility Guards
// ============================================================================

export function RequireWallet({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const wallet = useWallet();

  if (!wallet.connected) {
    return fallback ? <>{fallback}</> : (
      <div className="require-wallet">
        <p>Please connect your wallet to continue.</p>
        <button onClick={() => wallet.connect()}>
          Connect Wallet
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

export function RequireAuth({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <AuthGuard fallback={fallback}>
      {children}
    </AuthGuard>
  );
} 