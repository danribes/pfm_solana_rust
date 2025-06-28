import React from 'react';
import {
  UsersIcon,
  BuildingOfficeIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  description,
  color = 'blue'
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  const changeColorClasses = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`inline-flex items-center justify-center p-3 rounded-md ${colorClasses[color]}`}>
              <Icon className="h-6 w-6" aria-hidden="true" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      {(change || description) && (
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            {change && (
              <div className={`flex items-center ${changeColorClasses[change.trend]}`}>
                {change.trend === 'up' && <ArrowUpIcon className="h-4 w-4 mr-1" />}
                {change.trend === 'down' && <ArrowDownIcon className="h-4 w-4 mr-1" />}
                <span className="font-medium">{change.value}</span>
              </div>
            )}
            {description && (
              <div className="text-gray-500 mt-1">
                {description}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const MetricsCards: React.FC = () => {
  // Mock data - this would come from your API
  const metrics = [
    {
      title: 'Total Communities',
      value: 12,
      change: { value: '+2 this month', trend: 'up' as const },
      icon: BuildingOfficeIcon,
      description: 'Active community groups',
      color: 'blue' as const
    },
    {
      title: 'Active Members',
      value: '1,247',
      change: { value: '+48 this week', trend: 'up' as const },
      icon: UsersIcon,
      description: 'Verified community members',
      color: 'green' as const
    },
    {
      title: 'Pending Approvals',
      value: 23,
      change: { value: '-5 from yesterday', trend: 'down' as const },
      icon: ClockIcon,
      description: 'Awaiting admin review',
      color: 'yellow' as const
    },
    {
      title: 'System Health',
      value: '99.8%',
      change: { value: 'All systems operational', trend: 'neutral' as const },
      icon: CheckCircleIcon,
      description: 'Uptime this month',
      color: 'green' as const
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <MetricCard
          key={index}
          title={metric.title}
          value={metric.value}
          change={metric.change}
          icon={metric.icon}
          description={metric.description}
          color={metric.color}
        />
      ))}
    </div>
  );
};

export default MetricsCards; 