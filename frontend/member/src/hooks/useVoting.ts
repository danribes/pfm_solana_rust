// Voting Hooks for Member Portal
// React hooks for voting state management and API interactions

import { useState, useEffect, useCallback, useRef } from 'react';
import votingService from '../services/voting';
import {
  VotingQuestion,
  VotingQuestionsResponse,
  VotingFilters,
  CastVoteDTO,
  VotingState,
  VotingError,
  VotingStatsResponse,
  Vote,
  VotingResult,
  PaginationState,
  UseVotingReturn
} from '../types/voting';

// Main voting hook for questions and vote casting
export const useVoting = (initialFilters: VotingFilters = {}): UseVotingReturn => {
  const [questions, setQuestions] = useState<VotingQuestion[]>([]);
  const [activeQuestion, setActiveQuestion] = useState<VotingQuestion | null>(null);
  const [userVotes, setUserVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<VotingError | null>(null);
  const [filters, setFilters] = useState<VotingFilters>(initialFilters);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false
  });

  // Ref to track mounted state to prevent memory leaks
  const mountedRef = useRef(true);

  // Utility function to check if component is still mounted
  const isMounted = () => mountedRef.current;

  const loadQuestions = useCallback(async (
    newFilters: VotingFilters = filters,
    page: number = 1,
    append: boolean = false
  ) => {
    if (!isMounted()) return;

    try {
      setLoading(true);
      setError(null);

      const response = await votingService.getVotingQuestions(newFilters, page, pagination.limit);
      
      if (!isMounted()) return;

      if (append) {
        setQuestions(prev => [...prev, ...response.questions]);
      } else {
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
      
      const error = err instanceof Error ? err.message : 'Failed to load voting questions';
      setError(VotingError.SERVER_ERROR);
      console.error('Error loading voting questions:', error);
    } finally {
      if (isMounted()) {
        setLoading(false);
      }
    }
  }, [filters, pagination.limit]);

  const loadQuestion = useCallback(async (id: string) => {
    if (!isMounted()) return;

    try {
      setLoading(true);
      setError(null);

      const question = await votingService.getVotingQuestion(id);
      
      if (!isMounted()) return;
      
      setActiveQuestion(question);
      
      // Update the question in the questions list if it exists
      setQuestions(prev => prev.map(q => q.id === id ? question : q));
    } catch (err) {
      if (!isMounted()) return;
      
      const error = err instanceof Error ? err.message : 'Failed to load voting question';
      if (error.includes('not found')) {
        setError(VotingError.QUESTION_NOT_FOUND);
      } else {
        setError(VotingError.SERVER_ERROR);
      }
      console.error('Error loading voting question:', error);
    } finally {
      if (isMounted()) {
        setLoading(false);
      }
    }
  }, []);

  const castVote = useCallback(async (vote: CastVoteDTO) => {
    if (!isMounted()) return;

    try {
      setLoading(true);
      setError(null);

      // Optimistic update
      const questionToUpdate = questions.find(q => q.id === vote.questionId) || activeQuestion;
      
      if (questionToUpdate) {
        const optimisticQuestion = {
          ...questionToUpdate,
          userHasVoted: true,
          totalVotes: questionToUpdate.totalVotes + 1
        };
        
        if (activeQuestion?.id === vote.questionId) {
          setActiveQuestion(optimisticQuestion);
        }
        setQuestions(prev => prev.map(q => 
          q.id === vote.questionId ? optimisticQuestion : q
        ));
      }

      const response = await votingService.castVote(vote);
      
      if (!isMounted()) return;

      // Update with actual response
      const updatedQuestion = response.updatedQuestion;
      
      if (activeQuestion?.id === vote.questionId) {
        setActiveQuestion(updatedQuestion);
      }
      
      setQuestions(prev => prev.map(q => 
        q.id === vote.questionId ? updatedQuestion : q
      ));
      
      setUserVotes(prev => [...prev, response.vote]);

    } catch (err) {
      if (!isMounted()) return;
      
      // Revert optimistic update on error
      await loadQuestion(vote.questionId);
      
      const error = err instanceof Error ? err.message : 'Failed to cast vote';
      
      if (error.includes('already voted')) {
        setError(VotingError.ALREADY_VOTED);
      } else if (error.includes('Unauthorized')) {
        setError(VotingError.UNAUTHORIZED);
      } else if (error.includes('closed')) {
        setError(VotingError.VOTING_CLOSED);
      } else if (error.includes('Invalid')) {
        setError(VotingError.INVALID_OPTION);
      } else {
        setError(VotingError.SERVER_ERROR);
      }
      
      console.error('Error casting vote:', error);
      throw err;
    } finally {
      if (isMounted()) {
        setLoading(false);
      }
    }
  }, [questions, activeQuestion, loadQuestion]);

  const loadUserVotes = useCallback(async () => {
    if (!isMounted()) return;

    try {
      setError(null);
      
      const response = await votingService.getUserVotingHistory({}, 1, 100);
      
      if (!isMounted()) return;
      
      setUserVotes(response.votes);
    } catch (err) {
      if (!isMounted()) return;
      
      console.error('Error loading user votes:', err);
      // Don't set error state for user votes as it's not critical
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (pagination.hasMore && !loading && isMounted()) {
      await loadQuestions(filters, pagination.page + 1, true);
    }
  }, [loadQuestions, filters, pagination.hasMore, pagination.page, loading]);

  const refresh = useCallback(() => {
    if (isMounted()) {
      loadQuestions(filters, 1, false);
    }
  }, [loadQuestions, filters]);

  const updateFilters = useCallback((newFilters: Partial<VotingFilters>) => {
    if (isMounted()) {
      const updatedFilters = { ...filters, ...newFilters };
      loadQuestions(updatedFilters, 1, false);
    }
  }, [loadQuestions, filters]);

  const clearError = useCallback(() => {
    if (isMounted()) {
      setError(null);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadQuestions(initialFilters, 1, false);
    loadUserVotes();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const state: VotingState = {
    questions,
    activeQuestion,
    userVotes,
    loading,
    error,
    pagination,
    filters
  };

  const actions = {
    loadQuestions,
    loadQuestion,
    castVote,
    loadUserVotes,
    clearError,
    setFilters: updateFilters,
    loadMore
  };

  return {
    state,
    actions
  };
};

// Hook for voting statistics
export const useVotingStats = (communityId?: string) => {
  const [stats, setStats] = useState<VotingStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchStats = useCallback(async (cId?: string) => {
    if (!mountedRef.current) return;

    try {
      setLoading(true);
      setError(null);

      const response = await votingService.getVotingStats(cId);
      
      if (!mountedRef.current) return;
      
      setStats(response);
    } catch (err) {
      if (!mountedRef.current) return;
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch voting statistics';
      setError(errorMessage);
      console.error('Error fetching voting stats:', errorMessage);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchStats(communityId);
  }, [fetchStats, communityId]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(() => {
    if (mountedRef.current) {
      fetchStats(communityId);
    }
  }, [fetchStats, communityId]);

  return {
    stats,
    loading,
    error,
    refresh
  };
};

// Hook for voting results
export const useVotingResults = (questionId: string | null) => {
  const [results, setResults] = useState<VotingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchResults = useCallback(async (id: string) => {
    if (!mountedRef.current) return;

    try {
      setLoading(true);
      setError(null);

      const response = await votingService.getVotingResults(id);
      
      if (!mountedRef.current) return;
      
      setResults(response);
    } catch (err) {
      if (!mountedRef.current) return;
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch voting results';
      setError(errorMessage);
      console.error('Error fetching voting results:', errorMessage);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (questionId) {
      fetchResults(questionId);
    } else {
      setResults(null);
      setError(null);
    }
  }, [questionId, fetchResults]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(() => {
    if (questionId && mountedRef.current) {
      fetchResults(questionId);
    }
  }, [questionId, fetchResults]);

  return {
    results,
    loading,
    error,
    refresh
  };
};

// Hook for vote validation
export const useVoteValidation = () => {
  const [validationLoading, setValidationLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors: string[];
  } | null>(null);

  const validateVote = useCallback(async (questionId: string, optionIds: string[]) => {
    try {
      setValidationLoading(true);
      
      const result = await votingService.validateVote(questionId, optionIds);
      setValidationResult(result);
      
      return result;
    } catch (err) {
      const result = {
        valid: false,
        errors: ['Validation failed: ' + (err instanceof Error ? err.message : 'Unknown error')]
      };
      setValidationResult(result);
      return result;
    } finally {
      setValidationLoading(false);
    }
  }, []);

  const clearValidation = useCallback(() => {
    setValidationResult(null);
  }, []);

  return {
    validateVote,
    validationLoading,
    validationResult,
    clearValidation
  };
}; 