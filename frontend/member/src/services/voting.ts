// Voting Service for Member Portal
// Handles API calls to backend voting endpoints

import {
  VotingQuestion,
  VotingQuestionsResponse,
  VotingHistoryResponse,
  CastVoteResponse,
  VotingStatsResponse,
  VotingAPIResponse,
  VotingFilters,
  CastVoteDTO,
  CreateVotingQuestionDTO,
  UpdateVotingQuestionDTO,
  Vote,
  VotingResult,
  VotingActivity,
  VotingUpdatePayload,
  VotingError
} from '../types/voting';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

class VotingService {
  private baseUrl: string;
  private wsConnection: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private attemptReconnect?: () => void;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  }

  private async fetchWithAuth<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      //@ts-ignore
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include', // Include cookies for session
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        
        // Handle specific voting errors
        if (response.status === 401) {
          throw new Error('Unauthorized: Please log in to vote');
        } else if (response.status === 403) {
          throw new Error('Forbidden: You do not have permission to perform this action');
        } else if (response.status === 404) {
          throw new Error('Voting question not found');
        } else if (response.status === 409) {
          throw new Error('You have already voted on this question');
        } else if (response.status === 422) {
          throw new Error('Invalid vote data: ' + errorMessage);
        }
        
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to voting service');
      }
      throw error;
    }
  }

  // Retry logic with exponential backoff
  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry client errors (4xx)
        if (error instanceof Error && error.message.includes('HTTP 4')) {
          throw error;
        }
        
        if (attempt === maxRetries) {
          break;
        }
        
        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }

  // Voting Questions Management
  async getVotingQuestions(
    filters: VotingFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<VotingQuestionsResponse> {
    const queryParams = new URLSearchParams();
    
    // Add pagination
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    
    // Add filters
    if (filters.status && filters.status.length > 0) {
      queryParams.append('status', filters.status.join(','));
    }
    if (filters.type && filters.type.length > 0) {
      queryParams.append('type', filters.type.join(','));
    }
    if (filters.communityId) {
      queryParams.append('community_id', filters.communityId);
    }
    if (filters.searchTerm) {
      queryParams.append('search', filters.searchTerm);
    }
    if (filters.dateRange) {
      queryParams.append('start_date', filters.dateRange.start.toISOString());
      queryParams.append('end_date', filters.dateRange.end.toISOString());
    }

    return this.retryRequest(async () => {
      const response = await this.fetchWithAuth<ApiResponse<VotingQuestion[]>>(
        `/voting/questions?${queryParams.toString()}`
      );

      return {
        questions: response.data || [],
        pagination: {
          page: response.pagination?.page || 1,
          limit: response.pagination?.limit || 20,
          total: response.pagination?.total || 0,
          totalPages: response.pagination?.total_pages || 0
        }
      };
    });
  }

  async getVotingQuestion(id: string): Promise<VotingQuestion> {
    return this.retryRequest(async () => {
      const response = await this.fetchWithAuth<ApiResponse<VotingQuestion>>(
        `/voting/questions/${id}`
      );

      if (!response.success || !response.data) {
        throw new Error('Voting question not found');
      }

      return response.data;
    });
  }

  async createVotingQuestion(questionData: CreateVotingQuestionDTO): Promise<VotingQuestion> {
    const response = await this.fetchWithAuth<ApiResponse<VotingQuestion>>(
      `/voting/questions`,
      {
        method: 'POST',
        body: JSON.stringify(questionData)
      }
    );

    if (!response.success || !response.data) {
      throw new Error('Failed to create voting question');
    }

    return response.data;
  }

  async updateVotingQuestion(id: string, updates: UpdateVotingQuestionDTO): Promise<VotingQuestion> {
    const response = await this.fetchWithAuth<ApiResponse<VotingQuestion>>(
      `/voting/questions/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(updates)
      }
    );

    if (!response.success || !response.data) {
      throw new Error('Failed to update voting question');
    }

    return response.data;
  }

  async deleteVotingQuestion(id: string): Promise<boolean> {
    const response = await this.fetchWithAuth<ApiResponse<any>>(
      `/voting/questions/${id}`,
      {
        method: 'DELETE'
      }
    );

    return response.success;
  }

  // Vote Casting Functions
  async castVote(voteData: CastVoteDTO): Promise<CastVoteResponse> {
    // Validate vote data before sending
    if (!voteData.questionId || !voteData.optionIds || voteData.optionIds.length === 0) {
      throw new Error('Invalid vote data: Question ID and option selections are required');
    }

    const response = await this.fetchWithAuth<ApiResponse<CastVoteResponse>>(
      `/voting/questions/${voteData.questionId}/vote`,
      {
        method: 'POST',
        body: JSON.stringify({
          option_ids: voteData.optionIds,
          metadata: voteData.metadata
        })
      }
    );

    if (!response.success || !response.data) {
      throw new Error('Failed to cast vote');
    }

    return response.data;
  }

  async updateVote(questionId: string, voteData: CastVoteDTO): Promise<CastVoteResponse> {
    const response = await this.fetchWithAuth<ApiResponse<CastVoteResponse>>(
      `/voting/questions/${questionId}/vote`,
      {
        method: 'PUT',
        body: JSON.stringify({
          option_ids: voteData.optionIds,
          metadata: voteData.metadata
        })
      }
    );

    if (!response.success || !response.data) {
      throw new Error('Failed to update vote');
    }

    return response.data;
  }

  async deleteVote(questionId: string): Promise<boolean> {
    const response = await this.fetchWithAuth<ApiResponse<any>>(
      `/voting/questions/${questionId}/vote`,
      {
        method: 'DELETE'
      }
    );

    return response.success;
  }

  async validateVote(questionId: string, optionIds: string[]): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    try {
      const response = await this.fetchWithAuth<ApiResponse<any>>(
        `/voting/questions/${questionId}/validate`,
        {
          method: 'POST',
          body: JSON.stringify({ option_ids: optionIds })
        }
      );

      return response.data || { valid: false, errors: ['Validation failed'] };
    } catch (error) {
      return {
        valid: false,
        errors: [error instanceof Error ? error.message : 'Validation failed']
      };
    }
  }

  // Voting History Functions
  async getUserVotingHistory(
    filters: VotingFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<VotingHistoryResponse> {
    const queryParams = new URLSearchParams();
    
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    
    if (filters.communityId) {
      queryParams.append('community_id', filters.communityId);
    }
    if (filters.dateRange) {
      queryParams.append('start_date', filters.dateRange.start.toISOString());
      queryParams.append('end_date', filters.dateRange.end.toISOString());
    }

    return this.retryRequest(async () => {
      const response = await this.fetchWithAuth<ApiResponse<{
        votes: Vote[];
        questions: VotingQuestion[];
      }>>(
        `/voting/history?${queryParams.toString()}`
      );

      return {
        votes: response.data?.votes || [],
        questions: response.data?.questions || [],
        pagination: {
          page: response.pagination?.page || 1,
          limit: response.pagination?.limit || 20,
          total: response.pagination?.total || 0,
          totalPages: response.pagination?.total_pages || 0
        }
      };
    });
  }

  async getVotingResults(questionId: string): Promise<VotingResult> {
    return this.retryRequest(async () => {
      const response = await this.fetchWithAuth<ApiResponse<VotingResult>>(
        `/voting/questions/${questionId}/results`
      );

      if (!response.success || !response.data) {
        throw new Error('Failed to get voting results');
      }

      return response.data;
    });
  }

  async getVotingStats(communityId?: string): Promise<VotingStatsResponse> {
    const queryParams = communityId ? `?community_id=${communityId}` : '';
    
    return this.retryRequest(async () => {
      const response = await this.fetchWithAuth<ApiResponse<VotingStatsResponse>>(
        `/voting/stats${queryParams}`
      );

      if (!response.success || !response.data) {
        throw new Error('Failed to get voting statistics');
      }

      return response.data;
    });
  }

  async getVotingActivity(
    limit: number = 10,
    communityId?: string
  ): Promise<VotingActivity[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('limit', limit.toString());
    if (communityId) {
      queryParams.append('community_id', communityId);
    }

    return this.retryRequest(async () => {
      const response = await this.fetchWithAuth<ApiResponse<VotingActivity[]>>(
        `/voting/activity?${queryParams.toString()}`
      );

      return response.data || [];
    });
  }

  // Real-time Updates via WebSocket
  connectToVotingUpdates(
    onUpdate: (payload: VotingUpdatePayload) => void,
    onError?: (error: Error) => void
  ): () => void {
    const wsUrl = this.baseUrl.replace('http', 'ws') + '/voting/ws';
    
    const connect = () => {
      try {
        this.wsConnection = new WebSocket(wsUrl);

        this.wsConnection.onopen = () => {
          console.log('Connected to voting updates');
          this.reconnectAttempts = 0;
        };

        this.wsConnection.onmessage = (event) => {
          try {
            const payload: VotingUpdatePayload = JSON.parse(event.data);
            onUpdate(payload);
          } catch (error) {
            console.error('Failed to parse voting update:', error);
          }
        };

        this.wsConnection.onclose = () => {
          console.log('Disconnected from voting updates');
          this.attemptReconnect();
        };

        this.wsConnection.onerror = (error) => {
          console.error('WebSocket error:', error);
          if (onError) {
            onError(new Error('WebSocket connection error'));
          }
        };
      } catch (error) {
        console.error('Failed to connect to voting updates:', error);
        if (onError) {
          onError(error as Error);
        }
      }
    };

    const attemptReconnect = () => {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = Math.pow(2, this.reconnectAttempts) * 1000;
        
        this.reconnectTimeout = setTimeout(() => {
          console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
          connect();
        }, delay);
      }
    };

    //@ts-ignore
      this.attemptReconnect = attemptReconnect;
    connect();

    // Return disconnect function
    return () => {
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
      }
      if (this.wsConnection) {
        this.wsConnection.close();
        this.wsConnection = null;
      }
    };
  }

  // Utility Functions
  async checkVotingEligibility(questionId: string): Promise<{
    eligible: boolean;
    reasons: string[];
  }> {
    try {
      const response = await this.fetchWithAuth<ApiResponse<any>>(
        `/voting/questions/${questionId}/eligibility`
      );

      return response.data || { eligible: true, reasons: [] };
    } catch (error) {
      return {
        eligible: false,
        reasons: ['Unable to check voting eligibility']
      };
    }
  }

  async getQuestionsByTag(tag: string, limit: number = 10): Promise<VotingQuestion[]> {
    return this.retryRequest(async () => {
      const response = await this.fetchWithAuth<ApiResponse<VotingQuestion[]>>(
        `/voting/questions/by-tag/${encodeURIComponent(tag)}?limit=${limit}`
      );

      return response.data || [];
    });
  }

  // Cache management for performance
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache<T>(key: string, data: T, ttlMs: number = 300000): void { // 5 min default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }

  async getQuestionWithCache(id: string, useCache: boolean = true): Promise<VotingQuestion> {
    const cacheKey = `question_${id}`;
    
    if (useCache) {
      const cached = this.getCached<VotingQuestion>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const question = await this.getVotingQuestion(id);
    if (useCache) {
      this.setCache(cacheKey, question, 60000); // 1 minute cache for active questions
    }
    
    return question;
  }

  // Cleanup method
  cleanup(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.cache.clear();
  }
}

// Create and export singleton instance
const votingService = new VotingService();
export default votingService; 