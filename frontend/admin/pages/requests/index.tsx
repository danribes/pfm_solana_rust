// Main Request Management Page
import React, { useState } from 'react';
import { UserRequest } from '../../types/request';
import { RequestDashboard } from '../../components/Requests/RequestDashboard';
import { RequestQueue } from '../../components/Requests/RequestQueue';
import { UserProfile } from '../../components/Requests/UserProfile';
import { ApprovalActions } from '../../components/Requests/ApprovalActions';
import { useRequests } from '../../hooks/useRequests';

type ViewMode = 'dashboard' | 'queue' | 'detail';

const RequestsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedRequest, setSelectedRequest] = useState<UserRequest | null>(null);
  
  const { 
    approveRequest, 
    rejectRequest, 
    assignRequest, 
    addNote,
    refetch 
  } = useRequests();

  const handleRequestSelect = (request: UserRequest) => {
    setSelectedRequest(request);
    setViewMode('detail');
  };

  const handleRequestApprove = async (request: UserRequest) => {
    try {
      await approveRequest(request.id);
      // Show success notification
      console.log('Request approved successfully');
      await refetch(); // Refresh the data
    } catch (error) {
      console.error('Failed to approve request:', error);
      // Show error notification
    }
  };

  const handleRequestReject = async (request: UserRequest) => {
    try {
      // Show success notification
      console.log('Request rejected successfully');
      await refetch(); // Refresh the data
    } catch (error) {
      console.error('Failed to reject request:', error);
      // Show error notification
    }
  };

  const handleApprovalAction = async (
    requestId: string, 
    action: 'approve' | 'reject' | 'assign' | 'note',
    data?: any
  ) => {
    try {
      switch (action) {
        case 'approve':
          await approveRequest(requestId, data?.message);
          break;
        case 'reject':
          await rejectRequest(requestId, data?.reason);
          break;
        case 'assign':
          await assignRequest(requestId, data?.adminId);
          break;
        case 'note':
          await addNote(requestId, data?.note, data?.isPrivate);
          break;
      }
      
      // Refresh data and show success
      await refetch();
      console.log(`Request ${action} successful`);
      
      // If we're viewing the detail, refresh the selected request
      if (selectedRequest?.id === requestId) {
        // In a real app, you'd fetch the updated request details
        setViewMode('queue');
        setSelectedRequest(null);
      }
    } catch (error) {
      console.error(`Failed to ${action} request:`, error);
    }
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'dashboard':
        return <RequestDashboard />;
      
      case 'queue':
        return (
          <RequestQueue
            onRequestSelect={handleRequestSelect}
            onRequestApprove={handleRequestApprove}
            onRequestReject={handleRequestReject}
            showBulkActions={true}
          />
        );
      
      case 'detail':
        return selectedRequest ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setViewMode('queue')}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                ← Back to Queue
              </button>
              
              <div className="text-sm text-gray-500">
                Request ID: {selectedRequest.id}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Request Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Request Information */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {selectedRequest.title}
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                      <p className="text-gray-600">{selectedRequest.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Type:</span>
                        <span className="ml-2 capitalize">
                          {selectedRequest.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Priority:</span>
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                          selectedRequest.priority === 'critical' ? 'bg-red-100 text-red-800' :
                          selectedRequest.priority === 'urgent' ? 'bg-orange-100 text-orange-800' :
                          selectedRequest.priority === 'high' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {selectedRequest.priority}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Submitted:</span>
                        <span className="ml-2">
                          {new Date(selectedRequest.submittedAt).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Status:</span>
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                          selectedRequest.status === 'approved' ? 'bg-green-100 text-green-800' :
                          selectedRequest.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          selectedRequest.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    {/* Request Data */}
                    {selectedRequest.requestData.reason && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Reason</h3>
                        <p className="text-gray-600">{selectedRequest.requestData.reason}</p>
                      </div>
                    )}

                    {/* Additional Info */}
                    {selectedRequest.requestData.additionalInfo && 
                     Object.keys(selectedRequest.requestData.additionalInfo).length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Additional Information</h3>
                        <div className="bg-gray-50 rounded-lg p-3">
                          {Object.entries(selectedRequest.requestData.additionalInfo).map(([key, value]) => (
                            <div key={key} className="flex justify-between py-1 text-sm">
                              <span className="font-medium">{key}:</span>
                              <span>{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* User Profile */}
                <UserProfile 
                  userProfile={selectedRequest.userProfile}
                  showWalletHistory={true}
                  showDetailedInfo={true}
                />

                {/* Admin Notes */}
                {selectedRequest.adminNotes.length > 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Notes</h3>
                    <div className="space-y-3">
                      {selectedRequest.adminNotes.map((note) => (
                        <div key={note.id} className="border-l-4 border-blue-500 pl-4">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {note.adminName}
                            </span>
                            <div className="flex items-center space-x-2">
                              {note.isPrivate && (
                                <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                                  Private
                                </span>
                              )}
                              <span className="text-xs text-gray-500">
                                {new Date(note.createdAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm">{note.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Sidebar */}
              <div className="lg:col-span-1">
                <ApprovalActions
                  request={selectedRequest}
                  onApprove={(id, message) => handleApprovalAction(id, 'approve', { message })}
                  onReject={(id, reason) => handleApprovalAction(id, 'reject', { reason })}
                  onAssign={(id, adminId) => handleApprovalAction(id, 'assign', { adminId })}
                  onAddNote={(id, note, isPrivate) => handleApprovalAction(id, 'note', { note, isPrivate })}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No request selected</p>
          </div>
        );
      
      default:
        return <RequestDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Navigation Tabs */}
        {viewMode !== 'detail' && (
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                  { id: 'queue', label: 'Request Queue', icon: '📋' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setViewMode(tab.id as ViewMode)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      viewMode === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Main Content */}
        {renderContent()}
      </div>
    </div>
  );
};

export default RequestsPage;
