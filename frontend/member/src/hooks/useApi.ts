// API Integration Hook
// Task 5.1.1 Sub-task 2: Backend API Integration

import { useState, useEffect, useRef, useCallback } from "react";
import { ApiClient, apiClient } from "../services/api";
import { ApiResponse, ApiError, IntegrationError } from "../types/integration";

interface UseApiState {
  isLoading: boolean;
  error: IntegrationError | null;
  lastResponse: ApiResponse<any> | null;
  metrics: any;
}

interface UseApiOptions {
  autoCancel?: boolean;
  enableMetrics?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: IntegrationError) => void;
}

interface UseApiReturn extends UseApiState {
  // HTTP methods
  get: <T = any>(endpoint: string, params?: Record<string, any>) => Promise<ApiResponse<T>>;
  post: <T = any>(endpoint: string, data?: any) => Promise<ApiResponse<T>>;
  put: <T = any>(endpoint: string, data?: any) => Promise<ApiResponse<T>>;
  delete: <T = any>(endpoint: string) => Promise<ApiResponse<T>>;
  
  // Request management
  cancelRequests: () => void;
  clearError: () => void;
  refreshMetrics: () => void;
  
  // Specialized API methods
  authenticateWallet: (walletData: any) => Promise<ApiResponse<any>>;
  getCommunities: (params?: any) => Promise<ApiResponse<any>>;
  createCommunity: (data: any) => Promise<ApiResponse<any>>;
  getVotingProposals: (communityId: string) => Promise<ApiResponse<any>>;
  createVotingProposal: (communityId: string, data: any) => Promise<ApiResponse<any>>;
  castVote: (proposalId: string, voteData: any) => Promise<ApiResponse<any>>;
}

export const useApi = (options: UseApiOptions = {}): UseApiReturn => {
  const [state, setState] = useState<UseApiState>({
    isLoading: false,
    error: null,
    lastResponse: null,
    metrics: null,
  });

  const clientRef = useRef<ApiClient>(apiClient);
  const activeRequestsRef = useRef<Set<string>>(new Set());

  const {
    autoCancel = true,
    enableMetrics = true,
    onSuccess,
    onError,
  } = options;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoCancel) {
        clientRef.current.cancelAllRequests();
      }
    };
  }, [autoCancel]);

  // Update metrics periodically if enabled
  useEffect(() => {
    if (!enableMetrics) return;

    const updateMetrics = () => {
      const metrics = clientRef.current.getMetrics();
      setState(prev => ({ ...prev, metrics }));
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, [enableMetrics]);

  // Generic request wrapper
  const makeRequest = useCallback(async <T = any>(
    requestFn: () => Promise<ApiResponse<T>>,
    requestId?: string
  ): Promise<ApiResponse<T>> => {
    const id = requestId || `req_${Date.now()}`;
    activeRequestsRef.current.add(id);

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await requestFn();
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        lastResponse: response,
        metrics: enableMetrics ? clientRef.current.getMetrics() : prev.metrics,
      }));

      if (response.success && onSuccess) {
        onSuccess(response.data);
      } else if (!response.success && onError) {
        const error: IntegrationError = {
          type: "api",
          code: "API_ERROR",
          message: response.error || "API request failed",
          recoverable: true,
        } as IntegrationError;
        onError(error);
      }

      return response;
    } catch (error) {
      const integrationError: IntegrationError = {
        type: "api",
        code: "REQUEST_FAILED",
        message: error.message || "Request failed",
        recoverable: true,
      } as IntegrationError;

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: integrationError,
      }));

      if (onError) {
        onError(integrationError);
      }

      throw integrationError;
    } finally {
      activeRequestsRef.current.delete(id);
    }
  }, [enableMetrics, onSuccess, onError]);

  // HTTP methods
  const get = useCallback(<T = any>(
    endpoint: string, 
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> => {
    return makeRequest(() => clientRef.current.get<T>(endpoint, params));
  }, [makeRequest]);

  const post = useCallback(<T = any>(
    endpoint: string, 
    data?: any
  ): Promise<ApiResponse<T>> => {
    return makeRequest(() => clientRef.current.post<T>(endpoint, data));
  }, [makeRequest]);

  const put = useCallback(<T = any>(
    endpoint: string, 
    data?: any
  ): Promise<ApiResponse<T>> => {
    return makeRequest(() => clientRef.current.put<T>(endpoint, data));
  }, [makeRequest]);

  const deleteFn = useCallback(<T = any>(
    endpoint: string
  ): Promise<ApiResponse<T>> => {
    return makeRequest(() => clientRef.current.delete<T>(endpoint));
  }, [makeRequest]);

  // Request management
  const cancelRequests = useCallback(() => {
    clientRef.current.cancelAllRequests();
    activeRequestsRef.current.clear();
    setState(prev => ({ ...prev, isLoading: false }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const refreshMetrics = useCallback(() => {
    if (enableMetrics) {
      const metrics = clientRef.current.getMetrics();
      setState(prev => ({ ...prev, metrics }));
    }
  }, [enableMetrics]);

  // Specialized API methods for PFM Community Management
  const authenticateWallet = useCallback(async (walletData: any): Promise<ApiResponse<any>> => {
    return post("/api/auth/wallet", walletData);
  }, [post]);

  const getCommunities = useCallback(async (params?: any): Promise<ApiResponse<any>> => {
    return get("/api/communities", params);
  }, [get]);

  const createCommunity = useCallback(async (data: any): Promise<ApiResponse<any>> => {
    return post("/api/communities", data);
  }, [post]);

  const getVotingProposals = useCallback(async (communityId: string): Promise<ApiResponse<any>> => {
    return get(`/api/communities/${communityId}/voting/proposals`);
  }, [get]);

  const createVotingProposal = useCallback(async (
    communityId: string, 
    data: any
  ): Promise<ApiResponse<any>> => {
    return post(`/api/communities/${communityId}/voting/proposals`, data);
  }, [post]);

  const castVote = useCallback(async (
    proposalId: string, 
    voteData: any
  ): Promise<ApiResponse<any>> => {
    return post(`/api/voting/proposals/${proposalId}/vote`, voteData);
  }, [post]);

  return {
    ...state,
    get,
    post,
    put,
    delete: deleteFn,
    cancelRequests,
    clearError,
    refreshMetrics,
    authenticateWallet,
    getCommunities,
    createCommunity,
    getVotingProposals,
    createVotingProposal,
    castVote,
  };
};

export default useApi;
