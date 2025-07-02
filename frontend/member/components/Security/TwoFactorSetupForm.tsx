// Two-Factor Authentication Setup Form
// Complete 2FA setup flow with method selection, verification, and backup codes

'use client';

import React, { useState, useEffect } from 'react';
import { useTwoFactor } from '../../../shared/hooks/useSecurity';
import {
  TwoFactorSetupFormData,
  TwoFactorMethod,
  TWO_FACTOR_METHODS,
  TwoFactorSetup,
} from '../../../shared/types/security';

interface TwoFactorSetupFormProps {
  onSuccess?: (backupCodes: string[]) => void;
  onCancel?: () => void;
  initialMethod?: TwoFactorMethod;
  className?: string;
}

type SetupStep = 'method' | 'setup' | 'verify' | 'backup' | 'complete';

const TwoFactorSetupForm: React.FC<TwoFactorSetupFormProps> = ({
  onSuccess,
  onCancel,
  initialMethod = 'totp',
  className = '',
}) => {
  const [currentStep, setCurrentStep] = useState<SetupStep>('method');
  const [formData, setFormData] = useState<TwoFactorSetupFormData>({
    method: initialMethod,
    phoneNumber: '',
    email: '',
    verificationCode: '',
    backupCodes: [],
    deviceName: '',
  });
  const [setupData, setSetupData] = useState<TwoFactorSetup | null>(null);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [isQrCodeCopied, setIsQrCodeCopied] = useState(false);
  const [isSecretCopied, setIsSecretCopied] = useState(false);

  const {
    setup,
    isLoading,
    errors,
    backupCodes,
    isVerified,
    initializeSetup,
    verifySetup,
    setErrors,
  } = useTwoFactor();

  // Update setup data when hook provides it
  useEffect(() => {
    if (setup) {
      setSetupData(setup);
      setCurrentStep('setup');
    }
  }, [setup]);

  // Move to verify step when setup is complete
  useEffect(() => {
    if (setupData && currentStep === 'setup') {
      // Auto-advance for TOTP after QR is shown
      if (formData.method === 'totp') {
        // Wait a moment for user to scan QR
        const timer = setTimeout(() => {
          setCurrentStep('verify');
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [setupData, currentStep, formData.method]);

  // Handle verification success
  useEffect(() => {
    if (isVerified && backupCodes.length > 0) {
      setFormData(prev => ({ ...prev, backupCodes }));
      setCurrentStep('backup');
    }
  }, [isVerified, backupCodes]);

  // Handle method selection
  const handleMethodSelect = async (method: TwoFactorMethod) => {
    setFormData(prev => ({ ...prev, method }));
    setErrors({});

    try {
      await initializeSetup(method);
    } catch (error) {
      // Error handled by hook
    }
  };

  // Handle setup continuation
  const handleSetupContinue = () => {
    if (formData.method === 'sms' && !formData.phoneNumber) {
      setErrors({ phoneNumber: 'Phone number is required for SMS verification' });
      return;
    }

    if (formData.method === 'email' && !formData.email) {
      setErrors({ email: 'Email address is required for email verification' });
      return;
    }

    setCurrentStep('verify');
  };

  // Handle verification
  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!formData.verificationCode) {
      setErrors({ verificationCode: 'Verification code is required' });
      return;
    }

    if (!/^\d{6}$/.test(formData.verificationCode)) {
      setErrors({ verificationCode: 'Verification code must be 6 digits' });
      return;
    }

    try {
      await verifySetup({
        code: formData.verificationCode,
        method: formData.method,
        rememberDevice,
        deviceName: formData.deviceName || `${navigator.platform} ${navigator.userAgent.split(' ')[0]}`,
      });
    } catch (error) {
      // Error handled by hook
    }
  };

  // Handle backup codes acknowledgment
  const handleBackupAcknowledgment = () => {
    setCurrentStep('complete');
    setTimeout(() => {
      onSuccess?.(formData.backupCodes);
    }, 2000);
  };

  // Copy to clipboard helper
  const copyToClipboard = async (text: string, type: 'qr' | 'secret') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'qr') {
        setIsQrCodeCopied(true);
        setTimeout(() => setIsQrCodeCopied(false), 2000);
      } else {
        setIsSecretCopied(true);
        setTimeout(() => setIsSecretCopied(false), 2000);
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  // Render method selection step
  const renderMethodStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="mt-4 text-2xl font-bold text-gray-900">Set Up Two-Factor Authentication</h2>
        <p className="mt-2 text-gray-600">
          Choose how you'd like to receive verification codes to secure your account.
        </p>
      </div>

      <div className="space-y-4">
        {TWO_FACTOR_METHODS.filter(method => method.value !== 'none').map((method) => (
          <button
            key={method.value}
            onClick={() => handleMethodSelect(method.value as TwoFactorMethod)}
            disabled={method.value === 'hardware' || isLoading}
            className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
              formData.method === method.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${method.value === 'hardware' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">{method.label}</h3>
                <p className="text-sm text-gray-600">{method.description}</p>
                {method.value === 'hardware' && (
                  <p className="text-sm text-orange-600 italic mt-1">Coming soon</p>
                )}
              </div>
              {formData.method === method.value && (
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-800">{errors.general}</p>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );

  // Render setup step
  const renderSetupStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center">
          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="mt-4 text-2xl font-bold text-gray-900">
          {formData.method === 'totp' ? 'Scan QR Code' : 
           formData.method === 'sms' ? 'Enter Phone Number' :
           'Verify Email Address'}
        </h2>
        <p className="mt-2 text-gray-600">
          {formData.method === 'totp' ? 'Use your authenticator app to scan this QR code' :
           formData.method === 'sms' ? 'We\'ll send verification codes to this number' :
           'We\'ll send verification codes to this email address'}
        </p>
      </div>

      {/* TOTP Setup */}
      {formData.method === 'totp' && setupData && (
        <div className="space-y-6">
          {/* QR Code */}
          {setupData.qrCode && (
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <img
                  src={setupData.qrCode}
                  alt="QR Code for 2FA setup"
                  className="w-48 h-48"
                />
              </div>
              <button
                onClick={() => copyToClipboard(setupData.qrCode!, 'qr')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {isQrCodeCopied ? '✓ Copied!' : 'Copy QR Code Data'}
              </button>
            </div>
          )}

          {/* Manual Entry */}
          {setupData.secret && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Can't scan? Enter manually:</h4>
              <div className="flex items-center justify-between bg-white p-3 rounded border font-mono text-sm">
                <span className="break-all">{setupData.secret}</span>
                <button
                  onClick={() => copyToClipboard(setupData.secret!, 'secret')}
                  className="ml-2 text-blue-600 hover:text-blue-800 flex-shrink-0"
                >
                  {isSecretCopied ? '✓' : 'Copy'}
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Enter this secret key into your authenticator app manually.
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Instructions:</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Open your authenticator app (Google Authenticator, Authy, etc.)</li>
              <li>Tap "Add Account" or "+" button</li>
              <li>Scan the QR code or enter the secret key manually</li>
              <li>Your app will generate a 6-digit code</li>
              <li>Enter the code below to verify setup</li>
            </ol>
          </div>
        </div>
      )}

      {/* SMS Setup */}
      {formData.method === 'sms' && (
        <div className="space-y-4">
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.phoneNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="+1 (555) 123-4567"
              disabled={isLoading}
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
            )}
          </div>
        </div>
      )}

      {/* Email Setup */}
      {formData.method === 'email' && (
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="your.email@example.com"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep('method')}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
        {formData.method !== 'totp' && (
          <button
            onClick={handleSetupContinue}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Continue'}
          </button>
        )}
      </div>
    </div>
  );

  // Render verification step
  const renderVerifyStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 bg-yellow-600 rounded-lg flex items-center justify-center">
          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="mt-4 text-2xl font-bold text-gray-900">Verify Setup</h2>
        <p className="mt-2 text-gray-600">
          Enter the 6-digit code from your{' '}
          {formData.method === 'totp' ? 'authenticator app' :
           formData.method === 'sms' ? 'text message' :
           'email'}
        </p>
      </div>

      <form onSubmit={handleVerification} className="space-y-4">
        <div>
          <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-1">
            Verification Code
          </label>
          <input
            type="text"
            id="verificationCode"
            value={formData.verificationCode}
            onChange={(e) => setFormData(prev => ({ ...prev, verificationCode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg font-mono ${
              errors.verificationCode ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="123456"
            maxLength={6}
            disabled={isLoading}
            autoComplete="one-time-code"
          />
          {errors.verificationCode && (
            <p className="mt-1 text-sm text-red-600">{errors.verificationCode}</p>
          )}
        </div>

        {/* Device name for trusted device */}
        <div>
          <label htmlFor="deviceName" className="block text-sm font-medium text-gray-700 mb-1">
            Device Name (Optional)
          </label>
          <input
            type="text"
            id="deviceName"
            value={formData.deviceName}
            onChange={(e) => setFormData(prev => ({ ...prev, deviceName: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="My laptop"
            disabled={isLoading}
          />
          <p className="mt-1 text-sm text-gray-500">
            Give this device a name to identify it in your trusted devices list.
          </p>
        </div>

        {/* Remember device */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="rememberDevice"
            checked={rememberDevice}
            onChange={(e) => setRememberDevice(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="rememberDevice" className="ml-2 text-sm text-gray-700">
            Remember this device for 30 days
          </label>
        </div>

        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">{errors.general}</p>
          </div>
        )}

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => setCurrentStep('setup')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isLoading || formData.verificationCode.length !== 6}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </form>
    </div>
  );

  // Render backup codes step
  const renderBackupStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 bg-orange-600 rounded-lg flex items-center justify-center">
          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="mt-4 text-2xl font-bold text-gray-900">Save Your Backup Codes</h2>
        <p className="mt-2 text-gray-600">
          These backup codes will let you access your account if you lose your authentication device.
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Important!</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Save these codes in a safe place</li>
                <li>Each code can only be used once</li>
                <li>Don't share these codes with anyone</li>
                <li>Generate new codes if these are compromised</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-3">
          {formData.backupCodes.map((code, index) => (
            <div key={index} className="font-mono text-sm bg-gray-50 p-3 rounded border text-center">
              {code}
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => copyToClipboard(formData.backupCodes.join('\n'), 'secret')}
            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
          >
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {isSecretCopied ? 'Copied!' : 'Copy All Codes'}
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleBackupAcknowledgment}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          I've Saved My Backup Codes
        </button>
      </div>
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
      <h2 className="text-2xl font-bold text-gray-900">Two-Factor Authentication Enabled!</h2>
      <p className="text-gray-600">
        Your account is now protected with two-factor authentication. You'll need to provide a verification code when signing in.
      </p>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800">
          <strong>Next time you sign in:</strong> You'll be asked for your password and a verification code from your{' '}
          {formData.method === 'totp' ? 'authenticator app' :
           formData.method === 'sms' ? 'phone' :
           'email'}.
        </p>
      </div>
    </div>
  );

  return (
    <div className={`max-w-md mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-8 ${className}`}>
      {currentStep === 'method' && renderMethodStep()}
      {currentStep === 'setup' && renderSetupStep()}
      {currentStep === 'verify' && renderVerifyStep()}
      {currentStep === 'backup' && renderBackupStep()}
      {currentStep === 'complete' && renderCompleteStep()}
    </div>
  );
};

export default TwoFactorSetupForm; 