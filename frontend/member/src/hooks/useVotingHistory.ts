// Voting History Hook for Member Portal
// React hook for managing user voting history and related data

import { useState, useEffect, useCallback, useRef } from 'react';
import votingService from '../services/voting';
import {
  VotingHistoryResponse,
  VotingFilters,
  Vote,
  VotingQuestion,
  PaginationState,
  UseVotingHistoryReturn
} from '../types/voting';

export const useVotingHistory = (initialFilters: VotingFilters = {}): UseVotingHistoryReturn => {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [questions, setQuestions] = useState<VotingQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<VotingFilters>(initialFilters);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false
  });

  const mountedRef = useRef(true);
  const loadingRef = useRef(false);

  const isMounted = () => mountedRef.current;

  const loadHistory = useCallback(async (
    newFilters: VotingFilters = filters,
    page: number = 1,
    append: boolean = false
  ) => {
    if (!isMounted() || loadingRef.current) return;

    try {
      loadingRef.current = true;
      setLoading(true);
      setError(null);

      const response = await votingService.getUserVotingHistory(
        newFilters, 
        page, 
        pagination.limit
      );
      
      if (!isMounted()) return;

      if (append) {
        setVotes(prev => {
          const existingIds = new Set(prev.map(v => v.id));
          const newVotes = response.votes.filter(v => !existingIds.has(v.id));
          return [...prev, ...newVotes];
        });
        
        setQuestions(prev => {
          const existingIds = new Set(prev.map(q => q.id));
          const newQuestions = response.questions.filter(q => !existingIds.has(q.id));
          return [...prev, ...newQuestions];
        });
      } else {
        setVotes(response.votes);
        setQuestions(response.questions);
      }
      
      setPagination({
        page: response.pagination.page,
        limit: response.pagination.limit,
        total: response.pagination.total,
        hasMore: response.pagination.page < response.pagination.totalPages
      });
      
      setFilters(newFilters);
    } catch (err) {
      if (!isMounted()) return;
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to load voting history';
      setError(errorMessage);
      console.error('Error loading voting history:', errorMessage);
    } finally {
      if (isMounted()) {
        setLoading(false);
      }
      loadingRef.current = false;
    }
  }, [filters, pagination.limit]);

  const loadMore = useCallback(async () => {
    if (pagination.hasMore && !loading && !loadingRef.current && isMounted()) {
      await loadHistory(filters, pagination.page + 1, true);
    }
  }, [loadHistory, filters, pagination.hasMore, pagination.page, loading]);

  const refresh = useCallback(() => {
    if (isMounted() && !loadingRef.current) {
      loadHistory(filters, 1, false);
    }
  }, [loadHistory, filters]);

  const updateFilters = useCallback((newFilters: Partial<VotingFilters>) => {
    if (isMounted() && !loadingRef.current) {
      const updatedFilters = { ...filters, ...newFilters };
      loadHistory(updatedFilters, 1, false);
    }
  }, [loadHistory, filters]);

  const clearHistory = useCallback(() => {
    if (isMounted()) {
      setVotes([]);
      setQuestions([]);
      setError(null);
      setPagination({
        page: 1,
        limit: 20,
        total: 0,
        hasMore: false
      });
    }
  }, []);

  // Get question for a specific vote
  const getQuestionForVote = useCallback((voteId: string): VotingQuestion | undefined => {
    const vote = votes.find(v => v.id === voteId);
    if (!vote) return undefined;
    
    return questions.find(q => q.id === vote.questionId);
  }, [votes, questions]);

  // Get votes for a specific question
  const getVotesForQuestion = useCallback((questionId: string): Vote[] => {
    return votes.filter(v => v.questionId === questionId);
  }, [votes]);

  // Filter votes by date range
  const getVotesByDateRange = useCallback((start: Date, end: Date): Vote[] => {
    return votes.filter(vote => {
      const voteDate = new Date(vote.timestamp);
      return voteDate >= start && voteDate <= end;
    });
  }, [votes]);

  // Get voting participation statistics
  const getParticipationStats = useCallback(() => {
    const totalQuestions = questions.length;
    const totalVotes = votes.length;
    const questionsWithVotes = new Set(votes.map(v => v.questionId)).size;
    
    const participationRate = totalQuestions > 0 ? 
      (questionsWithVotes / totalQuestions) * 100 : 0;
    
    // Calculate votes by month for trend analysis
    const votesByMonth = votes.reduce((acc, vote) => {
      const monthKey = new Date(vote.timestamp).toISOString().substring(0, 7); // YYYY-MM
      acc[monthKey] = (acc[monthKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalQuestions,
      totalVotes,
      questionsWithVotes,
      participationRate: Math.round(participationRate * 100) / 100,
      votesByMonth
    };
  }, [votes, questions]);

  // Initial load
  useEffect(() => {
    loadHistory(initialFilters, 1, false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Component mount/unmount tracking
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      loadingRef.current = false;
    };
  }, []);

  return {
    votes,
    questions,
    loading,
    error: error as any, // Type assertion to match UseVotingHistoryReturn interface
    pagination,
    loadHistory,
    loadMore,
    updateFilters,
    refresh,
    clearHistory,
    getQuestionForVote,
    getVotesForQuestion,
    getVotesByDateRange,
    getParticipationStats
  };
};

// Hook for voting activity feed
export const useVotingActivity = (limit: number = 10, communityId?: string) => {
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchActivity = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      setLoading(true);
      setError(null);

      const response = await votingService.getVotingActivity(limit, communityId);
      
      if (!mountedRef.current) return;
      
      setActivity(response);
    } catch (err) {
      if (!mountedRef.current) return;
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch voting activity';
      setError(errorMessage);
      console.error('Error fetching voting activity:', errorMessage);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [limit, communityId]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(() => {
    if (mountedRef.current) {
      fetchActivity();
    }
  }, [fetchActivity]);

  return {
    activity,
    loading,
    error,
    refresh
  };
};

export default useVotingHistory; 