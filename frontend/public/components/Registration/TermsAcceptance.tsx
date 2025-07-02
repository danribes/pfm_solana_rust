// Task 7.1.3: Public User Registration & Wallet Connection
// Terms and privacy policy acceptance component

'use client';

import React, { useState } from 'react';
import { TermsAcceptanceProps } from '@/types/registration';

const TermsAcceptance: React.FC<TermsAcceptanceProps> = ({
  onAccept,
  onBack,
  termsUrl,
  privacyUrl,
  loading = false
}) => {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedMarketing, setAcceptedMarketing] = useState(false);
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [hasReadPrivacy, setHasReadPrivacy] = useState(false);

  const handleSubmit = () => {
    if (acceptedTerms && acceptedPrivacy) {
      onAccept({
        terms: acceptedTerms,
        privacy: acceptedPrivacy,
        marketing: acceptedMarketing
      });
    }
  };

  const openDocument = (url: string, type: 'terms' | 'privacy') => {
    window.open(url, '_blank', 'noopener,noreferrer');
    if (type === 'terms') {
      setHasReadTerms(true);
    } else {
      setHasReadPrivacy(true);
    }
  };

  const canSubmit = acceptedTerms && acceptedPrivacy && !loading;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Terms & Privacy
        </h2>
        <p className="text-gray-600">
          Please review and accept our terms of service and privacy policy to continue
        </p>
      </div>

      <div className="space-y-6">
        {/* Terms of Service */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Terms of Service
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Our terms of service outline the rules and regulations for using PFM Platform. 
                This includes user responsibilities, platform usage guidelines, and legal obligations.
              </p>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Key Points:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• User account responsibilities and security</li>
                  <li>• Acceptable use policies</li>
                  <li>• Intellectual property rights</li>
                  <li>• Limitation of liability</li>
                  <li>• Dispute resolution procedures</li>
                </ul>
              </div>

              <button
                onClick={() => openDocument(termsUrl, 'terms')}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm underline mb-3"
              >
                Read Full Terms of Service →
              </button>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="acceptTerms" className="text-sm text-gray-700">
                  <span className="font-medium">I have read and agree to the Terms of Service</span>
                  <span className="text-red-500 ml-1">*</span>
                  {hasReadTerms && (
                    <span className="ml-2 text-green-600 text-xs">✓ Viewed</span>
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Policy */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Privacy Policy
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Our privacy policy explains how we collect, use, and protect your personal information. 
                We are committed to transparency and giving you control over your data.
              </p>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-2">What we cover:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Data collection and usage</li>
                  <li>• Cookie and tracking policies</li>
                  <li>• Third-party integrations</li>
                  <li>• Data security measures</li>
                  <li>• Your privacy rights (GDPR compliant)</li>
                </ul>
              </div>

              <button
                onClick={() => openDocument(privacyUrl, 'privacy')}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm underline mb-3"
              >
                Read Full Privacy Policy →
              </button>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="acceptPrivacy"
                  checked={acceptedPrivacy}
                  onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="acceptPrivacy" className="text-sm text-gray-700">
                  <span className="font-medium">I have read and agree to the Privacy Policy</span>
                  <span className="text-red-500 ml-1">*</span>
                  {hasReadPrivacy && (
                    <span className="ml-2 text-green-600 text-xs">✓ Viewed</span>
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Marketing Consent */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Marketing Communications
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Stay updated with platform news, feature updates, and governance opportunities. 
                You can unsubscribe at any time.
              </p>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="acceptMarketing"
                  checked={acceptedMarketing}
                  onChange={(e) => setAcceptedMarketing(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="acceptMarketing" className="text-sm text-gray-700">
                  <span className="font-medium">
                    I would like to receive updates and marketing communications
                  </span>
                  <span className="text-gray-500 ml-1">(Optional)</span>
                  <p className="text-xs text-gray-500 mt-1">
                    You can change this preference in your account settings at any time.
                  </p>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-yellow-800 font-medium mb-1">Important Legal Information</h4>
              <p className="text-yellow-700 text-sm">
                By accepting these terms, you acknowledge that you are at least 18 years old and have the legal capacity to enter into this agreement. 
                If you are registering on behalf of an organization, you confirm you have the authority to bind that organization.
              </p>
            </div>
          </div>
        </div>

        {/* GDPR Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-blue-800 font-medium mb-1">Your Data Rights</h4>
              <p className="text-blue-700 text-sm">
                Under GDPR and other privacy laws, you have the right to access, modify, or delete your personal data. 
                You can exercise these rights through your account settings or by contacting our support team.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form actions */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
        {onBack && (
          <button
            onClick={onBack}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            ← Back
          </button>
        )}
        
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`flex-1 px-6 py-2 rounded-lg font-medium transition-colors ${
            canSubmit
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Account...
            </span>
          ) : (
            'Accept & Create Account'
          )}
        </button>
      </div>

      {/* Help text */}
      <div className="mt-6 text-center">
        <p className="text-gray-600 text-sm mb-2">
          Questions about our terms or privacy policy?
        </p>
        <a
          href="/legal/contact"
          className="text-blue-600 hover:text-blue-700 text-sm underline"
        >
          Contact our legal team
        </a>
      </div>
    </div>
  );
};

export default TermsAcceptance; 