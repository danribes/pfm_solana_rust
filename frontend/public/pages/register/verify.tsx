// Task 7.1.3: Public User Registration & Wallet Connection
// Email verification page

import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { verifyEmail } from '@/services/emailVerification';

const VerifyEmailPage: NextPage = () => {
  const router = useRouter();
  const { token } = router.query;
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (token && typeof token === 'string') {
      handleVerification(token);
    }
  }, [token]);

  const handleVerification = async (verificationToken: string) => {
    try {
      const isVerified = await verifyEmail(verificationToken);
      if (isVerified) {
        setVerificationStatus('success');
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } else {
        setVerificationStatus('error');
        setErrorMessage('Verification failed. The token may be invalid or expired.');
      }
    } catch (error) {
      setVerificationStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Verification failed');
    }
  };

  return (
    <>
      <Head>
        <title>Verify Email - PFM Platform</title>
        <meta name="description" content="Verify your email address to complete your PFM Platform registration" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            {verificationStatus === 'loading' && (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h2 className="text-2xl font-bold text-gray-900">Verifying your email...</h2>
                <p className="mt-2 text-gray-600">Please wait while we verify your email address.</p>
              </>
            )}

            {verificationStatus === 'success' && (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Email Verified!</h2>
                <p className="mt-2 text-gray-600">
                  Your email has been successfully verified. You will be redirected to your dashboard shortly.
                </p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Continue to Dashboard
                </button>
              </>
            )}

            {verificationStatus === 'error' && (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Verification Failed</h2>
                <p className="mt-2 text-gray-600">{errorMessage}</p>
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => router.push('/register')}
                    className="block w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Start Registration Again
                  </button>
                  <button
                    onClick={() => router.push('/support')}
                    className="block w-full px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Contact Support
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default VerifyEmailPage; 