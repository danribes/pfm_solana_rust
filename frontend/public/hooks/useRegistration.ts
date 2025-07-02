// Task 7.1.3: Public User Registration & Wallet Connection
// Registration state management hook

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  RegistrationStep,
  RegistrationState,
  UserRegistrationData,
  UseRegistrationResult,
  WalletConnection,
  RegistrationResponse,
  FormErrors,
  DEFAULT_REGISTRATION_CONFIG
} from '@/types/registration';

import {
  registerUser,
  trackRegistrationEvent,
  handleRegistrationError
} from '@/services/registration';

import {
  connectWallet,
  disconnectWallet,
  getCurrentConnection,
  signMessage
} from '@/services/walletConnection';

import {
  sendVerificationEmail,
  checkVerificationStatus
} from '@/services/emailVerification';

import {
  validateRegistrationStep,
  validateField,
  isStepComplete
} from '@/validation/registrationValidation';

// Step configuration
const STEP_ORDER: RegistrationStep[] = [
  'entry',
  'wallet-selection',
  'wallet-connection',
  'user-info',
  'interests',
  'terms',
  'email-verification',
  'complete'
];

const STEP_PROGRESS: Record<RegistrationStep, number> = {
  'entry': 0,
  'wallet-selection': 15,
  'wallet-connection': 30,
  'user-info': 45,
  'interests': 60,
  'terms': 75,
  'email-verification': 90,
  'complete': 100
};

// Default user data
const getDefaultUserData = (): Partial<UserRegistrationData> => ({
  email: '',
  username: '',
  firstName: '',
  lastName: '',
  password: '',
  confirmPassword: '',
  interests: [],
  marketingConsent: false,
  termsAccepted: false,
  privacyPolicyAccepted: false,
  language: 'English'
});

// Main registration hook
export function useRegistration(initialStep: RegistrationStep = 'entry'): UseRegistrationResult {
  // Core state
  const [state, setState] = useState<RegistrationState>({
    currentStep: initialStep,
    completedSteps: [],
    userData: getDefaultUserData(),
    walletConnection: undefined,
    errors: {},
    isLoading: false,
    canGoBack: false,
    canGoNext: false,
    progress: STEP_PROGRESS[initialStep]
  });

  // Refs for tracking
  const stepStartTimes = useRef<{ [key: string]: number }>({});
  const registrationStartTime = useRef<number>(Date.now());

  // Initialize step tracking
  useEffect(() => {
    stepStartTimes.current[state.currentStep] = Date.now();
    trackRegistrationEvent('step_started', state.currentStep, {
      progress: state.progress,
      hasWallet: !!state.walletConnection
    });
  }, [state.currentStep]);

  // Update navigation state
  useEffect(() => {
    const currentIndex = STEP_ORDER.indexOf(state.currentStep);
    const canGoBack = currentIndex > 0 && state.currentStep !== 'complete';
    const canGoNext = validateCurrentStep() && state.currentStep !== 'complete';

    setState(prev => ({
      ...prev,
      canGoBack,
      canGoNext,
      progress: STEP_PROGRESS[state.currentStep]
    }));
  }, [state.currentStep, state.userData, state.walletConnection, state.errors]);

  // Wallet connection monitoring
  useEffect(() => {
    const connection = getCurrentConnection();
    if (connection && !state.walletConnection) {
      setState(prev => ({
        ...prev,
        walletConnection: connection,
        userData: {
          ...prev.userData,
          walletAddress: connection.address,
          walletProvider: connection.provider
        }
      }));
    }
  }, [state.walletConnection]);

  // Validation helper
  const validateCurrentStep = useCallback((): boolean => {
    switch (state.currentStep) {
      case 'entry':
        return true; // Always can proceed from entry
        
      case 'wallet-selection':
        return true; // Can proceed without wallet selection
        
      case 'wallet-connection':
        return !!state.walletConnection?.isConnected;
        
      case 'user-info':
        return isStepComplete('user-info', state.userData);
        
      case 'interests':
        return isStepComplete('interests', state.userData);
        
      case 'terms':
        return isStepComplete('terms', state.userData);
        
      case 'email-verification':
        return true; // Verification is handled separately
        
      default:
        return false;
    }
  }, [state.currentStep, state.userData, state.walletConnection]);

  // Actions
  const actions = {
    // Set current step
    setCurrentStep: useCallback((step: RegistrationStep) => {
      // Track step completion if moving forward
      const currentIndex = STEP_ORDER.indexOf(state.currentStep);
      const newIndex = STEP_ORDER.indexOf(step);
      
      if (newIndex > currentIndex) {
        const completedSteps = [...state.completedSteps];
        if (!completedSteps.includes(state.currentStep)) {
          completedSteps.push(state.currentStep);
          
          // Track completion
          trackRegistrationEvent('step_completed', state.currentStep, {
            duration: Date.now() - stepStartTimes.current[state.currentStep],
            progress: STEP_PROGRESS[step]
          });
        }
        
        setState(prev => ({ ...prev, completedSteps }));
      }

      setState(prev => ({
        ...prev,
        currentStep: step,
        errors: {} // Clear errors when changing steps
      }));
    }, [state.currentStep, state.completedSteps]),

    // Update user data
    updateUserData: useCallback((data: Partial<UserRegistrationData>) => {
      setState(prev => ({
        ...prev,
        userData: { ...prev.userData, ...data },
        errors: {} // Clear errors when updating data
      }));
    }, []),

    // Set wallet connection
    setWalletConnection: useCallback((connection: WalletConnection) => {
      setState(prev => ({
        ...prev,
        walletConnection: connection,
        userData: {
          ...prev.userData,
          walletAddress: connection.address,
          walletProvider: connection.provider
        }
      }));
    }, []),

    // Set error
    setError: useCallback((field: string, error: string) => {
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, [field]: error }
      }));
    }, []),

    // Clear errors
    clearErrors: useCallback(() => {
      setState(prev => ({ ...prev, errors: {} }));
    }, []),

    // Go to next step
    goNext: useCallback(async () => {
      if (!validateCurrentStep()) {
        return;
      }

      const currentIndex = STEP_ORDER.indexOf(state.currentStep);
      if (currentIndex < STEP_ORDER.length - 1) {
        const nextStep = STEP_ORDER[currentIndex + 1];
        
        // Skip wallet steps if wallet not required/selected
        if ((nextStep === 'wallet-selection' || nextStep === 'wallet-connection') && 
            !DEFAULT_REGISTRATION_CONFIG.enableWalletConnection) {
          const afterWalletIndex = STEP_ORDER.indexOf('user-info');
          actions.setCurrentStep(STEP_ORDER[afterWalletIndex]);
        } else {
          actions.setCurrentStep(nextStep);
        }
      }
    }, [state.currentStep, validateCurrentStep]),

    // Go to previous step
    goBack: useCallback(() => {
      const currentIndex = STEP_ORDER.indexOf(state.currentStep);
      if (currentIndex > 0) {
        const prevStep = STEP_ORDER[currentIndex - 1];
        
        // Skip wallet steps if going back and wallet not enabled
        if ((prevStep === 'wallet-connection' || prevStep === 'wallet-selection') && 
            !DEFAULT_REGISTRATION_CONFIG.enableWalletConnection) {
          const beforeWalletIndex = STEP_ORDER.indexOf('entry');
          actions.setCurrentStep(STEP_ORDER[beforeWalletIndex]);
        } else {
          actions.setCurrentStep(prevStep);
        }
      }
    }, [state.currentStep]),

    // Reset registration
    reset: useCallback(() => {
      setState({
        currentStep: 'entry',
        completedSteps: [],
        userData: getDefaultUserData(),
        walletConnection: undefined,
        errors: {},
        isLoading: false,
        canGoBack: false,
        canGoNext: true,
        progress: 0
      });

      // Disconnect wallet
      disconnectWallet();
      
      // Reset tracking
      stepStartTimes.current = {};
      registrationStartTime.current = Date.now();
    }, []),

    // Submit registration
    submitRegistration: useCallback(async (): Promise<RegistrationResponse> => {
      setState(prev => ({ ...prev, isLoading: true, errors: {} }));

      try {
        // Validate all required fields
        const validationErrors = await validateRegistrationStep('user-info', state.userData);
        
        if (Object.keys(validationErrors).length > 0) {
          setState(prev => ({
            ...prev,
            errors: validationErrors,
            isLoading: false
          }));
          throw new Error('Validation failed');
        }

        // Sign message with wallet if connected
        if (state.walletConnection && state.walletConnection.isConnected) {
          try {
            const message = `I confirm my registration on PFM Platform with wallet ${state.walletConnection.address}`;
            const signature = await signMessage(message);
            
            // Add signature to user data
            setState(prev => ({
              ...prev,
              userData: {
                ...prev.userData,
                walletSignature: signature,
                walletSignatureMessage: message
              }
            }));
          } catch (error) {
            console.warn('Wallet signature failed:', error);
            // Continue without signature for now
          }
        }

        // Submit registration
        const response = await registerUser(state.userData as UserRegistrationData);

        if (response.success) {
          // Track successful registration
          trackRegistrationEvent('step_completed', 'user-info', {
            totalDuration: Date.now() - registrationStartTime.current,
            hasWallet: !!state.walletConnection,
            userId: response.data?.userId
          });

          // Send verification email if required
          if (response.data?.requiresEmailVerification && state.userData.email) {
            try {
              await sendVerificationEmail({
                email: state.userData.email,
                verificationUrl: `${window.location.origin}/register/verify?token=`
              });
            } catch (emailError) {
              console.warn('Failed to send verification email:', emailError);
            }
          }

          // Move to email verification or complete step
          if (response.data?.requiresEmailVerification) {
            actions.setCurrentStep('email-verification');
          } else {
            actions.setCurrentStep('complete');
          }
        }

        setState(prev => ({ ...prev, isLoading: false }));
        return response;

      } catch (error) {
        const registrationError = handleRegistrationError(error);
        
        setState(prev => ({
          ...prev,
          isLoading: false,
          errors: {
            submit: registrationError.message
          }
        }));

        // Track error
        trackRegistrationEvent('error_occurred', state.currentStep, {
          error: registrationError.code,
          message: registrationError.message
        });

        throw registrationError;
      }
    }, [state.userData, state.walletConnection, state.currentStep])
  };

  // Validation methods
  const validation = {
    // Validate current step
    validateStep: useCallback((step: RegistrationStep): boolean => {
      return isStepComplete(step, state.userData);
    }, [state.userData]),

    // Validate specific field
    validateField: useCallback(async (field: string, value: any): Promise<string | undefined> => {
      try {
        return await validateField(
          field as keyof UserRegistrationData,
          value,
          state.userData
        );
      } catch (error) {
        return error instanceof Error ? error.message : 'Validation failed';
      }
    }, [state.userData]),

    // Check if step is complete
    isStepComplete: useCallback((step: RegistrationStep): boolean => {
      return isStepComplete(step, state.userData);
    }, [state.userData])
  };

  return {
    state,
    actions,
    validation
  };
}

// Wallet connection hook for registration
export function useWalletConnection() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [connection, setConnection] = useState<WalletConnection | undefined>();

  useEffect(() => {
    const currentConnection = getCurrentConnection();
    setConnection(currentConnection || undefined);
  }, []);

  const connect = useCallback(async (provider: any) => {
    setIsConnecting(true);
    setError(undefined);

    try {
      const result = await connectWallet(provider);
      
      if (result.success && result.connection) {
        setConnection(result.connection);
        trackRegistrationEvent('step_completed', 'wallet-connection', {
          provider,
          address: result.connection.address
        });
      } else {
        setError(result.error || 'Connection failed');
        trackRegistrationEvent('error_occurred', 'wallet-connection', {
          provider,
          error: result.error
        });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      setError(errorMessage);
      trackRegistrationEvent('error_occurred', 'wallet-connection', {
        provider,
        error: errorMessage
      });
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await disconnectWallet();
      setConnection(undefined);
      setError(undefined);
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }, []);

  return {
    connection,
    isConnecting,
    error,
    connect,
    disconnect
  };
}

// Email verification hook for registration
export function useEmailVerification(email?: string) {
  const [isVerified, setIsVerified] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // Check verification status
  const checkStatus = useCallback(async () => {
    if (!email) return;

    setIsLoading(true);
    try {
      const status = await checkVerificationStatus(email);
      setIsVerified(status.isVerified);
      setIsPending(status.isPending);
      setCanResend(status.canResend);
      setError(undefined);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to check status');
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  // Send verification email
  const sendVerification = useCallback(async () => {
    if (!email) return;

    setIsLoading(true);
    setError(undefined);

    try {
      await sendVerificationEmail({
        email,
        verificationUrl: `${window.location.origin}/register/verify?token=`
      });
      
      setIsPending(true);
      setCanResend(false);
      
      trackRegistrationEvent('step_started', 'email-verification', { email });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send verification');
      trackRegistrationEvent('error_occurred', 'email-verification', {
        email,
        error: error instanceof Error ? error.message : 'Send failed'
      });
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  // Check status when email changes
  useEffect(() => {
    if (email) {
      checkStatus();
    }
  }, [email, checkStatus]);

  return {
    isVerified,
    isPending,
    canResend,
    isLoading,
    error,
    sendVerification,
    checkStatus
  };
}

// Registration analytics hook
export function useRegistrationAnalytics() {
  const trackEvent = useCallback((
    eventType: 'step_started' | 'step_completed' | 'step_abandoned' | 'error_occurred',
    step: string,
    metadata?: Record<string, any>
  ) => {
    trackRegistrationEvent(eventType, step, metadata);
  }, []);

  const trackFormInteraction = useCallback((
    field: string,
    action: 'focus' | 'blur' | 'change' | 'error',
    value?: any
  ) => {
    trackRegistrationEvent('step_started', 'form_interaction', {
      field,
      action,
      hasValue: !!value
    });
  }, []);

  const trackValidationError = useCallback((
    field: string,
    error: string,
    step: string
  ) => {
    trackRegistrationEvent('error_occurred', step, {
      field,
      error,
      type: 'validation'
    });
  }, []);

  return {
    trackEvent,
    trackFormInteraction,
    trackValidationError
  };
}

export default useRegistration; 