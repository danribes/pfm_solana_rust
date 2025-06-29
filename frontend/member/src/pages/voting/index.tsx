import React, { useState, useEffect } from "react";
import AppLayout from "../../components/Layout/AppLayout";
import { useVoting } from "../../hooks/useVoting";
import { useWallet } from "../../hooks/useWallet";
import VotingQuestionCard from "../../components/Voting/VotingQuestionCard";
import { VotingFilters, VotingStatus, VoteType } from "../../types/voting";

const VotingPage: React.FC = () => {
  const { state, actions } = useVoting();
  const { connected } = useWallet();
  const [activeFilters, setActiveFilters] = useState<VotingFilters>({
    status: [VotingStatus.ACTIVE]
  });

  useEffect(() => {
    actions.loadQuestions(activeFilters);
  }, []);

  const handleVoteSuccess = (questionId: string) => {
    actions.loadQuestions(activeFilters);
  };

  const filteredQuestions = state.questions.filter(q => 
    q.status === VotingStatus.ACTIVE
  );

  return (
    <AppLayout
      title="Active Voting"
      description="Participate in active community voting and governance decisions"
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Active Voting</h1>
          <p className="text-gray-600">
            Participate in community decisions and shape the future of governance
          </p>
        </div>

        {!connected && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-blue-900 mb-1">Connect Your Wallet</h3>
            <p className="text-blue-700">
              Connect your Solana wallet to participate in voting.
            </p>
          </div>
        )}

        <div className="space-y-6">
          {state.loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading voting questions...</span>
            </div>
          )}

          {filteredQuestions.length === 0 && !state.loading && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Voting Questions</h3>
              <p className="text-gray-600">
                There are currently no active voting questions.
              </p>
            </div>
          )}

          {filteredQuestions.map((question) => (
            <VotingQuestionCard
              key={question.id}
              question={question}
              variant="card"
              onVoteSuccess={handleVoteSuccess}
            />
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default VotingPage;
