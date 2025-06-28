import React from 'react';
import { useCommunityAnalytics } from '../../../hooks/useAnalytics';
import { AnalyticsFilters } from '../../../types/analytics';
import LoadingSpinner from '../../UI/LoadingSpinner';
import LineChart from '../Charts/LineChart';
import BarChart from '../Charts/BarChart';

interface CommunityAnalyticsDashboardProps {
  filters: AnalyticsFilters;
  compact?: boolean;
}

const CommunityAnalyticsDashboard: React.FC<CommunityAnalyticsDashboardProps> = ({ 
  filters, 
  compact = false 
}) => {
  const { data, loading, error } = useCommunityAnalytics(filters);

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
        Error loading community analytics: {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8 text-gray-500">
        No community analytics data available
      </div>
    );
  }

  const growthChartData = {
    labels: data.growth_over_time?.map(point => 
      new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ) || [],
    datasets: [
      {
        label: 'Total Communities',
        data: data.growth_over_time?.map(point => point.total_communities) || [],
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Active Communities',
        data: data.growth_over_time?.map(point => point.active_communities) || [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const engagementChartData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [
      {
        label: 'Communities by Engagement',
        data: [
          data.engagement_distribution?.high || 0,
          data.engagement_distribution?.medium || 0,
          data.engagement_distribution?.low || 0,
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
      },
    ],
  };

  if (compact) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{data.total_communities}</div>
            <div className="text-sm text-gray-500">Total Communities</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{data.active_communities}</div>
            <div className="text-sm text-gray-500">Active Communities</div>
          </div>
        </div>
        <div className="h-48">
          <LineChart data={growthChartData} height={192} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-900">{data.total_communities}</div>
          <div className="text-sm text-gray-500">Total Communities</div>
          <div className="text-xs text-green-600 mt-1">+{data.growth_rate}% this period</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{data.active_communities}</div>
          <div className="text-sm text-gray-500">Active Communities</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{data.total_members}</div>
          <div className="text-sm text-gray-500">Total Members</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">{data.avg_community_size}</div>
          <div className="text-sm text-gray-500">Avg Community Size</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Community Growth</h3>
          <LineChart data={growthChartData} height={300} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Engagement Distribution</h3>
          <BarChart data={engagementChartData} height={300} />
        </div>
      </div>
    </div>
  );
};

export default CommunityAnalyticsDashboard; 