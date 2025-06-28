import type { Community, CommunityFormData } from '../types/community';

/**
 * Format wallet address for display
 */
export const formatWalletAddress = (address: string, length: number = 8): string => {
  if (address.length <= length) return address;
  const start = Math.floor(length / 2);
  const end = length - start;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format date with time
 */
export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Calculate community health score based on various metrics
 */
export const calculateCommunityHealth = (community: Community): {
  score: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  factors: string[];
} => {
  let score = 0;
  const factors: string[] = [];

  // Active status
  if (community.is_active) {
    score += 25;
    factors.push('Community is active');
  } else {
    factors.push('Community is inactive');
  }

  // Member count
  if (community.member_count > 100) {
    score += 25;
    factors.push('Strong membership (100+)');
  } else if (community.member_count > 50) {
    score += 20;
    factors.push('Good membership (50+)');
  } else if (community.member_count > 10) {
    score += 15;
    factors.push('Growing membership (10+)');
  } else {
    score += 5;
    factors.push('Small membership (<10)');
  }

  // Voting threshold (balanced governance)
  if (community.voting_threshold >= 45 && community.voting_threshold <= 60) {
    score += 25;
    factors.push('Balanced voting threshold');
  } else if (community.voting_threshold >= 30 && community.voting_threshold <= 70) {
    score += 15;
    factors.push('Reasonable voting threshold');
  } else {
    score += 5;
    factors.push('Extreme voting threshold');
  }

  // Recent activity (based on updated_at)
  const daysSinceUpdate = Math.floor(
    (Date.now() - new Date(community.updated_at).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSinceUpdate <= 7) {
    score += 25;
    factors.push('Recent activity (within 7 days)');
  } else if (daysSinceUpdate <= 30) {
    score += 15;
    factors.push('Moderate activity (within 30 days)');
  } else if (daysSinceUpdate <= 90) {
    score += 10;
    factors.push('Low activity (within 90 days)');
  } else {
    score += 0;
    factors.push('No recent activity (90+ days)');
  }

  let status: 'excellent' | 'good' | 'fair' | 'poor';
  if (score >= 80) status = 'excellent';
  else if (score >= 60) status = 'good';
  else if (score >= 40) status = 'fair';
  else status = 'poor';

  return { score, status, factors };
};

/**
 * Validate community form data
 */
export const validateCommunityForm = (data: CommunityFormData): {
  isValid: boolean;
  errors: Partial<CommunityFormData>;
} => {
  const errors: Partial<CommunityFormData> = {};

  // Name validation
  if (!data.name.trim()) {
    errors.name = 'Community name is required';
  } else if (data.name.length < 3) {
    errors.name = 'Community name must be at least 3 characters';
  } else if (data.name.length > 100) {
    errors.name = 'Community name must be less than 100 characters';
  }

  // Description validation
  if (!data.description.trim()) {
    errors.description = 'Description is required';
  } else if (data.description.length < 10) {
    errors.description = 'Description must be at least 10 characters';
  } else if (data.description.length > 500) {
    errors.description = 'Description must be less than 500 characters';
  }

  // Voting threshold validation
  if (data.voting_threshold < 1 || data.voting_threshold > 100) {
    errors.voting_threshold = 'Voting threshold must be between 1 and 100';
  }

  // Voting periods validation
  if (data.min_voting_period < 1) {
    errors.min_voting_period = 'Minimum voting period must be at least 1 hour';
  }

  if (data.max_voting_period < data.min_voting_period) {
    errors.max_voting_period = 'Maximum voting period must be greater than minimum';
  }

  // Voting quorum validation
  if (data.voting_quorum < 1 || data.voting_quorum > 100) {
    errors.voting_quorum = 'Voting quorum must be between 1 and 100';
  }

  // Proposal bond validation
  if (data.proposal_bond < 0) {
    errors.proposal_bond = 'Proposal bond cannot be negative';
  }

  // Max members validation
  if (data.max_members && parseInt(data.max_members) < 1) {
    errors.max_members = 'Maximum members must be at least 1';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Generate community status badge info
 */
export const getCommunityStatusBadge = (community: Community): {
  text: string;
  className: string;
} => {
  if (community.is_active) {
    return {
      text: 'Active',
      className: 'bg-green-100 text-green-800',
    };
  } else {
    return {
      text: 'Inactive',
      className: 'bg-red-100 text-red-800',
    };
  }
};

/**
 * Generate community metrics for display
 */
export const getCommunityMetrics = (community: Community) => {
  const health = calculateCommunityHealth(community);
  const status = getCommunityStatusBadge(community);
  
  return {
    members: community.member_count,
    threshold: `${community.voting_threshold}%`,
    health: health.status,
    healthScore: health.score,
    status: status.text,
    statusClass: status.className,
    createdAt: formatDate(community.created_at),
    updatedAt: formatDate(community.updated_at),
    wallet: formatWalletAddress(community.wallet_address),
    admin: formatWalletAddress(community.admin_address),
  };
};

/**
 * Sort communities by different criteria
 */
export const sortCommunities = (
  communities: Community[],
  sortBy: 'name' | 'created_at' | 'member_count' | 'updated_at',
  sortOrder: 'asc' | 'desc' = 'desc'
): Community[] => {
  return [...communities].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'member_count':
        comparison = a.member_count - b.member_count;
        break;
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'updated_at':
        comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });
};

/**
 * Filter communities based on criteria
 */
export const filterCommunities = (
  communities: Community[],
  filters: {
    search?: string;
    is_active?: boolean;
    min_members?: number;
    max_members?: number;
  }
): Community[] => {
  return communities.filter(community => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        community.name.toLowerCase().includes(searchLower) ||
        community.description.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Active status filter
    if (filters.is_active !== undefined) {
      if (community.is_active !== filters.is_active) return false;
    }

    // Member count filters
    if (filters.min_members !== undefined) {
      if (community.member_count < filters.min_members) return false;
    }

    if (filters.max_members !== undefined) {
      if (community.member_count > filters.max_members) return false;
    }

    return true;
  });
}; 