// Password Reset Form Component
// Two-step form for requesting and confirming password reset

'use client';

import React, { useState, useEffect } from 'react';
import { usePasswordReset } from '../../hooks/useSecurity';
import {
  PasswordResetFormData,
  PasswordResetConfirmFormData,
  SecurityQuestion,
  PasswordStrength,
} from '../../types/security';
import { calculatePasswordStrength } from '../../services/securityService';

interface PasswordResetFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  resetToken?: string;
  className?: string;
  showLogo?: boolean;
}

type FormStep = 'request' | 'confirm' | 'success';

const PasswordResetForm: React.FC<PasswordResetFormProps> = ({
  onSuccess,
  onCancel,
  resetToken: initialToken,
  className = '',
  showLogo = true,
}) => {
  const [currentStep, setCurrentStep] = useState<FormStep>(initialToken ? 'confirm' : 'request');
  const [requestData, setRequestData] = useState<PasswordResetFormData>({
    email: '',
    captcha: '',
  });
  const [confirmData, setConfirmData] = useState<PasswordResetConfirmFormData>({
    resetToken: initialToken || '',
    newPassword: '',
    confirmPassword: '',
    securityAnswers: {},
  });
  const [securityQuestions, setSecurityQuestions] = useState<SecurityQuestion[]>([]);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const {
    isLoading,
    errors,
    resetRequested,
    resetToken,
    requestReset,
    confirmReset,
    validateToken,
    setErrors,
  } = usePasswordReset();

  // Validate reset token on mount if provided
  useEffect(() => {
    if (initialToken) {
      validateToken(initialToken).then((isValid) => {
        if (!isValid) {
          setCurrentStep('request');
          setErrors({ general: 'Invalid or expired reset token' });
        }
      });
    }
  }, [initialToken, validateToken, setErrors]);

  // Update step when reset is requested
  useEffect(() => {
    if (resetRequested && !resetToken) {
      setCurrentStep('success');
    } else if (resetToken) {
      setCurrentStep('confirm');
      setConfirmData(prev => ({ ...prev, resetToken }));
    }
  }, [resetRequested, resetToken]);

  // Calculate password strength in real-time
  useEffect(() => {
    if (confirmData.newPassword) {
      const strength = calculatePasswordStrength(confirmData.newPassword);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(null);
    }
  }, [confirmData.newPassword]);

  // Handle password reset request
  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Basic validation
    if (!requestData.email) {
      setErrors({ email: 'Email is required' });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(requestData.email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    try {
      const response = await requestReset({
        email: requestData.email,
      });

      // If security questions are required, show them
      if (response.requiresSecurityQuestions && response.securityQuestions) {
        setSecurityQuestions(response.securityQuestions);
      }
    } catch (error) {
      // Error is handled by the hook
    }
  };

  // Handle password reset confirmation
  const handleConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const validationErrors: { [key: string]: string } = {};

    if (!confirmData.newPassword) {
      validationErrors.newPassword = 'New password is required';
    } else if (passwordStrength && passwordStrength.level === 'weak') {
      validationErrors.newPassword = 'Password is too weak';
    }

    if (!confirmData.confirmPassword) {
      validationErrors.confirmPassword = 'Please confirm your password';
    } else if (confirmData.newPassword !== confirmData.confirmPassword) {
      validationErrors.confirmPassword = 'Passwords do not match';
    }

    // Validate security questions if present
    securityQuestions.forEach(question => {
      const answer = confirmData.securityAnswers?.[question.id];
      if (!answer || answer.trim() === '') {
        validationErrors[`security_${question.id}`] = 'This security question is required';
      }
    });

    if (!acceptedTerms) {
      validationErrors.terms = 'You must accept the terms to continue';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await confirmReset(confirmData);
      setCurrentStep('success');
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  // Password strength indicator component
  const PasswordStrengthIndicator: React.FC<{ strength: PasswordStrength }> = ({ strength }) => (
    <div className="mt-2">
      <div className="flex items-center space-x-2 mb-1">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              strength.level === 'weak' ? 'bg-red-500 w-1/5' :
              strength.level === 'fair' ? 'bg-orange-500 w-2/5' :
              strength.level === 'good' ? 'bg-yellow-500 w-3/5' :
              strength.level === 'strong' ? 'bg-blue-500 w-4/5' :
              'bg-green-500 w-full'
            }`}
          />
        </div>
        <span className={`text-xs font-medium ${
          strength.level === 'weak' ? 'text-red-600' :
          strength.level === 'fair' ? 'text-orange-600' :
          strength.level === 'good' ? 'text-yellow-600' :
          strength.level === 'strong' ? 'text-blue-600' :
          'text-green-600'
        }`}>
          {strength.level.charAt(0).toUpperCase() + strength.level.slice(1).replace('_', ' ')}
        </span>
      </div>
      
      {strength.feedback.length > 0 && (
        <ul className="text-xs text-gray-600 space-y-1">
          {strength.feedback.map((feedback, index) => (
            <li key={index} className="flex items-center">
              <span className="text-red-400 mr-1">•</span>
              {feedback}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  // Request step
  const renderRequestStep = () => (
    <div className="space-y-6">
      {showLogo && (
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3.586l4.293-4.293A6 6 0 0115 7z" />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Reset Your Password</h2>
          <p className="mt-2 text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
      )}

      <form onSubmit={handleRequestSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={requestData.email}
            onChange={(e) => setRequestData(prev => ({ ...prev, email: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter your email address"
            disabled={isLoading}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-600">
              {errors.email}
            </p>
          )}
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
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            {isLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );

  // Confirmation step
  const renderConfirmStep = () => (
    <div className="space-y-6">
      {showLogo && (
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3.586l4.293-4.293A6 6 0 0115 7z" />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Create New Password</h2>
          <p className="mt-2 text-gray-600">
            Enter your new password below. Make sure it's strong and secure.
          </p>
        </div>
      )}

      <form onSubmit={handleConfirmSubmit} className="space-y-4">
        {/* Security Questions */}
        {securityQuestions.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Security Questions</h3>
            <p className="text-sm text-gray-600">
              Please answer your security questions to verify your identity.
            </p>
            
            {securityQuestions.map(question => (
              <div key={question.id}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {question.question}
                </label>
                <input
                  type="text"
                  value={confirmData.securityAnswers?.[question.id] || ''}
                  onChange={(e) => setConfirmData(prev => ({
                    ...prev,
                    securityAnswers: {
                      ...prev.securityAnswers,
                      [question.id]: e.target.value,
                    },
                  }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors[`security_${question.id}`] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  disabled={isLoading}
                />
                {errors[`security_${question.id}`] && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors[`security_${question.id}`]}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* New Password */}
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="newPassword"
              value={confirmData.newPassword}
              onChange={(e) => setConfirmData(prev => ({ ...prev, newPassword: e.target.value }))}
              className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.newPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Enter your new password"
              disabled={isLoading}
              aria-invalid={!!errors.newPassword}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showPassword ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                )}
              </svg>
            </button>
          </div>
          {errors.newPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
          )}
          {passwordStrength && <PasswordStrengthIndicator strength={passwordStrength} />}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmData.confirmPassword}
            onChange={(e) => setConfirmData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Confirm your new password"
            disabled={isLoading}
            aria-invalid={!!errors.confirmPassword}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Terms acceptance */}
        <div className="flex items-start">
          <input
            type="checkbox"
            id="acceptTerms"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className={`mt-1 mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
              errors.terms ? 'border-red-300' : ''
            }`}
          />
          <label htmlFor="acceptTerms" className="text-sm text-gray-700">
            I understand that changing my password will sign me out of all devices and I'll need to sign in again.
          </label>
        </div>
        {errors.terms && (
          <p className="text-sm text-red-600">{errors.terms}</p>
        )}

        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">{errors.general}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            {isLoading ? 'Updating Password...' : 'Update Password'}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );

  // Success step
  const renderSuccessStep = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center">
        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      {resetRequested && !resetToken ? (
        <>
          <h2 className="text-2xl font-bold text-gray-900">Check Your Email</h2>
          <p className="text-gray-600">
            We've sent a password reset link to your email address. 
            Please check your inbox and follow the instructions to reset your password.
          </p>
          <p className="text-sm text-gray-500">
            Didn't receive the email? Check your spam folder or try requesting another reset.
          </p>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-gray-900">Password Updated!</h2>
          <p className="text-gray-600">
            Your password has been successfully updated. You can now use your new password to sign in.
          </p>
        </>
      )}

      {onCancel && (
        <button
          onClick={onCancel}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Continue
        </button>
      )}
    </div>
  );

  return (
    <div className={`max-w-md mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-8 ${className}`}>
      {currentStep === 'request' && renderRequestStep()}
      {currentStep === 'confirm' && renderConfirmStep()}
      {currentStep === 'success' && renderSuccessStep()}
    </div>
  );
};

export default PasswordResetForm; 