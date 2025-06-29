// Community Hooks for Member Portal
// React hooks for community state management and API interactions

import { useState, useEffect, useCallback, useRef } from 'react';
import communityService from '../services/communities';
import {
  Community,
  CommunityDetails,
  CommunityListResponse,
  CommunitySearchResponse,
  CommunityFilters,
  CommunityRecommendation,
  MyCommunitiesData,
  MembershipRequest,
  CommunitySortBy,
  CommunityCategory
} from '../types/community';

// Hook for community discovery and browsing
export const useCommunities = (initialFilters: CommunityFilters = {}) => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CommunityFilters>(initialFilters);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0
  });
  const [hasNextPage, setHasNextPage] = useState(false);

  const fetchCommunities = useCallback(async (
    newFilters: CommunityFilters = filters,
    page: number = 1,
    append: boolean = false
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await communityService.getCommunities(newFilters, page, pagination.limit);
      
      if (append) {
        setCommunities(prev => [...prev, ...response.communities]);
      } else {
        setCommunities(response.communities);
      }
      
      setPagination(response.pagination);
      setHasNextPage(response.pagination.page < response.pagination.total_pages);
      setFilters(newFilters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch communities');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit]);

  const loadMore = useCallback(() => {
    if (hasNextPage && !loading) {
      fetchCommunities(filters, pagination.page + 1, true);
    }
  }, [fetchCommunities, filters, hasNextPage, loading, pagination.page]);

  const refresh = useCallback(() => {
    fetchCommunities(filters, 1, false);
  }, [fetchCommunities, filters]);

  const updateFilters = useCallback((newFilters: Partial<CommunityFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    fetchCommunities(updatedFilters, 1, false);
  }, [fetchCommunities, filters]);

  const clearFilters = useCallback(() => {
    fetchCommunities({}, 1, false);
  }, [fetchCommunities]);

  // Initial load
  useEffect(() => {
    fetchCommunities(initialFilters, 1, false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    communities,
    loading,
    error,
    filters,
    pagination,
    hasNextPage,
    fetchCommunities,
    loadMore,
    refresh,
    updateFilters,
    clearFilters
  };
};

// Hook for community search
export const useCommunitySearch = () => {
  const [searchResults, setSearchResults] = useState<Community[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchMetadata, setSearchMetadata] = useState<any>(null);
  const [query, setQuery] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const search = useCallback(async (
    searchQuery: string,
    filters: CommunityFilters = {},
    page: number = 1,
    limit: number = 20
  ) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchMetadata(null);
      return;
    }

    try {
      setSearchLoading(true);
      setSearchError(null);

      const response = await communityService.searchCommunities({
        query: searchQuery,
        filters,
        page,
        limit
      });

      setSearchResults(response.communities);
      setSearchMetadata(response.search_metadata);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const debouncedSearch = useCallback((
    searchQuery: string,
    filters: CommunityFilters = {},
    delay: number = 300
  ) => {
    setQuery(searchQuery);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      search(searchQuery, filters);
    }, delay);
  }, [search]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setSearchResults([]);
    setSearchMetadata(null);
    setSearchError(null);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return {
    searchResults,
    searchLoading,
    searchError,
    searchMetadata,
    query,
    search,
    debouncedSearch,
    clearSearch
  };
};

// Hook for community details
export const useCommunityDetails = (communityId: string | null) => {
  const [community, setCommunity] = useState<CommunityDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCommunityDetails = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const details = await communityService.getCommunityById(id);
      setCommunity(details);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch community details');
      setCommunity(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (communityId) {
      fetchCommunityDetails(communityId);
    } else {
      setCommunity(null);
    }
  }, [communityId, fetchCommunityDetails]);

  const refresh = useCallback(() => {
    if (communityId) {
      fetchCommunityDetails(communityId);
    }
  }, [communityId, fetchCommunityDetails]);

  return {
    community,
    loading,
    error,
    refresh
  };
};

// Hook for membership management
export const useMembership = (communityId?: string) => {
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [membershipStatus, setMembershipStatus] = useState<string>('not_member');
  const [loading, setLoading] = useState(false);

  const joinCommunity = useCallback(async () => {
    return true; // Simplified for now
  }, []);

  const requestMembership = useCallback(async (request: MembershipRequest) => {
    try {
      setActionLoading(true);
      setActionError(null);
      
      const success = await communityService.requestMembership(request);
      
      if (!success) {
        throw new Error('Failed to request membership');
      }
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request membership';
      setActionError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  }, []);

  const leaveCommunity = useCallback(async (communityId: string) => {
    try {
      setActionLoading(true);
      setActionError(null);
      
      const success = await communityService.leaveCommunity(communityId);
      
      if (!success) {
        throw new Error('Failed to leave community');
      }
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to leave community';
      setActionError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  }, []);

  const checkEligibility = useCallback(async (communityId: string) => {
    try {
      return await communityService.checkMembershipEligibility(communityId);
    } catch (err) {
      return {
        eligible: false,
        reasons: ['Unable to check eligibility']
      };
    }
  }, []);

  return {
    actionLoading,
    actionError,
    membershipStatus,
    loading,
    joinCommunity,
    requestMembership,
    leaveCommunity,
    checkEligibility
  };
};

// Hook for my communities data
export const useMyCommunitiesData = () => {
  const [data, setData] = useState<MyCommunitiesData>({
    active_memberships: [],
    pending_applications: [],
    recommendations: [],
    recent_activity: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyCommunitiesData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const myData = await communityService.getMyCommunitiesData();
      setData(myData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch my communities data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyCommunitiesData();
  }, [fetchMyCommunitiesData]);

  const refresh = useCallback(() => {
    fetchMyCommunitiesData();
  }, [fetchMyCommunitiesData]);

  return {
    data,
    loading,
    error,
    refresh
  };
};

// Hook for featured/trending communities
export const useFeaturedCommunities = () => {
  const [featured, setFeatured] = useState<Community[]>([]);
  const [trending, setTrending] = useState<Community[]>([]);
  const [recommendations, setRecommendations] = useState<CommunityRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [featuredData, trendingData, recommendationsData] = await Promise.all([
        communityService.getFeaturedCommunities(6),
        communityService.getTrendingCommunities(6),
        communityService.getRecommendations(5)
      ]);

      setFeatured(featuredData);
      setTrending(trendingData);
      setRecommendations(recommendationsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch featured communities');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeaturedData();
  }, [fetchFeaturedData]);

  const refresh = useCallback(() => {
    fetchFeaturedData();
  }, [fetchFeaturedData]);

  return {
    featured,
    trending,
    recommendations,
    loading,
    error,
    refresh
  };
};

// Hook for category-based browsing
export const useCommunityCategories = () => {
  const [selectedCategory, setSelectedCategory] = useState<CommunityCategory | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0
  });

  const categories = communityService.getCategoryInfo();

  const fetchCommunitiesByCategory = useCallback(async (
    category: CommunityCategory,
    page: number = 1
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await communityService.getCommunitiesByCategory(category, page);
      
      if (page === 1) {
        setCommunities(response.communities);
      } else {
        setCommunities(prev => [...prev, ...response.communities]);
      }
      
      setPagination(response.pagination);
      setSelectedCategory(category);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch communities by category');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (selectedCategory && pagination.page < pagination.total_pages && !loading) {
      fetchCommunitiesByCategory(selectedCategory, pagination.page + 1);
    }
  }, [selectedCategory, pagination.page, pagination.total_pages, loading, fetchCommunitiesByCategory]);

  return {
    categories,
    selectedCategory,
    communities,
    loading,
    error,
    pagination,
    fetchCommunitiesByCategory,
    loadMore
  };
}; 