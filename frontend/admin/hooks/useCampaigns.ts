// Campaign State Management Hook for Admin Portal
import { useState, useEffect, useCallback } from 'react';
import { Campaign, CampaignFormData, CampaignStatus } from '../types/campaign';

interface UseCampaignsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseCampaignsResult {
  campaigns: Campaign[];
  loading: boolean;
  error: string | null;
  createCampaign: (data: CampaignFormData) => Promise<Campaign>;
  updateCampaign: (id: string, data: Partial<CampaignFormData>) => Promise<Campaign>;
  deleteCampaign: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useCampaigns = (options: UseCampaignsOptions = {}): UseCampaignsResult => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { autoRefresh = false, refreshInterval = 30000 } = options;

  // Fetch campaigns from API
  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/campaigns', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch campaigns: ${response.statusText}`);
      }
      
      const data = await response.json();
      setCampaigns(data.campaigns || []);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch campaigns');
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new campaign
  const createCampaign = useCallback(async (data: CampaignFormData): Promise<Campaign> => {
    try {
      setError(null);
      
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ campaignData: data }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create campaign: ${response.statusText}`);
      }
      
      const result = await response.json();
      const newCampaign = result.campaign;
      
      setCampaigns(prev => [newCampaign, ...prev]);
      return newCampaign;
    } catch (err) {
      console.error('Error creating campaign:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create campaign';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Update existing campaign
  const updateCampaign = useCallback(async (
    id: string, 
    data: Partial<CampaignFormData>
  ): Promise<Campaign> => {
    try {
      setError(null);
      
      const response = await fetch(`/api/campaigns/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates: data }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update campaign: ${response.statusText}`);
      }
      
      const result = await response.json();
      const updatedCampaign = result.campaign;
      
      setCampaigns(prev => 
        prev.map(campaign => 
          campaign.id === id ? updatedCampaign : campaign
        )
      );
      
      return updatedCampaign;
    } catch (err) {
      console.error('Error updating campaign:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update campaign';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Delete campaign
  const deleteCampaign = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      
      const response = await fetch(`/api/campaigns/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete campaign: ${response.statusText}`);
      }
      
      setCampaigns(prev => prev.filter(campaign => campaign.id !== id));
    } catch (err) {
      console.error('Error deleting campaign:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete campaign';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchCampaigns, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchCampaigns]);

  return {
    campaigns,
    loading,
    error,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    refetch: fetchCampaigns,
  };
};
