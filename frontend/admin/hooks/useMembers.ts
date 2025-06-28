import { useState, useEffect, useCallback } from 'react';
import { 
  Member, 
  MemberFilters, 
  MembersPaginationResult, 
  PendingApplication, 
  MemberAnalytics,
  MemberActivity,
  BulkMemberAction,
  RoleChange
} from '../types/member';
import memberService from '../services/members';

// Hook for managing community members
export const useMembers = (communityId: string, initialFilters: MemberFilters = {}) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState<MemberFilters>(initialFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async (newFilters?: MemberFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const filterToUse = newFilters || filters;
      const result = await memberService.getCommunityMembers(communityId, filterToUse);
      setMembers(result.members);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  }, [communityId, filters]);

  const updateFilters = useCallback((newFilters: Partial<MemberFilters>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    fetchMembers(updatedFilters);
  }, [filters, fetchMembers]);

  const changePage = useCallback((page: number) => {
    const updatedFilters = { ...filters, page };
    setFilters(updatedFilters);
    fetchMembers(updatedFilters);
  }, [filters, fetchMembers]);

  const refreshMembers = useCallback(() => {
    fetchMembers();
  }, [fetchMembers]);

  useEffect(() => {
    if (communityId) {
      fetchMembers();
    }
  }, [communityId, fetchMembers]);

  return {
    members,
    pagination,
    filters,
    loading,
    error,
    updateFilters,
    changePage,
    refreshMembers
  };
};

// Hook for managing pending applications
export const usePendingApplications = (communityId: string) => {
  const [applications, setApplications] = useState<PendingApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await memberService.getPendingApplications(communityId);
      setApplications(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  const approveMember = useCallback(async (memberId: string, note?: string) => {
    try {
      await memberService.approveMember(communityId, memberId, note);
      setApplications(prev => prev.filter(app => app.id !== memberId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve member');
      return false;
    }
  }, [communityId]);

  const rejectMember = useCallback(async (memberId: string, reason?: string) => {
    try {
      await memberService.rejectMember(communityId, memberId, reason);
      setApplications(prev => prev.filter(app => app.id !== memberId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject member');
      return false;
    }
  }, [communityId]);

  const bulkApprove = useCallback(async (memberIds: string[], note?: string) => {
    try {
      const bulkAction: BulkMemberAction = {
        action: 'approve',
        member_ids: memberIds,
        note
      };
      await memberService.bulkMemberAction(communityId, bulkAction);
      setApplications(prev => prev.filter(app => !memberIds.includes(app.id)));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bulk approve members');
      return false;
    }
  }, [communityId]);

  const bulkReject = useCallback(async (memberIds: string[], reason?: string) => {
    try {
      const bulkAction: BulkMemberAction = {
        action: 'reject',
        member_ids: memberIds,
        reason
      };
      await memberService.bulkMemberAction(communityId, bulkAction);
      setApplications(prev => prev.filter(app => !memberIds.includes(app.id)));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bulk reject members');
      return false;
    }
  }, [communityId]);

  useEffect(() => {
    if (communityId) {
      fetchApplications();
    }
  }, [communityId, fetchApplications]);

  return {
    applications,
    loading,
    error,
    fetchApplications,
    approveMember,
    rejectMember,
    bulkApprove,
    bulkReject
  };
};

// Hook for member analytics
export const useMemberAnalytics = (communityId: string) => {
  const [analytics, setAnalytics] = useState<MemberAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await memberService.getMemberAnalytics(communityId);
      setAnalytics(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  useEffect(() => {
    if (communityId) {
      fetchAnalytics();
    }
  }, [communityId, fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refreshAnalytics: fetchAnalytics
  };
};

// Hook for individual member management
export const useMemberActions = (communityId: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removeMember = useCallback(async (memberId: string, reason?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await memberService.removeMember(communityId, memberId, reason);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
      return false;
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  const updateRole = useCallback(async (memberId: string, roleChange: RoleChange) => {
    setLoading(true);
    setError(null);
    
    try {
      await memberService.updateMemberRole(communityId, memberId, roleChange);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update member role');
      return false;
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  const exportMembers = useCallback(async (filters: MemberFilters = {}, format: 'csv' | 'json' = 'csv') => {
    setLoading(true);
    setError(null);
    
    try {
      const blob = await memberService.exportMembers(communityId, filters, format);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `members-${communityId}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export members');
      return false;
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  return {
    loading,
    error,
    removeMember,
    updateRole,
    exportMembers
  };
};

// Hook for member activity
export const useMemberActivity = (communityId: string, memberId: string) => {
  const [activities, setActivities] = useState<MemberActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivity = useCallback(async (limit: number = 50) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await memberService.getMemberActivity(communityId, memberId, limit);
      setActivities(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch member activity');
    } finally {
      setLoading(false);
    }
  }, [communityId, memberId]);

  useEffect(() => {
    if (communityId && memberId) {
      fetchActivity();
    }
  }, [communityId, memberId, fetchActivity]);

  return {
    activities,
    loading,
    error,
    refreshActivity: fetchActivity
  };
}; 