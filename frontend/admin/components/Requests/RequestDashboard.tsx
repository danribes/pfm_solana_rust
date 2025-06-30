// Request Management Dashboard Component
import React, { useState, useMemo } from 'react';
import { useRequests } from '../../hooks/useRequests';
import { RequestStatus, RequestType, RequestPriority } from '../../types/request';

export const RequestDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'pending' | 'recent'>('overview');
  const { requests, loading, error } = useRequests({ autoRefresh: true });

  // Calculate dashboard metrics
  const metrics = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter(r => r.status === RequestStatus.PENDING).length;
    const underReview = requests.filter(r => r.status === RequestStatus.UNDER_REVIEW).length;
    const approved = requests.filter(r => r.status === RequestStatus.APPROVED).length;
    const rejected = requests.filter(r => r.status === RequestStatus.REJECTED).length;
    const urgent = requests.filter(r => r.priority === RequestPriority.URGENT || r.priority === RequestPriority.CRITICAL).length;

    const approvalRate = total > 0 ? ((approved / (approved + rejected)) * 100) : 0;

    return {
      total,
      pending,
      underReview,
      approved,
      rejected,
      urgent,
      approvalRate
    };
  }, [requests]);

  // Group requests by type for overview
  const requestsByType = useMemo(() => {
    const typeGroups = requests.reduce((acc, request) => {
      acc[request.type] = (acc[request.type] || 0) + 1;
      return acc;
    }, {} as Record<RequestType, number>);

    return Object.entries(typeGroups).map(([type, count]) => ({
      type: type as RequestType,
      count,
      percentage: metrics.total > 0 ? (count / metrics.total) * 100 : 0
    }));
  }, [requests, metrics.total]);

  // Recent urgent requests
  const urgentRequests = useMemo(() => {
    return requests
      .filter(r => r.priority === RequestPriority.URGENT || r.priority === RequestPriority.CRITICAL)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .slice(0, 5);
  }, [requests]);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Request Management</h1>
          <p className="text-gray-600">Review and process user requests</p>
        </div>
        
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Export Reports
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Bulk Actions
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-blue-600 text-xl">📋</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{metrics.total}</h3>
              <p className="text-sm text-gray-500">Total Requests</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-yellow-600 text-xl">⏳</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{metrics.pending}</h3>
              <p className="text-sm text-gray-500">Pending Review</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-red-600 text-xl">🚨</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{metrics.urgent}</h3>
              <p className="text-sm text-gray-500">Urgent Requests</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 text-xl">✅</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{metrics.approvalRate.toFixed(1)}%</h3>
              <p className="text-sm text-gray-500">Approval Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'pending', label: `Pending (${metrics.pending})` },
            { id: 'recent', label: 'Recent Activity' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {selectedTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Request Types Distribution */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Requests by Type</h3>
              <div className="space-y-3">
                {requestsByType.map((item) => (
                  <div key={item.type} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 capitalize">
                      {item.type.replace('_', ' ')}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500 w-8 text-right">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Urgent Requests */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Urgent Requests</h3>
              <div className="space-y-3">
                {urgentRequests.length === 0 ? (
                  <p className="text-gray-500 text-sm">No urgent requests</p>
                ) : (
                  urgentRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{request.title}</h4>
                        <p className="text-xs text-gray-500">
                          {request.userProfile.username || request.userProfile.walletAddress.slice(0, 8)}...
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          request.priority === RequestPriority.CRITICAL 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {request.priority}
                        </span>
                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                          Review
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'pending' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Requests</h3>
            <p className="text-gray-600">
              {metrics.pending} requests require your attention
            </p>
            <div className="mt-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                View All Pending
              </button>
            </div>
          </div>
        )}

        {selectedTab === 'recent' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {requests.slice(0, 10).map((request) => (
                <div key={request.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      request.status === RequestStatus.APPROVED ? 'bg-green-500' :
                      request.status === RequestStatus.REJECTED ? 'bg-red-500' :
                      request.status === RequestStatus.PENDING ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}></div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{request.title}</h4>
                      <p className="text-xs text-gray-500">
                        {new Date(request.submittedAt).toLocaleDateString()} • 
                        {request.userProfile.username || request.userProfile.walletAddress.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    request.status === RequestStatus.APPROVED ? 'bg-green-100 text-green-800' :
                    request.status === RequestStatus.REJECTED ? 'bg-red-100 text-red-800' :
                    request.status === RequestStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
