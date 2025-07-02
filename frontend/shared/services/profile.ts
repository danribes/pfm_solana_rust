// Task 7.2.3: User Profile Creation & Management
// Profile service for API communication and state management

import {
  UserProfile,
  ProfileResponse,
  ProfileError,
  PersonalInfo,
  ProfessionalInfo,
  SocialLinks,
  PrivacySettings,
  VerificationStatus,
  ProfileAvatar,
  InterestTag,
  CommunityProfile,
  WalletVerification,
  SocialVerification,
  IdentityVerification,
  PROFILE_ERROR_CODES,
  PROFILE_CONFIG
} from '../types/profile';

// Base API configuration - Docker environment compatible
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_TIMEOUT = 30000; // 30 seconds for profile operations

// Profile API client
class ProfileService {
  private baseURL: string;
  private timeout: number;
  private sessionId: string;

  constructor(baseURL: string = API_BASE_URL, timeout: number = API_TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `profile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': this.sessionId,
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();
    
    if (!response.ok) {
      const error: ProfileError = {
        code: data.code || PROFILE_ERROR_CODES.SERVER_ERROR,
        message: data.message || 'An error occurred',
        field: data.field,
        retryable: response.status >= 500
      };
      throw error;
    }

    return data;
  }

  // Profile CRUD Operations
  async getProfile(userId: string): Promise<UserProfile> {
    const url = `${this.baseURL}/api/users/${userId}/profile`;

    try {
      const response = await this.fetchWithTimeout(url);
      const result = await this.handleResponse<ProfileResponse>(response);
      
      if (result.success && result.data) {
        return result.data;
      }
      
      throw new Error(result.message || 'Profile not found');
    } catch (error) {
      console.warn('Failed to get profile, using mock:', error);
      return this.getMockProfile(userId);
    }
  }

  async createProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    const url = `${this.baseURL}/api/users/${userId}/profile`;

    try {
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        body: JSON.stringify({
          ...profileData,
          sessionId: this.sessionId,
          createdAt: new Date().toISOString()
        }),
      });

      const result = await this.handleResponse<ProfileResponse>(response);
      
      if (result.success && result.data) {
        return result.data;
      }
      
      throw new Error(result.message || 'Failed to create profile');
    } catch (error) {
      console.error('Failed to create profile:', error);
      throw this.handleError(error);
    }
  }

  async updateProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    const url = `${this.baseURL}/api/users/${userId}/profile`;

    try {
      const response = await this.fetchWithTimeout(url, {
        method: 'PATCH',
        body: JSON.stringify({
          ...profileData,
          sessionId: this.sessionId,
          updatedAt: new Date().toISOString()
        }),
      });

      const result = await this.handleResponse<ProfileResponse>(response);
      
      if (result.success && result.data) {
        return result.data;
      }
      
      throw new Error(result.message || 'Failed to update profile');
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw this.handleError(error);
    }
  }

  async deleteProfile(userId: string): Promise<void> {
    const url = `${this.baseURL}/api/users/${userId}/profile`;

    try {
      const response = await this.fetchWithTimeout(url, {
        method: 'DELETE',
      });

      await this.handleResponse<{ success: boolean }>(response);
    } catch (error) {
      console.error('Failed to delete profile:', error);
      throw this.handleError(error);
    }
  }

  // Avatar Management
  async uploadAvatar(userId: string, file: File): Promise<ProfileAvatar> {
    // Validate file
    if (file.size > PROFILE_CONFIG.maxAvatarSize) {
      throw new Error('File size too large');
    }

    if (!PROFILE_CONFIG.allowedAvatarTypes.includes(file.type)) {
      throw new Error('File type not allowed');
    }

    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('sessionId', this.sessionId);

    const url = `${this.baseURL}/api/users/${userId}/avatar`;

    try {
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        body: formData,
        headers: {
          'X-Session-ID': this.sessionId,
        },
      });

      const result = await this.handleResponse<{ success: boolean; data: ProfileAvatar }>(response);
      
      if (result.success && result.data) {
        return result.data;
      }
      
      throw new Error('Failed to upload avatar');
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      throw this.handleError(error);
    }
  }

  async deleteAvatar(userId: string): Promise<void> {
    const url = `${this.baseURL}/api/users/${userId}/avatar`;

    try {
      const response = await this.fetchWithTimeout(url, {
        method: 'DELETE',
      });

      await this.handleResponse<{ success: boolean }>(response);
    } catch (error) {
      console.error('Failed to delete avatar:', error);
      throw this.handleError(error);
    }
  }

  // Privacy Settings
  async updatePrivacySettings(userId: string, settings: PrivacySettings): Promise<PrivacySettings> {
    const url = `${this.baseURL}/api/users/${userId}/privacy`;

    try {
      const response = await this.fetchWithTimeout(url, {
        method: 'PATCH',
        body: JSON.stringify({
          ...settings,
          sessionId: this.sessionId,
          updatedAt: new Date().toISOString()
        }),
      });

      const result = await this.handleResponse<{ success: boolean; data: PrivacySettings }>(response);
      
      if (result.success && result.data) {
        return result.data;
      }
      
      throw new Error('Failed to update privacy settings');
    } catch (error) {
      console.warn('Failed to update privacy settings:', error);
      return settings; // Return optimistically for development
    }
  }

  // Interests Management
  async updateInterests(userId: string, interests: InterestTag[]): Promise<InterestTag[]> {
    const url = `${this.baseURL}/api/users/${userId}/interests`;

    try {
      const response = await this.fetchWithTimeout(url, {
        method: 'PATCH',
        body: JSON.stringify({
          interests,
          sessionId: this.sessionId,
          updatedAt: new Date().toISOString()
        }),
      });

      const result = await this.handleResponse<{ success: boolean; data: InterestTag[] }>(response);
      
      if (result.success && result.data) {
        return result.data;
      }
      
      throw new Error('Failed to update interests');
    } catch (error) {
      console.warn('Failed to update interests:', error);
      return interests; // Return optimistically for development
    }
  }

  async getAvailableInterests(): Promise<InterestTag[]> {
    const url = `${this.baseURL}/api/interests`;

    try {
      const response = await this.fetchWithTimeout(url);
      const result = await this.handleResponse<{ success: boolean; data: InterestTag[] }>(response);
      
      if (result.success && result.data) {
        return result.data;
      }
      
      return [];
    } catch (error) {
      console.warn('Failed to get available interests, using mock:', error);
      return this.getMockInterests();
    }
  }

  // Community Profiles
  async getCommunityProfiles(userId: string): Promise<CommunityProfile[]> {
    const url = `${this.baseURL}/api/users/${userId}/community-profiles`;

    try {
      const response = await this.fetchWithTimeout(url);
      const result = await this.handleResponse<{ success: boolean; data: CommunityProfile[] }>(response);
      
      if (result.success && result.data) {
        return result.data;
      }
      
      return [];
    } catch (error) {
      console.warn('Failed to get community profiles:', error);
      return [];
    }
  }

  async updateCommunityProfile(
    userId: string, 
    communityId: string, 
    profileData: Partial<CommunityProfile>
  ): Promise<CommunityProfile> {
    const url = `${this.baseURL}/api/users/${userId}/community-profiles/${communityId}`;

    try {
      const response = await this.fetchWithTimeout(url, {
        method: 'PATCH',
        body: JSON.stringify({
          ...profileData,
          sessionId: this.sessionId,
          updatedAt: new Date().toISOString()
        }),
      });

      const result = await this.handleResponse<{ success: boolean; data: CommunityProfile }>(response);
      
      if (result.success && result.data) {
        return result.data;
      }
      
      throw new Error('Failed to update community profile');
    } catch (error) {
      console.error('Failed to update community profile:', error);
      throw this.handleError(error);
    }
  }

  // Verification Operations
  async getVerificationStatus(userId: string): Promise<VerificationStatus> {
    const url = `${this.baseURL}/api/users/${userId}/verification`;

    try {
      const response = await this.fetchWithTimeout(url);
      const result = await this.handleResponse<{ success: boolean; data: VerificationStatus }>(response);
      
      if (result.success && result.data) {
        return result.data;
      }
      
      throw new Error('Verification status not found');
    } catch (error) {
      console.warn('Failed to get verification status, using mock:', error);
      return this.getMockVerificationStatus();
    }
  }

  async startIdentityVerification(userId: string, method: string): Promise<string> {
    const url = `${this.baseURL}/api/users/${userId}/verification/identity`;

    try {
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        body: JSON.stringify({
          method,
          sessionId: this.sessionId,
          startedAt: new Date().toISOString()
        }),
      });

      const result = await this.handleResponse<{ success: boolean; data: { verificationId: string } }>(response);
      
      if (result.success && result.data) {
        return result.data.verificationId;
      }
      
      throw new Error('Failed to start identity verification');
    } catch (error) {
      console.error('Failed to start identity verification:', error);
      throw this.handleError(error);
    }
  }

  async verifyWallet(userId: string, address: string, signature: string): Promise<WalletVerification> {
    const url = `${this.baseURL}/api/users/${userId}/verification/wallet`;

    try {
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        body: JSON.stringify({
          address,
          signature,
          sessionId: this.sessionId,
          verifiedAt: new Date().toISOString()
        }),
      });

      const result = await this.handleResponse<{ success: boolean; data: WalletVerification }>(response);
      
      if (result.success && result.data) {
        return result.data;
      }
      
      throw new Error('Failed to verify wallet');
    } catch (error) {
      console.error('Failed to verify wallet:', error);
      throw this.handleError(error);
    }
  }

  async verifySocial(userId: string, platform: string, proof: string): Promise<SocialVerification> {
    const url = `${this.baseURL}/api/users/${userId}/verification/social`;

    try {
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        body: JSON.stringify({
          platform,
          proof,
          sessionId: this.sessionId,
          verifiedAt: new Date().toISOString()
        }),
      });

      const result = await this.handleResponse<{ success: boolean; data: SocialVerification }>(response);
      
      if (result.success && result.data) {
        return result.data;
      }
      
      throw new Error('Failed to verify social account');
    } catch (error) {
      console.error('Failed to verify social account:', error);
      throw this.handleError(error);
    }
  }

  // Profile completion calculations
  calculateCompletionPercentage(profile: UserProfile): number {
    const weights = {
      personalInfo: 40,
      avatar: 15,
      interests: 10,
      socialLinks: 10,
      professionalInfo: 15,
      verification: 10
    };

    let totalScore = 0;
    let maxScore = 0;

    // Personal info scoring
    maxScore += weights.personalInfo;
    let personalScore = 0;
    if (profile.personalInfo.displayName) personalScore += 10;
    if (profile.personalInfo.bio) personalScore += 10;
    if (profile.personalInfo.location) personalScore += 5;
    if (profile.personalInfo.languages.length > 0) personalScore += 5;
    if (profile.personalInfo.website) personalScore += 5;
    if (profile.personalInfo.tagline) personalScore += 5;
    totalScore += Math.min(personalScore, weights.personalInfo);

    // Avatar scoring
    maxScore += weights.avatar;
    if (profile.personalInfo.avatar && !profile.personalInfo.avatar.isDefault) {
      totalScore += weights.avatar;
    }

    // Interests scoring
    maxScore += weights.interests;
    if (profile.interests.length >= 3) {
      totalScore += weights.interests;
    } else {
      totalScore += (profile.interests.length / 3) * weights.interests;
    }

    // Social links scoring
    maxScore += weights.socialLinks;
    const socialCount = Object.keys(profile.socialLinks).filter(key => 
      key !== 'custom' && profile.socialLinks[key as keyof SocialLinks]
    ).length + profile.socialLinks.custom.length;
    totalScore += Math.min(socialCount / 2, 1) * weights.socialLinks;

    // Professional info scoring
    maxScore += weights.professionalInfo;
    if (profile.professionalInfo) {
      let profScore = 0;
      if (profile.professionalInfo.title) profScore += 5;
      if (profile.professionalInfo.company) profScore += 5;
      if (profile.professionalInfo.skills.length > 0) profScore += 5;
      totalScore += Math.min(profScore, weights.professionalInfo);
    }

    // Verification scoring
    maxScore += weights.verification;
    let verificationScore = 0;
    if (profile.verificationStatus.identity.status === 'verified') verificationScore += 4;
    if (profile.verificationStatus.wallet.length > 0) verificationScore += 3;
    if (profile.verificationStatus.social.length > 0) verificationScore += 3;
    totalScore += Math.min(verificationScore, weights.verification);

    return Math.round((totalScore / maxScore) * 100);
  }

  // Mock data for development
  private getMockProfile(userId: string): UserProfile {
    return {
      id: `profile-${userId}`,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isComplete: false,
      completionPercentage: 25,
      personalInfo: {
        displayName: 'New User',
        bio: '',
        avatar: {
          id: 'default-avatar',
          url: '/default-avatar.png',
          thumbnailUrl: '/default-avatar-thumb.png',
          fileSize: 0,
          mimeType: 'image/png',
          uploadedAt: new Date().toISOString(),
          isDefault: true,
          source: 'generated'
        },
        languages: ['en'],
        tagline: ''
      },
      socialLinks: {
        custom: []
      },
      interests: [],
      privacySettings: {
        profileVisibility: 'public',
        fieldVisibility: {
          personalInfo: {
            displayName: 'public',
            realName: 'private',
            bio: 'public',
            avatar: 'public',
            location: 'communities',
            languages: 'public',
            website: 'public'
          },
          professionalInfo: {
            title: 'public',
            company: 'public',
            skills: 'public',
            education: 'public',
            certifications: 'public',
            portfolio: 'public'
          },
          socialLinks: {
            twitter: 'public',
            linkedin: 'public',
            github: 'public',
            discord: 'communities',
            other: 'public'
          },
          communityData: {
            membershipList: 'public',
            activityHistory: 'communities',
            achievements: 'public',
            reputation: 'public'
          }
        },
        communitySettings: {
          defaultJoinVisibility: 'public',
          allowCommunityInvites: true,
          showActivityBetweenCommunities: false,
          allowCrossCommunityProfile: true,
          communitySpecificSettings: {}
        },
        dataSharing: {
          allowAnalytics: true,
          allowPersonalization: true,
          allowThirdPartyIntegrations: false,
          allowMarketingCommunications: false,
          dataRetentionPeriod: 365,
          autoDeleteInactiveData: false
        },
        communicationPreferences: {
          email: {
            enabled: true,
            frequency: 'weekly',
            types: ['community_updates', 'achievement_unlocked']
          },
          push: {
            enabled: true,
            quietHours: {
              enabled: true,
              start: '22:00',
              end: '08:00'
            },
            types: ['mentions', 'direct_messages']
          },
          inApp: {
            enabled: true,
            types: ['mentions', 'direct_messages', 'community_updates', 'achievement_unlocked']
          }
        }
      },
      verificationStatus: {
        overall: 'unverified',
        identity: {
          status: 'pending'
        },
        wallet: [],
        social: [],
        community: [],
        trustScore: 0,
        lastUpdated: new Date().toISOString()
      },
      communityProfiles: [],
      achievements: [],
      activityStats: {
        totalPosts: 0,
        totalComments: 0,
        totalLikes: 0,
        communitiesJoined: 0,
        achievementsUnlocked: 0,
        profileViews: 0,
        connectionsCount: 0,
        verificationLevel: 'unverified',
        joinedAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        longestStreak: 0,
        currentStreak: 0
      }
    };
  }

  private getMockInterests(): InterestTag[] {
    return [
      {
        id: 'tech-blockchain',
        name: 'Blockchain Technology',
        category: 'Technology',
        weight: 8,
        isPublic: true,
        addedAt: new Date().toISOString()
      },
      {
        id: 'finance-defi',
        name: 'Decentralized Finance',
        category: 'Finance',
        weight: 7,
        isPublic: true,
        addedAt: new Date().toISOString()
      },
      {
        id: 'community-governance',
        name: 'Community Governance',
        category: 'Community',
        weight: 9,
        isPublic: true,
        addedAt: new Date().toISOString()
      }
    ];
  }

  private getMockVerificationStatus(): VerificationStatus {
    return {
      overall: 'basic',
      identity: {
        status: 'pending'
      },
      wallet: [
        {
          id: 'wallet-1',
          address: '0x742d35cc6...',
          chain: 'ethereum',
          verificationMethod: 'signature',
          verifiedAt: new Date().toISOString(),
          isPrimary: true,
          isPublic: true
        }
      ],
      social: [],
      community: [],
      trustScore: 25,
      lastUpdated: new Date().toISOString()
    };
  }

  private handleError(error: any): ProfileError {
    if (error.code && error.message) {
      return error as ProfileError;
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        code: PROFILE_ERROR_CODES.NETWORK_ERROR,
        message: 'Network connection failed. Please check your internet connection.',
        retryable: true
      };
    }
    
    return {
      code: PROFILE_ERROR_CODES.SERVER_ERROR,
      message: error.message || 'An unexpected error occurred',
      retryable: true
    };
  }
}

// Create singleton instance
const profileService = new ProfileService();

// Export individual functions for easier use
export const getProfile = (userId: string) =>
  profileService.getProfile(userId);

export const createProfile = (userId: string, data: Partial<UserProfile>) =>
  profileService.createProfile(userId, data);

export const updateProfile = (userId: string, data: Partial<UserProfile>) =>
  profileService.updateProfile(userId, data);

export const deleteProfile = (userId: string) =>
  profileService.deleteProfile(userId);

export const uploadAvatar = (userId: string, file: File) =>
  profileService.uploadAvatar(userId, file);

export const deleteAvatar = (userId: string) =>
  profileService.deleteAvatar(userId);

export const updatePrivacySettings = (userId: string, settings: PrivacySettings) =>
  profileService.updatePrivacySettings(userId, settings);

export const updateInterests = (userId: string, interests: InterestTag[]) =>
  profileService.updateInterests(userId, interests);

export const getAvailableInterests = () =>
  profileService.getAvailableInterests();

export const getCommunityProfiles = (userId: string) =>
  profileService.getCommunityProfiles(userId);

export const updateCommunityProfile = (userId: string, communityId: string, data: Partial<CommunityProfile>) =>
  profileService.updateCommunityProfile(userId, communityId, data);

export const getVerificationStatus = (userId: string) =>
  profileService.getVerificationStatus(userId);

export const startIdentityVerification = (userId: string, method: string) =>
  profileService.startIdentityVerification(userId, method);

export const verifyWallet = (userId: string, address: string, signature: string) =>
  profileService.verifyWallet(userId, address, signature);

export const verifySocial = (userId: string, platform: string, proof: string) =>
  profileService.verifySocial(userId, platform, proof);

export const calculateCompletionPercentage = (profile: UserProfile) =>
  profileService.calculateCompletionPercentage(profile);

// Utility functions
export const getProfileCompletionTips = (profile: UserProfile): string[] => {
  const tips: string[] = [];
  
  if (!profile.personalInfo.bio) {
    tips.push('Add a bio to tell others about yourself');
  }
  
  if (profile.personalInfo.avatar.isDefault) {
    tips.push('Upload a profile picture to personalize your account');
  }
  
  if (profile.interests.length < 3) {
    tips.push('Add more interests to find relevant communities');
  }
  
  if (!profile.professionalInfo || !profile.professionalInfo.title) {
    tips.push('Add professional information to build credibility');
  }
  
  if (profile.verificationStatus.wallet.length === 0) {
    tips.push('Verify your wallet to increase trust score');
  }
  
  return tips;
};

export const isProfileComplete = (profile: UserProfile): boolean => {
  return profile.completionPercentage >= 80;
};

export const canUserPerformAction = (profile: UserProfile, action: string): boolean => {
  const minCompletion = {
    'join_community': 50,
    'create_proposal': 70,
    'moderate_content': 90
  };
  
  return profile.completionPercentage >= (minCompletion[action] || 0);
};

// Development mode helpers
export const isDevelopment = process.env.NODE_ENV === 'development';
export const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || isDevelopment;

// Export service instance
export default profileService; 