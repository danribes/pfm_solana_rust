'use client';

// Task 7.1.1: Public Landing Page Development
// Email Signup Form - Lead capture form with validation

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  Loader,
  Gift,
  Shield,
  Users
} from 'lucide-react';
import { EmailSignupData, FormErrors, ComponentState } from '@/types/landing';
import { validateEmail, sanitizeInput } from '@/utils/validation';
import { fadeInUp } from '@/utils/animation';

interface EmailSignupProps {
  placeholder?: string;
  buttonText?: string;
  showNameFields?: boolean;
  showPrivacyNote?: boolean;
  variant?: 'inline' | 'modal' | 'sidebar';
  source?: string;
  leadMagnet?: {
    title: string;
    description: string;
    icon: React.ReactNode;
  };
  onSuccess?: (data: EmailSignupData) => void;
  className?: string;
}

const EmailSignup: React.FC<EmailSignupProps> = ({
  placeholder = "Enter your email address",
  buttonText = "Get Started",
  showNameFields = false,
  showPrivacyNote = true,
  variant = 'inline',
  source = 'email_signup',
  leadMagnet,
  onSuccess,
  className = ''
}) => {
  const [formData, setFormData] = useState<EmailSignupData>({
    email: '',
    firstName: '',
    lastName: '',
    interests: []
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [state, setState] = useState<ComponentState>({
    loading: false,
    error: null,
// Success state management for form completion feedback
    success: false
  });

  const defaultLeadMagnet = {
    title: "Free Community Voting Guide",
    description: "Get our comprehensive guide to implementing secure voting in your community",
    icon: <Gift className="h-6 w-6" />
  };

  const displayLeadMagnet = leadMagnet || defaultLeadMagnet;

  const handleInputChange = (field: keyof EmailSignupData, value: string) => {
    const sanitizedValue = sanitizeInput(value);
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
// Form submission handling with validation and error states
// Error handling for form validation and submission failures
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Name validation (if fields are shown)
    if (showNameFields) {
      if (!formData.firstName?.trim()) {
        newErrors.firstName = 'First name is required';
      }
      if (!formData.lastName?.trim()) {
        newErrors.lastName = 'Last name is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Simulate API call
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          source,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Subscription failed');
      }

      const result = await response.json();
      
      setState(prev => ({ ...prev, loading: false, success: true }));
      
      // Call success callback
      if (onSuccess) {
        onSuccess(formData);
      }
      
      // Track conversion event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'sign_up', {
          method: 'email',
          source: source
        });
      }
      
      // Reset form after success
      setTimeout(() => {
        setFormData({
          email: '',
          firstName: '',
          lastName: '',
          interests: []
        });
        setState(prev => ({ ...prev, success: false }));
      }, 3000);
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to subscribe. Please try again.'
      }));
    }
  };

  const renderInlineForm = () => (
    <div className={`max-w-md mx-auto ${className}`}>
      {/* Lead Magnet */}
      {leadMagnet !== null && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6 text-white"
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              {displayLeadMagnet.icon}
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">{displayLeadMagnet.title}</h3>
              <p className="text-sm text-white/80">{displayLeadMagnet.description}</p>
            </div>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Fields */}
        {showNameFields && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                placeholder="First name"
                value={formData.firstName || ''}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-colors ${
                  errors.firstName
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-white/20 focus:border-white/40'
                } bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none`}
              />
              {errors.firstName && (
                <p className="text-red-300 text-sm mt-1">{errors.firstName}</p>
              )}
            </div>
            <div>
              <input
                type="text"
                placeholder="Last name"
                value={formData.lastName || ''}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-colors ${
                  errors.lastName
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-white/20 focus:border-white/40'
                } bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none`}
              />
              {errors.lastName && (
                <p className="text-red-300 text-sm mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>
        )}

        {/* Email Field */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
              <input
                type="email"
                placeholder={placeholder}
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-colors ${
                  errors.email
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-white/20 focus:border-white/40'
                } bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none`}
                required
              />
            </div>
            {errors.email && (
              <p className="text-red-300 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={state.loading || state.success}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
              state.success
                ? 'bg-green-500 text-white'
                : 'bg-white text-primary-600 hover:bg-gray-100'
            } shadow-lg`}
          >
            {state.loading ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : state.success ? (
              <>
                <CheckCircle className="h-5 w-5" />
                <span>Subscribed!</span>
              </>
            ) : (
              <>
                <span>{buttonText}</span>
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </motion.button>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {state.error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center space-x-2 text-red-300 bg-red-500/10 rounded-lg p-3"
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{state.error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Privacy Note */}
        {showPrivacyNote && (
          <div className="flex items-start space-x-3 text-white/70 text-sm">
            <Shield className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p>
              We respect your privacy. Unsubscribe at any time. Read our{' '}
              <a href="/privacy" className="underline hover:text-white transition-colors">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        )}
      </form>
    </div>
  );

  const renderModalForm = () => (
    <div className={`bg-white rounded-2xl p-8 max-w-md mx-auto ${className}`}>
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          {displayLeadMagnet.icon}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {displayLeadMagnet.title}
        </h3>
        <p className="text-gray-600">
          {displayLeadMagnet.description}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {showNameFields && (
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First name"
              value={formData.firstName || ''}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Last name"
              value={formData.lastName || ''}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        )}

        <div className="relative">
          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="email"
            placeholder={placeholder}
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>

        <motion.button
          type="submit"
          disabled={state.loading || state.success}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-lg flex items-center justify-center space-x-2"
        >
          {state.loading ? (
            <Loader className="h-5 w-5 animate-spin" />
          ) : state.success ? (
            <>
              <CheckCircle className="h-5 w-5" />
              <span>Subscribed!</span>
            </>
          ) : (
            <>
              <span>{buttonText}</span>
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </motion.button>

        {showPrivacyNote && (
          <p className="text-gray-500 text-sm text-center">
            We respect your privacy. Unsubscribe at any time.
          </p>
        )}
      </form>
    </div>
  );

  const renderSidebarForm = () => (
    <div className={`bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-6 ${className}`}>
      <div className="flex items-center space-x-3 mb-4">
        <Users className="h-8 w-8 text-primary-600" />
        <div>
          <h3 className="font-bold text-primary-900">Join Our Community</h3>
          <p className="text-primary-700 text-sm">Get exclusive updates</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder={placeholder}
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className="w-full px-4 py-3 border border-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
          required
        />

        <button
          type="submit"
          disabled={state.loading || state.success}
          className="w-full px-4 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
        >
          {state.loading ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : state.success ? (
            <>
              <CheckCircle className="h-4 w-4" />
              <span>Success!</span>
            </>
          ) : (
            <span>{buttonText}</span>
          )}
        </button>
      </form>
    </div>
  );

  return (
    <>
      {variant === 'inline' && renderInlineForm()}
      {variant === 'modal' && renderModalForm()}
      {variant === 'sidebar' && renderSidebarForm()}
    </>
  );
};

export default EmailSignup;
