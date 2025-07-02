// Task 7.2.3: User Profile Creation & Management
// Interests selection step for profile wizard

'use client';

import React, { useState, useEffect } from 'react';
import { InterestTag, INTEREST_CATEGORIES } from '../../../shared/types/profile';

interface InterestsStepProps {
  stepData: any;
  onUpdateStep: (step: string, data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSkip?: () => void;
  isLoading?: boolean;
  errors?: Record<string, string>;
}

export default function InterestsStep({
  stepData,
  onUpdateStep,
  onNext,
  onPrevious,
  onSkip,
  isLoading,
  errors
}: InterestsStepProps) {
  const [selectedInterests, setSelectedInterests] = useState<InterestTag[]>(stepData.interests || []);
  const [customInterest, setCustomInterest] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Technology');

  // Predefined interests by category
  const predefinedInterests: Record<string, string[]> = {
    Technology: [
      'Blockchain', 'Cryptocurrency', 'Web3', 'DeFi', 'NFTs', 'Smart Contracts',
      'AI/ML', 'Software Development', 'Cybersecurity', 'Cloud Computing',
      'DevOps', 'Mobile Development', 'Data Science', 'IoT'
    ],
    Finance: [
      'Decentralized Finance', 'Trading', 'Investment', 'Personal Finance',
      'Real Estate', 'Fintech', 'Banking', 'Insurance', 'Wealth Management'
    ],
    Arts: [
      'Digital Art', 'NFT Art', 'Photography', 'Music', 'Design', 'Creative Writing',
      'Film & Video', 'Theater', 'Painting', 'Sculpture', 'Animation'
    ],
    Gaming: [
      'GameFi', 'Play-to-Earn', 'Esports', 'Game Development', 'Streaming',
      'Virtual Reality', 'Augmented Reality', 'Mobile Gaming', 'Console Gaming'
    ],
    Business: [
      'Entrepreneurship', 'Startups', 'Marketing', 'Sales', 'Leadership',
      'Project Management', 'Consulting', 'E-commerce', 'Remote Work'
    ],
    Education: [
      'Online Learning', 'EdTech', 'Teaching', 'Research', 'Academic Writing',
      'Skill Development', 'Mentorship', 'Training'
    ],
    Health: [
      'Mental Health', 'Fitness', 'Nutrition', 'Wellness', 'Meditation',
      'Healthcare Technology', 'Biohacking', 'Longevity'
    ],
    Community: [
      'Community Building', 'Social Impact', 'Volunteering', 'Non-profit',
      'Local Communities', 'Governance', 'DAO Participation', 'Activism'
    ],
    Environment: [
      'Climate Change', 'Sustainability', 'Green Technology', 'Renewable Energy',
      'Conservation', 'Environmental Policy', 'Carbon Credits'
    ],
    Science: [
      'Research', 'Biotechnology', 'Space', 'Physics', 'Chemistry',
      'Biology', 'Mathematics', 'Engineering'
    ]
  };

  // Update parent component when interests change
  useEffect(() => {
    onUpdateStep('interests', selectedInterests);
  }, [selectedInterests, onUpdateStep]);

  const handleInterestToggle = (interestName: string, category: string) => {
    const existingIndex = selectedInterests.findIndex(interest => interest.name === interestName);
    
    if (existingIndex >= 0) {
      // Remove interest
      setSelectedInterests(prev => prev.filter((_, index) => index !== existingIndex));
    } else {
      // Add interest
      const newInterest: InterestTag = {
        id: `${category.toLowerCase()}-${interestName.toLowerCase().replace(/\s+/g, '-')}`,
        name: interestName,
        category,
        weight: 5, // Default weight
        isPublic: true,
        addedAt: new Date().toISOString()
      };
      setSelectedInterests(prev => [...prev, newInterest]);
    }
  };

  const handleCustomInterestAdd = () => {
    if (!customInterest.trim()) return;
    
    const newInterest: InterestTag = {
      id: `custom-${Date.now()}`,
      name: customInterest.trim(),
      category: 'Other',
      weight: 7, // Higher weight for custom interests
      isPublic: true,
      addedAt: new Date().toISOString()
    };
    
    setSelectedInterests(prev => [...prev, newInterest]);
    setCustomInterest('');
  };

  const handleRemoveInterest = (interestId: string) => {
    setSelectedInterests(prev => prev.filter(interest => interest.id !== interestId));
  };

  const isInterestSelected = (interestName: string) => {
    return selectedInterests.some(interest => interest.name === interestName);
  };

  const canProceed = selectedInterests.length >= 1;

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">What interests you?</h2>
        <p className="text-lg text-gray-600 mt-2">
          Select topics you're passionate about to find relevant communities and connect with like-minded people.
        </p>
      </div>

      {/* Selected Interests Display */}
      {selectedInterests.length > 0 && (
        <div className="mb-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-3">
            Selected Interests ({selectedInterests.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedInterests.map((interest) => (
              <span
                key={interest.id}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {interest.name}
                <button
                  onClick={() => handleRemoveInterest(interest.id)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {Object.keys(predefinedInterests).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeCategory === category
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Interest Selection */}
      <div className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {predefinedInterests[activeCategory]?.map((interest) => (
            <button
              key={interest}
              onClick={() => handleInterestToggle(interest, activeCategory)}
              className={`p-3 text-sm font-medium rounded-lg border transition-colors ${
                isInterestSelected(interest)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Interest Input */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Add Custom Interest
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={customInterest}
            onChange={(e) => setCustomInterest(e.target.value)}
            placeholder="Type your interest here..."
            className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCustomInterestAdd();
              }
            }}
          />
          <button
            onClick={handleCustomInterestAdd}
            disabled={!customInterest.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Don't see your interest listed? Add it here to help us improve our suggestions.
        </p>
      </div>

      {/* Tips */}
      <div className="mb-8 p-4 bg-yellow-50 rounded-lg">
        <h4 className="text-sm font-medium text-yellow-900 mb-2">💡 Tips for selecting interests:</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Choose at least 3-5 interests for better community matching</li>
          <li>• Select both broad and specific topics you're passionate about</li>
          <li>• Include emerging interests you want to learn about</li>
          <li>• Your interests help us recommend relevant communities and content</li>
        </ul>
      </div>

      {/* Validation Message */}
      {selectedInterests.length === 0 && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">
            Please select at least one interest to continue.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t">
        <button
          onClick={onPrevious}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Previous
        </button>
        
        <div className="flex space-x-3">
          {onSkip && (
            <button
              onClick={onSkip}
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              Skip for now
            </button>
          )}
          
          <button
            onClick={onNext}
            disabled={isLoading || !canProceed}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Saving...' : `Continue (${selectedInterests.length} selected)`}
          </button>
        </div>
      </div>
    </div>
  );
}
