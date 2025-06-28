// Community Utility Functions
// Helper functions for community data manipulation, formatting, and calculations

import {
  Community,
  CommunityCategory,
  MembershipStatus,
  MemberRole,
  CommunityFilters
} from '../types/community';

// Formatting utilities
export const formatMemberCount = (count: number): string => {
  if (count < 1000) {
    return count.toString();
  } else if (count < 1000000) {
    return `${(count / 1000).toFixed(1)}K`;
  } else {
    return `${(count / 1000000).toFixed(1)}M`;
  }
};

export const formatGrowthRate = (rate: number): string => {
  const sign = rate >= 0 ? '+' : '';
  return `${sign}${rate.toFixed(1)}%`;
};

export const formatRating = (rating: number): string => {
  return rating.toFixed(1);
};

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  
  return formatDate(date);
};

// Status and display utilities
export const getMembershipStatusColor = (status: MembershipStatus): string => {
  switch (status) {
    case MembershipStatus.ACTIVE:
      return 'text-green-600 bg-green-100';
    case MembershipStatus.PENDING:
      return 'text-yellow-600 bg-yellow-100';
    case MembershipStatus.SUSPENDED:
      return 'text-orange-600 bg-orange-100';
    case MembershipStatus.BANNED:
      return 'text-red-600 bg-red-100';
    case MembershipStatus.NOT_MEMBER:
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const getMembershipStatusLabel = (status: MembershipStatus): string => {
  switch (status) {
    case MembershipStatus.ACTIVE:
      return 'Active Member';
    case MembershipStatus.PENDING:
      return 'Pending Approval';
    case MembershipStatus.SUSPENDED:
      return 'Suspended';
    case MembershipStatus.BANNED:
      return 'Banned';
    case MembershipStatus.NOT_MEMBER:
    default:
      return 'Not a Member';
  }
};

export const getRoleColor = (role: MemberRole): string => {
  switch (role) {
    case MemberRole.ADMIN:
      return 'text-purple-600 bg-purple-100';
    case MemberRole.MODERATOR:
      return 'text-blue-600 bg-blue-100';
    case MemberRole.MEMBER:
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const getRoleLabel = (role: MemberRole): string => {
  switch (role) {
    case MemberRole.ADMIN:
      return 'Admin';
    case MemberRole.MODERATOR:
      return 'Moderator';
    case MemberRole.MEMBER:
    default:
      return 'Member';
  }
};

export const getCategoryIcon = (category: CommunityCategory): string => {
  switch (category) {
    case CommunityCategory.DEFI:
      return '💰';
    case CommunityCategory.GAMING:
      return '🎮';
    case CommunityCategory.NFT:
      return '🎨';
    case CommunityCategory.DAO:
      return '🏛️';
    case CommunityCategory.LEARNING:
      return '📚';
    case CommunityCategory.BUILDING:
      return '🏗️';
    case CommunityCategory.CREATIVE:
      return '🎭';
    case CommunityCategory.SOCIAL:
      return '👥';
    case CommunityCategory.INVESTMENT:
      return '📈';
    case CommunityCategory.GOVERNANCE:
      return '⚖️';
    default:
      return '🌐';
  }
};

export const getCategoryColor = (category: CommunityCategory): string => {
  switch (category) {
    case CommunityCategory.DEFI:
      return 'text-green-600 bg-green-100';
    case CommunityCategory.GAMING:
      return 'text-purple-600 bg-purple-100';
    case CommunityCategory.NFT:
      return 'text-pink-600 bg-pink-100';
    case CommunityCategory.DAO:
      return 'text-indigo-600 bg-indigo-100';
    case CommunityCategory.LEARNING:
      return 'text-blue-600 bg-blue-100';
    case CommunityCategory.BUILDING:
      return 'text-orange-600 bg-orange-100';
    case CommunityCategory.CREATIVE:
      return 'text-red-600 bg-red-100';
    case CommunityCategory.SOCIAL:
      return 'text-teal-600 bg-teal-100';
    case CommunityCategory.INVESTMENT:
      return 'text-emerald-600 bg-emerald-100';
    case CommunityCategory.GOVERNANCE:
      return 'text-slate-600 bg-slate-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

// Community metrics and calculations
export const calculateEngagementScore = (community: Community): number => {
  const {
    member_count,
    active_votes_count,
    total_votes_count,
    average_rating,
    growth_rate
  } = community;

  // Normalize factors (0-1 scale)
  const memberFactor = Math.min(member_count / 1000, 1); // Cap at 1000 members
  const voteActivityFactor = active_votes_count > 0 ? Math.min(active_votes_count / 10, 1) : 0;
  const totalVoteFactor = Math.min(total_votes_count / 100, 1); // Cap at 100 votes
  const ratingFactor = average_rating / 5; // 5-star rating system
  const growthFactor = Math.min(Math.max(growth_rate, 0) / 50, 1); // Cap at 50% growth

  // Weighted average
  const weights = {
    members: 0.2,
    activity: 0.3,
    history: 0.2,
    rating: 0.2,
    growth: 0.1
  };

  return (
    memberFactor * weights.members +
    voteActivityFactor * weights.activity +
    totalVoteFactor * weights.history +
    ratingFactor * weights.rating +
    growthFactor * weights.growth
  ) * 100; // Convert to 0-100 scale
};

export const getHealthStatus = (community: Community): {
  status: 'healthy' | 'warning' | 'critical';
  label: string;
  color: string;
} => {
  const engagementScore = calculateEngagementScore(community);
  const daysSinceActivity = Math.floor(
    (Date.now() - new Date(community.last_activity).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (engagementScore > 70 && daysSinceActivity < 7) {
    return {
      status: 'healthy',
      label: 'Very Active',
      color: 'text-green-600'
    };
  } else if (engagementScore > 40 && daysSinceActivity < 14) {
    return {
      status: 'warning',
      label: 'Moderately Active',
      color: 'text-yellow-600'
    };
  } else {
    return {
      status: 'critical',
      label: 'Low Activity',
      color: 'text-red-600'
    };
  }
};

export const getJoinButtonState = (community: Community): {
  text: string;
  disabled: boolean;
  variant: 'primary' | 'secondary' | 'outline';
} => {
  if (!community.membership_status || community.membership_status === MembershipStatus.NOT_MEMBER) {
    if (community.require_approval) {
      return {
        text: 'Apply to Join',
        disabled: false,
        variant: 'primary'
      };
    } else {
      return {
        text: 'Join Community',
        disabled: false,
        variant: 'primary'
      };
    }
  }

  switch (community.membership_status) {
    case MembershipStatus.PENDING:
      return {
        text: 'Application Pending',
        disabled: true,
        variant: 'outline'
      };
    case MembershipStatus.ACTIVE:
      return {
        text: 'Leave Community',
        disabled: false,
        variant: 'outline'
      };
    case MembershipStatus.SUSPENDED:
      return {
        text: 'Membership Suspended',
        disabled: true,
        variant: 'outline'
      };
    case MembershipStatus.BANNED:
      return {
        text: 'Banned',
        disabled: true,
        variant: 'outline'
      };
    default:
      return {
        text: 'Join Community',
        disabled: false,
        variant: 'primary'
      };
  }
};

// Search and filtering utilities
export const generateSearchSuggestions = (query: string, communities: Community[]): string[] => {
  const suggestions = new Set<string>();
  const lowerQuery = query.toLowerCase();

  communities.forEach(community => {
    // Add community names that partially match
    if (community.name.toLowerCase().includes(lowerQuery)) {
      suggestions.add(community.name);
    }

    // Add category names
    if (community.category.toLowerCase().includes(lowerQuery)) {
      suggestions.add(community.category);
    }

    // Add tags
    community.tags?.forEach(tag => {
      if (tag.toLowerCase().includes(lowerQuery)) {
        suggestions.add(tag);
      }
    });
  });

  return Array.from(suggestions).slice(0, 5); // Limit to 5 suggestions
};

export const filterCommunities = (
  communities: Community[],
  filters: CommunityFilters
): Community[] => {
  return communities.filter(community => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        community.name.toLowerCase().includes(searchLower) ||
        community.description.toLowerCase().includes(searchLower) ||
        community.tags?.some(tag => tag.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }

    // Category filter
    if (filters.category && community.category !== filters.category) {
      return false;
    }

    // Member count filters
    if (filters.member_count_min && community.member_count < filters.member_count_min) {
      return false;
    }
    if (filters.member_count_max && community.member_count > filters.member_count_max) {
      return false;
    }

    // Rating filter
    if (filters.rating_min && community.average_rating < filters.rating_min) {
      return false;
    }

    // Boolean filters
    if (filters.require_approval !== undefined && community.require_approval !== filters.require_approval) {
      return false;
    }
    if (filters.is_private !== undefined && community.is_private !== filters.is_private) {
      return false;
    }
    if (filters.featured !== undefined && community.featured !== filters.featured) {
      return false;
    }
    if (filters.verified !== undefined && community.verified !== filters.verified) {
      return false;
    }

    // Active votes filter
    if (filters.has_active_votes && community.active_votes_count === 0) {
      return false;
    }

    // Status filter
    if (filters.status === 'active' && !community.is_active) {
      return false;
    }
    if (filters.status === 'inactive' && community.is_active) {
      return false;
    }

    return true;
  });
};

export const sortCommunities = (
  communities: Community[],
  sortBy: string,
  sortOrder: 'asc' | 'desc' = 'desc'
): Community[] => {
  const sorted = [...communities].sort((a, b) => {
    let valueA: any;
    let valueB: any;

    switch (sortBy) {
      case 'name':
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
        break;
      case 'member_count':
        valueA = a.member_count;
        valueB = b.member_count;
        break;
      case 'created_at':
        valueA = new Date(a.created_at).getTime();
        valueB = new Date(b.created_at).getTime();
        break;
      case 'last_activity':
        valueA = new Date(a.last_activity).getTime();
        valueB = new Date(b.last_activity).getTime();
        break;
      case 'average_rating':
        valueA = a.average_rating;
        valueB = b.average_rating;
        break;
      case 'growth_rate':
        valueA = a.growth_rate;
        valueB = b.growth_rate;
        break;
      case 'engagement_score':
        valueA = calculateEngagementScore(a);
        valueB = calculateEngagementScore(b);
        break;
      default:
        valueA = new Date(a.created_at).getTime();
        valueB = new Date(b.created_at).getTime();
    }

    if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return sorted;
};

// Validation utilities
export const validateCommunityName = (name: string): { valid: boolean; error?: string } => {
  if (!name.trim()) {
    return { valid: false, error: 'Community name is required' };
  }
  if (name.length < 3) {
    return { valid: false, error: 'Community name must be at least 3 characters' };
  }
  if (name.length > 100) {
    return { valid: false, error: 'Community name must be less than 100 characters' };
  }
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
    return { valid: false, error: 'Community name can only contain letters, numbers, spaces, hyphens, and underscores' };
  }
  return { valid: true };
};

export const validateDescription = (description: string): { valid: boolean; error?: string } => {
  if (!description.trim()) {
    return { valid: false, error: 'Description is required' };
  }
  if (description.length < 10) {
    return { valid: false, error: 'Description must be at least 10 characters' };
  }
  if (description.length > 500) {
    return { valid: false, error: 'Description must be less than 500 characters' };
  }
  return { valid: true };
};

// URL utilities
export const generateCommunitySlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

export const getCommunityUrl = (community: Community): string => {
  const slug = generateCommunitySlug(community.name);
  return `/communities/${community.id}/${slug}`;
};

export const getCommunityShareUrl = (community: Community): string => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  return `${baseUrl}${getCommunityUrl(community)}`;
}; 