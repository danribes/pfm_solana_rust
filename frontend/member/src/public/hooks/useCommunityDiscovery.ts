// Task 4.5.2: Community Discovery Hook
// React hook for managing community discovery state and interactions

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  PublicCommunity,
  DiscoveryFilters,
  SearchSuggestion,
  UseCommunityDiscoveryResult,
  CommunityCategory,
  SortOption,
  SortOrder,
} from "../types/public";
import { discoveryService, debounce } from "../services/discovery";

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useCommunityDiscovery(
  initialFilters: DiscoveryFilters = {}
): UseCommunityDiscoveryResult {
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================

  const [communities, setCommunities] = useState<PublicCommunity[]>([]);
  const [featuredCommunities, setFeaturedCommunities] = useState<PublicCommunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DiscoveryFilters>(initialFilters);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialFilters.searchQuery || "");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);

  // ========================================================================
  // MEMOIZED VALUES
  // ========================================================================

  const currentPage = useMemo(() => filters.page || 1, [filters.page]);
  const currentLimit = useMemo(() => filters.limit || 12, [filters.limit]);

  // ========================================================================
  // LOAD COMMUNITIES
  // ========================================================================

  const loadCommunities = useCallback(
    async (loadFilters: DiscoveryFilters = filters, append: boolean = false) => {
      try {
        setIsLoading(true);;
        setError(null);

        const result = await discoveryService.getCommunities(loadFilters);

        if (append) {
          setCommunities((prev: PublicCommunity[]) => => [...prev, ...result.communities]);
        } else {
          setCommunities(result.communities);
        }

        setTotalCount(result.totalCount);
        setHasMore(result.hasMore);
        setSuggestions(result.suggestions);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load communities";
        setError(errorMessage);
        console.error("Error loading communities:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [filters]
  );

  // ========================================================================
  // LOAD FEATURED COMMUNITIES
  // ========================================================================

  const loadFeaturedCommunities = useCallback(async () => {
    try {
      const featured = await discoveryService.getFeaturedCommunities(6);
      setFeaturedCommunities(featured);
    } catch (err) {
      console.error("Error loading featured communities:", err);
    }
  }, []);

  // ========================================================================
  // SEARCH FUNCTIONALITY
  // ========================================================================

  const performSearch = useCallback(
    async (query: string) => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const result = await discoveryService.searchCommunities(query, 20);
        setSuggestions(result.suggestions);
        
        // Update communities if this is the current search query
        if (query === searchQuery) {
          setCommunities(result.communities);
          setTotalCount(result.communities.length);
          setHasMore(false);
        }
      } catch (err) {
        console.error("Error searching communities:", err);
        setSuggestions([]);
      }
    },
    [searchQuery]
  );

  // Debounced search function
  const debouncedSearch = useMemo(
    () => debounce(performSearch, 300),
    [performSearch]
  );

  // ========================================================================
  // FILTER MANAGEMENT
  // ========================================================================

  const updateFilters = useCallback(
    (newFilters: Partial<DiscoveryFilters>) => {
      const updatedFilters: DiscoveryFilters = {
        ...filters,
        ...newFilters,
        page: newFilters.page !== undefined ? newFilters.page : 1,
      };

      setFilters(updatedFilters);
      
      // If search query changed, update search state
      if (newFilters.searchQuery !== undefined) {
        setSearchQuery(newFilters.searchQuery);
      }
    },
    [filters]
  );

  const clearFilters = useCallback(() => {
    const clearedFilters: DiscoveryFilters = {
      page: 1,
      limit: currentLimit,
    };
    setFilters(clearedFilters);
    setSearchQuery("");
    setSuggestions([]);
  }, [currentLimit]);

  // ========================================================================
  // PAGINATION
  // ========================================================================

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;

    const nextPageFilters = {
      ...filters,
      page: currentPage + 1,
    };

    await loadCommunities(nextPageFilters, true);
    setFilters(nextPageFilters);
  }, [hasMore, isLoading, filters, currentPage, loadCommunities]);

  // ========================================================================
  // REFRESH DATA
  // ========================================================================

  const refreshCommunities = useCallback(async () => {
    await Promise.all([
      loadCommunities(filters, false),
      loadFeaturedCommunities(),
    ]);
  }, [loadCommunities, loadFeaturedCommunities, filters]);

  // ========================================================================
  // EFFECTS
  // ========================================================================

  // Initial load
  useEffect(() => {
    loadCommunities(filters, false);
    loadFeaturedCommunities();
  }, []); // Only run on mount

  // Load communities when filters change
  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      loadCommunities(filters, false);
    }
  }, [filters]); // Depend on filters object

  // Handle search query changes
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      debouncedSearch(searchQuery);
    } else if (searchQuery.trim().length === 0) {
      setSuggestions([]);
      // Reload communities without search filter
      const filtersWithoutSearch = { ...filters };
      delete filtersWithoutSearch.searchQuery;
      setFilters(filtersWithoutSearch);
    }
  }, [searchQuery, debouncedSearch]);

  // ========================================================================
  // PUBLIC API
  // ========================================================================

  return {
    // State
    communities,
    featuredCommunities,
    isLoading,
    error,
    filters,
    totalCount,
    hasMore,
    searchQuery,
    suggestions,

    // Actions
    setFilters: updateFilters,
    setSearchQuery,
    loadMore,
    refreshCommunities,
    clearFilters,
  };
}

// ============================================================================
// SPECIALIZED HOOKS
// ============================================================================

/**
 * Hook for featured communities only
 */
export function useFeaturedCommunities(limit: number = 6) {
  const [communities, setCommunities] = useState<PublicCommunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFeatured = useCallback(async () => {
    try {
      setIsLoading(true);;
      setError(null);
      const featured = await discoveryService.getFeaturedCommunities(limit);
      setCommunities(featured);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load featured communities";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    loadFeatured();
  }, [loadFeatured]);

  return {
    communities,
    isLoading,
    error,
    refresh: loadFeatured,
  };
}

/**
 * Hook for community search with advanced features
 */
export function useCommunitySearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PublicCommunity[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      setSuggestions([]);
      return;
    }

    try {
      setIsSearching(true);
      const result = await discoveryService.searchCommunities(searchQuery, 20);
      setResults(result.communities);
      setSuggestions(result.suggestions);
      
      // Add to search history
      setSearchHistory(prev => {
        const newHistory = [searchQuery, ...prev.filter(q => q !== searchQuery)];
        return newHistory.slice(0, 10); // Keep last 10 searches
      });
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const debouncedSearch = useMemo(
    () => debounce(performSearch, 300),
    [performSearch]
  );

  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
    debouncedSearch(newQuery);
  }, [debouncedSearch]);

  const clearSearch = useCallback(() => {
    setQuery("");
    setResults([]);
    setSuggestions([]);
  }, []);

  return {
    query,
    results,
    suggestions,
    isSearching,
    searchHistory,
    setQuery: updateQuery,
    clearSearch,
    performSearch,
  };
}

/**
 * Hook for filter management
 */
export function useDiscoveryFilters(initialFilters: DiscoveryFilters = {}) {
  const [filters, setFilters] = useState<DiscoveryFilters>(initialFilters);
  const [availableOptions, setAvailableOptions] = useState<{
    categories: { category: CommunityCategory; count: number }[];
    tags: { tag: string; count: number }[];
    memberRanges: { min: number; max: number }[];
  }>({
    categories: [],
    tags: [],
    memberRanges: [],
  });

  // Load available filter options
  useEffect(() => {
    discoveryService.getFilterOptions()
      .then(setAvailableOptions)
      .catch(console.error);
  }, []);

  const updateFilter = useCallback(
    <K extends keyof DiscoveryFilters>(key: K, value: DiscoveryFilters[K]) => {
      setFilters(prev => ({
        ...prev,
        [key]: value,
        page: 1, // Reset to first page when filters change
      }));
    },
    []
  );

  const toggleCategory = useCallback((category: CommunityCategory) => {
    setFilters(prev => {
      const categories = prev.category || [];
      const isSelected = categories.includes(category);
      
      return {
        ...prev,
        category: isSelected
          ? categories.filter(c => c !== category)
          : [...categories, category],
        page: 1,
      };
    });
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setFilters(prev => {
      const tags = prev.tags || [];
      const isSelected = tags.includes(tag);
      
      return {
        ...prev,
        tags: isSelected
          ? tags.filter(t => t !== tag)
          : [...tags, tag],
        page: 1,
      };
    });
  }, []);

  const setSortBy = useCallback((sortBy: SortOption, sortOrder: SortOrder = SortOrder.DESC) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder,
      page: 1,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: filters.limit || 12,
    });
  }, [filters.limit]);

  const hasActiveFilters = useMemo(() => {
    const { page, limit, ...activeFilters } = filters;
    return Object.keys(activeFilters).length > 0;
  }, [filters]);

  return {
    filters,
    availableOptions,
    updateFilter,
    toggleCategory,
    toggleTag,
    setSortBy,
    clearFilters,
    hasActiveFilters,
    setFilters,
  };
}
