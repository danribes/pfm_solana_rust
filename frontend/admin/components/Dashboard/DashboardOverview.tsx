import React from 'react';
import MetricsCards from './MetricsCards';
import ActivityFeed from './ActivityFeed';
import QuickActions from './QuickActions';
import SystemStatus from './SystemStatus';

interface DashboardOverviewProps {
  className?: string;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ className = '' }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Metrics Cards */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Key Metrics</h2>
        <p className="mt-1 text-sm text-gray-600">
          Overview of community activity and system performance
        </p>
        <div className="mt-4">
          <MetricsCards />
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <QuickActions />
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>
      </div>

      {/* System Status */}
      <div>
        <SystemStatus />
      </div>
    </div>
  );
};

export default DashboardOverview; 