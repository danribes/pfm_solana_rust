// Voting Community User Profile Manager
// Enhanced profile management with voting-specific features

import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../../shared/types/profile';
import { VotingCommunityUser, VotingPreferences, VotingPrivacySettings, NotificationPreferences } from '../../../shared/types/voting';

interface VotingProfileManagerProps {
  user: VotingCommunityUser;
  onSave: (updates: Partial<VotingCommunityUser>) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const VotingProfileManager: React.FC<VotingProfileManagerProps> = ({
  user,
  onSave,
  onCancel,
  isLoading = false
}) => {
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({
    personalInfo: user.profile.personalInfo,
    preferences: user.preferences,
    privacy: user.privacy,
    notifications: user.notifications
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const hasDataChanged = JSON.stringify(formData) !== JSON.stringify({
      personalInfo: user.profile.personalInfo,
      preferences: user.preferences,
      privacy: user.privacy,
      notifications: user.notifications
    });
    setHasChanges(hasDataChanged);
  }, [formData, user]);

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
    
    // Clear error for this field
    if (errors[`${section}.${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${section}.${field}`];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate personal info
    if (!formData.personalInfo.displayName?.trim()) {
      newErrors['personalInfo.displayName'] = 'Display name is required';
    }
    if (formData.personalInfo.displayName && formData.personalInfo.displayName.length < 2) {
      newErrors['personalInfo.displayName'] = 'Display name must be at least 2 characters';
    }
    if (formData.personalInfo.bio && formData.personalInfo.bio.length > 500) {
      newErrors['personalInfo.bio'] = 'Bio must be less than 500 characters';
    }

    // Validate preferences
    if (formData.preferences.preferredPollTypes.length === 0) {
      newErrors['preferences.preferredPollTypes'] = 'Select at least one preferred poll type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const updates: Partial<VotingCommunityUser> = {
        profile: {
          ...user.profile,
          personalInfo: formData.personalInfo
        },
        preferences: formData.preferences,
        privacy: formData.privacy,
        notifications: formData.notifications
      };

      await onSave(updates);
    } catch (error) {
      console.error('Error saving profile:', error);
      setErrors({ general: 'Failed to save profile. Please try again.' });
    }
  };

  const renderPersonalInfoTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name *
            </label>
            <input
              type="text"
              value={formData.personalInfo.displayName || ''}
              onChange={(e) => handleInputChange('personalInfo', 'displayName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors['personalInfo.displayName'] ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your display name"
            />
            {errors['personalInfo.displayName'] && (
              <p className="text-red-500 text-sm mt-1">{errors['personalInfo.displayName']}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              type="text"
              value={formData.personalInfo.firstName || ''}
              onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your first name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={formData.personalInfo.lastName || ''}
              onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your last name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <input
              type="url"
              value={formData.personalInfo.website || ''}
              onChange={(e) => handleInputChange('personalInfo', 'website', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://your-website.com"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            value={formData.personalInfo.bio || ''}
            onChange={(e) => handleInputChange('personalInfo', 'bio', e.target.value)}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors['personalInfo.bio'] ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Tell the community about yourself..."
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>{formData.personalInfo.bio?.length || 0}/500 characters</span>
            {errors['personalInfo.bio'] && (
              <span className="text-red-500">{errors['personalInfo.bio']}</span>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tagline
          </label>
          <input
            type="text"
            value={formData.personalInfo.tagline || ''}
            onChange={(e) => handleInputChange('personalInfo', 'tagline', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="A short tagline about yourself"
            maxLength={100}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Location & Languages</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <select
              value={formData.personalInfo.location?.country || ''}
              onChange={(e) => handleInputChange('personalInfo', 'location', {
                ...formData.personalInfo.location,
                country: e.target.value
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select your country</option>
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="UK">United Kingdom</option>
              <option value="AU">Australia</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
              <option value="JP">Japan</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={formData.personalInfo.timezone || ''}
              onChange={(e) => handleInputChange('personalInfo', 'timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select your timezone</option>
              <option value="UTC-8">Pacific Time (UTC-8)</option>
              <option value="UTC-7">Mountain Time (UTC-7)</option>
              <option value="UTC-6">Central Time (UTC-6)</option>
              <option value="UTC-5">Eastern Time (UTC-5)</option>
              <option value="UTC+0">UTC</option>
              <option value="UTC+1">Central European Time (UTC+1)</option>
              <option value="UTC+9">Japan Standard Time (UTC+9)</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Languages
          </label>
          <div className="flex flex-wrap gap-2">
            {['English', 'Spanish', 'French', 'German', 'Japanese', 'Chinese', 'Portuguese', 'Russian'].map((lang) => (
              <label key={lang} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.personalInfo.languages?.includes(lang) || false}
                  onChange={(e) => {
                    const currentLangs = formData.personalInfo.languages || [];
                    const newLangs = e.target.checked 
                      ? [...currentLangs, lang]
                      : currentLangs.filter(l => l !== lang);
                    handleInputChange('personalInfo', 'languages', newLangs);
                  }}
                  className="mr-2"
                />
                <span className="text-sm">{lang}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderVotingPreferencesTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Voting Preferences</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Vote Privacy
            </label>
            <select
              value={formData.preferences.defaultVotePrivacy}
              onChange={(e) => handleInputChange('preferences', 'defaultVotePrivacy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="public">Public - Others can see how I voted</option>
              <option value="anonymous">Anonymous - My vote is counted but hidden</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Poll Types *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'single_choice', label: 'Single Choice' },
                { value: 'multiple_choice', label: 'Multiple Choice' },
                { value: 'ranked_choice', label: 'Ranked Choice' },
                { value: 'approval', label: 'Approval Voting' },
                { value: 'weighted', label: 'Weighted Voting' },
                { value: 'quadratic', label: 'Quadratic Voting' }
              ].map((type) => (
                <label key={type.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.preferences.preferredPollTypes.includes(type.value as any)}
                    onChange={(e) => {
                      const current = formData.preferences.preferredPollTypes;
                      const updated = e.target.checked 
                        ? [...current, type.value]
                        : current.filter(t => t !== type.value);
                      handleInputChange('preferences', 'preferredPollTypes', updated);
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm">{type.label}</span>
                </label>
              ))}
            </div>
            {errors['preferences.preferredPollTypes'] && (
              <p className="text-red-500 text-sm mt-1">{errors['preferences.preferredPollTypes']}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reminder Frequency
            </label>
            <select
              value={formData.preferences.reminderFrequency}
              onChange={(e) => handleInputChange('preferences', 'reminderFrequency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">No reminders</option>
              <option value="daily">Daily reminders</option>
              <option value="weekly">Weekly summary</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="showResultsImmediately"
              checked={formData.preferences.showResultsImmediately}
              onChange={(e) => handleInputChange('preferences', 'showResultsImmediately', e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="showResultsImmediately" className="text-sm">
              Show poll results immediately after voting
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Category Preferences</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Blocked Categories
          </label>
          <p className="text-sm text-gray-600 mb-3">
            Polls from these categories won't appear in your feed
          </p>
          <div className="grid grid-cols-2 gap-2">
            {['Politics', 'Sports', 'Entertainment', 'Technology', 'Business', 'Health', 'Education', 'Environment'].map((category) => (
              <label key={category} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.preferences.blockedCategories.includes(category)}
                  onChange={(e) => {
                    const current = formData.preferences.blockedCategories;
                    const updated = e.target.checked 
                      ? [...current, category]
                      : current.filter(c => c !== category);
                    handleInputChange('preferences', 'blockedCategories', updated);
                  }}
                  className="mr-2"
                />
                <span className="text-sm">{category}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Poll Notifications</h4>
            <div className="space-y-2">
              {[
                { key: 'pollStarted', label: 'New polls are created' },
                { key: 'pollReminder', label: 'Reminders for active polls' },
                { key: 'pollEnding', label: 'Polls are ending soon' },
                { key: 'resultsAvailable', label: 'Poll results are available' },
                { key: 'newPollInCategory', label: 'New polls in my preferred categories' }
              ].map((item) => (
                <label key={item.key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.notifications[item.key as keyof NotificationPreferences] as boolean}
                    onChange={(e) => handleInputChange('notifications', item.key, e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Personal Notifications</h4>
            <div className="space-y-2">
              {[
                { key: 'achievementUnlocked', label: 'New achievements unlocked' },
                { key: 'reputationChanged', label: 'Reputation score changes' },
                { key: 'systemUpdates', label: 'System updates and announcements' }
              ].map((item) => (
                <label key={item.key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.notifications[item.key as keyof NotificationPreferences] as boolean}
                    onChange={(e) => handleInputChange('notifications', item.key, e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Delivery Preferences</h4>
            <div className="space-y-2">
              {[
                { key: 'email', label: 'Email notifications' },
                { key: 'push', label: 'Push notifications' },
                { key: 'in_app', label: 'In-app notifications' }
              ].map((item) => (
                <label key={item.key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.notifications.preferredDelivery.includes(item.key as any)}
                    onChange={(e) => {
                      const current = formData.notifications.preferredDelivery;
                      const updated = e.target.checked 
                        ? [...current, item.key]
                        : current.filter(d => d !== item.key);
                      handleInputChange('notifications', 'preferredDelivery', updated);
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Quiet Hours</h4>
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="quietHoursEnabled"
                checked={formData.notifications.quietHours.enabled}
                onChange={(e) => handleInputChange('notifications', 'quietHours', {
                  ...formData.notifications.quietHours,
                  enabled: e.target.checked
                })}
                className="mr-2"
              />
              <label htmlFor="quietHoursEnabled" className="text-sm">
                Enable quiet hours (no notifications during this time)
              </label>
            </div>
            
            {formData.notifications.quietHours.enabled && (
              <div className="grid grid-cols-2 gap-4 ml-6">
                <div>
                  <label className="block text-sm text-gray-600">Start time</label>
                  <input
                    type="time"
                    value={formData.notifications.quietHours.start}
                    onChange={(e) => handleInputChange('notifications', 'quietHours', {
                      ...formData.notifications.quietHours,
                      start: e.target.value
                    })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">End time</label>
                  <input
                    type="time"
                    value={formData.notifications.quietHours.end}
                    onChange={(e) => handleInputChange('notifications', 'quietHours', {
                      ...formData.notifications.quietHours,
                      end: e.target.value
                    })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Privacy Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Visibility
            </label>
            <select
              value={formData.privacy.profileVisibility}
              onChange={(e) => handleInputChange('privacy', 'profileVisibility', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="public">Public - Anyone can see my profile</option>
              <option value="members_only">Members Only - Only community members can see my profile</option>
              <option value="private">Private - Only I can see my profile</option>
            </select>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Voting History & Statistics</h4>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.privacy.showVotingHistory}
                onChange={(e) => handleInputChange('privacy', 'showVotingHistory', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Show my voting history to others</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.privacy.showStatistics}
                onChange={(e) => handleInputChange('privacy', 'showStatistics', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Show my voting statistics (participation rate, etc.)</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.privacy.allowVoteTracking}
                onChange={(e) => handleInputChange('privacy', 'allowVoteTracking', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Allow tracking of my voting patterns for analytics</span>
            </label>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Data Sharing</h4>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.privacy.shareDataForResearch}
                onChange={(e) => handleInputChange('privacy', 'shareDataForResearch', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Share anonymized data for community research and improvement</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'personal', label: 'Personal Info', component: renderPersonalInfoTab },
    { id: 'voting', label: 'Voting Preferences', component: renderVotingPreferencesTab },
    { id: 'notifications', label: 'Notifications', component: renderNotificationsTab },
    { id: 'privacy', label: 'Privacy', component: renderPrivacyTab }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Your Profile</h1>
        <p className="text-gray-600">
          Update your personal information, voting preferences, and privacy settings
        </p>
      </div>

      {errors.general && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{errors.general}</p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-8">
        <nav className="flex space-x-8 border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mb-8">
        {tabs.find(tab => tab.id === activeTab)?.component()}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        {onCancel && (
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={!hasChanges || isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {hasChanges && (
        <div className="mt-4 text-sm text-amber-600 text-center">
          You have unsaved changes
        </div>
      )}
    </div>
  );
};

export default VotingProfileManager; 