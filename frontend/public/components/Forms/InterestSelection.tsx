// Task 7.1.3: Public User Registration & Wallet Connection
// Interest selection component for user preferences

'use client';

import React, { useState, useMemo } from 'react';
import { INTEREST_CATEGORIES } from '@/types/registration';

interface InterestSelectionProps {
  initialInterests?: string[];
  onSubmit: (interests: string[]) => void;
  onBack?: () => void;
  isLoading?: boolean;
  maxSelections?: number;
  minSelections?: number;
}

const InterestSelection: React.FC<InterestSelectionProps> = ({
  initialInterests = [],
  onSubmit,
  onBack,
  isLoading = false,
  maxSelections = 10,
  minSelections = 1
}) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(initialInterests);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter interests based on search and category
  const filteredCategories = useMemo(() => {
    let filtered = INTEREST_CATEGORIES;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(cat => cat.id === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.map(category => ({
        ...category,
        subcategories: category.subcategories.filter(sub =>
          sub.toLowerCase().includes(searchTerm.toLowerCase()) ||
          category.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(category => category.subcategories.length > 0);
    }

    return filtered;
  }, [selectedCategory, searchTerm]);

  // Toggle interest selection
  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(interest)) {
        return prev.filter(i => i !== interest);
      } else if (prev.length < maxSelections) {
        return [...prev, interest];
      }
      return prev;
    });
  };

  // Handle form submission
  const handleSubmit = () => {
    if (selectedInterests.length >= minSelections) {
      onSubmit(selectedInterests);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Select Your Interests
        </h2>
        <p className="text-gray-600 mb-4">
          Choose topics you're interested in to help us personalize your experience
        </p>
        <p className="text-sm text-gray-500">
          Select {minSelections}-{maxSelections} interests • {selectedInterests.length} selected
        </p>
      </div>

      {/* Search and filter */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search interests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Categories
          </button>
          {INTEREST_CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Interest categories */}
      <div className="space-y-8 mb-8">
        {filteredCategories.map(category => (
          <div key={category.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-3">{category.icon}</span>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                <p className="text-gray-600 text-sm">{category.description}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {category.subcategories.map(subcategory => {
                const isSelected = selectedInterests.includes(subcategory);
                const canSelect = !isSelected && selectedInterests.length < maxSelections;
                
                return (
                  <button
                    key={subcategory}
                    onClick={() => toggleInterest(subcategory)}
                    disabled={!isSelected && !canSelect}
                    className={`p-3 text-left rounded-lg border transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : canSelect
                        ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{subcategory}</span>
                      {isSelected && (
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Selected interests summary */}
      {selectedInterests.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h4 className="font-medium text-blue-900 mb-3">Selected Interests:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedInterests.map(interest => (
              <span
                key={interest}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {interest}
                <button
                  onClick={() => toggleInterest(interest)}
                  className="ml-2 hover:text-blue-600"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Form actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Back
          </button>
        )}
        
        <button
          onClick={handleSubmit}
          disabled={selectedInterests.length < minSelections || isLoading}
          className={`flex-1 px-6 py-2 rounded-lg font-medium transition-colors ${
            selectedInterests.length < minSelections || isLoading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            `Continue with ${selectedInterests.length} interests →`
          )}
        </button>
      </div>
    </div>
  );
};

export default InterestSelection; 