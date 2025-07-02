// Task 7.1.3: Public User Registration & Wallet Connection
// Registration success confirmation component

'use client';

import React from 'react';
import { UserRegistrationData, WalletConnection } from '@/types/registration';

interface SuccessConfirmationProps {
  userData: UserRegistrationData;
  walletConnection?: WalletConnection;
  onContinue: () => void;
}

const SuccessConfirmation: React.FC<SuccessConfirmationProps> = ({
  userData,
  walletConnection,
  onContinue
}) => {
  return (
    <div className="max-w-3xl mx-auto text-center">
      {/* Success animation */}
      <div className="mb-8">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to PFM Platform! 🎉
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your account has been successfully created, {userData.firstName}!
        </p>
      </div>

      {/* Account summary */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* User info */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Your Profile
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium">{userData.firstName} {userData.lastName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Username:</span>
              <span className="font-medium">@{userData.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{userData.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Interests:</span>
              <span className="font-medium">{userData.interests?.length || 0} selected</span>
            </div>
          </div>
        </div>

        {/* Wallet info */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Wallet Connection
          </h3>
          
          {walletConnection ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="flex items-center text-green-600 font-medium">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Connected
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Provider:</span>
                <span className="font-medium capitalize">{walletConnection.provider}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Address:</span>
                <span className="font-mono text-sm">
                  {walletConnection.address.slice(0, 6)}...{walletConnection.address.slice(-4)}
                </span>
              </div>
              {walletConnection.balance !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Balance:</span>
                  <span className="font-medium">{walletConnection.balance.toFixed(4)} ETH</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <span className="text-gray-500">No wallet connected</span>
              <p className="text-sm text-gray-400 mt-1">
                You can connect a wallet later in your settings
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Next steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          What's Next?
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <h4 className="font-medium text-blue-900 mb-1">Explore Communities</h4>
            <p className="text-blue-700">Discover communities that match your interests</p>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 font-bold">2</span>
            </div>
            <h4 className="font-medium text-blue-900 mb-1">Join Discussions</h4>
            <p className="text-blue-700">Participate in governance and decision-making</p>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 font-bold">3</span>
            </div>
            <h4 className="font-medium text-blue-900 mb-1">Cast Your Vote</h4>
            <p className="text-blue-700">Make your voice heard on important proposals</p>
          </div>
        </div>
      </div>

      {/* Feature highlights */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Account Security
          </h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>✓ Email verified</li>
            <li>✓ Secure password set</li>
            {walletConnection && <li>✓ Wallet connected</li>}
            <li>• Two-factor authentication (recommended)</li>
          </ul>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Getting Started
          </h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Complete your profile</li>
            <li>• Browse community directory</li>
            <li>• Read platform guidelines</li>
            <li>• Join your first community</li>
          </ul>
        </div>
      </div>

      {/* Action buttons */}
      <div className="space-y-4">
        <button
          onClick={onContinue}
          className="w-full px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Continue to Dashboard
        </button>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/communities"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Browse Communities
          </a>
          <a
            href="/profile/settings"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Account Settings
          </a>
          <a
            href="/help"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Get Help
          </a>
        </div>
      </div>

      {/* Welcome message */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-600 text-sm">
          Thank you for joining PFM Platform! We're excited to have you as part of our community. 
          If you have any questions or need assistance, our support team is here to help.
        </p>
      </div>
    </div>
  );
};

export default SuccessConfirmation; 