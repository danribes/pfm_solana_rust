import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AppLayout from "../../src/components/Layout/AppLayout";
import { useVoting } from "../../src/hooks";
import { VotingQuestion } from "../../src/types/campaign";

const VotingQuestionDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { campaign, userStatus, selectedVotes, setVote, submitVotes, isSubmitting, canSubmit, validationErrors } = useVoting(id as string);
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
      // Find question in campaign data
      if (campaign && campaign.questions) {
        const existingQuestion = campaign.questions.find(q => q.id === questionId);
        if (existingQuestion) {
          setQuestion(existingQuestion);
        } else {
          setError("Voting question not found");
        }
      } else {
        setError("Campaign data not available");
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

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{question.title}</h2>
          <p className="text-gray-600 mb-4">{question.description}</p>
          
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Options:</h3>
            {question.options.map((option, index) => (
              <div key={option.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{option.text}</span>
                  <span className="text-sm text-gray-500">
                    {option.voteCount} votes ({option.percentage?.toFixed(1) || 0}%)
                  </span>
                </div>
                {option.description && (
                  <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default VotingQuestionDetailPage;
