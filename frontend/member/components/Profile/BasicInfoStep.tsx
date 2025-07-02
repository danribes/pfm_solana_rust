// Task 7.2.3: User Profile Creation & Management
// Basic information step for profile wizard

'use client';

import React, { useState, useEffect } from 'react';
import { ProfileWizardStepProps } from '../../../shared/types/profile';

interface BasicInfoStepProps {
  stepData: any;
  onUpdateStep: (step: string, data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSkip?: () => void;
  isLoading?: boolean;
  errors?: Record<string, string>;
}

export default function BasicInfoStep({
  stepData,
  onUpdateStep,
  onNext,
  onPrevious,
  isLoading,
  errors
}: BasicInfoStepProps) {
  const [formData, setFormData] = useState({
    displayName: '',
    firstName: '',
    lastName: '',
    bio: '',
    tagline: '',
    website: '',
    pronouns: '',
    location: {
      country: '',
      state: '',
      city: ''
    },
    languages: ['en'],
    ...stepData.basicInfo
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Update parent component when form data changes
  useEffect(() => {
    onUpdateStep('basicInfo', formData);
  }, [formData, onUpdateStep]);

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.displayName || formData.displayName.trim().length === 0) {
      errors.displayName = 'Display name is required';
    } else if (formData.displayName.length > 50) {
      errors.displayName = 'Display name must be 50 characters or less';
    }

    if (formData.bio && formData.bio.length > 500) {
      errors.bio = 'Bio must be 500 characters or less';
    }

    if (formData.website && !isValidUrl(formData.website)) {
      errors.website = 'Please enter a valid website URL';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }));
  };

  const handleLanguageChange = (languages: string[]) => {
    setFormData(prev => ({
      ...prev,
      languages
    }));
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  const commonLanguages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' }
  ];

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Tell us about yourself</h2>
        <p className="text-lg text-gray-600 mt-2">
          Help others get to know you better by sharing some basic information.
        </p>
      </div>

      <div className="space-y-6">
        {/* Display Name */}
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
            Display Name *
          </label>
          <input
            type="text"
            id="displayName"
            value={formData.displayName}
            onChange={(e) => handleInputChange('displayName', e.target.value)}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors.displayName ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="How should others see your name?"
            maxLength={50}
          />
          {validationErrors.displayName && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.displayName}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {formData.displayName.length}/50 characters
          </p>
        </div>

        {/* Real Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your first name"
            />
          </div>
          
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your last name"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
            Bio
          </label>
          <textarea
            id="bio"
            rows={4}
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors.bio ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Tell others a bit about yourself, your interests, and what you're passionate about..."
            maxLength={500}
          />
          {validationErrors.bio && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.bio}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {formData.bio.length}/500 characters
          </p>
        </div>

        {/* Tagline */}
        <div>
          <label htmlFor="tagline" className="block text-sm font-medium text-gray-700">
            Tagline
          </label>
          <input
            type="text"
            id="tagline"
            value={formData.tagline}
            onChange={(e) => handleInputChange('tagline', e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="A short phrase that describes you (e.g., 'Blockchain enthusiast & community builder')"
            maxLength={100}
          />
          <p className="mt-1 text-xs text-gray-500">
            Optional - A catchy phrase that represents who you are
          </p>
        </div>

        {/* Website */}
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700">
            Website
          </label>
          <input
            type="url"
            id="website"
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors.website ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="https://yourwebsite.com"
          />
          {validationErrors.website && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.website}</p>
          )}
        </div>

        {/* Pronouns */}
        <div>
          <label htmlFor="pronouns" className="block text-sm font-medium text-gray-700">
            Pronouns
          </label>
          <select
            id="pronouns"
            value={formData.pronouns}
            onChange={(e) => handleInputChange('pronouns', e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select pronouns</option>
            <option value="he/him">he/him</option>
            <option value="she/her">she/her</option>
            <option value="they/them">they/them</option>
            <option value="he/they">he/they</option>
            <option value="she/they">she/they</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location (Optional)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input
                type="text"
                placeholder="Country"
                value={formData.location.country}
                onChange={(e) => handleLocationChange('country', e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="State/Province"
                value={formData.location.state}
                onChange={(e) => handleLocationChange('state', e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="City"
                value={formData.location.city}
                onChange={(e) => handleLocationChange('city', e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Languages */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Languages You Speak
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {commonLanguages.map((lang) => (
              <label key={lang.code} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.languages.includes(lang.code)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleLanguageChange([...formData.languages, lang.code]);
                    } else {
                      handleLanguageChange(formData.languages.filter(l => l !== lang.code));
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">{lang.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Tips for a great profile:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use a clear, professional display name that represents you</li>
          <li>• Write a bio that showcases your interests and what you bring to communities</li>
          <li>• Your tagline should be memorable and capture your essence in a few words</li>
          <li>• All fields except display name are optional - you can always add more later</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t">
        <button
          onClick={onPrevious}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Previous
        </button>
        
        <button
          onClick={handleNext}
          disabled={isLoading || !formData.displayName.trim()}
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );
} 