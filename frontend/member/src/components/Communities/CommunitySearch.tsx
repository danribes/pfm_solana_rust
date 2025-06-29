import React, { useState, useEffect } from 'react';
import { useCommunitySearch } from '../../hooks/useCommunities';
import { CommunityCategory } from '../../types/community';
import { getCategoryIcon } from '../../utils/community';

interface CommunitySearchProps {
  onSearchChange: (query: string) => void;
  placeholder?: string;
  className?: string;
}

const CommunitySearch: React.FC<CommunitySearchProps> = ({
  onSearchChange,
  placeholder = "Search communities...",
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const { 
    searchResults, 
    searchLoading, 
    searchMetadata,
    debouncedSearch 
  } = useCommunitySearch();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery, onSearchChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(value.length > 0);
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    if (searchQuery.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    onSearchChange(suggestion);
  };

  const handleClear = () => {
    setSearchQuery('');
    setShowSuggestions(false);
    onSearchChange('');
  };

  const categoryOptions = Object.values(CommunityCategory).map(category => ({
    value: category,
    label: category,
    icon: getCategoryIcon(category)
  }));

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
        
        {/* Loading spinner or clear button */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {searchLoading ? (
            <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : searchQuery && (
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && isFocused && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {/* Quick category filters */}
          {searchQuery.length === 0 && (
            <div className="p-3 border-b border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Browse by category:</p>
              <div className="grid grid-cols-3 gap-2">
                {categoryOptions.slice(0, 6).map(category => (
                  <button
                    key={category.value}
                    onClick={() => handleSuggestionClick(category.value)}
                    className="flex items-center px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    <span className="mr-1">{category.icon}</span>
                    <span className="truncate">{category.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search suggestions */}
          {searchMetadata?.suggestions && searchMetadata.suggestions.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Suggestions:</p>
              <div className="space-y-1">
                {searchMetadata.suggestions.slice(0, 5).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="block w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent communities or quick results */}
          {searchResults && searchResults.length > 0 && (
            <div className="p-3">
              <p className="text-xs text-gray-500 mb-2">
                {searchQuery ? 'Quick results:' : 'Popular communities:'}
              </p>
              <div className="space-y-2">
                {searchResults.slice(0, 3).map(community => (
                  <button
                    key={community.id}
                    onClick={() => window.location.href = `/communities/${community.id}`}
                    className="flex items-center w-full p-2 text-left hover:bg-gray-50 rounded-md"
                  >
                    <span className="text-lg mr-3">{getCategoryIcon(community.category)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {community.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {community.member_count} members
                      </p>
                    </div>
                    {community.featured && (
                      <span className="text-yellow-400 text-sm">⭐</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search metadata */}
          {searchMetadata && searchQuery && (
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                {searchMetadata.total_results} communities found
                {searchMetadata.search_time && (
                  <span> in {(searchMetadata.search_time * 1000).toFixed(0)}ms</span>
                )}
              </p>
            </div>
          )}

          {/* No results */}
          {searchQuery && searchResults && searchResults.length === 0 && !searchLoading && (
            <div className="p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-2 text-sm text-gray-500">No communities found</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your search terms</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommunitySearch; 