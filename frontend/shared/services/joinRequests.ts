// Task 7.2.2: Community Join Request Interface
// Join request service for API communication and state management

import {
  JoinRequest,
  JoinRequestResponse,
  JoinRequestListResponse,
  JoinRequestError,
  ApplicationFormData,
  ApplicationForm,
  FormResponse,
  FileAttachment,
  AppealData,
  AdminFeedback,
  FeedbackResponse,
  CommunityRequirements,
  RequestDashboard,
  RequestSummary,
  CommunityRecommendation,
  ValidationError,
  JoinRequestStatus,
  JOIN_REQUEST_ERROR_CODES,
  JOIN_REQUEST_CONFIG,
  FormSection,
  FormQuestion
} from '../types/joinRequest';

// Base API configuration - Docker environment compatible
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_TIMEOUT = 30000; // 30 seconds for join request operations

// Join Request API client
class JoinRequestService {
  private baseURL: string;
  private timeout: number;
  private sessionId: string;

  constructor(baseURL: string = API_BASE_URL, timeout: number = API_TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `joinreq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
          'X-Session-ID': this.sessionId,
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
      const error: JoinRequestError = {
        code: data.code || JOIN_REQUEST_ERROR_CODES.SERVER_ERROR,
        message: data.message || 'An error occurred',
        field: data.field,
        retryable: response.status >= 500
      };
      throw error;
    }

    return data;
  }

  // Join Request Operations
  async submitJoinRequest(
    userId: string, 
    communityId: string, 
    applicationData: ApplicationFormData
  ): Promise<JoinRequest> {
    const url = `${this.baseURL}/api/communities/${communityId}/join-requests`;

    try {
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        body: JSON.stringify({
          userId,
          applicationData,
          sessionId: this.sessionId,
          submittedAt: new Date().toISOString()
        }),
      });

      const result = await this.handleResponse<JoinRequestResponse>(response);
      
      if (result.success && result.data) {
        return result.data;
      }
      
      throw new Error(result.message || 'Failed to submit join request');
    } catch (error) {
      console.error('Failed to submit join request:', error);
      throw this.handleError(error);
    }
  }

  async getJoinRequest(requestId: string): Promise<JoinRequest> {
    const url = `${this.baseURL}/api/join-requests/${requestId}`;

    try {
      const response = await this.fetchWithTimeout(url);
      const result = await this.handleResponse<JoinRequestResponse>(response);
      
      if (result.success && result.data) {
        return result.data;
      }
      
      throw new Error(result.message || 'Request not found');
    } catch (error) {
      console.error('Failed to get join request:', error);
      throw this.handleError(error);
    }
  }

  async getUserJoinRequests(
    userId: string,
    options: {
      status?: JoinRequestStatus[];
      page?: number;
      limit?: number;
      communityId?: string;
    } = {}
  ): Promise<{ requests: JoinRequest[]; total: number; hasMore: boolean }> {
    const params = new URLSearchParams({
      userId,
      page: (options.page || 1).toString(),
      limit: (options.limit || 10).toString(),
    });

    if (options.status?.length) {
      params.append('status', options.status.join(','));
    }

    if (options.communityId) {
      params.append('communityId', options.communityId);
    }

    const url = `${this.baseURL}/api/join-requests?${params}`;

    try {
      const response = await this.fetchWithTimeout(url);
      const result = await this.handleResponse<JoinRequestListResponse>(response);
      
      if (result.success && result.data) {
        return result.data;
      }
      
      return { requests: [], total: 0, hasMore: false };
    } catch (error) {
      console.error('Failed to get user join requests:', error);
      throw this.handleError(error);
    }
  }

  async withdrawJoinRequest(requestId: string, reason?: string): Promise<void> {
    const url = `${this.baseURL}/api/join-requests/${requestId}/withdraw`;

    try {
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        body: JSON.stringify({
          reason,
          withdrawnAt: new Date().toISOString(),
          sessionId: this.sessionId
        }),
      });

      await this.handleResponse<{ success: boolean }>(response);
    } catch (error) {
      console.error('Failed to withdraw join request:', error);
      throw this.handleError(error);
    }
  }

  // Application Form Operations
  async getApplicationForm(communityId: string): Promise<ApplicationForm> {
    const url = `${this.baseURL}/api/communities/${communityId}/application-form`;

    try {
      const response = await this.fetchWithTimeout(url);
      const result = await this.handleResponse<{ success: boolean; data: ApplicationForm }>(response);
      
      if (result.success && result.data) {
        return result.data;
      }
      
      throw new Error('Application form not found');
    } catch (error) {
      console.warn('Failed to get application form, using mock:', error);
      return this.getMockApplicationForm(communityId);
    }
  }

  async saveDraft(
    userId: string,
    communityId: string,
    applicationData: ApplicationFormData
  ): Promise<void> {
    const url = `${this.baseURL}/api/communities/${communityId}/application-draft`;

    try {
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        body: JSON.stringify({
          userId,
          applicationData,
          savedAt: new Date().toISOString(),
          sessionId: this.sessionId
        }),
      });

      await this.handleResponse<{ success: boolean }>(response);
    } catch (error) {
      console.warn('Failed to save draft to server, saving locally:', error);
      this.saveDraftLocally(userId, communityId, applicationData);
    }
  }

  async loadDraft(userId: string, communityId: string): Promise<ApplicationFormData | null> {
    const url = `${this.baseURL}/api/communities/${communityId}/application-draft?userId=${userId}`;

    try {
      const response = await this.fetchWithTimeout(url);
      const result = await this.handleResponse<{ success: boolean; data: ApplicationFormData }>(response);
      
      if (result.success && result.data) {
        return result.data;
      }
      
      return null;
    } catch (error) {
      console.warn('Failed to load draft from server, checking local storage:', error);
      return this.loadDraftLocally(userId, communityId);
    }
  }

  // File Upload Operations
  async uploadFile(
    questionId: string,
    file: File,
    requestId?: string
  ): Promise<FileAttachment> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('questionId', questionId);
    formData.append('sessionId', this.sessionId);
    
    if (requestId) {
      formData.append('requestId', requestId);
    }

    const url = `${this.baseURL}/api/join-requests/upload`;

    try {
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        body: formData,
        headers: {
          'X-Session-ID': this.sessionId,
        },
      });

      const result = await this.handleResponse<{ success: boolean; data: FileAttachment }>(response);
      
      if (result.success && result.data) {
        return result.data;
      }
      
      throw new Error('Failed to upload file');
    } catch (error) {
      console.error('Failed to upload file:', error);
      throw this.handleError(error);
    }
  }

  // Community Requirements Operations
  async getCommunityRequirements(communityId: string): Promise<CommunityRequirements> {
    const url = `${this.baseURL}/api/communities/${communityId}/requirements`;

    try {
      const response = await this.fetchWithTimeout(url);
      const result = await this.handleResponse<{ success: boolean; data: CommunityRequirements }>(response);
      
      if (result.success && result.data) {
        return result.data;
      }
      
      throw new Error('Community requirements not found');
    } catch (error) {
      console.warn('Failed to get community requirements, using mock:', error);
      return this.getMockCommunityRequirements(communityId);
    }
  }

  // Validation Operations
  validateFormData(form: ApplicationForm, formData: ApplicationFormData): ValidationError[] {
    const errors: ValidationError[] = [];

    form.sections.forEach((section: FormSection) => {
      section.questions.forEach((question: FormQuestion) => {
        const response = formData.responses.find((r: FormResponse) => r.questionId === question.id);

        if (question.isRequired && (!response || !response.answer)) {
          errors.push({
            field: question.id,
            code: 'REQUIRED',
            message: `${question.title} is required`,
            value: response?.answer
          });
        }

        if (response && response.answer && question.validation) {
          const validation = question.validation;

          if (typeof response.answer === 'string') {
            if (validation.minLength && response.answer.length < validation.minLength) {
              errors.push({
                field: question.id,
                code: 'MIN_LENGTH',
                message: `${question.title} must be at least ${validation.minLength} characters`,
                value: response.answer
              });
            }

            if (validation.maxLength && response.answer.length > validation.maxLength) {
              errors.push({
                field: question.id,
                code: 'MAX_LENGTH',
                message: `${question.title} must be no more than ${validation.maxLength} characters`,
                value: response.answer
              });
            }

            if (validation.pattern) {
              const regex = new RegExp(validation.pattern);
              if (!regex.test(response.answer)) {
                errors.push({
                  field: question.id,
                  code: 'INVALID_FORMAT',
                  message: validation.errorMessage,
                  value: response.answer
                });
              }
            }
          }
        }
      });
    });

    return errors;
  }

  // Helper Methods
  private saveDraftLocally(userId: string, communityId: string, applicationData: ApplicationFormData): void {
    try {
      const key = `join-request-draft-${userId}-${communityId}`;
      localStorage.setItem(key, JSON.stringify({
        ...applicationData,
        draftSavedAt: new Date().toISOString()
      }));
    } catch (error) {
      console.warn('Failed to save draft locally:', error);
    }
  }

  private loadDraftLocally(userId: string, communityId: string): ApplicationFormData | null {
    try {
      const key = `join-request-draft-${userId}-${communityId}`;
      const savedData = localStorage.getItem(key);
      return savedData ? JSON.parse(savedData) : null;
    } catch (error) {
      console.warn('Failed to load draft locally:', error);
      return null;
    }
  }

  private getMockApplicationForm(communityId: string): ApplicationForm {
    return {
      id: `form-${communityId}`,
      communityId,
      title: 'Community Membership Application',
      description: 'Please complete this form to apply for membership in our community.',
      version: 1,
      status: 'active',
      sections: [
        {
          id: 'personal-info',
          title: 'Personal Information',
          description: 'Tell us about yourself',
          order: 1,
          estimatedTime: 5,
          questions: [
            {
              id: 'full-name',
              type: 'text',
              title: 'Full Name',
              placeholder: 'Enter your full name',
              isRequired: true,
              order: 1,
              section: 'personal-info',
              validation: {
                minLength: 2,
                maxLength: 100,
                errorMessage: 'Please enter a valid name'
              }
            },
            {
              id: 'email',
              type: 'email',
              title: 'Email Address',
              placeholder: 'Enter your email address',
              isRequired: true,
              order: 2,
              section: 'personal-info',
              validation: {
                pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
                errorMessage: 'Please enter a valid email address'
              }
            }
          ]
        },
        {
          id: 'motivation',
          title: 'Motivation & Background',
          description: 'Why do you want to join this community?',
          order: 2,
          estimatedTime: 10,
          questions: [
            {
              id: 'motivation-text',
              type: 'textarea',
              title: 'Why do you want to join this community?',
              placeholder: 'Tell us about your motivation and goals...',
              isRequired: true,
              order: 1,
              section: 'motivation',
              validation: {
                minLength: 50,
                maxLength: 1000,
                errorMessage: 'Please provide at least 50 characters explaining your motivation'
              }
            }
          ]
        }
      ],
      settings: {
        allowDrafts: true,
        autoSave: true,
        autoSaveInterval: 30000,
        showProgress: true,
        allowWithdrawal: true,
        expirationDays: 30
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  private getMockCommunityRequirements(communityId: string): CommunityRequirements {
    return {
      communityId,
      membershipCriteria: {
        minAge: 18,
        location: ['Global'],
        experience: ['Interest in community governance'],
        skills: ['Basic communication skills'],
        other: ['Commitment to community values']
      },
      applicationProcess: {
        steps: [
          {
            id: 'application',
            title: 'Submit Application',
            description: 'Complete the membership application form',
            order: 1,
            estimatedTime: '15 minutes',
            isOptional: false
          },
          {
            id: 'review',
            title: 'Application Review',
            description: 'Community admins review your application',
            order: 2,
            estimatedTime: '3-5 days',
            isOptional: false
          }
        ],
        estimatedDuration: '5-7 days',
        reviewTimeline: '3-5 business days',
        approvalRate: 75,
        commonRejectionReasons: [
          'Incomplete application',
          'Insufficient motivation explanation'
        ]
      },
      guidelines: {
        codeOfConduct: 'Be respectful, inclusive, and constructive in all interactions.',
        communicationRules: [
          'Use respectful language',
          'Stay on topic in discussions',
          'No spam or self-promotion'
        ],
        participationExpectations: [
          'Active participation in community discussions',
          'Respectful engagement with other members'
        ],
        consequencesPolicy: 'Violations may result in warnings, temporary suspension, or permanent removal.',
        lastUpdated: new Date().toISOString()
      },
      faq: [
        {
          id: 'faq-1',
          question: 'How long does the application process take?',
          answer: 'Typically 5-7 days from submission to decision.',
          category: 'Process',
          order: 1,
          helpful: 25,
          notHelpful: 2
        }
      ],
      statistics: {
        totalMembers: 1250,
        activeMembers: 890,
        averageApprovalTime: 4,
        approvalRate: 75,
        memberRetentionRate: 85,
        lastUpdated: new Date().toISOString()
      }
    };
  }

  private handleError(error: any): JoinRequestError {
    if (error.code && error.message) {
      return error as JoinRequestError;
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        code: JOIN_REQUEST_ERROR_CODES.NETWORK_ERROR,
        message: 'Network connection failed. Please check your internet connection.',
        retryable: true
      };
    }
    
    return {
      code: JOIN_REQUEST_ERROR_CODES.SERVER_ERROR,
      message: error.message || 'An unexpected error occurred',
      retryable: true
    };
  }
}

// Create singleton instance
const joinRequestService = new JoinRequestService();

// Export individual functions for easier use
export const submitJoinRequest = (userId: string, communityId: string, data: ApplicationFormData) =>
  joinRequestService.submitJoinRequest(userId, communityId, data);

export const getJoinRequest = (requestId: string) =>
  joinRequestService.getJoinRequest(requestId);

export const getUserJoinRequests = (userId: string, options?: any) =>
  joinRequestService.getUserJoinRequests(userId, options);

export const withdrawJoinRequest = (requestId: string, reason?: string) =>
  joinRequestService.withdrawJoinRequest(requestId, reason);

export const getApplicationForm = (communityId: string) =>
  joinRequestService.getApplicationForm(communityId);

export const saveDraft = (userId: string, communityId: string, data: ApplicationFormData) =>
  joinRequestService.saveDraft(userId, communityId, data);

export const loadDraft = (userId: string, communityId: string) =>
  joinRequestService.loadDraft(userId, communityId);

export const uploadFile = (questionId: string, file: File, requestId?: string) =>
  joinRequestService.uploadFile(questionId, file, requestId);

export const getCommunityRequirements = (communityId: string) =>
  joinRequestService.getCommunityRequirements(communityId);

export const validateFormData = (form: ApplicationForm, formData: ApplicationFormData) =>
  joinRequestService.validateFormData(form, formData);

// Utility functions
export const getRequestStatusColor = (status: JoinRequestStatus): string => {
  const colors: Record<JoinRequestStatus, string> = {
    draft: 'gray',
    submitted: 'blue',
    under_review: 'yellow',
    additional_info_required: 'orange',
    approved: 'green',
    rejected: 'red',
    withdrawn: 'gray',
    expired: 'gray'
  };
  return colors[status] || 'gray';
};

export const isRequestEditable = (status: JoinRequestStatus): boolean => {
  return ['draft', 'additional_info_required'].includes(status);
};

export const canAppeal = (status: JoinRequestStatus): boolean => {
  return status === 'rejected';
};

// Development mode helpers
export const isDevelopment = process.env.NODE_ENV === 'development';
export const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || isDevelopment;

// Export service instance
export default joinRequestService; 