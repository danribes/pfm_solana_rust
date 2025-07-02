// Contact Support Form Component
// Comprehensive support ticket creation with categorization and file uploads

'use client';

import React, { useState, useRef, useEffect } from 'react';

interface ContactSupportFormProps {
  onSubmit: (ticketData: SupportTicketData) => Promise<void>;
  onCancel?: () => void;
  userContext?: UserContext;
  isLoading?: boolean;
  className?: string;
}

interface SupportTicketData {
  type: SupportType;
  priority: PriorityLevel;
  subject: string;
  description: string;
  category: SupportCategory;
  userInfo: {
    name: string;
    email: string;
    userId?: string;
    walletAddress?: string;
  };
  systemInfo: SystemInfo;
  attachments: File[];
  additionalInfo: {
    reproductionSteps?: string;
    expectedBehavior?: string;
    actualBehavior?: string;
    browserInfo?: string;
    errorLogs?: string;
  };
}

interface UserContext {
  userId?: string;
  email?: string;
  name?: string;
  walletAddress?: string;
  membershipLevel?: string;
}

interface SystemInfo {
  userAgent: string;
  url: string;
  timestamp: string;
  viewport: string;
  language: string;
  timezone: string;
}

type SupportType = 'general' | 'technical' | 'billing' | 'account' | 'feature_request' | 'bug_report';
type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';
type SupportCategory = 
  | 'account_access'
  | 'wallet_connection'
  | 'voting_issues'
  | 'community_problems'
  | 'payment_billing'
  | 'security_concerns'
  | 'feature_feedback'
  | 'technical_error'
  | 'general_inquiry'
  | 'other';

const SUPPORT_TYPES = [
  { value: 'general', label: 'General Inquiry', description: 'General questions about the platform' },
  { value: 'technical', label: 'Technical Issue', description: 'Bugs, errors, or technical problems' },
  { value: 'account', label: 'Account Support', description: 'Account access, settings, or profile issues' },
  { value: 'billing', label: 'Billing Support', description: 'Payment, subscription, or billing questions' },
  { value: 'feature_request', label: 'Feature Request', description: 'Suggestions for new features or improvements' },
  { value: 'bug_report', label: 'Bug Report', description: 'Report a bug or unexpected behavior' },
] as const;

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', description: 'General questions, no urgency', color: 'text-gray-600' },
  { value: 'medium', label: 'Medium', description: 'Standard issues affecting usage', color: 'text-blue-600' },
  { value: 'high', label: 'High', description: 'Significant problems affecting functionality', color: 'text-orange-600' },
  { value: 'urgent', label: 'Urgent', description: 'Critical issues blocking access or causing data loss', color: 'text-red-600' },
] as const;

const SUPPORT_CATEGORIES = [
  { value: 'account_access', label: 'Account Access', types: ['account', 'technical'] },
  { value: 'wallet_connection', label: 'Wallet Connection', types: ['technical', 'account'] },
  { value: 'voting_issues', label: 'Voting Issues', types: ['technical', 'bug_report'] },
  { value: 'community_problems', label: 'Community Problems', types: ['general', 'technical'] },
  { value: 'payment_billing', label: 'Payment & Billing', types: ['billing'] },
  { value: 'security_concerns', label: 'Security Concerns', types: ['account', 'technical'] },
  { value: 'feature_feedback', label: 'Feature Feedback', types: ['feature_request'] },
  { value: 'technical_error', label: 'Technical Error', types: ['technical', 'bug_report'] },
  { value: 'general_inquiry', label: 'General Inquiry', types: ['general'] },
  { value: 'other', label: 'Other', types: ['general', 'technical', 'account', 'billing', 'feature_request', 'bug_report'] },
] as const;

const ContactSupportForm: React.FC<ContactSupportFormProps> = ({
  onSubmit,
  onCancel,
  userContext,
  isLoading = false,
  className = '',
}) => {
  const [formData, setFormData] = useState<SupportTicketData>({
    type: 'general',
    priority: 'medium',
    subject: '',
    description: '',
    category: 'general_inquiry',
    userInfo: {
      name: userContext?.name || '',
      email: userContext?.email || '',
      userId: userContext?.userId,
      walletAddress: userContext?.walletAddress,
    },
    systemInfo: {
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
      url: typeof window !== 'undefined' ? window.location.href : '',
      timestamp: new Date().toISOString(),
      viewport: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '',
      language: typeof window !== 'undefined' ? navigator.language : '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    attachments: [],
    additionalInfo: {},
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isDragOver, setIsDragOver] = useState(false);
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-populate additional fields based on support type
  useEffect(() => {
    if (formData.type === 'bug_report' || formData.type === 'technical') {
      setShowAdditionalFields(true);
    } else {
      setShowAdditionalFields(false);
    }
  }, [formData.type]);

  // Get filtered categories based on support type
  const getAvailableCategories = () => {
    return SUPPORT_CATEGORIES.filter(category => 
      category.types.includes(formData.type)
    );
  };

  // Handle form field changes
  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle nested field changes
  const handleNestedFieldChange = (parentField: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField as keyof SupportTicketData],
        [field]: value,
      },
    }));
  };

  // Handle file selection
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    const maxFiles = 5;
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/json',
      'text/csv',
    ];

    const validFiles: File[] = [];
    const fileErrors: string[] = [];

    Array.from(files).forEach((file) => {
      if (formData.attachments.length + validFiles.length >= maxFiles) {
        fileErrors.push(`Maximum ${maxFiles} files allowed`);
        return;
      }

      if (file.size > maxSize) {
        fileErrors.push(`File "${file.name}" is too large (max 10MB)`);
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        fileErrors.push(`File type "${file.type}" not supported for "${file.name}"`);
        return;
      }

      validFiles.push(file);
    });

    if (fileErrors.length > 0) {
      setErrors(prev => ({ ...prev, attachments: fileErrors.join(', ') }));
    } else {
      setErrors(prev => ({ ...prev, attachments: '' }));
    }

    if (validFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...validFiles],
      }));
    }
  };

  // Handle file removal
  const handleFileRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.userInfo.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.userInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.userInfo.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.type === 'bug_report') {
      if (!formData.additionalInfo.reproductionSteps?.trim()) {
        newErrors.reproductionSteps = 'Steps to reproduce are required for bug reports';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      setErrors({ submit: 'Failed to submit support request. Please try again.' });
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get estimated response time
  const getEstimatedResponseTime = (): string => {
    switch (formData.priority) {
      case 'urgent': return '2-4 hours';
      case 'high': return '4-12 hours';
      case 'medium': return '1-2 business days';
      case 'low': return '2-5 business days';
      default: return '1-3 business days';
    }
  };

  return (
    <div className={`max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Contact Support</h2>
        <p className="mt-1 text-gray-600">
          We're here to help! Describe your issue and we'll get back to you as soon as possible.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Support Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What type of support do you need?
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SUPPORT_TYPES.map((type) => (
              <label key={type.value} className="cursor-pointer">
                <input
                  type="radio"
                  name="supportType"
                  value={type.value}
                  checked={formData.type === type.value}
                  onChange={(e) => handleFieldChange('type', e.target.value as SupportType)}
                  className="sr-only"
                />
                <div className={`p-3 border-2 rounded-lg transition-all ${
                  formData.type === type.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="font-medium text-gray-900">{type.label}</div>
                  <div className="text-sm text-gray-600">{type.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Priority Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Priority Level
          </label>
          <div className="space-y-2">
            {PRIORITY_LEVELS.map((priority) => (
              <label key={priority.value} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="priority"
                  value={priority.value}
                  checked={formData.priority === priority.value}
                  onChange={(e) => handleFieldChange('priority', e.target.value as PriorityLevel)}
                  className="mr-3"
                />
                <div>
                  <span className={`font-medium ${priority.color}`}>{priority.label}</span>
                  <span className="text-sm text-gray-600 ml-2">- {priority.description}</span>
                </div>
              </label>
            ))}
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Estimated response time: {getEstimatedResponseTime()}
          </p>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => handleFieldChange('category', e.target.value as SupportCategory)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {getAvailableCategories().map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.userInfo.name}
              onChange={(e) => handleNestedFieldChange('userInfo', 'name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              value={formData.userInfo.email}
              onChange={(e) => handleNestedFieldChange('userInfo', 'email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
            Subject *
          </label>
          <input
            type="text"
            id="subject"
            value={formData.subject}
            onChange={(e) => handleFieldChange('subject', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.subject ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Brief description of your issue"
            disabled={isLoading}
          />
          {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            rows={5}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical ${
              errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Please provide as much detail as possible about your issue"
            disabled={isLoading}
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          <p className="mt-1 text-sm text-gray-500">
            {formData.description.length}/2000 characters
          </p>
        </div>

        {/* Additional Fields for Bug Reports/Technical Issues */}
        {showAdditionalFields && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="reproductionSteps" className="block text-sm font-medium text-gray-700 mb-1">
                  Steps to Reproduce {formData.type === 'bug_report' && '*'}
                </label>
                <textarea
                  id="reproductionSteps"
                  value={formData.additionalInfo.reproductionSteps || ''}
                  onChange={(e) => handleNestedFieldChange('additionalInfo', 'reproductionSteps', e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.reproductionSteps ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="1. Go to...\n2. Click on...\n3. See error..."
                  disabled={isLoading}
                />
                {errors.reproductionSteps && <p className="mt-1 text-sm text-red-600">{errors.reproductionSteps}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expectedBehavior" className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Behavior
                  </label>
                  <textarea
                    id="expectedBehavior"
                    value={formData.additionalInfo.expectedBehavior || ''}
                    onChange={(e) => handleNestedFieldChange('additionalInfo', 'expectedBehavior', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="What should happen?"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="actualBehavior" className="block text-sm font-medium text-gray-700 mb-1">
                    Actual Behavior
                  </label>
                  <textarea
                    id="actualBehavior"
                    value={formData.additionalInfo.actualBehavior || ''}
                    onChange={(e) => handleNestedFieldChange('additionalInfo', 'actualBehavior', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="What actually happens?"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="errorLogs" className="block text-sm font-medium text-gray-700 mb-1">
                  Error Messages or Logs
                </label>
                <textarea
                  id="errorLogs"
                  value={formData.additionalInfo.errorLogs || ''}
                  onChange={(e) => handleNestedFieldChange('additionalInfo', 'errorLogs', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder="Paste any error messages or console logs here..."
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        )}

        {/* File Attachments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Attachments (Optional)
          </label>
          
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragOver
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Drag and drop files here, or{' '}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Images, PDFs, text files up to 10MB each (max 5 files)
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.txt,.json,.csv"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />

          {errors.attachments && (
            <p className="mt-1 text-sm text-red-600">{errors.attachments}</p>
          )}

          {/* File List */}
          {formData.attachments.length > 0 && (
            <div className="mt-4 space-y-2">
              {formData.attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <span className="text-xs text-gray-500 ml-2">({formatFileSize(file.size)})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFileRemove(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Information Preview */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">System Information</h4>
          <p className="text-sm text-gray-600 mb-2">
            The following technical information will be included to help us assist you:
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>Browser: {formData.systemInfo.userAgent.split(' ')[0]}</div>
            <div>Page: {new URL(formData.systemInfo.url).pathname}</div>
            <div>Viewport: {formData.systemInfo.viewport}</div>
            <div>Language: {formData.systemInfo.language}</div>
            <div>Timezone: {formData.systemInfo.timezone}</div>
          </div>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">{errors.submit}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              'Submit Support Request'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactSupportForm; 