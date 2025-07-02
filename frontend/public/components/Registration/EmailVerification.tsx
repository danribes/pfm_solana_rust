// Task 7.1.3: Public User Registration & Wallet Connection
// Email verification component

'use client';

import React, { useState, useEffect } from 'react';
import { EmailVerificationProps } from '@/types/registration';

const EmailVerification: React.FC<EmailVerificationProps> = ({
  email,
  onVerified,
  onResend,
  onChangeEmail,
  status
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = async () => {
    setIsLoading(true);
    try {
      await onResend();
      setCountdown(60);
    } catch (error) {
      console.error('Resend failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = () => {
    if (verificationCode.length === 6) {
      onVerified(verificationCode);
    }
  };

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Verify Your Email
        </h2>
        <p className="text-gray-600 mb-4">
          We've sent a verification code to <strong>{email}</strong>
        </p>
        <p className="text-sm text-gray-500">
          Enter the 6-digit code to complete your registration
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter 6-digit code"
            className="w-full max-w-xs mx-auto px-4 py-3 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            maxLength={6}
          />
        </div>

        <button
          onClick={handleVerify}
          disabled={verificationCode.length !== 6}
          className={`w-full max-w-xs mx-auto px-6 py-3 rounded-lg font-medium transition-colors ${
            verificationCode.length === 6
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Verify Email
        </button>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Didn't receive the email?
          </p>
          
          <div className="space-y-2">
            <button
              onClick={handleResend}
              disabled={!status.canResend || countdown > 0 || isLoading}
              className="text-blue-600 hover:text-blue-700 text-sm underline disabled:text-gray-400 disabled:no-underline"
            >
              {isLoading ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend verification email'}
            </button>
            
            <div className="text-sm">
              <button
                onClick={onChangeEmail}
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Use a different email address
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification; 