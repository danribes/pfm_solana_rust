// Task 7.2.3: User Profile Creation & Management
// Profile creation wizard with step-by-step guidance

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProfileWizard } from '../../../shared/hooks/useProfile';
import { PROFILE_WIZARD_STEPS, UserProfile } from '../../../shared/types/profile';

interface ProfileWizardProps {
  userId: string;
  onComplete?: (profile: UserProfile) => void;
  onCancel?: () => void;
}

export default function ProfileWizard({ userId, onComplete, onCancel }: ProfileWizardProps) {
  const router = useRouter();
  const { wizardState, actions } = useProfileWizard(userId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle wizard completion
  const handleWizardComplete = async () => {
    setIsSubmitting(true);
    
    try {
      const newProfile = await actions.completeWizard();
      
      if (onComplete) {
        onComplete(newProfile);
      } else {
        router.push('/profile');
      }
    } catch (error) {
      console.error('Failed to complete profile wizard:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle step navigation
  const handleNext = () => {
    const isLastStep = wizardState.currentStep === wizardState.totalSteps - 1;
    
    if (isLastStep) {
      handleWizardComplete();
    } else {
      actions.nextStep();
    }
  };

  const handlePrevious = () => {
    if (wizardState.currentStep > 0) {
      actions.previousStep();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push('/dashboard');
    }
  };

  // Render current step
  const renderCurrentStep = () => {
    const currentStepName = PROFILE_WIZARD_STEPS[wizardState.currentStep];
    
    switch (currentStepName) {
      case 'welcome':
        return <WelcomeStep />;
        
      case 'basic_info':
        return (
          <BasicInfoStep 
            data={wizardState.stepData.basicInfo}
            onUpdate={(data) => actions.updateStep('basicInfo', data)}
          />
        );
        
      case 'complete':
        return <CompletionStep onComplete={handleWizardComplete} isLoading={isSubmitting} />;
        
      default:
        return (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Step In Progress</h2>
            <p className="text-gray-600">This step is being developed...</p>
          </div>
        );
    }
  };

  const progressPercentage = Math.round((wizardState.currentStep / (wizardState.totalSteps - 1)) * 100);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Create Your Profile</h1>
              <span className="ml-3 text-sm text-gray-500">
                Step {wizardState.currentStep + 1} of {wizardState.totalSteps}
              </span>
            </div>
            
            <button
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
          
          {/* Progress bar */}
          <div className="pb-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center py-8">
        <div className="max-w-2xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
            {renderCurrentStep()}
            
            {/* Navigation buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <button
                onClick={handlePrevious}
                disabled={wizardState.currentStep === 0}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              <button
                onClick={handleNext}
                disabled={isSubmitting}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Creating...' : 
                 wizardState.currentStep === wizardState.totalSteps - 1 ? 'Complete' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Welcome step component
function WelcomeStep() {
  return (
    <div className="text-center">
      <div className="mb-8">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
          <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mt-4">
          Welcome to the Community!
        </h2>
        
        <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
          Let's create your profile to help you connect with others and 
          participate in communities that match your interests.
        </p>
      </div>
      
      <div className="bg-blue-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          What we'll set up:
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Basic information
          </div>
          
          <div className="flex items-center">
            <svg className="h-5 w-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Profile picture
          </div>
          
          <div className="flex items-center">
            <svg className="h-5 w-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Interests & preferences
          </div>
          
          <div className="flex items-center">
            <svg className="h-5 w-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Privacy settings
          </div>
        </div>
      </div>
      
      <p className="text-sm text-gray-500 mb-6">
        Don't worry - you can always update these later from your profile settings.
      </p>
    </div>
  );
}

// Basic info step
function BasicInfoStep({ data, onUpdate }: any) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Tell us about yourself</h2>
      
      <div className="space-y-6">
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
            Display Name *
          </label>
          <input
            type="text"
            id="displayName"
            value={data?.displayName || ''}
            onChange={(e) => onUpdate({ displayName: e.target.value })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="How should others see your name?"
          />
        </div>
        
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
            Bio
          </label>
          <textarea
            id="bio"
            rows={4}
            value={data?.bio || ''}
            onChange={(e) => onUpdate({ bio: e.target.value })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Tell others a bit about yourself..."
          />
        </div>
        
        <div>
          <label htmlFor="tagline" className="block text-sm font-medium text-gray-700">
            Tagline
          </label>
          <input
            type="text"
            id="tagline"
            value={data?.tagline || ''}
            onChange={(e) => onUpdate({ tagline: e.target.value })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="A short phrase that describes you"
          />
        </div>
      </div>
    </div>
  );
}

// Completion step
function CompletionStep({ onComplete, isLoading }: any) {
  return (
    <div className="text-center">
      <div className="mb-8">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mt-4">
          Almost Done!
        </h2>
        
        <p className="text-lg text-gray-600 mt-4">
          Review your information and complete your profile setup.
        </p>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          What happens next:
        </h3>
        
        <div className="space-y-2 text-sm text-gray-600">
          <p>✓ Your profile will be created</p>
          <p>✓ You can start joining communities</p>
          <p>✓ Other members can discover and connect with you</p>
          <p>✓ You can always update your information later</p>
        </div>
      </div>
      
      <button
        onClick={onComplete}
        disabled={isLoading}
        className="px-8 py-3 text-base font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Creating Profile...' : 'Create My Profile'}
      </button>
    </div>
  );
} 