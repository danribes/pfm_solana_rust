import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';

interface FeedbackData {
  // User Information
  userId?: string;
  userType: 'new_user' | 'returning_user' | 'beta_tester' | 'internal_tester';
  testingSession: string;
  
  // Task Evaluation
  taskCompleted: string;
  taskCompletionTime: number; // in seconds
  taskDifficulty: 1 | 2 | 3 | 4 | 5;
  taskSuccess: boolean;
  
  // Usability Ratings
  usabilityRating: 1 | 2 | 3 | 4 | 5;
  clarityRating: 1 | 2 | 3 | 4 | 5;
  performanceRating: 1 | 2 | 3 | 4 | 5;
  visualDesignRating: 1 | 2 | 3 | 4 | 5;
  functionalityRating: 1 | 2 | 3 | 4 | 5;
  overallSatisfaction: 1 | 2 | 3 | 4 | 5;
  
  // Net Promoter Score
  recommendationScore: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  
  // Open-ended Feedback
  mostConfusing: string;
  mostLiked: string;
  missingFeatures: string;
  platformComparison: string;
  additionalComments: string;
  
  // Technical Information
  browser: string;
  device: string;
  screenResolution: string;
  
  // Bug Reports
  encountereBugs: boolean;
  bugDetails?: string;
  bugSeverity?: 'low' | 'medium' | 'high' | 'critical';
}

interface UserFeedbackFormProps {
  taskName: string;
  onSubmit: (feedback: FeedbackData) => Promise<void>;
  onCancel?: () => void;
  sessionId?: string;
}

const UserFeedbackForm: React.FC<UserFeedbackFormProps> = ({
  taskName,
  onSubmit,
  onCancel,
  sessionId
}) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(Date.now());
  
  const [feedback, setFeedback] = useState<Partial<FeedbackData>>({
    taskCompleted: taskName,
    testingSession: sessionId || `session-${Date.now()}`,
    taskSuccess: false,
    encountereBugs: false,
    userType: 'beta_tester',
    browser: navigator.userAgent,
    device: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
    screenResolution: `${window.screen.width}x${window.screen.height}`,
  });

  const updateFeedback = useCallback((field: keyof FeedbackData, value: any) => {
    setFeedback(prev => ({ ...prev, [field]: value }));
  }, []);

  const calculateTaskTime = () => {
    return Math.round((Date.now() - startTime) / 1000);
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;
    
    setIsSubmitting(true);
    try {
      const completeFeedback: FeedbackData = {
        ...feedback as FeedbackData,
        taskCompletionTime: calculateTaskTime(),
      };
      
      await onSubmit(completeFeedback);
      alert('Thank you for your feedback! Your input helps us improve the platform.');
      
      if (onCancel) onCancel();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    const required = [
      'userType', 'taskSuccess', 'taskDifficulty', 'usabilityRating',
      'clarityRating', 'performanceRating', 'visualDesignRating',
      'functionalityRating', 'overallSatisfaction', 'recommendationScore'
    ];
    
    return required.every(field => feedback[field as keyof FeedbackData] !== undefined);
  };

  const RatingScale: React.FC<{
    label: string;
    value: number | undefined;
    onChange: (value: number) => void;
    lowLabel: string;
    highLabel: string;
    scale?: number;
  }> = ({ label, value, onChange, lowLabel, highLabel, scale = 5 }) => (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500">{lowLabel}</span>
        <span className="text-xs text-gray-500">{highLabel}</span>
      </div>
      <div className="flex gap-2">
        {Array.from({ length: scale + (scale === 10 ? 1 : 0) }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i + (scale === 10 ? 0 : 1))}
            className={`w-8 h-8 rounded-full border-2 text-sm font-medium transition-colors ${
              value === i + (scale === 10 ? 0 : 1)
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-gray-300 hover:border-blue-300'
            }`}
          >
            {i + (scale === 10 ? 0 : 1)}
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Task Information</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          User Type
        </label>
        <select
          value={feedback.userType || ''}
          onChange={(e) => updateFeedback('userType', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="new_user">New User</option>
          <option value="returning_user">Returning User</option>
          <option value="beta_tester">Beta Tester</option>
          <option value="internal_tester">Internal Tester</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Did you successfully complete the task "{taskName}"?
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              checked={feedback.taskSuccess === true}
              onChange={() => updateFeedback('taskSuccess', true)}
              className="mr-2"
            />
            Yes, I completed it successfully
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={feedback.taskSuccess === false}
              onChange={() => updateFeedback('taskSuccess', false)}
              className="mr-2"
            />
            No, I encountered issues or couldn't complete it
          </label>
        </div>
      </div>

      <RatingScale
        label="How difficult was this task to complete?"
        value={feedback.taskDifficulty}
        onChange={(value) => updateFeedback('taskDifficulty', value)}
        lowLabel="Very Easy"
        highLabel="Very Difficult"
      />
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Usability Evaluation</h3>
      
      <RatingScale
        label="Overall Usability - How easy was the interface to use?"
        value={feedback.usabilityRating}
        onChange={(value) => updateFeedback('usabilityRating', value)}
        lowLabel="Very Difficult"
        highLabel="Very Easy"
      />

      <RatingScale
        label="Clarity - How clear were the instructions and interface elements?"
        value={feedback.clarityRating}
        onChange={(value) => updateFeedback('clarityRating', value)}
        lowLabel="Very Confusing"
        highLabel="Very Clear"
      />

      <RatingScale
        label="Performance - How responsive was the application?"
        value={feedback.performanceRating}
        onChange={(value) => updateFeedback('performanceRating', value)}
        lowLabel="Very Slow"
        highLabel="Very Fast"
      />

      <RatingScale
        label="Visual Design - How appealing and professional is the interface?"
        value={feedback.visualDesignRating}
        onChange={(value) => updateFeedback('visualDesignRating', value)}
        lowLabel="Poor Design"
        highLabel="Excellent Design"
      />

      <RatingScale
        label="Functionality - Did all features work as expected?"
        value={feedback.functionalityRating}
        onChange={(value) => updateFeedback('functionalityRating', value)}
        lowLabel="Many Issues"
        highLabel="Worked Perfectly"
      />
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Overall Satisfaction & Recommendations</h3>
      
      <RatingScale
        label="Overall Satisfaction - How satisfied are you with this platform?"
        value={feedback.overallSatisfaction}
        onChange={(value) => updateFeedback('overallSatisfaction', value)}
        lowLabel="Very Dissatisfied"
        highLabel="Very Satisfied"
      />

      <RatingScale
        label="How likely are you to recommend this platform to others?"
        value={feedback.recommendationScore}
        onChange={(value) => updateFeedback('recommendationScore', value)}
        lowLabel="Not at all likely"
        highLabel="Extremely likely"
        scale={10}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Did you encounter any bugs or technical issues?
        </label>
        <div className="flex gap-4 mb-4">
          <label className="flex items-center">
            <input
              type="radio"
              checked={feedback.encountereBugs === false}
              onChange={() => updateFeedback('encountereBugs', false)}
              className="mr-2"
            />
            No issues
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={feedback.encountereBugs === true}
              onChange={() => updateFeedback('encountereBugs', true)}
              className="mr-2"
            />
            Yes, I encountered issues
          </label>
        </div>

        {feedback.encountereBugs && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bug Severity
              </label>
              <select
                value={feedback.bugSeverity || ''}
                onChange={(e) => updateFeedback('bugSeverity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select severity</option>
                <option value="low">Low - Minor cosmetic issues</option>
                <option value="medium">Medium - Functionality affected but workaround available</option>
                <option value="high">High - Major functionality broken</option>
                <option value="critical">Critical - Application unusable</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Please describe the bug(s) you encountered
              </label>
              <textarea
                value={feedback.bugDetails || ''}
                onChange={(e) => updateFeedback('bugDetails', e.target.value)}
                placeholder="Describe what happened, what you expected, and steps to reproduce..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Additional Feedback</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What was the most confusing part of your experience?
        </label>
        <textarea
          value={feedback.mostConfusing || ''}
          onChange={(e) => updateFeedback('mostConfusing', e.target.value)}
          placeholder="Describe any confusing elements or interactions..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What did you like most about the platform?
        </label>
        <textarea
          value={feedback.mostLiked || ''}
          onChange={(e) => updateFeedback('mostLiked', e.target.value)}
          placeholder="Share what you found most appealing or useful..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What features are missing or could be improved?
        </label>
        <textarea
          value={feedback.missingFeatures || ''}
          onChange={(e) => updateFeedback('missingFeatures', e.target.value)}
          placeholder="Suggest improvements or new features..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How does this compare to similar platforms you've used?
        </label>
        <textarea
          value={feedback.platformComparison || ''}
          onChange={(e) => updateFeedback('platformComparison', e.target.value)}
          placeholder="Compare with other community management or voting platforms..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Any additional comments or suggestions?
        </label>
        <textarea
          value={feedback.additionalComments || ''}
          onChange={(e) => updateFeedback('additionalComments', e.target.value)}
          placeholder="Share any other thoughts or feedback..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );

  const totalSteps = 4;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">User Feedback</h2>
        <p className="text-gray-600 mt-1">
          Help us improve by sharing your experience with "{taskName}"
        </p>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="min-h-96">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>

        <div className="flex gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          
          {currentStep < totalSteps ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!isFormValid() || isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          )}
        </div>
      </div>

      {/* Form Validation Message */}
      {currentStep === totalSteps && !isFormValid() && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            Please complete all required ratings before submitting.
          </p>
        </div>
      )}
    </div>
  );
};

export default UserFeedbackForm;