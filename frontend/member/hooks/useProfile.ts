// Profile Management Hook for Member Portal
import { useState, useEffect, useCallback } from 'react';
import { 
  UserProfile, 
  ProfileUpdateData, 
  PrivacySettings, 
  NotificationSettings,
  ConnectedWallet,
  ProfileValidation,
  ValidationError,
  UseProfileOptions,
  UseProfileResult
} from '../types/profile';

export const useProfile = (userId?: string, options: UseProfileOptions = {}): UseProfileResult => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    includePrivateData = true,
    includeCommunities = true,
    includeActivity = true,
    autoRefresh = false
  } = options;

  // Fetch user profile
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams({
        includePrivateData: includePrivateData.toString(),
        includeCommunities: includeCommunities.toString(),
        includeActivity: includeActivity.toString(),
      });

      const endpoint = userId ? `/api/profiles/${userId}` : '/api/profile';
      const response = await fetch(`${endpoint}?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.statusText}`);
      }
      
      const data = await response.json();
      setProfile(data.profile);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [userId, includePrivateData, includeCommunities, includeActivity]);

  // Update profile information
  const updateProfile = useCallback(async (data: ProfileUpdateData): Promise<UserProfile> => {
    try {
      setError(null);
      
      // Validate data before sending
      const validation = validateProfile(data);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update profile: ${response.statusText}`);
      }
      
      const result = await response.json();
      const updatedProfile = result.profile;
      
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      console.error('Error updating profile:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Update avatar
  const updateAvatar = useCallback(async (file: File): Promise<string> => {
    try {
      setError(null);
      
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('File size must be less than 5MB');
      }

      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to upload avatar: ${response.statusText}`);
      }
      
      const result = await response.json();
      const avatarUrl = result.avatarUrl;
      
      // Update local profile state
      if (profile) {
        setProfile(prev => prev ? { ...prev, avatar: avatarUrl } : prev);
      }
      
      return avatarUrl;
    } catch (err) {
      console.error('Error uploading avatar:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload avatar';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [profile]);

  // Update privacy settings
  const updatePrivacySettings = useCallback(async (settings: Partial<PrivacySettings>): Promise<void> => {
    try {
      setError(null);
      
      const response = await fetch('/api/profile/privacy', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update privacy settings: ${response.statusText}`);
      }
      
      // Update local state
      if (profile) {
        setProfile(prev => prev ? {
          ...prev,
          privacySettings: { ...prev.privacySettings, ...settings }
        } : prev);
      }
    } catch (err) {
      console.error('Error updating privacy settings:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update privacy settings';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [profile]);

  // Update notification settings
  const updateNotificationSettings = useCallback(async (settings: Partial<NotificationSettings>): Promise<void> => {
    try {
      setError(null);
      
      const response = await fetch('/api/profile/notifications', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update notification settings: ${response.statusText}`);
      }
      
      // Update local state
      if (profile) {
        setProfile(prev => prev ? {
          ...prev,
          notificationSettings: { ...prev.notificationSettings, ...settings }
        } : prev);
      }
    } catch (err) {
      console.error('Error updating notification settings:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update notification settings';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [profile]);

  // Add wallet
  const addWallet = useCallback(async (walletData: Partial<ConnectedWallet>): Promise<void> => {
    try {
      setError(null);
      
      const response = await fetch('/api/profile/wallets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(walletData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to add wallet: ${response.statusText}`);
      }
      
      const result = await response.json();
      const newWallet = result.wallet;
      
      // Update local state
      if (profile) {
        setProfile(prev => prev ? {
          ...prev,
          wallets: [...prev.wallets, newWallet]
        } : prev);
      }
    } catch (err) {
      console.error('Error adding wallet:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add wallet';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [profile]);

  // Remove wallet
  const removeWallet = useCallback(async (walletId: string): Promise<void> => {
    try {
      setError(null);
      
      const response = await fetch(`/api/profile/wallets/${walletId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to remove wallet: ${response.statusText}`);
      }
      
      // Update local state
      if (profile) {
        setProfile(prev => prev ? {
          ...prev,
          wallets: prev.wallets.filter(wallet => wallet.id !== walletId)
        } : prev);
      }
    } catch (err) {
      console.error('Error removing wallet:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove wallet';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [profile]);

  // Validate profile data
  const validateProfile = useCallback((data: ProfileUpdateData): ProfileValidation => {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Username validation
    if (data.username) {
      if (data.username.length < 3) {
        errors.push({
          field: 'username',
          message: 'Username must be at least 3 characters long',
          code: 'USERNAME_TOO_SHORT'
        });
      }
      
      if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
        errors.push({
          field: 'username',
          message: 'Username can only contain letters, numbers, and underscores',
          code: 'USERNAME_INVALID_CHARS'
        });
      }
    }

    // Email validation
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push({
          field: 'email',
          message: 'Please enter a valid email address',
          code: 'EMAIL_INVALID'
        });
      }
    }

    // Bio validation
    if (data.bio && data.bio.length > 500) {
      errors.push({
        field: 'bio',
        message: 'Bio must be less than 500 characters',
        code: 'BIO_TOO_LONG'
      });
    }

    // Website validation
    if (data.website) {
      try {
        new URL(data.website);
      } catch {
        errors.push({
          field: 'website',
          message: 'Please enter a valid website URL',
          code: 'WEBSITE_INVALID'
        });
      }
    }

    // Social links validation
    if (data.socialLinks) {
      data.socialLinks.forEach((link, index) => {
        try {
          new URL(link.url);
        } catch {
          errors.push({
            field: `socialLinks[${index}].url`,
            message: `Invalid URL for ${link.platform}`,
            code: 'SOCIAL_LINK_INVALID'
          });
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchProfile, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [autoRefresh, fetchProfile]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    updateAvatar,
    updatePrivacySettings,
    updateNotificationSettings,
    addWallet,
    removeWallet,
    validateProfile,
    refetch: fetchProfile,
  };
};
