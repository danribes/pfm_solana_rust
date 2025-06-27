# Member Portal Containerization Considerations

## Overview
This document outlines the specific containerization considerations for the PFM Member Portal, ensuring seamless integration with the Docker-based development environment and proper service communication.

## Container Integration Architecture

### Service Dependencies
```
Member Portal (member:3002)
├── Backend API (backend:3000) - Primary data source
├── PostgreSQL (postgres:5432) - Indirect via backend
├── Redis Cache (redis:6379) - Session and real-time data
└── Solana Local Validator (solana:8899) - Blockchain interactions
```

### Container Configuration

#### Docker Service Definition
```yaml
member-portal:
  container_name: pfm-member-portal
  build:
    context: ./frontend/member
    dockerfile: Dockerfile
  ports:
    - "3002:3002"
  volumes:
    - ./frontend/member:/app
    - /app/node_modules
  environment:
    - NODE_ENV=development
    - NEXT_PUBLIC_API_URL=http://backend:3000
    - NEXT_PUBLIC_WS_URL=ws://backend:3000
    - NEXT_PUBLIC_SOLANA_RPC=http://solana:8899
    - NEXT_PUBLIC_NETWORK=localnet
  depends_on:
    - backend
    - redis
    - solana-local-validator
  networks:
    - pfm-network
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:3002/api/health"]
    interval: 30s
    timeout: 10s
    retries: 3
```

## API Configuration for Containers

### Environment-Aware API Client
```typescript
// lib/api-config.ts
const API_CONFIG = {
  development: {
    baseURL: process.env.NODE_ENV === 'development' 
      ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000')
      : 'http://backend:3000',
    timeout: 10000,
    withCredentials: true
  },
  production: {
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.pfm.com',
    timeout: 15000,
    withCredentials: true
  }
};

// Service discovery for container networking
export const getServiceUrl = (service: string): string => {
  const services = {
    backend: process.env.NEXT_PUBLIC_API_URL || 'http://backend:3000',
    solana: process.env.NEXT_PUBLIC_SOLANA_RPC || 'http://solana:8899',
    redis: 'redis://redis:6379'
  };
  
  return services[service] || `http://${service}:${getDefaultPort(service)}`;
};
```

### WebSocket Configuration
```typescript
// lib/websocket-config.ts
export const getWebSocketUrl = (): string => {
  if (typeof window === 'undefined') {
    // Server-side: use internal container networking
    return 'ws://backend:3000';
  }
  
  // Client-side: use environment-specific URLs
  if (process.env.NODE_ENV === 'development') {
    return process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000';
  }
  
  return process.env.NEXT_PUBLIC_WS_URL || 'wss://api.pfm.com';
};
```

## Container Health Monitoring

### Health Check Implementation
```typescript
// pages/api/health.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {},
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  };

  try {
    // Check backend connectivity
    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`, {
      timeout: 5000
    });
    health.services.backend = {
      status: backendResponse.ok ? 'healthy' : 'unhealthy',
      latency: `${Date.now() - performance.now()}ms`
    };

    // Check Solana RPC connectivity
    const solanaResponse = await fetch(`${process.env.NEXT_PUBLIC_SOLANA_RPC}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getHealth'
      }),
      timeout: 5000
    });
    health.services.solana = {
      status: solanaResponse.ok ? 'healthy' : 'unhealthy',
      latency: `${Date.now() - performance.now()}ms`
    };

    res.status(200).json(health);
  } catch (error) {
    health.status = 'unhealthy';
    health.error = error.message;
    res.status(503).json(health);
  }
}
```

### Container Status Widget
```typescript
// components/ContainerStatus.tsx
import { useState, useEffect } from 'react';

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  latency?: string;
  url: string;
}

export function ContainerStatus() {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const checkServices = async () => {
      const serviceChecks = [
        { name: 'Backend API', url: '/api/proxy/health' },
        { name: 'Solana RPC', url: '/api/solana/health' },
        { name: 'WebSocket', url: '/api/ws/health' }
      ];

      const results = await Promise.allSettled(
        serviceChecks.map(async (service) => {
          try {
            const response = await fetch(service.url);
            return {
              ...service,
              status: response.ok ? 'healthy' : 'unhealthy',
              latency: response.headers.get('X-Response-Time') || 'N/A'
            };
          } catch {
            return { ...service, status: 'unhealthy' };
          }
        })
      );

      setServices(results.map(r => r.status === 'fulfilled' ? r.value : { 
        name: 'Unknown', 
        status: 'unknown', 
        url: '' 
      }));
    };

    checkServices();
    const interval = setInterval(checkServices, 30000);
    return () => clearInterval(interval);
  }, []);

  const allHealthy = services.every(s => s.status === 'healthy');

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          allHealthy 
            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
            : 'bg-red-100 text-red-800 hover:bg-red-200'
        }`}
      >
        🐳 {allHealthy ? 'All Services Online' : 'Service Issues'}
      </button>
      
      {isExpanded && (
        <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg border p-4 min-w-64">
          <h3 className="font-semibold mb-2">Container Services</h3>
          {services.map((service) => (
            <div key={service.name} className="flex items-center justify-between py-1">
              <span className="text-sm">{service.name}</span>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  service.status === 'healthy' ? 'bg-green-500' :
                  service.status === 'unhealthy' ? 'bg-red-500' : 'bg-gray-500'
                }`} />
                {service.latency && (
                  <span className="text-xs text-gray-500">{service.latency}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Real-Time Features for Containers

### WebSocket Connection Management
```typescript
// hooks/useWebSocket.ts
import { useEffect, useRef, useState } from 'react';
import { getWebSocketUrl } from '../lib/websocket-config';

export function useWebSocket(path: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    try {
      const url = `${getWebSocketUrl()}${path}`;
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        setIsConnected(true);
        reconnectAttempts.current = 0;
        console.log(`WebSocket connected to ${url}`);
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.current.onclose = () => {
        setIsConnected(false);
        
        // Attempt reconnection with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000;
          setTimeout(connect, delay);
          reconnectAttempts.current++;
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  };

  useEffect(() => {
    connect();
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [path]);

  const sendMessage = (message: any) => {
    if (ws.current && isConnected) {
      ws.current.send(JSON.stringify(message));
    }
  };

  return { isConnected, lastMessage, sendMessage };
}
```

## Development vs Production Configurations

### Environment-Specific Settings
```typescript
// next.config.js
const nextConfig = {
  // Container-specific configurations
  experimental: {
    serverComponentsExternalPackages: ['@solana/web3.js']
  },
  
  // API rewrites for container networking
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/proxy/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://backend:3000'}/:path*`
        }
      ];
    }
    return [];
  },

  // Environment variable validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Container health check endpoint
  async headers() {
    return [
      {
        source: '/api/health',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
```

### Docker-Specific Environment Variables
```bash
# .env.container
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://backend:3000
NEXT_PUBLIC_WS_URL=ws://backend:3000
NEXT_PUBLIC_SOLANA_RPC=http://solana:8899
NEXT_PUBLIC_NETWORK=localnet
NEXT_PUBLIC_CLUSTER=localnet

# Container networking
NEXT_PUBLIC_CONTAINER_MODE=true
NEXT_PUBLIC_SERVICE_DISCOVERY=true

# Performance optimizations
NEXT_TELEMETRY_DISABLED=1
NEXT_PRIVATE_STANDALONE=true
```

## Performance Optimization for Containers

### Bundle Optimization
```javascript
// webpack.config.js additions for containers
const config = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        solana: {
          test: /[\\/]node_modules[\\/]@solana[\\/]/,
          name: 'solana',
          chunks: 'all',
        }
      }
    }
  },
  
  // Container-specific externals
  externals: process.env.NEXT_PUBLIC_CONTAINER_MODE ? {
    'socket.io-client': 'socket.io-client'
  } : {}
};
```

### Caching Strategy for Containers
```typescript
// lib/cache-config.ts
export const getCacheConfig = () => {
  const isContainer = process.env.NEXT_PUBLIC_CONTAINER_MODE === 'true';
  
  return {
    redis: {
      url: isContainer ? 'redis://redis:6379' : 'redis://localhost:6379',
      ttl: 300, // 5 minutes default
      keyPrefix: 'member-portal:'
    },
    
    api: {
      staleWhileRevalidate: 60,
      maxAge: 300,
      swr: true
    },
    
    // Container-specific cache headers
    headers: isContainer ? {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60'
    } : {}
  };
};
```

## Security Considerations

### Container Network Security
```typescript
// lib/security-config.ts
export const getSecurityConfig = () => ({
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://pfm.com', 'https://app.pfm.com']
      : ['http://localhost:3002', 'http://localhost:3000'],
    credentials: true
  },
  
  // Container-specific security headers
  headers: {
    'X-Container-Service': 'member-portal',
    'X-Service-Version': process.env.npm_package_version || '1.0.0',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY'
  },

  // Internal service authentication
  internalAuth: {
    serviceName: 'member-portal',
    serviceSecret: process.env.INTERNAL_SERVICE_SECRET,
    allowedServices: ['backend', 'admin-portal']
  }
});
```

## Monitoring and Logging

### Container-Aware Logging
```typescript
// lib/logger.ts
import winston from 'winston';

const createLogger = () => {
  const isContainer = process.env.NEXT_PUBLIC_CONTAINER_MODE === 'true';
  
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
        const logEntry = {
          timestamp,
          level,
          message,
          service: 'member-portal',
          container: isContainer,
          ...meta
        };
        return JSON.stringify(logEntry);
      })
    ),
    transports: [
      new winston.transports.Console(),
      ...(isContainer ? [
        new winston.transports.File({ 
          filename: '/app/logs/error.log', 
          level: 'error' 
        }),
        new winston.transports.File({ 
          filename: '/app/logs/combined.log' 
        })
      ] : [])
    ]
  });
};

export const logger = createLogger();
```

This containerization documentation ensures the Member Portal integrates seamlessly with the Docker-based development environment while maintaining performance, security, and monitoring capabilities. 