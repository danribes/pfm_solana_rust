import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { AppLayout } from "../src/components/Layout";
import { useVoting } from "../src/hooks";
import { VotingQuestionCard } from "../src/components/Voting";
import { VotingQuestion, VotingStatus } from "../src/types";

const VotingQuestionDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { state, actions } = useVoting();
  const [question, setQuestion] = useState<VotingQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadQuestion(id);
    }
  }, [id]);

  const loadQuestion = async (questionId: string) => {
    try {
      setLoading(true);
      setError(null);
      // Find question in existing state or load individually
      const existingQuestion = state.questions.find(q => q.id === questionId);
      if (existingQuestion) {
        setQuestion(existingQuestion);
      } else {
        // Load individual question - this would need to be implemented in the voting service
        // For now, show error if not found in existing questions
        setError("Voting question not found");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load voting question");
    } finally {
      setLoading(false);
    }
  };

  const handleVoteSuccess = () => {
    if (id && typeof id === 'string') {
      loadQuestion(id);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </AppLayout>
    );
  }

  if (!question) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <div className="text-gray-500">Voting question not found.</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 mb-4"
          >
            ← Back to Voting
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Voting Question</h1>
        </div>

        <VotingQuestionCard
          question={question}
          onVoteSuccess={handleVoteSuccess}
        />
      </div>
    </AppLayout>
  );
};

export default VotingQuestionDetailPage;
