export interface Member {
  id: string;
  user_id: string;
  community_id: string;
  role: MemberRole;
  status: MemberStatus;
  joined_at: string;
  approved_at?: string;
  approved_by?: string;
  updated_at: string;
  User?: User;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  avatar_url?: string;
  created_at: string;
  wallet_address?: string;
}

export enum MemberRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  MEMBER = 'member'
}

export enum MemberStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  BANNED = 'banned'
}

export interface MemberFilters {
  search?: string;
  status?: MemberStatus | 'all';
  role?: MemberRole | 'all';
  community_id?: string;
  page?: number;
  limit?: number;
  sort_by?: 'joined_at' | 'updated_at' | 'username' | 'role';
  sort_order?: 'asc' | 'desc';
}

export interface MembersPaginationResult {
  members: Member[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PendingApplication extends Member {
  risk_level?: 'low' | 'medium' | 'high';
  risk_score?: number;
  application_note?: string;
  previous_communities?: string[];
}

export interface MemberAction {
  type: 'approve' | 'reject' | 'remove' | 'promote' | 'demote' | 'ban';
  member_id: string;
  reason?: string;
  note?: string;
}

export interface BulkMemberAction {
  action: 'approve' | 'reject' | 'remove' | 'export';
  member_ids: string[];
  reason?: string;
  note?: string;
}

export interface MemberAnalytics {
  total_members: number;
  pending_applications: number;
  active_members: number;
  inactive_members: number;
  role_distribution: {
    admin: number;
    moderator: number;
    member: number;
  };
  engagement_metrics: {
    high_engagement: number;
    medium_engagement: number;
    low_engagement: number;
  };
  recent_activity: {
    new_applications: number;
    approved_today: number;
    rejected_today: number;
  };
}

export interface MemberActivity {
  id: string;
  member_id: string;
  activity_type: 'join' | 'vote' | 'comment' | 'proposal' | 'login';
  activity_data: any;
  timestamp: string;
  community_id: string;
}

export interface RoleChange {
  member_id: string;
  from_role: MemberRole;
  to_role: MemberRole;
  reason?: string;
  effective_immediately?: boolean;
  notify_member?: boolean;
  announce_to_community?: boolean;
} 