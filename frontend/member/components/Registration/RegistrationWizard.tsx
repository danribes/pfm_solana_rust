'use client';

import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useRegistration } from '../../hooks/useRegistration';
import WalletConnection from './WalletConnection';
import ProfileSetup from './ProfileSetup';
import CommunitySelection from './CommunitySelection';
import TermsAcceptance from './TermsAcceptance';
import RegistrationComplete from './RegistrationComplete';

interface RegistrationWizardProps {
  onComplete?: (profile: any) => void;
  onCancel?: () => void;
}

const RegistrationWizard: React.FC<RegistrationWizardProps> = ({ 
  onComplete, 
  onCancel 
}) => {
  const {
    registrationData,
    progress,
    loading,
    error,
    updateRegistrationData,
    nextStep,
    previousStep,
    completeRegistration,
    connectWallet,
    validateStep,
    reset
  } = useRegistration();

  const steps = [
    { id: 'wallet', title: 'Connect Wallet', component: WalletConnection },
    { id: 'profile', title: 'Create Profile', component: ProfileSetup },
    { id: 'communities', title: 'Join Communities', component: CommunitySelection },
    { id: 'terms', title: 'Terms & Privacy', component: TermsAcceptance },
    { id: 'complete', title: 'Complete', component: RegistrationComplete }
  ];

  const currentStepData = steps[progress.currentStep];
  const CurrentStepComponent = currentStepData.component;

  const handleNext = async () => {
    if (progress.currentStep === steps.length - 1) {
      try {
        const profile = await completeRegistration();
        onComplete?.(profile);
      } catch (err) {
        console.error('Registration completion failed:', err);
      }
    } else {
      nextStep();
    }
  };

  const handlePrevious = () => {
    previousStep();
  };

  const handleCancel = () => {
    reset();
    onCancel?.();
  };

  const isLastStep = progress.currentStep === steps.length - 1;
  const isFirstStep = progress.currentStep === 0;
  const canProceed = progress.canProceed && validateStep(currentStepData.id).length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Join Our Community</h1>
          <p className="mt-2 text-gray-600">Create your account and start participating in governance</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  relative flex items-center justify-center w-8 h-8 rounded-full border-2
                  ${index < progress.currentStep 
                    ? 'bg-green-600 border-green-600' 
                    : index === progress.currentStep
                    ? 'bg-blue-600 border-blue-600'
                    : 'bg-white border-gray-300'
                  }
                `}>
                  {index < progress.currentStep ? (
                    <CheckIcon className="w-5 h-5 text-white" />
                  ) : (
                    <span className={`text-sm font-medium ${
                      index === progress.currentStep ? 'text-white' : 'text-gray-500'
                    }`}>
                      {index + 1}
                    </span>
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  index <= progress.currentStep ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`ml-4 h-0.5 w-12 ${
                    index < progress.currentStep ? 'bg-green-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Current Step Component */}
            <CurrentStepComponent
              registrationData={registrationData}
              updateRegistrationData={updateRegistrationData}
              connectWallet={connectWallet}
              loading={loading}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          </div>

          {/* Navigation */}
          <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
            <button
              type="button"
              onClick={isFirstStep ? handleCancel : handlePrevious}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="w-4 h-4 mr-2" />
              {isFirstStep ? 'Cancel' : 'Previous'}
            </button>

            <span className="text-sm text-gray-500">
              Step {progress.currentStep + 1} of {progress.totalSteps}
            </span>

            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed || loading}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  {isLastStep ? 'Complete Registration' : 'Next'}
                  {!isLastStep && <ChevronRightIcon className="w-4 h-4 ml-2" />}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            By registering, you agree to our{' '}
            <a href="/terms" className="text-blue-600 hover:text-blue-500">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-blue-600 hover:text-blue-500">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationWizard;
