export interface Community {
  id: string;
  name: string;
  description: string;
  wallet_address: string;
  admin_address: string;
  is_active: boolean;
  member_count: number;
  voting_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface CommunityConfiguration {
  voting_threshold: number;
  min_voting_period: number;
  max_voting_period: number;
  require_member_approval: boolean;
  allow_public_voting: boolean;
  max_members: number | null;
  voting_quorum: number;
  proposal_bond: number;
}

export interface CommunityMember {
  id: string;
  community_id: string;
  wallet_address: string;
  role: MemberRole;
  joined_at: string;
  is_active: boolean;
  voting_power: number;
}

export enum MemberRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  MEMBER = 'member',
  PENDING = 'pending'
}

export interface CommunityAnalytics {
  total_members: number;
  active_members: number;
  total_votes: number;
  recent_activity: number;
  engagement_rate: number;
  avg_participation: number;
}

export interface CreateCommunityRequest {
  name: string;
  description: string;
  configuration?: Partial<CommunityConfiguration>;
}

export interface UpdateCommunityRequest {
  name?: string;
  description?: string;
  is_active?: boolean;
  configuration?: Partial<CommunityConfiguration>;
}

export interface CommunityListResponse {
  success: boolean;
  data: Community[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CommunityResponse {
  success: boolean;
  data: Community;
}

export interface CommunityFilters {
  search?: string;
  is_active?: boolean;
  min_members?: number;
  max_members?: number;
  sort_by?: 'name' | 'created_at' | 'member_count' | 'updated_at';
  sort_order?: 'asc' | 'desc';
}

export interface CommunityFormData {
  name: string;
  description: string;
  voting_threshold: number;
  min_voting_period: number;
  max_voting_period: number;
  require_member_approval: boolean;
  allow_public_voting: boolean;
  max_members: string; // Form field as string, convert to number
  voting_quorum: number;
  proposal_bond: number;
} 