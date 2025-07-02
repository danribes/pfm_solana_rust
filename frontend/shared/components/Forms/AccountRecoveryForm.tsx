// Account Recovery Form Component
// Multi-step account recovery with multiple verification methods

'use client';

import React, { useState, useEffect } from 'react';
import { useAccountRecovery } from '../../hooks/useSecurity';
import {
  AccountRecoveryFormData,
  RecoveryMethod,
  RECOVERY_METHODS,
  AccountRecoveryResponse,
  RecoveryStep,
} from '../../types/security';

interface AccountRecoveryFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

type FormStep = 'identify' | 'method' | 'verify' | 'newPassword' | 'complete';

const AccountRecoveryForm: React.FC<AccountRecoveryFormProps> = ({
  onSuccess,
  onCancel,
  className = '',
}) => {
  const [currentStep, setCurrentStep] = useState<FormStep>('identify');
  const [formData, setFormData] = useState<AccountRecoveryFormData>({
    identifier: '',
    recoveryMethod: 'email',
    verificationData: {},
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const {
    recovery,
    isLoading,
    errors,
    currentStep: recoveryCurrentStep,
    initiateRecovery,
    verifyStep,
    completeRecovery,
    setErrors,
  } = useAccountRecovery();

  // Handle account identification
  const handleIdentification = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!formData.identifier.trim()) {
      setErrors({ identifier: 'Please enter your email, username, or wallet address' });
      return;
    }

    try {
      await initiateRecovery({
        identifier: formData.identifier,
        recoveryMethod: formData.recoveryMethod,
      });
      
      setCurrentStep('verify');
    } catch (error) {
      // Error handled by hook
    }
  };

  // Handle method selection
  const handleMethodSelection = (method: RecoveryMethod) => {
    setFormData(prev => ({ ...prev, recoveryMethod: method }));
  };

  // Handle verification step
  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!recovery) return;

    const currentRecoveryStep = recovery.steps[recoveryCurrentStep];
    
    try {
      let verificationData: any = {};

      switch (currentRecoveryStep.type) {
        case 'email_verification':
          if (!formData.verificationData?.emailCode) {
            setErrors({ verification: 'Please enter the verification code from your email' });
            return;
          }
          verificationData.emailCode = formData.verificationData.emailCode;
          break;

        case 'security_questions':
          const answers = formData.verificationData?.securityAnswers || {};
          const requiredQuestions = currentRecoveryStep.data?.questions || [];
          
          for (const question of requiredQuestions) {
            if (!answers[question.id] || answers[question.id].trim() === '') {
              setErrors({ verification: 'Please answer all security questions' });
              return;
            }
          }
          verificationData.securityAnswers = answers;
          break;

        case 'wallet_signature':
          if (!formData.verificationData?.walletSignature) {
            setErrors({ verification: 'Please sign the message with your wallet' });
            return;
          }
          verificationData.walletSignature = formData.verificationData.walletSignature;
          break;

        default:
          setErrors({ verification: 'Invalid verification step' });
          return;
      }

      await verifyStep(verificationData);
      
      // Check if all steps are completed
      const updatedRecovery = recovery;
      const allCompleted = updatedRecovery.steps.every(step => step.isCompleted);
      
      if (allCompleted) {
        setCurrentStep('newPassword');
      }
    } catch (error) {
      // Error handled by hook
    }
  };

  // Handle wallet signature
  const handleWalletSignature = async () => {
    if (!recovery) return;

    try {
      // Check if wallet is available
      if (typeof window !== 'undefined' && (window as any).solana) {
        const wallet = (window as any).solana;
        
        if (!wallet.isConnected) {
          await wallet.connect();
        }
        
        setIsWalletConnected(true);
        
        // Create message to sign
        const message = `Account Recovery Request\nRecovery ID: ${recovery.recoveryId}\nTimestamp: ${Date.now()}`;
        const encodedMessage = new TextEncoder().encode(message);
        
        // Request signature
        const signature = await wallet.signMessage(encodedMessage);
        
        // Convert signature to base64
        const signatureBase64 = btoa(String.fromCharCode(...signature.signature));
        
        setFormData(prev => ({
          ...prev,
          verificationData: {
            ...prev.verificationData,
            walletSignature: signatureBase64,
          },
        }));
        
      } else {
        setErrors({ verification: 'Wallet not detected. Please install a Solana wallet extension.' });
      }
    } catch (error) {
      setErrors({ verification: 'Failed to sign message with wallet. Please try again.' });
    }
  };

  // Handle new password submission
  const handleNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!newPassword) {
      setErrors({ newPassword: 'New password is required' });
      return;
    }

    if (newPassword.length < 8) {
      setErrors({ newPassword: 'Password must be at least 8 characters long' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    if (!recovery) return;

    try {
      await completeRecovery(recovery.recoveryId, newPassword);
      setCurrentStep('complete');
      
      setTimeout(() => {
        onSuccess?.();
      }, 3000);
    } catch (error) {
      // Error handled by hook
    }
  };

  // Render identification step
  const renderIdentificationStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3.586l4.293-4.293A6 6 0 0115 7z" />
          </svg>
        </div>
        <h2 className="mt-4 text-2xl font-bold text-gray-900">Account Recovery</h2>
        <p className="mt-2 text-gray-600">
          Let's help you regain access to your account. Enter your account information below.
        </p>
      </div>

      <form onSubmit={handleIdentification} className="space-y-4">
        <div>
          <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
            Email, Username, or Wallet Address
          </label>
          <input
            type="text"
            id="identifier"
            value={formData.identifier}
            onChange={(e) => setFormData(prev => ({ ...prev, identifier: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.identifier ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter your email, username, or wallet address"
            disabled={isLoading}
          />
          {errors.identifier && (
            <p className="mt-1 text-sm text-red-600">{errors.identifier}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Choose Recovery Method
          </label>
          <div className="space-y-3">
            {RECOVERY_METHODS.map((method) => (
              <label key={method.value} className="flex items-start cursor-pointer">
                <input
                  type="radio"
                  name="recoveryMethod"
                  value={method.value}
                  checked={formData.recoveryMethod === method.value}
                  onChange={(e) => handleMethodSelection(e.target.value as RecoveryMethod)}
                  className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-900">{method.label}</div>
                  <div className="text-sm text-gray-600">{method.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">{errors.general}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Start Recovery'}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );

  // Render verification step
  const renderVerificationStep = () => {
    if (!recovery) return null;

    const currentRecoveryStep = recovery.steps[recoveryCurrentStep];

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-yellow-600 rounded-lg flex items-center justify-center">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">{currentRecoveryStep.title}</h2>
          <p className="mt-2 text-gray-600">{currentRecoveryStep.description}</p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            Step {recoveryCurrentStep + 1} of {recovery.steps.length}
          </p>
          <div className="mt-2 bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((recoveryCurrentStep + 1) / recovery.steps.length) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleVerification} className="space-y-4">
          {/* Email Verification */}
          {currentRecoveryStep.type === 'email_verification' && (
            <div>
              <label htmlFor="emailCode" className="block text-sm font-medium text-gray-700 mb-1">
                Verification Code
              </label>
              <input
                type="text"
                id="emailCode"
                value={formData.verificationData?.emailCode || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  verificationData: {
                    ...prev.verificationData,
                    emailCode: e.target.value,
                  },
                }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.verification ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter the code sent to your email"
                disabled={isLoading}
              />
              <p className="mt-1 text-sm text-gray-500">
                Check your email for a verification code. It may take a few minutes to arrive.
              </p>
            </div>
          )}

          {/* Security Questions */}
          {currentRecoveryStep.type === 'security_questions' && currentRecoveryStep.data?.questions && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Please answer your security questions to verify your identity.
              </p>
              {currentRecoveryStep.data.questions.map((question: any) => (
                <div key={question.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {question.question}
                  </label>
                  <input
                    type="text"
                    value={formData.verificationData?.securityAnswers?.[question.id] || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      verificationData: {
                        ...prev.verificationData,
                        securityAnswers: {
                          ...prev.verificationData?.securityAnswers,
                          [question.id]: e.target.value,
                        },
                      },
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Wallet Signature */}
          {currentRecoveryStep.type === 'wallet_signature' && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Wallet Signature Required</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      You'll need to sign a message with the wallet associated with this account to verify ownership.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleWalletSignature}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  {isWalletConnected ? 'Sign Message' : 'Connect Wallet & Sign'}
                </button>
              </div>

              {formData.verificationData?.walletSignature && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">✓ Message signed successfully</p>
                </div>
              )}
            </div>
          )}

          {errors.verification && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-800">{errors.verification}</p>
            </div>
          )}

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep('identify')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  // Render new password step
  const renderNewPasswordStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center">
          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3.586l4.293-4.293A6 6 0 0115 7z" />
          </svg>
        </div>
        <h2 className="mt-4 text-2xl font-bold text-gray-900">Create New Password</h2>
        <p className="mt-2 text-gray-600">
          Choose a strong password for your account. Make sure it's something you can remember.
        </p>
      </div>

      <form onSubmit={handleNewPassword} className="space-y-4">
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.newPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter your new password"
            disabled={isLoading}
          />
          {errors.newPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Confirm your new password"
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Password Requirements:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• At least 8 characters long</li>
            <li>• Mix of uppercase and lowercase letters</li>
            <li>• At least one number</li>
            <li>• At least one special character</li>
          </ul>
        </div>

        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">{errors.general}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !newPassword || !confirmPassword}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? 'Updating Password...' : 'Update Password'}
        </button>
      </form>
    </div>
  );

  // Render complete step
  const renderCompleteStep = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center">
        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900">Account Recovered!</h2>
      <p className="text-gray-600">
        Your account has been successfully recovered. You can now sign in with your new password.
      </p>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800">
          <strong>Important:</strong> Make sure to update your security settings and consider enabling two-factor authentication for added security.
        </p>
      </div>
    </div>
  );

  return (
    <div className={`max-w-md mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-8 ${className}`}>
      {currentStep === 'identify' && renderIdentificationStep()}
      {currentStep === 'verify' && renderVerificationStep()}
      {currentStep === 'newPassword' && renderNewPasswordStep()}
      {currentStep === 'complete' && renderCompleteStep()}
    </div>
  );
};

export default AccountRecoveryForm; 