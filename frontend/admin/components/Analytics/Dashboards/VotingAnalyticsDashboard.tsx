import React from 'react';
import { useVotingAnalytics } from '../../../hooks/useAnalytics';
import { AnalyticsFilters } from '../../../types/analytics';
import LoadingSpinner from '../../UI/LoadingSpinner';
import LineChart from '../Charts/LineChart';
import PieChart from '../Charts/PieChart';

interface VotingAnalyticsDashboardProps {
  filters: AnalyticsFilters;
  compact?: boolean;
}

const VotingAnalyticsDashboard: React.FC<VotingAnalyticsDashboardProps> = ({ 
  filters, 
  compact = false 
}) => {
  const { data, loading, error } = useVotingAnalytics(filters);

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
        Error loading voting analytics: {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8 text-gray-500">
        No voting analytics data available
      </div>
    );
  }

  const participationChartData = {
    labels: data.participation_over_time?.map(point => 
      new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ) || [],
    datasets: [
      {
        label: 'Participation Rate (%)',
        data: data.participation_over_time?.map(point => point.participation_rate) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const proposalStatusData = {
    labels: ['Passed', 'Failed', 'Active'],
    datasets: [
      {
        data: [
          data.proposal_status_breakdown?.passed || 0,
          data.proposal_status_breakdown?.failed || 0,
          data.proposal_status_breakdown?.active || 0,
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(251, 191, 36, 0.8)',
        ],
      },
    ],
  };

  if (compact) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{data.total_proposals}</div>
            <div className="text-sm text-gray-500">Total Proposals</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{data.avg_participation}%</div>
            <div className="text-sm text-gray-500">Avg Participation</div>
          </div>
        </div>
        <div className="h-48">
          <LineChart data={participationChartData} height={192} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-900">{data.total_proposals}</div>
          <div className="text-sm text-gray-500">Total Proposals</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{data.avg_participation}%</div>
          <div className="text-sm text-gray-500">Avg Participation</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{data.proposal_status_breakdown?.passed}</div>
          <div className="text-sm text-gray-500">Passed Proposals</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">{data.total_votes}</div>
          <div className="text-sm text-gray-500">Total Votes Cast</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Participation Trends</h3>
          <LineChart data={participationChartData} height={300} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Proposal Status</h3>
          <PieChart data={proposalStatusData} height={300} />
        </div>
      </div>
    </div>
  );
};

export default VotingAnalyticsDashboard; 