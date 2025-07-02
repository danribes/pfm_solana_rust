// Security Service for Account Security & Recovery
// Handles API communication for authentication and security features

import {
  SecuritySettings,
  PasswordResetRequest,
  PasswordResetResponse,
  PasswordResetConfirmation,
  TwoFactorSetup,
  TwoFactorVerification,
  AccountRecoveryRequest,
  AccountRecoveryResponse,
  AccountRecoveryVerification,
  SecurityAuditLog,
  SecurityApiResponse,
  SecurityValidationError,
  PasswordStrength,
  TrustedDevice,
  SecurityQuestion,
  SECURITY_CONSTANTS,
  TwoFactorMethod,
  RecoveryMethod,
} from '../types/security';

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_TIMEOUT = 15000; // 15 seconds for security operations

class SecurityService {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string = API_BASE_URL, timeout: number = API_TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  // Helper method for making API requests
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<SecurityApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseURL}/api/security${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getAuthToken()}`,
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout. Please try again.');
      }
      
      throw error;
    }
  }

  private getAuthToken(): string {
    // Get auth token from localStorage or session storage
    return localStorage.getItem('auth_token') || '';
  }

  // ============================================================================
  // PASSWORD RESET METHODS
  // ============================================================================

  /**
   * Request password reset
   */
  async requestPasswordReset(data: PasswordResetRequest): Promise<PasswordResetResponse> {
    try {
      const response = await this.makeRequest<PasswordResetResponse>('/password-reset', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to request password reset');
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  }

  /**
   * Confirm password reset with new password
   */
  async confirmPasswordReset(data: PasswordResetConfirmation): Promise<void> {
    try {
      const response = await this.makeRequest('/password-reset/confirm', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Password reset confirmation error:', error);
      throw error;
    }
  }

  /**
   * Validate reset token
   */
  async validateResetToken(token: string): Promise<boolean> {
    try {
      const response = await this.makeRequest<{ valid: boolean }>('/password-reset/validate', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });

      return response.data?.valid || false;
    } catch (error) {
      console.error('Reset token validation error:', error);
      return false;
    }
  }

  // ============================================================================
  // SECURITY SETTINGS METHODS
  // ============================================================================

  /**
   * Get current security settings
   */
  async getSecuritySettings(): Promise<SecuritySettings> {
    try {
      const response = await this.makeRequest<SecuritySettings>('/settings');

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to get security settings');
    } catch (error) {
      console.error('Get security settings error:', error);
      throw error;
    }
  }

  /**
   * Update security settings
   */
  async updateSecuritySettings(settings: Partial<SecuritySettings>): Promise<SecuritySettings> {
    try {
      const response = await this.makeRequest<SecuritySettings>('/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to update security settings');
    } catch (error) {
      console.error('Update security settings error:', error);
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const response = await this.makeRequest('/password/change', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  /**
   * Calculate password strength
   */
  calculatePasswordStrength(password: string): PasswordStrength {
    const feedback: string[] = [];
    const requirements = [
      {
        requirement: 'length',
        met: password.length >= SECURITY_CONSTANTS.PASSWORD_MIN_LENGTH,
        description: `At least ${SECURITY_CONSTANTS.PASSWORD_MIN_LENGTH} characters`,
      },
      {
        requirement: 'uppercase',
        met: /[A-Z]/.test(password),
        description: 'At least one uppercase letter',
      },
      {
        requirement: 'lowercase',
        met: /[a-z]/.test(password),
        description: 'At least one lowercase letter',
      },
      {
        requirement: 'number',
        met: /\d/.test(password),
        description: 'At least one number',
      },
      {
        requirement: 'special',
        met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        description: 'At least one special character',
      },
    ];

    const metRequirements = requirements.filter(req => req.met).length;
    const score = Math.min(100, (metRequirements / requirements.length) * 100);

    // Additional scoring factors
    let bonusScore = 0;
    if (password.length > 12) bonusScore += 10;
    if (password.length > 16) bonusScore += 10;
    if (!/(.)\1{2,}/.test(password)) bonusScore += 10; // No repeated characters

    const finalScore = Math.min(100, score + bonusScore);

    let level: PasswordStrength['level'];
    if (finalScore < 20) level = 'weak';
    else if (finalScore < 40) level = 'fair';
    else if (finalScore < 60) level = 'good';
    else if (finalScore < 80) level = 'strong';
    else level = 'very_strong';

    // Generate feedback
    requirements.forEach(req => {
      if (!req.met) {
        feedback.push(req.description);
      }
    });

    if (password.length < 12) {
      feedback.push('Consider using 12+ characters for better security');
    }

    if (/(.)\1{2,}/.test(password)) {
      feedback.push('Avoid repeated characters');
    }

    return {
      score: finalScore,
      level,
      feedback,
      requirements,
    };
  }

  // ============================================================================
  // TWO-FACTOR AUTHENTICATION METHODS
  // ============================================================================

  /**
   * Setup two-factor authentication
   */
  async setupTwoFactor(method: TwoFactorMethod): Promise<TwoFactorSetup> {
    try {
      const response = await this.makeRequest<TwoFactorSetup>('/two-factor/setup', {
        method: 'POST',
        body: JSON.stringify({ method }),
      });

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to setup two-factor authentication');
    } catch (error) {
      console.error('Two-factor setup error:', error);
      throw error;
    }
  }

  /**
   * Verify two-factor setup
   */
  async verifyTwoFactorSetup(verification: TwoFactorVerification): Promise<string[]> {
    try {
      const response = await this.makeRequest<{ backupCodes: string[] }>('/two-factor/verify', {
        method: 'POST',
        body: JSON.stringify(verification),
      });

      if (response.success && response.data) {
        return response.data.backupCodes;
      }

      throw new Error(response.message || 'Failed to verify two-factor authentication');
    } catch (error) {
      console.error('Two-factor verification error:', error);
      throw error;
    }
  }

  /**
   * Disable two-factor authentication
   */
  async disableTwoFactor(password: string): Promise<void> {
    try {
      const response = await this.makeRequest('/two-factor/disable', {
        method: 'POST',
        body: JSON.stringify({ password }),
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to disable two-factor authentication');
      }
    } catch (error) {
      console.error('Two-factor disable error:', error);
      throw error;
    }
  }

  /**
   * Get backup codes
   */
  async getBackupCodes(): Promise<string[]> {
    try {
      const response = await this.makeRequest<{ backupCodes: string[] }>('/two-factor/backup-codes');

      if (response.success && response.data) {
        return response.data.backupCodes;
      }

      throw new Error(response.message || 'Failed to get backup codes');
    } catch (error) {
      console.error('Get backup codes error:', error);
      throw error;
    }
  }

  /**
   * Regenerate backup codes
   */
  async regenerateBackupCodes(): Promise<string[]> {
    try {
      const response = await this.makeRequest<{ backupCodes: string[] }>('/two-factor/backup-codes/regenerate', {
        method: 'POST',
      });

      if (response.success && response.data) {
        return response.data.backupCodes;
      }

      throw new Error(response.message || 'Failed to regenerate backup codes');
    } catch (error) {
      console.error('Regenerate backup codes error:', error);
      throw error;
    }
  }

  // ============================================================================
  // ACCOUNT RECOVERY METHODS
  // ============================================================================

  /**
   * Initiate account recovery
   */
  async initiateAccountRecovery(request: AccountRecoveryRequest): Promise<AccountRecoveryResponse> {
    try {
      const response = await this.makeRequest<AccountRecoveryResponse>('/recovery/initiate', {
        method: 'POST',
        body: JSON.stringify(request),
      });

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to initiate account recovery');
    } catch (error) {
      console.error('Account recovery initiation error:', error);
      throw error;
    }
  }

  /**
   * Verify recovery step
   */
  async verifyRecoveryStep(verification: AccountRecoveryVerification): Promise<AccountRecoveryResponse> {
    try {
      const response = await this.makeRequest<AccountRecoveryResponse>('/recovery/verify', {
        method: 'POST',
        body: JSON.stringify(verification),
      });

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to verify recovery step');
    } catch (error) {
      console.error('Recovery verification error:', error);
      throw error;
    }
  }

  /**
   * Complete account recovery
   */
  async completeAccountRecovery(recoveryId: string, newPassword: string): Promise<void> {
    try {
      const response = await this.makeRequest('/recovery/complete', {
        method: 'POST',
        body: JSON.stringify({ recoveryId, newPassword }),
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to complete account recovery');
      }
    } catch (error) {
      console.error('Account recovery completion error:', error);
      throw error;
    }
  }

  // ============================================================================
  // TRUSTED DEVICES METHODS
  // ============================================================================

  /**
   * Get trusted devices
   */
  async getTrustedDevices(): Promise<TrustedDevice[]> {
    try {
      const response = await this.makeRequest<{ devices: TrustedDevice[] }>('/devices');

      if (response.success && response.data) {
        return response.data.devices;
      }

      return [];
    } catch (error) {
      console.error('Get trusted devices error:', error);
      return [];
    }
  }

  /**
   * Remove trusted device
   */
  async removeTrustedDevice(deviceId: string): Promise<void> {
    try {
      const response = await this.makeRequest(`/devices/${deviceId}`, {
        method: 'DELETE',
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to remove trusted device');
      }
    } catch (error) {
      console.error('Remove trusted device error:', error);
      throw error;
    }
  }

  // ============================================================================
  // SECURITY AUDIT METHODS
  // ============================================================================

  /**
   * Get security audit logs
   */
  async getSecurityAuditLogs(limit = 50, offset = 0): Promise<SecurityAuditLog[]> {
    try {
      const response = await this.makeRequest<{ logs: SecurityAuditLog[] }>(
        `/audit-logs?limit=${limit}&offset=${offset}`
      );

      if (response.success && response.data) {
        return response.data.logs;
      }

      return [];
    } catch (error) {
      console.error('Get security audit logs error:', error);
      return [];
    }
  }

  // ============================================================================
  // SECURITY QUESTIONS METHODS
  // ============================================================================

  /**
   * Get security questions
   */
  async getSecurityQuestions(): Promise<SecurityQuestion[]> {
    try {
      const response = await this.makeRequest<{ questions: SecurityQuestion[] }>('/security-questions');

      if (response.success && response.data) {
        return response.data.questions;
      }

      return [];
    } catch (error) {
      console.error('Get security questions error:', error);
      return [];
    }
  }

  /**
   * Set security questions
   */
  async setSecurityQuestions(questions: SecurityQuestion[]): Promise<void> {
    try {
      const response = await this.makeRequest('/security-questions', {
        method: 'POST',
        body: JSON.stringify({ questions }),
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to set security questions');
      }
    } catch (error) {
      console.error('Set security questions error:', error);
      throw error;
    }
  }

  // ============================================================================
  // VALIDATION METHODS
  // ============================================================================

  /**
   * Validate form data
   */
  validateSecurityForm(data: any, formType: string): SecurityValidationError[] {
    const errors: SecurityValidationError[] = [];

    switch (formType) {
      case 'password-reset':
        if (!data.email) {
          errors.push({
            field: 'email',
            message: 'Email is required',
            code: 'REQUIRED',
          });
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
          errors.push({
            field: 'email',
            message: 'Please enter a valid email address',
            code: 'INVALID_FORMAT',
          });
        }
        break;

      case 'password-reset-confirm':
        if (!data.newPassword) {
          errors.push({
            field: 'newPassword',
            message: 'New password is required',
            code: 'REQUIRED',
          });
        } else {
          const strength = this.calculatePasswordStrength(data.newPassword);
          if (strength.level === 'weak') {
            errors.push({
              field: 'newPassword',
              message: 'Password is too weak',
              code: 'WEAK_PASSWORD',
            });
          }
        }

        if (data.newPassword !== data.confirmPassword) {
          errors.push({
            field: 'confirmPassword',
            message: 'Passwords do not match',
            code: 'PASSWORD_MISMATCH',
          });
        }
        break;

      case 'two-factor-setup':
        if (!data.verificationCode) {
          errors.push({
            field: 'verificationCode',
            message: 'Verification code is required',
            code: 'REQUIRED',
          });
        } else if (!/^\d{6}$/.test(data.verificationCode)) {
          errors.push({
            field: 'verificationCode',
            message: 'Verification code must be 6 digits',
            code: 'INVALID_FORMAT',
          });
        }
        break;
    }

    return errors;
  }
}

// Create and export service instance
export const securityService = new SecurityService();

// Export convenience methods
export const requestPasswordReset = (data: PasswordResetRequest) =>
  securityService.requestPasswordReset(data);

export const confirmPasswordReset = (data: PasswordResetConfirmation) =>
  securityService.confirmPasswordReset(data);

export const getSecuritySettings = () =>
  securityService.getSecuritySettings();

export const updateSecuritySettings = (settings: Partial<SecuritySettings>) =>
  securityService.updateSecuritySettings(settings);

export const setupTwoFactor = (method: TwoFactorMethod) =>
  securityService.setupTwoFactor(method);

export const verifyTwoFactorSetup = (verification: TwoFactorVerification) =>
  securityService.verifyTwoFactorSetup(verification);

export const initiateAccountRecovery = (request: AccountRecoveryRequest) =>
  securityService.initiateAccountRecovery(request);

export const calculatePasswordStrength = (password: string) =>
  securityService.calculatePasswordStrength(password);

export default securityService; 