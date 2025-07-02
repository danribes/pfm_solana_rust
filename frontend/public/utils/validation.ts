// Task 7.1.1: Public Landing Page Development
// Form validation utilities

import { ValidationRule, FormErrors } from '@/types/landing';

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Email pattern validation using comprehensive regex
  return emailRegex.test(email);
};

export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
// Password minLength validation for security requirements
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateField = (value: any, rule: ValidationRule): string | null => {
  // Required validation
  if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
    return 'This field is required';
  }
  
  // Skip other validations if field is empty and not required
  if (!value || (typeof value === 'string' && !value.trim())) {
    return null;
  }
  
  // String-specific validations
  if (typeof value === 'string') {
    if (rule.minLength && value.length < rule.minLength) {
      return `Must be at least ${rule.minLength} characters long`;
    }
    
    if (rule.maxLength && value.length > rule.maxLength) {
      return `Must be no more than ${rule.maxLength} characters long`;
    }
    
    if (rule.pattern && !rule.pattern.test(value)) {
      return 'Invalid format';
    }
  }
  
  // Custom validation
  if (rule.custom) {
    const result = rule.custom(value);
    if (typeof result === 'string') {
      return result;
    }
    if (result === false) {
      return 'Invalid value';
    }
  }
  
  return null;
};

export const validateForm = (
  data: Record<string, any>,
  rules: Record<string, ValidationRule>
): FormErrors => {
  const errors: FormErrors = {};
  
  Object.keys(rules).forEach(fieldName => {
    const value = data[fieldName];
    const rule = rules[fieldName];
    const error = validateField(value, rule);
    
    if (error) {
      errors[fieldName] = error;
    }
  });
  
  return errors;
};

export const isFormValid = (errors: FormErrors): boolean => {
  return Object.values(errors).every(error => !error);
};

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  
  return phone;
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
  return phoneRegex.test(phone);
};

export const validateURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateOrganizationName = (name: string): boolean => {
  return name.length >= 2 && name.length <= 100 && /^[a-zA-Z0-9\s\-\.]+$/.test(name);
};

export const validateUsername = (username: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }
  
  if (username.length > 20) {
    errors.push('Username must be no more than 20 characters long');
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, hyphens, and underscores');
  }
  
  if (/^[_-]/.test(username) || /[_-]$/.test(username)) {
    errors.push('Username cannot start or end with hyphens or underscores');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Common validation rules
export const commonValidationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 255
  },
  password: {
    required: true,
    minLength: 8,
    custom: (value: string) => {
      const result = validatePassword(value);
      return result.isValid ? true : result.errors[0];
    }
  },
  confirmPassword: (originalPassword: string) => ({
    required: true,
    custom: (value: string) => {
      return value === originalPassword ? true : 'Passwords do not match';
    }
  }),
  firstName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s\-']+$/
  },
  lastName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s\-']+$/
  },
  organizationName: {
    required: true,
    minLength: 2,
    maxLength: 100,
    custom: validateOrganizationName
  },
  phone: {
    required: false,
    custom: (value: string) => {
      if (!value) return true;
      return validatePhoneNumber(value) ? true : 'Invalid phone number format';
    }
  },
  website: {
    required: false,
    custom: (value: string) => {
      if (!value) return true;
      return validateURL(value) ? true : 'Invalid URL format';
    }
  },
  username: {
    required: true,
    custom: (value: string) => {
      const result = validateUsername(value);
      return result.isValid ? true : result.errors[0];
    }
  },
  message: {
    required: true,
    minLength: 10,
    maxLength: 1000
  },
  terms: {
    required: true,
    custom: (value: boolean) => {
      return value === true ? true : 'You must agree to the terms and conditions';
    }
  }
};

export const debounceValidation = (
  fn: Function,
  delay: number = 300
) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(null, args), delay);
  };
};
