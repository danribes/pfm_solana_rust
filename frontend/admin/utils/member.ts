import { Member, MemberRole, MemberStatus, MemberAnalytics } from '../types/member';

// Format member display name
export const formatMemberName = (member: Member): string => {
  return member.User?.username || `Member ${member.id.slice(0, 8)}`;
};

// Format wallet address for display
export const formatWalletAddress = (address?: string): string => {
  if (!address) return 'No wallet';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Get member status display info
export const getMemberStatusInfo = (status: MemberStatus) => {
  switch (status) {
    case MemberStatus.APPROVED:
      return {
        label: 'Approved',
        color: 'text-green-600 bg-green-100',
        icon: '✅'
      };
    case MemberStatus.PENDING:
      return {
        label: 'Pending',
        color: 'text-yellow-600 bg-yellow-100',
        icon: '⏳'
      };
    case MemberStatus.REJECTED:
      return {
        label: 'Rejected',
        color: 'text-red-600 bg-red-100',
        icon: '❌'
      };
    case MemberStatus.BANNED:
      return {
        label: 'Banned',
        color: 'text-red-800 bg-red-200',
        icon: '🚫'
      };
    default:
      return {
        label: 'Unknown',
        color: 'text-gray-600 bg-gray-100',
        icon: '❓'
      };
  }
};

// Get member role display info
export const getMemberRoleInfo = (role: MemberRole) => {
  switch (role) {
    case MemberRole.ADMIN:
      return {
        label: 'Admin',
        color: 'text-purple-600 bg-purple-100',
        icon: '👑',
        priority: 3
      };
    case MemberRole.MODERATOR:
      return {
        label: 'Moderator',
        color: 'text-blue-600 bg-blue-100',
        icon: '🛡️',
        priority: 2
      };
    case MemberRole.MEMBER:
      return {
        label: 'Member',
        color: 'text-gray-600 bg-gray-100',
        icon: '👤',
        priority: 1
      };
    default:
      return {
        label: 'Unknown',
        color: 'text-gray-600 bg-gray-100',
        icon: '❓',
        priority: 0
      };
  }
};

// Calculate member engagement level
export const calculateEngagementLevel = (member: Member): 'high' | 'medium' | 'low' => {
  // This is a simplified calculation - in real app, this would use actual activity data
  const daysSinceJoined = Math.floor(
    (Date.now() - new Date(member.joined_at).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysSinceJoined < 7) return 'high'; // New members are considered high engagement
  if (daysSinceJoined < 30) return 'medium';
  return 'low';
};

// Get risk level for pending applications
export const calculateRiskLevel = (member: Member): { level: 'low' | 'medium' | 'high'; score: number } => {
  let score = 50; // Base score
  
  // Wallet age (if available)
  const accountAge = member.User?.created_at 
    ? Math.floor((Date.now() - new Date(member.User.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  
  if (accountAge > 365) score += 20;
  else if (accountAge > 90) score += 10;
  else if (accountAge < 7) score -= 20;
  
  // Email verification
  if (member.User?.email) score += 15;
  
  // Determine risk level
  let level: 'low' | 'medium' | 'high';
  if (score >= 80) level = 'low';
  else if (score >= 50) level = 'medium';
  else level = 'high';
  
  return { level, score };
};

// Validate role change permissions
export const canChangeRole = (
  currentUserRole: MemberRole,
  targetMemberRole: MemberRole,
  newRole: MemberRole
): boolean => {
  const roleHierarchy = {
    [MemberRole.ADMIN]: 3,
    [MemberRole.MODERATOR]: 2,
    [MemberRole.MEMBER]: 1
  };
  
  const currentUserLevel = roleHierarchy[currentUserRole];
  const targetMemberLevel = roleHierarchy[targetMemberRole];
  const newRoleLevel = roleHierarchy[newRole];
  
  // User must have higher role than both current and target roles
  return currentUserLevel > targetMemberLevel && currentUserLevel > newRoleLevel;
};

// Format member join date
export const formatJoinDate = (joinDate: string): string => {
  const date = new Date(joinDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  
  return date.toLocaleDateString();
};

// Generate member analytics summary
export const generateAnalyticsSummary = (analytics: MemberAnalytics) => {
  const totalActive = analytics.active_members;
  const totalMembers = analytics.total_members;
  const activePercentage = totalMembers > 0 ? Math.round((totalActive / totalMembers) * 100) : 0;
  
  const pendingApplications = analytics.pending_applications;
  const recentActivity = analytics.recent_activity;
  
  return {
    activePercentage,
    pendingApplications,
    newApplicationsToday: recentActivity.new_applications,
    approvedToday: recentActivity.approved_today,
    rejectedToday: recentActivity.rejected_today,
    totalMembers,
    totalActive,
    roleDistribution: analytics.role_distribution,
    engagementDistribution: analytics.engagement_metrics
  };
};

// Sort members by various criteria
export const sortMembers = (
  members: Member[],
  sortBy: 'name' | 'role' | 'status' | 'joined_at' | 'updated_at',
  order: 'asc' | 'desc' = 'asc'
): Member[] => {
  const sorted = [...members].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        const nameA = formatMemberName(a).toLowerCase();
        const nameB = formatMemberName(b).toLowerCase();
        comparison = nameA.localeCompare(nameB);
        break;
      case 'role':
        const roleA = getMemberRoleInfo(a.role).priority;
        const roleB = getMemberRoleInfo(b.role).priority;
        comparison = roleA - roleB;
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'joined_at':
        comparison = new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime();
        break;
      case 'updated_at':
        comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
        break;
    }
    
    return order === 'desc' ? -comparison : comparison;
  });
  
  return sorted;
};

// Filter members based on criteria
export const filterMembers = (
  members: Member[],
  filters: {
    search?: string;
    status?: MemberStatus;
    role?: MemberRole;
    engagementLevel?: 'high' | 'medium' | 'low';
  }
): Member[] => {
  return members.filter(member => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const memberName = formatMemberName(member).toLowerCase();
      const walletAddress = member.User?.wallet_address?.toLowerCase() || '';
      const email = member.User?.email?.toLowerCase() || '';
      
      if (!memberName.includes(searchTerm) && 
          !walletAddress.includes(searchTerm) && 
          !email.includes(searchTerm)) {
        return false;
      }
    }
    
    // Status filter
    if (filters.status && member.status !== filters.status) {
      return false;
    }
    
    // Role filter
    if (filters.role && member.role !== filters.role) {
      return false;
    }
    
    // Engagement level filter
    if (filters.engagementLevel && calculateEngagementLevel(member) !== filters.engagementLevel) {
      return false;
    }
    
    return true;
  });
};

// Export member data to CSV format
export const exportMembersToCSV = (members: Member[]): string => {
  const headers = [
    'ID',
    'Username',
    'Wallet Address',
    'Email',
    'Role',
    'Status',
    'Joined Date',
    'Approved Date',
    'Last Updated'
  ];
  
  const rows = members.map(member => [
    member.id,
    member.User?.username || '',
    member.User?.wallet_address || '',
    member.User?.email || '',
    member.role,
    member.status,
    new Date(member.joined_at).toISOString(),
    member.approved_at ? new Date(member.approved_at).toISOString() : '',
    new Date(member.updated_at).toISOString()
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');
  
  return csvContent;
};

// Validate member data
export const validateMemberData = (memberData: Partial<Member>): string[] => {
  const errors: string[] = [];
  
  if (!memberData.user_id) {
    errors.push('User ID is required');
  }
  
  if (!memberData.community_id) {
    errors.push('Community ID is required');
  }
  
  if (memberData.role && !Object.values(MemberRole).includes(memberData.role)) {
    errors.push('Invalid role specified');
  }
  
  if (memberData.status && !Object.values(MemberStatus).includes(memberData.status)) {
    errors.push('Invalid status specified');
  }
  
  return errors;
}; 