// User Profile and Registration TypeScript Definitions for Member Portal

export interface UserProfile {
  id: string;
  walletAddress: string;
  username?: string;
  displayName?: string;
  email?: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  location?: string;
  website?: string;
  socialLinks: SocialLink[];
  joinedAt: string;
  lastActiveAt: string;
  isVerified: boolean;
  verificationLevel: VerificationLevel;
  privacySettings: PrivacySettings;
  notificationSettings: NotificationSettings;
  securitySettings: SecuritySettings;
  wallets: ConnectedWallet[];
  communityMemberships: CommunityMembership[];
  activityStats: ActivityStats;
  preferences: UserPreferences;
}

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
  verified: boolean;
  displayName?: string;
}

export interface ConnectedWallet {
  id: string;
  address: string;
  type: WalletType;
  name?: string;
  isPrimary: boolean;
  connectedAt: string;
  lastUsed: string;
  balance?: number;
  isVerified: boolean;
}

export interface CommunityMembership {
  communityId: string;
  communityName: string;
  role: CommunityRole;
  status: MembershipStatus;
  joinedAt: string;
  isPublic: boolean;
  permissions: string[];
  badges: string[];
  reputation: number;
}

export interface ActivityStats {
  totalVotes: number;
  communitiesJoined: number;
  proposalsCreated: number;
  commentsPosted: number;
  likesReceived: number;
  reputationScore: number;
  lastActivityDate: string;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  theme: 'light' | 'dark' | 'auto';
  dateFormat: string;
  currencyDisplay: string;
  autoJoinCommunities: boolean;
  showActivityFeed: boolean;
  defaultCommunityView: 'grid' | 'list';
}

export interface PrivacySettings {
  profileVisibility: ProfileVisibility;
  showEmail: boolean;
  showWalletAddress: boolean;
  showActivityHistory: boolean;
  showCommunityMemberships: boolean;
  allowDirectMessages: boolean;
  allowCommunityInvites: boolean;
  dataCollection: DataCollectionSettings;
}

export interface NotificationSettings {
  email: EmailNotificationSettings;
  push: PushNotificationSettings;
  inApp: InAppNotificationSettings;
  frequency: NotificationFrequency;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorMethod: TwoFactorMethod;
  trustedDevices: TrustedDevice[];
  sessionTimeout: number;
  loginNotifications: boolean;
  ipWhitelist: string[];
  lastPasswordChange: string;
  securityQuestions: SecurityQuestion[];
}

export interface DataCollectionSettings {
  allowAnalytics: boolean;
  allowPersonalization: boolean;
  allowMarketingEmails: boolean;
  allowThirdPartySharing: boolean;
  dataRetentionPeriod: number;
}

export interface EmailNotificationSettings {
  enabled: boolean;
  voteReminders: boolean;
  proposalUpdates: boolean;
  communityInvites: boolean;
  securityAlerts: boolean;
  weeklyDigest: boolean;
}

export interface PushNotificationSettings {
  enabled: boolean;
  votingDeadlines: boolean;
  directMessages: boolean;
  communityUpdates: boolean;
  securityAlerts: boolean;
}

export interface InAppNotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  showPreviews: boolean;
  autoMarkAsRead: boolean;
}

export interface TrustedDevice {
  id: string;
  name: string;
  deviceType: DeviceType;
  browser: string;
  operatingSystem: string;
  ipAddress: string;
  location: string;
  addedAt: string;
  lastUsed: string;
  isCurrent: boolean;
}

export interface SecurityQuestion {
  id: string;
  question: string;
  isActive: boolean;
  createdAt: string;
}

// Registration Interfaces
export interface RegistrationData {
  walletAddress: string;
  walletType: WalletType;
  username?: string;
  displayName?: string;
  email?: string;
  bio?: string;
  avatar?: string;
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
  selectedCommunities: string[];
  referralCode?: string;
  inviteCode?: string;
}

export interface RegistrationStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
  isOptional: boolean;
  component: string;
}

export interface WalletConnectionData {
  address: string;
  type: WalletType;
  balance?: number;
  isConnected: boolean;
  network?: string;
  chainId?: number;
}

export interface CommunityOption {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isPublic: boolean;
  category: string;
  icon?: string;
  requiresApproval: boolean;
  tags: string[];
}

export interface RegistrationProgress {
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  canProceed: boolean;
  errors: RegistrationError[];
}

export interface RegistrationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning' | 'info';
}

// Profile Update Interfaces
export interface ProfileUpdateData {
  username?: string;
  displayName?: string;
  email?: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  location?: string;
  website?: string;
  socialLinks?: SocialLink[];
}

export interface AvatarUploadData {
  file: File;
  preview: string;
  size: number;
  type: string;
}

export interface ProfileValidation {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Enums
export enum VerificationLevel {
  UNVERIFIED = 'unverified',
  EMAIL_VERIFIED = 'email_verified',
  PHONE_VERIFIED = 'phone_verified',
  IDENTITY_VERIFIED = 'identity_verified',
  WALLET_VERIFIED = 'wallet_verified',
  FULLY_VERIFIED = 'fully_verified'
}

export enum SocialPlatform {
  TWITTER = 'twitter',
  GITHUB = 'github',
  LINKEDIN = 'linkedin',
  DISCORD = 'discord',
  TELEGRAM = 'telegram',
  REDDIT = 'reddit',
  MEDIUM = 'medium',
  WEBSITE = 'website'
}

export enum WalletType {
  PHANTOM = 'phantom',
  SOLFLARE = 'solflare',
  METAMASK = 'metamask',
  LEDGER = 'ledger',
  TREZOR = 'trezor',
  WALLET_CONNECT = 'wallet_connect',
  MAGIC_LINK = 'magic_link'
}

export enum CommunityRole {
  MEMBER = 'member',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  OWNER = 'owner',
  GUEST = 'guest'
}

export enum MembershipStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
  LEFT = 'left',
  INVITED = 'invited'
}

export enum ProfileVisibility {
  PUBLIC = 'public',
  COMMUNITY_ONLY = 'community_only',
  FRIENDS_ONLY = 'friends_only',
  PRIVATE = 'private'
}

export enum NotificationFrequency {
  IMMEDIATE = 'immediate',
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  NEVER = 'never'
}

export enum TwoFactorMethod {
  SMS = 'sms',
  EMAIL = 'email',
  AUTHENTICATOR = 'authenticator',
  HARDWARE_KEY = 'hardware_key'
}

export enum DeviceType {
  DESKTOP = 'desktop',
  MOBILE = 'mobile',
  TABLET = 'tablet',
  BROWSER_EXTENSION = 'browser_extension'
}

// Hook Types
export interface UseProfileOptions {
  includePrivateData?: boolean;
  includeCommunities?: boolean;
  includeActivity?: boolean;
  autoRefresh?: boolean;
}

export interface UseProfileResult {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (data: ProfileUpdateData) => Promise<UserProfile>;
  updateAvatar: (file: File) => Promise<string>;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => Promise<void>;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  addWallet: (walletData: Partial<ConnectedWallet>) => Promise<void>;
  removeWallet: (walletId: string) => Promise<void>;
  validateProfile: (data: ProfileUpdateData) => ProfileValidation;
  refetch: () => Promise<void>;
}

export interface UseRegistrationResult {
  registrationData: RegistrationData;
  progress: RegistrationProgress;
  loading: boolean;
  error: string | null;
  updateRegistrationData: (data: Partial<RegistrationData>) => void;
  nextStep: () => void;
  previousStep: () => void;
  completeRegistration: () => Promise<UserProfile>;
  connectWallet: (walletType: WalletType) => Promise<WalletConnectionData>;
  validateStep: (stepId: string) => ValidationError[];
  reset: () => void;
}

// API Response Types
export interface CreateProfileResponse {
  success: boolean;
  profile: UserProfile;
  message: string;
  requiresVerification?: boolean;
}

export interface UpdateProfileResponse {
  success: boolean;
  profile: UserProfile;
  message: string;
}

export interface UploadAvatarResponse {
  success: boolean;
  avatarUrl: string;
  message: string;
}
