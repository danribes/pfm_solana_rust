// Task 7.1.2: Community Discovery & Browse Interface
// Hook for community search functionality

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Community,
  CommunitySearchParams,
  CommunitySearchResponse,
  FilterMetadata,
  UseCommunitySearchResult,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT_BY,
  DEFAULT_SORT_ORDER
} from '@/types/communityDiscovery';
import {
  searchCommunities,
  getFilterMetadata,
  mockSearchCommunities,
  useMockData
} from '@/services/communityDiscovery';

interface UseCommunitySearchOptions {
  initialParams?: CommunitySearchParams;
  autoSearch?: boolean;
  pageSize?: number;
  debounceMs?: number;
}

export const useCommunitySearch = (
  options: UseCommunitySearchOptions = {}
): UseCommunitySearchResult => {
  const {
    initialParams = {},
    autoSearch = false,
    pageSize = DEFAULT_PAGE_SIZE,
    debounceMs = 300
  } = options;

  // State management
  const [communities, setCommunities] = useState<Community[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<FilterMetadata | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Search parameters state
  const [searchParams, setSearchParams] = useState<CommunitySearchParams>({
    sortBy: DEFAULT_SORT_BY,
    sortOrder: DEFAULT_SORT_ORDER,
    ...initialParams
  });

  // Refs for managing debounced search and abort controller
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();
  const lastSearchRef = useRef<string>('');

  // Load filter metadata on mount
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        if (useMockData) {
          // Mock metadata for development
          setMetadata({
            categories: [
              { category: 'governance', count: 15 },
              { category: 'social', count: 22 },
              { category: 'professional', count: 18 }
            ],
            types: [
              { type: 'dao', count: 12 },
              { type: 'organization', count: 25 },
              { type: 'cooperative', count: 8 }
            ],
            locations: ['New York', 'San Francisco', 'London', 'Berlin', 'Tokyo'],
            languages: ['English', 'Spanish', 'French', 'German', 'Japanese'],
            tags: [
              { tag: 'governance', count: 20 },
              { tag: 'voting', count: 15 },
              { tag: 'democracy', count: 12 }
            ],
            memberCountRange: [1, 5000],
            activityLevels: [
              { level: 'low', count: 10 },
              { level: 'medium', count: 25 },
              { level: 'high', count: 15 }
            ]
          });
        } else {
          const filterMetadata = await getFilterMetadata();
          setMetadata(filterMetadata);
        }
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    };

    loadMetadata();
  }, []);

  // Perform search
  const search = useCallback(async (params: CommunitySearchParams, append: boolean = false) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    // Clear debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    setLoading(true);
    setError(null);

    try {
      const searchWithPagination = {
        ...params,
        page: append ? currentPage + 1 : 1,
        pageSize
      };

      let response: CommunitySearchResponse;
      
      if (useMockData) {
        response = await mockSearchCommunities(searchWithPagination);
      } else {
        response = await searchCommunities(searchWithPagination);
      }

      if (append) {
        setCommunities(prev => [...prev, ...response.communities]);
        setCurrentPage(prev => prev + 1);
      } else {
        setCommunities(response.communities);
        setCurrentPage(1);
      }

      setTotalCount(response.totalCount);
      setHasMore(response.page < response.totalPages);
      setSearchParams(params);

      // Update last search for reference
      lastSearchRef.current = JSON.stringify(params);

    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message || 'An error occurred while searching');
        console.error('Search error:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  // Debounced search function
  const debouncedSearch = useCallback((params: CommunitySearchParams) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      search(params);
    }, debounceMs);
  }, [search, debounceMs]);

  // Load more results (pagination)
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;

    await search(searchParams, true);
  }, [hasMore, loading, search, searchParams]);

  // Auto search on params change
  useEffect(() => {
    if (autoSearch) {
      const currentSearch = JSON.stringify(searchParams);
      if (currentSearch !== lastSearchRef.current) {
        debouncedSearch(searchParams);
      }
    }
  }, [searchParams, autoSearch, debouncedSearch]);

  // Cleanup function
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Helper functions for updating search parameters
  const updateSearchParams = useCallback((newParams: Partial<CommunitySearchParams>) => {
    setSearchParams(prev => ({ ...prev, ...newParams }));
  }, []);

  const resetSearch = useCallback(() => {
    setCommunities([]);
    setTotalCount(0);
    setCurrentPage(1);
    setHasMore(false);
    setError(null);
    setSearchParams({
      sortBy: DEFAULT_SORT_BY,
      sortOrder: DEFAULT_SORT_ORDER
    });
  }, []);

  // Quick search by query
  const searchByQuery = useCallback((query: string) => {
    updateSearchParams({ query });
    if (autoSearch) {
      debouncedSearch({ ...searchParams, query });
    }
  }, [searchParams, autoSearch, debouncedSearch, updateSearchParams]);

  // Search by category
  const searchByCategory = useCallback((category: string[]) => {
    updateSearchParams({ category: category as any });
    if (autoSearch) {
      debouncedSearch({ ...searchParams, category: category as any });
    }
  }, [searchParams, autoSearch, debouncedSearch, updateSearchParams]);

  // Sort communities
  const sortCommunities = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
    updateSearchParams({ sortBy: sortBy as any, sortOrder });
    if (autoSearch) {
      debouncedSearch({ ...searchParams, sortBy: sortBy as any, sortOrder });
    }
  }, [searchParams, autoSearch, debouncedSearch, updateSearchParams]);

  // Return the hook interface
  return {
    communities,
    totalCount,
    loading,
    error,
    searchParams,
    metadata,
    hasMore,
    search: useCallback((params: CommunitySearchParams) => search(params), [search]),
    loadMore,
    
    // Additional helper methods
    updateSearchParams,
    resetSearch,
    searchByQuery,
    searchByCategory,
    sortCommunities,
    debouncedSearch
  } as UseCommunitySearchResult & {
    updateSearchParams: (params: Partial<CommunitySearchParams>) => void;
    resetSearch: () => void;
    searchByQuery: (query: string) => void;
    searchByCategory: (category: string[]) => void;
    sortCommunities: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
    debouncedSearch: (params: CommunitySearchParams) => void;
  };
};

// Hook for managing search history
export const useSearchHistory = () => {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const maxHistoryItems = 10;

  useEffect(() => {
    // Load search history from localStorage
    const saved = localStorage.getItem('communitySearchHistory');
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse search history:', error);
      }
    }
  }, []);

  const addToHistory = useCallback((query: string) => {
    if (!query.trim()) return;

    setSearchHistory(prev => {
      const filtered = prev.filter(item => item !== query);
      const newHistory = [query, ...filtered].slice(0, maxHistoryItems);
      
      // Save to localStorage
      localStorage.setItem('communitySearchHistory', JSON.stringify(newHistory));
      
      return newHistory;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem('communitySearchHistory');
  }, []);

  const removeFromHistory = useCallback((query: string) => {
    setSearchHistory(prev => {
      const newHistory = prev.filter(item => item !== query);
      localStorage.setItem('communitySearchHistory', JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  return {
    searchHistory,
    addToHistory,
    clearHistory,
    removeFromHistory
  };
};

export default useCommunitySearch; 