// Request Queue Component for Admin Portal
import React, { useState, useMemo } from 'react';
import { useRequests } from '../../hooks/useRequests';
import { 
  UserRequest, 
  RequestStatus, 
  RequestPriority, 
  RequestType,
  RequestFilters 
} from '../../types/request';

interface RequestQueueProps {
  initialFilters?: RequestFilters;
  showBulkActions?: boolean;
  onRequestSelect?: (request: UserRequest) => void;
  onRequestApprove?: (request: UserRequest) => void;
  onRequestReject?: (request: UserRequest) => void;
}

export const RequestQueue: React.FC<RequestQueueProps> = ({
  initialFilters = {},
  showBulkActions = true,
  onRequestSelect,
  onRequestApprove,
  onRequestReject
}) => {
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [filters, setFilters] = useState<RequestFilters>(initialFilters);
  const [showFilters, setShowFilters] = useState(false);
  
  const { 
    requests, 
    loading, 
    error, 
    totalCount,
    currentPage,
    hasNextPage,
    hasPreviousPage,
    approveRequest,
    rejectRequest,
    bulkAction
  } = useRequests({ 
    filters, 
    autoRefresh: true,
    limit: 25
  });

  // Filter options
  const statusOptions = Object.values(RequestStatus);
  const typeOptions = Object.values(RequestType);
  const priorityOptions = Object.values(RequestPriority);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRequests(requests.map(r => r.id));
    } else {
      setSelectedRequests([]);
    }
  };

  const handleSelectRequest = (requestId: string, checked: boolean) => {
    if (checked) {
      setSelectedRequests(prev => [...prev, requestId]);
    } else {
      setSelectedRequests(prev => prev.filter(id => id !== requestId));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedRequests.length === 0) return;
    
    try {
      await bulkAction({
        requestIds: selectedRequests,
        action: 'approve' as any,
        reason: 'Bulk approval'
      });
      setSelectedRequests([]);
    } catch (error) {
      console.error('Bulk approve failed:', error);
    }
  };

  const handleBulkReject = async () => {
    if (selectedRequests.length === 0) return;
    
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;
    
    try {
      await bulkAction({
        requestIds: selectedRequests,
        action: 'reject' as any,
        reason
      });
      setSelectedRequests([]);
    } catch (error) {
      console.error('Bulk reject failed:', error);
    }
  };

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case RequestStatus.UNDER_REVIEW:
        return 'bg-blue-100 text-blue-800';
      case RequestStatus.APPROVED:
        return 'bg-green-100 text-green-800';
      case RequestStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case RequestStatus.ESCALATED:
        return 'bg-purple-100 text-purple-800';
      case RequestStatus.ON_HOLD:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: RequestPriority) => {
    switch (priority) {
      case RequestPriority.CRITICAL:
        return 'bg-red-500 text-white';
      case RequestPriority.URGENT:
        return 'bg-orange-500 text-white';
      case RequestPriority.HIGH:
        return 'bg-yellow-500 text-white';
      case RequestPriority.MEDIUM:
        return 'bg-blue-500 text-white';
      case RequestPriority.LOW:
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading requests: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Filters */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Request Queue ({totalCount})
          </h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Filters {showFilters ? '▼' : '▶'}
          </button>
        </div>
        
        {showBulkActions && selectedRequests.length > 0 && (
          <div className="flex space-x-2">
            <button
              onClick={handleBulkApprove}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Approve ({selectedRequests.length})
            </button>
            <button
              onClick={handleBulkReject}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Reject ({selectedRequests.length})
            </button>
          </div>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status?.[0] || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  status: e.target.value ? [e.target.value as RequestStatus] : undefined
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Statuses</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.type?.[0] || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  type: e.target.value ? [e.target.value as RequestType] : undefined
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Types</option>
                {typeOptions.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={filters.priority?.[0] || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  priority: e.target.value ? [e.target.value as RequestPriority] : undefined
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Priorities</option>
                {priorityOptions.map(priority => (
                  <option key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search requests..."
                value={filters.searchTerm || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  searchTerm: e.target.value || undefined
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Request List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {showBulkActions && (
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedRequests.length === requests.length && requests.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded"
                    />
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  {showBulkActions && (
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedRequests.includes(request.id)}
                        onChange={(e) => handleSelectRequest(request.id, e.target.checked)}
                        className="rounded"
                      />
                    </td>
                  )}
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <button
                        onClick={() => onRequestSelect?.(request)}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600 text-left"
                      >
                        {request.title}
                      </button>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {request.description}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            {(request.userProfile.username || request.userProfile.walletAddress).charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {request.userProfile.username || 'Anonymous'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {request.userProfile.walletAddress.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-900 capitalize">
                      {request.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1).replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {formatTimeAgo(request.submittedAt)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex space-x-2">
                      {request.status === RequestStatus.PENDING && (
                        <>
                          <button
                            onClick={() => {
                              approveRequest(request.id);
                              onRequestApprove?.(request);
                            }}
                            className="text-green-600 hover:text-green-800 text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Rejection reason:');
                              if (reason) {
                                rejectRequest(request.id, reason);
                                onRequestReject?.(request);
                              }
                            }}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => onRequestSelect?.(request)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {requests.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No requests found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalCount > 25 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-700">
            Showing page {currentPage} of {Math.ceil(totalCount / 25)}
          </p>
          <div className="flex space-x-2">
            <button
              disabled={!hasPreviousPage}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              disabled={!hasNextPage}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
