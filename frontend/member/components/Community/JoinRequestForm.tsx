import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../shared/contexts/AuthContext';

interface CommunityInfo {
  id: string;
  name: string;
  description: string;
  membershipRequirements: string[];
  applicationFields: ApplicationField[];
  requiresApproval: boolean;
  maxMembers?: number;
  currentMembers: number;
}

interface ApplicationField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'file' | 'checkbox' | 'radio';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    fileTypes?: string[];
    maxFileSize?: number;
  };
  helpText?: string;
}

interface FormData {
  [key: string]: string | string[] | File | null;
}

interface JoinRequestFormProps {
  communityId: string;
  onSuccess?: (requestId: string) => void;
  onCancel?: () => void;
}

const JoinRequestForm: React.FC<JoinRequestFormProps> = ({
  communityId,
  onSuccess,
  onCancel
}) => {
  const router = useRouter();
  const { authState } = useAuth();
  
  const [community, setCommunity] = useState<CommunityInfo | null>(null);
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isDraft, setIsDraft] = useState(false);

  // Mock community data - in production this would come from API
  useEffect(() => {
    const loadCommunityInfo = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockCommunity: CommunityInfo = {
        id: communityId,
        name: 'Web3 Developers Community',
        description: 'A community for Web3 developers to share knowledge and collaborate',
        membershipRequirements: [
          'Basic knowledge of blockchain technology',
          'Active in Web3 development',
          'Willing to contribute to community discussions'
        ],
        requiresApproval: true,
        maxMembers: 1000,
        currentMembers: 245,
        applicationFields: [
          {
            id: 'fullName',
            type: 'text',
            label: 'Full Name',
            placeholder: 'Enter your full name',
            required: true,
            validation: { minLength: 2, maxLength: 100 }
          },
          {
            id: 'email',
            type: 'text',
            label: 'Email Address',
            placeholder: 'your.email@example.com',
            required: true,
            validation: { pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' }
          },
          {
            id: 'experience',
            type: 'select',
            label: 'Web3 Experience Level',
            required: true,
            options: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
          },
          {
            id: 'motivation',
            type: 'textarea',
            label: 'Why do you want to join this community?',
            placeholder: 'Tell us about your interest in Web3 and what you hope to contribute...',
            required: true,
            validation: { minLength: 50, maxLength: 500 },
            helpText: 'Please provide at least 50 characters explaining your motivation'
          },
          {
            id: 'projects',
            type: 'textarea',
            label: 'Notable Web3 Projects',
            placeholder: 'List any Web3 projects you have worked on...',
            required: false,
            validation: { maxLength: 1000 }
          },
          {
            id: 'skills',
            type: 'multiselect',
            label: 'Technical Skills',
            required: true,
            options: ['Solidity', 'Rust', 'JavaScript', 'TypeScript', 'React', 'Vue', 'Python', 'Go', 'Smart Contracts', 'DeFi', 'NFTs', 'DAOs']
          },
          {
            id: 'resume',
            type: 'file',
            label: 'Resume/Portfolio (Optional)',
            required: false,
            validation: { 
              fileTypes: ['.pdf', '.doc', '.docx'],
              maxFileSize: 5 * 1024 * 1024 // 5MB
            },
            helpText: 'Upload your resume or portfolio (PDF, DOC, DOCX - max 5MB)'
          },
          {
            id: 'agreements',
            type: 'checkbox',
            label: 'I agree to the community guidelines and code of conduct',
            required: true
          }
        ]
      };
      
      setCommunity(mockCommunity);
      setIsLoading(false);
    };

    loadCommunityInfo();
  }, [communityId]);

  const validateField = useCallback((field: ApplicationField, value: any): string | null => {
    if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
      return `${field.label} is required`;
    }

    if (!value) return null;

    const validation = field.validation;
    if (!validation) return null;

    if (field.type === 'text' || field.type === 'textarea') {
      const strValue = String(value);
      
      if (validation.minLength && strValue.length < validation.minLength) {
        return `${field.label} must be at least ${validation.minLength} characters`;
      }
      
      if (validation.maxLength && strValue.length > validation.maxLength) {
        return `${field.label} must be no more than ${validation.maxLength} characters`;
      }
      
      if (validation.pattern && !new RegExp(validation.pattern).test(strValue)) {
        if (field.id === 'email') {
          return 'Please enter a valid email address';
        }
        return `${field.label} format is invalid`;
      }
    }

    if (field.type === 'file' && value instanceof File) {
      if (validation.maxFileSize && value.size > validation.maxFileSize) {
        return `File size must be less than ${Math.round(validation.maxFileSize / (1024 * 1024))}MB`;
      }
      
      if (validation.fileTypes) {
        const fileName = value.name.toLowerCase();
        const hasValidExtension = validation.fileTypes.some(ext => 
          fileName.endsWith(ext.toLowerCase())
        );
        if (!hasValidExtension) {
          return `File must be one of: ${validation.fileTypes.join(', ')}`;
        }
      }
    }

    return null;
  }, []);

  const handleFieldChange = useCallback((fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    
    // Clear error for this field
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }));
    }
  }, [errors]);

  const validateForm = useCallback((): boolean => {
    if (!community) return false;

    const newErrors: Record<string, string> = {};
    
    community.applicationFields.forEach(field => {
      const error = validateField(field, formData[field.id]);
      if (error) {
        newErrors[field.id] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [community, formData, validateField]);

  const saveDraft = useCallback(async () => {
    if (!authState.user || !community) return;

    setIsDraft(true);
    
    try {
      // Simulate API call to save draft
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Draft saved:', {
        userId: authState.user.id,
        communityId: community.id,
        formData,
        timestamp: new Date().toISOString()
      });
      
      // Show success message
      alert('Draft saved successfully!');
    } catch (error) {
      console.error('Failed to save draft:', error);
      alert('Failed to save draft. Please try again.');
    } finally {
      setIsDraft(false);
    }
  }, [authState.user, community, formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !authState.user || !community) return;

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const applicationData = {
        formId: `application-${community.id}`,
        responses: community.applicationFields.map(field => ({
          questionId: field.id,
          questionType: field.type,
          answer: formData[field.id],
          isRequired: field.required
        })),
        completedSections: ['application'],
        submissionAttempts: 1,
        validationErrors: [],
        attachments: []
      };

      const requestId = `req-${Date.now()}`;
      console.log('Application submitted:', {
        requestId,
        userId: authState.user.id,
        communityId: community.id,
        applicationData
      });

      onSuccess?.(requestId);
      router.push(`/communities/${communityId}/application/submitted?requestId=${requestId}`);
      
    } catch (error) {
      console.error('Submission failed:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: ApplicationField) => {
    const value = formData[field.id];
    const error = errors[field.id];
    const fieldClassName = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      error ? 'border-red-500' : 'border-gray-300'
    }`;

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            id={field.id}
            value={value as string || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={fieldClassName}
          />
        );

      case 'textarea':
        return (
          <textarea
            id={field.id}
            value={value as string || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className={fieldClassName}
          />
        );

      case 'select':
        return (
          <select
            id={field.id}
            value={value as string || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={fieldClassName}
          >
            <option value="">Select an option...</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'multiselect':
        const selectedValues = (value as string[]) || [];
        return (
          <div className="space-y-2">
            {field.options?.map(option => (
              <label key={option} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...selectedValues, option]
                      : selectedValues.filter(v => v !== option);
                    handleFieldChange(field.id, newValues);
                  }}
                  className="mr-2 rounded"
                />
                {option}
              </label>
            ))}
          </div>
        );

      case 'file':
        return (
          <div>
            <input
              type="file"
              id={field.id}
              onChange={(e) => handleFieldChange(field.id, e.target.files?.[0] || null)}
              accept={field.validation?.fileTypes?.join(',')}
              className={fieldClassName}
            />
            {value instanceof File && (
              <p className="mt-1 text-sm text-gray-600">
                Selected: {value.name} ({Math.round(value.size / 1024)}KB)
              </p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleFieldChange(field.id, e.target.checked)}
              className="mr-2 mt-1 rounded"
            />
            <span className="text-sm">{field.label}</span>
          </label>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i}>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Failed to load community information. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900">
          Apply to Join {community.name}
        </h1>
        <p className="text-gray-600 mt-2">{community.description}</p>
        
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="font-semibold text-blue-900 mb-2">Membership Requirements:</h3>
          <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
            {community.membershipRequirements.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          {community.currentMembers} of {community.maxMembers || '∞'} members
        </div>
      </div>

      {/* Application Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {community.applicationFields.map((field) => (
            <div key={field.id}>
              {field.type !== 'checkbox' && (
                <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
              )}
              
              {renderField(field)}
              
              {field.helpText && (
                <p className="mt-1 text-xs text-gray-500">{field.helpText}</p>
              )}
              
              {errors[field.id] && (
                <p className="mt-1 text-sm text-red-600">{errors[field.id]}</p>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={saveDraft}
              disabled={isDraft}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {isDraft ? 'Saving...' : 'Save Draft'}
            </button>
            
            <button
              type="button"
              onClick={onCancel || (() => router.back())}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Submitting Application...
              </>
            ) : (
              'Submit Application'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JoinRequestForm;