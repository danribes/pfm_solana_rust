// Task 7.2.3: User Profile Creation & Management
// React hooks for profile state management and operations

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  UserProfile,
  ProfileError,
  VerificationStatus,
  ProfileAvatar,
  UseProfileResult,
  UseVerificationResult,
  UseProfileWizardResult,
  ProfileWizardState,
  ProfileWizardStepData,
  PROFILE_WIZARD_STEPS,
  ProfileWizardStep,
  WalletVerification,
  SocialVerification
} from '../types/profile';
import profileService, {
  getProfile,
  updateProfile,
  uploadAvatar,
  getVerificationStatus,
  startIdentityVerification,
  verifyWallet,
  verifySocial
} from '../services/profile';

// Main profile hook
export function useProfile(userId: string): UseProfileResult {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ProfileError | null>(null);

  // Load profile data
  const loadProfile = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const profileData = await getProfile(userId);
      setProfile(profileData);
    } catch (err) {
      setError(err as ProfileError);
      console.error('Failed to load profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Update profile data
  const updateProfileData = useCallback(async (data: Partial<UserProfile>): Promise<UserProfile> => {
    if (!userId) {
      throw new Error('User ID is required');
    }

    setIsLoading(true);
    setError(null);

    try {
      const updatedProfile = await updateProfile(userId, data);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      setError(err as ProfileError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Upload avatar
  const uploadProfileAvatar = useCallback(async (file: File): Promise<ProfileAvatar> => {
    if (!userId) {
      throw new Error('User ID is required');
    }

    setIsLoading(true);
    setError(null);

    try {
      const avatar = await uploadAvatar(userId, file);
      
      // Update profile with new avatar
      if (profile) {
        const updatedProfile = {
          ...profile,
          personalInfo: {
            ...profile.personalInfo,
            avatar
          }
        };
        setProfile(updatedProfile);
      }
      
      return avatar;
    } catch (err) {
      setError(err as ProfileError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId, profile]);

  // Delete profile
  const deleteProfile = useCallback(async (): Promise<void> => {
    if (!userId) {
      throw new Error('User ID is required');
    }

    setIsLoading(true);
    setError(null);

    try {
      await profileService.deleteProfile(userId);
      setProfile(null);
    } catch (err) {
      setError(err as ProfileError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Refresh profile
  const refreshProfile = useCallback(async (): Promise<void> => {
    await loadProfile();
  }, [loadProfile]);

  // Load profile on mount or user change
  useEffect(() => {
    if (userId) {
      loadProfile();
    }
  }, [userId, loadProfile]);

  const actions = useMemo(() => ({
    updateProfile: updateProfileData,
    uploadAvatar: uploadProfileAvatar,
    deleteProfile,
    refreshProfile
  }), [updateProfileData, uploadProfileAvatar, deleteProfile, refreshProfile]);

  return {
    profile,
    isLoading,
    error,
    actions
  };
}

// Verification hook
export function useVerification(userId: string): UseVerificationResult {
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ProfileError | null>(null);

  // Load verification status
  const loadVerificationStatus = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const status = await getVerificationStatus(userId);
      setVerificationStatus(status);
    } catch (err) {
      setError(err as ProfileError);
      console.error('Failed to load verification status:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Start identity verification
  const startIdentityVerificationProcess = useCallback(async (method: string): Promise<string> => {
    if (!userId) {
      throw new Error('User ID is required');
    }

    setIsLoading(true);
    setError(null);

    try {
      const verificationId = await startIdentityVerification(userId, method);
      await loadVerificationStatus();
      return verificationId;
    } catch (err) {
      setError(err as ProfileError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId, loadVerificationStatus]);

  // Verify wallet
  const verifyUserWallet = useCallback(async (address: string, signature: string): Promise<WalletVerification> => {
    if (!userId) {
      throw new Error('User ID is required');
    }

    setIsLoading(true);
    setError(null);

    try {
      const walletVerification = await verifyWallet(userId, address, signature);
      
      // Update verification status
      if (verificationStatus) {
        const updatedStatus = {
          ...verificationStatus,
          wallet: [...verificationStatus.wallet, walletVerification],
          lastUpdated: new Date().toISOString()
        };
        setVerificationStatus(updatedStatus);
      }
      
      return walletVerification;
    } catch (err) {
      setError(err as ProfileError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId, verificationStatus]);

  // Verify social account
  const verifySocialAccount = useCallback(async (platform: string, proof: string): Promise<SocialVerification> => {
    if (!userId) {
      throw new Error('User ID is required');
    }

    setIsLoading(true);
    setError(null);

    try {
      const socialVerification = await verifySocial(userId, platform, proof);
      
      // Update verification status
      if (verificationStatus) {
        const updatedStatus = {
          ...verificationStatus,
          social: [...verificationStatus.social, socialVerification],
          lastUpdated: new Date().toISOString()
        };
        setVerificationStatus(updatedStatus);
      }
      
      return socialVerification;
    } catch (err) {
      setError(err as ProfileError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId, verificationStatus]);

  // Refresh verification status
  const refreshVerification = useCallback(async (): Promise<void> => {
    await loadVerificationStatus();
  }, [loadVerificationStatus]);

  // Load verification status on mount
  useEffect(() => {
    if (userId) {
      loadVerificationStatus();
    }
  }, [userId, loadVerificationStatus]);

  const actions = useMemo(() => ({
    startIdentityVerification: startIdentityVerificationProcess,
    verifyWallet: verifyUserWallet,
    verifySocial: verifySocialAccount,
    refreshVerification
  }), [startIdentityVerificationProcess, verifyUserWallet, verifySocialAccount, refreshVerification]);

  return {
    verificationStatus,
    isLoading,
    error,
    actions
  };
}

// Profile wizard hook
export function useProfileWizard(userId: string): UseProfileWizardResult {
  const [wizardState, setWizardState] = useState<ProfileWizardState>({
    currentStep: 0,
    totalSteps: PROFILE_WIZARD_STEPS.length,
    completedSteps: new Set<number>(),
    stepData: {
      basicInfo: {},
      avatar: {},
      interests: [],
      privacy: {},
      social: {},
      professional: {}
    },
    isComplete: false,
    canProceed: false,
    errors: {}
  });

  const [isLoading, setIsLoading] = useState(false);

  // Update step data
  const updateStep = useCallback((step: string, data: any) => {
    setWizardState(prev => ({
      ...prev,
      stepData: {
        ...prev.stepData,
        [step]: { ...prev.stepData[step as keyof ProfileWizardStepData], ...data }
      },
      canProceed: true
    }));
  }, []);

  // Move to next step
  const nextStep = useCallback(() => {
    setWizardState(prev => {
      if (prev.currentStep >= prev.totalSteps - 1) return prev;

      const newCompletedSteps = new Set(prev.completedSteps);
      newCompletedSteps.add(prev.currentStep);

      return {
        ...prev,
        currentStep: prev.currentStep + 1,
        completedSteps: newCompletedSteps,
        canProceed: true,
        errors: {}
      };
    });
  }, []);

  // Move to previous step
  const previousStep = useCallback(() => {
    setWizardState(prev => {
      if (prev.currentStep <= 0) return prev;

      return {
        ...prev,
        currentStep: prev.currentStep - 1,
        canProceed: true,
        errors: {}
      };
    });
  }, []);

  // Skip current step
  const skipStep = useCallback(() => {
    setWizardState(prev => {
      const newCompletedSteps = new Set(prev.completedSteps);
      newCompletedSteps.add(prev.currentStep);

      const nextStepIndex = prev.currentStep + 1;
      if (nextStepIndex >= prev.totalSteps) {
        return { ...prev, isComplete: true };
      }

      return {
        ...prev,
        currentStep: nextStepIndex,
        completedSteps: newCompletedSteps,
        canProceed: true,
        errors: {}
      };
    });
  }, []);

  // Complete wizard and create profile
  const completeWizard = useCallback(async (): Promise<UserProfile> => {
    if (!userId) {
      throw new Error('User ID is required');
    }

    setIsLoading(true);

    try {
      const profileData: Partial<UserProfile> = {
        personalInfo: {
          displayName: wizardState.stepData.basicInfo.displayName || 'New User',
          bio: wizardState.stepData.basicInfo.bio || '',
          avatar: {
            id: 'default-avatar',
            url: '/default-avatar.png',
            thumbnailUrl: '/default-avatar-thumb.png',
            fileSize: 0,
            mimeType: 'image/png',
            uploadedAt: new Date().toISOString(),
            isDefault: true,
            source: 'generated'
          },
          languages: ['en'],
          tagline: ''
        },
        interests: wizardState.stepData.interests || [],
        socialLinks: { custom: [] }
      };

      const profile = await profileService.createProfile(userId, profileData);
      setWizardState(prev => ({ ...prev, isComplete: true }));
      return profile;
    } catch (error) {
      console.error('Failed to complete wizard:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [userId, wizardState.stepData]);

  // Save progress
  const saveProgress = useCallback(async (): Promise<void> => {
    if (!userId) return;

    try {
      const progressData = {
        userId,
        wizardState,
        savedAt: new Date().toISOString()
      };
      
      localStorage.setItem(`profile-wizard-${userId}`, JSON.stringify(progressData));
    } catch (error) {
      console.error('Failed to save wizard progress:', error);
    }
  }, [userId, wizardState]);

  const actions = useMemo(() => ({
    updateStep,
    nextStep,
    previousStep,
    skipStep,
    completeWizard,
    saveProgress
  }), [updateStep, nextStep, previousStep, skipStep, completeWizard, saveProgress]);

  return {
    wizardState: {
      ...wizardState,
      isLoading
    },
    actions
  };
} 