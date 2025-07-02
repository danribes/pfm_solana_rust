// Task 7.2.3: User Profile Creation & Management
// Privacy settings step for profile wizard

'use client';

import React, { useState, useEffect } from 'react';
import { PrivacySettings, ProfileVisibility, VisibilityLevel, VISIBILITY_LEVELS } from '../../../shared/types/profile';

interface PrivacyStepProps {
  stepData: any;
  onUpdateStep: (step: string, data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSkip?: () => void;
  isLoading?: boolean;
  errors?: Record<string, string>;
}

export default function PrivacyStep({
  stepData,
  onUpdateStep,
  onNext,
  onPrevious,
  onSkip,
  isLoading,
  errors
}: PrivacyStepProps) {
  const [privacySettings, setPrivacySettings] = useState<Partial<PrivacySettings>>({
    profileVisibility: 'public',
    fieldVisibility: {
      personalInfo: {
        displayName: 'public',
        realName: 'private',
        bio: 'public',
        avatar: 'public',
        location: 'communities',
        languages: 'public',
        website: 'public'
      },
      professionalInfo: {
        title: 'public',
        company: 'public',
        skills: 'public',
        education: 'public',
        certifications: 'public',
        portfolio: 'public'
      },
      socialLinks: {
        twitter: 'public',
        linkedin: 'public',
        github: 'public',
        discord: 'communities',
        other: 'public'
      },
      communityData: {
        membershipList: 'public',
        activityHistory: 'communities',
        achievements: 'public',
        reputation: 'public'
      }
    },
    communitySettings: {
      defaultJoinVisibility: 'public',
      allowCommunityInvites: true,
      showActivityBetweenCommunities: false,
      allowCrossCommunityProfile: true,
      communitySpecificSettings: {}
    },
    dataSharing: {
      allowAnalytics: true,
      allowPersonalization: true,
      allowThirdPartyIntegrations: false,
      allowMarketingCommunications: false,
      dataRetentionPeriod: 365,
      autoDeleteInactiveData: false
    },
    communicationPreferences: {
      email: {
        enabled: true,
        frequency: 'weekly',
        types: ['community_updates', 'achievement_unlocked']
      },
      push: {
        enabled: true,
        quietHours: {
          enabled: true,
          start: '22:00',
          end: '08:00'
        },
        types: ['mentions', 'direct_messages']
      },
      inApp: {
        enabled: true,
        types: ['mentions', 'direct_messages', 'community_updates', 'achievement_unlocked']
      }
    },
    ...stepData.privacy
  });

  const [activeTab, setActiveTab] = useState<'visibility' | 'community' | 'data' | 'communication'>('visibility');

  // Update parent component when privacy settings change
  useEffect(() => {
    onUpdateStep('privacy', privacySettings);
  }, [privacySettings, onUpdateStep]);

  const updateFieldVisibility = (section: string, field: string, visibility: VisibilityLevel) => {
    setPrivacySettings(prev => ({
      ...prev,
      fieldVisibility: {
        ...prev.fieldVisibility,
        [section]: {
          ...prev.fieldVisibility?.[section],
          [field]: visibility
        }
      }
    }));
  };

  const updateProfileVisibility = (visibility: ProfileVisibility) => {
    setPrivacySettings(prev => ({
      ...prev,
      profileVisibility: visibility
    }));
  };

  const updateCommunitySettings = (setting: string, value: any) => {
    setPrivacySettings(prev => ({
      ...prev,
      communitySettings: {
        ...prev.communitySettings,
        [setting]: value
      }
    }));
  };

  const updateDataSharing = (setting: string, value: any) => {
    setPrivacySettings(prev => ({
      ...prev,
      dataSharing: {
        ...prev.dataSharing,
        [setting]: value
      }
    }));
  };

  const VisibilitySelect = ({ value, onChange, label }: { 
    value: VisibilityLevel; 
    onChange: (value: VisibilityLevel) => void;
    label: string;
  }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as VisibilityLevel)}
        className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
      >
        {Object.entries(VISIBILITY_LEVELS).map(([level, description]) => (
          <option key={level} value={level}>
            {description}
          </option>
        ))}
      </select>
    </div>
  );

  const renderVisibilityTab = () => (
    <div className="space-y-6">
      {/* Overall Profile Visibility */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Overall Profile Visibility</h3>
        <div className="space-y-3">
          {(['public', 'communities_only', 'friends_only', 'private'] as ProfileVisibility[]).map((visibility) => (
            <label key={visibility} className="flex items-center">
              <input
                type="radio"
                name="profileVisibility"
                value={visibility}
                checked={privacySettings.profileVisibility === visibility}
                onChange={(e) => updateProfileVisibility(e.target.value as ProfileVisibility)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-3 text-sm text-gray-700">
                {visibility === 'public' && 'Public - Anyone can view your profile'}
                {visibility === 'communities_only' && 'Communities Only - Only community members can view'}
                {visibility === 'friends_only' && 'Connections Only - Only people you\'ve connected with'}
                {visibility === 'private' && 'Private - Only you can view your profile'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Personal Information Visibility */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
        <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
          <VisibilitySelect
            value={privacySettings.fieldVisibility?.personalInfo?.displayName || 'public'}
            onChange={(value) => updateFieldVisibility('personalInfo', 'displayName', value)}
            label="Display Name"
          />
          <VisibilitySelect
            value={privacySettings.fieldVisibility?.personalInfo?.realName || 'private'}
            onChange={(value) => updateFieldVisibility('personalInfo', 'realName', value)}
            label="Real Name"
          />
          <VisibilitySelect
            value={privacySettings.fieldVisibility?.personalInfo?.bio || 'public'}
            onChange={(value) => updateFieldVisibility('personalInfo', 'bio', value)}
            label="Bio"
          />
          <VisibilitySelect
            value={privacySettings.fieldVisibility?.personalInfo?.location || 'communities'}
            onChange={(value) => updateFieldVisibility('personalInfo', 'location', value)}
            label="Location"
          />
          <VisibilitySelect
            value={privacySettings.fieldVisibility?.personalInfo?.website || 'public'}
            onChange={(value) => updateFieldVisibility('personalInfo', 'website', value)}
            label="Website"
          />
        </div>
      </div>

      {/* Social Links Visibility */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Social Links</h3>
        <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
          <VisibilitySelect
            value={privacySettings.fieldVisibility?.socialLinks?.twitter || 'public'}
            onChange={(value) => updateFieldVisibility('socialLinks', 'twitter', value)}
            label="Twitter/X"
          />
          <VisibilitySelect
            value={privacySettings.fieldVisibility?.socialLinks?.linkedin || 'public'}
            onChange={(value) => updateFieldVisibility('socialLinks', 'linkedin', value)}
            label="LinkedIn"
          />
          <VisibilitySelect
            value={privacySettings.fieldVisibility?.socialLinks?.github || 'public'}
            onChange={(value) => updateFieldVisibility('socialLinks', 'github', value)}
            label="GitHub"
          />
          <VisibilitySelect
            value={privacySettings.fieldVisibility?.socialLinks?.discord || 'communities'}
            onChange={(value) => updateFieldVisibility('socialLinks', 'discord', value)}
            label="Discord"
          />
        </div>
      </div>
    </div>
  );

  const renderCommunityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Community Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Allow Community Invites</h4>
              <p className="text-sm text-gray-500">Let communities send you invitations to join</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacySettings.communitySettings?.allowCommunityInvites || false}
                onChange={(e) => updateCommunitySettings('allowCommunityInvites', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Show Activity Between Communities</h4>
              <p className="text-sm text-gray-500">Allow communities to see your activity in other communities</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacySettings.communitySettings?.showActivityBetweenCommunities || false}
                onChange={(e) => updateCommunitySettings('showActivityBetweenCommunities', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Allow Cross-Community Profile</h4>
              <p className="text-sm text-gray-500">Use the same profile information across all communities</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacySettings.communitySettings?.allowCrossCommunityProfile !== false}
                onChange={(e) => updateCommunitySettings('allowCrossCommunityProfile', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDataTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Data Sharing Preferences</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Analytics</h4>
              <p className="text-sm text-gray-500">Help improve the platform with anonymous usage data</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacySettings.dataSharing?.allowAnalytics !== false}
                onChange={(e) => updateDataSharing('allowAnalytics', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Personalization</h4>
              <p className="text-sm text-gray-500">Customize your experience with personalized recommendations</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacySettings.dataSharing?.allowPersonalization !== false}
                onChange={(e) => updateDataSharing('allowPersonalization', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Third-Party Integrations</h4>
              <p className="text-sm text-gray-500">Allow verified third-party services to access your data</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacySettings.dataSharing?.allowThirdPartyIntegrations || false}
                onChange={(e) => updateDataSharing('allowThirdPartyIntegrations', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Marketing Communications</h4>
              <p className="text-sm text-gray-500">Receive updates about new features and platform news</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacySettings.dataSharing?.allowMarketingCommunications || false}
                onChange={(e) => updateDataSharing('allowMarketingCommunications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Privacy & Visibility</h2>
        <p className="text-lg text-gray-600 mt-2">
          Control who can see your information and how your data is used. You can always change these settings later.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'visibility', label: 'Visibility', icon: '👁️' },
            { id: 'community', label: 'Community', icon: '🏘️' },
            { id: 'data', label: 'Data', icon: '🔒' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'visibility' && renderVisibilityTab()}
        {activeTab === 'community' && renderCommunityTab()}
        {activeTab === 'data' && renderDataTab()}
      </div>

      {/* Recommendations */}
      <div className="mt-8 p-4 bg-green-50 rounded-lg">
        <h4 className="text-sm font-medium text-green-900 mb-2">🛡️ Recommended Settings:</h4>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• Keep your display name and bio public for better community connections</li>
          <li>• Set your real name to private or communities-only for privacy</li>
          <li>• Enable personalization for a better experience</li>
          <li>• You can always adjust these settings from your profile</li>
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
        
        <div className="flex space-x-3">
          {onSkip && (
            <button
              onClick={onSkip}
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              Use defaults
            </button>
          )}
          
          <button
            onClick={onNext}
            disabled={isLoading}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
