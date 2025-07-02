'use client';

import React, { useState } from 'react';
import { UserIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { RegistrationData } from '../../types/profile';

interface ProfileSetupProps {
  registrationData: RegistrationData;
  updateRegistrationData: (data: Partial<RegistrationData>) => void;
  connectWallet?: (walletType: any) => Promise<any>;
  loading?: boolean;
  onNext?: () => Promise<void>;
  onPrevious?: () => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({
  registrationData,
  updateRegistrationData,
  connectWallet,
  loading,
  onNext,
  onPrevious
}) => {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof RegistrationData, value: string) => {
    updateRegistrationData({ [field]: value });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, avatar: 'Please select an image file' }));
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, avatar: 'Image size must be less than 5MB' }));
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarPreview(result);
        updateRegistrationData({ avatar: result });
      };
      reader.readAsDataURL(file);
      
      // Clear error
      if (errors.avatar) {
        setErrors(prev => ({ ...prev, avatar: '' }));
      }
    }
  };

  const validateUsername = (username: string) => {
    if (username.length < 3) {
      return 'Username must be at least 3 characters long';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    return '';
  };

  const validateEmail = (email: string) => {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const handleUsernameBlur = () => {
    if (registrationData.username) {
      const error = validateUsername(registrationData.username);
      setErrors(prev => ({ ...prev, username: error }));
    }
  };

  const handleEmailBlur = () => {
    if (registrationData.email) {
      const error = validateEmail(registrationData.email);
      setErrors(prev => ({ ...prev, email: error }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <UserIcon className="mx-auto h-12 w-12 text-blue-600" />
        <h2 className="mt-4 text-2xl font-bold text-gray-900">Create Your Profile</h2>
        <p className="mt-2 text-gray-600">
          Tell the community about yourself and customize your profile
        </p>
      </div>

      <div className="space-y-6">
        {/* Avatar Upload */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {avatarPreview || registrationData.avatar ? (
                <img
                  src={avatarPreview || registrationData.avatar}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <PhotoIcon className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
            >
              <PhotoIcon className="w-4 h-4" />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
        </div>
        
        {errors.avatar && (
          <p className="text-center text-sm text-red-600">{errors.avatar}</p>
        )}

        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username *
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="username"
              value={registrationData.username || ''}
              onChange={(e) => handleInputChange('username', e.target.value)}
              onBlur={handleUsernameBlur}
              placeholder="Enter a unique username"
              className={`
                block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
                focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                ${errors.username ? 'border-red-300' : 'border-gray-300'}
              `}
            />
          </div>
          {errors.username && (
            <p className="mt-1 text-sm text-red-600">{errors.username}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Your username will be visible to other community members
          </p>
        </div>

        {/* Display Name */}
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
            Display Name
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="displayName"
              value={registrationData.displayName || ''}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              placeholder="How should we display your name?"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            This can be different from your username and can contain spaces
          </p>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <div className="mt-1">
            <input
              type="email"
              id="email"
              value={registrationData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onBlur={handleEmailBlur}
              placeholder="your.email@example.com"
              className={`
                block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
                focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                ${errors.email ? 'border-red-300' : 'border-gray-300'}
              `}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Optional. Used for notifications and account recovery
          </p>
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
            Bio
          </label>
          <div className="mt-1">
            <textarea
              id="bio"
              rows={4}
              value={registrationData.bio || ''}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell the community about yourself, your interests, and what you hope to contribute..."
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              maxLength={500}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {(registrationData.bio || '').length}/500 characters
          </p>
        </div>

        {/* Profile Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-900">Profile Tips</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Choose a username that represents you well</li>
                  <li>Add a profile picture to help others recognize you</li>
                  <li>Write a brief bio to introduce yourself to the community</li>
                  <li>You can always update your profile later</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Required Fields Notice */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            * Required fields. At least one of Username or Display Name is required.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
