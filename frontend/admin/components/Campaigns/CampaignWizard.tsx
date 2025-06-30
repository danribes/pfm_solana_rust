// Campaign Creation Wizard Component
import React, { useState, useCallback } from 'react';
import { CampaignFormData, QuestionType, CampaignPriority } from '../../types/campaign';
import { useCampaigns } from '../../hooks/useCampaigns';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
}

interface CampaignWizardProps {
  onComplete: (campaign: any) => void;
  onCancel: () => void;
}

export const CampaignWizard: React.FC<CampaignWizardProps> = ({ onComplete, onCancel }) => {
  const { createCampaign, loading } = useCampaigns();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<CampaignFormData>({
    title: '',
    description: '',
    instructions: '',
    communityId: '',
    startDate: '',
    endDate: '',
    isAnonymous: false,
    allowMultipleChoices: false,
    minSelections: 1,
    maxSelections: 1,
    eligibilityCriteria: {
      membershipDuration: 0,
      roleRequirements: [],
      excludedMembers: [],
      minStakeAmount: 0,
      customRules: []
    },
    metadata: {
      tags: [],
      category: '',
      priority: CampaignPriority.MEDIUM,
      isPublic: true,
      allowComments: false,
      requireReason: false,
      customFields: {}
    },
    questions: []
  });

  const steps: WizardStep[] = [
    {
      id: 'basic',
      title: 'Basic Information',
      description: 'Campaign title, description, and community selection',
      isCompleted: !!(formData.title && formData.description && formData.communityId),
      isActive: currentStep === 0
    },
    {
      id: 'timing',
      title: 'Timing & Settings',
      description: 'Start date, end date, and voting parameters',
      isCompleted: !!(formData.startDate && formData.endDate),
      isActive: currentStep === 1
    },
    {
      id: 'questions',
      title: 'Questions & Options',
      description: 'Create voting questions and response options',
      isCompleted: formData.questions.length > 0,
      isActive: currentStep === 2
    },
    {
      id: 'eligibility',
      title: 'Eligibility & Access',
      description: 'Define who can participate in this campaign',
      isCompleted: true, // Optional step
      isActive: currentStep === 3
    },
    {
      id: 'review',
      title: 'Review & Publish',
      description: 'Review campaign details and publish',
      isCompleted: false,
      isActive: currentStep === 4
    }
  ];

  const updateFormData = useCallback((updates: Partial<CampaignFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const addQuestion = useCallback(() => {
    const newQuestion = {
      type: QuestionType.SINGLE_CHOICE,
      title: '',
      description: '',
      required: true,
      options: [
        { text: '', description: '' },
        { text: '', description: '' }
      ],
      settings: {
        randomizeOptions: false,
        allowOtherOption: false,
        requireExplanation: false
      }
    };
    
    updateFormData({
      questions: [...formData.questions, newQuestion]
    });
  }, [formData.questions, updateFormData]);

  const updateQuestion = useCallback((index: number, updates: any) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], ...updates };
    updateFormData({ questions: updatedQuestions });
  }, [formData.questions, updateFormData]);

  const removeQuestion = useCallback((index: number) => {
    const updatedQuestions = formData.questions.filter((_, i) => i !== index);
    updateFormData({ questions: updatedQuestions });
  }, [formData.questions, updateFormData]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const campaign = await createCampaign(formData);
      onComplete(campaign);
    } catch (error) {
      console.error('Failed to create campaign:', error);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter campaign title..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateFormData({ description: e.target.value })}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe what this campaign is about..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Community *
              </label>
              <select
                value={formData.communityId}
                onChange={(e) => updateFormData({ communityId: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a community...</option>
                <option value="community-1">Tech Community</option>
                <option value="community-2">Design Community</option>
                <option value="community-3">Business Community</option>
              </select>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => updateFormData({ startDate: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => updateFormData({ endDate: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isAnonymous}
                  onChange={(e) => updateFormData({ isAnonymous: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Anonymous voting</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.allowMultipleChoices}
                  onChange={(e) => updateFormData({ allowMultipleChoices: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Allow multiple choices</span>
              </label>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Questions</h3>
              <button
                onClick={addQuestion}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Question
              </button>
            </div>
            
            {formData.questions.map((question, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium">Question {index + 1}</h4>
                  <button
                    onClick={() => removeQuestion(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Type
                    </label>
                    <select
                      value={question.type}
                      onChange={(e) => updateQuestion(index, { type: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value={QuestionType.SINGLE_CHOICE}>Single Choice</option>
                      <option value={QuestionType.MULTIPLE_CHOICE}>Multiple Choice</option>
                      <option value={QuestionType.YES_NO}>Yes/No</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Title
                    </label>
                    <input
                      type="text"
                      value={question.title}
                      onChange={(e) => updateQuestion(index, { title: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder="Enter question..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Options
                    </label>
                    {question.options.map((option, optionIndex) => (
                      <input
                        key={optionIndex}
                        type="text"
                        value={option.text}
                        onChange={(e) => {
                          const updatedOptions = [...question.options];
                          updatedOptions[optionIndex] = { ...option, text: e.target.value };
                          updateQuestion(index, { options: updatedOptions });
                        }}
                        className="w-full p-2 border border-gray-300 rounded-lg mb-2"
                        placeholder={`Option ${optionIndex + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
            
            {formData.questions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No questions added yet. Click "Add Question" to start.
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Eligibility Criteria</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Membership Duration (days)
              </label>
              <input
                type="number"
                value={formData.eligibilityCriteria.membershipDuration || 0}
                onChange={(e) => updateFormData({
                  eligibilityCriteria: {
                    ...formData.eligibilityCriteria,
                    membershipDuration: parseInt(e.target.value) || 0
                  }
                })}
                className="w-full p-3 border border-gray-300 rounded-lg"
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Roles (optional)
              </label>
              <input
                type="text"
                placeholder="e.g., admin, moderator (comma-separated)"
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Review Campaign</h3>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-medium mb-2">{formData.title}</h4>
              <p className="text-gray-600 mb-4">{formData.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Start:</span> {formData.startDate}
                </div>
                <div>
                  <span className="font-medium">End:</span> {formData.endDate}
                </div>
                <div>
                  <span className="font-medium">Questions:</span> {formData.questions.length}
                </div>
                <div>
                  <span className="font-medium">Anonymous:</span> {formData.isAnonymous ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Step indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step.isCompleted 
                  ? 'bg-green-500 text-white' 
                  : step.isActive 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-300 text-gray-600'
              }`}>
                {step.isCompleted ? '✓' : index + 1}
              </div>
              <div className="text-center mt-2">
                <div className="text-sm font-medium">{step.title}</div>
                <div className="text-xs text-gray-500">{step.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="bg-white rounded-lg shadow p-6 min-h-96">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={currentStep === 0 ? onCancel : prevStep}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          {currentStep === 0 ? 'Cancel' : 'Previous'}
        </button>
        
        <button
          onClick={currentStep === steps.length - 1 ? handleSubmit : nextStep}
          disabled={loading || (currentStep === steps.length - 1 && !steps[currentStep].isCompleted)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : currentStep === steps.length - 1 ? 'Create Campaign' : 'Next'}
        </button>
      </div>
    </div>
  );
};
