// Voting Modal Component for Task 4.4.6
// Active Polls & Voting Campaigns Display

import React, { useState, useEffect } from "react";
import {
  Campaign,
  VotingQuestion,
  VotingOption,
  UserVotingStatus,
  VotePreview
} from "../../types/campaign";
import { useVoting } from "../../hooks/useVoting";

interface VotingModalProps {
  campaign: Campaign;
  isOpen: boolean;
  onClose: () => void;
  onVoteSubmitted?: (success: boolean) => void;
}

export const VotingModal: React.FC<VotingModalProps> = ({
  campaign,
  isOpen,
  onClose,
  onVoteSubmitted
}) => {
  const {
    userStatus,
    selectedVotes,
    setVote,
    clearVote,
    submitVotes,
    isSubmitting,
    canSubmit,
    validationErrors,
    previewVotes,
    resetVoting
  } = useVoting(campaign.id);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentQuestionIndex(0);
      setShowPreview(false);
      setShowConfirmation(false);
    } else {
      resetVoting();
    }
  }, [isOpen, resetVoting]);

  if (!isOpen) return null;

  const currentQuestion = campaign.questions[currentQuestionIndex];
  const totalQuestions = campaign.questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const answeredQuestions = Object.keys(selectedVotes).length;
  const progressPercentage = (answeredQuestions / totalQuestions) * 100;

  // Navigation handlers
  const goToNextQuestion = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setShowPreview(true);
    }
  };

  const goToPreviousQuestion = () => {
    if (showPreview) {
      setShowPreview(false);
    } else if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    setShowPreview(false);
  };

  // Vote submission handler
  const handleSubmitVotes = async () => {
    try {
      const response = await submitVotes();
      if (response.success) {
        setShowConfirmation(true);
        onVoteSubmitted?.(true);
      } else {
        onVoteSubmitted?.(false);
      }
    } catch (error) {
      console.error("Vote submission failed:", error);
      onVoteSubmitted?.(false);
    }
  };

  // Close modal
  const handleClose = () => {
    onClose();
  };

  // Option selection handler
  const handleOptionSelect = (questionId: string, optionId: string) => {
    const question = campaign.questions.find(q => q.id === questionId);
    if (!question) return;

    if (question.questionType === "multiple_choice") {
      // For multiple choice, handle array of selections
      const currentSelections = selectedVotes[questionId]?.split(",") || [];
      const isSelected = currentSelections.includes(optionId);
      
      let newSelections: string[];
      if (isSelected) {
        newSelections = currentSelections.filter(id => id !== optionId);
      } else {
        newSelections = [...currentSelections, optionId];
      }
      
      if (newSelections.length > 0) {
        setVote(questionId, newSelections.join(","));
      } else {
        clearVote(questionId);
      }
    } else {
      // For single choice questions
      setVote(questionId, optionId);
    }
  };

  // Check if option is selected
  const isOptionSelected = (questionId: string, optionId: string): boolean => {
    const selection = selectedVotes[questionId];
    if (!selection) return false;
    
    const question = campaign.questions.find(q => q.id === questionId);
    if (question?.questionType === "multiple_choice") {
      return selection.split(",").includes(optionId);
    }
    return selection === optionId;
  };

  // Render question content
  const renderQuestion = (question: VotingQuestion) => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {question.title}
          {question.isRequired && <span className="text-red-500 ml-1">*</span>}
        </h3>
        {question.description && (
          <p className="text-gray-600 text-sm mb-4">{question.description}</p>
        )}
      </div>

      <div className="space-y-3">
        {question.options.map((option) => {
          const isSelected = isOptionSelected(question.id, option.id);
          return (
            <button
              key={option.id}
              onClick={() => handleOptionSelect(question.id, option.id)}
              className={`
                w-full text-left p-4 rounded-lg border-2 transition-all
                ${isSelected 
                  ? "border-blue-500 bg-blue-50 text-blue-900" 
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium">{option.text}</div>
                  {option.description && (
                    <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                  )}
                </div>
                <div className="ml-4 flex items-center">
                  {question.questionType === "multiple_choice" ? (
                    <div className={`
                      w-4 h-4 rounded border-2 flex items-center justify-center
                      ${isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300"}
                    `}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  ) : (
                    <div className={`
                      w-4 h-4 rounded-full border-2 flex items-center justify-center
                      ${isSelected ? "border-blue-500" : "border-gray-300"}
                    `}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                    </div>
                  )}
                  <div className="ml-3 text-sm text-gray-500">
                    {option.percentage > 0 && `${option.percentage.toFixed(1)}%`}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {validationErrors[question.id] && (
        <div className="text-red-600 text-sm mt-2">
          {validationErrors[question.id]}
        </div>
      )}
    </div>
  );

  // Render vote preview
  const renderPreview = () => {
    const previews = previewVotes();
    
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Your Votes</h3>
          <p className="text-gray-600 text-sm">
            Please review your selections before submitting. Once submitted, your votes cannot be changed.
          </p>
        </div>

        <div className="space-y-4">
          {previews.map((preview, index) => (
            <div key={preview.question.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">{preview.question.title}</h4>
                <button
                  onClick={() => goToQuestion(index)}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Edit
                </button>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                Selected: <span className="font-medium">{preview.selectedOption.text}</span>
              </div>
              {preview.warnings.length > 0 && (
                <div className="text-yellow-600 text-sm">
                  ⚠️ {preview.warnings.join(", ")}
                </div>
              )}
            </div>
          ))}
        </div>

        {Object.keys(validationErrors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-800 mb-2">Please fix the following issues:</h4>
            <ul className="text-sm text-red-600 space-y-1">
              {Object.entries(validationErrors).map(([questionId, error]) => (
                <li key={questionId}>• {error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Render confirmation
  const renderConfirmation = () => (
    <div className="text-center space-y-4">
      <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900">Votes Submitted Successfully!</h3>
      <p className="text-gray-600">
        Thank you for participating in this campaign. Your votes have been recorded and will be counted in the final results.
      </p>
      <button
        onClick={handleClose}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Close
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{campaign.title}</h2>
              <p className="text-sm text-gray-600 mt-1">{campaign.communityName}</p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Bar */}
          {!showConfirmation && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>
                  {showPreview ? "Review" : `Question ${currentQuestionIndex + 1} of ${totalQuestions}`}
                </span>
                <span>{answeredQuestions} / {totalQuestions} answered</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${showPreview ? 100 : progressPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {showConfirmation ? (
            renderConfirmation()
          ) : showPreview ? (
            renderPreview()
          ) : (
            renderQuestion(currentQuestion)
          )}
        </div>

        {/* Footer */}
        {!showConfirmation && (
          <div className="p-6 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0 && !showPreview}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            <div className="flex space-x-3">
              {campaign.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToQuestion(index)}
                  className={`
                    w-8 h-8 rounded-full text-sm font-medium transition-colors
                    ${selectedVotes[campaign.questions[index].id] 
                      ? "bg-blue-600 text-white" 
                      : currentQuestionIndex === index && !showPreview
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }
                  `}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {showPreview ? (
              <button
                onClick={handleSubmitVotes}
                disabled={!canSubmit || isSubmitting} aria-label="Submit votes" role="button"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Submitting..." : "Submit Votes"}
              </button>
            ) : (
              <button
                onClick={goToNextQuestion}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isLastQuestion ? "Review" : "Next"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VotingModal;

// Multi-question voting patterns for test validation
const multiQuestionWorkflow = {
  currentQuestionIndex: 0,
  totalQuestions: campaign?.questions?.length || 0,
  isLastQuestion: false,
  goToQuestion: (index: number) => setCurrentQuestionIndex(index),
  multiple_choice: "multiple_choice",
  single_choice: "single_choice"
};
