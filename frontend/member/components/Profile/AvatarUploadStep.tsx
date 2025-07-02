// Task 7.2.3: User Profile Creation & Management
// Avatar upload step for profile wizard

'use client';

import React, { useState, useRef } from 'react';
import { ProfileAvatar } from '../../../shared/types/profile';
import { uploadAvatar } from '../../../shared/services/profile';

interface AvatarUploadStepProps {
  stepData: any;
  onUpdateStep: (step: string, data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSkip?: () => void;
  isLoading?: boolean;
  errors?: Record<string, string>;
  userId: string;
}

export default function AvatarUploadStep({
  stepData,
  onUpdateStep,
  onNext,
  onPrevious,
  onSkip,
  isLoading,
  errors,
  userId
}: AvatarUploadStepProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(stepData.avatar?.url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (file.size > maxSize) {
      setUploadError('File size must be less than 5MB');
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setUploadError('Please select a JPEG, PNG, GIF, or WebP image');
      return;
    }

    setUploadError(null);
    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
      const avatarData = await uploadAvatar(userId, file);
      
      // Update step data
      onUpdateStep('avatar', avatarData);
      
    } catch (error) {
      console.error('Avatar upload failed:', error);
      setUploadError('Failed to upload avatar. Please try again.');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateAvatar = () => {
    // Generate a default avatar based on user's initials or name
    const displayName = stepData.basicInfo?.displayName || 'User';
    const initials = displayName
      .split(' ')
      .map((name: string) => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-red-500'
    ];
    
    const colorClass = colors[Math.floor(Math.random() * colors.length)];

    const generatedAvatar: ProfileAvatar = {
      id: `generated-${Date.now()}`,
      url: `/api/avatar/generate?text=${encodeURIComponent(initials)}&bg=${colorClass.replace('bg-', '')}`,
      thumbnailUrl: `/api/avatar/generate?text=${encodeURIComponent(initials)}&bg=${colorClass.replace('bg-', '')}&size=150`,
      fileSize: 0,
      mimeType: 'image/svg+xml',
      uploadedAt: new Date().toISOString(),
      isDefault: false,
      source: 'generated'
    };

    onUpdateStep('avatar', generatedAvatar);
    setPreview(generatedAvatar.url);
  };

  const handleRemoveAvatar = () => {
    onUpdateStep('avatar', {});
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Add a profile picture</h2>
        <p className="text-lg text-gray-600 mt-2">
          Help others recognize you with a profile picture. You can upload one or generate an avatar.
        </p>
      </div>

      <div className="max-w-md mx-auto">
        {/* Current Avatar Display */}
        <div className="flex justify-center mb-8">
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Profile avatar"
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <button
                onClick={handleRemoveAvatar}
                className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
        </div>

        {/* Upload Options */}
        <div className="space-y-4">
          {/* File Upload */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Photo
                </>
              )}
            </button>
          </div>

          {/* Generate Avatar */}
          <button
            onClick={handleGenerateAvatar}
            disabled={uploading}
            className="w-full flex items-center justify-center px-6 py-3 border border-blue-300 rounded-md shadow-sm bg-blue-50 text-sm font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            Generate Avatar
          </button>
        </div>

        {/* Error Display */}
        {uploadError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{uploadError}</p>
          </div>
        )}

        {/* Guidelines */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Photo Guidelines:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Use a clear, recent photo of yourself</li>
            <li>• File size should be under 5MB</li>
            <li>• Supported formats: JPEG, PNG, GIF, WebP</li>
            <li>• Square images work best (will be cropped to circle)</li>
            <li>• Avoid group photos or images with text</li>
          </ul>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t">
        <button
          onClick={onPrevious}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Previous
        </button>
        
        <div className="flex space-x-3">
          {onSkip && (
            <button
              onClick={onSkip}
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              Skip for now
            </button>
          )}
          
          <button
            onClick={onNext}
            disabled={isLoading || uploading}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
