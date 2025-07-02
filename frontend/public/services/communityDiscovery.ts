// Task 7.1.2: Community Discovery & Browse Interface
// Community data API service for discovery and browsing functionality

import {
  Community,
  CommunitySearchParams,
  CommunitySearchResponse,
  CommunitiesResponse,
  CommunityResponse,
  CommunityLeader,
  CommunityLeadersResponse,
  VotingCampaign,
  CommunityVotesResponse,
  MemberTestimonial,
  CommunityTestimonialsResponse,
  DiscoveryPageData,
  CategoryPageData,
  JoinRequest,
  JoinRequestResponse,
  CommunityAnalytics,
  FilterMetadata,
  CommunityCategory,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT_BY,
  DEFAULT_SORT_ORDER,
  CommunityFilters,
  CommunityStats
} from '@/types/communityDiscovery';

// Base API configuration - Docker environment compatible
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_TIMEOUT = 10000; // 10 seconds

// API client configuration
class CommunityDiscoveryAPI {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string = API_BASE_URL, timeout: number = API_TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();
    
    if (!response.ok) {
      const errorMessage = data.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;
  }

  // Community search and discovery
  async searchCommunities(params: CommunitySearchParams = {}): Promise<CommunitySearchResponse> {
    const searchParams = new URLSearchParams();
    
    // Add search parameters
    if (params.query) searchParams.append('query', params.query);
    if (params.category?.length) {
      params.category.forEach(cat => searchParams.append('category', cat));
    }
    if (params.type?.length) {
      params.type.forEach(type => searchParams.append('type', type));
    }
    if (params.memberCountRange) {
      searchParams.append('memberCountMin', params.memberCountRange[0].toString());
      searchParams.append('memberCountMax', params.memberCountRange[1].toString());
    }
    if (params.activityLevel?.length) {
      params.activityLevel.forEach(level => searchParams.append('activityLevel', level));
    }
    if (params.location?.length) {
      params.location.forEach(loc => searchParams.append('location', loc));
    }
    if (params.language?.length) {
      params.language.forEach(lang => searchParams.append('language', lang));
    }
    if (params.tags?.length) {
      params.tags.forEach(tag => searchParams.append('tags', tag));
    }
    if (params.isVerified !== undefined) {
      searchParams.append('isVerified', params.isVerified.toString());
    }
    if (params.joinRequirement?.length) {
      params.joinRequirement.forEach(req => searchParams.append('joinRequirement', req));
    }
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const url = `${this.baseURL}/api/communities/search?${searchParams.toString()}`;
    const response = await this.fetchWithTimeout(url);
    const data = await this.handleResponse<CommunitiesResponse>(response);
    
    return data.data;
  }

  // Get community by ID
  async getCommunity(id: string): Promise<Community> {
    const url = `${this.baseURL}/api/communities/${id}`;
    const response = await this.fetchWithTimeout(url);
    const data = await this.handleResponse<CommunityResponse>(response);
    
    return data.data;
  }

  // Get community leaders
  async getCommunityLeaders(communityId: string): Promise<CommunityLeader[]> {
    const url = `${this.baseURL}/api/communities/${communityId}/leaders`;
    const response = await this.fetchWithTimeout(url);
    const data = await this.handleResponse<CommunityLeadersResponse>(response);
    
    return data.data;
  }

  // Get community voting campaigns
  async getCommunityVotes(
    communityId: string, 
    limit: number = 10, 
    publicOnly: boolean = true
  ): Promise<VotingCampaign[]> {
    const url = `${this.baseURL}/api/communities/${communityId}/votes?limit=${limit}&publicOnly=${publicOnly}`;
    const response = await this.fetchWithTimeout(url);
    const data = await this.handleResponse<CommunityVotesResponse>(response);
    
    return data.data;
  }

  // Get community testimonials
  async getCommunityTestimonials(communityId: string, limit: number = 5): Promise<MemberTestimonial[]> {
    const url = `${this.baseURL}/api/communities/${communityId}/testimonials?limit=${limit}`;
    const response = await this.fetchWithTimeout(url);
    const data = await this.handleResponse<CommunityTestimonialsResponse>(response);
    
    return data.data;
  }

  // Get featured communities for discovery page
  async getFeaturedCommunities(limit: number = 6): Promise<Community[]> {
    const url = `${this.baseURL}/api/communities/featured?limit=${limit}`;
    const response = await this.fetchWithTimeout(url);
    const data = await this.handleResponse<CommunitiesResponse>(response);
    
    return data.data.communities;
  }

  // Get trending communities
  async getTrendingCommunities(limit: number = 6): Promise<Community[]> {
    const url = `${this.baseURL}/api/communities/trending?limit=${limit}`;
    const response = await this.fetchWithTimeout(url);
    const data = await this.handleResponse<CommunitiesResponse>(response);
    
    return data.data.communities;
  }

  // Get new communities
  async getNewCommunities(limit: number = 6): Promise<Community[]> {
    const url = `${this.baseURL}/api/communities/new?limit=${limit}`;
    const response = await this.fetchWithTimeout(url);
    const data = await this.handleResponse<CommunitiesResponse>(response);
    
    return data.data.communities;
  }

  // Get discovery page data
  async getDiscoveryPageData(): Promise<DiscoveryPageData> {
    const url = `${this.baseURL}/api/discovery`;
    const response = await this.fetchWithTimeout(url);
    const data = await this.handleResponse<{ success: boolean; data: DiscoveryPageData }>(response);
    
    return data.data;
  }

  // Get category page data
  async getCategoryPageData(category: CommunityCategory, page: number = 1): Promise<CategoryPageData> {
    const url = `${this.baseURL}/api/categories/${category}?page=${page}`;
    const response = await this.fetchWithTimeout(url);
    const data = await this.handleResponse<{ success: boolean; data: CategoryPageData }>(response);
    
    return data.data;
  }

  // Get filter metadata for advanced filtering
  async getFilterMetadata(): Promise<FilterMetadata> {
    const url = `${this.baseURL}/api/communities/filters/metadata`;
    const response = await this.fetchWithTimeout(url);
    const data = await this.handleResponse<{ success: boolean; data: FilterMetadata }>(response);
    
    return data.data;
  }

  // Join community request
  async joinCommunity(communityId: string, message?: string): Promise<JoinRequest> {
    const url = `${this.baseURL}/api/communities/${communityId}/join`;
    const response = await this.fetchWithTimeout(url, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
    const data = await this.handleResponse<JoinRequestResponse>(response);
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to join community');
    }
    
    return data.data!;
  }

  // Get community analytics (if public)
  async getCommunityAnalytics(communityId: string): Promise<CommunityAnalytics> {
    const url = `${this.baseURL}/api/communities/${communityId}/analytics`;
    const response = await this.fetchWithTimeout(url);
    const data = await this.handleResponse<{ success: boolean; data: CommunityAnalytics }>(response);
    
    return data.data;
  }

  // Get popular search terms
  async getPopularSearchTerms(): Promise<string[]> {
    const url = `${this.baseURL}/api/search/popular-terms`;
    const response = await this.fetchWithTimeout(url);
    const data = await this.handleResponse<{ success: boolean; data: string[] }>(response);
    
    return data.data;
  }

  // Get search suggestions
  async getSearchSuggestions(query: string): Promise<string[]> {
    if (!query || query.length < 2) return [];
    
    const url = `${this.baseURL}/api/search/suggestions?q=${encodeURIComponent(query)}`;
    const response = await this.fetchWithTimeout(url);
    const data = await this.handleResponse<{ success: boolean; data: string[] }>(response);
    
    return data.data;
  }

  // Get featured communities for homepage
  async getFeaturedCommunitiesForHomepage(limit: number = 6): Promise<Community[]> {
    const url = `${this.baseURL}/api/communities/featured?limit=${limit}`;
    
    const response = await this.fetchWithTimeout(url);
    const data = await this.handleResponse<CommunitiesResponse>(response);
    return data.data.communities;
  }

  // Search communities with filters
  async searchCommunitiesWithFilters(
    query: string = '',
    filters: Partial<CommunityFilters> = {},
    page: number = 1,
    limit: number = 20
  ): Promise<CommunitySearchResponse> {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).map(([key, value]) => [key, String(value)])
      )
    });

    const url = `${this.baseURL}/api/communities/search?${params}`;
    
    const response = await this.fetchWithTimeout(url);
    const data = await this.handleResponse<CommunitiesResponse>(response);
    return data.data;
  }
}

// Create singleton instance
const communityDiscoveryAPI = new CommunityDiscoveryAPI();

// Export individual functions for easier use
export const searchCommunities = (params?: CommunitySearchParams) => 
  communityDiscoveryAPI.searchCommunities(params);

export const getCommunity = (id: string) => 
  communityDiscoveryAPI.getCommunity(id);

export const getCommunityLeaders = (communityId: string) => 
  communityDiscoveryAPI.getCommunityLeaders(communityId);

export const getCommunityVotes = (communityId: string, limit?: number, publicOnly?: boolean) => 
  communityDiscoveryAPI.getCommunityVotes(communityId, limit, publicOnly);

export const getCommunityTestimonials = (communityId: string, limit?: number) => 
  communityDiscoveryAPI.getCommunityTestimonials(communityId, limit);

export const getFeaturedCommunities = (limit?: number) => 
  communityDiscoveryAPI.getFeaturedCommunities(limit);

export const getTrendingCommunities = (limit?: number) => 
  communityDiscoveryAPI.getTrendingCommunities(limit);

export const getNewCommunities = (limit?: number) => 
  communityDiscoveryAPI.getNewCommunities(limit);

export const getDiscoveryPageData = () => 
  communityDiscoveryAPI.getDiscoveryPageData();

export const getCategoryPageData = (category: CommunityCategory, page?: number) => 
  communityDiscoveryAPI.getCategoryPageData(category, page);

export const getFilterMetadata = () => 
  communityDiscoveryAPI.getFilterMetadata();

export const joinCommunity = (communityId: string, message?: string) => 
  communityDiscoveryAPI.joinCommunity(communityId, message);

export const getCommunityAnalytics = (communityId: string) => 
  communityDiscoveryAPI.getCommunityAnalytics(communityId);

export const getPopularSearchTerms = () => 
  communityDiscoveryAPI.getPopularSearchTerms();

export const getSearchSuggestions = (query: string) => 
  communityDiscoveryAPI.getSearchSuggestions(query);

// Mock data functions for development
export const createMockCommunity = (overrides: Partial<Community> = {}): Community => ({
  id: `community-${Math.random().toString(36).substr(2, 9)}`,
  name: 'Sample Community',
  description: 'A community focused on making important decisions together',
  purpose: 'Democratic decision making and community governance',
  category: 'governance',
  type: 'dao',
  logo: '/images/communities/default-logo.png',
  memberCount: 1250,
  activeVotes: 3,
  totalVotes: 47,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isPublic: true,
  isVerified: true,
  tags: ['governance', 'democracy', 'voting'],
  language: 'English',
  joinRequirement: 'approval',
  activityLevel: 'high',
  stats: {
    memberCount: 1250,
    activeMembers: 892,
    totalVotes: 47,
    activeVotes: 3,
    successfulVotes: 44,
    participationRate: 0.71,
    avgVotingTime: 24,
    lastActivity: new Date().toISOString(),
    growthRate: 0.15,
    engagementScore: 85
  },
  ...overrides
});

export const createMockCommunities = (count: number = 12): Community[] => {
  const categories: CommunityCategory[] = ['governance', 'social', 'professional', 'education', 'nonprofit'];
  const types = ['dao', 'organization', 'cooperative', 'nonprofit', 'club'];
  const names = [
    'EcoDAO', 'Tech Innovators', 'Community Builders', 'Future Voters', 'Green Initiative',
    'Developer Collective', 'Social Impact Hub', 'Education Alliance', 'Creative Network',
    'Startup Community', 'Healthcare Coalition', 'Financial Freedom DAO'
  ];

  return Array.from({ length: count }, (_, index) => createMockCommunity({
    id: `community-${index + 1}`,
    name: names[index] || `Community ${index + 1}`,
    category: categories[index % categories.length],
    type: types[index % types.length] as any,
    memberCount: Math.floor(Math.random() * 5000) + 100,
    totalVotes: Math.floor(Math.random() * 100) + 10,
    activeVotes: Math.floor(Math.random() * 5),
    stats: {
      memberCount: Math.floor(Math.random() * 5000) + 100,
      activeMembers: Math.floor(Math.random() * 3000) + 50,
      totalVotes: Math.floor(Math.random() * 100) + 10,
      activeVotes: Math.floor(Math.random() * 5),
      successfulVotes: Math.floor(Math.random() * 90) + 5,
      participationRate: Math.random() * 0.8 + 0.2,
      avgVotingTime: Math.floor(Math.random() * 48) + 12,
      lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      growthRate: Math.random() * 0.5,
      engagementScore: Math.floor(Math.random() * 40) + 60
    }
  }));
};

// Development mode helpers
export const isDevelopment = process.env.NODE_ENV === 'development';

export const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || isDevelopment;

// Mock API functions for development
export const mockSearchCommunities = async (params: CommunitySearchParams = {}): Promise<CommunitySearchResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const allCommunities = createMockCommunities(50);
  let filteredCommunities = allCommunities;

  // Apply filters
  if (params.query) {
    const query = params.query.toLowerCase();
    filteredCommunities = filteredCommunities.filter(
      community => 
        community.name.toLowerCase().includes(query) ||
        community.description.toLowerCase().includes(query) ||
        community.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }

  if (params.category?.length) {
    filteredCommunities = filteredCommunities.filter(
      community => params.category!.includes(community.category)
    );
  }

  if (params.type?.length) {
    filteredCommunities = filteredCommunities.filter(
      community => params.type!.includes(community.type)
    );
  }

  // Apply sorting
  const sortBy = params.sortBy || DEFAULT_SORT_BY;
  const sortOrder = params.sortOrder || DEFAULT_SORT_ORDER;

  filteredCommunities.sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'memberCount':
        aValue = a.memberCount;
        bValue = b.memberCount;
        break;
      case 'created':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      case 'engagement':
        aValue = a.stats.engagementScore;
        bValue = b.stats.engagementScore;
        break;
      default:
        aValue = a.stats.engagementScore;
        bValue = b.stats.engagementScore;
    }

    if (typeof aValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    
    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const pageSize = DEFAULT_PAGE_SIZE;
  const totalCount = filteredCommunities.length;
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    communities: filteredCommunities.slice(0, pageSize),
    totalCount,
    page: 1,
    pageSize,
    totalPages,
    filters: {
      categories: [],
      types: [],
      locations: ['New York', 'San Francisco', 'London', 'Berlin', 'Tokyo'],
      languages: ['English', 'Spanish', 'French', 'German', 'Japanese'],
      tags: [],
      memberCountRange: [1, 5000],
      activityLevels: []
    }
  };
};

// Export main API instance
export default communityDiscoveryAPI; 