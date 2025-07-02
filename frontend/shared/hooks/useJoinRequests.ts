// Task 7.2.2: Community Join Request Interface
// React hooks for join request and application form management

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  JoinRequest,
  JoinRequestError,
  ApplicationFormData,
  ApplicationForm,
  ValidationError,
  JoinRequestStatus,
  RequestSummary,
  CommunityRequirements,
  FileAttachment,
  UseJoinRequestsResult,
  UseApplicationFormResult
} from '../types/joinRequest';
import {
  submitJoinRequest,
  getJoinRequest,
  getUserJoinRequests,
  withdrawJoinRequest,
  getApplicationForm,
  saveDraft,
  loadDraft,
  uploadFile,
  getCommunityRequirements,
  validateFormData,
  isRequestEditable,
  canAppeal
} from '../services/joinRequests';

// Custom hook for managing user's join requests
export function useJoinRequests(userId: string): UseJoinRequestsResult {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<JoinRequestError | null>(null);
  const [summary, setSummary] = useState<RequestSummary | null>(null);

  // Load user's join requests
  const loadRequests = useCallback(async (options: {
    status?: JoinRequestStatus[];
    communityId?: string;
  } = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getUserJoinRequests(userId, {
        page: 1,
        limit: 50,
        ...options
      });

      setRequests(result.requests);
      
      // Calculate summary from requests
      const newSummary: RequestSummary = {
        totalRequests: result.total,
        pendingRequests: result.requests.filter(r => 
          ['submitted', 'under_review', 'additional_info_required'].includes(r.status)
        ).length,
        approvedRequests: result.requests.filter(r => r.status === 'approved').length,
        rejectedRequests: result.requests.filter(r => r.status === 'rejected').length,
        successRate: result.total > 0 
          ? (result.requests.filter(r => r.status === 'approved').length / result.total) * 100 
          : 0,
        averageProcessingTime: 0 // Would be calculated server-side in real implementation
      };
      setSummary(newSummary);
    } catch (err) {
      const joinRequestError = err as JoinRequestError;
      setError(joinRequestError);
      console.error('Failed to load join requests:', joinRequestError);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Submit new join request
  const handleSubmitRequest = useCallback(async (
    communityId: string, 
    applicationData: ApplicationFormData
  ): Promise<JoinRequest> => {
    setError(null);

    try {
      const newRequest = await submitJoinRequest(userId, communityId, applicationData);
      
      // Add to local state
      setRequests(prev => [newRequest, ...prev]);
      
      // Update summary
      setSummary(prev => prev ? {
        ...prev,
        totalRequests: prev.totalRequests + 1,
        pendingRequests: prev.pendingRequests + 1
      } : null);

      return newRequest;
    } catch (err) {
      const joinRequestError = err as JoinRequestError;
      setError(joinRequestError);
      throw joinRequestError;
    }
  }, [userId]);

  // Withdraw join request
  const handleWithdrawRequest = useCallback(async (requestId: string) => {
    setError(null);

    try {
      await withdrawJoinRequest(requestId);
      
      // Update local state
      setRequests(prev => prev.map(request => 
        request.id === requestId 
          ? { ...request, status: 'withdrawn' as JoinRequestStatus }
          : request
      ));
      
      // Update summary
      setSummary(prev => prev ? {
        ...prev,
        pendingRequests: Math.max(0, prev.pendingRequests - 1)
      } : null);
    } catch (err) {
      const joinRequestError = err as JoinRequestError;
      setError(joinRequestError);
      throw joinRequestError;
    }
  }, []);

  // Refresh requests
  const refreshRequests = useCallback(async () => {
    await loadRequests();
  }, [loadRequests]);

  // Load requests on mount
  useEffect(() => {
    if (userId) {
      loadRequests();
    }
  }, [userId, loadRequests]);

  // Submit appeal for rejected request
  const handleSubmitAppeal = useCallback(async (
    requestId: string, 
    appealData: { reason: string; additionalInfo?: string; evidence: FileAttachment[] }
  ) => {
    setError(null);

    try {
      // For now, just log the appeal since we don't have the full appeal implementation
      console.log('Appeal submitted for request:', requestId, appealData);
      
      // Update local state to show appeal submitted
      setRequests(prev => prev.map(request => {
        if (request.id === requestId) {
          return {
            ...request,
            appealData: {
              id: `appeal-${Date.now()}`,
              requestId,
              ...appealData,
              submittedAt: new Date().toISOString(),
              status: 'submitted' as const
            }
          };
        }
        return request;
      }));
    } catch (err) {
      const joinRequestError = err as JoinRequestError;
      setError(joinRequestError);
      throw joinRequestError;
    }
  }, []);

  return {
    requests,
    isLoading,
    error,
    summary,
    actions: {
      submitRequest: handleSubmitRequest,
      withdrawRequest: handleWithdrawRequest,
      submitAppeal: handleSubmitAppeal,
      refreshRequests
    }
  };
}

// Custom hook for managing application forms
export function useApplicationForm(
  userId: string,
  communityId: string,
  initialData?: Partial<ApplicationFormData>
): UseApplicationFormResult {
  const [form, setForm] = useState<ApplicationForm | null>(null);
  const [formData, setFormData] = useState<ApplicationFormData>({
    formId: '',
    responses: [],
    completedSections: [],
    submissionAttempts: 0,
    validationErrors: [],
    attachments: []
  });
  const [isDirty, setIsDirty] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);

  // Load application form
  const loadForm = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const applicationForm = await getApplicationForm(communityId);
      setForm(applicationForm);
      
      // Initialize form data with form ID
      setFormData(prev => ({
        ...prev,
        formId: applicationForm.id
      }));

      // Load draft if available
      try {
        const draft = await loadDraft(userId, communityId);
        if (draft) {
          setFormData(draft);
          setIsDirty(true);
        }
      } catch (draftError) {
        console.warn('Could not load draft:', draftError);
      }

      // Apply initial data if provided
      if (initialData) {
        setFormData(prev => ({
          ...prev,
          ...initialData
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load application form');
      console.error('Failed to load application form:', err);
    } finally {
      setIsLoading(false);
    }
  }, [communityId, userId, initialData]);

  // Update form response
  const updateResponse = useCallback((questionId: string, answer: any) => {
    setFormData(prev => {
      const existingResponseIndex = prev.responses.findIndex(r => r.questionId === questionId);
      const question = form?.sections
        .flatMap(s => s.questions)
        .find(q => q.id === questionId);
      
      if (!question) return prev;

      const newResponse = {
        questionId,
        questionType: question.type,
        answer,
        isRequired: question.isRequired
      };

      let newResponses;
      if (existingResponseIndex >= 0) {
        newResponses = [...prev.responses];
        newResponses[existingResponseIndex] = newResponse;
      } else {
        newResponses = [...prev.responses, newResponse];
      }

      return {
        ...prev,
        responses: newResponses
      };
    });

    setIsDirty(true);
  }, [form]);

  // Auto-save functionality
  const performAutoSave = useCallback(async () => {
    if (isDirty && form?.settings.autoSave) {
      try {
        await saveDraft(userId, communityId, formData);
        console.log('Draft auto-saved');
      } catch (err) {
        console.warn('Auto-save failed:', err);
      }
    }
  }, [isDirty, form?.settings.autoSave, userId, communityId, formData]);

  // Manual save draft
  const handleSaveDraft = useCallback(async () => {
    setError(null);
    
    try {
      await saveDraft(userId, communityId, formData);
      setIsDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save draft');
      throw err;
    }
  }, [userId, communityId, formData]);

  // Submit application
  const handleSubmit = useCallback(async (): Promise<JoinRequest> => {
    setError(null);

    if (!form) {
      throw new Error('Form not loaded');
    }

    // Validate form data
    const errors = validateFormData(form, formData);
    setValidationErrors(errors);

    if (errors.length > 0) {
      throw new Error('Please fix validation errors before submitting');
    }

    try {
      const request = await submitJoinRequest(userId, communityId, formData);
      setIsDirty(false);
      return request;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit application';
      setError(errorMessage);
      throw err;
    }
  }, [form, formData, userId, communityId]);

  // Reset form
  const reset = useCallback(() => {
    setFormData({
      formId: form?.id || '',
      responses: [],
      completedSections: [],
      submissionAttempts: 0,
      validationErrors: [],
      attachments: []
    });
    setIsDirty(false);
    setValidationErrors([]);
    setError(null);
  }, [form?.id]);

  // Upload file
  const handleUploadFile = useCallback(async (questionId: string, file: File): Promise<FileAttachment> => {
    setError(null);

    try {
      const attachment = await uploadFile(questionId, file);
      
      // Add to form data attachments
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, attachment]
      }));

      setIsDirty(true);
      return attachment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload file';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Validate form on data changes
  useEffect(() => {
    if (form && formData.responses.length > 0) {
      const errors = validateFormData(form, formData);
      setValidationErrors(errors);
      setIsValid(errors.length === 0);
    }
  }, [form, formData]);

  // Auto-save setup
  useEffect(() => {
    if (isDirty && form?.settings.autoSave) {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
      
      autoSaveRef.current = setTimeout(performAutoSave, form.settings.autoSaveInterval || 30000);
    }

    return () => {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
    };
  }, [isDirty, form?.settings.autoSave, form?.settings.autoSaveInterval, performAutoSave]);

  // Calculate progress
  const progress = React.useMemo(() => {
    if (!form) {
      return { completed: 0, total: 0, percentage: 0 };
    }

    const totalQuestions = form.sections.reduce((sum, section) => sum + section.questions.length, 0);
    const completedQuestions = formData.responses.filter(response => 
      response.answer && 
      (typeof response.answer === 'string' ? response.answer.trim() !== '' : true)
    ).length;

    return {
      completed: completedQuestions,
      total: totalQuestions,
      percentage: totalQuestions > 0 ? Math.round((completedQuestions / totalQuestions) * 100) : 0
    };
  }, [form, formData.responses]);

  // Load form on mount
  useEffect(() => {
    if (userId && communityId) {
      loadForm();
    }
  }, [userId, communityId, loadForm]);

  return {
    form,
    formData,
    isDirty,
    isValid,
    validationErrors,
    isLoading,
    error,
    actions: {
      updateResponse,
      saveDraft: handleSaveDraft,
      submit: handleSubmit,
      reset,
      uploadFile: handleUploadFile
    },
    progress
  };
}

// Custom hook for community requirements
export function useCommunityRequirements(communityId: string) {
  const [requirements, setRequirements] = useState<CommunityRequirements | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRequirements = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const communityRequirements = await getCommunityRequirements(communityId);
      setRequirements(communityRequirements);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load community requirements');
      console.error('Failed to load community requirements:', err);
    } finally {
      setIsLoading(false);
    }
  }, [communityId]);

  useEffect(() => {
    if (communityId) {
      loadRequirements();
    }
  }, [communityId, loadRequirements]);

  return {
    requirements,
    isLoading,
    error,
    reload: loadRequirements
  };
}

// Custom hook for individual join request details
export function useJoinRequest(requestId: string) {
  const [request, setRequest] = useState<JoinRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<JoinRequestError | null>(null);

  const loadRequest = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const joinRequest = await getJoinRequest(requestId);
      setRequest(joinRequest);
    } catch (err) {
      const joinRequestError = err as JoinRequestError;
      setError(joinRequestError);
      console.error('Failed to load join request:', joinRequestError);
    } finally {
      setIsLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    if (requestId) {
      loadRequest();
    }
  }, [requestId, loadRequest]);

  const canEdit = request ? isRequestEditable(request.status) : false;
  const canAppealRequest = request ? canAppeal(request.status) : false;

  return {
    request,
    isLoading,
    error,
    canEdit,
    canAppeal: canAppealRequest,
    reload: loadRequest
  };
}

// Helper hook for form field validation
export function useFormValidation(form: ApplicationForm | null, formData: ApplicationFormData) {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateField = useCallback((questionId: string): string | null => {
    if (!form) return null;

    const question = form.sections
      .flatMap(s => s.questions)
      .find(q => q.id === questionId);
    
    if (!question) return null;

    const response = formData.responses.find(r => r.questionId === questionId);
    const answer = response?.answer;

    // Required field validation
    if (question.isRequired && (!answer || (typeof answer === 'string' && answer.trim() === ''))) {
      return `${question.title} is required`;
    }

    // Type-specific validation
    if (answer && typeof answer === 'string' && question.validation) {
      const { validation } = question;
      
      if (validation.minLength && answer.length < validation.minLength) {
        return `${question.title} must be at least ${validation.minLength} characters`;
      }
      
      if (validation.maxLength && answer.length > validation.maxLength) {
        return `${question.title} must be no more than ${validation.maxLength} characters`;
      }
      
      if (validation.pattern) {
        const regex = new RegExp(validation.pattern);
        if (!regex.test(answer)) {
          return validation.errorMessage;
        }
      }
    }

    return null;
  }, [form, formData]);

  const validateAllFields = useCallback(() => {
    if (!form) return {};

    const errors: Record<string, string> = {};
    
    form.sections.forEach(section => {
      section.questions.forEach(question => {
        const error = validateField(question.id);
        if (error) {
          errors[question.id] = error;
        }
      });
    });

    setFieldErrors(errors);
    return errors;
  }, [form, validateField]);

  return {
    fieldErrors,
    validateField,
    validateAllFields,
    hasErrors: Object.keys(fieldErrors).length > 0
  };
}

// Export all hooks
export default {
  useJoinRequests,
  useApplicationForm,
  useCommunityRequirements,
  useJoinRequest,
  useFormValidation
}; 