// Task 7.1.2: Community Discovery & Browse Interface
// Search Interface component for community search functionality

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Filter,
  Loader2,
  Clock,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { SearchInterfaceProps } from '@/types/communityDiscovery';
import { getSearchSuggestions, getPopularSearchTerms } from '@/services/communityDiscovery';
import { useSearchHistory } from '@/hooks/useCommunitySearch';

const SearchInterface: React.FC<SearchInterfaceProps> = ({
  query,
  onQueryChange,
  onSearch,
  placeholder = "Search communities...",
  showFilters = true,
  onToggleFilters,
  loading = false
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [popularTerms, setPopularTerms] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const { searchHistory, addToHistory, removeFromHistory } = useSearchHistory();

  // Load popular search terms on mount
  useEffect(() => {
    const loadPopularTerms = async () => {
      try {
        const terms = await getPopularSearchTerms();
        setPopularTerms(terms.slice(0, 5));
      } catch (error) {
        console.error('Failed to load popular search terms:', error);
      }
    };

    loadPopularTerms();
  }, []);

  // Debounced search suggestions
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const results = await getSearchSuggestions(searchQuery);
      setSuggestions(results.slice(0, 6));
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onQueryChange(value);
    setSelectedSuggestionIndex(-1);

    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout for suggestions
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  // Handle search submission
  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    
    if (finalQuery.trim()) {
      addToHistory(finalQuery.trim());
      onSearch();
      setIsFocused(false);
      setSuggestions([]);
      setSelectedSuggestionIndex(-1);
      inputRef.current?.blur();
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    onQueryChange(suggestion);
    handleSearch(suggestion);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allSuggestions = [
      ...suggestions,
      ...searchHistory.filter(item => 
        item.toLowerCase().includes(query.toLowerCase()) && 
        !suggestions.includes(item)
      ).slice(0, 3)
    ];

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && allSuggestions[selectedSuggestionIndex]) {
          handleSuggestionSelect(allSuggestions[selectedSuggestionIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < allSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : allSuggestions.length - 1
        );
        break;
      case 'Escape':
        setIsFocused(false);
        setSuggestions([]);
        setSelectedSuggestionIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle clear search
  const handleClear = () => {
    onQueryChange('');
    setSuggestions([]);
    setSelectedSuggestionIndex(-1);
    inputRef.current?.focus();
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsFocused(false);
        setSuggestions([]);
        setSelectedSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const filteredHistory = searchHistory.filter(item => 
    item.toLowerCase().includes(query.toLowerCase()) && 
    !suggestions.includes(item)
  ).slice(0, 3);

  const showSuggestions = isFocused && (suggestions.length > 0 || filteredHistory.length > 0 || popularTerms.length > 0);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <div className={`relative flex items-center bg-white rounded-xl border-2 transition-all duration-200 ${
        isFocused ? 'border-blue-500 shadow-lg' : 'border-gray-200 shadow-sm hover:border-gray-300'
      }`}>
        <div className="absolute left-4 flex items-center pointer-events-none">
          {loading ? (
            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-gray-400" />
          )}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          className="w-full pl-12 pr-20 py-4 text-gray-900 placeholder-gray-500 border-0 rounded-xl focus:outline-none focus:ring-0"
          disabled={loading}
        />

        <div className="absolute right-2 flex items-center space-x-2">
          {query && (
            <button
              onClick={handleClear}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          {showFilters && onToggleFilters && (
            <button
              onClick={onToggleFilters}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
            >
              <Filter className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Search
          </button>
        </div>
      </div>

      {/* Search Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto"
          >
            {/* Loading State */}
            {loadingSuggestions && (
              <div className="px-4 py-3 flex items-center space-x-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading suggestions...</span>
              </div>
            )}

            {/* Search Suggestions */}
            {suggestions.length > 0 && (
              <div>
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Suggestions
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={`suggestion-${index}`}
                    onClick={() => handleSuggestionSelect(suggestion)}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3 ${
                      selectedSuggestionIndex === index ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    <Search className="h-4 w-4 text-gray-400" />
                    <span>{suggestion}</span>
                    <ArrowRight className="h-3 w-3 text-gray-400 ml-auto" />
                  </button>
                ))}
              </div>
            )}

            {/* Search History */}
            {filteredHistory.length > 0 && (
              <div>
                {suggestions.length > 0 && <div className="border-t border-gray-100 my-2" />}
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Recent Searches
                </div>
                {filteredHistory.map((item, index) => (
                  <div
                    key={`history-${index}`}
                    className={`flex items-center justify-between group ${
                      selectedSuggestionIndex === suggestions.length + index ? 'bg-blue-50' : ''
                    }`}
                  >
                    <button
                      onClick={() => handleSuggestionSelect(item)}
                      className="flex-1 px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3 text-gray-700"
                    >
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{item}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromHistory(item);
                      }}
                      className="px-2 py-2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Popular Terms */}
            {popularTerms.length > 0 && !query && (
              <div>
                {(suggestions.length > 0 || filteredHistory.length > 0) && (
                  <div className="border-t border-gray-100 my-2" />
                )}
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Popular Searches
                </div>
                {popularTerms.map((term, index) => (
                  <button
                    key={`popular-${index}`}
                    onClick={() => handleSuggestionSelect(term)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3 text-gray-700"
                  >
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loadingSuggestions && suggestions.length === 0 && filteredHistory.length === 0 && query && (
              <div className="px-4 py-6 text-center text-gray-500">
                <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No suggestions found for "{query}"</p>
                <p className="text-sm text-gray-400 mt-1">Press Enter to search anyway</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchInterface; 