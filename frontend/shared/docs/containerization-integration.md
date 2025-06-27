# Shared Design System Containerization Integration

## Overview
This document details how the PFM Shared Design System integrates with the containerized development environment, ensuring seamless component functionality across admin and member portals while maintaining optimal performance and monitoring capabilities.

## Container-Aware Component Architecture

### Service Discovery Integration
```typescript
// hooks/useContainerServices.ts
import { useState, useEffect } from 'react';

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'error' | 'unknown';
  latency: number;
  lastCheck: Date;
  endpoint: string;
}

export const useContainerServices = () => {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkServices = async () => {
      const serviceEndpoints = [
        { name: 'Backend API', endpoint: '/api/health' },
        { name: 'Solana RPC', endpoint: '/api/solana/health' },
        { name: 'Redis Cache', endpoint: '/api/cache/health' },
        { name: 'Database', endpoint: '/api/db/health' }
      ];

      const results = await Promise.allSettled(
        serviceEndpoints.map(async (service) => {
          const start = performance.now();
          try {
            const response = await fetch(service.endpoint, {
              timeout: 5000,
              headers: {
                'X-Container-Request': 'true',
                'X-Service-Consumer': 'shared-components'
              }
            });
            
            const latency = performance.now() - start;
            
            return {
              ...service,
              status: response.ok ? 'healthy' : 'error',
              latency: Math.round(latency),
              lastCheck: new Date()
            };
          } catch (error) {
            return {
              ...service,
              status: 'error',
              latency: -1,
              lastCheck: new Date()
            };
          }
        })
      );

      const serviceStatuses = results.map(result => 
        result.status === 'fulfilled' ? result.value : {
          name: 'Unknown Service',
          status: 'unknown',
          latency: -1,
          lastCheck: new Date(),
          endpoint: ''
        }
      );

      setServices(serviceStatuses);
      setIsLoading(false);
    };

    checkServices();
    const interval = setInterval(checkServices, 30000); // Check every 30s
    
    return () => clearInterval(interval);
  }, []);

  return { services, isLoading };
};
```

### Environment Detection
```typescript
// utils/containerEnvironment.ts
export interface ContainerEnvironment {
  isContainer: boolean;
  environment: 'development' | 'staging' | 'production';
  containerName: string;
  networkMode: 'host' | 'bridge' | 'overlay';
  serviceDiscovery: boolean;
}

export const detectContainerEnvironment = (): ContainerEnvironment => {
  const isContainer = process.env.NEXT_PUBLIC_CONTAINER_MODE === 'true' ||
                     typeof window !== 'undefined' && 
                     window.location.hostname.includes('container');

  const environment = process.env.NODE_ENV || 'development';
  const containerName = process.env.CONTAINER_NAME || 'unknown';
  const networkMode = process.env.DOCKER_NETWORK_MODE || 'bridge';
  const serviceDiscovery = process.env.SERVICE_DISCOVERY_ENABLED === 'true';

  return {
    isContainer,
    environment: environment as 'development' | 'staging' | 'production',
    containerName,
    networkMode: networkMode as 'host' | 'bridge' | 'overlay',
    serviceDiscovery
  };
};

// Context provider for container environment
export const ContainerEnvironmentContext = createContext<ContainerEnvironment>(
  detectContainerEnvironment()
);

export const useContainerEnvironment = () => {
  return useContext(ContainerEnvironmentContext);
};
```

## Container-Aware Components

### ServiceHealthIndicator Component
```typescript
// components/ServiceHealthIndicator.tsx
import React from 'react';
import { useContainerServices } from '../hooks/useContainerServices';
import { Card } from './Card';

interface ServiceHealthIndicatorProps {
  variant?: 'minimal' | 'compact' | 'full';
  showLatency?: boolean;
  autoRefresh?: boolean;
  className?: string;
}

export const ServiceHealthIndicator: React.FC<ServiceHealthIndicatorProps> = ({
  variant = 'compact',
  showLatency = true,
  autoRefresh = true,
  className = ''
}) => {
  const { services, isLoading } = useContainerServices();

  const getOverallStatus = () => {
    if (isLoading) return 'unknown';
    
    const healthyServices = services.filter(s => s.status === 'healthy').length;
    const totalServices = services.length;
    
    if (healthyServices === totalServices) return 'healthy';
    if (healthyServices === 0) return 'error';
    return 'degraded';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'degraded': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '🟢';
      case 'degraded': return '🟡';
      case 'error': return '🔴';
      default: return '⚪';
    }
  };

  if (variant === 'minimal') {
    const overallStatus = getOverallStatus();
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <span>{getStatusIcon(overallStatus)}</span>
        <span className="text-sm font-medium">
          {services.filter(s => s.status === 'healthy').length}/{services.length} Services
        </span>
      </div>
    );
  }

  if (variant === 'compact') {
    const overallStatus = getOverallStatus();
    const avgLatency = services.length > 0 
      ? Math.round(services.reduce((sum, s) => sum + s.latency, 0) / services.length)
      : 0;

    return (
      <Card className={`p-3 ${className}`} hover>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>{getStatusIcon(overallStatus)}</span>
            <span className="font-medium">
              {overallStatus === 'healthy' ? 'All Services Online' : 
               overallStatus === 'error' ? 'Service Issues' : 'Partial Issues'}
            </span>
          </div>
          {showLatency && avgLatency > 0 && (
            <span className="text-sm text-gray-500">
              {avgLatency}ms avg
            </span>
          )}
        </div>
      </Card>
    );
  }

  // Full variant
  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">🐳 Container Services</h3>
        <span className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </span>
      </div>
      
      <div className="space-y-3">
        {services.map((service) => (
          <div key={service.name} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
            <div className="flex items-center gap-3">
              <span>{getStatusIcon(service.status)}</span>
              <div>
                <span className="font-medium">{service.name}</span>
                <div className="text-sm text-gray-500 capitalize">
                  {service.status}
                </div>
              </div>
            </div>
            
            {showLatency && service.latency > 0 && (
              <div className="text-right">
                <span className="text-sm font-mono">
                  {service.latency}ms
                </span>
                <div className="text-xs text-gray-500">
                  {service.lastCheck.toLocaleTimeString()}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {autoRefresh && (
        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <span className="text-xs text-gray-500">
            Auto-refreshing every 30 seconds
          </span>
        </div>
      )}
    </Card>
  );
};
```

### ContainerEnvironmentBanner Component
```typescript
// components/ContainerEnvironmentBanner.tsx
import React from 'react';
import { useContainerEnvironment } from '../utils/containerEnvironment';

export const ContainerEnvironmentBanner: React.FC = () => {
  const environment = useContainerEnvironment();

  if (!environment.isContainer || environment.environment === 'production') {
    return null;
  }

  const getBannerConfig = () => {
    switch (environment.environment) {
      case 'development':
        return {
          color: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: '🧪',
          title: 'Development Environment',
          subtitle: `Container: ${environment.containerName} • Hot reload enabled • Debug mode`
        };
      case 'staging':
        return {
          color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          icon: '🚧',
          title: 'Staging Environment',
          subtitle: 'Test data only • Do not use real SOL or sensitive information'
        };
      default:
        return {
          color: 'bg-gray-50 border-gray-200 text-gray-800',
          icon: '📦',
          title: 'Container Mode',
          subtitle: `Running in ${environment.containerName}`
        };
    }
  };

  const config = getBannerConfig();

  return (
    <div className={`border-b ${config.color}`}>
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>{config.icon}</span>
            <span className="font-medium">{config.title}</span>
            <span className="text-sm opacity-75">|</span>
            <span className="text-sm">{config.subtitle}</span>
          </div>
          
          {environment.serviceDiscovery && (
            <div className="text-xs opacity-75">
              Service Discovery: Enabled
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
```

## API Client with Container Support

### Container-Aware API Configuration
```typescript
// utils/apiClient.ts
import { detectContainerEnvironment } from './containerEnvironment';

interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  headers: Record<string, string>;
}

export class ContainerAwareApiClient {
  private config: ApiClientConfig;
  private environment = detectContainerEnvironment();

  constructor() {
    this.config = this.getApiConfig();
  }

  private getApiConfig(): ApiClientConfig {
    const baseConfig = {
      timeout: 10000,
      retries: 3,
      retryDelay: 1000,
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Version': process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
        'X-Container-Mode': this.environment.isContainer ? 'true' : 'false',
        'X-Environment': this.environment.environment
      }
    };

    // Configure baseURL based on environment
    let baseURL: string;
    
    if (this.environment.isContainer) {
      // In container environment, use internal service names
      baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://backend:3000';
    } else {
      // In local development, use localhost
      baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    }

    return { ...baseConfig, baseURL };
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.baseURL}${endpoint}`;
    
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...this.config.headers,
        ...options.headers
      },
      signal: AbortSignal.timeout(this.config.timeout)
    };

    let lastError: Error;
    
    for (let attempt = 0; attempt < this.config.retries; attempt++) {
      try {
        const response = await fetch(url, requestOptions);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on client errors (4xx)
        if (error instanceof Error && error.message.includes('HTTP 4')) {
          throw error;
        }
        
        // Wait before retrying
        if (attempt < this.config.retries - 1) {
          await new Promise(resolve => 
            setTimeout(resolve, this.config.retryDelay * (attempt + 1))
          );
        }
      }
    }
    
    throw lastError!;
  }

  // Service health check
  async checkHealth(): Promise<boolean> {
    try {
      await this.request('/api/health');
      return true;
    } catch {
      return false;
    }
  }

  // Container-specific service discovery
  async discoverServices(): Promise<Record<string, string>> {
    if (!this.environment.serviceDiscovery) {
      return {};
    }

    try {
      return await this.request('/api/services/discover');
    } catch {
      return {};
    }
  }
}

export const apiClient = new ContainerAwareApiClient();
```

## Performance Monitoring for Containers

### Component Performance Hook
```typescript
// hooks/useComponentPerformance.ts
import { useEffect, useRef } from 'react';
import { useContainerEnvironment } from '../utils/containerEnvironment';

interface PerformanceMetrics {
  renderTime: number;
  componentName: string;
  props: Record<string, any>;
  timestamp: number;
}

export const useComponentPerformance = (
  componentName: string,
  props: Record<string, any> = {}
) => {
  const renderStartTime = useRef<number>();
  const environment = useContainerEnvironment();

  useEffect(() => {
    renderStartTime.current = performance.now();
  });

  useEffect(() => {
    if (renderStartTime.current) {
      const renderTime = performance.now() - renderStartTime.current;
      
      const metrics: PerformanceMetrics = {
        renderTime,
        componentName,
        props: Object.keys(props).reduce((acc, key) => {
          // Only include serializable props for logging
          const value = props[key];
          if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, any>),
        timestamp: Date.now()
      };

      // Log performance metrics in development
      if (environment.environment === 'development') {
        console.log(`[Performance] ${componentName}:`, metrics);
      }

      // Send metrics to monitoring service in container environment
      if (environment.isContainer && renderTime > 100) {
        // Only report slow renders (>100ms)
        reportPerformanceMetric(metrics);
      }
    }
  });
};

const reportPerformanceMetric = async (metrics: PerformanceMetrics) => {
  try {
    await fetch('/api/metrics/performance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metrics)
    });
  } catch (error) {
    // Silently fail - don't impact user experience
    console.warn('Failed to report performance metric:', error);
  }
};
```

## Container Resource Monitoring

### Resource Usage Component
```typescript
// components/ContainerResourceMonitor.tsx
import React, { useState, useEffect } from 'react';
import { Card } from './Card';

interface ResourceUsage {
  cpu: number;
  memory: number;
  network: {
    rx: number;
    tx: number;
  };
  disk: number;
}

export const ContainerResourceMonitor: React.FC = () => {
  const [resources, setResources] = useState<ResourceUsage | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchResourceUsage = async () => {
      try {
        const response = await fetch('/api/container/resources');
        const data = await response.json();
        setResources(data);
      } catch {
        // Silently fail if endpoint not available
      }
    };

    fetchResourceUsage();
    const interval = setInterval(fetchResourceUsage, 5000);
    
    return () => clearInterval(interval);
  }, []);

  if (!resources) return null;

  const getUsageColor = (usage: number) => {
    if (usage < 50) return 'text-green-600 bg-green-100';
    if (usage < 80) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="px-3 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
      >
        🐳 Resources {isVisible ? '▼' : '▲'}
      </button>
      
      {isVisible && (
        <Card className="mt-2 p-4 w-64">
          <h3 className="font-semibold mb-3">Container Resources</h3>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm">
                <span>CPU Usage</span>
                <span className={`px-2 py-1 rounded text-xs ${getUsageColor(resources.cpu)}`}>
                  {resources.cpu.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${resources.cpu}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm">
                <span>Memory Usage</span>
                <span className={`px-2 py-1 rounded text-xs ${getUsageColor(resources.memory)}`}>
                  {resources.memory.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${resources.memory}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm">
                <span>Disk Usage</span>
                <span className={`px-2 py-1 rounded text-xs ${getUsageColor(resources.disk)}`}>
                  {resources.disk.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${resources.disk}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Network RX</span>
                <span>{(resources.network.rx / 1024).toFixed(1)} KB/s</span>
              </div>
              <div className="flex justify-between">
                <span>Network TX</span>
                <span>{(resources.network.tx / 1024).toFixed(1)} KB/s</span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
```

## Development vs Production Configuration

### Environment-Specific Component Configuration
```typescript
// utils/componentConfig.ts
import { detectContainerEnvironment } from './containerEnvironment';

export interface ComponentConfig {
  enablePerformanceMonitoring: boolean;
  enableResourceMonitoring: boolean;
  enableDebugMode: boolean;
  enableServiceHealthIndicator: boolean;
  apiRetries: number;
  apiTimeout: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export const getComponentConfig = (): ComponentConfig => {
  const environment = detectContainerEnvironment();

  const baseConfig: ComponentConfig = {
    enablePerformanceMonitoring: false,
    enableResourceMonitoring: false,
    enableDebugMode: false,
    enableServiceHealthIndicator: true,
    apiRetries: 3,
    apiTimeout: 10000,
    logLevel: 'warn'
  };

  switch (environment.environment) {
    case 'development':
      return {
        ...baseConfig,
        enablePerformanceMonitoring: true,
        enableResourceMonitoring: environment.isContainer,
        enableDebugMode: true,
        logLevel: 'debug'
      };

    case 'staging':
      return {
        ...baseConfig,
        enablePerformanceMonitoring: true,
        logLevel: 'info'
      };

    case 'production':
      return {
        ...baseConfig,
        enableServiceHealthIndicator: false,
        logLevel: 'error'
      };

    default:
      return baseConfig;
  }
};

// Context provider for component configuration
export const ComponentConfigContext = createContext<ComponentConfig>(
  getComponentConfig()
);

export const useComponentConfig = () => {
  return useContext(ComponentConfigContext);
};
```

This containerization integration ensures that the shared design system components work seamlessly in the Docker-based development environment while providing robust monitoring, performance tracking, and environment-aware functionality. 