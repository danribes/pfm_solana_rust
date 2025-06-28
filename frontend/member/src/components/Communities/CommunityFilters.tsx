import React, { useState } from 'react';
import { CommunityFilters as FilterType, CommunityCategory, CommunitySortBy } from '../../types/community';
import { getCategoryIcon, getCategoryColor } from '../../utils/community';

interface CommunityFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  onClearFilters: () => void;
  isLoading?: boolean;
  className?: string;
}

const CommunityFilters: React.FC<CommunityFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  isLoading = false,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof FilterType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const categories = Object.values(CommunityCategory);
  const sortOptions = [
    { value: CommunitySortBy.CREATED_AT, label: 'Newest First' },
    { value: CommunitySortBy.UPDATED_AT, label: 'Recently Updated' },
    { value: CommunitySortBy.NAME, label: 'Name A-Z' },
    { value: CommunitySortBy.MEMBER_COUNT, label: 'Most Members' },
    { value: CommunitySortBy.RATING, label: 'Highest Rated' },
    { value: CommunitySortBy.ACTIVITY, label: 'Most Active' },
    { value: CommunitySortBy.GROWTH, label: 'Fastest Growing' },
    { value: CommunitySortBy.ENGAGEMENT, label: 'Most Engaging' }
  ];

  const hasActiveFilters = () => {
    return filters.category ||
           filters.featured ||
           filters.verified ||
           filters.member_count_min !== undefined ||
           filters.member_count_max !== undefined ||
           filters.rating_min !== undefined ||
           filters.has_active_votes ||
           filters.require_approval !== undefined;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Filter Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
            {hasActiveFilters() && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Active
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters() && (
              <button
                onClick={onClearFilters}
                disabled={isLoading}
                className="text-sm text-gray-500 hover:text-gray-700 disabled:text-gray-400"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg 
                className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Sort By - Always visible */}
      <div className="p-4 border-b border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sort By
        </label>
        <select
          value={filters.sort_by || CommunitySortBy.CREATED_AT}
          onChange={(e) => updateFilter('sort_by', e.target.value as CommunitySortBy)}
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Expandable Filters */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Categories
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(category => {
                const isSelected = filters.category === category;
                const categoryIcon = getCategoryIcon(category);
                const categoryColor = getCategoryColor(category);
                
                return (
                  <button
                    key={category}
                    onClick={() => {
                      updateFilter('category', isSelected ? undefined : category);
                    }}
                    disabled={isLoading}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-blue-100 text-blue-800 border-blue-200'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    } border disabled:opacity-50`}
                  >
                    <span className="mr-2">{categoryIcon}</span>
                    <span className="truncate">{category}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Status
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.featured || false}
                  onChange={(e) => updateFilter('featured', e.target.checked || undefined)}
                  disabled={isLoading}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">⭐ Featured communities</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.verified || false}
                  onChange={(e) => updateFilter('verified', e.target.checked || undefined)}
                  disabled={isLoading}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">✓ Verified communities</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.has_active_votes || false}
                  onChange={(e) => updateFilter('has_active_votes', e.target.checked || undefined)}
                  disabled={isLoading}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">🗳️ Has active votes</span>
              </label>
            </div>
          </div>

          {/* Member Count Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Member Count
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Minimum</label>
                <input
                  type="number"
                  value={filters.member_count_min || ''}
                  onChange={(e) => updateFilter('member_count_min', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="0"
                  min="0"
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Maximum</label>
                <input
                  type="number"
                  value={filters.member_count_max || ''}
                  onChange={(e) => updateFilter('member_count_max', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="∞"
                  min="0"
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Minimum Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Rating
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={filters.rating_min || 0}
                onChange={(e) => updateFilter('rating_min', parseFloat(e.target.value) || undefined)}
                disabled={isLoading}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
              />
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(filters.rating_min || 0) ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-1 text-sm text-gray-600">
                  {filters.rating_min ? filters.rating_min.toFixed(1) : '0.0'}+
                </span>
              </div>
            </div>
          </div>

          {/* Membership Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Membership
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="membershipType"
                  checked={filters.require_approval === undefined}
                  onChange={() => updateFilter('require_approval', undefined)}
                  disabled={isLoading}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">All communities</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  name="membershipType"
                  checked={filters.require_approval === false}
                  onChange={() => updateFilter('require_approval', false)}
                  disabled={isLoading}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">🚪 Open (no approval needed)</span>
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  name="membershipType"
                  checked={filters.require_approval === true}
                  onChange={() => updateFilter('require_approval', true)}
                  disabled={isLoading}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">🔒 Requires approval</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityFilters; 