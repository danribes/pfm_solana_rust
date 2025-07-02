// Task 7.2.1: User Onboarding Flow & Tutorial System
// Main onboarding wizard orchestrating the complete flow

'use client';

import React, { useState, useEffect } from 'react';
import { OnboardingWizardProps, OnboardingStep, UserOnboardingProfile, OnboardingGoal } from '@/types/onboarding';
import { useOnboarding, useOnboardingAnalytics } from '@/hooks/useOnboarding';
import BlockchainExplainer from '@/components/Education/BlockchainExplainer';

// Step components
const WelcomeStep: React.FC<{ onNext: (profile: UserOnboardingProfile) => void }> = ({ onNext }) => {
  const [profile, setProfile] = useState<Partial<UserOnboardingProfile>>({
    experienceLevel: 'beginner',
    interests: [],
    goals: [],
    skipAdvanced: false,
    preferredLearningStyle: 'interactive',
    estimatedTimeAvailable: 30
  });

  const handleSubmit = () => {
    onNext(profile as UserOnboardingProfile);
  };

  return (
    <div className="max-w-2xl mx-auto text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to PFM Platform!</h1>
      <p className="text-xl text-gray-600 mb-8">Let's get you started with a personalized onboarding experience.</p>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Tell us about yourself</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
            <select 
              value={profile.experienceLevel}
              onChange={(e) => setProfile(prev => ({ ...prev, experienceLevel: e.target.value as any }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="beginner">Beginner - New to blockchain</option>
              <option value="intermediate">Intermediate - Some blockchain knowledge</option>
              <option value="advanced">Advanced - Experienced with blockchain</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Learning Style</label>
            <select 
              value={profile.preferredLearningStyle}
              onChange={(e) => setProfile(prev => ({ ...prev, preferredLearningStyle: e.target.value as any }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="interactive">Interactive - Hands-on learning</option>
              <option value="visual">Visual - Diagrams and animations</option>
              <option value="reading">Reading - Text-based content</option>
              <option value="video">Video - Video tutorials</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Available (minutes)</label>
            <select 
              value={profile.estimatedTimeAvailable}
              onChange={(e) => setProfile(prev => ({ ...prev, estimatedTimeAvailable: Number(e.target.value) }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value={15}>15 minutes - Quick overview</option>
              <option value={30}>30 minutes - Standard onboarding</option>
              <option value={60}>60 minutes - Comprehensive learning</option>
            </select>
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
      >
        Start Onboarding
      </button>
    </div>
  );
};

const GoalsStep: React.FC<{ profile: UserOnboardingProfile; onNext: (goals: OnboardingGoal[]) => void }> = ({ 
  profile, 
  onNext 
}) => {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const goalOptions = [
    { id: 'learn-blockchain', title: 'Learn Blockchain Basics', category: 'learning' as const, estimatedTime: 20 },
    { id: 'participate-voting', title: 'Participate in Voting', category: 'participation' as const, estimatedTime: 10 },
    { id: 'join-community', title: 'Join a Community', category: 'community' as const, estimatedTime: 15 },
    { id: 'understand-governance', title: 'Understand Governance', category: 'learning' as const, estimatedTime: 25 },
    { id: 'manage-finances', title: 'Manage Finances Collectively', category: 'financial' as const, estimatedTime: 30 }
  ];

  const handleSubmit = () => {
    const goals: OnboardingGoal[] = goalOptions
      .filter(option => selectedGoals.includes(option.id))
      .map(option => ({
        id: option.id,
        title: option.title,
        description: `Complete ${option.title.toLowerCase()}`,
        category: option.category,
        priority: 'medium' as const,
        estimatedTime: option.estimatedTime,
        completed: false
      }));

    onNext(goals);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">What would you like to achieve?</h2>
      <p className="text-gray-600 mb-6">Select your goals to personalize your learning path.</p>

      <div className="space-y-3 mb-8">
        {goalOptions.map(goal => (
          <label key={goal.id} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={selectedGoals.includes(goal.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedGoals(prev => [...prev, goal.id]);
                } else {
                  setSelectedGoals(prev => prev.filter(id => id !== goal.id));
                }
              }}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">{goal.title}</div>
              <div className="text-sm text-gray-500">~{goal.estimatedTime} minutes</div>
            </div>
          </label>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={selectedGoals.length === 0}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue with Selected Goals
      </button>
    </div>
  );
};

const CompletionStep: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full mx-auto mb-6 flex items-center justify-center">
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Congratulations!</h1>
      <p className="text-xl text-gray-600 mb-8">
        You've successfully completed the onboarding process. Welcome to the PFM Platform community!
      </p>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-blue-900 mb-3">What's Next?</h2>
        <ul className="text-blue-800 space-y-2">
          <li className="flex items-center">
            <span className="mr-2">🏛️</span>
            <span>Explore available communities</span>
          </li>
          <li className="flex items-center">
            <span className="mr-2">🗳️</span>
            <span>Participate in active voting campaigns</span>
          </li>
          <li className="flex items-center">
            <span className="mr-2">💬</span>
            <span>Join discussions and connect with members</span>
          </li>
          <li className="flex items-center">
            <span className="mr-2">📊</span>
            <span>Track your participation and impact</span>
          </li>
        </ul>
      </div>

      <p className="text-sm text-gray-500">You'll be redirected to the platform in a few seconds...</p>
    </div>
  );
};

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  userId,
  initialStep = 'welcome',
  onComplete,
  onSkip,
  onExit,
  showProgress = true,
  allowSkipping = true,
  customization = {
    theme: 'light',
    accentColor: '#3B82F6',
    showAnimations: true,
    autoAdvance: false,
    autoAdvanceDelay: 5
  }
}) => {
  const { state, actions, isLoading, error } = useOnboarding(userId);
  const { trackEvent } = useOnboardingAnalytics();
  
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(initialStep);
  const [userProfile, setUserProfile] = useState<UserOnboardingProfile | null>(null);

  // Handle step completion
  const handleStepComplete = async (stepData?: any) => {
    try {
      await actions.completeStep(stepData);
      
      // Determine next step
      const stepOrder: OnboardingStep[] = [
        'welcome', 'goals', 'blockchain-education', 'voting-tutorial', 
        'platform-tour', 'community-guidance', 'completion'
      ];
      
      const currentIndex = stepOrder.indexOf(currentStep);
      if (currentIndex < stepOrder.length - 1) {
        setCurrentStep(stepOrder[currentIndex + 1]);
      } else {
        setCurrentStep('completion');
      }
    } catch (error) {
      console.error('Failed to complete step:', error);
    }
  };

  // Handle welcome step
  const handleWelcomeComplete = async (profile: UserOnboardingProfile) => {
    try {
      setUserProfile(profile);
      await actions.startOnboarding(profile);
      setCurrentStep('goals');
    } catch (error) {
      console.error('Failed to start onboarding:', error);
    }
  };

  // Handle goals step
  const handleGoalsComplete = async (goals: OnboardingGoal[]) => {
    if (userProfile) {
      const updatedProfile = { ...userProfile, goals };
      setUserProfile(updatedProfile);
      await actions.updateProfile(updatedProfile);
      setCurrentStep('blockchain-education');
    }
  };

  // Calculate progress
  const stepOrder: OnboardingStep[] = [
    'welcome', 'goals', 'blockchain-education', 'voting-tutorial', 
    'platform-tour', 'community-guidance', 'completion'
  ];
  const currentIndex = stepOrder.indexOf(currentStep);
  const progress = Math.round(((currentIndex + 1) / stepOrder.length) * 100);

  // Handle skip
  const handleSkip = () => {
    if (onSkip) {
      onSkip(currentStep);
    }
    trackEvent('step_skip', currentStep, { reason: 'user_skipped' });
    
    if (currentStep === 'completion') {
      if (onComplete && userProfile) {
        onComplete(userProfile);
      }
    } else {
      const nextIndex = Math.min(currentIndex + 1, stepOrder.length - 1);
      setCurrentStep(stepOrder[nextIndex]);
    }
  };

  // Handle completion
  const handleComplete = () => {
    if (onComplete && userProfile) {
      onComplete(userProfile);
    }
  };

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center p-8">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full mx-auto mb-4 flex items-center justify-center">
          ⚠️
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Platform Onboarding</h1>
            {onExit && (
              <button
                onClick={onExit}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Exit Onboarding
              </button>
            )}
          </div>
          
          {showProgress && (
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm font-medium text-gray-700">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
            </div>
          )}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : (
            <>
              {currentStep === 'welcome' && (
                <WelcomeStep onNext={handleWelcomeComplete} />
              )}

              {currentStep === 'goals' && userProfile && (
                <GoalsStep profile={userProfile} onNext={handleGoalsComplete} />
              )}

              {currentStep === 'blockchain-education' && (
                <BlockchainExplainer
                  userId={userId}
                  onComplete={() => handleStepComplete()}
                  onSkip={allowSkipping ? handleSkip : undefined}
                  showProgress={false}
                  allowSkip={allowSkipping}
                />
              )}

              {currentStep === 'completion' && (
                <CompletionStep onComplete={handleComplete} />
              )}

              {/* Simplified steps for other phases */}
              {!['welcome', 'goals', 'blockchain-education', 'completion'].includes(currentStep) && (
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {currentStep.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </h2>
                  <p className="text-gray-600 mb-8">This step is under development.</p>
                  <button
                    onClick={() => handleStepComplete()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Continue
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Skip option */}
        {allowSkipping && onSkip && currentStep !== 'completion' && (
          <div className="text-center mt-6">
            <button
              onClick={handleSkip}
              className="text-gray-500 hover:text-gray-700 text-sm underline"
            >
              Skip this step
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingWizard;
