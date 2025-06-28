import React, { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  responseTime?: number;
  lastCheck?: string;
  url?: string;
  description: string;
}

interface SystemStatusProps {
  className?: string;
}

const SystemStatus: React.FC<SystemStatusProps> = ({ className = '' }) => {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'Backend API',
      status: 'unknown',
      url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
      description: 'Main application backend service'
    },
    {
      name: 'Solana RPC',
      status: 'unknown',
      url: process.env.NEXT_PUBLIC_SOLANA_RPC || 'http://localhost:8899',
      description: 'Solana blockchain connection'
    },
    {
      name: 'PostgreSQL Database',
      status: 'unknown',
      description: 'Primary data storage'
    },
    {
      name: 'Redis Cache',
      status: 'unknown',
      description: 'Session and cache storage'
    }
  ]);

  const [lastUpdate, setLastUpdate] = useState<string>('Never');

  // Check service health
  const checkServiceHealth = async (service: ServiceStatus): Promise<ServiceStatus> => {
    try {
      const startTime = Date.now();
      
      if (service.name === 'Backend API') {
        const response = await fetch(`${service.url}/health`, {
          method: 'GET',
          timeout: 5000
        } as any);
        
        const responseTime = Date.now() - startTime;
        
        if (response.ok) {
          const data = await response.json();
          return {
            ...service,
            status: data.status === 'healthy' ? 'healthy' : 'warning',
            responseTime,
            lastCheck: new Date().toLocaleTimeString()
          };
        } else {
          return {
            ...service,
            status: 'error',
            responseTime,
            lastCheck: new Date().toLocaleTimeString()
          };
        }
      } else if (service.name === 'Solana RPC') {
        const response = await fetch(service.url!, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getHealth'
          }),
          timeout: 5000
        } as any);
        
        const responseTime = Date.now() - startTime;
        
        if (response.ok) {
          return {
            ...service,
            status: 'healthy',
            responseTime,
            lastCheck: new Date().toLocaleTimeString()
          };
        } else {
          return {
            ...service,
            status: 'error',
            responseTime,
            lastCheck: new Date().toLocaleTimeString()
          };
        }
      } else {
        // For database and Redis, we'll check via the backend API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/health`, {
          method: 'GET',
          timeout: 5000
        } as any);
        
        if (response.ok) {
          const data = await response.json();
          const serviceKey = service.name.toLowerCase().replace(' ', '');
          
          return {
            ...service,
            status: data[serviceKey]?.isHealthy ? 'healthy' : 'warning',
            responseTime: data[serviceKey]?.responseTime,
            lastCheck: new Date().toLocaleTimeString()
          };
        } else {
          return {
            ...service,
            status: 'error',
            lastCheck: new Date().toLocaleTimeString()
          };
        }
      }
    } catch (error) {
      return {
        ...service,
        status: 'error',
        lastCheck: new Date().toLocaleTimeString()
      };
    }
  };

  const checkAllServices = async () => {
    const updatedServices = await Promise.all(
      services.map(service => checkServiceHealth(service))
    );
    
    setServices(updatedServices);
    setLastUpdate(new Date().toLocaleTimeString());
  };

  useEffect(() => {
    // Initial check
    checkAllServices();
    
    // Check every 30 seconds
    const interval = setInterval(checkAllServices, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'healthy':
        return 'Healthy';
      case 'warning':
        return 'Warning';
      case 'error':
        return 'Error';
      default:
        return 'Checking...';
    }
  };

  const getStatusColor = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  const getOverallStatus = () => {
    const healthyCount = services.filter(s => s.status === 'healthy').length;
    const errorCount = services.filter(s => s.status === 'error').length;
    
    if (errorCount > 0) return 'error';
    if (healthyCount === services.length) return 'healthy';
    return 'warning';
  };

  const overallStatus = getOverallStatus();

  return (
    <div className={`bg-white shadow rounded-lg ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">System Status</h3>
            <p className="mt-1 text-sm text-gray-600">
              Real-time monitoring of system components
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(overallStatus)}
            <span className={`text-sm font-medium ${getStatusColor(overallStatus)}`}>
              {getStatusText(overallStatus)}
            </span>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {services.map((service, index) => (
          <div key={index} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(service.status)}
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {service.name}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {service.description}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-sm font-medium ${getStatusColor(service.status)}`}>
                  {getStatusText(service.status)}
                </div>
                {service.responseTime && (
                  <div className="text-xs text-gray-500">
                    {service.responseTime}ms
                  </div>
                )}
                {service.lastCheck && (
                  <div className="text-xs text-gray-400">
                    Last check: {service.lastCheck}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 py-3 bg-gray-50 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          Last updated: {lastUpdate}
        </div>
        <button
          onClick={checkAllServices}
          className="text-xs text-indigo-600 hover:text-indigo-900 font-medium"
        >
          Refresh status
        </button>
      </div>
    </div>
  );
};

export default SystemStatus; 