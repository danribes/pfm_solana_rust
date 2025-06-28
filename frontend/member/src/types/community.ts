// Community Type Definitions for Member Portal
// Interfaces for community browsing, discovery, and membership management

export interface Community {
  id: string;
  name: string;
  description: string;
  category: CommunityCategory;
  subcategories: string[];
  
  // Membership information
  member_count: number;
  max_members: number | null;
  require_approval: boolean;
  is_private: boolean;
  
  // Admin information
  admin_id: string;
  admin_wallet: string;
  admin_username?: string;
  
  // Community settings
  allow_public_voting: boolean;
  voting_threshold: number;
  
  // Status and activity
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_activity: string;
  
  // Statistics
  active_votes_count: number;
  total_votes_count: number;
  growth_rate: number;
  engagement_score: number;
  
  // Ratings and reviews
  average_rating: number;
  total_reviews: number;
  
  // Member's relationship to this community
  membership_status?: MembershipStatus;
  member_role?: MemberRole;
  joined_at?: string;
  
  // Additional metadata
  tags: string[];
  featured: boolean;
  verified: boolean;
  
  // Blockchain integration
  blockchain_address?: string;
  on_chain_data?: OnChainCommunityData;
}

export interface OnChainCommunityData {
  address: string;
  member_count: number;
  member_limit: number;
  requires_approval: boolean;
  admin: string;
  created_at: number;
}

export enum CommunityCategory {
  DEFI = 'defi',
  GAMING = 'gaming',
  NFT = 'nft',
  DAO = 'dao',
  LEARNING = 'learning',
  BUILDING = 'building',
  CREATIVE = 'creative',
  SOCIAL = 'social',
  INVESTMENT = 'investment',
  GOVERNANCE = 'governance'
}

export enum MembershipStatus {
  NOT_MEMBER = 'not_member',
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BANNED = 'banned'
}

export enum MemberRole {
  MEMBER = 'member',
  MODERATOR = 'moderator',
  ADMIN = 'admin'
}

// Community filtering and search interfaces
export interface CommunityFilters {
  search?: string;
  category?: CommunityCategory;
  subcategory?: string;
  require_approval?: boolean;
  is_private?: boolean;
  status?: 'all' | 'active' | 'inactive';
  member_count_min?: number;
  member_count_max?: number;
  rating_min?: number;
  has_active_votes?: boolean;
  featured?: boolean;
  verified?: boolean;
  sort_by?: CommunitySortBy;
  sort_order?: 'asc' | 'desc';
}

export enum CommunitySortBy {
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  NAME = 'name',
  MEMBER_COUNT = 'member_count',
  ACTIVITY = 'last_activity',
  RATING = 'average_rating',
  GROWTH = 'growth_rate',
  ENGAGEMENT = 'engagement_score'
}

// Community discovery and recommendations
export interface CommunityRecommendation {
  community: Community;
  match_score: number;
  match_reasons: string[];
  recommendation_type: 'interest_based' | 'activity_based' | 'trending' | 'featured';
}

export interface CommunityListResponse {
  communities: Community[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  filters_applied: CommunityFilters;
}

// Community membership management
export interface MembershipRequest {
  community_id: string;
  message?: string;
  wallet_address: string;
}

export interface MembershipAction {
  action: 'join' | 'leave' | 'approve' | 'reject';
  community_id: string;
  member_id?: string;
  reason?: string;
}

export interface CommunityMember {
  id: string;
  user_id: string;
  community_id: string;
  wallet_address: string;
  username?: string;
  role: MemberRole;
  status: MembershipStatus;
  joined_at: string;
  last_activity: string;
  contribution_score: number;
  reputation: number;
}

// Community statistics and analytics
export interface CommunityStats {
  member_count: number;
  active_members: number;
  new_members_this_month: number;
  growth_rate: number;
  engagement_metrics: {
    avg_participation_rate: number;
    avg_votes_per_member: number;
    avg_session_duration: number;
  };
  voting_stats: {
    total_votes: number;
    active_votes: number;
    participation_rate: number;
    avg_votes_per_question: number;
  };
}

// Community detail view data
export interface CommunityDetails extends Community {
  detailed_description: string;
  rules: string[];
  guidelines: string[];
  requirements: string[];
  recent_activity: CommunityActivity[];
  featured_votes: any[]; // Will be defined in voting types
  top_contributors: CommunityMember[];
  stats: CommunityStats;
}

export interface CommunityActivity {
  id: string;
  type: 'vote_created' | 'vote_ended' | 'member_joined' | 'member_left' | 'rule_updated';
  description: string;
  timestamp: string;
  user_id?: string;
  username?: string;
  metadata?: Record<string, any>;
}

// API request/response types
export interface CreateCommunityRequest {
  name: string;
  description: string;
  detailed_description?: string;
  category: CommunityCategory;
  subcategories?: string[];
  require_approval: boolean;
  is_private: boolean;
  max_members?: number;
  allow_public_voting: boolean;
  voting_threshold: number;
  rules?: string[];
  guidelines?: string[];
  requirements?: string[];
  tags?: string[];
}

export interface UpdateCommunityRequest extends Partial<CreateCommunityRequest> {
  id: string;
}

export interface CommunitySearchRequest {
  query: string;
  filters?: CommunityFilters;
  page?: number;
  limit?: number;
}

export interface CommunitySearchResponse extends CommunityListResponse {
  search_metadata: {
    query: string;
    total_results: number;
    search_time_ms: number;
    suggestions?: string[];
  };
}

// Error types
export interface CommunityError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, any>;
}

// UI state types
export interface CommunityUIState {
  loading: boolean;
  error: CommunityError | null;
  selectedCommunity: Community | null;
  filters: CommunityFilters;
  searchQuery: string;
  view: 'grid' | 'list';
  showFilters: boolean;
}

// Category metadata for UI
export interface CategoryInfo {
  id: CommunityCategory;
  name: string;
  description: string;
  icon: string;
  subcategories: SubcategoryInfo[];
  count?: number;
}

export interface SubcategoryInfo {
  id: string;
  name: string;
  description: string;
  count?: number;
}

// Member portal specific types
export interface MyCommunitiesData {
  active_memberships: Community[];
  pending_applications: Community[];
  recommendations: CommunityRecommendation[];
  recent_activity: CommunityActivity[];
} 