'use client';

import React from 'react';
import { CheckCircleIcon, UserGroupIcon, WalletIcon, CogIcon } from '@heroicons/react/24/outline';
import { RegistrationData } from '../../types/profile';

interface RegistrationCompleteProps {
  registrationData: RegistrationData;
  updateRegistrationData: (data: Partial<RegistrationData>) => void;
}

const RegistrationComplete: React.FC<RegistrationCompleteProps> = ({
  registrationData
}) => {
  const getSelectedCommunitiesCount = () => registrationData.selectedCommunities.length;
  
  const hasRequiredInfo = () => {
    return registrationData.walletAddress &&
           (registrationData.username || registrationData.displayName) &&
           registrationData.acceptedTerms &&
           registrationData.acceptedPrivacy;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircleIcon className="mx-auto h-16 w-16 text-green-600" />
        <h2 className="mt-4 text-3xl font-bold text-gray-900">Almost Done!</h2>
        <p className="mt-2 text-gray-600">
          Review your registration details and complete your account setup
        </p>
      </div>

      {/* Registration Summary */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Registration Summary</h3>
        </div>
        
        <div className="px-6 py-4 space-y-4">
          {/* Wallet Information */}
          <div className="flex items-center">
            <WalletIcon className="h-6 w-6 text-gray-400 mr-3" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900">Wallet Connected</h4>
              <p className="text-sm text-gray-600">
                {registrationData.walletType} - {registrationData.walletAddress?.slice(0, 8)}...{registrationData.walletAddress?.slice(-6)}
              </p>
            </div>
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
          </div>

          {/* Profile Information */}
          <div className="flex items-center">
            <svg className="h-6 w-6 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900">Profile Created</h4>
              <p className="text-sm text-gray-600">
                {registrationData.username && `@${registrationData.username}`}
                {registrationData.username && registrationData.displayName && ' • '}
                {registrationData.displayName}
                {!registrationData.username && !registrationData.displayName && 'Anonymous User'}
              </p>
            </div>
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
          </div>

          {/* Community Selection */}
          <div className="flex items-center">
            <UserGroupIcon className="h-6 w-6 text-gray-400 mr-3" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900">Communities Selected</h4>
              <p className="text-sm text-gray-600">
                {getSelectedCommunitiesCount() > 0 
                  ? `${getSelectedCommunitiesCount()} communities selected`
                  : 'No communities selected (you can join later)'
                }
              </p>
            </div>
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
          </div>

          {/* Terms Acceptance */}
          <div className="flex items-center">
            <svg className="h-6 w-6 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900">Terms Accepted</h4>
              <p className="text-sm text-gray-600">
                Terms of Service and Privacy Policy accepted
              </p>
            </div>
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4">What happens next?</h3>
        <div className="space-y-3">
          <div className="flex items-start">
            <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-xs font-medium rounded-full mr-3 mt-0.5">1</span>
            <div>
              <p className="text-sm font-medium text-blue-900">Account Creation</p>
              <p className="text-sm text-blue-700">Your account will be created and linked to your wallet</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-xs font-medium rounded-full mr-3 mt-0.5">2</span>
            <div>
              <p className="text-sm font-medium text-blue-900">Community Approval</p>
              <p className="text-sm text-blue-700">
                {getSelectedCommunitiesCount() > 0 
                  ? 'Your membership requests will be reviewed by community moderators'
                  : 'You can browse and join communities from your dashboard'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-xs font-medium rounded-full mr-3 mt-0.5">3</span>
            <div>
              <p className="text-sm font-medium text-blue-900">Start Participating</p>
              <p className="text-sm text-blue-700">Begin voting on proposals and engaging with the community</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="text-center p-4 border border-gray-200 rounded-lg">
          <svg className="mx-auto h-8 w-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <h4 className="text-sm font-medium text-gray-900">Vote on Proposals</h4>
          <p className="text-xs text-gray-600 mt-1">
            Participate in governance decisions that shape the community
          </p>
        </div>
        
        <div className="text-center p-4 border border-gray-200 rounded-lg">
          <UserGroupIcon className="mx-auto h-8 w-8 text-blue-600 mb-2" />
          <h4 className="text-sm font-medium text-gray-900">Connect with Members</h4>
          <p className="text-xs text-gray-600 mt-1">
            Build relationships and collaborate with like-minded individuals
          </p>
        </div>
        
        <div className="text-center p-4 border border-gray-200 rounded-lg">
          <CogIcon className="mx-auto h-8 w-8 text-blue-600 mb-2" />
          <h4 className="text-sm font-medium text-gray-900">Customize Experience</h4>
          <p className="text-xs text-gray-600 mt-1">
            Set preferences and privacy settings to match your needs
          </p>
        </div>
      </div>

      {/* Final Check */}
      {!hasRequiredInfo() && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Missing Required Information
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Please complete all required steps before finishing registration.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {hasRequiredInfo() && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <CheckCircleIcon className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Ready to Complete Registration
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  All required information has been provided. Click "Complete Registration" 
                  to create your account and start participating in the community.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationComplete;
