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
  ValidationError,
  ValidationWarning
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
  apiBaseUrl: (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) || 'http://localhost:3000',
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

  // ============================================================================
  // VALIDATION METHODS
  // ============================================================================

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
    } else if (email.length > 254) {
      errors.push({
        field: 'email',
        message: 'Email address is too long',
        code: 'TOO_LONG',
        severity: 'error'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }

  public validateUsername(username: string): ValidationResult {
    const errors: ValidationError[] = [];
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;

    if (!username) {
      errors.push({
        field: 'username',
        message: 'Username is required',
        code: 'REQUIRED',
        severity: 'error'
      });
    } else if (username.length < this.config.validation.usernameMinLength) {
      errors.push({
        field: 'username',
        message: `Username must be at least ${this.config.validation.usernameMinLength} characters`,
        code: 'TOO_SHORT',
        severity: 'error'
      });
    } else if (username.length > this.config.validation.usernameMaxLength) {
      errors.push({
        field: 'username',
        message: `Username must be no more than ${this.config.validation.usernameMaxLength} characters`,
        code: 'TOO_LONG',
        severity: 'error'
      });
    } else if (!usernameRegex.test(username)) {
      errors.push({
        field: 'username',
        message: 'Username can only contain letters, numbers, hyphens, and underscores',
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
    const warnings: ValidationWarning[] = [];

    if (!password) {
      errors.push({
        field: 'password',
        message: 'Password is required',
        code: 'REQUIRED',
        severity: 'error'
      });
    } else {
      if (password.length < this.config.validation.minPasswordLength) {
        errors.push({
          field: 'password',
          message: `Password must be at least ${this.config.validation.minPasswordLength} characters`,
          code: 'TOO_SHORT',
          severity: 'error'
        });
      }

      if (this.config.validation.requireSpecialChars) {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password);

        if (!hasUpperCase) {
          warnings.push({
            field: 'password',
            message: 'Password should include uppercase letters',
            suggestion: 'Add at least one uppercase letter'
          });
        }

        if (!hasLowerCase) {
          warnings.push({
            field: 'password',
            message: 'Password should include lowercase letters',
            suggestion: 'Add at least one lowercase letter'
          });
        }

        if (!hasNumbers) {
          warnings.push({
            field: 'password',
            message: 'Password should include numbers',
            suggestion: 'Add at least one number'
          });
        }

        if (!hasSpecialChar) {
          warnings.push({
            field: 'password',
            message: 'Password should include special characters',
            suggestion: 'Add at least one special character'
          });
        }
      }
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

  public validateRegistrationForm(data: RegistrationFormData): ValidationResult {
    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationWarning[] = [];

    // Validate individual fields
    const emailValidation = this.validateEmail(data.email);
    const usernameValidation = this.validateUsername(data.username);
    const passwordValidation = this.validatePassword(data.password, data.confirmPassword);

    allErrors.push(...emailValidation.errors);
    allErrors.push(...usernameValidation.errors);
    allErrors.push(...passwordValidation.errors);

    allWarnings.push(...emailValidation.warnings);
    allWarnings.push(...usernameValidation.warnings);
    allWarnings.push(...passwordValidation.warnings);

    // Validate terms acceptance
    if (!data.agreedToTerms) {
      allErrors.push({
        field: 'agreedToTerms',
        message: 'You must accept the terms of service',
        code: 'REQUIRED',
        severity: 'error'
      });
    }

    if (!data.agreedToPrivacy) {
      allErrors.push({
        field: 'agreedToPrivacy',
        message: 'You must accept the privacy policy',
        code: 'REQUIRED',
        severity: 'error'
      });
    }

    // Validate optional fields
    if (data.fullName && data.fullName.length > 100) {
      allErrors.push({
        field: 'fullName',
        message: 'Full name is too long',
        code: 'TOO_LONG',
        severity: 'error'
      });
    }

    if (data.dateOfBirth) {
      const birthDate = new Date(data.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 13) {
        allErrors.push({
          field: 'dateOfBirth',
          message: 'You must be at least 13 years old to register',
          code: 'AGE_RESTRICTION',
          severity: 'error'
        });
      }
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    };
  }

  // ============================================================================
  // AVAILABILITY CHECKING
  // ============================================================================

  public async checkEmailAvailability(email: string): Promise<{ available: boolean; suggestion?: string }> {
    const cacheKey = `email-${email}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await this.makeRequest('POST', this.config.endpoints.checkEmail, { email });
      const result = {
        available: response.available,
        suggestion: response.suggestion
      };
      
      this.cache.set(cacheKey, result);
      setTimeout(() => this.cache.delete(cacheKey), 60000); // Cache for 1 minute
      
      return result;
    } catch (error) {
      console.error('Error checking email availability:', error);
      return { available: true }; // Assume available on error
    }
  }

  public async checkUsernameAvailability(username: string): Promise<{ available: boolean; suggestions: string[] }> {
    const cacheKey = `username-${username}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await this.makeRequest('POST', this.config.endpoints.checkUsername, { username });
      const result = {
        available: response.available,
        suggestions: response.suggestions || []
      };
      
      this.cache.set(cacheKey, result);
      setTimeout(() => this.cache.delete(cacheKey), 60000); // Cache for 1 minute
      
      return result;
    } catch (error) {
      console.error('Error checking username availability:', error);
      return { available: true, suggestions: [] }; // Assume available on error
    }
  }

  // ============================================================================
  // REGISTRATION METHODS
  // ============================================================================

  public async submitRegistration(data: RegistrationFormData): Promise<RegistrationResponse> {
    try {
      // Validate form data
      const validation = this.validateRegistrationForm(data);
      if (!validation.isValid) {
        throw this.createValidationError(validation.errors);
      }

      // Check availability
      const [emailCheck, usernameCheck] = await Promise.all([
        this.checkEmailAvailability(data.email),
        this.checkUsernameAvailability(data.username)
      ]);

      if (!emailCheck.available) {
        throw this.createRegistrationError('validation', 'Email address is already registered', {
          suggestion: emailCheck.suggestion
        });
      }

      if (!usernameCheck.available) {
        throw this.createRegistrationError('validation', 'Username is not available', {
          suggestions: usernameCheck.suggestions
        });
      }

      // Sanitize and prepare data
      const sanitizedData = this.sanitizeRegistrationData(data);

      // Submit registration
      const response = await this.makeRequest('POST', this.config.endpoints.register, sanitizedData);

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

  // ============================================================================
  // EMAIL VERIFICATION METHODS
  // ============================================================================

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

  public async resendVerificationEmail(email: string): Promise<void> {
    try {
      await this.makeRequest('POST', this.config.endpoints.resendVerification, { email });
    } catch (error) {
      throw this.handleRegistrationError(error);
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private sanitizeRegistrationData(data: RegistrationFormData): any {
    const sanitized = { ...data };

    // Remove potentially dangerous characters
    const sanitizeString = (str: string) => {
      return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/[<>]/g, '')
                .trim();
    };

    if (sanitized.fullName) {
      sanitized.fullName = sanitizeString(sanitized.fullName);
    }
    
    sanitized.username = sanitizeString(sanitized.username);
    sanitized.email = sanitized.email.toLowerCase().trim();

    return sanitized;
  }

  private async makeRequest(method: string, endpoint: string, data?: any): Promise<any> {
    const url = `${this.config.apiBaseUrl}${endpoint}`;
    const requestKey = `${method}-${url}-${JSON.stringify(data)}`;

    // Prevent duplicate requests
    if (this.pendingRequests.has(requestKey)) {
      return this.pendingRequests.get(requestKey);
    }

    const requestPromise = fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include'
    })
    .then(async (response) => {
      this.pendingRequests.delete(requestKey);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    })
    .catch((error) => {
      this.pendingRequests.delete(requestKey);
      throw error;
    });

    this.pendingRequests.set(requestKey, requestPromise);
    return requestPromise;
  }

  private createValidationError(errors: ValidationError[]): RegistrationError {
    return {
      type: 'validation',
      message: 'Please correct the validation errors',
      details: errors,
      recoverable: true,
      retryable: false,
      suggestions: ['Please review and correct the highlighted fields']
    };
  }

  private createRegistrationError(
    type: RegistrationError['type'],
    message: string,
    details?: any
  ): RegistrationError {
    return {
      type,
      message,
      details,
      recoverable: type !== 'server',
      retryable: ['network', 'server'].includes(type),
      suggestions: this.getErrorSuggestions(type)
    };
  }

  private getErrorSuggestions(type: RegistrationError['type']): string[] {
    switch (type) {
      case 'network':
        return [
          'Check your internet connection',
          'Try again in a moment',
          'Contact support if the problem persists'
        ];
      case 'server':
        return [
          'Our servers are temporarily unavailable',
          'Please try again later',
          'Contact support if the issue continues'
        ];
      case 'validation':
        return [
          'Review the form for errors',
          'Ensure all required fields are filled',
          'Check that passwords match'
        ];
      case 'verification':
        return [
          'Check your email for the verification code',
          'Ensure the code is entered correctly',
          'Request a new code if needed'
        ];
      default:
        return ['Please try again or contact support'];
    }
  }

  private handleRegistrationError(error: any): RegistrationError {
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        return this.createRegistrationError('network', 'Unable to connect to the server');
      }
      
      if (error.message.includes('validation')) {
        return this.createRegistrationError('validation', error.message);
      }
      
      if (error.message.includes('verification')) {
        return this.createRegistrationError('verification', error.message);
      }
      
      return this.createRegistrationError('server', error.message);
    }
    
    return this.createRegistrationError('server', 'An unexpected error occurred');
  }

  // ============================================================================
  // PUBLIC UTILITY METHODS
  // ============================================================================

  public generateSecurePassword(length: number = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  }

  public getPasswordStrength(password: string): { score: number; feedback: string[] } {
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 8) score += 1;
    else feedback.push('Use at least 8 characters');

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Include lowercase letters');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Include uppercase letters');

    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('Include numbers');

    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    else feedback.push('Include special characters');

    return { score, feedback };
  }

  public clearCache(): void {
    this.cache.clear();
  }

  public updateConfig(newConfig: Partial<RegistrationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const registrationService = new RegistrationService();

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

export const validateEmail = (email: string) => registrationService.validateEmail(email);
export const validateUsername = (username: string) => registrationService.validateUsername(username);
export const validatePassword = (password: string, confirmPassword?: string) => 
  registrationService.validatePassword(password, confirmPassword);
export const validateRegistrationForm = (data: RegistrationFormData) => 
  registrationService.validateRegistrationForm(data);
export const submitRegistration = (data: RegistrationFormData) => 
  registrationService.submitRegistration(data);
export const verifyEmail = (email: string, code: string) => 
  registrationService.verifyEmail(email, code);
export const resendVerificationEmail = (email: string) => 
  registrationService.resendVerificationEmail(email);
export const checkEmailAvailability = (email: string) => 
  registrationService.checkEmailAvailability(email);
export const checkUsernameAvailability = (username: string) => 
  registrationService.checkUsernameAvailability(username); 