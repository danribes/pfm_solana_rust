// Campaign API Service for Admin Portal
import axios from 'axios';
import {
  Campaign,
  CampaignFormData,
  CampaignFilters,
  CampaignListResponse,
  CampaignAnalytics,
  ParticipationMetrics,
  CreateCampaignResponse,
  UpdateCampaignResponse,
  DeleteCampaignResponse,
  CampaignValidationResult,
  CampaignValidationError
} from '../types/campaign';

// API Base Configuration for Container Environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const CAMPAIGNS_ENDPOINT = `${API_BASE_URL}/campaigns`;

// Create axios instance with default configuration
const campaignApi = axios.create({
  baseURL: CAMPAIGNS_ENDPOINT,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication in containerized environment
campaignApi.interceptors.request.use(
  (config) => {
    // Get auth token from container-aware storage
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add container identification headers
    config.headers['X-Client-Type'] = 'admin-portal';
    config.headers['X-Container-ID'] = process.env.CONTAINER_ID || 'admin-frontend';
    
    return config;
  },
  (error) => {
    console.error('Campaign API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
campaignApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Campaign API Response Error:', error);
    
    // Handle container-specific errors
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Unable to connect to backend service. Please check container connectivity.');
    }
    
    if (error.response?.status === 401) {
      // Handle authentication errors in container environment
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_token');
      window.location.href = '/admin/login';
    }
    
    return Promise.reject(error);
  }
);

export class CampaignService {
  // Get all campaigns with filtering and pagination
  static async getCampaigns(
    filters: CampaignFilters = {},
    page: number = 1,
    limit: number = 20,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<CampaignListResponse> {
    try {
      const params = {
        page,
        limit,
        sortBy,
        sortOrder,
        ...filters,
        // Convert date range to query params
        ...(filters.dateRange && {
          startDate: filters.dateRange.start,
          endDate: filters.dateRange.end,
        }),
      };

      const response = await campaignApi.get('/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Get single campaign by ID
  static async getCampaign(id: string): Promise<Campaign> {
    try {
      const response = await campaignApi.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching campaign ${id}:`, error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Create new campaign
  static async createCampaign(data: CampaignFormData): Promise<CreateCampaignResponse> {
    try {
      // Validate campaign data before sending
      const validation = this.validateCampaignData(data);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      }

      const response = await campaignApi.post('/', { campaignData: data });
      return response.data;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Update existing campaign
  static async updateCampaign(
    id: string, 
    updates: Partial<CampaignFormData>
  ): Promise<UpdateCampaignResponse> {
    try {
      const response = await campaignApi.put(`/${id}`, { updates });
      return response.data;
    } catch (error) {
      console.error(`Error updating campaign ${id}:`, error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Delete campaign
  static async deleteCampaign(id: string): Promise<DeleteCampaignResponse> {
    try {
      const response = await campaignApi.delete(`/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting campaign ${id}:`, error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Get campaign analytics
  static async getCampaignAnalytics(id: string): Promise<CampaignAnalytics> {
    try {
      const response = await campaignApi.get(`/${id}/analytics`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching campaign analytics for ${id}:`, error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Get real-time participation metrics
  static async getParticipationMetrics(id: string): Promise<ParticipationMetrics> {
    try {
      const response = await campaignApi.get(`/${id}/participation`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching participation metrics for ${id}:`, error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Publish/activate campaign
  static async publishCampaign(id: string): Promise<Campaign> {
    try {
      const response = await campaignApi.post(`/${id}/publish`);
      return response.data;
    } catch (error) {
      console.error(`Error publishing campaign ${id}:`, error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Pause campaign
  static async pauseCampaign(id: string): Promise<Campaign> {
    try {
      const response = await campaignApi.post(`/${id}/pause`);
      return response.data;
    } catch (error) {
      console.error(`Error pausing campaign ${id}:`, error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Resume campaign
  static async resumeCampaign(id: string): Promise<Campaign> {
    try {
      const response = await campaignApi.post(`/${id}/resume`);
      return response.data;
    } catch (error) {
      console.error(`Error resuming campaign ${id}:`, error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // End campaign early
  static async endCampaign(id: string): Promise<Campaign> {
    try {
      const response = await campaignApi.post(`/${id}/end`);
      return response.data;
    } catch (error) {
      console.error(`Error ending campaign ${id}:`, error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Archive campaign
  static async archiveCampaign(id: string): Promise<Campaign> {
    try {
      const response = await campaignApi.post(`/${id}/archive`);
      return response.data;
    } catch (error) {
      console.error(`Error archiving campaign ${id}:`, error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Duplicate campaign
  static async duplicateCampaign(id: string, newTitle?: string): Promise<Campaign> {
    try {
      const response = await campaignApi.post(`/${id}/duplicate`, { newTitle });
      return response.data;
    } catch (error) {
      console.error(`Error duplicating campaign ${id}:`, error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Export campaign data
  static async exportCampaignData(
    id: string, 
    format: 'csv' | 'json' | 'xlsx' = 'csv'
  ): Promise<Blob> {
    try {
      const response = await campaignApi.get(`/${id}/export`, {
        params: { format },
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error(`Error exporting campaign data for ${id}:`, error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Validate campaign data (client-side validation)
  static validateCampaignData(data: CampaignFormData): CampaignValidationResult {
    const errors: CampaignValidationError[] = [];
    const warnings: CampaignValidationError[] = [];

    // Basic validation
    if (!data.title || data.title.trim().length < 3) {
      errors.push({
        field: 'title',
        message: 'Campaign title must be at least 3 characters long',
        code: 'TITLE_TOO_SHORT'
      });
    }

    if (!data.description || data.description.trim().length < 10) {
      errors.push({
        field: 'description',
        message: 'Campaign description must be at least 10 characters long',
        code: 'DESCRIPTION_TOO_SHORT'
      });
    }

    if (!data.communityId) {
      errors.push({
        field: 'communityId',
        message: 'Community selection is required',
        code: 'COMMUNITY_REQUIRED'
      });
    }

    // Date validation
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const now = new Date();

    if (startDate < now) {
      warnings.push({
        field: 'startDate',
        message: 'Start date is in the past',
        code: 'START_DATE_PAST'
      });
    }

    if (endDate <= startDate) {
      errors.push({
        field: 'endDate',
        message: 'End date must be after start date',
        code: 'INVALID_DATE_RANGE'
      });
    }

    // Questions validation
    if (!data.questions || data.questions.length === 0) {
      errors.push({
        field: 'questions',
        message: 'At least one question is required',
        code: 'NO_QUESTIONS'
      });
    }

    data.questions?.forEach((question, index) => {
      if (!question.title || question.title.trim().length < 3) {
        errors.push({
          field: `questions[${index}].title`,
          message: `Question ${index + 1} title is required`,
          code: 'QUESTION_TITLE_REQUIRED'
        });
      }

      if (!question.options || question.options.length < 2) {
        errors.push({
          field: `questions[${index}].options`,
          message: `Question ${index + 1} must have at least 2 options`,
          code: 'INSUFFICIENT_OPTIONS'
        });
      }
    });

    // Selection limits validation
    if (data.allowMultipleChoices) {
      if (data.minSelections < 1) {
        errors.push({
          field: 'minSelections',
          message: 'Minimum selections must be at least 1',
          code: 'INVALID_MIN_SELECTIONS'
        });
      }

      if (data.maxSelections < data.minSelections) {
        errors.push({
          field: 'maxSelections',
          message: 'Maximum selections must be greater than minimum selections',
          code: 'INVALID_MAX_SELECTIONS'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Helper method to extract error messages
  private static getErrorMessage(error: any): string {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  }
}

export default CampaignService; 