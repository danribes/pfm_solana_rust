// Task 7.1.2: Community Discovery & Browse Interface
// Community Directory component - Main directory interface

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Filter, 
  X, 
  SlidersHorizontal, 
  MapPin, 
  Users,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Community, CommunitySearchParams } from '@/types/communityDiscovery';
import { useCommunitySearch } from '@/hooks/useCommunitySearch';
import { useCommunityFilters } from '@/hooks/useCommunityFilters';
import SearchInterface from './SearchInterface';
import CommunityGrid from './CommunityGrid';
// import FilterSidebar from './FilterSidebar'; // TODO: Create FilterSidebar component

interface CommunityDirectoryProps {
  initialSearchParams?: CommunitySearchParams;
  showFilters?: boolean;
  showStats?: boolean;
  onCommunitySelect?: (community: Community) => void;
  onJoinCommunity?: (communityId: string) => void;
}

const CommunityDirectory: React.FC<CommunityDirectoryProps> = ({
  initialSearchParams = {},
  showFilters = true,
  showStats = true,
  onCommunitySelect,
  onJoinCommunity
}) => {
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearchParams.query || '');

  // Use custom hooks for search and filtering
  const {
    communities,
    totalCount,
    loading,
    error,
    metadata,
    hasMore,
    search,
    loadMore
  } = useCommunitySearch({
    initialParams: initialSearchParams,
    autoSearch: true,
    pageSize: 12
  });

  const {
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters
  } = useCommunityFilters({
    initialFilters: {
      categories: initialSearchParams.category || [],
      types: initialSearchParams.type || [],
      memberCountRange: initialSearchParams.memberCountRange || [1, 10000],
      activityLevels: initialSearchParams.activityLevel || [],
      locations: initialSearchParams.location || [],
      languages: initialSearchParams.language || [],
      tags: initialSearchParams.tags || [],
              isVerified: initialSearchParams.isVerified || null,
      joinRequirements: initialSearchParams.joinRequirement || []
    },
    persistToUrl: true,
    onFiltersChange: (newFilters) => {
      // Trigger search when filters change
      const searchParams: CommunitySearchParams = {
        query: searchQuery,
        category: newFilters.categories,
        type: newFilters.types,
        memberCountRange: newFilters.memberCountRange,
        activityLevel: newFilters.activityLevels as any,
        location: newFilters.locations,
        language: newFilters.languages,
        tags: newFilters.tags,
        isVerified: newFilters.isVerified || undefined,
        joinRequirement: newFilters.joinRequirements as any
      };
      search(searchParams);
    }
  });

  // Handle search query change
  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query);
  };

  // Handle search execution
  const handleSearch = () => {
    const searchParams: CommunitySearchParams = {
      query: searchQuery,
      category: filters.categories,
      type: filters.types,
      memberCountRange: filters.memberCountRange,
      activityLevel: filters.activityLevels as any,
      location: filters.locations,
      language: filters.languages,
      tags: filters.tags,
      isVerified: filters.isVerified || undefined,
      joinRequirement: filters.joinRequirements as any
    };
    search(searchParams);
  };

  // Handle filter sidebar toggle
  const handleToggleFilters = () => {
    setIsFilterSidebarOpen(!isFilterSidebarOpen);
  };

  // Handle clear all filters
  const handleClearAllFilters = () => {
    clearFilters();
    setSearchQuery('');
    setIsFilterSidebarOpen(false);
  };

  // Handle community selection
  const handleCommunityClick = (community: Community) => {
    if (onCommunitySelect) {
      onCommunitySelect(community);
    } else {
      // Default behavior: navigate to community page
      window.location.href = `/communities/${community.id}/preview`;
    }
  };

  // Handle join community
  const handleJoinCommunity = async (communityId: string) => {
    if (onJoinCommunity) {
      onJoinCommunity(communityId);
    } else {
      // Default behavior: navigate to join page
      window.location.href = `/communities/${communityId}/join`;
    }
  };

  // Calculate active filter count
  const activeFilterCount = [
    filters.categories.length > 0,
    filters.types.length > 0,
    filters.activityLevels.length > 0,
    filters.locations.length > 0,
    filters.languages.length > 0,
    filters.tags.length > 0,
    filters.isVerified !== null,
    filters.joinRequirements.length > 0
  ].filter(Boolean).length;

  // Generate filter summary for display
  const getFilterSummary = (): string[] => {
    const summary: string[] = [];
    
    if (filters.categories.length > 0) {
      summary.push(`Categories: ${filters.categories.join(', ')}`);
    }
    if (filters.types.length > 0) {
      summary.push(`Types: ${filters.types.join(', ')}`);
    }
    if (filters.activityLevels.length > 0) {
      summary.push(`Activity: ${filters.activityLevels.join(', ')}`);
    }
    if (filters.locations.length > 0) {
      summary.push(`Locations: ${filters.locations.join(', ')}`);
    }
    if (filters.languages.length > 0) {
      summary.push(`Languages: ${filters.languages.join(', ')}`);
    }
    if (filters.tags.length > 0) {
      summary.push(`Tags: ${filters.tags.join(', ')}`);
    }
    if (filters.isVerified !== null) {
      summary.push(`Verified: ${filters.isVerified ? 'Yes' : 'No'}`);
    }
    if (filters.joinRequirements.length > 0) {
      summary.push(`Requirements: ${filters.joinRequirements.join(', ')}`);
    }
    
    return summary;
  };

  // Stats summary
  const statsData = [
    {
      label: 'Total Communities',
      value: totalCount,
      icon: Users,
      color: 'blue'
    },
    {
      label: 'Active Filters',
      value: activeFilterCount,
      icon: Filter,
      color: activeFilterCount > 0 ? 'green' : 'gray'
    },
    {
      label: 'Results Found',
      value: communities.length,
      icon: TrendingUp,
      color: 'purple'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Discover Communities
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find and join communities that align with your interests and values. 
            Participate in democratic decision-making and help shape the future.
          </p>
        </div>

        {/* Stats */}
        {showStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {statsData.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                    <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stat.value.toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Search Interface */}
        <div className="mb-8">
          <SearchInterface
            query={searchQuery}
            onQueryChange={handleSearchQueryChange}
            onSearch={handleSearch}
            placeholder="Search communities by name, description, or tags..."
            showFilters={showFilters}
            onToggleFilters={handleToggleFilters}
            loading={loading}
          />
        </div>

        {/* Active Filters Bar */}
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900">
                  Active Filters ({activeFilterCount})
                </h3>
                <button
                  onClick={handleClearAllFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {getFilterSummary().map((filterText, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {filterText}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Content Area */}
        <div className="flex gap-8">
          {/* Filter Sidebar */}
          {showFilters && (
            <>
              {/* Desktop Sidebar */}
              <div className="hidden lg:block w-80 flex-shrink-0">
                <div className="sticky top-8">
                  {/* TODO: Implement FilterSidebar component */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
                    <p className="text-gray-600 text-sm">Filter sidebar coming soon...</p>
                  </div>
                </div>
              </div>

              {/* Mobile Sidebar Overlay */}
              {isFilterSidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                  <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsFilterSidebarOpen(false)} />
                  <div className="relative bg-white w-80 h-full overflow-y-auto">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                        <button
                          onClick={() => setIsFilterSidebarOpen(false)}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      {/* TODO: Implement FilterSidebar component */}
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
                        <p className="text-gray-600 text-sm">Filter sidebar coming soon...</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Communities Grid */}
          <div className="flex-1 min-w-0">
            <CommunityGrid
              communities={communities}
              loading={loading}
              error={error}
              variant="grid"
              showLoadMore={hasMore}
              onLoadMore={loadMore}
              onCommunityClick={handleCommunityClick}
              onJoinCommunity={handleJoinCommunity}
            />
          </div>
        </div>

        {/* Mobile Filter Button */}
        {showFilters && (
          <button
            onClick={handleToggleFilters}
            className="lg:hidden fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40"
          >
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="h-5 w-5" />
              {activeFilterCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </div>
          </button>
        )}
      </div>
    </div>
  );
};

export default CommunityDirectory; 