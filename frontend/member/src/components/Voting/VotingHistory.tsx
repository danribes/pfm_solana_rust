import React, { useState } from 'react';
import { useVotingHistory } from '../../hooks/useVotingHistory';
import { VotingFilters, VotingStatus } from '../../types/voting';

interface VotingHistoryProps {
  userId?: string;
  filters?: VotingFilters;
  pageSize?: number;
}

const VotingHistory: React.FC<VotingHistoryProps> = ({
  userId,
  filters: initialFilters = {},
  pageSize = 20
}) => {
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month' | 'year'>('all');
  
  const {
    votes,
    questions,
    loading,
    error,
    pagination,
    loadMore,
    updateFilters,
    getQuestionForVote,
    getParticipationStats
  } = useVotingHistory(initialFilters);

  const stats = getParticipationStats();

  const handleDateFilterChange = (period: 'all' | 'week' | 'month' | 'year') => {
    setDateFilter(period);
    
    if (period === 'all') {
      updateFilters({ dateRange: undefined });
      return;
    }

    const now = new Date();
    const start = new Date();
    
    switch (period) {
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    updateFilters({
      dateRange: { start, end: now }
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: VotingStatus) => {
    switch (status) {
      case VotingStatus.ACTIVE:
        return 'text-green-600 bg-green-100';
      case VotingStatus.CLOSED:
        return 'text-gray-600 bg-gray-100';
      case VotingStatus.FINALIZED:
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading && votes.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading voting history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-2">Failed to load voting history</div>
        <div className="text-sm text-gray-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Voting Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalVotes}</div>
            <div className="text-sm text-gray-500">Total Votes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.questionsWithVotes}</div>
            <div className="text-sm text-gray-500">Questions Voted</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.totalQuestions}</div>
            <div className="text-sm text-gray-500">Total Questions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.participationRate}%</div>
            <div className="text-sm text-gray-500">Participation</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Filter by:</span>
          <div className="flex space-x-2">
            {(['all', 'week', 'month', 'year'] as const).map((period) => (
              <button
                key={period}
                onClick={() => handleDateFilterChange(period)}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  dateFilter === period
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {period === 'all' ? 'All Time' : `Past ${period}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Voting History */}
      <div className="space-y-4">
        {votes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p className="text-gray-500">No voting history found</p>
            <p className="text-sm text-gray-400 mt-1">Start participating in community votes!</p>
          </div>
        ) : (
          <>
            {votes.map((vote) => {
              const question = getQuestionForVote(vote.id);
              if (!question) return null;

              return (
                <div key={vote.id} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(question.status)}`}>
                          {question.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          Voted on {formatDate(vote.timestamp)}
                        </span>
                      </div>
                      
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        {question.title}
                      </h4>
                      
                      <p className="text-gray-600 text-sm mb-3">
                        {question.description}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-700">Your vote(s):</div>
                        {vote.optionIds.map((optionId) => {
                          const option = question.options.find(o => o.id === optionId);
                          return option ? (
                            <div key={optionId} className="flex items-center text-sm">
                              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-gray-900">{option.text}</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="text-sm text-gray-500">Total votes</div>
                      <div className="text-lg font-semibold text-gray-900">{question.totalVotes}</div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Load More Button */}
            {pagination.hasMore && (
              <div className="text-center py-4">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VotingHistory;
