import { 
  Member, 
  MemberFilters, 
  MembersPaginationResult, 
  PendingApplication, 
  MemberAction, 
  BulkMemberAction, 
  MemberAnalytics,
  MemberActivity,
  RoleChange
} from '../types/member';

class MemberService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  }

  // Get community members with filtering and pagination
  async getCommunityMembers(
    communityId: string, 
    filters: MemberFilters = {}
  ): Promise<MembersPaginationResult> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.role && filters.role !== 'all') params.append('role', filters.role);
    if (filters.search) params.append('search', filters.search);
    if (filters.sort_by) params.append('sort_by', filters.sort_by);
    if (filters.sort_order) params.append('sort_order', filters.sort_order);

    const response = await fetch(
      `${this.baseUrl}/communities/${communityId}/members?${params}`, 
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch community members: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  // Get pending member applications
  async getPendingApplications(communityId: string): Promise<PendingApplication[]> {
    const response = await fetch(
      `${this.baseUrl}/communities/${communityId}/members/pending`, 
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch pending applications: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data.applications;
  }

  // Approve a member application
  async approveMember(
    communityId: string, 
    memberId: string, 
    note?: string
  ): Promise<Member> {
    const response = await fetch(
      `${this.baseUrl}/communities/${communityId}/members/${memberId}/approve`, 
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ note }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to approve member: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data.membership;
  }

  // Reject a member application
  async rejectMember(
    communityId: string, 
    memberId: string, 
    reason?: string
  ): Promise<Member> {
    const response = await fetch(
      `${this.baseUrl}/communities/${communityId}/members/${memberId}/reject`, 
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to reject member: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data.membership;
  }

  // Remove a member
  async removeMember(
    communityId: string, 
    memberId: string, 
    reason?: string
  ): Promise<Member> {
    const response = await fetch(
      `${this.baseUrl}/communities/${communityId}/members/${memberId}/remove`, 
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to remove member: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data.membership;
  }

  // Update member role
  async updateMemberRole(
    communityId: string, 
    memberId: string, 
    roleChange: RoleChange
  ): Promise<Member> {
    const response = await fetch(
      `${this.baseUrl}/communities/${communityId}/members/${memberId}/role`, 
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(roleChange),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update member role: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data.membership;
  }

  // Bulk member actions
  async bulkMemberAction(
    communityId: string, 
    bulkAction: BulkMemberAction
  ): Promise<{ success: boolean; processed: number; errors: any[] }> {
    const response = await fetch(
      `${this.baseUrl}/communities/${communityId}/members/bulk`, 
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(bulkAction),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to execute bulk action: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  // Get member analytics
  async getMemberAnalytics(communityId: string): Promise<MemberAnalytics> {
    const response = await fetch(
      `${this.baseUrl}/communities/${communityId}/members/analytics`, 
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch member analytics: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  // Get member activity history
  async getMemberActivity(
    communityId: string, 
    memberId: string, 
    limit: number = 50
  ): Promise<MemberActivity[]> {
    const response = await fetch(
      `${this.baseUrl}/communities/${communityId}/members/${memberId}/activity?limit=${limit}`, 
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch member activity: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data.activities;
  }

  // Get member details
  async getMemberDetails(
    communityId: string, 
    memberId: string
  ): Promise<Member> {
    const response = await fetch(
      `${this.baseUrl}/communities/${communityId}/members/${memberId}`, 
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch member details: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data.member;
  }

  // Export members data
  async exportMembers(
    communityId: string, 
    filters: MemberFilters = {},
    format: 'csv' | 'json' = 'csv'
  ): Promise<Blob> {
    const params = new URLSearchParams();
    
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.role && filters.role !== 'all') params.append('role', filters.role);
    if (filters.search) params.append('search', filters.search);
    params.append('format', format);

    const response = await fetch(
      `${this.baseUrl}/communities/${communityId}/members/export?${params}`, 
      {
        method: 'GET',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to export members: ${response.statusText}`);
    }

    return await response.blob();
  }
}

export const memberService = new MemberService();
export default memberService; 