import { NextApiRequest, NextApiResponse } from 'next';

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  latency?: number;
  error?: string;
}

interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  containerMode: boolean;
  services: {
    backend: ServiceStatus;
    postgres: ServiceStatus;
    redis: ServiceStatus;
    solana: ServiceStatus;
  };
  walletInfrastructure: {
    configured: boolean;
    supportedWallets: string[];
    networkEndpoint: string;
    containerAware: boolean;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  const startTime = Date.now();
  
  // Check if running in container mode
  const containerMode = process.env.NEXT_PUBLIC_CONTAINER_MODE === 'true';
  
  // Health check response
  const health: HealthResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    containerMode,
    services: {
      backend: { name: 'Backend API', status: 'unknown' },
      postgres: { name: 'PostgreSQL', status: 'unknown' },
      redis: { name: 'Redis', status: 'unknown' },
      solana: { name: 'Solana Validator', status: 'unknown' }
    },
    walletInfrastructure: {
      configured: true,
      supportedWallets: ['Phantom', 'Solflare', 'Backpack', 'Glow', 'Slope'],
      networkEndpoint: process.env.NEXT_PUBLIC_SOLANA_RPC || 'http://localhost:8899',
      containerAware: containerMode
    }
  };

  // Service URLs based on container mode
  const serviceUrls = {
    backend: containerMode 
      ? process.env.NEXT_PUBLIC_API_URL || 'http://backend:3000'
      : 'http://localhost:3000',
    postgres: containerMode ? 'postgres:5432' : 'localhost:5432',
    redis: containerMode ? 'redis:6379' : 'localhost:6379',
    solana: containerMode 
      ? process.env.NEXT_PUBLIC_SOLANA_RPC || 'http://solana-local-validator:8899'
      : 'http://localhost:8899'
  };

  try {
    // Check Backend API
    try {
      const backendStart = Date.now();
      const backendResponse = await fetch(`${serviceUrls.backend}/health`, {
        method: 'GET'
      });
      
      health.services.backend = {
        name: 'Backend API',
        status: backendResponse.ok ? 'healthy' : 'unhealthy',
        latency: Date.now() - backendStart
      };
    } catch (error: any) {
      health.services.backend = {
        name: 'Backend API',
        status: 'unhealthy',
        error: error.message
      };
    }

    // Check Solana Validator
    try {
      const solanaStart = Date.now();
      const solanaResponse = await fetch(serviceUrls.solana, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getHealth'
        })
      });
      
      health.services.solana = {
        name: 'Solana Validator',
        status: solanaResponse.ok ? 'healthy' : 'unhealthy',
        latency: Date.now() - solanaStart
      };
    } catch (error: any) {
      health.services.solana = {
        name: 'Solana Validator',
        status: 'unhealthy',
        error: error.message
      };
    }

    // For PostgreSQL and Redis, we can't directly check from frontend
    // but we can check if backend is healthy (which implies they're working)
    if (health.services.backend.status === 'healthy') {
      health.services.postgres.status = 'healthy';
      health.services.redis.status = 'healthy';
    } else {
      health.services.postgres.status = 'unknown';
      health.services.redis.status = 'unknown';
    }

    // Determine overall health
    const allServices = Object.values(health.services);
    const hasUnhealthy = allServices.some(service => service.status === 'unhealthy');
    
    if (hasUnhealthy) {
      health.status = 'unhealthy';
    }

    // Set appropriate HTTP status
    const httpStatus = health.status === 'healthy' ? 200 : 503;
    
    // Add response time header
    res.setHeader('X-Response-Time', `${Date.now() - startTime}ms`);
    res.setHeader('X-Container-Mode', containerMode ? 'true' : 'false');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    res.status(httpStatus).json(health);

  } catch (error: any) {
    // Return error response
    health.status = 'unhealthy';
    res.status(503).json({
      ...health,
      error: error.message
    } as any);
  }
} 