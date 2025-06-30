// Request Management Hook for Admin Portal
import { useState, useEffect, useCallback } from 'react';
import { 
  UserRequest, 
  RequestFilters, 
  RequestStatus, 
  BulkActionRequest, 
  BulkActionResult,
  UseRequestsOptions,
  UseRequestsResult 
} from '../types/request';

export const useRequests = (options: UseRequestsOptions = {}): UseRequestsResult => {
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  
  const { 
    filters = {},
    page = 1,
    limit = 20,
    sortBy = 'submittedAt',
    sortOrder = 'desc',
    autoRefresh = false,
    refreshInterval = 30000 
  } = options;

  // Fetch requests from API
  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
        ...Object.entries(filters).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              acc[key] = value.join(',');
            } else if (typeof value === 'object') {
              acc[key] = JSON.stringify(value);
            } else {
              acc[key] = value.toString();
            }
          }
          return acc;
        }, {} as Record<string, string>)
      });

      const response = await fetch(`/api/requests?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch requests: ${response.statusText}`);
      }
      
      const data = await response.json();
      setRequests(data.requests || []);
      setTotalCount(data.totalCount || 0);
      setCurrentPage(data.currentPage || 1);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [filters, page, limit, sortBy, sortOrder]);

  // Approve request
  const approveRequest = useCallback(async (id: string, message?: string): Promise<void> => {
    try {
      setError(null);
      
      const response = await fetch(`/api/requests/${id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to approve request: ${response.statusText}`);
      }
      
      // Update local state
      setRequests(prev => 
        prev.map(request => 
          request.id === id 
            ? { ...request, status: RequestStatus.APPROVED, processedAt: new Date().toISOString() }
            : request
        )
      );
    } catch (err) {
      console.error('Error approving request:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve request';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Reject request
  const rejectRequest = useCallback(async (id: string, reason: string): Promise<void> => {
    try {
      setError(null);
      
      const response = await fetch(`/api/requests/${id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to reject request: ${response.statusText}`);
      }
      
      // Update local state
      setRequests(prev => 
        prev.map(request => 
          request.id === id 
            ? { ...request, status: RequestStatus.REJECTED, processedAt: new Date().toISOString() }
            : request
        )
      );
    } catch (err) {
      console.error('Error rejecting request:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject request';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Assign request
  const assignRequest = useCallback(async (id: string, adminId: string): Promise<void> => {
    try {
      setError(null);
      
      const response = await fetch(`/api/requests/${id}/assign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminId }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to assign request: ${response.statusText}`);
      }
      
      // Update local state
      setRequests(prev => 
        prev.map(request => 
          request.id === id 
            ? { ...request, reviewedBy: adminId }
            : request
        )
      );
    } catch (err) {
      console.error('Error assigning request:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign request';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Add note to request
  const addNote = useCallback(async (id: string, note: string, isPrivate: boolean = false): Promise<void> => {
    try {
      setError(null);
      
      const response = await fetch(`/api/requests/${id}/notes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note, isPrivate }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to add note: ${response.statusText}`);
      }
      
      const newNote = await response.json();
      
      // Update local state
      setRequests(prev => 
        prev.map(request => 
          request.id === id 
            ? { ...request, adminNotes: [...request.adminNotes, newNote] }
            : request
        )
      );
    } catch (err) {
      console.error('Error adding note:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add note';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Bulk actions
  const bulkAction = useCallback(async (action: BulkActionRequest): Promise<BulkActionResult> => {
    try {
      setError(null);
      
      const response = await fetch('/api/requests/bulk', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(action),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to perform bulk action: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Refresh requests after bulk action
      await fetchRequests();
      
      return result;
    } catch (err) {
      console.error('Error performing bulk action:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to perform bulk action';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchRequests]);

  // Initial fetch
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchRequests, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchRequests]);

  return {
    requests,
    loading,
    error,
    totalCount,
    currentPage,
    hasNextPage: currentPage * limit < totalCount,
    hasPreviousPage: currentPage > 1,
    refetch: fetchRequests,
    approveRequest,
    rejectRequest,
    assignRequest,
    addNote,
    bulkAction,
  };
};
