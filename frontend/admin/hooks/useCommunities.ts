import { useState, useEffect, useCallback } from 'react';
import { communityService } from '../services/communities';
import type {
  Community,
  CommunityFilters,
  CreateCommunityRequest,
  UpdateCommunityRequest,
  CommunityAnalytics,
  CommunityMember
} from '../types/community';

interface UseCommunityListState {
  communities: Community[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UseCommunityListActions {
  fetchCommunities: () => Promise<void>;
  setPage: (page: number) => void;
  setFilters: (filters: CommunityFilters) => void;
  refreshCommunities: () => Promise<void>;
}

// Hook for managing community list with pagination and filtering
export function useCommunityList(
  initialPage: number = 1,
  initialLimit: number = 20,
  initialFilters: CommunityFilters = {}
): UseCommunityListState & UseCommunityListActions {
  const [state, setState] = useState<UseCommunityListState>({
    communities: [],
    loading: true,
    error: null,
    pagination: {
      page: initialPage,
      limit: initialLimit,
      total: 0,
      totalPages: 0,
    },
  });

  const [filters, setFiltersState] = useState<CommunityFilters>(initialFilters);

  const fetchCommunities = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await communityService.getCommunities(
        state.pagination.page,
        state.pagination.limit,
        filters
      );
      
      setState(prev => ({
        ...prev,
        communities: response.data,
        pagination: response.pagination,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch communities',
        loading: false,
      }));
    }
  }, [state.pagination.page, state.pagination.limit, filters]);

  const setPage = useCallback((page: number) => {
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, page },
    }));
  }, []);

  const setFilters = useCallback((newFilters: CommunityFilters) => {
    setFiltersState(newFilters);
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, page: 1 }, // Reset to first page when filtering
    }));
  }, []);

  const refreshCommunities = useCallback(() => {
    return fetchCommunities();
  }, [fetchCommunities]);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  return {
    ...state,
    fetchCommunities,
    setPage,
    setFilters,
    refreshCommunities,
  };
}

interface UseCommunityState {
  community: Community | null;
  loading: boolean;
  error: string | null;
}

interface UseCommunityActions {
  fetchCommunity: (id: string) => Promise<void>;
  updateCommunity: (id: string, data: UpdateCommunityRequest) => Promise<void>;
  deleteCommunity: (id: string) => Promise<void>;
  refreshCommunity: () => Promise<void>;
}

// Hook for managing single community
export function useCommunity(id?: string): UseCommunityState & UseCommunityActions {
  const [state, setState] = useState<UseCommunityState>({
    community: null,
    loading: false,
    error: null,
  });

  const fetchCommunity = useCallback(async (communityId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await communityService.getCommunity(communityId);
      setState(prev => ({
        ...prev,
        community: response.data,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch community',
        loading: false,
      }));
    }
  }, []);

  const updateCommunity = useCallback(async (communityId: string, data: UpdateCommunityRequest) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await communityService.updateCommunity(communityId, data);
      setState(prev => ({
        ...prev,
        community: response.data,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update community',
        loading: false,
      }));
      throw error; // Re-throw to allow components to handle it
    }
  }, []);

  const deleteCommunity = useCallback(async (communityId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await communityService.deleteCommunity(communityId);
      setState(prev => ({
        ...prev,
        community: null,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete community',
        loading: false,
      }));
      throw error; // Re-throw to allow components to handle it
    }
  }, []);

  const refreshCommunity = useCallback(async () => {
    if (id) {
      await fetchCommunity(id);
    }
  }, [id, fetchCommunity]);

  useEffect(() => {
    if (id) {
      fetchCommunity(id);
    }
  }, [id, fetchCommunity]);

  return {
    ...state,
    fetchCommunity,
    updateCommunity,
    deleteCommunity,
    refreshCommunity,
  };
}

interface UseCommunityCreateState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

interface UseCommunityCreateActions {
  createCommunity: (data: CreateCommunityRequest) => Promise<Community>;
  reset: () => void;
}

// Hook for community creation
export function useCommunityCreate(): UseCommunityCreateState & UseCommunityCreateActions {
  const [state, setState] = useState<UseCommunityCreateState>({
    loading: false,
    error: null,
    success: false,
  });

  const createCommunity = useCallback(async (data: CreateCommunityRequest): Promise<Community> => {
    setState({ loading: true, error: null, success: false });
    
    try {
      const response = await communityService.createCommunity(data);
      setState({ loading: false, error: null, success: true });
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create community';
      setState({ loading: false, error: errorMessage, success: false });
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ loading: false, error: null, success: false });
  }, []);

  return {
    ...state,
    createCommunity,
    reset,
  };
}

interface UseCommunityAnalyticsState {
  analytics: CommunityAnalytics | null;
  loading: boolean;
  error: string | null;
}

interface UseCommunityAnalyticsActions {
  fetchAnalytics: (id: string) => Promise<void>;
  refreshAnalytics: () => Promise<void>;
}

// Hook for community analytics
export function useCommunityAnalytics(id?: string): UseCommunityAnalyticsState & UseCommunityAnalyticsActions {
  const [state, setState] = useState<UseCommunityAnalyticsState>({
    analytics: null,
    loading: false,
    error: null,
  });

  const fetchAnalytics = useCallback(async (communityId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await communityService.getCommunityAnalytics(communityId);
      setState(prev => ({
        ...prev,
        analytics: response.data,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch analytics',
        loading: false,
      }));
    }
  }, []);

  const refreshAnalytics = useCallback(async () => {
    if (id) {
      await fetchAnalytics(id);
    }
  }, [id, fetchAnalytics]);

  useEffect(() => {
    if (id) {
      fetchAnalytics(id);
    }
  }, [id, fetchAnalytics]);

  return {
    ...state,
    fetchAnalytics,
    refreshAnalytics,
  };
} 