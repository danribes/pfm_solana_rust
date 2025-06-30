// Task 4.5.2: Search Interface Component
// Advanced search functionality with autocomplete and suggestions

import React, { useState, useRef, useEffect } from "react";
import { SearchSuggestion, SuggestionType } from "../../types/public";
import { useComponentAnalytics, useSearchAnalytics } from "../../hooks/useAnalytics";

// ============================================================================
// SEARCH INTERFACE COMPONENT
// ============================================================================

export interface SearchInterfaceProps {
  query: string;
  suggestions: SearchSuggestion[];
  onQueryChange: (query: string) => void;
  onSuggestionSelect: (suggestion: SearchSuggestion) => void;
  placeholder?: string;
  showHistory?: boolean;
  className?: string;
}

const SearchInterface: React.FC<SearchInterfaceProps> = ({
  query,
  suggestions,
  onQueryChange,
  onSuggestionSelect,
  placeholder = "Search communities...",
  showHistory = true,
  className = "",
}) => {
  // ========================================================================
  // HOOKS
  // ========================================================================

  const { trackClick } = useComponentAnalytics("SearchInterface");
  const { trackSearch, trackSearchClear } = useSearchAnalytics();

  // ========================================================================
  // STATE
  // ========================================================================

  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // ========================================================================
  // REFS
  // ========================================================================

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // ========================================================================
  // EFFECTS
  // ========================================================================

  useEffect(() => {
    // Load search history from localStorage
    const savedHistory = localStorage.getItem("community_search_history");
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.warn("Failed to parse search history:", error);
      }
    }
  }, []);

  useEffect(() => {
    setShowSuggestions(isFocused && (suggestions.length > 0 || (showHistory && searchHistory.length > 0 && query.length === 0)));
  }, [isFocused, suggestions.length, showHistory, searchHistory.length, query.length]);

  useEffect(() => {
    setActiveSuggestionIndex(-1);
  }, [suggestions]);

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = event.target.value;
    onQueryChange(newQuery);
    setActiveSuggestionIndex(-1);
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    trackClick("search_focus");
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicks
    setTimeout(() => {
      setIsFocused(false);
      setActiveSuggestionIndex(-1);
    }, 150);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const visibleSuggestions = getVisibleSuggestions();

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveSuggestionIndex(prev => 
          prev < visibleSuggestions.length - 1 ? prev + 1 : 0
        );
        break;

      case "ArrowUp":
        event.preventDefault();
        setActiveSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : visibleSuggestions.length - 1
        );
        break;

      case "Enter":
        event.preventDefault();
        if (activeSuggestionIndex >= 0 && activeSuggestionIndex < visibleSuggestions.length) {
          const selectedSuggestion = visibleSuggestions[activeSuggestionIndex];
          if (selectedSuggestion) {
            handleSuggestionSelect(selectedSuggestion);
          }
        } else if (query.trim()) {
          handleSearch(query.trim());
        }
        break;

      case "Escape":
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestion | { text: string; type?: SuggestionType }) => {
    const searchQuery = suggestion.text;
    onQueryChange(searchQuery);
    
    if ("type" in suggestion && suggestion.type) {
      onSuggestionSelect(suggestion as SearchSuggestion);
    }
    
    handleSearch(searchQuery);
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
    inputRef.current?.blur();

    trackClick("suggestion_select", {
      suggestionText: suggestion.text,
      suggestionType: "type" in suggestion ? suggestion.type : "history",
    });
  };

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      // Add to search history
      const newHistory = [
        searchQuery,
        ...searchHistory.filter(h => h !== searchQuery)
      ].slice(0, 10);
      
      setSearchHistory(newHistory);
      localStorage.setItem("community_search_history", JSON.stringify(newHistory));

      trackSearch(searchQuery, suggestions.length);
    }
  };

  const handleClearSearch = () => {
    const previousQuery = query;
    onQueryChange("");
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
    inputRef.current?.focus();

    if (previousQuery) {
      trackSearchClear(previousQuery, Date.now());
    }
    
    trackClick("search_clear");
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("community_search_history");
    trackClick("search_history_clear");
  };

  // ========================================================================
  // RENDER HELPERS
  // ========================================================================

  const getVisibleSuggestions = () => {
    const items: (SearchSuggestion | { text: string; type?: SuggestionType })[] = [];
    
    if (query.length === 0 && showHistory && searchHistory.length > 0) {
      items.push(...searchHistory.slice(0, 5).map(text => ({ text })));
    }
    
    if (suggestions.length > 0) {
      items.push(...suggestions);
    }
    
    return items;
  };

  const renderSuggestionIcon = (suggestion: SearchSuggestion | { text: string; type?: SuggestionType }) => {
    if (!("type" in suggestion) || !suggestion.type) {
      return <span className="text-gray-400">⏱️</span>; // History icon
    }

    const iconMap = {
      [SuggestionType.COMMUNITY]: "👥",
      [SuggestionType.CATEGORY]: "📁",
      [SuggestionType.TAG]: "🏷️",
      [SuggestionType.SEARCH_TERM]: "🔍",
    };

    return <span className="text-gray-400">{iconMap[suggestion.type] || "🔍"}</span>;
  };

  const renderSuggestion = (suggestion: SearchSuggestion | { text: string; type?: SuggestionType }, index: number) => {
    const isActive = index === activeSuggestionIndex;
    const isHistory = !("type" in suggestion) || !suggestion.type;

    return (
      <div
        key={`${suggestion.text}-${index}`}
        className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors ${
          isActive 
            ? "bg-blue-50 dark:bg-blue-900/50" 
            : "hover:bg-gray-50 dark:hover:bg-gray-700"
        }`}
        onClick={() => handleSuggestionSelect(suggestion)}
        role="option"
        aria-selected={isActive}
      >
        {renderSuggestionIcon(suggestion)}
        <span className="flex-1 text-sm text-gray-900 dark:text-white">
          {suggestion.text}
        </span>
        {"count" in suggestion && suggestion.count !== undefined && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {suggestion.count} results
          </span>
        )}
        {isHistory && (
          <span className="text-xs text-gray-400">
            Recent
          </span>
        )}
      </div>
    );
  };

  const renderSuggestions = () => {
    if (!showSuggestions) return null;

    const visibleSuggestions = getVisibleSuggestions();
    
    if (visibleSuggestions.length === 0) return null;

    return (
      <div
        ref={suggestionsRef}
        className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
        role="listbox"
      >
        {query.length === 0 && searchHistory.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">Recent searches</span>
            <button
              onClick={handleClearHistory}
              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Clear all
            </button>
          </div>
        )}
        
        {visibleSuggestions.map(renderSuggestion)}
        
        {suggestions.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
            Use ↑↓ to navigate, Enter to select, Esc to close
          </div>
        )}
      </div>
    );
  };

  // ========================================================================
  // MAIN RENDER
  // ========================================================================

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-400 text-lg">��</span>
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          aria-label="Search communities"
          aria-expanded={showSuggestions}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          role="combobox"
        />
        
        {query && (
          <button
            onClick={handleClearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Clear search"
          >
            <span className="text-lg">✕</span>
          </button>
        )}
      </div>
      
      {renderSuggestions()}
    </div>
  );
};

export default SearchInterface;
