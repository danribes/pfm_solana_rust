import React, { useState } from "react";
import { VotingQuestion, VotingStatus, VoteType, CastVoteDTO } from "../../types/voting";
import { useVoting } from "../../hooks/useVoting";
import { useWallet } from "../../hooks/useWallet";
import VoteOptions from "./VoteOptions";
import VotingProgress from "./VotingProgress";

interface VotingQuestionCardProps {
  question: VotingQuestion;
  variant?: "card" | "full";
  onVoteSuccess?: (questionId: string) => void;
  className?: string;
  showResults?: boolean;
}

const VotingQuestionCard: React.FC<VotingQuestionCardProps> = ({
  question,
  variant = "card",
  onVoteSuccess,
  className = "",
  showResults = false
}) => {
  const { actions } = useVoting();
  const { connected } = useWallet();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isVoting, setIsVoting] = useState(false);

  const isActive = question.status === VotingStatus.ACTIVE;
  const canVote = isActive && !question.userHasVoted && connected;

  const handleOptionSelect = (optionId: string) => {
    if (question.type === VoteType.SINGLE_CHOICE) {
      setSelectedOptions([optionId]);
    } else {
      setSelectedOptions(prev => 
        prev.includes(optionId)
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    }
  };

  const handleVoteSubmit = async () => {
    if (selectedOptions.length === 0 || !canVote) return;

    try {
      setIsVoting(true);
      const voteData: CastVoteDTO = {
        questionId: question.id,
        optionIds: selectedOptions,
        metadata: {}
      };
      await actions.castVote(voteData);
      if (onVoteSuccess) onVoteSuccess(question.id);
      setSelectedOptions([]);
    } catch (error) {
      console.error("Failed to cast vote:", error);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{question.title}</h3>
        <p className="text-gray-600 text-sm mb-3">{question.description}</p>
        <div className="text-sm text-gray-500">
          {question.totalVotes} votes • {question.status}
        </div>
      </div>

      <div className="p-6">
        {canVote && !showResults ? (
          <div className="space-y-4">
            <VoteOptions
              question={question}
              selectedOptions={selectedOptions}
              onOptionSelect={handleOptionSelect}
              disabled={isVoting}
            />
            <button
              onClick={handleVoteSubmit}
              disabled={selectedOptions.length === 0 || isVoting}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isVoting ? "Submitting..." : "Submit Vote"}
            </button>
          </div>
        ) : (
          <VotingProgress 
            question={question}
            showPercentages={true}
            showCounts={true}
            animated={true}
          />
        )}
      </div>
    </div>
  );
};

export default VotingQuestionCard;
