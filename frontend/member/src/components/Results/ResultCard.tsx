// Result Card Component
// Task 4.4.4 - Individual result card component with chart visualization

import React, { useState } from 'react';
import { VotingResult } from '../../types/results';
import ChartWrapper from '../Charts/ChartWrapper';

interface ResultCardProps {
  result: VotingResult;
  onSelect?: (result: VotingResult) => void;
  showChart?: boolean;
  compact?: boolean;
}

const ResultCard: React.FC<ResultCardProps> = ({
  result,
  onSelect,
  showChart = true,
  compact = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(result);
    }
    if (!compact) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md ${
        onSelect ? 'cursor-pointer' : ''
      } ${compact ? 'p-4' : 'p-6'}`}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className={`font-semibold text-gray-900 ${compact ? 'text-base' : 'text-lg'}`}>
            {result.question.title}
          </h3>
          {!compact && (
            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
              {result.question.description}
            </p>
          )}
        </div>
        <div className="ml-4 flex flex-col items-end space-y-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(result.status)}`}>
            {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
          </span>
          {result.winningOption && (
            <div className="text-xs text-gray-500 text-right">
              <span className="font-medium">Winner:</span>
              <br />
              {result.winningOption}
            </div>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className={`font-bold text-gray-900 ${compact ? 'text-lg' : 'text-xl'}`}>
            {result.totalVotes}
          </div>
          <div className="text-xs text-gray-500">Total Votes</div>
        </div>
        <div className="text-center">
          <div className={`font-bold text-gray-900 ${compact ? 'text-lg' : 'text-xl'}`}>
            {result.participationRate.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">Participation</div>
        </div>
        <div className="text-center">
          <div className={`font-bold text-gray-900 ${compact ? 'text-lg' : 'text-xl'}`}>
            {result.results.length}
          </div>
          <div className="text-xs text-gray-500">Options</div>
        </div>
      </div>

      {/* Chart */}
      {showChart && !compact && (
        <div className="mb-4">
          <ChartWrapper
            data={result.chartData}
            type="bar"
            height={200}
            showLegend={false}
            showTitle={false}
          />
        </div>
      )}

      {/* Results Preview */}
      {compact && (
        <div className="space-y-2">
          {result.results.slice(0, 3).map((option, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="text-gray-700 truncate flex-1 mr-2">
                {option.optionText}
              </span>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">{option.voteCount}</span>
                <span className="text-gray-500">({option.percentage.toFixed(1)}%)</span>
                {option.isWinner && <span className="text-green-600">👑</span>}
              </div>
            </div>
          ))}
          {result.results.length > 3 && (
            <div className="text-xs text-gray-500 text-center">
              +{result.results.length - 3} more options
            </div>
          )}
        </div>
      )}

      {/* Expanded Details */}
      {isExpanded && !compact && (
        <div className="border-t border-gray-200 pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Question Details</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div><span className="font-medium">Created:</span> {formatDate(result.question.createdAt)}</div>
                <div><span className="font-medium">Deadline:</span> {formatDate(result.question.deadline)}</div>
                {result.endDate && (
                  <div><span className="font-medium">Ended:</span> {formatDate(result.endDate)}</div>
                )}
                <div><span className="font-medium">Type:</span> {result.question.type.replace('_', ' ')}</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Detailed Results</h4>
              <div className="space-y-2">
                {result.results.map((option, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 flex-1 mr-2">{option.optionText}</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{option.voteCount}</span>
                      <span className="text-gray-500">({option.percentage.toFixed(1)}%)</span>
                      {option.isWinner && <span className="text-green-600 text-lg">👑</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 mt-4 pt-4 border-t border-gray-100">
        <span>Updated {formatDate(result.lastUpdated)}</span>
        {!compact && (
          <button 
            className="text-blue-600 hover:text-blue-700 font-medium"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ResultCard;
