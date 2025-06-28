// Community Service for Member Portal
// Handles API calls to backend community endpoints

import {
  Community,
  CommunityDetails,
  CommunityListResponse,
  CommunitySearchResponse,
  CommunityFilters,
  CommunitySearchRequest,
  MembershipRequest,
  MembershipAction,
  MyCommunitiesData,
  CommunityStats,
  CommunityRecommendation,
  CommunityError
} from '../types/community';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

class CommunityService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  }

  private async fetchWithAuth<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for session
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Community Discovery & Browsing
  async getCommunities(
    filters: CommunityFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<CommunityListResponse> {
    const queryParams = new URLSearchParams();
    
    // Add pagination
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    
    // Add filters
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.sort_by) queryParams.append('sort_by', filters.sort_by);
    if (filters.sort_order) queryParams.append('sort_order', filters.sort_order);
    if (filters.require_approval !== undefined) {
      queryParams.append('require_approval', filters.require_approval.toString());
    }
    if (filters.is_private !== undefined) {
      queryParams.append('is_private', filters.is_private.toString());
    }
    if (filters.member_count_min) {
      queryParams.append('member_count_min', filters.member_count_min.toString());
    }
    if (filters.member_count_max) {
      queryParams.append('member_count_max', filters.member_count_max.toString());
    }
    if (filters.rating_min) {
      queryParams.append('rating_min', filters.rating_min.toString());
    }
    if (filters.featured !== undefined) {
      queryParams.append('featured', filters.featured.toString());
    }

    const response = await this.fetchWithAuth<ApiResponse<Community[]>>(
      `/communities?${queryParams.toString()}`
    );

    return {
      communities: response.data || [],
      pagination: response.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        total_pages: 0
      },
      filters_applied: filters
    };
  }

  // Search communities
  async searchCommunities(request: CommunitySearchRequest): Promise<CommunitySearchResponse> {
    const startTime = Date.now();
    
    const filters = {
      search: request.query,
      ...request.filters
    };

    const result = await this.getCommunities(
      filters,
      request.page || 1,
      request.limit || 20
    );

    return {
      ...result,
      search_metadata: {
        query: request.query,
        total_results: result.pagination.total,
        search_time_ms: Date.now() - startTime,
        suggestions: [] // Could be enhanced with backend suggestions
      }
    };
  }

  // Get community details
  async getCommunityById(id: string): Promise<CommunityDetails> {
    const response = await this.fetchWithAuth<ApiResponse<CommunityDetails>>(
      `/communities/${id}`
    );

    if (!response.success || !response.data) {
      throw new Error('Community not found');
    }

    return response.data;
  }

  // Get community statistics
  async getCommunityStats(id: string): Promise<CommunityStats> {
    const response = await this.fetchWithAuth<ApiResponse<CommunityStats>>(
      `/communities/${id}/analytics`
    );

    if (!response.success || !response.data) {
      throw new Error('Failed to get community statistics');
    }

    return response.data;
  }

  // Membership Management
  async requestMembership(request: MembershipRequest): Promise<boolean> {
    const response = await this.fetchWithAuth<ApiResponse<any>>(
      `/memberships/communities/${request.community_id}/join`,
      {
        method: 'POST',
        body: JSON.stringify({
          message: request.message,
          wallet_address: request.wallet_address
        })
      }
    );

    return response.success;
  }

  async leaveCommunity(communityId: string): Promise<boolean> {
    const response = await this.fetchWithAuth<ApiResponse<any>>(
      `/memberships/communities/${communityId}/leave`,
      {
        method: 'POST'
      }
    );

    return response.success;
  }

  async getMembershipStatus(communityId: string, memberId?: string): Promise<any> {
    const endpoint = memberId 
      ? `/memberships/communities/${communityId}/members/${memberId}/status`
      : `/memberships/communities/${communityId}/status`;
      
    const response = await this.fetchWithAuth<ApiResponse<any>>(endpoint);

    return response.data;
  }

  // My Communities (Member-specific)
  async getMyCommunitiesData(): Promise<MyCommunitiesData> {
    try {
      // Get user's active memberships
      const activeMemberships = await this.fetchWithAuth<ApiResponse<Community[]>>(
        '/memberships/my-communities'
      );

      // Get pending applications
      const pendingApplications = await this.fetchWithAuth<ApiResponse<Community[]>>(
        '/memberships/pending-applications'
      );

      // Get recommendations (could be enhanced with ML in backend)
      const recommendations = await this.getRecommendations();

      // Get recent activity
      const recentActivity = await this.fetchWithAuth<ApiResponse<any[]>>(
        '/memberships/activity'
      );

      return {
        active_memberships: activeMemberships.data || [],
        pending_applications: pendingApplications.data || [],
        recommendations: recommendations,
        recent_activity: recentActivity.data || []
      };
    } catch (error) {
      console.error('Failed to get my communities data:', error);
      return {
        active_memberships: [],
        pending_applications: [],
        recommendations: [],
        recent_activity: []
      };
    }
  }

  // Get community recommendations
  async getRecommendations(limit: number = 5): Promise<CommunityRecommendation[]> {
    try {
      // For now, get trending/featured communities
      const trendingResult = await this.getCommunities(
        { 
          featured: true, 
          sort_by: 'engagement_score' as any,
          sort_order: 'desc' 
        },
        1,
        limit
      );

      return trendingResult.communities.map(community => ({
        community,
        match_score: Math.random() * 0.3 + 0.7, // Mock score 0.7-1.0
        match_reasons: ['High engagement', 'Active community', 'Popular category'],
        recommendation_type: 'trending' as const
      }));
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      return [];
    }
  }

  // Get featured communities
  async getFeaturedCommunities(limit: number = 6): Promise<Community[]> {
    const result = await this.getCommunities(
      { featured: true, sort_by: 'engagement_score' as any },
      1,
      limit
    );

    return result.communities;
  }

  // Get trending communities (high growth rate)
  async getTrendingCommunities(limit: number = 6): Promise<Community[]> {
    const result = await this.getCommunities(
      { sort_by: 'growth_rate' as any, sort_order: 'desc' },
      1,
      limit
    );

    return result.communities;
  }

  // Get communities by category
  async getCommunitiesByCategory(
    category: string,
    page: number = 1,
    limit: number = 20
  ): Promise<CommunityListResponse> {
    return this.getCommunities(
      { category: category as any },
      page,
      limit
    );
  }

  // Utility methods
  async checkMembershipEligibility(communityId: string): Promise<{
    eligible: boolean;
    reasons: string[];
  }> {
    try {
      const response = await this.fetchWithAuth<ApiResponse<any>>(
        `/communities/${communityId}/eligibility`
      );

      return response.data || { eligible: true, reasons: [] };
    } catch (error) {
      return {
        eligible: false,
        reasons: ['Unable to check eligibility']
      };
    }
  }

  // Category metadata
  getCategoryInfo() {
    return [
      {
        id: 'defi',
        name: 'DeFi',
        description: 'Decentralized Finance communities',
        icon: '💰',
        subcategories: [
          { id: 'trading', name: 'Trading', description: 'Trading strategies and analysis' },
          { id: 'lending', name: 'Lending', description: 'Lending and borrowing protocols' },
          { id: 'yield', name: 'Yield Farming', description: 'Yield optimization strategies' },
          { id: 'liquidity', name: 'Liquidity Mining', description: 'Liquidity provision' }
        ]
      },
      {
        id: 'gaming',
        name: 'Gaming',
        description: 'Web3 Gaming and GameFi',
        icon: '🎮',
        subcategories: [
          { id: 'p2e', name: 'Play-to-Earn', description: 'Play-to-earn gaming' },
          { id: 'nft-games', name: 'NFT Games', description: 'NFT-based gaming' },
          { id: 'metaverse', name: 'Metaverse', description: 'Virtual worlds and metaverse' },
          { id: 'esports', name: 'Esports', description: 'Competitive gaming' }
        ]
      },
      {
        id: 'nft',
        name: 'NFT',
        description: 'Non-Fungible Tokens and Digital Art',
        icon: '🎨',
        subcategories: [
          { id: 'art', name: 'Digital Art', description: 'Digital art and artists' },
          { id: 'collections', name: 'Collections', description: 'NFT collections and trading' },
          { id: 'creators', name: 'Creators', description: 'NFT creators and minting' },
          { id: 'marketplace', name: 'Marketplace', description: 'NFT marketplaces' }
        ]
      },
      {
        id: 'dao',
        name: 'DAO',
        description: 'Decentralized Autonomous Organizations',
        icon: '🏛️',
        subcategories: [
          { id: 'governance', name: 'Governance', description: 'DAO governance and voting' },
          { id: 'treasury', name: 'Treasury', description: 'Treasury management' },
          { id: 'operations', name: 'Operations', description: 'DAO operations and tools' },
          { id: 'legal', name: 'Legal', description: 'Legal and compliance' }
        ]
      },
      {
        id: 'learning',
        name: 'Learning',
        description: 'Education and Learning',
        icon: '📚',
        subcategories: [
          { id: 'beginners', name: 'Beginners', description: 'Web3 basics and onboarding' },
          { id: 'development', name: 'Development', description: 'Blockchain development' },
          { id: 'tutorials', name: 'Tutorials', description: 'Step-by-step guides' },
          { id: 'research', name: 'Research', description: 'Research and analysis' }
        ]
      },
      {
        id: 'building',
        name: 'Building',
        description: 'Builders and Developers',
        icon: '🏗️',
        subcategories: [
          { id: 'solana', name: 'Solana', description: 'Solana development' },
          { id: 'ethereum', name: 'Ethereum', description: 'Ethereum development' },
          { id: 'tools', name: 'Tools', description: 'Development tools and infrastructure' },
          { id: 'hackathons', name: 'Hackathons', description: 'Hackathons and competitions' }
        ]
      }
    ];
  }
}

// Create and export singleton instance
const communityService = new CommunityService();
export default communityService; 