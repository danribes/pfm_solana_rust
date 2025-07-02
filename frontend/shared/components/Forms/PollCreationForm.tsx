// Task 7.4.3: Community Poll Creation Form
// Comprehensive form component for creating polls and governance proposals

'use client';

import React, { useState, useEffect, useCallback } from 'react';

// Poll creation types
export interface PollOption {
  id: string;
  text: string;
  description?: string;
  image?: string;
}

export interface PollSettings {
  allowAbstain: boolean;
  maxSelections?: number;
  minSelections?: number;
  allowChangeVote: boolean;
  requireReason: boolean;
  isPrivateVoting: boolean;
  quorumRequired?: number;
}

export interface PollFormData {
  title: string;
  description: string;
  type: 'single_choice' | 'multiple_choice' | 'ranked_choice' | 'approval';
  options: PollOption[];
  duration: number; // in days
  settings: PollSettings;
  category: string;
  tags: string[];
  communityId: string;
}

export interface PollCreationFormProps {
  communityId: string;
  initialData?: Partial<PollFormData>;
  onSubmit: (pollData: PollFormData) => Promise<void>;
  onCancel?: () => void;
  onSaveDraft?: (pollData: PollFormData) => Promise<void>;
  isLoading?: boolean;
  allowDrafts?: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const PollCreationForm: React.FC<PollCreationFormProps> = ({
  communityId,
  initialData = {},
  onSubmit,
  onCancel,
  onSaveDraft,
  isLoading = false,
  allowDrafts = true
}) => {
  // Form state
  const [formData, setFormData] = useState<PollFormData>({
    title: '',
    description: '',
    type: 'single_choice',
    options: [
      { id: 'option-1', text: '', description: '' },
      { id: 'option-2', text: '', description: '' }
    ],
    duration: 7,
    settings: {
      allowAbstain: false,
      allowChangeVote: true,
      requireReason: false,
      isPrivateVoting: false
    },
    category: 'general',
    tags: [],
    communityId,
    ...initialData
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [newTag, setNewTag] = useState('');

  // Poll type configurations
  const pollTypeConfig = {
    single_choice: {
      name: 'Single Choice',
      description: 'Members can select only one option',
      icon: '⚫',
      minOptions: 2,
      maxOptions: 10
    },
    multiple_choice: {
      name: 'Multiple Choice',
      description: 'Members can select multiple options',
      icon: '☑️',
      minOptions: 2,
      maxOptions: 15
    },
    ranked_choice: {
      name: 'Ranked Choice',
      description: 'Members rank options in order of preference',
      icon: '🔢',
      minOptions: 3,
      maxOptions: 8
    },
    approval: {
      name: 'Approval Voting',
      description: 'Members approve or disapprove each option',
      icon: '👍',
      minOptions: 2,
      maxOptions: 12
    }
  };

  // Categories for polls
  const categories = [
    { value: 'general', label: 'General Discussion' },
    { value: 'governance', label: 'Governance' },
    { value: 'financial', label: 'Financial Decisions' },
    { value: 'technical', label: 'Technical Proposals' },
    { value: 'community', label: 'Community Guidelines' },
    { value: 'events', label: 'Events & Activities' },
    { value: 'other', label: 'Other' }
  ];

  // Update form data
  const updateFormData = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  // Add new option
  const addOption = useCallback(() => {
    const config = pollTypeConfig[formData.type];
    if (formData.options.length >= config.maxOptions) return;

    const newOption: PollOption = {
      id: `option-${formData.options.length + 1}`,
      text: '',
      description: ''
    };

    setFormData(prev => ({
      ...prev,
      options: [...prev.options, newOption]
    }));
  }, [formData.options.length, formData.type]);

  // Remove option
  const removeOption = useCallback((optionId: string) => {
    const config = pollTypeConfig[formData.type];
    if (formData.options.length <= config.minOptions) return;

    setFormData(prev => ({
      ...prev,
      options: prev.options.filter(option => option.id !== optionId)
    }));
  }, [formData.options.length, formData.type]);

  // Update option
  const updateOption = useCallback((optionId: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map(option =>
        option.id === optionId ? { ...option, [field]: value } : option
      )
    }));
  }, []);

  // Add tag
  const addTag = useCallback(() => {
    if (!newTag.trim() || formData.tags.includes(newTag.trim())) return;
    
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, newTag.trim()]
    }));
    setNewTag('');
  }, [newTag, formData.tags]);

  // Remove tag
  const removeTag = useCallback((tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }, []);

  // Update poll settings
  const updateSettings = useCallback((setting: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      settings: { ...prev.settings, [setting]: value }
    }));
  }, []);

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Basic validation
    if (!formData.title.trim()) {
      newErrors.title = 'Poll title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Poll description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    // Options validation
    const config = pollTypeConfig[formData.type];
    const validOptions = formData.options.filter(option => option.text.trim());
    
    if (validOptions.length < config.minOptions) {
      newErrors.options = `At least ${config.minOptions} options are required for ${config.name}`;
    }

    // Check for duplicate options
    const optionTexts = validOptions.map(option => option.text.trim().toLowerCase());
    const hasDuplicates = optionTexts.length !== new Set(optionTexts).size;
    if (hasDuplicates) {
      newErrors.options = 'Options must be unique';
    }

    // Duration validation
    if (formData.duration < 1) {
      newErrors.duration = 'Duration must be at least 1 day';
    } else if (formData.duration > 365) {
      newErrors.duration = 'Duration cannot exceed 365 days';
    }

    // Settings validation
    if (formData.type === 'multiple_choice') {
      if (formData.settings.maxSelections && formData.settings.maxSelections < 1) {
        newErrors.maxSelections = 'Maximum selections must be at least 1';
      }
      if (formData.settings.minSelections && formData.settings.minSelections < 1) {
        newErrors.minSelections = 'Minimum selections must be at least 1';
      }
      if (formData.settings.maxSelections && formData.settings.minSelections &&
          formData.settings.maxSelections < formData.settings.minSelections) {
        newErrors.maxSelections = 'Maximum must be greater than minimum selections';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();
    
    if (!isDraft && !validateForm()) return;

    setIsSubmitting(true);
    try {
      // Filter out empty options
      const cleanedData = {
        ...formData,
        options: formData.options.filter(option => option.text.trim())
      };

      if (isDraft && onSaveDraft) {
        await onSaveDraft(cleanedData);
      } else {
        await onSubmit(cleanedData);
      }
    } catch (error) {
      console.error('Error submitting poll:', error);
      setErrors({ general: 'Failed to submit poll. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle poll type change
  useEffect(() => {
    const config = pollTypeConfig[formData.type];
    
    // Adjust options based on new type
    let newOptions = [...formData.options];
    
    // Add minimum required options if needed
    while (newOptions.length < config.minOptions) {
      newOptions.push({
        id: `option-${newOptions.length + 1}`,
        text: '',
        description: ''
      });
    }
    
    // Remove excess options if needed
    if (newOptions.length > config.maxOptions) {
      newOptions = newOptions.slice(0, config.maxOptions);
    }

    setFormData(prev => ({ ...prev, options: newOptions }));
  }, [formData.type]);

  // Steps for the form
  const steps = [
    { id: 1, title: 'Basic Information', description: 'Title, description, and type' },
    { id: 2, title: 'Options & Settings', description: 'Poll options and voting rules' },
    { id: 3, title: 'Review & Submit', description: 'Final review before publishing' }
  ];

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium ${
              currentStep === step.id
                ? 'border-blue-600 bg-blue-600 text-white'
                : currentStep > step.id
                ? 'border-green-600 bg-green-600 text-white'
                : 'border-gray-300 text-gray-500'
            }`}>
              {currentStep > step.id ? '✓' : step.id}
            </div>
            <div className="ml-3">
              <div className={`text-sm font-medium ${
                currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {step.title}
              </div>
              <div className="text-xs text-gray-500">{step.description}</div>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-px mx-4 ${
                currentStep > step.id ? 'bg-green-600' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Poll Title *
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => updateFormData('title', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.title ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="What question would you like to ask the community?"
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        <p className="text-gray-500 text-sm mt-1">{formData.title.length}/200 characters</p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          id="description"
          rows={4}
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.description ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Provide more details about what you're asking and why it matters..."
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        <p className="text-gray-500 text-sm mt-1">{formData.description.length} characters</p>
      </div>

      {/* Poll Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Voting Type *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(pollTypeConfig).map(([type, config]) => (
            <label
              key={type}
              className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                formData.type === type
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="pollType"
                value={type}
                checked={formData.type === type}
                onChange={(e) => updateFormData('type', e.target.value)}
                className="sr-only"
              />
              <div className="text-2xl mr-3">{config.icon}</div>
              <div>
                <div className="font-medium text-gray-900">{config.name}</div>
                <div className="text-sm text-gray-600">{config.description}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {config.minOptions}-{config.maxOptions} options
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => updateFormData('category', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {categories.map(category => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      {/* Options */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Poll Options *
          </label>
          <span className="text-sm text-gray-500">
            {formData.options.filter(o => o.text.trim()).length}/{pollTypeConfig[formData.type].maxOptions} options
          </span>
        </div>
        
        <div className="space-y-3">
          {formData.options.map((option, index) => (
            <div key={option.id} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                {index + 1}
              </span>
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => updateOption(option.id, 'text', e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="text"
                  value={option.description || ''}
                  onChange={(e) => updateOption(option.id, 'description', e.target.value)}
                  placeholder="Optional description"
                  className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {formData.options.length > pollTypeConfig[formData.type].minOptions && (
                <button
                  type="button"
                  onClick={() => removeOption(option.id)}
                  className="flex-shrink-0 text-red-500 hover:text-red-700"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        {formData.options.length < pollTypeConfig[formData.type].maxOptions && (
          <button
            type="button"
            onClick={addOption}
            className="mt-3 flex items-center text-blue-600 hover:text-blue-700"
          >
            <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Option
          </button>
        )}

        {errors.options && <p className="text-red-500 text-sm mt-1">{errors.options}</p>}
      </div>

      {/* Duration */}
      <div>
        <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
          Duration (days) *
        </label>
        <input
          type="number"
          id="duration"
          min="1"
          max="365"
          value={formData.duration}
          onChange={(e) => updateFormData('duration', parseInt(e.target.value))}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.duration ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
        <p className="text-gray-500 text-sm mt-1">
          Poll will end on {new Date(Date.now() + formData.duration * 24 * 60 * 60 * 1000).toLocaleDateString()}
        </p>
      </div>

      {/* Settings */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Voting Settings
        </label>
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.settings.allowAbstain}
              onChange={(e) => updateSettings('allowAbstain', e.target.checked)}
              className="mr-2 w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-700">Allow members to abstain from voting</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.settings.allowChangeVote}
              onChange={(e) => updateSettings('allowChangeVote', e.target.checked)}
              className="mr-2 w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-700">Allow members to change their vote</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.settings.requireReason}
              onChange={(e) => updateSettings('requireReason', e.target.checked)}
              className="mr-2 w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-700">Require members to provide a reason for their vote</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.settings.isPrivateVoting}
              onChange={(e) => updateSettings('isPrivateVoting', e.target.checked)}
              className="mr-2 w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-700">Make voting anonymous (hide who voted for what)</span>
          </label>

          {formData.type === 'multiple_choice' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="minSelections" className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Selections
                </label>
                <input
                  type="number"
                  id="minSelections"
                  min="0"
                  value={formData.settings.minSelections || ''}
                  onChange={(e) => updateSettings('minSelections', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.minSelections && <p className="text-red-500 text-sm mt-1">{errors.minSelections}</p>}
              </div>
              <div>
                <label htmlFor="maxSelections" className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Selections
                </label>
                <input
                  type="number"
                  id="maxSelections"
                  min="1"
                  value={formData.settings.maxSelections || ''}
                  onChange={(e) => updateSettings('maxSelections', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.maxSelections && <p className="text-red-500 text-sm mt-1">{errors.maxSelections}</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tags (optional)
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            placeholder="Add a tag"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r hover:bg-gray-200"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      {/* Review */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Review Your Poll</h3>
        
        <div className="space-y-4">
          <div>
            <span className="text-sm font-medium text-gray-700">Title:</span>
            <p className="text-gray-900">{formData.title}</p>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-700">Description:</span>
            <p className="text-gray-900">{formData.description}</p>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-700">Type:</span>
            <p className="text-gray-900">{pollTypeConfig[formData.type].name}</p>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-700">Options:</span>
            <ul className="mt-1 space-y-1">
              {formData.options.filter(o => o.text.trim()).map((option, index) => (
                <li key={option.id} className="text-gray-900">
                  {index + 1}. {option.text}
                  {option.description && <span className="text-gray-600 text-sm"> - {option.description}</span>}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-700">Duration:</span>
            <p className="text-gray-900">{formData.duration} days</p>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-700">Category:</span>
            <p className="text-gray-900">{categories.find(c => c.value === formData.category)?.label}</p>
          </div>
          
          {formData.tags.length > 0 && (
            <div>
              <span className="text-sm font-medium text-gray-700">Tags:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {formData.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{errors.general}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Poll</h1>
          <p className="text-gray-600">
            Engage your community by creating a poll or governance proposal
          </p>
        </div>

        {renderStepIndicator()}

        <form onSubmit={(e) => handleSubmit(e, false)}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-8 border-t border-gray-200">
            <div className="flex space-x-3">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  ← Previous
                </button>
              )}
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="flex space-x-3">
              {allowDrafts && onSaveDraft && (
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Save Draft
                </button>
              )}
              
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading || isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating Poll...' : 'Create Poll'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PollCreationForm;