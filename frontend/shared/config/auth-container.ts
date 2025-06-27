/**
 * Container-Aware Authentication Configuration
 * Configures authentication based on container environment
 */

import { AuthConfig, ContainerAuthConfig } from '../types/auth';

// ============================================================================
// Container Environment Detection
// ============================================================================

export function getContainerEnvironment(): 'development' | 'testing' | 'production' {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const containerEnv = process.env.CONTAINER_ENV || nodeEnv;
  
  switch (containerEnv.toLowerCase()) {
    case 'production':
    case 'prod':
      return 'production';
    case 'testing':
    case 'test':
      return 'testing';
    default:
      return 'development';
  }
}

export function isContainerized(): boolean {
  return process.env.DOCKER_CONTAINER === 'true' || 
         process.env.CONTAINER_NAME !== undefined ||
         process.env.HOSTNAME?.includes('container') === true;
}

// ============================================================================
// Container Service Discovery
// ============================================================================

export function getContainerServiceUrls(): {
  backendUrl: string;
  authServiceUrl: string;
  sessionServiceUrl: string;
  redisUrl: string;
  databaseUrl: string;
} {
  const environment = getContainerEnvironment();
  const isContainer = isContainerized();
  
  if (isContainer) {
    // Container-to-container communication
    return {
      backendUrl: process.env.BACKEND_SERVICE_URL || 'http://backend:3000',
      authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://backend:3000/api/auth',
      sessionServiceUrl: process.env.SESSION_SERVICE_URL || 'http://backend:3000/api/session',
      redisUrl: process.env.REDIS_URL || 'redis://redis:6379',
      databaseUrl: process.env.DATABASE_URL || 'postgresql://pfm_user:pfm_password@postgres:5432/pfm_db'
    };
  } else {
    // Local development or external access
    return {
      backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000',
      authServiceUrl: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3000/api/auth',
      sessionServiceUrl: process.env.NEXT_PUBLIC_SESSION_SERVICE_URL || 'http://localhost:3000/api/session',
      redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
      databaseUrl: process.env.DATABASE_URL || 'postgresql://pfm_user:pfm_password@localhost:5432/pfm_db'
    };
  }
}

// ============================================================================
// Container-Aware Authentication Configuration
// ============================================================================

export function createContainerAuthConfig(): AuthConfig {
  const environment = getContainerEnvironment();
  const serviceUrls = getContainerServiceUrls();
  const isContainer = isContainerized();

  const baseConfig: AuthConfig = {
    session: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      renewalThreshold: 60 * 60 * 1000, // 1 hour
      maxConcurrentSessions: 3,
      requireReauth: false,
      secure: environment === 'production',
      sameSite: environment === 'production' ? 'strict' : 'lax'
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
      requireHttps: environment === 'production',
      rateLimiting: {
        maxAttempts: environment === 'production' ? 3 : 5,
        windowMinutes: environment === 'production' ? 30 : 15
      }
    },
    containerAware: isContainer,
    serviceDiscovery: {
      authServiceUrl: serviceUrls.authServiceUrl,
      sessionServiceUrl: serviceUrls.sessionServiceUrl
    }
  };

  return baseConfig;
}

export function createContainerBackendConfig(): ContainerAuthConfig {
  const serviceUrls = getContainerServiceUrls();
  const environment = getContainerEnvironment();

  return {
    backendUrl: serviceUrls.backendUrl,
    authEndpoint: '/api/auth',
    sessionEndpoint: '/api/session',
    healthEndpoint: '/api/health',
    timeout: environment === 'production' ? 5000 : 10000,
    retries: environment === 'production' ? 2 : 3
  };
}

// ============================================================================
// Container Health Check Configuration
// ============================================================================

export interface ContainerHealthConfig {
  checkInterval: number;
  retryAttempts: number;
  services: {
    backend: string;
    redis: string;
    database: string;
  };
}

export function createContainerHealthConfig(): ContainerHealthConfig {
  const serviceUrls = getContainerServiceUrls();
  const environment = getContainerEnvironment();

  return {
    checkInterval: environment === 'production' ? 30000 : 10000, // 30s prod, 10s dev
    retryAttempts: environment === 'production' ? 3 : 5,
    services: {
      backend: `${serviceUrls.backendUrl}/api/health`,
      redis: serviceUrls.redisUrl,
      database: serviceUrls.databaseUrl
    }
  };
}

// ============================================================================
// Container Environment Variables
// ============================================================================

export interface ContainerEnvVars {
  NODE_ENV: string;
  CONTAINER_ENV: string;
  DOCKER_CONTAINER: string;
  CONTAINER_NAME: string;
  NEXT_PUBLIC_APP_URL: string;
  NEXT_PUBLIC_APP_DOMAIN: string;
  NEXT_PUBLIC_BACKEND_URL: string;
  NEXT_PUBLIC_AUTH_SERVICE_URL: string;
  NEXT_PUBLIC_SESSION_SERVICE_URL: string;
  BACKEND_SERVICE_URL: string;
  AUTH_SERVICE_URL: string;
  SESSION_SERVICE_URL: string;
  REDIS_URL: string;
  DATABASE_URL: string;
}

export function validateContainerEnvironment(): {
  isValid: boolean;
  missing: string[];
  warnings: string[];
} {
  const required = [
    'NODE_ENV',
    'NEXT_PUBLIC_APP_URL'
  ];

  const containerRequired = [
    'BACKEND_SERVICE_URL',
    'REDIS_URL',
    'DATABASE_URL'
  ];

  const missing: string[] = [];
  const warnings: string[] = [];

  // Check basic required variables
  required.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  // Check container-specific variables if containerized
  if (isContainerized()) {
    containerRequired.forEach(varName => {
      if (!process.env[varName]) {
        warnings.push(`Container variable ${varName} not set, using defaults`);
      }
    });
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings
  };
}

// ============================================================================
// Container Logging Configuration
// ============================================================================

export interface ContainerLogConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'text';
  includeTimestamp: boolean;
  includeContainerInfo: boolean;
}

export function createContainerLogConfig(): ContainerLogConfig {
  const environment = getContainerEnvironment();
  const isContainer = isContainerized();

  return {
    level: environment === 'production' ? 'warn' : 'debug',
    format: isContainer ? 'json' : 'text',
    includeTimestamp: true,
    includeContainerInfo: isContainer
  };
}

// ============================================================================
// Export Container Configuration
// ============================================================================

export const containerConfig = {
  environment: getContainerEnvironment(),
  isContainerized: isContainerized(),
  serviceUrls: getContainerServiceUrls(),
  authConfig: createContainerAuthConfig(),
  backendConfig: createContainerBackendConfig(),
  healthConfig: createContainerHealthConfig(),
  logConfig: createContainerLogConfig(),
  validation: validateContainerEnvironment()
};

// Log container configuration on import (in development)
if (getContainerEnvironment() === 'development') {
  console.log('🐳 Container Auth Configuration:', {
    environment: containerConfig.environment,
    containerized: containerConfig.isContainerized,
    services: containerConfig.serviceUrls,
    validation: containerConfig.validation
  });
} 