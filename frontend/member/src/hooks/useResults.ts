// Results Hook for State Management
// Task 4.4.4 - Comprehensive hook for results visualization and analytics

import { useState, useEffect, useCallback, useReducer } from 'react';
import {
  VotingResult,
  VotingResultsResponse,
  CommunityAnalytics,
  PersonalAnalytics,
  ResultsFilter,
  AnalyticsQuery,
  ResultsState,
  ResultsAction,
  ResultsActionType
} from '../types/results';
import { resultsService } from '../services/results';

// ============================================================================
// STATE REDUCER
// ============================================================================

const initialState: ResultsState = {
  results: [],
  communityAnalytics: null,
  personalAnalytics: null,
  filters: {},
  loading: false,
  error: null,
  lastUpdated: null,
  realTimeUpdates: false,
  selectedResult: null
};

function resultsReducer(state: ResultsState, action: ResultsAction): ResultsState {
  switch (action.type) {
    case 'LOAD_RESULTS_START':
      return { ...state, loading: true, error: null };
    case 'LOAD_RESULTS_SUCCESS':
      return {
        ...state,
        loading: false,
        results: action.payload.results,
        lastUpdated: new Date().toISOString(),
        error: null
      };
    case 'LOAD_RESULTS_ERROR':
      return { ...state, loading: false, error: action.payload.error, results: [] };
    case 'UPDATE_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload.filters } };
    case 'SELECT_RESULT':
      return { ...state, selectedResult: action.payload.result };
    case 'CLEAR_SELECTION':
      return { ...state, selectedResult: null };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

// ============================================================================
// RESULTS HOOK
// ============================================================================

export interface UseResultsReturn {
  results: VotingResult[];
  communityAnalytics: CommunityAnalytics | null;
  personalAnalytics: PersonalAnalytics | null;
  selectedResult: VotingResult | null;
  filters: ResultsFilter;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  
  loadResults: (filters?: ResultsFilter) => Promise<void>;
  loadResultById: (questionId: string) => Promise<void>;
  updateFilters: (newFilters: Partial<ResultsFilter>) => void;
  selectResult: (result: VotingResult | null) => void;
  clearError: () => void;
  getResultsByStatus: (status: 'active' | 'completed' | 'cancelled') => VotingResult[];
}

export const useResults = (): UseResultsReturn => {
  const [state, dispatch] = useReducer(resultsReducer, initialState);

  const loadResults = useCallback(async (filters: ResultsFilter = {}): Promise<void> => {
    try {
      dispatch({ type: 'LOAD_RESULTS_START' });
      const response = await resultsService.getVotingResults(filters);
      dispatch({ type: 'LOAD_RESULTS_SUCCESS', payload: { results: response.results } });
    } catch (error: any) {
      dispatch({ type: 'LOAD_RESULTS_ERROR', payload: { error: error.message } });
    }
  }, []);

  const loadResultById = useCallback(async (questionId: string): Promise<void> => {
    try {
      const result = await resultsService.getVotingResultById(questionId);
      dispatch({ type: 'SELECT_RESULT', payload: { result } });
    } catch (error: any) {
      dispatch({ type: 'LOAD_RESULTS_ERROR', payload: { error: error.message } });
    }
  }, []);

  const updateFilters = useCallback((newFilters: Partial<ResultsFilter>): void => {
    dispatch({ type: 'UPDATE_FILTERS', payload: { filters: newFilters } });
  }, []);

  const selectResult = useCallback((result: VotingResult | null): void => {
    if (result) {
      dispatch({ type: 'SELECT_RESULT', payload: { result } });
    } else {
      dispatch({ type: 'CLEAR_SELECTION' });
    }
  }, []);

  const clearError = useCallback((): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const getResultsByStatus = useCallback((status: 'active' | 'completed' | 'cancelled'): VotingResult[] => {
    return state.results.filter(result => result.status === status);
  }, [state.results]);

  return {
    results: state.results,
    communityAnalytics: state.communityAnalytics,
    personalAnalytics: state.personalAnalytics,
    selectedResult: state.selectedResult,
    filters: state.filters,
    loading: state.loading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    loadResults,
    loadResultById,
    updateFilters,
    selectResult,
    clearError,
    getResultsByStatus
  };
};

export default useResults;
