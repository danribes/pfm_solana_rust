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
  demoMode: boolean;
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
  const demoMode = true; // Always in demo mode for this version
  
  // Health check response - always healthy in demo mode
  const health: HealthResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    containerMode,
    demoMode,
    services: {
      backend: { 
        name: 'Backend API', 
        status: 'unknown',
        error: 'Demo mode - backend services not required for UI demonstration'
      },
      postgres: { 
        name: 'PostgreSQL', 
        status: 'unknown',
        error: 'Demo mode - database not required for UI demonstration'
      },
      redis: { 
        name: 'Redis', 
        status: 'unknown',
        error: 'Demo mode - cache not required for UI demonstration'
      },
      solana: { 
        name: 'Solana Validator', 
        status: 'unknown',
        error: 'Demo mode - blockchain validator not required for UI demonstration'
      }
    },
    walletInfrastructure: {
      configured: true,
      supportedWallets: ['Phantom', 'Solflare', 'Backpack', 'Glow', 'Slope'],
      networkEndpoint: process.env.NEXT_PUBLIC_SOLANA_RPC || 'http://localhost:8899',
      containerAware: containerMode
    }
  };

  // Add response time header
  res.setHeader('X-Response-Time', `${Date.now() - startTime}ms`);
  res.setHeader('X-Container-Mode', containerMode ? 'true' : 'false');
  res.setHeader('X-Demo-Mode', 'true');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  // Always return 200 OK in demo mode
  res.status(200).json(health);
} 