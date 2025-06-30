// Registration Management Hook for Member Portal
import { useState, useCallback, useMemo } from 'react';
import { 
  RegistrationData, 
  RegistrationStep, 
  RegistrationProgress,
  WalletConnectionData,
  ValidationError,
  WalletType,
  UserProfile,
  UseRegistrationResult
} from '../types/profile';

export const useRegistration = (): UseRegistrationResult => {
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    walletAddress: '',
    walletType: WalletType.PHANTOM,
    acceptedTerms: false,
    acceptedPrivacy: false,
    selectedCommunities: [],
  });
  
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Define registration steps
  const steps: RegistrationStep[] = useMemo(() => [
    {
      id: 'wallet',
      title: 'Connect Wallet',
      description: 'Connect your crypto wallet to get started',
      isCompleted: !!registrationData.walletAddress,
      isActive: currentStep === 0,
      isOptional: false,
      component: 'WalletConnection'
    },
    {
      id: 'profile',
      title: 'Create Profile',
      description: 'Set up your basic profile information',
      isCompleted: !!(registrationData.username || registrationData.displayName),
      isActive: currentStep === 1,
      isOptional: false,
      component: 'ProfileSetup'
    },
    {
      id: 'communities',
      title: 'Join Communities',
      description: 'Select communities you want to join',
      isCompleted: registrationData.selectedCommunities.length > 0,
      isActive: currentStep === 2,
      isOptional: true,
      component: 'CommunitySelection'
    },
    {
      id: 'terms',
      title: 'Terms & Privacy',
      description: 'Accept terms of service and privacy policy',
      isCompleted: registrationData.acceptedTerms && registrationData.acceptedPrivacy,
      isActive: currentStep === 3,
      isOptional: false,
      component: 'TermsAcceptance'
    },
    {
      id: 'complete',
      title: 'Complete Registration',
      description: 'Review and finish your registration',
      isCompleted: false,
      isActive: currentStep === 4,
      isOptional: false,
      component: 'RegistrationComplete'
    }
  ], [registrationData, currentStep]);

  // Calculate registration progress
  const progress: RegistrationProgress = useMemo(() => {
    const completedSteps = steps.filter(step => step.isCompleted).map(step => step.id);
    const requiredSteps = steps.filter(step => !step.isOptional);
    const completedRequiredSteps = requiredSteps.filter(step => step.isCompleted);
    
    const canProceed = currentStep === 0 || steps[currentStep - 1]?.isCompleted || steps[currentStep - 1]?.isOptional;
    
    return {
      currentStep,
      totalSteps: steps.length,
      completedSteps,
      canProceed,
      errors: []
    };
  }, [steps, currentStep]);

  // Update registration data
  const updateRegistrationData = useCallback((data: Partial<RegistrationData>) => {
    setRegistrationData(prev => ({ ...prev, ...data }));
    setError(null);
  }, []);

  // Move to next step
  const nextStep = useCallback(() => {
    const currentStepData = steps[currentStep];
    
    if (!currentStepData) return;
    
    // Validate current step
    const validationErrors = validateStep(currentStepData.id);
    if (validationErrors.length > 0) {
      setError(`Please fix the following errors: ${validationErrors.map(e => e.message).join(', ')}`);
      return;
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setError(null);
    }
  }, [currentStep, steps]);

  // Move to previous step
  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setError(null);
    }
  }, [currentStep]);

  // Connect wallet
  const connectWallet = useCallback(async (walletType: WalletType): Promise<WalletConnectionData> => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate wallet connection - replace with actual wallet integration
      const response = await fetch('/api/auth/connect-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletType }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to connect wallet: ${response.statusText}`);
      }
      
      const walletData = await response.json();
      
      // Update registration data
      updateRegistrationData({
        walletAddress: walletData.address,
        walletType: walletType,
      });
      
      return walletData;
    } catch (err) {
      console.error('Error connecting wallet:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [updateRegistrationData]);

  // Validate specific step
  const validateStep = useCallback((stepId: string): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    switch (stepId) {
      case 'wallet':
        if (!registrationData.walletAddress) {
          errors.push({
            field: 'walletAddress',
            message: 'Please connect your wallet',
            code: 'WALLET_REQUIRED'
          });
        }
        break;
        
      case 'profile':
        if (!registrationData.username && !registrationData.displayName) {
          errors.push({
            field: 'profile',
            message: 'Please provide a username or display name',
            code: 'PROFILE_NAME_REQUIRED'
          });
        }
        
        if (registrationData.username && registrationData.username.length < 3) {
          errors.push({
            field: 'username',
            message: 'Username must be at least 3 characters long',
            code: 'USERNAME_TOO_SHORT'
          });
        }
        
        if (registrationData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registrationData.email)) {
          errors.push({
            field: 'email',
            message: 'Please enter a valid email address',
            code: 'EMAIL_INVALID'
          });
        }
        break;
        
      case 'communities':
        // Communities are optional, so no validation errors
        break;
        
      case 'terms':
        if (!registrationData.acceptedTerms) {
          errors.push({
            field: 'acceptedTerms',
            message: 'Please accept the terms of service',
            code: 'TERMS_NOT_ACCEPTED'
          });
        }
        
        if (!registrationData.acceptedPrivacy) {
          errors.push({
            field: 'acceptedPrivacy',
            message: 'Please accept the privacy policy',
            code: 'PRIVACY_NOT_ACCEPTED'
          });
        }
        break;
    }
    
    return errors;
  }, [registrationData]);

  // Complete registration
  const completeRegistration = useCallback(async (): Promise<UserProfile> => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate all required steps
      const allErrors: ValidationError[] = [];
      steps.forEach(step => {
        if (!step.isOptional) {
          const stepErrors = validateStep(step.id);
          allErrors.push(...stepErrors);
        }
      });
      
      if (allErrors.length > 0) {
        throw new Error(`Registration incomplete: ${allErrors.map(e => e.message).join(', ')}`);
      }
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });
      
      if (!response.ok) {
        throw new Error(`Registration failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Store auth token if provided
      if (result.token) {
        localStorage.setItem('auth_token', result.token);
      }
      
      return result.profile;
    } catch (err) {
      console.error('Error completing registration:', err);
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [registrationData, steps, validateStep]);

  // Reset registration
  const reset = useCallback(() => {
    setRegistrationData({
      walletAddress: '',
      walletType: WalletType.PHANTOM,
      acceptedTerms: false,
      acceptedPrivacy: false,
      selectedCommunities: [],
    });
    setCurrentStep(0);
    setError(null);
  }, []);

  return {
    registrationData,
    progress,
    loading,
    error,
    updateRegistrationData,
    nextStep,
    previousStep,
    completeRegistration,
    connectWallet,
    validateStep,
    reset,
  };
};
