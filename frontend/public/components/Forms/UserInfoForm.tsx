// Task 7.1.3: Public User Registration & Wallet Connection
// User information form component for registration

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { UserInfoFormProps, UserRegistrationData, FormErrors } from '../../types/registration';
import { 
  validateField, 
  getPasswordStrength, 
  generateUsernameSuggestions 
} from '../../validation/registrationValidation';
import { 
  checkEmailAvailability, 
  checkUsernameAvailability 
} from '../../services/registration';

interface FieldState {
  value: string;
  error?: string;
  isValidating?: boolean;
  suggestions?: string[];
}

const UserInfoForm: React.FC<UserInfoFormProps> = ({
  initialData = {},
  onSubmit,
  onBack,
  isLoading = false,
  errors: externalErrors = {}
}) => {
  // Form state
  const [formData, setFormData] = useState<Partial<UserRegistrationData>>({
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    language: 'English',
    ...initialData
  });

  const [fieldStates, setFieldStates] = useState<Record<string, FieldState>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    strength: 'weak' | 'fair' | 'good' | 'strong';
    feedback: string[];
  }>({
    score: 0,
    strength: 'weak',
    feedback: []
  });

  // Debounced validation
  const [validationTimers, setValidationTimers] = useState<Record<string, NodeJS.Timeout>>({});

  // Update field value
  const updateField = useCallback((fieldName: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    setFieldStates(prev => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], value, error: undefined }
    }));

    // Clear previous validation timer
    if (validationTimers[fieldName]) {
      clearTimeout(validationTimers[fieldName]);
    }

    // Set new validation timer (debounce)
    const timer = setTimeout(() => {
      validateFieldAsync(fieldName, value);
    }, fieldName === 'email' || fieldName === 'username' ? 1000 : 500);

    setValidationTimers(prev => ({ ...prev, [fieldName]: timer }));
  }, [validationTimers]);

  // Async field validation
  const validateFieldAsync = useCallback(async (fieldName: string, value: string) => {
    if (!value.trim()) return;

    setFieldStates(prev => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], isValidating: true }
    }));

    try {
      // Basic validation first
      const error = await validateField(fieldName as keyof UserRegistrationData, value, formData);
      
      if (error) {
        setFieldStates(prev => ({
          ...prev,
          [fieldName]: { 
            ...prev[fieldName], 
            error, 
            isValidating: false,
            suggestions: undefined
          }
        }));
        return;
      }

      // Async validation for email and username
      if (fieldName === 'email') {
        const emailResult = await checkEmailAvailability(value);
        if (!emailResult.available) {
          setFieldStates(prev => ({
            ...prev,
            [fieldName]: { 
              ...prev[fieldName], 
              error: emailResult.message || 'Email is already registered',
              isValidating: false
            }
          }));
        } else {
          setFieldStates(prev => ({
            ...prev,
            [fieldName]: { ...prev[fieldName], error: undefined, isValidating: false }
          }));
        }
      } else if (fieldName === 'username') {
        const usernameResult = await checkUsernameAvailability(value);
        if (!usernameResult.available) {
          setFieldStates(prev => ({
            ...prev,
            [fieldName]: { 
              ...prev[fieldName], 
              error: usernameResult.message || 'Username is not available',
              suggestions: usernameResult.suggestions,
              isValidating: false
            }
          }));
        } else {
          setFieldStates(prev => ({
            ...prev,
            [fieldName]: { ...prev[fieldName], error: undefined, isValidating: false }
          }));
        }
      } else {
        setFieldStates(prev => ({
          ...prev,
          [fieldName]: { ...prev[fieldName], error: undefined, isValidating: false }
        }));
      }
    } catch (error) {
      setFieldStates(prev => ({
        ...prev,
        [fieldName]: { 
          ...prev[fieldName], 
          error: 'Validation failed. Please try again.',
          isValidating: false
        }
      }));
    }
  }, [formData]);

  // Handle field blur
  const handleFieldBlur = useCallback((fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    const value = formData[fieldName as keyof UserRegistrationData] as string;
    if (value && !fieldStates[fieldName]?.error) {
      validateFieldAsync(fieldName, value);
    }
  }, [formData, fieldStates, validateFieldAsync]);

  // Update password strength when password changes
  useEffect(() => {
    if (formData.password) {
      const strength = getPasswordStrength(formData.password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength({ score: 0, strength: 'weak', feedback: [] });
    }
  }, [formData.password]);

  // Generate username suggestions when first/last name changes
  useEffect(() => {
    if (formData.firstName && formData.lastName && !formData.username) {
      const suggestions = generateUsernameSuggestions(
        formData.firstName,
        formData.lastName,
        formData.interests || []
      );
      setFieldStates(prev => ({
        ...prev,
        username: { 
          ...prev.username, 
          suggestions: suggestions.slice(0, 3) 
        }
      }));
    }
  }, [formData.firstName, formData.lastName, formData.username, formData.interests]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate all fields
      const requiredFields = ['email', 'username', 'firstName', 'lastName', 'password', 'confirmPassword'];
      const newErrors: FormErrors = {};

      for (const field of requiredFields) {
        const value = formData[field as keyof UserRegistrationData] as string;
        if (!value) {
          newErrors[field] = 'This field is required';
          continue;
        }

        const error = await validateField(field as keyof UserRegistrationData, value, formData);
        if (error) {
          newErrors[field] = error;
        }
      }

      // Check if passwords match
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      // If there are errors, update field states and don't submit
      if (Object.keys(newErrors).length > 0) {
        Object.entries(newErrors).forEach(([field, error]) => {
          setFieldStates(prev => ({
            ...prev,
            [field]: { ...prev[field], error }
          }));
          setTouched(prev => ({ ...prev, [field]: true }));
        });
        return;
      }

      // Submit the form
      onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Apply username suggestion
  const applySuggestion = useCallback((suggestion: string) => {
    updateField('username', suggestion);
    setFieldStates(prev => ({
      ...prev,
      username: { ...prev.username, suggestions: undefined }
    }));
  }, [updateField]);

  // Get field error (external or internal)
  const getFieldError = useCallback((fieldName: string) => {
    return externalErrors[fieldName] || fieldStates[fieldName]?.error;
  }, [externalErrors, fieldStates]);

  // Check if field has error
  const hasFieldError = useCallback((fieldName: string) => {
    const error = getFieldError(fieldName);
    return touched[fieldName] && !!error;
  }, [getFieldError, touched]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Create Your Account
          </h2>
          <p className="text-gray-600">
            Please provide your information to set up your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                value={formData.firstName || ''}
                onChange={(e) => updateField('firstName', e.target.value)}
                onBlur={() => handleFieldBlur('firstName')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  hasFieldError('firstName')
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300'
                }`}
                placeholder="Enter your first name"
                aria-invalid={hasFieldError('firstName')}
                aria-describedby={hasFieldError('firstName') ? 'firstName-error' : undefined}
              />
              {hasFieldError('firstName') && (
                <p id="firstName-error" className="mt-1 text-sm text-red-600">
                  {getFieldError('firstName')}
                </p>
              )}
            </div>

            {/* Last name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                value={formData.lastName || ''}
                onChange={(e) => updateField('lastName', e.target.value)}
                onBlur={() => handleFieldBlur('lastName')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  hasFieldError('lastName')
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300'
                }`}
                placeholder="Enter your last name"
                aria-invalid={hasFieldError('lastName')}
                aria-describedby={hasFieldError('lastName') ? 'lastName-error' : undefined}
              />
              {hasFieldError('lastName') && (
                <p id="lastName-error" className="mt-1 text-sm text-red-600">
                  {getFieldError('lastName')}
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={formData.email || ''}
                onChange={(e) => updateField('email', e.target.value)}
                onBlur={() => handleFieldBlur('email')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  hasFieldError('email')
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300'
                }`}
                placeholder="Enter your email address"
                aria-invalid={hasFieldError('email')}
                aria-describedby={hasFieldError('email') ? 'email-error' : undefined}
              />
              {fieldStates.email?.isValidating && (
                <div className="absolute right-3 top-2.5">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
            {hasFieldError('email') && (
              <p id="email-error" className="mt-1 text-sm text-red-600">
                {getFieldError('email')}
              </p>
            )}
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username *
            </label>
            <div className="relative">
              <input
                type="text"
                id="username"
                value={formData.username || ''}
                onChange={(e) => updateField('username', e.target.value)}
                onBlur={() => handleFieldBlur('username')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  hasFieldError('username')
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300'
                }`}
                placeholder="Choose a username"
                aria-invalid={hasFieldError('username')}
                aria-describedby={hasFieldError('username') ? 'username-error' : 'username-help'}
              />
              {fieldStates.username?.isValidating && (
                <div className="absolute right-3 top-2.5">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
            
            {hasFieldError('username') && (
              <p id="username-error" className="mt-1 text-sm text-red-600">
                {getFieldError('username')}
              </p>
            )}
            
            {!hasFieldError('username') && (
              <p id="username-help" className="mt-1 text-sm text-gray-500">
                3-20 characters, letters, numbers, hyphens, and underscores only
              </p>
            )}

            {/* Username suggestions */}
            {fieldStates.username?.suggestions && fieldStates.username.suggestions.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-2">Suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {fieldStates.username.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => applySuggestion(suggestion)}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
            <input
              type="password"
              id="password"
              value={formData.password || ''}
              onChange={(e) => updateField('password', e.target.value)}
              onBlur={() => handleFieldBlur('password')}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                hasFieldError('password')
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300'
              }`}
              placeholder="Create a strong password"
              aria-invalid={hasFieldError('password')}
              aria-describedby={hasFieldError('password') ? 'password-error' : 'password-strength'}
            />
            
            {hasFieldError('password') && (
              <p id="password-error" className="mt-1 text-sm text-red-600">
                {getFieldError('password')}
              </p>
            )}

            {/* Password strength meter */}
            {formData.password && !hasFieldError('password') && (
              <div id="password-strength" className="mt-2">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm text-gray-600">Strength:</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength.strength === 'weak' ? 'bg-red-500 w-1/4' :
                        passwordStrength.strength === 'fair' ? 'bg-yellow-500 w-2/4' :
                        passwordStrength.strength === 'good' ? 'bg-blue-500 w-3/4' :
                        'bg-green-500 w-full'
                      }`}
                    />
                  </div>
                  <span className={`text-sm font-medium ${
                    passwordStrength.strength === 'weak' ? 'text-red-600' :
                    passwordStrength.strength === 'fair' ? 'text-yellow-600' :
                    passwordStrength.strength === 'good' ? 'text-blue-600' :
                    'text-green-600'
                  }`}>
                    {passwordStrength.strength.charAt(0).toUpperCase() + passwordStrength.strength.slice(1)}
                  </span>
                </div>
                
                {passwordStrength.feedback.length > 0 && (
                  <ul className="text-sm text-gray-600 space-y-1">
                    {passwordStrength.feedback.map((feedback, index) => (
                      <li key={index} className="flex items-center">
                        <span className="mr-2">•</span>
                        <span>{feedback}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password *
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword || ''}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              onBlur={() => handleFieldBlur('confirmPassword')}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                hasFieldError('confirmPassword')
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300'
              }`}
              placeholder="Confirm your password"
              aria-invalid={hasFieldError('confirmPassword')}
              aria-describedby={hasFieldError('confirmPassword') ? 'confirmPassword-error' : undefined}
            />
            {hasFieldError('confirmPassword') && (
              <p id="confirmPassword-error" className="mt-1 text-sm text-red-600">
                {getFieldError('confirmPassword')}
              </p>
            )}
          </div>

          {/* Language */}
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Language
            </label>
            <select
              id="language"
              value={formData.language || 'English'}
              onChange={(e) => updateField('language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Chinese">Chinese</option>
              <option value="Japanese">Japanese</option>
              <option value="Korean">Korean</option>
              <option value="Portuguese">Portuguese</option>
            </select>
          </div>

          {/* Form actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Back
              </button>
            )}
            
            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className={`flex-1 px-6 py-2 rounded-lg font-medium transition-colors ${
                isLoading || isSubmitting
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isLoading || isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </span>
              ) : (
                'Continue →'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserInfoForm; 