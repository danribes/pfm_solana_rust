import type {
  Community,
  CommunityListResponse,
  CommunityResponse,
  CreateCommunityRequest,
  UpdateCommunityRequest,
  CommunityFilters,
  CommunityAnalytics,
  CommunityMember
} from '../types/community';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class CommunityService {
  private baseUrl = `${API_BASE_URL}/api`;

  // Get list of communities with filtering and pagination
  async getCommunities(
    page: number = 1,
    limit: number = 20,
    filters?: CommunityFilters
  ): Promise<CommunityListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters) {
      if (filters.search) params.append('search', filters.search);
      if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());
      if (filters.min_members) params.append('min_members', filters.min_members.toString());
      if (filters.max_members) params.append('max_members', filters.max_members.toString());
      if (filters.sort_by) params.append('sort_by', filters.sort_by);
      if (filters.sort_order) params.append('sort_order', filters.sort_order);
    }

    const response = await fetch(`${this.baseUrl}/communities?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for session management
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch communities: ${response.statusText}`);
    }

    return await response.json();
  }

  // Get single community by ID
  async getCommunity(id: string): Promise<CommunityResponse> {
    const response = await fetch(`${this.baseUrl}/communities/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch community: ${response.statusText}`);
    }

    return await response.json();
  }

  // Create new community
  async createCommunity(data: CreateCommunityRequest): Promise<CommunityResponse> {
    const response = await fetch(`${this.baseUrl}/communities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Failed to create community: ${response.statusText}`);
    }

    return await response.json();
  }

  // Update existing community
  async updateCommunity(id: string, data: UpdateCommunityRequest): Promise<CommunityResponse> {
    const response = await fetch(`${this.baseUrl}/communities/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Failed to update community: ${response.statusText}`);
    }

    return await response.json();
  }

  // Delete community
  async deleteCommunity(id: string): Promise<{ success: boolean }> {
    const response = await fetch(`${this.baseUrl}/communities/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Failed to delete community: ${response.statusText}`);
    }

    return await response.json();
  }

  // Get community analytics
  async getCommunityAnalytics(id: string): Promise<{ success: boolean; data: CommunityAnalytics }> {
    const response = await fetch(`${this.baseUrl}/communities/${id}/analytics`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch community analytics: ${response.statusText}`);
    }

    return await response.json();
  }

  // Get community members
  async getCommunityMembers(
    id: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ success: boolean; data: CommunityMember[]; pagination: any }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(`${this.baseUrl}/communities/${id}/members?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch community members: ${response.statusText}`);
    }

    return await response.json();
  }

  // Bulk operations
  async bulkUpdateCommunities(
    ids: string[],
    updates: Partial<UpdateCommunityRequest>
  ): Promise<{ success: boolean; updated: number }> {
    const response = await fetch(`${this.baseUrl}/communities/bulk`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ ids, updates }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Failed to bulk update communities: ${response.statusText}`);
    }

    return await response.json();
  }

  async bulkDeleteCommunities(ids: string[]): Promise<{ success: boolean; deleted: number }> {
    const response = await fetch(`${this.baseUrl}/communities/bulk`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ ids }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Failed to bulk delete communities: ${response.statusText}`);
    }

    return await response.json();
  }
}

// Export singleton instance
export const communityService = new CommunityService();
export default communityService; 