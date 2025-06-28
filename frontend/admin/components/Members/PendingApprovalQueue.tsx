import React, { useState } from 'react';
import { PendingApplication, MemberStatus } from '../../types/member';
import { usePendingApplications } from '../../hooks/useMembers';
import LoadingSpinner from '../UI/LoadingSpinner';
import EmptyState from '../UI/EmptyState';

interface PendingApprovalQueueProps {
  communityId: string;
}

const PendingApprovalQueue: React.FC<PendingApprovalQueueProps> = ({ communityId }) => {
  const {
    applications,
    loading,
    error,
    approveMember,
    rejectMember,
    bulkApprove,
    bulkReject
  } = usePendingApplications(communityId);

  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState<string | null>(null);

  const handleSelectApplication = (applicationId: string) => {
    setSelectedApplications(prev => 
      prev.includes(applicationId)
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  const handleSelectAll = () => {
    setSelectedApplications(
      selectedApplications.length === applications.length 
        ? [] 
        : applications.map(app => app.id)
    );
  };

  const handleApprove = async (applicationId: string, note?: string) => {
    setActionLoading(applicationId);
    try {
      await approveMember(applicationId, note);
    } finally {
      setActionLoading(null);
      setShowApprovalModal(null);
    }
  };

  const handleReject = async (applicationId: string, reason?: string) => {
    setActionLoading(applicationId);
    try {
      await rejectMember(applicationId, reason);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedApplications.length === 0) return;
    
    setActionLoading('bulk-approve');
    try {
      await bulkApprove(selectedApplications);
      setSelectedApplications([]);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkReject = async () => {
    if (selectedApplications.length === 0) return;
    
    setActionLoading('bulk-reject');
    try {
      await bulkReject(selectedApplications, 'Bulk rejection');
      setSelectedApplications([]);
    } finally {
      setActionLoading(null);
    }
  };

  const getRiskLevelColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskLevelIcon = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'low': return '🟢';
      case 'medium': return '🟡';
      case 'high': return '🔴';
      default: return '⚪';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="text-red-400">⚠️</div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <EmptyState
        title="No Pending Applications"
        description="All caught up! There are no pending member applications to review."
        action={{
          label: "Refresh",
          onClick: () => window.location.reload()
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              Pending Approvals ({applications.length})
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Review and approve new member applications
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleBulkApprove}
              disabled={selectedApplications.length === 0 || actionLoading === 'bulk-approve'}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {actionLoading === 'bulk-approve' ? <LoadingSpinner size="sm" /> : '✓'}
              <span className="ml-2">Approve Selected</span>
            </button>
            <button
              onClick={handleBulkReject}
              disabled={selectedApplications.length === 0 || actionLoading === 'bulk-reject'}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {actionLoading === 'bulk-reject' ? <LoadingSpinner size="sm" /> : '✗'}
              <span className="ml-2">Reject Selected</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedApplications.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-700">
              {selectedApplications.length} application(s) selected
            </div>
            <button
              onClick={() => setSelectedApplications([])}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear selection
            </button>
          </div>
        </div>
      )}

      {/* Applications List */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectedApplications.length === applications.length}
              onChange={handleSelectAll}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-3 text-sm font-medium text-gray-700">
              Select All
            </label>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {applications.map((application) => (
            <div key={application.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    checked={selectedApplications.includes(application.id)}
                    onChange={() => handleSelectApplication(application.id)}
                    className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  
                  <div className="ml-4 flex-1">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">👤</div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {application.User?.username || 'Anonymous'}
                        </h3>
                        <p className="text-sm text-gray-500 font-mono">
                          {application.User?.wallet_address?.slice(0, 8)}...{application.User?.wallet_address?.slice(-6)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span>Applied {new Date(application.joined_at).toLocaleDateString()}</span>
                      <span className="mx-2">•</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getRiskLevelColor(application.risk_level)}`}>
                        {getRiskLevelIcon(application.risk_level)} {application.risk_level || 'Unknown'} Risk
                      </span>
                      {application.risk_score && (
                        <>
                          <span className="mx-2">•</span>
                          <span>Score: {application.risk_score}/100</span>
                        </>
                      )}
                    </div>

                    {application.application_note && (
                      <div className="mt-2 text-sm text-gray-700 bg-gray-50 rounded p-2">
                        <strong>Note:</strong> {application.application_note}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => setShowApprovalModal(application.id)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    👁️ Review
                  </button>
                  <button
                    onClick={() => handleApprove(application.id)}
                    disabled={actionLoading === application.id}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {actionLoading === application.id ? <LoadingSpinner size="sm" /> : '✓'}
                  </button>
                  <button
                    onClick={() => handleReject(application.id)}
                    disabled={actionLoading === application.id}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {actionLoading === application.id ? <LoadingSpinner size="sm" /> : '✗'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <ApprovalModal
          application={applications.find(app => app.id === showApprovalModal)!}
          onApprove={(note) => handleApprove(showApprovalModal, note)}
          onReject={(reason) => handleReject(showApprovalModal, reason)}
          onClose={() => setShowApprovalModal(null)}
          loading={actionLoading === showApprovalModal}
        />
      )}
    </div>
  );
};

// Approval Modal Component
interface ApprovalModalProps {
  application: PendingApplication;
  onApprove: (note?: string) => void;
  onReject: (reason?: string) => void;
  onClose: () => void;
  loading: boolean;
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({
  application,
  onApprove,
  onReject,
  onClose,
  loading
}) => {
  const [note, setNote] = useState('');
  const [reason, setReason] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  const handleSubmit = () => {
    if (action === 'approve') {
      onApprove(note || undefined);
    } else if (action === 'reject') {
      onReject(reason || undefined);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Review Application
                </h3>
                
                <div className="mt-4">
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">👤</div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {application.User?.username || 'Anonymous'}
                        </h4>
                        <p className="text-sm text-gray-500 font-mono">
                          {application.User?.wallet_address}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Applied:</span>
                        <br />
                        {new Date(application.joined_at).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Risk Level:</span>
                        <br />
                        <span className={`px-2 py-1 rounded text-xs ${
                          application.risk_level === 'low' ? 'text-green-600 bg-green-100' :
                          application.risk_level === 'medium' ? 'text-yellow-600 bg-yellow-100' :
                          application.risk_level === 'high' ? 'text-red-600 bg-red-100' :
                          'text-gray-600 bg-gray-100'
                        }`}>
                          {application.risk_level || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setAction('approve')}
                      className={`flex-1 px-4 py-2 border rounded-md text-sm font-medium ${
                        action === 'approve'
                          ? 'bg-green-600 text-white border-green-600'
                          : 'bg-white text-green-600 border-green-600 hover:bg-green-50'
                      }`}
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => setAction('reject')}
                      className={`flex-1 px-4 py-2 border rounded-md text-sm font-medium ${
                        action === 'reject'
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-white text-red-600 border-red-600 hover:bg-red-50'
                      }`}
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>

                {action === 'approve' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Approval Note (Optional)
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Add a note about this approval..."
                    />
                  </div>
                )}

                {action === 'reject' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Rejection Reason (Optional)
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Provide a reason for rejection..."
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!action || loading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Confirm'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalQueue; 