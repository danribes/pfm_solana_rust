// Custom hook for security operations
// Manages state and API calls for security forms

import { useState, useCallback, useEffect } from 'react';
import {
  SecuritySettings,
  PasswordResetRequest,
  PasswordResetConfirmation,
  TwoFactorSetup,
  TwoFactorVerification,
  AccountRecoveryRequest,
  AccountRecoveryResponse,
  PasswordStrength,
  TrustedDevice,
  SecurityQuestion,
  SecurityFormErrors,
  TwoFactorMethod,
  RecoveryMethod,
} from '../types/security';
import securityService from '../services/securityService';

// Password Reset Hook
export const usePasswordReset = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<SecurityFormErrors>({});
  const [resetRequested, setResetRequested] = useState(false);
  const [resetToken, setResetToken] = useState<string>('');

  const requestReset = useCallback(async (data: PasswordResetRequest) => {
    setIsLoading(true);
    setErrors({});

    try {
      const response = await securityService.requestPasswordReset(data);
      setResetRequested(true);
      return response;
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to request password reset',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const confirmReset = useCallback(async (data: PasswordResetConfirmation) => {
    setIsLoading(true);
    setErrors({});

    try {
      await securityService.confirmPasswordReset(data);
      setResetToken('');
      setResetRequested(false);
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to reset password',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const validateToken = useCallback(async (token: string) => {
    try {
      const isValid = await securityService.validateResetToken(token);
      if (isValid) {
        setResetToken(token);
      }
      return isValid;
    } catch (error) {
      return false;
    }
  }, []);

  return {
    isLoading,
    errors,
    resetRequested,
    resetToken,
    requestReset,
    confirmReset,
    validateToken,
    setErrors,
  };
};

// Security Settings Hook
export const useSecuritySettings = () => {
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<SecurityFormErrors>({});
  const [hasChanges, setHasChanges] = useState(false);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setErrors({});

    try {
      const currentSettings = await securityService.getSecuritySettings();
      setSettings(currentSettings);
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to load security settings',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<SecuritySettings>) => {
    setIsLoading(true);
    setErrors({});

    try {
      const updatedSettings = await securityService.updateSecuritySettings(newSettings);
      setSettings(updatedSettings);
      setHasChanges(false);
      return updatedSettings;
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to update security settings',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    setIsLoading(true);
    setErrors({});

    try {
      await securityService.changePassword(currentPassword, newPassword);
      // Update last password change date
      if (settings) {
        setSettings({
          ...settings,
          lastPasswordChange: new Date().toISOString(),
        });
      }
    } catch (error) {
      setErrors({
        password: error instanceof Error ? error.message : 'Failed to change password',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [settings]);

  const calculatePasswordStrength = useCallback((password: string): PasswordStrength => {
    return securityService.calculatePasswordStrength(password);
  }, []);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    isLoading,
    errors,
    hasChanges,
    loadSettings,
    updateSettings,
    changePassword,
    calculatePasswordStrength,
    setErrors,
    setHasChanges,
  };
};

// Two-Factor Authentication Hook
export const useTwoFactor = () => {
  const [setup, setSetup] = useState<TwoFactorSetup | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<SecurityFormErrors>({});
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isVerified, setIsVerified] = useState(false);

  const initializeSetup = useCallback(async (method: TwoFactorMethod) => {
    setIsLoading(true);
    setErrors({});
    setIsVerified(false);

    try {
      const setupData = await securityService.setupTwoFactor(method);
      setSetup(setupData);
      return setupData;
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to setup two-factor authentication',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifySetup = useCallback(async (verification: TwoFactorVerification) => {
    setIsLoading(true);
    setErrors({});

    try {
      const codes = await securityService.verifyTwoFactorSetup(verification);
      setBackupCodes(codes);
      setIsVerified(true);
      return codes;
    } catch (error) {
      setErrors({
        verificationCode: error instanceof Error ? error.message : 'Invalid verification code',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disable = useCallback(async (password: string) => {
    setIsLoading(true);
    setErrors({});

    try {
      await securityService.disableTwoFactor(password);
      setSetup(null);
      setBackupCodes([]);
      setIsVerified(false);
    } catch (error) {
      setErrors({
        password: error instanceof Error ? error.message : 'Failed to disable two-factor authentication',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getBackupCodes = useCallback(async () => {
    setIsLoading(true);
    setErrors({});

    try {
      const codes = await securityService.getBackupCodes();
      setBackupCodes(codes);
      return codes;
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to get backup codes',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const regenerateBackupCodes = useCallback(async () => {
    setIsLoading(true);
    setErrors({});

    try {
      const codes = await securityService.regenerateBackupCodes();
      setBackupCodes(codes);
      return codes;
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to regenerate backup codes',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    setup,
    isLoading,
    errors,
    backupCodes,
    isVerified,
    initializeSetup,
    verifySetup,
    disable,
    getBackupCodes,
    regenerateBackupCodes,
    setErrors,
  };
};

// Account Recovery Hook
export const useAccountRecovery = () => {
  const [recovery, setRecovery] = useState<AccountRecoveryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<SecurityFormErrors>({});
  const [currentStep, setCurrentStep] = useState(0);

  const initiateRecovery = useCallback(async (request: AccountRecoveryRequest) => {
    setIsLoading(true);
    setErrors({});

    try {
      const response = await securityService.initiateAccountRecovery(request);
      setRecovery(response);
      setCurrentStep(0);
      return response;
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to initiate account recovery',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyStep = useCallback(async (verification: any) => {
    if (!recovery) return;

    setIsLoading(true);
    setErrors({});

    try {
      const updatedRecovery = await securityService.verifyRecoveryStep({
        recoveryId: recovery.recoveryId,
        stepId: recovery.steps[currentStep].id,
        verification,
      });
      
      setRecovery(updatedRecovery);
      
      // Move to next step if current step is completed
      const completedSteps = updatedRecovery.steps.filter(step => step.isCompleted).length;
      setCurrentStep(completedSteps);
      
      return updatedRecovery;
    } catch (error) {
      setErrors({
        verification: error instanceof Error ? error.message : 'Verification failed',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [recovery, currentStep]);

  const completeRecovery = useCallback(async (newPassword: string) => {
    if (!recovery) return;

    setIsLoading(true);
    setErrors({});

    try {
      await securityService.completeAccountRecovery(recovery.recoveryId, newPassword);
      setRecovery(null);
      setCurrentStep(0);
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to complete account recovery',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [recovery]);

  return {
    recovery,
    isLoading,
    errors,
    currentStep,
    initiateRecovery,
    verifyStep,
    completeRecovery,
    setErrors,
  };
};

// Trusted Devices Hook
export const useTrustedDevices = () => {
  const [devices, setDevices] = useState<TrustedDevice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<SecurityFormErrors>({});

  const loadDevices = useCallback(async () => {
    setIsLoading(true);
    setErrors({});

    try {
      const devicesList = await securityService.getTrustedDevices();
      setDevices(devicesList);
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to load trusted devices',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeDevice = useCallback(async (deviceId: string) => {
    setIsLoading(true);
    setErrors({});

    try {
      await securityService.removeTrustedDevice(deviceId);
      setDevices(prev => prev.filter(device => device.id !== deviceId));
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to remove trusted device',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load devices on mount
  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  return {
    devices,
    isLoading,
    errors,
    loadDevices,
    removeDevice,
    setErrors,
  };
};

// Security Questions Hook
export const useSecurityQuestions = () => {
  const [questions, setQuestions] = useState<SecurityQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<SecurityFormErrors>({});

  const loadQuestions = useCallback(async () => {
    setIsLoading(true);
    setErrors({});

    try {
      const questionsList = await securityService.getSecurityQuestions();
      setQuestions(questionsList);
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to load security questions',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveQuestions = useCallback(async (newQuestions: SecurityQuestion[]) => {
    setIsLoading(true);
    setErrors({});

    try {
      await securityService.setSecurityQuestions(newQuestions);
      setQuestions(newQuestions);
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to save security questions',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load questions on mount
  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  return {
    questions,
    isLoading,
    errors,
    loadQuestions,
    saveQuestions,
    setErrors,
  };
}; 