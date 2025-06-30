// Campaign Management Hook for Task 4.4.6
// Active Polls & Voting Campaigns Display

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Campaign,
  CampaignFilters,
  UserVotingStatus,
  UseCampaignsResult,
  CampaignProgressInfo
} from "../types/campaign";
import { campaignService } from "../services/campaigns";

export function useCampaigns(initialFilters: CampaignFilters = {}): UseCampaignsResult {
  // State management
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CampaignFilters>(initialFilters);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [userStatuses, setUserStatuses] = useState<Record<string, UserVotingStatus>>({});
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Refs for cleanup and optimization
  const abortControllerRef = useRef<AbortController | null>(null);
  const subscriptionsRef = useRef<(() => void)[]>([]);

  /**
   * Load campaigns with current filters
   */
  const loadCampaigns = useCallback(async (
    loadFilters: CampaignFilters = filters,
    append: boolean = false
  ) => {
    try {
      // Cancel previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      
      if (!append) {
        setIsLoading(true);
      }
      setError(null);

      const response = await campaignService.getCampaigns({
        ...loadFilters,
        page: append ? currentPage + 1 : 1,
        limit: loadFilters.limit || 12,
      });

      if (append) {
        setCampaigns(prev => [...prev, ...response.campaigns]);
        setCurrentPage(prev => prev + 1);
      } else {
        setCampaigns(response.campaigns);
        setCurrentPage(1);
      }

      setHasMore(response.pagination.hasNext);

      // Load user voting statuses for displayed campaigns
      if (response.campaigns.length > 0) {
        const campaignIds = response.campaigns.map(c => c.id);
        try {
          const statuses = await campaignService.getUserVotingStatuses(campaignIds);
          setUserStatuses(prev => ({ ...prev, ...statuses }));
        } catch (statusError) {
          console.warn("Failed to load user voting statuses:", statusError);
        }
      }

    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err.message);
        console.error("Error loading campaigns:", err);
      }
    } finally {
      if (!append) {
        setIsLoading(false);
      }
    }
  }, [filters, currentPage]);

  /**
   * Refresh campaigns (reload from beginning)
   */
  const refreshCampaigns = useCallback(async () => {
    setCurrentPage(1);
    await loadCampaigns(filters, false);
  }, [loadCampaigns, filters]);

  /**
   * Load more campaigns (pagination)
   */
  const loadMoreCampaigns = useCallback(async () => {
    if (hasMore && !isLoading) {
      await loadCampaigns(filters, true);
    }
  }, [loadCampaigns, filters, hasMore, isLoading]);

  /**
   * Update filters and reload campaigns
   */
  const updateFilters = useCallback((newFilters: CampaignFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    // Campaign loading will be triggered by useEffect
  }, []);

  /**
   * Select a specific campaign
   */
  const selectCampaign = useCallback((campaign: Campaign | null) => {
    setSelectedCampaign(campaign);
  }, []);

  /**
   * Get user voting status for specific campaign
   */
  const getUserStatus = useCallback((campaignId: string): UserVotingStatus | null => {
    return userStatuses[campaignId] || null;
  }, [userStatuses]);

  /**
   * Search campaigns with text query
   */
  const searchCampaigns = useCallback(async (query: string): Promise<Campaign[]> => {
    try {
      return await campaignService.searchCampaigns(query);
    } catch (err) {
      console.error("Error searching campaigns:", err);
      return [];
    }
  }, []);

  /**
   * Subscribe to real-time updates for active campaigns
   */
  const subscribeToUpdates = useCallback(() => {
    // Clean up existing subscriptions
    subscriptionsRef.current.forEach(cleanup => cleanup());
    subscriptionsRef.current = [];

    const activeCampaigns = campaigns.filter(
      c => c.status === "active" || c.status === "ending_soon"
    );

    if (activeCampaigns.length > 0) {
      const cleanup = campaignService.subscribeToMultipleCampaigns(
        activeCampaigns.map(c => c.id),
        (campaignId, updatedCampaign) => {
          setCampaigns(prev =>
            prev.map(c => c.id === campaignId ? updatedCampaign : c)
          );
        },
        (error) => {
          console.error("Real-time update error:", error);
        }
      );

      subscriptionsRef.current.push(cleanup);
    }
  }, [campaigns]);

  /**
   * Load campaign progress for selected campaign
   */
  const loadCampaignProgress = useCallback(async (campaignId: string): Promise<CampaignProgressInfo | null> => {
    try {
      return await campaignService.getCampaignProgress(campaignId);
    } catch (err) {
      console.error("Error loading campaign progress:", err);
      return null;
    }
  }, []);

  // Effects
  
  /**
   * Load campaigns when filters change
   */
  useEffect(() => {
    loadCampaigns(filters, false);
  }, [filters]); // Only depend on filters, not loadCampaigns to avoid infinite loop

  /**
   * Subscribe to real-time updates when campaigns change
   */
  useEffect(() => {
    subscribeToUpdates();
    
    // Cleanup function
    return () => {
      subscriptionsRef.current.forEach(cleanup => cleanup());
    };
  }, [campaigns.length]); // Only re-subscribe when number of campaigns changes

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Clean up all subscriptions
      subscriptionsRef.current.forEach(cleanup => cleanup());
    };
  }, []);

  /**
   * Auto-refresh campaigns every 30 seconds for active campaigns
   */
  useEffect(() => {
    const hasActiveCampaigns = campaigns.some(
      c => c.status === "active" || c.status === "ending_soon"
    );

    if (hasActiveCampaigns) {
      const interval = setInterval(() => {
        refreshCampaigns();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [campaigns, refreshCampaigns]);

  return {
    campaigns,
    isLoading,
    error,
    filters,
    setFilters: updateFilters,
    refreshCampaigns,
    loadMoreCampaigns,
    hasMore,
    selectedCampaign,
    selectCampaign,
    getUserStatus,
    searchCampaigns,
  };
}

export default useCampaigns;
