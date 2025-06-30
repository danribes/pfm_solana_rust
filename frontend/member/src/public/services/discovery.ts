// Task 4.5.2: Public Community Discovery Service
// Handles public API calls for community discovery and showcase

import { 
  PublicCommunity, 
  DiscoveryFilters, 
  DiscoveryResult, 
  PublicAPIResponse,
  SearchSuggestion,
  PlatformStats,
  ActivityLevel,
  CommunityCategory,
  SortOption,
  SortOrder
} from "../types/public";

// ============================================================================
// DISCOVERY SERVICE CLASS
// ============================================================================

class DiscoveryService {
  private baseURL: string;
  private cache: Map<string, any>;
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    this.cache = new Map();
  }

  // ========================================================================
  // COMMUNITY DISCOVERY METHODS
  // ========================================================================

  /**
   * Get filtered and sorted communities for public discovery
   */
  async getCommunities(filters: DiscoveryFilters = {}): Promise<DiscoveryResult> {
    try {
      const cacheKey = this.generateCacheKey("communities", filters);
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      // Build query parameters
      const queryParams = this.buildQueryParams(filters);
      
      const response = await fetch(`${this.baseURL}/api/public/communities?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch communities: ${response.statusText}`);
      }

      const result: PublicAPIResponse<DiscoveryResult> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || "Failed to fetch communities");
      }

      // Process and enhance community data
      const enhancedResult = await this.enhanceCommunityData(result.data);
      
      this.setCache(cacheKey, enhancedResult);
      return enhancedResult;

    } catch (error: any) { console.error("Service error:", error);
      console.error("Error fetching communities:", error);
      throw new Error("Unable to load communities. Please try again later.");
    }
  }

  /**
   * Get featured communities for landing page showcase
   */
  async getFeaturedCommunities(limit: number = 6): Promise<PublicCommunity[]> {
    try {
      const cacheKey = `featured-communities-${limit}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const response = await fetch(`${this.baseURL}/api/public/communities/featured?limit=${limit}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch featured communities: ${response.statusText}`);
      }

      const result: PublicAPIResponse<PublicCommunity[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || "Failed to fetch featured communities");
      }

      this.setCache(cacheKey, result.data, 10 * 60 * 1000); // Cache for 10 minutes
      return result.data;

    } catch (error: any) { console.error("Service error:", error);
      console.error("Error fetching featured communities:", error);
      throw new Error("Unable to load featured communities.");
    }
  }

  /**
   * Search communities with auto-complete suggestions
   */
  async searchCommunities(query: string, limit: number = 20): Promise<{
    communities: PublicCommunity[];
    suggestions: SearchSuggestion[];
  }> {
    try {
      if (query.trim().length < 2) {
        return { communities: [], suggestions: [] };
      }

      const cacheKey = `search-${query}-${limit}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const response = await fetch(`${this.baseURL}/api/public/communities/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, limit }),
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const result: PublicAPIResponse<{
        communities: PublicCommunity[];
        suggestions: SearchSuggestion[];
      }> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || "Search failed");
      }

      this.setCache(cacheKey, result.data, 2 * 60 * 1000); // Cache for 2 minutes
      return result.data;

    } catch (error: any) { console.error("Service error:", error);
      console.error("Error searching communities:", error);
      return { communities: [], suggestions: [] };
    }
  }

  /**
   * Get community details by ID for preview
   */
  async getCommunityPreview(communityId: string): Promise<PublicCommunity> {
    try {
      const cacheKey = `community-preview-${communityId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const response = await fetch(`${this.baseURL}/api/public/communities/${communityId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch community: ${response.statusText}`);
      }

      const result: PublicAPIResponse<PublicCommunity> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || "Failed to fetch community");
      }

      this.setCache(cacheKey, result.data);
      return result.data;

    } catch (error: any) { console.error("Service error:", error);
      console.error("Error fetching community preview:", error);
      throw new Error("Unable to load community details.");
    }
  }

  /**
   * Get platform statistics for landing page
   */
  async getPlatformStats(): Promise<PlatformStats> {
    try {
      const cacheKey = "platform-stats";
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const response = await fetch(`${this.baseURL}/api/public/stats`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch platform stats: ${response.statusText}`);
      }

      const result: PublicAPIResponse<PlatformStats> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || "Failed to fetch platform stats");
      }

      this.setCache(cacheKey, result.data, 15 * 60 * 1000); // Cache for 15 minutes
      return result.data;

    } catch (error: any) { console.error("Service error:", error);
      console.error("Error fetching platform stats:", error);
      // Return fallback stats
      return {
        totalCommunities: 0,
        totalMembers: 0,
        totalVotes: 0,
        totalProposals: 0,
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  /**
   * Get available filter options
   */
  async getFilterOptions(): Promise<{
    categories: { category: CommunityCategory; count: number }[];
    tags: { tag: string; count: number }[];
    memberRanges: { min: number; max: number }[];
  }> {
    try {
      const cacheKey = "filter-options";
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const response = await fetch(`${this.baseURL}/api/public/communities/filters`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch filter options: ${response.statusText}`);
      }

      const result: PublicAPIResponse<any> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || "Failed to fetch filter options");
      }

      this.setCache(cacheKey, result.data, 30 * 60 * 1000); // Cache for 30 minutes
      return result.data;

    } catch (error: any) { console.error("Service error:", error);
      console.error("Error fetching filter options:", error);
      // Return default options
      return {
        categories: Object.values(CommunityCategory).map(cat => ({
          category: cat,
          count: 0
        })),
        tags: [],
        memberRanges: [
          { min: 0, max: 100 },
          { min: 100, max: 1000 },
          { min: 1000, max: 10000 },
          { min: 10000, max: Infinity }
        ]
      };
    }
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  /**
   * Build query parameters from filters
   */
  private buildQueryParams(filters: DiscoveryFilters): string {
    const params = new URLSearchParams();

    if (filters.category && filters.category.length > 0) {
      params.append("categories", filters.category.join(","));
    }

    if (filters.tags && filters.tags.length > 0) {
      params.append("tags", filters.tags.join(","));
    }

    if (filters.memberCountRange) {
      params.append("minMembers", filters.memberCountRange[0].toString());
      params.append("maxMembers", filters.memberCountRange[1].toString());
    }

    if (filters.activityLevel) {
      params.append("activityLevel", filters.activityLevel);
    }

    if (filters.verifiedOnly) {
      params.append("verifiedOnly", "true");
    }

    if (filters.searchQuery) {
      params.append("search", filters.searchQuery);
    }

    if (filters.sortBy) {
      params.append("sortBy", filters.sortBy);
    }

    if (filters.sortOrder) {
      params.append("sortOrder", filters.sortOrder);
    }

    if (filters.page) {
      params.append("page", filters.page.toString());
    }

    if (filters.limit) {
      params.append("limit", filters.limit.toString());
    }

    return params.toString();
  }

  /**
   * Enhance community data with computed properties
   */
  private async enhanceCommunityData(result: DiscoveryResult): Promise<DiscoveryResult> {
    // Add computed properties and formatting
    const enhancedCommunities = result.communities.map(community => ({
      ...community,
      // Calculate activity score
      activityScore: this.calculateActivityScore(community),
      // Format member count
      formattedMemberCount: this.formatMemberCount(community.memberCount),
      // Check if trending
      isTrending: this.checkTrendingStatus(community),
    }));

    return {
      ...result,
      communities: enhancedCommunities,
    };
  }

  /**
   * Calculate activity score for sorting
   */
  private calculateActivityScore(community: PublicCommunity): number {
    const weights = {
      recentActivity: 0.4,
      participationRate: 0.3,
      memberGrowth: 0.2,
      campaignActivity: 0.1,
    };

    const recentActivityScore = community.preview.recentActivity.length * 10;
    const participationScore = community.stats.participationRate * 100;
    const growthScore = community.stats.weeklyGrowth * 50;
    const campaignScore = community.stats.activeCampaigns * 20;

    return (
      recentActivityScore * weights.recentActivity +
      participationScore * weights.participationRate +
      growthScore * weights.memberGrowth +
      campaignScore * weights.campaignActivity
    );
  }

  /**
   * Format member count for display
   */
  private formatMemberCount(count: number): string {
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
    return `${(count / 1000000).toFixed(1)}M`;
  }

  /**
   * Check if community is trending
   */
  private checkTrendingStatus(community: PublicCommunity): boolean {
    return (
      community.stats.weeklyGrowth > 0.1 || // 10% weekly growth
      community.stats.activeCampaigns > 2 ||
      community.preview.recentActivity.length > 5
    );
  }

  // ========================================================================
  // CACHE MANAGEMENT
  // ========================================================================

  private generateCacheKey(prefix: string, data: any): string {
    return `${prefix}-${JSON.stringify(data)}`;
  }

  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const { data, timestamp } = cached;
    if (Date.now() - timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }

    return data;
  }

  private setCache(key: string, data: any, timeout?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });

    // Clean up expired entries periodically
    if (this.cache.size > 100) {
      this.cleanupCache();
    }
  }

  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const discoveryService = new DiscoveryService();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Debounce function for search queries
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Create SEO-friendly slug from community name
 */
export function createCommunitySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Get category display information
 */
export function getCategoryInfo(category: CommunityCategory): {
  label: string;
  icon: string;
  color: string;
  description: string;
} {
  const categoryMap = {
    [CommunityCategory.GOVERNANCE]: {
      label: "Governance",
      icon: "⚖️",
      color: "blue",
      description: "Democratic decision-making and policy development"
    },
    [CommunityCategory.DEFI]: {
      label: "DeFi",
      icon: "💰",
      color: "green",
      description: "Decentralized finance and protocol governance"
    },
    [CommunityCategory.NFT]: {
      label: "NFT",
      icon: "🎨",
      color: "purple",
      description: "NFT collections and creative communities"
    },
    [CommunityCategory.GAMING]: {
      label: "Gaming",
      icon: "🎮",
      color: "red",
      description: "Gaming guilds and virtual worlds"
    },
    [CommunityCategory.SOCIAL]: {
      label: "Social",
      icon: "👥",
      color: "pink",
      description: "Social clubs and community initiatives"
    },
    [CommunityCategory.EDUCATION]: {
      label: "Education",
      icon: "📚",
      color: "yellow",
      description: "Learning communities and educational resources"
    },
    [CommunityCategory.ENVIRONMENT]: {
      label: "Environment",
      icon: "🌱",
      color: "emerald",
      description: "Environmental and sustainability initiatives"
    },
    [CommunityCategory.TECHNOLOGY]: {
      label: "Technology",
      icon: "⚙️",
      color: "gray",
      description: "Tech development and innovation"
    },
    [CommunityCategory.BUSINESS]: {
      label: "Business",
      icon: "💼",
      color: "indigo",
      description: "Business networks and professional groups"
    },
    [CommunityCategory.NONPROFIT]: {
      label: "Non-Profit",
      icon: "❤️",
      color: "rose",
      description: "Charitable organizations and social causes"
    },
    [CommunityCategory.LOCAL]: {
      label: "Local",
      icon: "📍",
      color: "orange",
      description: "Local communities and neighborhood groups"
    },
    [CommunityCategory.OTHER]: {
      label: "Other",
      icon: "🔗",
      color: "slate",
      description: "Specialized and niche communities"
    }
  };

  return categoryMap[category] || categoryMap[CommunityCategory.OTHER];
}

/**
 * Format time relative to now
 */
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 2629746) return `${Math.floor(diffInSeconds / 604800)}w ago`;
  return `${Math.floor(diffInSeconds / 2629746)}mo ago`;
}
