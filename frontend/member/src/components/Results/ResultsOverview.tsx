// Results Overview Component
// Task 4.4.4 - Overview component showing key metrics and statistics

import React from 'react';
import { VotingResult } from '../../types/results';

interface ResultsOverviewProps {
  results: VotingResult[];
  loading?: boolean;
}

const ResultsOverview: React.FC<ResultsOverviewProps> = ({ results, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const totalQuestions = results.length;
  const totalVotes = results.reduce((sum, result) => sum + result.totalVotes, 0);
  const averageParticipation = totalQuestions > 0
    ? results.reduce((sum, result) => sum + result.participationRate, 0) / totalQuestions
    : 0;
  const completedQuestions = results.filter(r => r.status === 'completed').length;
  const activeQuestions = results.filter(r => r.status === 'active').length;

  const stats = [
    {
      title: 'Total Questions',
      value: totalQuestions,
      icon: '📊',
      color: 'bg-blue-500',
      change: activeQuestions > 0 ? `${activeQuestions} active` : 'All completed'
    },
    {
      title: 'Total Votes',
      value: totalVotes.toLocaleString(),
      icon: '🗳️',
      color: 'bg-green-500',
      change: totalQuestions > 0 ? `${Math.round(totalVotes / totalQuestions)} avg` : '0 avg'
    },
    {
      title: 'Participation Rate',
      value: `${averageParticipation.toFixed(1)}%`,
      icon: '👥',
      color: 'bg-purple-500',
      change: averageParticipation > 75 ? 'High engagement' : averageParticipation > 50 ? 'Good engagement' : 'Low engagement'
    },
    {
      title: 'Completed',
      value: completedQuestions,
      icon: '✅',
      color: 'bg-yellow-500',
      change: `${((completedQuestions / Math.max(totalQuestions, 1)) * 100).toFixed(0)}% complete`
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Results Overview</h2>
        <p className="text-gray-600 mt-2">
          Summary of voting results and community engagement metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                {stat.icon}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500">{stat.change}</p>
            </div>
          </div>
        ))}
      </div>

      {totalQuestions === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Yet</h3>
          <p className="text-gray-600">
            Results will appear here once voting questions are completed.
          </p>
        </div>
      )}
    </div>
  );
};

export default ResultsOverview;
