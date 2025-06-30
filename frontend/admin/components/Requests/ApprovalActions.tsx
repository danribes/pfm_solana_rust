// Approval Actions Component for Request Management
import React, { useState } from 'react';
import { UserRequest, RequestStatus } from '../../types/request';

interface ApprovalActionsProps {
  request: UserRequest;
  onApprove: (requestId: string, message?: string) => Promise<void>;
  onReject: (requestId: string, reason: string) => Promise<void>;
  onAssign: (requestId: string, adminId: string) => Promise<void>;
  onAddNote: (requestId: string, note: string, isPrivate?: boolean) => Promise<void>;
  disabled?: boolean;
}

export const ApprovalActions: React.FC<ApprovalActionsProps> = ({
  request,
  onApprove,
  onReject,
  onAssign,
  onAddNote,
  disabled = false
}) => {
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  
  const [approvalMessage, setApprovalMessage] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [note, setNote] = useState('');
  const [isPrivateNote, setIsPrivateNote] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState('');
  
  const [processing, setProcessing] = useState(false);

  // Mock admin list - in real implementation, this would come from props or API
  const availableAdmins = [
    { id: 'admin1', name: 'John Doe' },
    { id: 'admin2', name: 'Jane Smith' },
    { id: 'admin3', name: 'Bob Johnson' }
  ];

  const predefinedRejectionReasons = [
    'Insufficient wallet history',
    'Low reputation score',
    'Failed verification requirements',
    'Inappropriate content in application',
    'Duplicate application',
    'Community guidelines violation',
    'Other (please specify)'
  ];

  const handleApprove = async () => {
    if (processing) return;
    
    try {
      setProcessing(true);
      await onApprove(request.id, approvalMessage || undefined);
      setShowApprovalDialog(false);
      setApprovalMessage('');
    } catch (error) {
      console.error('Approval failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (processing || !rejectionReason.trim()) return;
    
    try {
      setProcessing(true);
      await onReject(request.id, rejectionReason);
      setShowRejectionDialog(false);
      setRejectionReason('');
    } catch (error) {
      console.error('Rejection failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleAddNote = async () => {
    if (processing || !note.trim()) return;
    
    try {
      setProcessing(true);
      await onAddNote(request.id, note, isPrivateNote);
      setShowNoteDialog(false);
      setNote('');
      setIsPrivateNote(false);
    } catch (error) {
      console.error('Adding note failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleAssign = async () => {
    if (processing || !selectedAdmin) return;
    
    try {
      setProcessing(true);
      await onAssign(request.id, selectedAdmin);
      setShowAssignDialog(false);
      setSelectedAdmin('');
    } catch (error) {
      console.error('Assignment failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  const canApproveOrReject = [RequestStatus.PENDING, RequestStatus.UNDER_REVIEW].includes(request.status);

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {canApproveOrReject && (
          <>
            <button
              onClick={() => setShowApprovalDialog(true)}
              disabled={disabled || processing}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Approve
            </button>
            <button
              onClick={() => setShowRejectionDialog(true)}
              disabled={disabled || processing}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reject
            </button>
          </>
        )}
        
        <button
          onClick={() => setShowAssignDialog(true)}
          disabled={disabled || processing}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Assign
        </button>
        
        <button
          onClick={() => setShowNoteDialog(true)}
          disabled={disabled || processing}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Note
        </button>
      </div>

      {/* Approval Dialog */}
      {showApprovalDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Approve Request</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Approval Message (Optional)
                </label>
                <textarea
                  value={approvalMessage}
                  onChange={(e) => setApprovalMessage(e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Welcome message or additional instructions..."
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowApprovalDialog(false)}
                  disabled={processing}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  disabled={processing}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {processing ? 'Approving...' : 'Approve'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Dialog */}
      {showRejectionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Request</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason *
                </label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 mb-3"
                >
                  <option value="">Select a reason...</option>
                  {predefinedRejectionReasons.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
                
                {rejectionReason === 'Other (please specify)' && (
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="Please provide specific details..."
                  />
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowRejectionDialog(false);
                    setRejectionReason('');
                  }}
                  disabled={processing}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={processing || !rejectionReason.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {processing ? 'Rejecting...' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Note Dialog */}
      {showNoteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Note</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note *
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Add your note here..."
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="privateNote"
                  checked={isPrivateNote}
                  onChange={(e) => setIsPrivateNote(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="privateNote" className="text-sm text-gray-700">
                  Private note (only visible to admins)
                </label>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowNoteDialog(false);
                    setNote('');
                    setIsPrivateNote(false);
                  }}
                  disabled={processing}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNote}
                  disabled={processing || !note.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {processing ? 'Adding...' : 'Add Note'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Dialog */}
      {showAssignDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Request</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign to Admin *
                </label>
                <select
                  value={selectedAdmin}
                  onChange={(e) => setSelectedAdmin(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select an admin...</option>
                  {availableAdmins.map((admin) => (
                    <option key={admin.id} value={admin.id}>
                      {admin.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAssignDialog(false);
                    setSelectedAdmin('');
                  }}
                  disabled={processing}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  disabled={processing || !selectedAdmin}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {processing ? 'Assigning...' : 'Assign'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Status */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Request Status</h4>
        <div className="flex items-center justify-between">
          <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
            request.status === RequestStatus.APPROVED ? 'bg-green-100 text-green-800' :
            request.status === RequestStatus.REJECTED ? 'bg-red-100 text-red-800' :
            request.status === RequestStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {request.status.charAt(0).toUpperCase() + request.status.slice(1).replace('_', ' ')}
          </span>
          
          {request.reviewedBy && (
            <span className="text-sm text-gray-600">
              Assigned to: {request.reviewedBy}
            </span>
          )}
        </div>
        
        {request.processedAt && (
          <div className="mt-2 text-xs text-gray-500">
            Processed: {new Date(request.processedAt).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};
