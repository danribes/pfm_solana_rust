// Task 7.1.3: Public User Registration & Wallet Connection
// Form validation rules and functions for registration system

import { ValidationRule, FormErrors, UserRegistrationData, DEFAULT_REGISTRATION_CONFIG } from '@/types/registration';

// Email validation
export const emailValidation: ValidationRule = {
  required: true,
  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  custom: (value: string) => {
    if (!value) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Please enter a valid email address';
    }
    if (value.length > 254) {
      return 'Email address is too long';
    }
    return true;
  },
  asyncValidation: async (email: string) => {
    try {
      // Simulate API call to check if email exists
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      
      if (!data.available) {
        return 'An account with this email already exists';
      }
      return true;
    } catch (error) {
      // If API call fails, don't block registration
      return true;
    }
  }
};

// Username validation
export const usernameValidation: ValidationRule = {
  required: true,
  minLength: DEFAULT_REGISTRATION_CONFIG.usernameRequirements.minLength,
  maxLength: DEFAULT_REGISTRATION_CONFIG.usernameRequirements.maxLength,
  pattern: DEFAULT_REGISTRATION_CONFIG.usernameRequirements.allowedChars,
  custom: (value: string) => {
    if (!value) return 'Username is required';
    
    const { minLength, maxLength, allowedChars, reservedNames } = DEFAULT_REGISTRATION_CONFIG.usernameRequirements;
    
    if (value.length < minLength) {
      return `Username must be at least ${minLength} characters long`;
    }
    
    if (value.length > maxLength) {
      return `Username must be no more than ${maxLength} characters long`;
    }
    
    if (!allowedChars.test(value)) {
      return 'Username can only contain letters, numbers, hyphens, and underscores';
    }
    
    if (reservedNames.includes(value.toLowerCase())) {
      return 'This username is reserved and cannot be used';
    }
    
    if (value.startsWith('-') || value.endsWith('-')) {
      return 'Username cannot start or end with a hyphen';
    }
    
    if (value.includes('--')) {
      return 'Username cannot contain consecutive hyphens';
    }
    
    return true;
  },
  asyncValidation: async (username: string) => {
    try {
      const response = await fetch('/api/auth/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const data = await response.json();
      
      if (!data.available) {
        const suggestions = data.suggestions || [];
        const suggestionText = suggestions.length > 0 
          ? ` Try: ${suggestions.slice(0, 3).join(', ')}`
          : '';
        return `Username "${username}" is already taken.${suggestionText}`;
      }
      return true;
    } catch (error) {
      return true; // Don't block on API failures
    }
  }
};

// Password validation
export const passwordValidation: ValidationRule = {
  required: true,
  minLength: DEFAULT_REGISTRATION_CONFIG.passwordRequirements.minLength,
  custom: (value: string) => {
    if (!value) return 'Password is required';
    
    const requirements = DEFAULT_REGISTRATION_CONFIG.passwordRequirements;
    const errors: string[] = [];
    
    if (value.length < requirements.minLength) {
      errors.push(`at least ${requirements.minLength} characters`);
    }
    
    if (requirements.requireUppercase && !/[A-Z]/.test(value)) {
      errors.push('one uppercase letter');
    }
    
    if (requirements.requireLowercase && !/[a-z]/.test(value)) {
      errors.push('one lowercase letter');
    }
    
    if (requirements.requireNumbers && !/\d/.test(value)) {
      errors.push('one number');
    }
    
    if (requirements.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      errors.push('one special character');
    }
    
    // Check for common weak passwords
    const commonPasswords = [
      'password', '123456', 'qwerty', 'abc123', 'letmein', 
      'welcome', 'monkey', '1234567890'
    ];
    
    if (commonPasswords.includes(value.toLowerCase())) {
      return 'Password is too common. Please choose a more secure password.';
    }
    
    if (errors.length > 0) {
      return `Password must contain ${errors.join(', ')}`;
    }
    
    return true;
  }
};

// Confirm password validation
export const confirmPasswordValidation = (password: string): ValidationRule => ({
  required: true,
  custom: (value: string) => {
    if (!value) return 'Please confirm your password';
    if (value !== password) return 'Passwords do not match';
    return true;
  }
});

// First name validation
export const firstNameValidation: ValidationRule = {
  required: true,
  minLength: 1,
  maxLength: 50,
  custom: (value: string) => {
    if (!value) return 'First name is required';
    if (value.length > 50) return 'First name is too long';
    if (!/^[a-zA-Z\s'-]+$/.test(value)) {
      return 'First name can only contain letters, spaces, apostrophes, and hyphens';
    }
    return true;
  }
};

// Last name validation
export const lastNameValidation: ValidationRule = {
  required: true,
  minLength: 1,
  maxLength: 50,
  custom: (value: string) => {
    if (!value) return 'Last name is required';
    if (value.length > 50) return 'Last name is too long';
    if (!/^[a-zA-Z\s'-]+$/.test(value)) {
      return 'Last name can only contain letters, spaces, apostrophes, and hyphens';
    }
    return true;
  }
};

// Interests validation
export const interestsValidation: ValidationRule = {
  required: true,
  custom: (value: string[]) => {
    if (!Array.isArray(value) || value.length === 0) {
      return 'Please select at least one interest';
    }
    if (value.length > 10) {
      return 'Please select no more than 10 interests';
    }
    return true;
  }
};

// Terms acceptance validation
export const termsValidation: ValidationRule = {
  required: true,
  custom: (value: boolean) => {
    if (!value) return 'You must accept the Terms of Service';
    return true;
  }
};

// Privacy policy validation
export const privacyValidation: ValidationRule = {
  required: true,
  custom: (value: boolean) => {
    if (!value) return 'You must accept the Privacy Policy';
    return true;
  }
};

// Bio validation (optional)
export const bioValidation: ValidationRule = {
  required: false,
  maxLength: 500,
  custom: (value: string) => {
    if (value && value.length > 500) {
      return 'Bio must be 500 characters or less';
    }
    return true;
  }
};

// Location validation (optional)
export const locationValidation: ValidationRule = {
  required: false,
  maxLength: 100,
  custom: (value: string) => {
    if (value && value.length > 100) {
      return 'Location must be 100 characters or less';
    }
    return true;
  }
};

// Validation rule mapping for each field
export const validationRules: Record<keyof UserRegistrationData, ValidationRule> = {
  id: { required: false },
  email: emailValidation,
  username: usernameValidation,
  firstName: firstNameValidation,
  lastName: lastNameValidation,
  password: passwordValidation,
  confirmPassword: passwordValidation, // Will be overridden with actual password
  interests: interestsValidation,
  referralCode: { required: false },
  marketingConsent: { required: false },
  termsAccepted: termsValidation,
  privacyPolicyAccepted: privacyValidation,
  walletAddress: { required: false },
  walletProvider: { required: false },
  profilePicture: { required: false },
  bio: bioValidation,
  location: locationValidation,
  timezone: { required: false },
  language: {
    required: true,
    custom: (value: string) => {
      if (!value) return 'Language selection is required';
      return true;
    }
  }
};

// Validation functions
export const validateField = async (
  fieldName: keyof UserRegistrationData,
  value: any,
  allValues?: Partial<UserRegistrationData>
): Promise<string | undefined> => {
  const rule = validationRules[fieldName];
  
  // Special case for confirmPassword
  if (fieldName === 'confirmPassword' && allValues?.password) {
    const confirmRule = confirmPasswordValidation(allValues.password);
    return validateSingleField(value, confirmRule);
  }
  
  return validateSingleField(value, rule);
};

export const validateSingleField = async (
  value: any,
  rule: ValidationRule
): Promise<string | undefined> => {
  // Required validation
  if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
    return 'This field is required';
  }
  
  // Skip other validations if value is empty and not required
  if (!rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
    return undefined;
  }
  
  // Length validations
  if (typeof value === 'string') {
    if (rule.minLength && value.length < rule.minLength) {
      return `Must be at least ${rule.minLength} characters long`;
    }
    
    if (rule.maxLength && value.length > rule.maxLength) {
      return `Must be no more than ${rule.maxLength} characters long`;
    }
  }
  
  // Pattern validation
  if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
    return 'Invalid format';
  }
  
  // Custom validation
  if (rule.custom) {
    const result = rule.custom(value);
    if (result !== true) {
      return typeof result === 'string' ? result : 'Validation failed';
    }
  }
  
  // Async validation
  if (rule.asyncValidation) {
    const result = await rule.asyncValidation(value);
    if (result !== true) {
      return typeof result === 'string' ? result : 'Async validation failed';
    }
  }
  
  return undefined;
};

export const validateForm = async (
  data: Partial<UserRegistrationData>
): Promise<FormErrors> => {
  const errors: FormErrors = {};
  
  // Validate each field
  for (const [fieldName, value] of Object.entries(data)) {
    const error = await validateField(
      fieldName as keyof UserRegistrationData,
      value,
      data
    );
    if (error) {
      errors[fieldName] = error;
    }
  }
  
  return errors;
};

export const validateRegistrationStep = async (
  step: string,
  data: Partial<UserRegistrationData>
): Promise<FormErrors> => {
  const errors: FormErrors = {};
  
  switch (step) {
    case 'user-info':
      const userInfoFields = ['email', 'username', 'firstName', 'lastName', 'password', 'confirmPassword'];
      for (const field of userInfoFields) {
        if (data[field as keyof UserRegistrationData] !== undefined) {
          const error = await validateField(
            field as keyof UserRegistrationData,
            data[field as keyof UserRegistrationData],
            data
          );
          if (error) {
            errors[field] = error;
          }
        }
      }
      break;
      
    case 'interests':
      if (data.interests !== undefined) {
        const error = await validateField('interests', data.interests, data);
        if (error) {
          errors.interests = error;
        }
      }
      break;
      
    case 'terms':
      const termsFields = ['termsAccepted', 'privacyPolicyAccepted'];
      for (const field of termsFields) {
        if (data[field as keyof UserRegistrationData] !== undefined) {
          const error = await validateField(
            field as keyof UserRegistrationData,
            data[field as keyof UserRegistrationData],
            data
          );
          if (error) {
            errors[field] = error;
          }
        }
      }
      break;
  }
  
  return errors;
};

// Helper functions for password
export const getPasswordStrength = (password: string): {
  score: number;
  feedback: string[];
  strength: 'weak' | 'fair' | 'good' | 'strong';
} => {
  let score = 0;
  const feedback: string[] = [];
  
  if (password.length >= 8) score += 1;
  else feedback.push('Use at least 8 characters');
  
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Add uppercase letters');
  
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Add lowercase letters');
  
  if (/\d/.test(password)) score += 1;
  else feedback.push('Add numbers');
  
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  else feedback.push('Add special characters');
  
  if (password.length >= 12) score += 1;
  
  let strength: 'weak' | 'fair' | 'good' | 'strong';
  if (score <= 2) strength = 'weak';
  else if (score <= 3) strength = 'fair';
  else if (score <= 4) strength = 'good';
  else strength = 'strong';
  
  return { score, feedback, strength };
};

// Username suggestions generator
export const generateUsernameSuggestions = (
  firstName: string,
  lastName: string,
  existingUsernames: string[] = []
): string[] => {
  const suggestions: string[] = [];
  const base = `${firstName.toLowerCase()}${lastName.toLowerCase()}`;
  
  // Basic combinations
  suggestions.push(base);
  suggestions.push(`${firstName.toLowerCase()}.${lastName.toLowerCase()}`);
  suggestions.push(`${firstName.toLowerCase()}_${lastName.toLowerCase()}`);
  suggestions.push(`${firstName.toLowerCase()}${lastName.charAt(0).toLowerCase()}`);
  
  // Add numbers
  for (let i = 1; i <= 99; i++) {
    suggestions.push(`${base}${i}`);
    if (suggestions.length >= 10) break;
  }
  
  // Filter out existing usernames and return first 5 unique suggestions
  return suggestions
    .filter(suggestion => !existingUsernames.includes(suggestion))
    .slice(0, 5);
};

// Email domain validation for business emails
export const validateEmailDomain = (email: string): boolean => {
  const blockedDomains = [
    '10minutemail.com',
    'guerrillamail.com',
    'tempmail.org',
    'throwaway.email'
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  return domain ? !blockedDomains.includes(domain) : false;
};

// Check if form step is complete
export const isStepComplete = (
  step: string,
  data: Partial<UserRegistrationData>
): boolean => {
  switch (step) {
    case 'wallet-connection':
      return !!(data.walletAddress && data.walletProvider);
      
    case 'user-info':
      return !!(
        data.email &&
        data.username &&
        data.firstName &&
        data.lastName &&
        data.password &&
        data.confirmPassword
      );
      
    case 'interests':
      return !!(data.interests && data.interests.length > 0);
      
    case 'terms':
      return !!(data.termsAccepted && data.privacyPolicyAccepted);
      
    default:
      return false;
  }
}; 