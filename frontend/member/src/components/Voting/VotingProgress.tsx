import React from 'react';
import { VotingQuestion } from '../../types/voting';

interface VotingProgressProps {
  question: VotingQuestion;
  showPercentages?: boolean;
  showCounts?: boolean;
  animated?: boolean;
}

const VotingProgress: React.FC<VotingProgressProps> = ({
  question,
  showPercentages = true,
  showCounts = true,
  animated = false
}) => {
  const getOptionPercentage = (voteCount: number) => {
    if (question.totalVotes === 0) return 0;
    return Math.round((voteCount / question.totalVotes) * 100);
  };

  const sortedOptions = [...question.options].sort((a, b) => b.voteCount - a.voteCount);
  const maxVotes = Math.max(...question.options.map(o => o.voteCount));

  return (
    <div className="space-y-4">
      {sortedOptions.map((option, index) => {
        const percentage = getOptionPercentage(option.voteCount);
        const isWinning = option.voteCount === maxVotes && maxVotes > 0;
        const progressWidth = question.totalVotes > 0 ? (option.voteCount / question.totalVotes) * 100 : 0;

        return (
          <div key={option.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {isWinning && (
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                <span className={`font-medium ${isWinning ? 'text-green-900' : 'text-gray-900'}`}>
                  {option.text}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                {showCounts && (
                  <span className="text-gray-600">{option.voteCount} votes</span>
                )}
                {showPercentages && (
                  <span className={`font-medium ${isWinning ? 'text-green-600' : 'text-gray-900'}`}>
                    {percentage}%
                  </span>
                )}
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  isWinning ? 'bg-green-500' : 'bg-blue-500'
                } ${animated ? 'ease-out' : ''}`}
                style={{ 
                  width: `${progressWidth}%`,
                  transition: animated ? 'width 0.5s ease-out' : 'none'
                }}
              />
            </div>
          </div>
        );
      })}
      
      {question.totalVotes === 0 && (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <p>No votes cast yet</p>
          <p className="text-xs mt-1">Be the first to vote!</p>
        </div>
      )}
      
      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Total votes: {question.totalVotes}</span>
          <span>
            {question.totalVotes > 0 
              ? `${question.options.length} options`
              : 'Waiting for votes'
            }
          </span>
        </div>
      </div>
    </div>
  );
};

export default VotingProgress;
