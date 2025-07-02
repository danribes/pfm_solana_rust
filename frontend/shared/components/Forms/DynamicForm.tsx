// Task 7.2.2: Community Join Request Interface
// Dynamic form component for rendering application forms

'use client';

import React, { useState, useEffect } from 'react';
import {
  ApplicationForm,
  ApplicationFormData,
  FormSection,
  ValidationError
} from '../../types/joinRequest';
import FormQuestion from './FormQuestion';
import FormValidation from './FormValidation';

interface DynamicFormProps {
  form: ApplicationForm;
  formData: ApplicationFormData;
  onUpdateResponse: (questionId: string, answer: any) => void;
  onSubmit: () => Promise<void>;
  onSaveDraft?: () => Promise<void>;
  validationErrors: ValidationError[];
  isLoading?: boolean;
  showProgress?: boolean;
  allowDrafts?: boolean;
  className?: string;
}

export default function DynamicForm({
  form,
  formData,
  onUpdateResponse,
  onSubmit,
  onSaveDraft,
  validationErrors,
  isLoading = false,
  showProgress = true,
  allowDrafts = true,
  className = ''
}: DynamicFormProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Calculate form progress
  const totalQuestions = form.sections.reduce((sum, section) => sum + section.questions.length, 0);
  const answeredQuestions = formData.responses.filter(response => {
    if (!response.answer) return false;
    if (typeof response.answer === 'string') return response.answer.trim() !== '';
    if (Array.isArray(response.answer)) return response.answer.length > 0;
    return true;
  }).length;
  const progressPercentage = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

  // Get validation errors for a specific question
  const getQuestionErrors = (questionId: string): ValidationError[] => {
    return validationErrors.filter(error => error.field === questionId);
  };

  // Check if a section has any errors
  const sectionHasErrors = (section: FormSection): boolean => {
    return section.questions.some(question => 
      getQuestionErrors(question.id).length > 0
    );
  };

  // Check if a section is completed
  const isSectionCompleted = (section: FormSection): boolean => {
    const requiredQuestions = section.questions.filter(q => q.isRequired);
    return requiredQuestions.every(question => {
      const response = formData.responses.find(r => r.questionId === question.id);
      if (!response?.answer) return false;
      if (typeof response.answer === 'string') return response.answer.trim() !== '';
      if (Array.isArray(response.answer)) return response.answer.length > 0;
      return true;
    });
  };

  // Handle section expansion
  const toggleSection = (sectionIndex: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionIndex)) {
      newExpanded.delete(sectionIndex);
    } else {
      newExpanded.add(sectionIndex);
    }
    setExpandedSections(newExpanded);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit();
    } catch (error) {
      console.error('Form submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle draft saving
  const handleSaveDraft = async () => {
    if (!onSaveDraft) return;
    
    setIsSavingDraft(true);
    try {
      await onSaveDraft();
    } catch (error) {
      console.error('Draft saving failed:', error);
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Auto-expand next section when current is completed
  useEffect(() => {
    const completedSections = form.sections.filter((_, index) => 
      index <= currentSection && isSectionCompleted(form.sections[index])
    );
    
    if (completedSections.length > currentSection && currentSection < form.sections.length - 1) {
      setExpandedSections(prev => new Set([...prev, currentSection + 1]));
    }
  }, [formData.responses, currentSection, form.sections]);

  const hasErrors = validationErrors.length > 0;
  const canSubmit = !isLoading && !isSubmitting && progressPercentage === 100 && !hasErrors;

  return (
    <div className={`dynamic-form ${className}`}>
      {/* Form Header */}
      <div className="form-header bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{form.title}</h2>
        <p className="text-gray-600 mb-4">{form.description}</p>
        
        {showProgress && (
          <div className="progress-section">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progress: {answeredQuestions} of {totalQuestions} questions completed
              </span>
              <span className="text-sm font-medium text-blue-600">
                {progressPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {form.sections.map((section, sectionIndex) => {
          const isExpanded = expandedSections.has(sectionIndex);
          const isCompleted = isSectionCompleted(section);
          const hasErrors = sectionHasErrors(section);

          return (
            <div
              key={section.id}
              className={`form-section bg-white rounded-lg shadow-sm border-2 transition-all duration-200 ${
                hasErrors ? 'border-red-200' : isCompleted ? 'border-green-200' : 'border-gray-200'
              }`}
            >
              {/* Section Header */}
              <div
                className={`section-header p-4 cursor-pointer border-b border-gray-100 ${
                  isExpanded ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => toggleSection(sectionIndex)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        hasErrors
                          ? 'bg-red-100 text-red-700'
                          : isCompleted
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {sectionIndex + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                      {section.description && (
                        <p className="text-sm text-gray-600">{section.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {hasErrors && (
                      <span className="text-red-600 text-sm">
                        {section.questions.filter(q => getQuestionErrors(q.id).length > 0).length} errors
                      </span>
                    )}
                    {isCompleted && (
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Section Content */}
              {isExpanded && (
                <div className="section-content p-6 space-y-6">
                  {section.questions.map((question) => (
                    <FormQuestion
                      key={question.id}
                      question={question}
                      value={formData.responses.find(r => r.questionId === question.id)?.answer}
                      onChange={(value: any) => onUpdateResponse(question.id, value)}
                      errors={getQuestionErrors(question.id)}
                      disabled={isLoading || isSubmitting}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Form Validation Summary */}
        {hasErrors && (
          <FormValidation errors={validationErrors} className="mb-6" />
        )}

        {/* Form Actions */}
        <div className="form-actions bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex gap-3">
              {allowDrafts && onSaveDraft && (
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isLoading || isSubmitting || isSavingDraft}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingDraft ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700 inline" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save Draft'
                  )}
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <div className="text-sm text-gray-500 self-center">
                {progressPercentage < 100 && (
                  <span>Complete all required fields to submit</span>
                )}
              </div>
              
              <button
                type="submit"
                disabled={!canSubmit}
                className={`px-6 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  canSubmit
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-4 text-sm text-gray-500">
            <p>
              Your application will be reviewed by community administrators. 
              You will receive notifications about the status of your application.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
} 