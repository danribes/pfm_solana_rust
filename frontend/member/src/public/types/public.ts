// Task 4.5.2: Public Landing Page & Community Discovery - TypeScript Definitions
// Comprehensive type system for public-facing interfaces

// ============================================================================
// CORE PUBLIC TYPES
// ============================================================================

export interface PublicCommunity {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  category: CommunityCategory;
  tags: string[];
  memberCount: number;
  activeMembers: number;
  isVerified: boolean;
  isPublic: boolean;
  coverImage: string;
  logo: string;
  createdAt: string;
  lastActivity: string;
  stats: CommunityStats;
  preview: CommunityPreview;
}

export interface CommunityStats {
  totalVotes: number;
  totalProposals: number;
  participationRate: number;
  averageVotingRate: number;
  activeCampaigns: number;
  weeklyGrowth: number;
}

export interface CommunityPreview {
  recentActivity: ActivityItem[];
  upcomingVotes: number;
  featuredProposal?: ProposalPreview;
  memberProfiles: MemberPreview[];
}

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  timestamp: string;
  participant?: string;
  isHighlighted: boolean;
}

export interface ProposalPreview {
  id: string;
  title: string;
  description: string;
  status: ProposalStatus;
  votesCount: number;
  endDate: string;
}

export interface MemberPreview {
  id: string;
  username: string;
  avatar: string;
  role: string;
  joinedAt: string;
}

// ============================================================================
// LANDING PAGE TYPES
// ============================================================================

export interface HeroContent {
  headline: string;
  subheadline: string;
  description: string;
  primaryCTA: CTAButton;
  secondaryCTA: CTAButton;
  backgroundImage: string;
  videoUrl?: string;
  statsPreview: PlatformStats;
}

export interface CTAButton {
  text: string;
  url: string;
  variant: ButtonVariant;
  trackingEvent: string;
  isExternal: boolean;
}

export interface PlatformStats {
  totalCommunities: number;
  totalMembers: number;
  totalVotes: number;
  totalProposals: number;
  lastUpdated: string;
}

export interface FeatureHighlight {
  id: string;
  title: string;
  description: string;
  icon: string;
  imageUrl: string;
  benefits: string[];
  category: FeatureCategory;
  order: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  organization: string;
  avatar: string;
  quote: string;
  rating: number;
  category: TestimonialCategory;
  isVerified: boolean;
  date: string;
}

// ============================================================================
// DISCOVERY TYPES
// ============================================================================

export interface DiscoveryFilters {
  category?: CommunityCategory[];
  tags?: string[];
  memberCountRange?: [number, number];
  activityLevel?: ActivityLevel;
  verifiedOnly?: boolean;
  searchQuery?: string;
  sortBy?: SortOption;
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
}

export interface DiscoveryResult {
  communities: PublicCommunity[];
  totalCount: number;
  hasMore: boolean;
  filters: AppliedFilters;
  suggestions: SearchSuggestion[];
  featuredCommunities: PublicCommunity[];
}

export interface AppliedFilters {
  categories: CategoryFilter[];
  tags: TagFilter[];
  memberCountRange?: [number, number];
  activityLevel?: ActivityLevel;
  verifiedOnly: boolean;
}

export interface CategoryFilter {
  category: CommunityCategory;
  count: number;
  isSelected: boolean;
}

export interface TagFilter {
  tag: string;
  count: number;
  isSelected: boolean;
}

export interface SearchSuggestion {
  type: SuggestionType;
  text: string;
  category?: CommunityCategory;
  count: number;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
  timestamp: string;
  sessionId: string;
  userId?: string;
}

export interface ConversionEvent {
  type: ConversionType;
  source: TrafficSource;
  medium: string;
  campaign?: string;
  content?: string;
  term?: string;
  value?: number;
  timestamp: string;
}

export interface UserEngagement {
  sessionId: string;
  timeOnPage: number;
  pageViews: number;
  scrollDepth: number;
  interactions: InteractionEvent[];
  exitIntent: boolean;
  converted: boolean;
}

export interface InteractionEvent {
  type: InteractionType;
  element: string;
  timestamp: string;
  value?: string;
}

// ============================================================================
// EDUCATION TYPES
// ============================================================================

export interface EducationContent {
  id: string;
  title: string;
  description: string;
  content: string;
  category: EducationCategory;
  difficulty: DifficultyLevel;
  estimatedReadTime: number;
  prerequisites: string[];
  nextSteps: string[];
  relatedContent: string[];
  lastUpdated: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: FAQCategory;
  isPopular: boolean;
  order: number;
  tags: string[];
  lastUpdated: string;
}

export interface WalletGuide {
  id: string;
  walletType: WalletType;
  title: string;
  description: string;
  steps: GuideStep[];
  difficulty: DifficultyLevel;
  estimatedTime: number;
  requirements: string[];
  troubleshooting: TroubleshootingItem[];
}

export interface GuideStep {
  id: string;
  title: string;
  description: string;
  image?: string;
  code?: string;
  tips: string[];
  warnings: string[];
  order: number;
}

export interface TroubleshootingItem {
  problem: string;
  solution: string;
  category: string;
}

// ============================================================================
// NEWSLETTER & MARKETING TYPES
// ============================================================================

export interface NewsletterSignup {
  email: string;
  interests: Interest[];
  source: TrafficSource;
  campaign?: string;
  timestamp: string;
}

export interface Interest {
  id: string;
  name: string;
  description: string;
  category: InterestCategory;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  targets: MarketingTarget[];
  content: MarketingContent;
  analytics: CampaignAnalytics;
}

export interface MarketingTarget {
  audience: string;
  channels: MarketingChannel[];
  budget: number;
  expectedReach: number;
}

export interface MarketingContent {
  headlines: string[];
  descriptions: string[];
  images: string[];
  videos: string[];
  ctaTexts: string[];
}

export interface CampaignAnalytics {
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  roi: number;
  ctr: number;
  conversionRate: number;
}

// ============================================================================
// ENUMS
// ============================================================================

export enum CommunityCategory {
  GOVERNANCE = "governance",
  DEFI = "defi",
  NFT = "nft",
  GAMING = "gaming",
  SOCIAL = "social",
  EDUCATION = "education",
  ENVIRONMENT = "environment",
  TECHNOLOGY = "technology",
  BUSINESS = "business",
  NONPROFIT = "nonprofit",
  LOCAL = "local",
  OTHER = "other"
}

export enum ActivityType {
  VOTE_CAST = "vote_cast",
  PROPOSAL_CREATED = "proposal_created",
  MEMBER_JOINED = "member_joined",
  DISCUSSION_STARTED = "discussion_started",
  CAMPAIGN_LAUNCHED = "campaign_launched",
  MILESTONE_REACHED = "milestone_reached"
}

export enum ProposalStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  ENDED = "ended",
  EXECUTED = "executed",
  CANCELLED = "cancelled"
}

export enum ButtonVariant {
  PRIMARY = "primary",
  SECONDARY = "secondary",
  OUTLINE = "outline",
  GHOST = "ghost",
  LINK = "link"
}

export enum FeatureCategory {
  GOVERNANCE = "governance",
  SECURITY = "security",
  TRANSPARENCY = "transparency",
  COMMUNITY = "community",
  TECHNOLOGY = "technology"
}

export enum TestimonialCategory {
  COMMUNITY_LEADER = "community_leader",
  MEMBER = "member",
  ORGANIZATION = "organization",
  DEVELOPER = "developer",
  EXPERT = "expert"
}

export enum ActivityLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  VERY_HIGH = "very_high"
}

export enum SortOption {
  RELEVANCE = "relevance",
  MEMBER_COUNT = "member_count",
  ACTIVITY = "activity",
  CREATED_DATE = "created_date",
  ALPHABETICAL = "alphabetical"
}

export enum SortOrder {
  ASC = "asc",
  DESC = "desc"
}

export enum SuggestionType {
  COMMUNITY = "community",
  CATEGORY = "category",
  TAG = "tag",
  SEARCH_TERM = "search_term"
}

export enum ConversionType {
  REGISTRATION = "registration",
  NEWSLETTER_SIGNUP = "newsletter_signup",
  COMMUNITY_JOIN = "community_join",
  DEMO_REQUEST = "demo_request",
  CONTACT_FORM = "contact_form"
}

export enum TrafficSource {
  DIRECT = "direct",
  ORGANIC = "organic",
  SOCIAL = "social",
  PAID = "paid",
  REFERRAL = "referral",
  EMAIL = "email"
}

export enum InteractionType {
  CLICK = "click",
  HOVER = "hover",
  SCROLL = "scroll",
  FORM_FOCUS = "form_focus",
  VIDEO_PLAY = "video_play",
  DOWNLOAD = "download"
}

export enum EducationCategory {
  BLOCKCHAIN_BASICS = "blockchain_basics",
  VOTING_SYSTEMS = "voting_systems",
  WALLET_SETUP = "wallet_setup",
  SECURITY = "security",
  GOVERNANCE = "governance",
  COMMUNITY_BUILDING = "community_building"
}

export enum DifficultyLevel {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced"
}

export enum FAQCategory {
  GETTING_STARTED = "getting_started",
  VOTING = "voting",
  WALLET = "wallet",
  SECURITY = "security",
  COMMUNITIES = "communities",
  TECHNICAL = "technical",
  BILLING = "billing"
}

export enum WalletType {
  METAMASK = "metamask",
  PHANTOM = "phantom",
  SOLFLARE = "solflare",
  LEDGER = "ledger",
  TREZOR = "trezor",
  MOBILE = "mobile"
}

export enum InterestCategory {
  GOVERNANCE = "governance",
  TECHNOLOGY = "technology",
  COMMUNITY = "community",
  EDUCATION = "education",
  UPDATES = "updates"
}

export enum MarketingChannel {
  GOOGLE_ADS = "google_ads",
  FACEBOOK = "facebook",
  TWITTER = "twitter",
  LINKEDIN = "linkedin",
  REDDIT = "reddit",
  EMAIL = "email",
  CONTENT = "content",
  INFLUENCER = "influencer"
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface PublicAPIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: ResponseMeta;
}

export interface ResponseMeta {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  timestamp: string;
}

// ============================================================================
// HOOK RETURN TYPES
// ============================================================================

export interface UseCommunityDiscoveryResult {
  communities: PublicCommunity[];
  featuredCommunities: PublicCommunity[];
  isLoading: boolean;
  error: string | null;
  filters: DiscoveryFilters;
  totalCount: number;
  hasMore: boolean;
  searchQuery: string;
  suggestions: SearchSuggestion[];
  // Actions
  setFilters: (filters: Partial<DiscoveryFilters>) => void;
  setSearchQuery: (query: string) => void;
  loadMore: () => Promise<void>;
  refreshCommunities: () => Promise<void>;
  clearFilters: () => void;
}

export interface UseAnalyticsResult {
  // Tracking functions
  trackEvent: (event: Partial<AnalyticsEvent>) => void;
  trackConversion: (conversion: Partial<ConversionEvent>) => void;
  trackEngagement: (engagement: Partial<UserEngagement>) => void;
  trackPageView: (page: string, properties?: Record<string, any>) => void;
  // State
  sessionId: string;
  userId?: string;
  isTracking: boolean;
}

export interface UseLandingContentResult {
  heroContent: HeroContent;
  features: FeatureHighlight[];
  testimonials: Testimonial[];
  platformStats: PlatformStats;
  isLoading: boolean;
  error: string | null;
  refreshContent: () => Promise<void>;
}

export interface UseNewsletterResult {
  email: string;
  interests: Interest[];
  isSubmitting: boolean;
  isSubscribed: boolean;
  error: string | null;
  availableInterests: Interest[];
  // Actions
  setEmail: (email: string) => void;
  toggleInterest: (interestId: string) => void;
  subscribe: () => Promise<void>;
  reset: () => void;
}
