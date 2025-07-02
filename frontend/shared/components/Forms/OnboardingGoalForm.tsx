// Onboarding Goal Setting Form Component
// Helps new users define their objectives and customize their experience

'use client';

import React, { useState } from 'react';

interface OnboardingGoalFormProps {
  onComplete: (goals: UserGoals) => Promise<void>;
  onSkip?: () => void;
  currentStep?: number;
  totalSteps?: number;
  isLoading?: boolean;
  className?: string;
}

interface UserGoals {
  primaryGoal: PrimaryGoal;
  interests: Interest[];
  experienceLevel: ExperienceLevel;
  timeCommitment: TimeCommitment;
  preferences: UserPreferences;
  customGoals: string[];
}

interface UserPreferences {
  notificationFrequency: 'high' | 'medium' | 'low';
  contentComplexity: 'beginner' | 'intermediate' | 'advanced';
  participationStyle: 'observer' | 'participant' | 'leader';
  learningPreference: 'visual' | 'reading' | 'interactive' | 'video';
}

type PrimaryGoal = 
  | 'participate_governance'
  | 'learn_web3'
  | 'build_network'
  | 'earn_rewards'
  | 'contribute_community'
  | 'track_investments'
  | 'explore_technology'
  | 'other';

type Interest = 
  | 'defi'
  | 'nfts'
  | 'dao_governance'
  | 'blockchain_technology'
  | 'cryptocurrency'
  | 'smart_contracts'
  | 'web3_development'
  | 'metaverse'
  | 'gaming'
  | 'sustainability'
  | 'social_impact'
  | 'education'
  | 'investing'
  | 'entrepreneurship';

type ExperienceLevel = 'complete_beginner' | 'some_knowledge' | 'intermediate' | 'advanced' | 'expert';

type TimeCommitment = 'casual' | 'regular' | 'active' | 'intensive';

const PRIMARY_GOALS = [
  {
    value: 'participate_governance',
    title: 'Participate in Governance',
    description: 'Vote on proposals and help shape the future of communities',
    icon: '🗳️',
    color: 'bg-blue-50 border-blue-200 text-blue-800',
  },
  {
    value: 'learn_web3',
    title: 'Learn About Web3',
    description: 'Understand blockchain, crypto, and decentralized technologies',
    icon: '📚',
    color: 'bg-green-50 border-green-200 text-green-800',
  },
  {
    value: 'build_network',
    title: 'Build Professional Network',
    description: 'Connect with like-minded individuals and industry experts',
    icon: '🤝',
    color: 'bg-purple-50 border-purple-200 text-purple-800',
  },
  {
    value: 'earn_rewards',
    title: 'Earn Rewards',
    description: 'Participate in activities to earn tokens and other rewards',
    icon: '💎',
    color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  },
  {
    value: 'contribute_community',
    title: 'Contribute to Community',
    description: 'Share knowledge, help others, and build valuable projects',
    icon: '🌱',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  },
  {
    value: 'track_investments',
    title: 'Track Investments',
    description: 'Monitor portfolio and stay updated on market trends',
    icon: '📈',
    color: 'bg-indigo-50 border-indigo-200 text-indigo-800',
  },
  {
    value: 'explore_technology',
    title: 'Explore New Technology',
    description: 'Discover cutting-edge innovations and early-stage projects',
    icon: '🚀',
    color: 'bg-pink-50 border-pink-200 text-pink-800',
  },
  {
    value: 'other',
    title: 'Other Goals',
    description: 'I have specific goals not listed above',
    icon: '✨',
    color: 'bg-gray-50 border-gray-200 text-gray-800',
  },
] as const;

const INTERESTS = [
  { value: 'defi', label: 'DeFi & DEXs', icon: '🏦' },
  { value: 'nfts', label: 'NFTs & Digital Art', icon: '🎨' },
  { value: 'dao_governance', label: 'DAO Governance', icon: '🏛️' },
  { value: 'blockchain_technology', label: 'Blockchain Tech', icon: '⛓️' },
  { value: 'cryptocurrency', label: 'Cryptocurrency', icon: '₿' },
  { value: 'smart_contracts', label: 'Smart Contracts', icon: '📝' },
  { value: 'web3_development', label: 'Web3 Development', icon: '💻' },
  { value: 'metaverse', label: 'Metaverse & VR', icon: '🌐' },
  { value: 'gaming', label: 'Blockchain Gaming', icon: '🎮' },
  { value: 'sustainability', label: 'Green Tech', icon: '🌿' },
  { value: 'social_impact', label: 'Social Impact', icon: '🤲' },
  { value: 'education', label: 'Education', icon: '🎓' },
  { value: 'investing', label: 'Investing & Trading', icon: '💰' },
  { value: 'entrepreneurship', label: 'Entrepreneurship', icon: '🏪' },
] as const;

const EXPERIENCE_LEVELS = [
  {
    value: 'complete_beginner',
    title: 'Complete Beginner',
    description: 'New to blockchain and cryptocurrency',
    icon: '🌱',
  },
  {
    value: 'some_knowledge',
    title: 'Some Knowledge',
    description: 'Familiar with basic concepts',
    icon: '📖',
  },
  {
    value: 'intermediate',
    title: 'Intermediate',
    description: 'Comfortable with most web3 concepts',
    icon: '⚡',
  },
  {
    value: 'advanced',
    title: 'Advanced',
    description: 'Deep understanding of the ecosystem',
    icon: '🎯',
  },
  {
    value: 'expert',
    title: 'Expert',
    description: 'Industry professional or researcher',
    icon: '🏆',
  },
] as const;

const TIME_COMMITMENTS = [
  {
    value: 'casual',
    title: 'Casual Participation',
    description: 'A few minutes per week',
    time: '< 30 min/week',
    icon: '☕',
  },
  {
    value: 'regular',
    title: 'Regular Engagement',
    description: 'Check in regularly, vote on key issues',
    time: '1-2 hours/week',
    icon: '📅',
  },
  {
    value: 'active',
    title: 'Active Community Member',
    description: 'Engage in discussions, contribute content',
    time: '3-5 hours/week',
    icon: '💪',
  },
  {
    value: 'intensive',
    title: 'Deep Involvement',
    description: 'Leadership roles, project contributions',
    time: '5+ hours/week',
    icon: '🔥',
  },
] as const;

const OnboardingGoalForm: React.FC<OnboardingGoalFormProps> = ({
  onComplete,
  onSkip,
  currentStep = 1,
  totalSteps = 5,
  isLoading = false,
  className = '',
}) => {
  const [goals, setGoals] = useState<UserGoals>({
    primaryGoal: 'participate_governance',
    interests: [],
    experienceLevel: 'some_knowledge',
    timeCommitment: 'regular',
    preferences: {
      notificationFrequency: 'medium',
      contentComplexity: 'intermediate',
      participationStyle: 'participant',
      learningPreference: 'interactive',
    },
    customGoals: [],
  });

  const [customGoal, setCustomGoal] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Handle primary goal selection
  const handlePrimaryGoalChange = (goal: PrimaryGoal) => {
    setGoals(prev => ({ ...prev, primaryGoal: goal }));
    setErrors(prev => ({ ...prev, primaryGoal: '' }));
  };

  // Handle interest toggle
  const handleInterestToggle = (interest: Interest) => {
    setGoals(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
    setErrors(prev => ({ ...prev, interests: '' }));
  };

  // Add custom goal
  const handleAddCustomGoal = () => {
    if (customGoal.trim() && goals.customGoals.length < 3) {
      setGoals(prev => ({
        ...prev,
        customGoals: [...prev.customGoals, customGoal.trim()],
      }));
      setCustomGoal('');
    }
  };

  // Remove custom goal
  const handleRemoveCustomGoal = (index: number) => {
    setGoals(prev => ({
      ...prev,
      customGoals: prev.customGoals.filter((_, i) => i !== index),
    }));
  };

  // Handle preference changes
  const handlePreferenceChange = (key: keyof UserPreferences, value: string) => {
    setGoals(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value,
      },
    }));
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (goals.interests.length === 0) {
      newErrors.interests = 'Please select at least one area of interest';
    }

    if (goals.interests.length > 5) {
      newErrors.interests = 'Please select no more than 5 areas of interest';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onComplete(goals);
    } catch (error) {
      setErrors({ submit: 'Failed to save your goals. Please try again.' });
    }
  };

  return (
    <div className={`max-w-3xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-8 ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Set Your Goals</h2>
        <p className="mt-2 text-lg text-gray-600">
          Help us personalize your experience by telling us what you want to achieve
        </p>
        <div className="mt-4 flex justify-center">
          <div className="bg-gray-200 rounded-full p-1 flex">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full mx-1 ${
                  i + 1 <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="ml-3 text-sm text-gray-500">Step {currentStep} of {totalSteps}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Primary Goal */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            What's your primary goal? <span className="text-red-500">*</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PRIMARY_GOALS.map((goal) => (
              <label key={goal.value} className="cursor-pointer">
                <input
                  type="radio"
                  name="primaryGoal"
                  value={goal.value}
                  checked={goals.primaryGoal === goal.value}
                  onChange={(e) => handlePrimaryGoalChange(e.target.value as PrimaryGoal)}
                  className="sr-only"
                />
                <div className={`p-4 border-2 rounded-lg transition-all ${
                  goals.primaryGoal === goal.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}>
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">{goal.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{goal.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>

          {/* Custom Goal Input */}
          {goals.primaryGoal === 'other' && (
            <div className="mt-4">
              <label htmlFor="customPrimaryGoal" className="block text-sm font-medium text-gray-700 mb-1">
                Describe your primary goal
              </label>
              <textarea
                id="customPrimaryGoal"
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tell us what you want to achieve..."
              />
            </div>
          )}
        </div>

        {/* Areas of Interest */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            What areas interest you most? <span className="text-red-500">*</span>
          </h3>
          <p className="text-gray-600 mb-4">Select 1-5 areas that align with your interests</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {INTERESTS.map((interest) => (
              <label key={interest.value} className="cursor-pointer">
                <input
                  type="checkbox"
                  checked={goals.interests.includes(interest.value)}
                  onChange={() => handleInterestToggle(interest.value)}
                  className="sr-only"
                />
                <div className={`p-3 border-2 rounded-lg transition-all text-center ${
                  goals.interests.includes(interest.value)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}>
                  <div className="text-2xl mb-2">{interest.icon}</div>
                  <div className="text-sm font-medium text-gray-900">{interest.label}</div>
                </div>
              </label>
            ))}
          </div>

          {errors.interests && (
            <p className="mt-2 text-sm text-red-600">{errors.interests}</p>
          )}

          <div className="mt-4 text-sm text-gray-500">
            Selected: {goals.interests.length}/5
          </div>
        </div>

        {/* Experience Level */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            What's your experience level with Web3? <span className="text-red-500">*</span>
          </h3>
          <div className="space-y-3">
            {EXPERIENCE_LEVELS.map((level) => (
              <label key={level.value} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="experienceLevel"
                  value={level.value}
                  checked={goals.experienceLevel === level.value}
                  onChange={(e) => setGoals(prev => ({ ...prev, experienceLevel: e.target.value as ExperienceLevel }))}
                  className="mr-4"
                />
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{level.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900">{level.title}</div>
                    <div className="text-sm text-gray-600">{level.description}</div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Time Commitment */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            How much time can you commit? <span className="text-red-500">*</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TIME_COMMITMENTS.map((commitment) => (
              <label key={commitment.value} className="cursor-pointer">
                <input
                  type="radio"
                  name="timeCommitment"
                  value={commitment.value}
                  checked={goals.timeCommitment === commitment.value}
                  onChange={(e) => setGoals(prev => ({ ...prev, timeCommitment: e.target.value as TimeCommitment }))}
                  className="sr-only"
                />
                <div className={`p-4 border-2 rounded-lg transition-all ${
                  goals.timeCommitment === commitment.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}>
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">{commitment.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{commitment.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{commitment.description}</p>
                      <p className="text-xs text-blue-600 mt-1 font-medium">{commitment.time}</p>
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Custom Goals */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Any additional goals? (Optional)
          </h3>
          <div className="space-y-3">
            <div className="flex space-x-2">
              <input
                type="text"
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomGoal())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add a custom goal..."
                maxLength={100}
                disabled={goals.customGoals.length >= 3}
              />
              <button
                type="button"
                onClick={handleAddCustomGoal}
                disabled={!customGoal.trim() || goals.customGoals.length >= 3}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>

            {goals.customGoals.length > 0 && (
              <div className="space-y-2">
                {goals.customGoals.map((goal, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                    <span className="text-sm text-gray-700">{goal}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomGoal(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-sm text-gray-500">You can add up to 3 additional goals</p>
          </div>
        </div>

        {/* Preferences */}
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Personalization Preferences</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Complexity
              </label>
              <select
                value={goals.preferences.contentComplexity}
                onChange={(e) => handlePreferenceChange('contentComplexity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="beginner">Beginner-friendly content</option>
                <option value="intermediate">Balanced content</option>
                <option value="advanced">Technical/Advanced content</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Participation Style
              </label>
              <select
                value={goals.preferences.participationStyle}
                onChange={(e) => handlePreferenceChange('participationStyle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="observer">Observer (I prefer to watch and learn)</option>
                <option value="participant">Participant (I like to engage regularly)</option>
                <option value="leader">Leader (I want to take initiative)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Learning Preference
              </label>
              <select
                value={goals.preferences.learningPreference}
                onChange={(e) => handlePreferenceChange('learningPreference', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="visual">Visual (charts, diagrams, infographics)</option>
                <option value="reading">Reading (articles, documentation)</option>
                <option value="interactive">Interactive (tutorials, hands-on)</option>
                <option value="video">Video (webinars, explanations)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notification Frequency
              </label>
              <select
                value={goals.preferences.notificationFrequency}
                onChange={(e) => handlePreferenceChange('notificationFrequency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="high">High (notify me about everything)</option>
                <option value="medium">Medium (important updates only)</option>
                <option value="low">Low (minimal notifications)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">{errors.submit}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
            >
              Skip for now
            </button>
          )}
          
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Continue to Next Step'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default OnboardingGoalForm; 