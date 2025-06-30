/**
 * Task 4.5.3: Public User Onboarding & Registration Flow
 * Registration Service - API Integration and Business Logic
 * 
 * Handles user registration, email verification, and account setup
 * with comprehensive error handling and validation.
 */

import {
  RegistrationFormData,
  RegistrationResponse,
  EmailVerificationResponse,
  RegistrationError,
  ValidationResult,
  ValidationError
} from '../types/registration';

// ============================================================================
// SERVICE CONFIGURATION
// ============================================================================

interface RegistrationConfig {
  apiBaseUrl: string;
  endpoints: {
    register: string;
    verifyEmail: string;
    resendVerification: string;
    checkUsername: string;
    checkEmail: string;
  };
  validation: {
    minPasswordLength: number;
    requireSpecialChars: boolean;
    usernameMinLength: number;
    usernameMaxLength: number;
  };
}

const defaultConfig: RegistrationConfig = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  endpoints: {
    register: '/api/auth/register',
    verifyEmail: '/api/auth/verify-email',
    resendVerification: '/api/auth/resend-verification',
    checkUsername: '/api/auth/check-username',
    checkEmail: '/api/auth/check-email'
  },
  validation: {
    minPasswordLength: 8,
    requireSpecialChars: true,
    usernameMinLength: 3,
    usernameMaxLength: 30
  }
};

// ============================================================================
// REGISTRATION SERVICE CLASS
// ============================================================================

export class RegistrationService {
  private config: RegistrationConfig;
  private pendingRequests: Map<string, Promise<any>>;
  private cache: Map<string, any>;

  constructor(config?: Partial<RegistrationConfig>) {
    this.config = { ...defaultConfig, ...config };
    this.pendingRequests = new Map();
    this.cache = new Map();
  }

  public validateEmail(email: string): ValidationResult {
    const errors: ValidationError[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      errors.push({
        field: 'email',
        message: 'Email is required',
        code: 'REQUIRED',
        severity: 'error'
      });
    } else if (!emailRegex.test(email)) {
      errors.push({
        field: 'email',
        message: 'Please enter a valid email address',
        code: 'INVALID_FORMAT',
        severity: 'error'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }

  public validatePassword(password: string, confirmPassword?: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    if (!password) {
      errors.push({
        field: 'password',
        message: 'Password is required',
        code: 'REQUIRED',
        severity: 'error'
      });
    } else if (password.length < this.config.validation.minPasswordLength) {
      errors.push({
        field: 'password',
        message: `Password must be at least ${this.config.validation.minPasswordLength} characters`,
        code: 'TOO_SHORT',
        severity: 'error'
      });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      errors.push({
        field: 'confirmPassword',
        message: 'Passwords do not match',
        code: 'MISMATCH',
        severity: 'error'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  public async submitRegistration(data: RegistrationFormData): Promise<RegistrationResponse> {
    try {
      const response = await this.makeRequest('POST', this.config.endpoints.register, data);

      return {
        success: true,
        data: {
          userId: response.userId,
          registrationId: response.registrationId,
          verificationRequired: response.verificationRequired,
          onboardingUrl: response.onboardingUrl
        }
      };

    } catch (error) {
      return {
        success: false,
        error: this.handleRegistrationError(error)
      };
    }
  }

  public async verifyEmail(email: string, code: string): Promise<EmailVerificationResponse> {
    try {
      const response = await this.makeRequest('POST', this.config.endpoints.verifyEmail, {
        email,
        verificationCode: code
      });

      return {
        success: true,
        data: {
          verified: response.verified,
          userId: response.userId,
          nextStep: response.nextStep
        }
      };

    } catch (error) {
      return {
        success: false,
        error: this.handleRegistrationError(error)
      };
    }
  }

  private async makeRequest(method: string, endpoint: string, data?: any): Promise<any> {
    const url = `${this.config.apiBaseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }

  private handleRegistrationError(error: any): RegistrationError {
    if (error instanceof Error) {
      return {
        type: 'server',
        message: error.message,
        recoverable: true,
        retryable: true,
        suggestions: ['Please try again or contact support']
      };
    }
    
    return {
      type: 'server',
      message: 'An unexpected error occurred',
      recoverable: true,
      retryable: true,
      suggestions: ['Please try again or contact support']
    };
  }
}

export const registrationService = new RegistrationService();
