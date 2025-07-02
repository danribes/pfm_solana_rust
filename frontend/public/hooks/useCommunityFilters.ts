// Task 7.1.2: Community Discovery & Browse Interface
// Hook for community filtering functionality

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  CommunityFilters,
  CommunityCategory,
  CommunityType,
  FilterMetadata,
  UseCommunityFiltersResult,
  COMMUNITY_CATEGORIES,
  COMMUNITY_TYPES
} from '@/types/communityDiscovery';

interface UseCommunityFiltersOptions {
  initialFilters?: Partial<CommunityFilters>;
  persistToUrl?: boolean;
  persistToStorage?: boolean;
  storageKey?: string;
  onFiltersChange?: (filters: CommunityFilters) => void;
}

const DEFAULT_FILTERS: CommunityFilters = {
  categories: [],
  types: [],
  memberCountRange: [1, 10000],
  activityLevels: [],
  locations: [],
  languages: [],
  tags: [],
  isVerified: null,
  joinRequirements: []
};

export const useCommunityFilters = (
  options: UseCommunityFiltersOptions = {}
): UseCommunityFiltersResult => {
  const {
    initialFilters = {},
    persistToUrl = false,
    persistToStorage = false,
    storageKey = 'communityFilters',
    onFiltersChange
  } = options;

  // Initialize filters state
  const [filters, setFilters] = useState<CommunityFilters>(() => {
    let defaultFilters = { ...DEFAULT_FILTERS };

    // Load from localStorage if enabled
    if (persistToStorage && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsedFilters = JSON.parse(saved);
          defaultFilters = { ...defaultFilters, ...parsedFilters };
        }
      } catch (error) {
        console.error('Failed to load filters from storage:', error);
      }
    }

    // Load from URL if enabled
    if (persistToUrl && typeof window !== 'undefined') {
      const urlFilters = parseFiltersFromUrl();
      defaultFilters = { ...defaultFilters, ...urlFilters };
    }

    // Apply initial filters
    return { ...defaultFilters, ...initialFilters };
  });

  // Parse filters from URL search params
  const parseFiltersFromUrl = useCallback((): Partial<CommunityFilters> => {
    if (typeof window === 'undefined') return {};

    const params = new URLSearchParams(window.location.search);
    const urlFilters: Partial<CommunityFilters> = {};

    // Parse categories
    const categories = params.getAll('category') as CommunityCategory[];
    if (categories.length > 0) urlFilters.categories = categories;

    // Parse types
    const types = params.getAll('type') as CommunityType[];
    if (types.length > 0) urlFilters.types = types;

    // Parse member count range
    const minMembers = params.get('minMembers');
    const maxMembers = params.get('maxMembers');
    if (minMembers && maxMembers) {
      urlFilters.memberCountRange = [parseInt(minMembers), parseInt(maxMembers)];
    }

    // Parse activity levels
    const activityLevels = params.getAll('activityLevel');
    if (activityLevels.length > 0) urlFilters.activityLevels = activityLevels;

    // Parse locations
    const locations = params.getAll('location');
    if (locations.length > 0) urlFilters.locations = locations;

    // Parse languages
    const languages = params.getAll('language');
    if (languages.length > 0) urlFilters.languages = languages;

    // Parse tags
    const tags = params.getAll('tag');
    if (tags.length > 0) urlFilters.tags = tags;

    // Parse verified status
    const isVerified = params.get('verified');
    if (isVerified === 'true') urlFilters.isVerified = true;
    else if (isVerified === 'false') urlFilters.isVerified = false;

    // Parse join requirements
    const joinRequirements = params.getAll('joinRequirement');
    if (joinRequirements.length > 0) urlFilters.joinRequirements = joinRequirements;

    return urlFilters;
  }, []);

  // Update URL with current filters
  const updateUrlWithFilters = useCallback((newFilters: CommunityFilters) => {
    if (!persistToUrl || typeof window === 'undefined') return;

    const params = new URLSearchParams();

    // Add categories
    newFilters.categories.forEach(category => {
      params.append('category', category);
    });

    // Add types
    newFilters.types.forEach(type => {
      params.append('type', type);
    });

    // Add member count range
    if (newFilters.memberCountRange[0] !== DEFAULT_FILTERS.memberCountRange[0] ||
        newFilters.memberCountRange[1] !== DEFAULT_FILTERS.memberCountRange[1]) {
      params.set('minMembers', newFilters.memberCountRange[0].toString());
      params.set('maxMembers', newFilters.memberCountRange[1].toString());
    }

    // Add activity levels
    newFilters.activityLevels.forEach(level => {
      params.append('activityLevel', level);
    });

    // Add locations
    newFilters.locations.forEach(location => {
      params.append('location', location);
    });

    // Add languages
    newFilters.languages.forEach(language => {
      params.append('language', language);
    });

    // Add tags
    newFilters.tags.forEach(tag => {
      params.append('tag', tag);
    });

    // Add verified status
    if (newFilters.isVerified !== null) {
      params.set('verified', newFilters.isVerified.toString());
    }

    // Add join requirements
    newFilters.joinRequirements.forEach(requirement => {
      params.append('joinRequirement', requirement);
    });

    // Update URL without refreshing page
    const newUrl = params.toString() 
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    
    window.history.replaceState({}, '', newUrl);
  }, [persistToUrl]);

  // Save filters to localStorage
  const saveFiltersToStorage = useCallback((newFilters: CommunityFilters) => {
    if (!persistToStorage || typeof window === 'undefined') return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(newFilters));
    } catch (error) {
      console.error('Failed to save filters to storage:', error);
    }
  }, [persistToStorage, storageKey]);

  // Update a specific filter
  const updateFilter = useCallback(<K extends keyof CommunityFilters>(
    key: K,
    value: CommunityFilters[K]
  ) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      
      // Persist changes
      updateUrlWithFilters(newFilters);
      saveFiltersToStorage(newFilters);
      
      // Call onChange callback
      if (onFiltersChange) {
        onFiltersChange(newFilters);
      }
      
      return newFilters;
    });
  }, [updateUrlWithFilters, saveFiltersToStorage, onFiltersChange]);

  // Toggle category filter
  const toggleCategory = useCallback((category: CommunityCategory) => {
    updateFilter('categories', 
      filters.categories.includes(category)
        ? filters.categories.filter(c => c !== category)
        : [...filters.categories, category]
    );
  }, [filters.categories, updateFilter]);

  // Toggle type filter
  const toggleType = useCallback((type: CommunityType) => {
    updateFilter('types',
      filters.types.includes(type)
        ? filters.types.filter(t => t !== type)
        : [...filters.types, type]
    );
  }, [filters.types, updateFilter]);

  // Toggle activity level filter
  const toggleActivityLevel = useCallback((level: string) => {
    updateFilter('activityLevels',
      filters.activityLevels.includes(level)
        ? filters.activityLevels.filter(l => l !== level)
        : [...filters.activityLevels, level]
    );
  }, [filters.activityLevels, updateFilter]);

  // Toggle location filter
  const toggleLocation = useCallback((location: string) => {
    updateFilter('locations',
      filters.locations.includes(location)
        ? filters.locations.filter(l => l !== location)
        : [...filters.locations, location]
    );
  }, [filters.locations, updateFilter]);

  // Toggle language filter
  const toggleLanguage = useCallback((language: string) => {
    updateFilter('languages',
      filters.languages.includes(language)
        ? filters.languages.filter(l => l !== language)
        : [...filters.languages, language]
    );
  }, [filters.languages, updateFilter]);

  // Toggle tag filter
  const toggleTag = useCallback((tag: string) => {
    updateFilter('tags',
      filters.tags.includes(tag)
        ? filters.tags.filter(t => t !== tag)
        : [...filters.tags, tag]
    );
  }, [filters.tags, updateFilter]);

  // Toggle join requirement filter
  const toggleJoinRequirement = useCallback((requirement: string) => {
    updateFilter('joinRequirements',
      filters.joinRequirements.includes(requirement)
        ? filters.joinRequirements.filter(r => r !== requirement)
        : [...filters.joinRequirements, requirement]
    );
  }, [filters.joinRequirements, updateFilter]);

  // Set member count range
  const setMemberCountRange = useCallback((range: [number, number]) => {
    updateFilter('memberCountRange', range);
  }, [updateFilter]);

  // Set verified filter
  const setVerifiedFilter = useCallback((isVerified: boolean | null) => {
    updateFilter('isVerified', isVerified);
  }, [updateFilter]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    const clearedFilters = { ...DEFAULT_FILTERS };
    setFilters(clearedFilters);
    
    // Persist changes
    updateUrlWithFilters(clearedFilters);
    saveFiltersToStorage(clearedFilters);
    
    // Call onChange callback
    if (onFiltersChange) {
      onFiltersChange(clearedFilters);
    }
  }, [updateUrlWithFilters, saveFiltersToStorage, onFiltersChange]);

  // Reset to initial filters
  const resetFilters = useCallback(() => {
    const resetFilters = { ...DEFAULT_FILTERS, ...initialFilters };
    setFilters(resetFilters);
    
    // Persist changes
    updateUrlWithFilters(resetFilters);
    saveFiltersToStorage(resetFilters);
    
    // Call onChange callback
    if (onFiltersChange) {
      onFiltersChange(resetFilters);
    }
  }, [initialFilters, updateUrlWithFilters, saveFiltersToStorage, onFiltersChange]);

  // Apply filters (useful for manual application)
  const applyFilters = useCallback(() => {
    updateUrlWithFilters(filters);
    saveFiltersToStorage(filters);
    
    if (onFiltersChange) {
      onFiltersChange(filters);
    }
  }, [filters, updateUrlWithFilters, saveFiltersToStorage, onFiltersChange]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.categories.length > 0 ||
      filters.types.length > 0 ||
      filters.memberCountRange[0] !== DEFAULT_FILTERS.memberCountRange[0] ||
      filters.memberCountRange[1] !== DEFAULT_FILTERS.memberCountRange[1] ||
      filters.activityLevels.length > 0 ||
      filters.locations.length > 0 ||
      filters.languages.length > 0 ||
      filters.tags.length > 0 ||
      filters.isVerified !== null ||
      filters.joinRequirements.length > 0
    );
  }, [filters]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    
    if (filters.categories.length > 0) count++;
    if (filters.types.length > 0) count++;
    if (filters.memberCountRange[0] !== DEFAULT_FILTERS.memberCountRange[0] ||
        filters.memberCountRange[1] !== DEFAULT_FILTERS.memberCountRange[1]) count++;
    if (filters.activityLevels.length > 0) count++;
    if (filters.locations.length > 0) count++;
    if (filters.languages.length > 0) count++;
    if (filters.tags.length > 0) count++;
    if (filters.isVerified !== null) count++;
    if (filters.joinRequirements.length > 0) count++;
    
    return count;
  }, [filters]);

  // Get filter summary for display
  const getFilterSummary = useCallback(() => {
    const summary: string[] = [];

    if (filters.categories.length > 0) {
      const categoryLabels = filters.categories.map(cat => 
        COMMUNITY_CATEGORIES.find(c => c.category === cat)?.label || cat
      );
      summary.push(`Categories: ${categoryLabels.join(', ')}`);
    }

    if (filters.types.length > 0) {
      const typeLabels = filters.types.map(type => 
        COMMUNITY_TYPES.find(t => t.type === type)?.label || type
      );
      summary.push(`Types: ${typeLabels.join(', ')}`);
    }

    if (filters.memberCountRange[0] !== DEFAULT_FILTERS.memberCountRange[0] ||
        filters.memberCountRange[1] !== DEFAULT_FILTERS.memberCountRange[1]) {
      summary.push(`Members: ${filters.memberCountRange[0]}-${filters.memberCountRange[1]}`);
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
      summary.push(`Join Requirements: ${filters.joinRequirements.join(', ')}`);
    }

    return summary;
  }, [filters]);

  // Sync filters on window popstate (back/forward navigation)
  useEffect(() => {
    if (!persistToUrl) return;

    const handlePopState = () => {
      const urlFilters = parseFiltersFromUrl();
      const newFilters = { ...DEFAULT_FILTERS, ...urlFilters };
      setFilters(newFilters);
      
      if (onFiltersChange) {
        onFiltersChange(newFilters);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [persistToUrl, parseFiltersFromUrl, onFiltersChange]);

  return {
    filters,
    updateFilter,
    clearFilters,
    applyFilters,
    resetFilters,
    hasActiveFilters,
    
    // Additional helper methods
    toggleCategory,
    toggleType,
    toggleActivityLevel,
    toggleLocation,
    toggleLanguage,
    toggleTag,
    toggleJoinRequirement,
    setMemberCountRange,
    setVerifiedFilter,
    activeFilterCount,
    getFilterSummary
  } as UseCommunityFiltersResult & {
    toggleCategory: (category: CommunityCategory) => void;
    toggleType: (type: CommunityType) => void;
    toggleActivityLevel: (level: string) => void;
    toggleLocation: (location: string) => void;
    toggleLanguage: (language: string) => void;
    toggleTag: (tag: string) => void;
    toggleJoinRequirement: (requirement: string) => void;
    setMemberCountRange: (range: [number, number]) => void;
    setVerifiedFilter: (isVerified: boolean | null) => void;
    activeFilterCount: number;
    getFilterSummary: () => string[];
  };
};

// Hook for managing filter presets
export const useFilterPresets = () => {
  const [presets, setPresets] = useState<Array<{ name: string; filters: CommunityFilters }>>([]);

  useEffect(() => {
    // Load presets from localStorage
    const saved = localStorage.getItem('communityFilterPresets');
    if (saved) {
      try {
        setPresets(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse filter presets:', error);
      }
    }
  }, []);

  const savePreset = useCallback((name: string, filters: CommunityFilters) => {
    setPresets(prev => {
      const filtered = prev.filter(preset => preset.name !== name);
      const newPresets = [...filtered, { name, filters }];
      
      localStorage.setItem('communityFilterPresets', JSON.stringify(newPresets));
      return newPresets;
    });
  }, []);

  const deletePreset = useCallback((name: string) => {
    setPresets(prev => {
      const newPresets = prev.filter(preset => preset.name !== name);
      localStorage.setItem('communityFilterPresets', JSON.stringify(newPresets));
      return newPresets;
    });
  }, []);

  const clearPresets = useCallback(() => {
    setPresets([]);
    localStorage.removeItem('communityFilterPresets');
  }, []);

  return {
    presets,
    savePreset,
    deletePreset,
    clearPresets
  };
};

export default useCommunityFilters; 