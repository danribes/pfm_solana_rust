import React from 'react';
import { useUserAnalytics } from '../../../hooks/useAnalytics';
import { AnalyticsFilters } from '../../../types/analytics';
import LoadingSpinner from '../../UI/LoadingSpinner';
import LineChart from '../Charts/LineChart';
import BarChart from '../Charts/BarChart';

interface UserAnalyticsDashboardProps {
  filters: AnalyticsFilters;
  compact?: boolean;
}

const UserAnalyticsDashboard: React.FC<UserAnalyticsDashboardProps> = ({ 
  filters, 
  compact = false 
}) => {
  const { data, loading, error } = useUserAnalytics(filters);

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
        Error loading user analytics: {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8 text-gray-500">
        No user analytics data available
      </div>
    );
  }

  const activityChartData = {
    labels: data.activity_over_time?.map(point => 
      new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ) || [],
    datasets: [
      {
        label: 'Daily Active Users',
        data: data.activity_over_time?.map(point => point.daily_active) || [],
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
      },
      {
        label: 'New Registrations',
        data: data.activity_over_time?.map(point => point.new_registrations) || [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const engagementChartData = {
    labels: ['High', 'Medium', 'Low', 'Inactive'],
    datasets: [
      {
        label: 'Users by Engagement Level',
        data: [
          data.engagement_levels?.high || 0,
          data.engagement_levels?.medium || 0,
          data.engagement_levels?.low || 0,
          data.engagement_levels?.inactive || 0,
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(245, 101, 101, 0.8)',
          'rgba(156, 163, 175, 0.8)',
        ],
      },
    ],
  };

  if (compact) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{data.total_users}</div>
            <div className="text-sm text-gray-500">Total Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{data.daily_active_users}</div>
            <div className="text-sm text-gray-500">Daily Active</div>
          </div>
        </div>
        <div className="h-48">
          <LineChart data={activityChartData} height={192} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-900">{data.total_users}</div>
          <div className="text-sm text-gray-500">Total Users</div>
          <div className="text-xs text-green-600 mt-1">+{data.growth_rate}% this period</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">{data.daily_active_users}</div>
          <div className="text-sm text-gray-500">Daily Active Users</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{data.retention_rate}%</div>
          <div className="text-sm text-gray-500">30-Day Retention</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{data.new_users_today}</div>
          <div className="text-sm text-gray-500">New Today</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Activity Trends</h3>
          <LineChart data={activityChartData} height={300} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Engagement Levels</h3>
          <BarChart data={engagementChartData} height={300} />
        </div>
      </div>
    </div>
  );
};

export default UserAnalyticsDashboard; 