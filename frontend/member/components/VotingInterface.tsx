import React, { useState, useEffect } from 'react';

interface VotingOption {
  id: string;
  text: string;
  description?: string;
  image?: string;
}

interface Poll {
  id: string;
  title: string;
  description: string;
  type: 'single_choice' | 'multiple_choice' | 'ranked_choice' | 'approval';
  options: VotingOption[];
  endsAt: string;
  allowChangeVote: boolean;
  requireReason: boolean;
  settings: {
    allowAbstain: boolean;
    maxSelections?: number;
    minSelections?: number;
  };
}

interface VotingInterfaceProps {
  poll: Poll;
  existingVote?: {
    selections: Array<{
      optionId: string;
      rank?: number;
      approved?: boolean;
    }>;
    reason?: string;
  };
  onSubmitVote: (vote: any) => Promise<void>;
  onCancel: () => void;
}

const VotingInterface: React.FC<VotingInterfaceProps> = ({
  poll,
  existingVote,
  onSubmitVote,
  onCancel
}) => {
  const [selections, setSelections] = useState<Record<string, any>>({});
  const [reason, setReason] = useState('');
  const [confidence, setConfidence] = useState(50);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (existingVote) {
      const existingSelections: Record<string, any> = {};
      existingVote.selections.forEach(selection => {
        if (poll.type === 'ranked_choice') {
          existingSelections[selection.optionId] = selection.rank || 0;
        } else if (poll.type === 'approval') {
          existingSelections[selection.optionId] = selection.approved || false;
        } else {
          existingSelections[selection.optionId] = true;
        }
      });
      setSelections(existingSelections);
      setReason(existingVote.reason || '');
    }
  }, [existingVote, poll.type]);

  const handleSelectionChange = (optionId: string, value: any) => {
    setSelections(prev => {
      const newSelections = { ...prev };
      
      if (poll.type === 'single_choice') {
        // Clear all other selections for single choice
        Object.keys(newSelections).forEach(key => {
          newSelections[key] = key === optionId ? value : false;
        });
      } else if (poll.type === 'multiple_choice') {
        newSelections[optionId] = value;
      } else if (poll.type === 'ranked_choice') {
        newSelections[optionId] = value;
      } else if (poll.type === 'approval') {
        newSelections[optionId] = value;
      }
      
      return newSelections;
    });
    
    // Clear any validation errors
    if (errors.selections) {
      setErrors(prev => ({ ...prev, selections: '' }));
    }
  };

  const validateVote = (): boolean => {
    const newErrors: Record<string, string> = {};
    const selectedOptions = Object.entries(selections).filter(([_, value]) => 
      poll.type === 'ranked_choice' ? value > 0 : value
    );

    // Check minimum selections
    if (selectedOptions.length === 0 && !poll.settings.allowAbstain) {
      newErrors.selections = 'You must select at least one option';
    }

    // Check maximum selections for multiple choice
    if (poll.type === 'multiple_choice' && poll.settings.maxSelections) {
      if (selectedOptions.length > poll.settings.maxSelections) {
        newErrors.selections = `You can select at most ${poll.settings.maxSelections} options`;
      }
    }

    // Check minimum selections for multiple choice
    if (poll.type === 'multiple_choice' && poll.settings.minSelections) {
      if (selectedOptions.length < poll.settings.minSelections) {
        newErrors.selections = `You must select at least ${poll.settings.minSelections} options`;
      }
    }

    // Validate ranked choice
    if (poll.type === 'ranked_choice') {
      const ranks = selectedOptions.map(([_, rank]) => rank as number);
      const uniqueRanks = new Set(ranks);
      if (ranks.length !== uniqueRanks.size) {
        newErrors.selections = 'Each option must have a unique rank';
      }
      if (ranks.some(rank => rank < 1 || rank > poll.options.length)) {
        newErrors.selections = 'Ranks must be between 1 and ' + poll.options.length;
      }
    }

    // Check required reason
    if (poll.requireReason && !reason.trim()) {
      newErrors.reason = 'Please provide a reason for your vote';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateVote()) return;

    setIsSubmitting(true);
    try {
      const voteData = {
        pollId: poll.id,
        selections: Object.entries(selections)
          .filter(([_, value]) => poll.type === 'ranked_choice' ? value > 0 : value)
          .map(([optionId, value]) => ({
            optionId,
            ...(poll.type === 'ranked_choice' && { rank: value }),
            ...(poll.type === 'approval' && { approved: value })
          })),
        reason: reason.trim() || undefined,
        confidence,
        isPublic: !isPrivate
      };

      await onSubmitVote(voteData);
    } catch (error) {
      console.error('Error submitting vote:', error);
      setErrors({ general: 'Failed to submit vote. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const end = new Date(poll.endsAt);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Voting has ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  const renderSingleChoice = () => (
    <div className="space-y-3">
      {poll.options.map((option) => (
        <label
          key={option.id}
          className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
            selections[option.id] ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}
        >
          <input
            type="radio"
            name="poll-option"
            checked={!!selections[option.id]}
            onChange={(e) => handleSelectionChange(option.id, e.target.checked)}
            className="mr-3 w-4 h-4 text-blue-600"
          />
          <div className="flex-1">
            <div className="font-medium text-gray-900">{option.text}</div>
            {option.description && (
              <div className="text-sm text-gray-600 mt-1">{option.description}</div>
            )}
          </div>
        </label>
      ))}
    </div>
  );

  const renderMultipleChoice = () => (
    <div className="space-y-3">
      {poll.options.map((option) => (
        <label
          key={option.id}
          className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
            selections[option.id] ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}
        >
          <input
            type="checkbox"
            checked={!!selections[option.id]}
            onChange={(e) => handleSelectionChange(option.id, e.target.checked)}
            className="mr-3 w-4 h-4 text-blue-600 rounded"
          />
          <div className="flex-1">
            <div className="font-medium text-gray-900">{option.text}</div>
            {option.description && (
              <div className="text-sm text-gray-600 mt-1">{option.description}</div>
            )}
          </div>
        </label>
      ))}
    </div>
  );

  const renderRankedChoice = () => (
    <div className="space-y-3">
      <div className="text-sm text-gray-600 mb-4">
        Rank your choices from 1 (most preferred) to {poll.options.length} (least preferred). Leave blank to not rank.
      </div>
      {poll.options.map((option) => (
        <div
          key={option.id}
          className={`flex items-center p-4 border rounded-lg transition-colors ${
            selections[option.id] > 0 ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center mr-3">
            <label className="text-sm font-medium text-gray-700 mr-2">Rank:</label>
            <select
              value={selections[option.id] || 0}
              onChange={(e) => handleSelectionChange(option.id, parseInt(e.target.value))}
              className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>-</option>
              {Array.from({ length: poll.options.length }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900">{option.text}</div>
            {option.description && (
              <div className="text-sm text-gray-600 mt-1">{option.description}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderApprovalVoting = () => (
    <div className="space-y-3">
      <div className="text-sm text-gray-600 mb-4">
        Select all options you approve of. You can choose as many as you like.
      </div>
      {poll.options.map((option) => (
        <label
          key={option.id}
          className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
            selections[option.id] ? 'border-green-500 bg-green-50' : 'border-gray-200'
          }`}
        >
          <div className={`mr-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
            selections[option.id] ? 'border-green-500 bg-green-500' : 'border-gray-300'
          }`}>
            {selections[option.id] && (
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900">{option.text}</div>
            {option.description && (
              <div className="text-sm text-gray-600 mt-1">{option.description}</div>
            )}
          </div>
          <input
            type="checkbox"
            checked={!!selections[option.id]}
            onChange={(e) => handleSelectionChange(option.id, e.target.checked)}
            className="sr-only"
          />
        </label>
      ))}
    </div>
  );

  const renderVotingInterface = () => {
    switch (poll.type) {
      case 'single_choice':
        return renderSingleChoice();
      case 'multiple_choice':
        return renderMultipleChoice();
      case 'ranked_choice':
        return renderRankedChoice();
      case 'approval':
        return renderApprovalVoting();
      default:
        return renderSingleChoice();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Cast Your Vote</h1>
          </div>
          
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">{getTimeRemaining()}</div>
            <div className="text-xs text-gray-500">
              Ends {new Date(poll.endsAt).toLocaleDateString()} at {new Date(poll.endsAt).toLocaleTimeString()}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">{poll.title}</h2>
          <p className="text-gray-700 mb-4">{poll.description}</p>
          
          <div className="flex items-center space-x-4 text-sm">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
              {poll.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
            <span className="text-gray-600">{poll.options.length} options</span>
            {existingVote && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                Previously Voted
              </span>
            )}
          </div>
        </div>
      </div>

      {errors.general && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{errors.general}</p>
        </div>
      )}

      {/* Voting Options */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Your Choice(s)</h3>
        
        {renderVotingInterface()}
        
        {errors.selections && (
          <p className="text-red-500 text-sm mt-3">{errors.selections}</p>
        )}
      </div>

      {/* Optional Reason */}
      {poll.requireReason && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Reason for Your Vote {poll.requireReason && <span className="text-red-500">*</span>}
          </h3>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please explain your reasoning..."
            rows={4}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.reason ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.reason && (
            <p className="text-red-500 text-sm mt-1">{errors.reason}</p>
          )}
          <div className="text-sm text-gray-500 mt-1">
            {reason.length}/500 characters
          </div>
        </div>
      )}

      {/* Vote Settings */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Vote Settings</h3>
        
        <div className="space-y-4">
          {/* Confidence Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confidence Level: {confidence}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={confidence}
              onChange={(e) => setConfidence(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Not confident</span>
              <span>Very confident</span>
            </div>
          </div>

          {/* Privacy Setting */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPrivate"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="mr-2 w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="isPrivate" className="text-sm text-gray-700">
              Make my vote anonymous (others won't see how I voted)
            </label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {existingVote && poll.allowChangeVote && (
            <span>You can change your vote until the poll ends.</span>
          )}
          {existingVote && !poll.allowChangeVote && (
            <span className="text-orange-600">⚠️ Vote changes are not allowed for this poll.</span>
          )}
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : existingVote ? 'Update Vote' : 'Submit Vote'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VotingInterface; 