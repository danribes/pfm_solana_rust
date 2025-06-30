'use client';

import React, { useState, useEffect } from 'react';
import { UserGroupIcon, MagnifyingGlassIcon, CheckIcon } from '@heroicons/react/24/outline';
import { RegistrationData, CommunityOption } from '../../types/profile';

interface CommunitySelectionProps {
  registrationData: RegistrationData;
  updateRegistrationData: (data: Partial<RegistrationData>) => void;
}

const CommunitySelection: React.FC<CommunitySelectionProps> = ({
  registrationData,
  updateRegistrationData
}) => {
  const [communities, setCommunities] = useState<CommunityOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Mock communities data - in real app, this would come from API
  useEffect(() => {
    const fetchCommunities = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockCommunities: CommunityOption[] = [
          {
            id: '1',
            name: 'DeFi Governance',
            description: 'Participate in decentralized finance governance decisions',
            memberCount: 12500,
            isPublic: true,
            category: 'DeFi',
            icon: '🏦',
            requiresApproval: false,
            tags: ['governance', 'defi', 'voting']
          },
          {
            id: '2',
            name: 'NFT Collectors',
            description: 'Community for NFT enthusiasts and collectors',
            memberCount: 8300,
            isPublic: true,
            category: 'NFT',
            icon: '🎨',
            requiresApproval: true,
            tags: ['nft', 'art', 'collectibles']
          },
          {
            id: '3',
            name: 'Web3 Developers',
            description: 'Building the future of decentralized applications',
            memberCount: 15200,
            isPublic: true,
            category: 'Development',
            icon: '💻',
            requiresApproval: false,
            tags: ['development', 'web3', 'solana']
          },
          {
            id: '4',
            name: 'Sustainable Crypto',
            description: 'Focus on environmentally friendly blockchain solutions',
            memberCount: 3400,
            isPublic: true,
            category: 'Environment',
            icon: '🌱',
            requiresApproval: true,
            tags: ['sustainability', 'environment', 'green']
          },
          {
            id: '5',
            name: 'Gaming DAO',
            description: 'Decentralized gaming community and governance',
            memberCount: 9800,
            isPublic: true,
            category: 'Gaming',
            icon: '🎮',
            requiresApproval: false,
            tags: ['gaming', 'dao', 'entertainment']
          },
          {
            id: '6',
            name: 'Investment Club',
            description: 'Private community for serious crypto investors',
            memberCount: 450,
            isPublic: false,
            category: 'Investment',
            icon: '��',
            requiresApproval: true,
            tags: ['investment', 'private', 'trading']
          }
        ];
        
        setCommunities(mockCommunities);
      } catch (error) {
        console.error('Failed to fetch communities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  const categories = ['all', 'DeFi', 'NFT', 'Development', 'Environment', 'Gaming', 'Investment'];

  const filteredCommunities = communities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         community.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         community.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || community.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleCommunityToggle = (communityId: string) => {
    const isSelected = registrationData.selectedCommunities.includes(communityId);
    const updatedCommunities = isSelected
      ? registrationData.selectedCommunities.filter(id => id !== communityId)
      : [...registrationData.selectedCommunities, communityId];
    
    updateRegistrationData({ selectedCommunities: updatedCommunities });
  };

  const selectedCommunitiesData = communities.filter(community => 
    registrationData.selectedCommunities.includes(community.id)
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <UserGroupIcon className="mx-auto h-12 w-12 text-blue-600" />
        <h2 className="mt-4 text-2xl font-bold text-gray-900">Join Communities</h2>
        <p className="mt-2 text-gray-600">
          Select communities you're interested in joining. You can always join more later.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search communities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`
                px-3 py-1 text-sm rounded-full transition-colors
                ${selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {category === 'all' ? 'All Categories' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Communities Summary */}
      {registrationData.selectedCommunities.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-900 mb-2">
            Selected Communities ({registrationData.selectedCommunities.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedCommunitiesData.map(community => (
              <span
                key={community.id}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
              >
                <span className="mr-1">{community.icon}</span>
                {community.name}
                {community.requiresApproval && (
                  <span className="ml-1 text-green-600">*</span>
                )}
              </span>
            ))}
          </div>
          <p className="text-xs text-green-700 mt-2">
            * Communities marked with * require approval to join
          </p>
        </div>
      )}

      {/* Communities Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-32"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCommunities.map(community => {
            const isSelected = registrationData.selectedCommunities.includes(community.id);
            
            return (
              <div
                key={community.id}
                onClick={() => handleCommunityToggle(community.id)}
                className={`
                  relative p-4 border rounded-lg cursor-pointer transition-all duration-200
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                    : 'border-gray-300 bg-white hover:border-gray-400 hover:shadow-md'
                  }
                `}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <CheckIcon className="h-5 w-5 text-blue-600" />
                  </div>
                )}
                
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{community.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {community.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {community.description}
                    </p>
                    
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {community.memberCount.toLocaleString()} members
                      </span>
                      
                      <div className="flex items-center space-x-1">
                        {!community.isPublic && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            Private
                          </span>
                        )}
                        {community.requiresApproval && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            Approval Required
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-2 flex flex-wrap gap-1">
                      {community.tags.slice(0, 2).map(tag => (
                        <span
                          key={tag}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredCommunities.length === 0 && !loading && (
        <div className="text-center py-8">
          <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No communities found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search terms or filters
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-900">About Communities</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Each community has its own governance and voting system</li>
                <li>You can participate in proposals and discussions</li>
                <li>Some communities require approval before joining</li>
                <li>You can leave or join additional communities anytime</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunitySelection;
