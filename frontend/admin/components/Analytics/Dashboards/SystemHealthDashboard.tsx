import React from 'react';
import { useSystemAnalytics } from '../../../hooks/useAnalytics';
import { AnalyticsFilters } from '../../../types/analytics';
import LoadingSpinner from '../../UI/LoadingSpinner';
import LineChart from '../Charts/LineChart';

interface SystemHealthDashboardProps {
  filters: AnalyticsFilters;
  compact?: boolean;
}

const SystemHealthDashboard: React.FC<SystemHealthDashboardProps> = ({ 
  filters, 
  compact = false 
}) => {
  const { data, loading, error } = useSystemAnalytics();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Error loading system health: {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8 text-gray-500">
        No system health data available
      </div>
    );
  }

  const performanceChartData = {
    labels: data.performance_over_time?.map(point => 
      new Date(point.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    ) || [],
    datasets: [
      {
        label: 'Response Time (ms)',
        data: data.performance_over_time?.map(point => point.response_time) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: 'CPU Usage (%)',
        data: data.performance_over_time?.map(point => point.cpu_usage) || [],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'warning': return '⚠️';
      case 'critical': return '❌';
      default: return '⚪';
    }
  };

  if (compact) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{data.uptime}%</div>
            <div className="text-sm text-gray-500">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{data.avg_response_time}ms</div>
            <div className="text-sm text-gray-500">Response Time</div>
          </div>
        </div>
        <div className="space-y-2">
          {data.service_status?.slice(0, 3).map((service) => (
            <div key={service.service} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{service.service}</span>
              <span className={`text-sm ${getStatusColor(service.status)}`}>
                {getStatusIcon(service.status)} {service.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{data.uptime}%</div>
          <div className="text-sm text-gray-500">System Uptime</div>
          <div className="text-xs text-gray-400 mt-1">Last 30 days</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{data.avg_response_time}ms</div>
          <div className="text-sm text-gray-500">Avg Response Time</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">{data.total_requests}</div>
          <div className="text-sm text-gray-500">Total Requests</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-red-600">{data.error_rate}%</div>
          <div className="text-sm text-gray-500">Error Rate</div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
        <LineChart 
          data={performanceChartData} 
          height={300}
          options={{
            scales: {
              y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                  display: true,
                  text: 'Response Time (ms)',
                },
              },
              y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                  display: true,
                  text: 'CPU Usage (%)',
                },
                grid: {
                  drawOnChartArea: false,
                },
              },
            },
          }}
        />
      </div>

      {/* Service Status */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Service Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.service_status?.map((service) => (
            <div key={service.service} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">{service.service}</h4>
                <span className={`font-medium ${getStatusColor(service.status)}`}>
                  {getStatusIcon(service.status)} {service.status}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Last check: {new Date(service.last_check).toLocaleTimeString()}
              </div>
              {service.message && (
                <div className="mt-1 text-xs text-gray-400">{service.message}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemHealthDashboard; 