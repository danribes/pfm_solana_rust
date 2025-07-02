// Security Settings Form Component
// Comprehensive form for managing account security settings

'use client';

import React, { useState, useEffect } from 'react';
import { useSecuritySettings, useTwoFactor, useTrustedDevices } from '../../../shared/hooks/useSecurity';
import {
  SecuritySettingsFormData,
  TwoFactorMethod,
  TWO_FACTOR_METHODS,
  SECURITY_CONSTANTS,
  PasswordStrength,
  TrustedDevice,
} from '../../../shared/types/security';

interface SecuritySettingsFormProps {
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

type SettingsTab = 'password' | 'two-factor' | 'devices' | 'sessions' | 'audit';

const SecuritySettingsForm: React.FC<SecuritySettingsFormProps> = ({
  onSuccess,
  onError,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('password');
  const [formData, setFormData] = useState<SecuritySettingsFormData>({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
    twoFactorEnabled: false,
    twoFactorMethod: 'none',
    sessionTimeout: 60,
    loginNotifications: true,
    trustedDevicesEnabled: true,
    ipWhitelistEnabled: false,
    ipWhitelist: [],
    securityQuestions: [],
  });
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [pendingChanges, setPendingChanges] = useState<{ [key: string]: boolean }>({});

  const {
    settings,
    isLoading: settingsLoading,
    errors: settingsErrors,
    hasChanges,
    updateSettings,
    changePassword,
    calculatePasswordStrength,
    setErrors: setSettingsErrors,
    setHasChanges,
  } = useSecuritySettings();

  const {
    setup: twoFactorSetup,
    isLoading: twoFactorLoading,
    errors: twoFactorErrors,
    backupCodes,
    initializeSetup,
    disable: disableTwoFactor,
    regenerateBackupCodes,
  } = useTwoFactor();

  const {
    devices,
    isLoading: devicesLoading,
    removeDevice,
  } = useTrustedDevices();

  // Initialize form data from settings
  useEffect(() => {
    if (settings) {
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
        twoFactorEnabled: settings.twoFactorEnabled,
        twoFactorMethod: settings.twoFactorMethod,
        sessionTimeout: settings.sessionTimeout,
        loginNotifications: settings.loginNotifications,
        trustedDevicesEnabled: true,
        ipWhitelistEnabled: settings.ipWhitelist.length > 0,
        ipWhitelist: settings.ipWhitelist,
        securityQuestions: settings.securityQuestions,
      });
    }
  }, [settings]);

  // Calculate password strength
  useEffect(() => {
    if (formData.newPassword) {
      const strength = calculatePasswordStrength(formData.newPassword);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(null);
    }
  }, [formData.newPassword, calculatePasswordStrength]);

  // Handle form field changes
  const handleFieldChange = (field: keyof SecuritySettingsFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setPendingChanges(prev => ({ ...prev, [field]: true }));
    setHasChanges(true);
    
    // Clear specific errors
    if (settingsErrors[field]) {
      setSettingsErrors({ ...settingsErrors, [field]: undefined });
    }
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsErrors({});

    // Validation
    const errors: { [key: string]: string } = {};

    if (!formData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordStrength && passwordStrength.level === 'weak') {
      errors.newPassword = 'Password is too weak';
    }

    if (!formData.confirmNewPassword) {
      errors.confirmNewPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmNewPassword) {
      errors.confirmNewPassword = 'Passwords do not match';
    }

    if (formData.currentPassword === formData.newPassword) {
      errors.newPassword = 'New password must be different from current password';
    }

    if (Object.keys(errors).length > 0) {
      setSettingsErrors(errors);
      return;
    }

    try {
      await changePassword(formData.currentPassword, formData.newPassword);
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      }));
      onSuccess?.('Password updated successfully');
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Failed to update password');
    }
  };

  // Handle 2FA setup
  const handleTwoFactorToggle = async (enabled: boolean) => {
    if (enabled) {
      // For now, default to TOTP
      handleFieldChange('twoFactorMethod', 'totp');
      await initializeSetup('totp');
    } else {
      if (!formData.currentPassword) {
        setSettingsErrors({ currentPassword: 'Current password required to disable 2FA' });
        return;
      }
      await disableTwoFactor(formData.currentPassword);
      handleFieldChange('twoFactorEnabled', false);
      handleFieldChange('twoFactorMethod', 'none');
    }
  };

  // Handle settings save
  const handleSettingsSave = async () => {
    try {
      const updatedSettings = {
        sessionTimeout: formData.sessionTimeout,
        loginNotifications: formData.loginNotifications,
        ipWhitelist: formData.ipWhitelistEnabled ? formData.ipWhitelist : [],
      };

      await updateSettings(updatedSettings);
      setPendingChanges({});
      onSuccess?.('Security settings updated successfully');
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Failed to update security settings');
    }
  };

  // Handle device removal
  const handleRemoveDevice = async (deviceId: string, deviceName: string) => {
    if (confirm(`Remove trusted device "${deviceName}"?`)) {
      try {
        await removeDevice(deviceId);
        onSuccess?.('Trusted device removed successfully');
      } catch (error) {
        onError?.(error instanceof Error ? error.message : 'Failed to remove device');
      }
    }
  };

  // Render password strength indicator
  const PasswordStrengthIndicator: React.FC<{ strength: PasswordStrength }> = ({ strength }) => (
    <div className="mt-2">
      <div className="flex items-center space-x-2 mb-1">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              strength.level === 'weak' ? 'bg-red-500 w-1/5' :
              strength.level === 'fair' ? 'bg-orange-500 w-2/5' :
              strength.level === 'good' ? 'bg-yellow-500 w-3/5' :
              strength.level === 'strong' ? 'bg-blue-500 w-4/5' :
              'bg-green-500 w-full'
            }`}
          />
        </div>
        <span className={`text-xs font-medium ${
          strength.level === 'weak' ? 'text-red-600' :
          strength.level === 'fair' ? 'text-orange-600' :
          strength.level === 'good' ? 'text-yellow-600' :
          strength.level === 'strong' ? 'text-blue-600' :
          'text-green-600'
        }`}>
          {strength.level.charAt(0).toUpperCase() + strength.level.slice(1).replace('_', ' ')}
        </span>
      </div>
    </div>
  );

  // Render tab navigation
  const renderTabNavigation = () => {
    const tabs = [
      { id: 'password', label: 'Password', icon: '🔑' },
      { id: 'two-factor', label: 'Two-Factor Auth', icon: '🛡️' },
      { id: 'devices', label: 'Trusted Devices', icon: '📱' },
      { id: 'sessions', label: 'Sessions', icon: '⏱️' },
      { id: 'audit', label: 'Security Log', icon: '📋' },
    ] as const;

    return (
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
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
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
              {pendingChanges[tab.id] && (
                <span className="ml-1 inline-block w-2 h-2 bg-orange-400 rounded-full"></span>
              )}
            </button>
          ))}
        </nav>
      </div>
    );
  };

  // Render password tab
  const renderPasswordTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
        <p className="text-sm text-gray-600 mb-6">
          Update your password to keep your account secure. Use a strong password with at least 8 characters.
        </p>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          {/* Current Password */}
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                id="currentPassword"
                value={formData.currentPassword}
                onChange={(e) => handleFieldChange('currentPassword', e.target.value)}
                className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  settingsErrors.currentPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter your current password"
                disabled={settingsLoading}
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showPasswords.current ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  )}
                </svg>
              </button>
            </div>
            {settingsErrors.currentPassword && (
              <p className="mt-1 text-sm text-red-600">{settingsErrors.currentPassword}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                id="newPassword"
                value={formData.newPassword}
                onChange={(e) => handleFieldChange('newPassword', e.target.value)}
                className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  settingsErrors.newPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter your new password"
                disabled={settingsLoading}
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showPasswords.new ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  )}
                </svg>
              </button>
            </div>
            {settingsErrors.newPassword && (
              <p className="mt-1 text-sm text-red-600">{settingsErrors.newPassword}</p>
            )}
            {passwordStrength && <PasswordStrengthIndicator strength={passwordStrength} />}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                id="confirmNewPassword"
                value={formData.confirmNewPassword}
                onChange={(e) => handleFieldChange('confirmNewPassword', e.target.value)}
                className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  settingsErrors.confirmNewPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Confirm your new password"
                disabled={settingsLoading}
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showPasswords.confirm ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  )}
                </svg>
              </button>
            </div>
            {settingsErrors.confirmNewPassword && (
              <p className="mt-1 text-sm text-red-600">{settingsErrors.confirmNewPassword}</p>
            )}
          </div>

          {/* Last changed info */}
          {settings?.lastPasswordChange && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Last changed:</span>{' '}
                {new Date(settings.lastPasswordChange).toLocaleDateString()}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={settingsLoading || !formData.currentPassword || !formData.newPassword || !formData.confirmNewPassword}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {settingsLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );

  // Render two-factor tab
  const renderTwoFactorTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
        <p className="text-sm text-gray-600 mb-6">
          Add an extra layer of security to your account with two-factor authentication.
        </p>

        <div className="space-y-4">
          {/* 2FA Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-600">
                {formData.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <button
              onClick={() => handleTwoFactorToggle(!formData.twoFactorEnabled)}
              disabled={twoFactorLoading}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                formData.twoFactorEnabled
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              } disabled:opacity-50`}
            >
              {twoFactorLoading ? 'Processing...' : formData.twoFactorEnabled ? 'Disable' : 'Enable'}
            </button>
          </div>

          {/* Method selection */}
          {formData.twoFactorEnabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Authentication Method
              </label>
              <div className="space-y-2">
                {TWO_FACTOR_METHODS.map((method) => (
                  <div key={method.value} className="flex items-start">
                    <input
                      type="radio"
                      id={`method-${method.value}`}
                      name="twoFactorMethod"
                      value={method.value}
                      checked={formData.twoFactorMethod === method.value}
                      onChange={(e) => handleFieldChange('twoFactorMethod', e.target.value as TwoFactorMethod)}
                      disabled={method.value === 'hardware'} // Not implemented yet
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <label htmlFor={`method-${method.value}`} className="text-sm font-medium text-gray-900">
                        {method.label}
                      </label>
                      <p className="text-sm text-gray-600">{method.description}</p>
                      {method.value === 'hardware' && (
                        <p className="text-sm text-orange-600 italic">Coming soon</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Backup codes */}
          {formData.twoFactorEnabled && backupCodes.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">Backup Codes</h4>
              <p className="text-sm text-yellow-700 mb-3">
                Save these backup codes in a safe place. You can use them to access your account if you lose your authentication device.
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                {backupCodes.map((code, index) => (
                  <div key={index} className="bg-white p-2 rounded border">
                    {code}
                  </div>
                ))}
              </div>
              <button
                onClick={regenerateBackupCodes}
                className="mt-3 text-sm text-yellow-700 hover:text-yellow-800 underline"
              >
                Generate new codes
              </button>
            </div>
          )}

          {/* Errors */}
          {twoFactorErrors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{twoFactorErrors.general}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render trusted devices tab
  const renderDevicesTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Trusted Devices</h3>
        <p className="text-sm text-gray-600 mb-6">
          Manage devices that you trust for faster login. Remove any devices you no longer use.
        </p>

        {devicesLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading devices...</p>
          </div>
        ) : devices.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <p className="mt-2 text-sm text-gray-500">No trusted devices found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {devices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {device.deviceType === 'mobile' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      ) : device.deviceType === 'tablet' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      )}
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{device.deviceName}</h4>
                    <p className="text-sm text-gray-600">
                      {device.browser} on {device.os}
                    </p>
                    <p className="text-sm text-gray-500">
                      Last used: {new Date(device.lastUsed).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveDevice(device.id, device.deviceName)}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded hover:bg-red-50 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Render sessions tab
  const renderSessionsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Session Settings</h3>
        <p className="text-sm text-gray-600 mb-6">
          Configure session timeout and login notifications for enhanced security.
        </p>

        <div className="space-y-6">
          {/* Session Timeout */}
          <div>
            <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700 mb-2">
              Session Timeout (minutes)
            </label>
            <select
              id="sessionTimeout"
              value={formData.sessionTimeout}
              onChange={(e) => handleFieldChange('sessionTimeout', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
              <option value={240}>4 hours</option>
              <option value={480}>8 hours</option>
              <option value={1440}>24 hours</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              You'll be automatically logged out after this period of inactivity.
            </p>
          </div>

          {/* Login Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Login Notifications</h4>
              <p className="text-sm text-gray-600">
                Get notified when someone logs into your account
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.loginNotifications}
                onChange={(e) => handleFieldChange('loginNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Save button */}
          {hasChanges && (
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleSettingsSave}
                disabled={settingsLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
              >
                {settingsLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render audit tab
  const renderAuditTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Security Log</h3>
        <p className="text-sm text-gray-600 mb-6">
          Recent security events and activities on your account.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-2 text-sm text-gray-500">Security audit log coming soon</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
        <p className="mt-1 text-gray-600">
          Manage your account security, authentication methods, and privacy settings.
        </p>
      </div>

      {renderTabNavigation()}

      <div>
        {activeTab === 'password' && renderPasswordTab()}
        {activeTab === 'two-factor' && renderTwoFactorTab()}
        {activeTab === 'devices' && renderDevicesTab()}
        {activeTab === 'sessions' && renderSessionsTab()}
        {activeTab === 'audit' && renderAuditTab()}
      </div>
    </div>
  );
};

export default SecuritySettingsForm; 