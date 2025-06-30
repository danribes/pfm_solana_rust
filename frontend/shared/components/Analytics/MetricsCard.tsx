// Metrics Card Component for Analytics
import React from 'react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
    period: string;
  };
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'gray';
}

export const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  color = 'blue'
}) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    green: 'text-green-600 bg-green-50 border-green-200',
    purple: 'text-purple-600 bg-purple-50 border-purple-200',
    red: 'text-red-600 bg-red-50 border-red-200',
    yellow: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    gray: 'text-gray-600 bg-gray-50 border-gray-200'
  };

  const trendClasses = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };

  const trendIcons = {
    up: '↗️',
    down: '↘️',
    neutral: '→'
  };

  return (
    <div className={`rounded-lg border p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            {icon && <div className="mr-2">{icon}</div>}
            <h3 className="text-sm font-medium text-gray-900">{title}</h3>
          </div>
          
          <div className="mt-2">
            <div className={`text-3xl font-bold ${colorClasses[color].split(' ')[0]}`}>
              {value}
            </div>
            {subtitle && (
              <div className="text-sm text-gray-500 mt-1">{subtitle}</div>
            )}
          </div>
          
          {trend && (
            <div className={`flex items-center mt-2 text-xs ${trendClasses[trend.direction]}`}>
              <span className="mr-1">{trendIcons[trend.direction]}</span>
              <span>{trend.value} from {trend.period}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
