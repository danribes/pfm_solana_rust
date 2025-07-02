// Task 7.1.3: Public User Registration & Wallet Connection
// Registration service for user registration and account management

import {
  UserRegistrationData,
  RegistrationResponse,
  UsernameCheckResponse,
  UserProfile,
  RegistrationError,
  REGISTRATION_ERROR_CODES
} from '@/types/registration';

// Base API configuration - Docker environment compatible
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_TIMEOUT = 10000; // 10 seconds

// Registration API client
class RegistrationAPI {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string = API_BASE_URL, timeout: number = API_TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();
    
    if (!response.ok) {
      const error: RegistrationError = {
        code: data.code || REGISTRATION_ERROR_CODES.SERVER_ERROR,
        message: data.message || 'An error occurred',
        field: data.field,
        details: data.details,
        retryable: response.status >= 500
      };
      throw error;
    }

    return data;
  }

  // Register new user
  async registerUser(userData: UserRegistrationData): Promise<RegistrationResponse> {
    const url = `${this.baseURL}/api/auth/register`;
    
    try {
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      return await this.handleResponse<RegistrationResponse>(response);
    } catch (error) {
      if (error instanceof Error) {
        throw {
          code: REGISTRATION_ERROR_CODES.NETWORK_ERROR,
          message: error.message,
          retryable: true
        } as RegistrationError;
      }
      throw error;
    }
  }

  // Check if email is available
  async checkEmailAvailability(email: string): Promise<{ available: boolean; message?: string }> {
    const url = `${this.baseURL}/api/auth/check-email`;
    
    try {
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      return await this.handleResponse<{ available: boolean; message?: string }>(response);
    } catch (error) {
      // Return true if API is down to not block registration
      return { available: true };
    }
  }

  // Check if username is available
  async checkUsernameAvailability(username: string): Promise<UsernameCheckResponse> {
    const url = `${this.baseURL}/api/auth/check-username`;
    
    try {
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        body: JSON.stringify({ username }),
      });

      return await this.handleResponse<UsernameCheckResponse>(response);
    } catch (error) {
      // Return available if API is down to not block registration
      return {
        success: true,
        available: true,
        message: 'Unable to check username availability'
      };
    }
  }

  // Get user profile
  async getUserProfile(userId: string): Promise<UserProfile> {
    const url = `${this.baseURL}/api/users/${userId}`;
    
    const response = await this.fetchWithTimeout(url);
    return await this.handleResponse<UserProfile>(response);
  }

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const url = `${this.baseURL}/api/users/${userId}`;
    
    const response = await this.fetchWithTimeout(url, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });

    return await this.handleResponse<UserProfile>(response);
  }

  // Upload profile picture
  async uploadProfilePicture(userId: string, file: File): Promise<{ url: string }> {
    const url = `${this.baseURL}/api/users/${userId}/profile-picture`;
    
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.fetchWithTimeout(url, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });

    return await this.handleResponse<{ url: string }>(response);
  }

  // Delete user account
  async deleteUserAccount(userId: string, reason?: string): Promise<{ success: boolean }> {
    const url = `${this.baseURL}/api/users/${userId}`;
    
    const response = await this.fetchWithTimeout(url, {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    });

    return await this.handleResponse<{ success: boolean }>(response);
  }
}

// Create singleton instance
const registrationAPI = new RegistrationAPI();

// Export individual functions for easier use
export const registerUser = (userData: UserRegistrationData) => 
  registrationAPI.registerUser(userData);

export const checkEmailAvailability = (email: string) => 
  registrationAPI.checkEmailAvailability(email);

export const checkUsernameAvailability = (username: string) => 
  registrationAPI.checkUsernameAvailability(username);

export const getUserProfile = (userId: string) => 
  registrationAPI.getUserProfile(userId);

export const updateUserProfile = (userId: string, updates: Partial<UserProfile>) => 
  registrationAPI.updateUserProfile(userId, updates);

export const uploadProfilePicture = (userId: string, file: File) => 
  registrationAPI.uploadProfilePicture(userId, file);

export const deleteUserAccount = (userId: string, reason?: string) => 
  registrationAPI.deleteUserAccount(userId, reason);

// Mock data functions for development
export const createMockUser = (overrides: Partial<UserRegistrationData> = {}): UserRegistrationData => ({
  email: 'user@example.com',
  username: 'newuser',
  firstName: 'John',
  lastName: 'Doe',
  password: 'SecurePass123!',
  confirmPassword: 'SecurePass123!',
  interests: ['technology', 'governance'],
  marketingConsent: false,
  termsAccepted: true,
  privacyPolicyAccepted: true,
  language: 'English',
  ...overrides
});

// Development mode helpers
export const isDevelopment = process.env.NODE_ENV === 'development';
export const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || isDevelopment;

// Mock API functions for development
export const mockRegisterUser = async (userData: UserRegistrationData): Promise<RegistrationResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate various responses based on email
  if (userData.email === 'existing@example.com') {
    throw {
      code: REGISTRATION_ERROR_CODES.EMAIL_ALREADY_EXISTS,
      message: 'An account with this email already exists',
      field: 'email',
      retryable: false
    } as RegistrationError;
  }
  
  if (userData.username === 'admin') {
    throw {
      code: REGISTRATION_ERROR_CODES.USERNAME_TAKEN,
      message: 'This username is not available',
      field: 'username',
      retryable: false
    } as RegistrationError;
  }

  return {
    success: true,
    data: {
      userId: `user-${Math.random().toString(36).substr(2, 9)}`,
      registrationToken: `token-${Math.random().toString(36).substr(2, 20)}`,
      requiresEmailVerification: true
    }
  };
};

export const mockCheckEmailAvailability = async (email: string): Promise<{ available: boolean; message?: string }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Mock unavailable emails
  const unavailableEmails = [
    'admin@example.com',
    'test@example.com',
    'user@example.com',
    'existing@example.com'
  ];
  
  const available = !unavailableEmails.includes(email.toLowerCase());
  
  return {
    available,
    message: available ? undefined : 'This email is already registered'
  };
};

export const mockCheckUsernameAvailability = async (username: string): Promise<UsernameCheckResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Mock unavailable usernames
  const unavailableUsernames = [
    'admin', 'root', 'api', 'www', 'support', 'help',
    'user', 'test', 'demo', 'john', 'jane'
  ];
  
  const available = !unavailableUsernames.includes(username.toLowerCase());
  
  if (!available) {
    return {
      success: true,
      available: false,
      suggestions: [
        `${username}123`,
        `${username}_user`,
        `${username}2024`,
        `new_${username}`,
        `${username}_pfm`
      ],
      message: `Username "${username}" is already taken`
    };
  }
  
  return {
    success: true,
    available: true,
    message: `Username "${username}" is available`
  };
};

// Registration analytics functions
export const trackRegistrationEvent = (
  eventType: 'step_started' | 'step_completed' | 'step_abandoned' | 'error_occurred',
  step: string,
  metadata?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'registration_progress', {
      event_category: 'registration',
      event_label: step,
      custom_map: {
        event_type: eventType,
        ...metadata
      }
    });
  }
  
  // Also track in console for development
  if (isDevelopment) {
    console.log('Registration Event:', {
      type: eventType,
      step,
      metadata,
      timestamp: new Date().toISOString()
    });
  }
};

// Error handling utilities
export const handleRegistrationError = (error: any): RegistrationError => {
  if (error.code && error.message) {
    return error as RegistrationError;
  }
  
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      code: REGISTRATION_ERROR_CODES.NETWORK_ERROR,
      message: 'Network connection failed. Please check your internet connection.',
      retryable: true
    };
  }
  
  // Generic server error
  return {
    code: REGISTRATION_ERROR_CODES.SERVER_ERROR,
    message: error.message || 'An unexpected error occurred',
    retryable: true
  };
};

// Retry logic for failed requests
export const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      const registrationError = handleRegistrationError(error);
      
      // Don't retry non-retryable errors
      if (!registrationError.retryable || attempt === maxRetries) {
        throw registrationError;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
};

// Password strength checker (client-side)
export const checkPasswordStrength = (password: string): {
  score: number;
  strength: 'weak' | 'fair' | 'good' | 'strong';
  feedback: string[];
} => {
  let score = 0;
  const feedback: string[] = [];
  
  // Length check
  if (password.length >= 8) score += 1;
  else feedback.push('Use at least 8 characters');
  
  if (password.length >= 12) score += 1;
  else if (password.length >= 8) feedback.push('Longer passwords are more secure');
  
  // Character variety checks
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Add uppercase letters');
  
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Add lowercase letters');
  
  if (/\d/.test(password)) score += 1;
  else feedback.push('Add numbers');
  
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  else feedback.push('Add special characters');
  
  // Common patterns check
  const commonPatterns = [
    /(.)\1{2,}/, // Repeated characters
    /123456/, // Sequential numbers
    /password/i, // Common word
    /qwerty/i // Keyboard patterns
  ];
  
  if (commonPatterns.some(pattern => pattern.test(password))) {
    score -= 1;
    feedback.push('Avoid common patterns');
  }
  
  // Determine strength
  let strength: 'weak' | 'fair' | 'good' | 'strong';
  if (score <= 2) strength = 'weak';
  else if (score <= 3) strength = 'fair';
  else if (score <= 4) strength = 'good';
  else strength = 'strong';
  
  return { score: Math.max(0, score), strength, feedback };
};

// Generate username suggestions
export const generateUsernameSuggestions = (
  firstName: string,
  lastName: string,
  interests: string[] = []
): string[] => {
  const suggestions: string[] = [];
  const first = firstName.toLowerCase();
  const last = lastName.toLowerCase();
  const year = new Date().getFullYear();
  
  // Basic combinations
  suggestions.push(`${first}${last}`);
  suggestions.push(`${first}.${last}`);
  suggestions.push(`${first}_${last}`);
  suggestions.push(`${first}${last.charAt(0)}`);
  
  // With numbers
  suggestions.push(`${first}${last}${Math.floor(Math.random() * 100)}`);
  suggestions.push(`${first}${year}`);
  suggestions.push(`${first}${last}${year}`);
  
  // With interests
  if (interests.length > 0) {
    const interest = interests[0].toLowerCase();
    suggestions.push(`${first}_${interest}`);
    suggestions.push(`${interest}_${first}`);
  }
  
  // Random variations
  suggestions.push(`${first}${Math.floor(Math.random() * 1000)}`);
  suggestions.push(`user_${first}_${Math.floor(Math.random() * 100)}`);
  
  return suggestions.slice(0, 8);
};

// Export main API instance
export default registrationAPI; 