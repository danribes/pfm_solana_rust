// Notification Preferences Form Component
// Comprehensive form for managing notification settings across all channels

'use client';

import React, { useState, useEffect } from 'react';
import {
  NotificationPreferences,
  DeliveryChannel,
  NotificationCategory,
  NotificationFrequency,
  QuietHours,
} from '../../types/notifications';

interface NotificationPreferencesFormProps {
  initialPreferences?: Partial<NotificationPreferences>;
  onSave: (preferences: NotificationPreferences) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

interface NotificationChannelConfig {
  id: DeliveryChannel;
  name: string;
  description: string;
  icon: string;
  requiresSetup?: boolean;
  setupUrl?: string;
}

interface NotificationCategoryConfig {
  id: NotificationCategory;
  name: string;
  description: string;
  icon: string;
  examples: string[];
  defaultPriority: 'low' | 'medium' | 'high' | 'critical';
}

const NOTIFICATION_CHANNELS: NotificationChannelConfig[] = [
  {
    id: 'in-app',
    name: 'In-App Notifications',
    description: 'Notifications shown within the application',
    icon: '🔔',
  },
  {
    id: 'email',
    name: 'Email',
    description: 'Notifications sent to your email address',
    icon: '📧',
  },
  {
    id: 'push',
    name: 'Push Notifications',
    description: 'Browser or mobile push notifications',
    icon: '📱',
    requiresSetup: true,
  },
  {
    id: 'sms',
    name: 'SMS',
    description: 'Text messages sent to your phone',
    icon: '💬',
    requiresSetup: true,
    setupUrl: '/settings/phone',
  },
];

const NOTIFICATION_CATEGORIES: NotificationCategoryConfig[] = [
  {
    id: 'voting',
    name: 'Voting & Polls',
    description: 'New polls, voting reminders, and results',
    icon: '🗳️',
    examples: ['New poll created', 'Voting deadline reminder', 'Poll results available'],
    defaultPriority: 'high',
  },
  {
    id: 'community',
    name: 'Community Updates',
    description: 'Community events, announcements, and activity',
    icon: '👥',
    examples: ['New member joined', 'Community announcement', 'Event upcoming'],
    defaultPriority: 'medium',
  },
  {
    id: 'system',
    name: 'System Updates',
    description: 'Platform updates, maintenance, and technical notices',
    icon: '⚙️',
    examples: ['Platform update', 'Scheduled maintenance', 'Feature announcement'],
    defaultPriority: 'high',
  },
  {
    id: 'security',
    name: 'Security Alerts',
    description: 'Login attempts, security changes, and alerts',
    icon: '🛡️',
    examples: ['New device login', 'Password changed', 'Security alert'],
    defaultPriority: 'critical',
  },
  {
    id: 'personal',
    name: 'Personal Activity',
    description: 'Your activity, achievements, and mentions',
    icon: '👤',
    examples: ['Someone mentioned you', 'Achievement unlocked', 'Profile viewed'],
    defaultPriority: 'medium',
  },
  {
    id: 'admin',
    name: 'Admin Notifications',
    description: 'Administrative alerts and moderation notices',
    icon: '👑',
    examples: ['Moderation action needed', 'Admin message', 'System alert'],
    defaultPriority: 'high',
  },
];

const FREQUENCY_OPTIONS: { value: NotificationFrequency; label: string; description: string }[] = [
  { value: 'instant', label: 'Instant', description: 'Receive notifications immediately' },
  { value: 'batched', label: 'Batched', description: 'Receive grouped notifications periodically' },
  { value: 'daily', label: 'Daily Digest', description: 'Once per day summary' },
  { value: 'weekly', label: 'Weekly Summary', description: 'Once per week summary' },
  { value: 'never', label: 'Never', description: 'Don\'t receive these notifications' },
];

const NotificationPreferencesForm: React.FC<NotificationPreferencesFormProps> = ({
  initialPreferences,
  onSave,
  onCancel,
  isLoading = false,
  className = '',
}) => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    userId: '',
    channels: {
      'in-app': { enabled: true, frequency: 'instant' },
      'email': { enabled: true, frequency: 'batched' },
      'push': { enabled: false, frequency: 'instant' },
      'sms': { enabled: false, frequency: 'instant' },
    },
    categories: {
      'voting': { enabled: true, channels: ['in-app', 'email'], priority: 'high' },
      'community': { enabled: true, channels: ['in-app'], priority: 'medium' },
      'system': { enabled: true, channels: ['in-app', 'email'], priority: 'high' },
      'security': { enabled: true, channels: ['in-app', 'email', 'push'], priority: 'critical' },
      'personal': { enabled: true, channels: ['in-app'], priority: 'medium' },
      'admin': { enabled: true, channels: ['in-app', 'email'], priority: 'high' },
    },
    doNotDisturb: false,
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      allowUrgent: true,
    },
    lastUpdated: Date.now(),
    ...initialPreferences,
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<'channels' | 'categories' | 'schedule'>('channels');
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');

  // Check push notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setPushPermission(Notification.permission);
    }
  }, []);

  // Track changes
  useEffect(() => {
    if (initialPreferences) {
      const hasChanged = JSON.stringify(preferences) !== JSON.stringify({
        ...initialPreferences,
        lastUpdated: preferences.lastUpdated,
      });
      setHasChanges(hasChanged);
    }
  }, [preferences, initialPreferences]);

  // Handle channel toggle
  const handleChannelToggle = (channelId: DeliveryChannel, enabled: boolean) => {
    setPreferences(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channelId]: {
          ...prev.channels[channelId],
          enabled,
        },
      },
    }));
  };

  // Handle channel frequency change
  const handleChannelFrequency = (channelId: DeliveryChannel, frequency: NotificationFrequency) => {
    setPreferences(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channelId]: {
          ...prev.channels[channelId],
          frequency,
        },
      },
    }));
  };

  // Handle category toggle
  const handleCategoryToggle = (categoryId: NotificationCategory, enabled: boolean) => {
    setPreferences(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [categoryId]: {
          ...prev.categories[categoryId],
          enabled,
        },
      },
    }));
  };

  // Handle category channel selection
  const handleCategoryChannels = (categoryId: NotificationCategory, channels: DeliveryChannel[]) => {
    setPreferences(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [categoryId]: {
          ...prev.categories[categoryId],
          channels,
        },
      },
    }));
  };

  // Handle quiet hours
  const handleQuietHours = (quietHours: Partial<QuietHours>) => {
    setPreferences(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        ...quietHours,
      },
    }));
  };

  // Request push permission
  const requestPushPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);
      
      if (permission === 'granted') {
        handleChannelToggle('push', true);
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await onSave({
        ...preferences,
        lastUpdated: Date.now(),
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
    }
  };

  // Render tab navigation
  const renderTabNavigation = () => (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8">
        {[
          { id: 'channels', label: 'Channels', icon: '📱' },
          { id: 'categories', label: 'Categories', icon: '📋' },
          { id: 'schedule', label: 'Schedule', icon: '🕐' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
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
  );

  // Render channels tab
  const renderChannelsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Channels</h3>
        <p className="text-sm text-gray-600 mb-6">
          Choose how you want to receive notifications. You can enable multiple channels for different types of notifications.
        </p>
      </div>

      <div className="space-y-4">
        {NOTIFICATION_CHANNELS.map((channel) => {
          const channelPrefs = preferences.channels[channel.id];
          const isEnabled = channelPrefs?.enabled || false;

          return (
            <div key={channel.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{channel.icon}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">{channel.name}</h4>
                    <p className="text-sm text-gray-600">{channel.description}</p>
                    {channel.requiresSetup && !isEnabled && (
                      <p className="text-sm text-orange-600 mt-1">Requires setup</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {channel.id === 'push' && pushPermission !== 'granted' && (
                    <button
                      onClick={requestPushPermission}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Enable
                    </button>
                  )}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={(e) => handleChannelToggle(channel.id, e.target.checked)}
                      disabled={channel.id === 'push' && pushPermission === 'denied'}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
                  </label>
                </div>
              </div>

              {isEnabled && (
                <div className="mt-4 pl-11">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Frequency
                  </label>
                  <select
                    value={channelPrefs?.frequency || 'instant'}
                    onChange={(e) => handleChannelFrequency(channel.id, e.target.value as NotificationFrequency)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    {FREQUENCY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} - {option.description}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // Render categories tab
  const renderCategoriesTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Categories</h3>
        <p className="text-sm text-gray-600 mb-6">
          Control which types of notifications you receive and through which channels.
        </p>
      </div>

      <div className="space-y-4">
        {NOTIFICATION_CATEGORIES.map((category) => {
          const categoryPrefs = preferences.categories[category.id];
          const isEnabled = categoryPrefs?.enabled || false;
          const enabledChannels = preferences.channels;

          return (
            <div key={category.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{category.icon}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">{category.name}</h4>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) => handleCategoryToggle(category.id, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {isEnabled && (
                <div className="pl-11 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Examples
                    </label>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {category.examples.map((example, index) => (
                        <li key={index}>• {example}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Channels
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {NOTIFICATION_CHANNELS.map((channel) => {
                        const isChannelEnabled = enabledChannels[channel.id]?.enabled;
                        const isSelected = categoryPrefs?.channels?.includes(channel.id);

                        return (
                          <label
                            key={channel.id}
                            className={`flex items-center p-2 border rounded cursor-pointer transition-colors ${
                              isChannelEnabled
                                ? isSelected
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-300 hover:border-gray-400'
                                : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={!isChannelEnabled}
                              onChange={(e) => {
                                const currentChannels = categoryPrefs?.channels || [];
                                const newChannels = e.target.checked
                                  ? [...currentChannels, channel.id]
                                  : currentChannels.filter(ch => ch !== channel.id);
                                handleCategoryChannels(category.id, newChannels);
                              }}
                              className="mr-2"
                            />
                            <span className="mr-2">{channel.icon}</span>
                            <span className="text-sm">{channel.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // Render schedule tab
  const renderScheduleTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Schedule</h3>
        <p className="text-sm text-gray-600 mb-6">
          Control when you receive notifications to avoid interruptions during specific times.
        </p>
      </div>

      {/* Do Not Disturb */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Do Not Disturb</h4>
            <p className="text-sm text-gray-600">
              Temporarily pause all non-critical notifications
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.doNotDisturb}
              onChange={(e) => setPreferences(prev => ({ ...prev, doNotDisturb: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-medium text-gray-900">Quiet Hours</h4>
            <p className="text-sm text-gray-600">
              Set specific times when you don't want to receive notifications
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.quietHours?.enabled || false}
              onChange={(e) => handleQuietHours({ enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {preferences.quietHours?.enabled && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={preferences.quietHours?.startTime || '22:00'}
                  onChange={(e) => handleQuietHours({ startTime: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={preferences.quietHours?.endTime || '08:00'}
                  onChange={(e) => handleQuietHours({ endTime: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowUrgent"
                checked={preferences.quietHours?.allowUrgent || false}
                onChange={(e) => handleQuietHours({ allowUrgent: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="allowUrgent" className="text-sm text-gray-700">
                Allow urgent notifications (security alerts, critical system notifications)
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Notification Preferences</h2>
        <p className="mt-1 text-gray-600">
          Customize how and when you receive notifications to stay informed without being overwhelmed.
        </p>
      </div>

      {renderTabNavigation()}

      <form onSubmit={handleSubmit}>
        <div>
          {activeTab === 'channels' && renderChannelsTab()}
          {activeTab === 'categories' && renderCategoriesTab()}
          {activeTab === 'schedule' && renderScheduleTab()}
        </div>

        {hasChanges && (
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default NotificationPreferencesForm; 