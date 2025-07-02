// Task 7.1.3: Public User Registration & Wallet Connection
// Main registration flow component orchestrating the entire process

'use client';

import React, { useState, useEffect } from 'react';
import { RegistrationFlowProps, RegistrationStep } from '@/types/registration';
import { useRegistration, useWalletConnection, useEmailVerification } from '@/hooks/useRegistration';

// Import step components
import WalletSelector from '@/components/Wallet/WalletSelector';
import WalletConnectionGuide from '@/components/Wallet/WalletConnectionGuide';
import UserInfoForm from '@/components/Forms/UserInfoForm';
import InterestSelection from '@/components/Forms/InterestSelection';
import TermsAcceptance from '@/components/Registration/TermsAcceptance';
import EmailVerification from '@/components/Registration/EmailVerification';
import SuccessConfirmation from '@/components/Registration/SuccessConfirmation';

// Progress indicator component
const ProgressIndicator: React.FC<{
  currentStep: RegistrationStep;
  completedSteps: RegistrationStep[];
  progress: number;
}> = ({ currentStep, completedSteps, progress }) => {
  const steps = [
    { key: 'wallet-selection', label: 'Wallet', icon: '👛' },
    { key: 'user-info', label: 'Profile', icon: '👤' },
    { key: 'interests', label: 'Interests', icon: '🎯' },
    { key: 'terms', label: 'Terms', icon: '📋' },
    { key: 'email-verification', label: 'Verify', icon: '✉️' },
    { key: 'complete', label: 'Complete', icon: '🎉' }
  ];

  return (
    <div className="mb-8">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Registration Progress</span>
          <span className="text-sm font-medium text-gray-700">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.key as RegistrationStep);
          const isCurrent = currentStep === step.key;
          const isAccessible = isCompleted || isCurrent || index === 0;

          return (
            <div key={step.key} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  isCompleted
                    ? 'bg-green-600 text-white'
                    : isCurrent
                    ? 'bg-blue-600 text-white'
                    : isAccessible
                    ? 'bg-gray-300 text-gray-600'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {isCompleted ? '✓' : step.icon}
              </div>
              <span
                className={`mt-2 text-xs font-medium ${
                  isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Main registration flow component
const RegistrationFlow: React.FC<RegistrationFlowProps> = ({
  initialStep = 'entry',
  onComplete,
  onCancel,
  showProgress = true,
  allowSkipSteps = false
}) => {
  // Registration state management
  const { state, actions, validation } = useRegistration(initialStep);
  const { connection, isConnecting, connect, disconnect } = useWalletConnection();
  const emailVerification = useEmailVerification(state.userData.email);

  // Local state
  const [showConnectionGuide, setShowConnectionGuide] = useState(false);
  const [selectedWalletProvider, setSelectedWalletProvider] = useState<string>('');

  // Update wallet connection in registration state
  useEffect(() => {
    if (connection) {
      actions.setWalletConnection(connection);
    }
  }, [connection, actions]);

  // Handle wallet provider selection
  const handleWalletProviderSelect = (provider: any) => {
    setSelectedWalletProvider(provider);
    if (provider) {
      actions.updateUserData({
        walletProvider: provider
      });
    }
  };

  // Handle wallet connection
  const handleWalletConnect = async (provider: any) => {
    try {
      const result = await connect(provider);
      if (result.success) {
        actions.goNext();
      } else {
        setShowConnectionGuide(true);
      }
      return result;
    } catch (error) {
      setShowConnectionGuide(true);
      throw error;
    }
  };

  // Handle form submissions
  const handleUserInfoSubmit = (userData: any) => {
    actions.updateUserData(userData);
    actions.goNext();
  };

  const handleInterestsSubmit = (interests: string[]) => {
    actions.updateUserData({ interests });
    actions.goNext();
  };

  const handleTermsAccept = (accepted: any) => {
    actions.updateUserData({
      termsAccepted: accepted.terms,
      privacyPolicyAccepted: accepted.privacy,
      marketingConsent: accepted.marketing
    });
    
    // Submit registration
    actions.submitRegistration().then(() => {
      if (onComplete) {
        onComplete(state.userData as any);
      }
    });
  };

  const handleEmailVerified = () => {
    actions.setCurrentStep('complete');
    if (onComplete) {
      onComplete(state.userData as any);
    }
  };

  // Skip wallet connection
  const handleSkipWallet = () => {
    if (allowSkipSteps) {
      actions.setCurrentStep('user-info');
    }
  };

  // Render current step content
  const renderStepContent = () => {
    switch (state.currentStep) {
      case 'entry':
        return (
          <div className="text-center max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to PFM Platform
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Join the future of participatory financial management. Create your account to get started.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <h2 className="text-lg font-semibold text-blue-900 mb-3">
                  What you'll get:
                </h2>
                <ul className="text-blue-800 space-y-2">
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    <span>Secure wallet integration</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    <span>Access to governance communities</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    <span>Voting on financial proposals</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    <span>Transparent decision making</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={actions.goNext}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Start Registration
              </button>
            </div>
          </div>
        );

      case 'wallet-selection':
        if (showConnectionGuide && selectedWalletProvider) {
          return (
            <WalletConnectionGuide
              provider={selectedWalletProvider as any}
              onBack={() => setShowConnectionGuide(false)}
              onTryAgain={() => handleWalletConnect(selectedWalletProvider)}
            />
          );
        }

        return (
          <WalletSelector
            selectedProvider={selectedWalletProvider as any}
            onProviderSelect={handleWalletProviderSelect}
            onConnect={handleWalletConnect}
            showInstallGuide={true}
            enableMobile={true}
          />
        );

      case 'user-info':
        return (
          <UserInfoForm
            initialData={state.userData}
            onSubmit={handleUserInfoSubmit}
            onBack={actions.goBack}
            isLoading={state.isLoading}
            errors={state.errors}
          />
        );

      case 'interests':
        return (
          <InterestSelection
            initialInterests={state.userData.interests || []}
            onSubmit={handleInterestsSubmit}
            onBack={actions.goBack}
            isLoading={state.isLoading}
          />
        );

      case 'terms':
        return (
          <TermsAcceptance
            onAccept={handleTermsAccept}
            onBack={actions.goBack}
            termsUrl="/terms"
            privacyUrl="/privacy"
            loading={state.isLoading}
          />
        );

      case 'email-verification':
        return (
          <EmailVerification
            email={state.userData.email || ''}
            onVerified={handleEmailVerified}
            onResend={emailVerification.sendVerification}
            onChangeEmail={() => actions.setCurrentStep('user-info')}
            status={emailVerification}
          />
        );

      case 'complete':
        return (
          <SuccessConfirmation
            userData={state.userData as any}
            walletConnection={state.walletConnection}
            onContinue={() => {
              if (onComplete) {
                onComplete(state.userData as any);
              }
            }}
          />
        );

      default:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Step not found
            </h2>
            <p className="text-gray-600 mb-6">
              This registration step is not available.
            </p>
            <button
              onClick={() => actions.setCurrentStep('entry')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Over
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Account Registration
              </h1>
              {state.walletConnection && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Wallet Connected</span>
                </div>
              )}
            </div>
            
            {onCancel && (
              <button
                onClick={onCancel}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Progress indicator */}
        {showProgress && state.currentStep !== 'entry' && state.currentStep !== 'complete' && (
          <ProgressIndicator
            currentStep={state.currentStep}
            completedSteps={state.completedSteps}
            progress={state.progress}
          />
        )}

        {/* Step content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {renderStepContent()}
        </div>

        {/* Help text */}
        {state.currentStep !== 'entry' && state.currentStep !== 'complete' && (
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm mb-2">
              Need help with registration?
            </p>
            <a
              href="/support"
              className="text-blue-600 hover:text-blue-700 text-sm underline"
            >
              Contact our support team
            </a>
          </div>
        )}

        {/* Skip options */}
        {allowSkipSteps && state.currentStep === 'wallet-selection' && (
          <div className="mt-6 text-center">
            <button
              onClick={handleSkipWallet}
              className="text-gray-500 hover:text-gray-700 text-sm underline"
            >
              Skip wallet connection for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationFlow; 