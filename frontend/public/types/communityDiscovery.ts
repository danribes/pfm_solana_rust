// Task 7.1.2: Community Discovery & Browse Interface
// TypeScript definitions for community discovery and browsing functionality

export interface Community {
  id: string;
  name: string;
  description: string;
  purpose: string;
  category: CommunityCategory;
  type: CommunityType;
  logo: string;
  bannerImage?: string;
  memberCount: number;
  activeVotes: number;
  totalVotes: number;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  isVerified: boolean;
  tags: string[];
  location?: string;
  timezone?: string;
  language: string;
  joinRequirement: 'open' | 'approval' | 'invitation';
  activityLevel: 'low' | 'medium' | 'high';
  rules?: string[];
  website?: string;
  socialLinks?: SocialLinks;
  stats: CommunityStats;
}

export interface CommunityStats {
  memberCount: number;
  activeMembers: number;
  totalVotes: number;
  activeVotes: number;
  successfulVotes: number;
  participationRate: number;
  avgVotingTime: number; // in hours
  lastActivity: string;
  growthRate: number; // percentage
  engagementScore: number; // 0-100
}

export interface SocialLinks {
  website?: string;
  twitter?: string;
  discord?: string;
  telegram?: string;
  github?: string;
  linkedin?: string;
}

export type CommunityCategory = 
  | 'governance' 
  | 'social' 
  | 'professional' 
  | 'education' 
  | 'nonprofit' 
  | 'technology' 
  | 'finance' 
  | 'arts' 
  | 'sports' 
  | 'other';

export type CommunityType = 
  | 'dao' 
  | 'organization' 
  | 'cooperative' 
  | 'nonprofit' 
  | 'club' 
  | 'association';

export interface CommunityLeader {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bio?: string;
  joinedAt: string;
  votesCreated: number;
  participationRate: number;
}

export interface VotingCampaign {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  type: 'simple' | 'multiple' | 'ranked' | 'weighted';
  createdAt: string;
  startDate: string;
  endDate: string;
  totalVotes: number;
  participationRate: number;
  results?: VotingResult[];
  isPublic: boolean;
}

export interface VotingResult {
  optionId: string;
  option: string;
  votes: number;
  percentage: number;
}

export interface MemberTestimonial {
  id: string;
  memberName: string;
  memberRole?: string;
  avatar: string;
  content: string;
  rating: number;
  createdAt: string;
  verified: boolean;
}

// Search and filtering types
export interface CommunitySearchParams {
  query?: string;
  category?: CommunityCategory[];
  type?: CommunityType[];
  memberCountRange?: [number, number];
  activityLevel?: ('low' | 'medium' | 'high')[];
  location?: string[];
  language?: string[];
  tags?: string[];
  isVerified?: boolean;
  joinRequirement?: ('open' | 'approval' | 'invitation')[];
  sortBy?: CommunitySortBy;
  sortOrder?: 'asc' | 'desc';
}

export type CommunitySortBy = 
  | 'name' 
  | 'memberCount' 
  | 'activity' 
  | 'created' 
  | 'updated' 
  | 'popularity' 
  | 'engagement';

export interface CommunitySearchResponse {
  communities: Community[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  filters: FilterMetadata;
}

export interface FilterMetadata {
  categories: { category: CommunityCategory; count: number }[];
  types: { type: CommunityType; count: number }[];
  locations: string[];
  languages: string[];
  tags: { tag: string; count: number }[];
  memberCountRange: [number, number];
  activityLevels: { level: string; count: number }[];
}

export interface CommunityFilters {
  categories: CommunityCategory[];
  types: CommunityType[];
  memberCountRange: [number, number];
  activityLevels: string[];
  locations: string[];
  languages: string[];
  tags: string[];
  isVerified: boolean | null;
  joinRequirements: string[];
}

export interface SearchState {
  query: string;
  filters: CommunityFilters;
  sortBy: CommunitySortBy;
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

// Component props types
export interface CommunityCardProps {
  community: Community;
  variant?: 'grid' | 'list' | 'featured';
  showStats?: boolean;
  showJoinButton?: boolean;
  onClick?: (community: Community) => void;
  onJoin?: (communityId: string) => void;
}

export interface CommunityGridProps {
  communities: Community[];
  loading?: boolean;
  error?: string | null;
  variant?: 'grid' | 'list';
  showLoadMore?: boolean;
  onLoadMore?: () => void;
  onCommunityClick?: (community: Community) => void;
  onJoinCommunity?: (communityId: string) => void;
}

export interface SearchInterfaceProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  placeholder?: string;
  showFilters?: boolean;
  onToggleFilters?: () => void;
  loading?: boolean;
}

export interface FilterSidebarProps {
  filters: CommunityFilters;
  metadata: FilterMetadata;
  onFiltersChange: (filters: Partial<CommunityFilters>) => void;
  onClearFilters: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export interface CommunityDetailsProps {
  community: Community;
  leaders: CommunityLeader[];
  recentVotes: VotingCampaign[];
  testimonials: MemberTestimonial[];
  onJoin?: (communityId: string) => void;
  onViewVote?: (voteId: string) => void;
}

export interface SortOptionsProps {
  sortBy: CommunitySortBy;
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: CommunitySortBy, sortOrder: 'asc' | 'desc') => void;
  options: { value: CommunitySortBy; label: string }[];
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  showPageSizeSelector?: boolean;
}

// API response types
export interface CommunityResponse {
  success: boolean;
  data: Community;
  message?: string;
}

export interface CommunitiesResponse {
  success: boolean;
  data: CommunitySearchResponse;
  message?: string;
}

export interface CommunityLeadersResponse {
  success: boolean;
  data: CommunityLeader[];
  message?: string;
}

export interface CommunityVotesResponse {
  success: boolean;
  data: VotingCampaign[];
  message?: string;
}

export interface CommunityTestimonialsResponse {
  success: boolean;
  data: MemberTestimonial[];
  message?: string;
}

// Hook types
export interface UseCommunitySearchResult {
  communities: Community[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  searchParams: CommunitySearchParams;
  metadata: FilterMetadata | null;
  search: (params: CommunitySearchParams) => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

export interface UseCommunityFiltersResult {
  filters: CommunityFilters;
  updateFilter: <K extends keyof CommunityFilters>(
    key: K, 
    value: CommunityFilters[K]
  ) => void;
  clearFilters: () => void;
  applyFilters: () => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
}

// Utility types
export interface CategoryConfig {
  category: CommunityCategory;
  label: string;
  description: string;
  icon: string;
  color: string;
}

export interface TypeConfig {
  type: CommunityType;
  label: string;
  description: string;
  icon: string;
}

export interface ActivityLevelConfig {
  level: 'low' | 'medium' | 'high';
  label: string;
  description: string;
  color: string;
  threshold: number;
}

// Discovery page types
export interface DiscoveryPageData {
  featuredCommunities: Community[];
  trendingCommunities: Community[];
  newCommunities: Community[];
  categories: CategoryConfig[];
  totalCommunities: number;
  totalMembers: number;
}

export interface CategoryPageData {
  category: CommunityCategory;
  communities: Community[];
  totalCount: number;
  subcategories?: string[];
  relatedCategories: CommunityCategory[];
}

// Join request types
export interface JoinRequest {
  communityId: string;
  userId: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
}

export interface JoinRequestResponse {
  success: boolean;
  data?: JoinRequest;
  message: string;
}

// Analytics types
export interface CommunityAnalytics {
  views: number;
  joinRequests: number;
  conversions: number;
  engagementRate: number;
  popularTags: string[];
  referralSources: { source: string; count: number }[];
  memberGrowth: { date: string; count: number }[];
  activityMetrics: { date: string; votes: number; participation: number }[];
}

// Error types
export interface CommunityError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Export default configurations
export const DEFAULT_PAGE_SIZE = 12;
export const DEFAULT_SORT_BY: CommunitySortBy = 'popularity';
export const DEFAULT_SORT_ORDER: 'asc' | 'desc' = 'desc';

export const COMMUNITY_CATEGORIES: CategoryConfig[] = [
  { category: 'governance', label: 'Governance', description: 'DAOs and governance communities', icon: 'Building', color: 'blue' },
  { category: 'social', label: 'Social', description: 'Social and community groups', icon: 'Users', color: 'green' },
  { category: 'professional', label: 'Professional', description: 'Professional and business networks', icon: 'Briefcase', color: 'purple' },
  { category: 'education', label: 'Education', description: 'Educational institutions and learning groups', icon: 'BookOpen', color: 'orange' },
  { category: 'nonprofit', label: 'Nonprofit', description: 'Nonprofit organizations and charities', icon: 'Heart', color: 'red' },
  { category: 'technology', label: 'Technology', description: 'Tech communities and developer groups', icon: 'Code', color: 'indigo' },
  { category: 'finance', label: 'Finance', description: 'Financial and investment communities', icon: 'DollarSign', color: 'yellow' },
  { category: 'arts', label: 'Arts & Culture', description: 'Arts, culture, and creative communities', icon: 'Palette', color: 'pink' },
  { category: 'sports', label: 'Sports', description: 'Sports clubs and athletic communities', icon: 'Trophy', color: 'cyan' },
  { category: 'other', label: 'Other', description: 'Other community types', icon: 'Grid3X3', color: 'gray' }
];

export const COMMUNITY_TYPES: TypeConfig[] = [
  { type: 'dao', label: 'DAO', description: 'Decentralized Autonomous Organization', icon: 'Hexagon' },
  { type: 'organization', label: 'Organization', description: 'Traditional organization', icon: 'Building2' },
  { type: 'cooperative', label: 'Cooperative', description: 'Cooperative organization', icon: 'Users' },
  { type: 'nonprofit', label: 'Nonprofit', description: 'Nonprofit organization', icon: 'Heart' },
  { type: 'club', label: 'Club', description: 'Club or social group', icon: 'Users2' },
  { type: 'association', label: 'Association', description: 'Professional association', icon: 'Network' }
];

export const ACTIVITY_LEVELS: ActivityLevelConfig[] = [
  { level: 'low', label: 'Low Activity', description: 'Less than 1 vote per month', color: 'gray', threshold: 1 },
  { level: 'medium', label: 'Medium Activity', description: '1-5 votes per month', color: 'yellow', threshold: 5 },
  { level: 'high', label: 'High Activity', description: 'More than 5 votes per month', color: 'green', threshold: 100 }
]; 