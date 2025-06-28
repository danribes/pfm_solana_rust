import React, { useState, useEffect, useCallback } from 'react';
import { CommunityFilters, CommunityCategory, CommunitySortBy } from '../../types/community';
import { useCommunities, useFeaturedCommunities, useCommunitySearch } from '../../hooks/useCommunities';
import CommunitySearch from './CommunitySearch';
import CommunityFiltersPanel from './CommunityFilters';
import CommunityGrid from './CommunityGrid';
import CommunityList from './CommunityList';

interface CommunityBrowserProps {
  className?: string;
  defaultCategory?: CommunityCategory;
  defaultView?: 'grid' | 'list';
  showFilters?: boolean;
  showSearch?: boolean;
}

const CommunityBrowser: React.FC<CommunityBrowserProps> = ({
  className = '',
  defaultCategory,
  defaultView = 'grid',
  showFilters = true,
  showSearch = true
}) => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(defaultView);
  const [filters, setFilters] = useState<CommunityFilters>({
    category: defaultCategory,
    sort_by: CommunitySortBy.CREATED_AT,
    sort_order: 'desc'
  });

  // Hooks
  const {
    communities,
    loading,
    error,
    hasNextPage,
    loadMore,
    refresh
  } = useCommunities(filters);

  const {
    featured,
    loading: featuredLoading
  } = useFeaturedCommunities();

  const {
    searchResults,
    searchLoading,
    debouncedSearch
  } = useCommunitySearch();

  // Effect to handle search
  useEffect(() => {
    if (searchQuery) {
      debouncedSearch(searchQuery, filters);
    }
  }, [searchQuery, filters, debouncedSearch]);

  // Get displayed communities (search results or normal communities)
  const displayedCommunities = searchQuery ? searchResults : communities;

  // Handlers
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleFiltersChange = useCallback((newFilters: CommunityFilters) => {
    setFilters(newFilters);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      sort_by: CommunitySortBy.CREATED_AT,
      sort_order: 'desc'
    });
    setSearchQuery('');
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !loading && !searchQuery) {
      loadMore();
    }
  }, [hasNextPage, loading, loadMore, searchQuery]);

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
  };

  // Featured communities section
  const FeaturedSection = () => {
    if (!featured || featured.length === 0 || searchQuery) {
      return null;
    }

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Featured Communities</h2>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View all
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featured.slice(0, 3).map(community => (
            <div key={community.id} className="relative">
              <div className="absolute top-2 right-2 z-10">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  ⭐ Featured
                </span>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-4">
                <h3 className="font-medium text-gray-900 mb-1">{community.name}</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{community.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{community.member_count} members</span>
                  <span className="flex items-center">
                    <span className="text-yellow-400 mr-1">★</span>
                    {community.average_rating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Category quick filters
  const CategoryFilters = () => {
    const categories = Object.values(CommunityCategory);
    const selectedCategory = filters.category;

    return (
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Filters</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleFiltersChange({ ...filters, category: undefined })}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              !selectedCategory
                ? 'bg-blue-100 text-blue-800 border-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } border`}
          >
            All
          </button>
          {categories.slice(0, 6).map(category => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => {
                  handleFiltersChange({ 
                    ...filters, 
                    category: isSelected ? undefined : category
                  });
                }}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  isSelected
                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } border`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const currentLoading = searchQuery ? searchLoading : loading;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Discover Communities</h1>
          <p className="text-gray-600 mt-1">
            Find and join communities that match your interests
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => handleViewModeChange('grid')}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'grid'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Grid
          </button>
          <button
            onClick={() => handleViewModeChange('list')}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            List
          </button>
        </div>
      </div>

      {/* Search */}
      {showSearch && (
        <CommunitySearch
          onSearchChange={handleSearchChange}
          placeholder="Search communities by name, description, or category..."
        />
      )}

      {/* Featured Communities */}
      <FeaturedSection />

      {/* Category Quick Filters */}
      {!searchQuery && <CategoryFilters />}

      {/* Main Content */}
      <div className={`${showFilters ? 'lg:grid lg:grid-cols-4 lg:gap-8' : ''}`}>
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <CommunityFiltersPanel
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
                isLoading={currentLoading}
              />
            </div>
          </div>
        )}

        {/* Communities Display */}
        <div className={showFilters ? 'lg:col-span-3' : ''}>
          {/* Results Header */}
          {(searchQuery || displayedCommunities.length > 0) && (
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-gray-600">
                {searchQuery ? (
                  <>
                    <span className="font-medium">{displayedCommunities.length}</span> communities found
                    {searchQuery && (
                      <span> for "<span className="font-medium">{searchQuery}</span>"</span>
                    )}
                  </>
                ) : (
                  <>
                    Showing <span className="font-medium">{displayedCommunities.length}</span> communities
                  </>
                )}
              </div>

              {/* Refresh Button */}
              <button
                onClick={refresh}
                disabled={currentLoading}
                className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <svg className={`w-4 h-4 mr-1 ${currentLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          )}

          {/* Communities Grid/List */}
          {viewMode === 'grid' ? (
            <CommunityGrid
              communities={displayedCommunities}
              loading={currentLoading}
              error={error}
              showLoadMore={hasNextPage && !searchQuery}
              onLoadMore={handleLoadMore}
              loadMoreLoading={loading}
              emptyMessage={searchQuery ? "No communities match your search" : "No communities found"}
              emptyDescription={searchQuery 
                ? "Try adjusting your search terms or filters" 
                : "Communities will appear here as they become available"}
            />
          ) : (
            <CommunityList
              communities={displayedCommunities}
              loading={currentLoading}
              error={error}
              showLoadMore={hasNextPage && !searchQuery}
              onLoadMore={handleLoadMore}
              loadMoreLoading={loading}
              emptyMessage={searchQuery ? "No communities match your search" : "No communities found"}
              emptyDescription={searchQuery 
                ? "Try adjusting your search terms or filters" 
                : "Communities will appear here as they become available"}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityBrowser; 