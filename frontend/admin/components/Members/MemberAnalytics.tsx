import React from 'react';
import { MemberAnalytics as MemberAnalyticsType } from '../../types/member';
import { useMemberAnalytics } from '../../hooks/useMembers';
import LoadingSpinner from '../UI/LoadingSpinner';
import { generateAnalyticsSummary } from '../../utils/member';

interface MemberAnalyticsProps {
  communityId: string;
}

const MemberAnalytics: React.FC<MemberAnalyticsProps> = ({ communityId }) => {
  const { analytics, loading, error, refreshAnalytics } = useMemberAnalytics(communityId);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="text-red-400">⚠️</div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">No analytics data available</div>
      </div>
    );
  }

  const summary = generateAnalyticsSummary(analytics);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              Member Analytics
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Overview of community membership metrics and trends
            </p>
          </div>
          <button
            onClick={refreshAnalytics}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Members"
          value={summary.totalMembers}
          icon="👥"
          color="blue"
        />
        <MetricCard
          title="Active Members"
          value={summary.totalActive}
          subtitle={`${summary.activePercentage}% of total`}
          icon="✅"
          color="green"
        />
        <MetricCard
          title="Pending Applications"
          value={summary.pendingApplications}
          icon="⏳"
          color="yellow"
        />
        <MetricCard
          title="New Today"
          value={summary.newApplicationsToday}
          icon="🆕"
          color="purple"
        />
      </div>

      {/* Activity Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            <ActivityItem
              label="Approved Today"
              value={summary.approvedToday}
              icon="✅"
              color="green"
            />
            <ActivityItem
              label="Rejected Today"
              value={summary.rejectedToday}
              icon="❌"
              color="red"
            />
            <ActivityItem
              label="New Applications"
              value={summary.newApplicationsToday}
              icon="📝"
              color="blue"
            />
          </div>
        </div>

        {/* Role Distribution */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Role Distribution
          </h3>
          <div className="space-y-3">
            <RoleDistributionBar
              label="Admins"
              count={summary.roleDistribution.admin}
              total={summary.totalMembers}
              color="purple"
              icon="👑"
            />
            <RoleDistributionBar
              label="Moderators"
              count={summary.roleDistribution.moderator}
              total={summary.totalMembers}
              color="blue"
              icon="🛡️"
            />
            <RoleDistributionBar
              label="Members"
              count={summary.roleDistribution.member}
              total={summary.totalMembers}
              color="gray"
              icon="👤"
            />
          </div>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Engagement Levels
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <EngagementCard
            level="High Engagement"
            count={summary.engagementDistribution.high_engagement}
            percentage={Math.round((summary.engagementDistribution.high_engagement / summary.totalMembers) * 100)}
            color="green"
            icon="🔥"
          />
          <EngagementCard
            level="Medium Engagement"
            count={summary.engagementDistribution.medium_engagement}
            percentage={Math.round((summary.engagementDistribution.medium_engagement / summary.totalMembers) * 100)}
            color="yellow"
            icon="⚡"
          />
          <EngagementCard
            level="Low Engagement"
            count={summary.engagementDistribution.low_engagement}
            percentage={Math.round((summary.engagementDistribution.low_engagement / summary.totalMembers) * 100)}
            color="red"
            icon="💤"
          />
        </div>
      </div>
    </div>
  );
};

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600'
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <span className="text-xl">{icon}</span>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value.toLocaleString()}</p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Activity Item Component
interface ActivityItemProps {
  label: string;
  value: number;
  icon: string;
  color: 'green' | 'red' | 'blue';
}

const ActivityItem: React.FC<ActivityItemProps> = ({ label, value, icon, color }) => {
  const colorClasses = {
    green: 'text-green-600',
    red: 'text-red-600',
    blue: 'text-blue-600'
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <span className="text-lg mr-2">{icon}</span>
        <span className="text-sm text-gray-700">{label}</span>
      </div>
      <span className={`text-sm font-medium ${colorClasses[color]}`}>
        {value}
      </span>
    </div>
  );
};

// Role Distribution Bar Component
interface RoleDistributionBarProps {
  label: string;
  count: number;
  total: number;
  color: 'purple' | 'blue' | 'gray';
  icon: string;
}

const RoleDistributionBar: React.FC<RoleDistributionBarProps> = ({ 
  label, 
  count, 
  total, 
  color, 
  icon 
}) => {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  
  const colorClasses = {
    purple: 'bg-purple-500',
    blue: 'bg-blue-500',
    gray: 'bg-gray-500'
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-lg mr-2">{icon}</span>
          <span className="text-sm text-gray-700">{label}</span>
        </div>
        <span className="text-sm font-medium text-gray-900">
          {count} ({percentage}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Engagement Card Component
interface EngagementCardProps {
  level: string;
  count: number;
  percentage: number;
  color: 'green' | 'yellow' | 'red';
  icon: string;
}

const EngagementCard: React.FC<EngagementCardProps> = ({ 
  level, 
  count, 
  percentage, 
  color, 
  icon 
}) => {
  const colorClasses = {
    green: 'border-green-200 bg-green-50',
    yellow: 'border-yellow-200 bg-yellow-50',
    red: 'border-red-200 bg-red-50'
  };

  const textColorClasses = {
    green: 'text-green-800',
    yellow: 'text-yellow-800',
    red: 'text-red-800'
  };

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-2xl mr-2">{icon}</span>
          <div>
            <p className={`text-sm font-medium ${textColorClasses[color]}`}>
              {level}
            </p>
            <p className={`text-2xl font-bold ${textColorClasses[color]}`}>
              {count}
            </p>
          </div>
        </div>
        <div className={`text-right ${textColorClasses[color]}`}>
          <p className="text-lg font-bold">{percentage}%</p>
          <p className="text-xs">of members</p>
        </div>
      </div>
    </div>
  );
};

export default MemberAnalytics; 