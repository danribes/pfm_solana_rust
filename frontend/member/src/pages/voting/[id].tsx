import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AppLayout from "../../components/Layout/AppLayout";
import { useVoting } from "../../hooks/useVoting";
import VotingQuestionCard from "../../components/Voting/VotingQuestionCard";
import { VotingQuestion, VotingStatus } from "../../types/voting";

const VotingQuestionDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { state, actions } = useVoting();
  const [question, setQuestion] = useState<VotingQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && typeof id === "string") {
      loadQuestionDetails(id);
    }
  }, [id]);

  const loadQuestionDetails = async (questionId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await actions.loadQuestion(questionId);
      
      const loadedQuestion = state.activeQuestion || state.questions.find(q => q.id === questionId);
      
      if (loadedQuestion) {
        setQuestion(loadedQuestion);
      } else {
        setError("Voting question not found");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load voting question";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVoteSuccess = (questionId: string) => {
    if (questionId === id) {
      loadQuestionDetails(questionId);
    }
  };

  const handleBackClick = () => {
    router.back();
  };

  if (loading) {
    return (
      <AppLayout title="Loading..." description="Loading voting question details">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading voting question...</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !question) {
    return (
      <AppLayout title="Question Not Found" description="The requested voting question could not be found">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Question Not Found</h1>
            <p className="text-gray-600 mb-6">
              {error || "The voting question you are looking for does not exist."}
            </p>
            <div className="space-x-4">
              <button
                onClick={handleBackClick}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Go Back
              </button>
              <a
                href="/voting"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                View Active Votes
              </a>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const isExpired = new Date() > new Date(question.deadline);

  return (
    <AppLayout
      title={question.title}
      description={question.description}
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={handleBackClick}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            Back to Voting
          </button>
        </div>

        <VotingQuestionCard
          question={question}
          variant="full"
          onVoteSuccess={handleVoteSuccess}
          showResults={question.userHasVoted || isExpired || question.status !== VotingStatus.ACTIVE}
        />

        <div className="mt-6 flex justify-center space-x-4">
          <a
            href="/voting"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            View All Active Votes
          </a>
          <a
            href="/voting/history"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            View Voting History
          </a>
        </div>
      </div>
    </AppLayout>
  );
};

export default VotingQuestionDetailPage;
