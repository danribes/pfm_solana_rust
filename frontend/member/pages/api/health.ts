import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const startTime = Date.now();
  
  // Check if running in container mode
  const containerMode = process.env.NEXT_PUBLIC_CONTAINER_MODE === 'true';
  
  // Health check response
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    containerMode,
    portal: 'member',
    walletInfrastructure: {
      configured: true,
      supportedWallets: ['Phantom', 'Solflare', 'Backpack', 'Glow', 'Slope'],
      networkEndpoint: process.env.NEXT_PUBLIC_SOLANA_RPC || 'http://localhost:8899',
      containerAware: containerMode
    },
    services: {
      backend: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
      solana: process.env.NEXT_PUBLIC_SOLANA_RPC || 'http://localhost:8899'
    }
  };

  // Add response headers
  res.setHeader('X-Response-Time', `${Date.now() - startTime}ms`);
  res.setHeader('X-Container-Mode', containerMode ? 'true' : 'false');
  res.setHeader('X-Portal-Type', 'member');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  res.status(200).json(health);
} 