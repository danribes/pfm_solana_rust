'use client';

import React from 'react';
import { DocumentTextIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { RegistrationData } from '../../types/profile';

interface TermsAcceptanceProps {
  registrationData: RegistrationData;
  updateRegistrationData: (data: Partial<RegistrationData>) => void;
}

const TermsAcceptance: React.FC<TermsAcceptanceProps> = ({
  registrationData,
  updateRegistrationData
}) => {
  const handleTermsChange = (accepted: boolean) => {
    updateRegistrationData({ acceptedTerms: accepted });
  };

  const handlePrivacyChange = (accepted: boolean) => {
    updateRegistrationData({ acceptedPrivacy: accepted });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <DocumentTextIcon className="mx-auto h-12 w-12 text-blue-600" />
        <h2 className="mt-4 text-2xl font-bold text-gray-900">Terms & Privacy</h2>
        <p className="mt-2 text-gray-600">
          Please review and accept our terms of service and privacy policy
        </p>
      </div>

      <div className="space-y-6">
        {/* Terms of Service */}
        <div className="border border-gray-300 rounded-lg p-6">
          <div className="flex items-start">
            <input
              id="terms-checkbox"
              type="checkbox"
              checked={registrationData.acceptedTerms}
              onChange={(e) => handleTermsChange(e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="ml-3 flex-1">
              <label htmlFor="terms-checkbox" className="text-sm font-medium text-gray-900">
                I accept the Terms of Service *
              </label>
              <div className="mt-2 text-sm text-gray-600">
                <p className="mb-2">By accepting, you agree to:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Use the platform in accordance with community guidelines</li>
                  <li>Participate in governance processes honestly and transparently</li>
                  <li>Respect other community members and their opinions</li>
                  <li>Not engage in spam, fraud, or malicious activities</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>
                <a 
                  href="/terms" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-blue-600 hover:text-blue-500 text-xs font-medium"
                >
                  Read full Terms of Service →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Policy */}
        <div className="border border-gray-300 rounded-lg p-6">
          <div className="flex items-start">
            <input
              id="privacy-checkbox"
              type="checkbox"
              checked={registrationData.acceptedPrivacy}
              onChange={(e) => handlePrivacyChange(e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="ml-3 flex-1">
              <label htmlFor="privacy-checkbox" className="text-sm font-medium text-gray-900">
                I accept the Privacy Policy *
              </label>
              <div className="mt-2 text-sm text-gray-600">
                <p className="mb-2">Our privacy policy covers:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>What personal information we collect and why</li>
                  <li>How we use and protect your data</li>
                  <li>Your rights regarding your personal information</li>
                  <li>How we share information with third parties</li>
                  <li>Data retention and deletion policies</li>
                </ul>
                <a 
                  href="/privacy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-blue-600 hover:text-blue-500 text-xs font-medium"
                >
                  Read full Privacy Policy →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Data Usage Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <ShieldCheckIcon className="h-5 w-5 text-blue-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-900">Your Data & Privacy Rights</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>We collect minimal data necessary for platform functionality</li>
                  <li>Your wallet address is public by nature of blockchain technology</li>
                  <li>You can control visibility of your profile information</li>
                  <li>You can request data export or account deletion anytime</li>
                  <li>We never sell your personal information to third parties</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Consents */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900">Optional Preferences</h3>
          
          <div className="space-y-3">
            <label className="flex items-start">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700">
                Send me email updates about governance proposals and community news
              </span>
            </label>
            
            <label className="flex items-start">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700">
                Allow community members to send me direct messages
              </span>
            </label>
            
            <label className="flex items-start">
              <input
                type="checkbox"
                defaultChecked
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700">
                Help improve the platform by sharing anonymous usage analytics
              </span>
            </label>
          </div>
        </div>

        {/* Legal Notice */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Important Legal Information</h4>
          <div className="text-xs text-gray-600 space-y-2">
            <p>
              This platform facilitates decentralized governance and is not a financial service. 
              Participation in governance activities may have legal implications in your jurisdiction.
            </p>
            <p>
              You are responsible for understanding and complying with all applicable laws 
              regarding cryptocurrency, governance tokens, and decentralized autonomous organizations (DAOs).
            </p>
            <p>
              The platform operators are not liable for any losses incurred through participation 
              in governance activities or token-related transactions.
            </p>
          </div>
        </div>

        {/* Acceptance Status */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            * Required to complete registration
          </p>
          {registrationData.acceptedTerms && registrationData.acceptedPrivacy ? (
            <p className="mt-2 text-sm text-green-600 font-medium">
              ✓ All required agreements accepted
            </p>
          ) : (
            <p className="mt-2 text-sm text-red-600">
              Please accept both the Terms of Service and Privacy Policy to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TermsAcceptance;
